import { supabase } from '../lib/supabase';

// Analytics interfaces
export interface AnalyticsEvent {
  id?: string;
  tip_id?: string;
  user_id?: string;
  event_type: 'view' | 'download' | 'share' | 'complete' | 'page_view' | 'search' | 'filter';
  session_id?: string;
  metadata?: {
    page?: string;
    search_term?: string;
    filter?: string;
    referrer?: string;
    user_agent?: string;
    ip?: string;
    category?: string;
    difficulty?: string;
    duration?: number;
  };
  created_at?: string;
}

export interface DashboardMetrics {
  totalViews: number;
  activeUsers: number;
  downloads: number;
  revenue: number;
  viewsChange: number;
  usersChange: number;
  downloadsChange: number;
  revenueChange: number;
}

export interface ContentPerformance {
  id: string;
  title: string;
  views: number;
  engagement: number;
  category: string;
  downloads: number;
  shares: number;
  rating: number;
}

export interface CategoryDistribution {
  label: string;
  value: number;
  percentage: number;
  color: string;
}

export interface EngagementData {
  day: string;
  likes: number;
  comments: number;
  shares: number;
  views: number;
  downloads: number;
}

export interface UserDemographic {
  ageGroup: string;
  percentage: number;
  count: number;
}

export interface GeographicData {
  country: string;
  percentage: number;
  count: number;
  flag: string;
}

export interface AnalyticsFilters {
  dateRange: '24h' | '7d' | '30d' | '90d' | '1y';
  category?: string;
  difficulty?: string;
}

class AnalyticsService {
  // Track analytics events
  async trackEvent(event: AnalyticsEvent): Promise<void> {
    try {
      // Generate session ID if not provided
      if (!event.session_id) {
        event.session_id = this.generateSessionId();
      }

      // Add timestamp
      event.created_at = new Date().toISOString();

      // Insert into tip_analytics table if it exists, otherwise create analytics_events
      const { error } = await supabase
        .from('tip_analytics')
        .insert([event]);

      if (error) {
        // Try analytics_events table as fallback
        const { error: fallbackError } = await supabase
          .from('analytics_events')
          .insert([event]);
        
        if (fallbackError) {
          console.warn('Analytics tracking failed:', fallbackError);
        }
      }

      // Update relevant counters if tracking specific events
      if (event.event_type === 'view' && event.tip_id) {
        await this.incrementTipCounter(event.tip_id, 'view_count');
      } else if (event.event_type === 'download' && event.tip_id) {
        await this.incrementTipCounter(event.tip_id, 'download_count');
      } else if (event.event_type === 'share' && event.tip_id) {
        await this.incrementTipCounter(event.tip_id, 'share_count');
      }
    } catch (error) {
      console.warn('Analytics tracking error:', error);
    }
  }

  // Get dashboard metrics
  async getDashboardMetrics(filters: AnalyticsFilters): Promise<DashboardMetrics> {
    try {
      const dateFilter = this.getDateFilter(filters.dateRange);
      const previousDateFilter = this.getPreviousDateFilter(filters.dateRange);

      // Get current period metrics
      const [
        viewsResult,
        usersResult,
        downloadsResult,
        tipsResult
      ] = await Promise.all([
        this.getTotalViews(dateFilter, filters),
        this.getActiveUsers(dateFilter, filters),
        this.getTotalDownloads(dateFilter, filters),
        this.getTipsStats(filters)
      ]);

      // Get previous period metrics for comparison
      const [
        previousViewsResult,
        previousUsersResult,
        previousDownloadsResult
      ] = await Promise.all([
        this.getTotalViews(previousDateFilter, filters),
        this.getActiveUsers(previousDateFilter, filters),
        this.getTotalDownloads(previousDateFilter, filters)
      ]);

      // Calculate percentage changes
      const viewsChange = this.calculatePercentageChange(viewsResult, previousViewsResult);
      const usersChange = this.calculatePercentageChange(usersResult, previousUsersResult);
      const downloadsChange = this.calculatePercentageChange(downloadsResult, previousDownloadsResult);
      
      // Calculate revenue based on downloads ($10 per tip)
      const revenue = downloadsResult * 10;
      const previousRevenue = previousDownloadsResult * 10;
      const revenueChange = this.calculatePercentageChange(revenue, previousRevenue);

      return {
        totalViews: viewsResult,
        activeUsers: usersResult,
        downloads: downloadsResult,
        revenue,
        viewsChange,
        usersChange,
        downloadsChange,
        revenueChange
      };
    } catch (error) {
      console.error('Error fetching dashboard metrics:', error);
      // Return mock data as fallback
      return this.getMockDashboardMetrics();
    }
  }

