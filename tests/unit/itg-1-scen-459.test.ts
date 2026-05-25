import { handleApproverAbsenceSubstitution } from '../../src/logic/it-1-br-1779263788059-2-2-1';

describe("処理ルート変更時に関係者へ自動通知し承認フローを動的に調整する機能", () => {
  test('SCEN-459: 代理承認権限移譲 - 承認者不在時に代理承認者に権限が移譲される', () => {
    // 承認者が3営業日以上不在の場合の代理承認移譲テスト
    const approverId = "A001";
    const applicationId = "APP-2024-001";
    const lastLoginDate = new Date("2024-01-10T09:00:00Z");
    const currentDate = new Date("2024-01-16T10:00:00Z");

    const result = handleApproverAbsenceSubstitution(
      approverId,
      applicationId,
      lastLoginDate,
      currentDate
    );

    // 営業日数計算: 1/10から1/16まで = 4営業日（土日除く）
    expect(result.substitutionRequired).toBe(true);
    expect(result.substituteApproverId).not.toBeNull();
    expect(result.notificationSent).toBe(true);
    expect(result.reason).toBe("承認者不在のため代理承認に移行");
  });
});