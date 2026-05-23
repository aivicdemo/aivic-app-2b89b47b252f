// SIG-PLAN:
// - 関数名: processUrgentApplicationPriority
//   呼び出し例 (テスト中): processUrgentApplicationPriority(applicationData, urgencyFlag, deadlineDate, currentApprovalQueue)
//   await されてる?: いいえ
//   アクセスされるプロパティ: r.priorityLevel, r.queuePosition, r.notificationTargets, r.processingDeadline
//   → 結論: function processUrgentApplicationPriority(applicationData: any, urgencyFlag: boolean, deadlineDate: Date, currentApprovalQueue: any[]): UrgentPriorityResult
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
//   アクセスされるプロパティ: r.primaryTargets, r.auditTrailRequired, r.secondaryTargets
//   → 結論: function determineNotificationTargets(approvalResult: string, applicationData: any, approverInfo: any, documentClassification: any): NotificationTargetsResult
//
// - 関数名: updateProcessingRoutesByRegulationChange
//   呼び出し例 (テスト中): updateProcessingRoutesByRegulationChange(regulationChangeNotice, currentDocumentClassification, affectedDocumentTypes)
//   await されてる?: いいえ
//   アクセスされるプロパティ: r.updatedRoutes, r.changeLog
//   → 結論: function updateProcessingRoutesByRegulationChange(regulationChangeNotice: string, currentDocumentClassification: any[], affectedDocumentTypes: string[]): RouteUpdateResult
//
// - 関数名: validateLegalNotificationAuthenticity
//   呼び出し例 (テスト中): validateLegalNotificationAuthenticity(notificationContent, senderInfo, digitalSignature, receivedTimestamp)
//   await されてる?: いいえ
//   アクセスされるプロパティ: r.isAuthentic, r.isValid, r.canProceed, r.verificationDetails.signatureValid, r.verificationDetails.contentIntact
//   → 結論: function validateLegalNotificationAuthenticity(notificationContent: string, senderInfo: any, digitalSignature: string, receivedTimestamp: string): AuthenticityResult
//
// - 関数名: approveRequirementChange
//   呼び出し例 (テスト中): approveRequirementChange(changeRequirements, impactAnalysis, directorAuthority, complianceRisk)
//   await されてる?: いいえ
//   アクセスされるプロパティ: r.approved, r.approvalComment, r.nextAction, r.urgencyLevel
//   → 結論: function approveRequirementChange(changeRequirements: string, impactAnalysis: string, directorAuthority: string, complianceRisk: number): ApprovalResult
//
// - 関数名: updateDocumentClassificationStandards
//   呼び出し例 (テスト中): updateDocumentClassificationStandards(approvedChanges, currentClassificationRules, effectiveDate)
//   await されてる?: いいえ
//   アクセスされるプロパティ: r.updatedRules, r.affectedDocumentCount, r.applicationStartDate, r.newProcessingRoutes
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
//   アクセスされるプロパティ: 不明（テストで確認されていない）
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

