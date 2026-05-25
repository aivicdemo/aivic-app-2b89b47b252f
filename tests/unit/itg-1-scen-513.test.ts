import { ensureBusinessContinuityDuringSystemUpdate } from "../../src/logic/it-1";

describe("承認フローの進捗状況と滞留期間をリアルタイムで可視化する", () => {
  // SCEN-513: [normal] システム更新継続性確保 - 更新中も既存申請業務が継続される
  test("システム更新中の業務継続性を確保する", () => {
    // 高影響・長時間更新のケース
    const highImpactResult = ensureBusinessContinuityDuringSystemUpdate(
      "documentClassification,approvalFlow",
      75, // activeApplications > 50
      150, // estimatedUpdateDuration > 120
      ["2024-01-20", "2024-01-25"] // criticalDeadlines.length > 0
    );

    expect(highImpactResult.continuityPlan).toBe("staged_update");
    expect(highImpactResult.temporaryRoutes).toEqual(["manual_paper_route", "emergency_manual_route"]);
    expect(highImpactResult.rollbackProcedure).toBe("immediate_rollback_available");
    expect(highImpactResult.communicationPlan).toBe("advance_notification_required");

    // 低影響・短時間更新のケース
    const lowImpactResult = ensureBusinessContinuityDuringSystemUpdate(
      "userInterface",
      30, // activeApplications <= 50
      90, // estimatedUpdateDuration <= 120
      [] // criticalDeadlines.length = 0
    );

    expect(lowImpactResult.continuityPlan).toBe("direct_update");
    expect(lowImpactResult.temporaryRoutes).toEqual([]);
    expect(lowImpactResult.rollbackProcedure).toBe("immediate_rollback_available");
    expect(lowImpactResult.communicationPlan).toBe("standard_notification");

    // 文書分類システム更新のケース
    const documentUpdateResult = ensureBusinessContinuityDuringSystemUpdate(
      "documentClassification",
      25, // activeApplications <= 50
      60, // estimatedUpdateDuration <= 120
      [] // criticalDeadlines.length = 0
    );

    expect(documentUpdateResult.continuityPlan).toBe("direct_update");
    expect(documentUpdateResult.temporaryRoutes).toEqual(["manual_paper_route"]);
    expect(documentUpdateResult.rollbackProcedure).toBe("immediate_rollback_available");
    expect(documentUpdateResult.communicationPlan).toBe("standard_notification");
  });
});