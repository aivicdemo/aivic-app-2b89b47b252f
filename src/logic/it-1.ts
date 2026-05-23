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
  const validTypes = ["補助金申請", "設備申請", "人事申請", "予算申請", "研究申請"];
  return validTypes.includes(applicationType);
}

function isValidDepartment(department: string): boolean {
  const validDepartments = ["総務課", "財務課", "学務課", "研究推進課", "情報システム課"];
  return validDepartments.includes(department);
}

function isValidUrgencyLevel(urgencyLevel: string): boolean {
  const validLevels = ["通常", "急ぎ", "至急"];
  return validLevels.includes(urgencyLevel);
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
  }
  if (!isPeriodValid) {
    validationErrors.push("実施期間が不正です");
  }
  
  if (applicationAmount > budgetLimit.maxAmount * 1.5) {
    console.warn("申請金額が大幅に予算上限を超過しています。金額を見直してください");
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
  if (title.includes("科研費") || title.includes("研究")) {
    return "研究費申請書";
  }
  if (title.includes("設備") || title.includes("機器")) {
    return "設備導入申請書";
  }
  if (title.includes("補助金")) {
    return "補助金申請書";
  }
  return "一般申請書";
}

function isMoeRequiredPaperStorage(documentType: string): boolean {
  const moeRequiredTypes = ["補助金申請書", "研究費申請書", "設備導入申請書"];
  return moeRequiredTypes.includes(documentType);
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
  const researchDepts = ["研究推進課", "学術研究院", "研究支援課"];
  return researchDepts.includes(department);
}

function classifyDocumentType(title: string, content: string): string {
  const text = (title + " " + content).toLowerCase();
  
  if (text.includes("補助金") || text.includes("助成金")) {
    return "補助金申請書";
  }
  if (text.includes("研究費") || text.includes("科研費")) {
    return "研究費申請書";
  }
  if (text.includes("設備") || text.includes("機器購入")) {
    return "設備導入申請書";
  }
  return "一般申請書";
}

function isMoeStorageRequirement(documentType: string): boolean {
  const moeTypes = ["補助金申請書", "研究費申請書", "設備導入申請書"];
  return moeTypes.includes(documentType);
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
  const moeKeywords = ["文部科学省", "科研費", "運営費交付金", "補助金", "研究費", "設備整備費"];
  const text = (title + " " + content).toLowerCase();
  let score = 0;
  
  for (const keyword of moeKeywords) {
    if (text.includes(keyword.toLowerCase())) {
      score += 1;
    }
  }
  
  return score / moeKeywords.length;
}

function checkResearchDepartment(department: string): boolean {
  const researchDepts = ["研究推進課", "学術研究院", "研究支援課", "理学部", "工学部"];
  return researchDepts.includes(department);
}

function requiresPaperStorage(documentType: string): boolean {
  const paperRequiredTypes = ["補助金申請書", "研究費申請書", "設備導入申請書"];
  return paperRequiredTypes.includes(documentType);
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
  
  if (!applicantDepartment) {
    throw new Error("承認ルート設定のため、所属部署を入力してください");
  }
  
  if (applicationAmount > 100000000) {
    console.warn("高額申請のため、理事会での特別承認が必要になる可能性があります");
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
  const approverMap: { [key: string]: string[] } = {
    "課長承認": [`${department}課長`],
    "部長承認": [`${department}部長`, `${department}課長`],
    "理事承認": ["理事", `${department}部長`, `${department}課長`]
  };
  
  return approverMap[level] || [`${department}課長`];
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
  if (submissionDate > new Date()) {
    throw new Error("提出日は現在日時以前である必要があります");
  }
  
  const validUrgencyLevels = ["高", "標準", "低"];
  if (!validUrgencyLevels.includes(urgencyLevel)) {
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

function addBusinessDays(startDate: Date, days: number): Date {
  const result = new Date(startDate);
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

export function processUrgentApplicationPriority(
  applicationData: { approvalRoute: string[]; createdAt: Date; priority: string },
  urgencyFlag: boolean,
  deadlineDate: Date,
  currentApprovalQueue: any[]
): { priorityLevel: number; queuePosition: number; notificationTargets: string[]; processingDeadline: Date } {
  if (!applicationData.approvalRoute || applicationData.approvalRoute.length === 0) {
    throw new Error("緊急案件の処理には最低一人の承認者が必要です");
  }
  
  if (deadlineDate < new Date()) {
    throw new Error("提出期限は現在日時より未来の日付を設定してください");
  }
  
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
  return approvalRoute.length > 0 ? [approvalRoute[0]] : [];
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

export function handleSystemFailureAlternativeProcess(
  systemStatus: string,
  failureType: string,
  documentType: string,
  urgencyLevel: number
): AlternativeProcessResult {
  if (!systemStatus) {
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
    "system_failure": 240,
    "network_issue": 120,
    "database_error": 180,
    "hardware_failure": 480
  };
  
  return recoveryTimes[failureType] || 180;
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
  // 実際の実装では DB から取得
  return "dept001";
}

function getApplicationDepartment(applicationId: string): string {
  // 実際の実装では DB から取得
  return "dept001";
}

export function getProgressDataWithAccessControl(
  userId: string,
  applicationId: string,
  userRole: string
): { accessGranted: boolean; progressData: { currentStep: string; approverName: string; submissionDate: string; daysElapsed: number; nextAction: string } | null; restrictionReason: string | null } {
  if (!userId) {
    throw new Error("利用者の識別情報が正しく設定されていません。再度ログインしてください。");
  }
  
  if (!applicationId) {
    throw new Error("指定された申請案件が見つかりません。案件番号を確認してください。");
  }
  
  const hasAccess = checkUserAccess(userId, applicationId, userRole);
  if (!hasAccess) {
    return { accessGranted: false, progressData: null, restrictionReason: "アクセス権限がありません" };
  }
  
  const progressData = fetchProgressData(applicationId);
  return { accessGranted: true, progressData: progressData, restrictionReason: null };
}

function checkUserAccess(userId: string, applicationId: string, userRole: string): boolean {
  // 実際の実装では権限チェックロジック
  return true;
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

export function identifyStagnantApplications(
  applicationStatuses: Array<{applicationId: string, currentStage: string, stageStartDate: Date, documentType: string, isSubsidyRelated: boolean}>,
  stagnationThresholds: {normal: number, subsidyRelated: number, urgent: number},
  currentDate: Date
): Array<{applicationId: string, stagnantDays: number, thresholdExceeded: number, urgencyLevel: 'low' | 'medium' | 'high', recommendedAction: string}> {
  if (stagnationThresholds.normal <= 0 || stagnationThresholds.subsidyRelated <= 0) {
    throw new Error("滞留基準日数は1日以上で設定してください。");
  }
  
  if (application