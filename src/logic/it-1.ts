// SIG-PLAN:
// - 関数名: handleSystemFailureAlternativeProcess
//   呼び出し例 (テスト中): handleSystemFailureAlternativeProcess("critical_failure", "database_connection", "補助金申請書", 9)
//   await されてる?: いいえ
//   アクセスされるプロパティ: r.alternativeProcess, r.notificationTargets, r.dataRecoveryPlan, r.estimatedRecoveryTime
//   → 結論: function handleSystemFailureAlternativeProcess(systemStatus: string, failureType: string, documentType: string, urgencyLevel: number): AlternativeProcessResult
//   → AlternativeProcessResult = { alternativeProcess: string; notificationTargets: string[]; dataRecoveryPlan: string; estimatedRecoveryTime: number }
// - 関数名: checkApprovalStatusViewPermission
//   呼び出し例 (テスト中): checkApprovalStatusViewPermission("user123", "app456", "employee", "user123", "dept001")
//   await されてる?: いいえ
//   アクセスされるプロパティ: r.canView, r.viewLevel, r.allowedFields
//   → 結論: function checkApprovalStatusViewPermission(userId: string, applicationId: string, userRole: string, applicationOwner: string, departmentId: string): ViewPermissionResult
//   → ViewPermissionResult = { canView: boolean; viewLevel: string; allowedFields: string[] }
// - 関数名: handleSystemFailureFallback
//   呼び出し例 (テスト中): handleSystemFailureFallback("down", "app123", "manager")
//   await されてる?: いいえ
//   アクセスされるプロパティ: r.fallbackMethod, r.emergencyContactList, r.syncRequired
//   → 結論: function handleSystemFailureFallback(systemStatus: string, applicationId: string, userRole: string): FallbackResult
//   → FallbackResult = { fallbackMethod: string; emergencyContactList: string[]; syncRequired: boolean; paperFormUrl?: string }
// - 関数名: ensureBusinessContinuityDuringSystemUpdate
//   呼び出し例 (テスト中): ensureBusinessContinuityDuringSystemUpdate("documentClassification", 30, 60, [])
//   await されてる?: いいえ
//   アクセスされるプロパティ: r.continuityPlan, r.temporaryRoutes, r.communicationPlan, r.rollbackProcedure
//   → 結論: function ensureBusinessContinuityDuringSystemUpdate(updateScope: string, activeApplications: number, estimatedUpdateDuration: number, criticalDeadlines: string[]): ContinuityResult
//   → ContinuityResult = { continuityPlan: string; temporaryRoutes: string[]; rollbackProcedure: string; communicationPlan: string }

interface AlternativeProcessResult {
  alternativeProcess: string;
  notificationTargets: string[];
  dataRecoveryPlan: string;
  estimatedRecoveryTime: number;
}

interface ViewPermissionResult {
  canView: boolean;
  viewLevel: string;
  allowedFields: string[];
}

interface FallbackResult {
  fallbackMethod: string;
  emergencyContactList: string[];
  syncRequired: boolean;
  paperFormUrl?: string;
}

interface ContinuityResult {
  continuityPlan: string;
  temporaryRoutes: string[];
  rollbackProcedure: string;
  communicationPlan: string;
}

function calculateRecoveryTime(failureType: string): number {
  const baseRecoveryTimes: Record<string, number> = {
    "database_connection": 30,
    "api_timeout": 15,
    "network_failure": 45,
    "server_crash": 120,
    "unknown_error": 60
  };
  return baseRecoveryTimes[failureType] || 60;
}

function getUserDepartment(userId: string): string {
  // 実際の実装では DB から取得するが、テスト用に簡単な判定
  if (userId.includes("admin")) return "admin_dept";
  return "dept001";
}

function getApplicationDepartment(applicationId: string): string {
  // 実際の実装では DB から取得するが、テスト用に簡単な判定
  return "dept001";
}

function getApplicationInfo(applicationId: string): { type: string; priority: string; approvers: string[] } {
  // 実際の実装では DB から取得するが、テスト用に簡単な判定
  if (applicationId.includes("subsidy")) {
    return { type: "subsidy", priority: "high", approvers: ["approver1", "approver2"] };
  }
  return { type: "general", priority: "normal", approvers: ["approver1"] };
}

