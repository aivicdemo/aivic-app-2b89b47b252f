// SIG-PLAN:
// - 関数名: handleSystemFailureAlternativeProcess
//   呼び出し例 (テスト中): handleSystemFailureAlternativeProcess("critical_failure", "database_connection", "補助金申請書", 9)
//   await されてる?: いいえ
//   アクセスされるプロパティ: r.alternativeProcess, r.notificationTargets, r.dataRecoveryPlan, r.estimatedRecoveryTime
//   → 結論: function handleSystemFailureAlternativeProcess(systemStatus: string, failureType: string, documentType: string, urgencyLevel: number): AlternativeProcessResult
//
// - 関数名: checkApprovalStatusViewPermission
//   呼び出し例 (テスト中): checkApprovalStatusViewPermission("user123", "app456", "applicant", "user123", "dept001")
//   await されてる?: いいえ
//   アクセスされるプロパティ: r.canView, r.viewLevel, r.allowedFields
//   → 結論: function checkApprovalStatusViewPermission(userId: string, applicationId: string, userRole: string, applicationOwner: string, departmentId: string): ViewPermissionResult
//
// - 関数名: handleSystemFailureFallback
//   呼び出し例 (テスト中): handleSystemFailureFallback("down", "app789", "manager")
//   await されてる?: いいえ
//   アクセスされるプロパティ: r.fallbackMethod, r.emergencyContactList, r.paperFormUrl, r.syncRequired
//   → 結論: function handleSystemFailureFallback(systemStatus: string, applicationId: string, userRole: string): FallbackResult
//
// - 関数名: ensureBusinessContinuityDuringSystemUpdate
//   呼び出し例 (テスト中): ensureBusinessContinuityDuringSystemUpdate("documentClassification", 25, 60, ["2024-03-15"])
//   await されてる?: いいえ
//   アクセスされるプロパティ: r.continuityPlan, r.temporaryRoutes, r.rollbackProcedure, r.communicationPlan
//   → 結論: function ensureBusinessContinuityDuringSystemUpdate(updateScope: string, activeApplications: number, estimatedUpdateDuration: number, criticalDeadlines: string[]): ContinuityResult

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

interface ContinuityResult {
  continuityPlan: string;
  temporaryRoutes: string[];
  rollbackProcedure: string;
  communicationPlan: string;
}

