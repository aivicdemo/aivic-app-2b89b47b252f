import { determinePriorityForApprovalNotification } from "../../src/logic/it-1-br-1-2-1";

describe("承認遅延案件を検知し担当者に自動で催促通知を送信する", () => {
  test("緊急度判定に失敗した場合、デフォルト優先度が適用される", () => {
    // SCEN-467
    
    // 緊急度判定に失敗するケース（タイトルにキーワードなし、期限なし、補助金関連なし）
    const documentTitle = "一般的な申請書";
    const documentType = "一般申請";
    const submissionDate = new Date("2024-01-15T10:00:00");
    const deadline = null; // 期限未設定
    const subsidyRelated = false;
    
    const result = determinePriorityForApprovalNotification(
      documentTitle,
      documentType, 
      submissionDate,
      deadline,
      subsidyRelated
    );

    // デフォルト優先度（low）が適用されることを確認
    expect(result.priority).toBe("low");
    expect(result.notificationTiming).toBe("scheduled");
    expect(result.urgencyReason).toBe("通常の申請案件");

    // 緊急キーワードを含む場合は高優先度になることを確認
    const urgentResult = determinePriorityForApprovalNotification(
      "緊急申請書類",
      documentType,
      submissionDate,
      deadline,
      subsidyRelated
    );
    
    expect(urgentResult.priority).toBe("high");
    expect(urgentResult.notificationTiming).toBe("immediate");
    expect(urgentResult.urgencyReason).toBe("タイトルに緊急キーワード含有");

    // 補助金関連の場合は高優先度になることを確認
    const subsidyResult = determinePriorityForApprovalNotification(
      documentTitle,
      documentType,
      submissionDate,
      deadline,
      true
    );
    
    expect(subsidyResult.priority).toBe("high");
    expect(subsidyResult.notificationTiming).toBe("immediate");
    expect(subsidyResult.urgencyReason).toBe("補助金関連申請");

    // 期限が3日以内の場合は高優先度になることを確認
    const urgentDeadline = new Date("2024-01-17T17:00:00");
    const deadlineResult = determinePriorityForApprovalNotification(
      documentTitle,
      documentType,
      submissionDate,
      urgentDeadline,
      false
    );
    
    expect(deadlineResult.priority).toBe("high");
    expect(deadlineResult.notificationTiming).toBe("immediate");
    expect(deadlineResult.urgencyReason).toBe("期限まで3日以内");

    // 期限が1週間以内の場合は通常優先度になることを確認
    const weekDeadline = new Date("2024-01-20T17:00:00");
    const weekResult = determinePriorityForApprovalNotification(
      documentTitle,
      documentType,
      submissionDate,
      weekDeadline,
      false
    );
    
    expect(weekResult.priority).toBe("normal");
    expect(weekResult.notificationTiming).toBe("scheduled");
    expect(weekResult.urgencyReason).toBe("期限まで1週間以内");
  });
});