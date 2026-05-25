export interface SystemFailureRequest {
  applicationId: string;
  failureType: string;
  severity: string;
}

export interface SystemFailureResult {
  fallbackMethod: string;
  emergencyContactList: string[];
  paperFormUrl: string;
  syncRequired: boolean;
}

export function handleSystemFailure(request: SystemFailureRequest): SystemFailureResult {
  if (request.severity === "critical" || request.failureType === "database_failure") {
    return {
      fallbackMethod: "emergency_paper",
      emergencyContactList: ["contact1@university.ac.jp", "contact2@university.ac.jp"],
      paperFormUrl: "https://system.university.ac.jp/forms/APP_20240115_001.pdf",
      syncRequired: true
    };
  }

  return {
    fallbackMethod: "system_recovery",
    emergencyContactList: [],
    paperFormUrl: "",
    syncRequired: false
  };
}

export interface ViewPermissionRequest {
  userId: string;
  userRole: string;
  applicationId: string;
}

export interface ViewPermissionResult {
  canView: boolean;
  viewLevel: string;
  allowedFields: string[];
}

export function checkViewPermission(request: ViewPermissionRequest): ViewPermissionResult {
  // 管理者権限での全案件表示
  if (request.userRole === "admin") {
    return {
      canView: true,
      viewLevel: "progress",
      allowedFields: ["status", "currentApprover"]
    };
  }

  // 一般ユーザーは制限あり
  if (request.userRole === "user") {
    return {
      canView: true,
      viewLevel: "basic",
      allowedFields: ["status"]
    };
  }

  // その他は閲覧不可
  return {
    canView: false,
    viewLevel: "none",
    allowedFields: []
  };
}