export interface NotificationPriorityResult {
  priority: string;
  notificationTiming: string;
  urgencyReason: string;
}

export function determineNotificationPriority(
  applicationId: string,
  delayDays: number,
  applicationAmount: number,
  applicationType: string
): NotificationPriorityResult {
  // 通常案件の判定条件
  if (delayDays <= 3 && applicationAmount <= 100000 && applicationType === "通常申請") {
    return {
      priority: "low",
      notificationTiming: "scheduled",
      urgencyReason: "通常の申請案件"
    };
  }
  
  // 緊急案件の判定
  if (delayDays > 7 || applicationAmount > 500000) {
    return {
      priority: "high",
      notificationTiming: "immediate",
      urgencyReason: "高額または長期滞留案件"
    };
  }
  
  // 中程度の優先度
  return {
    priority: "medium",
    notificationTiming: "daily",
    urgencyReason: "標準的な催促案件"
  };
}