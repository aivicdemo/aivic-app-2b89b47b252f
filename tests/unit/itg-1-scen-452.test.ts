import { validateReminderFrequency } from "../../src/logic/it-1-br-1-2-1";

describe("承認遅延案件を検知し担当者に自動で催促通知を送信する", () => {
  test("制限期間ギリギリの催促要求が適切に処理される", () => {
    // SCEN-452

    // 72時間前（3日前）に催促通知を送信済み - 制限ギリギリ
    const applicationId = "APP-2024-001";
    const targetApproverId = "APPROVER-001";
    const lastReminderDate = new Date("2024-01-12T10:00:00Z");
    const currentDate = new Date("2024-01-15T10:00:00Z");

    const result = validateReminderFrequency(
      applicationId,
      targetApproverId,
      lastReminderDate,
      currentDate
    );

    // 前回催促から経過した日数を計算
    const expectedWaitingDays = Math.floor((currentDate.getTime() - lastReminderDate.getTime()) / (1000 * 60 * 60 * 24));
    
    expect(result.canSendReminder).toBe(true);
    expect(result.waitingDays).toBe(expectedWaitingDays);
    expect(result.nextAllowedDate).toBe(null);
  });
});