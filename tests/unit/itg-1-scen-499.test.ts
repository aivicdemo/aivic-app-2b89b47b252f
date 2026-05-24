import { classifyLegalChangeImpactLevel } from "../../src/logic/it-1-br-1779263788059-2-1-1";

describe("申請書類の種別を自動判別し適切な処理ルートを決定する機能", () => {
  test("法令改正影響範囲分析 - 影響度レベルが適切に分類される", () => {
    // SCEN-499
    
    // 高影響度レベル: 補助金要件変更かつ影響ルール数10件以上かつ期限30日未満
    const highImpactResult = classifyLegalChangeImpactLevel(
      "補助金申請の電子化に関する要件変更について",
      ["補助金申請書", "実績報告書", "会計報告書", "監査資料", "事業計画書", 
       "設備申請書", "人事申請書", "財務申請書", "研究申請書", "評価申請書"],
      [
        { document_type: "補助金申請書", storage_requirement: "paper" },
        { document_type: "実績報告書", storage_requirement: "paper" },
        { document_type: "会計報告書", storage_requirement: "electronic" },
        { document_type: "監査資料", storage_requirement: "paper" },
        { document_type: "事業計画書", storage_requirement: "electronic" },
        { document_type: "設備申請書", storage_requirement: "paper" },
        { document_type: "人事申請書", storage_requirement: "electronic" },
        { document_type: "財務申請書", storage_requirement: "paper" },
        { document_type: "研究申請書", storage_requirement: "electronic" },
        { document_type: "評価申請書", storage_requirement: "paper" }
      ],
      new Date("2024-02-15")
    );

    expect(highImpactResult.impactLevel).toBe("high");
    expect(highImpactResult.priority).toBe(1);
    expect(highImpactResult.requiredResponseDays).toBe(14);
    expect(highImpactResult.affectedRuleCount).toBe(10);
    expect(highImpactResult.riskAssessment).toBe("法令違反リスク高");

    // 中影響度レベル: 補助金要件変更かつ影響ルール数5件以上かつ期限60日未満
    const mediumImpactResult = classifyLegalChangeImpactLevel(
      "補助金交付要綱の改正について",
      ["補助金申請書", "実績報告書", "会計報告書", "事業計画書", "設備申請書"],
      [
        { document_type: "補助金申請書", storage_requirement: "paper" },
        { document_type: "実績報告書", storage_requirement: "paper" },
        { document_type: "会計報告書", storage_requirement: "electronic" },
        { document_type: "事業計画書", storage_requirement: "electronic" },
        { document_type: "設備申請書", storage_requirement: "paper" }
      ],
      new Date("2024-03-15")
    );

    expect(mediumImpactResult.impactLevel).toBe("medium");
    expect(mediumImpactResult.priority).toBe(2);
    expect(mediumImpactResult.requiredResponseDays).toBe(30);
    expect(mediumImpactResult.affectedRuleCount).toBe(5);
    expect(mediumImpactResult.riskAssessment).toBe("業務遅延リスク中");

    // 低影響度レベル: 補助金要件変更なしかつ影響ルール数少
    const lowImpactResult = classifyLegalChangeImpactLevel(
      "一般文書管理規則の改正について",
      ["人事申請書", "財務申請書"],
      [
        { document_type: "人事申請書", storage_requirement: "electronic" },
        { document_type: "財務申請書", storage_requirement: "paper" }
      ],
      new Date("2024-04-15")
    );

    expect(lowImpactResult.impactLevel).toBe("low");
    expect(lowImpactResult.priority).toBe(3);
    expect(lowImpactResult.requiredResponseDays).toBe(60);
    expect(lowImpactResult.affectedRuleCount).toBe(2);
    expect(lowImpactResult.riskAssessment).toBe("影響軽微");

    // エラーケース: 法令改正通知が空
    expect(() => {
      classifyLegalChangeImpactLevel(
        "",
        ["補助金申請書"],
        [{ document_type: "補助金申請書", storage_requirement: "paper" }],
        new Date("2024-02-15")
      );
    }).toThrow("法令改正通知の内容が正しく取得できません。通知内容を確認してください。");

    // 警告ケース: 施行日が過去
    const pastDateResult = classifyLegalChangeImpactLevel(
      "補助金申請要件変更",
      ["補助金申請書"],
      [{ document_type: "補助金申請書", storage_requirement: "paper" }],
      new Date("2023-12-01")
    );
    
    expect(pastDateResult.impactLevel).toBe("high");
    expect(pastDateResult.riskAssessment).toBe("法令違反リスク高");

    // 警告ケース: 影響文書種別なし
    const noImpactResult = classifyLegalChangeImpactLevel(
      "軽微な規則変更",
      [],
      [],
      new Date("2024-02-15")
    );
    
    expect(noImpactResult.impactLevel).toBe("low");
    expect(noImpactResult.affectedRuleCount).toBe(0);
  });
});