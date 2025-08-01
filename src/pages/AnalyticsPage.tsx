import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  Users, 
  Eye, 
  Download, 
  Calendar,
  ArrowUp,
  ArrowDown,
  Activity,
  DollarSign,
  Heart,
  MessageCircle,
  Share2,
  Clock,
  BarChart3,
  PieChart,
  LineChart,
  Filter,
  ChevronDown,
  Loader2
} from 'lucide-react';
import { 
  analyticsService, 
  trackPageView,
  DashboardMetrics,
  ContentPerformance,
  CategoryDistribution,
  EngagementData,
  UserDemographic,
  GeographicData,
  AnalyticsFilters
} from '../services/analyticsService';

interface MetricCard {
  label: string;
  value: string | number;
  change: number;
  changeType: 'increase' | 'decrease';
  icon: React.FC<any>;
  color: string;
}

const AnalyticsPage: React.FC = () => {
  const [dateRange, setDateRange] = useState<AnalyticsFilters['dateRange']>('7d');
  const [selectedMetric, setSelectedMetric] = useState('engagement');
  const [loading, setLoading] = useState(true);
  const [dashboardMetrics, setDashboardMetrics] = useState<DashboardMetrics | null>(null);
  const [contentPerformance, setContentPerformance] = useState<ContentPerformance[]>([]);
  const [categoryDistribution, setCategoryDistribution] = useState<CategoryDistribution[]>([]);
  const [engagementData, setEngagementData] = useState<EngagementData[]>([]);
  const [userDemographics, setUserDemographics] = useState<UserDemographic[]>([]);
  const [geographicData, setGeographicData] = useState<GeographicData[]>([]);

  // Load analytics data
  useEffect(() => {
    loadAnalyticsData();
    // Track page view
    trackPageView('analytics', { dateRange });
  }, [dateRange]);

  const loadAnalyticsData = async () => {
    setLoading(true);
    try {
      const filters: AnalyticsFilters = { dateRange };
      
      const [
        metrics,
        performance,
        distribution,
        engagement,
        demographics,
        geographic
      ] = await Promise.all([
        analyticsService.getDashboardMetrics(filters),
        analyticsService.getContentPerformance(filters),
        analyticsService.getCategoryDistribution(filters),
        analyticsService.getEngagementTrends(filters),
        analyticsService.getUserDemographics(filters),
        analyticsService.getGeographicDistribution(filters)
      ]);

      setDashboardMetrics(metrics);
      setContentPerformance(performance);
      setCategoryDistribution(distribution);
      setEngagementData(engagement);
      setUserDemographics(demographics);
      setGeographicData(geographic);
    } catch (error) {
      console.error('Error loading analytics data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  const formatCurrency = (num: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(num);
  };

  const getMetrics = (): MetricCard[] => {
    if (!dashboardMetrics) return [];
    
    return [
      {
        label: 'Total Views',
        value: formatNumber(dashboardMetrics.totalViews),
        change: dashboardMetrics.viewsChange,
        changeType: dashboardMetrics.viewsChange >= 0 ? 'increase' : 'decrease',
        icon: Eye,
        color: 'blue'
      },
      {
        label: 'Active Users',
        value: formatNumber(dashboardMetrics.activeUsers),
        change: Math.abs(dashboardMetrics.usersChange),
        changeType: dashboardMetrics.usersChange >= 0 ? 'increase' : 'decrease',
        icon: Users,
        color: 'green'
      },
      {
        label: 'Downloads',
        value: formatNumber(dashboardMetrics.downloads),
        change: Math.abs(dashboardMetrics.downloadsChange),
        changeType: dashboardMetrics.downloadsChange >= 0 ? 'increase' : 'decrease',
        icon: Download,
        color: 'purple'
      },
      {
        label: 'Revenue',
        value: formatCurrency(dashboardMetrics.revenue),
        change: Math.abs(dashboardMetrics.revenueChange),
        changeType: dashboardMetrics.revenueChange >= 0 ? 'increase' : 'decrease',
        icon: DollarSign,
        color: 'yellow'
      }
    ];
  };


  const getColorClasses = (color: string) => {
    const colors = {
      blue: 'bg-blue-100 text-blue-700',
      green: 'bg-green-100 text-green-700',
      purple: 'bg-purple-100 text-purple-700',
      yellow: 'bg-yellow-100 text-yellow-700'
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      Health: 'bg-green-100 text-green-700',
      Wealth: 'bg-blue-100 text-blue-700',
      Happiness: 'bg-purple-100 text-purple-700'
    };
    return colors[category as keyof typeof colors] || 'bg-gray-100 text-gray-700';
  };

  if (loading) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <span className="ml-2 text-gray-600">Loading analytics...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
            <p className="text-gray-600 mt-1">Track your content performance and audience engagement</p>
          </div>
          
          <div className="flex items-center gap-4">
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value as AnalyticsFilters['dateRange'])}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="24h">Last 24 hours</option>
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
            </select>
            
            <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              <Download className="w-4 h-4" />
              Export Report
            </button>
          </div>
        </div>
      </div>

      {/* Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {getMetrics().map((metric, index) => (
          <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-start justify-between mb-4">
              <div className={`p-3 rounded-lg ${getColorClasses(metric.color)}`}>
                <metric.icon className="w-6 h-6" />
              </div>
              <span className={`flex items-center gap-1 text-sm font-medium ${
                metric.changeType === 'increase' ? 'text-green-600' : 'text-red-600'
              }`}>
                {metric.changeType === 'increase' ? (
                  <ArrowUp className="w-4 h-4" />
                ) : (
                  <ArrowDown className="w-4 h-4" />
                )}
                {Math.abs(metric.change)}%
              </span>
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{metric.value}</div>
              <div className="text-sm text-gray-600">{metric.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        {/* Engagement Trends */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Engagement Trends</h2>
            <div className="flex gap-2">
              <button
                onClick={() => setSelectedMetric('engagement')}
                className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                  selectedMetric === 'engagement'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setSelectedMetric('likes')}
                className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                  selectedMetric === 'likes'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                Likes
              </button>
              <button
                onClick={() => setSelectedMetric('comments')}
                className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                  selectedMetric === 'comments'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                Comments
              </button>
            </div>
          </div>
          
          {/* Engagement Chart */}
          <div className="h-64 flex items-end justify-between gap-2">
            {engagementData.map((data, index) => {
              const maxValue = Math.max(...engagementData.map(d => selectedMetric === 'engagement' ? d.views : selectedMetric === 'likes' ? d.likes : d.comments));
              const currentValue = selectedMetric === 'engagement' ? data.views : selectedMetric === 'likes' ? data.likes : data.comments;
              const height = maxValue > 0 ? (currentValue / maxValue) * 200 : 0;
              
              return (
                <div key={index} className="flex-1 flex flex-col items-center gap-2">
                  <div className="w-full bg-gray-100 rounded-t-lg relative flex flex-col justify-end" style={{ height: '200px' }}>
                    <div 
                      className={`rounded-t-lg transition-all duration-300 ${
                        selectedMetric === 'likes' ? 'bg-blue-500' :
                        selectedMetric === 'comments' ? 'bg-green-500' :
                        'bg-purple-500'
                      }`}
                      style={{ height: `${height}px` }}
                    />
                  </div>
                  <span className="text-xs text-gray-600">{data.day}</span>
                </div>
              );
            })}
          </div>
          
          <div className="flex items-center justify-center gap-6 mt-6">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span className="text-sm text-gray-600">Likes</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-sm text-gray-600">Comments</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
              <span className="text-sm text-gray-600">Shares</span>
            </div>
          </div>
        </div>

        {/* Category Distribution */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Content Distribution</h2>
          
          <div className="relative h-48 mb-6">
            {/* Simulated Pie Chart */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-40 h-40 rounded-full bg-gradient-to-r from-green-400 via-blue-400 to-purple-400 relative">
                <div className="absolute inset-4 bg-white rounded-full flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">100%</div>
                    <div className="text-xs text-gray-600">Total</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="space-y-3">
            {categoryDistribution.map((category, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: category.color }}
                  ></div>
                  <span className="text-sm text-gray-700">{category.label}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500">{category.value}</span>
                  <span className="text-sm font-medium text-gray-900">{category.percentage}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Performing Content */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">Top Performing Content</h2>
          <button className="text-blue-600 hover:text-blue-700 font-medium text-sm">
            View All →
          </button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Content Title</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Category</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-gray-700">Views</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-gray-700">Engagement</th>
                <th className="text-center py-3 px-4 text-sm font-medium text-gray-700">Trend</th>
              </tr>
            </thead>
            <tbody>
              {contentPerformance.map((content, index) => (
                <tr key={content.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <div className="font-medium text-gray-900">{content.title}</div>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(content.category)}`}>
                      {content.category}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right text-gray-700">
                    {content.views.toLocaleString()}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <span className="text-gray-700">{content.engagement}%</span>
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-green-500 h-2 rounded-full"
                          style={{ width: `${Math.min(100, content.engagement)}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <TrendingUp className="w-4 h-4 text-green-500 mx-auto" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Audience Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
        {/* Demographics */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Audience Demographics</h2>
          
          <div className="space-y-4">
            {userDemographics.map((demo, index) => (
              <div key={index}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">{demo.ageGroup}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500">({demo.count.toLocaleString()})</span>
                    <span className="text-sm font-medium text-gray-900">{demo.percentage}%</span>
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full transition-all duration-300" 
                    style={{ width: `${demo.percentage}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Geographic Distribution */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Geographic Reach</h2>
          
          <div className="space-y-3">
            {geographicData.map((location, index) => (
              <div key={index} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{location.flag}</span>
                  <span className="text-sm font-medium text-gray-900">{location.country}</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-purple-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${location.percentage}%` }}
                    />
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-xs text-gray-500">({location.count.toLocaleString()})</span>
                    <span className="text-sm font-medium text-gray-700 w-12 text-right">
                      {location.percentage}%
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;