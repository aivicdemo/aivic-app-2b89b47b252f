import { handleSystemFailureAlternativeProcess } from "../../src/logic/it-1";

describe("承認フローの進捗状況と滞留期間をリアルタイムで可視化する", () => {
  test("システム障害検知時に紙ベース処理に自動切替される", () => {
    // SCEN-438

    // ケース1: クリティカル障害 + 緊急度8以上 → 全紙ベース処理 + 全関係者通知
    const result1 = handleSystemFailureAlternativeProcess(
      "critical_failure",
      "database_connection_lost",
      "補助金申請書",
      8
    );
    expect(result1.alternativeProcess).toBe("full_paper_mode");
    expect(result1.notificationTargets).toEqual(["all_staff", "management", "it_support"]);
    expect(result1.dataRecoveryPlan).toBe("sync_paper_to_electronic_after_recovery");

    // ケース2: 部分障害 + 緊急度5 → 手動ハイブリッド処理 + 関連職員通知
    const result2 = handleSystemFailureAlternativeProcess(
      "partial_failure",
      "api_timeout",
      "一般申請書",
      5
    );
    expect(result2.alternativeProcess).toBe("manual_hybrid_mode");
    expect(result2.notificationTargets).toEqual(["relevant_staff", "it_support"]);
    expect(result2.dataRecoveryPlan).toBe("sync_paper_to_electronic_after_recovery");

    // ケース3: 軽微障害 + 緊急度3 → 一時的回避策
    const result3 = handleSystemFailureAlternativeProcess(
      "minor_failure",
      "network_slow",
      "人事申請書",
      3
    );
    expect(result3.alternativeProcess).toBe("temporary_workaround");
    expect(result3.notificationTargets).toEqual(["relevant_staff", "it_support"]);
    expect(result3.dataRecoveryPlan).toBe("sync_paper_to_electronic_after_recovery");

    // 制約テスト: システム状況が不明
    expect(() => {
      handleSystemFailureAlternativeProcess(
        null as any,
        "unknown_error",
        "申請書",
        5
      );
    }).toThrow("システム状況を確認できません。情報システム課に連絡してください。");

    // 制約テスト: 障害種類未指定
    const result4 = handleSystemFailureAlternativeProcess(
      "critical_failure",
      null as any,
      "申請書",
      5
    );
    expect(result4.alternativeProcess).toBe("full_paper_mode");
  });
});