import { determineLegalChangeProcessingPriority } from "../../src/logic/it-1-br-1779263788059-2-2-1";

describe("処理ルート変更時に関係者へ自動通知し承認フローを動的に調整する機能", () => {
  test("法令改正優先度決定で優先度判定基準が不明確な場合、デフォルト優先度が適用される", () => {
    // SCEN-512

    // 優先度判定基準が不明確なケース（緊急度・影響範囲が標準的な場合）
    const result1 = determineLegalChangeProcessingPriority(
      "1ヶ月以内", // 標準的な緊急度
      "特定部署", // 限定的な影響範囲
      ["人事関連書類"], // 非補助金関連
      50 // 標準的な処理負荷
    );

    expect(result1.priority).toBe("通常");
    expect(result1.scheduleDays).toBe(30);
    expect(result1.processingOrder).toBe(3);
    expect(result1.notificationLevel).toBe("通常");

    // 緊急度が低く影響範囲が限定的な場合（低優先度）
    const result2 = determineLegalChangeProcessingPriority(
      "1ヶ月以内",
      "特定業務",
      ["一般事務書類"],
      30
    );

    expect(result2.priority).toBe("低優先");
    expect(result2.scheduleDays).toBe(30);
    expect(result2.processingOrder).toBe(4);
    expect(result2.notificationLevel).toBe("通常");

    // システム処理負荷が高い場合の日数延長
    const result3 = determineLegalChangeProcessingPriority(
      "1週間以内",
      "特定部署",
      ["一般書類"],
      90 // 高負荷
    );

    expect(result3.priority).toBe("高優先");
    expect(result3.scheduleDays).toBe(10.5); // 7 * 1.5
    expect(result3.processingOrder).toBe(2);
    expect(result3.notificationLevel).toBe("重要");
  });
});