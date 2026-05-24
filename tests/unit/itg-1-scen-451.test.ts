import { validateReminderFrequency } from "../../src/logic/it-1-br-1-2-1";

describe("承認遅延案件を検知し担当者に自動で催促通知を送信する", () => {
  test("同一案件・同一承認者に対する催促通知の送信頻度が3日以内の場合は制限される", () => {
    // SCEN-451
    
    const applicationId = "APP-2024-001";
    const targetApproverId = "APPROVER-001";
    const currentDate = new Date("2024-01-15T10:00:00Z");
    
    // 3日経過していない場合（2日前に送信済み）
    const lastReminderDate2DaysAgo = new Date("2024-01-13T10:00:00Z");
    const result1 = validateReminderFrequency(
      applicationId,
      targetApproverId,
      lastReminderDate2DaysAgo,
      currentDate
    );
    
    expect(result1.canSendReminder).toBe(false);
    expect(result1.waitingDays).toBe(2);
    expect(result1.nextAllowedDate).toEqual(new Date("2024-01-16T10:00:00Z"));
    
    // 3日経過している場合（3日前に送信済み）
    const lastReminderDate3DaysAgo = new Date("2024-01-12T10:00:00Z");
    const result2 = validateReminderFrequency(
      applicationId,
      targetApproverId,
      lastReminderDate3DaysAgo,
      currentDate
    );
    
    expect(result2.canSendReminder).toBe(true);
    expect(result2.waitingDays).toBe(3);
    expect(result2.nextAllowedDate).toBe(null);
    
    // 初回催促の場合（前回催促履歴なし）
    const result3 = validateReminderFrequency(
      applicationId,
      targetApproverId,
      null,
      currentDate
    );
    
    expect(result3.canSendReminder).toBe(true);
    expect(result3.waitingDays).toBe(0);
    expect(result3.nextAllowedDate).toBe(null);
    
    // エラーケース：申請書類ID未指定
    expect(() => validateReminderFrequency(
      "",
      targetApproverId,
      lastReminderDate2DaysAgo,
      currentDate
    )).toThrow("申請書類が特定できません。正しい申請を選択してください。");
    
    // エラーケース：承認者ID未指定
    expect(() => validateReminderFrequency(
      applicationId,
      "",
      lastReminderDate2DaysAgo,
      currentDate
    )).toThrow("催促対象の承認者が特定できません。");
  });
});