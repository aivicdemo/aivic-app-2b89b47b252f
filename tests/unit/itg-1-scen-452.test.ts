import { validateReminderFrequency } from "../../src/logic/it-1-br-1-2-1";

describe("承認遅延案件を検知し担当者に自動で催促通知を送信する", () => {
  test("制限期間ギリギリの催促要求が適切に処理される", () => {
    // SCEN-452
    
    // 制限期間ちょうど3日経過（送信可能）
    const exactlyThreeDaysAgo = new Date("2024-01-01T10:00:00Z");
    const currentDate = new Date("2024-01-04T10:00:00Z");
    
    const result1 = validateReminderFrequency(
      "APP001",
      "APPROVER001", 
      exactlyThreeDaysAgo,
      currentDate
    );
    
    expect(result1.canSendReminder).toBe(true);
    expect(result1.waitingDays).toBe(3);
    expect(result1.nextAllowedDate).toBe(null);
    
    // 制限期間直前（2日後 - 送信不可）
    const twoDaysAgo = new Date("2024-01-02T10:00:00Z");
    
    const result2 = validateReminderFrequency(
      "APP002",
      "APPROVER002",
      twoDaysAgo, 
      currentDate
    );
    
    expect(result2.canSendReminder).toBe(false);
    expect(result2.waitingDays).toBe(2);
    expect(result2.nextAllowedDate).toEqual(new Date("2024-01-05T10:00:00Z"));
    
    // 初回送信（最後の催促なし）
    const result3 = validateReminderFrequency(
      "APP003",
      "APPROVER003",
      null,
      currentDate
    );
    
    expect(result3.canSendReminder).toBe(true);
    expect(result3.waitingDays).toBe(0);
    expect(result3.nextAllowedDate).toBe(null);
    
    // 制限期間超過（4日経過 - 送信可能）
    const fourDaysAgo = new Date("2023-12-31T10:00:00Z");
    
    const result4 = validateReminderFrequency(
      "APP004", 
      "APPROVER004",
      fourDaysAgo,
      currentDate
    );
    
    expect(result4.canSendReminder).toBe(true);
    expect(result4.waitingDays).toBe(4);
    expect(result4.nextAllowedDate).toBe(null);
  });
});