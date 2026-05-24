import { validateLegalNotificationAuthenticity } from "../../src/logic/it-1-br-1779263788059-2-2-1";

describe("処理ルート変更時に関係者へ自動通知し承認フローを動的に調整する機能", () => {
  test("法令改正通知のデジタル署名検証が正常に実行される", () => {
    // SCEN-496: [normal] 法令改正通知認証 - デジタル署名の検証が正常に実行される

    // 正常なデジタル署名検証
    const notificationContent = "文部科学省令第15号による申請書類の保管要件変更について。補助金関連書類の電子保管に関する新規則を定める。";
    const senderInfo = { senderId: "mext-official", authDomain: "mext.go.jp", certificateValid: true };
    const digitalSignature = "valid-mext-signature-12345";
    const receivedTimestamp = "2024-01-15T09:00:00Z";

    const result = validateLegalNotificationAuthenticity(
      notificationContent,
      senderInfo,
      digitalSignature,
      receivedTimestamp
    );

    expect(result.isAuthentic).toBe(true);
    expect(result.isValid).toBe(true);
    expect(result.verificationDetails.senderValid).toBe(true);
    expect(result.verificationDetails.signatureValid).toBe(true);
    expect(result.verificationDetails.contentIntact).toBe(true);
    expect(result.verificationDetails.withinValidPeriod).toBe(true);
    expect(result.canProceed).toBe(true);

    // 通知内容が空の場合
    expect(() => {
      validateLegalNotificationAuthenticity("", senderInfo, digitalSignature, receivedTimestamp);
    }).toThrow("法令改正通知の内容が不正です。正しい通知内容を確認してください。");

    // デジタル署名が存在しない場合
    expect(() => {
      validateLegalNotificationAuthenticity(notificationContent, senderInfo, "", receivedTimestamp);
    }).toThrow("デジタル署名が見つかりません。文部科学省からの正式な通知であることを確認してください。");

    // 送信者情報が不正な場合
    const invalidSenderInfo = { senderId: "", authDomain: "", certificateValid: false };
    expect(() => {
      validateLegalNotificationAuthenticity(notificationContent, invalidSenderInfo, digitalSignature, receivedTimestamp);
    }).toThrow("送信者の認証情報が不正です。文部科学省からの公式通知であることを確認してください。");

    // デジタル署名が無効な場合
    const invalidSignatureResult = validateLegalNotificationAuthenticity(
      notificationContent,
      senderInfo,
      "invalid-signature",
      receivedTimestamp
    );

    expect(invalidSignatureResult.isAuthentic).toBe(false);
    expect(invalidSignatureResult.isValid).toBe(false);
    expect(invalidSignatureResult.canProceed).toBe(false);
  });
});