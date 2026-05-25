import { approveRequirementChange } from '../../src/logic/it-1-br-1779263788059-2-2-1';

describe("処理ルート変更時に関係者へ自動通知し承認フローを動的に調整する機能", () => {
  test("承認処理中に権限エラーが発生した場合、適切に処理される", () => {
    // SCEN-503
    const changeRequirements = "文部科学省の新しい補助金要綱により、研究費申請書類の電子化基準を見直し、従来の紙保管から電子+紙ハイブリッド保管に変更する";
    const impactAnalysis = "全学の研究費申請（年間約500件）に影響し、研究推進部、財務部、監査室の業務プロセス変更が必要。予想される工数は約150時間";
    const directorAuthority = "limited"; // 権限不足を示す値
    const complianceRisk = 9; // 高リスク

    // 権限不足により承認が拒否されることを期待
    const result = approveRequirementChange(
      changeRequirements,
      impactAnalysis, 
      directorAuthority,
      complianceRisk
    );

    expect(result.approved).toBe(false);
    expect(result.approvalComment).toBe("理事会承認が必要");
    expect(result.nextAction).toBe("理事会への上申準備");
    expect(result.urgencyLevel).toBe("保留");
  });
});