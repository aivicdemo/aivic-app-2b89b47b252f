import { ensureBusinessContinuityDuringSystemUpdate } from "../../src/logic/it-1";

describe("承認フローの進捗状況と滞留期間をリアルタイムで可視化する", () => {
  test("システム更新継続性確保 - 更新処理中に業務継続性に影響するエラーが発生した場合、緊急停止処理が実行される", () => {
    // SCEN-515

    // 高影響・長時間更新で緊急対応が必要な場合
    const result1 = ensureBusinessContinuityDuringSystemUpdate(
      "documentClassification,approvalFlow",
      60,
      150,
      ["2024-01-15", "2024-01-16"]
    );

    expect(result1).toEqual({
      continuityPlan: "staged_update",
      temporaryRoutes: ["manual_paper_route", "emergency_manual_route"],
      rollbackProcedure: "immediate_rollback_available",
      communicationPlan: "advance_notification_required"
    });

    // 低影響・短時間更新で標準対応の場合
    const result2 = ensureBusinessContinuityDuringSystemUpdate(
      "reportGeneration",
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

    // 文書分類機能のみ影響・重要締切なしの場合
    const result3 = ensureBusinessContinuityDuringSystemUpdate(
      "documentClassification",
      40,
      90,
      []
    );

    expect(result3).toEqual({
      continuityPlan: "direct_update",
      temporaryRoutes: ["manual_paper_route"],
      rollbackProcedure: "immediate_rollback_available",
      communicationPlan: "standard_notification"
    });

    // エラーケース: 処理中の申請件数が取得できない場合
    expect(() => {
      ensureBusinessContinuityDuringSystemUpdate("", undefined, 120, []);
    }).toThrow("現在の申請状況を確認できないため、安全な更新計画を立てることができません。システム管理者にお問い合わせください。");

    // エラーケース: 更新作業の予想時間が入力されていない場合
    expect(() => {
      ensureBusinessContinuityDuringSystemUpdate("documentClassification", 50, undefined, []);
    }).toThrow("更新作業の所要時間を入力してください。業務継続計画の策定に必要です。");
  });
});