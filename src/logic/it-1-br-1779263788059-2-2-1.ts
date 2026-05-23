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

interface ProcessingRouteUpdateResult {
  updatedRoutes: Array<{
    documentType: string;
    oldRoute: string;
    newRoute: string;
  }>;
  notificationTargets: string[];
  changeLog: object;
}

interface LegalNotificationValidationResult {
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

interface RegulationImpactAnalysis {
  affectedDocumentTypes: string[];
  processingRouteChanges: Array<{
    documentType: string;
    oldRoute: string;
    newRoute: string;
  }>;
  impactLevel: string;
  changeRequiredCount: number;
}

interface RequirementChangeApprovalResult {
  approved: boolean;
  approvalComment: string;
  nextAction: string;
  urgencyLevel: string;
}

interface MigrationResult {
  migratedCount: number;
  skippedCount: number;
  errorCount: number;
  updatedRoutes: Array<{
    documentId: string;
    oldRoute: string;
    newRoute: string;
  }>;
}

interface ProcessingRouteUpdateResult2 {
  updatedRules: Array<{
    documentType: string;
    processingRoute: string;
    paperStorageRequired: boolean;
  }>;
  affectedDocumentCount: number;
  newProcessingRoutes: Array<{
    documentType: string;
    processingRoute: string;
  }>;
  applicationStartDate: Date;
}

interface LegalChangePriorityResult {
  priority: string;
  scheduleDays: number;
  processingOrder: number;
  notificationLevel: string;
}

interface BusinessContinuityResult {
  continuityPlan: string;
  temporaryRoutes: string[];
  rollbackProcedure: string;
  communicationPlan: string;
}

// Helper functions for mock data
function getSubstituteApprover(approverId: string): string | null {
  const substitutes: Record<string, string> = {
    "approver-001": "substitute-001",
    "approver-002": "substitute-002"
  };
  return substitutes[approverId] || null;
}

function getAllApprovers(approvalRoute: string[]): string[] {
  return approvalRoute;
}

function getNextApprover(approvalRoute: string[]): string[] {
  return approvalRoute.slice(0, 1);
}

function calculateNormalPriority(applicationData: any): number {
  return 3;
}

function calculateNormalDeadline(applicationData: any): Date {
  return new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
}

function calculateRecoveryTime(failureType: string): number {
  const recoveryTimes: Record<string, number> = {
    "database_connection": 120,
    "api_timeout": 60,
    "system_error": 180
  };
  return recoveryTimes[failureType] || 120;
}

function calculateBusinessDays(startDate: Date, endDate: Date): number {
  const timeDiff = endDate.getTime() - startDate.getTime();
  const daysDiff = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
  
  let businessDays = 0;
  for (let i = 0; i <= daysDiff; i++) {
    const currentDate = new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000);
    const dayOfWeek = currentDate.getDay();
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      businessDays++;
    }
  }
  return businessDays;
}

