// 通知優先度判定ロジック
export function determineNotificationPriority(
  applicationUrgency: string,
  delayDays: number,
  applicationCategory: string
): {
  priority: string;
  notificationTiming: string;
  urgencyReason: string;
} {
  let priority = "low";
  let notificationTiming = "scheduled";
  let urgencyReason = "通常の申請案件";

  // 通常案件の場合は低優先度
  if (applicationCategory === "通常案件") {
    priority = "low";
    notificationTiming = "scheduled";
    urgencyReason = "通常の申請案件";
  }
  // 緊急案件や遅延が発生している場合は高優先度
  else if (applicationUrgency === "緊急" || delayDays > 3) {
    priority = "high";
    notificationTiming = "immediate";
    urgencyReason = "緊急案件または遅延発生";
  }

  return {
    priority,
    notificationTiming,
    urgencyReason
  };
}