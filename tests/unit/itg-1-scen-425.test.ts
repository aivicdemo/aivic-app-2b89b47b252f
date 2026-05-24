import { handleDocumentClassificationException } from "../../src/logic/it-1-br-2-1-1";

describe("申請書類の文書種別を自動判別し補助金関連度に基づいて電子化可否を判定する機能", () => {
  test("判別困難な文書の場合、適切なデフォルトルートが設定される", () => {
    // SCEN-425

    // 自動分類が失敗した場合の例外処理
    const result = handleDocumentClassificationException(
      "特殊な申請書類タイトル",
      "判定困難な内容を含む申請書類の本文で、従来のキーワードでは分類が困難な特殊な文書",
      null,  // 自動分類失敗
      null,  // 職員からの異議なし
      "一般申請書類"  // 事務局長による手動判定結果
    );

    expect(result.finalDocumentType).toBe("一般申請書類");
    expect(result.processingRoute).toBe("electronic");
    expect(result.exceptionReason).toBe("自動分類が失敗したため手動判定に移行");
    expect(result.learningData).toEqual({
      documentTitle: "特殊な申請書類タイトル",
      documentContent: "判定困難な内容を含む申請書類の本文で、従来のキーワードでは分類が困難な特殊な文書",
      finalDocumentType: "一般申請書類",
      exceptionReason: "自動分類が失敗したため手動判定に移行"
    });
  });
});