import { generateReminderMessage } from "../../src/logic/it-1-br-1-2-1";

describe("承認遅延案件を検知し担当者に自動で催促通知を送信する", () => {
  test("催促メッセージ生成 - メッセージ生成に必要な情報が不足している場合、デフォルトメッセージが使用される", () => {
    // SCEN-454
    
    // 必要情報が完全に揃っている正常ケース
    const result1 = generateReminderMessage(
      "APP-2024-001",
      3,
      "一般事務",
      "田中太郎",
      "山田花子"
    );
    
    // 滞留日数3日、一般事務なので緊急度は low
    expect(result1.urgencyLevel).toBe("low");
    expect(result1.notificationMethod).toBe("system");
    expect(result1.messageContent).toContain("山田花子");
    expect(result1.messageContent).toContain("田中太郎");
    expect(result1.messageContent).toContain("一般事務");
    expect(result1.messageContent).toContain("3");
    
    // 承認者名が空の場合
    expect(() => {
      generateReminderMessage(
        "APP-2024-002",
        5,
        "補助金申請書",
        "",
        "佐藤次郎"
      );
    }).toThrow("催促対象の承認者が特定できません");
    
    // 申請者名が空の場合  
    expect(() => {
      generateReminderMessage(
        "APP-2024-003",
        4,
        "人事関連",
        "鈴木一郎", 
        ""
      );
    }).toThrow("申請者情報が不正です");
    
    // 滞留日数が負の値の場合
    expect(() => {
      generateReminderMessage(
        "APP-2024-004",
        -1,
        "設備申請",
        "高橋三郎",
        "伊藤四郎"
      );
    }).toThrow("滞留日数は0以上である必要があります");
    
    // 滞留日数5日、補助金関連で緊急度が上がる
    const result2 = generateReminderMessage(
      "APP-2024-005",
      5,
      "補助金申請書",
      "加藤五郎",
      "渡辺六郎"
    );
    
    expect(result2.urgencyLevel).toBe("high");
    expect(result2.notificationMethod).toBe("email");
    
    // 滞留日数8日で緊急度高
    const result3 = generateReminderMessage(
      "APP-2024-006", 
      8,
      "一般事務",
      "斎藤七郎",
      "中村八郎"
    );
    
    expect(result3.urgencyLevel).toBe("high");
    expect(result3.notificationMethod).toBe("email");
  });
});