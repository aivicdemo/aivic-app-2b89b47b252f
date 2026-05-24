import { handleSystemFailureAlternativeProcess } from "../../src/logic/it-1";

describe("承認フローの進捗状況と滞留期間をリアルタイムで可視化する", () => {
  test("システム障害時代替処理 - 同期処理中に新たな障害が発生した場合、適切にエラーハンドリングされる", () => {
    // SCEN-440
    
    // 同期処理中にシステム障害が発生したケース
    const result = handleSystemFailureAlternativeProcess(
      "critical_failure", // システムの現在の稼働状況
      "database_connection", // 発生した障害の種類
      "補助金申請書", // 処理対象の申請書類の種別
      9 // 申請の緊急度レベル
    );
    
    expect(result.alternativeProcess).toBe("full_paper_mode");
    expect(result.notificationTargets).toEqual(["all_staff", "management", "it_support"]);
    expect(result.dataRecoveryPlan).toBe("sync_paper_to_electronic_after_recovery");
    expect(typeof result.estimatedRecoveryTime).toBe("number");
    
    // 部分障害でも高緊急度の場合
    const partialResult = handleSystemFailureAlternativeProcess(
      "partial_failure",
      "api_timeout",
      "研究費申請書",
      8
    );
    
    expect(partialResult.alternativeProcess).toBe("manual_hybrid_mode");
    expect(partialResult.notificationTargets).toEqual(["all_staff", "management", "it_support"]);
    expect(partialResult.dataRecoveryPlan).toBe("sync_paper_to_electronic_after_recovery");
    
    // 軽微な障害で低緊急度の場合
    const minorResult = handleSystemFailureAlternativeProcess(
      "minor_issue",
      "timeout",
      "一般申請書",
      3
    );
    
    expect(minorResult.alternativeProcess).toBe("temporary_workaround");
    expect(minorResult.notificationTargets).toEqual(["relevant_staff", "it_support"]);
    expect(minorResult.dataRecoveryPlan).toBe("sync_paper_to_electronic_after_recovery");
    
    // 制約違反: システム状況が不明な場合
    expect(() => handleSystemFailureAlternativeProcess(
      "",
      "database_failure",
      "申請書",
      5
    )).toThrow("システム状況を確認できません。情報システム課に連絡してください。");
    
    // 制約違反: 障害の種類が未指定の場合（警告）
    const warningResult = handleSystemFailureAlternativeProcess(
      "critical_failure",
      "",
      "申請書",
      5
    );
    
    expect(warningResult.alternativeProcess).toBe("full_paper_mode");
    expect(warningResult.notificationTargets).toEqual(["relevant_staff", "it_support"]);
  });
});