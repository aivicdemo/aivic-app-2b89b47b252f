import { validateReminderFrequency } from "../../src/logic/it-1-br-1-2-1";

describe("承認遅延案件を検知し担当者に自動で催促通知を送信する", () => {
  test("制限期間ギリギリの催促要求が適切に処理される", () => {
    // SCEN-452
    
    // 最後の催促から2日と23時間59分経過（3日まであと1分）
    const lastReminderDate = new Date("2024-01-10T10:00:00");
    const currentDate = new Date("2024-01-13T09:59:00");
    
    // 3日経過していないため送信不可
    const result1 = validateReminderFrequency(
      "APP-001",
      "APPROVER-001", 
      lastReminderDate,
      currentDate
    );
    
    expect(result1.canSendReminder).toBe(false);
    expect(result1.waitingDays).toBe(2);
    expect(result1.nextAllowedDate).toEqual(new Date("2024-01-13T10:00:00"));
    
    // 3日ちょうど経過した場合（送信可能）
    const currentDate2 = new Date("2024-01-13T10:00:00");
    
    const result2 = validateReminderFrequency(
      "APP-001",
      "APPROVER-001",
      lastReminderDate,
      currentDate2
    );
    
    expect(result2.canSendReminder).toBe(true);
    expect(result2.waitingDays).toBe(3);
    expect(result2.nextAllowedDate).toBe(null);
    
    // 初回催促の場合（前回催促なし）
    const result3 = validateReminderFrequency(
      "APP-002",
      "APPROVER-002",
      null,
      currentDate2
    );
    
    expect(result3.canSendReminder).toBe(true);
    expect(result3.waitingDays).toBe(0);
    expect(result3.nextAllowedDate).toBe(null);
  });
});