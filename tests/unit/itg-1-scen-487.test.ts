import { checkApprovalDelayAndNotify } from "../../src/logic/it-1-br-1-2-1";

describe("承認遅延案件を検知し担当者に自動で催促通知を送信する", () => {
  test("承認期限を過ぎた案件で緊急催促通知が送信される", () => {
    // SCEN-487
    const applicationId = "APP-001";
    const currentDateTime = new Date("2024-03-15T10:00:00Z");
    const approvalDeadline = new Date("2024-03-14T17:00:00Z"); // 期限を過ぎている
    const reminderSettings = {
      beforeDays: [3, 1],
      urgentHours: 6
    };
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