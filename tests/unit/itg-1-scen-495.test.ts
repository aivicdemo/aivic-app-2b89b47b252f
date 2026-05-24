import { validateLegalNotificationAuthenticity } from "../../src/logic/it-1-br-1779263788059-2-2-1";

describe("処理ルート変更時に関係者へ自動通知し承認フローを動的に調整する機能", () => {
  test("法令改正通知認証 - 正当な送信者からの通知が認証される", () => {
    // SCEN-495
    const notificationContent = "令和6年度補助金交付要綱改正について、申請書類の電子化要件が変更されましたので、貴学におかれましては下記事項について対応をお願いいたします。1.電子申請システムの対象文書種別を拡充すること 2.紙媒体での保管が必要な文書の明確化を図ること";
    const senderInfo = {
      organizationId: "mext-official-001",
      certificateId: "cert-mext-2024-001",
      issuedBy: "文部科学省公式認証局",
      validUntil: "2025-12-31T23:59:59.000Z"
    };
    const digitalSignature = "SHA256:a1b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef123456";
    const receivedTimestamp = "2024-01-15T10:30:00.000Z";

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
  });
});