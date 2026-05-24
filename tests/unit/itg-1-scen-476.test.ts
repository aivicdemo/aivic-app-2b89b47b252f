import { checkMoeComplianceRequirements } from "../../src/logic/it-1-br-2-1-1";

describe("申請書類の文書種別を自動判別し補助金関連度に基づいて電子化可否を判定する機能", () => {
  test("判定基準が曖昧な文書の場合、安全側の処理ルートが選択される", () => {
    // SCEN-476
    
    // 判定基準が曖昧なケース1: 補助金関連度スコア0.6で境界付近
    const ambiguousDoc1Result = checkMoeComplianceRequirements(
      "研究設備購入に関する申請", // 微妙に補助金関連
      "当研究室では新しい分析装置の導入を検討しており、研究の質向上のため設備購入を希望します。", // キーワード含有度が微妙
      "設備導入申請書",
      ["補助金", "助成金", "文部科学省", "科研費", "運営費交付金", "設備整備費"]
    );
    
    expect(ambiguousDoc1Result.complianceStatus).toBe("review_required");
    expect(ambiguousDoc1Result.paperStorageRequired).toBe(true);
    expect(ambiguousDoc1Result.processingRoute).toBe("hybrid");
    expect(ambiguousDoc1Result.riskLevel).toBe("medium");
    
    // 判定基準が曖昧なケース2: 補助金関連度スコア0.4で低めだが文部科学省関連用語が散在
    const ambiguousDoc2Result = checkMoeComplianceRequirements(
      "教育環境改善に関する提案書",
      "大学教育の質向上に向けて、新しい教育手法の導入と環境整備について検討したいと思います。",
      "教育改善提案書",
      ["補助金", "助成金", "文部科学省", "科研費", "運営費交付金", "設備整備費"]
    );
    
    expect(ambiguousDoc2Result.complianceStatus).toBe("review_required");
    expect(ambiguousDoc2Result.paperStorageRequired).toBe(false);
    expect(ambiguousDoc2Result.processingRoute).toBe("electronic");
    expect(ambiguousDoc2Result.riskLevel).toBe("low");
    
    // 判定基準が曖昧なケース3: 補助金関連度スコア0.8で高いが文書種別が不明確
    const ambiguousDoc3Result = checkMoeComplianceRequirements(
      "科研費研究プロジェクト運営費交付金申請に関する補助金資料",
      "本研究プロジェクトの運営にあたり、文部科学省からの科研費助成金および運営費交付金の申請手続きを進めたいと考えております。",
      "その他書類",
      ["補助金", "助成金", "文部科学省", "科研費", "運営費交付金", "設備整備費"]
    );
    
    expect(ambiguousDoc3Result.complianceStatus).toBe("compliant");
    expect(ambiguousDoc3Result.paperStorageRequired).toBe(false);
    expect(ambiguousDoc3Result.processingRoute).toBe("electronic");
    expect(ambiguousDoc3Result.riskLevel).toBe("high");
  });
});