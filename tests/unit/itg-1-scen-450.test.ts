import { validateReminderFrequency } from "../../src/logic/it-1-br-1-2-1";

describe("承認遅延案件を検知し担当者に自動で催促通知を送信する", () => {
  // SCEN-450
  test("適切な間隔での催促通知が送信される", () => {
    // 前回催促なしの場合（初回催促）
    const result1 = validateReminderFrequency(
      "APP-001",
      "APPROVER-001", 
      null,
      new Date("2024-01-15T10:00:00Z")
    );
    
    expect(result1.canSendReminder).toBe(true);
    expect(result1.waitingDays).toBe(0);
    expect(result1.nextAllowedDate).toBe(null);

    // 前回催促から3日以上経過の場合（送信可能）
    const result2 = validateReminderFrequency(
      "APP-002",
      "APPROVER-002",
      new Date("2024-01-10T10:00:00Z"),
      new Date("2024-01-15T10:00:00Z")
    );
    
    expect(result2.canSendReminder).toBe(true);
    expect(result2.waitingDays).toBe(5);
    expect(result2.nextAllowedDate).toBe(null);

    // 前回催促から3日ちょうどの場合（送信可能）
    const result3 = validateReminderFrequency(
      "APP-003", 
      "APPROVER-003",
      new Date("2024-01-12T10:00:00Z"),
      new Date("2024-01-15T10:00:00Z")
    );
    
    expect(result3.canSendReminder).toBe(true);
    expect(result3.waitingDays).toBe(3);
    expect(result3.nextAllowedDate).toBe(null);

    // 前回催促から3日未満の場合（送信制限）
    const result4 = validateReminderFrequency(
      "APP-004",
      "APPROVER-004", 
      new Date("2024-01-13T10:00:00Z"),
      new Date("2024-01-15T10:00:00Z")
    );
    
    expect(result4.canSendReminder).toBe(false);
    expect(result4.waitingDays).toBe(2);
    expect(result4.nextAllowedDate).toEqual(new Date("2024-01-16T10:00:00Z"));

    // 前回催促から1日の場合（送信制限）
    const result5 = validateReminderFrequency(
      "APP-005",
      "APPROVER-005",
      new Date("2024-01-14T10:00:00Z"), 
      new Date("2024-01-15T10:00:00Z")
    );
    
    expect(result5.canSendReminder).toBe(false);
    expect(result5.waitingDays).toBe(1);
    expect(result5.nextAllowedDate).toEqual(new Date("2024-01-17T10:00:00Z"));

    // 申請書類の識別番号が空の場合（エラー）
    expect(() => validateReminderFrequency(
      "",
      "APPROVER-001",
      null,
      new Date("2024-01-15T10:00:00Z")
    )).toThrow("申請書類が特定できません。正しい申請を選択してください。");

    // 承認者の識別番号が空の場合（エラー）
    expect(() => validateReminderFrequency(
      "APP-001", 
      "",
      null,
      new Date("2024-01-15T10:00:00Z")
    )).toThrow("催促対象の承認者が特定できません。");
  });
});