import { validateReminderFrequency } from "../../src/logic/it-1-br-1-2-1";

describe("承認遅延案件を検知し担当者に自動で催促通知を送信する", () => {
  test("催促通知の送信頻度制限により短時間での重複催促が防止される", () => {
    // SCEN-451

    const applicationId = "APP001";
    const targetApproverId = "APPROVER001";
    const currentDate = new Date("2024-01-15T10:00:00Z");

    // 前回催促から1日経過（3日未満なので制限対象）
    const lastReminderDate1Day = new Date("2024-01-14T10:00:00Z");
    const result1 = validateReminderFrequency(
      applicationId,
      targetApproverId,
      lastReminderDate1Day,
      currentDate
    );
    
    expect(result1.canSendReminder).toBe(false);
    expect(result1.waitingDays).toBe(1);
    expect(result1.nextAllowedDate).toEqual(new Date("2024-01-17T10:00:00Z"));

    // 前回催促から2日経過（3日未満なので制限対象）
    const lastReminderDate2Days = new Date("2024-01-13T10:00:00Z");
    const result2 = validateReminderFrequency(
      applicationId,
      targetApproverId,
      lastReminderDate2Days,
      currentDate
    );
    
    expect(result2.canSendReminder).toBe(false);
    expect(result2.waitingDays).toBe(2);
    expect(result2.nextAllowedDate).toEqual(new Date("2024-01-16T10:00:00Z"));

    // 前回催促から3日経過（制限解除）
    const lastReminderDate3Days = new Date("2024-01-12T10:00:00Z");
    const result3 = validateReminderFrequency(
      applicationId,
      targetApproverId,
      lastReminderDate3Days,
      currentDate
    );
    
    expect(result3.canSendReminder).toBe(true);
    expect(result3.waitingDays).toBe(3);
    expect(result3.nextAllowedDate).toBe(null);

    // 前回催促から7日経過（送信可能）
    const lastReminderDate7Days = new Date("2024-01-08T10:00:00Z");
    const result4 = validateReminderFrequency(
      applicationId,
      targetApproverId,
      lastReminderDate7Days,
      currentDate
    );
    
    expect(result4.canSendReminder).toBe(true);
    expect(result4.waitingDays).toBe(7);
    expect(result4.nextAllowedDate).toBe(null);

    // 前回催促履歴が存在しない場合（初回催促）
    const result5 = validateReminderFrequency(
      applicationId,
      targetApproverId,
      null,
      currentDate
    );
    
    expect(result5.canSendReminder).toBe(true);
    expect(result5.waitingDays).toBe(0);
    expect(result5.nextAllowedDate).toBe(null);

    // エラーケース: 申請書類の識別番号が空
    expect(() => validateReminderFrequency(
      "",
      targetApproverId,
      lastReminderDate1Day,
      currentDate
    )).toThrow("申請書類が特定できません。正しい申請を選択してください。");

    // エラーケース: 承認者の識別番号が空
    expect(() => validateReminderFrequency(
      applicationId,
      "",
      lastReminderDate1Day,
      currentDate
    )).toThrow("催促対象の承認者が特定できません。");
  });
});