import { handleSystemFailureAlternativeProcess } from "../../src/logic/it-1-br-1779263788059-2-2-1";

describe("処理ルート変更時に関係者へ自動通知し承認フローを動的に調整する機能", () => {
  test("システム障害時に緊急案件が発生した場合、代替処理が実行される", () => {
    // SCEN-437

    // 重大障害・緊急度8の場合
    const criticalResult = handleSystemFailureAlternativeProcess(
      "critical_failure",
      "database_connection_lost", 
      "補助金申請書",
      8
    );

    expect(criticalResult.alternativeProcess).toBe("full_paper_mode");
    expect(criticalResult.notificationTargets).toEqual(["all_staff", "management", "it_support"]);
    expect(criticalResult.dataRecoveryPlan).toBe("sync_paper_to_electronic_after_recovery");
    expect(criticalResult.estimatedRecoveryTime).toBeGreaterThan(0);

    // 部分障害・緊急度6の場合
    const partialResult = handleSystemFailureAlternativeProcess(
      "partial_failure",
      "api_timeout",
      "一般申請書",
      6
    );

    expect(partialResult.alternativeProcess).toBe("manual_hybrid_mode");
    expect(partialResult.notificationTargets).toEqual(["relevant_staff", "it_support"]);
    expect(partialResult.dataRecoveryPlan).toBe("sync_paper_to_electronic_after_recovery");

    // 軽微障害・緊急度3の場合
    const minorResult = handleSystemFailureAlternativeProcess(
      "network_slow",
      "network_latency",
      "人事申請書",
      3
    );

    expect(minorResult.alternativeProcess).toBe("temporary_workaround");
    expect(minorResult.notificationTargets).toEqual(["relevant_staff", "it_support"]);
    expect(minorResult.dataRecoveryPlan).toBe("sync_paper_to_electronic_after_recovery");

    // システム状況不明の場合の制約テスト
    expect(() => {
      handleSystemFailureAlternativeProcess(
        "",
        "unknown_error",
        "申請書",
        5
      );
    }).toThrow("システム状況を確認できません。情報システム課に連絡してください。");

    // 障害種別未指定の場合の制約テスト
    const unknownFailureResult = handleSystemFailureAlternativeProcess(
      "partial_failure",
      "",
      "申請書",
      7
    );

    expect(unknownFailureResult.alternativeProcess).toBe("manual_hybrid_mode");
  });
});