// SIG-PLAN:
// - 関数名: validateApplicationBeforeSubmission
//   呼び出し例 (テスト中): validateApplicationBeforeSubmission(title, content, type, route, approvers, fields)
//   await されてる?: いいえ
//   アクセスされるプロパティ: result.isValid, result.errors, result.warnings
//   → 結論: function validateApplicationBeforeSubmission(title: string, content: string, type: string, route: string, approvers: string[], fields: Record<string, any>): { isValid: boolean; errors: string[]; warnings: string[] }
//
// - 関数名: analyzeRegulationImpactScope
//   呼び出し例 (テスト中): analyzeRegulationImpactScope(content, types, documents)
//   await されてる?: いいえ
//   アクセスされるプロパティ: result.affectedDocumentTypes, result.changeRequiredCount
//   → 結論: function analyzeRegulationImpactScope(content: string, types: string[], documents: Array<{typeName: string, regulationCategory: string, storageRequirement: string}>): { affectedDocumentTypes: string[]; changeRequiredCount: number; ... }
//
// - 関数名: classifyLegalChangeImpactLevel
//   呼び出し例 (テスト中): classifyLegalChangeImpactLevel(content, types, rules, deadline)
//   await されてる?: いいえ
//   アクセスされるプロパティ: result.impactLevel, result.priority, result.requiredResponseDays, result.affectedRuleCount
//   → 結論: function classifyLegalChangeImpactLevel(content: string, types: string[], rules: any[], deadline: Date): { impactLevel: string; priority: number; requiredResponseDays: number; affectedRuleCount: number; ... }
//
// - 関数名: migrateExistingDataToNewClassification
//   呼び出し例 (テスト中): migrateExistingDataToNewClassification(rules, documents, scope)
//   await されてる?: いいえ
//   アクセスされるプロパティ: result.migratedCount, result.skippedCount, result.errorCount, result.updatedRoutes
//   → 結論: function migrateExistingDataToNewClassification(rules: any[], documents: any[], scope: string): { migratedCount: number; skippedCount: number; errorCount: number; updatedRoutes: any[] }

interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
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

interface LegalChangeImpactResult {
  impactLevel: string;
  priority: number;
  requiredResponseDays: number;
  affectedRuleCount: number;
  riskAssessment: string;
}

interface MigrationResult {
  migratedCount: number;
  skippedCount: number;
  errorCount: number;
  updatedRoutes: RouteUpdate[];
}

interface RouteUpdate {
  documentId: string;
  oldRoute: string;
  newRoute: string;
}

function validateApplicationBeforeSubmission(
  documentTitle: string,
  documentContent: string,
  documentType: string,
  processingRoute: string,
  approvalRoute: string[],
  requiredFields: Record<string, any>
): ValidationResult {
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
    errors.push("補助金関連書類は紙保管が必要なため、ハイブリッド処理を選択してください");
  }
  
  if (approvalRoute.length === 0) {
    errors.push("承認者を1名以上設定してください");
  }
  
  const isValid = errors.length === 0;
  
  return { isValid, errors, warnings };
}

function analyzeRegulationImpactScope(
  regulationChangeContent: string,
  affectedRegulationTypes: string[],
  currentDocumentTypes: Array<{typeName: string, regulationCategory: string, storageRequirement: string}>
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
  
  const impactLevel = routeChanges.length === 0 ? "軽微" : routeChanges.length <= 5 ? "中程度" : "重大";
  
  if (affectedTypes.length > 100) {
    console.warn("影響範囲が非常に広範囲です。段階的な対応計画の策定を推奨します。");
  }
  
  return { 
    affectedDocumentTypes: affectedTypes, 
    processingRouteChanges: routeChanges, 
    impactLevel: impactLevel, 
    changeRequiredCount: routeChanges.length 
  };
}

function extractAffectedRegulations(content: string, types: string[]): string[] {
  const keywords = ["補助金", "申請書", "保存", "電子", "紙"];
  return types.filter(type => 
    keywords.some(keyword => content.includes(keyword) && type.includes(keyword))
  );
}

function isRegulationMatch(category: string, affectedRegulations: string[]): boolean {
  return affectedRegulations.some(regulation => category.includes(regulation) || regulation.includes(category));
}

function determineNewProcessingRoute(docType: any, content: string): string {
  if (content.includes("電子保存") && content.includes("要件")) {
    return docType.storageRequirement === "paper" ? "hybrid" : "electronic";
  }
  return docType.storageRequirement;
}

function classifyLegalChangeImpactLevel(
  changeNotification: string,
  affectedDocumentTypes: string[],
  currentProcessingRules: any[],
  complianceDeadline: Date
): LegalChangeImpactResult {
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
    affectedDocumentTypes.includes(rule.document_type)
  ).length;
  const daysUntilDeadline = Math.floor((complianceDeadline.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
  
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
  
  const riskAssessment = impactLevel === "high" ? "法令違反リスク高" : impactLevel === "medium" ? "業務遅延リスク中" : "影響軽微";
  
  return { impactLevel, priority, requiredResponseDays, affectedRuleCount, riskAssessment };
}

function migrateExistingDataToNewClassification(
  newClassificationRules: any[],
  existingDocuments: any[],
  migrationScope: string
): MigrationResult {
  if (!newClassificationRules || newClassificationRules.length === 0) {
    throw new Error("法令改正に基づく新しい分類基準が設定されていません。分類基準を確認してください。");
  }

  if (!existingDocuments || existingDocuments.length === 0) {
    throw new Error("既存の申請書類データにアクセスできません。システム管理者に連絡してください。");
  }

  if (!migrationScope || migrationScope.trim().length === 0) {
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

function isInMigrationScope(doc: any, scope: string): boolean {
  return scope === "補助金関連書類" ? doc.document_type.includes("補助金") : true;
}

function applyNewRules(document: any, rules: any[]): any {
  const rule = rules.find(r => r.documentType === document.document_type);
  return rule || { processingRoute: document.current_processing_route };
}

function updateDocumentRoute(documentId: string, classification: any): void {
  // データベース更新処理（実装では省略）
}

export {
  validateApplicationBeforeSubmission,
  analyzeRegulationImpactScope,
  classifyLegalChangeImpactLevel,
  migrateExistingDataToNewClassification
};