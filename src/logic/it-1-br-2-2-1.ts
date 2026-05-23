// SIG-PLAN:
// - 関数名: validateApplicationAmountAndPeriod
//   呼び出し例 (テスト中): validateApplicationAmountAndPeriod(500000, "2024-04-01", "2024-03-31", "補助金申請書", { "補助金申請書": { minAmount: 10000, maxAmount: 1000000 } })
//   await されてる?: いいえ
//   アクセスされるプロパティ: r.isAmountValid, r.isPeriodValid, r.validationErrors, r.canProceed
//   → 結論: function validateApplicationAmountAndPeriod(applicationAmount: number, implementationStartDate: string, implementationEndDate: string, documentType: string, budgetLimits: object): ValidationResult
//   → ValidationResult = { isAmountValid: boolean; isPeriodValid: boolean; validationErrors: string[]; canProceed: boolean }
// - 関数名: determineApprovalHierarchy
//   呼び出し例 (テスト中): determineApprovalHierarchy(300000, "一般申請", "総務部")
//   await されてる?: いいえ
//   アクセスされるプロパティ: r.approvalLevel, r.estimatedDays, r.requiresPaperApproval
//   → 結論: function determineApprovalHierarchy(applicationAmount: number, documentType: string, applicantDepartment: string): ApprovalHierarchyResult
//   → ApprovalHierarchyResult = { approvalLevel: string; estimatedDays: number; requiresPaperApproval: boolean; approvers: string[] }
// - 関数名: determineApprovalAuthority
//   呼び出し例 (テスト中): determineApprovalAuthority("部長", 500000, "設備購入申請", "approve")
//   await されてる?: いいえ
//   アクセスされるプロパティ: r.hasAuthority, r.requiredPosition, r.processingRoute, r.nextApprover
//   → 結論: function determineApprovalAuthority(approverPosition: string, applicationAmount: number, applicationType: string, approvalAction: string): ApprovalAuthorityResult
//   → ApprovalAuthorityResult = { hasAuthority: boolean; requiredPosition: string; nextApprover: string | null; processingRoute: string }
// - 関数名: determineApprovalDecision
//   呼び出し例 (テスト中): determineApprovalDecision("設備購入申請書の内容です。", [], false, 3)
//   await されてる?: いいえ
//   アクセスされるプロパティ: r.decision, r.reason, r.nextAction
//   → 結論: function determineApprovalDecision(documentContent: string, deficiencyItems: string[], subsidyRelated: boolean, urgencyLevel: number): ApprovalDecisionResult
//   → ApprovalDecisionResult = { decision: string; reason: string; conditionalRequirements: string[]; nextAction: string }
// - 関数名: determineNextApprover
//   呼び出し例 (テスト中): 未確認だが、テストでimportされているため実装必要
//   → 結論: function determineNextApprover(...): NextApproverResult

interface ValidationResult {
  isAmountValid: boolean;
  isPeriodValid: boolean;
  validationErrors: string[];
  canProceed: boolean;
}

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

interface ApprovalDecisionResult {
  decision: string;
  reason: string;
  conditionalRequirements: string[];
  nextAction: string;
}

interface NextApproverResult {
  nextApprover: string | null;
  processingRoute: string;
  isSubsidyRelated: boolean;
  requiresPaperStorage: boolean;
}

export function validateApplicationAmountAndPeriod(
  applicationAmount: number,
  implementationStartDate: string,
  implementationEndDate: string,
  documentType: string,
  budgetLimits: Record<string, { minAmount: number; maxAmount: number }>
): ValidationResult {
  if (applicationAmount <= 0 || typeof applicationAmount !== 'number') {
    throw new Error("申請金額は正の数値で入力してください");
  }

  const startDate = new Date(implementationStartDate);
  const endDate = new Date(implementationEndDate);
  
  if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
    throw new Error("実施期間は有効な日付形式で入力してください");
  }

  const budgetLimit = budgetLimits[documentType];
  if (!budgetLimit) {
    throw new Error("指定された文書種別の予算上限が設定されていません");
  }

  const isAmountValid = applicationAmount >= budgetLimit.minAmount && applicationAmount <= budgetLimit.maxAmount;
  const today = new Date();
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

