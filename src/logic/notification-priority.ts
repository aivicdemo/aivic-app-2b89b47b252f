// 通知優先度判定ロジック
export function determineNotificationPriority(applicationId: string, delayDays: number, documentType: string, applicantRole: string) {
  let priority = "low";
  let notificationTiming = "scheduled";
  let urgencyReason = "通常の申請案件";
  
  // 遅延日数に基づく優先度判定
  if (delayDays <= 3) {
    priority = "low";
    notificationTiming = "scheduled";
    urgencyReason = "通常の申請案件";
  } else if (delayDays <= 7) {
    priority = "medium";
    notificationTiming = "immediate";
    urgencyReason = "軽微な遅延";
  } else {
    priority = "high";
    notificationTiming = "immediate";
    urgencyReason = "重大な遅延";
  }
  
  return {
    priority,
    notificationTiming,
    urgencyReason
  };
}