import { checkMoeComplianceRequirements } from "../../src/logic/it-1-br-2-1-1";

describe("申請書類の文書種別を自動判別し補助金関連度に基づいて電子化可否を判定する機能", () => {
  test("判定基準が曖昧な文書の場合、安全側の処理ルートが選択される", () => {
    // SCEN-476
    const documentTitle = "教育研究設備導入申請書";
    const documentContent = "教育研究環境の改善のため、実験機器の購入を申請します。予算は300万円です。";
    const documentType = "設備申請書";
    const moeRequirements = ["補助金", "助成金", "研究費", "設備費"];

    const result = checkMoeComplianceRequirements(
      documentTitle,
      documentContent,
      documentType,
      moeRequirements
    );

    expect(result.complianceStatus).toBe("review_required");
    expect(result.paperStorageRequired).toBe(true);
    expect(result.processingRoute).toBe("hybrid");
    expect(result.riskLevel).toBe("medium");
  });
});