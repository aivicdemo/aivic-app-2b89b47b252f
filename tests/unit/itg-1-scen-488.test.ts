import { checkApprovalDelayAndNotify } from '../../src/logic/it-1-br-1-2-1';

describe('承認遅延案件を検知し担当者に自動で催促通知を送信する', () => {
  test('承認遅延検知 - 検知処理でシステムエラーが発生した場合、適切に処理される', () => {
    // SCEN-488
    const applicationId = 'APP001';
    const currentDateTime = new Date('2024-01-15T14:00:00Z');
    const approvalDeadline = new Date('2024-01-15T12:00:00Z');
    const reminderSettings = {
      beforeDays: [3, 1],
      urgentHours: 6
    };
    const approverInfo = {
      id: 'A001',
      name: '佐藤課長',
      email: 'sato@university.ac.jp',
      department: '総務課'
    };

    // 入力の不正値によるシステムエラーケース（申請案件IDが空）
    expect(() => checkApprovalDelayAndNotify('', currentDateTime, approvalDeadline, reminderSettings, approverInfo))
      .toThrow('申請案件が特定できません。正しい申請番号を確認してください。');

    // 承認期限が設定されていない場合のシステムエラー
    expect(() => checkApprovalDelayAndNotify(applicationId, currentDateTime, null as any, reminderSettings, approverInfo))
      .toThrow('承認期限が設定されていないため、遅延検知ができません。');

    // 承認者情報が不完全な場合（警告レベル）
    const incompleteApproverInfo = {
      id: 'A002',
      name: '',
      email: '',
      department: '財務課'
    };
    
    const result = checkApprovalDelayAndNotify(applicationId, currentDateTime, approvalDeadline, reminderSettings, incompleteApproverInfo);
    
    // 情報不完全でも処理は続行されるが警告が記録される
    expect(result.shouldNotify).toBe(true);
    expect(result.notificationType).toBe('緊急催促');
    expect(result.recipients).toEqual(['']);
    expect(result.delayStatus).toBe('緊急');
    expect(result.nextReminderTime).toBeNull();
  });
});