function sendSubstitutionNotifications(approverId: string, substituteApproverId: string, applicationId: string): boolean {
  return true;
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

function getResponseWithin(minutes: number): boolean {
  return false;
}

function generateMessageByUrgency(urgencyLevel: string, applicantName: string, documentType: string, stagnationDays: number): string {
  const messages = {
    "low": `${applicantName}様の${documentType}について、${stagnationDays}日間承認待ちとなっております。ご確認をお願いいたします。`,
    "medium": `【要確認】${applicantName}様の${documentType}について、${stagnationDays}日間承認が滞っております。早急な対応をお願いいたします。`,
    "high": `【緊急】${applicantName}様の${documentType}について、${stagnationDays}日間承認が遅延しております。至急対応をお願いいたします。`
  };
  return messages[urgencyLevel as keyof typeof messages] || messages["low"];
}

function calculateNextReminderTime(currentDateTime: Date, approvalDeadline: Date, reminderSettings: any): Date | null {
  const timeUntilDeadline = approvalDeadline.getTime() - currentDateTime.getTime();
  if (timeUntilDeadline <= 0) return null;
  
  return new Date(currentDateTime.getTime() + 24 * 60 * 60 * 1000);
}

function getCurrentRoute(docType: string, currentDocumentClassification: any[]): string {
  const classification = currentDocumentClassification.find(c => c.documentType === docType);
  return classification?.processingRoute || "electronic";
}

function extractNewRequirement(regulationChangeNotice: string, docType: string): { paperStorageRequired: boolean } {
  const requiresPaper = regulationChangeNotice.includes("紙保管") || regulationChangeNotice.includes("書面保存");
  return { paperStorageRequired: requiresPaper };
}

function getStakeholders(updatedRoutes: any[]): string[] {
  const stakeholders = new Set<string>();
  updatedRoutes.forEach(route => {
    stakeholders.add("information_systems");
    stakeholders.add("general_affairs");
    if (route.documentType.includes("補助金")) {
      stakeholders.add("finance_dept");
    }
  });
  return Array.from(stakeholders);
}

function createChangeLog(updatedRoutes: any[], date: Date): object {
  return {
    timestamp: date,
    changes: updatedRoutes.length,
    updatedRoutes: updatedRoutes
  };
}

function applyRouteChanges(updatedRoutes: any[]): void {
  // Route changes would be applied to the system
}

function analyzeRegulationImpact(regulationChangeNotice: string): string[] {
  const affectedTypes: string[] = [];
  
  if (regulationChangeNotice.includes("補助金")) {
    affectedTypes.push("補助金申請書");
    affectedTypes.push("実績報告書");
  }
  
  if (regulationChangeNotice.includes("研究費")) {
    affectedTypes.push("研究費申請書");
  }
  
  if (regulationChangeNotice.includes("設備")) {
    affectedTypes.push("設備導入申請書");
  }
  
  return affectedTypes;
}

function verifySenderAuthentication(senderInfo: any): boolean {
  return senderInfo && senderInfo.organization === "文部科学省";
}

function verifyDigitalSignature(digitalSignature: string, notificationContent: string): boolean {
  return digitalSignature && digitalSignature.length > 0;
}

function verifyContentIntegrity(notificationContent: string, digitalSignature: string): boolean {
  return notificationContent && notificationContent.length > 0;
}

function checkValidityPeriod(receivedTimestamp: string): boolean {
  const received = new Date(receivedTimestamp);
  const now = new Date();
  const daysDiff = (now.getTime() - received.getTime()) / (1000 * 60 * 60 * 24);
  return daysDiff <= 30;
}

function extractAffectedRegulations(regulationChangeContent: string, affectedRegulationTypes: string[]): string[] {
  return affectedRegulationTypes.filter(type => 
    regulationChangeContent.includes(type)
  );
}

function isRegulationMatch(docTypeCategory: string, affectedRegulations: string[]): boolean {
  return affectedRegulations.some(regulation => 
    docTypeCategory.includes(regulation) || regulation.includes(docTypeCategory)
  );
}

function determineNewProcessingRoute(docType: any, regulationChangeContent: string): string {
  if (regulationChangeContent.includes("紙保管必須") || regulationChangeContent.includes("書面保存")) {
    return "hybrid";
  }
  return "electronic";
}

function classifyImpactScope(affectedDepartmentsLength: number): string {
  if (affectedDepartmentsLength <= 3) return "局所的";
  if (affectedDepartmentsLength <= 8) return "部門横断";
  return "全学的";
}

function isInMigrationScope(doc: any, migrationScope: string): boolean {
  return migrationScope === "all" || doc.category === migrationScope;
}

function applyNewRules(document: any, newClassificationRules: any[]): any {
  const rule = newClassificationRules.find(r => r.documentType === document.type);
  return {
    processingRoute: rule?.processingRoute || "electronic"
  };
}

function updateDocumentRoute(documentId: string, newClassification: any): void {
  // Update document route in the system
}

function identifyAffectedDocumentTypes(approvedChanges: any[]): string[] {
  return approvedChanges.map(change => change.documentType);
}

function evaluateSubsidyRelevance(docType: string, approvedChanges: any[]): boolean {
  return docType.includes("補助金") || docType.includes("助成金");
}

function checkMoeRequirement(docType: string, approvedChanges: any[]): boolean {
  const moeTypes = ["補助金申請書", "実績報告書", "会計報告書"];
  return moeTypes.includes(docType);
}

function countExistingDocuments(docType: string): number {
  const counts: Record<string, number> = {
    "補助金申請書": 150,
    "実績報告書": 80,
    "一般申請書": 200
  };
  return counts[docType] || 50;
}

function createRouteMapping(updatedRules: any[]): any[] {
  return updatedRules.map(rule => ({
    documentType: rule.documentType,
    processingRoute: rule.processingRoute
  }));
}

export function processUrgentApplicationPriority(
  applicationData: any,
  urgencyFlag: boolean,
  deadlineDate: Date,
  currentApprovalQueue: any[]
): UrgentPriorityResult {
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

export function handleSystemFailureAlternativeProcess(
  systemStatus: string,
  failureType: string,
  documentType: string,
  urgencyLevel: number
): SystemFailureResult {
  let alternativeProcess: string;
  let notificationTargets: string[];
  
  if (systemStatus === "critical_failure") {
    alternativeProcess = "full_paper_mode";
  } else if (systemStatus === "partial_failure") {
    alternativeProcess = "manual_hybrid_mode";
  } else {
    alternativeProcess = "temporary_workaround";
  }
  
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
  
  const notificationSent = sendSubstitutionNotifications(approverId, substituteApproverId, applicationId);
  
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
  let secondaryTargets: string[] = [];
  
  if (approvalResult === "approved") {
    primaryTargets = [applicationData.applicant_id, getDirectSupervisor(applicationData.applicant_id)];
  } else {
    primaryTargets = [
      applicationData.applicant_id, 
      getDirectSupervisor(applicationData.applicant_id), 
      getAdminSupport(applicationData.department_id)
    ];
  }
  
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
  } else if (hoursUntilDeadline <= reminderSettings.urgentHours) {
    shouldNotify = true;
    notificationType = "遅延警告";
    delayStatus = "遅延";
  } else {
    for (const beforeDays of reminderSettings.beforeDays) {
      if (hoursUntilDeadline <= beforeDays * 24 && hoursUntilDeadline > (beforeDays - 1) * 24) {
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
): ProcessingRouteUpdateResult {
  const affectedTypes = analyzeRegulationImpact(regulationChangeNotice);
  const updatedRoutes: Array<{ documentType: string; oldRoute: string; newRoute: string }> = [];
  
  for (const docType of affectedTypes) {
    const currentRoute = getCurrentRoute(docType, currentDocumentClassification);
    const newRequirement = extractNewRequirement(regulationChangeNotice, docType);
    const newRoute = newRequirement.paperStorageRequired ? "hybrid" : "electronic";
    
    if (currentRoute !== newRoute) {
      updatedRoutes.push({ documentType: docType, oldRoute: currentRoute, newRoute: newRoute });
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
): LegalNotificationValidationResult {
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
): RegulationImpactAnalysis {
  const affectedRegulations = extractAffectedRegulations(regulationChangeContent, affectedRegulationTypes);
  const affectedTypes: string[] = [];
  const routeChanges: Array<{ documentType: string; oldRoute: string; newRoute: string }> = [];
  
  for (const docType of currentDocumentTypes) {
    if (isRegulationMatch(docType.regulationCategory, affectedRegulations)) {
      affectedTypes.push(docType.typeName);
      const currentRoute = docType.storageRequirement;
      const newRoute = determineNewProcessingRoute(docType, regulationChangeContent);
      if (currentRoute !== newRoute) {
        routeChanges.push({ documentType: docType.typeName, oldRoute: currentRoute, newRoute: newRoute });
      }
    }
  }
  
  const impactLevel = routeChanges.length === 0 ? "軽微" : routeChanges.length <= 5 ? "中程度" : "重大";
  
  return { 
    affectedDocumentTypes: affectedTypes, 
    processingRouteChanges: routeChanges, 
    impactLevel: impactLevel, 
    changeRequiredCount: routeChanges.length 
  };
}

export function approveRequirementChange(
  changeRequirements: string,
  impactAnalysis: string,
  directorAuthority: string,
  complianceRisk: number
): RequirementChangeApprovalResult {
  const isMoeRelated = changeRequirements.includes("補助金") || changeRequirements.includes("文部科学省");
  const withinAuthority = impactAnalysis.length <= 1000 && directorAuthority === "standard";
  const highRisk = complianceRisk >= 8;
  
  if (highRisk) {
    return { 
      approved: true, 
      approvalComment: "法令違反リスク回避のため緊急承認", 
      nextAction: "即座に文書分類基準を更新", 
      urgencyLevel: "緊急" 
    };
  } else if (withinAuthority && isMoeRelated) {
    return { 
      approved: true, 
      approvalComment: "通常承認", 
      nextAction: "文書分類基準の更新を実施", 
      urgencyLevel: "通常" 
    };
  } else {
    return { 
      approved: false, 
      approvalComment: "理事会承認が必要", 
      nextAction: "理事会への上申準備", 
      urgencyLevel: "保留" 
    };
  }
}

export function migrateExistingDataToNewClassification(
  newClassificationRules: any[],
  existingDocuments: any[],
  migrationScope: string
): MigrationResult {
  const targetDocuments = existingDocuments.filter(doc => isInMigrationScope(doc, migrationScope));
  let migratedCount = 0;
  let skippedCount = 0;
  let errorCount = 0;
  const updatedRoutes: Array<{ documentId: string; oldRoute: string; newRoute: string }> = [];
  
  for (const document of targetDocuments) {
    try {
      const newClassification = applyNewRules(document, newClassificationRules);
      if (newClassification.processingRoute !== document.current_processing_route) {
        updateDocumentRoute(document.id, newClassification);
        updatedRoutes.push({
          documentId: document.id, 
          oldRoute: document.current_processing_route, 
          newRoute: newClassification.processingRoute
        });
        migratedCount++;
      } else {
        skippedCount++;
      }
    } catch (error) {
      errorCount++;
    }
  }
  
  return { migratedCount, skippedCount, errorCount, updatedRoutes };
}

export function updateDocumentClassificationStandards(
  approvedChanges: any[],
  currentClassificationRules: any[],
  effectiveDate: Date
): ProcessingRouteUpdateResult2 {
  const affectedDocumentTypes = identifyAffectedDocumentTypes(approvedChanges);
  const updatedRules: Array<{ documentType: string; processingRoute: string; paperStorageRequired: boolean }> = [];
  let affectedCount = 0;
  
  for (const docType of affectedDocumentTypes) {
    const subsidyRelated = evaluateSubsidyRelevance(docType, approvedChanges);
    const paperRequired = subsidyRelated && checkMoeRequirement(docType, approvedChanges);
    const processingRoute = paperRequired ? "hybrid" : "electronic";
    
    updatedRules.push({ documentType: docType, processingRoute, paperStorageRequired: paperRequired });
    affectedCount += countExistingDocuments(docType);
  }
  
  return {
    updatedRules, 
    affectedDocumentCount: affectedCount, 
    newProcessingRoutes: createRouteMapping(updatedRules), 
    applicationStartDate: effectiveDate
  };
}

export function determineLegalChangeProcessingPriority(
  urgencyLevel: string,
  impactScope: string,
  affectedDocumentTypes: string[],
  currentProcessingLoad: number
): LegalChangePriorityResult {
  let basePriority = 0;
  
  if (urgencyLevel === "即日対応") {
    basePriority = 4;
  } else if (urgencyLevel === "1週間以内") {
    basePriority = 3;
  } else {
    basePriority = 2;
  }
  
  if (impactScope === "全学") {
    basePriority += 1;
  } else if (impactScope === "特定業務") {
    basePriority -= 1;
  }
  
  if (affectedDocumentTypes.includes("補助金申請書")) {
    basePriority += 1;
  }
  
  let scheduleDays = basePriority >= 4 ? 1 : basePriority >= 3 ? 7 : 30;
  if (currentProcessingLoad > 80 && basePriority < 3) {
    scheduleDays *= 1.5;
  }
  
  const priority = basePriority >= 4 ? "最優先" : basePriority >= 3 ? "高優先" : basePriority >= 2 ? "通常" :