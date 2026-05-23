```typescript
// SIG-PLAN:
// - 関数名: validateApplicationBeforeSubmission
//   呼び出し例 (テスト中): validateApplicationBeforeSubmission(documentTitle, documentContent, documentType, processingRoute, approvalRoute, requiredFields)
//   await されてる?: いいえ
//   アクセスされるプロパティ: result.isValid, result.errors
//   → 結論: function validateApplicationBeforeSubmission(documentTitle: string, documentContent: string, documentType: string, processingRoute: string, approvalRoute: string[], requiredFields: Record<string, any>): { isValid: boolean; errors: string[]; warnings: string[] }
// - 関数名: analyzeRegulationImpactScope
//   呼び出し例 (テスト中): analyzeRegulationImpactScope(regulationChangeContent, affectedRegulationTypes, currentDocumentTypes)
//   await されてる?: いいえ
//   アクセスされるプロパティ: result.affectedDocumentTypes, result.changeRequiredCount
//   → 結論: function analyzeRegulationImpactScope(regulationChangeContent: string, affectedRegulationTypes: string[], currentDocumentTypes: Array<{typeName: string, regulationCategory: string, storageRequirement: string}>): RegulationImpactAnalysis
// - 関数名: classifyLegalChangeImpactLevel
//   呼び出し例 (テスト中): classifyLegalChangeImpactLevel(changeNotification, affectedDocumentTypes, currentProcessingRules, complianceDeadline)
//   await されてる?: いいえ
//   アクセスされるプロパティ: result.impactLevel, result.priority, result.requiredResponseDays, result.affectedRuleCount, result.riskAssessment
//   → 結論: function classifyLegalChangeImpactLevel(changeNotification: string, affectedDocumentTypes: string[], currentProcessingRules: object[], complianceDeadline: Date): { impactLevel: 'high' | 'medium' | 'low', priority: number, requiredResponseDays: number, affectedRuleCount: number, riskAssessment: string }
// - 関数名: migrateExistingDataToNewClassification
//   呼び出し例 (テスト中): migrateExistingDataToNewClassification(newClassificationRules, existingDocuments, migrationScope)
//   await されてる?: いいえ
//   アクセスされるプロパティ: result.migratedCount, result.skippedCount, result.errorCount, result.updatedRoutes
//   → 結論: function migrateExistingDataToNewClassification(newClassificationRules: ClassificationRule[], existingDocuments: Document[], migrationScope: string): MigrationResult

// 型定義
interface ClassificationRule {
  documentType: string;
  processingRoute: string;
  paperStorageRequired: boolean;
}

interface Document {
  id: string;
  type: string;
  current_processing_route: string;
}

interface RouteUpdate {
  documentId: string;
  oldRoute: string;
  newRoute: string;
}

interface MigrationResult {
  migratedCount: number;
  skippedCount: number;
  errorCount: number;
  updatedRoutes: RouteUpdate[];
}

interface RegulationImpactAnalysis {
  affectedDocumentTypes: string[];
  processingRouteChanges: ProcessingRouteChange[];
  impactLevel: string;
  changeRequiredCount: number;
}

interface ProcessingRouteChange {
  documentType: string;
  oldRoute: string;
  newRoute: string;
}

// 申請書類提出前のバリデーション
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
    throw new Error("補助金関連書類は紙保管が必要なため、ハイブリッド処理を選択してください");
  }
  
  if (approvalRoute.length === 0) {
    errors.push("承認者を設定してください");
  }
  
  const isValid = errors.length === 0;
  
  return { isValid, errors, warnings };
}

// 法令改正の影響範囲分析
export function analyzeRegulationImpactScope(
  regulationChangeContent: string,
  affectedRegulationTypes: string[],
  currentDocumentTypes: Array<{typeName: string, regulationCategory: string, storageRequirement: string}>
): RegulationImpactAnalysis {
  if (!regulationChangeContent || regulationChangeContent.trim().length === 0) {
    throw new Error("法令改正の変更内容が正しく取得できていません。改正通知の受信処理を確認してください。");
  }
  
  if (currentDocumentTypes.length === 0) {
    throw new Error("システムに登録されている文書種別の情報を取得できません。データベース接続を確認してください。");
  }
  
  const affectedTypes: string[] = [];
  const routeChanges: ProcessingRouteChange[] = [];
  
  for (const docType of currentDocumentTypes) {
    if (isRegulationMatch(docType.regulationCategory, affectedRegulationTypes)) {
      affectedTypes.push(docType.typeName);
      const currentRoute = docType.storageRequirement;
      const newRoute = determineNewProcessingRoute(docType, regulationChangeContent);
      if (currentRoute !== newRoute) {
        routeChanges.push({ 
          documentType: docType.typeName, 
          oldRoute: currentRoute, 
          newRoute: newRoute 
        });
      }
    }
  }
  
  if (affectedTypes.length > 100) {
    console.warn("影響範囲が非常に広範囲です。段階的な対応計画の策定を推奨します。");
  }
  
  const impactLevel = routeChanges.length === 0 ? "軽微" : routeChanges.length <= 5 ? "中程度" : "重大";
  
  return { 
    affectedDocumentTypes: affectedTypes, 
    processingRouteChanges: routeChanges, 
    impactLevel: impactLevel, 
    changeRequiredCount: routeChanges.length 
  };
}

// 法令改正の影響度レベル分類
export function classifyLegalChangeImpactLevel(
  changeNotification: string,
  affectedDocumentTypes: string[],
  currentProcessingRules: object[],
  complianceDeadline: Date
): { impactLevel: 'high' | 'medium' | 'low', priority: number, requiredResponseDays: number, affectedRuleCount: number, riskAssessment: string } {
  if (!changeNotification || changeNotification.trim().length === 0) {
    throw new Error("法令改正通知の内容が正しく取得できません。通知内容を確認してください。");
  }
  
  if (complianceDeadline < new Date()) {
    console.warn("施行日が過去の日付です。緊急対応が必要な可能性があります。");
  }
  
  if (affectedDocumentTypes.length === 0) {
    console.warn("この法令改正による直接的な影響は検出されませんでした。念のため手動確認を推奨します。");
  }
  
  const hasSubsidyRequirementChange = changeNotification.includes("補助金") || changeNotification.includes("交付要綱");
  const affectedRuleCount = currentProcessingRules.filter(rule => 
    affectedDocumentTypes.includes((rule as any).document_type)
  ).length;
  const daysUntilDeadline = Math.floor((complianceDeadline.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
  
  let impactLevel: 'high' | 'medium' | 'low' = "low";
  let priority = 3;
  let requiredResponseDays = 60;
  
  if (hasSubsidyRequirementChange && (affectedRuleCount >= 10 || daysUntilDeadline < 30)) {
    impactLevel = "high";
    priority = 1;
    requiredResponseDays = 14;
  } else if (hasSubsidyRequirementChange && (affectedRuleCount >= 5 || daysUntilDeadline < 60)) {
    impactLevel = "medium";
    priority = 2;
    requiredResponseDays = 30;
  }
  
  const riskAssessment = impactLevel === "high" ? "法令違反リスク高" : impactLevel === "medium" ? "業務遅延リスク中" : "影響軽微";
  
  return { impactLevel, priority, requiredResponseDays, affectedRuleCount, riskAssessment };
}

// 既存データの新分類基準への移行
export function migrateExistingDataToNewClassification(
  newClassificationRules: ClassificationRule[],
  existingDocuments: Document[],
  migrationScope: string
): MigrationResult {
  if (newClassificationRules.length === 0) {
    throw new Error("法令改正に基づく新しい分類基準が設定されていません。分類基準を確認してください。");
  }
  
  if (existingDocuments.length === 0) {
    throw new Error("既存の申請書類データにアクセスできません。システム管理者に連絡してください。");
  }
  
  const targetDocuments = existingDocuments.filter(doc => isInMigrationScope(doc, migrationScope));
  let migratedCount = 0;
  let skippedCount = 0;
  let errorCount = 0;
  const updatedRoutes: RouteUpdate[] = [];
  
  for (const document of targetDocuments) {
    try {
      const newClassification = applyNewRules(document, newClassificationRules);
      if (newClassification.processingRoute !== document.current_processing_route) {
        updateDocumentRoute(document.id, newClassification);
        updatedRoutes.push({
          documentId: document.id, 
          oldRoute: document.current_processing_route, 
          newRoute: newClassification.processingRoute
        });
        migratedCount++;
      } else {
        skippedCount++;
      }
    } catch (error) {
      errorCount++;
    }
  }
  
  return { migratedCount, skippedCount, errorCount, updatedRoutes };
}

// ヘルパー関数
function isRegulationMatch(category: string, affectedTypes: string[]): boolean {
  return affectedTypes.includes(category);
}

function determineNewProcessingRoute(docType: any, regulationContent: string): string {
  if (regulationContent.includes("紙保管") && docType.regulationCategory.includes("補助金")) {
    return "hybrid";
  }
  return "electronic";
}

function isInMigrationScope(doc: Document, scope: string): boolean {
  return scope === "all" || scope.includes(doc.type);
}

function applyNewRules(document: Document, rules: ClassificationRule[]): ClassificationRule {
  const rule = rules.find(r => r.documentType === document.type);
  return rule || { documentType: document.type, processingRoute: "electronic", paperStorageRequired: false };
}

function updateDocumentRoute(documentId: string, classification: ClassificationRule): void {
  // データベース更新処理（実装は省略）
}

// 申請内容入力バリデーション
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

// 申請金額と期間の妥当性検証
export function validateApplicationAmountAndPeriod(
  applicationAmount: number,
  implementationStartDate: string,
  implementationEndDate: string,
  documentType: string,
  budgetLimits: any
): { isAmountValid: boolean; isPeriodValid: boolean; validationErrors: string[]; canProceed: boolean } {
  if (applicationAmount <= 0) {
    throw new Error("申請金額は正の数値で入力してください");
  }
  
  const budgetLimit = budgetLimits[documentType];
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

// 文書種別と処理ルート分類
export function classifyDocumentTypeAndRoute(
  documentTitle: string,
  documentContent: string,
  applicantDepartment: string
): { documentType: string; processingRoute: string; subsidyRelated: boolean; paperStorageRequired: boolean } {
  if (!documentTitle || documentTitle.length < 10) {
    throw new Error("申請書類のタイトルは10文字以上で入力してください");
  }
  
  const keywordScore = calculateSubsidyKeywordMatch(documentTitle, documentContent);
  const subsidyRelated = keywordScore >= 0.7;
  const paperStorageRequired = subsidyRelated && checkMoeRequirement(documentTitle, applicantDepartment);
  const processingRoute = paperStorageRequired ? "hybrid" : "electronic";
  const documentType = determineDocumentType(documentTitle, applicantDepartment);
  
  return { documentType, processingRoute, subsidyRelated, paperStorageRequired };
}

// ヘルパー関数の実装
function isValidApplicationType(type: string): boolean {
  const validTypes = ["補助金申請", "設備申請", "人事申請", "予算申請"];
  return validTypes.includes(type);
}

function isValidDepartment(department: string): boolean {
  return department && department.length > 0;
}

function isValidUrgencyLevel(level: string): boolean {
  const validLevels = ["通常", "急ぎ", "至急"];
  return validLevels.includes(level);
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

function checkMoeRequirement(title: string, department: string): boolean {
  const moeRequiredTypes = ["補助金申請書", "事業報告書", "会計報告書"];
  return moeRequiredTypes.some(type => title.includes(type));
}

function determineDocumentType(title: string, department: string): string {
  if (title.includes("補助金") || title.includes("科研費")) {
    return "補助金申請";
  }
  if (title.includes("設備")) {
    return "設備申請";
  }
  if (title.includes("人事")) {
    return "人事申請";
  }
  return "一般申請";
}

// 文書種別と処理ルート決定
export function determineDocumentTypeAndRoute(
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
  const departmentBonus = isResearchDepartment(applicantDepartment) ? 0.1 : 0.0;
  const adjustedScore = keywordScore + departmentBonus;
  const subsidyRelated = adjustedScore >= 0.7 || (isResearchDepartment(applicantDepartment) && adjustedScore >= 0.6);
  const documentType = classifyDocumentType(documentTitle, documentContent);
  const paperStorageRequired = subsidyRelated && isMoeStorageRequirement(documentType);
  const processingRoute = paperStorageRequired ? "hybrid" : "electronic";
  
  return { documentType, processingRoute, subsidyRelated, paperStorageRequired };
}

function isResearchDepartment(department: string): boolean {
  const researchDepts = ["研究推進部", "学術研究科", "工学部", "理学部"];
  return researchDepts.some(dept => department.includes(dept));
}

function classifyDocumentType(title: string, content: string): string {
  if (title.includes("補助金") || content.includes("科研費")) {
    return "補助金申請書";
  }
  return "一般申請書";
}

function isMoeStorageRequirement(documentType: string): boolean {
  const moeRequiredTypes = ["補助金申請書", "事業報告書", "会計報告書", "監査資料"];
  return moeRequiredTypes.includes(documentType);
}

// 文部科学省要件チェック
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
  const isSubsidyRelated = keywordScore >= 0.6;
  const paperStorageRequired = isSubsidyRelated && checkMoeRequirementMatch(documentTitle);
  const processingRoute = paperStorageRequired ? "hybrid" : "electronic";
  const complianceStatus = paperStorageRequired ? "compliant" : "review_required";
  const riskLevel = keywordScore >= 0.8 ? "high" : keywordScore >= 0.4 ? "medium" : "low";
  const documentType = determineDocumentCategory(documentTitle, applicantDepartment, isSubsidyRelated);
  
  return { documentType, processingRoute, subsidyRelated: isSubsidyRelated, paperStorageRequired };
}

function calculateMoeKeywordMatch(title: string, content: string): number {
  const moeKeywords = ["文部科学省", "補助金", "科研費", "運営費交付金", "設備整備費"];
  const text = (title + " " + content).toLowerCase();
  let score = 0;
  
  for (const keyword of moeKeywords) {
    if (text.includes(keyword.toLowerCase())) {
      score += 0.2;
    }
  }
  
  return Math.min(score, 1.0);
}

function checkMoeRequirementMatch(title: string): boolean {
  const requiredTypes = ["補助金申請書", "実績報告書", "収支決算書"];
  return requiredTypes.some(type => title.includes(type));
}

function determineDocumentCategory(title: string, department: string, subsidyRelated: boolean): string {
  if (subsidyRelated) {
    return "補助金申請書";
  }
  if (title.includes("人事")) {
    return "人事関連書類";
  }
  return "一般申請書";
}

// 承認者権限レベル設定
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

// 承認階層決定
export function determineApprovalHierarchy(
  applicationAmount: number,
  documentType: string,
  applicantDepartment: string
): { approvalLevel: string; approvers: string[]; estimatedDays: number; requiresPaperApproval: boolean } {
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
  // 実際の実装では部署ごとの承認者マスタから取得
  return [`${department}_${level}`];
}

// 承認期限設定
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
    if (result.getDay() !== 0 && result.getDay() !== 6) { // 土日を除く
      addedDays++;
    }
  }
  
  return result;
}

// 緊急申請優先度処理
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

function getAllApprovers(approvalRoute: string[]): string[] {
  return approvalRoute;
}

function getNextApprover(approvalRoute: string[]): string[] {
  return approvalRoute.slice(0, 1);
}

function calculateNormalPriority(applicationData: any): number {
  return applicationData.priority || 3;
}

function calculateNormalDeadline(applicationData: any): Date {
  return new Date(Date.now() + 5 * 24