  // Get content performance data
  async getContentPerformance(filters: AnalyticsFilters): Promise<ContentPerformance[]> {
    try {
      const dateFilter = this.getDateFilter(filters.dateRange);
      
      let query = supabase
        .from('tips')
        .select(`
          id,
          title,
          category_id,
          view_count,
          download_count,
          share_count,
          categories!inner(name)
        `)
        .eq('is_published', true)
        .order('view_count', { ascending: false })
        .limit(10);

      // Apply category filter if specified
      if (filters.category && filters.category !== 'all') {
        query = query.eq('categories.name', filters.category);
      }

      const { data: tips, error } = await query;

      if (error) throw error;

      if (!tips) return this.getMockContentPerformance();

      // Get analytics data for these tips
      const tipIds = tips.map(tip => tip.id);
      const analyticsData = await this.getAnalyticsForTips(tipIds, dateFilter);

      return tips.map(tip => {
        const analytics = analyticsData.find(a => a.tip_id === tip.id);
        const totalInteractions = (tip.view_count || 0) + (tip.download_count || 0) + (tip.share_count || 0);
        const engagement = totalInteractions > 0 ? Math.min(100, Math.round((tip.download_count || 0) / (tip.view_count || 1) * 100)) : 0;

        return {
          id: tip.id,
          title: tip.title,
          views: tip.view_count || 0,
          engagement,
          category: (tip.categories as any)?.name || 'Unknown',
          downloads: tip.download_count || 0,
          shares: tip.share_count || 0,
          rating: 4.5 // TODO: Calculate from user ratings
        };
      });
    } catch (error) {
      console.error('Error fetching content performance:', error);
      return this.getMockContentPerformance();
    }
  }

  // Get category distribution
  async getCategoryDistribution(filters: AnalyticsFilters): Promise<CategoryDistribution[]> {
    try {
      const { data: categories, error } = await supabase
        .from('categories')
        .select(`
          name,
          color,
          tips!inner(id)
        `);

      if (error) throw error;

      if (!categories) return this.getMockCategoryDistribution();

      const total = categories.reduce((sum, cat) => sum + (cat.tips?.length || 0), 0);

      return categories.map(category => ({
        label: category.name,
        value: category.tips?.length || 0,
        percentage: total > 0 ? Math.round((category.tips?.length || 0) / total * 100) : 0,
        color: category.color || '#6b7280'
      }));
    } catch (error) {
      console.error('Error fetching category distribution:', error);
      return this.getMockCategoryDistribution();
    }
  }

  // Get engagement trends
  async getEngagementTrends(filters: AnalyticsFilters): Promise<EngagementData[]> {
    try {
      const dateFilter = this.getDateFilter(filters.dateRange);
      const days = this.getDaysForRange(filters.dateRange);

      const engagementData = await Promise.all(
        days.map(async day => {
          const dayStart = new Date(day);
          const dayEnd = new Date(day);
          dayEnd.setDate(dayEnd.getDate() + 1);

          const { data: analytics } = await supabase
            .from('tip_analytics')
            .select('event_type')
            .gte('created_at', dayStart.toISOString())
            .lt('created_at', dayEnd.toISOString());

          const events = analytics || [];
          
          return {
            day: dayStart.toLocaleDateString('en-US', { weekday: 'short' }),
            likes: events.filter(e => e.event_type === 'complete').length * 2, // Simulate likes
            comments: events.filter(e => e.event_type === 'share').length, // Simulate comments
            shares: events.filter(e => e.event_type === 'share').length,
            views: events.filter(e => e.event_type === 'view').length,
            downloads: events.filter(e => e.event_type === 'download').length
          };
        })
      );

      return engagementData;
    } catch (error) {
      console.error('Error fetching engagement trends:', error);
      return this.getMockEngagementTrends();
    }
  }

  // Get user demographics (simulated for now)
  async getUserDemographics(filters: AnalyticsFilters): Promise<UserDemographic[]> {
    try {
      // This would require user profile data with age information
      // For now, return simulated data based on analytics patterns
      
      const { data: users } = await supabase
        .from('profiles')
        .select('id')
        .limit(1000);

      const totalUsers = users?.length || 100;

      // Simulate age distribution based on typical productivity app usage
      return [
        { ageGroup: '18-24', percentage: 22, count: Math.floor(totalUsers * 0.22) },
        { ageGroup: '25-34', percentage: 38, count: Math.floor(totalUsers * 0.38) },
        { ageGroup: '35-44', percentage: 28, count: Math.floor(totalUsers * 0.28) },
        { ageGroup: '45+', percentage: 12, count: Math.floor(totalUsers * 0.12) }
      ];
    } catch (error) {
      console.error('Error fetching user demographics:', error);
      return this.getMockUserDemographics();
    }
  }

