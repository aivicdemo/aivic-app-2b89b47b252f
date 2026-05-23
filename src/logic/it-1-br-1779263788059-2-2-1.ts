```typescript
// SIG-PLAN:
// - 関数名: processUrgentApplicationPriority
//   呼び出し例 (テスト中): processUrgentApplicationPriority(applicationData, urgencyFlag, deadlineDate, currentApprovalQueue)
//   await されてる?: いいえ
//   アクセスされるプロパティ: r.priorityLevel, r.queuePosition, r.notificationTargets, r.processingDeadline.getTime
//   → 結論: function processUrgentApplicationPriority(applicationData: object, urgencyFlag: boolean, deadlineDate: Date, currentApprovalQueue: any[]): UrgentApplicationResult
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
//   アクセスされるプロパティ: r.primaryTargets, r.secondaryTargets, r.notificationMethod, r.auditTrailRequired, r.primaryTargets.length
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
//   → 結論: function updateProcessingRoutesByRegulationChange(regulationChangeNotice: string, currentDocumentClassification: object[], affectedDocumentTypes: string[]): RegulationChangeResult
//
// - 関数名: validateLegalNotificationAuthenticity
//   呼び出し例 (テスト中): validateLegalNotificationAuthenticity(notificationContent, senderInfo, digitalSignature, receivedTimestamp)
//   await されてる?: いいえ
//   アクセスされるプロパティ: r.isAuthentic, r.isValid, r.canProceed, r.verificationDetails.senderValid, r.verificationDetails.signatureValid, r.verificationDetails.contentIntact
//   → 結論: function validateLegalNotificationAuthenticity(notificationContent: string, senderInfo: object, digitalSignature: string, receivedTimestamp: string): AuthenticityValidationResult
//
// - 関数名: analyzeRegulationImpactScope
//   呼び出し例 (テスト中): analyzeRegulationImpactScope(regulationChangeContent, affectedRegulationTypes, currentDocumentTypes)
//   await されてる?: いいえ
//   アクセスされるプロパティ: r.affectedDocumentTypes, r.changeRequiredCount, r.impactLevel
//   → 結論: function analyzeRegulationImpactScope(regulationChangeContent: string, affectedRegulationTypes: string[], currentDocumentTypes: any[]): RegulationImpactAnalysis
//
// - 関数名: approveRequirementChange
//   呼び出し例 (テスト中): approveRequirementChange(changeRequirements, impactAnalysis, directorAuthority, complianceRisk)
//   await されてる?: いいえ
//   アクセスされるプロパティ: r.approved, r.approvalComment, r.nextAction, r.urgencyLevel
//   → 結論: function approveRequirementChange(changeRequirements: string, impactAnalysis: string, directorAuthority: string, complianceRisk: number): RequirementChangeApprovalResult
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
//   → 結論: function updateDocumentClassificationStandards(approvedChanges: any[], currentClassificationRules: any[], effectiveDate: Date): ProcessingRouteUpdateResult
//
// - 関数名: determineLegalChangeProcessingPriority
//   呼び出し例 (テスト中): determineLegalChangeProcessingPriority(urgencyLevel, impactScope, affectedDocumentTypes, currentProcessingLoad)
//   await されてる?: いいえ
//   アクセスされるプロパティ: r.priority, r.scheduleDays, r.processingOrder, r.notificationLevel
//   → 結論: function determineLegalChangeProcessingPriority(urgencyLevel: string, impactScope: string, affectedDocumentTypes: string[], currentProcessingLoad: number): LegalChangeProcessingPriorityResult
//
// - 関数名: ensureBusinessContinuityDuringSystemUpdate
//   呼び出し例 (テスト中): ensureBusinessContinuityDuringSystemUpdate(updateScope, activeApplications, estimatedUpdateDuration, criticalDeadlines)
//   await されてる?: いいえ
//   アクセスされるプロパティ: r.continuityPlan, r.temporaryRoutes, r.rollbackProcedure, r.communicationPlan
//   → 結論: function ensureBusinessContinuityDuringSystemUpdate(updateScope: string, activeApplications: number, estimatedUpdateDuration: number, criticalDeadlines: string[]): BusinessContinuityResult

interface UrgentApplicationResult {
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

interface RegulationChangeResult {
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
  updatedRoutes: RouteUpdate[];
}

interface RouteUpdate {
  documentId: string;
  oldRoute: string;
  newRoute: string;
}

interface ProcessingRouteUpdateResult {
  updatedRules: DocumentClassificationRule[];
  affectedDocumentCount: number;
  newProcessingRoutes: ProcessingRouteMapping[];
  applicationStartDate: Date;
}

interface DocumentClassificationRule {
  documentType: string;
  processingRoute: string;
  paperStorageRequired: boolean;
}

interface ProcessingRouteMapping {
  documentType: string;
  processingRoute: string;
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

export function processUrgentApplicationPriority(
  applicationData: object,
  urgencyFlag: boolean,
  deadlineDate: Date,
  currentApprovalQueue: any[]
): UrgentApplicationResult {
  const currentDate = new Date();
  const isUrgent = urgencyFlag || (deadlineDate.getTime() - currentDate.getTime()) <= 3 * 24 * 60 * 60 * 1000;
  
  let priorityLevel: number;
  let queuePosition: number;
  let notificationTargets: string[];
  let processingDeadline: Date;
  
  if (isUrgent) {
    priorityLevel = 1;
    queuePosition = 0;
    notificationTargets = (applicationData as any).approvalRoute || [];
    processingDeadline = new Date(currentDate.getTime() + 24 * 60 * 60 * 1000);
  } else {
    priorityLevel = calculateNormalPriority(applicationData);
    queuePosition = currentApprovalQueue.length;
    notificationTargets = getNextApprover((applicationData as any).approvalRoute);
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
  let dataRecoveryPlan: string;
  let estimatedRecoveryTime: number;
  
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
  
  dataRecoveryPlan = "sync_paper_to_electronic_after_recovery";
  estimatedRecoveryTime = calculateRecoveryTime(failureType);
  
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
  applicationData: object,
  approverInfo: object,
  documentClassification: object
): NotificationTargetsResult {
  let primaryTargets: string[];
  let secondaryTargets: string[] = [];
  
  const appData = applicationData as any;
  const docClass = documentClassification as any;
  
  if (approvalResult === "approved") {
    primaryTargets = [appData.applicant_id, getDirectSupervisor(appData.applicant_id)];
  } else {
    primaryTargets = [appData.applicant_id, getDirectSupervisor(appData.applicant_id), getAdminSupport(appData.department_id)];
  }
  
  if (docClass.subsidyRelated) {
    secondaryTargets.push("finance_dept", "audit_dept");
  }
  
  if (appData.urgency_level === "high") {
    secondaryTargets.push(getDepartmentManager(appData.department_id));
  }
  
  const auditTrailRequired = docClass.subsidyRelated && docClass.moeRequirement;
  const notificationMethod = docClass.paperStorageRequired ? "hybrid" : "electronic";
  
  return { primaryTargets, secondaryTargets, notificationMethod, auditTrailRequired };
}

export function checkApprovalDelayAndNotify(
  applicationId: string,
  currentDateTime: Date,
  approvalDeadline: Date,
  reminderSettings: object,
  approverInfo: object
): DelayNotificationResult {
  const timeUntilDeadline = approvalDeadline.getTime() - currentDateTime.getTime();
  const hoursUntilDeadline = timeUntilDeadline / (1000 * 60 * 60);
  const settings = reminderSettings as any;
  const approver = approverInfo as any;
  
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
  
  const nextReminderTime = calculateNextReminderTime(currentDateTime, approvalDeadline, settings);
  
  return { shouldNotify, notificationType, recipients, delayStatus, nextReminderTime };
}

export function updateProcessingRoutesByRegulationChange(
  regulationChangeNotice: string,
  currentDocumentClassification: object[],
  affectedDocumentTypes: string[]
): RegulationChangeResult {
  const affectedTypes = analyzeRegulationImpact(regulationChangeNotice);
  const updatedRoutes: object[] = [];
  
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
  senderInfo: object,
  digitalSignature: string,
  receivedTimestamp: string
): AuthenticityValidationResult {
  if (!notificationContent || notificationContent.length < 10) {
    throw new Error("法令改正通知の内容が不正です。正しい通知内容を確認してください。");
  }
  
  if (!digitalSignature) {
    throw new Error("デジタル署名が見つかりません。文部科学省からの正式な通知であることを確認してください。");
  }
  
  const sender = senderInfo as any;
  if (!sender || !sender.organization || !sender.certificate) {
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
): RegulationImpactAnalysis {
  if (!regulationChangeContent || regulationChangeContent.length === 0) {
    throw new Error("法令改正の変更内容が正しく取得できていません。改正通知の受信処理を確認してください。");
  }
  
  if (currentDocumentTypes.length === 0) {
    throw new Error("システムに登録されている文書種別の情報を取得できません。データベース接続を確認してください。");
  }
  
  const affectedRegulations = extractAffectedRegulations(regulationChangeContent, affectedRegulationTypes);
  const affectedTypes: string[] = [];
  const routeChanges: ProcessingRouteChange[] = [];
  
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
  
  if (affectedTypes.length > 100) {
    console.warn("影響範囲が非常に広範囲です。段階的な対応計画の策定を推奨します。");
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

export function migrateExistingDataToNewClassification(
  newClassificationRules: any[],
  existingDocuments: any[],
  migrationScope: string
): MigrationResult {
  if (newClassificationRules.length === 0) {
    throw new Error("法令改正に基づく新しい分類基準が設定されていません。分類基準を確認してください。");
  }
  
  if (existingDocuments.length === 0) {
    throw new Error("既存の申請書類データにアクセスできません。システム管理者に連絡してください。");
  }
  
  const targetDocuments = existingDocuments.filter(doc => isInMigrationScope(doc, migrationScope));
  let migratedCount = 0;
  let skippedCount = 0;
  let errorCount = 0;
  const updatedRoutes: RouteUpdate[] = [];
  
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
): ProcessingRouteUpdateResult {
  if (approvedChanges.length === 0) {
    throw new Error("法令改正に伴う変更要件が正しく承認されていません。事務局長による承認を確認してください。");
  }
  
  if (effectiveDate < new Date()) {
    console.warn("施行日が過去の日付です。既存の進行中案件への影響を確認してください。");
  }
  
  if (currentClassificationRules.length === 0) {
    throw new Error("更新対象となる文書分類基準がシステムに登録されていません。基準データを確認してください。");
  }
  
  const affectedDocumentTypes = identifyAffectedDocumentTypes(approvedChanges);
  const updatedRules: DocumentClassificationRule[] = [];
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
  
  return { priority, scheduleDays, processingOrder, notification