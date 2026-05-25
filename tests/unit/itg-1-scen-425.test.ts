import {
  classifyDocumentTypeAndRoute,
  checkMoeComplianceRequirements,
  handleDocumentClassificationException
} from '../../src/logic/it-1-br-2-1-1';

describe("申請書類の文書種別を自動判別し補助金関連度に基づいて電子化可否を判定する機能", () => {
  test("文書種別自動判別 - 判別困難な文書の場合、適切なデフォルトルートが設定される", () => {
    // SCEN-425
    
    // 判別困難な文書のテスト（キーワードマッチが閾値未満）
    const ambiguousTitle = "研究に関する資料";
    const ambiguousContent = "今後の研究について検討する資料です。詳細は後日連絡いたします。";
    const departmentName = "総務課";
    
    const result = classifyDocumentTypeAndRoute(
      ambiguousTitle,
      ambiguousContent,
      departmentName
    );
    
    // キーワードマッチが0.7未満の場合のデフォルト処理
    expect(result.documentType).toBe("一般申請");
    expect(result.processingRoute).toBe("electronic");
    expect(result.subsidyRelated).toBe(false);
    expect(result.paperStorageRequired).toBe(false);
    
    // 境界値テスト - キーワードが全く含まれない場合
    const noKeywordTitle = "会議室予約について";
    const noKeywordContent = "来月の会議室予約をお願いします。";
    
    const noKeywordResult = classifyDocumentTypeAndRoute(
      noKeywordTitle,
      noKeywordContent,
      departmentName
    );
    
    expect(noKeywordResult.subsidyRelated).toBe(false);
    expect(noKeywordResult.processingRoute).toBe("electronic");
    
    // 例外処理テスト - 自動判別失敗時の手動処理
    const complexTitle = "複合的な申請書類";
    const complexContent = "複数の要素を含む複雑な申請内容";
    const staffObjection = "システムの自動判別結果に異議があります";
    const managerDecision = "補助金申請書";
    
    const exceptionResult = handleDocumentClassificationException(
      complexTitle,
      complexContent,
      null, // 自動分類失敗
      staffObjection,
      managerDecision
    );
    
    expect(exceptionResult.finalDocumentType).toBe("補助金申請書");
    expect(exceptionResult.processingRoute).toBe("hybrid");
    expect(exceptionResult.exceptionReason).toContain("自動分類失敗");
    expect(exceptionResult.learningData).toBeDefined();
    
    // 制約違反テスト - タイトル不足
    expect(() => {
      classifyDocumentTypeAndRoute(
        "短い", // 10文字未満
        "申請書類の内容は50文字以上で入力してください申請書類の内容は50文字以上で入力してください",
        departmentName
      );
    }).toThrow("申請書類のタイトルは10文字以上で入力してください");
    
    // 制約違反テスト - 内容不足
    expect(() => {
      classifyDocumentTypeAndRoute(
        "十分な長さの申請書類タイトル",
        "短い", // 50文字未満
        departmentName
      );
    }).toThrow("申請書類の内容は50文字以上で入力してください");
    
    // 制約違反テスト - 部署未選択
    expect(() => {
      classifyDocumentTypeAndRoute(
        "十分な長さの申請書類タイトル",
        "申請書類の内容は50文字以上で入力してください申請書類の内容は50文字以上で入力してください",
        ""
      );
    }).toThrow("所属部署を選択してください");
  });
});