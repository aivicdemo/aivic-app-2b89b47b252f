// SIG-PLAN:
// - 関数名: setApprovalDeadline
//   呼び出し例 (テスト中): setApprovalDeadline("一般申請", false, "standard", submissionDate)
//   await されてる?: いいえ
//   アクセスされるプロパティ: r.deadlineDate, r.businessDays, r.notificationSchedule
//   → 結論: function setApprovalDeadline(documentType: string, subsidyRelated: boolean, urgencyLevel: string, submissionDate: Date): ApprovalDeadlineResult
//   → ApprovalDeadlineResult = { deadlineDate: Date; businessDays: number; notificationSchedule: string[] }
// - 関数名: identifyStagnantApplications
//   呼び出し例 (テスト中): identifyStagnantApplications(applicationStatuses, thresholds, currentDate)
//   await されてる?: いいえ
//   アクセスされるプロパティ: result[0].applicationId, result[0].stagnantDays, result[0].thresholdExceeded, result[0].urgencyLevel, result[0].recommendedAction
//   → 結論: function identifyStagnantApplications(applicationStatuses: ApplicationStatus[], stagnationThresholds: StagnationThresholds, currentDate: Date): StagnantApplication[]
// - 関数名: determinePriorityForReminder
//   呼び出し例 (テスト中): determinePriorityForReminder(pendingApplications, priorityWeights)
//   await されてる?: いいえ
//   アクセスされるプロパティ: result[0].applicationId, result[0].priorityScore, result[0].reminderUrgency
//   → 結論: function determinePriorityForReminder(pendingApplications: PendingApplication[], priorityWeights: PriorityWeights): PriorityResult[]
// - 関数名: validateReminderFrequency
//   呼び出し例 (テスト中): validateReminderFrequency(applicationId, targetApproverId, lastReminderDate, currentDate)
//   await されてる?: いいえ
//   アクセスされるプロパティ: r.canSendReminder, r.waitingDays, r.nextAllowedDate
//   → 結論: function validateReminderFrequency(applicationId: string, targetApproverId: string, lastReminderDate: Date | null, currentDate: Date): ReminderValidationResult
// - 関数名: generateReminderMessage
//   呼び出し例 (テスト中): generateReminderMessage(applicationId, stagnationDays, documentType, approverName, applicantName)
//   await されてる?: いいえ
//   アクセスされるプロパティ: r.messageContent, r.urgencyLevel, r.notificationMethod
//   → 結論: function generateReminderMessage(applicationId: string, stagnationDays: number, documentType: string, approverName: string, applicantName: string): ReminderMessage
// - 関数名: identifyNotificationRecipient
//   呼び出し例 (テスト中): identifyNotificationRecipient(applicationId, documentType, currentApprovalStage, assignedApproverId, approverAvailability)
//   await されてる?: いいえ
//   アクセスされるプロパティ: r.recipientId, r.recipientType, r.notificationMethod, r.escalationRequired
//   → 結論: function identifyNotificationRecipient(applicationId: string, documentType: string, currentApprovalStage: string, assignedApproverId: string, approverAvailability: boolean): NotificationRecipient
// - 関数名: determinePriorityForApprovalNotification
//   呼び出し例 (テスト中): determinePriorityForApprovalNotification(documentTitle, documentType, submissionDate)
//   await されてる?: いいえ
//   アクセスされるプロパティ: r.priority, r.notificationTiming, r.urgencyReason
//   → 結論: function determinePriorityForApprovalNotification(documentTitle: string, documentType: string, submissionDate: Date): ApprovalNotificationPriority
// - 関数名: determineNotificationTiming
//   呼び出し例 (テスト中): determineNotificationTiming(pendingApplications, approverWorkload, lastNotificationTime, applicationPriority)
//   await されてる?: いいえ
//   アクセスされるプロパティ: r.shouldSendNotification, r.nextNotificationTime, r.notificationFrequency
//   → 結論: function determineNotificationTiming(pendingApplications: Application[], approverWorkload: number, lastNotificationTime: Date, applicationPriority: string): NotificationTiming
// - 関数名: checkApprovalDelayAndNotify
//   呼び出し例 (テスト中): checkApprovalDelayAndNotify(applicationId, currentDateTime) または checkApprovalDelayAndNotify(applicationId, currentDateTime, approvalDeadline, reminderSettings, approverInfo)
//   await されてる?: いいえ
//   アクセスされるプロパティ: r.shouldNotify, r.notificationType, r.delayStatus, r.recipients
//   → 結論: function checkApprovalDelayAndNotify(applicationId: string, currentDateTime: Date, approvalDeadline?: Date, reminderSettings?: ReminderSettings, approverInfo?: ApproverInfo): DelayNotificationResult

