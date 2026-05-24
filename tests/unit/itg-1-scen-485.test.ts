import { handleSystemFailureAlternativeProcess } from "../../src/logic/it-1-br-1779263788059-2-2-1";

describe("処理ルート変更時に関係者へ自動通知し承認フローを動的に調整する機能", () => {
  test("承認結果通知の送信に失敗した場合、リトライ処理が実行される", () => {
    // SCEN-485
    
    // 通常の通知送信失敗（部分的障害）
    const partialFailureResult = handleSystemFailureAlternativeProcess(
      "partial_failure",
      "notification_error",
      "申請書類",
      8
    );
    
    expect(partialFailureResult.alternativeProcess).toBe("manual_hybrid_mode");
    expect(partialFailureResult.notificationTargets).toEqual(["all_staff", "management", "it_support"]);
    expect(partialFailureResult.dataRecoveryPlan).toBe("sync_paper_to_electronic_after_recovery");
    
    // 重大な通知システム障害（完全障害）
    const criticalFailureResult = handleSystemFailureAlternativeProcess(
      "critical_failure",
      "system_down",
      "補助金申請書",
      9
    );
    
    expect(criticalFailureResult.alternativeProcess).toBe("full_paper_mode");
    expect(criticalFailureResult.notificationTargets).toEqual(["all_staff", "management", "it_support"]);
    expect(criticalFailureResult.dataRecoveryPlan).toBe("sync_paper_to_electronic_after_recovery");
    
    // 低緊急度での通知障害
    const lowUrgencyResult = handleSystemFailureAlternativeProcess(
      "partial_failure",
      "notification_timeout",
      "一般申請書",
      3
    );
    
    expect(lowUrgencyResult.alternativeProcess).toBe("manual_hybrid_mode");
    expect(lowUrgencyResult.notificationTargets).toEqual(["relevant_staff", "it_support"]);
    expect(lowUrgencyResult.dataRecoveryPlan).toBe("sync_paper_to_electronic_after_recovery");
    
    // システム状況不明によるエラー
    expect(() => {
      handleSystemFailureAlternativeProcess(
        "unknown_status",
        "notification_error",
        "申請書類",
        5
      );
    }).toThrow("システム状況を確認できません。情報システム課に連絡してください。");
  });
});