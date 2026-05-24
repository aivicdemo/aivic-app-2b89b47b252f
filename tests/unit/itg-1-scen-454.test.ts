import { generateReminderMessage } from "../../src/logic/it-1-br-1-2-1";

describe("承認遅延案件を検知し担当者に自動で催促通知を送信する", () => {
  test("催促メッセージ生成 - メッセージ生成に必要な情報が不足している場合、デフォルトメッセージが使用される", () => {
    // SCEN-454
    
    // 必要な情報が不足している場合（承認者名が空）
    const result1 = generateReminderMessage(
      "APP-001",
      5,
      "一般事務",
      "",
      "田中太郎"
    );
    
    expect(result1.messageContent).toContain("承認者様");
    expect(result1.urgencyLevel).toBe("medium");
    expect(result1.notificationMethod).toBe("both");
    
    // 申請者名が空の場合
    const result2 = generateReminderMessage(
      "APP-002",
      3,
      "補助金申請書",
      "佐藤次郎",
      ""
    );
    
    expect(result2.messageContent).toContain("申請者");
    expect(result2.urgencyLevel).toBe("low");
    expect(result2.notificationMethod).toBe("system");
    
    // 文書種別が空の場合
    const result3 = generateReminderMessage(
      "APP-003",
      2,
      "",
      "山田花子",
      "鈴木一郎"
    );
    
    expect(result3.messageContent).toContain("申請書類");
    expect(result3.urgencyLevel).toBe("low");
    expect(result3.notificationMethod).toBe("system");
    
    // エラーケース：滞留日数が0日未満
    expect(() => {
      generateReminderMessage(
        "APP-004",
        -1,
        "一般事務",
        "田中三郎",
        "佐藤四郎"
      );
    }).toThrow("滞留日数は0以上である必要があります");
    
    // エラーケース：承認者名が空
    expect(() => {
      generateReminderMessage(
        "APP-005",
        5,
        "一般事務",
        "",
        "山田五郎"
      );
    }).toThrow("催促対象の承認者が特定できません");
    
    // エラーケース：申請者名が空
    expect(() => {
      generateReminderMessage(
        "APP-006",
        3,
        "一般事務",
        "佐藤六郎",
        ""
      );
    }).toThrow("申請者情報が不正です");
  });
});