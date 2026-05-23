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
//   → 結論: function classifyLegalChangeImpactLevel(changeNotification: string, affectedDocumentTypes: string[], currentProcessingRules: object[], complianceDeadline: Date): { impactLevel: string; priority: number; requiredResponseDays: number; affectedRuleCount: number; riskAssessment: string }
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

interface DocumentType {
  typeName: string;
  regulationCategory: string;
  storageRequirement: string;
}

// ヘルパー関数
function isValidApplicationType(applicationType: string): boolean {
  const validTypes = ["補助金申請", "設備申請", "人事申請", "予算申請", "研究費申請"];
  return validTypes.includes(applicationType);
}

function isValidDepartment(department: string): boolean {
  const validDepartments = ["研究推進部", "総務部", "財務部", "学務部", "情報システム課"];
  return validDepartments.includes(department);
}

function isValidUrgencyLevel(urgencyLevel: string): boolean {
  const validLevels = ["通常", "急ぎ", "至急", "緊急"];
  return validLevels.includes(urgencyLevel);
}

function extractAffectedRegulations(regulationChangeContent: string, affectedRegulationTypes: string[]): string[] {
  const extractedRegulations: string[] = [];
  for (const regType of affectedRegulationTypes) {
    if (regulationChangeContent.includes(regType)) {
      extractedRegulations.push(regType);
    }
  }
  return extractedRegulations;
}

function isRegulationMatch(regulationCategory: string, affectedRegulations: string[]): boolean {
  return affectedRegulations.includes(regulationCategory);
}

function determineNewProcessingRoute(docType: DocumentType, regulationChangeContent: string): string {
  // 補助金関連で紙保管要件が追加された場合
  if (regulationChangeContent.includes("紙保管") && regulationChangeContent.includes("義務")) {
    if (docType.regulationCategory.includes("補助金") || docType.regulationCategory.includes("研究費")) {
      return "hybrid";
    }
  }
  
  // 電子化要件が変更された場合
  if (regulationChangeContent.includes("電子化要件")) {
    return "electronic";
  }
  
  return docType.storageRequirement;
}

function isInMigrationScope(document: Document, migrationScope: string): boolean {
  if (migrationScope === "all") {
    return true;
  }
  // その他のスコープ判定ロジック
  return true;
}

function applyNewRules(document: Document, newClassificationRules: ClassificationRule[]): ClassificationRule {
  const rule = newClassificationRules.find(r => r.documentType === document.type);
  if (!rule) {
    // デフォルトルール
    return {
      documentType: document.type,
      processingRoute: document.current_processing_route,
      paperStorageRequired: false
    };
  }
  return rule;
}

function updateDocumentRoute(documentId: string, newClassification: ClassificationRule): void {
  // データベース更新処理（実際の実装では DB アクセス）
  console.log(`Document ${documentId} updated to route: ${newClassification.processingRoute}`);
}

// メイン関数の実装
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
    throw new Error("所属部署を選択してください");
  }
  
  const subsidyKeywords = ["科研費", "運営費交付金", "設備整備費", "補助金"];
  const content = documentTitle + " " + documentContent;
  let keywordScore = 0;
  
  for (const keyword of subsidyKeywords) {
    if (content.includes(keyword)) {
      keywordScore += 0.25;
    }
  }
  
  const subsidyRelated = keywordScore >= 0.7;
  const moeRequiredTypes = ["補助金申請書", "研究費申請書", "設備導入申請書"];
  const documentType = subsidyRelated ? "補助金申請書" : "一般申請書";
  const paperStorageRequired = subsidyRelated && moeRequiredTypes.includes(documentType);
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
  
  if (documentContent.length < 10) {
    console.warn("申請内容が短すぎる可能性があります。内容を確認してください");
  }
  
  if (!applicantDepartment) {
    throw new Error("申請者の所属部署を選択してください");
  }
  
  const subsidyKeywords = ["科研費", "運営費交付金", "設備整備費", "補助金"];
  const content = documentTitle + " " + documentContent;
  let keywordScore = 0;
  
  for (const keyword of subsidyKeywords) {
    if (content.includes(keyword)) {
      keywordScore += 0.25;
    }
  }
  
  // 研究関連部署の場合は基準を下げる
  const isResearchDept = applicantDepartment.includes("研究");
  const threshold = isResearchDept ? 0.6 : 0.7;
  const subsidyRelated = keywordScore >= threshold;
  
  const documentType = subsidyRelated ? "補助金申請書" : "一般申請書";
  const moeRequiredTypes = ["補助金申請書", "研究費申請書", "設備導入申請書"];
  const paperStorageRequired = subsidyRelated && moeRequiredTypes.includes(documentType);
  const processingRoute = paperStorageRequired ? "hybrid" : "electronic";
  
  return { documentType, processingRoute, subsidyRelated, paperStorageRequired };
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
    console.warn("所属部署が未設定のため、標準の判定基準を適用します");
  }
  
  const subsidyKeywords = ["文部科学省", "補助金", "科研費", "運営費交付金"];
  const content = documentTitle + " " + documentContent;
  let keywordScore = 0;
  
  for (const keyword of subsidyKeywords) {
    if (content.includes(keyword)) {
      keywordScore += 0.25;
    }
  }
  
  const isResearchDept = applicantDepartment && applicantDepartment.includes("研究");
  const threshold = isResearchDept ? 0.6 : 0.7;
  const subsidyRelated = keywordScore >= threshold;
  
  const documentType = subsidyRelated ? "補助金申請書" : "一般申請書";
  const moeRequiredTypes = ["補助金申請書", "事業報告書", "会計報告書", "監査資料"];
  const paperStorageRequired = subsidyRelated && moeRequiredTypes.includes(documentType);
  const processingRoute = paperStorageRequired ? "hybrid" : "electronic";
  
  return { documentType, processingRoute, subsidyRelated, paperStorageRequired };
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
    throw new Error("補助金関連書類は紙保管が必要なため、ハイブリッド処理を選択してください");
  }
  
  if (approvalRoute.length === 0) {
    errors.push("承認者を設定してください");
  }
  
  const isValid = errors.length === 0;
  
  return { isValid, errors, warnings };
}

