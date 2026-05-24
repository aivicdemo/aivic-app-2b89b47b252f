import { determineDocumentStorageMethod } from "../../src/logic/it-1-br-2-1-1";

describe("申請書類の文書種別を自動判別し補助金関連度に基づいて電子化可否を判定する機能", () => {
  test("文書保管方式選択 - 法令要件に基づいて適切な保管方式が選択される", () => {
    // SCEN-489
    const subsidyKeywords = ["研究費", "設備費", "運営費交付金", "補助金"];

    // 補助金関連書類で紙保管が必要なケース
    const subsidyDoc = {
      documentTitle: "科研費設備購入補助金申請書",
      documentContent: "研究費による設備整備費の申請です。運営費交付金と併用して購入予定です。",
      documentType: "補助金申請書",
      subsidyKeywords: subsidyKeywords
    };

    const subsidyResult = determineDocumentStorageMethod(
      subsidyDoc.documentTitle,
      subsidyDoc.documentContent,
      subsidyDoc.documentType,
      subsidyDoc.subsidyKeywords
    );

    expect(subsidyResult).toEqual({
      documentType: "補助金申請書",
      processingRoute: "hybrid",
      subsidyRelated: true,
      paperStorageRequired: true
    });

    // 一般申請書類で電子のみ処理のケース
    const generalDoc = {
      documentTitle: "会議室予約申請書",
      documentContent: "定期会議のための会議室予約を申請します。",
      documentType: "一般申請",
      subsidyKeywords: subsidyKeywords
    };

    const generalResult = determineDocumentStorageMethod(
      generalDoc.documentTitle,
      generalDoc.documentContent,
      generalDoc.documentType,
      generalDoc.subsidyKeywords
    );

    expect(generalResult).toEqual({
      documentType: "一般申請",
      processingRoute: "electronic",
      subsidyRelated: false,
      paperStorageRequired: false
    });

    // タイトルが空の場合のエラー
    expect(() => {
      determineDocumentStorageMethod(
        "",
        "申請内容",
        "補助金申請書",
        subsidyKeywords
      );
    }).toThrow("申請書類のタイトルが入力されていません。タイトルを入力してください。");

    // 内容が短すぎる場合の警告
    expect(() => {
      determineDocumentStorageMethod(
        "申請書タイトル",
        "短い内容",
        "補助金申請書",
        subsidyKeywords
      );
    }).toThrow("申請内容が短すぎる可能性があります。内容を確認してください。");
  });
});