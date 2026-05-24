import { determinePriorityForApprovalNotification } from "../../src/logic/it-1-br-1-2-1";

describe("承認遅延案件を検知し担当者に自動で催促通知を送信する", () => {
  test("通常案件が定期通知として処理される", () => {
    // SCEN-466
    
    const documentTitle = "設備購入申請書";
    const documentType = "一般申請";
    const submissionDate = new Date("2024-01-15T10:00:00Z");
    const deadline = new Date("2024-01-22T17:00:00Z");
    const subsidyRelated = false;

    const result = determinePriorityForApprovalNotification(
      documentTitle,
      documentType,
      submissionDate,
      deadline,
      subsidyRelated
    );

    expect(result).toEqual({
      priority: 'low',
      notificationTiming: 'scheduled',
      urgencyReason: '通常の申請案件'
    });
  });
});