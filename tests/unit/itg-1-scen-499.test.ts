import { classifyLegalChangeImpactLevel } from "../../src/logic/it-1-br-1779263788059-2-1-1";

describe("申請書類の種別を自動判別し適切な処理ルートを決定する機能", () => {
  test("法令改正影響範囲分析 - 影響度レベルが適切に分類される", () => {
    // SCEN-499

    // テストケース1: 補助金要件変更があり影響ルール数10件以上、残り30日未満 → 高レベル
    const highImpactNotification = "補助金交付要綱の変更により、申請書類の保管要件が改正されます。";
    const highImpactDocuments = ["補助金申請書", "実績報告書", "収支決算書", "監査資料"];
    const highImpactRules = Array.from({ length: 12 }, (_, i) => ({ document_type: `rule${i}` }));
    const nearDeadline = new Date();
    nearDeadline.setDate(nearDeadline.getDate() + 25);

    const highResult = classifyLegalChangeImpactLevel(
      highImpactNotification,
      highImpactDocuments,
      highImpactRules,
      nearDeadline
    );

    expect(highResult.impactLevel).toBe("high");
    expect(highResult.priority).toBe(1);
    expect(highResult.requiredResponseDays).toBe(14);
    expect(highResult.affectedRuleCount).toBe(4);
    expect(highResult.riskAssessment).toBe("法令違反リスク高");

    // テストケース2: 補助金要件変更があり影響ルール数5件以上、残り60日未満 → 中レベル
    const mediumImpactNotification = "補助金の実績報告における文書管理要件が変更されます。";
    const mediumImpactDocuments = ["補助金申請書", "実績報告書"];
    const mediumImpactRules = Array.from({ length: 7 }, (_, i) => ({ document_type: `rule${i}` }));
    const mediumDeadline = new Date();
    mediumDeadline.setDate(mediumDeadline.getDate() + 45);

    const mediumResult = classifyLegalChangeImpactLevel(
      mediumImpactNotification,
      mediumImpactDocuments,
      mediumImpactRules,
      mediumDeadline
    );

    expect(mediumResult.impactLevel).toBe("medium");
    expect(mediumResult.priority).toBe(2);
    expect(mediumResult.requiredResponseDays).toBe(30);
    expect(mediumResult.affectedRuleCount).toBe(2);
    expect(mediumResult.riskAssessment).toBe("業務遅延リスク中");

    // テストケース3: 補助金関連なし → 低レベル
    const lowImpactNotification = "一般事務処理の手続きに関する軽微な変更です。";
    const lowImpactDocuments = ["一般申請書"];
    const lowImpactRules = Array.from({ length: 3 }, (_, i) => ({ document_type: `rule${i}` }));
    const farDeadline = new Date();
    farDeadline.setDate(farDeadline.getDate() + 90);

    const lowResult = classifyLegalChangeImpactLevel(
      lowImpactNotification,
      lowImpactDocuments,
      lowImpactRules,
      farDeadline
    );

    expect(lowResult.impactLevel).toBe("low");
    expect(lowResult.priority).toBe(3);
    expect(lowResult.requiredResponseDays).toBe(60);
    expect(lowResult.affectedRuleCount).toBe(1);
    expect(lowResult.riskAssessment).toBe("影響軽微");

    // エラーケース1: 法令改正通知の内容が空
    expect(() =>
      classifyLegalChangeImpactLevel("", [], [], new Date())
    ).toThrow("法令改正通知の内容が正しく取得できません。通知内容を確認してください。");

    // エラーケース2: 施行日が過去
    const pastDate = new Date();
    pastDate.setDate(pastDate.getDate() - 10);
    
    const warningResult = classifyLegalChangeImpactLevel(
      "補助金要件の変更",
      ["補助金申請書"],
      [{ document_type: "rule1" }],
      pastDate
    );
    
    expect(warningResult.impactLevel).toBe("high");
    expect(warningResult.priority).toBe(1);

    // エラーケース3: 影響を受ける文書種別が存在しない
    const noImpactResult = classifyLegalChangeImpactLevel(
      "軽微な変更",
      [],
      [],
      new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    );
    
    expect(noImpactResult.impactLevel).toBe("low");
    expect(noImpactResult.affectedRuleCount).toBe(0);
  });
});