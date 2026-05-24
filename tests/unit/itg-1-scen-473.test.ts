import { checkMoeComplianceRequirements } from "../../src/logic/it-1-br-2-1-1";

describe("申請書類の文書種別を自動判別し補助金関連度に基づいて電子化可否を判定する機能", () => {
  test("判定困難な内容の場合、適切なデフォルト処理が実行される", () => {
    // SCEN-473
    
    // 判定困難な内容（短すぎるタイトル）のエラーケース
    expect(() => checkMoeComplianceRequirements(
      "短い",
      "申請書類の内容は50文字以上で詳しく記載してください申請書類の内容は50文字以上で詳しく記載してください",
      "一般申請",
      ["補助金", "助成金", "文部科学省", "科研費"]
    )).toThrow("申請書類のタイトルは10文字以上で入力してください");
    
    // 判定困難な内容（短すぎる内容）のエラーケース
    expect(() => checkMoeComplianceRequirements(
      "申請書類のタイトルは10文字以上",
      "短い",
      "一般申請",
      ["補助金", "助成金", "文部科学省", "科研費"]
    )).toThrow("申請書類の内容は50文字以上で入力してください");
    
    // 判定困難な内容（曖昧なキーワード）の正常処理
    const result1 = checkMoeComplianceRequirements(
      "業務改善に関する提案について",
      "当部署における業務効率化のための改善提案を記載いたします。現在の作業フローを見直し、より効率的な運用を目指したいと考えております。",
      "一般申請",
      ["補助金", "助成金", "文部科学省", "科研費"]
    );
    
    // キーワード一致度が60%未満で補助金関連度が低い場合の期待値
    expect(result1).toEqual({
      complianceStatus: "review_required",
      paperStorageRequired: false,
      processingRoute: "electronic",
      riskLevel: "low"
    });
    
    // 部分的にキーワードが含まれる境界ケース
    const result2 = checkMoeComplianceRequirements(
      "研究活動支援のための設備導入申請",
      "研究活動を支援するための新しい設備の導入を申請いたします。この設備により研究の効率化が期待されます。大学の研究環境向上に寄与する重要な投資です。",
      "設備申請",
      ["補助金", "助成金", "文部科学省", "科研費"]
    );
    
    // キーワード一致度が中程度（40-60%）の場合の期待値
    expect(result2).toEqual({
      complianceStatus: "review_required",
      paperStorageRequired: false,
      processingRoute: "electronic",
      riskLevel: "medium"
    });
    
    // 高い一致度だが文書種別が未設定の警告ケース
    expect(() => checkMoeComplianceRequirements(
      "文部科学省科研費補助金申請",
      "文部科学省による科学研究費補助金の申請を行います。この補助金により重要な研究活動を推進し、学術発展に貢献したいと考えております。",
      "",
      ["補助金", "助成金", "文部科学省", "科研費"]
    )).toThrow("書類種別の分類が完了していません。先に文書種別の確認を行ってください。");
  });
});