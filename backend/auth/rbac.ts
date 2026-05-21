export type Role = 'admin' | 'operator' | 'viewer';

export interface Permission {
  resource: string;
  action: 'create' | 'read' | 'update' | 'delete' | 'bulk';
}

const rolePermissions: Record<Role, Permission[]> = {
  admin: [
    { resource: '*', action: 'create' },
    { resource: '*', action: 'read' },
    { resource: '*', action: 'update' },
    { resource: '*', action: 'delete' },
    { resource: '*', action: 'bulk' }
  ],
  operator: [
    { resource: '*', action: 'create' },
    { resource: '*', action: 'read' },
    { resource: '*', action: 'update' },
    { resource: '*', action: 'bulk' }
  ],
  viewer: [
    { resource: '*', action: 'read' }
  ]
};

export function hasPermission(role: Role, resource: string, action: Permission['action']): boolean {
  const permissions = rolePermissions[role] || [];
  return permissions.some(p => 
    (p.resource === '*' || p.resource === resource) && p.action === action
  );
}

export function extractRole(event: any): Role {
  const role = event.headers?.['x-user-role'] || event.requestContext?.authorizer?.role || 'viewer';
  return ['admin', 'operator', 'viewer'].includes(role) ? role as Role : 'viewer';
}

export function extractUserId(event: any): string {
  return event.headers?.['x-user-id'] || event.requestContext?.authorizer?.userId || 'system';
}