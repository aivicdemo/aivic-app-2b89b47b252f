import { handleSystemFailureFallback } from '../../src/logic/it-1';

describe("承認フローの進捗状況と滞留期間をリアルタイムで可視化する", () => {
  // SCEN-462
  test("システム障害時承認継続 - 障害発生時に紙ベース代替手段に切り替わる", () => {
    const systemStatus = "down";
    const applicationId = "APP_20240115_001";
    const userRole = "approver";

    const result = handleSystemFailureFallback(systemStatus, applicationId, userRole);

    expect(result.fallbackMethod).toBe("emergency_paper");
    expect(result.emergencyContactList).toEqual(["contact1@university.ac.jp", "contact2@university.ac.jp"]);
    expect(result.paperFormUrl).toBe("https://system.university.ac.jp/forms/APP_20240115_001.pdf");
    expect(result.syncRequired).toBe(true);
  });
});