interface ApprovalDeadlineResult {
  deadlineDate: Date;
  businessDays: number;
  notificationSchedule: string[];
}

interface ApplicationStatus {
  applicationId: string;
  currentStage: string;
  stageStartDate: Date;
  documentType: string;
  isSubsidyRelated: boolean;
}

interface StagnationThresholds {
  normal: number;
  subsidyRelated: number;
  urgent: number;
}

interface StagnantApplication {
  applicationId: string;
  stagnantDays: number;
  thresholdExceeded: number;
  urgencyLevel: 'low' | 'medium' | 'high';
  recommendedAction: string;
}

interface PendingApplication {
  applicationId: string;
  delayDays: number;
  approverLevel: number;
  documentImportance: number;
  applicantDepartment: string;
}

interface PriorityWeights {
  delayWeight: number;
  levelWeight: number;
  importanceWeight: number;
}

interface PriorityResult {
  applicationId: string;
  priorityScore: number;
  reminderUrgency: 'high' | 'medium' | 'low';
}

interface ReminderValidationResult {
  canSendReminder: boolean;
  waitingDays: number;
  nextAllowedDate: Date | null;
}

interface ReminderMessage {
  messageContent: string;
  urgencyLevel: 'low' | 'medium' | 'high';
  notificationMethod: 'email' | 'system' | 'both';
}

interface NotificationRecipient {
  recipientId: string;
  recipientType: string;
  notificationMethod: string;
  escalationRequired: boolean;
}

interface ApprovalNotificationPriority {
  priority: 'high' | 'normal' | 'low';
  notificationTiming: 'immediate' | 'scheduled';
  urgencyReason: string;
}

interface Application {
  id: string;
  priority: string;
  createdAt: Date;
}

interface NotificationTiming {
  shouldSendNotification: boolean;
  nextNotificationTime: Date;
  notificationFrequency: string;
}

interface ReminderSettings {
  beforeDays: number[];
  urgentHours: number;
}

interface ApproverInfo {
  id: string;
  name: string;
  email: string;
  department: string;
}

interface DelayNotificationResult {
  shouldNotify: boolean;
  notificationType: string;
  recipients: string[];
  delayStatus: string;
  nextReminderTime?: Date | null;
}

function addBusinessDays(date: Date, days: number): Date {
  const result = new Date(date);
  let addedDays = 0;
  
  while (addedDays < days) {
    result.setDate(result.getDate() + 1);
    const dayOfWeek = result.getDay();
    if (dayOfWeek !== 0 && dayOfWeek !== 6) { // 土日を除く
      addedDays++;
    }
  }
  
  return result;
}

function calculateMonthsDifference(date1: Date, date2: Date): number {
  const yearDiff = date2.getFullYear() - date1.getFullYear();
  const monthDiff = date2.getMonth() - date1.getMonth();
  return yearDiff * 12 + monthDiff;
}

function subtractMonths(date: Date, months: number): Date {
  const result = new Date(date);
  result.setMonth(result.getMonth() - months);
  return result;
}

function subtractDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() - days);
  return result;
}

function addMonths(date: Date, months: number): Date {
  const result = new Date(date);
  result.setMonth(result.getMonth() + months);
  return result;
}

function calculateBusinessDays(startDate: Date, endDate: Date): number {
  let businessDays = 0;
  const current = new Date(startDate);
  
  while (current <= endDate) {
    const dayOfWeek = current.getDay();
    if (dayOfWeek !== 0 && dayOfWeek !== 6) { // 土日を除く
      businessDays++;
    }
    current.setDate(current.getDate() + 1);
  }
  
  return businessDays;
}

