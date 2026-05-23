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

function isValidApplicationType(applicationType: string): boolean {
  const validTypes = ["設備申請", "補助金申請", "人事申請", "旅費申請", "研究費申請"];
  return validTypes.includes(applicationType);
}

function isValidDepartment(department: string): boolean {
  const validDepartments = ["研究推進部", "総務部", "財務部", "学務部", "情報システム課"];
  return validDepartments.includes(department);
}

function isValidUrgencyLevel(urgencyLevel: string): boolean {
  const validLevels = ["通常", "急ぎ", "至急", "高", "中", "低"];
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
  if (applicationAmount <= 0 || isNaN(applicationAmount)) {
    throw new Error("申請金額は正の数値で入力してください");
  }

  const startDate = new Date(implementationStartDate);
  const endDate = new Date(implementationEndDate);
  
  if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
    throw new Error("実施期間は有効な日付形式で入力してください");
  }

  const budgetLimit = budgetLimits[documentType];
  const isAmountValid = budgetLimit && applicationAmount >= budgetLimit.minAmount && applicationAmount <= budgetLimit.maxAmount;
  
  const today = new Date();
  const isPeriodValid = startDate >= today && endDate > startDate;
  
  const validationErrors: string[] = [];
  if (!isAmountValid) {
    validationErrors.push("申請金額が規定範囲外です");
  }
  if (!isPeriodValid) {
    validationErrors.push("実施期間が不正です");
  }

  if (applicationAmount > budgetLimit?.maxAmount * 1.5) {
    console.warn("申請金額が大幅に予算上限を超過しています。金額を見直してください");
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
  const researchDepartments = ["研究推進部", "研究支援課", "学術研究推進室"];
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
  if (!documentTitle) {
    throw new Error("申請書類のタイトルが入力されていません。タイトルを入力してください。");
  }
  
  if (!applicantDepartment) {
    throw new Error("申請者の所属部署を選択してください。");
  }

  const keywordScore = calculateSubsidyKeywordMatch(documentTitle, documentContent);
  const subsidyRelated = keywordScore >= 0.7;
  const paperStorageRequired = subsidyRelated && checkMoeRequirement(documentTitle, applicantDepartment);
  const processingRoute = paperStorageRequired ? "hybrid" : "electronic";
  const documentType = determineDocumentCategory(documentTitle, applicantDepartment, subsidyRelated);
  
  if (documentContent.length < 10) {
    console.warn("申請内容が短すぎる可能性があります。内容を確認してください");
  }
  
  return { documentType, processingRoute, subsidyRelated, paperStorageRequired };
}

function checkMoeRequirement(documentTitle: string, applicantDepartment: string): boolean {
  const moeKeywords = ["文部科学省", "科研費", "補助金"];
  return moeKeywords.some(keyword => documentTitle.includes(keyword));
}

function determineDocumentCategory(documentTitle: string, applicantDepartment: string, subsidyRelated: boolean): string {
  if (subsidyRelated) return "補助金申請";
  if (documentTitle.includes("人事")) return "人事関連";
  if (documentTitle.includes("設備")) return "設備申請";
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

  const keywordScore = calculateMoeKeywordMatch(documentTitle, documentContent);
  const isResearchDept = checkResearchDepartment(applicantDepartment);
  const threshold = isResearchDept ? 0.6 : 0.7;
  const subsidyRelated = keywordScore >= threshold;
  
  const documentType = classifyDocumentType(documentTitle, documentContent, "補助金申請").documentType;
  const paperStorageRequired = subsidyRelated && isMoeRequirement(documentType);
  const processingRoute = paperStorageRequired ? "hybrid" : "electronic";
  
  if (!applicantDepartment) {
    console.warn("所属部署が未設定のため、標準の判定基準を適用します");
  }
  
  return { documentType, processingRoute, subsidyRelated, paperStorageRequired };
}

