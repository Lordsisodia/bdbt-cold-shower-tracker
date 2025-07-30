import { createClient } from '@supabase/supabase-js';
import { RealTip, generateCompleteTipDatabase } from '../data/realTipsCollection';

// Supabase client setup
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || '';
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

export interface DatabaseTip {
  id?: number;
  title: string;
  subtitle: string;
  category: string;
  subcategory: string;
  difficulty: string;
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
  created_at?: string;
  updated_at?: string;
  view_count?: number;
  download_count?: number;
  rating?: number;
  is_featured?: boolean;
  status?: string;
}

export class TipsDatabaseService {
  // Import all tips to database
  async importAllTips(): Promise<{ success: boolean; count: number; errors: any[] }> {
    const allTips = generateCompleteTipDatabase();
    const errors: any[] = [];
    let successCount = 0;

    // Process tips in batches of 50
    const batchSize = 50;
    for (let i = 0; i < allTips.length; i += batchSize) {
      const batch = allTips.slice(i, i + batchSize);
      
      try {
        const { data, error } = await supabase
          .from('tips')
          .insert(
            batch.map(tip => this.convertToDatabaseFormat(tip))
          );

        if (error) {
          errors.push({ batch: i / batchSize, error });
        } else {
          successCount += batch.length;
        }
      } catch (err) {
        errors.push({ batch: i / batchSize, error: err });
      }
    }

    // Import related data (what's included, metrics, resources)
    await this.importRelatedData(allTips);

    return {
      success: errors.length === 0,
      count: successCount,
      errors
    };
  }

  // Convert RealTip to database format
  private convertToDatabaseFormat(tip: RealTip): DatabaseTip {
    return {
      title: tip.title,
      subtitle: tip.subtitle,
      category: tip.category,
      subcategory: tip.subcategory,
      difficulty: tip.difficulty,
      description: tip.description,
      primary_benefit: tip.benefits.primary,
      secondary_benefit: tip.benefits.secondary,
      tertiary_benefit: tip.benefits.tertiary,
      implementation_time: tip.implementation.time,
      frequency: tip.implementation.frequency,
      cost: tip.implementation.cost,
      scientific_backing: tip.scientificBacking || false,
      tags: tip.tags,
      status: 'published'
    };
  }

  // Import related data (what's included, metrics, resources)
  private async importRelatedData(tips: RealTip[]): Promise<void> {
    // Get all tip IDs from database
    const { data: dbTips } = await supabase
      .from('tips')
      .select('id, title');

    if (!dbTips) return;

    // Create a map of title to ID
    const tipIdMap = new Map(dbTips.map(tip => [tip.title, tip.id]));

    // Import what's included items
    const includesData: any[] = [];
    tips.forEach(tip => {
      const tipId = tipIdMap.get(tip.title);
      if (tipId) {
        tip.whatsIncluded.forEach((item, index) => {
          includesData.push({
            tip_id: tipId,
            item,
            order_index: index
          });
        });
      }
    });

    if (includesData.length > 0) {
      await supabase.from('tip_includes').insert(includesData);
    }

    // Import metrics
    const metricsData: any[] = [];
    tips.forEach(tip => {
      const tipId = tipIdMap.get(tip.title);
      if (tipId && tip.metrics) {
        tip.metrics.forEach(metric => {
          metricsData.push({
            tip_id: tipId,
            metric_type: metric.type,
            metric_value: metric.value,
            source: metric.source
          });
        });
      }
    });

    if (metricsData.length > 0) {
      await supabase.from('tip_metrics').insert(metricsData);
    }

    // Import resources
    const resourcesData: any[] = [];
    tips.forEach(tip => {
      const tipId = tipIdMap.get(tip.title);
      if (tipId && tip.resources) {
        tip.resources.forEach(resource => {
          resourcesData.push({
            tip_id: tipId,
            resource_type: resource.type,
            title: resource.title,
            url: resource.url,
            is_free: resource.isFree
          });
        });
      }
    });

    if (resourcesData.length > 0) {
      await supabase.from('tip_resources').insert(resourcesData);
    }
  }

  // Get tips from database with filters
  async getTips(filters?: {
    category?: string;
    difficulty?: string;
    subcategory?: string;
    searchTerm?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ tips: DatabaseTip[]; total: number }> {
    let query = supabase
      .from('tips')
      .select('*', { count: 'exact' })
      .eq('status', 'published');

    if (filters?.category) {
      query = query.eq('category', filters.category);
    }
    if (filters?.difficulty) {
      query = query.eq('difficulty', filters.difficulty);
    }
    if (filters?.subcategory) {
      query = query.eq('subcategory', filters.subcategory);
    }
    if (filters?.searchTerm) {
      query = query.or(`title.ilike.%${filters.searchTerm}%,subtitle.ilike.%${filters.searchTerm}%,description.ilike.%${filters.searchTerm}%`);
    }

    // Pagination
    const limit = filters?.limit || 20;
    const offset = filters?.offset || 0;
    query = query.range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) {
      console.error('Error fetching tips:', error);
      return { tips: [], total: 0 };
    }

    return {
      tips: data || [],
      total: count || 0
    };
  }

