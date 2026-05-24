import { handleSystemFailureAlternativeProcess } from "../../src/logic/it-1";

describe("承認フローの進捗状況と滞留期間をリアルタイムで可視化する", () => {
  test("システム障害時代替処理で同期処理中に新たな障害が発生した場合、適切にエラーハンドリングされる", () => {
    // SCEN-440
    
    const result = handleSystemFailureAlternativeProcess(
      "critical_failure",
      "system_sync_error", 
      "補助金申請書",
      9
    );

    expect(result.alternativeProcess).toBe("full_paper_mode");
    expect(result.notificationTargets).toEqual(["all_staff", "management", "it_support"]);
    expect(result.dataRecoveryPlan).toBe("sync_paper_to_electronic_after_recovery");
    expect(result.estimatedRecoveryTime).toBeGreaterThan(0);

    expect(() => 
      handleSystemFailureAlternativeProcess(
        "unknown",
        "system_sync_error",
        "補助金申請書", 
        9
      )
    ).toThrow("システム状況を確認できません。情報システム課に連絡してください。");
  });
});