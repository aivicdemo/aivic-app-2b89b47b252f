// SIG-PLAN:
// - 関数名: validateApplicationBeforeSubmission
//   呼び出し例 (テスト中): validateApplicationBeforeSubmission(documentTitle, documentContent, documentType, processingRoute, approvalRoute, requiredFields)
//   await されてる?: いいえ
//   アクセスされるプロパティ: result.isValid, result.errors
//   → 結論: function validateApplicationBeforeSubmission(documentTitle: string, documentContent: string, documentType: string, processingRoute: string, approvalRoute: string[], requiredFields: Record<string, any>): { isValid: boolean; errors: string[]; warnings: string[] }
// - 関数名: analyzeRegulationImpactScope
//   呼び出し例 (テスト中): analyzeRegulationImpactScope(regulationChangeContent, affectedRegulationTypes, currentDocumentTypes)
//   await されてる?: いいえ
//   アクセスされるプロパティ: result.affectedDocumentTypes, result.changeRequiredCount
//   → 結論: function analyzeRegulationImpactScope(regulationChangeContent: string, affectedRegulationTypes: string[], currentDocumentTypes: Array<{typeName: string, regulationCategory: string, storageRequirement: string}>): RegulationImpactAnalysis
// - 関数名: classifyLegalChangeImpactLevel
//   呼び出し例 (テスト中): classifyLegalChangeImpactLevel(changeNotification, affectedDocumentTypes, currentProcessingRules, complianceDeadline)
//   await されてる?: いいえ
//   アクセスされるプロパティ: result.impactLevel, result.priority, result.requiredResponseDays, result.affectedRuleCount, result.riskAssessment
//   → 結論: function classifyLegalChangeImpactLevel(changeNotification: string, affectedDocumentTypes: string[], currentProcessingRules: object[], complianceDeadline: Date): { impactLevel: 'high' | 'medium' | 'low', priority: number, requiredResponseDays: number, affectedRuleCount: number, riskAssessment: string }
// - 関数名: migrateExistingDataToNewClassification
//   呼び出し例 (テスト中): migrateExistingDataToNewClassification(newClassificationRules, existingDocuments, migrationScope)
//   await されてる?: いいえ
//   アクセスされるプロパティ: result.migratedCount, result.skippedCount, result.errorCount, result.updatedRoutes
//   → 結論: function migrateExistingDataToNewClassification(newClassificationRules: ClassificationRule[], existingDocuments: Document[], migrationScope: string): MigrationResult

interface ClassificationRule {
  documentType: string;
  processingRoute: string;
  paperStorageRequired: boolean;
}

interface Document {
  id: string;
  type: string;
  current_processing_route: string;
}

interface RouteUpdate {
  documentId: string;
  oldRoute: string;
  newRoute: string;
}

interface MigrationResult {
  migratedCount: number;
  skippedCount: number;
  errorCount: number;
  updatedRoutes: RouteUpdate[];
}

interface RegulationImpactAnalysis {
  affectedDocumentTypes: string[];
  processingRouteChanges: ProcessingRouteChange[];
  impactLevel: string;
  changeRequiredCount: number;
}

interface ProcessingRouteChange {
  documentType: string;
  oldRoute: string;
  newRoute: string;
}

interface DocumentType {
  typeName: string;
  regulationCategory: string;
  storageRequirement: string;
}

// 申請書類提出前の妥当性検証
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
    errors.push("補助金関連書類は紙保管が必要なため、ハイブリッド処理を選択してください");
  }

  if (approvalRoute.length === 0) {
    errors.push("承認者を設定してください");
  }

  const isValid = errors.length === 0;

  return { isValid, errors, warnings };
}

// 申請内容入力時の妥当性検証
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

function isValidApplicationType(applicationType: string): boolean {
  const validTypes = ["補助金申請", "設備申請", "人事申請", "予算申請"];
  return validTypes.includes(applicationType);
}

function isValidDepartment(department: string): boolean {
  return department && department.length > 0;
}

function isValidUrgencyLevel(urgencyLevel: string): boolean {
  const validLevels = ["通常", "急ぎ", "至急"];
  return validLevels.includes(urgencyLevel);
}

