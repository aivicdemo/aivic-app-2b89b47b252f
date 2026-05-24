import { validateReminderFrequency } from '../../src/logic/it-1-br-1-2-1';

describe("承認遅延案件を検知し担当者に自動で催促通知を送信する", () => {
  // SCEN-452
  test("制限期間ギリギリの催促要求が適切に処理される", () => {
    // 3日前に催促送信済みの場合 - 制限期間ギリギリで送信不可
    const lastReminder2DaysAgo = new Date('2024-01-10T10:00:00');
    const current2DaysLater = new Date('2024-01-12T10:00:00');
    
    const result1 = validateReminderFrequency(
      'APP-001',
      'APPROVER-001', 
      lastReminder2DaysAgo,
      current2DaysLater
    );
    
    expect(result1.canSendReminder).toBe(false);
    expect(result1.waitingDays).toBe(2);
    expect(result1.nextAllowedDate).toEqual(new Date('2024-01-13T10:00:00'));

    // 3日経過した場合 - 送信可能
    const current3DaysLater = new Date('2024-01-13T10:00:00');
    
    const result2 = validateReminderFrequency(
      'APP-001',
      'APPROVER-001',
      lastReminder2DaysAgo, 
      current3DaysLater
    );
    
    expect(result2.canSendReminder).toBe(true);
    expect(result2.waitingDays).toBe(3);
    expect(result2.nextAllowedDate).toBe(null);

    // 初回催促の場合 - 送信可能
    const result3 = validateReminderFrequency(
      'APP-002',
      'APPROVER-002',
      null,
      current3DaysLater
    );
    
    expect(result3.canSendReminder).toBe(true);
    expect(result3.waitingDays).toBe(0);
    expect(result3.nextAllowedDate).toBe(null);
  });
});