import { validateLegalNotificationAuthenticity } from '../../src/logic/it-1-br-1779263788059-2-2-1';

describe("処理ルート変更時に関係者へ自動通知し承認フローを動的に調整する機能", () => {
  test("法令改正通知認証 - デジタル署名の検証が正常に実行される", () => {
    // SCEN-496
    const notificationContent = "文部科学省からの法令改正通知：補助金申請書類の保管期間を10年に変更。デジタル文書の要件を強化。";
    const senderInfo = {
      organizationId: "mext-official",
      certificateId: "cert-12345",
      timestamp: "2024-01-15T10:00:00Z"
    };
    const digitalSignature = "SHA256withRSA:abcd1234567890...";
    const receivedTimestamp = "2024-01-15T10:05:00Z";

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