import { supabase } from '../lib/supabase';

export interface AnalyticsSummary {
  metricName: string;
  currentValue: number;
  previousValue: number;
  changePercentage: number;
  trend: 'up' | 'down' | 'stable';
}

export interface TopContent {
  contentId: string;
  contentType: string;
  viewCount: number;
  uniqueViewers: number;
  completionRate: number;
  downloadCount: number;
  shareCount: number;
  engagementScore: number;
}

export interface ActivityTimeseries {
  timeBucket: Date;
  pageViews: number;
  tipViews: number;
  downloads: number;
  uniqueUsers: number;
  sessions: number;
}

export interface UserCohort {
  cohortDate: Date;
  usersCount: number;
  week1Retention: number;
  week2Retention: number;
  week4Retention: number;
  month1Retention: number;
}

export type TimeInterval = 'minute' | 'hour' | 'day' | 'week' | 'month';
export type MetricType = 'views' | 'downloads' | 'shares' | 'engagement';

class AggregationService {
  /**
   * Get analytics summary with period comparison
   */
  async getAnalyticsSummary(
    startDate?: Date,
    endDate?: Date,
    userId?: string
  ): Promise<AnalyticsSummary[]> {
    try {
      const { data, error } = await supabase.rpc('get_analytics_summary', {
        p_start_date: startDate?.toISOString().split('T')[0],
        p_end_date: endDate?.toISOString().split('T')[0],
        p_user_id: userId
      });

      if (error) throw error;

      return data?.map(item => ({
        metricName: item.metric_name,
        currentValue: parseInt(item.current_value) || 0,
        previousValue: parseInt(item.previous_value) || 0,
        changePercentage: parseFloat(item.change_percentage) || 0,
        trend: item.trend as 'up' | 'down' | 'stable'
      })) || [];
    } catch (error) {
      console.error('Error fetching analytics summary:', error);
      return [];
    }
  }

  /**
   * Get top performing content
   */
  async getTopContent(
    limit: number = 10,
    days: number = 30,
    metric: MetricType = 'views'
  ): Promise<TopContent[]> {
    try {
      const { data, error } = await supabase.rpc('get_top_content', {
        p_limit: limit,
        p_days: days,
        p_metric: metric
      });

      if (error) throw error;

      return data?.map(item => ({
        contentId: item.content_id,
        contentType: item.content_type,
        viewCount: parseInt(item.view_count) || 0,
        uniqueViewers: parseInt(item.unique_viewers) || 0,
        completionRate: parseFloat(item.completion_rate) || 0,
        downloadCount: parseInt(item.download_count) || 0,
        shareCount: parseInt(item.share_count) || 0,
        engagementScore: parseFloat(item.engagement_score) || 0
      })) || [];
    } catch (error) {
      console.error('Error fetching top content:', error);
      return [];
    }
  }

  /**
   * Get activity time series data
   */
  async getActivityTimeseries(
    startDate?: Date,
    endDate?: Date,
    interval: TimeInterval = 'hour',
    userId?: string
  ): Promise<ActivityTimeseries[]> {
    try {
      const { data, error } = await supabase.rpc('get_activity_timeseries', {
        p_start_date: startDate?.toISOString(),
        p_end_date: endDate?.toISOString(),
        p_interval: interval,
        p_user_id: userId
      });

      if (error) throw error;

      return data?.map(item => ({
        timeBucket: new Date(item.time_bucket),
        pageViews: parseInt(item.page_views) || 0,
        tipViews: parseInt(item.tip_views) || 0,
        downloads: parseInt(item.downloads) || 0,
        uniqueUsers: parseInt(item.unique_users) || 0,
        sessions: parseInt(item.sessions) || 0
      })) || [];
    } catch (error) {
      console.error('Error fetching activity timeseries:', error);
      return [];
    }
  }

  /**
   * Get user cohort retention data
   */
  async getUserCohorts(cohortPeriod: 'day' | 'week' | 'month' = 'week'): Promise<UserCohort[]> {
    try {
      const { data, error } = await supabase.rpc('get_user_cohorts', {
        p_cohort_period: cohortPeriod
      });

      if (error) throw error;

      return data?.map(item => ({
        cohortDate: new Date(item.cohort_date),
        usersCount: item.users_count || 0,
        week1Retention: parseFloat(item.week_1_retention) || 0,
        week2Retention: parseFloat(item.week_2_retention) || 0,
        week4Retention: parseFloat(item.week_4_retention) || 0,
        month1Retention: parseFloat(item.month_1_retention) || 0
      })) || [];
    } catch (error) {
      console.error('Error fetching user cohorts:', error);
      return [];
    }
  }

  /**
   * Get aggregated metrics for a specific date range
   */
  async getAggregatedMetrics(
    startDate: Date,
    endDate: Date,
    groupBy: TimeInterval = 'day'
  ): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('analytics_daily_rollup')
        .select('*')
        .gte('date', startDate.toISOString().split('T')[0])
        .lte('date', endDate.toISOString().split('T')[0])
        .order('date', { ascending: false });

      if (error) throw error;