function calculateSubsidyKeywordMatch(title: string, content: string): number {
  const subsidyKeywords = ["科研費", "運営費交付金", "設備整備費", "補助金", "助成金", "文部科学省"];
  const text = (title + " " + content).toLowerCase();
  let matches = 0;
  
  for (const keyword of subsidyKeywords) {
    if (text.includes(keyword.toLowerCase())) {
      matches++;
    }
  }
  
  return matches / subsidyKeywords.length;
}

function isResearchDepartment(department: string): boolean {
  const researchDepts = ["研究推進課", "学術研究院", "研究支援課"];
  return researchDepts.some(dept => department.includes(dept));
}

function classifyDocumentType(title: string, content: string): string {
  if (title.includes("補助金") || content.includes("補助金")) {
    return "補助金申請書";
  }
  if (title.includes("研究費") || content.includes("研究費")) {
    return "研究費申請書";
  }
  if (title.includes("設備") || content.includes("設備")) {
    return "設備申請書";
  }
  return "一般申請書";
}

function requiresPaperStorage(documentType: string): boolean {
  const paperRequiredTypes = ["補助金申請書", "研究費申請書", "設備申請書"];
  return paperRequiredTypes.includes(documentType);
}

function isMoeRequirement(documentType: string): boolean {
  const moeTypes = ["補助金申請書", "事業報告書", "会計報告書"];
  return moeTypes.includes(documentType);
}

function checkResearchDepartment(department: string): boolean {
  return isResearchDepartment(department);
}

function isMoeStorageRequirement(documentType: string): boolean {
  return isMoeRequirement(documentType);
}

function checkMoeRequirementMatch(documentType: string, requirements: any[]): boolean {
  return requirements.some(req => req.documentType === documentType && req.paperStorageRequired);
}

function isValidApplicationType(applicationType: string): boolean {
  const validTypes = ["補助金申請", "設備申請", "人事申請", "予算申請"];
  return validTypes.includes(applicationType);
}

function isValidDepartment(department: string): boolean {
  return department && department.length > 0;
}

function isValidUrgencyLevel(urgencyLevel: string): boolean {
  const validLevels = ["低", "通常", "高", "緊急"];
  return validLevels.includes(urgencyLevel);
}

function determineRequiredPosition(applicationType: string, applicationAmount: number): string {
  if (applicationAmount >= 10000000) {
    return "理事";
  }
  if (applicationAmount >= 1000000 || applicationType.includes("補助金")) {
    return "部長";
  }
  return "課長";
}

function checkAuthorityLevel(approverPosition: string, requiredPosition: string): boolean {
  const hierarchy = ["課長", "部長", "理事"];
  const approverLevel = hierarchy.indexOf(approverPosition);
  const requiredLevel = hierarchy.indexOf(requiredPosition);
  return approverLevel >= requiredLevel;
}

function findNextApprover(requiredPosition: string): string {
  return `${requiredPosition}承認者`;
}

function calculateDeficiencySeverity(deficiencyItems: string[]): number {
  let severity = 0;
  for (const item of deficiencyItems) {
    if (item.includes("重要") || item.includes("必須")) {
      severity += 3;
    } else if (item.includes("注意")) {
      severity += 2;
    } else {
      severity += 1;
    }
  }
  return severity;
}

function generateConditionalRequirements(deficiencyItems: string[]): string[] {
  return deficiencyItems.map(item => `${item}の修正が必要`);
}

function analyzeSubsidyKeywords(title: string, content: string): number {
  return calculateSubsidyKeywordMatch(title, content);
}

function checkMoeRequirements(title: string): boolean {
  return title.includes("補助金") || title.includes("科研費");
}

function determineNextApproverByRole(currentRole: string, isSubsidyRelated: boolean, decision: string): string | null {
  if (decision === "reject") {
    return null;
  }
  
  if (currentRole === "課長") {
    return isSubsidyRelated ? "部長" : "部長";
  }
  if (currentRole === "部長") {
    return isSubsidyRelated ? "理事" : null;
  }
  return null;
}

function getDirectSupervisor(userId: string): string {
  return `supervisor_${userId}`;
}

function getAdminSupport(departmentId: string): string {
  return `admin_${departmentId}`;
}

