import { checkMoeComplianceRequirements } from "../../src/logic/it-1-br-2-1-1";

describe("申請書類の文書種別を自動判別し補助金関連度に基づいて電子化可否を判定する機能", () => {
  test("文書保管方式選択 - 法令要件に基づいて適切な保管方式が選択される", () => {
    // SCEN-489

    // 補助金関連書類で紙保管が必要な場合
    const subsidyDocument = checkMoeComplianceRequirements(
      "科研費研究計画調書",
      "本研究は文部科学省の科学研究費助成事業における基盤研究Aの申請であり、運営費交付金と合わせて設備整備費の確保を目指すものである。",
      "補助金申請書",
      ["科研費", "運営費交付金", "設備整備費", "補助金", "助成金", "文部科学省"]
    );

    const keywordScore = (6 / 6) * 1.0;
    const isSubsidyRelated = keywordScore >= 0.6;
    expect(subsidyDocument.complianceStatus).toBe("compliant");
    expect(subsidyDocument.paperStorageRequired).toBe(true);
    expect(subsidyDocument.processingRoute).toBe("hybrid");
    expect(subsidyDocument.riskLevel).toBe("high");

    // 一般書類で電子のみ処理の場合
    const generalDocument = checkMoeComplianceRequirements(
      "会議資料作成依頼",
      "次回の教授会で使用する会議資料の作成をお願いします。議題は人事案件と予算についてです。",
      "一般事務書類",
      ["科研費", "運営費交付金", "設備整備費", "補助金", "助成金", "文部科学省"]
    );

    const generalKeywordScore = 0 / 6;
    const isGeneralSubsidyRelated = generalKeywordScore >= 0.6;
    expect(generalDocument.complianceStatus).toBe("review_required");
    expect(generalDocument.paperStorageRequired).toBe(false);
    expect(generalDocument.processingRoute).toBe("electronic");
    expect(generalDocument.riskLevel).toBe("low");

    // 研究関連書類（補助金関連度中程度）の場合
    const researchDocument = checkMoeComplianceRequirements(
      "研究設備導入計画書",
      "新しい研究設備の導入に関する計画書です。実験効率の向上を図ることを目的とします。",
      "研究関連書類", 
      ["科研費", "運営費交付金", "設備整備費", "補助金", "助成金", "文部科学省"]
    );

    const researchKeywordScore = (1 / 6) * 1.0;
    const isResearchSubsidyRelated = researchKeywordScore >= 0.6;
    expect(researchDocument.complianceStatus).toBe("review_required");
    expect(researchDocument.paperStorageRequired).toBe(false);
    expect(researchDocument.processingRoute).toBe("electronic");
    expect(researchDocument.riskLevel).toBe("medium");

    // エラーケース：タイトルが空
    expect(() => checkMoeComplianceRequirements(
      "",
      "申請内容",
      "補助金申請書",
      ["科研費"]
    )).toThrow("申請書類のタイトルが入力されていません。法令要件の判定ができません。");

    // エラーケース：文書種別が未分類
    expect(() => checkMoeComplianceRequirements(
      "テスト申請書",
      "テスト内容です。",
      "",
      ["科研費"]
    )).toThrow("書類種別の分類が完了していません。先に文書種別の確認を行ってください。");
  });
});