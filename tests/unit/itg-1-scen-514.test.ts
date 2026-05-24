import { ensureBusinessContinuityDuringSystemUpdate } from "../../src/logic/it-1";

describe("承認フローの進捗状況と滞留期間をリアルタイムで可視化する", () => {
  test("システム更新中も既存の申請業務を継続できるよう段階的な更新手順と一時的な代替処理ルートを確保する", () => {
    // SCEN-514

    // 高影響・長時間更新・重要締切ありのケース
    const result1 = ensureBusinessContinuityDuringSystemUpdate(
      "documentClassification,approvalFlow",
      100, // 処理中申請件数が多い
      150, // 予想時間が2時間30分
      ["2024-01-15", "2024-01-16"] // 48時間以内に重要締切
    );

    expect(result1.continuityPlan).toBe("staged_update");
    expect(result1.temporaryRoutes).toEqual(["manual_paper_route", "emergency_manual_route"]);
    expect(result1.rollbackProcedure).toBe("immediate_rollback_available");
    expect(result1.communicationPlan).toBe("advance_notification_required");

    // 低影響・短時間更新のケース
    const result2 = ensureBusinessContinuityDuringSystemUpdate(
      "userInterface",
      30, // 処理中申請件数が少ない
      90, // 予想時間が1時間30分
      [] // 重要締切なし
    );

    expect(result2.continuityPlan).toBe("direct_update");
    expect(result2.temporaryRoutes).toEqual([]);
    expect(result2.rollbackProcedure).toBe("immediate_rollback_available");
    expect(result2.communicationPlan).toBe("standard_notification");

    // 文書分類システム更新のケース
    const result3 = ensureBusinessContinuityDuringSystemUpdate(
      "documentClassification",
      25, // 処理中申請件数が少ない
      60, // 予想時間が1時間
      [] // 重要締切なし
    );

    expect(result3.continuityPlan).toBe("direct_update");
    expect(result3.temporaryRoutes).toEqual(["manual_paper_route"]);
    expect(result3.rollbackProcedure).toBe("immediate_rollback_available");
    expect(result3.communicationPlan).toBe("standard_notification");

    // エラーケース：処理中申請件数データなし
    expect(() => {
      ensureBusinessContinuityDuringSystemUpdate(
        "documentClassification",
        null,
        120,
        []
      );
    }).toThrow("現在の申請状況を確認できないため、安全な更新計画を立てることができません。システム管理者にお問い合わせください。");

    // エラーケース：更新時間未入力
    expect(() => {
      ensureBusinessContinuityDuringSystemUpdate(
        "approvalFlow",
        50,
        null,
        []
      );
    }).toThrow("更新作業の所要時間を入力してください。業務継続計画の策定に必要です。");
  });
});