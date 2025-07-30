import { createClient } from '@supabase/supabase-js';

// Project-specific Supabase client for BDBT tips
// This only works when SUPABASE_URL and SUPABASE_ANON_KEY are set
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || process.env.SUPABASE_URL || '';
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || '';

// Check if we have valid credentials
const hasSupabaseConfig = supabaseUrl && supabaseAnonKey;

// Create client only if we have credentials
export const supabaseTips = hasSupabaseConfig 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Database types
export interface DatabaseTip {
  id: number;
  title: string;
  subtitle: string;
  category: 'health' | 'wealth' | 'happiness';
  subcategory: string;
  difficulty: 'Easy' | 'Moderate' | 'Advanced';
  description: string;
  primary_benefit: string;
  secondary_benefit: string;
  tertiary_benefit: string;
  implementation_time: string;
  frequency: string;
  cost: string;
  scientific_backing: boolean;
  source_url?: string;
  tags: string[];
  created_at: string;
  updated_at: string;
  view_count: number;
  download_count: number;
  rating?: number;
  is_featured: boolean;
  status: 'draft' | 'published' | 'archived';
}

export interface TipInclude {
  id: number;
  tip_id: number;
  item: string;
  order_index: number;
}

export interface TipResource {
  id: number;
  tip_id: number;
  resource_type: 'book' | 'article' | 'video' | 'app' | 'tool' | 'website' | 'course' | 'podcast';
  title: string;
  url?: string;
  description?: string;
  is_free: boolean;
  author?: string;
  platform?: string;
}

// Helper functions that work with or without Supabase
export const tipsDatabase = {
  // Check if Supabase is configured
  isConfigured(): boolean {
    return hasSupabaseConfig;
  },

  // Get all published tips
  async getTips(options?: {
    category?: string;
    difficulty?: string;
    limit?: number;
    offset?: number;
  }) {
    if (!supabaseTips) {
      console.warn('Supabase not configured. Using local data.');
      return { data: [], error: 'Supabase not configured' };
    }

    let query = supabaseTips
      .from('tips')
      .select(`
        *,
        tip_includes (item, order_index),
        tip_resources (*)
      `)
      .eq('status', 'published')
      .order('created_at', { ascending: false });

    if (options?.category) {
      query = query.eq('category', options.category);
    }
    if (options?.difficulty) {
      query = query.eq('difficulty', options.difficulty);
    }
    if (options?.limit) {
      query = query.limit(options.limit);
    }
    if (options?.offset) {
      query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
    }

    return await query;
  },

  // Get single tip by ID
  async getTipById(id: number) {
    if (!supabaseTips) {
      return { data: null, error: 'Supabase not configured' };
    }

    return await supabaseTips
      .from('tips')
      .select(`
        *,
        tip_includes (item, order_index),
        tip_resources (*)
      `)
      .eq('id', id)
      .single();
  },

  // Search tips
  async searchTips(searchTerm: string) {
    if (!supabaseTips) {
      return { data: [], error: 'Supabase not configured' };
    }

    return await supabaseTips
      .from('tips')
      .select('*')
      .eq('status', 'published')
      .or(`title.ilike.%${searchTerm}%,subtitle.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`);
  },

  // Increment view count
  async incrementViewCount(tipId: number) {
    if (!supabaseTips) return;

    await supabaseTips.rpc('increment_tip_view_count', { tip_id: tipId });
  },

  // Increment download count
  async incrementDownloadCount(tipId: number) {
    if (!supabaseTips) return;

    await supabaseTips.rpc('increment_tip_download_count', { tip_id: tipId });
  }
};

// Export functions for managing tips (admin only)
export const tipsAdmin = {
  // Import a single tip
  async createTip(tip: Omit<DatabaseTip, 'id' | 'created_at' | 'updated_at'>) {
    if (!supabaseTips) {
      return { data: null, error: 'Supabase not configured' };
    }

    return await supabaseTips
      .from('tips')
      .insert(tip)
      .select()
      .single();
  },

  // Add resources to a tip
  async addResources(tipId: number, resources: Omit<TipResource, 'id' | 'tip_id'>[]) {
    if (!supabaseTips) {
      return { data: null, error: 'Supabase not configured' };
    }

    const resourcesWithTipId = resources.map(r => ({ ...r, tip_id: tipId }));
    return await supabaseTips
      .from('tip_resources')
      .insert(resourcesWithTipId);
  },

  // Add what's included items
  async addIncludes(tipId: number, items: string[]) {
    if (!supabaseTips) {
      return { data: null, error: 'Supabase not configured' };
    }

    const includes = items.map((item, index) => ({
      tip_id: tipId,
      item,
      order_index: index
    }));

    return await supabaseTips
      .from('tip_includes')
      .insert(includes);
  }
};