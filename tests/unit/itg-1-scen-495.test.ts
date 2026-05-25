import { validateLegalNotificationAuthenticity } from '../../src/logic/it-1-br-1779263788059-2-2-1';

describe("処理ルート変更時に関係者へ自動通知し承認フローを動的に調整する機能", () => {
  test("法令改正通知認証 - 正当な送信者からの通知が認証される", () => {
    // SCEN-495
    const notificationContent = "文部科学省から補助金申請書類の保管要件に関する法令改正通知です。令和6年4月1日より補助金関連書類の電子保管基準が変更されます。";
    const senderInfo = {
      organization: "文部科学省",
      certificateId: "MEXT-2024-001",
      registeredAuthority: true
    };
    const digitalSignature = "SHA256:abc123def456...文部科学省公式署名";
    const receivedTimestamp = "2024-01-15T10:00:00Z";

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