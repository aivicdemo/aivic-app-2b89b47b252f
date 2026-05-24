import { validateLegalNotificationAuthenticity } from "../../src/logic/it-1-br-1779263788059-2-2-1";

describe("処理ルート変更時に関係者へ自動通知し承認フローを動的に調整する機能", () => {
  test("法令改正通知認証 - 不正な通知や改ざんされた通知が拒否される", () => {
    // SCEN-497

    // 正常な通知の場合
    const validNotificationContent = "文部科学省補助金要件の変更について。本通知により申請書類の保管要件が変更されます。";
    const validSenderInfo = { authority: "文部科学省", certificate: "valid_cert_123", timestamp: "2024-01-15T10:00:00Z" };
    const validDigitalSignature = "valid_signature_hash_abc123";
    const validReceivedTimestamp = "2024-01-15T10:05:00Z";

    const validResult = validateLegalNotificationAuthenticity(
      validNotificationContent,
      validSenderInfo,
      validDigitalSignature,
      validReceivedTimestamp
    );

    expect(validResult).toEqual({
      isAuthentic: true,
      isValid: true,
      verificationDetails: {
        senderValid: true,
        signatureValid: true,
        contentIntact: true,
        withinValidPeriod: true
      },
      canProceed: true
    });

    // 通知内容が空の場合
    expect(() => validateLegalNotificationAuthenticity("", validSenderInfo, validDigitalSignature, validReceivedTimestamp))
      .toThrow("法令改正通知の内容が不正です。正しい通知内容を確認してください。");

    // 通知内容が10文字未満の場合
    expect(() => validateLegalNotificationAuthenticity("短すぎ", validSenderInfo, validDigitalSignature, validReceivedTimestamp))
      .toThrow("法令改正通知の内容が不正です。正しい通知内容を確認してください。");

    // デジタル署名が存在しない場合
    expect(() => validateLegalNotificationAuthenticity(validNotificationContent, validSenderInfo, "", validReceivedTimestamp))
      .toThrow("デジタル署名が見つかりません。文部科学省からの正式な通知であることを確認してください。");

    // 送信者情報が不正な場合
    const invalidSenderInfo = { authority: "", certificate: "", timestamp: "" };
    expect(() => validateLegalNotificationAuthenticity(validNotificationContent, invalidSenderInfo, validDigitalSignature, validReceivedTimestamp))
      .toThrow("送信者の認証情報が不正です。文部科学省からの公式通知であることを確認してください。");

    // 改ざんされた通知の場合（署名無効）
    const tamperedSignature = "invalid_signature_hash";
    const tamperedResult = validateLegalNotificationAuthenticity(
      validNotificationContent,
      validSenderInfo,
      tamperedSignature,
      validReceivedTimestamp
    );

    expect(tamperedResult).toEqual({
      isAuthentic: false,
      isValid: false,
      verificationDetails: {
        senderValid: true,
        signatureValid: false,
        contentIntact: false,
        withinValidPeriod: true
      },
      canProceed: false
    });

    // 送信者が不正な場合
    const invalidSender = { authority: "偽装機関", certificate: "fake_cert", timestamp: "2024-01-15T10:00:00Z" };
    const invalidSenderResult = validateLegalNotificationAuthenticity(
      validNotificationContent,
      invalidSender,
      validDigitalSignature,
      validReceivedTimestamp
    );

    expect(invalidSenderResult).toEqual({
      isAuthentic: false,
      isValid: false,
      verificationDetails: {
        senderValid: false,
        signatureValid: true,
        contentIntact: true,
        withinValidPeriod: true
      },
      canProceed: false
    });
  });
});