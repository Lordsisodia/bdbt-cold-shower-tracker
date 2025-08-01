import { supabase } from '../lib/supabase';

export interface DashboardMetrics {
  totalPageViews: number;
  totalTipViews: number;
  totalTipsCompleted: number;
  totalDownloads: number;
  totalShares: number;
  uniqueDaysActive: number;
  avgDailyPageViews: number;
  mostViewedTips: Array<{
    content_id: string;
    view_count: number;
    completion_count: number;
  }>;
  activityByDay: Array<{
    date: string;
    page_views: number;
    tip_views: number;
    tips_completed: number;
  }>;
}

export interface ActivityData {
  userId?: string;
  activityType: 'page_view' | 'tip_view' | 'tip_complete' | 'tip_download' | 'pdf_download' | 'share' | 'bookmark' | 'search' | 'filter_apply';
  entityType?: string;
  entityId?: string;
  details?: Record<string, any>;
}

export interface TimeRange {
  startDate?: Date;
  endDate?: Date;
  preset?: 'today' | 'week' | 'month' | 'quarter' | 'year' | 'all';
}

export interface PopularContent {
  contentType: string;
  contentId: string;
  viewCount: number;
  uniqueViewers: number;
  completionCount: number;
  downloadCount: number;
  shareCount: number;
  avgTimeSpentSeconds: number;
}

export interface UserEngagement {
  dailyStats: any[];
  totalDays: number;
  avgSessionsPerDay: number;
  avgTimePerDay: number;
}

export interface ContentPerformanceMetrics {
  viewCount: number;
  uniqueViewers: number;
  completionCount: number;
  downloadCount: number;
  shareCount: number;
  avgTimeSpentSeconds: number;
  lastHourViews: number;
  lastDayViews: number;
  lastWeekViews: number;
  lastMonthViews: number;
}

class AnalyticsApiService {
  /**
   * Track a user activity
   */
  async trackActivity(data: ActivityData): Promise<string | null> {
    try {
      const { data: result, error } = await supabase.rpc('track_activity', {
        p_user_id: data.userId || (await this.getCurrentUserId()),
        p_activity_type: data.activityType,
        p_entity_type: data.entityType,
        p_entity_id: data.entityId,
        p_details: data.details || {}
      });

      if (error) throw error;
      return result;
    } catch (error) {
      console.error('Error tracking activity:', error);
      return null;
    }
  }

  /**
   * Get dashboard analytics for a user or globally
   */
  async getDashboardMetrics(
    userId?: string,
    timeRange?: TimeRange
  ): Promise<DashboardMetrics | null> {
    try {
      const { startDate, endDate } = this.getDateRange(timeRange);
      
      const { data, error } = await supabase.rpc('get_dashboard_analytics', {
        p_user_id: userId,
        p_start_date: startDate.toISOString().split('T')[0],
        p_end_date: endDate.toISOString().split('T')[0]
      });

      if (error) throw error;
      
      const result = data?.[0];
      if (!result) return null;

      return {
        totalPageViews: parseInt(result.total_page_views) || 0,
        totalTipViews: parseInt(result.total_tip_views) || 0,
        totalTipsCompleted: parseInt(result.total_tips_completed) || 0,
        totalDownloads: parseInt(result.total_downloads) || 0,
        totalShares: parseInt(result.total_shares) || 0,
        uniqueDaysActive: result.unique_days_active || 0,
        avgDailyPageViews: parseFloat(result.avg_daily_page_views) || 0,
        mostViewedTips: result.most_viewed_tips || [],
        activityByDay: result.activity_by_day || []
      };
    } catch (error) {
      console.error('Error fetching dashboard metrics:', error);
      return null;
    }
  }

  /**
   * Get real-time activity feed
   */
  async getActivityFeed(
    limit: number = 20,
    publicOnly: boolean = true
  ): Promise<any[]> {
    try {
      let query = supabase
        .from('activity_feed')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (publicOnly) {
        query = query.eq('is_public', true);
      }

      const { data, error } = await query;
      if (error) throw error;
      
      return data || [];
    } catch (error) {
      console.error('Error fetching activity feed:', error);
      return [];
    }
  }

  /**
   * Get popular content by type
   */
  async getPopularContent(
    contentType: string = 'tip',
    limit: number = 10
  ): Promise<PopularContent[]> {
    try {
      const { data, error } = await supabase
        .from('content_popularity')
        .select('*')
        .eq('content_type', contentType)
        .order('view_count', { ascending: false })
        .limit(limit);

      if (error) throw error;
      
      return data?.map(item => ({
        contentType: item.content_type,
        contentId: item.content_id,
        viewCount: item.view_count,
        uniqueViewers: item.unique_viewers,
        completionCount: item.completion_count,
        downloadCount: item.download_count,
        shareCount: item.share_count,
        avgTimeSpentSeconds: item.avg_time_spent_seconds
      })) || [];
    } catch (error) {
      console.error('Error fetching popular content:', error);
      return [];
    }
  }

  /**
   * Get user engagement metrics
   */
  async getUserEngagement(
    userId: string,
    timeRange?: TimeRange
  ): Promise<UserEngagement | null> {
    try {
      const { startDate, endDate } = this.getDateRange(timeRange);
      
      const { data, error } = await supabase
        .from('analytics_daily')
        .select('*')
        .eq('user_id', userId)
        .gte('date', startDate.toISOString().split('T')[0])
        .lte('date', endDate.toISOString().split('T')[0])
        .order('date', { ascending: false });

      if (error) throw error;
      
      return {
        dailyStats: data || [],
        totalDays: data?.length || 0,
        avgSessionsPerDay: this.calculateAverage(data || [], 'sessions_count'),
        avgTimePerDay: this.calculateAverage(data || [], 'total_time_seconds')
      };
    } catch (error) {
      console.error('Error fetching user engagement:', error);
      return null;
    }
  }

