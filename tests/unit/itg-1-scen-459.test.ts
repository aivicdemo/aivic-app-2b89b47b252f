import { handleApproverAbsenceSubstitution } from "../../src/logic/it-1-br-1779263788059-2-2-1";

describe("処理ルート変更時に関係者へ自動通知し承認フローを動的に調整する機能", () => {
  test("承認者不在時に代理承認者に権限が移譲される", () => {
    // SCEN-459

    // 承認者が3営業日以上不在の場合
    const lastLoginDate = new Date("2024-01-01");
    const currentDate = new Date("2024-01-05");
    const result1 = handleApproverAbsenceSubstitution("EMP001", "APP001", lastLoginDate, currentDate);
    
    expect(result1.substitutionRequired).toBe(true);
    expect(result1.substituteApproverId).toBe("EMP002");
    expect(result1.notificationSent).toBe(true);
    expect(result1.reason).toBe("承認者不在のため代理承認に移行");

    // 承認者が3営業日未満の不在の場合
    const recentLoginDate = new Date("2024-01-04");
    const result2 = handleApproverAbsenceSubstitution("EMP001", "APP001", recentLoginDate, currentDate);
    
    expect(result2.substitutionRequired).toBe(false);
    expect(result2.substituteApproverId).toBe(null);
    expect(result2.notificationSent).toBe(false);
    expect(result2.reason).toBe("承認者は通常通り対応可能");

    // 代理承認者が設定されていない場合のエラー
    expect(() => {
      handleApproverAbsenceSubstitution("EMP999", "APP001", lastLoginDate, currentDate);
    }).toThrow("承認者の代理設定が行われていないため、代理承認を実行できません。システム管理者にお問い合わせください。");
  });
});