// 申請金額と期間の妥当性検証
export function validateApplicationAmountAndPeriod(
  applicationAmount: number,
  implementationStartDate: string,
  implementationEndDate: string,
  documentType: string,
  budgetLimits: { [key: string]: { minAmount: number; maxAmount: number } }
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

// 文書種別と処理ルートの自動判別
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
  const subsidyKeywords = ["科研費", "運営費交付金", "設備整備費", "補助金"];
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
  if (title.includes("設備")) {
    return "設備申請書";
  }
  if (title.includes("人事")) {
    return "人事関連書類";
  }
  return "一般申請書";
}

function isMoeRequiredPaperStorage(documentType: string): boolean {
  const moeRequiredTypes = ["補助金申請書", "事業報告書", "会計報告書"];
  return moeRequiredTypes.includes(documentType);
}

// 文書種別と処理ルートの決定
export function determineDocumentTypeAndRoute(
  documentTitle: string,
  documentContent: string,
  applicantDepartment: string
): { documentType: string; processingRoute: string; subsidyRelated: boolean; paperStorageRequired: boolean } {
  const keywordScore = calculateSubsidyKeywordMatch(documentTitle, documentContent);
  const departmentBonus = isResearchDepartment(applicantDepartment) ? 0.1 : 0.0;
  const adjustedScore = keywordScore + departmentBonus;
  const subsidyRelated = adjustedScore >= 0.7 || (isResearchDepartment(applicantDepartment) && adjustedScore >= 0.6);
  const documentType = classifyDocumentType(documentTitle, documentContent);
  const paperStorageRequired = subsidyRelated && isMoeStorageRequirement(documentType);
  const processingRoute = paperStorageRequired ? "hybrid" : "electronic";
  
  return { documentType, processingRoute, subsidyRelated, paperStorageRequired };
}

function isResearchDepartment(department: string): boolean {
  const researchDepts = ["研究推進部", "学術研究院", "研究科"];
  return researchDepts.some(dept => department.includes(dept));
}

function classifyDocumentType(title: string, content: string): string {
  if (title.includes("補助金") || content.includes("補助金")) {
    return "補助金申請書";
  }
  if (title.includes("研究費") || content.includes("研究費")) {
    return "研究費申請書";
  }
  return "一般申請書";
}

function isMoeStorageRequirement(documentType: string): boolean {
  const moeTypes = ["補助金申請書", "研究費申請書"];
  return moeTypes.includes(documentType);
}

// 文部科学省要件への適合性チェック
export function checkMoeComplianceRequirements(
  documentTitle: string,
  documentContent: string,
  applicantDepartment: string
): { documentType: string; processingRoute: string; subsidyRelated: boolean; paperStorageRequired: boolean } {
  const keywordScore = calculateMoeKeywordMatch(documentTitle, documentContent);
  const isResearchDept = checkResearchDepartment(applicantDepartment);
  const threshold = isResearchDept ? 0.6 : 0.7;
  const subsidyRelated = keywordScore >= threshold;
  const documentType = classifyDocumentType(documentTitle, documentContent);
  const paperStorageRequired = subsidyRelated && requiresPaperStorage(documentType);
  const processingRoute = paperStorageRequired ? "hybrid" : "electronic";
  
  return { documentType, processingRoute, subsidyRelated, paperStorageRequired };
}

function calculateMoeKeywordMatch(title: string, content: string): number {
  const moeKeywords = ["文部科学省", "科研費", "運営費交付金", "補助金"];
  const text = (title + " " + content).toLowerCase();
  let score = 0;
  
  for (const keyword of moeKeywords) {
    if (text.includes(keyword.toLowerCase())) {
      score += 0.25;
    }
  }
  
  return Math.min(score, 1.0);
}

function checkResearchDepartment(department: string): boolean {
  return isResearchDepartment(department);
}

function requiresPaperStorage(documentType: string): boolean {
  return isMoeStorageRequirement(documentType);
}

// 承認者権限レベルの設定
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

