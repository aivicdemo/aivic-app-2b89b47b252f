import { ensureBusinessContinuityDuringSystemUpdate } from "../../src/logic/it-1";

describe("承認フローの進捗状況と滞留期間をリアルタイムで可視化する", () => {
  test("システム更新継続性確保 - 更新処理中に業務継続性に影響するエラーが発生した場合、緊急停止処理が実行される", () => {
    // SCEN-515

    // 高負荷状況での更新処理（処理中申請50件以上、2時間以上の更新作業）
    const highLoadResult = ensureBusinessContinuityDuringSystemUpdate(
      "documentClassification",
      60,
      150,
      []
    );
    
    expect(highLoadResult.continuityPlan).toBe("staged_update");
    expect(highLoadResult.temporaryRoutes).toEqual(["manual_paper_route"]);
    expect(highLoadResult.rollbackProcedure).toBe("immediate_rollback_available");
    expect(highLoadResult.communicationPlan).toBe("advance_notification_required");

    // 重要締切が迫っている緊急状況
    const urgentDeadlineResult = ensureBusinessContinuityDuringSystemUpdate(
      "approvalWorkflow",
      30,
      60,
      ["2024-01-15", "2024-01-16"]
    );
    
    expect(urgentDeadlineResult.continuityPlan).toBe("direct_update");
    expect(urgentDeadlineResult.temporaryRoutes).toEqual(["emergency_manual_route"]);
    expect(urgentDeadlineResult.rollbackProcedure).toBe("immediate_rollback_available");
    expect(urgentDeadlineResult.communicationPlan).toBe("advance_notification_required");

    // 通常の低負荷状況
    const normalResult = ensureBusinessContinuityDuringSystemUpdate(
      "userInterface",
      10,
      30,
      []
    );
    
    expect(normalResult.continuityPlan).toBe("direct_update");
    expect(normalResult.temporaryRoutes).toEqual([]);
    expect(normalResult.rollbackProcedure).toBe("immediate_rollback_available");
    expect(normalResult.communicationPlan).toBe("standard_notification");

    // 緊急時の制約チェック - 処理中申請件数取得不可
    expect(() => {
      ensureBusinessContinuityDuringSystemUpdate("documentClassification", null, 60, []);
    }).toThrow("現在の申請状況を確認できないため、安全な更新計画を立てることができません。システム管理者にお問い合わせください。");

    // 更新作業時間未入力エラー
    expect(() => {
      ensureBusinessContinuityDuringSystemUpdate("documentClassification", 30, null, []);
    }).toThrow("更新作業の所要時間を入力してください。業務継続計画の策定に必要です。");
  });
});