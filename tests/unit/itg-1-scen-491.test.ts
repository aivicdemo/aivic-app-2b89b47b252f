import { determineDocumentStorageMethod } from "../../src/logic/it-1-br-2-1-1";

describe("申請書類の文書種別を自動判別し補助金関連度に基づいて電子化可否を判定する機能", () => {
  test("保管方式判定条件が不明な場合、最も安全な方式が選択される", () => {
    // SCEN-491
    
    // 入力: 判定条件が不明な状態
    const documentTitle = "不明種別書類"; // 補助金キーワードなし
    const documentContent = "詳細内容が不明確で分類困難な文書"; // 補助金キーワードなし  
    const documentType = "その他"; // 不明な文書種別
    const subsidyKeywords = ["科研費", "運営費交付金", "設備整備費", "補助金"];

    // 実行
    const result = determineDocumentStorageMethod(
      documentTitle,
      documentContent, 
      documentType,
      subsidyKeywords
    );

    // 検証: 判定が不明な場合は最も安全な方式（hybrid）が選択される
    expect(result.documentType).toBe("その他");
    expect(result.processingRoute).toBe("hybrid");
    expect(result.subsidyRelated).toBe(false);
    expect(result.paperStorageRequired).toBe(true);
  });
});