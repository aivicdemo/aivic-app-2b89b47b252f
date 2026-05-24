import { determineLegalChangeProcessingPriority } from "../../src/logic/it-1-br-1779263788059-2-2-1";

describe("処理ルート変更時に関係者へ自動通知し承認フローを動的に調整する機能", () => {
  test("最高優先度の緊急案件に対して適切な対応スケジュールが設定される", () => {
    // SCEN-511
    
    // 最高優先度（即日対応・全学・補助金関連）の場合
    const result1 = determineLegalChangeProcessingPriority(
      "即日対応",
      "全学",
      ["補助金申請書"],
      75
    );
    
    expect(result1.priority).toBe("最優先");
    expect(result1.scheduleDays).toBe(1);
    expect(result1.processingOrder).toBe(1);
    expect(result1.notificationLevel).toBe("緊急");
    
    // 高優先度（1週間以内・全学・処理負荷低）の場合
    const result2 = determineLegalChangeProcessingPriority(
      "1週間以内",
      "全学",
      ["一般申請書"],
      50
    );
    
    expect(result2.priority).toBe("高優先");
    expect(result2.scheduleDays).toBe(7);
    expect(result2.processingOrder).toBe(2);
    expect(result2.notificationLevel).toBe("重要");
    
    // 処理負荷が高い場合の日数延長
    const result3 = determineLegalChangeProcessingPriority(
      "1ヶ月以内",
      "特定業務",
      ["人事関連書類"],
      85
    );
    
    expect(result3.priority).toBe("低優先");
    expect(result3.scheduleDays).toBe(45); // 30 * 1.5
    expect(result3.processingOrder).toBe(4);
    expect(result3.notificationLevel).toBe("通常");
    
    // 制約：緊急度レベルが不正値の場合
    expect(() => 
      determineLegalChangeProcessingPriority(
        "不正値",
        "全学",
        ["補助金申請書"],
        50
      )
    ).toThrow("緊急度レベルは「即日対応」「1週間以内」「1ヶ月以内」のいずれかを指定してください");
    
    // 制約：影響範囲が不正値の場合  
    expect(() =>
      determineLegalChangeProcessingPriority(
        "即日対応",
        "不正値",
        ["補助金申請書"],
        50
      )
    ).toThrow("影響範囲は「全学」「特定部署」「特定業務」のいずれかを指定してください");
    
    // 制約：処理負荷レベルが範囲外の場合
    const result4 = determineLegalChangeProcessingPriority(
      "即日対応",
      "全学",
      ["補助金申請書"],
      120
    );
    expect(result4.scheduleDays).toBe(1); // 100に補正されて処理
  });
});