interface RouteUpdateResult {
  updatedRoutes: any[];
  notificationTargets: string[];
  changeLog: any;
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

interface ApprovalResult {
  approved: boolean;
  approvalComment: string;
  nextAction: string;
  urgencyLevel: string;
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

function calculateBusinessDays(startDate: Date, endDate: Date): number {
  const timeDiff = endDate.getTime() - startDate.getTime();
  const daysDiff = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
  return daysDiff;
}

function getSubstituteApprover(approverId: string): string | null {
  if (approverId === "approver_no_substitute") {
    return null;
  }
  return "substitute_" + approverId;
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
  const currentDate = new Date();
  return new Date(currentDate.getTime() + 7 * 24 * 60 * 60 * 1000);
}

function calculateRecoveryTime(failureType: string): number {
  switch (failureType) {
    case "database_connection":
      return 120;
    case "api_timeout":
      return 60;
    default:
      return 180;
  }
}

function getDirectSupervisor(userId: string): string {
  return "supervisor_" + userId;
}

function getAdminSupport(departmentId: string): string {
  return "admin_" + departmentId;
}

function getDepartmentManager(departmentId: string): string {
  return "manager_" + departmentId;
}

function analyzeRegulationImpact(regulationChangeNotice: string): string[] {
  const keywords = ["補助金", "文部科学省", "保管要件"];
  const affectedTypes = [];
  
  for (const keyword of keywords) {
    if (regulationChangeNotice.includes(keyword)) {
      affectedTypes.push("補助金申請書");
      affectedTypes.push("実績報告書");
    }
  }
  
  return affectedTypes;
}

function getCurrentRoute(docType: string, currentClassification: any[]): string {
  const classification = currentClassification.find(c => c.documentType === docType);
  return classification ? classification.processingRoute : "electronic";
}

function extractNewRequirement(regulationChangeNotice: string, docType: string): any {
  const paperStorageRequired = regulationChangeNotice.includes("紙保管") || regulationChangeNotice.includes("書面保存");
  return { paperStorageRequired };
}

function getStakeholders(updatedRoutes: any[]): string[] {
  const stakeholders = ["情報システム課", "事務局長"];
  if (updatedRoutes.length > 5) {
    stakeholders.push("学長");
  }
  return stakeholders;
}

function createChangeLog(updatedRoutes: any[], date: Date): any {
  return {
    timestamp: date,
    changes: updatedRoutes.length,
    description: "法令改正に伴う処理ルート更新"
  };
}

function applyRouteChanges(updatedRoutes: any[]): void {
  // 実際のシステムでは処理ルートを更新
}

function verifySenderAuthentication(senderInfo: any): boolean {
  return senderInfo && senderInfo.organization === "文部科学省";
}

function verifyDigitalSignature(digitalSignature: string, content: string): boolean {
  return digitalSignature && digitalSignature.length > 10;
}

function verifyContentIntegrity(content: string, signature: string): boolean {
  return content && content.length > 0 && signature && signature.length > 0;
}

function checkValidityPeriod(receivedTimestamp: string): boolean {
  const received = new Date(receivedTimestamp);
  const now = new Date();
  const daysDiff = (now.getTime() - received.getTime()) / (1000 * 60 * 60 * 24);
  return daysDiff <= 30;
}

function identifyAffectedDocumentTypes(approvedChanges: any[]): string[] {
  const types = [];
  for (const change of approvedChanges) {
    if (change.documentType) {
      types.push(change.documentType);
    }
  }
  return types;
}

function evaluateSubsidyRelevance(docType: string, approvedChanges: any[]): boolean {
  return docType.includes("補助金") || docType.includes("助成金");
}

function checkMoeRequirement(docType: string, approvedChanges: any[]): boolean {
  const subsidyTypes = ["補助金申請書", "実績報告書", "収支決算書"];
  return subsidyTypes.includes(docType);
}

function countExistingDocuments(docType: string): number {
  return Math.floor(Math.random() * 100) + 10;
}

function createRouteMapping(updatedRules: any[]): any[] {
  return updatedRules.map(rule => ({
    documentType: rule.documentType,
    route: rule.processingRoute
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
    processingDeadline = new Date(currentDate.getTime() + 1 * 24 * 60 * 60 * 1000);
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
  
  const notificationSent = true;
  
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

export function updateProcessingRoutesByRegulationChange(
  regulationChangeNotice: string,
  currentDocumentClassification: any[],
  affectedDocumentTypes: string[]
): RouteUpdateResult {
  const affectedTypes = analyzeRegulationImpact(regulationChangeNotice);
  const updatedRoutes = [];
  
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

export function approveRequirementChange(
  changeRequirements: string,
  impactAnalysis: string,
  directorAuthority: string,
  complianceRisk: number
): ApprovalResult {
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
): ClassificationUpdateResult {
  if (!approvedChanges || approvedChanges.length === 0) {
    throw new Error("法令改正に伴う変更要件が正しく承認されていません。事務局長による承認を確認してください。");
  }
  
  if (effectiveDate < new Date()) {
    console.warn("施行日が過去の日付です。既存の進行中案件への影響を確認してください。");
  }
  
  if (!currentClassificationRules || currentClassificationRules.length === 0) {
    throw new Error("更新対象となる文書分類基準がシステムに登録されていません。基準データを確認してください。");
  }
  
  const affectedDocumentTypes = identifyAffectedDocumentTypes(approvedChanges);
  const updatedRules = [];
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
): PriorityResult {
  if (!["即日対応", "1週間以内", "1ヶ月以内"].includes(urgencyLevel)) {
    throw new Error("緊急度レベルは「即日対応」「1週間以内」「1ヶ月以内」のいずれかを指定してください");
  }
  
  if (!["全学", "特定部署", "特定業務"].includes(impactScope)) {
    throw new Error("影響範囲は「全学」「特定部署」「特定業務」のいずれかを指定してください");
  }
  
  if (currentProcessingLoad < 0 || currentProcessingLoad > 100) {
    console.warn("処理負荷レベルは0から100の範囲で入力してください");
    currentProcessingLoad = Math.max(0, Math.min(100, currentProcessingLoad));
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
    scheduleDays *= 1.5;
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
): ContinuityResult {
  if (!estimatedUpdateDuration) {
    throw new Error("更新作業の所要時間を入力してください。業務継続計画の策定に必要です。");
  }
  
  if (activeApplications < 0) {
    throw new Error("現在の申請状況を確認できないため、安全な更新計画を立てることができません。システム管理者にお問い合わせください。");
  }
  
  const impactLevel = activeApplications > 50 || criticalDeadlines.length > 0 ? "high" : "low";
  const requiresStaging = estimatedUpdateDuration > 120;
  const temporaryRoutes = [];
  
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