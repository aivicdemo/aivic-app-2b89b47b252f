import { determinePriorityForApprovalNotification } from "../../src/logic/it-1-br-1-2-1";

describe("承認遅延案件を検知し担当者に自動で催促通知を送信する", () => {
  test("通常案件が定期通知として処理される", () => {
    // SCEN-466
    
    // 通常案件のケース（緊急キーワードなし、期限7日後、非補助金関連）
    const documentTitle = "設備購入申請書";
    const documentType = "equipment_purchase";
    const submissionDate = new Date("2024-01-15T10:00:00Z");
    const deadline = new Date("2024-01-22T10:00:00Z");
    const subsidyRelated = false;

    const result = determinePriorityForApprovalNotification(
      documentTitle,
      documentType,
      submissionDate,
      deadline,
      subsidyRelated
    );

    expect(result.priority).toBe("normal");
    expect(result.notificationTiming).toBe("scheduled");
    expect(result.urgencyReason).toBe("期限まで1週間以内");

    // 優先度が低い通常案件のケース（期限30日後）
    const longDeadline = new Date("2024-02-14T10:00:00Z");
    
    const lowPriorityResult = determinePriorityForApprovalNotification(
      documentTitle,
      documentType,
      submissionDate,
      longDeadline,
      subsidyRelated
    );

    expect(lowPriorityResult.priority).toBe("low");
    expect(lowPriorityResult.notificationTiming).toBe("scheduled");
    expect(lowPriorityResult.urgencyReason).toBe("通常の申請案件");
  });
});