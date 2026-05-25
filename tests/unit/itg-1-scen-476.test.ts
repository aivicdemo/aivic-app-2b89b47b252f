import { determineDigitalizationEligibility } from '../../src/logic/it-1-br-2-1-1';

describe("申請書類の文書種別を自動判別し補助金関連度に基づいて電子化可否を判定する機能", () => {
  // SCEN-476: [edge] 電子化可否判定 - 判定基準が曖昧な文書の場合、安全側の処理ルートが選択される
  test('判定基準が曖昧な文書で安全側の処理ルートが選択される', () => {
    const documentTitle = "研究設備導入に関する検討資料";
    const documentContent = "新しい研究設備の導入について検討する。予算の確保と設置場所の調整が必要である。関連する規定の確認も行う。";
    const documentType = "検討資料";
    const subsidyRelevanceScore = 0.65;

    const result = determineDigitalizationEligibility(
      documentTitle,
      documentContent,
      documentType,
      subsidyRelevanceScore
    );

    expect(result.documentType).toBe("検討資料");
    expect(result.processingRoute).toBe("hybrid");
    expect(result.subsidyRelated).toBe(false);
    expect(result.paperStorageRequired).toBe(false);
  });
});