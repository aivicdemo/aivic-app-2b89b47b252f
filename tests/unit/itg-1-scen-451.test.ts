import { validateReminderFrequency } from "../../src/logic/it-1-br-1-2-1";

describe("承認遅延案件を検知し担当者に自動で催促通知を送信する", () => {
  // SCEN-451
  test("催促頻度制限 - 短時間での重複催促が制限される", () => {
    // 同一案件・同一承認者への催促頻度が3日以内の場合は制限される
    const applicationId = "APP-2024-001";
    const targetApproverId = "APPROVER-001";
    const lastReminderDate = new Date("2024-01-10T10:00:00Z");
    const currentDate1 = new Date("2024-01-12T10:00:00Z"); // 2日後
    const currentDate2 = new Date("2024-01-13T10:00:00Z"); // 3日後
    const currentDate3 = new Date("2024-01-14T10:00:00Z"); // 4日後

    // 2日後 - 送信不可
    const result1 = validateReminderFrequency(applicationId, targetApproverId, lastReminderDate, currentDate1);
    expect(result1.canSendReminder).toBe(false);
    expect(result1.waitingDays).toBe(2);
    expect(result1.nextAllowedDate).toEqual(new Date("2024-01-13T10:00:00Z"));

    // 3日後 - 送信可能
    const result2 = validateReminderFrequency(applicationId, targetApproverId, lastReminderDate, currentDate2);
    expect(result2.canSendReminder).toBe(true);
    expect(result2.waitingDays).toBe(3);
    expect(result2.nextAllowedDate).toBe(null);

    // 4日後 - 送信可能
    const result3 = validateReminderFrequency(applicationId, targetApproverId, lastReminderDate, currentDate3);
    expect(result3.canSendReminder).toBe(true);
    expect(result3.waitingDays).toBe(4);
    expect(result3.nextAllowedDate).toBe(null);

    // 初回催促（前回催促なし）
    const result4 = validateReminderFrequency(applicationId, targetApproverId, null, currentDate1);
    expect(result4.canSendReminder).toBe(true);
    expect(result4.waitingDays).toBe(0);
    expect(result4.nextAllowedDate).toBe(null);

    // エラーケース: 申請書類ID空
    expect(() => validateReminderFrequency("", targetApproverId, lastReminderDate, currentDate1))
      .toThrow("申請書類が特定できません。正しい申請を選択してください。");

    // エラーケース: 承認者ID空
    expect(() => validateReminderFrequency(applicationId, "", lastReminderDate, currentDate1))
      .toThrow("催促対象の承認者が特定できません。");
  });
});