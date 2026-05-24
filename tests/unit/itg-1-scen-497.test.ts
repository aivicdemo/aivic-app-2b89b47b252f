import {
  validateLegalNotificationAuthenticity
} from '../../src/logic/it-1-br-1779263788059-2-2-1';

describe("処理ルート変更時に関係者へ自動通知し承認フローを動的に調整する機能", () => {
  test("法令改正通知認証 - 不正な通知や改ざんされた通知が拒否される", () => {
    // SCEN-497

    // 不正な送信者情報の場合
    const invalidSenderInfo = {
      organization: "不正組織",
      department: "偽装部署",
      certificateId: "invalid_cert_123"
    };
    
    const validNotificationContent = "文部科学省からの正式な法令改正通知です。補助金関連の保管要件が変更されました。";
    const validDigitalSignature = "valid_signature_12345";
    const validTimestamp = "2024-01-15T10:00:00Z";

    expect(() => {
      validateLegalNotificationAuthenticity(
        validNotificationContent,
        invalidSenderInfo,
        validDigitalSignature,
        validTimestamp
      );
    }).toThrow("送信者の認証情報が不正です。文部科学省からの公式通知であることを確認してください。");

    // デジタル署名が存在しない場合
    const validSenderInfo = {
      organization: "文部科学省",
      department: "高等教育局",
      certificateId: "mext_cert_2024"
    };

    expect(() => {
      validateLegalNotificationAuthenticity(
        validNotificationContent,
        validSenderInfo,
        "",
        validTimestamp
      );
    }).toThrow("デジタル署名が見つかりません。文部科学省からの正式な通知であることを確認してください。");

    // 通知内容が不正な場合
    expect(() => {
      validateLegalNotificationAuthenticity(
        "",
        validSenderInfo,
        validDigitalSignature,
        validTimestamp
      );
    }).toThrow("法令改正通知の内容が不正です。正しい通知内容を確認してください。");

    // 通知内容が10文字未満の場合
    expect(() => {
      validateLegalNotificationAuthenticity(
        "短文",
        validSenderInfo,
        validDigitalSignature,
        validTimestamp
      );
    }).toThrow("法令改正通知の内容が不正です。正しい通知内容を確認してください。");

    // 送信者情報が不完全な場合
    const incompleteSenderInfo = {
      organization: "",
      department: "高等教育局",
      certificateId: "mext_cert_2024"
    };

    expect(() => {
      validateLegalNotificationAuthenticity(
        validNotificationContent,
        incompleteSenderInfo,
        validDigitalSignature,
        validTimestamp
      );
    }).toThrow("送信者の認証情報が不正です。文部科学省からの公式通知であることを確認してください。");

    // 正常なケース - 真正性検証に成功
    const result = validateLegalNotificationAuthenticity(
      validNotificationContent,
      validSenderInfo,
      validDigitalSignature,
      validTimestamp
    );

    expect(result.isAuthentic).toBe(true);
    expect(result.isValid).toBe(true);
    expect(result.canProceed).toBe(true);
    expect(result.verificationDetails.senderValid).toBe(true);
    expect(result.verificationDetails.signatureValid).toBe(true);
    expect(result.verificationDetails.contentIntact).toBe(true);
    expect(result.verificationDetails.withinValidPeriod).toBe(true);
  });
});