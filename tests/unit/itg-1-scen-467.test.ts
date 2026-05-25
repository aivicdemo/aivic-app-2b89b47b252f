import { checkApprovalDelayAndNotify } from '../../src/logic/it-1-br-1-2-1';

describe('承認遅延案件を検知し担当者に自動で催促通知を送信する', () => {
  test('緊急度判定に失敗した場合、デフォルト優先度が適用される', () => {
    // SCEN-467
    const applicationId = "APP-2024-001";
    const currentDateTime = new Date("2024-01-15T11:00:00Z");
    const approvalDeadline = new Date("2024-01-10T17:00:00Z");
    const reminderSettings = { beforeDays: [3, 1], urgentHours: 24 };
    const approverInfo = { id: "USER001", name: "田中太郎", email: "tanaka@university.ac.jp", department: "総務課" };

    const result = checkApprovalDelayAndNotify(applicationId, currentDateTime, approvalDeadline, reminderSettings, approverInfo);

    expect(result.shouldNotify).toBe(true);
    expect(result.notificationType).toBe("緊急催促");
    expect(result.recipients).toEqual(["tanaka@university.ac.jp", "applicant@university.ac.jp", "manager@university.ac.jp"]);
    expect(result.delayStatus).toBe("緊急");
    expect(result.nextReminderTime).toBeNull();
  });
});