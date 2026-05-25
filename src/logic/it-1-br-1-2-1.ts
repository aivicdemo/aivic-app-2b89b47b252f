export interface NotificationPriorityRequest {
  applicationId: string;
  delayDays: number;
  applicationType: string;
  urgencyLevel: string;
  currentApprover: string;
}

export interface NotificationPriorityResult {
  priority: string;
  notificationTiming: string;
  urgencyReason: string;
}

export function determineNotificationPriority(request: NotificationPriorityRequest): NotificationPriorityResult {
  // 通常案件は定期通知として低優先度で処理
  if (request.urgencyLevel === "normal" && request.delayDays <= 3) {
    return {
      priority: "low",
      notificationTiming: "scheduled",
      urgencyReason: "通常の申請案件"
    };
  }

  // 緊急案件や長期滞留案件は高優先度
  if (request.urgencyLevel === "urgent" || request.delayDays > 5) {
    return {
      priority: "high",
      notificationTiming: "immediate",
      urgencyReason: request.urgencyLevel === "urgent" ? "緊急申請案件" : "長期滞留案件"
    };
  }

  // その他は中優先度
  return {
    priority: "medium",
    notificationTiming: "daily",
    urgencyReason: "標準処理案件"
  };
}

export interface ReminderMessageRequest {
  applicationId: string;
  applicantName: string;
  approverName: string;
  delayDays: number;
  applicationTitle: string;
}

export function generateReminderMessage(request: ReminderMessageRequest): string {
  // バリデーション順序を修正：滞留日数を最初にチェック
  if (request.delayDays < 0) {
    throw new Error("滞留日数は0以上である必要があります");
  }

  if (!request.approverName || request.approverName.trim() === "") {
    throw new Error("催促対象の承認者が特定できません");
  }
  
  if (!request.applicantName || request.applicantName.trim() === "") {
    throw new Error("申請者名が指定されていません");
  }

  if (!request.applicationTitle || request.applicationTitle.trim() === "") {
    return `${request.approverName}様\n\n申請ID: ${request.applicationId}\n申請者: ${request.applicantName}\n滞留日数: ${request.delayDays}日\n\n上記申請の承認をお待ちしております。\nご確認をお願いいたします。`;
  }

  return `${request.approverName}様\n\n申請ID: ${request.applicationId}\n申請タイトル: ${request.applicationTitle}\n申請者: ${request.applicantName}\n滞留日数: ${request.delayDays}日\n\n上記申請の承認をお待しております。\nご確認をお願いいたします。`;
}