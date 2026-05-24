import { determineDocumentTypeAndRoute } from "../../src/logic/it-1-br-2-1-1";

describe("申請書類の文書種別を自動判別し補助金関連度に基づいて電子化可否を判定する機能", () => {
  test("申請書類のタイトルと内容から補助金関連度を評価し適切な処理ルートを決定する", () => {
    // SCEN-472
    
    // 補助金関連書類（科研費申請）
    const subsidyResult = determineDocumentTypeAndRoute(
      "令和6年度科学研究費補助金基盤研究A申請書", 
      "本研究は文部科学省科学研究費補助金を活用し、先端的な研究開発を行うものです。運営費交付金と合わせて研究設備の整備を進めます。",
      "工学部"
    );
    
    expect(subsidyResult.isSubsidyRelated).toBe(true);
    expect(subsidyResult.requiresPaperStorage).toBe(true);
    expect(subsidyResult.processingRoute).toBe("hybrid");
    expect(subsidyResult.documentType).toBe("補助金申請書");
    
    // 一般申請書類（電子のみ処理）
    const generalResult = determineDocumentTypeAndRoute(
      "会議室利用申請書",
      "教授会議のため大会議室の利用を申請いたします。開催日時は来月15日午後2時からです。",
      "総務課"
    );
    
    expect(generalResult.isSubsidyRelated).toBe(false);
    expect(generalResult.requiresPaperStorage).toBe(false);
    expect(generalResult.processingRoute).toBe("electronic");
    expect(generalResult.documentType).toBe("一般申請書");
    
    // 境界ケース：研究部署からの微妙な関連度
    const borderlineResult = determineDocumentTypeAndRoute(
      "研究室設備購入申請書",
      "研究室の設備購入に関する申請です。予算は大学の研究費から支出予定です。",
      "理学部"
    );
    
    expect(borderlineResult.isSubsidyRelated).toBe(true);
    expect(borderlineResult.requiresPaperStorage).toBe(false);
    expect(borderlineResult.processingRoute).toBe("electronic");
    expect(borderlineResult.documentType).toBe("研究関連書類");
    
    // エラーケース
    expect(() => determineDocumentTypeAndRoute("", "申請内容", "工学部"))
      .toThrow("申請書類のタイトルを入力してください");
      
    expect(() => determineDocumentTypeAndRoute("申請書", "", "工学部"))
      .toThrow("申請書類の内容は10文字以上で入力してください");
      
    expect(() => determineDocumentTypeAndRoute("申請書", "申請内容です", ""))
      .toThrow("申請者の所属部署を選択してください");
  });
});