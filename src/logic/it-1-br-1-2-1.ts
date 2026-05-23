// SIG-PLAN:
// - 関数名: setApprovalDeadline
//   呼び出し例 (テスト中): setApprovalDeadline(documentType, subsidyRelated, urgencyLevel, submissionDate)
//   await されてる?: いいえ
//   アクセスされるプロパティ: r.businessDays, r.deadlineDate, r.notificationSchedule
//   → 結論: function setApprovalDeadline(documentType: string, subsidyRelated: boolean, urgencyLevel: string, submissionDate: Date): { businessDays: number; deadlineDate: Date; notificationSchedule: string[] }
// - 関数名: identifyStagnantApplications
//   呼び出し例 (テスト中): identifyStagnantApplications(applicationStatuses, stagnationThresholds, currentDate)
//   await されてる?: いいえ
//   アクセスされるプロパティ: result[0].applicationId, result[0].stagnantDays, result[0].thresholdExceeded, result[0].urgencyLevel, result[0].recommendedAction
//   → 結論: function identifyStagnantApplications(applicationStatuses: Array<{applicationId: string, currentStage: string, stageStartDate: Date, documentType: string, isSubsidyRelated: boolean}>, stagnationThresholds: {normal: number, subsidyRelated: number, urgent: number}, currentDate: Date): Array<{applicationId: string, stagnantDays: number, thresholdExceeded: number, urgencyLevel: string, recommendedAction: string}>
// - 関数名: determinePriorityForReminder
//   呼び出し例 (テスト中): determinePriorityForReminder(pendingApplications, priorityWeights)
//   await されてる?: いいえ
//   アクセスされるプロパティ: result[0].applicationId, result[0].priorityScore, result[0].reminderUrgency
//   → 結論: function determinePriorityForReminder(pendingApplications: Array<{applicationId: string, delayDays: number, approverLevel: number, documentImportance: number, applicantDepartment: string}>, priorityWeights: {delayWeight: number, levelWeight: number, importanceWeight: number}): Array<{applicationId: string, priorityScore: number, reminderUrgency: string}>
// - 関数名: validateReminderFrequency
//   呼び出し例 (テスト中): validateReminderFrequency(applicationId, targetApproverId, lastReminderDate, currentDate)
//   await されてる?: いいえ
//   アクセスされるプロパティ: r.canSendReminder, r.waitingDays, r.nextAllowedDate
//   → 結論: function validateReminderFrequency(applicationId: string, targetApproverId: string, lastReminderDate: Date | null, currentDate: Date): { canSendReminder: boolean; waitingDays: number; nextAllowedDate: Date | null }
// - 関数名: generateReminderMessage
//   呼び出し例 (テスト中): generateReminderMessage(applicationId, stagnationDays, documentType, approverName, applicantName)
//   await されてる?: いいえ
//   アクセスされるプロパティ: r.messageContent, r.urgencyLevel, r.notificationMethod
//   → 結論: function generateReminderMessage(applicationId: string, stagnationDays: number, documentType: string, approverName: string, applicantName: string): { messageContent: string; urgencyLevel: string; notificationMethod: string }
// - 関数名: identifyNotificationRecipient
//   呼び出し例 (テスト中): identifyNotificationRecipient(applicationId, documentType, currentApprovalStage, assignedApproverId, approverAvailability)
//   await されてる?: いいえ
//   アクセスされるプロパティ: r.recipientId, r.recipientType, r.notificationMethod, r.escalationRequired
//   → 結論: function identifyNotificationRecipient(applicationId: string, documentType: string, currentApprovalStage: string, assignedApproverId: string, approverAvailability: boolean): { recipientId: string; recipientType: string; notificationMethod: string; escalationRequired: boolean }
// - 関数名: determinePriorityForApprovalNotification
//   呼び出し例 (テスト中): determinePriorityForApprovalNotification(documentTitle, documentType, submissionDate, deadline, subsidyRelated)
//   await されてる?: いいえ
//   アクセスされるプロパティ: r.priority, r.notificationTiming, r.urgencyReason
//   → 結論: function determinePriorityForApprovalNotification(documentTitle: string, documentType: string, submissionDate: Date, deadline?: Date | null, subsidyRelated?: boolean): { priority: string; notificationTiming: string; urgencyReason: string }
// - 関数名: determineNotificationTiming
//   呼び出し例 (テスト中): determineNotificationTiming(pendingApplications, approverWorkload, lastNotificationTime, applicationPriority)
//   await されてる?: いいえ
//   アクセスされるプロパティ: r.shouldSendNotification, r.nextNotificationTime.getTime, r.notificationFrequency
//   → 結論: function determineNotificationTiming(pendingApplications: Array<any>, approverWorkload: number, lastNotificationTime: Date, applicationPriority: string): { shouldSendNotification: boolean; nextNotificationTime: Date; notificationFrequency: string }
// - 関数名: checkApprovalDelayAndNotify
//   呼び出し例 (テスト中): checkApprovalDelayAndNotify(applicationId, currentDateTime, approvalDeadline, reminderSettings, approverInfo)
//   await されてる?: いいえ
//   アクセスされるプロパティ: r.shouldNotify, r.notificationType, r.recipients, r.delayStatus
//   → 結論: function checkApprovalDelayAndNotify(applicationId: string, currentDateTime: Date, approvalDeadline?: Date, reminderSettings?: { beforeDays: number[], urgentHours: number }, approverInfo?: { id: string, name: string, email: string, department: string }): { shouldNotify: boolean; notificationType: string; recipients: string[]; delayStatus: string }

