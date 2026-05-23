```typescript
// SIG-PLAN:
// - 関数名: determineApprovalHierarchy
//   呼び出し例 (テスト中): determineApprovalHierarchy(500000, "一般申請", "総務課")
//                        determineApprovalHierarchy(100000000, "補助金申請", "研究課")
//                        determineApprovalHierarchy(1000000, "補助金申請", "研究課")
//                        determineApprovalHierarchy(50000, "物品購入", "事務課")
//                        determineApprovalHierarchy(50000000, "設備申請", "研究課")
//   await されてる?: いいえ
//   アクセスされるプロパティ: r.approvalLevel, r.estimatedDays, r.requiresPaperApproval, r.approvers.length, r.approvers
//   → 結論: function determineApprovalHierarchy(applicationAmount: number, documentType: string, applicantDepartment: string): ApprovalHierarchyResult
//   → ApprovalHierarchyResult = { approvalLevel: string; estimatedDays: number; requiresPaperApproval: boolean; approvers: string[] }
//
// - 関数名: determineApprovalAuthority
//   呼び出し例 (テスト中): determineApprovalAuthority("不明な職位", 100000, "一般申請", "approve")
//                        determineApprovalAuthority("課長", 200000, "物品購入", "approve")
//                        determineApprovalAuthority("係長", 5000000, "補助金申請", "approve")
//                        determineApprovalAuthority("", 100000, "一般申請", "approve")
//   await されてる?: いいえ
//   アクセスされるプロパティ: r.hasAuthority, r.requiredPosition, r.processingRoute, r.nextApprover
//   → 結論: function determineApprovalAuthority(approverPosition: string, applicationAmount: number, applicationType: string, approvalAction: string): ApprovalAuthorityResult
//   → ApprovalAuthorityResult = { hasAuthority: boolean; requiredPosition: string; nextApprover: string | null; processingRoute: string }
//
// - 関数名: determineNextApprover
//   呼び出し例 (テスト中): determineNextApprover("補助金申請書", "研究開発の予算申請", "課長", "approve")
//                        determineNextApprover("一般申請書", "物品購入申請", "部長", "reject")
//                        determineNextApprover("", "申請内容", "課長", "approve")
//   await されてる?: いいえ
//   アクセスされるプロパティ: r.nextApprover, r.processingRoute, r.isSubsidyRelated
//   → 結論: function determineNextApprover(documentTitle: string, documentContent: string, currentApproverRole: string, approvalDecision: string): NextApproverResult
//   → NextApproverResult = { nextApprover: string | null; processingRoute: string; isSubsidyRelated: boolean; requiresPaperStorage: boolean }

interface ApprovalHierarchyResult {
  approvalLevel: string;
  approvers: string[];
  estimatedDays: number;
  requiresPaperApproval: boolean;
}

interface ApprovalAuthorityResult {
  hasAuthority: boolean;
  requiredPosition: string;
  nextApprover: string | null;
  processingRoute: string;
}

interface NextApproverResult {
  nextApprover: string | null;
  processingRoute: string;
  isSubsidyRelated: boolean;
  requiresPaperStorage: boolean;
}

function getApproversByLevel(approvalLevel: string, applicantDepartment: string): string[] {
  const approvers: string[] = [];
  
  if (approvalLevel === "課長承認") {
    approvers.push("課長");
  } else if (approvalLevel === "部長承認") {
    approvers.push("課長", "部長");
  } else if (approvalLevel === "理事承認") {
    approvers.push("課長", "部長", "理事");
  }
  
  return approvers;
}

function checkAuthorityLevel(approverPosition: string, requiredPosition: string): boolean {
  const hierarchy = ["係長", "課長", "部長", "理事", "学長"];
  const approverIndex = hierarchy.indexOf(approverPosition);
  const requiredIndex = hierarchy.indexOf(requiredPosition);
  
  if (approverIndex === -1 || requiredIndex === -1) {
    return false;
  }
  
  return approverIndex >= requiredIndex;
}

function determineRequiredPosition(applicationType: string, applicationAmount: number): string {
  if (applicationType.includes("補助金")) {
    if (applicationAmount >= 1000000) {
      return "理事";
    } else {
      return "部長";
    }
  } else {
    if (applicationAmount < 100000) {
      return "課長";
    } else if (applicationAmount < 1000000) {
      return "部長";
    } else {
      return "理事";
    }
  }
}

function findNextApprover(requiredPosition: string): string {
  const hierarchy = ["課長", "部長", "理事", "学長"];
  const requiredIndex = hierarchy.indexOf(requiredPosition);
  
  if (requiredIndex !== -1 && requiredIndex < hierarchy.length - 1) {
    return hierarchy[requiredIndex + 1];
  }
  
  return "学長";
}

function analyzeSubsidyKeywords(documentTitle: string, documentContent: string): number {
  const subsidyKeywords = ["補助金", "助成金", "科研費", "運営費交付金", "設備整備費", "研究費", "文部科学省"];
  const text = (documentTitle + " " + documentContent).toLowerCase();
  
  let matchCount = 0;
  for (const keyword of subsidyKeywords) {
    if (text.includes(keyword.toLowerCase())) {
      matchCount++;
    }
  }
  
  return matchCount / subsidyKeywords.length;
}

function checkMoeRequirements(documentTitle: string): boolean {
  const moeRequiredKeywords = ["補助金", "科研費", "運営費交付金"];
  const title = documentTitle.toLowerCase();
  
  return moeRequiredKeywords.some(keyword => title.includes(keyword.toLowerCase()));
}

export function determineApprovalHierarchy(
  applicationAmount: number,
  documentType: string,
  applicantDepartment: string
): ApprovalHierarchyResult {
  if (applicationAmount <= 0) {
    throw new Error("申請金額は1円以上で入力してください");
  }
  
  if (applicationAmount > 100000000) {
    throw new Error("高額申請のため、理事会での特別承認が必要になる可能性があります");
  }
  
  if (!applicantDepartment || applicantDepartment.trim() === "") {
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

  return {
    approvalLevel,
    approvers,
    estimatedDays,
    requiresPaperApproval
  };
}

export function determineApprovalAuthority(
  approverPosition: string,
  applicationAmount: number,
  applicationType: string,
  approvalAction: string
): ApprovalAuthorityResult {
  if (!approverPosition || approverPosition.trim() === "") {
    throw new Error("承認者の職位情報を確認できません。システム管理者にお問い合わせください。");
  }

  if (applicationAmount < 0) {
    throw new Error("申請金額は正しい値を入力してください。");
  }

  if (!applicationType || applicationType.trim() === "") {
    throw new Error("申請種別を選択してください。");
  }

  const requiredPosition = determineRequiredPosition(applicationType, applicationAmount);
  const hasAuthority = checkAuthorityLevel(approverPosition, requiredPosition);

  if (!hasAuthority) {
    const nextApprover = findNextApprover(requiredPosition);
    return {
      hasAuthority: false,
      requiredPosition,
      nextApprover,
      processingRoute: "escalate"
    };
  }

  let processingRoute = "";
  if (approvalAction === "approve") {
    processingRoute = "approved";
  } else if (approvalAction === "reject") {
    processingRoute = "rejected";
  } else {
    processingRoute = "returned";
  }

  return {
    hasAuthority: true,
    requiredPosition,
    nextApprover: null,
    processingRoute
  };
}

export function determineNextApprover(
  documentTitle: string,
  documentContent: string,
  currentApproverRole: string,
  approvalDecision: string
): NextApproverResult {
  if (!documentTitle || documentTitle.trim() === "") {
    throw new Error("申請書類のタイトルが入力されていません。タイトルを入力してください。");
  }

  if (!approvalDecision || approvalDecision.trim() === "") {
    throw new Error("承認・差戻し・却下のいずれかを選択してください。");
  }

  if (!currentApproverRole || currentApproverRole.trim() === "") {
    throw new Error("承認者の役職情報が取得できません。システム管理者にお問い合わせください。");
  }

  const keywordScore = analyzeSubsidyKeywords(documentTitle, documentContent);
  const isSubsidyRelated = keywordScore >= 0.7;
  const requiresPaperStorage = isSubsidyRelated && checkMoeRequirements(documentTitle);
  const processingRoute = requiresPaperStorage ? "hybrid" : "electronic";

  let nextApprover: string | null = null;

  if (approvalDecision === "approve") {
    if (currentApproverRole === "課長") {
      nextApprover = "部長";
    } else if (currentApproverRole === "部長") {
      nextApprover = "理事";
    } else {
      nextApprover = null; // 最終承認者
    }
  } else if (approvalDecision === "reject") {
    nextApprover = "申請者";
  } else {
    nextApprover = "申請者";
  }

  return {
    nextApprover,
    processingRoute,
    isSubsidyRelated,
    requiresPaperStorage
  };
}

// 他の関数の実装（テストで直接使用されていないが、structured で定義されている関数）

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
  const validTypes = ["補助金申請", "物品購入", "旅費申請", "設備申請", "人事申請"];
  return validTypes.includes(applicationType);
}

function isValidDepartment(department: string): boolean {
  const validDepartments = ["総務課", "研究課", "事務課", "財務課", "人事課"];
  return validDepartments.includes(department);
}

function isValidUrgencyLevel(urgencyLevel: string): boolean {
  const validLevels = ["低", "通常", "高", "緊急"];
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

function calculateSubsidyKeywordMatch(documentTitle: string, documentContent: string): number {
  const subsidyKeywords = ["科研費", "運営費交付金", "設備整備費", "補助金"];
  const text = (documentTitle + " " + documentContent).toLowerCase();
  
  let matchCount = 0;
  for (const keyword of subsidyKeywords) {
    if (text.includes(keyword.toLowerCase())) {
      matchCount++;
    }
  }
  
  return matchCount / subsidyKeywords.length;
}

function determineDocumentType(documentTitle: string, applicantDepartment: string): string {
  if (documentTitle.includes("補助金") || documentTitle.includes("科研費")) {
    return "補助金申請書";
  } else if (documentTitle.includes("物品") || documentTitle.includes("購入")) {
    return "物品購入申請書";
  } else if (documentTitle.includes("旅費") || documentTitle.includes("出張")) {
    return "旅費申請書";
  } else {
    return "一般申請書";
  }
}

function isMoeRequiredPaperStorage(documentType: string): boolean {
  const moeRequiredTypes = ["補助金申請書", "事業報告書", "会計報告書", "監査資料"];
  return moeRequiredTypes.includes(documentType);
}

export function determineDocumentTypeAndRoute(
  documentTitle: string,
  documentContent: string,
  applicantDepartment: string
): { documentType: string; processingRoute: string; subsidyRelated: boolean; paperStorageRequired: boolean } {
  if (!documentTitle || documentTitle.trim() === "") {
    throw new Error("申請書類のタイトルを入力してください");
  }

  if (documentContent.length < 10) {
    console.warn("申請内容が短すぎる可能性があります。内容を確認してください");
  }

  if (!applicantDepartment) {
    throw new Error("申請者の所属部署を選択してください");
  }

  const keywordScore = calculateSubsidyKeywordMatch(documentTitle, documentContent);
  const subsidyRelated = keywordScore >= 0.7;
  const paperStorageRequired = subsidyRelated && checkMoeRequirement(documentTitle, applicantDepartment);
  const processingRoute = paperStorageRequired ? "hybrid" : "electronic";
  const documentType = determineDocumentCategory(documentTitle, applicantDepartment, subsidyRelated);

  return { documentType, processingRoute, subsidyRelated, paperStorageRequired };
}

function checkMoeRequirement(documentTitle: string, applicantDepartment: string): boolean {
  return documentTitle.includes("補助金") || documentTitle.includes("科研費");
}

function determineDocumentCategory(documentTitle: string, applicantDepartment: string, subsidyRelated: boolean): string {
  if (subsidyRelated) {
    return "補助金申請書";
  } else if (documentTitle.includes("物品")) {
    return "物品購入申請書";
  } else {
    return "一般申請書";
  }
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
  const departmentBonus = isResearchDepartment(applicantDepartment) ? 0.1 : 0.0;
  const adjustedScore = keywordScore + departmentBonus;
  const subsidyRelated = adjustedScore >= 0.7 || (isResearchDepartment(applicantDepartment) && adjustedScore >= 0.6);
  const documentType = classifyDocumentType(documentTitle, documentContent);
  const paperStorageRequired = subsidyRelated && isMoeStorageRequirement(documentType);
  const processingRoute = paperStorageRequired ? "hybrid" : "electronic";

  return { documentType, processingRoute, subsidyRelated, paperStorageRequired };
}

function calculateMoeKeywordMatch(documentTitle: string, documentContent: string): number {
  const keywords = ["科研費", "運営費交付金", "設備整備費", "補助金", "文部科学省"];
  const text = (documentTitle + " " + documentContent).toLowerCase();
  
  let matchCount = 0;
  for (const keyword of keywords) {
    if (text.includes(keyword.toLowerCase())) {
      matchCount++;
    }
  }
  
  return matchCount / keywords.length;
}

function isResearchDepartment(department: string): boolean {
  const researchDepts = ["研究課", "学術課", "産学連携課"];
  return researchDepts.includes(department);
}

function classifyDocumentType(documentTitle: string, documentContent: string): string {
  if (documentTitle.includes("補助金") || documentContent.includes("補助金")) {
    return "補助金申請書";
  } else if (documentTitle.includes("設備") || documentContent.includes("設備")) {
    return "設備申請書";
  } else {
    return "一般申請書";
  }
}

function isMoeStorageRequirement(documentType: string): boolean {
  const requiredTypes = ["補助金申請書", "事業報告書", "会計報告書"];
  return requiredTypes.includes(documentType);
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

  if (!["high", "standard", "low"].includes(urgencyLevel)) {
    throw new Error("緊急度は「高」「標準」「低」のいずれかを選択してください");
  }

  let baseDays = subsidyRelated ? 5 : 3;
  if (urgencyLevel === "high") {
    baseDays = baseDays / 2;
  } else if (urgencyLevel === "low") {
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
    // 土曜日(6)と日曜日(0)を除く
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
): { priorityLevel: number; queuePosition: number; notificationTargets: any[]; processingDeadline: Date } {
  if (deadlineDate < new Date()) {
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

function getAllApprovers(approvalRoute: string[]): any[] {
  return approvalRoute.map(approver => ({ name: approver, role: "approver" }));
}

function getNextApprover(approvalRoute: string[]): any[] {
  if (approvalRoute.length > 0) {
    return [{ name: approvalRoute[0], role: "next_approver" }];
  }
  return [];
}

function calculateNormalPriority(applicationData: any): number {
  return applicationData.priority || 3;
}

function calculateNormalDeadline(applicationData: any): Date {
  const currentDate = new Date();
  return new Date(currentDate.getTime() + 7 * 24 * 60 * 60 * 1000);
}

export function handleSystemFailureAlternativeProcess(
  systemStatus: string,
  failureType: string,
  documentType: string,
  urgencyLevel: number
): { alternativeProcess: string; notificationTargets: string[]; dataRecoveryPlan: string; estimatedRecoveryTime: number } {
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

  let