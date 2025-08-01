import { useAuth } from '../useAuth';
import { useMemo, useCallback } from 'react';

export type Permission = 
  | 'tips.create'
  | 'tips.edit'
  | 'tips.delete'
  | 'tips.publish'
  | 'admin.access'
  | 'analytics.view';

const rolePermissions: Record<string, Permission[]> = {
  admin: [
    'tips.create',
    'tips.edit',
    'tips.delete',
    'tips.publish',
    'admin.access',
    'analytics.view',
  ],
  editor: [
    'tips.create',
    'tips.edit',
    'analytics.view',
  ],
  viewer: [
    'analytics.view',
  ],
};

export function usePermissions() {
  const { user } = useAuth();

  const permissions = useMemo(() => {
    if (!user) return [];
    
    // Get role from user metadata or default to viewer
    const role = user.user_metadata?.role || 'viewer';
    return rolePermissions[role] || [];
  }, [user]);

  const hasPermission = useCallback((permission: Permission) => {
    return permissions.includes(permission);
  }, [permissions]);

  const hasAnyPermission = useCallback((perms: Permission[]) => {
    return perms.some(perm => permissions.includes(perm));
  }, [permissions]);

  const hasAllPermissions = useCallback((perms: Permission[]) => {
    return perms.every(perm => permissions.includes(perm));
  }, [permissions]);

  return {
    permissions,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
  };
}