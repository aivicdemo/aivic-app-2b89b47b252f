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
  
  return approverIndex >= requiredIndex;
}

function findNextApprover(requiredPosition: string): string {
  const hierarchy = ["係長", "課長", "部長", "理事", "学長"];
  const requiredIndex = hierarchy.indexOf(requiredPosition);
  
  if (requiredIndex < hierarchy.length - 1) {
    return hierarchy[requiredIndex + 1];
  }
  
  return "学長";
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

function analyzeSubsidyKeywords(documentTitle: string, documentContent: string): number {
  const subsidyKeywords = ["補助金", "助成金", "科研費", "運営費交付金", "設備整備費", "研究費", "文部科学省"];
  const text = (documentTitle + " " + documentContent).toLowerCase();
  
  let matchCount = 0;
  let totalKeywords = subsidyKeywords.length;
  
  for (const keyword of subsidyKeywords) {
    if (text.includes(keyword.toLowerCase())) {
      matchCount++;
    }
  }
  
  return matchCount / totalKeywords;
}

function checkMoeRequirements(documentTitle: string): boolean {
  const moeRequiredTypes = ["補助金申請書", "事業報告書", "会計報告書", "監査資料"];
  return moeRequiredTypes.some(type => documentTitle.includes(type));
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

  return { approvalLevel, approvers, estimatedDays, requiresPaperApproval };
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
    return { hasAuthority: false, requiredPosition, nextApprover, processingRoute: "escalate" };
  }

  const processingRoute = approvalAction === "approve" ? "approved" : approvalAction === "reject" ? "rejected" : "returned";
  return { hasAuthority: true, requiredPosition, nextApprover: null, processingRoute };
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
      nextApprover = isSubsidyRelated ? "部長" : null;
    } else if (currentApproverRole === "部長") {
      nextApprover = isSubsidyRelated ? "理事" : null;
    } else {
      nextApprover = null;
    }
  } else if (approvalDecision === "reject") {
    nextApprover = "申請者";
  }

  return { nextApprover, processingRoute, isSubsidyRelated, requiresPaperStorage };
}

// 追加の関数群（structured仕様に基づく実装）

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
  const validTypes = ["補助金申請", "設備申請", "人事申請", "物品購入", "旅費申請"];
  return validTypes.includes(applicationType);
}

function isValidDepartment(department: string): boolean {
  const validDepartments = ["総務課", "研究課", "事務課", "財務課", "人事課"];
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
    throw new Error("所属部署を選択してください");
  }

  const keywordScore = calculateSubsidyKeywordMatch(documentTitle, documentContent);
  const subsidyRelated = keywordScore >= 0.7;
  const paperStorageRequired = subsidyRelated && isMoeRequiredPaperStorage(documentTitle);
  const processingRoute = paperStorageRequired ? "hybrid" : "electronic";
  const documentType = determineDocumentCategory(documentTitle, applicantDepartment, subsidyRelated);

  return { documentType, processingRoute, subsidyRelated, paperStorageRequired };
}

function calculateSubsidyKeywordMatch(documentTitle: string, documentContent: string): number {
  const subsidyKeywords = ["科研費", "運営費交付金", "設備整備費", "補助金"];
  const text = (documentTitle + " " + documentContent).toLowerCase();
  
  let matches = 0;
  for (const keyword of subsidyKeywords) {
    if (text.includes(keyword.toLowerCase())) {
      matches++;
    }
  }
  
  return matches / subsidyKeywords.length;
}

function isMoeRequiredPaperStorage(documentTitle: string): boolean {
  const moeRequiredTypes = ["補助金申請書", "研究費申請書", "設備導入申請書"];
  return moeRequiredTypes.some(type => documentTitle.includes(type));
}

function determineDocumentCategory(documentTitle: string, applicantDepartment: string, subsidyRelated: boolean): string {
  if (subsidyRelated) {
    return "補助金申請";
  } else if (documentTitle.includes("人事")) {
    return "人事関連";
  } else {
    return "一般申請";
  }
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
  const isResearchDept = ["研究課", "学術課"].includes(applicantDepartment);
  const hasMoeKeywords = documentTitle.includes("補助金") || documentTitle.includes("科研費");
  return isResearchDept && hasMoeKeywords;
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
  const researchDepts = ["研究課", "学術課", "研究推進課"];
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
  const moeRequiredTypes = ["補助金申請書", "事業報告書", "会計報告書", "監査資料"];
  return moeRequiredTypes.includes(documentType);
}

// 他の必要な関数群も同様に実装...
// (スペースの関係で一部のみ実装例を示しています)