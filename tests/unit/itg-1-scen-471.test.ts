import { determineDocumentTypeAndRoute } from "../../src/logic/it-1-br-2-1-1";

describe("申請書類の文書種別を自動判別し補助金関連度に基づいて電子化可否を判定する機能", () => {
  test("文書種別自動判定 - 申請書類の内容から文書種別が正しく判定される", () => {
    // SCEN-471
    
    // 補助金関連書類（科研費申請）のテスト
    const subsidyResult = determineDocumentTypeAndRoute(
      "令和6年度科学研究費助成事業申請書",
      "本研究では文部科学省の科研費を活用して先端技術研究を推進します。運営費交付金との連携により効率的な研究体制を構築し、設備整備費も含めた総合的な研究計画を策定しております。",
      "総務課"
    );
    
    expect(subsidyResult.documentType).toBe("補助金申請");
    expect(subsidyResult.processingRoute).toBe("hybrid");
    expect(subsidyResult.subsidyRelated).toBe(true);
    expect(subsidyResult.paperStorageRequired).toBe(true);
    
    // 一般申請書類のテスト
    const generalResult = determineDocumentTypeAndRoute(
      "職員研修参加申請書",
      "来月開催される業務効率化研修への参加を希望いたします。研修内容はプロジェクト管理手法とコミュニケーション改善に関するものです。",
      "人事課"
    );
    
    expect(generalResult.documentType).toBe("一般申請");
    expect(generalResult.processingRoute).toBe("electronic");
    expect(generalResult.subsidyRelated).toBe(false);
    expect(generalResult.paperStorageRequired).toBe(false);
    
    // 研究部署からの補助金関連書類（閾値0.6適用）のテスト
    const researchResult = determineDocumentTypeAndRoute(
      "研究設備導入申請書",
      "文部科学省の補助金制度を活用した研究機器の導入計画書です。運営費交付金との併用により効果的な研究環境整備を目指します。",
      "研究推進課"
    );
    
    expect(researchResult.documentType).toBe("補助金申請");
    expect(researchResult.processingRoute).toBe("hybrid");
    expect(researchResult.subsidyRelated).toBe(true);
    expect(researchResult.paperStorageRequired).toBe(true);
    
    // エラーケースのテスト
    expect(() => determineDocumentTypeAndRoute(
      "短い",
      "申請内容",
      "総務課"
    )).toThrow("申請書類のタイトルは10文字以上で入力してください");
    
    expect(() => determineDocumentTypeAndRoute(
      "適切な長さの申請書タイトル",
      "短い",
      "総務課"
    )).toThrow("申請書類の内容は50文字以上で入力してください");
    
    expect(() => determineDocumentTypeAndRoute(
      "適切な長さの申請書タイトル",
      "十分な長さの申請内容です。この内容は50文字以上の要件を満たすために追加された文章です。",
      ""
    )).toThrow("申請者の所属部署を選択してください");
  });
});