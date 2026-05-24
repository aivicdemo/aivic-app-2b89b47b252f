import { checkMoeComplianceRequirements } from "../../src/logic/it-1-br-2-1-1";

describe("申請書類の文書種別を自動判別し補助金関連度に基づいて電子化可否を判定する機能", () => {
  test("補助金関連文書でハイブリッド処理が選択される", () => {
    // SCEN-474
    
    // 補助金関連キーワードを含む文書
    const documentTitle = "文部科学省科研費設備整備申請書";
    const documentContent = "本申請は文部科学省の科学研究費補助金による研究設備の整備を目的とした申請書類です。運営費交付金と組み合わせて実施予定。";
    const documentType = "補助金申請書";
    const moeRequirements = ["科研費", "運営費交付金", "設備整備費", "補助金"];

    // キーワードスコア = 0.8（70%以上で補助金関連と判定）
    // 補助金関連かつ文部科学省要件該当でハイブリッド処理
    const result = checkMoeComplianceRequirements(documentTitle, documentContent, documentType, moeRequirements);

    expect(result.complianceStatus).toBe("compliant");
    expect(result.paperStorageRequired).toBe(true);
    expect(result.processingRoute).toBe("hybrid");
    expect(result.riskLevel).toBe("high");

    // 境界値テスト: キーワードスコア60%（閾値未満）
    const lowKeywordTitle = "一般事務申請書";
    const lowKeywordContent = "一般的な事務手続きに関する申請書類です。";
    const lowResult = checkMoeComplianceRequirements(lowKeywordTitle, lowKeywordContent, documentType, moeRequirements);

    expect(lowResult.complianceStatus).toBe("review_required");
    expect(lowResult.paperStorageRequired).toBe(false);
    expect(lowResult.processingRoute).toBe("electronic");
    expect(lowResult.riskLevel).toBe("low");

    // エラーケース: タイトル空
    expect(() => {
      checkMoeComplianceRequirements("", documentContent, documentType, moeRequirements);
    }).toThrow("申請書類のタイトルが入力されていません。法令要件の判定ができません。");

    // エラーケース: 文書種別未分類
    expect(() => {
      checkMoeComplianceRequirements(documentTitle, documentContent, "", moeRequirements);
    }).toThrow("書類種別の分類が完了していません。先に文書種別の確認を行ってください。");
  });
});