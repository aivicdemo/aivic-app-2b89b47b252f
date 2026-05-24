import {
  handleSystemFailureAlternativeProcess
} from "../../src/logic/it-1-br-1779263788059-2-2-1";

describe("処理ルート変更時に関係者へ自動通知し承認フローを動的に調整する機能", () => {
  test("システム障害時に緊急案件が発生した場合、代替処理が実行される", () => {
    // SCEN-437
    
    // システム重大障害、緊急度最高レベルの緊急案件
    const result1 = handleSystemFailureAlternativeProcess(
      "critical_failure",
      "urgent_subsidy_application",
      "補助金申請書",
      10
    );
    
    expect(result1).toEqual({
      alternativeProcess: "full_paper_mode",
      notificationTargets: ["all_staff", "management", "it_support"],
      dataRecoveryPlan: "sync_paper_to_electronic_after_recovery",
      estimatedRecoveryTime: 8
    });
    
    // システム部分障害、中程度緊急案件
    const result2 = handleSystemFailureAlternativeProcess(
      "partial_failure",
      "research_funding_request", 
      "研究費申請書",
      6
    );
    
    expect(result2).toEqual({
      alternativeProcess: "manual_hybrid_mode",
      notificationTargets: ["relevant_staff", "it_support"],
      dataRecoveryPlan: "sync_paper_to_electronic_after_recovery",
      estimatedRecoveryTime: 4
    });
    
    // システム軽微障害、通常案件
    const result3 = handleSystemFailureAlternativeProcess(
      "minor_failure",
      "general_application",
      "一般申請書",
      3
    );
    
    expect(result3).toEqual({
      alternativeProcess: "temporary_workaround",
      notificationTargets: ["relevant_staff", "it_support"],
      dataRecoveryPlan: "sync_paper_to_electronic_after_recovery",
      estimatedRecoveryTime: 2
    });
    
    // システム状況不明エラーケース
    expect(() => handleSystemFailureAlternativeProcess(
      "unknown",
      "test_document",
      "テスト書類",
      5
    )).toThrow("システム状況を確認できません。情報システム課に連絡してください。");
    
    // 障害種別未指定の警告ケース - 実際の制約を確認して適切に設定
    const result4 = handleSystemFailureAlternativeProcess(
      "critical_failure",
      "",
      "補助金申請書", 
      8
    );
    
    expect(result4.alternativeProcess).toBe("full_paper_mode");
    expect(result4.notificationTargets).toEqual(["all_staff", "management", "it_support"]);
  });
});