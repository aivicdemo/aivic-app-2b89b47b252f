import { checkMoeComplianceRequirements } from "../../src/logic/it-1-br-2-1-1";

describe("申請書類の文書種別を自動判別し補助金関連度に基づいて電子化可否を判定する機能", () => {
  test("判別困難な文書の場合、適切なデフォルトルートが設定される", () => {
    // SCEN-425
    
    // 判別困難な文書（キーワードが少ない）
    const result1 = checkMoeComplianceRequirements(
      "会議資料",
      "定期会議用の資料です。",
      "一般文書",
      ["補助金", "助成金", "文部科学省", "科研費", "運営費交付金"]
    );
    
    expect(result1.complianceStatus).toBe("review_required");
    expect(result1.paperStorageRequired).toBe(false);
    expect(result1.processingRoute).toBe("electronic");
    expect(result1.riskLevel).toBe("low");
    
    // タイトルのみ関連キーワードがある場合
    const result2 = checkMoeComplianceRequirements(
      "補助金関連資料",
      "一般的な資料",
      "未分類",
      ["補助金", "助成金", "文部科学省", "科研費", "運営費交付金"]
    );
    
    expect(result2.complianceStatus).toBe("compliant");
    expect(result2.paperStorageRequired).toBe(false);
    expect(result2.processingRoute).toBe("electronic");
    expect(result2.riskLevel).toBe("medium");
    
    // 内容のみ関連キーワードがある場合
    const result3 = checkMoeComplianceRequirements(
      "資料",
      "文部科学省の運営費交付金について記載された文書です。",
      "申請書",
      ["補助金", "助成金", "文部科学省", "科研費", "運営費交付金"]
    );
    
    expect(result3.complianceStatus).toBe("compliant");
    expect(result3.paperStorageRequired).toBe(true);
    expect(result3.processingRoute).toBe("hybrid");
    expect(result3.riskLevel).toBe("high");
    
    // 空のタイトルでエラーが発生する場合
    expect(() => {
      checkMoeComplianceRequirements(
        "",
        "内容がある",
        "申請書",
        ["補助金"]
      );
    }).toThrow("申請書類のタイトルが入力されていません。法令要件の判定ができません。");
    
    // 短すぎる内容で警告が出る場合
    const result4 = checkMoeComplianceRequirements(
      "短いタイトル",
      "短い",
      "申請書",
      ["補助金", "助成金", "文部科学省", "科研費", "運営費交付金"]
    );
    
    expect(result4.complianceStatus).toBe("review_required");
    expect(result4.paperStorageRequired).toBe(false);
    expect(result4.processingRoute).toBe("electronic");
    expect(result4.riskLevel).toBe("low");
    
    // 未分類の文書種別でエラーが発生する場合
    expect(() => {
      checkMoeComplianceRequirements(
        "適切なタイトル",
        "適切な内容があります。文部科学省の補助金について詳しく記載されています。",
        "",
        ["補助金"]
      );
    }).toThrow("書類種別の分類が完了していません。先に文書種別の確認を行ってください。");
  });
});