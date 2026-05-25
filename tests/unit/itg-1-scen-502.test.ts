import { approveRequirementChange } from '../../src/logic/it-1-br-1779263788059-2-2-1';

describe("処理ルート変更時に関係者へ自動通知し承認フローを動的に調整する機能", () => {
  test("SCEN-502: [normal] 変更要件承認処理 - 承認却下時に適切な理由と共に差戻しが実行される", () => {
    // 承認却下ケース: 影響分析が1000文字を超え、権限範囲外のため理事会承認が必要
    const changeRequirements = "システム全体に大きな影響を与える可能性がある大規模な処理ルート変更案件";
    const impactAnalysis = "a".repeat(1001); // 1001文字で権限範囲外
    const directorAuthority = "standard";
    const complianceRisk = 3; // 8未満なので緊急ではない

    const result = approveRequirementChange(
      changeRequirements,
      impactAnalysis,
      directorAuthority,
      complianceRisk
    );

    // 権限範囲外かつ緊急リスクでない場合は却下され理事会承認が必要
    expect(result.approved).toBe(false);
    expect(result.approvalComment).toBe("理事会承認が必要");
    expect(result.nextAction).toBe("理事会への上申準備");
    expect(result.urgencyLevel).toBe("保留");
  });
});