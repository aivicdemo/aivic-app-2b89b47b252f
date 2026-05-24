import { handleSystemFailureAlternativeProcess } from "../../src/logic/it-1-br-2-1-1";

describe("申請書類の文書種別を自動判別し補助金関連度に基づいて電子化可否を判定する機能", () => {
  test("ハイブリッド処理必要文書で電子＋紙保管が選択される", () => {
    // SCEN-490
    const systemStatus = "critical_failure";
    const failureType = "system_crash";
    const documentType = "補助金申請書";
    const urgencyLevel = 9;

    const result = handleSystemFailureAlternativeProcess(
      systemStatus,
      failureType,
      documentType,
      urgencyLevel
    );

    expect(result.alternativeProcess).toBe("full_paper_mode");
    expect(result.notificationTargets).toEqual(["all_staff", "management", "it_support"]);
    expect(result.dataRecoveryPlan).toBe("sync_paper_to_electronic_after_recovery");
    expect(typeof result.estimatedRecoveryTime).toBe("number");
  });
});