import { handleSystemFailureAlternativeProcess } from "../../src/logic/it-1";

describe("承認フローの進捗状況と滞留期間をリアルタイムで可視化する", () => {
  test("システム障害時代替処理 - 障害復旧後にデータ同期が正常に実行される", () => {
    // SCEN-439
    
    // 重大な障害で補助金関連書類を緊急処理する場合
    const criticalFailureResult = handleSystemFailureAlternativeProcess(
      "critical_failure",
      "database_connection",
      "補助金申請書",
      9
    );
    
    expect(criticalFailureResult.alternativeProcess).toBe("full_paper_mode");
    expect(criticalFailureResult.notificationTargets).toEqual(["all_staff", "management", "it_support"]);
    expect(criticalFailureResult.dataRecoveryPlan).toBe("sync_paper_to_electronic_after_recovery");
    expect(criticalFailureResult.estimatedRecoveryTime).toBe(8);
    
    // 部分的な障害で一般書類を処理する場合
    const partialFailureResult = handleSystemFailureAlternativeProcess(
      "partial_failure",
      "api_timeout",
      "人事申請書",
      5
    );
    
    expect(partialFailureResult.alternativeProcess).toBe("manual_hybrid_mode");
    expect(partialFailureResult.notificationTargets).toEqual(["relevant_staff", "it_support"]);
    expect(partialFailureResult.dataRecoveryPlan).toBe("sync_paper_to_electronic_after_recovery");
    expect(partialFailureResult.estimatedRecoveryTime).toBe(4);
    
    // 軽微な障害で低緊急度の書類を処理する場合
    const minorFailureResult = handleSystemFailureAlternativeProcess(
      "minor_issue",
      "network_slow",
      "一般申請書",
      3
    );
    
    expect(minorFailureResult.alternativeProcess).toBe("temporary_workaround");
    expect(minorFailureResult.notificationTargets).toEqual(["relevant_staff", "it_support"]);
    expect(minorFailureResult.dataRecoveryPlan).toBe("sync_paper_to_electronic_after_recovery");
    expect(minorFailureResult.estimatedRecoveryTime).toBe(2);
    
    // システム状況が不明な場合のエラー
    expect(() => handleSystemFailureAlternativeProcess(
      "",
      "unknown_error",
      "申請書",
      5
    )).toThrow("システム状況を確認できません。情報システム課に連絡してください。");
  });
});