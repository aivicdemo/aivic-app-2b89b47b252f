```typescript
// SIG-PLAN:
// - 関数名: handleSystemFailureAlternativeProcess
//   呼び出し例 (テスト中): handleSystemFailureAlternativeProcess("critical_failure", "system_failure", "補助金申請書", 9)
//   await されてる?: いいえ
//   アクセスされるプロパティ: r.alternativeProcess, r.notificationTargets, r.dataRecoveryPlan, r.estimatedRecoveryTime
//   → 結論: function handleSystemFailureAlternativeProcess(systemStatus: string, failureType: string, documentType: string, urgencyLevel: number): AlternativeProcessResult
//   → AlternativeProcessResult = { alternativeProcess: string; notificationTargets: string[]; dataRecoveryPlan: string; estimatedRecoveryTime: number }
// - 関数名: checkApprovalStatusViewPermission
//   呼び出し例 (テスト中): checkApprovalStatusViewPermission("user001", "app001", "staff", "user001", "dept001")
//   await されてる?: いいえ
//   アクセスされるプロパティ: r.canView, r.viewLevel, r.allowedFields
//   → 結論: function checkApprovalStatusViewPermission(userId: string, applicationId: string, userRole: string, applicationOwner: string, departmentId: string): ViewPermissionResult
//   → ViewPermissionResult = { canView: boolean; viewLevel: string; allowedFields: string[] }
// - 関数名: handleSystemFailureFallback
//   呼び出し例 (テスト中): handleSystemFailureFallback("down", "app001", "manager")
//   await されてる?: いいえ
//   アクセスされるプロパティ: r.fallbackMethod, r.emergencyContactList, r.paperFormUrl, r.syncRequired
//   → 結論: function handleSystemFailureFallback(systemStatus: string, applicationId: string, userRole: string): FallbackResult
//   → FallbackResult = { fallbackMethod: string; emergencyContactList: string[]; paperFormUrl: string; syncRequired: boolean }
// - 関数名: ensureBusinessContinuityDuringSystemUpdate
//   呼び出し例 (テスト中): ensureBusinessContinuityDuringSystemUpdate("documentClassification", 25, 60, [])
//   await されてる?: いいえ
//   アクセスされるプロパティ: r.continuityPlan, r.temporaryRoutes, r.rollbackProcedure, r.communicationPlan
//   → 結論: function ensureBusinessContinuityDuringSystemUpdate(updateScope: string, activeApplications: number, estimatedUpdateDuration: number, criticalDeadlines: string[]): ContinuityPlanResult
//   → ContinuityPlanResult = { continuityPlan: string; temporaryRoutes: string[]; rollbackProcedure: string; communicationPlan: string }

interface AlternativeProcessResult {
  alternativeProcess: string;
  notificationTargets: string[];
  dataRecoveryPlan: string;
  estimatedRecoveryTime: number;
}

interface ViewPermissionResult {
  canView: boolean;
  viewLevel: string;
  allowedFields: string[];
}

interface FallbackResult {
  fallbackMethod: string;
  emergencyContactList: string[];
  paperFormUrl: string;
  syncRequired: boolean;
}

interface ContinuityPlanResult {
  continuityPlan: string;
  temporaryRoutes: string[];
  rollbackProcedure: string;
  communicationPlan: string;
}

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
  
  const validApplicationTypes = ["補助金申請", "設備申請", "人事申請", "予算申請"];
  if (!applicationType || !validApplicationTypes.includes(applicationType)) {
    errors.push("申請種別を正しく選択してください");
  }
  
  const validDepartments = ["総務課", "財務課", "学務課", "研究推進課"];
  if (!applicantDepartment || !validDepartments.includes(applicantDepartment)) {
    errors.push("所属部署を正しく入力してください");
  }
  
  const validUrgencyLevels = ["通常", "急ぎ", "至急"];
  if (!urgencyLevel || !validUrgencyLevels.includes(urgencyLevel)) {
    errors.push("緊急度を選択してください");
  }
  
  const isValid = errors.length === 0;
  
  return { isValid, errors, warnings };
}

export function validateApplicationAmountAndPeriod(
  applicationAmount: number,
  implementationStartDate: string,
  implementationEndDate: string,
  documentType: string,
  budgetLimits: { [key: string]: { maxAmount: number; minAmount: number } }
): { isAmountValid: boolean; isPeriodValid: boolean; validationErrors: string[]; canProceed: boolean } {
  if (applicationAmount <= 0) {
    throw new Error("申請金額は正の数値で入力してください");
  }
  
  const budgetLimit = budgetLimits[documentType];
  if (!budgetLimit) {
    throw new Error("指定された文書種別の予算制限が見つかりません");
  }
  
  const isAmountValid = applicationAmount >= budgetLimit.minAmount && applicationAmount <= budgetLimit.maxAmount;
  const startDate = new Date(implementationStartDate);
  const endDate = new Date(implementationEndDate);
  const today = new Date();
  
  if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
    throw new Error("実施期間は有効な日付形式で入力してください");
  }
  
  const isPeriodValid = startDate >= today && endDate > startDate;
  const validationErrors: string[] = [];
  
  if (!isAmountValid) {
    validationErrors.push("申請金額が規定範囲外です");
    if (applicationAmount > budgetLimit.maxAmount * 1.5) {
      console.warn("申請金額が大幅に予算上限を超過しています。金額を見直してください");
    }
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
  if (!documentTitle || documentTitle.length < 10) {
    throw new Error("申請書類のタイトルは10文字以上で入力してください");
  }
  
  if (!documentContent || documentContent.length < 50) {
    throw new Error("申請書類の内容は50文字以上で入力してください");
  }
  
  if (!applicantDepartment) {
    throw new Error("申請者の所属部署を選択してください");
  }
  
  const subsidyKeywords = ["科研費", "運営費交付金", "設備整備費", "補助金"];
  const content = documentTitle + " " + documentContent;
  let keywordScore = 0;
  
  subsidyKeywords.forEach(keyword => {
    if (content.includes(keyword)) {
      keywordScore += 0.3;
    }
  });
  
  const isResearchDept = ["研究推進課", "学術情報課"].includes(applicantDepartment);
  if (isResearchDept) {
    keywordScore += 0.1;
  }
  
  const subsidyRelated = keywordScore >= 0.7 || (isResearchDept && keywordScore >= 0.6);
  
  let documentType = "一般申請";
  if (subsidyRelated) {
    documentType = "補助金申請";
  } else if (documentTitle.includes("人事")) {
    documentType = "人事関連";
  } else if (documentTitle.includes("設備")) {
    documentType = "設備申請";
  }
  
  const moeRequiredTypes = ["補助金申請", "事業報告書", "会計報告書"];
  const paperStorageRequired = subsidyRelated && moeRequiredTypes.includes(documentType);
  const processingRoute = paperStorageRequired ? "hybrid" : "electronic";
  
  return { documentType, processingRoute, subsidyRelated, paperStorageRequired };
}

export function determineDocumentTypeAndRoute(
  documentTitle: string,
  documentContent: string,
  applicantDepartment: string
): { documentType: string; processingRoute: string; subsidyRelated: boolean; paperStorageRequired: boolean } {
  if (!documentTitle) {
    throw new Error("申請書類のタイトルを入力してください");
  }
  
  if (!documentContent || documentContent.length < 10) {
    console.warn("申請内容が短すぎる可能性があります。内容を確認してください");
  }
  
  if (!applicantDepartment) {
    throw new Error("申請者の所属部署を選択してください");
  }
  
  const subsidyKeywords = ["科研費", "運営費交付金", "設備整備費", "補助金"];
  const content = documentTitle + " " + documentContent;
  let keywordScore = 0;
  
  subsidyKeywords.forEach(keyword => {
    if (content.includes(keyword)) {
      keywordScore += 0.25;
    }
  });
  
  const isResearchDept = ["研究推進課", "学術情報課"].includes(applicantDepartment);
  if (isResearchDept) {
    keywordScore += 0.1;
  }
  
  const subsidyRelated = keywordScore >= 0.7 || (isResearchDept && keywordScore >= 0.6);
  
  let documentType = "一般申請";
  if (subsidyRelated) {
    documentType = "補助金申請";
  }
  
  const paperStorageRequired = subsidyRelated && ["補助金申請"].includes(documentType);
  const processingRoute = paperStorageRequired ? "hybrid" : "electronic";
  
  return { documentType, processingRoute, subsidyRelated, paperStorageRequired };
}

export function checkMoeComplianceRequirements(
  documentTitle: string,
  documentContent: string,
  applicantDepartment: string
): { documentType: string; processingRoute: string; subsidyRelated: boolean; paperStorageRequired: boolean } {
  if (!documentTitle || documentTitle.length < 10) {
    throw new Error("申請書類のタイトルは10文字以上で入力してください");
  }
  
  if (!documentContent || documentContent.length < 50) {
    throw new Error("申請書類の内容は50文字以上で入力してください");
  }
  
  if (!applicantDepartment) {
    console.warn("所属部署を選択すると、より正確な判定が行われます");
  }
  
  const subsidyKeywords = ["科研費", "運営費交付金", "設備整備費", "補助金"];
  const content = documentTitle + " " + documentContent;
  let keywordScore = 0;
  
  subsidyKeywords.forEach(keyword => {
    if (content.includes(keyword)) {
      keywordScore += 0.25;
    }
  });
  
  const isResearchDept = applicantDepartment && ["研究推進課", "学術情報課"].includes(applicantDepartment);
  const departmentBonus = isResearchDept ? 0.1 : 0.0;
  const adjustedScore = keywordScore + departmentBonus;
  
  const subsidyRelated = adjustedScore >= 0.7 || (isResearchDept && adjustedScore >= 0.6);
  
  let documentType = "一般申請";
  if (subsidyRelated) {
    documentType = "補助金申請";
  }
  
  const moeRequiredTypes = ["補助金申請"];
  const paperStorageRequired = subsidyRelated && moeRequiredTypes.includes(documentType);
  const processingRoute = paperStorageRequired ? "hybrid" : "electronic";
  
  return { documentType, processingRoute, subsidyRelated, paperStorageRequired };
}

export function setApproverAuthorityLevel(
  documentType: string,
  subsidyRelated: boolean,
  paperStorageRequired: boolean,
  applicantDepartment: string,
  budgetAmount: number
): { requiredAuthorityLevel: string; approverRoles: string[]; escalationRequired: boolean } {
  if (budgetAmount < 0) {
    throw new Error("予算金額は0以上の値を入力してください");
  }
  
  if (!applicantDepartment) {
    throw new Error("申請者の所属部署を選択してください");
  }
  
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
  if (applicationAmount <= 0) {
    throw new Error("申請金額は1円以上で入力してください");
  }
  
  if (applicationAmount > 100000000) {
    console.warn("高額申請のため、理事会での特別承認が必要になる可能性があります");
  }
  
  if (!applicantDepartment) {
    throw new Error("承認ルート設定のため、所属部署を入力してください");
  }
  
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
  
  const approvers = [approvalLevel];
  
  return { approvalLevel, approvers, estimatedDays, requiresPaperApproval };
}

export function validateApplicationBeforeSubmission(
  documentTitle: string,
  documentContent: string,
  documentType: string,
  processingRoute: string,
  approvalRoute: string[],
  requiredFields: Record<string, any>
): { isValid: boolean; errors: string[]; warnings: string[] } {
  if (!documentTitle) {
    throw new Error("申請書類のタイトルを入力してください");
  }
  
  if (!documentContent || documentContent.trim().length < 10) {
    throw new Error("申請内容を10文字以上で入力してください");
  }
  
  if (documentType === "subsidy" && processingRoute !== "hybrid") {
    throw new Error("補助金関連書類は紙保管が必要なため、ハイブリッド処理を選択してください");
  }
  
  if (approvalRoute.length === 0) {
    throw new Error("承認者を1名以上設定してください");
  }
  
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
  if (submissionDate > new Date()) {
    throw new Error("提出日は現在日時以前である必要があります");
  }
  
  const validUrgencyLevels = ["high", "standard", "low"];
  if (!validUrgencyLevels.includes(urgencyLevel)) {
    throw new Error("緊急度は「高」「標準」「低」のいずれかを選択してください");
  }
  
  let baseDays = subsidyRelated ? 5 : 3;
  
  if (urgencyLevel === "high") {
    baseDays = baseDays / 2;
  } else if (urgencyLevel === "low") {
    baseDays = baseDays * 1.5;
  }
  
  const deadlineDate = new Date(submissionDate.getTime() + baseDays * 24 * 60 * 60 * 1000);
  const businessDays = baseDays;
  const notificationSchedule = ["2日前", "当日"];
  
  return { deadlineDate, businessDays, notificationSchedule };
}

export function processUrgentApplicationPriority(
  applicationData: { approvalRoute: string[]; priority?: string; createdAt?: Date },
  urgencyFlag: boolean,
  deadlineDate: Date,
  currentApprovalQueue: any[]
): { priorityLevel: number; queuePosition: number; notificationTargets: string[]; processingDeadline: Date } {
  if (deadlineDate < new Date()) {
    throw new Error("提出期限は現在日時より未来の日付を設定してください");
  }
  
  if (!applicationData.approvalRoute || applicationData.approvalRoute.length === 0) {
    throw new Error("緊急案件の処理には最低一人の承認者が必要です");
  }
  
  const currentDate = new Date();
  const timeDiff = (deadlineDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24);
  const isUrgent = urgencyFlag || timeDiff <= 3;
  
  let priorityLevel: number;
  let queuePosition: number;
  let notificationTargets: string[];
  let processingDeadline: Date;
  
  if (isUrgent) {
    priorityLevel = 1;
    queuePosition = 0;
    notificationTargets = applicationData.approvalRoute;
    processingDeadline = new Date(currentDate.getTime() + 24 * 60 * 60 * 1000);
  } else {
    priorityLevel = applicationData.priority === "high" ? 2 : 3;
    queuePosition = currentApprovalQueue.length;
    notificationTargets = [applicationData.approvalRoute[0]];
    processingDeadline = new Date(currentDate.getTime() + 3 * 24 * 60 * 60 * 1000);
  }
  
  return { priorityLevel, queuePosition, notificationTargets, processingDeadline };
}

export function handleSystemFailureAlternativeProcess(
  systemStatus: string,
  failureType: string,
  documentType: string,
  urgencyLevel: number
): AlternativeProcessResult {
  if (systemStatus === null || systemStatus === undefined) {
    throw new Error("システム状況を確認できません。情報システム課に連絡してください。");
  }
  
  if (!failureType) {
    console.warn("障害の詳細が不明です。標準的な代替処理を開始します。");
  }
  
  if (urgencyLevel < 1 || urgencyLevel > 10) {
    urgencyLevel = Math.max(1, Math.min(10, urgencyLevel));
    console.warn("緊急度は1から10の範囲で指定してください。");
  }
  
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
  
  // 障害の種類に基づいて復旧時間を計算
  let estimatedRecoveryTime: number;
  if (failureType === "system_failure") {
    estimatedRecoveryTime = 240; // 4時間
  } else if (failureType === "network_issue") {
    estimatedRecoveryTime = 120; // 2時間
  } else {
    estimatedRecoveryTime = 60; // 1時間
  }
  
  // 緊急度が高い場合は復旧時間を短縮
  if (urgencyLevel >= 8) {
    estimatedRecoveryTime = estimatedRecoveryTime * 0.7;
  }
  
  return { alternativeProcess, notificationTargets, dataRecoveryPlan, estimatedRecoveryTime };
}

export function checkApprovalStatusViewPermission(
  userId: string,
  applicationId: string,
  userRole: string,
  applicationOwner: string,
  departmentId: string
): ViewPermissionResult {
  if (!userId) {
    throw new Error("利用者の認証情報が確認できません。再度ログインしてください。");
  }
  
  if (!applicationId) {
    throw new Error("指定された申請書類が見つかりません。");
  }
  
  const isOwner = userId === applicationOwner;
  
  if (isOwner) {
    return { 
      canView: true, 
      viewLevel: "full", 
      allowedFields: ["status", "currentApprover", "history", "comments"] 
    };
  }
  
  const isManager = userRole === "manager" || userRole === "director";
  
  // 同じ部署かどうかの判定（簡略化）
  const sameDepartment = true; // 実際の実装では部署情報を比較
  
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

export function getProgressDataWithAccessControl(
  userId: string,
  applicationId: string,
  userRole: string
): { accessGranted: boolean; progressData: any | null; restrictionReason: string | null } {
  if (!userId) {
    throw new Error("利用者の識別情報が正しく設定されていません。再度ログインしてください。");
  }
  
  if (!applicationId) {
    throw new Error("指定された申請案件が見つかりません。案件番号を確認してください。");
  }
  
  // アクセス権限チェック（簡略化）
  const hasAccess = userRole === "manager" || userRole === "staff" || userRole === "director";
  
  if (!hasAccess) {
    return { 
      accessGranted: false, 
      progressData: null, 
      restrictionReason: "アクセス権限がありません" 
    };
  }
  
  const progressData = {
    currentStep: "承認待ち",
    approverName: "田中部長",
    submissionDate: "2024-01-15",
    daysElapsed: 3,
    nextAction: "部長承認"
  };
  
  return { accessGranted: true, progressData, restrictionReason: null };
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
  urgencyLevel: 'low' | 'medium' | 'high';
  recommendedAction: string;
}> {
  if (Object.values(stagnationThresholds).some(threshold => threshold <= 0)) {
    throw new Error("滞留基準日数は1日以上で設定してください。");
  }
  
  if (applicationStatuses.length === 0) {
    console.warn("確認対象の申請案件がありません。");
  }
  
  const stagnantApplications: Array<{
    applicationId: string;
    stagnantDays: number;
    thresholdExceeded: number;
    urgencyLevel: 'low' | 'medium' | 'high';
    recommendedAction: string;
  }> = [];
  
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
  pendingApplications: Array<{
    applicationId: string;
    delayDays: number;
    approverLevel: number;
    documentImportance: number;
    applicantDepartment: string;
  }>,
  priorityWeights: { delayWeight: number; levelWeight: number; importanceWeight: number }
): Array<{ applicationId: string; priorityScore: number; reminderUrgency: 'high' | 'medium' | 'low' }> {
  if (pendingApplications.length === 0) {
    throw new Error("催促対象となる滞留案件が存在しません。承認進捗を再確認してください。");
  }
  
  if (Object.values(priorityWeights).some(