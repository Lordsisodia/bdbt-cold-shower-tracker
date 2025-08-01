import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { LoadingSpinner } from '../ui';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  requireEmailVerification?: boolean;
  requiredRole?: string;
  fallbackPath?: string;
  showLoadingSpinner?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requireAuth = true,
  requireEmailVerification = false,
  requiredRole,
  fallbackPath = '/auth/login',
  showLoadingSpinner = true
}) => {
  const { 
    isAuthenticated, 
    isEmailVerified, 
    hasRole, 
    isLoading, 
    user 
  } = useAuth();
  const location = useLocation();

  // Show loading spinner while checking auth state
  if (isLoading && showLoadingSpinner) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  // Check if authentication is required
  if (requireAuth && !isAuthenticated) {
    // Save the attempted location for redirect after login
    return (
      <Navigate 
        to={fallbackPath} 
        state={{ from: location }} 
        replace 
      />
    );
  }

  // Check if email verification is required
  if (requireEmailVerification && isAuthenticated && !isEmailVerified) {
    return (
      <Navigate 
        to="/auth/verify-email" 
        state={{ from: location, email: user?.email }} 
        replace 
      />
    );
  }

  // Check if specific role is required
  if (requiredRole && isAuthenticated && !hasRole(requiredRole)) {
    return (
      <Navigate 
        to="/unauthorized" 
        state={{ from: location, requiredRole }} 
        replace 
      />
    );
  }

  return <>{children}</>;
};

// Higher-order component version for easier usage
export const withProtectedRoute = (
  Component: React.ComponentType<any>,
  options?: Omit<ProtectedRouteProps, 'children'>
) => {
  return (props: any) => (
    <ProtectedRoute {...options}>
      <Component {...props} />
    </ProtectedRoute>
  );
};

// Specific protected route components for common use cases
export const AuthenticatedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ProtectedRoute requireAuth={true}>
    {children}
  </ProtectedRoute>
);

export const VerifiedEmailRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ProtectedRoute requireAuth={true} requireEmailVerification={true}>
    {children}
  </ProtectedRoute>
);

export const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ProtectedRoute requireAuth={true} requiredRole="admin" fallbackPath="/unauthorized">
    {children}
  </ProtectedRoute>
);

export const GuestRoute: React.FC<{ children: React.ReactNode; redirectTo?: string }> = ({ 
  children, 
  redirectTo = '/admin/dashboard' 
}) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  // If user is already authenticated, redirect them away from guest-only pages
  if (isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;