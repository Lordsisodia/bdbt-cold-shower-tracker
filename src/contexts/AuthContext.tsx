import type { AuthError } from '@supabase/supabase-js';
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { authService, AuthState, AuthUser, OAuthProvider, SignInData, SignUpData } from '../services/authService';

interface AuthContextType extends AuthState {
  // Auth methods
  signUp: (data: SignUpData) => Promise<{ error: AuthError | null }>;
  signIn: (data: SignInData) => Promise<{ error: AuthError | null }>;
  signInWithOAuth: (provider: OAuthProvider) => Promise<{ error: AuthError | null }>;
  signOut: () => Promise<{ error: AuthError | null }>;
  resetPassword: (email: string) => Promise<{ error: AuthError | null }>;
  updatePassword: (password: string) => Promise<{ error: AuthError | null }>;
  updateProfile: (updates: { email?: string; password?: string; data?: Record<string, any> }) => Promise<{ error: AuthError | null }>;
  refreshSession: () => Promise<{ error: AuthError | null }>;
  resendConfirmation: (email: string) => Promise<{ error: AuthError | null }>;
  
  // Utility methods
  isAuthenticated: boolean;
  isEmailVerified: boolean;
  hasRole: (role: string) => boolean;
  validatePassword: (password: string) => { isValid: boolean; errors: string[]; strength: 'weak' | 'medium' | 'strong' };
  validateEmail: (email: string) => boolean;
  
  // Guest mode
  continueAsGuest: () => void;
  isGuest: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [state, setState] = useState<AuthState>({
    user: null,
    session: null,
    isLoading: true,
    error: null
  });
  
  const [isGuest, setIsGuest] = useState(false);

  useEffect(() => {
    let mounted = true;

    // Initialize auth state
    const initializeAuth = async () => {
      try {
        // Get current session
        const { session, error: sessionError } = await authService.getCurrentSession();
        
        if (mounted) {
          setState(prev => ({
            ...prev,
            session,
            user: session?.user as AuthUser || null,
            isLoading: false,
            error: sessionError
          }));
        }
      } catch (error) {
        if (mounted) {
          setState(prev => ({
            ...prev,
            isLoading: false,
            error: error as AuthError
          }));
        }
      }
    };

    initializeAuth();

    // Set up auth state listener
    const { data: { subscription } } = authService.setupAuthListener();

    // Subscribe to auth service state changes
    const unsubscribe = authService.onAuthStateChange((newState) => {
      if (mounted) {
        setState(newState);
        setIsGuest(false); // Reset guest mode when auth state changes
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
      unsubscribe();
    };
  }, []);

  // Auth methods
  const signUp = async (data: SignUpData) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    const response = await authService.signUp(data);
    
    setState(prev => ({
      ...prev,
      isLoading: false,
      error: response.error,
      user: response.data.user as AuthUser,
      session: response.data.session
    }));

    return { error: response.error };
  };

  const signIn = async (data: SignInData) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    const response = await authService.signIn(data);
    
    setState(prev => ({
      ...prev,
      isLoading: false,
      error: response.error,
      user: response.data.user as AuthUser,
      session: response.data.session
    }));

    setIsGuest(false);
    return { error: response.error };
  };

  const signInWithOAuth = async (provider: OAuthProvider) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    const response = await authService.signInWithOAuth(provider);
    
    setState(prev => ({
      ...prev,
      isLoading: false,
      error: response.error
    }));

    return { error: response.error };
  };

  const signOut = async () => {
    setState(prev => ({ ...prev, isLoading: true }));
    
    const response = await authService.signOut();
    
    setState(prev => ({
      ...prev,
      user: null,
      session: null,
      isLoading: false,
      error: response.error
    }));

    setIsGuest(false);
    return response;
  };

  const resetPassword = async (email: string) => {
    const response = await authService.resetPassword(email);
    return response;
  };

  const updatePassword = async (password: string) => {
    const response = await authService.updatePassword(password);
    
    if (response.data.user) {
      setState(prev => ({
        ...prev,
        user: response.data.user as AuthUser,
        error: response.error
      }));
    }

    return { error: response.error };
  };

  const updateProfile = async (updates: { email?: string; password?: string; data?: Record<string, any> }) => {
    const response = await authService.updateProfile(updates);
    
    if (response.data.user) {
      setState(prev => ({
        ...prev,
        user: response.data.user as AuthUser,
        error: response.error
      }));
    }

    return { error: response.error };
  };

  const refreshSession = async () => {
    const response = await authService.refreshSession();
    
    setState(prev => ({
      ...prev,
      user: response.data.user as AuthUser,
      session: response.data.session,
      error: response.error
    }));

    return { error: response.error };
  };

  const resendConfirmation = async (email: string) => {
    return await authService.resendConfirmation(email);
  };

  // Utility methods
  const isAuthenticated = authService.isAuthenticated(state.session);
  const isEmailVerified = authService.isEmailVerified(state.user);
  
  const hasRole = (role: string) => authService.hasRole(state.user, role);
  const validatePassword = (password: string) => authService.validatePassword(password);
  const validateEmail = (email: string) => authService.validateEmail(email);

  // Guest mode
  const continueAsGuest = () => {
    setIsGuest(true);
    setState(prev => ({
      ...prev,
      user: null,
      session: null,
      isLoading: false,
      error: null
    }));
  };

  const contextValue: AuthContextType = {
    // State
    ...state,
    
    // Auth methods
    signUp,
    signIn,
    signInWithOAuth,
    signOut,
    resetPassword,
    updatePassword,
    updateProfile,
    refreshSession,
    resendConfirmation,
    
    // Utility methods
    isAuthenticated,
    isEmailVerified,
    hasRole,
    validatePassword,
    validateEmail,
    
    // Guest mode
    continueAsGuest,
    isGuest
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};

// HOC for components that require authentication
export const withAuth = <P extends object>(
  Component: React.ComponentType<P>,
  redirectTo = '/login'
) => {
  return (props: P) => {
    const { isAuthenticated, isLoading } = useAuth();

    useEffect(() => {
      if (!isLoading && !isAuthenticated) {
        window.location.href = redirectTo;
      }
    }, [isAuthenticated, isLoading]);

    if (isLoading) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      );
    }

    if (!isAuthenticated) {
      return null;
    }

    return <Component {...props} />;
  };
};

// HOC for components that require specific roles
export const withRole = <P extends object>(
  Component: React.ComponentType<P>,
  requiredRole: string,
  fallbackComponent?: React.ComponentType
) => {
  return (props: P) => {
    const { hasRole, isLoading, isAuthenticated } = useAuth();

    if (isLoading) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      );
    }

    if (!isAuthenticated || !hasRole(requiredRole)) {
      if (fallbackComponent) {
        const FallbackComponent = fallbackComponent;
        return <FallbackComponent {...props} />;
      }
      
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h2>
            <p className="text-gray-600">You don't have permission to access this page.</p>
          </div>
        </div>
      );
    }

    return <Component {...props} />;
  };
};

export default AuthContext;