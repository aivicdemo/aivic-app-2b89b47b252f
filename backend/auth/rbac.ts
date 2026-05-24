export type Role = 'admin' | 'operator' | 'viewer';

export interface User {
  id: string;
  role: Role;
  permissions: string[];
}

export const PERMISSIONS = {
  USERS_READ: 'users:read',
  USERS_WRITE: 'users:write',
  APPLICATIONS_READ: 'applications:read',
  APPLICATIONS_WRITE: 'applications:write',
  DOCUMENT_TYPES_READ: 'document_types:read',
  DOCUMENT_TYPES_WRITE: 'document_types:write',
  APPROVAL_FLOWS_READ: 'approval_flows:read',
  APPROVAL_FLOWS_WRITE: 'approval_flows:write',
  APPROVAL_STEPS_READ: 'approval_steps:read',
  APPROVAL_STEPS_WRITE: 'approval_steps:write',
  APPROVAL_HISTORY_READ: 'approval_history:read',
  APPROVAL_HISTORY_WRITE: 'approval_history:write',
  NOTIFICATION_HISTORY_READ: 'notification_history:read',
  NOTIFICATION_HISTORY_WRITE: 'notification_history:write',
  PROCESSING_ROUTES_READ: 'processing_routes:read',
  PROCESSING_ROUTES_WRITE: 'processing_routes:write',
  DELAY_DETECTION_READ: 'delay_detection:read',
  DELAY_DETECTION_WRITE: 'delay_detection:write',
  SUBSIDY_RELATION_READ: 'subsidy_relation:read',
  SUBSIDY_RELATION_WRITE: 'subsidy_relation:write',
  BULK_IMPORT: 'bulk:import'
} as const;

export const ROLE_PERMISSIONS: Record<Role, string[]> = {
  admin: Object.values(PERMISSIONS),
  operator: [
    PERMISSIONS.USERS_READ,
    PERMISSIONS.APPLICATIONS_READ,
    PERMISSIONS.APPLICATIONS_WRITE,
    PERMISSIONS.DOCUMENT_TYPES_READ,
    PERMISSIONS.APPROVAL_FLOWS_READ,
    PERMISSIONS.APPROVAL_STEPS_READ,
    PERMISSIONS.APPROVAL_STEPS_WRITE,
    PERMISSIONS.APPROVAL_HISTORY_READ,
    PERMISSIONS.APPROVAL_HISTORY_WRITE,
    PERMISSIONS.NOTIFICATION_HISTORY_READ,
    PERMISSIONS.PROCESSING_ROUTES_READ,
    PERMISSIONS.PROCESSING_ROUTES_WRITE,
    PERMISSIONS.DELAY_DETECTION_READ,
    PERMISSIONS.SUBSIDY_RELATION_READ,
    PERMISSIONS.BULK_IMPORT
  ],
  viewer: [
    PERMISSIONS.USERS_READ,
    PERMISSIONS.APPLICATIONS_READ,
    PERMISSIONS.DOCUMENT_TYPES_READ,
    PERMISSIONS.APPROVAL_FLOWS_READ,
    PERMISSIONS.APPROVAL_STEPS_READ,
    PERMISSIONS.APPROVAL_HISTORY_READ,
    PERMISSIONS.NOTIFICATION_HISTORY_READ,
    PERMISSIONS.PROCESSING_ROUTES_READ,
    PERMISSIONS.DELAY_DETECTION_READ,
    PERMISSIONS.SUBSIDY_RELATION_READ
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