import { checkApprovalDelayAndNotify } from '../../src/logic/it-1-br-1-2-1';

describe('承認遅延案件を検知し担当者に自動で催促通知を送信する', () => {
  test('緊急案件の場合、短縮された承認期限が設定される', () => {
    // SCEN-433
    const applicationId = "APP-2024-001";
    const currentDateTime = new Date("2024-01-15T14:00:00Z");
    const approvalDeadline = new Date("2024-01-16T09:00:00Z");
    const reminderSettings = { beforeDays: [3, 1], urgentHours: 12 };
    const approverInfo = { 
      id: "USR-001", 
      name: "田中部長", 
      email: "tanaka@university.ac.jp", 
      department: "総務部" 
    };

    const result = checkApprovalDelayAndNotify(
      applicationId,
      currentDateTime,
      approvalDeadline,
      reminderSettings,
      approverInfo
    );

    // 期限まで19時間なので緊急催促対象
    expect(result.shouldNotify).toBe(true);
    expect(result.notificationType).toBe("遅延警告");
    expect(result.recipients).toEqual(["tanaka@university.ac.jp", "applicant@university.ac.jp", "manager@university.ac.jp"]);
    expect(result.delayStatus).toBe("遅延");
    expect(result.nextReminderTime).toEqual(new Date("2024-01-16T03:00:00Z"));
  });
});