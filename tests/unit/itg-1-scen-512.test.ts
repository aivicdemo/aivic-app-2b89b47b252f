import { determineLegalChangeProcessingPriority } from "../../src/logic/it-1-br-1779263788059-2-2-1";

describe("処理ルート変更時に関係者へ自動通知し承認フローを動的に調整する機能", () => {
  test("法令改正優先度決定 - 優先度判定基準が不明確な場合、デフォルト優先度が適用される", () => {
    // SCEN-512

    // 優先度判定基準が不明確なケース1: 不明な緊急度レベル
    expect(() => {
      determineLegalChangeProcessingPriority(
        "不明緊急度",
        "全学",
        ["補助金申請書"],
        50
      );
    }).toThrow("緊急度レベルは「即日対応」「1週間以内」「1ヶ月以内」のいずれかを指定してください");

    // 優先度判定基準が不明確なケース2: 不明な影響範囲
    expect(() => {
      determineLegalChangeProcessingPriority(
        "即日対応",
        "不明範囲",
        ["補助金申請書"],
        50
      );
    }).toThrow("影響範囲は「全学」「特定部署」「特定業務」のいずれかを指定してください");

    // 優先度判定基準が不明確なケース3: 処理負荷が範囲外（101）
    const result1 = determineLegalChangeProcessingPriority(
      "1週間以内",
      "特定部署",
      ["一般事務書類"],
      101
    );

    // 処理負荷レベルが範囲外の場合は100にクランプされ、通常の処理として扱われる
    expect(result1.priority).toBe("通常");
    expect(result1.scheduleDays).toBe(30);
    expect(result1.processingOrder).toBe(3);
    expect(result1.notificationLevel).toBe("通常");

    // 優先度判定基準が不明確なケース4: 処理負荷が範囲外（-1）
    const result2 = determineLegalChangeProcessingPriority(
      "1ヶ月以内",
      "特定業務",
      ["研究費申請書"],
      -1
    );

    // 処理負荷レベルが範囲外の場合は0にクランプされ、通常の処理として扱われる
    expect(result2.priority).toBe("低優先");
    expect(result2.scheduleDays).toBe(30);
    expect(result2.processingOrder).toBe(4);
    expect(result2.notificationLevel).toBe("通常");

    // 正常なケース: 明確な基準でのデフォルト優先度適用
    const result3 = determineLegalChangeProcessingPriority(
      "1ヶ月以内",
      "特定業務", 
      ["一般事務書類"],
      30
    );

    // basePriority = 2（1ヶ月以内）- 1（特定業務）= 1
    // 補助金申請書が含まれていないため +1 なし
    // 処理負荷30なので調整なし
    // priority = 1 → 低優先
    expect(result3.priority).toBe("低優先");
    expect(result3.scheduleDays).toBe(30);
    expect(result3.processingOrder).toBe(4);
    expect(result3.notificationLevel).toBe("通常");
  });
});