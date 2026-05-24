import { ensureBusinessContinuityDuringSystemUpdate } from "../../src/logic/it-1";

describe("承認フローの進捗状況と滞留期間をリアルタイムで可視化する", () => {
  test("システム更新中の業務継続性確保", () => {
    // SCEN-514

    // 高影響・長時間更新のケース（段階的更新が必要）
    const result1 = ensureBusinessContinuityDuringSystemUpdate(
      "documentClassification",
      100,
      150,
      ["2024-01-15", "2024-01-16"]
    );

    expect(result1.continuityPlan).toBe("staged_update");
    expect(result1.temporaryRoutes).toEqual(["manual_paper_route", "emergency_manual_route"]);
    expect(result1.rollbackProcedure).toBe("immediate_rollback_available");
    expect(result1.communicationPlan).toBe("advance_notification_required");

    // 高影響・短時間更新のケース
    const result2 = ensureBusinessContinuityDuringSystemUpdate(
      "approval_flow",
      60,
      90,
      ["2024-01-15"]
    );

    expect(result2.continuityPlan).toBe("direct_update");
    expect(result2.temporaryRoutes).toEqual(["emergency_manual_route"]);
    expect(result2.rollbackProcedure).toBe("immediate_rollback_available");
    expect(result2.communicationPlan).toBe("advance_notification_required");

    // 低影響のケース（直接更新可能）
    const result3 = ensureBusinessContinuityDuringSystemUpdate(
      "notification",
      30,
      60,
      []
    );

    expect(result3.continuityPlan).toBe("direct_update");
    expect(result3.temporaryRoutes).toEqual([]);
    expect(result3.rollbackProcedure).toBe("immediate_rollback_available");
    expect(result3.communicationPlan).toBe("standard_notification");

    // 文書分類システム更新で低影響のケース
    const result4 = ensureBusinessContinuityDuringSystemUpdate(
      "documentClassification",
      20,
      30,
      []
    );

    expect(result4.continuityPlan).toBe("direct_update");
    expect(result4.temporaryRoutes).toEqual(["manual_paper_route"]);
    expect(result4.rollbackProcedure).toBe("immediate_rollback_available");
    expect(result4.communicationPlan).toBe("standard_notification");
  });
});