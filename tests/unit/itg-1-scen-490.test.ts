import { determineDocumentStorageMethod } from "../../src/logic/it-1-br-2-1-1";

describe("申請書類の文書種別を自動判別し補助金関連度に基づいて電子化可否を判定する機能", () => {
  test("ハイブリッド処理必要文書で電子＋紙保管が選択される", () => {
    // SCEN-490
    const documentTitle = "科研費設備整備申請書";
    const documentContent = "文部科学省の科学研究費助成事業における設備整備費補助金を申請します。運営費交付金による研究基盤強化のため、研究機器の整備を目的とした設備整備費の申請を行います。";
    const documentType = "補助金申請書";
    const subsidyKeywords = ["研究費", "設備費", "運営費交付金", "補助金"];

    const result = determineDocumentStorageMethod(documentTitle, documentContent, documentType, subsidyKeywords);

    const score = 0.8;
    const subsidyRelated = score >= 0.7;
    const paperStorageRequired = subsidyRelated && true;
    const processingRoute = paperStorageRequired ? "hybrid" : "electronic";

    expect(result.documentType).toBe("補助金申請書");
    expect(result.processingRoute).toBe("hybrid");
    expect(result.subsidyRelated).toBe(true);
    expect(result.paperStorageRequired).toBe(true);
  });
});