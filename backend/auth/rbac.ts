export type Role = 'admin' | 'operator' | 'viewer';

export interface User {
  id: string;
  role: Role;
  permissions: string[];
}

export const PERMISSIONS = {
  // ユーザー管理
  USER_READ: 'user:read',
  USER_WRITE: 'user:write',
  USER_DELETE: 'user:delete',
  
  // 申請書類管理
  APPLICATION_READ: 'application:read',
  APPLICATION_WRITE: 'application:write',
  APPLICATION_DELETE: 'application:delete',
  
  // 文書種別マスタ管理
  DOCUMENT_TYPE_READ: 'document_type:read',
  DOCUMENT_TYPE_WRITE: 'document_type:write',
  DOCUMENT_TYPE_DELETE: 'document_type:delete',
  
  // 承認フロー定義管理
  APPROVAL_FLOW_READ: 'approval_flow:read',
  APPROVAL_FLOW_WRITE: 'approval_flow:write',
  APPROVAL_FLOW_DELETE: 'approval_flow:delete',
  
  // 承認ステップ管理
  APPROVAL_STEP_READ: 'approval_step:read',
  APPROVAL_STEP_WRITE: 'approval_step:write',
  APPROVAL_STEP_DELETE: 'approval_step:delete',
  
  // 承認履歴管理
  APPROVAL_HISTORY_READ: 'approval_history:read',
  APPROVAL_HISTORY_WRITE: 'approval_history:write',
  APPROVAL_HISTORY_DELETE: 'approval_history:delete',
  
  // 通知履歴管理
  NOTIFICATION_READ: 'notification:read',
  NOTIFICATION_WRITE: 'notification:write',
  NOTIFICATION_DELETE: 'notification:delete',
  
  // 処理ルート管理
  PROCESS_ROUTE_READ: 'process_route:read',
  PROCESS_ROUTE_WRITE: 'process_route:write',
  PROCESS_ROUTE_DELETE: 'process_route:delete',
  
  // 遅延検知設定管理
  DELAY_DETECTION_READ: 'delay_detection:read',
  DELAY_DETECTION_WRITE: 'delay_detection:write',
  DELAY_DETECTION_DELETE: 'delay_detection:delete',
  
  // 補助金関連度マスタ管理
  SUBSIDY_RELATION_READ: 'subsidy_relation:read',
  SUBSIDY_RELATION_WRITE: 'subsidy_relation:write',
  SUBSIDY_RELATION_DELETE: 'subsidy_relation:delete',
  
  // 一括操作
  BULK_IMPORT: 'bulk:import',
  
  // 監査ログ
  AUDIT_READ: 'audit:read'
} as const;

export const ROLE_PERMISSIONS: Record<Role, string[]> = {
  admin: Object.values(PERMISSIONS),
  operator: [
    PERMISSIONS.USER_READ,
    PERMISSIONS.APPLICATION_READ,
    PERMISSIONS.APPLICATION_WRITE,
    PERMISSIONS.DOCUMENT_TYPE_READ,
    PERMISSIONS.DOCUMENT_TYPE_WRITE,
    PERMISSIONS.APPROVAL_FLOW_READ,
    PERMISSIONS.APPROVAL_FLOW_WRITE,
    PERMISSIONS.APPROVAL_STEP_READ,
    PERMISSIONS.APPROVAL_STEP_WRITE,
    PERMISSIONS.APPROVAL_HISTORY_READ,
    PERMISSIONS.APPROVAL_HISTORY_WRITE,
    PERMISSIONS.NOTIFICATION_READ,
    PERMISSIONS.NOTIFICATION_WRITE,
    PERMISSIONS.PROCESS_ROUTE_READ,
    PERMISSIONS.PROCESS_ROUTE_WRITE,
    PERMISSIONS.DELAY_DETECTION_READ,
    PERMISSIONS.DELAY_DETECTION_WRITE,
    PERMISSIONS.SUBSIDY_RELATION_READ,
    PERMISSIONS.SUBSIDY_RELATION_WRITE,
    PERMISSIONS.BULK_IMPORT,
    PERMISSIONS.AUDIT_READ
  ],
  viewer: [
    PERMISSIONS.USER_READ,
    PERMISSIONS.APPLICATION_READ,
    PERMISSIONS.DOCUMENT_TYPE_READ,
    PERMISSIONS.APPROVAL_FLOW_READ,
    PERMISSIONS.APPROVAL_STEP_READ,
    PERMISSIONS.APPROVAL_HISTORY_READ,
    PERMISSIONS.NOTIFICATION_READ,
    PERMISSIONS.PROCESS_ROUTE_READ,
    PERMISSIONS.DELAY_DETECTION_READ,
    PERMISSIONS.SUBSIDY_RELATION_READ,
    PERMISSIONS.AUDIT_READ
  ]
};

export function hasPermission(user: User, permission: string): boolean {
  return user.permissions.includes(permission);
}

export function createUser(id: string, role: Role): User {
  return {
    id,
    role,
    permissions: ROLE_PERMISSIONS[role]
  };
}