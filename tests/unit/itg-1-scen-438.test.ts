import { handleSystemFailureAlternativeProcess } from "../../src/logic/it-1";

describe("承認フローの進捗状況と滞留期間をリアルタイムで可視化する", () => {
  test("システム障害検知時に紙ベース処理に自動切替される", () => {
    // SCEN-438

    // 重大障害でハイブリッド申請書類・緊急度8の場合
    const result1 = handleSystemFailureAlternativeProcess(
      "critical_failure",
      "database_connection",
      "補助金申請",
      8
    );
    
    expect(result1).toEqual({
      alternativeProcess: "full_paper_mode",
      notificationTargets: ["all_staff", "management", "it_support"],
      dataRecoveryPlan: "sync_paper_to_electronic_after_recovery",
      estimatedRecoveryTime: 240
    });

    // 部分障害で一般申請書類・緊急度5の場合
    const result2 = handleSystemFailureAlternativeProcess(
      "partial_failure",
      "api_timeout",
      "設備申請",
      5
    );
    
    expect(result2).toEqual({
      alternativeProcess: "manual_hybrid_mode",
      notificationTargets: ["relevant_staff", "it_support"],
      dataRecoveryPlan: "sync_paper_to_electronic_after_recovery",
      estimatedRecoveryTime: 120
    });

    // 軽微障害で低緊急度の場合
    const result3 = handleSystemFailureAlternativeProcess(
      "minor_issue",
      "network_delay",
      "人事申請",
      3
    );
    
    expect(result3).toEqual({
      alternativeProcess: "temporary_workaround",
      notificationTargets: ["relevant_staff", "it_support"],
      dataRecoveryPlan: "sync_paper_to_electronic_after_recovery",
      estimatedRecoveryTime: 60
    });

    // システム状況不明時のエラーハンドリング
    expect(() => handleSystemFailureAlternativeProcess(
      "",
      "unknown",
      "補助金申請",
      8
    )).toThrow("システム状況を確認できません。情報システム課に連絡してください。");
  });
});