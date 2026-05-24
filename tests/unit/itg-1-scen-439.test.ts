import { handleSystemFailureAlternativeProcess } from "../../src/logic/it-1";

describe("承認フローの進捗状況と滞留期間をリアルタイムで可視化する", () => {
  test("システム障害時代替処理 - 障害復旧後にデータ同期が正常に実行される", () => {
    // SCEN-439
    
    // 通常稼働時のテスト
    const normalResult = handleSystemFailureAlternativeProcess(
      "normal",
      "network_timeout", 
      "補助金申請書",
      5
    );
    
    expect(normalResult.alternativeProcess).toBe("temporary_workaround");
    expect(normalResult.notificationTargets).toEqual(["relevant_staff", "it_support"]);
    expect(normalResult.dataRecoveryPlan).toBe("sync_paper_to_electronic_after_recovery");
    expect(normalResult.estimatedRecoveryTime).toBeDefined();
    
    // 部分障害時のテスト
    const partialFailureResult = handleSystemFailureAlternativeProcess(
      "partial_failure",
      "database_connection",
      "研究費申請書", 
      7
    );
    
    expect(partialFailureResult.alternativeProcess).toBe("manual_hybrid_mode");
    expect(partialFailureResult.notificationTargets).toEqual(["relevant_staff", "it_support"]);
    expect(partialFailureResult.dataRecoveryPlan).toBe("sync_paper_to_electronic_after_recovery");
    expect(partialFailureResult.estimatedRecoveryTime).toBeDefined();
    
    // 重大障害時のテスト  
    const criticalFailureResult = handleSystemFailureAlternativeProcess(
      "critical_failure",
      "system_crash",
      "設備申請書",
      6
    );
    
    expect(criticalFailureResult.alternativeProcess).toBe("full_paper_mode");
    expect(criticalFailureResult.notificationTargets).toEqual(["relevant_staff", "it_support"]);
    expect(criticalFailureResult.dataRecoveryPlan).toBe("sync_paper_to_electronic_after_recovery");
    expect(criticalFailureResult.estimatedRecoveryTime).toBeDefined();
    
    // 高緊急度案件のテスト
    const urgentResult = handleSystemFailureAlternativeProcess(
      "partial_failure",
      "api_timeout",
      "補助金申請書",
      9
    );
    
    expect(urgentResult.alternativeProcess).toBe("manual_hybrid_mode");
    expect(urgentResult.notificationTargets).toEqual(["all_staff", "management", "it_support"]);
    expect(urgentResult.dataRecoveryPlan).toBe("sync_paper_to_electronic_after_recovery");
    expect(urgentResult.estimatedRecoveryTime).toBeDefined();
    
    // 制約チェック - システム状況が不明または取得できない場合
    expect(() => {
      handleSystemFailureAlternativeProcess(
        "",
        "network_error",
        "申請書",
        5
      );
    }).toThrow("システム状況を確認できません。情報システム課に連絡してください。");
  });
});