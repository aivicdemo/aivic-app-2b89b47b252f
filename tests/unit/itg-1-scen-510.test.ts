import { determineLegalChangeProcessingPriority } from "../../src/logic/it-1-br-1779263788059-2-2-1";

describe("処理ルート変更時に関係者へ自動通知し承認フローを動的に調整する機能", () => {
  test("緊急度と影響範囲に基づいて適切な優先順位が決定される", () => {
    // SCEN-510

    // 即日対応 + 全学 + 補助金申請書
    const result1 = determineLegalChangeProcessingPriority(
      "即日対応",
      "全学", 
      ["補助金申請書", "研究費申請書"],
      70
    );
    // basePriority = 4 + 1 + 1 = 6, scheduleDays = 1, processingOrder = -1, notificationLevel = "緊急"
    expect(result1).toEqual({
      priority: "最優先",
      scheduleDays: 1,
      processingOrder: -1,
      notificationLevel: "緊急"
    });

    // 1週間以内 + 特定部署 + 補助金申請書 + 高負荷
    const result2 = determineLegalChangeProcessingPriority(
      "1週間以内",
      "特定部署",
      ["補助金申請書"],
      85
    );
    // basePriority = 3 + 0 + 1 = 4, scheduleDays = 7 * 1.5 = 10.5, processingOrder = 1, notificationLevel = "重要"  
    expect(result2).toEqual({
      priority: "最優先",
      scheduleDays: 10,
      processingOrder: 1,
      notificationLevel: "緊急"
    });

    // 1ヶ月以内 + 特定業務 + 一般書類
    const result3 = determineLegalChangeProcessingPriority(
      "1ヶ月以内",
      "特定業務",
      ["人事関連書類"],
      50
    );
    // basePriority = 2 - 1 + 0 = 1, scheduleDays = 30, processingOrder = 4, notificationLevel = "通常"
    expect(result3).toEqual({
      priority: "低優先",
      scheduleDays: 30,
      processingOrder: 4,
      notificationLevel: "通常"
    });

    // 制約: 緊急度レベルが指定された3つの選択肢以外の値
    expect(() => 
      determineLegalChangeProcessingPriority("超緊急", "全学", ["補助金申請書"], 50)
    ).toThrow("緊急度レベルは「即日対応」「1週間以内」「1ヶ月以内」のいずれかを指定してください");

    // 制約: 影響範囲が指定された3つの選択肢以外の値
    expect(() =>
      determineLegalChangeProcessingPriority("即日対応", "一部のみ", ["補助金申請書"], 50)
    ).toThrow("影響範囲は「全学」「特定部署」「特定業務」のいずれかを指定してください");

    // 制約: 処理負荷レベルが範囲外 - clamp処理
    const result4 = determineLegalChangeProcessingPriority(
      "即日対応",
      "全学",
      ["補助金申請書"],
      150
    );
    expect(result4.priority).toBe("最優先");
  });
});