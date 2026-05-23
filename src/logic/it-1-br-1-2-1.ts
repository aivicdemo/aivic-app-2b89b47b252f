// SIG-PLAN:
// - 関数名: setApprovalDeadline
//   呼び出し例 (テスト中): setApprovalDeadline("一般申請", false, "標準", new Date("2023-01-15T09:00:00"))
//   await されてる?: いいえ
//   アクセスされるプロパティ: result.businessDays, result.notificationSchedule
//   → 結論: function setApprovalDeadline(documentType: string, subsidyRelated: boolean, urgencyLevel: string, submissionDate: Date): { deadlineDate: Date; businessDays: number; notificationSchedule: string[] }
//
// - 関数名: identifyStagnantApplications
//   呼び出し例 (テスト中): identifyStagnantApplications(applicationStatuses, { normal: 5, subsidyRelated: 7, urgent: 3 }, new Date("2023-01-10"))
//   await されてる?: いいえ
//   アクセスされるプロパティ: result.length, result[0].stagnantDays, result[0].thresholdExceeded, result[0].urgencyLevel
//   → 結論: function identifyStagnantApplications(applicationStatuses: Array<{applicationId: string, currentStage: string, stageStartDate: Date, documentType: string, isSubsidyRelated: boolean}>, stagnationThresholds: {normal: number, subsidyRelated: number, urgent: number}, currentDate: Date): Array<{applicationId: string, stagnantDays: number, thresholdExceeded: number, urgencyLevel: string, recommendedAction: string}>
//
// - 関数名: determinePriorityForReminder
//   呼び出し例 (テスト中): determinePriorityForReminder(pendingApplications, { delayWeight: 2, levelWeight: 1, importanceWeight: 3 })
//   await されてる?: いいえ
//   アクセスされるプロパティ: result[0].priorityScore, result[0].reminderUrgency, result[0].applicationId
//   → 結論: function determinePriorityForReminder(pendingApplications: Array<{applicationId: string, delayDays: number, approverLevel: number, documentImportance: number, applicantDepartment: string}>, priorityWeights: {delayWeight: number, levelWeight: number, importanceWeight: number}): Array<{applicationId: string, priorityScore: number, reminderUrgency: string}>
//
// - 関数名: validateReminderFrequency
//   呼び出し例 (テスト中): validateReminderFrequency("APP001", "user123", new Date("2023-01-01T09:00:00"), new Date("2023-01-05T09:00:00"))
//   await されてる?: いいえ
//   アクセスされるプロパティ: result.canSendReminder, result.waitingDays, result.nextAllowedDate
//   → 結論: function validateReminderFrequency(applicationId: string, targetApproverId: string, lastReminderDate: Date | null, currentDate: Date): { canSendReminder: boolean; waitingDays: number; nextAllowedDate: Date | null }
//
// - 関数名: generateReminderMessage
//   呼び出し例 (テスト中): generateReminderMessage(applicationId, stagnationDays, documentType, approverName, applicantName)
//   await されてる?: いいえ
//   アクセスされるプロパティ: result.urgencyLevel, result.notificationMethod
//   → 結論: function generateReminderMessage(applicationId: string, stagnationDays: number, documentType: string, approverName: string, applicantName: string): { messageContent: string; urgencyLevel: string; notificationMethod: string }
//
// - 関数名: identifyNotificationRecipient
//   呼び出し例 (テスト中): identifyNotificationRecipient(applicationId, documentType, currentApprovalStage, assignedApproverId, approverAvailability)
//   await されてる?: いいえ
//   アクセスされるプロパティ: result.recipientType, result.escalationRequired
//   → 結論: function identifyNotificationRecipient(applicationId: string, documentType: string, currentApprovalStage: string, assignedApproverId: string, approverAvailability: boolean): { recipientId: string; recipientType: string; notificationMethod: string; escalationRequired: boolean }
//
// - 関数名: determinePriorityForApprovalNotification
//   呼び出し例 (テスト中): determinePriorityForApprovalNotification(documentTitle, documentType, submissionDate, deadline, subsidyRelated)
//   await されてる?: いいえ
//   アクセスされるプロパティ: result.priority, result.notificationTiming, result.urgencyReason
//   → 結論: function determinePriorityForApprovalNotification(documentTitle: string, documentType: string, submissionDate: Date, deadline?: Date | null, subsidyRelated?: boolean): { priority: string; notificationTiming: string; urgencyReason: string }
//
// - 関数名: determineNotificationTiming
//   呼び出し例 (テスト中): determineNotificationTiming(pendingApplications, approverWorkload, lastNotificationTime?, applicationPriority?)
//   await されてる?: いいえ
//   アクセスされるプロパティ: result.shouldSendNotification, result.notificationFrequency
//   → 結論: function determineNotificationTiming(pendingApplications: Array<any>, approverWorkload: number, lastNotificationTime?: Date, applicationPriority?: string): { shouldSendNotification: boolean; nextNotificationTime: Date; notificationFrequency: string }
//
// - 関数名: checkApprovalDelayAndNotify
//   呼び出し例 (テスト中): checkApprovalDelayAndNotify(applicationId, currentDateTime, approvalDeadline?, reminderSettings?, approverInfo?)
//   await されてる?: いいえ
//   アクセスされるプロパティ: result.shouldNotify, result.notificationType, result.delayStatus, result.recipients
//   → 結論: function checkApprovalDelayAndNotify(applicationId: string, currentDateTime: Date, approvalDeadline?: Date, reminderSettings?: any, approverInfo?: any): { shouldNotify: boolean; notificationType: string; recipients: string[]; delayStatus: string; nextReminderTime: Date | null }

