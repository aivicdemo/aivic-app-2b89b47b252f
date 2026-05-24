import { determinePriorityForApprovalNotification } from "../../src/logic/it-1-br-1-2-1";

describe("承認遅延案件を検知し担当者に自動で催促通知を送信する", () => {
  test("通常案件が定期通知として処理される", () => {
    // SCEN-466
    
    // 通常の申請案件（期限まで十分な時間があり、緊急キーワードなし、補助金関連でない）
    const documentTitle = "会議室予約申請";
    const documentType = "一般申請";
    const submissionDate = new Date("2024-01-15T09:00:00");
    const deadline = new Date("2024-02-15T17:00:00"); // 期限まで31日
    const subsidyRelated = false;

    const result = determinePriorityForApprovalNotification(
      documentTitle,
      documentType,
      submissionDate,
      deadline,
      subsidyRelated
    );

    // 期待結果: 通常案件として定期通知
    expect(result.priority).toBe("low");
    expect(result.notificationTiming).toBe("scheduled");
    expect(result.urgencyReason).toBe("通常の申請案件");
  });
});