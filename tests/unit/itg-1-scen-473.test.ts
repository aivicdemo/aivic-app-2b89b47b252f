import { determineDocumentTypeAndRoute } from "../../src/logic/it-1-br-2-1-1";

describe("申請書類の文書種別を自動判別し補助金関連度に基づいて電子化可否を判定する機能", () => {
  test("判定困難な内容の場合、適切なデフォルト処理が実行される", () => {
    // SCEN-473
    
    // 判定困難な内容（キーワード不足、内容不明確）のケース
    const result1 = determineDocumentTypeAndRoute(
      "申請書類",
      "内容が不明確で判定が困難な書類です",
      "一般"
    );
    
    expect(result1).toEqual({
      documentType: "一般申請",
      processingRoute: "electronic",
      subsidyRelated: false,
      paperStorageRequired: false
    });

    // 空に近い内容でのデフォルト処理
    const result2 = determineDocumentTypeAndRoute(
      "書類のタイトル",
      "内容があまり記載されていない書類について",
      "事務"
    );
    
    expect(result2).toEqual({
      documentType: "事務関連",
      processingRoute: "electronic", 
      subsidyRelated: false,
      paperStorageRequired: false
    });

    // 境界値テスト（補助金関連キーワードが不十分）
    const result3 = determineDocumentTypeAndRoute(
      "研究に関する申請",
      "研究活動に関連する申請書類です。費用について記載します",
      "研究"
    );
    
    expect(result3).toEqual({
      documentType: "研究関連",
      processingRoute: "electronic",
      subsidyRelated: false,
      paperStorageRequired: false
    });

    // 制約違反テスト - タイトルが空
    expect(() => {
      determineDocumentTypeAndRoute("", "内容", "一般");
    }).toThrow("申請書類のタイトルが入力されていません。タイトルを入力してください。");

    // 制約違反テスト - 内容が短すぎる場合（警告）
    const result4 = determineDocumentTypeAndRoute(
      "短い申請書類",
      "短い内容",
      "一般"
    );
    
    expect(result4).toEqual({
      documentType: "一般申請",
      processingRoute: "electronic",
      subsidyRelated: false,
      paperStorageRequired: false
    });
  });
});