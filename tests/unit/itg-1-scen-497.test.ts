import { validateLegalNotificationAuthenticity } from '../../src/logic/it-1-br-1779263788059-2-2-1';

describe("処理ルート変更時に関係者へ自動通知し承認フローを動的に調整する機能", () => {
  test("法令改正通知認証 - 不正な通知や改ざんされた通知が拒否される", () => {
    // SCEN-497

    // 正常な通知の検証
    const validNotificationContent = "文部科学省からの公式な法令改正通知です。補助金申請要件の変更についてお知らせいたします。";
    const validSenderInfo = {
      organizationId: "MEXT_OFFICIAL",
      certificateId: "CERT_2024_001",
      authenticationCode: "AUTH_VALID_123"
    };
    const validDigitalSignature = "VALID_SIGNATURE_HASH_ABC123";
    const validTimestamp = "2024-01-15T10:00:00Z";

    const validResult = validateLegalNotificationAuthenticity(
      validNotificationContent,
      validSenderInfo,
      validDigitalSignature,
      validTimestamp
    );

    expect(validResult.isAuthentic).toBe(true);
    expect(validResult.isValid).toBe(true);
    expect(validResult.verificationDetails.senderValid).toBe(true);
    expect(validResult.verificationDetails.signatureValid).toBe(true);
    expect(validResult.verificationDetails.contentIntact).toBe(true);
    expect(validResult.verificationDetails.withinValidPeriod).toBe(true);
    expect(validResult.canProceed).toBe(true);

    // 不正な送信者情報による拒否
    const invalidSenderInfo = {
      organizationId: "FAKE_SENDER",
      certificateId: "INVALID_CERT",
      authenticationCode: "FAKE_AUTH"
    };

    const invalidSenderResult = validateLegalNotificationAuthenticity(
      validNotificationContent,
      invalidSenderInfo,
      validDigitalSignature,
      validTimestamp
    );

    expect(invalidSenderResult.isAuthentic).toBe(false);
    expect(invalidSenderResult.isValid).toBe(false);
    expect(invalidSenderResult.verificationDetails.senderValid).toBe(false);
    expect(invalidSenderResult.canProceed).toBe(false);

    // 改ざんされたデジタル署名による拒否
    const tamperedSignature = "TAMPERED_SIGNATURE_XYZ999";

    const tamperedSignatureResult = validateLegalNotificationAuthenticity(
      validNotificationContent,
      validSenderInfo,
      tamperedSignature,
      validTimestamp
    );

    expect(tamperedSignatureResult.isAuthentic).toBe(false);
    expect(tamperedSignatureResult.isValid).toBe(false);
    expect(tamperedSignatureResult.verificationDetails.signatureValid).toBe(false);
    expect(tamperedSignatureResult.canProceed).toBe(false);

    // 通知内容が空の場合のエラー
    expect(() => {
      validateLegalNotificationAuthenticity(
        "",
        validSenderInfo,
        validDigitalSignature,
        validTimestamp
      );
    }).toThrow("法令改正通知の内容が不正です。正しい通知内容を確認してください。");

    // 通知内容が10文字未満の場合のエラー
    expect(() => {
      validateLegalNotificationAuthenticity(
        "短い",
        validSenderInfo,
        validDigitalSignature,
        validTimestamp
      );
    }).toThrow("法令改正通知の内容が不正です。正しい通知内容を確認してください。");

    // デジタル署名が存在しない場合のエラー
    expect(() => {
      validateLegalNotificationAuthenticity(
        validNotificationContent,
        validSenderInfo,
        "",
        validTimestamp
      );
    }).toThrow("デジタル署名が見つかりません。文部科学省からの正式な通知であることを確認してください。");

    // 送信者情報が不正な場合のエラー
    expect(() => {
      validateLegalNotificationAuthenticity(
        validNotificationContent,
        null,
        validDigitalSignature,
        validTimestamp
      );
    }).toThrow("送信者の認証情報が不正です。文部科学省からの公式通知であることを確認してください。");
  });
});