export function handleSystemFailureAlternativeProcess(
  systemStatus: string,
  failureType: string,
  documentType: string,
  urgencyLevel: number
): AlternativeProcessResult {
  if (systemStatus == null) {
    throw new Error("システム状況を確認できません。情報システム課に連絡してください。");
  }

  let alternativeProcess: string;
  if (systemStatus == "critical_failure") {
    alternativeProcess = "full_paper_mode";
  } else if (systemStatus == "partial_failure") {
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
  
  // 障害種別に応じた復旧時間を計算
  let estimatedRecoveryTime: number;
  if (failureType === "database_connection") {
    estimatedRecoveryTime = 120; // 2時間
  } else if (failureType === "api_timeout") {
    estimatedRecoveryTime = 60; // 1時間
  } else {
    estimatedRecoveryTime = 180; // 3時間
  }

  return {
    alternativeProcess,
    notificationTargets,
    dataRecoveryPlan,
    estimatedRecoveryTime
  };
}

export function checkApprovalStatusViewPermission(
  userId: string,
  applicationId: string,
  userRole: string,
  applicationOwner: string,
  departmentId: string
): ViewPermissionResult {
  if (!userId || userId.trim() === "") {
    throw new Error("利用者の認証情報が確認できません。再度ログインしてください。");
  }

  if (!applicationId || applicationId.trim() === "") {
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
  const sameDepartment = true; // 実際の実装では部署情報を照合
  
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

  return {
    canView: false,
    viewLevel: "none",
    allowedFields: []
  };
}

export function handleSystemFailureFallback(
  systemStatus: string,
  applicationId: string,
  userRole: string
): FallbackResult {
  if (!applicationId || applicationId.trim() === "") {
    throw new Error("指定された申請書類が見つかりません。正しい申請番号を入力してください。");
  }

  const isSystemDown = systemStatus === "down" || systemStatus === "error";
  
  if (!isSystemDown) {
    return {
      fallbackMethod: "normal",
      emergencyContactList: [],
      paperFormUrl: "",
      syncRequired: false
    };
  }

  // 申請情報の取得（模擬）
  const applicationInfo = {
    type: applicationId.includes("subsidy") ? "subsidy" : "general",
    priority: userRole === "manager" ? "high" : "normal",
    approvers: ["approver1@university.ac.jp", "approver2@university.ac.jp"]
  };

  const isUrgent = applicationInfo.type === "subsidy" || applicationInfo.priority === "high";
  const fallbackMethod = isUrgent ? "emergency_paper" : "wait_recovery";
  
  const contactList = applicationInfo.approvers;
  const paperUrl = `https://forms.university.ac.jp/paper/${applicationId}`;

  return {
    fallbackMethod,
    emergencyContactList: contactList,
    paperFormUrl: paperUrl,
    syncRequired: true
  };
}

export function ensureBusinessContinuityDuringSystemUpdate(
  updateScope: string,
  activeApplications: number,
  estimatedUpdateDuration: number,
  criticalDeadlines: string[]
): ContinuityResult {
  if (activeApplications == null) {
    throw new Error("現在の申請状況を確認できないため、安全な更新計画を立てることができません。システム管理者にお問い合わせください。");
  }

  if (!estimatedUpdateDuration || estimatedUpdateDuration <= 0) {
    throw new Error("更新作業の所要時間を入力してください。業務継続計画の策定に必要です。");
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

  return {
    continuityPlan,
    temporaryRoutes,
    rollbackProcedure,
    communicationPlan
  };
}

// 以下、その他の必要な関数を実装

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
  const validTypes = ["補助金申請", "設備申請", "人事申請", "予算申請"];
  return validTypes.includes(type);
}

function isValidDepartment(department: string): boolean {
  return department && department.trim().length > 0;
}

function isValidUrgencyLevel(level: string): boolean {
  const validLevels = ["低", "中", "高"];
  return validLevels.includes(level);
}

export function validateApplicationAmountAndPeriod(
  applicationAmount: number,
  implementationStartDate: string,
  implementationEndDate: string,
  documentType: string,
  budgetLimits: { [key: string]: { maxAmount: number; minAmount: number } }
): {
  isAmountValid: boolean;
  isPeriodValid: boolean;
  validationErrors: string[];
  canProceed: boolean;
} {
  if (applicationAmount <= 0) {
    throw new Error("申請金額は正の数値で入力してください");
  }

  const budgetLimit = budgetLimits[documentType];
  const isAmountValid = budgetLimit && 
    applicationAmount >= budgetLimit.minAmount && 
    applicationAmount <= budgetLimit.maxAmount;

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
): {
  documentType: string;
  processingRoute: string;
  subsidyRelated: boolean;
  paperStorageRequired: boolean;
} {
  if (!documentTitle || documentTitle.length < 10) {
    throw new Error("申請書類のタイトルは10文字以上で入力してください");
  }

  if (!documentContent || documentContent.length < 50) {
    throw new Error("申請書類の内容は50文字以上で入力してください");
  }

  if (!applicantDepartment) {
    throw new Error("所属部署を選択してください");
  }

  const keywordScore = calculateSubsidyKeywordMatch(documentTitle, documentContent);
  const subsidyRelated = keywordScore >= 0.7;
  const documentType = determineDocumentType(documentTitle, applicantDepartment);
  const paperStorageRequired = subsidyRelated && isMoeRequiredPaperStorage(documentType);
  const processingRoute = paperStorageRequired ? "hybrid" : "electronic";

  return { documentType, processingRoute, subsidyRelated, paperStorageRequired };
}

function calculateSubsidyKeywordMatch(title: string, content: string): number {
  const subsidyKeywords = ["科研費", "運営費交付金", "設備整備費", "補助金", "助成金"];
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
  if (title.includes("補助金") || title.includes("助成金")) {
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

export function determineDocumentTypeAndRoute(
  documentTitle: string,
  documentContent: string,
  applicantDepartment: string
): {
  documentType: string;
  processingRoute: string;
  subsidyRelated: boolean;
  paperStorageRequired: boolean;
} {
  if (!documentTitle) {
    throw new Error("申請書類のタイトルが入力されていません。タイトルを入力してください。");
  }

  if (documentContent.length < 10) {
    console.warn("申請内容が短すぎる可能性があります。内容を確認してください。");
  }

  if (!applicantDepartment) {
    throw new Error("申請者の所属部署を選択してください。");
  }

  const keywordScore = calculateSubsidyKeywordMatch(documentTitle, documentContent);
  const subsidyRelated = keywordScore >= 0.7;
  const paperStorageRequired = subsidyRelated && checkMoeRequirement(documentTitle, applicantDepartment);
  const processingRoute = paperStorageRequired ? "hybrid" : "electronic";
  const documentType = determineDocumentCategory(documentTitle, applicantDepartment, subsidyRelated);

  return { documentType, processingRoute, subsidyRelated, paperStorageRequired };
}

function checkMoeRequirement(title: string, department: string): boolean {
  return title.includes("補助金") || title.includes("科研費");
}

function determineDocumentCategory(title: string, department: string, subsidyRelated: boolean): string {
  if (subsidyRelated) return "補助金申請";
  if (title.includes("人事")) return "人事申請";
  return "一般申請";
}

export function checkMoeComplianceRequirements(
  documentTitle: string,
  documentContent: string,
  applicantDepartment: string
): {
  documentType: string;
  processingRoute: string;
  subsidyRelated: boolean;
  paperStorageRequired: boolean;
} {
  if (!documentTitle || documentTitle.length < 10) {
    throw new Error("申請書類のタイトルは10文字以上で入力してください");
  }

  if (!documentContent || documentContent.length < 50) {
    throw new Error("申請書類の内容は50文字以上で入力してください");
  }

  if (!applicantDepartment) {
    console.warn("所属部署を選択すると、より正確な判定が行われます");
  }

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
  const researchDepts = ["研究推進課", "学術研究院", "研究科"];
  return researchDepts.some(dept => department.includes(dept));
}

function classifyDocumentType(title: string, content: string): string {
  if (title.includes("補助金") || content.includes("補助金")) return "補助金申請書";
  if (title.includes("設備") || content.includes("設備")) return "設備申請書";
  return "一般申請書";
}

function isMoeStorageRequirement(documentType: string): boolean {
  return documentType === "補助金申請書";
}

export function setApproverAuthorityLevel(
  documentType: string,
  subsidyRelated: boolean,
  paperStorageRequired: boolean,
  applicantDepartment: string,
  budgetAmount: number
): {
  requiredAuthorityLevel: string;
  approverRoles: string[];
  escalationRequired: boolean;
} {
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
): {
  approvalLevel: string;
  approvers: string[];
  estimatedDays: number;
  requiresPaperApproval: boolean;
} {
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

  const approvers = getApproversByLevel(approvalLevel, applicantDepartment);

  return { approvalLevel, approvers, estimatedDays, requiresPaperApproval };
}

function getApproversByLevel(level: string, department: string): string[] {
  // 実際の実装では部署とレベルに応じた承認者を返す
  return [`${level}_${department}`];
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
    throw new Error("補助金関連書類はハイブリッド処理が必要です");
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

  if (!["高", "標準", "低"].includes(urgencyLevel)) {
    throw new Error("緊急度は「高」「標準」「低」のいずれかを選択してください");
  }

  let baseDays = subsidyRelated ? 5 : 3;
  if (urgencyLevel === "高") {
    baseDays = baseDays / 2;
  } else if (urgencyLevel === "低") {
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
    // 土日を除外（簡略化）
    if (result.getDay() !== 0 && result.getDay() !== 6) {
      addedDays++;
    }
  }
  
  return result;
}

export function processUrgentApplicationPriority(
  applicationData: any,
  urgencyFlag: boolean,
  deadlineDate: Date,
  currentApprovalQueue: any[]
): {
  priorityLevel: number;
  queuePosition: number;
  notificationTargets: any[];
  processingDeadline: Date;
} {
  if (!deadlineDate || deadlineDate < new Date()) {
    throw new Error("提出期限は現在日時より未来の日付を設定してください");
  }

  if (!applicationData.approvalRoute || applicationData.approvalRoute.length === 0) {
    throw new Error("緊急案件の処理には最低一人の承認者が必要です");
  }

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

function getAllApprovers(approvalRoute: any[]): any[] {
  return approvalRoute || [];
}

function getNextApprover(approvalRoute: any[]): any[] {
  return approvalRoute.slice(0, 1) || [];
}

function calculateNormalPriority(applicationData: any): number {
  return 3; // 通常優先度
}

function calculateNormalDeadline(applicationData: any): Date {
  return new Date(Date.now() + 5 * 24 * 60 * 60 * 1000); // 5日後
}

export function getProgressDataWithAccessControl(
  userId: string,
  applicationId: string,
  userRole: string
): {
  accessGranted: boolean;
  progressData: {
    currentStep: string;
    approverName: string;
    submissionDate: string;
    daysElapsed: number;
    nextAction: string;
  } | null;
  restrictionReason: string | null;
} {
  if (!userId) {
    throw new Error("利用者の識別情報が正しく設定されていません。再度ログインしてください。");
  }

  if (!applicationId) {
    throw new Error("指定された申請案件が見つかりません。案件番号を確認してください。");
  }

  const hasAccess = checkUserAccess(userId, applicationId, userRole);
  
  if (!hasAccess) {
    return {
      accessGranted: false,
      progressData: null,
      restrictionReason: "アクセス権限がありません"
    };
  }

  const progressData = fetchProgressData(applicationId);
  
  return {
    accessGranted: true,
    progressData: progressData,
    restrictionReason: null
  };
}

function checkUserAccess(userId: string, applicationId: string, userRole: string): boolean {
  // 実際の実装では権限チェックロジック
  return userRole === "manager" || userRole === "admin";
}

function fetchProgressData(applicationId: string): {
  currentStep: string;
  approverName: string;
  submissionDate: string;
  daysElapsed: number;
  nextAction: string;
} {
  return {
    currentStep: "部長承認待ち",
    approverName: "田中部長",
    submissionDate: "2024-03-01",
    daysElapsed: 3,
    nextAction: "承認者による判定"
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
  stagnationThresholds: { normal: number; subsidyRelated: number; urgent: number },
  currentDate: Date
): Array<{
  applicationId: string;
  stagnantDays: number