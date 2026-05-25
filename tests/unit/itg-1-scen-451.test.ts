import {
  validateReminderFrequency
} from "../../src/logic/it-1-br-1-2-1";

describe("承認遅延案件を検知し担当者に自動で催促通知を送信する", () => {
  test("催促頻度制限 - 短時間での重複催促が制限される", () => {
    // SCEN-451

    // 前回の催促から2日経過（3日未満）のケース
    const applicationId = "APP123";
    const targetApproverId = "APPROVER001";
    const lastReminderDate = new Date("2024-01-10T10:00:00Z");
    const currentDate = new Date("2024-01-12T10:00:00Z");

    const result = validateReminderFrequency(
      applicationId,
      targetApproverId,
      lastReminderDate,
      currentDate
    );

    // 催促頻度制限により送信不可
    expect(result.canSendReminder).toBe(false);
    expect(result.waitingDays).toBe(2);
    expect(result.nextAllowedDate).toEqual(new Date("2024-01-13T10:00:00Z"));

    // 前回の催促から3日以上経過のケース
    const currentDateAfter3Days = new Date("2024-01-13T10:00:00Z");

    const result2 = validateReminderFrequency(
      applicationId,
      targetApproverId,
      lastReminderDate,
      currentDateAfter3Days
    );

    // 催促送信可能
    expect(result2.canSendReminder).toBe(true);
    expect(result2.waitingDays).toBe(3);
    expect(result2.nextAllowedDate).toBe(null);

    // 初回催促（前回催促がない）のケース
    const result3 = validateReminderFrequency(
      applicationId,
      targetApproverId,
      null,
      currentDate
    );

    expect(result3.canSendReminder).toBe(true);
    expect(result3.waitingDays).toBe(0);
    expect(result3.nextAllowedDate).toBe(null);
  });
});