// 承認階層の決定
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
  const approvers: { [key: string]: string[] } = {
    "課長承認": [`${department}課長`],
    "部長承認": [`${department}部長`],
    "理事承認": ["理事", "事務局長"]
  };
  return approvers[level] || ["承認者"];
}

// 承認期限の設定
export function setApprovalDeadline(
  documentType: string,
  subsidyRelated: boolean,
  urgencyLevel: string,
  submissionDate: Date
): { deadlineDate: Date; businessDays: number; notificationSchedule: string[] } {
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
  let addedDays = 0;
  
  while (addedDays < days) {
    result.setDate(result.getDate() + 1);
    if (result.getDay() !== 0 && result.getDay() !== 6) {
      addedDays++;
    }
  }
  
  return result;
}

// 緊急申請の優先度処理
export function processUrgentApplicationPriority(
  applicationData: { approvalRoute: string[]; createdAt: Date; priority: string },
  urgencyFlag: boolean,
  deadlineDate: Date,
  currentApprovalQueue: any[]
): { priorityLevel: number; queuePosition: number; notificationTargets: string[]; processingDeadline: Date } {
  const currentDate = new Date();
  const isUrgent = urgencyFlag || (deadlineDate.getTime() - currentDate.getTime()) <= 3 * 24 * 60 * 60 * 1000;
  
  let priorityLevel: number;
  let queuePosition: number;
  let notificationTargets: string[];
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

function getAllApprovers(approvalRoute: string[]): string[] {
  return approvalRoute;
}

function getNextApprover(approvalRoute: string[]): string[] {
  return approvalRoute.slice(0, 1);
}

function calculateNormalPriority(applicationData: { priority: string }): number {
  const priorityMap: { [key: string]: number } = {
    "high": 2,
    "medium": 3,
    "low": 4
  };
  return priorityMap[applicationData.priority] || 3;
}

function calculateNormalDeadline(applicationData: { createdAt: Date }): Date {
  return new Date(applicationData.createdAt.getTime() + 5 * 24 * 60 * 60 * 1000);
}

// システム障害時の代替処理
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
    "database_error": 120,
    "network_failure": 60,
    "system_crash": 240,
    "hardware_failure": 480
  };
  return recoveryTimes[failureType] || 180;
}

// 承認状況閲覧権限チェック
export function checkApprovalStatusViewPermission(
  userId: string,
  applicationId: string,
  userRole: string,
  applicationOwner: string,
  departmentId: string
): { canView: boolean; viewLevel: string; allowedFields: string[] } {
  const isOwner = userId === applicationOwner;
  
  if (isOwner) {
    return { 
      canView: true, 
      viewLevel: "full", 
      allowedFields: ["status", "currentApprover", "history", "comments"] 
    };
  }
  
  const isManager = userRole === "manager" || userRole === "director";
  const sameDepartment = getUserDepartment(userId) === getApplicationDepartment(applicationId);
  
  if (isManager && sameDepartment) {
    return { 
      canView: true, 
      viewLevel: "progress", 
      allowedFields: ["status", "currentApprover"] 
    };
  }
  
  if (sameDepartment) {
    return { 
      canView: true, 
      viewLevel: "basic", 
      allowedFields: ["status"] 
    };
  }
  
  return { canView: false, viewLevel: "none", allowedFields: [] };
}

function getUserDepartment(userId: string): string {
  return "default_department";
}

function getApplicationDepartment(applicationId: string): string {
  return "default_department";
}

// 進捗データのアクセス制御付き取得
export function getProgressDataWithAccessControl(
  userId: string,
  applicationId: string,
  userRole: string
): { accessGranted: boolean; progressData: { currentStep: string; approverName: string; submissionDate: string; daysElapsed: number; nextAction: string } | null; restrictionReason: string | null } {
  const hasAccess = checkUserAccess(userId, applicationId, userRole);
  
  if (!hasAccess) {
    return { 
      accessGranted: false, 
      progressData: null, 
      restrictionReason: "アクセス権限がありません" 
    };
  }
  
  const progressData = fetchProgressData(applicationId);
  return { accessGranted: true, progressData: progressData, restrictionReason: null };
}

