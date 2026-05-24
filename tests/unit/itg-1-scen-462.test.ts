import { handleSystemFailureAlternativeProcess } from "../../src/logic/it-1";

describe("承認フローの進捗状況と滞留期間をリアルタイムで可視化する", () => {
  test("システム障害時に紙ベース代替処理に自動切り替えして業務継続性を確保する", () => {
    // SCEN-462

    // 重大障害時の緊急申請（緊急度レベル8）
    const result1 = handleSystemFailureAlternativeProcess(
      "critical_failure",
      "system_failure",
      "補助金申請書",
      8
    );

    expect(result1.alternativeProcess).toBe("full_paper_mode");
    expect(result1.notificationTargets).toEqual(["all_staff", "management", "it_support"]);
    expect(result1.dataRecoveryPlan).toBe("sync_paper_to_electronic_after_recovery");

    // 部分障害時の通常申請（緊急度レベル5）
    const result2 = handleSystemFailureAlternativeProcess(
      "partial_failure",
      "network_error",
      "一般申請書",
      5
    );

    expect(result2.alternativeProcess).toBe("manual_hybrid_mode");
    expect(result2.notificationTargets).toEqual(["relevant_staff", "it_support"]);
    expect(result2.dataRecoveryPlan).toBe("sync_paper_to_electronic_after_recovery");

    // 軽微な障害時（緊急度レベル3）
    const result3 = handleSystemFailureAlternativeProcess(
      "normal",
      "minor_issue",
      "事務申請書",
      3
    );

    expect(result3.alternativeProcess).toBe("temporary_workaround");
    expect(result3.notificationTargets).toEqual(["relevant_staff", "it_support"]);
    expect(result3.dataRecoveryPlan).toBe("sync_paper_to_electronic_after_recovery");

    // システム状況不明エラー
    expect(() => {
      handleSystemFailureAlternativeProcess(
        undefined as any,
        "system_failure",
        "申請書",
        8
      );
    }).toThrow("システム状況を確認できません。情報システム課に連絡してください。");

    // 緊急度範囲外エラー
    expect(() => {
      handleSystemFailureAlternativeProcess(
        "critical_failure",
        "system_failure",
        "申請書",
        15
      );
    }).toThrow("緊急度は1から10の範囲で指定してください。");
  });
});