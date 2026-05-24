import { ensureBusinessContinuityDuringSystemUpdate } from "../../src/logic/it-1";

describe("承認フローの進捗状況と滞留期間をリアルタイムで可視化する", () => {
  test("システム更新中も既存申請業務が継続される", () => {
    // SCEN-513
    
    // 高影響・長時間更新のケース
    const highImpactResult = ensureBusinessContinuityDuringSystemUpdate(
      "documentClassification,approvalFlow",
      60,
      150,
      ["2024-03-15"]
    );
    
    expect(highImpactResult.continuityPlan).toBe("staged_update");
    expect(highImpactResult.temporaryRoutes).toEqual(["manual_paper_route", "emergency_manual_route"]);
    expect(highImpactResult.rollbackProcedure).toBe("immediate_rollback_available");
    expect(highImpactResult.communicationPlan).toBe("advance_notification_required");
    
    // 低影響・短時間更新のケース
    const lowImpactResult = ensureBusinessContinuityDuringSystemUpdate(
      "system_monitoring",
      10,
      60,
      []
    );
    
    expect(lowImpactResult.continuityPlan).toBe("direct_update");
    expect(lowImpactResult.temporaryRoutes).toEqual([]);
    expect(lowImpactResult.rollbackProcedure).toBe("immediate_rollback_available");
    expect(lowImpactResult.communicationPlan).toBe("standard_notification");
    
    // 文書分類システム更新のケース
    const docClassificationResult = ensureBusinessContinuityDuringSystemUpdate(
      "documentClassification",
      30,
      90,
      []
    );
    
    expect(docClassificationResult.continuityPlan).toBe("direct_update");
    expect(docClassificationResult.temporaryRoutes).toEqual(["manual_paper_route"]);
    expect(docClassificationResult.rollbackProcedure).toBe("immediate_rollback_available");
    expect(docClassificationResult.communicationPlan).toBe("standard_notification");
    
    // エラーケース：処理中申請件数が取得できない
    expect(() => {
      ensureBusinessContinuityDuringSystemUpdate(
        "documentClassification",
        null,
        120,
        []
      );
    }).toThrow("現在の申請状況を確認できないため、安全な更新計画を立てることができません。システム管理者にお問い合わせください。");
    
    // エラーケース：更新作業時間が未入力
    expect(() => {
      ensureBusinessContinuityDuringSystemUpdate(
        "documentClassification",
        50,
        null,
        []
      );
    }).toThrow("更新作業の所要時間を入力してください。業務継続計画の策定に必要です。");
  });
});