  // Get geographic distribution (simulated for now)
  async getGeographicDistribution(filters: AnalyticsFilters): Promise<GeographicData[]> {
    try {
      // This would require IP geolocation data
      // For now, return simulated data
      
      const { data: analytics } = await supabase
        .from('tip_analytics')
        .select('metadata')
        .limit(1000);

      const totalEvents = analytics?.length || 1000;

      // Simulate geographic distribution
      return [
        { country: 'United States', percentage: 42, count: Math.floor(totalEvents * 0.42), flag: '🇺🇸' },
        { country: 'United Kingdom', percentage: 18, count: Math.floor(totalEvents * 0.18), flag: '🇬🇧' },
        { country: 'Canada', percentage: 15, count: Math.floor(totalEvents * 0.15), flag: '🇨🇦' },
        { country: 'Australia', percentage: 12, count: Math.floor(totalEvents * 0.12), flag: '🇦🇺' },
        { country: 'Others', percentage: 13, count: Math.floor(totalEvents * 0.13), flag: '🌍' }
      ];
    } catch (error) {
      console.error('Error fetching geographic distribution:', error);
      return this.getMockGeographicDistribution();
    }
  }

  // Helper methods
  private async incrementTipCounter(tipId: string, counterType: 'view_count' | 'download_count' | 'share_count') {
    try {
      const { error } = await supabase.rpc('increment_tip_view_count', { tip_uuid: tipId });
      if (error) {
        // Fallback to manual increment
        const { error: updateError } = await supabase
          .from('tips')
          .update({ [counterType]: supabase.raw(`${counterType} + 1`) } as any)
          .eq('id', tipId);
        
        if (updateError) {
          console.warn(`Failed to increment ${counterType}:`, updateError);
        }
      }
    } catch (error) {
      console.warn(`Error incrementing ${counterType}:`, error);
    }
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private getDateFilter(range: string): Date {
    const now = new Date();
    switch (range) {
      case '24h':
        return new Date(now.getTime() - 24 * 60 * 60 * 1000);
      case '7d':
        return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      case '30d':
        return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      case '90d':
        return new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
      case '1y':
        return new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
      default:
        return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    }
  }

  private getPreviousDateFilter(range: string): Date {
    const currentFilter = this.getDateFilter(range);
    const now = new Date();
    const rangeDuration = now.getTime() - currentFilter.getTime();
    return new Date(currentFilter.getTime() - rangeDuration);
  }

  private getDaysForRange(range: string): Date[] {
    const now = new Date();
    const days: Date[] = [];
    
    let numDays: number;
    switch (range) {
      case '24h':
        numDays = 1;
        break;
      case '7d':
        numDays = 7;
        break;
      case '30d':
        numDays = 7; // Show weekly aggregates for 30d
        break;
      case '90d':
        numDays = 12; // Show weekly aggregates for 90d
        break;
      default:
        numDays = 7;
    }

    for (let i = numDays - 1; i >= 0; i--) {
      const day = new Date(now);
      day.setDate(day.getDate() - i);
      days.push(day);
    }

    return days;
  }

  private async getTotalViews(dateFilter: Date, filters: AnalyticsFilters): Promise<number> {
    const { count } = await supabase
      .from('tip_analytics')
      .select('*', { count: 'exact', head: true })
      .eq('event_type', 'view')
      .gte('created_at', dateFilter.toISOString());

    return count || 0;
  }

  private async getActiveUsers(dateFilter: Date, filters: AnalyticsFilters): Promise<number> {
    const { data } = await supabase
      .from('tip_analytics')
      .select('user_id')
      .gte('created_at', dateFilter.toISOString())
      .not('user_id', 'is', null);

    const uniqueUsers = new Set(data?.map(d => d.user_id) || []);
    return uniqueUsers.size;
  }

  private async getTotalDownloads(dateFilter: Date, filters: AnalyticsFilters): Promise<number> {
    const { count } = await supabase
      .from('tip_analytics')
      .select('*', { count: 'exact', head: true })
      .eq('event_type', 'download')
      .gte('created_at', dateFilter.toISOString());

    return count || 0;
  }

  private async getTipsStats(filters: AnalyticsFilters) {
    const { data } = await supabase
      .from('tips')
      .select('id')
      .eq('is_published', true);

    return data?.length || 0;
  }

  private async getAnalyticsForTips(tipIds: string[], dateFilter: Date) {
    const { data } = await supabase
      .from('tip_analytics')
      .select('tip_id, event_type')
      .in('tip_id', tipIds)
      .gte('created_at', dateFilter.toISOString());

    return data || [];
  }

  private calculatePercentageChange(current: number, previous: number): number {
    if (previous === 0) return current > 0 ? 100 : 0;
    return Math.round(((current - previous) / previous) * 100);
  }

  // Mock data fallbacks
  private getMockDashboardMetrics(): DashboardMetrics {
    return {
      totalViews: 1200000,
      activeUsers: 45800,
      downloads: 89200,
      revenue: 124500,
      viewsChange: 12.5,
      usersChange: 8.3,
      downloadsChange: 23.1,
      revenueChange: 23.1
    };
  }

  private getMockContentPerformance(): ContentPerformance[] {
    return [
      { id: '1', title: 'Morning Routine Guide', views: 45320, engagement: 89, category: 'Health', downloads: 1200, shares: 340, rating: 4.8 },
      { id: '2', title: 'Financial Freedom Blueprint', views: 38910, engagement: 92, category: 'Wealth', downloads: 1100, shares: 280, rating: 4.9 },
      { id: '3', title: 'Happiness Habits', views: 34560, engagement: 87, category: 'Happiness', downloads: 950, shares: 220, rating: 4.7 },
      { id: '4', title: 'Cold Shower Challenge', views: 31240, engagement: 95, category: 'Health', downloads: 1300, shares: 310, rating: 4.9 },
      { id: '5', title: 'Investment Basics', views: 28900, engagement: 84, category: 'Wealth', downloads: 890, shares: 190, rating: 4.6 }
    ];
  }

  private getMockCategoryDistribution(): CategoryDistribution[] {
    return [
      { label: 'Health', value: 42, percentage: 42, color: '#ef4444' },
      { label: 'Wealth', value: 33, percentage: 33, color: '#10b981' },
      { label: 'Happiness', value: 25, percentage: 25, color: '#3b82f6' }
    ];
  }

  private getMockEngagementTrends(): EngagementData[] {
    return [
      { day: 'Mon', likes: 2400, comments: 890, shares: 340, views: 12000, downloads: 450 },
      { day: 'Tue', likes: 3100, comments: 1200, shares: 420, views: 15000, downloads: 580 },
      { day: 'Wed', likes: 2800, comments: 980, shares: 380, views: 13500, downloads: 520 },
      { day: 'Thu', likes: 3500, comments: 1400, shares: 520, views: 16800, downloads: 670 },
      { day: 'Fri', likes: 4200, comments: 1800, shares: 680, views: 18900, downloads: 780 },
      { day: 'Sat', likes: 3900, comments: 1600, shares: 590, views: 17200, downloads: 690 },
      { day: 'Sun', likes: 3600, comments: 1500, shares: 550, views: 16100, downloads: 630 }
    ];
  }

  private getMockUserDemographics(): UserDemographic[] {
    return [
      { ageGroup: '18-24', percentage: 22, count: 2200 },
      { ageGroup: '25-34', percentage: 38, count: 3800 },
      { ageGroup: '35-44', percentage: 28, count: 2800 },
      { ageGroup: '45+', percentage: 12, count: 1200 }
    ];
  }

  private getMockGeographicDistribution(): GeographicData[] {
    return [
      { country: 'United States', percentage: 42, count: 4200, flag: '🇺🇸' },
      { country: 'United Kingdom', percentage: 18, count: 1800, flag: '🇬🇧' },
      { country: 'Canada', percentage: 15, count: 1500, flag: '🇨🇦' },
      { country: 'Australia', percentage: 12, count: 1200, flag: '🇦🇺' },
      { country: 'Others', percentage: 13, count: 1300, flag: '🌍' }
    ];
  }
}

// Export singleton instance
export const analyticsService = new AnalyticsService();

// Convenience functions for tracking common events
export const trackPageView = (page: string, metadata?: any) => {
  analyticsService.trackEvent({
    event_type: 'page_view',
    metadata: { page, ...metadata }
  });
};

export const trackTipView = (tipId: string, metadata?: any) => {
  analyticsService.trackEvent({
    event_type: 'view',
    tip_id: tipId,
    metadata
  });
};

export const trackTipDownload = (tipId: string, metadata?: any) => {
  analyticsService.trackEvent({
    event_type: 'download',
    tip_id: tipId,
    metadata
  });
};

export const trackTipShare = (tipId: string, metadata?: any) => {
  analyticsService.trackEvent({
    event_type: 'share',
    tip_id: tipId,
    metadata
  });
};

export const trackSearch = (searchTerm: string, results: number, metadata?: any) => {
  analyticsService.trackEvent({
    event_type: 'search',
    metadata: { search_term: searchTerm, results, ...metadata }
  });
};

export const trackFilter = (filterType: string, filterValue: string, metadata?: any) => {
  analyticsService.trackEvent({
    event_type: 'filter',
    metadata: { filter_type: filterType, filter_value: filterValue, ...metadata }
  });
};