import { handleSystemFailureAlternativeProcess } from "../../src/logic/it-1";

describe("承認フローの進捗状況と滞留期間をリアルタイムで可視化する", () => {
  test("システム障害発生時に緊急度に応じて適切な代替処理方法と復旧計画を決定する", () => {
    // SCEN-462

    // 重大障害・高緊急度の場合
    const criticalFailureResult = handleSystemFailureAlternativeProcess(
      "critical_failure",
      "database_connection",
      "補助金申請書",
      9
    );
    expect(criticalFailureResult.alternativeProcess).toBe("full_paper_mode");
    expect(criticalFailureResult.notificationTargets).toEqual(["all_staff", "management", "it_support"]);
    expect(criticalFailureResult.dataRecoveryPlan).toBe("sync_paper_to_electronic_after_recovery");
    expect(typeof criticalFailureResult.estimatedRecoveryTime).toBe("number");

    // 部分障害・中緊急度の場合
    const partialFailureResult = handleSystemFailureAlternativeProcess(
      "partial_failure",
      "api_timeout",
      "一般申請書",
      6
    );
    expect(partialFailureResult.alternativeProcess).toBe("manual_hybrid_mode");
    expect(partialFailureResult.notificationTargets).toEqual(["relevant_staff", "it_support"]);
    expect(partialFailureResult.dataRecoveryPlan).toBe("sync_paper_to_electronic_after_recovery");

    // 軽微障害・低緊急度の場合
    const minorFailureResult = handleSystemFailureAlternativeProcess(
      "minor_issue",
      "network_delay",
      "参考資料",
      3
    );
    expect(minorFailureResult.alternativeProcess).toBe("temporary_workaround");
    expect(minorFailureResult.notificationTargets).toEqual(["relevant_staff", "it_support"]);
    expect(minorFailureResult.dataRecoveryPlan).toBe("sync_paper_to_electronic_after_recovery");

    // システム状況不明時のエラー
    expect(() => {
      handleSystemFailureAlternativeProcess(
        "unknown_status",
        "database_connection",
        "補助金申請書",
        8
      );
    }).toThrow("システム状況を確認できません。情報システム課に連絡してください。");

    // 障害種別未指定時の警告
    const undefinedFailureResult = handleSystemFailureAlternativeProcess(
      "critical_failure",
      "",
      "補助金申請書",
      7
    );
    expect(undefinedFailureResult.alternativeProcess).toBe("full_paper_mode");

    // 緊急度範囲外の値のクランプ
    const outOfRangeResult = handleSystemFailureAlternativeProcess(
      "partial_failure",
      "system_overload",
      "一般申請書",
      15
    );
    expect(outOfRangeResult.alternativeProcess).toBe("manual_hybrid_mode");
  });
});