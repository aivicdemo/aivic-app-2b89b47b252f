import {
  determineLegalChangeProcessingPriority
} from "../../src/logic/it-1-br-1779263788059-2-2-1";

describe("処理ルート変更時に関係者へ自動通知し承認フローを動的に調整する機能", () => {
  test("法令改正優先度決定 - 最高優先度案件に対して適切な対応スケジュールが設定される", () => {
    // SCEN-511
    
    // 即日対応、全学影響、補助金申請書含む、処理負荷90%の場合
    const result1 = determineLegalChangeProcessingPriority(
      "即日対応",
      "全学", 
      ["補助金申請書", "研究費申請書"],
      90
    );
    
    expect(result1.priority).toBe("最優先");
    expect(result1.scheduleDays).toBe(1);
    expect(result1.processingOrder).toBe(1);
    expect(result1.notificationLevel).toBe("緊急");
    
    // 1週間以内、特定部署、一般申請書のみ、処理負荷50%の場合
    const result2 = determineLegalChangeProcessingPriority(
      "1週間以内",
      "特定部署",
      ["一般申請書"],
      50
    );
    
    expect(result2.priority).toBe("高優先");
    expect(result2.scheduleDays).toBe(7);
    expect(result2.processingOrder).toBe(2);
    expect(result2.notificationLevel).toBe("重要");
    
    // 1ヶ月以内、特定業務、処理負荷30%の場合
    const result3 = determineLegalChangeProcessingPriority(
      "1ヶ月以内",
      "特定業務", 
      ["事務手続き書類"],
      30
    );
    
    expect(result3.priority).toBe("通常");
    expect(result3.scheduleDays).toBe(30);
    expect(result3.processingOrder).toBe(3);
    expect(result3.notificationLevel).toBe("通常");
    
    // 緊急度レベルエラー
    expect(() => determineLegalChangeProcessingPriority(
      "2週間以内",
      "全学",
      ["申請書"],
      50
    )).toThrow("緊急度レベルは「即日対応」「1週間以内」「1ヶ月以内」のいずれかを指定してください");
    
    // 影響範囲エラー
    expect(() => determineLegalChangeProcessingPriority(
      "即日対応",
      "一部機能",
      ["申請書"],
      50
    )).toThrow("影響範囲は「全学」「特定部署」「特定業務」のいずれかを指定してください");
    
    // 処理負荷レベル範囲外（下限）
    const resultClampLow = determineLegalChangeProcessingPriority(
      "即日対応",
      "全学",
      ["申請書"],
      -10
    );
    expect(resultClampLow.priority).toBe("最優先");
    
    // 処理負荷レベル範囲外（上限）
    const resultClampHigh = determineLegalChangeProcessingPriority(
      "即日対応", 
      "全学",
      ["申請書"],
      150
    );
    expect(resultClampHigh.priority).toBe("最優先");
  });
});