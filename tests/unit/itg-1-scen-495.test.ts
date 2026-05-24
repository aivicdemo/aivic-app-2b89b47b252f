import { validateLegalNotificationAuthenticity } from "../../src/logic/it-1-br-1779263788059-2-2-1";

describe("処理ルート変更時に関係者へ自動通知し承認フローを動的に調整する機能", () => {
  test("正当な文部科学省からの法令改正通知が認証される", () => {
    // SCEN-495
    const notificationContent = "令和5年度補助金要件の一部改正について。申請書類の保管期間を7年から10年に延長する。デジタル署名による証明を含む。";
    const senderInfo = {
      organization: "文部科学省",
      department: "研究振興局",
      certificateId: "MEXT-AUTH-2024-001",
      authenticationLevel: "official"
    };
    const digitalSignature = "SHA256:a1b2c3d4e5f6789012345abcdef67890";
    const receivedTimestamp = "2024-01-15T10:30:00Z";

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