import { determinePriorityForApprovalNotification } from "../../src/logic/it-1-br-1-2-1";

describe("承認遅延案件を検知し担当者に自動で催促通知を送信する", () => {
  test("緊急度判定に失敗した場合、デフォルト優先度が適用される", () => {
    // SCEN-467
    
    // 緊急度判定に失敗するケース: deadlineがnullで緊急キーワードも含まない通常案件
    const result = determinePriorityForApprovalNotification(
      "通常の設備申請書", // documentTitle - 緊急キーワードなし
      "一般申請", // documentType
      new Date("2024-01-10T09:00:00.000Z"), // submissionDate
      null, // deadline - 期限なし
      false // subsidyRelated
    );

    // structured.formula に基づく計算:
    // daysUntilDeadline = null → 緊急条件なし
    // hasUrgentKeywords = /緊急|至急|重要/.test("通常の設備申請書") = false
    // subsidyRelated = false → 高優先度条件なし
    // 全ての緊急度判定条件を満たさないため、デフォルトの低優先度が適用される
    expect(result.priority).toBe('low');
    expect(result.notificationTiming).toBe('scheduled');
    expect(result.urgencyReason).toBe('通常の申請案件');
  });
});