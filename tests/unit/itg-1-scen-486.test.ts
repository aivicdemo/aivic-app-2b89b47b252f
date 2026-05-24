import { checkApprovalDelayAndNotify } from "../../src/logic/it-1-br-1-2-1";

describe("承認遅延案件を検知し担当者に自動で催促通知を送信する", () => {
  test("承認期限を過ぎた案件が正しく検知され催促通知が送信される", () => {
    // SCEN-486
    const applicationId = "APP-001";
    const currentDateTime = new Date("2024-01-15T14:00:00Z");
    const approvalDeadline = new Date("2024-01-14T17:00:00Z"); // 期限を過ぎている
    const reminderSettings = { beforeDays: [3, 1], urgentHours: 24 };
    const approverInfo = {
      id: "approver-001",
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

    // 期限を21時間過ぎているため緊急催促が必要
    expect(result.shouldNotify).toBe(true);
    expect(result.notificationType).toBe("緊急催促");
    expect(result.recipients).toEqual([
      "tanaka@university.ac.jp",
      "applicant@university.ac.jp",
      "manager@university.ac.jp"
    ]);
    expect(result.delayStatus).toBe("緊急");
    expect(result.nextReminderTime).toBeNull(); // 緊急時は次回催促時刻なし

    // 期限前の事前催促ケース
    const beforeDeadline = new Date("2024-01-12T14:00:00Z");
    const resultBefore = checkApprovalDelayAndNotify(
      applicationId,
      beforeDeadline,
      approvalDeadline,
      reminderSettings,
      approverInfo
    );

    // 期限2日前なので事前催促
    expect(resultBefore.shouldNotify).toBe(true);
    expect(resultBefore.notificationType).toBe("事前催促");
    expect(resultBefore.recipients).toEqual(["tanaka@university.ac.jp"]);
    expect(resultBefore.delayStatus).toBe("注意");

    // 制約違反：申請案件の識別番号が空
    expect(() => checkApprovalDelayAndNotify(
      "",
      currentDateTime,
      approvalDeadline,
      reminderSettings,
      approverInfo
    )).toThrow("申請案件が特定できません。正しい申請番号を指定してください。");

    // 制約違反：承認期限が設定されていない
    expect(() => checkApprovalDelayAndNotify(
      applicationId,
      currentDateTime,
      null as any,
      reminderSettings,
      approverInfo
    )).toThrow("承認期限が設定されていないため、遅延検知ができません。");
  });
});