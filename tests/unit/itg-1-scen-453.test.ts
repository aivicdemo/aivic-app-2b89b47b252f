import { generateReminderMessage } from '../../src/logic/it-1-br-1-2-1';

describe("承認遅延案件を検知し担当者に自動で催促通知を送信する", () => {
  // SCEN-453
  test("催促メッセージ生成 - 滞留期間と重要度に応じた適切な催促メッセージが生成される", () => {
    // 低緊急度（滞留日数3日以内）
    const result1 = generateReminderMessage(
      "APP-001",
      3,
      "一般事務",
      "田中太郎",
      "佐藤花子"
    );
    expect(result1.urgencyLevel).toBe("low");
    expect(result1.notificationMethod).toBe("system");

    // 中緊急度（滞留日数4-7日）
    const result2 = generateReminderMessage(
      "APP-002",
      5,
      "一般事務",
      "山田次郎",
      "鈴木一郎"
    );
    expect(result2.urgencyLevel).toBe("medium");
    expect(result2.notificationMethod).toBe("both");

    // 高緊急度（滞留日数8日以上）
    const result3 = generateReminderMessage(
      "APP-003",
      9,
      "一般事務",
      "高橋三郎",
      "加藤二郎"
    );
    expect(result3.urgencyLevel).toBe("high");
    expect(result3.notificationMethod).toBe("email");

    // 補助金関連書類の緊急度上昇（3日 → 中緊急度）
    const result4 = generateReminderMessage(
      "APP-004",
      3,
      "補助金申請",
      "伊藤四郎",
      "渡辺三郎"
    );
    expect(result4.urgencyLevel).toBe("medium");
    expect(result4.notificationMethod).toBe("both");

    // 補助金関連書類の緊急度上昇（5日 → 高緊急度）
    const result5 = generateReminderMessage(
      "APP-005",
      5,
      "補助金申請",
      "中村五郎",
      "小林四郎"
    );
    expect(result5.urgencyLevel).toBe("high");
    expect(result5.notificationMethod).toBe("email");

    // エラーケース：滞留日数が負の値
    expect(() => generateReminderMessage("APP-006", -1, "一般事務", "承認者", "申請者"))
      .toThrow("滞留日数は0以上である必要があります");

    // エラーケース：承認者名が空
    expect(() => generateReminderMessage("APP-007", 5, "一般事務", "", "申請者"))
      .toThrow("催促対象の承認者が特定できません");

    // エラーケース：申請者名が空
    expect(() => generateReminderMessage("APP-008", 5, "一般事務", "承認者", ""))
      .toThrow("申請者情報が不正です");
  });
});