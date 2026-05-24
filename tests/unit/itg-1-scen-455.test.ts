import { generateReminderMessage } from "../../src/logic/it-1-br-1-2-1";

describe("承認遅延案件を検知し担当者に自動で催促通知を送信する", () => {
  test("最高重要度案件の緊急催促メッセージが適切に生成される", () => {
    // SCEN-455: 滞留日数が8日以上で補助金関連書類の場合、緊急催促レベルのメッセージが生成される
    const result = generateReminderMessage(
      "APP-20240115-001",
      8,
      "補助金申請書",
      "田中部長",
      "山田太郎"
    );

    // 滞留日数8日以上は緊急レベル、補助金関連は1段階上げて緊急レベル確定
    expect(result.urgencyLevel).toBe("high");
    expect(result.notificationMethod).toBe("email");
    expect(result.messageContent).toContain("迅速な対応を求める");
    expect(result.messageContent).toContain("山田太郎");
    expect(result.messageContent).toContain("補助金申請書");
    expect(result.messageContent).toContain("8");
  });
});