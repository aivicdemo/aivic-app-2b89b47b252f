```typescript
// SIG-PLAN:
// - 関数名: validateApplicationInput
//   呼び出し例 (テスト中): validateApplicationInput("科研費基盤研究申請書について", "科学研究費助成事業における基盤研究の申請を行います。研究目的は新材料開発であり、5年間の研究計画を策定しています。", "補助金申請", "工学研究科", "通常")
//   await されてる?: いいえ
//   アクセスされるプロパティ: result.isValid, result.errors
//   → 結論: function validateApplicationInput(documentTitle: string, documentContent: string, applicationType: string, applicantDepartment: string, urgencyLevel: string): { isValid: boolean; errors: string[]; warnings: string[] }
//
// - 関数名: classifyDocumentTypeAndRoute
//   呼び出し例 (テスト中): classifyDocumentTypeAndRoute("科研費基盤研究申請書", "科学研究費助成事業の基盤研究申請です。運営費交付金を活用した研究設備整備費の申請を行います。", "理学部")
//   await されてる?: いいえ
//   アクセスされるプロパティ: result.subsidyRelated, result.paperStorageRequired, result.processingRoute
//   → 結論: function classifyDocumentTypeAndRoute(documentTitle: string, documentContent: string, applicantDepartment: string): { documentType: string; processingRoute: string; subsidyRelated: boolean; paperStorageRequired: boolean; }
//
// - 関数名: determineDocumentStorageMethod
//   呼び出し例 (テスト中): determineDocumentStorageMethod("補助金会計報告書", "文部科学省補助金の会計報告書です。収支決算と監査結果を報告します。", "会計報告書", ["補助金", "会計報告", "監査資料"])
//   await されてる?: いいえ
//   アクセスされるプロパティ: result.subsidyRelated, result.paperStorageRequired, result.processingRoute
//   → 結論: function determineDocumentStorageMethod(documentTitle: string, documentContent: string, documentType: string, subsidyKeywords: string[]): { documentType: string; processingRoute: string; subsidyRelated: boolean; paperStorageRequired: boolean; }
//
// - 関数名: classifyDocumentType
//   呼び出し例 (テスト中): classifyDocumentType("科研費申請書", "科学研究費助成事業の申請を行います。基盤研究での研究計画書です。", "補助金申請")
//   await されてる?: いいえ
//   アクセスされるプロパティ: result.documentType, result.subsidyRelated, result.paperStorageRequired, result.processingRoute
//   → 結論: function classifyDocumentType(documentTitle: string, documentContent: string, applicationType: string): { documentType: string; processingRoute: string; subsidyRelated: boolean; paperStorageRequired: boolean; }
//
// - 関数名: determineDigitalizationEligibility
//   呼び出し例 (テスト中): determineDigitalizationEligibility("科研費実績報告書", "科学研究費助成事業の実績報告書です。研究成果と経費使用実績を報告します。", "補助金申請書", 85)
//   await されてる?: いいえ
//   アクセスされるプロパティ: result.subsidyRelated, result.paperStorageRequired, result.processingRoute
//   → 結論: function determineDigitalizationEligibility(documentTitle: string, documentContent: string, documentType: string, subsidyRelevanceScore: number): { documentType: string; processingRoute: string; subsidyRelated: boolean; paperStorageRequired: boolean; }

// 補助金関連キーワードの判定
function calculateSubsidyKeywordMatch(documentTitle: string, documentContent: string): number {
  const subsidyKeywords = ["科研費", "運営費交付金", "設備整備費", "補助金", "助成金", "文部科学省", "研究費"];
  const text = (documentTitle + " " + documentContent).toLowerCase();
  let matchCount = 0;
  
  for (const keyword of subsidyKeywords) {
    if (text.includes(keyword.toLowerCase())) {
      matchCount++;
    }
  }
  
  return matchCount / subsidyKeywords.length;
}

// 文部科学省要件チェック
function isMoeRequirement(documentType: string): boolean {
  const moeRequiredTypes = ["補助金申請書", "事業報告書", "会計報告書", "監査資料", "実績報告書"];
  return moeRequiredTypes.includes(documentType);
}

// 研究部署判定
function isResearchDepartment(department: string): boolean {
  const researchDepts = ["理学部", "工学部", "医学部", "農学部", "工学研究科", "理学研究科"];
  return researchDepts.some(dept => department.includes(dept));
}

// 申請種別の妥当性チェック
function isValidApplicationType(applicationType: string): boolean {
  const validTypes = ["補助金申請", "設備申請", "人事申請", "旅費申請", "一般申請"];
  return validTypes.includes(applicationType);
}

// 部署の妥当性チェック
function isValidDepartment(department: string): boolean {
  return department && department.length > 0;
}

// 緊急度の妥当性チェック
function isValidUrgencyLevel(urgencyLevel: string): boolean {
  const validLevels = ["高", "通常", "低"];
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
  
  const isValid = errors.length === 0;
  
  return { isValid, errors, warnings };
}

export function validateApplicationAmountAndPeriod(
  applicationAmount: number,
  implementationStartDate: string,
  implementationEndDate: string,
  documentType: string,
  budgetLimits: { [key: string]: { minAmount: number; maxAmount: number } }
): { isAmountValid: boolean; isPeriodValid: boolean; validationErrors: string[]; canProceed: boolean } {
  const budgetLimit = budgetLimits[documentType] || { minAmount: 0, maxAmount: 100000000 };
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

export function classifyDocumentTypeAndRoute(
  documentTitle: string,
  documentContent: string,
  applicantDepartment: string
): { documentType: string; processingRoute: string; subsidyRelated: boolean; paperStorageRequired: boolean; } {
  const keywordScore = calculateSubsidyKeywordMatch(documentTitle, documentContent);
  const isResearchDept = isResearchDepartment(applicantDepartment);
  const threshold = isResearchDept ? 0.6 : 0.7;
  const subsidyRelated = keywordScore >= threshold;
  
  let documentType = "一般申請";
  if (subsidyRelated) {
    if (documentTitle.includes("科研費") || documentContent.includes("科学研究費")) {
      documentType = "補助金申請";
    } else if (documentTitle.includes("設備") || documentContent.includes("設備整備")) {
      documentType = "設備申請";
    } else {
      documentType = "補助金申請";
    }
  }
  
  const paperStorageRequired = subsidyRelated && isMoeRequirement(documentType);
  const processingRoute = paperStorageRequired ? "hybrid" : "electronic";
  
  return { documentType, processingRoute, subsidyRelated, paperStorageRequired };
}

export function determineDocumentTypeAndRoute(
  documentTitle: string,
  documentContent: string,
  applicantDepartment: string
): { documentType: string; processingRoute: string; subsidyRelated: boolean; paperStorageRequired: boolean; } {
  const keywordScore = calculateSubsidyKeywordMatch(documentTitle, documentContent);
  const subsidyRelated = keywordScore >= 0.7;
  const paperStorageRequired = subsidyRelated && checkMoeRequirement(documentTitle, applicantDepartment);
  const processingRoute = paperStorageRequired ? "hybrid" : "electronic";
  const documentType = determineDocumentCategory(documentTitle, applicantDepartment, subsidyRelated);
  
  return { documentType, processingRoute, subsidyRelated, paperStorageRequired };
}

function checkMoeRequirement(documentTitle: string, applicantDepartment: string): boolean {
  return documentTitle.includes("補助金") || documentTitle.includes("科研費") || isResearchDepartment(applicantDepartment);
}

function determineDocumentCategory(documentTitle: string, applicantDepartment: string, subsidyRelated: boolean): string {
  if (subsidyRelated) {
    return "補助金申請";
  }
  if (documentTitle.includes("人事")) {
    return "人事関連";
  }
  return "一般申請";
}

export function checkMoeComplianceRequirements(
  documentTitle: string,
  documentContent: string,
  applicantDepartment: string
): { documentType: string; processingRoute: string; subsidyRelated: boolean; paperStorageRequired: boolean; } {
  const keywordScore = calculateSubsidyKeywordMatch(documentTitle, documentContent);
  const departmentBonus = isResearchDepartment(applicantDepartment) ? 0.1 : 0.0;
  const adjustedScore = keywordScore + departmentBonus;
  const subsidyRelated = adjustedScore >= 0.7 || (isResearchDepartment(applicantDepartment) && adjustedScore >= 0.6);
  const documentType = classifyDocumentType(documentTitle, documentContent, "補助金申請").documentType;
  const paperStorageRequired = subsidyRelated && isMoeStorageRequirement(documentType);
  const processingRoute = paperStorageRequired ? "hybrid" : "electronic";
  
  return { documentType, processingRoute, subsidyRelated, paperStorageRequired };
}

function isMoeStorageRequirement(documentType: string): boolean {
  return isMoeRequirement(documentType);
}

export function setApprovalDeadline(
  documentType: string,
  subsidyRelated: boolean,
  urgencyLevel: string,
  submissionDate: Date
): { deadlineDate: Date; businessDays: number; notificationSchedule: string[] } {
  let baseDays = subsidyRelated ? 5 : 3;
  if (urgencyLevel === "高") {
    baseDays = Math.floor(baseDays / 2);
  } else if (urgencyLevel === "低") {
    baseDays = Math.floor(baseDays * 1.5);
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
    const dayOfWeek = result.getDay();
    if (dayOfWeek !== 0 && dayOfWeek !== 6) { // 土日を除く
      addedDays++;
    }
  }
  
  return result;
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

export function determinePriorityForApprovalNotification(
  documentTitle: string,
  documentType: string,
  submissionDate: Date,
  deadline: Date | null,
  subsidyRelated: boolean
): { priority: 'high' | 'normal' | 'low'; notificationTiming: 'immediate' | 'scheduled'; urgencyReason: string } {
  const currentDate = new Date();
  const daysUntilDeadline = deadline ? (deadline.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24) : null;
  const hasUrgentKeywords = /緊急|至急|重要/.test(documentTitle);
  
  let priority: 'high' | 'normal' | 'low' = 'low';
  let urgencyReason = '通常の申請案件';
  
  if (daysUntilDeadline !== null && daysUntilDeadline <= 3) {
    priority = 'high';
    urgencyReason = '期限まで3日以内';
  } else if (subsidyRelated) {
    priority = 'high';
    urgencyReason = '補助金関連申請';
  } else if (hasUrgentKeywords) {
    priority = 'high';
    urgencyReason = 'タイトルに緊急キーワード含有';
  } else if (daysUntilDeadline !== null && daysUntilDeadline <= 7) {
    priority = 'normal';
    urgencyReason = '期限まで1週間以内';
  }
  
  const notificationTiming = priority === 'high' ? 'immediate' : 'scheduled';
  
  return { priority, notificationTiming, urgencyReason };
}

export function determineDocumentProcessingRoute(
  documentTitle: string,
  documentContent: string,
  documentType: string
): { documentType: string; processingRoute: 'electronic' | 'hybrid'; subsidyRelated: boolean; paperStorageRequired: boolean; } {
  const subsidyKeywords = ["補助金", "助成金", "文部科学省", "科研費", "研究費"];
  const score = computeKeywordMatch(documentTitle, documentContent, subsidyKeywords);
  const subsidyRelated = score >= 0.7;
  const paperStorageRequired = subsidyRelated && isMoeRequirement(documentType);
  const processingRoute = paperStorageRequired ? "hybrid" : "electronic";
  
  return { documentType, processingRoute, subsidyRelated, paperStorageRequired };
}

function computeKeywordMatch(documentTitle: string, documentContent: string, keywords: string[]): number {
  const text = (documentTitle + " " + documentContent).toLowerCase();
  let matchCount = 0;
  
  for (const keyword of keywords) {
    if (text.includes(keyword.toLowerCase())) {
      matchCount++;
    }
  }
  
  return matchCount / keywords.length;
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
  return computeKeywordMatch(documentTitle, documentContent, subsidyKeywords);
}

function validateAllRequirements(documentType: string, subsidyRelated: boolean, paperStorageRequired: boolean): boolean {
  if (subsidyRelated && !paperStorageRequired) {
    return false; // 補助金関連で紙保管が必要なのに設定されていない
  }
  return true;
}

export function determineDocumentStorageMethod(
  documentTitle: string,
  documentContent: string,
  documentType: string,
  subsidyKeywords: string[]
): { documentType: string; processingRoute: string; subsidyRelated: boolean; paperStorageRequired: boolean; } {
  const score = computeKeywordMatch(documentTitle, documentContent, subsidyKeywords);
  const subsidyRelated = score >= 0.7;
  const paperStorageRequired = subsidyRelated && isMoeRequirement(documentType);
  const processingRoute = paperStorageRequired ? "hybrid" : "electronic";
  
  return { documentType, processingRoute, subsidyRelated, paperStorageRequired };
}

export function classifyDocumentType(
  documentTitle: string,
  documentContent: string,
  applicationType: string
): { documentType: string; processingRoute: string; subsidyRelated: boolean; paperStorageRequired: boolean; } {
  const subsidyKeywords = ["科研費", "運営費交付金", "設備整備費", "補助金"];
  const score = computeKeywordMatch(documentTitle + " " + documentContent, "", subsidyKeywords);
  const subsidyRelated = score >= 0.7;
  const paperStorageRequired = subsidyRelated && isMoeRequirement(applicationType);
  const processingRoute = paperStorageRequired ? "hybrid" : "electronic";
  const documentType = classifyByApplicationType(applicationType, subsidyRelated);
  
  return { documentType, processingRoute, subsidyRelated, paperStorageRequired };
}

function classifyByApplicationType(applicationType: string, subsidyRelated: boolean): string {
  if (subsidyRelated) {
    return "補助金申請";
  }
  return applicationType || "一般申請";
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
): { documentType: string; processingRoute: string; subsidyRelated: boolean; paperStorageRequired: boolean; } {
  const subsidyRelated = subsidyRelevanceScore >= 70;
  const moeRequiredTypes = ["補助金申請書", "事業報告書", "会計報告書", "監査資料"];
  const paperStorageRequired = subsidyRelated && moeRequiredTypes.includes(documentType);
  const processingRoute = paperStorageRequired ? "hybrid" : "electronic";
  
  return { documentType, processingRoute, subsidyRelated, paperStorageRequired };
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

// 以下、その他の必要な関数（テストで直接呼ばれていないが、上記関数から参照される可能性があるもの）

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

function getApproversByLevel(approvalLevel: string, applicantDepartment: string): string[] {
  // 実装例：部署と承認レベルに基づいて承認者を返す
  return [`${approvalLevel}_${applicantDepartment}`];
}

export function processUrgentApplicationPriority(
  applicationData: any,
  urgencyFlag: boolean,
  deadlineDate: Date,
  currentApprovalQueue: any[]
): { priorityLevel: number; queuePosition: number; notificationTargets: any[]; processingDeadline: Date } {
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

function getAllApprovers(approvalRoute: any): any[] {
  return approvalRoute || [];
}

function getNextApprover(approvalRoute: any): any[] {
  return approvalRoute ? [approvalRoute[0]] : [];
}

function calculateNormalPriority(applicationData: any): number {
  return 3; // デフォルト優先度
}

function calculateNormalDeadline(applicationData: any): Date {
  return new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7日後
}

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
  const recoveryT