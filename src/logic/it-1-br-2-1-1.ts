```typescript
// SIG-PLAN:
// - 関数名: validateApplicationInput
//   呼び出し例 (テスト中): validateApplicationInput("大学設備更新申請について", "研究設備の老朽化に伴い...", "設備申請", "研究推進部", "通常")
//   await されてる?: いいえ
//   アクセスされるプロパティ: result.isValid, result.errors
//   → 結論: function validateApplicationInput(documentTitle: string, documentContent: string, applicationType: string, applicantDepartment: string, urgencyLevel: string): { isValid: boolean; errors: string[]; warnings: string[] }
//
// - 関数名: classifyDocumentTypeAndRoute
//   呼び出し例 (テスト中): classifyDocumentTypeAndRoute("科研費申請に関する設備導入申請書", "文部科学省の科研費制度に基づく...", "研究推進部")
//   await されてる?: いいえ
//   アクセスされるプロパティ: result.subsidyRelated, result.paperStorageRequired, result.processingRoute
//   → 結論: function classifyDocumentTypeAndRoute(documentTitle: string, documentContent: string, applicantDepartment: string): { documentType: string; processingRoute: string; subsidyRelated: boolean; paperStorageRequired: boolean }
//
// - 関数名: classifyDocumentType
//   呼び出し例 (テスト中): classifyDocumentType("科研費基盤研究申請書", "文部科学省科学研究費助成事業における...", "補助金申請")
//   await されてる?: いいえ
//   アクセスされるプロパティ: result.subsidyRelated, result.documentType, result.processingRoute
//   → 結論: function classifyDocumentType(documentTitle: string, documentContent: string, applicationType: string): { documentType: string; processingRoute: string; subsidyRelated: boolean; paperStorageRequired: boolean }
//
// - 関数名: evaluateSubsidyRelevance
//   呼び出し例 (テスト中): evaluateSubsidyRelevance("運営費交付金による設備整備費申請", "文部科学省運営費交付金制度を活用した...", "補助金申請書")
//   await されてる?: いいえ
//   アクセスされるプロパティ: result.subsidyRelevanceScore, result.subsidyRelated, result.paperStorageRequired, result.processingRoute
//   → 結論: function evaluateSubsidyRelevance(documentTitle: string, documentContent: string, documentType: string): { subsidyRelevanceScore: number; subsidyRelated: boolean; moeRequirement: boolean; paperStorageRequired: boolean; processingRoute: string }
//
// - 関数名: determineDigitalizationEligibility
//   呼び出し例 (テスト中): determineDigitalizationEligibility("科研費研究実績報告書", "文部科学省科学研究費補助金による...", "補助金申請書", 85)
//   await されてる?: いいえ
//   アクセスされるプロパティ: result.subsidyRelated, result.paperStorageRequired, result.processingRoute
//   → 結論: function determineDigitalizationEligibility(documentTitle: string, documentContent: string, documentType: string, subsidyRelevanceScore: number): { documentType: string; processingRoute: string; subsidyRelated: boolean; paperStorageRequired: boolean }

function isValidApplicationType(applicationType: string): boolean {
  const validTypes = ["補助金申請", "設備申請", "人事申請", "旅費申請", "研究費申請", "物品購入申請"];
  return validTypes.includes(applicationType);
}

function isValidDepartment(department: string): boolean {
  const validDepartments = ["研究推進部", "総務部", "財務部", "学務部", "情報システム課", "広報課"];
  return validDepartments.includes(department);
}

function isValidUrgencyLevel(urgencyLevel: string): boolean {
  const validLevels = ["通常", "急ぎ", "至急", "緊急"];
  return validLevels.includes(urgencyLevel);
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

  if (!documentTitle) {
    throw new Error("申請書類のタイトルは必須項目です。入力してください。");
  }

  if (!documentContent || documentContent.length < 50) {
    throw new Error("申請内容は50文字以上で詳しく記載してください。");
  }

  if (!applicationType) {
    throw new Error("申請種別を選択してください。");
  }

  if (!applicantDepartment) {
    throw new Error("所属部署を入力してください。");
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
    throw new Error("文書種別に対応する予算制限が見つかりません");
  }

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

function calculateSubsidyKeywordMatch(documentTitle: string, documentContent: string): number {
  const subsidyKeywords = ["科研費", "運営費交付金", "設備整備費", "補助金", "助成金", "文部科学省"];
  const text = (documentTitle + " " + documentContent).toLowerCase();
  let matchCount = 0;
  
  for (const keyword of subsidyKeywords) {
    if (text.includes(keyword.toLowerCase())) {
      matchCount++;
    }
  }
  
  return matchCount / subsidyKeywords.length;
}

function checkResearchDepartment(department: string): boolean {
  const researchDepartments = ["研究推進部", "学術研究院", "研究支援課"];
  return researchDepartments.includes(department);
}

function isMoeRequirement(documentType: string): boolean {
  const moeRequiredTypes = ["補助金申請書", "事業報告書", "会計報告書", "監査資料"];
  return moeRequiredTypes.includes(documentType);
}

export function classifyDocumentTypeAndRoute(
  documentTitle: string,
  documentContent: string,
  applicantDepartment: string
): { documentType: string; processingRoute: string; subsidyRelated: boolean; paperStorageRequired: boolean } {
  const keywordScore = calculateSubsidyKeywordMatch(documentTitle, documentContent);
  const isResearchDept = checkResearchDepartment(applicantDepartment);
  const threshold = isResearchDept ? 0.6 : 0.7;
  const subsidyRelated = keywordScore >= threshold;
  
  let documentType = "一般申請";
  if (subsidyRelated) {
    documentType = "補助金申請";
  }
  
  const paperStorageRequired = subsidyRelated && isMoeRequirement(documentType);
  const processingRoute = paperStorageRequired ? "hybrid" : "electronic";
  
  return { documentType, processingRoute, subsidyRelated, paperStorageRequired };
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

function checkMoeRequirement(documentTitle: string, applicantDepartment: string): boolean {
  const moeKeywords = ["補助金", "科研費", "文部科学省"];
  const hasKeywords = moeKeywords.some(keyword => documentTitle.includes(keyword));
  return hasKeywords && checkResearchDepartment(applicantDepartment);
}

function determineDocumentCategory(documentTitle: string, applicantDepartment: string, subsidyRelated: boolean): string {
  if (subsidyRelated) {
    return "補助金申請";
  }
  if (documentTitle.includes("人事") || applicantDepartment === "総務部") {
    return "人事関連";
  }
  return "一般申請";
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

  const keywordScore = calculateSubsidyKeywordMatch(documentTitle, documentContent);
  const departmentBonus = checkResearchDepartment(applicantDepartment) ? 0.1 : 0.0;
  const adjustedScore = keywordScore + departmentBonus;
  const subsidyRelated = adjustedScore >= 0.7 || (checkResearchDepartment(applicantDepartment) && adjustedScore >= 0.6);
  const documentType = classifyDocumentType(documentTitle, documentContent, "補助金申請").documentType;
  const paperStorageRequired = subsidyRelated && isMoeRequirement(documentType);
  const processingRoute = paperStorageRequired ? "hybrid" : "electronic";
  
  return { documentType, processingRoute, subsidyRelated, paperStorageRequired };
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
  return approvalRoute || [];
}

function getNextApprover(approvalRoute: string[]): string[] {
  return approvalRoute.slice(0, 1) || [];
}

function calculateNormalPriority(applicationData: { priority: string }): number {
  switch (applicationData.priority) {
    case "high": return 2;
    case "medium": return 3;
    default: return 4;
  }
}

function calculateNormalDeadline(applicationData: { createdAt: Date }): Date {
  return new Date(applicationData.createdAt.getTime() + 7 * 24 * 60 * 60 * 1000);
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

export function determineProcessingRoute(
  documentType: string,
  subsidyRelatedScore: number,
  documentTitle: string,
  documentContent: string
): { documentType: string; processingRoute: string; subsidyRelated: boolean; paperStorageRequired: boolean; approvalFlow: string } {
  const subsidyRelated = subsidyRelatedScore >= 0.7;
  const moeRequiredTypes = ["補助金申請書", "研究費申請書", "設備導入申請書"];
  const paperStorageRequired = subsidyRelated && moeRequiredTypes.includes(documentType);
  const processingRoute = paperStorageRequired ? "hybrid" : "electronic";
  const approvalFlow = paperStorageRequired ? "special" : "standard";
  
  return { documentType, processingRoute, subsidyRelated, paperStorageRequired, approvalFlow };
}

export function checkComplianceAndDetermineRoute(
  documentTitle: string,
  documentContent: string,
  documentType: string,
  subsidyKeywords: string[]
): { documentType: string; processingRoute: string; subsidyRelated: boolean; paperStorageRequired: boolean; complianceStatus: string } {
  const keywordMatchScore = calculateKeywordMatch(documentTitle, documentContent, subsidyKeywords);
  const subsidyRelated = keywordMatchScore >= 0.7;
  const paperStorageRequired = checkMoeRequirement(documentType, []);
  const processingRoute = (subsidyRelated && paperStorageRequired) ? "hybrid" : "electronic";
  const complianceStatus = validateAllRequirements(documentType, subsidyRelated, paperStorageRequired) ? "compliant" : "requires_review";
  
  return { documentType, processingRoute, subsidyRelated, paperStorageRequired, complianceStatus };
}

function calculateKeywordMatch(documentTitle: string, documentContent: string, subsidyKeywords: string[]): number {
  const text = (documentTitle + " " + documentContent).toLowerCase();
  let matchCount = 0;
  
  for (const keyword of subsidyKeywords) {
    if (text.includes(keyword.toLowerCase())) {
      matchCount++;
    }
  }
  
  return matchCount / subsidyKeywords.length;
}

function validateAllRequirements(documentType: string, subsidyRelated: boolean, paperStorageRequired: boolean): boolean {
  return true; // 簡単な実装
}

export function handleDocumentClassificationException(
  documentTitle: string,
  documentContent: string,
  autoClassificationResult: string | null,
  staffObjection: string | null,
  managerDecision: string
): { finalDocumentType: string; processingRoute: string; exceptionReason: string; learningData: object } {
  if (autoClassificationResult == null || staffObjection != null) {
    const manualReview = true;
    const finalDocumentType = managerDecision;
    const processingRoute = determineProcessingRouteFromType(finalDocumentType);
    const exceptionReason = generateExceptionReason(autoClassificationResult, staffObjection);
    const learningData = createLearningData(documentTitle, documentContent, finalDocumentType, exceptionReason);
    return { finalDocumentType, processingRoute, exceptionReason, learningData };
  }
  
  return {
    finalDocumentType: autoClassificationResult,
    processingRoute: "electronic",
    exceptionReason: "正常処理",
    learningData: {}
  };
}

function determineProcessingRouteFromType(documentType: string): string {
  const hybridTypes = ["補助金申請書", "研究費申請書"];
  return hybridTypes.includes(documentType) ? "hybrid" : "electronic";
}

function generateExceptionReason(autoResult: string | null, objection: string | null): string {
  if (autoResult === null) return "自動分類失敗";
  if (objection !== null) return "職員異議申し立て: " + objection;
  return "例外処理";
}

function createLearningData(title: string, content: string, finalType: string, reason: string): object {
  return {
    title,
    content: content.substring(0, 100),
    finalType,
    reason,
    timestamp: new Date().toISOString()
  };
}

export function determineDocumentStorageMethod(
  documentTitle: string,
  documentContent: string,
  documentType: string,
  subsidyKeywords: string[]
): { documentType: string; processingRoute: string; subsidyRelated: boolean; paperStorageRequired: boolean } {
  const score = computeKeywordMatch(documentTitle, documentContent, subsidyKeywords);
  const subsidyRelated = score >= 0.7;
  const paperStorageRequired = subsidyRelated && isMoeRequirement(documentType);
  const processingRoute = paperStorageRequired ? "hybrid" : "electronic";
  
  return { documentType, processingRoute, subsidyRelated, paperStorageRequired };
}

function computeKeywordMatch(documentTitle: string, documentContent: string, subsidyKeywords: string[]): number {
  const text = (documentTitle + " " + documentContent).toLowerCase();
  let matchCount = 0;
  
  for (const keyword of subsidyKeywords) {
    if (text.includes(keyword.toLowerCase())) {
      matchCount++;
    }
  }
  
  return matchCount / subsidyKeywords.length;
}

export function classifyDocumentType(
  documentTitle: string,
  documentContent: string,
  applicationType: string
): { documentType: string; processingRoute: string; subsidyRelated: boolean; paperStorageRequired: boolean } {
  const subsidyKeywords = ["科研費", "運営費交付金", "設備整備費", "補助金"];
  const score = computeKeywordMatch(documentTitle + " " + documentContent, "", subsidyKeywords);
  const subsidyRelated = score >= 0.7;
  const paperStorageRequired = subsidyRelated && isMoeRequirement(applicationType);
  const processingRoute = paperStorageRequired ? "hybrid" : "electronic";
  const documentType = classifyByApplicationType(applicationType, subsidyRelated);
  
  return { documentType, processingRoute, subsidyRelated, paperStorageRequired };
}

function classifyByApplicationType(applicationType: string, subsidyRelated: boolean): string {
  if (subsidyRelated) return "補助金申請";
  if (applicationType.includes("人事")) return "人事関連";
  return applicationType;
}

export function evaluateSubsidyRelevance(
  documentTitle: string,
  documentContent: string,
  documentType: string
): { subsidyRelevanceScore: number; subsidyRelated: boolean; moeRequirement: boolean; paperStorageRequired: boolean; processingRoute: string } {
  const subsidyKeywords = ["研究費", "設備費", "運営費交付金", "補助金"];
  const keywordScore = calculateKeywordFrequency(documentTitle, documentContent, subsidyKeywords);
  const subsidyRelevanceScore = Math.min(keywordScore * 10, 100);
  const subsidyRelated = subsidyRelevanceScore >= 70;
  const moeRequirement = subsidyRelated && isMoeRegulatedDocumentType(documentType);
  const paperStorageRequired = moeRequirement;
  const processingRoute = paperStorageRequired ? "hybrid" : "electronic";
  
  return { subsidyRelevanceScore, subsidyRelated, moeRequirement, paperStorageRequired, processingRoute };
}

function calculateKeywordFrequency(documentTitle: string, documentContent: string, subsidyKeywords: string[]): number {
  const text = (documentTitle + " " + documentContent).toLowerCase();
  let totalMatches = 0;
  
  for (const keyword of subsidyKeywords) {
    const regex = new RegExp(keyword.toLowerCase(), 'g');
    const matches = text.match(regex);
    if (matches) {
      totalMatches += matches.length;
    }
  }
  
  return totalMatches;
}

function isMoeRegulatedDocumentType(documentType: string): boolean {
  const regulatedTypes = ["補助金申請書", "研究費申請書", "設備導入申請書"];
  return regulatedTypes.includes(documentType);
}

export function determineDigitalizationEligibility(
  documentTitle: string,
  documentContent: string,
  documentType: string,
  subsidyRelevanceScore: number
): { documentType: string; processingRoute: string; subsidyRelated: boolean; paperStorageRequired: boolean } {
  if (!documentTitle) {
    throw new Error("申請書類のタイトルが入力されていません。タイトルを入力してください。");
  }

  const subsidyRelated = subsidyRelevanceScore >= 70;
  const moeRequiredTypes = ["補助金申請書", "事業報告書", "会計報告書", "監査資料"];
  const paperStorageRequired = subsidyRelated && moeRequiredTypes.includes(documentType);
  const processingRoute = paperStorageRequired ? "hybrid" : "electronic";
  
  return { documentType, processingRoute, subsidyRelated, paperStorageRequired };
}

// 他の必要な関数のスタブ実装
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

function getApproversByLevel(approvalLevel: string, department: string): string[] {
  return [approvalLevel + "_" + department];
}

export function handleSystemFailureAlternativeProcess(
  systemStatus: string,
  failureType: string,
  documentType: string,
  urgencyLevel: number
): { alternativeProcess: string; notificationTargets: string[]; dataRecoveryPlan: string; estimatedRecoveryTime: number } {
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

function calculateRecoveryTime(failureType: string): number {
  switch (failureType) {
    case "database_connection": return 2;
    case "api_timeout": return 1;
    default: return 4;
  }
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