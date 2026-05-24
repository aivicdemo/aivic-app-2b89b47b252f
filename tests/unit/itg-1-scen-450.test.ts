import { validateReminderFrequency } from "../../src/logic/it-1-br-1-2-1";

describe("承認遅延案件を検知し担当者に自動で催促通知を送信する", () => {
  test("催促頻度制限 - 適切な間隔での催促通知が送信される", () => {
    // SCEN-450

    const currentDate = new Date();
    
    // 前回催促から3日以上経過している場合（送信可能）
    const lastReminderDate3DaysAgo = new Date(currentDate.getTime() - 3 * 24 * 60 * 60 * 1000);
    const result1 = validateReminderFrequency(
      "APP-001",
      "APPROVER-001", 
      lastReminderDate3DaysAgo,
      currentDate
    );
    
    expect(result1.canSendReminder).toBe(true);
    expect(result1.waitingDays).toBe(3);
    expect(result1.nextAllowedDate).toBe(null);

    // 前回催促から2日しか経過していない場合（送信不可）
    const lastReminderDate2DaysAgo = new Date(currentDate.getTime() - 2 * 24 * 60 * 60 * 1000);
    const result2 = validateReminderFrequency(
      "APP-002",
      "APPROVER-002",
      lastReminderDate2DaysAgo, 
      currentDate
    );
    
    expect(result2.canSendReminder).toBe(false);
    expect(result2.waitingDays).toBe(2);
    const expectedNextAllowedDate = new Date(lastReminderDate2DaysAgo.getTime() + 3 * 24 * 60 * 60 * 1000);
    expect(result2.nextAllowedDate).toEqual(expectedNextAllowedDate);

    // 初回催促の場合（前回送信履歴なし）
    const result3 = validateReminderFrequency(
      "APP-003",
      "APPROVER-003",
      null,
      currentDate
    );
    
    expect(result3.canSendReminder).toBe(true);
    expect(result3.waitingDays).toBe(0);
    expect(result3.nextAllowedDate).toBe(null);

    // 制約確認：申請書類の識別番号が空の場合
    expect(() => {
      validateReminderFrequency("", "APPROVER-001", lastReminderDate3DaysAgo, currentDate);
    }).toThrow("申請書類が特定できません。正しい申請を選択してください。");

    // 制約確認：承認者の識別番号が空の場合
    expect(() => {
      validateReminderFrequency("APP-001", "", lastReminderDate3DaysAgo, currentDate);
    }).toThrow("催促対象の承認者が特定できません。");
  });
});