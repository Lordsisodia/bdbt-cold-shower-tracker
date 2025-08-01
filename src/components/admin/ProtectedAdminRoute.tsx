import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/auth/useAuth';

interface ProtectedAdminRouteProps {
  children: React.ReactNode;
}

export const ProtectedAdminRoute: React.FC<ProtectedAdminRouteProps> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Check if user has admin role
  const isAdmin = user?.user_metadata?.role === 'admin' || user?.email?.endsWith('@bdbt.com');

  if (!user || !isAdmin) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};