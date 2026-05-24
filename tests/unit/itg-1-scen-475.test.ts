import { determineDigitalizationEligibility } from "../../src/logic/it-1-br-2-1-1";

describe("申請書類の文書種別を自動判別し補助金関連度に基づいて電子化可否を判定する機能", () => {
  test("SCEN-475: 非補助金文書で電子のみ処理が選択される", () => {
    // 非補助金関連の一般申請書類
    const documentTitle = "会議室予約申請書";
    const documentContent = "来月の定例会議のため会議室Aの予約を申請します。参加者は10名予定で、プロジェクターとホワイトボードを使用します。";
    const documentType = "一般申請";
    const subsidyRelevanceScore = 0.2; // 70未満なので非補助金関連

    const result = determineDigitalizationEligibility(
      documentTitle,
      documentContent,
      documentType,
      subsidyRelevanceScore
    );

    expect(result.documentType).toBe("一般申請");
    expect(result.processingRoute).toBe("electronic");
    expect(result.subsidyRelated).toBe(false);
    expect(result.paperStorageRequired).toBe(false);
  });
});