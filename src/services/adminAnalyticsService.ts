import { supabase } from '../lib/supabase';

interface AnalyticsMetrics {
  totalUsers: number;
  activeUsers: number;
  totalTips: number;
  viewsToday: number;
  downloadsToday: number;
  averageEngagement: number;
  userGrowth: number;
  revenue: number;
}

interface TimeSeriesData {
  date: string;
  value: number;
}

interface TipPerformance {
  tipId: string;
  title: string;
  views: number;
  downloads: number;
  shares: number;
  rating: number;
}

export class AdminAnalyticsService {
  // Get overall platform metrics
  static async getPlatformMetrics(): Promise<AnalyticsMetrics> {
    try {
      const today = new Date().toISOString().split('T')[0];
      const lastMonth = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

      // Get user counts
      const { count: totalUsers } = await supabase
        .from('user_profiles')
        .select('*', { count: 'exact', head: true });

      const { count: activeUsers } = await supabase
        .from('user_profiles')
        .select('*', { count: 'exact', head: true })
        .gte('last_active', lastMonth);

      // Get tip counts
      const { count: totalTips } = await supabase
        .from('tips')
        .select('*', { count: 'exact', head: true });

      // Get today's activity
      const { data: todayActivity } = await supabase
        .from('user_activity')
        .select('activity_type')
        .gte('created_at', today);

      const viewsToday = todayActivity?.filter(a => a.activity_type === 'view').length || 0;
      const downloadsToday = todayActivity?.filter(a => a.activity_type === 'download').length || 0;

      // Calculate user growth (mock for now)
      const userGrowth = 12; // 12% growth

      // Calculate average engagement (mock)
      const averageEngagement = 87;

      // Calculate revenue (mock)
      const revenue = 12847;

      return {
        totalUsers: totalUsers || 0,
        activeUsers: activeUsers || 0,
        totalTips: totalTips || 0,
        viewsToday,
        downloadsToday,
        averageEngagement,
        userGrowth,
        revenue
      };
    } catch (error) {
      console.error('Error fetching platform metrics:', error);
      // Return mock data for development
      return {
        totalUsers: 2847,
        activeUsers: 2341,
        totalTips: 1234,
        viewsToday: 3456,
        downloadsToday: 234,
        averageEngagement: 87,
        userGrowth: 12,
        revenue: 12847
      };
    }
  }

  // Get user growth over time
  static async getUserGrowthData(days: number = 30): Promise<TimeSeriesData[]> {
    try {
      const endDate = new Date();
      const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

      const { data } = await supabase
        .from('user_profiles')
        .select('created_at')
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString())
        .order('created_at');

      // Group by day
      const grouped = data?.reduce((acc, user) => {
        const date = new Date(user.created_at).toISOString().split('T')[0];
        acc[date] = (acc[date] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {};

      // Fill in missing days and create cumulative count
      const result: TimeSeriesData[] = [];
      let cumulativeCount = 0;
      for (let i = 0; i < days; i++) {
        const date = new Date(endDate.getTime() - (days - i - 1) * 24 * 60 * 60 * 1000);
        const dateStr = date.toISOString().split('T')[0];
        cumulativeCount += grouped[dateStr] || 0;
        result.push({
          date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          value: cumulativeCount
        });
      }

      return result;
    } catch (error) {
      console.error('Error fetching user growth data:', error);
      // Return mock data
      return Array.from({ length: days }, (_, i) => ({
        date: new Date(Date.now() - (days - i - 1) * 24 * 60 * 60 * 1000)
          .toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        value: Math.floor(2000 + i * 30 + Math.random() * 50)
      }));
    }
  }

  // Get tip performance data
  static async getTipPerformance(limit: number = 10): Promise<TipPerformance[]> {
    try {
      const { data: tips } = await supabase
        .from('tips')
        .select(`
          id,
          title,
          user_activity (
            activity_type
          )
        `)
        .limit(limit);

      return (tips || []).map(tip => {
        const activities = tip.user_activity || [];
        return {
          tipId: tip.id,
          title: tip.title,
          views: activities.filter(a => a.activity_type === 'view').length,
          downloads: activities.filter(a => a.activity_type === 'download').length,
          shares: activities.filter(a => a.activity_type === 'share').length,
          rating: 4.5 + Math.random() * 0.5 // Mock rating
        };
      });
    } catch (error) {
      console.error('Error fetching tip performance:', error);
      // Return mock data
      return Array.from({ length: limit }, (_, i) => ({
        tipId: `tip-${i + 1}`,
        title: `Business Tip ${i + 1}`,
        views: Math.floor(Math.random() * 1000),
        downloads: Math.floor(Math.random() * 100),
        shares: Math.floor(Math.random() * 50),
        rating: 4.5 + Math.random() * 0.5
      }));
    }
  }

  // Get activity by hour
  static async getActivityByHour(): Promise<TimeSeriesData[]> {
    try {
      const { data } = await supabase
        .from('user_activity')
        .select('created_at')
        .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

      const hourCounts = Array(24).fill(0);
      data?.forEach(activity => {
        const hour = new Date(activity.created_at).getHours();
        hourCounts[hour]++;
      });

      return hourCounts.map((count, hour) => ({
        date: `${hour}:00`,
        value: count
      }));
    } catch (error) {
      console.error('Error fetching activity by hour:', error);
      // Return mock data
      return Array.from({ length: 24 }, (_, hour) => ({
        date: `${hour}:00`,
        value: Math.floor(Math.random() * 100 + (hour >= 9 && hour <= 17 ? 100 : 20))
      }));
    }
  }

  // Get subscription distribution
  static async getSubscriptionDistribution(): Promise<{ name: string; value: number }[]> {
    try {
      const { data } = await supabase
        .from('user_profiles')
        .select('subscription_tier');

      const counts = (data || []).reduce((acc, user) => {
        const tier = user.subscription_tier || 'free';
        acc[tier] = (acc[tier] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      return Object.entries(counts).map(([name, value]) => ({
        name: name.charAt(0).toUpperCase() + name.slice(1),
        value
      }));
    } catch (error) {
      console.error('Error fetching subscription distribution:', error);
      // Return mock data
      return [
        { name: 'Free', value: 1543 },
        { name: 'Basic', value: 645 },
        { name: 'Premium', value: 487 },
        { name: 'Enterprise', value: 172 }
      ];
    }
  }

  // Set up real-time subscriptions
  static subscribeToMetrics(callback: (metrics: AnalyticsMetrics) => void) {
    const channel = supabase
      .channel('analytics-metrics')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'user_activity' }, () => {
        this.getPlatformMetrics().then(callback);
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'user_profiles' }, () => {
        this.getPlatformMetrics().then(callback);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }
}