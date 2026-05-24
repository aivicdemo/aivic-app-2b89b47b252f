import { checkMoeComplianceRequirements } from "../../src/logic/it-1-br-2-1-1";

describe("申請書類の文書種別を自動判別し補助金関連度に基づいて電子化可否を判定する機能", () => {
  test("補助金関連文書でハイブリッド処理が選択される", () => {
    // SCEN-474
    
    // 補助金関連キーワードを含む申請書類
    const documentTitle = "科研費による研究設備導入申請";
    const documentContent = "文部科学省科学研究費助成事業による研究設備導入に関する申請です。運営費交付金を活用した設備整備費として、研究に必要な実験装置の購入を申請いたします。";
    const documentType = "研究費申請書";
    const moeRequirements = ["科研費", "運営費交付金", "設備整備費", "補助金", "助成金"];

    const result = checkMoeComplianceRequirements(documentTitle, documentContent, documentType, moeRequirements);

    // キーワード一致度60%以上で補助金関連と判定
    expect(result.complianceStatus).toBe("compliant");
    expect(result.paperStorageRequired).toBe(true);
    expect(result.processingRoute).toBe("hybrid");
    expect(result.riskLevel).toBe("high");
  });
});