import { supabase } from '../lib/supabase';

// Types
export interface PodcastEpisode {
  id: number;
  title: string;
  description: string;
  duration: string;
  published_date: string;
  category: string;
  views_count: number;
  thumbnail_url: string;
  youtube_url?: string;
  spotify_url?: string;
  apple_url?: string;
  is_featured: boolean;
  created_at: string;
  updated_at: string;
}

export interface EpisodeFilters {
  category?: 'all' | 'mindset' | 'business' | 'health' | 'relationships';
  searchTerm?: string;
  page?: number;
  limit?: number;
}

export interface PodcastStats {
  totalDownloads: string;
  totalEpisodes: number;
  averageRating: number;
  totalSubscribers: string;
}

// Service methods
export const podcastService = {
  // Get episodes with filters
  async getEpisodes(filters: EpisodeFilters = {}) {
    const { 
      category = 'all', 
      searchTerm = '',
      page = 1, 
      limit = 9 
    } = filters;
    
    const offset = (page - 1) * limit;
    
    // Build query
    let query = supabase
      .from('podcast_episodes')
      .select('*', { count: 'exact' });
    
    // Apply category filter
    if (category !== 'all') {
      query = query.eq('category', category);
    }
    
    // Apply search filter
    if (searchTerm) {
      query = query.or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`);
    }
    
    // Order by date and apply pagination
    query = query
      .order('published_date', { ascending: false })
      .range(offset, offset + limit - 1);
    
    const { data, error, count } = await query;
    
    if (error) throw error;
    
    return {
      episodes: data || [],
      total: count || 0,
      page,
      totalPages: Math.ceil((count || 0) / limit)
    };
  },

  // Get featured episode
  async getFeaturedEpisode() {
    const { data, error } = await supabase
      .from('podcast_episodes')
      .select('*')
      .eq('is_featured', true)
      .order('published_date', { ascending: false })
      .limit(1)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows returned
    
    // If no featured episode, get the latest one
    if (!data) {
      const { data: latestEpisode, error: latestError } = await supabase
        .from('podcast_episodes')
        .select('*')
        .order('published_date', { ascending: false })
        .limit(1)
        .single();
      
      if (latestError && latestError.code !== 'PGRST116') throw latestError;
      
      return latestEpisode;
    }
    
    return data;
  },

  // Get single episode by ID
  async getEpisode(id: number) {
    const { data, error } = await supabase
      .from('podcast_episodes')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    
    return data;
  },

  // Increment view count
  async incrementViewCount(episodeId: number) {
    const { error } = await supabase.rpc('increment_episode_views', { 
      episode_id: episodeId 
    });
    
    if (error) throw error;
  },

  // Get popular episodes
  async getPopularEpisodes(limit: number = 5) {
    const { data, error } = await supabase
      .from('podcast_episodes')
      .select('*')
      .order('views_count', { ascending: false })
      .limit(limit);
    
    if (error) throw error;
    
    return data || [];
  },

  // Get recent episodes
  async getRecentEpisodes(limit: number = 5) {
    const { data, error } = await supabase
      .from('podcast_episodes')
      .select('*')
      .order('published_date', { ascending: false })
      .limit(limit);
    
    if (error) throw error;
    
    return data || [];
  },

  // Get episodes by category
  async getEpisodesByCategory(category: string, limit: number = 10) {
    const { data, error } = await supabase
      .from('podcast_episodes')
      .select('*')
      .eq('category', category)
      .order('published_date', { ascending: false })
      .limit(limit);
    
    if (error) throw error;
    
    return data || [];
  },

  // Get podcast statistics
  async getPodcastStats(): Promise<PodcastStats> {
    // Get total episodes
    const { count: totalEpisodes } = await supabase
      .from('podcast_episodes')
      .select('*', { count: 'exact', head: true });
    
    // Get total views (sum of all episode views)
    const { data: viewsData } = await supabase
      .from('podcast_episodes')
      .select('views_count');
    
    const totalViews = viewsData?.reduce((sum, episode) => sum + episode.views_count, 0) || 0;
    
    // Format numbers for display
    const formatNumber = (num: number): string => {
      if (num >= 1000000) {
        return `${(num / 1000000).toFixed(1)}M`;
      } else if (num >= 1000) {
        return `${(num / 1000).toFixed(0)}K`;
      }
      return num.toString();
    };
    
    return {
      totalDownloads: formatNumber(totalViews * 2.5), // Estimate downloads as 2.5x views
      totalEpisodes: totalEpisodes || 0,
      averageRating: 4.9, // Hardcoded for now, could be from a ratings table
      totalSubscribers: '50K+' // Hardcoded for now, could be from newsletter_subscribers
    };
  },

  // Search episodes
  async searchEpisodes(searchTerm: string, limit: number = 10) {
    const { data, error } = await supabase
      .from('podcast_episodes')
      .select('*')
      .or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,category.ilike.%${searchTerm}%`)
      .order('published_date', { ascending: false })
      .limit(limit);
    
    if (error) throw error;
    
    return data || [];
  },

  // Subscribe to new episodes
  subscribeToNewEpisodes(callback: (payload: any) => void) {
    return supabase
      .channel('new_episodes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'podcast_episodes'
        },
        callback
      )
      .subscribe();
  },

  // Get related episodes
  async getRelatedEpisodes(episodeId: number, category: string, limit: number = 4) {
    const { data, error } = await supabase
      .from('podcast_episodes')
      .select('*')
      .eq('category', category)
      .neq('id', episodeId)
      .order('views_count', { ascending: false })
      .limit(limit);
    
    if (error) throw error;
    
    return data || [];
  }
};

// SQL Function needed in Supabase:
// CREATE OR REPLACE FUNCTION increment_episode_views(episode_id INT)
// RETURNS void AS $$
// BEGIN
//   UPDATE podcast_episodes 
//   SET views_count = views_count + 1 
//   WHERE id = episode_id;
// END;
// $$ LANGUAGE plpgsql;