import { createClient } from '@supabase/supabase-js';

const supabaseUrl = (import.meta as any).env?.VITE_SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseAnonKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || 'your-anon-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database Types
export interface TrackedDay {
  id?: string;
  user_id: string;
  date: string;
  completed: boolean;
  extra_cold?: boolean;
  felt_amazing?: boolean;
  duration_minutes?: number;
  temperature?: number;
  notes?: string;
  mood_before?: number;
  mood_after?: number;
  created_at?: string;
  updated_at?: string;
}

export interface UserProfile {
  id: string;
  email: string;
  full_name?: string;
  challenge_start_date?: string;
  challenge_duration?: number;
  timezone?: string;
  notification_preferences?: {
    daily_reminder: boolean;
    achievement_alerts: boolean;
    streak_warnings: boolean;
    time: string;
  };
  settings?: {
    theme: 'light' | 'dark' | 'auto';
    units: 'metric' | 'imperial';
    privacy_level: 'public' | 'friends' | 'private';
  };
  created_at?: string;
  updated_at?: string;
}

export interface Achievement {
  id: string;
  user_id: string;
  type: string;
  title: string;
  description: string;
  icon: string;
  unlocked_at: string;
  streak_length?: number;
}

// API Functions
export const trackingAPI = {
  // Get all tracked days for a user
  async getTrackedDays(userId: string): Promise<TrackedDay[]> {
    const { data, error } = await supabase
      .from('tracked_days')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  // Add or update a tracked day
  async upsertTrackedDay(trackedDay: TrackedDay): Promise<TrackedDay> {
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
  },

  // Delete a tracked day
  async deleteTrackedDay(userId: string, date: string): Promise<void> {
    const { error } = await supabase
      .from('tracked_days')
      .delete()
      .eq('user_id', userId)
      .eq('date', date);

    if (error) throw error;
  },

  // Get streak data
  async getStreakData(userId: string): Promise<{
    currentStreak: number;
    longestStreak: number;
    totalCompleted: number;
  }> {
    const { data, error } = await supabase
      .rpc('get_streak_data', { user_id: userId });

    if (error) throw error;
    return data;
  }
};

export const profileAPI = {
  // Get user profile
  async getProfile(userId: string): Promise<UserProfile | null> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // No rows returned
      throw error;
    }
    return data;
  },

  // Update user profile
  async updateProfile(profile: Partial<UserProfile>): Promise<UserProfile> {
    const { data, error } = await supabase
      .from('profiles')
      .upsert(profile)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
};

export const achievementAPI = {
  // Get user achievements
  async getAchievements(userId: string): Promise<Achievement[]> {
    const { data, error } = await supabase
      .from('achievements')
      .select('*')
      .eq('user_id', userId)
      .order('unlocked_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  // Unlock achievement
  async unlockAchievement(achievement: Omit<Achievement, 'id' | 'unlocked_at'>): Promise<Achievement> {
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
  }
};

// Real-time subscriptions
export const subscriptions = {
  // Subscribe to tracked days changes
  subscribeToTrackedDays(userId: string, callback: (payload: any) => void) {
    return supabase
      .channel('tracked_days_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tracked_days',
          filter: `user_id=eq.${userId}`
        },
        callback
      )
      .subscribe();
  },

  // Subscribe to achievements
  subscribeToAchievements(userId: string, callback: (payload: any) => void) {
    return supabase
      .channel('achievements_changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'achievements',
          filter: `user_id=eq.${userId}`
        },
        callback
      )
      .subscribe();
  }
};

// Offline data management
export const offlineAPI = {
  // Save data for offline sync
  async saveOfflineData(key: string, data: any): Promise<void> {
    const offlineData = {
      key,
      data,
      timestamp: Date.now(),
      synced: false
    };
    
    localStorage.setItem(`offline_${key}`, JSON.stringify(offlineData));
  },

  // Get offline data
  async getOfflineData(): Promise<any[]> {
    const keys = Object.keys(localStorage).filter(key => key.startsWith('offline_'));
    return keys.map(key => {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    }).filter(Boolean);
  },

  // Sync offline data
  async syncOfflineData(userId: string): Promise<void> {
    const offlineData = await this.getOfflineData();
    
    for (const item of offlineData) {
      try {
        if (item.key.startsWith('tracked_day_')) {
          await trackingAPI.upsertTrackedDay({
            ...item.data,
            user_id: userId
          });
        }
        
        // Mark as synced
        localStorage.removeItem(`offline_${item.key}`);
      } catch (error) {
        console.error('Failed to sync offline data:', error);
      }
    }
  }
};