export function validateApplicationInput(
  documentTitle: string,
  documentContent: string,
  applicationType: string,
  applicantDepartment: string,
  urgencyLevel: string
): { isValid: boolean; errors: string[]; warnings: string[] } {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  if (!documentTitle || documentTitle.length < 10 || documentTitle.length > 200) {
    errors.push("申請書類のタイトルは10文字以上200文字以内で入力してください");
  }
  
  if (!documentContent || documentContent.length < 50) {
    errors.push("申請内容は50文字以上で詳しく記載してください");
  }
  
  if (!applicationType || !isValidApplicationType(applicationType)) {
    errors.push("申請種別を正しく選択してください");
  }
  
  if (!applicantDepartment || !isValidDepartment(applicantDepartment)) {
    errors.push("所属部署を正しく入力してください");
  }
  
  if (!urgencyLevel || !isValidUrgencyLevel(urgencyLevel)) {
    errors.push("緊急度を選択してください");
  }
  
  const isValid = errors.length === 0;
  
  return { isValid, errors, warnings };
}

function isValidApplicationType(type: string): boolean {
  const validTypes = ["補助金申請", "設備申請", "人事申請", "予算申請", "研究費申請"];
  return validTypes.includes(type);
}

function isValidDepartment(department: string): boolean {
  const validDepartments = ["総務部", "経理部", "研究推進部", "学務部", "情報システム課"];
  return validDepartments.includes(department);
}

function isValidUrgencyLevel(level: string): boolean {
  const validLevels = ["低", "通常", "高", "緊急"];
  return validLevels.includes(level);
}

export function validateApplicationAmountAndPeriod(
  applicationAmount: number,
  implementationStartDate: string,
  implementationEndDate: string,
  documentType: string,
  budgetLimits: { [key: string]: { maxAmount: number; minAmount: number } }
): { isAmountValid: boolean; isPeriodValid: boolean; validationErrors: string[]; canProceed: boolean } {
  const budgetLimit = budgetLimits[documentType];
  const isAmountValid = applicationAmount >= budgetLimit.minAmount && applicationAmount <= budgetLimit.maxAmount;
  const startDate = new Date(implementationStartDate);
  const endDate = new Date(implementationEndDate);
  const today = new Date();
  const isPeriodValid = startDate >= today && endDate > startDate;
  const validationErrors: string[] = [];
  if (!isAmountValid) {
    validationErrors.push("申請金額が規定範囲外です");
  }
  if (!isPeriodValid) {
    validationErrors.push("実施期間が不正です");
  }
  const canProceed = isAmountValid && isPeriodValid;
  return { isAmountValid, isPeriodValid, validationErrors, canProceed };
}

