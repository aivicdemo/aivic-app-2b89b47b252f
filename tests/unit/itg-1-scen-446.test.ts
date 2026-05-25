import { checkApprovalDelayAndNotify } from "../../src/logic/it-1-br-1-2-1";

describe("承認遅延案件を検知し担当者に自動で催促通知を送信する", () => {
  test("期限ちょうどの案件の取扱いが適切に判定される", () => {
    // SCEN-446
    const currentDateTime = new Date("2024-03-15T14:00:00Z");
    const approvalDeadline = new Date("2024-03-15T14:00:00Z"); // 期限ちょうど
    const applicationId = "APP-2024-0315";
    const reminderSettings = {
      beforeDays: [3, 1],
      urgentHours: 6
    };
    const approverInfo = {
      id: "approver001",
      name: "承認者田中",
      email: "tanaka@university.ac.jp",
      department: "総務課"
    };

    // 期限ちょうど（残り0時間）の場合、緊急催促として判定される
    const timeUntilDeadline = approvalDeadline.getTime() - currentDateTime.getTime();
    const hoursUntilDeadline = timeUntilDeadline / (1000 * 60 * 60); // 0時間
    
    const result = checkApprovalDelayAndNotify(
      applicationId,
      currentDateTime,
      approvalDeadline,
      reminderSettings,
      approverInfo
    );

    // 期限ちょうど（0時間）なので緊急催促と判定される
    expect(result.shouldNotify).toBe(true);
    expect(result.notificationType).toBe("緊急催促");
    expect(result.delayStatus).toBe("緊急");
    
    // 通知先は承認者本人＋申請者＋管理者
    expect(result.recipients).toEqual([
      "tanaka@university.ac.jp",
      "applicant@university.ac.jp",
      "manager@university.ac.jp"
    ]);

    // 次回催促時刻は設定される（計算ロジックに依存）
    expect(result.nextReminderTime).toBeInstanceOf(Date);
  });
});