  // Get single tip with all related data
  async getTipById(id: number): Promise<any> {
    const { data: tip, error } = await supabase
      .from('tips')
      .select(`
        *,
        tip_includes (item, order_index),
        tip_metrics (metric_type, metric_value, metric_unit, source),
        tip_resources (resource_type, title, url, description, is_free)
      `)
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching tip:', error);
      return null;
    }

    // Increment view count
    await this.incrementViewCount(id);

    return tip;
  }

  // Increment view count
  async incrementViewCount(tipId: number): Promise<void> {
    await supabase.rpc('increment_tip_view_count', { tip_id: tipId });
  }

  // Increment download count
  async incrementDownloadCount(tipId: number): Promise<void> {
    await supabase.rpc('increment_tip_download_count', { tip_id: tipId });
  }

  // Get tip statistics
  async getTipStats(): Promise<any> {
    const { data, error } = await supabase
      .from('tips')
      .select('category, difficulty')
      .eq('status', 'published');

    if (error || !data) {
      return null;
    }

    const stats = {
      total: data.length,
      byCategory: {
        health: data.filter(t => t.category === 'health').length,
        wealth: data.filter(t => t.category === 'wealth').length,
        happiness: data.filter(t => t.category === 'happiness').length
      },
      byDifficulty: {
        Easy: data.filter(t => t.difficulty === 'Easy').length,
        Moderate: data.filter(t => t.difficulty === 'Moderate').length,
        Advanced: data.filter(t => t.difficulty === 'Advanced').length
      }
    };

    return stats;
  }

  // Export tips for Canva or other services
  async exportTipsForCanva(tipIds?: number[]): Promise<any[]> {
    let query = supabase
      .from('tips')
      .select(`
        *,
        tip_includes (item, order_index)
      `)
      .eq('status', 'published');

    if (tipIds && tipIds.length > 0) {
      query = query.in('id', tipIds);
    }

    const { data, error } = await query;

    if (error || !data) {
      return [];
    }

    // Format for Canva template
    return data.map(tip => ({
      id: tip.id,
      title: tip.title,
      subtitle: tip.subtitle,
      category: tip.category,
      difficulty: tip.difficulty,
      description: tip.description,
      benefits: [
        tip.primary_benefit,
        tip.secondary_benefit,
        tip.tertiary_benefit
      ],
      implementation: {
        time: tip.implementation_time,
        frequency: tip.frequency,
        cost: tip.cost
      },
      whatsIncluded: tip.tip_includes
        .sort((a: any, b: any) => a.order_index - b.order_index)
        .map((item: any) => item.item),
      tags: tip.tags,
      colors: this.getCategoryColors(tip.category),
      template: this.getCanvaTemplate(tip.category, tip.difficulty)
    }));
  }

  // Get category colors for design
  private getCategoryColors(category: string): any {
    const colors = {
      health: {
        primary: '#22c55e',
        secondary: '#86efac',
        accent: '#15803d',
        gradient: 'linear-gradient(135deg, #22c55e 0%, #15803d 100%)'
      },
      wealth: {
        primary: '#eab308',
        secondary: '#fde047',
        accent: '#a16207',
        gradient: 'linear-gradient(135deg, #eab308 0%, #f59e0b 100%)'
      },
      happiness: {
        primary: '#a855f7',
        secondary: '#d8b4fe',
        accent: '#7c3aed',
        gradient: 'linear-gradient(135deg, #a855f7 0%, #7c3aed 100%)'
      }
    };
    return colors[category as keyof typeof colors] || colors.health;
  }

  // Get Canva template ID based on category and difficulty
  private getCanvaTemplate(category: string, difficulty: string): string {
    // These would be actual Canva template IDs in production
    const templates = {
      'health-Easy': 'template_health_easy',
      'health-Moderate': 'template_health_moderate',
      'health-Advanced': 'template_health_advanced',
      'wealth-Easy': 'template_wealth_easy',
      'wealth-Moderate': 'template_wealth_moderate',
      'wealth-Advanced': 'template_wealth_advanced',
      'happiness-Easy': 'template_happiness_easy',
      'happiness-Moderate': 'template_happiness_moderate',
      'happiness-Advanced': 'template_happiness_advanced'
    };
    return templates[`${category}-${difficulty}`] || 'template_default';
  }
}

// Export singleton instance
export const tipsDatabaseService = new TipsDatabaseService();

// Supabase function definitions (to be created in Supabase dashboard)
/*
-- Function to increment view count
CREATE OR REPLACE FUNCTION increment_tip_view_count(tip_id INTEGER)
RETURNS void AS $$
BEGIN
  UPDATE tips 
  SET view_count = view_count + 1,
      updated_at = CURRENT_TIMESTAMP
  WHERE id = tip_id;
END;
$$ LANGUAGE plpgsql;

-- Function to increment download count
CREATE OR REPLACE FUNCTION increment_tip_download_count(tip_id INTEGER)
RETURNS void AS $$
BEGIN
  UPDATE tips 
  SET download_count = download_count + 1,
      updated_at = CURRENT_TIMESTAMP
  WHERE id = tip_id;
END;
$$ LANGUAGE plpgsql;
*/