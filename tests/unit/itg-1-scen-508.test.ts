import { handleSystemFailureAlternativeProcess } from "../../src/logic/it-1-br-1779263788059-2-2-1";

describe("処理ルート変更時に関係者へ自動通知し承認フローを動的に調整する機能", () => {
  test("システム障害時の代替処理切り替えと復旧後データ同期により業務継続性を確保する", () => {
    // SCEN-508

    // 正常稼働時（障害なし）
    const normalResult = handleSystemFailureAlternativeProcess(
      "normal",
      "補助金申請",
      "standard",
      8
    );
    expect(normalResult.alternativeProcess).toBe("temporary_workaround");
    expect(normalResult.notificationTargets).toEqual(["relevant_staff", "it_support"]);
    expect(normalResult.dataRecoveryPlan).toBe("sync_paper_to_electronic_after_recovery");

    // 部分障害時（緊急度が高い場合）
    const partialFailureResult = handleSystemFailureAlternativeProcess(
      "partial_failure",
      "研究費申請",
      "standard",
      8
    );
    expect(partialFailureResult.alternativeProcess).toBe("manual_hybrid_mode");
    expect(partialFailureResult.notificationTargets).toEqual(["all_staff", "management", "it_support"]);
    expect(partialFailureResult.dataRecoveryPlan).toBe("sync_paper_to_electronic_after_recovery");

    // 重大障害時（完全停止）
    const criticalFailureResult = handleSystemFailureAlternativeProcess(
      "critical_failure",
      "設備申請",
      "standard",
      9
    );
    expect(criticalFailureResult.alternativeProcess).toBe("full_paper_mode");
    expect(criticalFailureResult.notificationTargets).toEqual(["all_staff", "management", "it_support"]);
    expect(criticalFailureResult.dataRecoveryPlan).toBe("sync_paper_to_electronic_after_recovery");

    // システム状況が不明な場合のエラー
    expect(() => {
      handleSystemFailureAlternativeProcess(
        null as any,
        "補助金申請",
        "standard",
        5
      );
    }).toThrow("システム状況を確認できません。情報システム課に連絡してください。");

    // 障害種別が未指定の場合の警告処理
    const unknownFailureResult = handleSystemFailureAlternativeProcess(
      "partial_failure",
      "",
      "standard",
      5
    );
    expect(unknownFailureResult.alternativeProcess).toBe("manual_hybrid_mode");
    expect(unknownFailureResult.dataRecoveryPlan).toBe("sync_paper_to_electronic_after_recovery");

    // 緊急度レベルが範囲外の場合の調整
    const outOfRangeResult = handleSystemFailureAlternativeProcess(
      "normal",
      "一般申請",
      "standard",
      15
    );
    expect(outOfRangeResult.alternativeProcess).toBe("temporary_workaround");
    expect(outOfRangeResult.notificationTargets).toEqual(["all_staff", "management", "it_support"]);
  });
});