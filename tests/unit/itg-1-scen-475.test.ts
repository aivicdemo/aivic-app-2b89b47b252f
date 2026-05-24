import { determineDigitalizationEligibility } from "../../src/logic/it-1-br-2-1-1";

describe("申請書類の文書種別を自動判別し補助金関連度に基づいて電子化可否を判定する機能", () => {
  test("非補助金文書で電子のみ処理が選択される", () => {
    // SCEN-475
    const documentTitle = "物品購入申請書";
    const documentContent = "事務用品として机・椅子・プリンター用紙等の購入を申請します。予算は50万円です。";
    const documentType = "物品購入申請書";
    const subsidyRelevanceScore = 0.3;

    const result = determineDigitalizationEligibility(
      documentTitle,
      documentContent,
      documentType,
      subsidyRelevanceScore
    );

    expect(result.documentType).toBe("物品購入申請書");
    expect(result.processingRoute).toBe("electronic");
    expect(result.subsidyRelated).toBe(false);
    expect(result.paperStorageRequired).toBe(false);
  });
});