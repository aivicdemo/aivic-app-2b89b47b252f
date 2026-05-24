import {
  checkApprovalDelayAndNotify
} from "../../src/logic/it-1-br-1-2-1";

describe("承認遅延案件を検知し担当者に自動で催促通知を送信する", () => {
  test("催促タイミングに到達した案件に通知が送信される", () => {
    // SCEN-487
    
    // 現在日時: 2024年1月15日 10:00
    const currentDateTime = new Date("2024-01-15T10:00:00Z");
    
    // 承認期限: 2024年1月16日 17:00（残り31時間 = 1日前の催促タイミング）
    const approvalDeadline = new Date("2024-01-16T17:00:00Z");
    
    // 催促設定: 3日前、1日前に通知
    const reminderSettings = {
      beforeDays: [3, 1],
      urgentHours: 6
    };
    
    // 承認者情報
    const approverInfo = {
      id: "APP001",
      name: "田中部長",
      email: "tanaka@university.ac.jp",
      department: "総務部"
    };
    
    const result = checkApprovalDelayAndNotify(
      "REQ20240115001",
      currentDateTime,
      approvalDeadline,
      reminderSettings,
      approverInfo
    );
    
    // 期限まで31時間（24時間 < 31時間 < 48時間）なので1日前の事前催促に該当
    expect(result.shouldNotify).toBe(true);
    expect(result.notificationType).toBe("事前催促");
    expect(result.recipients).toEqual(["tanaka@university.ac.jp"]);
    expect(result.delayStatus).toBe("注意");
    expect(result.nextReminderTime).toEqual(new Date("2024-01-16T10:00:00Z"));
    
    // 緊急催促ケース（期限を2時間過ぎた場合）
    const overdueDateTime = new Date("2024-01-16T19:00:00Z");
    const overdueResult = checkApprovalDelayAndNotify(
      "REQ20240115002", 
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
    expect(overdueResult.nextReminderTime).toEqual(new Date("2024-01-17T01:00:00Z"));
    
    // 正常範囲内（催促不要）
    const normalDateTime = new Date("2024-01-14T10:00:00Z");
    const normalResult = checkApprovalDelayAndNotify(
      "REQ20240115003",
      normalDateTime, 
      approvalDeadline,
      reminderSettings,
      approverInfo
    );
    
    expect(normalResult.shouldNotify).toBe(false);
    expect(normalResult.notificationType).toBe("");
    expect(normalResult.delayStatus).toBe("正常");
  });
});