export function classifyDocumentTypeAndRoute(
  documentTitle: string,
  documentContent: string,
  applicantDepartment: string
): { documentType: string; processingRoute: string; subsidyRelated: boolean; paperStorageRequired: boolean } {
  const keywordScore = calculateSubsidyKeywordMatch(documentTitle, documentContent);
  const subsidyRelated = keywordScore >= 0.7;
  const documentType = determineDocumentType(documentTitle, applicantDepartment);
  const paperStorageRequired = subsidyRelated && isMoeRequiredPaperStorage(documentType);
  const processingRoute = paperStorageRequired ? "hybrid" : "electronic";
  return { documentType, processingRoute, subsidyRelated, paperStorageRequired };
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

function determineDocumentType(title: string, department: string): string {
  if (title.includes("補助金") || title.includes("科研費")) {
    return "補助金申請書";
  }
  if (title.includes("設備") || title.includes("機器")) {
    return "設備申請書";
  }
  if (title.includes("人事") || title.includes("採用")) {
    return "人事関連書類";
  }
  return "一般申請書";
}

function isMoeRequiredPaperStorage(documentType: string): boolean {
  const moeRequiredTypes = ["補助金申請書", "事業報告書", "会計報告書", "監査資料"];
  return moeRequiredTypes.includes(documentType);
}

export function determineDocumentTypeAndRoute(
  documentTitle: string,
  documentContent: string,
  applicantDepartment: string
): { documentType: string; processingRoute: string; subsidyRelated: boolean; paperStorageRequired: boolean } {
  const keywordScore = calculateSubsidyKeywordMatch(documentTitle, documentContent);
  const subsidyRelated = keywordScore >= 0.7;
  const paperStorageRequired = subsidyRelated && checkMoeRequirement(documentTitle, applicantDepartment);
  const processingRoute = paperStorageRequired ? "hybrid" : "electronic";
  const documentType = determineDocumentCategory(documentTitle, applicantDepartment, subsidyRelated);
  return { documentType, processingRoute, subsidyRelated, paperStorageRequired };
}

function checkMoeRequirement(title: string, department: string): boolean {
  return title.includes("補助金") || title.includes("科研費") || title.includes("運営費交付金");
}

function determineDocumentCategory(title: string, department: string, subsidyRelated: boolean): string {
  if (subsidyRelated) {
    return "補助金申請書";
  }
  if (title.includes("設備")) {
    return "設備申請書";
  }
  return "一般申請書";
}

export function checkMoeComplianceRequirements(
  documentTitle: string,
  documentContent: string,
  applicantDepartment: string
): { documentType: string; processingRoute: string; subsidyRelated: boolean; paperStorageRequired: boolean } {
  const keywordScore = calculateMoeKeywordMatch(documentTitle, documentContent);
  const departmentBonus = isResearchDepartment(applicantDepartment) ? 0.1 : 0.0;
  const adjustedScore = keywordScore + departmentBonus;
  const subsidyRelated = adjustedScore >= 0.7 || (isResearchDepartment(applicantDepartment) && adjustedScore >= 0.6);
  const documentType = classifyDocumentType(documentTitle, documentContent);
  const paperStorageRequired = subsidyRelated && isMoeStorageRequirement(documentType);
  const processingRoute = paperStorageRequired ? "hybrid" : "electronic";
  return { documentType, processingRoute, subsidyRelated, paperStorageRequired };
}

function calculateMoeKeywordMatch(title: string, content: string): number {
  const moeKeywords = ["文部科学省", "補助金", "科研費", "運営費交付金", "設備整備費"];
  const text = (title + " " + content).toLowerCase();
  let matches = 0;
  for (const keyword of moeKeywords) {
    if (text.includes(keyword.toLowerCase())) {
      matches++;
    }
  }
  return matches / moeKeywords.length;
}

function isResearchDepartment(department: string): boolean {
  const researchDepts = ["研究推進部", "学術研究院", "研究科"];
  return researchDepts.some(dept => department.includes(dept));
}

function classifyDocumentType(title: string, content: string): string {
  if (title.includes("補助金") || content.includes("補助金")) {
    return "補助金申請書";
  }
  if (title.includes("設備") || content.includes("設備")) {
    return "設備申請書";
  }
  return "一般申請書";
}

function isMoeStorageRequirement(documentType: string): boolean {
  const requiredTypes = ["補助金申請書", "事業報告書", "会計報告書"];
  return requiredTypes.includes(documentType);
}

export function setApproverAuthorityLevel(
  documentType: string,
  subsidyRelated: boolean,
  paperStorageRequired: boolean,
  applicantDepartment: string,
  budgetAmount: number
): { requiredAuthorityLevel: string; approverRoles: string[]; escalationRequired: boolean } {
  const isHighBudget = budgetAmount > 5000000;
  const isVeryHighBudget = budgetAmount > 10000000;
  const needsHighAuthority = subsidyRelated || isHighBudget;
  const requiredAuthorityLevel = needsHighAuthority ? "department_head" : "section_chief";
  const approverRoles = [requiredAuthorityLevel];
  if (paperStorageRequired) {
    approverRoles.push("administrative_director");
  }
  const escalationRequired = isVeryHighBudget;
  return { requiredAuthorityLevel, approverRoles, escalationRequired };
}

export function determineApprovalHierarchy(
  applicationAmount: number,
  documentType: string,
  applicantDepartment: string
): { approvalLevel: string; approvers: string[]; estimatedDays: number; requiresPaperApproval: boolean } {
  let approvalLevel = "";
  let estimatedDays = 0;
  let requiresPaperApproval = false;
  
  if (documentType.includes("補助金")) {
    if (applicationAmount >= 1000000) {
      approvalLevel = "理事承認";
      estimatedDays = 7;
    } else {
      approvalLevel = "部長承認";
      estimatedDays = 5;
    }
    requiresPaperApproval = true;
  } else {
    if (applicationAmount < 100000) {
      approvalLevel = "課長承認";
      estimatedDays = 3;
    } else if (applicationAmount < 1000000) {
      approvalLevel = "部長承認";
      estimatedDays = 5;
    } else {
      approvalLevel = "理事承認";
      estimatedDays = 7;
    }
  }
  
  const approvers = getApproversByLevel(approvalLevel, applicantDepartment);
  return { approvalLevel, approvers, estimatedDays, requiresPaperApproval };
}

function getApproversByLevel(level: string, department: string): string[] {
  const approverMap: { [key: string]: string[] } = {
    "課長承認": ["課長"],
    "部長承認": ["部長"],
    "理事承認": ["理事", "学長"]
  };
  return approverMap[level] || ["課長"];
}

export function validateApplicationBeforeSubmission(
  documentTitle: string,
  documentContent: string,
  documentType: string,
  processingRoute: string,
  approvalRoute: string[],
  requiredFields: Record<string, any>
): { isValid: boolean; errors: string[]; warnings: string[] } {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  if (!documentTitle || documentTitle.trim().length === 0) {
    errors.push("申請書類のタイトルを入力してください");
  }
  
  if (!documentContent || documentContent.trim().length < 10) {
    errors.push("申請内容を10文字以上で入力してください");
  }
  
  for (const field in requiredFields) {
    if (!requiredFields[field]) {
      errors.push(`必須項目「${field}」を入力してください`);
    }
  }
  
  if (documentType === "subsidy" && processingRoute !== "hybrid") {
    errors.push("補助金関連書類はハイブリッド処理が必要です");
  }
  
  if (approvalRoute.length === 0) {
    errors.push("承認者を設定してください");
  }
  
  const isValid = errors.length === 0;
  
  return { isValid, errors, warnings };
}

export function setApprovalDeadline(
  documentType: string,
  subsidyRelated: boolean,
  urgencyLevel: string,
  submissionDate: Date
): { deadlineDate: Date; businessDays: number; notificationSchedule: string[] } {
  if (!documentType) {
    throw new Error("申請書類の種別が指定されていません。");
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

function addBusinessDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setTime(result.getTime() + days * 24 * 60 * 60 * 1000);
  return result;
}

export function processUrgentApplicationPriority(
  applicationData: any,
  urgencyFlag: boolean,
  deadlineDate: Date,
  currentApprovalQueue: any[]
): { priorityLevel: number; queuePosition: number; notificationTargets: any[]; processingDeadline: Date } {
  const currentDate = new Date();
  const isUrgent = urgencyFlag || (deadlineDate.getTime() - currentDate.getTime()) <= 3 * 24 * 60 * 60 * 1000;
  
  let priorityLevel: number;
  let queuePosition: number;
  let notificationTargets: any[];
  let processingDeadline: Date;
  
  if (isUrgent) {
    priorityLevel = 1;
    queuePosition = 0;
    notificationTargets = getAllApprovers(applicationData.approvalRoute);
    processingDeadline = new Date(currentDate.getTime() + 24 * 60 * 60 * 1000);
  } else {
    priorityLevel = calculateNormalPriority(applicationData);
    queuePosition = currentApprovalQueue.length;
    notificationTargets = getNextApprover(applicationData.approvalRoute);
    processingDeadline = calculateNormalDeadline(applicationData);
  }
  
  return { priorityLevel, queuePosition, notificationTargets, processingDeadline };
}

function getAllApprovers(approvalRoute: any): any[] {
  return approvalRoute || [];
}

function getNextApprover(approvalRoute: any): any[] {
  return approvalRoute ? [approvalRoute[0]] : [];
}

function calculateNormalPriority(applicationData: any): number {
  return 3;
}

function calculateNormalDeadline(applicationData: any): Date {
  const currentDate = new Date();
  return new Date(currentDate.getTime() + 7 * 24 * 60 * 60 * 1000);
}

export function handleSystemFailureAlternativeProcess(
  systemStatus: string,
  failureType: string,
  documentType: string,
  urgencyLevel: number
): { alternativeProcess: string; notificationTargets: string[]; dataRecoveryPlan: string; estimatedRecoveryTime: number } {
  let alternativeProcess: string;
  if (systemStatus === "critical_failure") {
    alternativeProcess = "full_paper_mode";
  } else if (systemStatus === "partial_failure") {
    alternativeProcess = "manual_hybrid_mode";
  } else {
    alternativeProcess = "temporary_workaround";
  }
  
  let notificationTargets: string[];
  if (urgencyLevel >= 8) {
    notificationTargets = ["all_staff", "management", "it_support"];
  } else {
    notificationTargets = ["relevant_staff", "it_support"];
  }
  
  const dataRecoveryPlan = "sync_paper_to_electronic_after_recovery";
  const estimatedRecoveryTime = calculateRecoveryTime(failureType);
  
  return { alternativeProcess, notificationTargets, dataRecoveryPlan, estimatedRecoveryTime };
}

function calculateRecoveryTime(failureType: string): number {
  const recoveryTimes: { [key: string]: number } = {
    "database_connection": 60,
    "api_timeout": 30,
    "system_overload": 120,
    "hardware_failure": 240
  };
  return recoveryTimes[failureType] || 90;
}

export function checkApprovalStatusViewPermission(
  userId: string,
  applicationId: string,
  userRole: string,
  applicationOwner: string,
  departmentId: string
): { canView: boolean; viewLevel: string; allowedFields: string[] } {
  const isOwner = userId === applicationOwner;
  if (isOwner) {
    return { canView: true, viewLevel: "full", allowedFields: ["status", "currentApprover", "history", "comments"] };
  }
  const isManager = userRole === "manager" || userRole === "director";
  const sameDepartment = getUserDepartment(userId) === getApplicationDepartment(applicationId);
  if (isManager && sameDepartment) {
    return { canView: true, viewLevel: "progress", allowedFields: ["status", "currentApprover"] };
  }
  if (sameDepartment) {
    return { canView: true, viewLevel: "basic", allowedFields: ["status"] };
  }
  return { canView: false, viewLevel: "none", allowedFields: [] };
}

function getUserDepartment(userId: string): string {
  return "総務部";
}

function getApplicationDepartment(applicationId: string): string {
  return "総務部";
}

export function getProgressDataWithAccessControl(
  userId: string,
  applicationId: string,
  userRole: string
): { accessGranted: boolean; progressData: any; restrictionReason: string | null } {
  const hasAccess = checkUserAccess(userId, applicationId, userRole);
  if (!hasAccess) {
    return { accessGranted: false, progressData: null, restrictionReason: "アクセス権限がありません" };
  }
  const progressData = fetchProgressData(applicationId);
  return { accessGranted: true, progressData: progressData, restrictionReason: null };
}

function checkUserAccess(userId: string, applicationId: string, userRole: string): boolean {
  return userRole === "admin" || userRole === "manager";
}

function fetchProgressData(applicationId: string): any {
  return {
    currentStep: "課長承認",
    approverName: "田中課長",
    submissionDate: "2024-01-15",
    daysElapsed: 3,
    nextAction: "承認待ち"
  };
}

export function identifyStagnantApplications(
  applicationStatuses: Array<{
    applicationId: string;
    currentStage: string;
    stageStartDate: Date;
    documentType: string;
    isSubsidyRelated: boolean;
  }>,
  stagnationThresholds: {
    normal: number;
    subsidyRelated: number;
    urgent: number;
  },
  currentDate: Date
): Array<{
  applicationId: string;
  stagnantDays: number;
  thresholdExceeded: number;
  urgencyLevel: string;
  recommendedAction: string;
}> {
  const stagnantApplications: Array<{
    applicationId: string;
    stagnantDays: number;
    thresholdExceeded: number;
    urgencyLevel: string;
    recommendedAction: string;
  }> = [];
  
  for (const app of applicationStatuses) {
    const stagnantDays = Math.floor((currentDate.getTime() - app.stageStartDate.getTime()) / (1000 * 60 * 60 * 24));
    const threshold = app.isSubsidyRelated ? stagnationThresholds.subsidyRelated : stagnationThresholds.normal;
    if (stagnantDays > threshold) {
      const thresholdExceeded = stagnantDays - threshold;
      const urgencyLevel = thresholdExceeded <= 2 ? "low" : thresholdExceeded <= 5 ? "medium" : "high";
      const recommendedAction = urgencyLevel === "low" ? "メール通知" : urgencyLevel === "medium" ? "電話連絡" : "上司エスカレーション";
      stagnantApplications.push({ applicationId: app.applicationId, stagnantDays, thresholdExceeded, urgencyLevel, recommendedAction });
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
  priorityWeights: {
    delayWeight: number;
    levelWeight: number;
    importanceWeight: number;
  }
): Array<{
  applicationId: string;
  priorityScore: number;
  reminderUrgency: string;
}> {
  const prioritizedList: Array<{
    applicationId: string;
    priorityScore: number;
    reminderUrgency: string;
  }> = [];
  
  for (const app of pendingApplications) {
    const delayScore = app.delayDays * priorityWeights.delayWeight;
    const levelScore = app.approverLevel * priorityWeights.levelWeight;
    const importanceScore = app.documentImportance * priorityWeights.importanceWeight;
    const priorityScore = delayScore + levelScore + importanceScore;
    let reminderUrgency = "low";
    if (priorityScore >= 80) {
      reminderUrgency = "high";
    } else if (priorityScore >= 50) {
      reminderUrgency = "medium";
    }
    prioritizedList.push({
      applicationId: app.applicationId,
      priorityScore: priorityScore,
      reminderUrgency: reminderUrgency
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
  const daysDiff = lastReminderDate ? Math.floor((currentDate.getTime() - lastReminderDate.getTime()) / (1000 * 60 * 60 * 24)) : 999;
  const canSendReminder = daysDiff >= 3;
  const waitingDays = lastReminderDate ? daysDiff : 0