export function determineApprovalHierarchy(
  applicationAmount: number,
  documentType: string,
  applicantDepartment: string
): ApprovalHierarchyResult {
  if (applicationAmount <= 0) {
    throw new Error("申請金額は1円以上で入力してください");
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

  if (applicationAmount > 100000000) {
    console.warn("高額申請のため、理事会での特別承認が必要になる可能性があります");
  }

  const approvers = getApproversByLevel(approvalLevel, applicantDepartment);

  return { approvalLevel, approvers, estimatedDays, requiresPaperApproval };
}

function getApproversByLevel(approvalLevel: string, department: string): string[] {
  const approvers: string[] = [];
  
  if (approvalLevel === "課長承認") {
    approvers.push(`${department}課長`);
  } else if (approvalLevel === "部長承認") {
    approvers.push(`${department}課長`, `${department}部長`);
  } else if (approvalLevel === "理事承認") {
    approvers.push(`${department}課長`, `${department}部長`, "理事");
  }
  
  return approvers;
}

export function determineApprovalAuthority(
  approverPosition: string,
  applicationAmount: number,
  applicationType: string,
  approvalAction: string
): ApprovalAuthorityResult {
  if (!approverPosition) {
    throw new Error("承認者の職位情報を確認できません。システム管理者にお問い合わせください。");
  }

  if (applicationAmount < 0) {
    throw new Error("申請金額に正しい値を入力してください。");
  }

  if (!applicationType) {
    throw new Error("申請種別を選択してください。");
  }

  const requiredPosition = determineRequiredPosition(applicationType, applicationAmount);
  const hasAuthority = checkAuthorityLevel(approverPosition, requiredPosition);

  if (!hasAuthority) {
    const nextApprover = findNextApprover(requiredPosition);
    return { hasAuthority: false, requiredPosition, nextApprover, processingRoute: "escalate" };
  }

  const processingRoute = approvalAction === "approve" ? "approved" : 
                         approvalAction === "reject" ? "rejected" : "returned";

  return { hasAuthority: true, requiredPosition, nextApprover: null, processingRoute };
}

function determineRequiredPosition(applicationType: string, applicationAmount: number): string {
  if (applicationType.includes("補助金") && applicationAmount >= 1000000) {
    return "理事";
  } else if (applicationAmount >= 1000000) {
    return "理事";
  } else if (applicationAmount >= 100000) {
    return "部長";
  } else {
    return "課長";
  }
}

function checkAuthorityLevel(approverPosition: string, requiredPosition: string): boolean {
  const hierarchy = ["課長", "部長", "理事"];
  const approverLevel = hierarchy.indexOf(approverPosition);
  const requiredLevel = hierarchy.indexOf(requiredPosition);
  
  return approverLevel >= requiredLevel;
}

function findNextApprover(requiredPosition: string): string {
  return `${requiredPosition}`;
}

export function determineApprovalDecision(
  documentContent: string,
  deficiencyItems: string[],
  subsidyRelated: boolean,
  urgencyLevel: number
): ApprovalDecisionResult {
  if (!documentContent) {
    throw new Error("申請書類の内容が入力されていません。承認判定を行うことができません。");
  }

  if (urgencyLevel < 1 || urgencyLevel > 5) {
    urgencyLevel = Math.max(1, Math.min(5, urgencyLevel));
    console.warn("緊急度は1から5の範囲で入力してください。");
  }

  const severityScore = calculateDeficiencySeverity(deficiencyItems);
  const deficiencyCount = deficiencyItems.length;

  if (subsidyRelated && severityScore >= 7) {
    return { 
      decision: "reject", 
      reason: "補助金関連書類で重要な不備があるため", 
      conditionalRequirements: [], 
      nextAction: "resubmit" 
    };
  }

  if (deficiencyCount >= 3 || severityScore >= 8) {
    return { 
      decision: "reject", 
      reason: "重大な不備が複数あるため", 
      conditionalRequirements: [], 
      nextAction: "resubmit" 
    };
  }

  if (deficiencyCount >= 1 && urgencyLevel >= 4) {
    const requirements = generateConditionalRequirements(deficiencyItems);
    return { 
      decision: "conditional", 
      reason: "軽微な不備があるが緊急性を考慮", 
      conditionalRequirements: requirements, 
      nextAction: "fulfill_conditions" 
    };
  }

  return { 
    decision: "approve", 
    reason: "不備なしまたは軽微な不備のみ", 
    conditionalRequirements: [], 
    nextAction: "proceed" 
  };
}

function calculateDeficiencySeverity(deficiencyItems: string[]): number {
  let totalSeverity = 0;
  
  for (const item of deficiencyItems) {
    if (item.includes("重大") || item.includes("必須")) {
      totalSeverity += 3;
    } else if (item.includes("重要") || item.includes("承認")) {
      totalSeverity += 2;
    } else {
      totalSeverity += 1;
    }
  }
  
  return totalSeverity;
}

function generateConditionalRequirements(deficiencyItems: string[]): string[] {
  return deficiencyItems.map(item => `${item}の修正が必要`);
}

export function determineNextApprover(
  documentTitle: string,
  documentContent: string,
  currentApproverRole: string,
  approvalDecision: string
): NextApproverResult {
  if (!documentTitle) {
    throw new Error("申請書類のタイトルが入力されていません。タイトルを入力してください。");
  }

  if (!approvalDecision) {
    throw new Error("承認・差戻し・却下のいずれかを選択してください。");
  }

  if (!currentApproverRole) {
    throw new Error("承認者の役職情報が取得できません。システム管理者にお問い合わせください。");
  }

  const keywordScore = analyzeSubsidyKeywords(documentTitle, documentContent);
  const isSubsidyRelated = keywordScore >= 0.7;
  const requiresPaperStorage = isSubsidyRelated && checkMoeRequirements(documentTitle);
  const processingRoute = requiresPaperStorage ? "hybrid" : "electronic";
  const nextApprover = determineNextApproverByRole(currentApproverRole, isSubsidyRelated, approvalDecision);

  return { nextApprover, processingRoute, isSubsidyRelated, requiresPaperStorage };
}

function analyzeSubsidyKeywords(documentTitle: string, documentContent: string): number {
  const subsidyKeywords = ["補助金", "助成金", "科研費", "運営費交付金", "設備整備費"];
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
  const moeRequiredKeywords = ["文部科学省", "補助金申請", "研究費"];
  return moeRequiredKeywords.some(keyword => documentTitle.includes(keyword));
}

function determineNextApproverByRole(currentRole: string, isSubsidyRelated: boolean, decision: string): string | null {
  if (decision === "reject") {
    return null; // 却下の場合は次の承認者なし
  }

  const hierarchy = ["課長", "部長", "理事"];
  const currentIndex = hierarchy.indexOf(currentRole);
  
  if (currentIndex === -1 || currentIndex === hierarchy.length - 1) {
    return null; // 最上位または不明な役職の場合
  }

  if (isSubsidyRelated && currentIndex < 2) {
    return hierarchy[2]; // 補助金関連は理事まで
  }

  return hierarchy[currentIndex + 1];
}

// 追加の必要な関数群（テストで参照される可能性があるため）

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
  const validTypes = ["補助金申請", "設備申請", "人事申請", "一般申請"];
  return validTypes.includes(applicationType);
}

