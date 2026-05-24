import { handleApproverAbsenceSubstitution } from "../../src/logic/it-1-br-1779263788059-2-2-1";

describe("処理ルート変更時に関係者へ自動通知し承認フローを動的に調整する機能", () => {
  test("承認者不在時に代理承認権限が移譲され通知が送信される", () => {
    // SCEN-459
    
    // 承認者が3営業日以上ログインしていない場合
    const lastLoginDate = new Date('2024-01-01');
    const currentDate = new Date('2024-01-08');
    const approverId = 'APPROVER001';
    const applicationId = 'APP001';

    const result = handleApproverAbsenceSubstitution(
      approverId,
      applicationId,
      lastLoginDate,
      currentDate
    );

    expect(result.substitutionRequired).toBe(true);
    expect(result.substituteApproverId).toBe('SUBSTITUTE001');
    expect(result.notificationSent).toBe(true);
    expect(result.reason).toBe('承認者不在のため代理承認に移行');
  });
});