function addBusinessDays(date: Date, days: number): Date {
  const result = new Date(date);
  let addedDays = 0;
  
  while (addedDays < days) {
    result.setDate(result.getDate() + 1);
    const dayOfWeek = result.getDay();
    if (dayOfWeek !== 0 && dayOfWeek !== 6) { // Skip weekends
      addedDays++;
    }
  }
  
  return result;
}

export function setApprovalDeadline(
  documentType: string,
  subsidyRelated: boolean,
  urgencyLevel: string,
  submissionDate: Date
): { deadlineDate: Date; businessDays: number; notificationSchedule: string[] } {
  if (submissionDate > new Date()) {
    throw new Error("提出日時に未来の日付は指定できません。");
  }
  
  if (!["high", "標準", "low"].includes(urgencyLevel)) {
    throw new Error("緊急度は「高」「標準」「低」のいずれかを選択してください。");
  }
  
  let baseDays = subsidyRelated ? 5 : 3;
  
  if (urgencyLevel === "high") {
    baseDays = baseDays / 2;
  } else if (urgencyLevel === "low") {
    baseDays = baseDays * 1.5;
  }
  
  const deadlineDate = addBusinessDays(submissionDate, baseDays);
  const businessDays = baseDays;
  const notificationSchedule = ["2日前", "当日"];
  
  return { deadlineDate, businessDays, notificationSchedule };
}

export function identifyStagnantApplications(
  applicationStatuses: Array<{
    applicationId: string;
    currentStage: string;
    stageStartDate: Date;
    documentType: string;
    isSubsidyRelated: boolean;
  }>,
  stagnationThresholds: { normal: number; subsidyRelated: number; urgent: number },
  currentDate: Date
): Array<{
  applicationId: string;
  stagnantDays: number;
  thresholdExceeded: number;
  urgencyLevel: string;
  recommendedAction: string;
}> {
  if (applicationStatuses.length === 0) {
    return [];
  }
  
  const stagnantApplications = [];
  
  for (const app of applicationStatuses) {
    if (app.stageStartDate > currentDate) {
      throw new Error("承認段階の開始日が未来日付になっています。データを確認してください。");
    }
    
    const stagnantDays = Math.floor((currentDate.getTime() - app.stageStartDate.getTime()) / (1000 * 60 * 60 * 24));
    const threshold = app.isSubsidyRelated ? stagnationThresholds.subsidyRelated : stagnationThresholds.normal;
    
    if (stagnantDays > threshold) {
      const thresholdExceeded = stagnantDays - threshold;
      let urgencyLevel: string;
      let recommendedAction: string;
      
      if (thresholdExceeded <= 2) {
        urgencyLevel = "low";
        recommendedAction = "メール通知";
      } else if (thresholdExceeded <= 5) {
        urgencyLevel = "medium";
        recommendedAction = "電話連絡";
      } else {
        urgencyLevel = "high";
        recommendedAction = "上司エスカレーション";
      }
      
      stagnantApplications.push({
        applicationId: app.applicationId,
        stagnantDays,
        thresholdExceeded,
        urgencyLevel,
        recommendedAction
      });
    }
  }
  
  return stagnantApplications;
}

