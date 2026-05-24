import { checkApprovalDelayAndNotify } from "../../src/logic/it-1-br-1-2-1";

describe("承認遅延案件を検知し担当者に自動で催促通知を送信する", () => {
  test("催促タイミングに到達した案件に通知が送信される", () => {
    // SCEN-487
    
    // 期限の3日前（事前催促）のケース
    const currentDateTime = new Date("2024-01-15T10:00:00Z");
    const approvalDeadline = new Date("2024-01-18T17:00:00Z");
    const reminderSettings = { 
      beforeDays: [3, 1], 
      urgentHours: 24 
    };
    const approverInfo = { 
      id: "approver001", 
      name: "田中部長", 
      email: "tanaka@university.ac.jp", 
      department: "総務部" 
    };

    const result = checkApprovalDelayAndNotify(
      "APP001",
      currentDateTime,
      approvalDeadline,
      reminderSettings,
      approverInfo
    );

    const timeUntilDeadline = approvalDeadline.getTime() - currentDateTime.getTime();
    const hoursUntilDeadline = timeUntilDeadline / (1000 * 60 * 60);
    const expectedNextReminderTime = new Date(currentDateTime.getTime() + 24 * 60 * 60 * 1000);

    expect(result.shouldNotify).toBe(true);
    expect(result.notificationType).toBe("事前催促");
    expect(result.recipients).toEqual(["tanaka@university.ac.jp"]);
    expect(result.delayStatus).toBe("注意");
    expect(result.nextReminderTime).toEqual(expectedNextReminderTime);

    // 期限超過（緊急催促）のケース
    const overdueDateTime = new Date("2024-01-19T10:00:00Z");
    const overdueResult = checkApprovalDelayAndNotify(
      "APP002",
      overdueDateTime,
      approvalDeadline,
      reminderSettings,
      approverInfo
    );

    expect(overdueResult.shouldNotify).toBe(true);
    expect(overdueResult.notificationType).toBe("緊急催促");
    expect(overdueResult.recipients).toEqual([
      "tanaka@university.ac.jp",
      "applicant@university.ac.jp",
      "manager@university.ac.jp"
    ]);
    expect(overdueResult.delayStatus).toBe("緊急");

    // 緊急時間以内（遅延警告）のケース
    const urgentDateTime = new Date("2024-01-18T01:00:00Z");
    const urgentResult = checkApprovalDelayAndNotify(
      "APP003",
      urgentDateTime,
      approvalDeadline,
      reminderSettings,
      approverInfo
    );

    expect(urgentResult.shouldNotify).toBe(true);
    expect(urgentResult.notificationType).toBe("遅延警告");
    expect(urgentResult.delayStatus).toBe("遅延");
  });
});