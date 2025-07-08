import { useState, useEffect } from 'react';
import { User, Session, AuthError } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

interface AuthState {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  error: AuthError | null;
}

export const useAuth = () => {
  const [state, setState] = useState<AuthState>({
    user: null,
    session: null,
    isLoading: true,
    error: null
  });

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      setState({
        user: session?.user ?? null,
        session,
        isLoading: false,
        error
      });
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setState(prev => ({
          ...prev,
          user: session?.user ?? null,
          session,
          isLoading: false,
          error: null
        }));

        // Handle different auth events
        if (event === 'SIGNED_IN') {
          console.log('User signed in:', session?.user?.email);
        } else if (event === 'SIGNED_OUT') {
          console.log('User signed out');
          // Clear cached data
          localStorage.removeItem('cachedTrackedDays');
          localStorage.removeItem('cachedProfile');
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, metadata?: any) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata
      }
    });

    setState(prev => ({
      ...prev,
      isLoading: false,
      error
    }));

    return { data, error };
  };

  const signIn = async (email: string, password: string) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    setState(prev => ({
      ...prev,
      isLoading: false,
      error
    }));

    return { data, error };
  };

  const signInWithOAuth = async (provider: 'google' | 'github' | 'apple') => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback`
      }
    });

    setState(prev => ({
      ...prev,
      isLoading: false,
      error
    }));

    return { data, error };
  };

  const signOut = async () => {
    setState(prev => ({ ...prev, isLoading: true }));

    const { error } = await supabase.auth.signOut();

    setState(prev => ({
      ...prev,
      isLoading: false,
      error
    }));

    return { error };
  };

  const resetPassword = async (email: string) => {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`
    });

    return { data, error };
  };

  const updatePassword = async (password: string) => {
    const { data, error } = await supabase.auth.updateUser({
      password
    });

    return { data, error };
  };

  const updateProfile = async (updates: { email?: string; data?: any }) => {
    const { data, error } = await supabase.auth.updateUser(updates);

    return { data, error };
  };

  // Guest mode for users who don't want to sign up
  const continueAsGuest = () => {
    setState(prev => ({
      ...prev,
      user: null,
      session: null,
      isLoading: false
    }));
  };

  return {
    ...state,
    signUp,
    signIn,
    signInWithOAuth,
    signOut,
    resetPassword,
    updatePassword,
    updateProfile,
    continueAsGuest,
    isAuthenticated: !!state.user,
    isGuest: !state.user && !state.isLoading
  };
};