export function determinePriorityForReminder(
  pendingApplications: Array<{
    applicationId: string;
    delayDays: number;
    approverLevel: number;
    documentImportance: number;
    applicantDepartment: string;
  }>,
  priorityWeights: { delayWeight: number; levelWeight: number; importanceWeight: number }
): Array<{
  applicationId: string;
  priorityScore: number;
  reminderUrgency: string;
}> {
  if (pendingApplications.length === 0) {
    throw new Error("催促対象となる滞留案件が存在しません。承認進捗を再確認してください。");
  }
  
  if (priorityWeights.delayWeight < 0 || priorityWeights.levelWeight < 0 || priorityWeights.importanceWeight < 0) {
    throw new Error("優先度計算の重み係数に無効な値が設定されています。システム管理者にお問い合わせください。");
  }
  
  const prioritizedList = [];
  
  for (const app of pendingApplications) {
    const delayScore = app.delayDays * priorityWeights.delayWeight;
    const levelScore = app.approverLevel * priorityWeights.levelWeight;
    const importanceScore = app.documentImportance * priorityWeights.importanceWeight;
    const priorityScore = delayScore + levelScore + importanceScore;
    
    let reminderUrgency: string;
    if (priorityScore >= 80) {
      reminderUrgency = "high";
    } else if (priorityScore >= 50) {
      reminderUrgency = "medium";
    } else {
      reminderUrgency = "low";
    }
    
    prioritizedList.push({
      applicationId: app.applicationId,
      priorityScore,
      reminderUrgency
    });
  }
  
  prioritizedList.sort((a, b) => b.priorityScore - a.priorityScore);
  
  return prioritizedList;
}

export function validateReminderFrequency(
  applicationId: string,
  targetApproverId: string,
  lastReminderDate: Date | null,
  currentDate: Date
): { canSendReminder: boolean; waitingDays: number; nextAllowedDate: Date | null } {
  if (!applicationId || applicationId.trim().length === 0) {
    throw new Error("申請書類が特定できません。正しい申請を選択してください。");
  }
  
  if (!targetApproverId || targetApproverId.trim().length === 0) {
    throw new Error("催促対象の承認者が特定できません。");
  }
  
  const daysDiff = lastReminderDate 
    ? Math.floor((currentDate.getTime() - lastReminderDate.getTime()) / (1000 * 60 * 60 * 24))
    : 999;
  
  const canSendReminder = daysDiff >= 3;
  const waitingDays = lastReminderDate ? daysDiff : 0;
  const nextAllowedDate = canSendReminder 
    ? null 
    : new Date(lastReminderDate!.getTime() + 3 * 24 * 60 * 60 * 1000);
  
  return { canSendReminder, waitingDays, nextAllowedDate };
}

export function generateReminderMessage(
  applicationId: string,
  stagnationDays: number,
  documentType: string,
  approverName: string,
  applicantName: string
): { messageContent: string; urgencyLevel: string; notificationMethod: string } {
  if (stagnationDays < 0) {
    throw new Error("滞留日数は0以上である必要があります");
  }
  
  if (!approverName || approverName.trim().length === 0) {
    throw new Error("催促対象の承認者が特定できません");
  }
  
  if (!applicantName || applicantName.trim().length === 0) {
    throw new Error("申請者情報が不正です");
  }
  
  let urgencyLevel: string;
  let notificationMethod: string;
  
  if (stagnationDays >= 4 && stagnationDays <= 7) {
    urgencyLevel = "medium";
  } else if (stagnationDays >= 8) {
    urgencyLevel = "high";
  } else {
    urgencyLevel = "low";
  }
  
  if (documentType.includes("補助金")) {
    if (urgencyLevel === "low") urgencyLevel = "medium";
    else if (urgencyLevel === "medium") urgencyLevel = "high";
  }
  
  let messageContent: string;
  if (urgencyLevel === "low") {
    messageContent = `${approverName}様、${applicantName}様からの申請書類（${documentType}）の承認をお待ちしております。滞留日数：${stagnationDays}日`;
  } else if (urgencyLevel === "medium") {
    messageContent = `${approverName}様、${applicantName}様からの申請書類（${documentType}）の承認が遅れています。滞留日数：${stagnationDays}日。進捗確認をお願いします。`;
  } else {
    messageContent = `【緊急】${approverName}様、${applicantName}様からの申請書類（${documentType}）の承認が大幅に遅れています。滞留日数：${stagnationDays}日。迅速な対応をお願いします。`;
  }
  
  if (urgencyLevel === "low") {
    notificationMethod = "system";
  } else if (urgencyLevel === "medium") {
    notificationMethod = "both";
  } else {
    notificationMethod = "email";
  }
  
  return { messageContent, urgencyLevel, notificationMethod };
}

