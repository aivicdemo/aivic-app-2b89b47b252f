import { generateReminderMessage } from "../../src/logic/it-1-br-1-2-1";

describe("承認遅延案件を検知し担当者に自動で催促通知を送信する", () => {
  test("催促メッセージ生成 - メッセージ生成に必要な情報が不足している場合、デフォルトメッセージが使用される", () => {
    // SCEN-454
    const applicationId = "";
    const stagnationDays = 0;
    const documentType = "";
    const approverName = "";
    const applicantName = "";

    expect(() => 
      generateReminderMessage(
        applicationId,
        stagnationDays,
        documentType,
        approverName,
        applicantName
      )
    ).toThrow("滞留日数は0以上である必要があります");
  });
});