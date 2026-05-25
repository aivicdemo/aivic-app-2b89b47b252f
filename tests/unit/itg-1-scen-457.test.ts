import {
  identifyNotificationRecipient
} from '../../src/logic/it-1-br-1-2-1';

describe('承認遅延案件を検知し担当者に自動で催促通知を送信する', () => {
  test('催促通知宛先特定 - 承認者が不在の場合、代理承認者が特定される', () => {
    // SCEN-457
    const result = identifyNotificationRecipient(
      'APP001',
      'subsidy_application',
      'department_head_approval',
      'EMP123',
      false
    );

    expect(result).toEqual({
      recipientId: 'substitute_001',
      recipientType: 'substitute_approver',
      notificationMethod: 'urgent_contact',
      escalationRequired: false
    });
  });
});