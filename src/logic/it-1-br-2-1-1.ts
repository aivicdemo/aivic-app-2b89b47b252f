// SIG-PLAN:
// - 関数名: validateApplicationInput
//   呼び出し例 (テスト中): validateApplicationInput("新しい研究設備導入に関する補助金申請について", "本申請は、研究室の実験装置を更新するための補助金申請です。新設備により研究効率が大幅に向上することが期待されます。", "補助金申請", "理学部事務課", "通常")
//   await されてる?: いいえ
//   アクセスされるプロパティ: result.isValid, result.errors
//   → 結論: function validateApplicationInput(documentTitle: string, documentContent: string, applicationType: string, applicantDepartment: string, urgencyLevel: string): { isValid: boolean; errors: string[]; warnings: string[] }
//
// - 関数名: classifyDocumentTypeAndRoute
//   呼び出し例 (テスト中): classifyDocumentTypeAndRoute("科研費による研究設備購入申請", "文部科学省の科学研究費補助金を活用した研究機器の購入申請です。運営費交付金との併用により効率的な研究環境整備を目指します。", "研究推進課")
//   await されてる?: いいえ
//   アクセスされるプロパティ: result.subsidyRelated, result.processingRoute, result.paperStorageRequired
//   → 結論: function classifyDocumentTypeAndRoute(documentTitle: string, documentContent: string, applicantDepartment: string): { documentType: string; processingRoute: string; subsidyRelated: boolean; paperStorageRequired: boolean; }
//
// - 関数名: determineDocumentTypeAndRoute
//   呼び出し例 (テスト中): determineDocumentTypeAndRoute("運営費交付金による設備整備申請書", "大学運営費交付金を財源とした研究設備の整備申請です。文部科学省の基準に従い適切な手続きを行います。", "財務課")
//   await されてる?: いいえ
//   アクセスされるプロパティ: result.isSubsidyRelated, result.documentType, result.processingRoute, result.requiresPaperStorage
//   → 結論: function determineDocumentTypeAndRoute(documentTitle: string, documentContent: string, applicantDepartment: string): { documentType: string; processingRoute: string; isSubsidyRelated: boolean; requiresPaperStorage: boolean; }
//
// - 関数名: determineDigitalizationEligibility
//   呼び出し例 (テスト中): determineDigitalizationEligibility("科研費申請書", "科学研究費補助金の新規申請書です。研究計画と予算計画を詳細に記載し文部科学省の審査基準に適合させています。", "補助金申請書", 0.85)
//   await されてる?: いいえ
//   アクセスされるプロパティ: result.subsidyRelated, result.processingRoute, result.paperStorageRequired
//   → 結論: function determineDigitalizationEligibility(documentTitle: string, documentContent: string, documentType: string, subsidyRelevanceScore: number): { documentType: string; processingRoute: string; subsidyRelated: boolean; paperStorageRequired: boolean; }

function isValidApplicationType(applicationType: string): boolean {
  const validTypes = ["補助金申請", "設備申請", "人事申請", "研究申請", "予算申請", "施設利用申請"];
  return validTypes.includes(applicationType);
}

function isValidDepartment(department: string): boolean {
  const validDepartments = ["理学部事務課", "工学部事務課", "研究推進課", "財務課", "総務課", "事務局"];
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
  const researchDepartments = ["研究推進課", "理学部事務課", "工学部事務課"];
  return researchDepartments.includes(department);
}

function classifyDocumentType(documentTitle: string, documentContent: string): string {
  const text = (documentTitle + " " + documentContent).toLowerCase();
  
  if (text.includes("補助金") || text.includes("科研費")) {
    return "補助金申請";
  } else if (text.includes("設備") || text.includes("機器")) {
    return "設備申請";
  } else if (text.includes("人事") || text.includes("採用")) {
    return "人事関連";
  } else {
    return "一般申請";
  }
}

function requiresPaperStorage(documentType: string): boolean {
  const paperRequiredTypes = ["補助金申請", "実績報告書", "収支決算書"];
  return paperRequiredTypes.includes(documentType);
}

