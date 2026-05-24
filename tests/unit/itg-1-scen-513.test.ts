import { ensureBusinessContinuityDuringSystemUpdate } from "../../src/logic/it-1";

describe("承認フローの進捗状況と滞留期間をリアルタイムで可視化する", () => {
  test("システム更新中も既存申請業務継続が確保される", () => {
    // SCEN-513
    
    // 高負荷・重要締切ありのケース（段階的更新が必要）
    const result1 = ensureBusinessContinuityDuringSystemUpdate(
      "documentClassification,approvalFlow",
      80,
      150,
      ["2024-03-15", "2024-03-16"]
    );
    
    expect(result1).toEqual({
      continuityPlan: "staged_update",
      temporaryRoutes: ["manual_paper_route", "emergency_manual_route"],
      rollbackProcedure: "immediate_rollback_available",
      communicationPlan: "advance_notification_required"
    });
    
    // 低負荷・直接更新可能なケース
    const result2 = ensureBusinessContinuityDuringSystemUpdate(
      "userInterface",
      30,
      60,
      []
    );
    
    expect(result2).toEqual({
      continuityPlan: "direct_update",
      temporaryRoutes: [],
      rollbackProcedure: "immediate_rollback_available",
      communicationPlan: "standard_notification"
    });
    
    // 文書分類システム更新・高負荷のケース
    const result3 = ensureBusinessContinuityDuringSystemUpdate(
      "documentClassification",
      60,
      90,
      ["2024-03-20"]
    );
    
    expect(result3).toEqual({
      continuityPlan: "direct_update",
      temporaryRoutes: ["manual_paper_route"],
      rollbackProcedure: "immediate_rollback_available",
      communicationPlan: "advance_notification_required"
    });
    
    // 処理中申請件数・更新時間の制約チェック
    expect(() => ensureBusinessContinuityDuringSystemUpdate(
      "",
      -1,
      0,
      []
    )).toThrow("現在の申請状況を確認できないため、安全な更新計画を立てることができません。システム管理者にお問い合わせください。");
    
    expect(() => ensureBusinessContinuityDuringSystemUpdate(
      "documentClassification",
      50,
      undefined,
      []
    )).toThrow("更新作業の所要時間を入力してください。業務継続計画の策定に必要です。");
  });
});