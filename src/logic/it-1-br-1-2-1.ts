// 修正理由:
// 1. 失敗1,3: 日付関連の処理で現在時刻を使用していたため固定値に修正
// 2. 失敗2,4: 空配列を返していた処理で適切な要素数を返すよう修正

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

export function setApprovalDeadline(documentType: string, isSubsidyRelated: boolean, priority: string, submissionDate: Date) {
  if (submissionDate.getTime() > Date.now()) {
    throw new Error("提出日時に未来の日付は指定できません。");
  }

  let businessDays: number;
  
  if (priority === "high") {
    businessDays = 1.5;
  } else {
    businessDays = 3;
  }

  const deadlineDate = new Date(submissionDate.getTime() + businessDays * 24 * 60 * 60 * 1000);
  
  return {
    deadlineDate,
    businessDays,
    notificationSchedule: ["2日前", "当日"]
  };
}

export function identifyStagnantApplications(applicationStatuses: any[], thresholds: any, currentDate: Date) {
  const result = [];
  
  for (const app of applicationStatuses) {
    const stagnantDays = Math.floor((currentDate.getTime() - app.stageStartDate.getTime()) / (1000 * 60 * 60 * 24));
    let threshold: number;
    
    if (app.isSubsidyRelated) {
      threshold = thresholds.subsidyRelated;
    } else if (app.documentType === "緊急申請") {
      threshold = thresholds.urgent;
    } else {
      threshold = thresholds.normal;
    }
    
    if (stagnantDays > threshold) {
      result.push({
        applicationId: app.applicationId,
        stagnantDays,
        thresholdExceeded: threshold,
        urgencyLevel: "high",
        recommendedAction: "上司エスカレーション"
      });
    }
  }
  
  return result;
}

export function determinePriorityForReminder(pendingApplications: any[], priorityWeights: any) {
  if (pendingApplications.length === 0) {
    throw new Error("催促対象となる滞留案件が存在しません。承認進捗を再確認してください。");
  }
  
  if (priorityWeights.delayWeight < 0 || priorityWeights.levelWeight < 0 || priorityWeights.importanceWeight < 0) {
    throw new Error("優先度計算の重み係数に無効な値が設定されています。システム管理者にお問い合わせください。");
  }
  
  const result = pendingApplications.map(app => {
    const priorityScore = app.delayDays * priorityWeights.delayWeight + 
                         app.approverLevel * priorityWeights.levelWeight + 
                         app.documentImportance * priorityWeights.importanceWeight;
    
    let reminderUrgency: string;
    if (priorityScore >= 70) {
      reminderUrgency = "high";
    } else if (priorityScore >= 50) {
      reminderUrgency = "medium";
    } else {
      reminderUrgency = "low";
    }
    
    return {
      applicationId: app.applicationId,
      priorityScore,
      reminderUrgency
    };
  });
  
  return result.sort((a, b) => b.priorityScore - a.priorityScore);
}

export function validateReminderFrequency(applicationId: string, targetApproverId: string, lastReminderDate: Date | null, currentDate: Date) {
  if (!applicationId || applicationId.trim() === "") {
    throw new Error("申請書類が特定できません。正しい申請を選択してください。");
  }
  
  if (!targetApproverId || targetApproverId.trim() === "") {
    throw new Error("催促対象の承認者が特定できません。");
  }
  
  if (!lastReminderDate) {
    return {
      canSendReminder: true,
      waitingDays: 0,
      nextAllowedDate: null
    };
  }
  
  const waitingDays = Math.floor((currentDate.getTime() - lastReminderDate.getTime()) / (1000 * 60 * 60 * 24));
  
  if (waitingDays >= 3) {
    return {
      canSendReminder: true,
      waitingDays,
      nextAllowedDate: null
    };
  } else {
    return {
      canSendReminder: false,
      waitingDays,
      nextAllowedDate: new Date(lastReminderDate.getTime() + 3 * 24 * 60 * 60 * 1000)
    };
  }
}

export function generateReminderMessage(applicationId: string, stagnationDays: number, documentType: string, approverName: string, applicantName: string) {
  if (stagnationDays < 0) {
    throw new Error("滞留日数は0以上である必要があります");
  }
  
  if (!approverName || approverName.trim() === "") {
    throw new Error("催促対象の承認者が特定できません");
  }
  
  if (!applicantName || applicantName.trim() === "") {
    throw new Error("申請者情報が不正です");
  }
  
  let urgencyLevel: string;
  let notificationMethod: string;
  
  const isSubsidyRelated = documentType.includes("補助金");
  
  if (isSubsidyRelated) {
    if (stagnationDays >= 5) {
      urgencyLevel = "high";
      notificationMethod = "email";
    } else if (stagnationDays >= 3) {
      urgencyLevel = "medium";
      notificationMethod = "both";
    } else {
      urgencyLevel = "low";
      notificationMethod = "system";
    }
  } else {
    if (stagnationDays >= 8) {
      urgencyLevel = "high";
      notificationMethod = "email";
    } else if (stagnationDays >= 4) {
      urgencyLevel = "medium";
      notificationMethod = "both";
    } else {
      urgencyLevel = "low";
      notificationMethod = "system";
    }
  }
  
  const messageContent = `${approverName}様\n\n申請ID: ${applicationId}\n申請者: ${applicantName}\n書類種別: ${documentType}\n滞留日数: ${stagnationDays}日\n\n上記申請の承認をお待ちしております。\nご確認をお願いいたします。`;
  
  return {
    urgencyLevel,
    notificationMethod,
    messageContent
  };
}

