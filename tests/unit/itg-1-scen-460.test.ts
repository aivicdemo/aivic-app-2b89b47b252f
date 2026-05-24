import { handleApproverAbsenceSubstitution } from '../../src/logic/it-1-br-1779263788059-2-2-1';

describe('処理ルート変更時に関係者へ自動通知し承認フローを動的に調整する機能', () => {
  test('代理承認実行時に関係者に適切な通知が送信される', () => {
    // SCEN-460
    
    // 承認者が3営業日以上不在で代理承認が必要な場合
    const approverId = 'approver-001';
    const applicationId = 'app-2024-001';
    const lastLoginDate = new Date('2024-01-01');
    const currentDate = new Date('2024-01-05'); // 4営業日後（土日除く）

    const result = handleApproverAbsenceSubstitution(
      approverId,
      applicationId,
      lastLoginDate,
      currentDate
    );

    // 営業日数が3日以上なので代理承認が必要
    expect(result.substitutionRequired).toBe(true);
    expect(result.substituteApproverId).toBe('substitute-approver-001');
    expect(result.notificationSent).toBe(true);
    expect(result.reason).toBe('承認者不在のため代理承認に移行');

    // 承認者が2営業日のみ不在の場合（代理承認不要）
    const recentLoginDate = new Date('2024-01-03');
    const recentCurrentDate = new Date('2024-01-05'); // 2営業日後

    const normalResult = handleApproverAbsenceSubstitution(
      approverId,
      applicationId,
      recentLoginDate,
      recentCurrentDate
    );

    expect(normalResult.substitutionRequired).toBe(false);
    expect(normalResult.substituteApproverId).toBe(null);
    expect(normalResult.notificationSent).toBe(false);
    expect(normalResult.reason).toBe('承認者は通常通り対応可能');

    // 代理承認者が設定されていない場合
    expect(() => {
      handleApproverAbsenceSubstitution(
        'approver-no-substitute',
        applicationId,
        lastLoginDate,
        currentDate
      );
    }).toThrow('代理承認者が設定されていません');
  });
});