  /**
   * Get content performance metrics
   */
  async getContentPerformance(
    contentId: string,
    contentType: string = 'tip'
  ): Promise<ContentPerformanceMetrics | null> {
    try {
      const { data, error } = await supabase
        .from('content_popularity')
        .select('*')
        .eq('content_type', contentType)
        .eq('content_id', contentId)
        .single();

      if (error) throw error;
      
      if (!data) return null;

      return {
        viewCount: data.view_count,
        uniqueViewers: data.unique_viewers,
        completionCount: data.completion_count,
        downloadCount: data.download_count,
        shareCount: data.share_count,
        avgTimeSpentSeconds: data.avg_time_spent_seconds,
        lastHourViews: data.last_hour_views,
        lastDayViews: data.last_day_views,
        lastWeekViews: data.last_week_views,
        lastMonthViews: data.last_month_views
      };
    } catch (error) {
      console.error('Error fetching content performance:', error);
      return null;
    }
  }

  /**
   * Get trending content
   */
  async getTrendingContent(
    timeWindow: 'hour' | 'day' | 'week' | 'month' = 'day',
    limit: number = 10
  ): Promise<any[]> {
    try {
      const columnMap = {
        hour: 'last_hour_views',
        day: 'last_day_views',
        week: 'last_week_views',
        month: 'last_month_views'
      };

      const { data, error } = await supabase
        .from('content_popularity')
        .select('*')
        .order(columnMap[timeWindow], { ascending: false })
        .limit(limit);

      if (error) throw error;
      
      return data || [];
    } catch (error) {
      console.error('Error fetching trending content:', error);
      return [];
    }
  }

  /**
   * Get aggregate statistics for a time period
   */
  async getAggregateStats(timeRange?: TimeRange): Promise<any> {
    try {
      const { startDate, endDate } = this.getDateRange(timeRange);
      
      const { data, error } = await supabase
        .from('analytics_daily')
        .select(`
          date,
          sum(page_views) as total_page_views,
          sum(tip_views) as total_tip_views,
          sum(tips_completed) as total_tips_completed,
          sum(downloads) as total_downloads,
          sum(shares) as total_shares,
          count(distinct user_id) as unique_users
        `)
        .gte('date', startDate.toISOString().split('T')[0])
        .lte('date', endDate.toISOString().split('T')[0])
        .single();

      if (error) throw error;
      
      return data;
    } catch (error) {
      console.error('Error fetching aggregate stats:', error);
      return null;
    }
  }

  /**
   * Get user activity history
   */
  async getUserActivityHistory(
    userId: string,
    limit: number = 50,
    offset: number = 0
  ): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('user_activities')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) throw error;
      
      return data || [];
    } catch (error) {
      console.error('Error fetching user activity history:', error);
      return [];
    }
  }

  /**
   * Get session analytics
   */
  async getSessionAnalytics(sessionId: string): Promise<any> {
    try {
      const { data, error } = await supabase
        .from('user_activities')
        .select('*')
        .eq('session_id', sessionId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      
      if (!data || data.length === 0) return null;

      const firstActivity = data[0];
      const lastActivity = data[data.length - 1];
      const duration = new Date(lastActivity.created_at).getTime() - new Date(firstActivity.created_at).getTime();

      return {
        sessionId,
        startTime: firstActivity.created_at,
        endTime: lastActivity.created_at,
        duration: Math.floor(duration / 1000), // in seconds
        activityCount: data.length,
        activities: data,
        pageViews: data.filter(a => a.activity_type === 'page_view').length,
        tipViews: data.filter(a => a.activity_type === 'tip_view').length,
        downloads: data.filter(a => ['tip_download', 'pdf_download'].includes(a.activity_type)).length
      };
    } catch (error) {
      console.error('Error fetching session analytics:', error);
      return null;
    }
  }

  /**
   * Helper: Get current user ID
   */
  private async getCurrentUserId(): Promise<string | null> {
    const { data: { user } } = await supabase.auth.getUser();
    return user?.id || null;
  }

  /**
   * Helper: Get date range from time range options
   */
  private getDateRange(timeRange?: TimeRange): { startDate: Date; endDate: Date } {
    const endDate = timeRange?.endDate || new Date();
    let startDate = timeRange?.startDate || new Date();

    if (timeRange?.preset) {
      const now = new Date();
      switch (timeRange.preset) {
        case 'today':
          startDate = new Date(now.setHours(0, 0, 0, 0));
          break;
        case 'week':
          startDate = new Date(now.setDate(now.getDate() - 7));
          break;
        case 'month':
          startDate = new Date(now.setMonth(now.getMonth() - 1));
          break;
        case 'quarter':
          startDate = new Date(now.setMonth(now.getMonth() - 3));
          break;
        case 'year':
          startDate = new Date(now.setFullYear(now.getFullYear() - 1));
          break;
        case 'all':
          startDate = new Date('2020-01-01');
          break;
      }
    } else if (!timeRange?.startDate) {
      // Default to last 30 days
      startDate = new Date();
      startDate.setDate(startDate.getDate() - 30);
    }

    return { startDate, endDate };
  }

  /**
   * Helper: Calculate average from array of objects
   */
  private calculateAverage(data: any[], field: string): number {
    if (!data.length) return 0;
    const sum = data.reduce((acc, item) => acc + (item[field] || 0), 0);
    return sum / data.length;
  }
}

export const analyticsApiService = new AnalyticsApiService();