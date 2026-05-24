import { handleSystemFailureAlternativeProcess } from "../../src/logic/it-1";

describe("承認フローの進捗状況と滞留期間をリアルタイムで可視化する", () => {
  test("システム障害時承認継続 - 同期処理でデータ整合性エラーが検出された場合、適切に処理される", () => {
    // SCEN-464

    // システムクリティカル障害で緊急レベル8の場合
    const criticalFailureResult = handleSystemFailureAlternativeProcess(
      "critical_failure",
      "data_sync_error", 
      "申請書類",
      8
    );

    expect(criticalFailureResult.alternativeProcess).toBe("full_paper_mode");
    expect(criticalFailureResult.notificationTargets).toEqual(["all_staff", "management", "it_support"]);
    expect(criticalFailureResult.dataRecoveryPlan).toBe("sync_paper_to_electronic_after_recovery");

    // 部分障害で緊急レベル5の場合
    const partialFailureResult = handleSystemFailureAlternativeProcess(
      "partial_failure",
      "network_timeout",
      "補助金申請書",
      5
    );

    expect(partialFailureResult.alternativeProcess).toBe("manual_hybrid_mode");
    expect(partialFailureResult.notificationTargets).toEqual(["relevant_staff", "it_support"]);
    expect(partialFailureResult.dataRecoveryPlan).toBe("sync_paper_to_electronic_after_recovery");

    // 軽微な障害で緊急レベル3の場合
    const minorFailureResult = handleSystemFailureAlternativeProcess(
      "temporary_error",
      "session_expired",
      "人事申請書",
      3
    );

    expect(minorFailureResult.alternativeProcess).toBe("temporary_workaround");
    expect(minorFailureResult.notificationTargets).toEqual(["relevant_staff", "it_support"]);
    expect(minorFailureResult.dataRecoveryPlan).toBe("sync_paper_to_electronic_after_recovery");

    // システム状況不明の場合のエラー処理
    expect(() => handleSystemFailureAlternativeProcess(
      "unknown",
      "undefined_error", 
      "申請書類",
      5
    )).toThrow("システム状況を確認できません。情報システム課に連絡してください。");
  });
});