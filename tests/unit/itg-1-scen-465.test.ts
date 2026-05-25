import { checkApprovalDelayAndNotify } from '../../src/logic/it-1-br-1-2-1';

describe('承認遅延案件を検知し担当者に自動で催促通知を送信する', () => {
  test('通知優先度判定 - 高緊急度案件が即座に通知される', () => {
    // SCEN-465
    const applicationId = "APP-001";
    const currentDateTime = new Date("2024-01-15T10:00:00Z");
    const approvalDeadline = new Date("2024-01-15T09:00:00Z"); // 1時間前に期限切れ
    const reminderSettings = { beforeDays: [3, 1], urgentHours: 24 };
    const approverInfo = {
      id: "APPROVER-001",
      name: "田中課長",
      email: "tanaka@university.ac.jp",
      department: "総務課"
    };

    const result = checkApprovalDelayAndNotify(
      applicationId,
      currentDateTime,
      approvalDeadline,
      reminderSettings,
      approverInfo
    );

    // 期限を1時間過ぎているため緊急催促が必要
    expect(result.shouldNotify).toBe(true);
    expect(result.notificationType).toBe("緊急催促");
    expect(result.recipients).toEqual([
      "tanaka@university.ac.jp",
      "applicant@university.ac.jp", 
      "manager@university.ac.jp"
    ]);
    expect(result.delayStatus).toBe("緊急");
    expect(result.nextReminderTime).toBeNull();
  });
});