import { validateLegalNotificationAuthenticity } from "../../src/logic/it-1-br-1779263788059-2-2-1";

const fetchMock = require("jest-fetch-mock");
fetchMock.enableMocks();

describe("処理ルート変更時に関係者へ自動通知し承認フローを動的に調整する機能", () => {
  test("法令改正通知認証 - デジタル署名の検証が正常に実行される", () => {
    // SCEN-496
    fetchMock.resetMocks();

    // 正常なデジタル署名を持つ通知内容
    const notificationContent = "文部科学省による補助金要件変更について：令和6年度より申請書類の電子化保存要件が変更されます。";
    const senderInfo = {
      organizationId: "mext.go.jp",
      certificate: "valid_mext_certificate",
      authority: "ministry_of_education_culture_sports_science_technology"
    };
    const digitalSignature = "SHA256:AbCd1234567890EfGhIjKlMnOpQrStUvWxYz";
    const receivedTimestamp = "2024-01-15T14:30:00Z";

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

    // デジタル署名が存在しない場合
    expect(() => {
      validateLegalNotificationAuthenticity(
        notificationContent,
        senderInfo,
        "",
        receivedTimestamp
      );
    }).toThrow("デジタル署名が見つかりません。文部科学省からの正式な通知であることを確認してください。");

    // 送信者情報が不正な場合
    const invalidSenderInfo = {
      organizationId: "",
      certificate: "",
      authority: ""
    };
    
    expect(() => {
      validateLegalNotificationAuthenticity(
        notificationContent,
        invalidSenderInfo,
        digitalSignature,
        receivedTimestamp
      );
    }).toThrow("送信者の認証情報が不正です。文部科学省からの公式通知であることを確認してください。");

    // 通知内容が不正な場合
    expect(() => {
      validateLegalNotificationAuthenticity(
        "短い",
        senderInfo,
        digitalSignature,
        receivedTimestamp
      );
    }).toThrow("法令改正通知の内容が不正です。正しい通知内容を確認してください。");
  });
});