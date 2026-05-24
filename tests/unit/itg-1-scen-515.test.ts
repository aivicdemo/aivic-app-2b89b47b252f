import { ensureBusinessContinuityDuringSystemUpdate } from "../../src/logic/it-1";

describe("承認フローの進捗状況と滞留期間をリアルタイムで可視化する", () => {
  test("システム更新中に業務継続性に影響するエラーが発生した場合、緊急停止処理が実行される", () => {
    // SCEN-515

    // 高負荷・重要締切あり・長時間更新の状況での業務継続計画
    const highImpactResult = ensureBusinessContinuityDuringSystemUpdate(
      "documentClassification",
      60, // 高負荷
      150, // 長時間更新
      ["2024-12-31", "2024-06-30"] // 重要締切あり
    );

    expect(highImpactResult.continuityPlan).toBe("staged_update");
    expect(highImpactResult.temporaryRoutes).toEqual(["manual_paper_route", "emergency_manual_route"]);
    expect(highImpactResult.rollbackProcedure).toBe("immediate_rollback_available");
    expect(highImpactResult.communicationPlan).toBe("advance_notification_required");

    // 低負荷・短時間更新の状況での業務継続計画
    const lowImpactResult = ensureBusinessContinuityDuringSystemUpdate(
      "reportGeneration",
      10, // 低負荷
      60, // 短時間更新
      [] // 締切なし
    );

    expect(lowImpactResult.continuityPlan).toBe("direct_update");
    expect(lowImpactResult.temporaryRoutes).toEqual([]);
    expect(lowImpactResult.rollbackProcedure).toBe("immediate_rollback_available");
    expect(lowImpactResult.communicationPlan).toBe("standard_notification");

    // 処理中申請件数未取得エラー
    expect(() => {
      ensureBusinessContinuityDuringSystemUpdate(
        "documentClassification",
        undefined as any,
        120,
        []
      );
    }).toThrow("現在の申請状況を確認できないため、安全な更新計画を立てることができません。システム管理者にお問い合わせください。");

    // 更新作業所要時間未入力エラー
    expect(() => {
      ensureBusinessContinuityDuringSystemUpdate(
        "documentClassification",
        50,
        undefined as any,
        []
      );
    }).toThrow("更新作業の所要時間を入力してください。業務継続計画の策定に必要です。");
  });
});