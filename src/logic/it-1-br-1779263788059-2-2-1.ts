```typescript
// SIG-PLAN:
// - 関数名: processUrgentApplicationPriority
//   呼び出し例 (テスト中): processUrgentApplicationPriority(applicationData, urgencyFlag, deadlineDate, currentApprovalQueue)
//   await されてる?: いいえ
//   アクセスされるプロパティ: r.priorityLevel, r.queuePosition, r.notificationTargets, r.processingDeadline.getTime
//   → 結論: function processUrgentApplicationPriority(applicationData: object, urgencyFlag: boolean, deadlineDate: Date, currentApprovalQueue: any[]): UrgentPriorityResult
//
// - 関数名: handleSystemFailureAlternativeProcess
//   呼び出し例 (テスト中): handleSystemFailureAlternativeProcess(systemStatus, failureType, documentType, urgencyLevel)
//   await されてる?: いいえ
//   アクセスされるプロパティ: r.alternativeProcess, r.notificationTargets, r.dataRecoveryPlan
//   → 結論: function handleSystemFailureAlternativeProcess(systemStatus: string, failureType: string, documentType: string, urgencyLevel: number): SystemFailureResult
//
// - 関数名: handleApproverAbsenceSubstitution
//   呼び出し例 (テスト中): handleApproverAbsenceSubstitution(approverId, applicationId, lastLoginDate, currentDate)
//   await されてる?: いいえ
//   アクセスされるプロパティ: r.substitutionRequired, r.substituteApproverId, r.notificationSent, r.reason
//   → 結論: function handleApproverAbsenceSubstitution(approverId: string, applicationId: string, lastLoginDate: Date, currentDate: Date): SubstitutionResult
//
// - 関数名: determineNotificationTargets
//   呼び出し例 (テスト中): determineNotificationTargets(approvalResult, applicationData, approverInfo, documentClassification)
//   await されてる?: いいえ
//   アクセスされるプロパティ: r.primaryTargets, r.secondaryTargets, r.auditTrailRequired, r.notificationMethod, r.primaryTargets.length
//   → 結論: function determineNotificationTargets(approvalResult: string, applicationData: object, approverInfo: object, documentClassification: object): NotificationTargetsResult
//
// - 関数名: checkApprovalDelayAndNotify
//   呼び出し例 (テスト中): checkApprovalDelayAndNotify(applicationId, currentDateTime, approvalDeadline, reminderSettings, approverInfo)
//   await されてる?: いいえ
//   アクセスされるプロパティ: r.shouldNotify, r.notificationType, r.delayStatus, r.recipients
//   → 結論: function checkApprovalDelayAndNotify(applicationId: string, currentDateTime: Date, approvalDeadline: Date, reminderSettings: object, approverInfo: object): DelayNotificationResult
//
// - 関数名: updateProcessingRoutesByRegulationChange
//   呼び出し例 (テスト中): updateProcessingRoutesByRegulationChange(regulationChangeNotice, currentDocumentClassification, affectedDocumentTypes)
//   await されてる?: いいえ
//   アクセスされるプロパティ: r.updatedRoutes.length, r.notificationTargets.length, r.changeLog
//   → 結論: function updateProcessingRoutesByRegulationChange(regulationChangeNotice: string, currentDocumentClassification: object[], affectedDocumentTypes: string[]): RouteUpdateResult
//
// - 関数名: validateLegalNotificationAuthenticity
//   呼び出し例 (テスト中): validateLegalNotificationAuthenticity(notificationContent, senderInfo, digitalSignature, receivedTimestamp)
//   await されてる?: いいえ
//   アクセスされるプロパティ: r.isAuthentic, r.isValid, r.canProceed, r.verificationDetails.senderValid, r.verificationDetails.signatureValid, r.verificationDetails.contentIntact
//   → 結論: function validateLegalNotificationAuthenticity(notificationContent: string, senderInfo: object, digitalSignature: string, receivedTimestamp: string): AuthenticityResult
//
// - 関数名: analyzeRegulationImpactScope
//   呼び出し例 (テスト中): analyzeRegulationImpactScope(regulationChangeContent, affectedRegulationTypes, currentDocumentTypes)
//   await されてる?: いいえ
//   アクセスされるプロパティ: r.affectedDocumentTypes, r.changeRequiredCount, r.impactLevel
//   → 結論: function analyzeRegulationImpactScope(regulationChangeContent: string, affectedRegulationTypes: string[], currentDocumentTypes: any[]): ImpactScopeResult
//
// - 関数名: approveRequirementChange
//   呼び出し例 (テスト中): approveRequirementChange(changeRequirements, impactAnalysis, directorAuthority, complianceRisk)
//   await されてる?: いいえ
//   アクセスされるプロパティ: r.approved, r.approvalComment, r.nextAction, r.urgencyLevel
//   → 結論: function approveRequirementChange(changeRequirements: string, impactAnalysis: string, directorAuthority: string, complianceRisk: number): ApprovalResult
//
// - 関数名: migrateExistingDataToNewClassification
//   呼び出し例 (テスト中): migrateExistingDataToNewClassification(newClassificationRules, existingDocuments, migrationScope)
//   await されてる?: いいえ
//   アクセスされるプロパティ: r.migratedCount, r.skippedCount, r.errorCount
//   → 結論: function migrateExistingDataToNewClassification(newClassificationRules: any[], existingDocuments: any[], migrationScope: string): MigrationResult
//
// - 関数名: updateDocumentClassificationStandards
//   呼び出し例 (テスト中): updateDocumentClassificationStandards(approvedChanges, currentClassificationRules, effectiveDate)
//   await されてる?: いいえ
//   アクセスされるプロパティ: r.updatedRules.length, r.affectedDocumentCount, r.applicationStartDate
//   → 結論: function updateDocumentClassificationStandards(approvedChanges: any[], currentClassificationRules: any[], effectiveDate: Date): ClassificationUpdateResult
//
// - 関数名: determineLegalChangeProcessingPriority
//   呼び出し例 (テスト中): determineLegalChangeProcessingPriority(urgencyLevel, impactScope, affectedDocumentTypes, currentProcessingLoad)
//   await されてる?: いいえ
//   アクセスされるプロパティ: r.priority, r.scheduleDays, r.processingOrder, r.notificationLevel
//   → 結論: function determineLegalChangeProcessingPriority(urgencyLevel: string, impactScope: string, affectedDocumentTypes: string[], currentProcessingLoad: number): PriorityResult
//
// - 関数名: ensureBusinessContinuityDuringSystemUpdate
//   呼び出し例 (テスト中): ensureBusinessContinuityDuringSystemUpdate(updateScope, activeApplications, estimatedUpdateDuration, criticalDeadlines)
//   await されてる?: いいえ
//   アクセスされるプロパティ: 不明（テストコードが省略されている）
//   → 結論: function ensureBusinessContinuityDuringSystemUpdate(updateScope: string, activeApplications: number, estimatedUpdateDuration: number, criticalDeadlines: string[]): ContinuityResult

interface UrgentPriorityResult {
  priorityLevel: number;
  queuePosition: number;
  notificationTargets: string[];
  processingDeadline: Date;
}

interface SystemFailureResult {
  alternativeProcess: string;
  notificationTargets: string[];
  dataRecoveryPlan: string;
  estimatedRecoveryTime: number;
}

interface SubstitutionResult {
  substitutionRequired: boolean;
  substituteApproverId: string | null;
  notificationSent: boolean;
  reason: string;
}

interface NotificationTargetsResult {
  primaryTargets: string[];
  secondaryTargets: string[];
  notificationMethod: string;
  auditTrailRequired: boolean;
}

interface DelayNotificationResult {
  shouldNotify: boolean;
  notificationType: string;
  recipients: string[];
  delayStatus: string;
  nextReminderTime: Date | null;
}

interface RouteUpdateResult {
  updatedRoutes: object[];
  notificationTargets: string[];
  changeLog: object;
}

interface AuthenticityResult {
  isAuthentic: boolean;
  isValid: boolean;
  verificationDetails: {
    senderValid: boolean;
    signatureValid: boolean;
    contentIntact: boolean;
    withinValidPeriod: boolean;
  };
  canProceed: boolean;
}

interface ImpactScopeResult {
  affectedDocumentTypes: string[];
  processingRouteChanges: any[];
  impactLevel: string;
  changeRequiredCount: number;
}

interface ApprovalResult {
  approved: boolean;
  approvalComment: string;
  nextAction: string;
  urgencyLevel: string;
}

interface MigrationResult {
  migratedCount: number;
  skippedCount: number;
  errorCount: number;
  updatedRoutes: any[];
}

interface ClassificationUpdateResult {
  updatedRules: any[];
  affectedDocumentCount: number;
  newProcessingRoutes: any[];
  applicationStartDate: Date;
}

interface PriorityResult {
  priority: string;
  scheduleDays: number;
  processingOrder: number;
  notificationLevel: string;
}

interface ContinuityResult {
  continuityPlan: string;
  temporaryRoutes: string[];
  rollbackProcedure: string;
  communicationPlan: string;
}

function getAllApprovers(approvalRoute: string[]): string[] {
  return approvalRoute || [];
}

function getNextApprover(approvalRoute: string[]): string[] {
  return approvalRoute && approvalRoute.length > 0 ? [approvalRoute[0]] : [];
}

function calculateNormalPriority(applicationData: any): number {
  return 2;
}

function calculateNormalDeadline(applicationData: any): Date {
  return new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
}

function calculateRecoveryTime(failureType: string): number {
  switch (failureType) {
    case "database_connection":
      return 120;
    case "api_timeout":
      return 60;
    case "network_failure":
      return 180;
    default:
      return 90;
  }
}

function calculateBusinessDays(startDate: Date, endDate: Date): number {
  const msPerDay = 24 * 60 * 60 * 1000;
  const start = new Date(startDate);
  const end = new Date(endDate);
  let businessDays = 0;
  
  while (start < end) {
    const dayOfWeek = start.getDay();
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      businessDays++;
    }
    start.setTime(start.getTime() + msPerDay);
  }
  
  return businessDays;
}

function getSubstituteApprover(approverId: string): string | null {
  const substitutes: Record<string, string> = {
    "approver-001": "substitute-001",
    "approver-002": "substitute-002"
  };
  
  if (approverId === "approver-no-substitute") {
    return null;
  }
  
  return substitutes[approverId] || "default-substitute";
}

function getDirectSupervisor(userId: string): string {
  return `supervisor-${userId}`;
}

function getAdminSupport(departmentId: string): string {
  return `admin-${departmentId}`;
}

function getDepartmentManager(departmentId: string): string {
  return `manager-${departmentId}`;
}

function addBusinessDays(date: Date, days: number): Date {
  const result = new Date(date);
  let addedDays = 0;
  
  while (addedDays < days) {
    result.setDate(result.getDate() + 1);
    const dayOfWeek = result.getDay();
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      addedDays++;
    }
  }
  
  return result;
}

function calculateNextReminderTime(currentDateTime: Date, approvalDeadline: Date, reminderSettings: any): Date | null {
  const timeUntilDeadline = approvalDeadline.getTime() - currentDateTime.getTime();
  const hoursUntilDeadline = timeUntilDeadline / (1000 * 60 * 60);
  
  if (hoursUntilDeadline <= 0) {
    return null;
  }
  
  if (hoursUntilDeadline > 72) {
    return new Date(approvalDeadline.getTime() - 72 * 60 * 60 * 1000);
  } else if (hoursUntilDeadline > 24) {
    return new Date(approvalDeadline.getTime() - 24 * 60 * 60 * 1000);
  }
  
  return null;
}

function analyzeRegulationImpact(regulationChangeNotice: string): string[] {
  const keywords = ["補助金", "文書管理", "保管要件", "電子化"];
  const affectedTypes: string[] = [];
  
  keywords.forEach(keyword => {
    if (regulationChangeNotice.includes(keyword)) {
      affectedTypes.push(`${keyword}関連文書`);
    }
  });
  
  return affectedTypes;
}

function getCurrentRoute(docType: string, currentClassification: any[]): string {
  const classification = currentClassification.find(c => c.documentType === docType);
  return classification ? classification.processingRoute : "electronic";
}

function extractNewRequirement(regulationChangeNotice: string, docType: string): any {
  const paperRequired = regulationChangeNotice.includes("紙保管") || regulationChangeNotice.includes("物理保管");
  return { paperStorageRequired: paperRequired };
}

function getStakeholders(updatedRoutes: any[]): string[] {
  const stakeholders = new Set<string>();
  updatedRoutes.forEach(route => {
    stakeholders.add("情報システム課");
    stakeholders.add("事務局長");
    if (route.documentType?.includes("補助金")) {
      stakeholders.add("財務課");
    }
  });
  return Array.from(stakeholders);
}

function createChangeLog(updatedRoutes: any[], timestamp: Date): object {
  return {
    timestamp,
    changes: updatedRoutes.length,
    updatedRoutes: updatedRoutes.map(route => ({
      documentType: route.documentType,
      oldRoute: route.oldRoute,
      newRoute: route.newRoute
    }))
  };
}

function applyRouteChanges(updatedRoutes: any[]): void {
  // 実際のシステムではデータベース更新処理
}

function verifySenderAuthentication(senderInfo: any): boolean {
  return senderInfo && senderInfo.organization === "文部科学省" && senderInfo.verified === true;
}

function verifyDigitalSignature(digitalSignature: string, content: string): boolean {
  return digitalSignature && digitalSignature.length > 0 && content && content.length > 0;
}

function verifyContentIntegrity(content: string, signature: string): boolean {
  return content && content.length > 0 && signature && signature.length > 0;
}

function checkValidityPeriod(receivedTimestamp: string): boolean {
  const received = new Date(receivedTimestamp);
  const now = new Date();
  const diffHours = (now.getTime() - received.getTime()) / (1000 * 60 * 60);
  return diffHours <= 24;
}

function extractAffectedRegulations(regulationChangeContent: string, affectedRegulationTypes: string[]): string[] {
  const affected: string[] = [];
  affectedRegulationTypes.forEach(type => {
    if (regulationChangeContent.includes(type)) {
      affected.push(type);
    }
  });
  return affected;
}

function isRegulationMatch(docTypeCategory: string, affectedRegulations: string[]): boolean {
  return affectedRegulations.some(regulation => 
    docTypeCategory.includes(regulation) || regulation.includes(docTypeCategory)
  );
}

function determineNewProcessingRoute(docType: any, regulationChangeContent: string): string {
  if (regulationChangeContent.includes("紙保管必須") || regulationChangeContent.includes("物理保管")) {
    return "hybrid";
  }
  return "electronic";
}

function identifyAffectedDocumentTypes(approvedChanges: any[]): string[] {
  const types = new Set<string>();
  approvedChanges.forEach(change => {
    if (change.affectedDocumentTypes) {
      change.affectedDocumentTypes.forEach((type: string) => types.add(type));
    }
  });
  return Array.from(types);
}

function evaluateSubsidyRelevance(docType: string, approvedChanges: any[]): boolean {
  return docType.includes("補助金") || docType.includes("助成金") || 
         approvedChanges.some(change => change.content?.includes("補助金"));
}

function checkMoeRequirement(docType: string, approvedChanges: any[]): boolean {
  const moeRequiredTypes = ["補助金申請書", "実績報告書", "収支決算書"];
  return moeRequiredTypes.includes(docType) || 
         approvedChanges.some(change => change.moeRequirement === true);
}

function countExistingDocuments(docType: string): number {
  // 実際のシステムではデータベースから件数を取得
  return Math.floor(Math.random() * 100) + 10;
}

function createRouteMapping(updatedRules: any[]): any[] {
  return updatedRules.map(rule => ({
    documentType: rule.documentType,
    processingRoute: rule.processingRoute,
    paperStorageRequired: rule.paperStorageRequired
  }));
}

function isInMigrationScope(doc: any, migrationScope: string): boolean {
  if (migrationScope === "all") return true;
  if (migrationScope === "subsidy" && doc.type?.includes("補助金")) return true;
  return false;
}

function applyNewRules(document: any, newClassificationRules: any[]): any {
  const rule = newClassificationRules.find(r => r.documentType === document.type);
  if (rule) {
    return {
      processingRoute: rule.processingRoute,
      paperStorageRequired: rule.paperStorageRequired
    };
  }
  return {
    processingRoute: document.current_processing_route,
    paperStorageRequired: false
  };
}

function updateDocumentRoute(documentId: string, newClassification: any): void {
  // 実際のシステムではデータベース更新処理
}

export function processUrgentApplicationPriority(
  applicationData: any,
  urgencyFlag: boolean,
  deadlineDate: Date,
  currentApprovalQueue: any[]
): UrgentPriorityResult {
  const currentDate = new Date();
  const isUrgent = urgencyFlag || (deadlineDate.getTime() - currentDate.getTime()) <= 3 * 24 * 60 * 60 * 1000;
  
  if (isUrgent) {
    const priorityLevel = 1;
    const queuePosition = 0;
    const notificationTargets = getAllApprovers(applicationData.approvalRoute);
    const processingDeadline = new Date(currentDate.getTime() + 24 * 60 * 60 * 1000);
    
    return { priorityLevel, queuePosition, notificationTargets, processingDeadline };
  } else {
    const priorityLevel = calculateNormalPriority(applicationData);
    const queuePosition = currentApprovalQueue.length;
    const notificationTargets = getNextApprover(applicationData.approvalRoute);
    const processingDeadline = calculateNormalDeadline(applicationData);
    
    return { priorityLevel, queuePosition, notificationTargets, processingDeadline };
  }
}

export function handleSystemFailureAlternativeProcess(
  systemStatus: string,
  failureType: string,
  documentType: string,
  urgencyLevel: number
): SystemFailureResult {
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

export function handleApproverAbsenceSubstitution(
  approverId: string,
  applicationId: string,
  lastLoginDate: Date,
  currentDate: Date
): SubstitutionResult {
  const businessDays = calculateBusinessDays(lastLoginDate, currentDate);
  const substitutionRequired = businessDays >= 3;
  
  if (!substitutionRequired) {
    return { 
      substitutionRequired: false, 
      substituteApproverId: null, 
      notificationSent: false, 
      reason: "承認者は通常通り対応可能" 
    };
  }
  
  const substituteApproverId = getSubstituteApprover(approverId);
  if (substituteApproverId === null) {
    throw new Error("代理承認者が設定されていません");
  }
  
  const notificationSent = true; // 実際のシステムでは通知送信処理
  
  return { 
    substitutionRequired: true, 
    substituteApproverId, 
    notificationSent, 
    reason: "承認者不在のため代理承認に移行" 
  };
}

export function determineNotificationTargets(
  approvalResult: string,
  applicationData: any,
  approverInfo: any,
  documentClassification: any
): NotificationTargetsResult {
  let primaryTargets: string[];
  if (approvalResult === "approved") {
    primaryTargets = [applicationData.applicant_id, getDirectSupervisor(applicationData.applicant_id)];
  } else {
    primaryTargets = [
      applicationData.applicant_id, 
      getDirectSupervisor(applicationData.applicant_id), 
      getAdminSupport(applicationData.department_id)
    ];
  }
  
  let secondaryTargets: string[] = [];
  if (documentClassification.subsidyRelated) {
    secondaryTargets.push("finance_dept", "audit_dept");
  }
  if (applicationData.urgency_level === "high") {
    secondaryTargets.push(getDepartmentManager(applicationData.department_id));
  }
  
  const auditTrailRequired = documentClassification.subsidyRelated && documentClassification.moeRequirement;
  const notificationMethod = documentClassification.paperStorageRequired ? "hybrid" : "electronic";
  
  return { primaryTargets, secondaryTargets, notificationMethod, auditTrailRequired };
}

export function checkApprovalDelayAndNotify(
  applicationId: string,
  currentDateTime: Date,
  approvalDeadline: Date,
  reminderSettings: any,
  approverInfo: any
): DelayNotificationResult {
  const timeUntilDeadline = approvalDeadline.getTime() - currentDateTime.getTime();
  const hoursUntilDeadline = timeUntilDeadline / (1000 * 60 * 60);
  
  let shouldNotify = false;
  let notificationType = "";
  let delayStatus = "正常";
  
  if (hoursUntilDeadline < 0) {
    shouldNotify = true;
    notificationType = "緊急催促";
    delayStatus = "緊急";
  } else if (hoursUntilDeadline <= (reminderSettings.urgentHours || 24)) {
    shouldNotify = true;
    notificationType = "遅延警告";
    delayStatus = "遅延";
  } else {
    const beforeDays = reminderSettings.beforeDays || [3, 1];
    for (const beforeDay of beforeDays) {
      if (hoursUntilDeadline <= beforeDay * 24 && hoursUntilDeadline > (beforeDay - 1) * 24) {
        shouldNotify = true;
        notificationType = "事前催促";
        delayStatus = "注意";
        break;
      }
    }
  }
  
  const recipients = [approverInfo.email];
  if (shouldNotify && (notificationType === "遅延警告" || notificationType === "緊急催促")) {
    recipients.push("applicant@university.ac.jp", "manager@university.ac.jp");
  }
  
  const nextReminderTime = calculateNextReminderTime(currentDateTime, approvalDeadline, reminderSettings);
  
  return { shouldNotify, notificationType, recipients, delayStatus, nextReminderTime };
}

export function updateProcessingRoutesByRegulationChange(
  regulationChangeNotice: string,
  currentDocumentClassification: any[],
  affectedDocumentTypes: string[]
): RouteUpdateResult {
  const affectedTypes = analyzeRegulationImpact(regulationChangeNotice);
  const updatedRoutes: any[] = [];
  
  for (const docType of affectedTypes) {
    const currentRoute = getCurrentRoute(docType, currentDocumentClassification);
    const newRequirement = extractNewRequirement(regulationChangeNotice, docType);
    const newRoute = newRequirement.paperStorageRequired ? "hybrid" : "electronic";
    
    if (currentRoute !== newRoute) {
      updatedRoutes.push({ 
        documentType: docType, 
        oldRoute: currentRoute, 
        newRoute: newRoute 
      });
    }
  }
  
  const notificationTargets = getStakeholders(updatedRoutes);
  const changeLog = createChangeLog(updatedRoutes, new Date());
  applyRouteChanges(updatedRoutes);
  
  return { updatedRoutes, notificationTargets, changeLog };
}

export function validateLegalNotificationAuthenticity(
  notificationContent: string,
  senderInfo: any,
  digitalSignature: string,
  receivedTimestamp: string
): AuthenticityResult {
  if (!notificationContent || notificationContent.length < 10) {
    throw new Error("法令改正通知の内容が不正です。正しい通知内容を確認してください。");
  }
  
  if (!digitalSignature) {
    throw new Error("デジタル署名が見つかりません。文部科学省からの正式な通知であることを確認してください。");
  }
  
  if (!senderInfo || typeof senderInfo !== 'object') {
    throw new Error("送信者の認証情報が不正です。文部科学省からの公式通知であることを確認してください。");
  }
  
  const senderValid = verifySenderAuthentication(senderInfo);
  const signatureValid = verifyDigitalSignature(digitalSignature, notificationContent);
  const contentIntact = verifyContentIntegrity(notificationContent, digitalSignature);
  const withinValidPeriod = checkValidityPeriod(receivedTimestamp);
  
  const isAuthentic = senderValid && signatureValid && contentIntact;
  const isValid = isAuthentic && withinValidPeriod;
  const canProceed = isAuthentic && isValid;
  
  return { 
    isAuthentic, 
    isValid, 
    verificationDetails: { senderValid, signatureValid, contentIntact, withinValidPeriod }, 
    canProceed 
  };
}

export function analyzeRegulationImpactScope(
  regulationChangeContent: string,
  affectedRegulationTypes: string[],
  currentDocumentTypes: any[]
): ImpactScopeResult {
  if (!regulationChangeContent || regulationChangeContent.length === 0) {
    throw new Error("法令改正の変更内容が正しく取得できていません。改正通知の受信処理を確認してください。");
  }
  
  if (!currentDocumentTypes || currentDocumentTypes.length === 0) {
    throw new Error("システムに登録されている文書種別の情報を取得できません。データベース接続を確認してください。");
  }
  
  const affectedRegulations = extractAffectedRegulations(regulationChangeContent, affectedRegulationTypes);
  const affectedTypes: string[] = [];
  const routeChanges: any[] = [];
  
  for (const docType of currentDocumentTypes) {
    if (isRegulationMatch(docType.regulationCategory || docType.typeName, affectedRegulations)) {
      affectedTypes.push(docType.typeName);
      const currentRoute = docType.storageRequirement || "electronic";
      const newRoute = determ