import { determineLegalChangeProcessingPriority } from "../../src/logic/it-1-br-1779263788059-2-2-1";

describe("処理ルート変更時に関係者へ自動通知し承認フローを動的に調整する機能", () => {
  test("SCEN-512: 法令改正優先度決定 - 優先度判定基準が不明確な場合、デフォルト優先度が適用される", () => {
    // 優先度判定基準が不明確なケースの入力データ
    const urgencyLevel = "不明";
    const impactScope = "未定義";
    const affectedDocumentTypes = ["不明な文書種別"];
    const currentProcessingLoad = 50;

    const result = determineLegalChangeProcessingPriority(
      urgencyLevel,
      impactScope,
      affectedDocumentTypes,
      currentProcessingLoad
    );

    // デフォルト優先度の適用を検証
    expect(result.priority).toBe("通常");
    expect(result.scheduleDays).toBe(30);
    expect(result.processingOrder).toBe(3);
    expect(result.notificationLevel).toBe("通常");
  });
});