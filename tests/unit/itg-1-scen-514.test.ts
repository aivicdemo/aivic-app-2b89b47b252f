import { ensureBusinessContinuityDuringSystemUpdate } from "../../src/logic/it-1";

describe("承認フローの進捗状況と滞留期間をリアルタイムで可視化する", () => {
  test("システム更新中の業務継続性を確保して段階的更新手順が適切に実行される", () => {
    // SCEN-514

    // 高影響で段階的更新が必要なケース
    const result1 = ensureBusinessContinuityDuringSystemUpdate(
      "documentClassification,approvalFlow",
      100,
      150,
      ["2024-12-25", "2024-12-30"]
    );
    
    expect(result1.continuityPlan).toBe("staged_update");
    expect(result1.temporaryRoutes).toEqual(["manual_paper_route", "emergency_manual_route"]);
    expect(result1.rollbackProcedure).toBe("immediate_rollback_available");
    expect(result1.communicationPlan).toBe("advance_notification_required");

    // 低影響で直接更新が可能なケース
    const result2 = ensureBusinessContinuityDuringSystemUpdate(
      "userInterface",
      30,
      60,
      []
    );
    
    expect(result2.continuityPlan).toBe("direct_update");
    expect(result2.temporaryRoutes).toEqual([]);
    expect(result2.rollbackProcedure).toBe("immediate_rollback_available");
    expect(result2.communicationPlan).toBe("standard_notification");

    // 文書分類システムのみ影響で代替ルート準備
    const result3 = ensureBusinessContinuityDuringSystemUpdate(
      "documentClassification",
      20,
      30,
      []
    );
    
    expect(result3.continuityPlan).toBe("direct_update");
    expect(result3.temporaryRoutes).toEqual(["manual_paper_route"]);
    expect(result3.rollbackProcedure).toBe("immediate_rollback_available");
    expect(result3.communicationPlan).toBe("standard_notification");

    // 重要な締切がある場合の緊急対応
    const result4 = ensureBusinessContinuityDuringSystemUpdate(
      "approvalFlow",
      40,
      90,
      ["2024-12-28"]
    );
    
    expect(result4.continuityPlan).toBe("direct_update");
    expect(result4.temporaryRoutes).toEqual(["emergency_manual_route"]);
    expect(result4.rollbackProcedure).toBe("immediate_rollback_available");
    expect(result4.communicationPlan).toBe("advance_notification_required");
  });
});