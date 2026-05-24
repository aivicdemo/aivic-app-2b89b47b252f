import { approveRequirementChange } from "../../src/logic/it-1-br-1779263788059-2-2-1";

describe("処理ルート変更時に関係者へ自動通知し承認フローを動的に調整する機能", () => {
  test("変更要件承認処理 - 承認却下時に適切な理由と共に差戻しが実行される", () => {
    // SCEN-502

    // 権限外の重大な変更要求（理事会承認が必要）
    const largeScopeChangeRequirements = "全学的なシステム改修を伴う文書分類基準の大幅変更。従来の電子化基準を全面的に見直し、新たに10の文書種別で紙保管を義務付ける。";
    const extensiveImpactAnalysis = "全12学部、8事務部門に影響が及び、年間2万件の申請書類処理フローの変更が必要。システム改修費用3000万円、移行期間6ヶ月を要すると想定される。";
    const standardDirectorAuthority = "standard";
    const mediumComplianceRisk = 5;

    const result = approveRequirementChange(
      largeScopeChangeRequirements,
      extensiveImpactAnalysis,
      standardDirectorAuthority,
      mediumComplianceRisk
    );

    expect(result.approved).toBe(false);
    expect(result.approvalComment).toBe("理事会承認が必要");
    expect(result.nextAction).toBe("理事会への上申準備");
    expect(result.urgencyLevel).toBe("保留");

    // 法令違反リスクが高い場合の緊急承認
    const highRiskChangeRequirements = "文部科学省の新規制に対応するため、補助金関連書類の紙保管要件を緊急追加。";
    const criticalImpactAnalysis = "法令違反回避のため即座の対応が必要。";
    const standardAuthority = "standard";
    const highComplianceRisk = 9;

    const emergencyResult = approveRequirementChange(
      highRiskChangeRequirements,
      criticalImpactAnalysis,
      standardAuthority,
      highComplianceRisk
    );

    expect(emergencyResult.approved).toBe(true);
    expect(emergencyResult.approvalComment).toBe("法令違反リスク回避のため緊急承認");
    expect(emergencyResult.nextAction).toBe("即座に文書分類基準を更新");
    expect(emergencyResult.urgencyLevel).toBe("緊急");

    // 通常承認条件を満たすケース
    const normalChangeRequirements = "文部科学省の補助金要件変更に伴い、科研費申請書の電子保管基準を修正。";
    const limitedImpactAnalysis = "研究関連部署3部門に影響。月間500件程度の申請書類が対象。";
    const validAuthority = "standard";
    const lowRisk = 3;

    const normalResult = approveRequirementChange(
      normalChangeRequirements,
      limitedImpactAnalysis,
      validAuthority,
      lowRisk
    );

    expect(normalResult.approved).toBe(true);
    expect(normalResult.approvalComment).toBe("通常承認");
    expect(normalResult.nextAction).toBe("文書分類基準の更新を実施");
    expect(normalResult.urgencyLevel).toBe("通常");
  });
});