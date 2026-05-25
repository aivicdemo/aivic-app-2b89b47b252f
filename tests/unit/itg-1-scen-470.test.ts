import { checkApprovalDelayAndNotify } from "../../src/logic/it-1-br-1-2-1";

describe("承認遅延案件を検知し担当者に自動で催促通知を送信する", () => {
  test("通知タイミング設定が無効な場合、エラーが発生する", () => {
    // SCEN-470
    const applicationId = "APP001";
    const currentDateTime = new Date("2024-01-15T10:00:00Z");
    const approvalDeadline = new Date("2024-01-10T17:00:00Z");
    const reminderSettings = { beforeDays: [], urgentHours: -5 };
    const approverInfo = {
      id: "APPROVER001",
      name: "田中部長",
      email: "tanaka@university.ac.jp",
      department: "総務部"
    };

    expect(() => {
      checkApprovalDelayAndNotify(
        applicationId,
        currentDateTime,
        approvalDeadline,
        reminderSettings,
        approverInfo
      );
    }).toThrow("催促通知のタイミング設定が正しくありません。システム管理者にお問い合わせください。");
  });
});