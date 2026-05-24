import { checkApprovalDelayAndNotify } from "../../src/logic/it-1-br-1-2-1";

describe("承認遅延案件を検知し担当者に自動で催促通知を送信する", () => {
  test("承認期限を過ぎた案件が正しく検知される", () => {
    // SCEN-486
    
    // 期限を過ぎているケース
    const currentDateTime = new Date("2024-01-15T10:00:00Z");
    const approvalDeadline = new Date("2024-01-14T17:00:00Z");
    const reminderSettings = { beforeDays: [3, 1], urgentHours: 24 };
    const approverInfo = { 
      id: "A001", 
      name: "田中太郎", 
      email: "tanaka@university.ac.jp", 
      department: "総務部" 
    };

    const result = checkApprovalDelayAndNotify(
      "APP-001",
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
    expect(result.nextReminderTime).toBeInstanceOf(Date);

    // 期限内だが警告レベルのケース
    const currentDateTime2 = new Date("2024-01-14T15:00:00Z");
    const approvalDeadline2 = new Date("2024-01-14T17:00:00Z");
    
    const result2 = checkApprovalDelayAndNotify(
      "APP-002",
      currentDateTime2,
      approvalDeadline2,
      reminderSettings,
      approverInfo
    );

    expect(result2.shouldNotify).toBe(true);
    expect(result2.notificationType).toBe("遅延警告");
    expect(result2.recipients).toEqual([
      "tanaka@university.ac.jp",
      "applicant@university.ac.jp", 
      "manager@university.ac.jp"
    ]);
    expect(result2.delayStatus).toBe("遅延");

    // 事前催促のケース（1日前）
    const currentDateTime3 = new Date("2024-01-13T17:00:00Z");
    const approvalDeadline3 = new Date("2024-01-14T17:00:00Z");
    
    const result3 = checkApprovalDelayAndNotify(
      "APP-003", 
      currentDateTime3,
      approvalDeadline3,
      reminderSettings,
      approverInfo
    );

    expect(result3.shouldNotify).toBe(true);
    expect(result3.notificationType).toBe("事前催促");
    expect(result3.recipients).toEqual(["tanaka@university.ac.jp"]);
    expect(result3.delayStatus).toBe("注意");

    // まだ催促不要なケース
    const currentDateTime4 = new Date("2024-01-10T10:00:00Z");
    const approvalDeadline4 = new Date("2024-01-14T17:00:00Z");
    
    const result4 = checkApprovalDelayAndNotify(
      "APP-004",
      currentDateTime4,
      approvalDeadline4,
      reminderSettings,
      approverInfo
    );

    expect(result4.shouldNotify).toBe(false);
    expect(result4.delayStatus).toBe("正常");

    // エラーケース
    expect(() => checkApprovalDelayAndNotify(
      "",
      currentDateTime,
      approvalDeadline,
      reminderSettings,
      approverInfo
    )).toThrow("申請案件が特定できません。正しい申請番号を指定してください。");

    expect(() => checkApprovalDelayAndNotify(
      "APP-001",
      currentDateTime,
      null as any,
      reminderSettings,
      approverInfo
    )).toThrow("承認期限が設定されていないため、遅延検知ができません。");
  });
});