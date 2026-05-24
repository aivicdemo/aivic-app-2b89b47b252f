import { checkApprovalDelayAndNotify } from "../../src/logic/it-1-br-1-2-1";

describe("承認遅延案件を検知し担当者に自動で催促通知を送信する", () => {
  test("承認遅延検知でシステムエラーが発生した場合、適切に処理される", () => {
    // SCEN-488
    
    // 正常な入力データで動作確認
    const validApplicationId = "APP-2024-001";
    const validCurrentDateTime = new Date("2024-01-15T10:00:00Z");
    const validApprovalDeadline = new Date("2024-01-10T17:00:00Z");
    const validReminderSettings = {
      beforeDays: [3, 1],
      urgentHours: 24
    };
    const validApproverInfo = {
      id: "APPROVER-001",
      name: "承認者田中",
      email: "tanaka@university.ac.jp",
      department: "総務部"
    };

    // 期限超過による緊急催促ケース
    const timeUntilDeadline = validApprovalDeadline.getTime() - validCurrentDateTime.getTime();
    const hoursUntilDeadline = timeUntilDeadline / (1000 * 60 * 60);
    expect(hoursUntilDeadline).toBe(-120); // 5日遅延
    
    const result = checkApprovalDelayAndNotify(
      validApplicationId,
      validCurrentDateTime,
      validApprovalDeadline,
      validReminderSettings,
      validApproverInfo
    );

    expect(result.shouldNotify).toBe(true);
    expect(result.notificationType).toBe("緊急催促");
    expect(result.delayStatus).toBe("緊急");
    expect(result.recipients).toEqual([
      "tanaka@university.ac.jp",
      "applicant@university.ac.jp",
      "manager@university.ac.jp"
    ]);

    // 無効な申請案件IDでエラー処理
    expect(() => {
      checkApprovalDelayAndNotify(
        "",
        validCurrentDateTime,
        validApprovalDeadline,
        validReminderSettings,
        validApproverInfo
      );
    }).toThrow("申請案件が特定できません。正しい申請番号を指定してください。");

    // 承認期限未設定でエラー処理
    expect(() => {
      checkApprovalDelayAndNotify(
        validApplicationId,
        validCurrentDateTime,
        new Date(""),
        validReminderSettings,
        validApproverInfo
      );
    }).toThrow("承認期限が設定されていないため、遅延検知ができません。");

    // 承認者情報不完全で警告
    const incompleteApproverInfo = {
      id: "APPROVER-002",
      name: "",
      email: "",
      department: "不明"
    };

    // 警告ケースでも処理は継続される
    const warningResult = checkApprovalDelayAndNotify(
      validApplicationId,
      validCurrentDateTime,
      validApprovalDeadline,
      validReminderSettings,
      incompleteApproverInfo
    );

    expect(warningResult.shouldNotify).toBe(true);
    expect(warningResult.notificationType).toBe("緊急催促");
  });
});