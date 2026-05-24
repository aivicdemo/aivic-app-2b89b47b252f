import { classifyDocumentTypeAndRoute } from "../../src/logic/it-1-br-2-1-1";

describe("申請書類の文書種別を自動判別し補助金関連度に基づいて電子化可否を判定する機能", () => {
  test("申請書類の文書種別を自動判別し、補助金関連度に基づいて電子化可否を判定する", () => {
    // SCEN-472
    
    // 補助金関連書類（科研費申請）の場合
    const result1 = classifyDocumentTypeAndRoute(
      "令和6年度科学研究費補助金基盤研究(B)申請書",
      "本研究は文部科学省の科学研究費補助金を活用して実施する基盤研究です。運営費交付金と合わせて研究設備の整備を行います。",
      "研究科事務室"
    );
    
    expect(result1.subsidyRelated).toBe(true);
    expect(result1.paperStorageRequired).toBe(true);
    expect(result1.processingRoute).toBe("hybrid");
    expect(result1.documentType).toBe("補助金申請書");
    
    // 一般申請書類（補助金関連度70%未満）の場合
    const result2 = classifyDocumentTypeAndRoute(
      "令和6年度出張申請書",
      "学会発表のための出張申請です。交通費と宿泊費の支給をお願いします。",
      "総務課"
    );
    
    expect(result2.subsidyRelated).toBe(false);
    expect(result2.paperStorageRequired).toBe(false);
    expect(result2.processingRoute).toBe("electronic");
    expect(result2.documentType).toBe("一般申請書");
    
    // 申請書類のタイトルが空の場合のエラー
    expect(() => {
      classifyDocumentTypeAndRoute(
        "",
        "申請内容です",
        "研究科事務室"
      );
    }).toThrow("申請書類のタイトルは10文字以上で入力してください");
    
    // 申請書類の内容が50文字未満の場合のエラー
    expect(() => {
      classifyDocumentTypeAndRoute(
        "補助金申請書タイトル",
        "短い内容",
        "研究科事務室"
      );
    }).toThrow("申請書類の内容は50文字以上で入力してください");
    
    // 所属部署が未選択の場合のエラー
    expect(() => {
      classifyDocumentTypeAndRoute(
        "補助金申請書タイトル",
        "この申請は文部科学省の科研費補助金に関する申請書類です。詳細な研究計画と予算計画を記載しています。",
        ""
      );
    }).toThrow("所属部署を選択してください");
  });
});