function getDepartmentManager(departmentId: string): string {
  return `manager_${departmentId}`;
}

function getApproverByStage(documentType: string, stage: string): { id: string } {
  return { id: `approver_${stage}_${documentType}` };
}

function findSubstituteApprover(documentType: string, stage: string): { id: string } | null {
  return { id: `substitute_${stage}_${documentType}` };
}

function findSuperiorApprover(documentType: string, stage: string): { id: string } {
  return { id: `superior_${stage}_${documentType}` };
}

function getSubstituteApprover(approverId: string): string {
  return `substitute_${approverId}`;
}

function sendSubstitutionNotifications(originalId: string, substituteId: string, applicationId: string): boolean {
  return true;
}

function getResponseWithin(minutes: number): boolean {
  return Math.random() > 0.5;
}

function sendNotifications(targets: string[], methods: string[], details: any): boolean {
  return true;
}

function generateMessageByUrgency(urgency: string, applicant: string, docType: string, days: number): string {
  if (urgency === "high") {
    return `【緊急】${applicant}様の${docType}が${days}日間滞留しています。至急ご対応をお願いします。`;
  } else if (urgency === "medium") {
    return `${applicant}様の${docType}が${days}日間滞留しています。ご確認をお願いします。`;
  } else {
    return `${applicant}様の${docType}の承認をお願いします。`;
  }
}

function calculateNextReminderTime(current: Date, deadline: Date, settings: ReminderSettings): Date | null {
  const timeUntilDeadline = deadline.getTime() - current.getTime();
  const hoursUntilDeadline = timeUntilDeadline / (1000 * 60 * 60);
  
  if (hoursUntilDeadline <= 0) {
    return null;
  }
  
  for (const beforeDays of settings.beforeDays) {
    const beforeHours = beforeDays * 24;
    if (hoursUntilDeadline > beforeHours) {
      return new Date(deadline.getTime() - beforeHours * 60 * 60 * 1000);
    }
  }
  
  return deadline;
}

export function setApprovalDeadline(
  documentType: string,
  subsidyRelated: boolean,
  urgencyLevel: string,
  submissionDate: Date
): ApprovalDeadlineResult {
  if (submissionDate > new Date()) {
    throw new Error("提出日時に未来の日付は指定できません。");
  }
  
  if (!["low", "standard", "high"].includes(urgencyLevel)) {
    throw new Error("緊急度は「高」「標準」「低」のいずれかを選択してください。");
  }
  
  let baseDays = subsidyRelated ? 5 : 3;
  
  if (urgencyLevel === "high") {
    baseDays = baseDays / 2;
  } else if (urgencyLevel === "low") {
    baseDays = baseDays * 1.5;
  }
  
  const deadlineDate = addBusinessDays(submissionDate, baseDays);
  const notificationSchedule = ["2日前", "当日"];
  
  return {
    deadlineDate,
    businessDays: baseDays,
    notificationSchedule
  };
}

