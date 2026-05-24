import { checkMoeComplianceRequirements } from "../../src/logic/it-1-br-2-1-1";

describe("申請書類の文書種別を自動判別し補助金関連度に基づいて電子化可否を判定する機能", () => {
  test("判定困難な内容の場合、適切なデフォルト処理が実行される", () => {
    // SCEN-473

    // 判定困難なケース1: 曖昧なタイトルと内容
    const result1 = checkMoeComplianceRequirements(
      "研究活動に関する申請書",
      "研究活動の推進に関する内容です。詳細については別途検討いたします。",
      "一般申請書",
      ["補助金", "助成金", "文部科学省", "科研費", "運営費交付金"]
    );
    
    expect(result1.complianceStatus).toBe("review_required");
    expect(result1.paperStorageRequired).toBe(false);
    expect(result1.processingRoute).toBe("electronic");
    expect(result1.riskLevel).toBe("medium");

    // 判定困難なケース2: 短い内容で情報不足
    const result2 = checkMoeComplianceRequirements(
      "申請について",
      "申請内容の詳細は以下の通りです。",
      "その他",
      ["補助金", "助成金", "文部科学省", "科研費", "運営費交付金"]
    );

    expect(result2.complianceStatus).toBe("review_required");
    expect(result2.paperStorageRequired).toBe(false);
    expect(result2.processingRoute).toBe("electronic");
    expect(result2.riskLevel).toBe("low");

    // 判定困難なケース3: 専門用語が多く判定が曖昧
    const result3 = checkMoeComplianceRequirements(
      "産学連携による研究開発プロジェクト申請",
      "産学連携による新技術開発プロジェクトの実施に関する申請書類です。イノベーション創出を目指します。",
      "研究申請書", 
      ["補助金", "助成金", "文部科学省", "科研費", "運営費交付金"]
    );

    expect(result3.complianceStatus).toBe("review_required");
    expect(result3.paperStorageRequired).toBe(false);
    expect(result3.processingRoute).toBe("electronic");
    expect(result3.riskLevel).toBe("medium");
  });
});