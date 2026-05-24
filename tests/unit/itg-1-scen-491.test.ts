import { checkMoeComplianceRequirements } from "../../src/logic/it-1-br-2-1-1";

describe("申請書類の文書種別を自動判別し補助金関連度に基づいて電子化可否を判定する機能", () => {
  test("保管方式判定条件が不明な場合、最も安全な方式が選択される", () => {
    // SCEN-491

    // 条件不明の場合のテスト - 空のタイトルと内容、不明な文書種別
    const result1 = checkMoeComplianceRequirements(
      "",
      "",
      "不明",
      []
    );

    expect(result1.complianceStatus).toBe("review_required");
    expect(result1.paperStorageRequired).toBe(false);
    expect(result1.processingRoute).toBe("electronic");
    expect(result1.riskLevel).toBe("low");

    // 判定基準が不足している場合のテスト - キーワードなし
    const result2 = checkMoeComplianceRequirements(
      "一般申請",
      "通常の業務申請です",
      "一般申請書",
      []
    );

    expect(result2.complianceStatus).toBe("review_required");
    expect(result2.paperStorageRequired).toBe(false);
    expect(result2.processingRoute).toBe("electronic");
    expect(result2.riskLevel).toBe("low");

    // 曖昧な補助金関連書類 - 安全な方式選択
    const result3 = checkMoeComplianceRequirements(
      "研究費に関する申請",
      "研究活動に関連する費用の申請を行います。詳細は別途",
      "研究関連申請書",
      ["研究費", "補助金", "文部科学省"]
    );

    expect(result3.complianceStatus).toBe("compliant");
    expect(result3.paperStorageRequired).toBe(true);
    expect(result3.processingRoute).toBe("hybrid");
    expect(result3.riskLevel).toBe("medium");

    // 境界ケース - キーワード一致度が微妙な場合
    const result4 = checkMoeComplianceRequirements(
      "設備申請について",
      "設備の購入に関する申請です。予算確保のため",
      "設備申請書",
      ["設備", "予算"]
    );

    expect(result4.complianceStatus).toBe("review_required");
    expect(result4.paperStorageRequired).toBe(false);
    expect(result4.processingRoute).toBe("electronic");
    expect(result4.riskLevel).toBe("medium");
  });
});