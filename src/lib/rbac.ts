export type AdminRole = 'SUPER_ADMIN' | 'FINANCE_ADMIN' | 'SUPPORT_ADMIN';

export type Permission =
  | '*'
  | 'users'
  | 'coupons'
  | 'refunds'
  | 'payouts'
  | 'commission'
  | 'tickets'
  | 'chats'
  | 'audit_logs'
  | 'security'
  | 'system';

export const ROLE_PERMISSIONS: Record<AdminRole, Permission[]> = {
  SUPER_ADMIN: ['*'],
  FINANCE_ADMIN: ['coupons', 'refunds', 'payouts', 'commission'],
  SUPPORT_ADMIN: ['tickets', 'chats', 'users', 'audit_logs'],
};

export function hasPermission(
  userRole: string,
  userPermissions: string | null | undefined,
  requiredPermission: Permission
): boolean {
  if (userRole !== 'ADMIN') return false;

  // Default to SUPER_ADMIN if no specific role set
  if (!userPermissions || userPermissions === '*' || userPermissions.includes('*')) {
    return true;
  }

  try {
    const perms: string[] = JSON.parse(userPermissions);
    return perms.includes('*') || perms.includes(requiredPermission);
  } catch (e) {
    // If comma separated string
    const perms = userPermissions.split(',').map((p) => p.trim());
    return perms.includes('*') || perms.includes(requiredPermission);
  }
}
