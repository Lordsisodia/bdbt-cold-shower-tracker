import type {
    AuthError, AuthResponse, OAuthResponse, Session, SignInWithPasswordCredentials, SignUpWithPasswordCredentials, User, UserResponse
} from '@supabase/supabase-js';
import { profileAPI, supabase } from '../lib/supabase';

export interface AuthUser extends User {
  user_metadata?: {
    full_name?: string;
    avatar_url?: string;
  };
}

export interface SignUpData {
  email: string;
  password: string;
  fullName?: string;
  metadata?: Record<string, any>;
}

export interface SignInData {
  email: string;
  password: string;
}

export interface AuthState {
  user: AuthUser | null;
  session: Session | null;
  isLoading: boolean;
  error: AuthError | null;
}

export type OAuthProvider = 'google' | 'github' | 'apple' | 'discord' | 'twitter';

class AuthService {
  private static instance: AuthService;
  private authStateListeners: ((state: AuthState) => void)[] = [];

  private constructor() {}

  static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  // Subscribe to auth state changes
  onAuthStateChange(callback: (state: AuthState) => void) {
    this.authStateListeners.push(callback);
    
    // Return unsubscribe function
    return () => {
      this.authStateListeners = this.authStateListeners.filter(cb => cb !== callback);
    };
  }

  private notifyListeners(state: AuthState) {
    this.authStateListeners.forEach(callback => callback(state));
  }

  // Get current session
  async getCurrentSession(): Promise<{ session: Session | null; error: AuthError | null }> {
    try {
      const { data, error } = await supabase.auth.getSession();
      return { session: data.session, error };
    } catch (error) {
      return { session: null, error: error as AuthError };
    }
  }

  // Get current user
  async getCurrentUser(): Promise<{ user: AuthUser | null; error: AuthError | null }> {
    try {
      const { data, error } = await supabase.auth.getUser();
      return { user: data.user as AuthUser, error };
    } catch (error) {
      return { user: null, error: error as AuthError };
    }
  }

  // Sign up with email and password
  async signUp(signUpData: SignUpData): Promise<AuthResponse> {
    try {
      const { email, password, fullName, metadata } = signUpData;
      
      const credentials: SignUpWithPasswordCredentials = {
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            ...metadata
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      };

      const response = await supabase.auth.signUp(credentials);
      
      // If signup is successful and user is confirmed, create profile
      if (response.data.user && !response.error) {
        await this.createUserProfile(response.data.user, { full_name: fullName });
      }

      return response;
    } catch (error) {
      return { data: { user: null, session: null }, error: error as AuthError };
    }
  }

  // Sign in with email and password
  async signIn(signInData: SignInData): Promise<AuthResponse> {
    try {
      const { email, password } = signInData;
      
      const credentials: SignInWithPasswordCredentials = {
        email,
        password
      };

      const response = await supabase.auth.signInWithPassword(credentials);
      
      return response;
    } catch (error) {
      return { data: { user: null, session: null }, error: error as AuthError };
    }
  }

