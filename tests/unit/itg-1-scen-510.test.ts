import { determineLegalChangeProcessingPriority } from "../../src/logic/it-1-br-1779263788059-2-2-1";

describe("処理ルート変更時に関係者へ自動通知し承認フローを動的に調整する機能", () => {
  test("緊急度と影響範囲に基づいて適切な優先順位が決定される", () => {
    // SCEN-510

    // 即日対応・全学・補助金関連・処理負荷80%の場合（最高優先度）
    const result1 = determineLegalChangeProcessingPriority(
      "即日対応",
      "全学",
      ["補助金申請書", "一般申請書"],
      85
    );
    expect(result1.priority).toBe("最優先");
    expect(result1.scheduleDays).toBe(1);
    expect(result1.processingOrder).toBe(1);
    expect(result1.notificationLevel).toBe("緊急");

    // 1週間以内・特定部署・補助金関連なし・処理負荷60%の場合（高優先度）
    const result2 = determineLegalChangeProcessingPriority(
      "1週間以内",
      "特定部署",
      ["人事関連書類"],
      60
    );
    expect(result2.priority).toBe("高優先");
    expect(result2.scheduleDays).toBe(7);
    expect(result2.processingOrder).toBe(2);
    expect(result2.notificationLevel).toBe("重要");

    // 1ヶ月以内・特定業務・補助金関連・処理負荷90%の場合（通常優先度、負荷高のため延長）
    const result3 = determineLegalChangeProcessingPriority(
      "1ヶ月以内",
      "特定業務",
      ["補助金申請書"],
      90
    );
    expect(result3.priority).toBe("通常");
    expect(result3.scheduleDays).toBe(45); // 30 * 1.5
    expect(result3.processingOrder).toBe(3);
    expect(result3.notificationLevel).toBe("通常");

    // 1ヶ月以内・特定業務・補助金関連なし・処理負荷50%の場合（低優先度）
    const result4 = determineLegalChangeProcessingPriority(
      "1ヶ月以内",
      "特定業務",
      ["一般事務書類"],
      50
    );
    expect(result4.priority).toBe("低優先");
    expect(result4.scheduleDays).toBe(30);
    expect(result4.processingOrder).toBe(4);
    expect(result4.notificationLevel).toBe("通常");

    // エラーケース：無効な緊急度レベル
    expect(() => determineLegalChangeProcessingPriority(
      "無効なレベル",
      "全学",
      ["補助金申請書"],
      50
    )).toThrow("緊急度レベルは「即日対応」「1週間以内」「1ヶ月以内」のいずれかを指定してください");

    // エラーケース：無効な影響範囲
    expect(() => determineLegalChangeProcessingPriority(
      "即日対応",
      "無効な範囲",
      ["補助金申請書"],
      50
    )).toThrow("影響範囲は「全学」「特定部署」「特定業務」のいずれかを指定してください");

    // エラーケース：処理負荷レベルが範囲外（負の値）
    const result5 = determineLegalChangeProcessingPriority(
      "即日対応",
      "全学",
      ["補助金申請書"],
      -10
    );
    expect(result5.priority).toBe("最優先");
    expect(result5.scheduleDays).toBe(1);

    // エラーケース：処理負荷レベルが範囲外（100超過）
    const result6 = determineLegalChangeProcessingPriority(
      "即日対応",
      "全学",
      ["補助金申請書"],
      150
    );
    expect(result6.priority).toBe("最優先");
    expect(result6.scheduleDays).toBe(1);
  });
});