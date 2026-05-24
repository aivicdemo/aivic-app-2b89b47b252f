import { classifyLegalChangeImpactLevel } from "../../src/logic/it-1-br-1779263788059-2-1-1";

describe("申請書類の種別を自動判別し適切な処理ルートを決定する機能", () => {
  test("法令改正通知を受信し影響度レベルが適切に分類される", () => {
    // SCEN-499

    // 重大影響度（high）: 補助金要件変更あり、影響ルール数10件、残り日数20日
    const highImpactResult = classifyLegalChangeImpactLevel(
      "補助金交付要綱の改正により文書保管要件が変更されます。電子保管の条件が厳格化されました。",
      ["補助金申請書", "実績報告書", "収支決算書", "監査資料", "契約書", "領収書", "給与明細", "研究費申請書", "設備購入申請", "旅費申請"],
      [
        { document_type: "補助金申請書", storage_requirement: "paper" },
        { document_type: "実績報告書", storage_requirement: "electronic" },
        { document_type: "収支決算書", storage_requirement: "paper" },
        { document_type: "監査資料", storage_requirement: "paper" },
        { document_type: "契約書", storage_requirement: "electronic" },
        { document_type: "領収書", storage_requirement: "electronic" },
        { document_type: "給与明細", storage_requirement: "electronic" },
        { document_type: "研究費申請書", storage_requirement: "paper" },
        { document_type: "設備購入申請", storage_requirement: "electronic" },
        { document_type: "旅費申請", storage_requirement: "electronic" }
      ],
      new Date("2024-02-10")
    );

    expect(highImpactResult.impactLevel).toBe("high");
    expect(highImpactResult.priority).toBe(1);
    expect(highImpactResult.requiredResponseDays).toBe(14);
    expect(highImpactResult.affectedRuleCount).toBe(10);
    expect(highImpactResult.riskAssessment).toBe("法令違反リスク高");

    // 中程度影響度（medium）: 補助金要件変更あり、影響ルール数7件、残り日数40日
    const mediumImpactResult = classifyLegalChangeImpactLevel(
      "補助金に関する申請様式の変更について通知します。一部の書類で電子化要件が追加されました。",
      ["補助金申請書", "実績報告書", "収支決算書", "契約書", "領収書", "給与明細", "旅費申請"],
      [
        { document_type: "補助金申請書", storage_requirement: "paper" },
        { document_type: "実績報告書", storage_requirement: "electronic" },
        { document_type: "収支決算書", storage_requirement: "paper" },
        { document_type: "契約書", storage_requirement: "electronic" },
        { document_type: "領収書", storage_requirement: "electronic" },
        { document_type: "給与明細", storage_requirement: "electronic" },
        { document_type: "旅費申請", storage_requirement: "electronic" }
      ],
      new Date("2024-03-20")
    );

    expect(mediumImpactResult.impactLevel).toBe("medium");
    expect(mediumImpactResult.priority).toBe(2);
    expect(mediumImpactResult.requiredResponseDays).toBe(30);
    expect(mediumImpactResult.affectedRuleCount).toBe(7);
    expect(mediumImpactResult.riskAssessment).toBe("業務遅延リスク中");

    // 低影響度（low）: 補助金要件変更なし、影響ルール数2件
    const lowImpactResult = classifyLegalChangeImpactLevel(
      "学内規程の軽微な変更について通知します。文書の分類基準を一部見直します。",
      ["給与明細", "旅費申請"],
      [
        { document_type: "給与明細", storage_requirement: "electronic" },
        { document_type: "旅費申請", storage_requirement: "electronic" }
      ],
      new Date("2024-04-30")
    );

    expect(lowImpactResult.impactLevel).toBe("low");
    expect(lowImpactResult.priority).toBe(3);
    expect(lowImpactResult.requiredResponseDays).toBe(60);
    expect(lowImpactResult.affectedRuleCount).toBe(2);
    expect(lowImpactResult.riskAssessment).toBe("影響軽微");
  });
});