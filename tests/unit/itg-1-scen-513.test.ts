import { ensureBusinessContinuityDuringSystemUpdate } from "../../src/logic/it-1";

describe("承認フローの進捗状況と滞留期間をリアルタイムで可視化する", () => {
  test("システム更新中も既存申請業務が継続される", () => {
    // SCEN-513
    
    // 高影響度・更新時間長のケース - staged_update継続計画
    const result1 = ensureBusinessContinuityDuringSystemUpdate(
      "documentClassification",
      60,
      150,
      ["2024-01-15", "2024-01-20"]
    );
    
    expect(result1.continuityPlan).toBe("staged_update");
    expect(result1.temporaryRoutes).toEqual(["manual_paper_route", "emergency_manual_route"]);
    expect(result1.rollbackProcedure).toBe("immediate_rollback_available");
    expect(result1.communicationPlan).toBe("advance_notification_required");
    
    // 低影響度・短時間更新のケース - direct_update継続計画
    const result2 = ensureBusinessContinuityDuringSystemUpdate(
      "userInterface",
      30,
      90,
      []
    );
    
    expect(result2.continuityPlan).toBe("direct_update");
    expect(result2.temporaryRoutes).toEqual([]);
    expect(result2.rollbackProcedure).toBe("immediate_rollback_available");
    expect(result2.communicationPlan).toBe("standard_notification");
    
    // 文書分類システム更新で一時的代替ルート必要
    const result3 = ensureBusinessContinuityDuringSystemUpdate(
      "documentClassification",
      10,
      60,
      []
    );
    
    expect(result3.continuityPlan).toBe("direct_update");
    expect(result3.temporaryRoutes).toEqual(["manual_paper_route"]);
    expect(result3.rollbackProcedure).toBe("immediate_rollback_available");
    expect(result3.communicationPlan).toBe("standard_notification");
    
    // エラーケース：処理中申請件数が取得できない
    expect(() => ensureBusinessContinuityDuringSystemUpdate(
      "core_system",
      null,
      120,
      []
    )).toThrow("現在の申請状況を確認できないため、安全な更新計画を立てることができません。システム管理者にお問い合わせください。");
    
    // エラーケース：更新時間未入力
    expect(() => ensureBusinessContinuityDuringSystemUpdate(
      "approval_flow",
      25,
      undefined,
      []
    )).toThrow("更新作業の所要時間を入力してください。業務継続計画の策定に必要です。");
    
    // 警告ケース：影響範囲情報不完全
    const result4 = ensureBusinessContinuityDuringSystemUpdate(
      "",
      40,
      180,
      ["2024-02-01"]
    );
    
    expect(result4.continuityPlan).toBe("staged_update");
    expect(result4.temporaryRoutes).toEqual(["emergency_manual_route"]);
  });
});