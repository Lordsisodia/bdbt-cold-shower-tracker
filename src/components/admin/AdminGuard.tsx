import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { LoadingOverlay } from '../ui/LoadingOverlay';
import { toast } from 'react-hot-toast';

interface AdminGuardProps {
  children: React.ReactNode;
  requiredPermissions?: string[];
  requireSuperAdmin?: boolean;
  redirectTo?: string;
}

export const AdminGuard: React.FC<AdminGuardProps> = ({
  children,
  requiredPermissions = [],
  requireSuperAdmin = false,
  redirectTo = '/unauthorized'
}) => {
  const { user, isLoading, hasRole, hasPermission } = useAuth();
  const location = useLocation();

  useEffect(() => {
    // Log admin access attempts for security
    if (user && hasRole('admin')) {
      console.log(`Admin access: ${user.email} at ${location.pathname}`);
    }
  }, [user, location.pathname, hasRole]);

  if (isLoading) {
    return <LoadingOverlay isLoading={true} message="Verifying admin access..." />;
  }

  // Check basic admin role
  if (!user || !hasRole('admin')) {
    toast.error('Admin access required');
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  // Check super admin requirement
  if (requireSuperAdmin && !hasRole('super_admin')) {
    toast.error('Super admin access required');
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  // Check specific permissions
  if (requiredPermissions.length > 0) {
    const hasAllPermissions = requiredPermissions.every(permission => 
      hasPermission(permission)
    );

    if (!hasAllPermissions) {
      toast.error('Insufficient permissions');
      return <Navigate to={redirectTo} state={{ from: location }} replace />;
    }
  }

  return <>{children}</>;
};

// Specialized admin route guards
export const SuperAdminGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <AdminGuard requireSuperAdmin={true}>
    {children}
  </AdminGuard>
);

export const ContentManagerGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <AdminGuard requiredPermissions={['manage_content', 'view_content']}>
    {children}
  </AdminGuard>
);

export const UserManagerGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <AdminGuard requiredPermissions={['manage_users', 'view_users']}>
    {children}
  </AdminGuard>
);

export const AnalyticsGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <AdminGuard requiredPermissions={['view_analytics']}>
    {children}
  </AdminGuard>
);

// Hook for checking admin permissions in components
export const useAdminPermissions = () => {
  const { user, hasRole, hasPermission } = useAuth();

  return {
    isAdmin: hasRole('admin'),
    isSuperAdmin: hasRole('super_admin'),
    canManageContent: hasPermission('manage_content'),
    canManageUsers: hasPermission('manage_users'),
    canViewAnalytics: hasPermission('view_analytics'),
    canManageSettings: hasPermission('manage_settings'),
    canExportData: hasPermission('export_data'),
    canBulkOperation: hasPermission('bulk_operations'),
  };
};