export function classifyDocumentTypeAndRoute(
  documentTitle: string,
  documentContent: string,
  applicantDepartment: string
): { documentType: string; processingRoute: string; subsidyRelated: boolean; paperStorageRequired: boolean; } {
  const keywordScore = calculateSubsidyKeywordMatch(documentTitle, documentContent);
  const isResearchDept = checkResearchDepartment(applicantDepartment);
  const threshold = isResearchDept ? 0.6 : 0.7;
  const subsidyRelated = keywordScore >= threshold;
  const documentType = classifyDocumentType(documentTitle, documentContent);
  const paperStorageRequired = subsidyRelated && requiresPaperStorage(documentType);
  const processingRoute = paperStorageRequired ? "hybrid" : "electronic";
  
  return { documentType, processingRoute, subsidyRelated, paperStorageRequired };
}

export function determineDocumentTypeAndRoute(
  documentTitle: string,
  documentContent: string,
  applicantDepartment: string
): { documentType: string; processingRoute: string; isSubsidyRelated: boolean; requiresPaperStorage: boolean; } {
  const keywordScore = calculateSubsidyKeywordMatch(documentTitle, documentContent);
  const subsidyRelated = keywordScore >= 0.7;
  const paperStorageRequired = subsidyRelated && checkMoeRequirement(documentTitle, applicantDepartment);
  const processingRoute = paperStorageRequired ? "hybrid" : "electronic";
  const documentType = determineDocumentCategory(documentTitle, applicantDepartment, subsidyRelated);
  
  return { 
    documentType, 
    processingRoute, 
    isSubsidyRelated: subsidyRelated, 
    requiresPaperStorage: paperStorageRequired 
  };
}

function checkMoeRequirement(documentTitle: string, applicantDepartment: string): boolean {
  const moeRequiredKeywords = ["文部科学省", "科研費", "運営費交付金"];
  const text = documentTitle.toLowerCase();
  
  for (const keyword of moeRequiredKeywords) {
    if (text.includes(keyword.toLowerCase())) {
      return true;
    }
  }
  
  return false;
}

function determineDocumentCategory(documentTitle: string, applicantDepartment: string, subsidyRelated: boolean): string {
  if (subsidyRelated) {
    return "補助金申請";
  }
  
  const text = documentTitle.toLowerCase();
  if (text.includes("設備") || text.includes("機器")) {
    return "設備申請";
  } else if (text.includes("人事") || text.includes("採用")) {
    return "人事関連";
  } else {
    return "一般申請";
  }
}

export function checkMoeComplianceRequirements(
  documentTitle: string,
  documentContent: string,
  applicantDepartment: string
): { documentType: string; processingRoute: string; subsidyRelated: boolean; paperStorageRequired: boolean; } {
  const keywordScore = calculateSubsidyKeywordMatch(documentTitle, documentContent);
  const departmentBonus = checkResearchDepartment(applicantDepartment) ? 0.1 : 0.0;
  const adjustedScore = keywordScore + departmentBonus;
  const subsidyRelated = adjustedScore >= 0.7 || (checkResearchDepartment(applicantDepartment) && adjustedScore >= 0.6);
  const documentType = classifyDocumentType(documentTitle, documentContent);
  const paperStorageRequired = subsidyRelated && isMoeStorageRequirement(documentType);
  const processingRoute = paperStorageRequired ? "hybrid" : "electronic";
  
  if (!documentTitle || documentTitle.length < 10) {
    throw new Error("申請書類のタイトルは10文字以上で入力してください");
  }
  
  if (!documentContent || documentContent.length < 50) {
    throw new Error("申請書類の内容は50文字以上で入力してください");
  }
  
  if (!applicantDepartment) {
    console.warn("所属部署を選択すると、より正確な判定が行われます");
  }
  
  return { documentType, processingRoute, subsidyRelated, paperStorageRequired };
}

function isMoeStorageRequirement(documentType: string): boolean {
  const moeRequiredTypes = ["補助金申請", "事業報告書", "会計報告書", "監査資料"];
  return moeRequiredTypes.includes(documentType);
}