export function identifyNotificationRecipient(
  applicationId: string,
  documentType: string,
  currentApprovalStage: string,
  assignedApproverId: string,
  approverAvailability: boolean
): { recipientId: string; recipientType: string; notificationMethod: string; escalationRequired: boolean } {
  if (!applicationId || applicationId.trim().length === 0) {
    throw new Error("催促対象の申請案件が特定できません。正しい申請番号を確認してください。");
  }
  
  if (!currentApprovalStage) {
    throw new Error("承認フローの現在段階を特定できません。申請状況を確認してください。");
  }
  
  let recipientId: string;
  let recipientType: string;
  let escalationRequired: boolean;
  
  if (approverAvailability && assignedApproverId) {
    recipientId = assignedApproverId;
    recipientType = "primary_approver";
    escalationRequired = false;
  } else {
    // 代理承認者を探す（簡略化）
    const substitute = findSubstituteApprover(currentApprovalStage);
    if (substitute) {
      recipientId = substitute;
      recipientType = "substitute_approver";
      escalationRequired = false;
    } else {
      recipientId = findSuperiorApprover(currentApprovalStage);
      recipientType = "superior_approver";
      escalationRequired = true;
    }
  }
  
  const isHighPriority = documentType.includes("subsidy") || documentType.includes("grant") || documentType.includes("補助金");
  const notificationMethod = isHighPriority ? "urgent_contact" : "email";
  
  return { recipientId, recipientType, notificationMethod, escalationRequired };
}

function findSubstituteApprover(currentApprovalStage: string): string | null {
  // 簡略化された代理承認者検索
  if (currentApprovalStage.includes("課長")) return "substitute_section_chief";
  if (currentApprovalStage.includes("部長")) return "substitute_department_head";
  return null;
}

function findSuperiorApprover(currentApprovalStage: string): string {
  // 簡略化された上位承認者検索
  if (currentApprovalStage.includes("課長")) return "department_head";
  if (currentApprovalStage.includes("部長")) return "director";
  return "director";
}

export function determinePriorityForApprovalNotification(
  documentTitle: string,
  documentType: string,
  submissionDate: Date,
  deadline?: Date | null,
  subsidyRelated?: boolean
): { priority: string; notificationTiming: string; urgencyReason: string } {
  if (!documentTitle || documentTitle.trim().length === 0) {
    throw new Error("申請書類のタイトルが入力されていません。");
  }
  
  if (!documentType) {
    throw new Error("申請書類の種別を選択してください。");
  }
  
  if (submissionDate > new Date()) {
    throw new Error("提出日時に未来の日付は指定できません。");
  }
  
  const currentDate = new Date();
  const daysUntilDeadline = deadline 
    ? (deadline.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24)
    : null;
  
  const hasUrgentKeywords = /緊急|至急|重要/.test(documentTitle);
  
  let priority = "low";
  let urgencyReason = "通常の申請案件";
  
  if (daysUntilDeadline !== null && daysUntilDeadline <= 3) {
    priority = "high";
    urgencyReason = "期限まで3日以内";
  } else if (subsidyRelated) {
    priority = "high";
    urgencyReason = "補助金関連申請";
  } else if (hasUrgentKeywords) {
    priority = "high";
    urgencyReason = "タイトルに緊急キーワード含有";
  } else if (daysUntilDeadline !== null && daysUntilDeadline <= 7) {
    priority = "normal";
    urgencyReason = "期限まで1週間以内";
  }
  
  const notificationTiming = priority === "high" ? "immediate" : "scheduled";
  
  return { priority, notificationTiming, urgencyReason };
}

