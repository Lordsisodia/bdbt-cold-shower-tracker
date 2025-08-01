import { checkSupabaseConnection, handleDatabaseError, retryOperation, supabase } from '../services/supabaseClient';
import type { Achievement, TrackedDay, UserProfile } from './supabase';

// API Response Types
export interface ApiResponse<T> {
  data?: T;
  error?: ApiError;
  success: boolean;
}

export interface ApiError {
  message: string;
  code?: string;
  details?: any;
}

// Generic API client class
export class ApiClient {
  private static instance: ApiClient;

  private constructor() {}

  static getInstance(): ApiClient {
    if (!ApiClient.instance) {
      ApiClient.instance = new ApiClient();
    }
    return ApiClient.instance;
  }

  // Health check
  async checkHealth(): Promise<ApiResponse<{ healthy: boolean; timestamp: string }>> {
    try {
      const result = await checkSupabaseConnection();
      return {
        success: result.connected,
        data: {
          healthy: result.connected,
          timestamp: new Date().toISOString()
        },
        error: result.error ? { message: result.error, details: result.details } : undefined
      };
    } catch (error) {
      return this.handleError(error);
    }
  }

  // User Authentication
  async signUp(email: string, password: string): Promise<ApiResponse<{ user: any; session: any }>> {
    try {
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      return this.handleError(error);
    }
  }

  async signIn(email: string, password: string): Promise<ApiResponse<{ user: any; session: any }>> {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      return this.handleError(error);
    }
  }

  async signOut(): Promise<ApiResponse<void>> {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      return { success: true };
    } catch (error) {
      return this.handleError(error);
    }
  }

  async getCurrentUser(): Promise<ApiResponse<any>> {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) throw error;
      return { success: true, data: user };
    } catch (error) {
      return this.handleError(error);
    }
  }

  // Tracking API
  async getTrackedDays(userId: string): Promise<ApiResponse<TrackedDay[]>> {
    try {
      const data = await retryOperation(async () => {
        const { data, error } = await supabase
          .from('tracked_days')
          .select('*')
          .eq('user_id', userId)
          .order('date', { ascending: false });
        
        if (error) throw error;
        return data || [];
      });

      return { success: true, data };
    } catch (error) {
      return this.handleError(error);
    }
  }

  async saveTrackedDay(trackedDay: TrackedDay): Promise<ApiResponse<TrackedDay>> {
    try {
      const data = await retryOperation(async () => {
        const { data, error } = await supabase
          .from('tracked_days')
          .upsert(trackedDay, { 
            onConflict: 'user_id,date',
            ignoreDuplicates: false 
          })
          .select()
          .single();
        
        if (error) throw error;
        return data;
      });

      return { success: true, data };
    } catch (error) {
      return this.handleError(error);
    }
  }

  async deleteTrackedDay(userId: string, date: string): Promise<ApiResponse<void>> {
    try {
      await retryOperation(async () => {
        const { error } = await supabase
          .from('tracked_days')
          .delete()
          .eq('user_id', userId)
          .eq('date', date);
        
        if (error) throw error;
      });

      return { success: true };
    } catch (error) {
      return this.handleError(error);
    }
  }

  // Profile API
  async getProfile(userId: string): Promise<ApiResponse<UserProfile | null>> {
    try {
      const data = await retryOperation(async () => {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single();
        
        if (error && error.code === 'PGRST116') return null;
        if (error) throw error;
        return data;
      });

      return { success: true, data };
    } catch (error) {
      return this.handleError(error);
    }
  }

  async updateProfile(profile: Partial<UserProfile>): Promise<ApiResponse<UserProfile>> {
    try {
      const data = await retryOperation(async () => {
        const { data, error } = await supabase
          .from('profiles')
          .upsert(profile)
          .select()
          .single();
        
        if (error) throw error;
        return data;
      });

      return { success: true, data };
    } catch (error) {
      return this.handleError(error);
    }
  }

  // Achievements API
  async getAchievements(userId: string): Promise<ApiResponse<Achievement[]>> {
    try {
      const data = await retryOperation(async () => {
        const { data, error } = await supabase
          .from('achievements')
          .select('*')
          .eq('user_id', userId)
          .order('unlocked_at', { ascending: false });
        
        if (error) throw error;
        return data || [];
      });

      return { success: true, data };
    } catch (error) {
      return this.handleError(error);
    }
  }

  async unlockAchievement(achievement: Omit<Achievement, 'id' | 'unlocked_at'>): Promise<ApiResponse<Achievement>> {
    try {
      const data = await retryOperation(async () => {
        const { data, error } = await supabase
          .from('achievements')
          .insert({
            ...achievement,
            unlocked_at: new Date().toISOString()
          })
          .select()
          .single();
        
        if (error) throw error;
        return data;
      });

      return { success: true, data };
    } catch (error) {
      return this.handleError(error);
    }
  }

  // Streak API
  async getStreakData(userId: string): Promise<ApiResponse<{
    currentStreak: number;
    longestStreak: number;
    totalCompleted: number;
  }>> {
    try {
      const data = await retryOperation(async () => {
        const { data, error } = await supabase
          .rpc('get_streak_data', { user_id: userId });
        
        if (error) throw error;
        return data;
      });

      return { success: true, data };
    } catch (error) {
      return this.handleError(error);
    }
  }

  // Error handler
  private handleError(error: any): ApiResponse<any> {
    const errorInfo = handleDatabaseError(error);
    return {
      success: false,
      error: {
        message: errorInfo.message,
        code: errorInfo.code,
        details: error
      }
    };
  }
}

// Export singleton instance
export const apiClient = ApiClient.getInstance();

// Export convenience functions
export const api = {
  health: () => apiClient.checkHealth(),
  auth: {
    signUp: (email: string, password: string) => apiClient.signUp(email, password),
    signIn: (email: string, password: string) => apiClient.signIn(email, password),
    signOut: () => apiClient.signOut(),
    getCurrentUser: () => apiClient.getCurrentUser()
  },
  tracking: {
    getDays: (userId: string) => apiClient.getTrackedDays(userId),
    saveDay: (day: TrackedDay) => apiClient.saveTrackedDay(day),
    deleteDay: (userId: string, date: string) => apiClient.deleteTrackedDay(userId, date),
    getStreak: (userId: string) => apiClient.getStreakData(userId)
  },
  profile: {
    get: (userId: string) => apiClient.getProfile(userId),
    update: (profile: Partial<UserProfile>) => apiClient.updateProfile(profile)
  },
  achievements: {
    get: (userId: string) => apiClient.getAchievements(userId),
    unlock: (achievement: Omit<Achievement, 'id' | 'unlocked_at'>) => apiClient.unlockAchievement(achievement)
  }
};