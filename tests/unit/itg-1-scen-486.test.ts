import { checkApprovalDelayAndNotify } from "../../src/logic/it-1-br-1-2-1";

describe("承認遅延案件を検知し担当者に自動で催促通知を送信する", () => {
  test("承認期限を過ぎた案件が正しく検知される", () => {
    // SCEN-486
    
    // 現在日時（期限を1日過ぎた状況）
    const currentDateTime = new Date("2024-01-16T10:00:00Z");
    
    // 承認期限（昨日の23:59）
    const approvalDeadline = new Date("2024-01-15T23:59:00Z");
    
    // 催促設定
    const reminderSettings = {
      beforeDays: [3, 1],
      urgentHours: 24
    };
    
    // 承認者情報
    const approverInfo = {
      id: "approver001",
      name: "田中部長",
      email: "tanaka@university.ac.jp",
      department: "総務部"
    };
    
    const result = checkApprovalDelayAndNotify(
      "APP-2024-001",
      currentDateTime,
      approvalDeadline,
      reminderSettings,
      approverInfo
    );
    
    // 期限超過で緊急催促が必要
    expect(result.shouldNotify).toBe(true);
    expect(result.notificationType).toBe("緊急催促");
    expect(result.delayStatus).toBe("緊急");
    
    // 通知受信者に承認者、申請者、管理者が含まれる
    expect(result.recipients).toEqual([
      "tanaka@university.ac.jp",
      "applicant@university.ac.jp",
      "manager@university.ac.jp"
    ]);
    
    // 次回催促時刻は設定される
    expect(result.nextReminderTime).toBeInstanceOf(Date);
  });
});