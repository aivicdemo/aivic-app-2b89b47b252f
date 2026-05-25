import { checkApprovalDelayAndNotify } from "../../src/logic/it-1-br-1-2-1";

describe("承認遅延案件を検知し担当者に自動で催促通知を送信する", () => {
  test("文書種別が不明な場合、デフォルト期限が適用される", () => {
    // SCEN-434
    const applicationId = "APP-2024-001";
    const currentDateTime = new Date("2024-01-15T14:30:00Z");
    const approvalDeadline = new Date("2024-01-12T17:00:00Z"); // 3日前が期限
    const reminderSettings = {
      beforeDays: [3, 1],
      urgentHours: 24
    };
    const approverInfo = {
      id: "approver001",
      name: "承認者太郎",
      email: "approver@university.ac.jp",
      department: "総務課"
    };

    const result = checkApprovalDelayAndNotify(
      applicationId,
      currentDateTime,
      approvalDeadline,
      reminderSettings,
      approverInfo
    );

    // 期限を72時間（3日）超過しているため緊急催促が必要
    const hoursOverdue = (currentDateTime.getTime() - approvalDeadline.getTime()) / (1000 * 60 * 60);
    expect(Math.floor(hoursOverdue)).toBe(69); // 約69時間超過

    expect(result.shouldNotify).toBe(true);
    expect(result.notificationType).toBe("緊急催促");
    expect(result.recipients).toEqual([
      "approver@university.ac.jp",
      "applicant@university.ac.jp",
      "manager@university.ac.jp"
    ]);
    expect(result.delayStatus).toBe("緊急");

    // 次回催促時刻は現在時刻から24時間後（緊急時の標準間隔）
    const expectedNextReminder = new Date(currentDateTime.getTime() + 24 * 60 * 60 * 1000);
    expect(result.nextReminderTime).toEqual(expectedNextReminder);
  });
});