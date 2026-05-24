import { handleSystemFailureAlternativeProcess } from "../../src/logic/it-1";

describe("承認フローの進捗状況と滞留期間をリアルタイムで可視化する", () => {
  test("システム障害時代替処理 - 障害復旧後にデータ同期が正常に実行される", () => {
    // SCEN-439
    
    // 重大な障害時の代替処理
    const result1 = handleSystemFailureAlternativeProcess(
      "critical_failure",
      "network_failure",
      "補助金申請書",
      9
    );
    
    expect(result1.alternativeProcess).toBe("full_paper_mode");
    expect(result1.notificationTargets).toEqual(["all_staff", "management", "it_support"]);
    expect(result1.dataRecoveryPlan).toBe("sync_paper_to_electronic_after_recovery");
    expect(result1.estimatedRecoveryTime).toBe(240);

    // 部分的な障害時の代替処理
    const result2 = handleSystemFailureAlternativeProcess(
      "partial_failure",
      "database_timeout",
      "一般申請書",
      6
    );
    
    expect(result2.alternativeProcess).toBe("manual_hybrid_mode");
    expect(result2.notificationTargets).toEqual(["relevant_staff", "it_support"]);
    expect(result2.dataRecoveryPlan).toBe("sync_paper_to_electronic_after_recovery");
    expect(result2.estimatedRecoveryTime).toBe(120);

    // 軽微な障害時の代替処理
    const result3 = handleSystemFailureAlternativeProcess(
      "minor_issue",
      "slow_response",
      "人事関連書類",
      3
    );
    
    expect(result3.alternativeProcess).toBe("temporary_workaround");
    expect(result3.notificationTargets).toEqual(["relevant_staff", "it_support"]);
    expect(result3.dataRecoveryPlan).toBe("sync_paper_to_electronic_after_recovery");
    expect(result3.estimatedRecoveryTime).toBe(60);

    // システム状況不明時のエラー
    expect(() => {
      handleSystemFailureAlternativeProcess(
        "unknown",
        "unknown_error",
        "申請書",
        5
      );
    }).toThrow("システム状況を確認できません。情報システム課に連絡してください。");

    // 緊急度レベル範囲外時の警告
    expect(() => {
      handleSystemFailureAlternativeProcess(
        "critical_failure",
        "system_down",
        "申請書",
        15
      );
    }).toThrow("緊急度は1から10の範囲で指定してください。");
  });
});