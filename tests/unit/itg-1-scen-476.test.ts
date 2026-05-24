import { checkMoeComplianceRequirements } from "../../src/logic/it-1-br-2-1-1";

describe("申請書類の文書種別を自動判別し補助金関連度に基づいて電子化可否を判定する機能", () => {
  test("判定基準が曖昧な文書の場合、安全側の処理ルートが選択される", () => {
    // SCEN-476
    
    // 判定基準が曖昧なケース: キーワード関連度が60%で閾値ボーダーライン、研究部署所属
    const ambiguousResult = checkMoeComplianceRequirements(
      "研究設備の更新に関する申請について",
      "研究室の実験装置更新に関する予算申請です。老朽化した機器の交換を検討しています。",
      "設備申請書",
      ["補助金", "助成金", "文部科学省", "科研費", "運営費交付金"]
    );

    // 研究部署は閾値が60%に下がるため補助金関連と判定され、安全側の処理ルート選択
    expect(ambiguousResult.complianceStatus).toBe("compliant");
    expect(ambiguousResult.paperStorageRequired).toBe(true);
    expect(ambiguousResult.processingRoute).toBe("hybrid");
    expect(ambiguousResult.riskLevel).toBe("medium");

    // より曖昧なケース: キーワード関連度が低く、一般部署
    const veryAmbiguousResult = checkMoeComplianceRequirements(
      "事務用品購入申請",
      "文房具や事務機器の購入を希望します。予算は適切に管理します。",
      "物品購入申請書",
      ["補助金", "助成金", "文部科学省", "科研費", "運営費交付金"]
    );

    // 関連度が低い場合でも安全側判定で要確認とする
    expect(veryAmbiguousResult.complianceStatus).toBe("review_required");
    expect(veryAmbiguousResult.paperStorageRequired).toBe(false);
    expect(veryAmbiguousResult.processingRoute).toBe("electronic");
    expect(veryAmbiguousResult.riskLevel).toBe("low");

    // 境界線上のキーワード含有率での安全側判定
    const borderlineResult = checkMoeComplianceRequirements(
      "教育研究費に関する申請書類",
      "教育活動の質向上のための予算申請です。学生指導に必要な経費として申請いたします。",
      "予算申請書",
      ["補助金", "助成金", "文部科学省", "科研費", "運営費交付金"]
    );

    expect(borderlineResult.complianceStatus).toBe("compliant");
    expect(borderlineResult.paperStorageRequired).toBe(true);
    expect(borderlineResult.processingRoute).toBe("hybrid");
    expect(borderlineResult.riskLevel).toBe("high");
  });
});