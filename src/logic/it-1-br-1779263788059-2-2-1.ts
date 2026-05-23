```typescript
// SIG-PLAN:
// - 関数名: processUrgentApplicationPriority
//   呼び出し例 (テスト中): processUrgentApplicationPriority(applicationData, urgencyFlag, deadlineDate, currentApprovalQueue)
//   await されてる?: いいえ
//   アクセスされるプロパティ: r.priorityLevel, r.queuePosition, r.notificationTargets, r.processingDeadline
//   → 結論: function processUrgentApplicationPriority(applicationData: object, urgencyFlag: boolean, deadlineDate: Date, currentApprovalQueue?: any[]): UrgentApplicationResult
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
//   アクセスされるプロパティ: r.primaryTargets, r.notificationMethod, r.auditTrailRequired, r.primaryTargets.length
//   → 結論: function determineNotificationTargets(approvalResult: string, applicationData: object, approverInfo: object, documentClassification: object): NotificationTargetsResult
//
// - 関数名: updateProcessingRoutesByRegulationChange
//   呼び出し例 (テスト中): updateProcessingRoutesByRegulationChange(regulationChangeNotice, currentDocumentClassification, affectedDocumentTypes)
//   await されてる?: いいえ
//   アクセスされるプロパティ: r.updatedRoutes, r.updatedRoutes.length
//   → 結論: function updateProcessingRoutesByRegulationChange(regulationChangeNotice: string, currentDocumentClassification: object[], affectedDocumentTypes: string[]): ProcessingRouteUpdateResult
//
// - 関数名: validateLegalNotificationAuthenticity
//   呼び出し例 (テスト中): validateLegalNotificationAuthenticity(notificationContent, senderInfo, digitalSignature, receivedTimestamp)
//   await されてる?: いいえ
//   アクセスされるプロパティ: r.isAuthentic, r.isValid, r.canProceed, r.verificationDetails.signatureValid, r.verificationDetails.contentIntact
//   → 結論: function validateLegalNotificationAuthenticity(notificationContent: string, senderInfo: object, digitalSignature: string, receivedTimestamp: string): AuthenticityValidationResult
//
// - 関数名: approveRequirementChange
//   呼び出し例 (テスト中): approveRequirementChange(changeRequirements, impactAnalysis, directorAuthority, complianceRisk)
//   await されてる?: いいえ
//   アクセスされるプロパティ: r.approved, r.approvalComment, r.nextAction
//   → 結論: function approveRequirementChange(changeRequirements: string, impactAnalysis: string, directorAuthority: string, complianceRisk: number): RequirementChangeApprovalResult
//
// - 関数名: updateDocumentClassificationStandards
//   呼び出し例 (テスト中): updateDocumentClassificationStandards(approvedChanges, currentClassificationRules, effectiveDate)
//   await されてる?: いいえ
//   アクセスされるプロパティ: r.updatedRules, r.affectedDocumentCount, r.applicationStartDate
//   → 結論: function updateDocumentClassificationStandards(approvedChanges: any[], currentClassificationRules: any[], effectiveDate: Date): ClassificationStandardsUpdateResult
//
// - 関数名: determineLegalChangeProcessingPriority
//   呼び出し例 (テスト中): determineLegalChangeProcessingPriority(urgencyLevel, impactScope, affectedDocumentTypes, currentProcessingLoad)
//   await されてる?: いいえ
//   アクセスされるプロパティ: r.priority, r.scheduleDays, r.notificationLevel, r.processingOrder
//   → 結論: function determineLegalChangeProcessingPriority(urgencyLevel: string, impactScope: string, affectedDocumentTypes: string[], currentProcessingLoad: number): LegalChangeProcessingPriorityResult
//
// - 関数名: ensureBusinessContinuityDuringSystemUpdate
//   呼び出し例 (テスト中): ensureBusinessContinuityDuringSystemUpdate(updateScope, activeApplications, estimatedUpdateDuration, criticalDeadlines)
//   await されてる?: いいえ
//   アクセスされるプロパティ: 不明（テストコードが省略されている）
//   → 結論: function ensureBusinessContinuityDuringSystemUpdate(updateScope: string, activeApplications: number, estimatedUpdateDuration: number, criticalDeadlines: string[]): BusinessContinuityResult

interface UrgentApplicationResult {
  priorityLevel: number;
  queuePosition: number;
  notificationTargets: string[];
  processingDeadline: Date;
}

interface SubstitutionResult {
  substitutionRequired: boolean;
  substituteApproverId: string | null;
  notificationSent: boolean;
  reason: string;
}

interface NotificationTargetsResult {
  primaryTargets: string[];
  secondaryTargets?: string[];
  notificationMethod: string;
  auditTrailRequired: boolean;
}

interface ProcessingRouteUpdateResult {
  updatedRoutes: object[];
  notificationTargets: string[];
  changeLog: object;
}

interface AuthenticityValidationResult {
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

interface RequirementChangeApprovalResult {
  approved: boolean;
  approvalComment: string;
  nextAction: string;
  urgencyLevel: string;
}

interface ClassificationStandardsUpdateResult {
  updatedRules: any[];
  affectedDocumentCount: number;
  newProcessingRoutes: any[];
  applicationStartDate: Date;
}

interface LegalChangeProcessingPriorityResult {
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

// Helper functions for business logic calculations
function calculateBusinessDays(startDate: Date, endDate: Date): number {
  const start = new Date(startDate);
  const end = new Date(endDate);
  let businessDays = 0;
  
  while (start <= end) {
    const dayOfWeek = start.getDay();
    if (dayOfWeek !== 0 && dayOfWeek !== 6) { // Not Sunday (0) or Saturday (6)
      businessDays++;
    }
    start.setDate(start.getDate() + 1);
  }
  
  return businessDays;
}

function getAllApprovers(approvalRoute: string[]): string[] {
  return approvalRoute || [];
}

function getNextApprover(approvalRoute: string[]): string[] {
  return approvalRoute && approvalRoute.length > 0 ? [approvalRoute[0]] : [];
}

function calculateNormalPriority(applicationData: any): number {
  if (applicationData.priority === "high") return 2;
  if (applicationData.priority === "medium") return 3;
  return 4;
}

function calculateNormalDeadline(applicationData: any): Date {
  const currentDate = new Date();
  const daysToAdd = applicationData.priority === "high" ? 3 : applicationData.priority === "medium" ? 5 : 7;
  return new Date(currentDate.getTime() + daysToAdd * 24 * 60 * 60 * 1000);
}

function getSubstituteApprover(approverId: string): string | null {
  // Mock substitute approver lookup - in real implementation would query database
  if (approverId === "approver-without-substitute") {
    return null;
  }
  return `substitute-${approverId}`;
}

function sendSubstitutionNotifications(approverId: string, substituteApproverId: string, applicationId: string): boolean {
  // Mock notification sending - in real implementation would send actual notifications
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

function analyzeRegulationImpact(regulationChangeNotice: string): string[] {
  // Extract affected document types from regulation notice
  const affectedTypes: string[] = [];
  
  if (regulationChangeNotice.includes("補助金")) {
    affectedTypes.push("補助金申請書", "実績報告書");
  }
  if (regulationChangeNotice.includes("研究費")) {
    affectedTypes.push("研究費申請書", "研究報告書");
  }
  if (regulationChangeNotice.includes("設備")) {
    affectedTypes.push("設備申請書", "設備報告書");
  }
  
  return affectedTypes;
}

function getCurrentRoute(docType: string, currentClassification: any[]): string {
  const classification = currentClassification.find(c => c.documentType === docType);
  return classification ? classification.processingRoute : "electronic";
}

function extractNewRequirement(regulationNotice: string, docType: string): { paperStorageRequired: boolean } {
  // Analyze regulation notice to determine new paper storage requirements
  const requiresPaper = regulationNotice.includes("紙保管") || 
                       (regulationNotice.includes("補助金") && docType.includes("補助金"));
  
  return { paperStorageRequired: requiresPaper };
}

function getStakeholders(updatedRoutes: any[]): string[] {
  const stakeholders = new Set<string>();
  
  updatedRoutes.forEach(route => {
    if (route.documentType.includes("補助金")) {
      stakeholders.add("財務課");
      stakeholders.add("監査室");
    }
    if (route.documentType.includes("研究")) {
      stakeholders.add("研究推進課");
    }
    stakeholders.add("情報システム課");
    stakeholders.add("事務局");
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
  // Mock implementation - in real system would update database
  console.log(`Applied ${updatedRoutes.length} route changes`);
}

function verifySenderAuthentication(senderInfo: any): boolean {
  // Mock verification - check if sender is from authorized domain
  return senderInfo && senderInfo.domain === "mext.go.jp";
}

function verifyDigitalSignature(digitalSignature: string, content: string): boolean {
  // Mock signature verification - in real implementation would use cryptographic verification
  return digitalSignature && digitalSignature.length > 10 && content.length > 0;
}

function verifyContentIntegrity(content: string, signature: string): boolean {
  // Mock integrity check - in real implementation would verify hash
  return content && content.length > 0 && signature && signature.length > 0;
}

function checkValidityPeriod(receivedTimestamp: string): boolean {
  const received = new Date(receivedTimestamp);
  const now = new Date();
  const daysDiff = (now.getTime() - received.getTime()) / (1000 * 60 * 60 * 24);
  
  // Valid if received within last 30 days
  return daysDiff <= 30;
}

function identifyAffectedDocumentTypes(approvedChanges: any[]): string[] {
  const affectedTypes = new Set<string>();
  
  approvedChanges.forEach(change => {
    if (change.documentTypes) {
      change.documentTypes.forEach((type: string) => affectedTypes.add(type));
    }
  });
  
  return Array.from(affectedTypes);
}

function evaluateSubsidyRelevance(docType: string, approvedChanges: any[]): boolean {
  return docType.includes("補助金") || docType.includes("助成金") || docType.includes("研究費");
}

function checkMoeRequirement(docType: string, approvedChanges: any[]): boolean {
  // Check if document type requires paper storage under MOE requirements
  const moeRequiredTypes = ["補助金申請書", "研究費申請書", "設備申請書", "実績報告書"];
  return moeRequiredTypes.some(type => docType.includes(type));
}

function countExistingDocuments(docType: string): number {
  // Mock count - in real implementation would query database
  return Math.floor(Math.random() * 100) + 10;
}

function createRouteMapping(updatedRules: any[]): any[] {
  return updatedRules.map(rule => ({
    documentType: rule.documentType,
    processingRoute: rule.processingRoute,
    paperStorageRequired: rule.paperStorageRequired
  }));
}

export function processUrgentApplicationPriority(
  applicationData: any,
  urgencyFlag: boolean,
  deadlineDate: Date,
  currentApprovalQueue: any[] = []
): UrgentApplicationResult {
  const currentDate = new Date();
  const isUrgent = urgencyFlag || (deadlineDate.getTime() - currentDate.getTime()) <= 3 * 24 * 60 * 60 * 1000;
  
  if (deadlineDate <= currentDate) {
    throw new Error("提出期限は現在日時より未来の日付を設定してください");
  }
  
  let priorityLevel: number;
  let queuePosition: number;
  let notificationTargets: string[];
  let processingDeadline: Date;
  
  if (isUrgent) {
    priorityLevel = 1;
    queuePosition = 0;
    notificationTargets = getAllApprovers(applicationData.approvalRoute);
    processingDeadline = new Date(currentDate.getTime() + 24 * 60 * 60 * 1000); // 24 hours
  } else {
    priorityLevel = calculateNormalPriority(applicationData);
    queuePosition = currentApprovalQueue.length;
    notificationTargets = getNextApprover(applicationData.approvalRoute);
    processingDeadline = calculateNormalDeadline(applicationData);
  }
  
  return { priorityLevel, queuePosition, notificationTargets, processingDeadline };
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
  
  return {
    primaryTargets,
    secondaryTargets,
    notificationMethod,
    auditTrailRequired
  };
}

export function updateProcessingRoutesByRegulationChange(
  regulationChangeNotice: string,
  currentDocumentClassification: any[],
  affectedDocumentTypes: string[]
): ProcessingRouteUpdateResult {
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
): AuthenticityValidationResult {
  if (!notificationContent || notificationContent.length < 10) {
    throw new Error("法令改正通知の内容が不正です。正しい通知内容を確認してください。");
  }
  
  if (!digitalSignature) {
    throw new Error("デジタル署名が見つかりません。文部科学省からの正式な通知であることを確認してください。");
  }
  
  if (!senderInfo || !senderInfo.domain) {
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

export function approveRequirementChange(
  changeRequirements: string,
  impactAnalysis: string,
  directorAuthority: string,
  complianceRisk: number
): RequirementChangeApprovalResult {
  if (!changeRequirements || changeRequirements.length < 10) {
    throw new Error("変更要件の内容が不十分です。具体的な変更内容を記載してください。");
  }
  
  if (!impactAnalysis) {
    throw new Error("影響分析が完了していません。承認判定に必要な分析結果を確認してください。");
  }
  
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

export function updateDocumentClassificationStandards(
  approvedChanges: any[],
  currentClassificationRules: any[],
  effectiveDate: Date
): ClassificationStandardsUpdateResult {
  if (!approvedChanges || approvedChanges.length === 0) {
    throw new Error("法令改正に伴う変更要件が正しく承認されていません。事務局長による承認を確認してください。");
  }
  
  if (effectiveDate < new Date()) {
    console.warn("施行日が過去の日付です。既存の進行中案件への影響を確認してください。");
  }
  
  const affectedDocumentTypes = identifyAffectedDocumentTypes(approvedChanges);
  const updatedRules: any[] = [];
  let affectedCount = 0;
  
  for (const docType of affectedDocumentTypes) {
    const subsidyRelated = evaluateSubsidyRelevance(docType, approvedChanges);
    const paperRequired = subsidyRelated && checkMoeRequirement(docType, approvedChanges);
    const processingRoute = paperRequired ? "hybrid" : "electronic";
    
    updatedRules.push({
      documentType: docType,
      processingRoute,
      paperStorageRequired: paperRequired
    });
    
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
): LegalChangeProcessingPriorityResult {
  if (!["即日対応", "1週間以内", "1ヶ月以内"].includes(urgencyLevel)) {
    throw new Error("緊急度レベルは「即日対応」「1週間以内」「1ヶ月以内」のいずれかを指定してください");
  }
  
  if (!["全学", "特定部署", "特定業務"].includes(impactScope)) {
    throw new Error("影響範囲は「全学」「特定部署」「特定業務」のいずれかを指定してください");
  }
  
  if (currentProcessingLoad < 0 || currentProcessingLoad > 100) {
    console.warn("処理負荷レベルは0から100の範囲で入力してください");
  }
  
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
    scheduleDays = Math.floor(scheduleDays * 1.5);
  }
  
  const priority = basePriority >= 4 ? "最優先" : basePriority >= 3 ? "高優先" : basePriority >= 2 ? "通常" : "低優先";
  const processingOrder = 5 - basePriority;
  const notificationLevel = basePriority >= 4 ? "緊急" : basePriority >= 3 ? "重要" : "通常";
  
  return { priority, scheduleDays, processingOrder, notificationLevel };
}

export function ensureBusinessContinuityDuringSystemUpdate(
  updateScope: string,
  activeApplications: number,
  estimatedUpdateDuration: number,
  criticalDeadlines: string[]
): BusinessContinuityResult {
  if (!estimatedUpdateDuration) {
    throw new Error("更新作業の所要時間を入力してください。業務継続計画の策定に必要です。");
  }
  
  if (activeApplications < 0) {
    throw new Error("現在の申請状況を確認できないため、安全な更新計画を立てることができません。システム管理者にお問い合わせください。");
  }
  
  const impactLevel = activeApplications > 50 || criticalDeadlines.length > 0 ? "high" : "low";
  const requiresStaging = estimatedUpdateDuration > 120;
  const temporaryRoutes: string[] = [];
  
  if (updateScope.includes("documentClassification")) {
    temporaryRoutes.push("manual_paper_route");
  }
  if (impactLevel === "high") {
    temporaryRoutes.push("emergency_manual_route");
  }
  
  const continuityPlan = requiresStaging ? "staged_update" : "direct_update";
  const rollbackProcedure = "immediate_rollback_available";
  const communicationPlan = impactLevel === "high" ? "advance_notification_required" : "standard_notification";
  
  return { continuityPlan, temporaryRoutes, rollbackProcedure, communicationPlan };
}

// Additional exports for completeness (based on structured function list)
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
  const validTypes = ["補助金申請", "設備申請", "人事申請", "研究申請"];
  return validTypes.includes(type);
}

function isValidDepartment(department: string): boolean {
  return department && department.length > 0;
}

function isValidUrgencyLevel(level: string): boolean {
  const validLevels = ["高", "中", "低"];
  return validLevels.includes(level);
}

export function validateApplicationAmountAndPeriod(
  applicationAmount: number,
  implementationStartDate: string,
  implementationEndDate: string,
  documentType: string,
  budgetLimits: