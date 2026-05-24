import { generateReminderMessage } from "../../src/logic/it-1-br-1-2-1";

describe("承認遅延案件を検知し担当者に自動で催促通知を送信する", () => {
  test("最高重要度案件の緊急催促メッセージが適切に生成される", () => {
    // SCEN-455
    
    // 滞留日数が8日以上の緊急レベル + 補助金関連書類
    const result1 = generateReminderMessage(
      "APP-2024-001",
      8, // 8日以上で緊急レベル
      "補助金申請書", // 補助金関連で優先度+1
      "田中太郎",
      "山田花子"
    );
    
    expect(result1.urgencyLevel).toBe("high");
    expect(result1.notificationMethod).toBe("email");
    expect(typeof result1.messageContent).toBe("string");
    
    // 滞留日数が4-7日の中レベル + 補助金関連で高レベルに昇格
    const result2 = generateReminderMessage(
      "APP-2024-002", 
      5, // 4-7日で中レベル
      "補助金申請書", // 補助金関連で高レベルに昇格
      "佐藤次郎",
      "鈴木三郎"
    );
    
    expect(result2.urgencyLevel).toBe("high");
    expect(result2.notificationMethod).toBe("email");
    
    // 滞留日数が3日以内の低レベル + 補助金関連で中レベルに昇格
    const result3 = generateReminderMessage(
      "APP-2024-003",
      2, // 3日以内で低レベル  
      "補助金申請書", // 補助金関連で中レベルに昇格
      "高橋四郎",
      "渡辺五郎"
    );
    
    expect(result3.urgencyLevel).toBe("medium");
    expect(result3.notificationMethod).toBe("both");
    
    // 一般書類で滞留日数が3日以内（低レベル維持）
    const result4 = generateReminderMessage(
      "APP-2024-004",
      1,
      "一般申請書",
      "中村六郎", 
      "小林七子"
    );
    
    expect(result4.urgencyLevel).toBe("low");
    expect(result4.notificationMethod).toBe("system");

    // エラーケース: 滞留日数が負の値
    expect(() => generateReminderMessage(
      "APP-2024-005",
      -1,
      "申請書",
      "承認者",
      "申請者"
    )).toThrow("滞留日数は0以上である必要があります");

    // エラーケース: 承認者名が空
    expect(() => generateReminderMessage(
      "APP-2024-006", 
      5,
      "申請書",
      "",
      "申請者"
    )).toThrow("催促対象の承認者が特定できません");

    // エラーケース: 申請者名が空
    expect(() => generateReminderMessage(
      "APP-2024-007",
      5, 
      "申請書",
      "承認者",
      ""
    )).toThrow("申請者情報が不正です");
  });
});