export function analyzeRegulationImpactScope(
  regulationChangeContent: string,
  affectedRegulationTypes: string[],
  currentDocumentTypes: DocumentType[]
): RegulationImpactAnalysis {
  if (!regulationChangeContent || regulationChangeContent.trim().length === 0) {
    throw new Error("法令改正の変更内容が正しく取得できていません。改正通知の受信処理を確認してください。");
  }
  
  if (!currentDocumentTypes || currentDocumentTypes.length === 0) {
    throw new Error("システムに登録されている文書種別の情報を取得できません。データベース接続を確認してください。");
  }
  
  const affectedRegulations = extractAffectedRegulations(regulationChangeContent, affectedRegulationTypes);
  const affectedTypes: string[] = [];
  const routeChanges: ProcessingRouteChange[] = [];
  
  for (const docType of currentDocumentTypes) {
    if (isRegulationMatch(docType.regulationCategory, affectedRegulations)) {
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

export function classifyLegalChangeImpactLevel(
  changeNotification: string,
  affectedDocumentTypes: string[],
  currentProcessingRules: object[],
  complianceDeadline: Date
): { impactLevel: string; priority: number; requiredResponseDays: number; affectedRuleCount: number; riskAssessment: string } {
  if (!changeNotification || changeNotification.trim().length === 0) {
    throw new Error("法令改正通知の内容が正しく取得できません。通知内容を確認してください。");
  }
  
  const currentDate = new Date();
  if (complianceDeadline < currentDate) {
    console.warn("施行日が過去の日付です。緊急対応が必要な可能性があります。");
  }
  
  if (affectedDocumentTypes.length === 0) {
    console.warn("この法令改正による直接的な影響は検出されませんでした。念のため手動確認を推奨します。");
  }
  
  const hasSubsidyRequirementChange = changeNotification.includes("補助金") || changeNotification.includes("交付要綱");
  const affectedRuleCount = currentProcessingRules.filter(rule => 
    affectedDocumentTypes.includes((rule as any).document_type)
  ).length;
  const daysUntilDeadline = Math.floor((complianceDeadline.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24));
  
  let impactLevel = "low";
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
  
  const riskAssessment = impactLevel === "high" ? "法令違反リスク高" : 
                        impactLevel === "medium" ? "業務遅延リスク中" : "影響軽微";
  
  return { impactLevel, priority, requiredResponseDays, affectedRuleCount, riskAssessment };
}

export function migrateExistingDataToNewClassification(
  newClassificationRules: ClassificationRule[],
  existingDocuments: Document[],
  migrationScope: string
): MigrationResult {
  if (!newClassificationRules || newClassificationRules.length === 0) {
    throw new Error("法令改正に基づく新しい分類基準が設定されていません。分類基準を確認してください。");
  }
  
  if (!existingDocuments || existingDocuments.length === 0) {
    throw new Error("既存の申請書類データにアクセスできません。システム管理者に連絡してください。");
  }
  
  if (!migrationScope) {
    console.warn("移行範囲の指定に問題があります。全ての書類を対象として処理を継続します。");
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

// その他の必要な関数をエクスポート（テストで使用されていないが、structured で定義されているもの）
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
  
  const approvers = [approvalLevel]; // 実際の実装では部署に基づいて具体的な承認者を取得
  
  return { approvalLevel, approvers, estimatedDays, requiresPaperApproval };
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
  
  const deadlineDate = new Date(submissionDate.getTime() + baseDays * 24 * 60 * 60 * 1000);
  const businessDays = baseDays;
  const notificationSchedule = ["2日前", "当日"];
  
  return { deadlineDate, businessDays, notificationSchedule };
}

// 追加のヘルパー関数
function addBusinessDays(date: Date, days: number): Date {
  const result = new Date(date);
  let addedDays = 0;
  
  while (addedDays < days) {
    result.setDate(result.getDate() + 1);
    // 土日をスキップ
    if (result.getDay() !== 0 && result.getDay() !== 6) {
      addedDays++;
    }
  }
  
  return result;
}

function getApproversByLevel(approvalLevel: string, department: string): string[] {
  // 実際の実装では部署と承認レベルに基づいて承認者を取得
  return [approvalLevel];
}

function calculateKeywordFrequency(title: string, content: string, keywords: string[]): number {
  const text = (title + " " + content).toLowerCase();
  let matches = 0;
  
  for (const keyword of keywords) {
    if (text.includes(keyword.toLowerCase())) {
      matches++;
    }
  }
  
  return matches / keywords.length;
}

function isMoeRegulatedDocumentType(documentType: string): boolean {
  const moeTypes = ["補助金申請書", "研究費申請書", "設備導入申請書", "事業報告書"];
  return moeTypes.includes(documentType);
}

function generatePaperFormUrl(applicationId: string): string {
  return `/forms/paper/${applicationId}.pdf`;
}

function getEmergencyContacts(approvers: string[]): string[] {
  // 実際の実装では承認者の緊急連絡先を取得
  return approvers.map(approver => `${approver}@university.ac.jp`);
}

function getApplicationInfo(applicationId: string): { type: string; priority: string; approvers: string[] } {
  // 実際の実装ではDBから取得
  return {
    type: "subsidy",
    priority: "high",
    approvers: ["承認者1", "承認者2"]
  };
}