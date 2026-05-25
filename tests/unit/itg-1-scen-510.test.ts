import { determineLegalChangeProcessingPriority } from "../../src/logic/it-1-br-1779263788059-2-2-1";

describe("処理ルート変更時に関係者へ自動通知し承認フローを動的に調整する機能", () => {
  test("SCEN-510: [normal] 法令改正優先度決定 - 緊急度と影響範囲に基づいて適切な優先順位が決定される", () => {
    // 即日対応 + 全学 + 補助金申請書含む + 処理負荷80%以下 = 最優先
    const result1 = determineLegalChangeProcessingPriority(
      "即日対応",
      "全学",
      ["補助金申請書", "一般申請書"],
      70
    );
    
    expect(result1.priority).toBe("最優先");
    expect(result1.scheduleDays).toBe(1);
    expect(result1.processingOrder).toBe(1);
    expect(result1.notificationLevel).toBe("緊急");

    // 1週間以内 + 特定部署 + 補助金申請書なし + 処理負荷80%以下 = 通常
    const result2 = determineLegalChangeProcessingPriority(
      "1週間以内",
      "特定部署",
      ["一般申請書", "人事関連書類"],
      60
    );
    
    expect(result2.priority).toBe("通常");
    expect(result2.scheduleDays).toBe(7);
    expect(result2.processingOrder).toBe(3);
    expect(result2.notificationLevel).toBe("通常");

    // 1ヶ月以内 + 特定業務 + 処理負荷90%超 = 低優先（スケジュール延長）
    const result3 = determineLegalChangeProcessingPriority(
      "1ヶ月以内",
      "特定業務",
      ["設備申請書"],
      90
    );
    
    expect(result3.priority).toBe("低優先");
    expect(result3.scheduleDays).toBe(45); // 30 * 1.5
    expect(result3.processingOrder).toBe(4);
    expect(result3.notificationLevel).toBe("通常");

    // 1週間以内 + 全学 + 補助金申請書含む + 処理負荷85%超 = 高優先（負荷調整あり）
    const result4 = determineLegalChangeProcessingPriority(
      "1週間以内",
      "全学",
      ["補助金申請書"],
      85
    );
    
    expect(result4.priority).toBe("高優先");
    expect(result4.scheduleDays).toBe(10.5); // 7 * 1.5
    expect(result4.processingOrder).toBe(2);
    expect(result4.notificationLevel).toBe("重要");

    // 境界値テスト：緊急度レベル不正
    expect(() => {
      determineLegalChangeProcessingPriority(
        "無効な緊急度",
        "全学",
        ["補助金申請書"],
        70
      );
    }).toThrow("緊急度レベルは「即日対応」「1週間以内」「1ヶ月以内」のいずれかを指定してください");

    // 境界値テスト：影響範囲不正
    expect(() => {
      determineLegalChangeProcessingPriority(
        "1週間以内",
        "無効な範囲",
        ["補助金申請書"],
        70
      );
    }).toThrow("影響範囲は「全学」「特定部署」「特定業務」のいずれかを指定してください");

    // 境界値テスト：処理負荷レベル範囲外
    const result5 = determineLegalChangeProcessingPriority(
      "1週間以内",
      "全学",
      ["補助金申請書"],
      150
    );
    
    expect(result5.priority).toBe("高優先");
    expect(result5.scheduleDays).toBe(7);
  });
});