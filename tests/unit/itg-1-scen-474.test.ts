import { determineDigitalizationEligibility } from '../../src/logic/it-1-br-2-1-1';

describe("申請書類の文書種別を自動判別し補助金関連度に基づいて電子化可否を判定する機能", () => {
  test("電子化可否判定 - 補助金関連文書でハイブリッド処理が選択される", () => {
    // SCEN-474
    const documentTitle = "令和6年度科研費基盤研究申請書類";
    const documentContent = "文部科学省科学研究費助成事業における基盤研究（B）の申請に関する書類です。研究期間は令和6年4月から令和9年3月までの3年間を予定しており、研究費総額は800万円を申請いたします。";
    const documentType = "補助金申請書";
    const subsidyRelevanceScore = 0.85;

    const result = determineDigitalizationEligibility(
      documentTitle,
      documentContent,
      documentType,
      subsidyRelevanceScore
    );

    expect(result.documentType).toBe("補助金申請書");
    expect(result.processingRoute).toBe("hybrid");
    expect(result.subsidyRelated).toBe(true);
    expect(result.paperStorageRequired).toBe(true);
  });
});