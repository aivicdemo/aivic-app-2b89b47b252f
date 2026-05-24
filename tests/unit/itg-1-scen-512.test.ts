import { determineLegalChangeProcessingPriority } from "../../src/logic/it-1-br-1779263788059-2-2-1";

describe("処理ルート変更時に関係者へ自動通知し承認フローを動的に調整する機能", () => {
  test("法令改正優先度決定 - 優先度判定基準が不明確な場合、デフォルト優先度が適用される", () => {
    // SCEN-512

    // 優先度判定基準が不明確な場合（緊急度レベルが指定された3つの選択肢以外の値）
    const result = determineLegalChangeProcessingPriority(
      "不明な緊急度レベル", // 指定外の値
      "特定業務", // 影響範囲
      ["一般申請書"], // 影響を受ける文書種別
      50 // 現在の処理負荷レベル
    );

    // 不正な緊急度レベルが指定された場合はエラーをthrowする
    expect(() => {
      determineLegalChangeProcessingPriority(
        "不明な緊急度レベル",
        "特定業務",
        ["一般申請書"],
        50
      );
    }).toThrow("緊急度レベルは「即日対応」「1週間以内」「1ヶ月以内」のいずれかを指定してください");

    // 影響範囲が指定された3つの選択肢以外の値の場合
    expect(() => {
      determineLegalChangeProcessingPriority(
        "1週間以内",
        "不明な影響範囲",
        ["一般申請書"],
        50
      );
    }).toThrow("影響範囲は「全学」「特定部署」「特定業務」のいずれかを指定してください");

    // 処理負荷レベルが範囲外の場合（負の値）
    const resultNegativeLoad = determineLegalChangeProcessingPriority(
      "1週間以内",
      "特定業務",
      ["一般申請書"],
      -10 // 負の値
    );

    // 負の値は0にクランプされて処理される（基本優先度2、影響範囲で-1、合計1）
    expect(resultNegativeLoad.priority).toBe("低優先");
    expect(resultNegativeLoad.scheduleDays).toBe(30);
    expect(resultNegativeLoad.processingOrder).toBe(4); // 5 - 1 = 4
    expect(resultNegativeLoad.notificationLevel).toBe("通常");

    // 処理負荷レベルが範囲外の場合（100を超える値）
    const resultHighLoad = determineLegalChangeProcessingPriority(
      "1週間以内",
      "特定業務",
      ["一般申請書"],
      120 // 100を超える値
    );

    // 100を超える値は100にクランプされて処理される
    // 基本優先度2、影響範囲で-1、合計1で低優先度、処理負荷が80%超のため日数延長
    expect(resultHighLoad.priority).toBe("低優先");
    expect(resultHighLoad.scheduleDays).toBe(45); // 30 * 1.5 = 45
    expect(resultHighLoad.processingOrder).toBe(4);
    expect(resultHighLoad.notificationLevel).toBe("通常");
  });
});