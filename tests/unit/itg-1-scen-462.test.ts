import { handleSystemFailureAlternativeProcess } from "../../src/logic/it-1";

describe("承認フローの進捗状況と滞留期間をリアルタイムで可視化する", () => {
  test("システム障害発生時に紙ベース代替処理に自動切り替えし、復旧後のデータ同期計画が設定される", () => {
    // SCEN-462

    // 重大障害で緊急度8の場合
    const criticalResult = handleSystemFailureAlternativeProcess(
      "critical_failure",
      "network_disconnection", 
      "補助金申請書",
      8
    );
    
    expect(criticalResult.alternativeProcess).toBe("full_paper_mode");
    expect(criticalResult.notificationTargets).toEqual(["all_staff", "management", "it_support"]);
    expect(criticalResult.dataRecoveryPlan).toBe("sync_paper_to_electronic_after_recovery");
    expect(typeof criticalResult.estimatedRecoveryTime).toBe("number");

    // 部分障害で通常案件の場合
    const partialResult = handleSystemFailureAlternativeProcess(
      "partial_failure",
      "database_timeout",
      "一般申請書",
      5
    );
    
    expect(partialResult.alternativeProcess).toBe("manual_hybrid_mode");
    expect(partialResult.notificationTargets).toEqual(["relevant_staff", "it_support"]);
    expect(partialResult.dataRecoveryPlan).toBe("sync_paper_to_electronic_after_recovery");
    
    // 軽微障害の場合
    const minorResult = handleSystemFailureAlternativeProcess(
      "minor_issue",
      "performance_degradation", 
      "人事申請書",
      3
    );
    
    expect(minorResult.alternativeProcess).toBe("temporary_workaround");
    expect(minorResult.notificationTargets).toEqual(["relevant_staff", "it_support"]);
    expect(minorResult.dataRecoveryPlan).toBe("sync_paper_to_electronic_after_recovery");

    // エラーケース: システム状況不明
    expect(() => {
      handleSystemFailureAlternativeProcess(
        "",
        "unknown_error",
        "申請書",
        5
      );
    }).toThrow("システム状況を確認できません。情報システム課に連絡してください。");

    // 警告ケース: 障害種別不明
    const unknownTypeResult = handleSystemFailureAlternativeProcess(
      "partial_failure",
      "",
      "申請書",
      5
    );
    
    expect(unknownTypeResult.alternativeProcess).toBe("manual_hybrid_mode");
    expect(unknownTypeResult.notificationTargets).toEqual(["relevant_staff", "it_support"]);
  });
});