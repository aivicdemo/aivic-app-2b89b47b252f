import { checkApprovalDelayAndNotify } from '../../src/logic/it-1-br-1-2-1';

describe("承認遅延案件を検知し担当者に自動で催促通知を送信する", () => {
  test("承認遅延検知 - 催促タイミングに到達した案件に通知が送信される", () => {
    // SCEN-487
    
    // 3営業日前に開始された申請案件（遅延警告レベル）
    const applicationId = "APP-2024-001";
    const currentDateTime = new Date("2024-01-15T14:00:00Z");
    const approvalDeadline = new Date("2024-01-15T17:00:00Z"); // 3時間後が期限
    const reminderSettings = {
      beforeDays: [3, 1],
      urgentHours: 6
    };
    const approverInfo = {
      id: "APPROVER001",
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

    // 期限まで3時間（6時間以内）のため遅延警告として通知が必要
    expect(result.shouldNotify).toBe(true);
    expect(result.notificationType).toBe("遅延警告");
    expect(result.recipients).toEqual([
      "tanaka@university.ac.jp",
      "applicant@university.ac.jp",
      "manager@university.ac.jp"
    ]);
    expect(result.delayStatus).toBe("遅延");
    expect(result.nextReminderTime).toEqual(new Date("2024-01-15T17:00:00Z"));
  });
});