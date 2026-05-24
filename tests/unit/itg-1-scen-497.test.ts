import { validateLegalNotificationAuthenticity } from "../../src/logic/it-1-br-1779263788059-2-2-1";

describe("処理ルート変更時に関係者へ自動通知し承認フローを動的に調整する機能", () => {
  test("法令改正通知認証 - 不正な通知や改ざんされた通知が拒否される", () => {
    // SCEN-497

    // 1. 通知内容が空のケース
    expect(() => validateLegalNotificationAuthenticity(
      "",
      { senderId: "mext", certificateId: "valid-cert" },
      "valid-signature",
      "2024-01-15T10:00:00Z"
    )).toThrow("法令改正通知の内容が不正です。正しい通知内容を確認してください。");

    // 2. 通知内容が10文字未満のケース
    expect(() => validateLegalNotificationAuthenticity(
      "短い",
      { senderId: "mext", certificateId: "valid-cert" },
      "valid-signature",
      "2024-01-15T10:00:00Z"
    )).toThrow("法令改正通知の内容が不正です。正しい通知内容を確認してください。");

    // 3. デジタル署名が存在しないケース
    expect(() => validateLegalNotificationAuthenticity(
      "文部科学省からの法令改正通知です。補助金関連の文書管理要件が変更されました。",
      { senderId: "mext", certificateId: "valid-cert" },
      "",
      "2024-01-15T10:00:00Z"
    )).toThrow("デジタル署名が見つかりません。文部科学省からの正式な通知であることを確認してください。");

    // 4. 送信者情報が不完全なケース
    expect(() => validateLegalNotificationAuthenticity(
      "文部科学省からの法令改正通知です。補助金関連の文書管理要件が変更されました。",
      { senderId: "", certificateId: "" },
      "valid-signature",
      "2024-01-15T10:00:00Z"
    )).toThrow("送信者の認証情報が不正です。文部科学省からの公式通知であることを確認してください。");

    // 5. 正常なケース - 有効な通知
    const validNotificationContent = "文部科学省からの法令改正通知です。補助金関連の文書管理要件が変更されました。";
    const validSenderInfo = { senderId: "mext", certificateId: "valid-cert-123" };
    const validSignature = "valid-digital-signature-xyz";
    const validTimestamp = "2024-01-15T10:00:00Z";

    const result = validateLegalNotificationAuthenticity(
      validNotificationContent,
      validSenderInfo,
      validSignature,
      validTimestamp
    );

    expect(result.isAuthentic).toBe(true);
    expect(result.isValid).toBe(true);
    expect(result.verificationDetails.senderValid).toBe(true);
    expect(result.verificationDetails.signatureValid).toBe(true);
    expect(result.verificationDetails.contentIntact).toBe(true);
    expect(result.verificationDetails.withinValidPeriod).toBe(true);
    expect(result.canProceed).toBe(true);

    // 6. 偽造された署名のケース
    const resultWithInvalidSignature = validateLegalNotificationAuthenticity(
      validNotificationContent,
      validSenderInfo,
      "forged-signature",
      validTimestamp
    );

    expect(resultWithInvalidSignature.isAuthentic).toBe(false);
    expect(resultWithInvalidSignature.isValid).toBe(false);
    expect(resultWithInvalidSignature.verificationDetails.signatureValid).toBe(false);
    expect(resultWithInvalidSignature.canProceed).toBe(false);

    // 7. 改ざんされた内容のケース
    const resultWithTamperedContent = validateLegalNotificationAuthenticity(
      "改ざんされた通知内容です。",
      validSenderInfo,
      validSignature,
      validTimestamp
    );

    expect(resultWithTamperedContent.isAuthentic).toBe(false);
    expect(resultWithTamperedContent.isValid).toBe(false);
    expect(resultWithTamperedContent.verificationDetails.contentIntact).toBe(false);
    expect(resultWithTamperedContent.canProceed).toBe(false);

    // 8. 不正な送信者のケース
    const invalidSenderInfo = { senderId: "fake-org", certificateId: "invalid-cert" };
    const resultWithInvalidSender = validateLegalNotificationAuthenticity(
      validNotificationContent,
      invalidSenderInfo,
      validSignature,
      validTimestamp
    );

    expect(resultWithInvalidSender.isAuthentic).toBe(false);
    expect(resultWithInvalidSender.isValid).toBe(false);
    expect(resultWithInvalidSender.verificationDetails.senderValid).toBe(false);
    expect(resultWithInvalidSender.canProceed).toBe(false);
  });
});