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
//   → 結論: function classifyDocumentTypeAndRoute(documentTitle: string, documentContent: string, applicantDepartment: string): { documentType: string; processingRoute: string; subsidyRelated: boolean; paperStorageRequired: boolean; }
//
// - 関数名: classifyDocumentType
//   呼び出し例 (テスト中): classifyDocumentType("科研費基盤研究申請書", "文部科学省科学研究費助成事業における...", "補助金申請")
//   await されてる?: いいえ
//   アクセスされるプロパティ: result.subsidyRelated, result.documentType, result.processingRoute
//   → 結論: function classifyDocumentType(documentTitle: string, documentContent: string, applicationType: string): { documentType: string; processingRoute: string; subsidyRelated: boolean; paperStorageRequired: boolean; }
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
//   → 結論: function determineDigitalizationEligibility(documentTitle: string, documentContent: string, documentType: string, subsidyRelevanceScore: number): { documentType: string; processingRoute: string; subsidyRelated: boolean; paperStorageRequired: boolean; }

function isValidApplicationType(applicationType: string): boolean {
  const validTypes = ["補助金申請", "設備申請", "人事申請", "旅費申請", "物品購入", "研究費申請"];
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
  
  if (!documentTitle) {
    throw new Error("申請書類のタイトルは必須項目です。入力してください。");
  }
  
  if (!documentTitle || documentTitle.length < 10 || documentTitle.length > 200) {
    errors.push("申請書類のタイトルは10文字以上200文字以内で入力してください");
  }
  
  if (!documentContent || documentContent.length < 50) {
    throw new Error("申請内容は50文字以上で詳しく記載してください。");
  }
  
  if (!applicationType || !isValidApplicationType(applicationType)) {
    throw new Error("申請種別を選択してください。");
  }
  
  if (!applicantDepartment || !isValidDepartment(applicantDepartment)) {
    throw new Error("所属部署を入力してください。");
  }
  
  if (!urgencyLevel || !isValidUrgencyLevel(urgencyLevel)) {
    errors.push("緊急度を選択してください");
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
): { documentType: string; processingRoute: string; subsidyRelated: boolean; paperStorageRequired: boolean; } {
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

export function validateApplicationAmountAndPeriod(
  applicationAmount: number,
  implementationStartDate: string,
  implementationEndDate: string,
  documentType: string,
  budgetLimits: { [key: string]: { minAmount: number; maxAmount: number } }
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
  
  const canProceed = isAmountValid && isPeriodValid;
  
  return { isAmountValid, isPeriodValid, validationErrors, canProceed };
}

export function determineDocumentTypeAndRoute(
  documentTitle: string,
  documentContent: string,
  applicantDepartment: string
): { documentType: string; processingRoute: string; subsidyRelated: boolean; paperStorageRequired: boolean; } {
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
  const isResearchDept = checkResearchDepartment(applicantDepartment);
  const adjustedScore = keywordScore + (isResearchDept ? 0.1 : 0.0);
  const subsidyRelated = adjustedScore >= 0.7 || (isResearchDept && adjustedScore >= 0.6);
  
  let documentType = "一般申請";
  if (subsidyRelated) {
    documentType = "補助金申請";
  }
  
  const paperStorageRequired = subsidyRelated && isMoeRequirement(documentType);
  const processingRoute = paperStorageRequired ? "hybrid" : "electronic";
  
  return { documentType, processingRoute, subsidyRelated, paperStorageRequired };
}

export function checkMoeComplianceRequirements(
  documentTitle: string,
  documentContent: string,
  applicantDepartment: string
): { documentType: string; processingRoute: string; subsidyRelated: boolean; paperStorageRequired: boolean; } {
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
  const isResearchDept = checkResearchDepartment(applicantDepartment);
  const departmentBonus = isResearchDept ? 0.1 : 0.0;
  const adjustedScore = keywordScore + departmentBonus;
  const subsidyRelated = adjustedScore >= 0.7 || (isResearchDept && adjustedScore >= 0.6);
  
  let documentType = "一般申請";
  if (subsidyRelated) {
    documentType = "補助金申請";
  }
  
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
  
  if (!["高", "標準", "低"].includes(urgencyLevel)) {
    throw new Error("緊急度は「高」「標準」「低」のいずれかを選択してください");
  }
  
  let baseDays = subsidyRelated ? 5 : 3;
  if (urgencyLevel === "高") {
    baseDays = Math.floor(baseDays / 2);
  } else if (urgencyLevel === "低") {
    baseDays = Math.floor(baseDays * 1.5);
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
  
  const deadlineDate = addBusinessDays(submissionDate, baseDays);
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
  const timeDiff = deadlineDate.getTime() - currentDate.getTime();
  const daysDiff = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
  
  const isUrgent = urgencyFlag || daysDiff <= 3;
  
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
    priorityLevel = applicationData.priority === "high" ? 2 : applicationData.priority === "medium" ? 3 : 4;
    queuePosition = currentApprovalQueue.length;
    notificationTargets = [applicationData.approvalRoute[0]];
    processingDeadline = new Date(currentDate.getTime() + 3 * 24 * 60 * 60 * 1000);
  }
  
  return { priorityLevel, queuePosition, notificationTargets, processingDeadline };
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
    throw new Error("申請書類のタイトルを入力してください");
  }
  
  if (!documentContent || documentContent.trim().length < 10) {
    throw new Error("申請内容を10文字以上で入力してください");
  }
  
  for (const field in requiredFields) {
    if (!requiredFields[field]) {
      errors.push(`必須項目「${field}」を入力してください`);
    }
  }
  
  if (documentType === "subsidy" && processingRoute !== "hybrid") {
    throw new Error("補助金関連書類は紙保管が必要なため、ハイブリッド処理を選択してください");
  }
  
  if (approvalRoute.length === 0) {
    throw new Error("承認者を1名以上設定してください");
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
  if (!documentTitle) {
    throw new Error("申請書類のタイトルを入力してください");
  }
  
  if (subsidyRelatedScore < 0 || subsidyRelatedScore > 100) {
    throw new Error("補助金関連度の評価に異常があります。システム管理者にお問い合わせください");
  }
  
  if (!documentType) {
    console.warn("文書種別を再確認してください。不明な場合は事務局にお問い合わせください");
  }
  
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
  subsidyKeywords: string[],
  moeRequirements?: any,
  complianceRules?: any,
  additionalParam?: any
): { documentType: string; processingRoute: string; subsidyRelated: boolean; paperStorageRequired: boolean; complianceStatus: string } {
  if (!documentTitle || documentTitle.length < 10) {
    throw new Error("申請書類のタイトルは10文字以上で入力してください");
  }
  
  if (!documentContent || documentContent.length < 50) {
    throw new Error("申請書類の内容は50文字以上で入力してください");
  }
  
  if (!documentType) {
    console.warn("文書種別が正しく設定されていません。手動で確認してください");
  }
  
  function calculateKeywordMatch(title: string, content: string, keywords: string[]): number {
    const text = (title + " " + content).toLowerCase();
    let matchCount = 0;
    
    for (const keyword of keywords) {
      if (text.includes(keyword.toLowerCase())) {
        matchCount++;
      }
    }
    
    return matchCount / keywords.length;
  }
  
  const keywordScore = calculateKeywordMatch(documentTitle, documentContent, subsidyKeywords);
  const subsidyRelated = keywordScore >= 0.7;
  const paperStorageRequired = subsidyRelated && isMoeRequirement(documentType);
  const processingRoute = paperStorageRequired ? "hybrid" : "electronic";
  
  function evaluateCompliance(subsidyRelated: boolean, paperRequired: boolean, docType: string): string {
    if (subsidyRelated && paperRequired) {
      return "適合";
    } else if (subsidyRelated && !paperRequired) {
      return "要注意";
    } else {
      return "適合";
    }
  }
  
  const complianceStatus = evaluateCompliance(subsidyRelated, paperStorageRequired, documentType);
  
  return { documentType, processingRoute, subsidyRelated, paperStorageRequired, complianceStatus };
}

export function handleDocumentClassificationException(
  documentTitle: string,
  documentContent: string,
  autoClassificationResult: string | null,
  staffObjection: string | null,
  managerDecision: string
): { finalDocumentType: string; processingRoute: string; exceptionReason: string; learningData: object } {
  if (!managerDecision) {
    throw new Error("例外処理には事務局長による最終判定が必要です");
  }
  
  if (autoClassificationResult == null || staffObjection != null) {
    const manualReview = true;
    const finalDocumentType = managerDecision;
    
    function determineProcessingRoute(docType: string): string {
      return isMoeRequirement(docType) ? "hybrid" : "electronic";
    }
    
    const processingRoute = determineProcessingRoute(finalDocumentType);
    
    function generateExceptionReason(autoResult: string | null, objection: string | null): string {
      if (autoResult == null) {
        return "自動分類が失敗したため手動判定を実施";
      }
      if (objection != null) {
        return `職員からの異議: ${objection}`;
      }
      return "例外処理が発生";
    }
    
    const exceptionReason = generateExceptionReason(autoClassificationResult, staffObjection);
    
    function createLearningData(title: string, content: string, finalType: string, reason: string): object {
      return {
        title,
        content,
        finalType,
        reason,
        timestamp: new Date().toISOString()
      };
    }
    
    const learningData = createLearningData(documentTitle, documentContent, finalDocumentType, exceptionReason);
    
    return { finalDocumentType, processingRoute, exceptionReason, learningData };
  }
  
  return {
    finalDocumentType: autoClassificationResult,
    processingRoute: "electronic",
    exceptionReason: "自動分類成功",
    learningData: {}
  };
}

export function determineDocumentStorageMethod(
  documentTitle: string,
  documentContent: string,
  documentType: string,
  subsidyKeywords: string[],
  moeRequirements?: any,
  additionalParam?: any
): { documentType: string; processingRoute: string; subsidyRelated: boolean; paperStorageRequired: boolean; } {
  if (!documentTitle) {
    throw new Error("申請書類のタイトルが入力されていません。タイトルを入力してください。");
  }
  
  if (documentContent.length < 10) {
    console.warn("申請内容が短すぎる可能性があります。内容を確認してください。");
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
  if (!documentTitle || documentTitle.length < 10) {
    throw new Error("申請書類のタイトルは10文字以上で入力してください");
  }
  
  if (!documentContent || documentContent.length < 50) {
    throw new Error("申請書類の内容は50文字以上で入力してください");
  }
  
  if (!applicationType) {
    throw new Error("申請種別を選択してください");
  }
  
  const subsidyKeywords = ["科研費", "運営費交付金", "設備整備費", "補助金"];
  
  function computeKeywordMatch(text: string, keywords: string[]): number {
    const lowerText = text.toLowerCase();
    let matchCount = 0;
    
    for (const keyword of keywords) {
      if (lowerText.includes(keyword.toLowerCase())) {
        matchCount++;
      }
    }
    
    return matchCount / keywords.length;
  }
  
  const score = computeKeywordMatch(documentTitle + " " + documentContent, subsidyKeywords);
  const subsidyRelated = score >= 0.7;
  const paperStorageRequired = subsidyRelated && isMoeRequirement(applicationType);
  const processingRoute = paperStorageRequired ? "hybrid" : "electronic";
  
  function classifyByApplicationType(appType: string, isSubsidy: boolean): string {
    if (isSubsidy) {
      return "補助金申請";
    }
    return appType;
  }
  
  const documentType = classifyByApplicationType(applicationType, subsidyRelated);
  
  return { documentType, processingRoute, subsidyRelated, paperStorageRequired };
}

export function evaluateSubsidyRelevance(
  documentTitle: string,
  documentContent: string,
  documentType: string
): { subsidyRelevanceScore: number; subsidyRelated: boolean; moeRequirement: boolean; paperStorageRequired: boolean; processingRoute: string } {
  if (!documentTitle || documentTitle.length < 10) {
    throw new Error("申請書類のタイトルは10文字以上で入力してください");
  }
  
  if (!documentContent || documentContent.length < 50) {
    throw new Error("申請書類の内容は50文字以上で入力してください");
  }
  
  if (!documentType) {
    throw new Error("文書種別の分類を先に完了してください");
  }
  
  const subsidyKeywords = ["研究費", "設備費", "運営費交付金", "補助金"];
  
  function calculateKeywordFrequency(title: string, content: string, keywords: string[]): number {
    const text = (title + " " + content).toLowerCase();
    let totalMatches = 0;
    
    for (const keyword of keywords) {
      const regex = new RegExp(keyword.toLowerCase(), 'g');
      const matches = text.match(regex);
      if (matches) {
        totalMatches += matches.length;
      }
    }
    
    return totalMatches;
  }
  
  const keywordScore = calculateKeywordFrequency(documentTitle, documentContent, subsidyKeywords);
  const subsidyRelevanceScore = Math.min(keywordScore * 10, 100);
  const subsidyRelated = subsidyRelevanceScore >= 70;
  
  function isMoeRegulatedDocumentType(docType: string): boolean {
    const regulatedTypes = ["補助金申請書", "事業報告書", "会計報告書"];
    return regulatedTypes.includes(docType);
  }
  
  const moeRequirement = subsidyRelated && isMoeRegulatedDocumentType(documentType);
  const paperStorageRequired = moeRequirement;
  const processingRoute = paperStorageRequired ? "hybrid" : "electronic";
  
  return { subsidyRelevanceScore, subsidyRelated, moeRequirement, paperStorageRequired, processingRoute };
}

export function determineDigitalizationEligibility(
  documentTitle: string,
  documentContent: string,
  documentType: string,
  subsidyRelevanceScore: number
): { documentType: string; processingRoute: string; subsidyRelated: boolean; paperStorageRequired: boolean; } {
  if (!documentTitle) {
    throw new Error("申請書類のタイトルが入力されていません。タイトルを入力してください。");
  }
  
  if (subsidyRelevanceScore < 0 || subsidyRelevanceScore > 100) {
    throw new Error("補助金関連度の評価に異常があります。システム管理者にお問い合わせください。");
  }
  
  if (!documentType) {
    console.warn("文書種別の分類が完了していません。手動で種別を確認してください。");
  }
  
  const subsidyRelated = subsidyRelevanceScore >= 0.7;
  const moeRequiredTypes = ["補助金申請書", "事業報告書", "会計報告書", "監査資料"];
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
): { requiredAuthorityLevel: string