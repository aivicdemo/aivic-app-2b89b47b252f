// SCEN-450

import { validateReminderFrequency } from '../../src/logic/it-1-br-1-2-1';

describe('承認遅延案件を検知し担当者に自動で催促通知を送信する', () => {
  test('催促頻度制限 - 適切な間隔での催促通知が送信される', () => {
    const applicationId = "APP001";
    const targetApproverId = "APPROVER001";
    const currentDate = new Date("2024-01-15T10:00:00Z");
    
    // 前回催促から3日経過している場合
    const lastReminderDate = new Date("2024-01-12T10:00:00Z");
    const result = validateReminderFrequency(applicationId, targetApproverId, lastReminderDate, currentDate);
    
    expect(result.canSendReminder).toBe(true);
    expect(result.waitingDays).toBe(3);
    expect(result.nextAllowedDate).toBe(null);
    
    // 前回催促から2日しか経過していない場合
    const recentReminderDate = new Date("2024-01-13T10:00:00Z");
    const restrictedResult = validateReminderFrequency(applicationId, targetApproverId, recentReminderDate, currentDate);
    
    expect(restrictedResult.canSendReminder).toBe(false);
    expect(restrictedResult.waitingDays).toBe(2);
    expect(restrictedResult.nextAllowedDate).toEqual(new Date("2024-01-16T10:00:00Z"));
    
    // 初回催促の場合
    const firstTimeResult = validateReminderFrequency(applicationId, targetApproverId, null, currentDate);
    
    expect(firstTimeResult.canSendReminder).toBe(true);
    expect(firstTimeResult.waitingDays).toBe(0);
    expect(firstTimeResult.nextAllowedDate).toBe(null);
    
    // 申請書類IDが空の場合
    expect(() => validateReminderFrequency("", targetApproverId, lastReminderDate, currentDate))
      .toThrow("申請書類が特定できません。正しい申請を選択してください。");
    
    // 承認者IDが空の場合
    expect(() => validateReminderFrequency(applicationId, "", lastReminderDate, currentDate))
      .toThrow("催促対象の承認者が特定できません。");
  });
});