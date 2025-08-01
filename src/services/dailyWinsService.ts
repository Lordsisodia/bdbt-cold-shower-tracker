import { supabase } from '../lib/supabase';

// Types
export interface DailyWin {
  id: number;
  user_id: string;
  content: string;
  category: 'health' | 'wealth' | 'happiness';
  likes_count: number;
  comments_count: number;
  created_at: string;
  updated_at: string;
  user?: UserProfile;
  is_liked?: boolean;
  comments?: WinComment[];
}

export interface UserProfile {
  id: string;
  username?: string;
  full_name?: string;
  avatar_url?: string;
  bio?: string;
  streak_count: number;
  last_win_date?: string;
  goals?: string[];
  experience_level?: string;
}

export interface WinComment {
  id: number;
  user_id: string;
  win_id: number;
  content: string;
  created_at: string;
  user?: UserProfile;
}

export interface WinLike {
  id: number;
  user_id: string;
  win_id: number;
  created_at: string;
}

export interface WinFilters {
  category?: 'all' | 'health' | 'wealth' | 'happiness';
  sortBy?: 'recent' | 'popular' | 'following';
  userId?: string;
  page?: number;
  limit?: number;
}

// Service methods
export const dailyWinsService = {
  // Get wins with pagination and filters
  async getWins(filters: WinFilters = {}) {
    const { 
      category = 'all', 
      sortBy = 'recent', 
      userId = null,
      page = 1, 
      limit = 10 
    } = filters;
    
    const offset = (page - 1) * limit;
    
    // Build query
    let query = supabase
      .from('daily_wins')
      .select(`
        *,
        user:user_profiles!user_id (
          id,
          username,
          full_name,
          avatar_url,
          streak_count
        )
      `, { count: 'exact' });
    
    // Apply category filter
    if (category !== 'all') {
      query = query.eq('category', category);
    }
    
    // Apply user filter for "following" sort
    if (sortBy === 'following' && userId) {
      // This would require a following/followers table
      // For now, we'll just return user's own wins
      query = query.eq('user_id', userId);
    }
    
    // Apply sorting
    if (sortBy === 'popular') {
      query = query.order('likes_count', { ascending: false });
    } else {
      query = query.order('created_at', { ascending: false });
    }
    
    // Apply pagination
    query = query.range(offset, offset + limit - 1);
    
    const { data, error, count } = await query;
    
    if (error) throw error;
    
    // Check if current user has liked each win
    if (userId && data) {
      const winIds = data.map(win => win.id);
      const { data: likes } = await supabase
        .from('win_likes')
        .select('win_id')
        .eq('user_id', userId)
        .in('win_id', winIds);
      
      const likedWinIds = new Set(likes?.map(like => like.win_id) || []);
      
      return {
        wins: data.map(win => ({
          ...win,
          is_liked: likedWinIds.has(win.id)
        })),
        total: count || 0,
        page,
        totalPages: Math.ceil((count || 0) / limit)
      };
    }
    
    return {
      wins: data || [],
      total: count || 0,
      page,
      totalPages: Math.ceil((count || 0) / limit)
    };
  },

  // Create a new win
  async createWin(win: {
    user_id: string;
    content: string;
    category: 'health' | 'wealth' | 'happiness';
  }) {
    const { data, error } = await supabase
      .from('daily_wins')
      .insert(win)
      .select(`
        *,
        user:user_profiles!user_id (
          id,
          username,
          full_name,
          avatar_url,
          streak_count
        )
      `)
      .single();
    
    if (error) throw error;
    
    // Update user's streak
    await this.updateUserStreak(win.user_id);
    
    return data;
  },

  // Like/unlike a win
  async toggleLike(winId: number, userId: string) {
    // Check if already liked
    const { data: existingLike } = await supabase
      .from('win_likes')
      .select()
      .eq('win_id', winId)
      .eq('user_id', userId)
      .single();
    
    if (existingLike) {
      // Unlike
      const { error } = await supabase
        .from('win_likes')
        .delete()
        .eq('win_id', winId)
        .eq('user_id', userId);
      
      if (error) throw error;
      
      // Decrement likes count
      await supabase.rpc('decrement_likes_count', { win_id: winId });
      
      return { liked: false };
    } else {
      // Like
      const { error } = await supabase
        .from('win_likes')
        .insert({ win_id: winId, user_id: userId });
      
      if (error) throw error;
      
      // Increment likes count
      await supabase.rpc('increment_likes_count', { win_id: winId });
      
      return { liked: true };
    }
  },

  // Add a comment to a win
  async addComment(comment: {
    win_id: number;
    user_id: string;
    content: string;
  }) {
    const { data, error } = await supabase
      .from('win_comments')
      .insert(comment)
      .select(`
        *,
        user:user_profiles!user_id (
          id,
          username,
          full_name,
          avatar_url
        )
      `)
      .single();
    
    if (error) throw error;
    
    // Increment comments count
    await supabase.rpc('increment_comments_count', { win_id: comment.win_id });
    
    return data;
  },

  // Get comments for a win
  async getComments(winId: number, page: number = 1, limit: number = 10) {
    const offset = (page - 1) * limit;
    
    const { data, error, count } = await supabase
      .from('win_comments')
      .select(`
        *,
        user:user_profiles!user_id (
          id,
          username,
          full_name,
          avatar_url
        )
      `, { count: 'exact' })
      .eq('win_id', winId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);
    
    if (error) throw error;
    
    return {
      comments: data || [],
      total: count || 0,
      page,
      totalPages: Math.ceil((count || 0) / limit)
    };
  },

  // Update user streak
  async updateUserStreak(userId: string) {
    const today = new Date().toISOString().split('T')[0];
    
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('last_win_date, streak_count')
      .eq('id', userId)
      .single();
    
    if (!profile) return;
    
    const lastWinDate = profile.last_win_date;
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];
    
    let newStreak = 1;
    
    if (lastWinDate === yesterdayStr) {
      // Continue streak
      newStreak = (profile.streak_count || 0) + 1;
    } else if (lastWinDate === today) {
      // Already posted today, keep current streak
      return;
    }
    
    await supabase
      .from('user_profiles')
      .update({
        streak_count: newStreak,
        last_win_date: today
      })
      .eq('id', userId);
  },

  // Get top performers
  async getTopPerformers(limit: number = 3) {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('id, username, full_name, avatar_url, streak_count')
      .order('streak_count', { ascending: false })
      .limit(limit);
    
    if (error) throw error;
    
    return data || [];
  },

  // Get community stats
  async getCommunityStats() {
    const today = new Date().toISOString().split('T')[0];
    
    // Get today's wins count
    const { count: todayWins } = await supabase
      .from('daily_wins')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', today);
    
    // Get active members (posted in last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const { count: activeMembers } = await supabase
      .from('daily_wins')
      .select('user_id', { count: 'exact', head: true })
      .gte('created_at', sevenDaysAgo.toISOString())
      .select('DISTINCT user_id');
    
    // Get active streaks count
    const { count: activeStreaks } = await supabase
      .from('user_profiles')
      .select('*', { count: 'exact', head: true })
      .gt('streak_count', 0);
    
    return {
      todayWins: todayWins || 0,
      activeMembers: activeMembers || 0,
      activeStreaks: activeStreaks || 0
    };
  },

  // Real-time subscription to new wins
  subscribeToNewWins(callback: (payload: any) => void) {
    return supabase
      .channel('new_wins')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'daily_wins'
        },
        callback
      )
      .subscribe();
  },

  // Real-time subscription to win updates (likes, comments)
  subscribeToWinUpdates(winId: number, callback: (payload: any) => void) {
    return supabase
      .channel(`win_${winId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'daily_wins',
          filter: `id=eq.${winId}`
        },
        callback
      )
      .subscribe();
  }
};

// SQL Functions needed in Supabase:
// CREATE OR REPLACE FUNCTION increment_likes_count(win_id INT)
// RETURNS void AS $$
// BEGIN
//   UPDATE daily_wins 
//   SET likes_count = likes_count + 1 
//   WHERE id = win_id;
// END;
// $$ LANGUAGE plpgsql;

// CREATE OR REPLACE FUNCTION decrement_likes_count(win_id INT)
// RETURNS void AS $$
// BEGIN
//   UPDATE daily_wins 
//   SET likes_count = GREATEST(likes_count - 1, 0) 
//   WHERE id = win_id;
// END;
// $$ LANGUAGE plpgsql;

// CREATE OR REPLACE FUNCTION increment_comments_count(win_id INT)
// RETURNS void AS $$
// BEGIN
//   UPDATE daily_wins 
//   SET comments_count = comments_count + 1 
//   WHERE id = win_id;
// END;
// $$ LANGUAGE plpgsql;