      // Group by specified interval if needed
      if (groupBy !== 'day' && data) {
        return this.groupByInterval(data, groupBy);
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching aggregated metrics:', error);
      return [];
    }
  }

  /**
   * Get real-time metrics from materialized views
   */
  async getRealTimeMetrics(hours: number = 24): Promise<any> {
    try {
      const since = new Date();
      since.setHours(since.getHours() - hours);

      const { data, error } = await supabase
        .from('analytics_hourly')
        .select(`
          hour,
          sum(page_views) as total_page_views,
          sum(tip_views) as total_tip_views,
          sum(downloads) as total_downloads,
          count(distinct user_id) as unique_users
        `)
        .gte('hour', since.toISOString())
        .order('hour', { ascending: true });

      if (error) throw error;

      return {
        timeRange: { start: since, end: new Date() },
        hourlyData: data || [],
        totals: this.calculateTotals(data || [])
      };
    } catch (error) {
      console.error('Error fetching real-time metrics:', error);
      return null;
    }
  }

  /**
   * Refresh materialized views for latest data
   */
  async refreshMaterializedViews(): Promise<boolean> {
    try {
      const { error } = await supabase.rpc('refresh_analytics_views');
      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error refreshing materialized views:', error);
      return false;
    }
  }

  /**
   * Get performance metrics for dashboard
   */
  async getDashboardPerformanceMetrics(): Promise<any> {
    try {
      // Get query execution times
      const { data: queryStats, error } = await supabase
        .from('pg_stat_statements')
        .select('query, mean_exec_time, calls')
        .like('query', '%analytics%')
        .order('mean_exec_time', { ascending: false })
        .limit(10);

      if (error) {
        // Fallback to basic metrics if pg_stat_statements not available
        return this.getBasicPerformanceMetrics();
      }

      return {
        queryPerformance: queryStats,
        recommendations: this.generatePerformanceRecommendations(queryStats)
      };
    } catch (error) {
      console.error('Error fetching performance metrics:', error);
      return this.getBasicPerformanceMetrics();
    }
  }

  /**
   * Helper: Group data by time interval
   */
  private groupByInterval(data: any[], interval: TimeInterval): any[] {
    const grouped = new Map<string, any>();

    data.forEach(item => {
      const key = this.getIntervalKey(new Date(item.date), interval);
      
      if (!grouped.has(key)) {
        grouped.set(key, {
          period: key,
          total_page_views: 0,
          total_tip_views: 0,
          total_downloads: 0,
          unique_users: new Set(),
          days_count: 0
        });
      }

      const group = grouped.get(key)!;
      group.total_page_views += item.total_page_views || 0;
      group.total_tip_views += item.total_tip_views || 0;
      group.total_downloads += item.total_downloads || 0;
      group.unique_users.add(item.unique_users);
      group.days_count += 1;
    });

    return Array.from(grouped.values()).map(group => ({
      ...group,
      unique_users: group.unique_users.size,
      avg_daily_page_views: Math.round(group.total_page_views / group.days_count)
    }));
  }

  /**
   * Helper: Get interval key for grouping
   */
  private getIntervalKey(date: Date, interval: TimeInterval): string {
    switch (interval) {
      case 'week':
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay());
        return weekStart.toISOString().split('T')[0];
      case 'month':
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      default:
        return date.toISOString().split('T')[0];
    }
  }

  /**
   * Helper: Calculate totals from array
   */
  private calculateTotals(data: any[]): any {
    return data.reduce((acc, item) => ({
      totalPageViews: (acc.totalPageViews || 0) + (parseInt(item.total_page_views) || 0),
      totalTipViews: (acc.totalTipViews || 0) + (parseInt(item.total_tip_views) || 0),
      totalDownloads: (acc.totalDownloads || 0) + (parseInt(item.total_downloads) || 0),
      maxConcurrentUsers: Math.max(acc.maxConcurrentUsers || 0, parseInt(item.unique_users) || 0)
    }), {});
  }

  /**
   * Helper: Get basic performance metrics
   */
  private getBasicPerformanceMetrics(): any {
    return {
      status: 'healthy',
      message: 'Performance monitoring limited - pg_stat_statements extension not available',
      recommendations: [
        'Enable pg_stat_statements for detailed query performance tracking',
        'Monitor materialized view refresh times',
        'Consider adding indexes on frequently queried columns'
      ]
    };
  }

  /**
   * Helper: Generate performance recommendations
   */
  private generatePerformanceRecommendations(queryStats: any[]): string[] {
    const recommendations: string[] = [];

    queryStats.forEach(stat => {
      if (stat.mean_exec_time > 1000) {
        recommendations.push(`Optimize slow query: ${stat.query.substring(0, 50)}...`);
      }
      if (stat.calls > 10000) {
        recommendations.push(`Consider caching frequently called query: ${stat.query.substring(0, 50)}...`);
      }
    });

    if (recommendations.length === 0) {
      recommendations.push('All queries performing within acceptable limits');
    }

    return recommendations;
  }
}

export const aggregationService = new AggregationService();