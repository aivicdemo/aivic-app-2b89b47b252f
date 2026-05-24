import { handleApproverAbsenceSubstitution } from '../../src/logic/it-1-br-1779263788059-2-2-1';

describe("処理ルート変更時に関係者へ自動通知し承認フローを動的に調整する機能", () => {
  test("代理承認実行時に関係者に適切な通知が送信される", () => {
    // SCEN-460

    // 承認者が3営業日以上不在の場合
    const approverId = "approver001";
    const applicationId = "app12345";
    const lastLoginDate = new Date("2024-01-01T09:00:00Z");
    const currentDate = new Date("2024-01-05T10:00:00Z");

    const result = handleApproverAbsenceSubstitution(approverId, applicationId, lastLoginDate, currentDate);

    expect(result.substitutionRequired).toBe(true);
    expect(result.substituteApproverId).toBe("substitute_approver_for_approver001");
    expect(result.notificationSent).toBe(true);
    expect(result.reason).toBe("承認者不在のため代理承認に移行");

    // 承認者が2営業日の不在（代理不要）
    const recentLastLogin = new Date("2024-01-04T09:00:00Z");
    const resultRecent = handleApproverAbsenceSubstitution(approverId, applicationId, recentLastLogin, currentDate);

    expect(resultRecent.substitutionRequired).toBe(false);
    expect(resultRecent.substituteApproverId).toBe(null);
    expect(resultRecent.notificationSent).toBe(false);
    expect(resultRecent.reason).toBe("承認者は通常通り対応可能");

    // 代理承認者が設定されていない場合
    const unassignedApproverId = "unassigned_approver";
    expect(() => {
      handleApproverAbsenceSubstitution(unassignedApproverId, applicationId, lastLoginDate, currentDate);
    }).toThrow("承認者の代理設定が行われていないため、代理承認を実行できません。システム管理者にお問い合わせください。");
  });
});