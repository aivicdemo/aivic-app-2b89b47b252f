import { classifyDocumentTypeAndRoute } from '../../src/logic/it-1-br-2-1-1';

describe("申請書類の文書種別を自動判別し補助金関連度に基づいて電子化可否を判定する機能", () => {
  test("非補助金関連文書の場合、電子のみ処理ルートが設定される", () => {
    // SCEN-424
    
    // 補助金関連キーワードを含まない一般的な申請書類
    const documentTitle = "設備購入申請書";
    const documentContent = "研究室で使用するパソコンとプリンターの購入を申請いたします。業務効率向上のために必要な設備です。";
    const applicantDepartment = "工学部";
    
    // 期待値計算: キーワードスコア < 0.7 のため補助金関連ではない
    // 補助金関連でないため紙保管不要、電子のみ処理ルート
    const expected = {
      documentType: "一般申請",
      processingRoute: "electronic",
      subsidyRelated: false,
      paperStorageRequired: false
    };
    
    const result = classifyDocumentTypeAndRoute(
      documentTitle,
      documentContent,
      applicantDepartment
    );
    
    expect(result).toEqual(expected);
  });
});