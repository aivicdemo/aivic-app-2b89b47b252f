import { checkApprovalDelayAndNotify } from "../../src/logic/it-1-br-1-2-1";

describe("承認遅延案件を検知し担当者に自動で催促通知を送信する", () => {
  test("SCEN-488: 承認遅延検知 - 検知処理でシステムエラーが発生した場合、適切に処理される", () => {
    // システムエラーケース: 申請案件の識別番号が空または無効な場合
    expect(() => checkApprovalDelayAndNotify(
      "",
      new Date("2024-01-15T14:00:00Z"),
      new Date("2024-01-15T12:00:00Z"),
      { beforeDays: [3, 1], urgentHours: 24 },
      { id: "user001", name: "田中太郎", email: "tanaka@university.ac.jp", department: "総務課" }
    )).toThrow("申請案件が特定できません。正しい申請番号を指定してください。");

    // システムエラーケース: 承認期限が設定されていない場合
    expect(() => checkApprovalDelayAndNotify(
      "APP-2024-001",
      new Date("2024-01-15T14:00:00Z"),
      null as any,
      { beforeDays: [3, 1], urgentHours: 24 },
      { id: "user001", name: "田中太郎", email: "tanaka@university.ac.jp", department: "総務課" }
    )).toThrow("承認期限が設定されていないため、遅延検知ができません。");

    // 正常処理: 遅延警告状態
    const result1 = checkApprovalDelayAndNotify(
      "APP-2024-001",
      new Date("2024-01-15T14:00:00Z"),
      new Date("2024-01-15T12:00:00Z"),
      { beforeDays: [3, 1], urgentHours: 24 },
      { id: "user001", name: "田中太郎", email: "tanaka@university.ac.jp", department: "総務課" }
    );

    expect(result1.shouldNotify).toBe(true);
    expect(result1.notificationType).toBe("緊急催促");
    expect(result1.recipients).toEqual(["tanaka@university.ac.jp", "applicant@university.ac.jp", "manager@university.ac.jp"]);
    expect(result1.delayStatus).toBe("緊急");
    expect(result1.nextReminderTime).toBeInstanceOf(Date);

    // 正常処理: 事前催促状態
    const result2 = checkApprovalDelayAndNotify(
      "APP-2024-002",
      new Date("2024-01-15T14:00:00Z"),
      new Date("2024-01-18T14:00:00Z"),
      { beforeDays: [3, 1], urgentHours: 24 },
      { id: "user002", name: "佐藤花子", email: "sato@university.ac.jp", department: "経理課" }
    );

    expect(result2.shouldNotify).toBe(true);
    expect(result2.notificationType).toBe("事前催促");
    expect(result2.recipients).toEqual(["sato@university.ac.jp"]);
    expect(result2.delayStatus).toBe("注意");

    // 正常処理: 通知不要状態
    const result3 = checkApprovalDelayAndNotify(
      "APP-2024-003",
      new Date("2024-01-15T14:00:00Z"),
      new Date("2024-01-25T14:00:00Z"),
      { beforeDays: [3, 1], urgentHours: 24 },
      { id: "user003", name: "山田次郎", email: "yamada@university.ac.jp", department: "学務課" }
    );

    expect(result3.shouldNotify).toBe(false);
    expect(result3.delayStatus).toBe("正常");
    expect(result3.recipients).toEqual(["yamada@university.ac.jp"]);
  });
});