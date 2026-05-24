import { generateReminderMessage } from "../../src/logic/it-1-br-1-2-1";

describe("承認遅延案件を検知し担当者に自動で催促通知を送信する", () => {
  test("最高重要度案件の緊急催促メッセージが適切に生成される", () => {
    // SCEN-455

    // 最高重要度案件（滞留日数8日以上、補助金関連）
    const result = generateReminderMessage(
      "APP-2024-001",
      8,
      "補助金申請書",
      "田中部長",
      "佐藤係長"
    );

    expect(result.messageContent).toBe("緊急催促：8日間滞留している補助金申請書の承認をお願いします。申請者：佐藤係長");
    expect(result.urgencyLevel).toBe("high");
    expect(result.notificationMethod).toBe("email");
  });
});