  // Sign in with OAuth provider
  async signInWithOAuth(provider: OAuthProvider): Promise<OAuthResponse> {
    try {
      return await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      });
    } catch (error) {
      return { data: { provider, url: null }, error: error as AuthError };
    }
  }

  // Sign out
  async signOut(): Promise<{ error: AuthError | null }> {
    try {
      const { error } = await supabase.auth.signOut();
      
      // Clear any cached data
      this.clearLocalData();
      
      return { error };
    } catch (error) {
      return { error: error as AuthError };
    }
  }

  // Reset password
  async resetPassword(email: string): Promise<{ error: AuthError | null }> {
    try {
      return await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`
      });
    } catch (error) {
      return { error: error as AuthError };
    }
  }

  // Update password
  async updatePassword(password: string): Promise<UserResponse> {
    try {
      return await supabase.auth.updateUser({ password });
    } catch (error) {
      return { data: { user: null }, error: error as AuthError };
    }
  }

  // Update user profile
  async updateProfile(updates: {
    email?: string;
    password?: string;
    data?: Record<string, any>;
  }): Promise<UserResponse> {
    try {
      return await supabase.auth.updateUser(updates);
    } catch (error) {
      return { data: { user: null }, error: error as AuthError };
    }
  }

  // Refresh session
  async refreshSession(): Promise<AuthResponse> {
    try {
      return await supabase.auth.refreshSession();
    } catch (error) {
      return { data: { user: null, session: null }, error: error as AuthError };
    }
  }

  // Resend email confirmation
  async resendConfirmation(email: string): Promise<{ error: AuthError | null }> {
    try {
      return await supabase.auth.resend({
        type: 'signup',
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      });
    } catch (error) {
      return { error: error as AuthError };
    }
  }

  // Verify OTP (for email confirmation, phone verification, etc.)
  async verifyOtp(params: {
    email?: string;
    phone?: string;
    token: string;
    type: 'signup' | 'recovery' | 'email_change' | 'sms' | 'phone_change';
  }): Promise<AuthResponse> {
    try {
      return await supabase.auth.verifyOtp(params);
    } catch (error) {
      return { data: { user: null, session: null }, error: error as AuthError };
    }
  }

  // Create user profile in database
  private async createUserProfile(user: User, metadata?: Record<string, any>) {
    try {
      const profile = {
        id: user.id,
        email: user.email!,
        full_name: metadata?.full_name || user.user_metadata?.full_name || '',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        ...metadata
      };

      await profileAPI.updateProfile(profile);
    } catch (error) {
      console.error('Failed to create user profile:', error);
    }
  }

  // Check if user is authenticated
  isAuthenticated(session: Session | null): boolean {
    return !!session?.access_token && new Date(session.expires_at! * 1000) > new Date();
  }

  // Check if user has verified email
  isEmailVerified(user: AuthUser | null): boolean {
    return !!user?.email_confirmed_at;
  }

  // Get user role (if you have role-based auth)
  getUserRole(user: AuthUser | null): string | null {
    return user?.user_metadata?.role || user?.app_metadata?.role || null;
  }

  // Check if user has specific role
  hasRole(user: AuthUser | null, role: string): boolean {
    const userRole = this.getUserRole(user);
    return userRole === role;
  }

  // Check if password meets requirements
  validatePassword(password: string): {
    isValid: boolean;
    errors: string[];
    strength: 'weak' | 'medium' | 'strong';
  } {
    const errors: string[] = [];
    let score = 0;

    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long');
    } else {
      score += 1;
    }

    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    } else {
      score += 1;
    }

    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    } else {
      score += 1;
    }

    if (!/\d/.test(password)) {
      errors.push('Password must contain at least one number');
    } else {
      score += 1;
    }

    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push('Password must contain at least one special character');
    } else {
      score += 1;
    }

    const strength = score <= 2 ? 'weak' : score <= 4 ? 'medium' : 'strong';

    return {
      isValid: errors.length === 0,
      errors,
      strength
    };
  }

  // Validate email format
  validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Clear local data on sign out
  private clearLocalData(): void {
    // Clear any cached user data
    localStorage.removeItem('cachedTrackedDays');
    localStorage.removeItem('cachedProfile');
    localStorage.removeItem('userPreferences');
    
    // Clear any offline data
    const offlineKeys = Object.keys(localStorage).filter(key => key.startsWith('offline_'));
    offlineKeys.forEach(key => localStorage.removeItem(key));
  }

  // Set up auth state listener for the service
  setupAuthListener() {
    return supabase.auth.onAuthStateChange(async (event, session) => {
      const state: AuthState = {
        user: session?.user as AuthUser || null,
        session,
        isLoading: false,
        error: null
      };

      // Handle different auth events
      switch (event) {
        case 'SIGNED_IN':
          console.log('User signed in:', session?.user?.email);
          // Sync offline data if any
          if (session?.user) {
            try {
              const { offlineAPI } = await import('../lib/supabase');
              await offlineAPI.syncOfflineData(session.user.id);
            } catch (error) {
              console.error('Failed to sync offline data:', error);
            }
          }
          break;
        case 'SIGNED_OUT':
          console.log('User signed out');
          this.clearLocalData();
          break;
        case 'TOKEN_REFRESHED':
          console.log('Token refreshed');
          break;
        case 'USER_UPDATED':
          console.log('User updated');
          break;
        case 'PASSWORD_RECOVERY':
          console.log('Password recovery initiated');
          break;
      }

      this.notifyListeners(state);
    });
  }
}

// Export singleton instance
export const authService = AuthService.getInstance();

// Export types
export type { AuthState, SignUpData, SignInData, OAuthProvider };
