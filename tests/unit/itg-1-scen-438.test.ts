import { handleSystemFailureAlternativeProcess } from "../../src/logic/it-1";

describe("承認フローの進捗状況と滞留期間をリアルタイムで可視化する", () => {
  test("システム障害検知時に紙ベース処理に自動切替される", () => {
    // SCEN-438
    
    // システム完全障害時の緊急代替処理
    const criticalFailureResult = handleSystemFailureAlternativeProcess(
      "critical_failure",
      "database_connection_error",
      "補助金申請書",
      9
    );
    
    expect(criticalFailureResult.alternativeProcess).toBe("full_paper_mode");
    expect(criticalFailureResult.notificationTargets).toEqual(["all_staff", "management", "it_support"]);
    expect(criticalFailureResult.dataRecoveryPlan).toBe("sync_paper_to_electronic_after_recovery");
    expect(criticalFailureResult.estimatedRecoveryTime).toBe(24);
    
    // 部分障害時の手動ハイブリッド処理
    const partialFailureResult = handleSystemFailureAlternativeProcess(
      "partial_failure",
      "api_timeout",
      "一般申請書",
      5
    );
    
    expect(partialFailureResult.alternativeProcess).toBe("manual_hybrid_mode");
    expect(partialFailureResult.notificationTargets).toEqual(["relevant_staff", "it_support"]);
    expect(partialFailureResult.dataRecoveryPlan).toBe("sync_paper_to_electronic_after_recovery");
    expect(partialFailureResult.estimatedRecoveryTime).toBe(12);
    
    // 軽微障害時の一時回避処理
    const minorIssueResult = handleSystemFailureAlternativeProcess(
      "minor_issue",
      "network_slowdown",
      "人事申請書",
      3
    );
    
    expect(minorIssueResult.alternativeProcess).toBe("temporary_workaround");
    expect(minorIssueResult.notificationTargets).toEqual(["relevant_staff", "it_support"]);
    expect(minorIssueResult.dataRecoveryPlan).toBe("sync_paper_to_electronic_after_recovery");
    expect(minorIssueResult.estimatedRecoveryTime).toBe(6);
    
    // システム状況不明時のエラー
    expect(() => handleSystemFailureAlternativeProcess(
      "unknown",
      "unknown_error",
      "申請書",
      1
    )).toThrow("システム状況を確認できません。情報システム課に連絡してください。");
  });
});