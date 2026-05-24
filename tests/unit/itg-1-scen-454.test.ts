import { generateReminderMessage } from "../../src/logic/it-1-br-1-2-1";

describe("承認遅延案件を検知し担当者に自動で催促通知を送信する", () => {
  test("催促メッセージ生成 - メッセージ生成に必要な情報が不足している場合、デフォルトメッセージが使用される", () => {
    // SCEN-454
    
    // 承認者名が空の場合
    expect(() => generateReminderMessage(
      "APP-2024-001",
      5,
      "補助金申請書",
      "",
      "田中太郎"
    )).toThrow("催促対象の承認者が特定できません");

    // 申請者名が空の場合
    expect(() => generateReminderMessage(
      "APP-2024-002",
      3,
      "一般申請書",
      "佐藤花子",
      ""
    )).toThrow("申請者情報が不正です");

    // 滞留日数が0未満の場合
    expect(() => generateReminderMessage(
      "APP-2024-003",
      -1,
      "補助金申請書",
      "鈴木次郎",
      "山田三郎"
    )).toThrow("滞留日数は0以上である必要があります");

    // 正常ケース - 低緊急度（3日以内）
    const result1 = generateReminderMessage(
      "APP-2024-004",
      2,
      "一般申請書",
      "田中課長",
      "佐藤職員"
    );
    expect(result1.urgencyLevel).toBe("low");
    expect(result1.notificationMethod).toBe("system");
    expect(result1.messageContent).toContain("佐藤職員");
    expect(result1.messageContent).toContain("一般申請書");
    expect(result1.messageContent).toContain("2");

    // 正常ケース - 中緊急度（4-7日）
    const result2 = generateReminderMessage(
      "APP-2024-005",
      5,
      "一般申請書",
      "山田部長",
      "鈴木職員"
    );
    expect(result2.urgencyLevel).toBe("medium");
    expect(result2.notificationMethod).toBe("both");

    // 正常ケース - 高緊急度（8日以上）
    const result3 = generateReminderMessage(
      "APP-2024-006",
      10,
      "一般申請書",
      "高橋理事",
      "伊藤職員"
    );
    expect(result3.urgencyLevel).toBe("high");
    expect(result3.notificationMethod).toBe("email");

    // 補助金関連書類の場合は緊急度が1段階上がる
    const result4 = generateReminderMessage(
      "APP-2024-007",
      2,
      "補助金申請書",
      "小林課長",
      "加藤職員"
    );
    expect(result4.urgencyLevel).toBe("medium");
    expect(result4.notificationMethod).toBe("both");

    // 補助金関連書類で中緊急度の場合は高に上がる
    const result5 = generateReminderMessage(
      "APP-2024-008",
      6,
      "補助金申請書",
      "渡辺部長",
      "中村職員"
    );
    expect(result5.urgencyLevel).toBe("high");
    expect(result5.notificationMethod).toBe("email");
  });
});