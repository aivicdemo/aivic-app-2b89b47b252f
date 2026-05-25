import { determineDocumentStorageMethod } from '../../src/logic/it-1-br-2-1-1';

describe("申請書類の文書種別を自動判別し補助金関連度に基づいて電子化可否を判定する機能", () => {
  test("文書保管方式選択 - ハイブリッド処理必要文書で電子＋紙保管が選択される", () => {
    // SCEN-490
    
    // 補助金関連キーワードを70%以上含む申請書類
    const documentTitle = "科研費基盤研究申請書 運営費交付金設備整備費申請";
    const documentContent = "科学研究費補助金による基盤研究の申請を行います。運営費交付金及び設備整備費を活用した研究体制の構築を目指し、文部科学省の研究推進施策に沿った内容で申請いたします。補助金の適正な執行と研究成果の最大化を図ります。";
    const documentType = "補助金申請書";
    const subsidyKeywords = ["科研費", "運営費交付金", "設備整備費", "補助金"];
    
    const result = determineDocumentStorageMethod(
      documentTitle,
      documentContent, 
      documentType,
      subsidyKeywords
    );
    
    // 補助金関連度スコアが70%以上なので補助金関連と判定
    expect(result.subsidyRelated).toBe(true);
    
    // 補助金関連かつ文部科学省要件該当文書なので紙保管必須
    expect(result.paperStorageRequired).toBe(true);
    
    // 紙保管必要なのでハイブリッド処理ルート
    expect(result.processingRoute).toBe("hybrid");
    
    // 文書種別は入力値のまま確定
    expect(result.documentType).toBe("補助金申請書");
  });
});