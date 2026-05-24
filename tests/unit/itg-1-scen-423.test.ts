import { checkMoeComplianceRequirements } from "../../src/logic/it-1-br-2-1-1";

describe("申請書類の文書種別を自動判別し補助金関連度に基づいて電子化可否を判定する機能", () => {
  test("補助金関連文書の場合、ハイブリッド処理ルートが設定される", () => {
    // SCEN-423

    const result = checkMoeComplianceRequirements(
      "文部科学省科学研究費助成事業（科研費）研究計画調書",
      "本研究は科研費により実施する基盤研究Aの申請であり、運営費交付金との関連を含む設備整備費の詳細な計画を記載する。文部科学省の要件に従い適切な研究体制を構築する。",
      "補助金申請書",
      ["補助金", "助成金", "文部科学省", "科研費", "運営費交付金", "設備整備費"]
    );

    // 法令適合状況の確認（structured.formula に従って計算）
    expect(result.complianceStatus).toBe("compliant");
    
    // 紙保管が必要（科研費等の文部科学省要件に該当）
    expect(result.paperStorageRequired).toBe(true);
    
    // ハイブリッド処理ルート（電子＋紙保管）
    expect(result.processingRoute).toBe("hybrid");
    
    // 高いリスクレベル（キーワード含有率が80%以上）
    expect(result.riskLevel).toBe("high");
  });
});