function calculateMoeKeywordMatch(documentTitle: string, documentContent: string): number {
  const moeKeywords = ["文部科学省", "科研費", "補助金", "助成金", "運営費交付金"];
  const text = (documentTitle + " " + documentContent).toLowerCase();
  
  let score = 0;
  for (const keyword of moeKeywords) {
    if (text.includes(keyword.toLowerCase())) {
      score += 0.2;
    }
  }
  
  return Math.min(score, 1.0);
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
    baseDays = Math.floor(baseDays / 2);
  } else if (urgencyLevel === "低") {
    baseDays = Math.floor(baseDays * 1.5);
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
    if (dayOfWeek !== 0 && dayOfWeek !== 6) { // 土日以外
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
  if (deadlineDate < new Date()) {
    throw new Error("提出期限は現在日時より未来の日付を設定してください");
  }

  if (!applicationData.approvalRoute || applicationData.approvalRoute.length === 0) {
    throw new Error("緊急案件の処理には最低一人の承認者が必要です");
  }

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
  switch (applicationData.priority) {
    case "高": return 2;
    case "中": return 3;
    default: return 4;
  }
}

function calculateNormalDeadline(applicationData: { createdAt: Date }): Date {
  return new Date(applicationData.createdAt.getTime() + 5 * 24 * 60 * 60 * 1000);
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
  
  if (!documentContent || documentContent.length < 10) {
    throw new Error("申請内容を10文字以上で入力してください");
  }
  
  if (documentType === "subsidy" && processingRoute !== "hybrid") {
    throw new Error("補助金関連書類は紙保管が必要なため、ハイブリッド処理を選択してください");
  }
  
  if (!approvalRoute || approvalRoute.length === 0) {
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

  if (!documentType || documentType === "未分類") {
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
  subsidyKeywords: string[]
): { documentType: string; processingRoute: string; subsidyRelated: boolean; paperStorageRequired: boolean; complianceStatus: string } {
  if (!documentTitle || documentTitle.length < 10) {
    throw new Error("申請書類のタイトルは10文字以上で入力してください");
  }
  
  if (!documentContent || documentContent.length < 50) {
    throw new Error("申請書類の内容は50文字以上で入力してください");
  }
  
  if (!documentType || documentType === "未設定") {
    console.warn("文書種別が正しく設定されていません。手動で確認してください");
  }

  const keywordMatchScore = calculateKeywordMatch(documentTitle, documentContent, subsidyKeywords);
  const subsidyRelated = keywordMatchScore >= 0.7;
  const paperStorageRequired = checkMoeRequirement(documentType, []);
  const processingRoute = paperStorageRequired ? "hybrid" : "electronic";
  const complianceStatus = evaluateCompliance(subsidyRelated, paperStorageRequired, documentType);
  
  return { documentType, processingRoute, subsidyRelated, paperStorageRequired, complianceStatus };
}

function calculateKeywordMatch(documentTitle: string, documentContent: string, keywords: string[]): number {
  const text = (documentTitle + " " + documentContent).toLowerCase();
  let matchCount = 0;
  
  for (const keyword of keywords) {
    if (text.includes(keyword.toLowerCase())) {
      matchCount++;
    }
  }
  
  return matchCount / keywords.length;
}

function evaluateCompliance(subsidyRelated: boolean, paperStorageRequired: boolean, documentType: string): string {
  if (subsidyRelated && paperStorageRequired) {
    return "適合";
  } else if (subsidyRelated && !paperStorageRequired) {
    return "要注意";
  }
  return "適合";
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

  if (!staffObjection && !autoClassificationResult) {
    console.warn("今後の改善のため、例外が発生した理由を記録することを推奨します");
  }

  if (autoClassificationResult === null || staffObjection !== null) {
    const manualReview = true;
    const finalDocumentType = managerDecision;
    const processingRoute = determineProcessingRouteFromType(finalDocumentType);
    const exceptionReason = generateExceptionReason(autoClassificationResult, staffObjection);
    const learningData = createLearningData(documentTitle, documentContent, finalDocumentType, exceptionReason);
    
    return { finalDocumentType, processingRoute, exceptionReason, learningData };
  }
  
  return {
    finalDocumentType: managerDecision,
    processingRoute: "electronic",
    exceptionReason: "手動判定により確定",
    learningData: {}
  };
}

function determineProcessingRouteFromType(documentType: string): string {
  const hybridTypes = ["補助金申請書", "研究費申請書"];
  return hybridTypes.includes(documentType) ? "hybrid" : "electronic";
}

function generateExceptionReason(autoResult: string | null, objection: string | null): string {
  if (objection) return `職員異議: ${objection}`;
  if (!autoResult) return "自動分類失敗";
  return "例外処理";
}

function createLearningData(title: string, content: string, type: string, reason: string): object {
  return {
    title: title.substring(0, 50),
    contentLength: content.length,
    finalType: type,
    reason: reason
  };
}

export function determineDocumentStorageMethod(
  documentTitle: string,
  documentContent: string,
  documentType: string,
  subsidyKeywords: string[]
): { documentType: string; processingRoute: string; subsidyRelated: boolean; paperStorageRequired: boolean } {
  if (!documentTitle) {
    throw new Error("申請書類のタイトルが入力されていません。タイトルを入力してください。");
  }
  
  if (documentContent.length < 10) {
    console.warn("申請内容が短すぎる可能性があります。内容を確認してください。");
  }

  const score = computeKeywordMatch(documentTitle, documentContent, subsidyKeywords);
  const subsidyRelated = score >= 0.7;
  const paperStorageRequired = subsidyRelated && isMoeRequirement(documentType);
  const processingRoute = paperStorageRequired ? "hybrid" : "electronic";
  
  return { documentType, processingRoute, subsidyRelated, paperStorageRequired };
}

function computeKeywordMatch(documentTitle: string, documentContent: string, keywords: string[]): number {
  const text = (documentTitle + " " + documentContent).toLowerCase();
  let matches = 0;
  
  for (const keyword of keywords) {
    if (text.includes(keyword.toLowerCase())) {
      matches++;
    }
  }
  
  return matches / keywords.length;
}

export function classifyDocumentType(
  documentTitle: string,
  documentContent: string,
  applicationType: string
): { documentType: string; processingRoute: string; subsidyRelated: boolean; paperStorageRequired: boolean } {
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
  return "一般申請";
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
  
  if (!documentType || documentType === "未分類") {
    throw new Error("文書種別の分類を先に完了してください");
  }

  const subsidyKeywords = ["研究費", "設備費", "運営費交付金", "補助金"];
  const keywordScore = calculateKeywordFrequency(documentTitle, documentContent, subsidyKeywords);
  const subsidyRelevanceScore = Math.min(keywordScore * 10, 100);
  const subsidyRelated = subsidyRelevanceScore >= 70;
  const moeRequirement = subsidyRelated && isMoeRegulatedDocumentType(documentType);
  const paperStorageRequired = moeRequirement;
  const processingRoute = paperStorageRequired ? "hybrid" : "electronic";
  
  return { subsidyRelevanceScore, subsidyRelated, moeRequirement, paperStorageRequired, processingRoute };
}

function calculateKeywordFrequency(title: string, content: string, keywords: string[]): number {
  const text = (title + " " + content).toLowerCase();
  let totalFrequency = 0;
  
  for (const keyword of keywords) {
    const regex = new RegExp(keyword.toLowerCase(), 'g');
    const matches = text.match(regex);
    if (matches) {
      totalFrequency += matches.length;
    }
  }
  
  return totalFrequency;
}

function isMoeRegulatedDocumentType(documentType: string): boolean {
  const regulatedTypes = ["補助金申請書", "研究費申請書", "設備購入申請"];
  return regulatedTypes.includes(documentType);
}

export function determineDigitalizationEligibility(
  documentTitle: string,
  documentContent: string,
  documentType: string,
  subsidyRelevanceScore: number
): { documentType: string; processingRoute: string; subsidyRelated: boolean; paperStorageRequired: boolean