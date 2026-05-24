import { describe, test, expect } from "@jest/globals";
import { classifyLegalChangeImpactLevel } from "../../src/logic/it-1-br-1779263788059-2-1-1";

describe("申請書類の種別を自動判別し適切な処理ルートを決定する機能", () => {
  test("法令改正の影響度レベルが補助金要件変更と影響ルール数に基づいて適切に分類される", () => {
    // SCEN-499
    const currentDocumentTypes = ["補助金申請書", "研究費申請書", "設備申請書", "人事申請書", "一般申請書"];
    const processingRules = [
      { document_type: "補助金申請書" },
      { document_type: "研究費申請書" },
      { document_type: "設備申請書" },
      { document_type: "人事申請書" },
      { document_type: "一般申請書" },
      { document_type: "補助金申請書" },
      { document_type: "補助金申請書" },
      { document_type: "補助金申請書" },
      { document_type: "補助金申請書" },
      { document_type: "補助金申請書" }
    ];
    const complianceDeadline = new Date("2024-04-30");

    // 補助金要件変更があり、影響ルール数が10件以上、残り日数が30日未満の場合は「高」レベル
    const highImpactNotification = "補助金交付要綱の改正により、申請書類の審査基準が変更されます。文部科学省による新たな要件が追加されました。";
    const result1 = classifyLegalChangeImpactLevel(
      highImpactNotification,
      currentDocumentTypes,
      processingRules,
      complianceDeadline
    );
    expect(result1.impactLevel).toBe("high");
    expect(result1.priority).toBe(1);
    expect(result1.requiredResponseDays).toBe(14);
    expect(result1.affectedRuleCount).toBe(6);
    expect(result1.riskAssessment).toBe("法令違反リスク高");

    // 補助金要件変更があり、影響ルール数が5件以上、残り日数が60日未満の場合は「中」レベル
    const mediumImpactNotification = "補助金に関する規則改正のお知らせ。文部科学省から通達がありました。";
    const mediumRules = processingRules.slice(0, 5);
    const result2 = classifyLegalChangeImpactLevel(
      mediumImpactNotification,
      currentDocumentTypes,
      mediumRules,
      new Date("2024-05-30")
    );
    expect(result2.impactLevel).toBe("medium");
    expect(result2.priority).toBe(2);
    expect(result2.requiredResponseDays).toBe(30);
    expect(result2.affectedRuleCount).toBe(3);
    expect(result2.riskAssessment).toBe("業務遅延リスク中");

    // 補助金要件変更がない場合は「低」レベル
    const lowImpactNotification = "一般的な事務手続きに関する変更通知です。";
    const result3 = classifyLegalChangeImpactLevel(
      lowImpactNotification,
      currentDocumentTypes,
      processingRules,
      complianceDeadline
    );
    expect(result3.impactLevel).toBe("low");
    expect(result3.priority).toBe(3);
    expect(result3.requiredResponseDays).toBe(60);
    expect(result3.affectedRuleCount).toBe(0);
    expect(result3.riskAssessment).toBe("影響軽微");
  });
});