export function determineDigitalizationEligibility(
  documentTitle: string,
  documentContent: string,
  documentType: string,
  subsidyRelevanceScore: number
): { documentType: string; processingRoute: string; subsidyRelated: boolean; paperStorageRequired: boolean; } {
  const subsidyRelated = subsidyRelevanceScore >= 0.7;
  const moeRequiredTypes = ["補助金申請書", "事業報告書", "会計報告書", "監査資料"];
  const paperStorageRequired = subsidyRelated && moeRequiredTypes.includes(documentType);
  const processingRoute = paperStorageRequired ? "hybrid" : "electronic";
  
  if (!documentTitle) {
    throw new Error("申請書類のタイトルが入力されていません。タイトルを入力してください。");
  }
  
  if (subsidyRelevanceScore < 0 || subsidyRelevanceScore > 1) {
    throw new Error("補助金関連度の評価に異常があります。システム管理者にお問い合わせください。");
  }
  
  if (!documentType) {
    console.warn("文書種別を再確認してください。不明な場合は事務局にお問い合わせください");
  }
  
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
  
  if (!documentTitle) {
    throw new Error("申請書類のタイトルを入力してください");
  }
  
  if (subsidyRelatedScore < 0 || subsidyRelatedScore > 1) {
    throw new Error("補助金関連度の評価に異常があります。システム管理者にお問い合わせください");
  }
  
  if (!documentType) {
    console.warn("文書種別を再確認してください。不明な場合は事務局にお問い合わせください");
  }
  
  return { documentType, processingRoute, subsidyRelated, paperStorageRequired, approvalFlow };
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
    
    if (!managerDecision) {
      throw new Error("例外処理には事務局長による最終判定が必要です");
    }
    
    if (!exceptionReason) {
      console.warn("今後の改善のため、例外が発生した理由を記録することを推奨します");
    }
    
    return { finalDocumentType, processingRoute, exceptionReason, learningData };
  }
  
  return {
    finalDocumentType: autoClassificationResult,
    processingRoute: "electronic",
    exceptionReason: "",
    learningData: {}
  };
}

function determineProcessingRouteFromType(documentType: string): string {
  const hybridTypes = ["補助金申請", "研究費申請", "設備導入申請"];
  return hybridTypes.includes(documentType) ? "hybrid" : "electronic";
}

function generateExceptionReason(autoResult: string | null, objection: string | null): string {
  if (autoResult == null) {
    return "自動分類が失敗したため手動判定を実施";
  }
  if (objection != null) {
    return `職員からの異議: ${objection}`;
  }
  return "";
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
): { documentType: string; processingRoute: string; subsidyRelated: boolean; paperStorageRequired: boolean; } {
  const score = computeKeywordMatch(documentTitle, documentContent, subsidyKeywords);
  const subsidyRelated = score >= 0.7;
  const paperStorageRequired = subsidyRelated && isMoeRequirement(documentType);
  const processingRoute = paperStorageRequired ? "hybrid" : "electronic";
  
  if (!documentTitle) {
    throw new Error("申請書類のタイトルが入力されていません。タイトルを入力してください。");
  }
  
  if (documentContent.length < 10) {
    console.warn("申請内容が短すぎる可能性があります。内容を確認してください。");
  }
  
  return { documentType, processingRoute, subsidyRelated, paperStorageRequired };
}

function computeKeywordMatch(title: string, content: string, keywords: string[]): number {
  const text = (title + " " + content).toLowerCase();
  let matchCount = 0;
  
  for (const keyword of keywords) {
    if (text.includes(keyword.toLowerCase())) {
      matchCount++;
    }
  }
  
  return matchCount / keywords.length;
}

function isMoeRequirement(documentType: string): boolean {
  const moeTypes = ["補助金申請", "研究費申請", "設備導入申請", "実績報告書"];
  return moeTypes.includes(documentType);
}

export function validateApplicationAmountAndPeriod(
  applicationAmount: number,
  implementationStartDate: string,
  implementationEndDate: string,
  documentType: string,
  budgetLimits: { [key: string]: { minAmount: number; maxAmount: number } }
): { isAmountValid: boolean; isPeriodValid: boolean; validationErrors: string[]; canProceed: boolean } {
  const budgetLimit = budgetLimits[documentType];
  const isAmountValid = budgetLimit && applicationAmount >= budgetLimit.minAmount && applicationAmount <= budgetLimit.maxAmount;
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
  
  if (applicationAmount <= 0) {
    throw new Error("申請金額は正の数値で入力してください");
  }
  
  if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
    throw new Error("実施期間は有効な日付形式で入力してください");
  }
  
  if (budgetLimit && applicationAmount > budgetLimit.maxAmount * 1.5) {
    console.warn("申請金額が大幅に予算上限を超過しています。金額を見直してください");
  }
  
  const canProceed = isAmountValid && isPeriodValid;
  return { isAmountValid, isPeriodValid, validationErrors, canProceed };
}