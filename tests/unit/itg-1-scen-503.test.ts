import { approveRequirementChange } from "../../src/logic/it-1-br-1779263788059-2-2-1";

describe("処理ルート変更時に関係者へ自動通知し承認フローを動的に調整する機能", () => {
  test("承認処理中に権限エラーが発生した場合、適切に処理される", () => {
    // SCEN-503

    // 権限不足による法令違反リスクが高い場合の緊急承認テスト
    const changeRequirements = "補助金関連書類の電子化対応における処理ルート変更";
    const impactAnalysis = "補助金申請書類と実績報告書の処理方法が大幅に変更され、複数部署の業務フローに影響する範囲が非常に広い内容となっている";
    const directorAuthority = "limited"; // 権限制限状態
    const complianceRisk = 9; // 高リスク

    const result = approveRequirementChange(changeRequirements, impactAnalysis, directorAuthority, complianceRisk);

    expect(result).toEqual({
      approved: true,
      approvalComment: "法令違反リスク回避のため緊急承認",
      nextAction: "即座に文書分類基準を更新",
      urgencyLevel: "緊急"
    });

    // 権限内での通常承認テスト（補助金関連）
    const normalAuthority = "standard";
    const normalRisk = 4;
    const normalImpact = "文部科学省の補助金要件変更に対応する処理ルート変更が必要";

    const normalResult = approveRequirementChange(changeRequirements, normalImpact, normalAuthority, normalRisk);

    expect(normalResult).toEqual({
      approved: true,
      approvalComment: "通常承認",
      nextAction: "文書分類基準の更新を実施",
      urgencyLevel: "通常"
    });

    // 権限超過による理事会承認が必要なケース
    const complexImpact = "全学的なシステム変更を伴う大規模な処理ルート変更で、法令要件と業務効率の両面から慎重な検討が必要な案件であり、事務局長の権限を大幅に超える内容となっている";
    const lowRisk = 3;

    const escalationResult = approveRequirementChange(changeRequirements, complexImpact, normalAuthority, lowRisk);

    expect(escalationResult).toEqual({
      approved: false,
      approvalComment: "理事会承認が必要",
      nextAction: "理事会への上申準備",
      urgencyLevel: "保留"
    });

    // エラーケース: 変更要件が不十分
    expect(() => approveRequirementChange("", impactAnalysis, directorAuthority, complianceRisk)).toThrow("変更要件の内容が不十分です。具体的な変更内容を記載してください。");

    // エラーケース: 影響分析が未完了
    expect(() => approveRequirementChange(changeRequirements, "", directorAuthority, complianceRisk)).toThrow("影響分析が完了していません。承認判定に必要な分析結果を確認してください。");
  });
});