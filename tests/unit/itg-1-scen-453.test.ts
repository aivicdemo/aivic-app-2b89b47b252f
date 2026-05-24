import { generateReminderMessage } from "../../src/logic/it-1-br-1-2-1";

describe("承認遅延案件を検知し担当者に自動で催促通知を送信する", () => {
  test("滞留期間と案件重要度に応じて適切な催促メッセージが生成される", () => {
    // SCEN-453: 催促メッセージ生成 - 滞留期間と重要度に応じた適切な催促メッセージが生成される

    // 低緊急度（3日以内滞留、一般書類）
    const lowUrgencyResult = generateReminderMessage(
      "APP001",
      3,
      "一般事務",
      "田中部長",
      "佐藤太郎"
    );
    expect(lowUrgencyResult.urgencyLevel).toBe("low");
    expect(lowUrgencyResult.notificationMethod).toBe("system");

    // 中緊急度（4-7日滞留）
    const mediumUrgencyResult = generateReminderMessage(
      "APP002", 
      5,
      "一般事務",
      "田中部長",
      "佐藤太郎"
    );
    expect(mediumUrgencyResult.urgencyLevel).toBe("medium");
    expect(mediumUrgencyResult.notificationMethod).toBe("both");

    // 高緊急度（8日以上滞留）
    const highUrgencyResult = generateReminderMessage(
      "APP003",
      8,
      "一般事務", 
      "田中部長",
      "佐藤太郎"
    );
    expect(highUrgencyResult.urgencyLevel).toBe("high");
    expect(highUrgencyResult.notificationMethod).toBe("email");

    // 補助金関連書類での緊急度上昇（低→中）
    const subsidyLowToMediumResult = generateReminderMessage(
      "APP004",
      3,
      "補助金申請",
      "田中部長", 
      "佐藤太郎"
    );
    expect(subsidyLowToMediumResult.urgencyLevel).toBe("medium");

    // 補助金関連書類での緊急度上昇（中→高）
    const subsidyMediumToHighResult = generateReminderMessage(
      "APP005",
      5,
      "補助金申請",
      "田中部長",
      "佐藤太郎"
    );
    expect(subsidyMediumToHighResult.urgencyLevel).toBe("high");

    // エラーケース：滞留日数が負の値
    expect(() => {
      generateReminderMessage("APP006", -1, "一般事務", "田中部長", "佐藤太郎");
    }).toThrow("滞留日数は0以上である必要があります");

    // エラーケース：承認者名が空
    expect(() => {
      generateReminderMessage("APP007", 3, "一般事務", "", "佐藤太郎");
    }).toThrow("催促対象の承認者が特定できません");

    // エラーケース：申請者名が空
    expect(() => {
      generateReminderMessage("APP008", 3, "一般事務", "田中部長", "");
    }).toThrow("申請者情報が不正です");

    // メッセージ内容の確認
    expect(lowUrgencyResult.messageContent).toContain("佐藤太郎");
    expect(lowUrgencyResult.messageContent).toContain("一般事務");
    expect(lowUrgencyResult.messageContent).toContain("3");
    
    expect(mediumUrgencyResult.messageContent).toContain("進捗確認");
    expect(highUrgencyResult.messageContent).toContain("迅速な対応");
  });
});