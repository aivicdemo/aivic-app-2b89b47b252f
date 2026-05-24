import { determineDocumentStorageMethod } from "../../src/logic/it-1-br-2-1-1";

describe("申請書類の文書種別を自動判別し補助金関連度に基づいて電子化可否を判定する機能", () => {
  test("文書保管方式選択 - 法令要件に基づいて適切な保管方式が選択される", () => {
    // SCEN-489
    
    // 補助金関連書類で紙保管が必要なケース
    const result1 = determineDocumentStorageMethod(
      "文部科学省科学研究費助成事業実績報告書",
      "本研究では科研費補助金を活用し、運営費交付金と合わせて設備整備費の執行を行いました。",
      "補助金申請書",
      ["科研費", "運営費交付金", "設備整備費", "補助金", "助成金"]
    );
    
    expect(result1).toEqual({
      documentType: "補助金申請書",
      processingRoute: "hybrid",
      subsidyRelated: true,
      paperStorageRequired: true
    });

    // 一般申請書類で電子のみ処理のケース
    const result2 = determineDocumentStorageMethod(
      "備品購入申請書",
      "教室用机・椅子の購入を申請いたします。数量は机20台、椅子40脚です。",
      "一般申請",
      ["科研費", "運営費交付金", "設備整備費", "補助金", "助成金"]
    );
    
    expect(result2).toEqual({
      documentType: "一般申請",
      processingRoute: "electronic",
      subsidyRelated: false,
      paperStorageRequired: false
    });

    // 補助金関連だが文部科学省要件に該当しないケース
    const result3 = determineDocumentStorageMethod(
      "研究費使用に関する問い合わせ",
      "科研費の使用方法について確認したい事項があります。補助金の適切な執行について教えてください。",
      "問い合わせ文書",
      ["科研費", "運営費交付金", "設備整備費", "補助金", "助成金"]
    );
    
    expect(result3).toEqual({
      documentType: "問い合わせ文書",
      processingRoute: "electronic",
      subsidyRelated: true,
      paperStorageRequired: false
    });

    // エラーケース: タイトルが空の場合
    expect(() => determineDocumentStorageMethod(
      "",
      "申請内容",
      "申請書",
      ["補助金"]
    )).toThrow("申請書類のタイトルが入力されていません。タイトルを入力してください。");

    // 警告ケース: 内容が短すぎる場合
    console.warn = jest.fn();
    const result4 = determineDocumentStorageMethod(
      "短い申請書",
      "短い内容",
      "申請書",
      ["補助金"]
    );
    
    expect(console.warn).toHaveBeenCalledWith("申請内容が短すぎる可能性があります。内容を確認してください。");
  });
});