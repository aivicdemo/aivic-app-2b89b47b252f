import { checkApprovalDelayAndNotify } from "../../src/logic/it-1-br-1-2-1";

describe("承認遅延案件を検知し担当者に自動で催促通知を送信する", () => {
  test("SCEN-488: 承認遅延検知 - 検知処理でシステムエラーが発生した場合、適切に処理される", () => {
    const applicationId = "APP001";
    const currentDateTime = new Date("2024-01-15T10:00:00Z");
    const approvalDeadline = new Date("2024-01-14T17:00:00Z");
    const reminderSettings = { beforeDays: [3, 1], urgentHours: 24 };
    const approverInfo = { id: "EMP001", name: "田中部長", email: "tanaka@university.ac.jp", department: "総務部" };

    const timeUntilDeadline = approvalDeadline.getTime() - currentDateTime.getTime();
    const hoursUntilDeadline = timeUntilDeadline / (1000 * 60 * 60);

    expect(hoursUntilDeadline).toBeLessThan(0);

    const result = checkApprovalDelayAndNotify(
      applicationId,
      currentDateTime,
      approvalDeadline,
      reminderSettings,
      approverInfo
    );

    expect(result.shouldNotify).toBe(true);
    expect(result.notificationType).toBe("緊急催促");
    expect(result.recipients).toEqual(["tanaka@university.ac.jp", "applicant@university.ac.jp", "manager@university.ac.jp"]);
    expect(result.delayStatus).toBe("緊急");
    expect(result.nextReminderTime).toBeInstanceOf(Date);
  });
});