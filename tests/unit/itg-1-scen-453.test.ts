import { generateReminderMessage } from "../../src/logic/it-1-br-1-2-1";

describe("承認遅延案件を検知し担当者に自動で催促通知を送信する", () => {
  test("滞留期間と案件の重要度に応じて適切な催促メッセージを生成し、担当者に送信する", () => {
    // SCEN-453
    
    // 低緊急度（3日以内）- 一般申請
    const result1 = generateReminderMessage(
      "APP-2024-001",
      2,
      "一般事務",
      "田中部長",
      "佐藤職員"
    );
    
    expect(result1.messageContent).toContain("佐藤職員");
    expect(result1.messageContent).toContain("一般事務");
    expect(result1.messageContent).toContain("2");
    expect(result1.urgencyLevel).toBe("low");
    expect(result1.notificationMethod).toBe("system");
    
    // 中緊急度（4-7日）- 一般申請
    const result2 = generateReminderMessage(
      "APP-2024-002", 
      5,
      "人事関連",
      "山田課長",
      "鈴木職員"
    );
    
    expect(result2.messageContent).toContain("鈴木職員");
    expect(result2.messageContent).toContain("人事関連");
    expect(result2.messageContent).toContain("5");
    expect(result2.urgencyLevel).toBe("medium");
    expect(result2.notificationMethod).toBe("both");
    
    // 高緊急度（8日以上）- 一般申請
    const result3 = generateReminderMessage(
      "APP-2024-003",
      10,
      "設備申請",
      "高橋部長", 
      "渡辺職員"
    );
    
    expect(result3.messageContent).toContain("渡辺職員");
    expect(result3.messageContent).toContain("設備申請");
    expect(result3.messageContent).toContain("10");
    expect(result3.urgencyLevel).toBe("high");
    expect(result3.notificationMethod).toBe("email");
    
    // 補助金関連書類（緊急度1段階アップ）- 低→中
    const result4 = generateReminderMessage(
      "APP-2024-004",
      2,
      "補助金申請",
      "伊藤部長",
      "小林職員"
    );
    
    expect(result4.messageContent).toContain("小林職員");
    expect(result4.messageContent).toContain("補助金申請");
    expect(result4.messageContent).toContain("2");
    expect(result4.urgencyLevel).toBe("medium");
    expect(result4.notificationMethod).toBe("both");
    
    // 補助金関連書類（緊急度1段階アップ）- 中→高
    const result5 = generateReminderMessage(
      "APP-2024-005",
      6,
      "補助金関連",
      "加藤課長",
      "青木職員"
    );
    
    expect(result5.messageContent).toContain("青木職員");
    expect(result5.messageContent).toContain("補助金関連");
    expect(result5.messageContent).toContain("6");
    expect(result5.urgencyLevel).toBe("high");
    expect(result5.notificationMethod).toBe("email");
    
    // 制約テスト：滞留日数が0日未満
    expect(() => {
      generateReminderMessage("APP-2024-006", -1, "一般事務", "田中部長", "佐藤職員");
    }).toThrow("滞留日数は0以上である必要があります");
    
    // 制約テスト：承認者名が空
    expect(() => {
      generateReminderMessage("APP-2024-007", 3, "一般事務", "", "佐藤職員");
    }).toThrow("催促対象の承認者が特定できません");
    
    // 制約テスト：申請者名が空
    expect(() => {
      generateReminderMessage("APP-2024-008", 3, "一般事務", "田中部長", "");
    }).toThrow("申請者情報が不正です");
  });
});