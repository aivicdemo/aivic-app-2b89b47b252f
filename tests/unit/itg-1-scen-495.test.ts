import { validateLegalNotificationAuthenticity } from "../../src/logic/it-1-br-1779263788059-2-2-1";

describe("処理ルート変更時に関係者へ自動通知し承認フローを動的に調整する機能", () => {
  test("法令改正通知の真正性検証で正当な送信者からの通知が認証される", () => {
    // SCEN-495
    
    // 正当な文部科学省からの法令改正通知
    const validNotification = {
      notificationContent: "文部科学省からの法令改正通知：補助金申請書類の電子化要件を改正し、令和6年4月1日より施行いたします。詳細は別紙をご確認ください。",
      senderInfo: {
        organizationId: "mext.go.jp",
        senderId: "mext-notification-system",
        certificateId: "MEXT-CERT-2024-001"
      },
      digitalSignature: "MEXT-SIG-ABC123456789DEF",
      receivedTimestamp: "2024-01-15T10:30:00Z"
    };

    const result = validateLegalNotificationAuthenticity(
      validNotification.notificationContent,
      validNotification.senderInfo,
      validNotification.digitalSignature,
      validNotification.receivedTimestamp
    );

    expect(result.isAuthentic).toBe(true);
    expect(result.isValid).toBe(true);
    expect(result.canProceed).toBe(true);
    expect(result.verificationDetails.senderValid).toBe(true);
    expect(result.verificationDetails.signatureValid).toBe(true);
    expect(result.verificationDetails.contentIntact).toBe(true);
    expect(result.verificationDetails.withinValidPeriod).toBe(true);

    // エラーケース：通知内容が不正
    expect(() => {
      validateLegalNotificationAuthenticity(
        "短い",
        validNotification.senderInfo,
        validNotification.digitalSignature,
        validNotification.receivedTimestamp
      );
    }).toThrow("法令改正通知の内容が不正です。正しい通知内容を確認してください。");

    // エラーケース：デジタル署名が不存在
    expect(() => {
      validateLegalNotificationAuthenticity(
        validNotification.notificationContent,
        validNotification.senderInfo,
        "",
        validNotification.receivedTimestamp
      );
    }).toThrow("デジタル署名が見つかりません。文部科学省からの正式な通知であることを確認してください。");

    // エラーケース：送信者情報が不正
    expect(() => {
      validateLegalNotificationAuthenticity(
        validNotification.notificationContent,
        { organizationId: "", senderId: "", certificateId: "" },
        validNotification.digitalSignature,
        validNotification.receivedTimestamp
      );
    }).toThrow("送信者の認証情報が不正です。文部科学省からの公式通知であることを確認してください。");
  });
});