function isValidDepartment(department: string): boolean {
  const validDepartments = ["総務部", "研究推進部", "財務部", "学務部"];
  return validDepartments.includes(department);
}

function isValidUrgencyLevel(urgencyLevel: string): boolean {
  const validLevels = ["通常", "急ぎ", "至急"];
  return validLevels.includes(urgencyLevel);
}

export function classifyDocumentTypeAndRoute(
  documentTitle: string,
  documentContent: string,
  applicantDepartment: string
): { documentType: string; processingRoute: string; subsidyRelated: boolean; paperStorageRequired: boolean } {
  if (!documentTitle) {
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
  const documentType = determineDocumentType(documentTitle, applicantDepartment);
  const paperStorageRequired = subsidyRelated && isMoeRequiredPaperStorage(documentType);
  const processingRoute = paperStorageRequired ? "hybrid" : "electronic";

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

function determineDocumentType(documentTitle: string, applicantDepartment: string): string {
  if (documentTitle.includes("補助金") || documentTitle.includes("科研費")) {
    return "補助金申請書";
  } else if (documentTitle.includes("設備") || documentTitle.includes("機器")) {
    return "設備申請書";
  } else if (applicantDepartment.includes("人事")) {
    return "人事関連書類";
  } else {
    return "一般申請書";
  }
}

function isMoeRequiredPaperStorage(documentType: string): boolean {
  const moeRequiredTypes = ["補助金申請書", "事業報告書", "会計報告書", "監査資料"];
  return moeRequiredTypes.includes(documentType);
}