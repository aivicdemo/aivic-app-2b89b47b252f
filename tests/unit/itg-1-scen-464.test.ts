import { handleSystemFailureAlternativeProcess } from "../../src/logic/it-1";

describe("承認フローの進捗状況と滞留期間をリアルタイムで可視化する", () => {
  test("システム障害時承認継続 - 同期処理でデータ整合性エラーが検出された場合、適切に処理される", () => {
    // SCEN-464
    
    // データ整合性エラーが検出された状況をテスト
    const result = handleSystemFailureAlternativeProcess(
      "critical_failure",
      "data_inconsistency",
      "補助金申請書",
      9
    );
    
    expect(result.alternativeProcess).toBe("full_paper_mode");
    expect(result.notificationTargets).toEqual(["all_staff", "management", "it_support"]);
    expect(result.dataRecoveryPlan).toBe("sync_paper_to_electronic_after_recovery");
    expect(result.estimatedRecoveryTime).toBeGreaterThan(0);
    
    // 部分的障害での処理
    const partialFailureResult = handleSystemFailureAlternativeProcess(
      "partial_failure",
      "sync_error",
      "一般申請書",
      5
    );
    
    expect(partialFailureResult.alternativeProcess).toBe("manual_hybrid_mode");
    expect(partialFailureResult.notificationTargets).toEqual(["relevant_staff", "it_support"]);
    expect(partialFailureResult.dataRecoveryPlan).toBe("sync_paper_to_electronic_after_recovery");
    
    // 制約条件のテスト - システム状況が不明な場合
    expect(() => {
      handleSystemFailureAlternativeProcess(
        "",
        "data_inconsistency",
        "補助金申請書",
        8
      );
    }).toThrow("システム状況を確認できません。情報システム課に連絡してください。");
  });
});