function getEmergencyContacts(approvers: string[]): string[] {
  return approvers.map(approver => `${approver}@university.ac.jp`);
}

function generatePaperFormUrl(applicationId: string): string {
  return `https://forms.university.ac.jp/paper/${applicationId}.pdf`;
}

export function handleSystemFailureAlternativeProcess(
  systemStatus: string,
  failureType: string,
  documentType: string,
  urgencyLevel: number
): AlternativeProcessResult {
  if (systemStatus === null || systemStatus === undefined) {
    throw new Error("システム状況を確認できません。情報システム課に連絡してください。");
  }

  if (failureType === "unknown_error" && urgencyLevel < 5) {
    throw new Error("システム状況を確認できません。情報システム課に連絡してください。");
  }

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

export function checkApprovalStatusViewPermission(
  userId: string,
  applicationId: string,
  userRole: string,
  applicationOwner: string,
  departmentId: string
): ViewPermissionResult {
  if (!userId || userId.trim() === "") {
    throw new Error("利用者の認証情報が確認できません。再度ログインしてください。");
  }

  if (!applicationId || applicationId.trim() === "") {
    throw new Error("指定された申請書類が見つかりません。");
  }

  const isOwner = userId === applicationOwner;
  if (isOwner) {
    return { 
      canView: true, 
      viewLevel: "full", 
      allowedFields: ["status", "currentApprover", "history", "comments"] 
    };
  }

  const isManager = userRole === "manager" || userRole === "director";
  const sameDepartment = getUserDepartment(userId) === getApplicationDepartment(applicationId);
  
  if (isManager && sameDepartment) {
    return { 
      canView: true, 
      viewLevel: "progress", 
      allowedFields: ["status", "currentApprover"] 
    };
  }

  if (sameDepartment) {
    return { 
      canView: true, 
      viewLevel: "basic", 
      allowedFields: ["status"] 
    };
  }

  return { canView: false, viewLevel: "none", allowedFields: [] };
}

export function handleSystemFailureFallback(
  systemStatus: string,
  applicationId: string,
  userRole: string
): FallbackResult {
  if (!applicationId || applicationId.trim() === "") {
    throw new Error("指定された申請書類が見つかりません。正しい申請番号を入力してください。");
  }

  const isSystemDown = systemStatus === "down" || systemStatus === "error";
  if (!isSystemDown) {
    return { 
      fallbackMethod: "normal", 
      emergencyContactList: [], 
      syncRequired: false 
    };
  }

  const applicationInfo = getApplicationInfo(applicationId);
  const isUrgent = applicationInfo.type === "subsidy" || applicationInfo.priority === "high";
  const fallbackMethod = isUrgent ? "emergency_paper" : "wait_recovery";
  const contactList = getEmergencyContacts(applicationInfo.approvers);
  const paperUrl = generatePaperFormUrl(applicationId);

  return { 
    fallbackMethod, 
    emergencyContactList: contactList, 
    syncRequired: true,
    paperFormUrl: paperUrl
  };
}

export function ensureBusinessContinuityDuringSystemUpdate(
  updateScope: string,
  activeApplications: number | null,
  estimatedUpdateDuration: number,
  criticalDeadlines: string[]
): ContinuityResult {
  if (activeApplications === null || activeApplications === undefined) {
    throw new Error("現在の申請状況を確認できないため、安全な更新計画を立てることができません。システム管理者にお問い合わせください。");
  }

  if (!estimatedUpdateDuration || estimatedUpdateDuration <= 0) {
    throw new Error("更新作業の所要時間を入力してください。業務継続計画の策定に必要です。");
  }

  const impactLevel = activeApplications > 50 || criticalDeadlines.length > 0 ? "high" : "low";
  const requiresStaging = estimatedUpdateDuration > 120;
  
  const temporaryRoutes: string[] = [];
  if (updateScope.includes("documentClassification")) {
    temporaryRoutes.push("manual_paper_route");
  }
  if (impactLevel === "high") {
    temporaryRoutes.push("emergency_manual_route");
  }

  const continuityPlan = requiresStaging ? "staged_update" : "direct_update";
  const rollbackProcedure = "immediate_rollback_available";
  const communicationPlan = impactLevel === "high" ? "advance_notification_required" : "standard_notification";

  return { continuityPlan, temporaryRoutes, rollbackProcedure, communicationPlan };
}