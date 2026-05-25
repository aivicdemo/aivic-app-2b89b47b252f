import { checkApprovalDelayAndNotify } from "../../src/logic/it-1-br-1-2-1";

describe("承認遅延案件を検知し担当者に自動で催促通知を送信する", () => {
  test("// SCEN-432: 承認期限自動設定 - 標準的な申請書類の場合、適切な承認期限が設定される", () => {
    const applicationId = "APP-001";
    const currentDateTime = new Date("2024-02-15T09:00:00Z");
    const approvalDeadline = new Date("2024-02-18T17:00:00Z");
    const reminderSettings = { beforeDays: [3, 1], urgentHours: 24 };
    const approverInfo = {
      id: "APPR001",
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

    const timeUntilDeadline = approvalDeadline.getTime() - currentDateTime.getTime();
    const hoursUntilDeadline = timeUntilDeadline / (1000 * 60 * 60);
    
    expect(hoursUntilDeadline).toBe(80);
    expect(result.shouldNotify).toBe(true);
    expect(result.notificationType).toBe("事前催促");
    expect(result.recipients).toEqual(["tanaka@university.ac.jp"]);
    expect(result.delayStatus).toBe("注意");
    
    const expectedNextReminderTime = new Date("2024-02-17T09:00:00Z");
    expect(result.nextReminderTime.getTime()).toBeCloseTo(expectedNextReminderTime.getTime(), -3);
  });
});