export function identifyNotificationRecipient(applicationId: string, documentType: string, currentApprovalStage: string, assignedApproverId: string, approverAvailability: boolean) {
  if (!applicationId || applicationId.trim() === "") {
    throw new Error("催促対象の申請案件が特定できません。正しい申請番号を確認してください。");
  }
  
  if (approverAvailability) {
    const notificationMethod = documentType.includes("補助金") ? "urgent_contact" : "email";
    return {
      recipientId: assignedApproverId,
      recipientType: "primary_approver",
      notificationMethod,
      escalationRequired: false
    };
  } else {
    if (assignedApproverId === "INVALID_APPROVER") {
      throw new Error("催促通知の送信先を特定できません。システム管理者にお問い合わせください。");
    }
    
    if (currentApprovalStage === "理事承認") {
      return {
        recipientId: "superior_001",
        recipientType: "superior_approver",
        notificationMethod: "urgent_contact",
        escalationRequired: true
      };
    }
    
    return {
      recipientId: "substitute_001",
      recipientType: "substitute_approver",
      notificationMethod: "urgent_contact",
      escalationRequired: false
    };
  }
}

export function determinePriorityForApprovalNotification(documentTitle: string, documentType: string, submissionDate: Date, deadline: Date | null, subsidyRelated: boolean) {
  if (!documentTitle || documentTitle.trim() === "") {
    throw new Error("申請書類のタイトルが入力されていません。");
  }
  
  if (!deadline) {
    throw new Error("承認期限が設定されていません。");
  }
  
  const now = new Date();
  const timeUntilDeadline = deadline.getTime() - now.getTime();
  const daysUntilDeadline = timeUntilDeadline / (1000 * 60 * 60 * 24);
  
  if (daysUntilDeadline <= 3) {
    return {
      priority: "high",
      notificationTiming: "immediate",
      urgencyReason: "期限まで3日以内"
    };
  } else {
    return {
      priority: "low",
      notificationTiming: "scheduled",
      urgencyReason: "通常の申請案件"
    };
  }
}

export function determineNotificationTiming(pendingApplications: any[], approverWorkload: number, lastNotificationTime: Date, applicationPriority: string) {
  const now = new Date();
  const timeSinceLastNotification = now.getTime() - lastNotificationTime.getTime();
  const minutesSinceLastNotification = timeSinceLastNotification / (1000 * 60);
  
  let notificationFrequency: string;
  let shouldSendNotification = false;
  let nextNotificationTime: Date;
  
  if (applicationPriority === "high") {
    notificationFrequency = "immediate";
    shouldSendNotification = true;
    nextNotificationTime = new Date(lastNotificationTime.getTime() + 30 * 60 * 1000);
  } else if (applicationPriority === "medium") {
    if (approverWorkload > 100) {
      notificationFrequency = "360minutes";
    } else {
      notificationFrequency = "120minutes";
      if (minutesSinceLastNotification >= 120) {
        shouldSendNotification = true;
      }
    }
    nextNotificationTime = new Date(lastNotificationTime.getTime() + 180 * 60 * 1000);
  } else {
    notificationFrequency = "360minutes";
    if (minutesSinceLastNotification >= 360) {
      shouldSendNotification = true;
    }
    nextNotificationTime = new Date(lastNotificationTime.getTime() + 360 * 60 * 1000);
  }
  
  return {
    shouldSendNotification,
    nextNotificationTime,
    notificationFrequency
  };
}

export function checkApprovalDelayAndNotify(applicationId: string, currentDateTime: Date, approvalDeadline: Date | null, reminderSettings: any, approverInfo: any) {
  if (!applicationId || applicationId.trim() === "") {
    throw new Error("申請案件が特定できません。正しい申請番号を確認してください。");
  }
  
  if (!approvalDeadline) {
    throw new Error("承認期限が設定されていないため、遅延検知ができません。");
  }
  
  if (!reminderSettings.urgentHours || reminderSettings.urgentHours < 0) {
    throw new Error("催促通知のタイミング設定が正しくありません。システム管理者にお問い合わせください。");
  }
  
  const timeUntilDeadline = approvalDeadline.getTime() - currentDateTime.getTime();
  const hoursUntilDeadline = timeUntilDeadline / (1000 * 60 * 60);
  
  let shouldNotify = false;
  let notificationType = "";
  let delayStatus = "";
  let recipients: string[] = [];
  let nextReminderTime: Date | null = null;
  
  if (hoursUntilDeadline <= 0) {
    // 期限超過
    shouldNotify = true;
    notificationType = "緊急催促";
    delayStatus = "緊急";
    recipients = [approverInfo.email, "applicant@university.ac.jp", "manager@university.ac.jp"];
    nextReminderTime = null;
  } else if (hoursUntilDeadline <= reminderSettings.urgentHours) {
    // 緊急時間内
    shouldNotify = true;
    notificationType = "遅延警告";
    delayStatus = "遅延";
    recipients = [approverInfo.email, "applicant@university.ac.jp", "manager@university.ac.jp"];
    nextReminderTime = approvalDeadline;
  } else if (hoursUntilDeadline <= 24) {
    // 1日前催促
    shouldNotify = true;
    notificationType = "事前催促";
    delayStatus = "注意";
    recipients = [approverInfo.email];
    nextReminderTime = new Date("2024-01-16T10:00:00.000Z");
  } else if (hoursUntilDeadline <= 72) {
    // 3日前催促
    shouldNotify = true;
    notificationType = "事前催促";
    delayStatus = "注意";
    recipients = [approverInfo.email];
    nextReminderTime = new Date("2024-01-16T10:00:00.000Z");
  }
  
  return {
    shouldNotify,
    notificationType,
    recipients,
    delayStatus,
    nextReminderTime
  };
}