export function determineNotificationTiming(
  pendingApplications: Array<any>,
  approverWorkload: number,
  lastNotificationTime?: Date,
  applicationPriority?: string
): { shouldSendNotification: boolean; nextNotificationTime: Date; notificationFrequency: string } {
  if (approverWorkload < 0 || approverWorkload > 100) {
    throw new Error("業務負荷レベルは0から100の範囲で設定してください");
  }
  
  const currentTime = new Date();
  const timeSinceLastNotification = lastNotificationTime 
    ? currentTime.getTime() - lastNotificationTime.getTime()
    : Infinity;
  
  const shouldSuppressNormal = timeSinceLastNotification < 30 * 60 * 1000; // 30分
  const hasUrgentCases = pendingApplications.some(app => 
    app.priority === "high" && (currentTime.getTime() - new Date(app.createdAt).getTime()) > 24 * 60 * 60 * 1000
  );
  
  const shouldSendNotification = hasUrgentCases || (!shouldSuppressNormal && pendingApplications.length > 0);
  
  let baseFrequency = 180; // デフォルト3時間
  if (applicationPriority === "high") {
    baseFrequency = 0; // 即座
  } else if (applicationPriority === "medium") {
    baseFrequency = 60; // 1時間
  }
  
  if (approverWorkload > 80) {
    baseFrequency = baseFrequency * 2;
  }
  
  const nextNotificationTime = new Date(currentTime.getTime() + baseFrequency * 60 * 1000);
  const notificationFrequency = baseFrequency === 0 ? "immediate" : baseFrequency + "minutes";
  
  return { shouldSendNotification, nextNotificationTime, notificationFrequency };
}

export function checkApprovalDelayAndNotify(
  applicationId: string,
  currentDateTime: Date,
  approvalDeadline?: Date,
  reminderSettings?: any,
  approverInfo?: any
): { shouldNotify: boolean; notificationType: string; recipients: string[]; delayStatus: string; nextReminderTime: Date | null } {
  if (!applicationId || applicationId.trim().length === 0) {
    throw new Error("申請案件が特定できません。正しい申請番号を指定してください。");
  }
  
  if (!approvalDeadline) {
    throw new Error("承認期限が設定されていないため、遅延検知ができません。");
  }
  
  const timeUntilDeadline = approvalDeadline.getTime() - currentDateTime.getTime();
  const hoursUntilDeadline = timeUntilDeadline / (1000 * 60 * 60);
  
  let shouldNotify = false;
  let notificationType = "";
  let delayStatus = "正常";
  
  const defaultReminderSettings = {
    beforeDays: [3, 1],
    urgentHours: 24
  };
  
  const settings = reminderSettings || defaultReminderSettings;
  
  if (hoursUntilDeadline < 0) {
    shouldNotify = true;
    notificationType = "緊急催促";
    delayStatus = "緊急";
  } else if (hoursUntilDeadline <= settings.urgentHours) {
    shouldNotify = true;
    notificationType = "遅延警告";
    delayStatus = "遅延";
  } else {
    for (const beforeDays of settings.beforeDays) {
      if (hoursUntilDeadline <= beforeDays * 24 && hoursUntilDeadline > (beforeDays - 1) * 24) {
        shouldNotify = true;
        notificationType = "事前催促";
        delayStatus = "注意";
        break;
      }
    }
  }
  
  const recipients = [approverInfo?.email || "approver@example.com"];
  if (shouldNotify && (notificationType === "遅延警告" || notificationType === "緊急催促")) {
    recipients.push("applicant@example.com", "manager@example.com");
  }
  
  const nextReminderTime = calculateNextReminderTime(currentDateTime, approvalDeadline, settings);
  
  return { shouldNotify, notificationType, recipients, delayStatus, nextReminderTime };
}

function calculateNextReminderTime(currentDateTime: Date, approvalDeadline: Date, reminderSettings: any): Date | null {
  const hoursUntilDeadline = (approvalDeadline.getTime() - currentDateTime.getTime()) / (1000 * 60 * 60);
  
  for (const beforeDays of reminderSettings.beforeDays) {
    const reminderTime = new Date(approvalDeadline.getTime() - beforeDays * 24 * 60 * 60 * 1000);
    if (reminderTime > currentDateTime) {
      return reminderTime;
    }
  }
  
  return null;
}