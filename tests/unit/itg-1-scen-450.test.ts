import { validateReminderFrequency } from "../../src/logic/it-1-br-1-2-1";

describe("承認遅延案件を検知し担当者に自動で催促通知を送信する", () => {
  // SCEN-450: [normal] 催促頻度制限 - 適切な間隔での催促通知が送信される
  test("同一案件・同一承認者への催促通知頻度を制限し、3日間隔でのみ送信を許可する", () => {
    const currentDate = new Date("2024-01-15T10:00:00Z");
    
    // 前回催促から3日経過している場合 - 送信可能
    const lastReminderDate3DaysAgo = new Date("2024-01-12T10:00:00Z");
    const result1 = validateReminderFrequency(
      "APP-001",
      "APPROVER-001", 
      lastReminderDate3DaysAgo,
      currentDate
    );
    expect(result1.canSendReminder).toBe(true);
    expect(result1.waitingDays).toBe(3);
    expect(result1.nextAllowedDate).toBe(null);

    // 前回催促から2日しか経過していない場合 - 送信不可
    const lastReminderDate2DaysAgo = new Date("2024-01-13T10:00:00Z");
    const result2 = validateReminderFrequency(
      "APP-001",
      "APPROVER-001",
      lastReminderDate2DaysAgo,
      currentDate
    );
    expect(result2.canSendReminder).toBe(false);
    expect(result2.waitingDays).toBe(2);
    expect(result2.nextAllowedDate).toEqual(new Date("2024-01-16T10:00:00Z"));

    // 初回催促の場合（前回催促なし） - 送信可能
    const result3 = validateReminderFrequency(
      "APP-001",
      "APPROVER-001",
      null,
      currentDate
    );
    expect(result3.canSendReminder).toBe(true);
    expect(result3.waitingDays).toBe(0);
    expect(result3.nextAllowedDate).toBe(null);

    // 申請書類IDが空の場合 - エラー
    expect(() => validateReminderFrequency(
      "",
      "APPROVER-001",
      lastReminderDate3DaysAgo,
      currentDate
    )).toThrow("申請書類が特定できません。正しい申請を選択してください。");

    // 承認者IDが空の場合 - エラー
    expect(() => validateReminderFrequency(
      "APP-001",
      "",
      lastReminderDate3DaysAgo,
      currentDate
    )).toThrow("催促対象の承認者が特定できません。");
  });
});