export function identifyStagnantApplications(
  applicationStatuses: ApplicationStatus[],
  stagnationThresholds: StagnationThresholds,
  currentDate: Date
): StagnantApplication[] {
  if (applicationStatuses.length === 0) {
    return [];
  }
  
  const stagnantApplications: StagnantApplication[] = [];
  
  for (const app of applicationStatuses) {
    if (app.stageStartDate > currentDate) {
      throw new Error("承認段階の開始日が未来日付になっています。データを確認してください。");
    }
    
    const stagnantDays = Math.floor((currentDate.getTime() - app.stageStartDate.getTime()) / (1000 * 60 * 60 * 24));
    const threshold = app.isSubsidyRelated ? stagnationThresholds.subsidyRelated : stagnationThresholds.normal;
    
    if (stagnantDays > threshold) {
      const thresholdExceeded = stagnantDays - threshold;
      let urgencyLevel: 'low' | 'medium' | 'high';
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
  pendingApplications: PendingApplication[],
  priorityWeights: PriorityWeights
): PriorityResult[] {
  if (pendingApplications.length === 0) {
    throw new Error("催促対象となる滞留案件が存在しません。承認進捗を再確認してください。");
  }
  
  if (priorityWeights.delayWeight < 0 || priorityWeights.levelWeight < 0 || priorityWeights.importanceWeight < 0) {
    throw new Error("優先度計算の重み係数に無効な値が設定されています。システム管理者にお問い合わせください。");
  }
  
  const prioritizedList: PriorityResult[] = [];
  
  for (const app of pendingApplications) {
    const delayScore = app.delayDays * priorityWeights.delayWeight;
    const levelScore = app.approverLevel * priorityWeights.levelWeight;
    const importanceScore = app.documentImportance * priorityWeights.importanceWeight;
    const priorityScore = delayScore + levelScore + importanceScore;
    
    let reminderUrgency: 'high' | 'medium' | 'low';
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
): ReminderValidationResult {
  if (!applicationId || applicationId.length === 0) {
    throw new Error("申請書類が特定できません。正しい申請を選択してください。");
  }
  
  if (!targetApproverId || targetApproverId.length === 0) {
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
  
  return {
    canSendReminder,
    waitingDays,
    nextAllowedDate
  };
}

export function generateReminderMessage(
  applicationId: string,
  stagnationDays: number,
  documentType: string,
  approverName: string,
  applicantName: string
): ReminderMessage {
  if (stagnationDays < 0) {
    throw new Error("滞留日数は0以上である必要があります");
  }
  
  if (!approverName || approverName.length === 0) {
    throw new Error("催促対象の承認者が特定できません");
  }
  
  if (!applicantName || applicantName.length === 0) {
    throw new Error("申請者情報が不正です");
  }
  
  let urgencyLevel: 'low' | 'medium' | 'high' = "low";
  if (stagnationDays >= 4 && stagnationDays <= 7) {
    urgencyLevel = "medium";
  } else if (stagnationDays >= 8) {
    urgencyLevel = "high";
  }
  
  if (documentType.includes("補助金")) {
    if (urgencyLevel === "low") urgencyLevel = "medium";
    else if (urgencyLevel === "medium") urgencyLevel = "high";
  }
  
  const messageContent = generateMessageByUrgency(urgencyLevel, applicantName, documentType, stagnationDays);
  const notificationMethod = urgencyLevel === "low" ? "system" : urgencyLevel === "medium" ? "both" : "email";
  
  return {
    messageContent,
    urgencyLevel,
    notificationMethod
  };
}

export function identifyNotificationRecipient(
  applicationId: string,
  documentType: string,
  currentApprovalStage: string,
  assignedApproverId: string,
  approverAvailability: boolean
): NotificationRecipient {
  if (!applicationId || applicationId.length === 0) {
    throw new Error("催促対象の申請案件が特定できません。正しい申請番号を確認してください。");
  }
  
  if (!currentApprovalStage) {
    throw new Error("承認フローの現在段階を特定できません。申請状況を確認してください。");
  }
  
  const primaryApprover = getApproverByStage(documentType, currentApprovalStage);
  let recipientId: string;
  let recipientType: string;
  let escalationRequired = false;
  
  if (approverAvailability && assignedApproverId === primaryApprover.id) {
    recipientId = assignedApproverId;
    recipientType = "primary_approver";
    escalationRequired = false;
  } else {
    const substitute = findSubstituteApprover(documentType, currentApprovalStage);
    if (substitute !== null) {
      recipientId = substitute.id;
      recipientType = "substitute_approver";
      escalationRequired = false;
    } else {
      const superior = findSuperiorApprover(documentType, currentApprovalStage);
      recipientId = superior.id;
      recipientType = "superior_approver";
      escalationRequired = true;
    }
  }
  
  const isHighPriority = documentType.includes("subsidy") || documentType.includes("grant");
  const notificationMethod = isHighPriority ? "urgent_contact" : "email";
  
  return {
    recipientId,
    recipientType,
    notificationMethod,
    escalationRequired
  };
}

export function determinePriorityForApprovalNotification(
  documentTitle: string,
  documentType: string,
  submissionDate: Date
): ApprovalNotificationPriority {
  if (!documentTitle || documentTitle.length === 0) {
    throw new Error("申請書類のタイトルが入力されていません。");
  }
  
  if (!documentType) {
    throw new Error("申請書類の種別を選択してください。");
  }
  
  if (submissionDate > new Date()) {
    throw new Error("提出日時に未来の日付は指定できません。");
  }
  
  const currentDate = new Date();
  const hasUrgentKeywords = /緊急|至急|重要/.test(documentTitle);
  const subsidyRelated = documentType.includes("補助金") || documentType.includes("助成金");
  
  let priority: 'high' | 'normal' | 'low' = 'low';
  let urgencyReason = '通常の申請案件';
  
  if (subsidyRelated) {
    priority = 'high';
    urgencyReason = '補助金関連申請';
  } else if (hasUrgentKeywords) {
    priority = 'high';
    urgencyReason = 'タイトルに緊急キーワード含有';
  } else {
    priority = 'normal';
    urgencyReason = '通常申請案件';
  }
  
  const notificationTiming = priority === 'high' ? 'immediate' : 'scheduled';
  
  return {
    priority,
    notificationTiming,
    urgencyReason
  };
}

export function determineNotificationTiming(
  pendingApplications: Application[],
  approverWorkload: number,
  lastNotificationTime: Date,
  applicationPriority: string
): NotificationTiming {
  if (approverWorkload < 0 || approverWorkload > 100) {
    throw new Error("業務負荷レベルは0から100の範囲で設定してください");
  }
  
  const currentTime = new Date();
  const timeSinceLastNotification = currentTime.getTime() - lastNotificationTime.getTime();
  const shouldSuppressNormal = timeSinceLastNotification < 30 * 60 * 1000;
  const hasUrgentCases = pendingApplications.some(app => 
    app.priority === "high" && (currentTime.getTime() - app.createdAt.getTime()) > 24 * 60 * 60 * 1000
  );
  
  const shouldSendNotification = hasUrgentCases || (!shouldSuppressNormal && pendingApplications.length > 0);
  
  let baseFrequency = applicationPriority === "high" ? 0 : applicationPriority === "medium" ? 60 : 180;
  if (approverWorkload > 80) {
    baseFrequency = baseFrequency * 2;
  }
  
  const nextNotificationTime = new Date(currentTime.getTime() + baseFrequency * 60 * 1000);
  const notificationFrequency = baseFrequency === 0 ? "immediate" : baseFrequency + "minutes";
  
  return {
    shouldSendNotification,
    nextNotificationTime,
    notificationFrequency
  };
}

export function checkApprovalDelayAndNotify(
  applicationId: string,
  currentDateTime: Date,
  approvalDeadline?: Date,
  reminderSettings?: ReminderSettings,
  approverInfo?: ApproverInfo
): DelayNotificationResult {
  if (!applicationId || applicationId.length === 0) {
    throw new Error("申請案件が特定できません。正しい申請番号を指定してください。");
  }
  
  // デフォルト値の設定
  const defaultDeadline = new Date(currentDateTime.getTime() + 5 * 24 * 60 * 60 * 1000);
  const deadline = approvalDeadline || defaultDeadline;
  
  const defaultSettings: ReminderSettings = {
    beforeDays: [3, 1],
    urgentHours: 24
  };
  const settings = reminderSettings || defaultSettings;
  
  const defaultApprover: ApproverInfo = {
    id: "default_approver",
    name: "承認者",
    email: "approver@university.ac.jp",
    department: "事務局"
  };
  const approver = approverInfo || defaultApprover;
  
  if (!deadline) {
    throw new Error("承認期限が設定されていないため、遅延検知ができません。");
  }
  
  const timeUntilDeadline = deadline.getTime() - currentDateTime.getTime();
  const hoursUntilDeadline = timeUntilDeadline / (1000 * 60 * 60);
  
  let shouldNotify = false;
  let notificationType = "";
  let delayStatus = "正常";
  
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
  
  const recipients = [approver.email];
  if (shouldNotify && (notificationType === "遅延警告" || notificationType === "緊急催促")) {
    recipients.push("applicant@university.ac.jp", "manager@university.ac.jp");
  }
  
  const nextReminderTime = calculateNextReminderTime(currentDateTime, deadline, settings);
  
  return {
    shouldNotify,
    notificationType,
    recipients,
    delayStatus,
    nextReminderTime
  };
}