function checkUserAccess(userId: string, applicationId: string, userRole: string): boolean {
  return userRole === "admin" || userRole === "manager" || userId === "owner";
}

function fetchProgressData(applicationId: string): { currentStep: string; approverName: string; submissionDate: string; daysElapsed: number; nextAction: string } {
  return {
    currentStep: "部長承認",
    approverName: "田中部長",
    submissionDate: "2024-01-15",
    daysElapsed: 3,
    nextAction: "承認待ち"
  };
}

// 滞留案件の特定
export function identifyStagnantApplications(
  applicationStatuses: Array<{applicationId: string, currentStage: string, stageStartDate: Date, documentType: string, isSubsidyRelated: boolean}>,
  stagnationThresholds: {normal: number, subsidyRelated: number, urgent: number},
  currentDate: Date
): Array<{applicationId: string, stagnantDays: number, thresholdExceeded: number, urgencyLevel: 'low' | 'medium' | 'high', recommendedAction: string}> {
  const stagnantApplications: Array<{applicationId: string, stagnantDays: number, thresholdExceeded: number, urgencyLevel: 'low' | 'medium' | 'high', recommendedAction: string}> = [];
  
  for (const app of applicationStatuses) {
    const stagnantDays = Math.floor((currentDate.getTime() - app.stageStartDate.getTime()) / (1000 * 60 * 60 * 24));
    const threshold = app.isSubsidyRelated ? stagnationThresholds.subsidyRelated : stagnationThresholds.normal;
    
    if (stagnantDays > threshold) {
      const thresholdExceeded = stagnantDays - threshold;
      const urgencyLevel: 'low' | 'medium' | 'high' = thresholdExceeded <= 2 ? "low" : thresholdExceeded <= 5 ? "medium" : "high";
      const recommendedAction = urgencyLevel === "low" ? "メール通知" : urgencyLevel === "medium" ? "電話連絡" : "上司エスカレーション";
      
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

// 催促優先度の決定
export function determinePriorityForReminder(
  pendingApplications: Array<{applicationId: string, delayDays: number, approverLevel: number, documentImportance: number, applicantDepartment: string}>,
  priorityWeights: {delayWeight: number, levelWeight: number, importanceWeight: number}
): Array<{applicationId: string, priorityScore: number, reminderUrgency: 'high' | 'medium' | 'low'}> {
  const prioritizedList: Array<{applicationId: string, priorityScore: number, reminderUrgency: 'high' | 'medium' | 'low'}> = [];
  
  for (const app of pendingApplications) {
    const delayScore = app.delayDays * priorityWeights.delayWeight;
    const levelScore = app.approverLevel * priorityWeights.levelWeight;
    const importanceScore = app.documentImportance * priorityWeights.importanceWeight;
    const priorityScore = delayScore + levelScore + importanceScore;
    
    let reminderUrgency: 'high' | 'medium' | 'low' = "low";
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

// 催促頻度の検証
export function validateReminderFrequency(
  applicationId: string,
  targetApproverId: string,
  lastReminderDate: Date | null,
  currentDate: Date
): { canSendReminder: boolean; waitingDays: number; nextAllowedDate: Date | null } {
  const daysDiff = lastReminderDate ? Math.floor((currentDate.getTime() - lastReminderDate.getTime()) / (1000 * 60 * 60 * 24)) : 999;
  const canSendReminder = daysDiff >= 3;
  const waitingDays = lastReminderDate ? daysDiff : 0;
  const nextAllowedDate = canSendReminder ? null : new Date(lastReminderDate!.getTime() + 3 * 24 * 60 * 60 * 1000);
  
  return { canSendReminder, waitingDays, nextAllowedDate };
}

// 催促メッセージの生成
export function generateReminderMessage(
  applicationId: string,
  stagnationDays: number,
  documentType: string,
  approverName: string,
  applicantName: string
): { messageContent: string; urgencyLevel: 'low' | 'medium' | 'high'; notificationMethod: 'email' | 'system' | 'both' } {
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
  const notificationMethod: 'email' | 'system' | 'both' = urgencyLevel === "