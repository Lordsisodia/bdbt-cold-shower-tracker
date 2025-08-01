import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  Users, 
  Download, 
  DollarSign,
  Activity,
  Eye,
  Share2,
  Clock,
  Globe,
  BarChart3,
  PieChart,
  Calendar
} from 'lucide-react';
import { 
  analyticsService,
  DashboardMetrics,
  ContentPerformance,
  CategoryDistribution,
  EngagementData,
  UserDemographic,
  GeographicData,
  AnalyticsFilters
} from '../../services/analyticsService';
import { useActivityTracking } from '../../hooks/user/useActivityTracking';

interface MetricCardProps {
  title: string;
  value: string | number;
  change: number;
  icon: React.ElementType;
  color: string;
}

const MetricCard: React.FC<MetricCardProps> = ({ title, value, change, icon: Icon, color }) => {
  const isPositive = change >= 0;
  
  return (
    <div className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-2">
            {typeof value === 'number' ? value.toLocaleString() : value}
          </p>
          <p className={`text-sm mt-2 flex items-center ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
            <TrendingUp className={`w-4 h-4 mr-1 ${!isPositive && 'rotate-180'}`} />
            {Math.abs(change)}% from last period
          </p>
        </div>
        <div className={`p-3 rounded-full ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  );
};

const UserAnalytics: React.FC = () => {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [contentPerformance, setContentPerformance] = useState<ContentPerformance[]>([]);
  const [categoryDistribution, setCategoryDistribution] = useState<CategoryDistribution[]>([]);
  const [engagementTrends, setEngagementTrends] = useState<EngagementData[]>([]);
  const [userDemographics, setUserDemographics] = useState<UserDemographic[]>([]);
  const [geographicData, setGeographicData] = useState<GeographicData[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<AnalyticsFilters>({
    dateRange: '7d'
  });
  const [activeTab, setActiveTab] = useState<'overview' | 'content' | 'audience' | 'engagement'>('overview');

  const { trackUserAction } = useActivityTracking();

  useEffect(() => {
    loadAnalytics();
  }, [filters]);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      const [
        metricsData,
        contentData,
        categoryData,
        engagementData,
        demographicsData,
        geoData
      ] = await Promise.all([
        analyticsService.getDashboardMetrics(filters),
        analyticsService.getContentPerformance(filters),
        analyticsService.getCategoryDistribution(filters),
        analyticsService.getEngagementTrends(filters),
        analyticsService.getUserDemographics(filters),
        analyticsService.getGeographicDistribution(filters)
      ]);

      setMetrics(metricsData);
      setContentPerformance(contentData);
      setCategoryDistribution(categoryData);
      setEngagementTrends(engagementData);
      setUserDemographics(demographicsData);
      setGeographicData(geoData);
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDateRangeChange = (range: AnalyticsFilters['dateRange']) => {
    trackUserAction('change_date_range', { range });
    setFilters({ ...filters, dateRange: range });
  };

  const handleTabChange = (tab: typeof activeTab) => {
    trackUserAction('change_analytics_tab', { tab });
    setActiveTab(tab);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Analytics Dashboard</h1>
          <p className="text-gray-600">Track your content performance and user engagement</p>
        </div>

        {/* Date Range Filter */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex space-x-2">
            {(['24h', '7d', '30d', '90d', '1y'] as const).map((range) => (
              <button
                key={range}
                onClick={() => handleDateRangeChange(range)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filters.dateRange === range
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
                data-track-click="date_range_filter"
                data-track-value={range}
              >
                {range === '24h' && 'Last 24 hours'}
                {range === '7d' && 'Last 7 days'}
                {range === '30d' && 'Last 30 days'}
                {range === '90d' && 'Last 90 days'}
                {range === '1y' && 'Last year'}
              </button>
            ))}
          </div>
          <button className="flex items-center px-4 py-2 bg-white rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100">
            <Calendar className="w-4 h-4 mr-2" />
            Custom Range
          </button>
        </div>

        {/* Tabs */}
        <div className="mb-6 border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {(['overview', 'content', 'audience', 'engagement'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => handleTabChange(tab)}
                className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
                data-track-click="analytics_tab"
                data-track-value={tab}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </nav>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && metrics && (
          <div className="space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <MetricCard
                title="Total Views"
                value={metrics.totalViews}
                change={metrics.viewsChange}
                icon={Eye}
                color="bg-blue-500"
              />
              <MetricCard
                title="Active Users"
                value={metrics.activeUsers}
                change={metrics.usersChange}
                icon={Users}
                color="bg-green-500"
              />
              <MetricCard
                title="Downloads"
                value={metrics.downloads}
                change={metrics.downloadsChange}
                icon={Download}
                color="bg-purple-500"
              />
              <MetricCard
                title="Revenue"
                value={`$${metrics.revenue.toLocaleString()}`}
                change={metrics.revenueChange}
                icon={DollarSign}
                color="bg-yellow-500"
              />
            </div>

            {/* Engagement Trends Chart */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Activity className="w-5 h-5 mr-2" />
                Engagement Trends
              </h3>
              <div className="h-64 flex items-end justify-between space-x-2">
                {engagementTrends.map((day, index) => (
                  <div key={index} className="flex-1 flex flex-col items-center">
                    <div className="w-full bg-gray-200 rounded-t relative" style={{ height: '200px' }}>
                      <div
                        className="absolute bottom-0 w-full bg-blue-500 rounded-t transition-all hover:bg-blue-600"
                        style={{ height: `${(day.views / Math.max(...engagementTrends.map(d => d.views))) * 100}%` }}
                        title={`${day.views} views`}
                      />
                    </div>
                    <span className="text-xs text-gray-600 mt-2">{day.day}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Category Distribution */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <PieChart className="w-5 h-5 mr-2" />
                Category Distribution
              </h3>
              <div className="space-y-4">
                {categoryDistribution.map((category) => (
                  <div key={category.label} className="flex items-center">
                    <div className="w-32 text-sm font-medium text-gray-700">{category.label}</div>
                    <div className="flex-1 mx-4">
                      <div className="h-6 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full transition-all"
                          style={{ 
                            width: `${category.percentage}%`,
                            backgroundColor: category.color
                          }}
                        />
                      </div>
                    </div>
                    <div className="w-20 text-right text-sm font-medium text-gray-700">
                      {category.percentage}%
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Content Tab */}
        {activeTab === 'content' && (
          <div className="bg-white rounded-lg shadow-sm">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <BarChart3 className="w-5 h-5 mr-2" />
                Top Performing Content
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Title
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Views
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Engagement
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Downloads
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Rating
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {contentPerformance.map((content) => (
                    <tr key={content.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {content.title}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          content.category === 'Health' ? 'bg-red-100 text-red-800' :
                          content.category === 'Wealth' ? 'bg-green-100 text-green-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {content.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 text-center">
                        {content.views.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <div className="flex items-center justify-center">
                          <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-green-500"
                              style={{ width: `${content.engagement}%` }}
                            />
                          </div>
                          <span className="ml-2 text-sm text-gray-600">{content.engagement}%</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 text-center">
                        {content.downloads.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 text-center">
                        ⭐ {content.rating}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Audience Tab */}
        {activeTab === 'audience' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Demographics */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Users className="w-5 h-5 mr-2" />
                Age Demographics
              </h3>
              <div className="space-y-4">
                {userDemographics.map((demo) => (
                  <div key={demo.ageGroup} className="flex items-center justify-between">
                    <div className="flex items-center flex-1">
                      <span className="w-20 text-sm font-medium text-gray-700">{demo.ageGroup}</span>
                      <div className="flex-1 mx-4">
                        <div className="h-6 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-blue-500 transition-all"
                            style={{ width: `${demo.percentage}%` }}
                          />
                        </div>
                      </div>
                    </div>
                    <span className="text-sm font-medium text-gray-700">{demo.count}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Geographic Distribution */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Globe className="w-5 h-5 mr-2" />
                Geographic Distribution
              </h3>
              <div className="space-y-4">
                {geographicData.map((geo) => (
                  <div key={geo.country} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <span className="text-2xl mr-3">{geo.flag}</span>
                      <span className="text-sm font-medium text-gray-700">{geo.country}</span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-sm text-gray-600 mr-2">{geo.percentage}%</span>
                      <span className="text-sm font-medium text-gray-700">({geo.count})</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Engagement Tab */}
        {activeTab === 'engagement' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Engagement Metrics */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Activity className="w-5 h-5 mr-2" />
                Engagement Metrics
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <Eye className="w-5 h-5 text-blue-600 mr-3" />
                    <span className="text-sm font-medium text-gray-700">Average View Duration</span>
                  </div>
                  <span className="text-lg font-semibold text-gray-900">2m 34s</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <Share2 className="w-5 h-5 text-green-600 mr-3" />
                    <span className="text-sm font-medium text-gray-700">Share Rate</span>
                  </div>
                  <span className="text-lg font-semibold text-gray-900">8.2%</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <Download className="w-5 h-5 text-purple-600 mr-3" />
                    <span className="text-sm font-medium text-gray-700">Download Rate</span>
                  </div>
                  <span className="text-lg font-semibold text-gray-900">12.5%</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <Clock className="w-5 h-5 text-orange-600 mr-3" />
                    <span className="text-sm font-medium text-gray-700">Completion Rate</span>
                  </div>
                  <span className="text-lg font-semibold text-gray-900">67.8%</span>
                </div>
              </div>
            </div>

            {/* Daily Activity */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <BarChart3 className="w-5 h-5 mr-2" />
                Daily Activity Breakdown
              </h3>
              <div className="space-y-3">
                {engagementTrends.slice(0, 5).map((day, index) => (
                  <div key={index} className="border-b border-gray-100 pb-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">{day.day}</span>
                      <span className="text-xs text-gray-500">{day.views} total interactions</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div className="flex items-center">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mr-1" />
                        <span className="text-gray-600">Views: {day.views}</span>
                      </div>
                      <div className="flex items-center">
                        <div className="w-2 h-2 bg-green-500 rounded-full mr-1" />
                        <span className="text-gray-600">Downloads: {day.downloads}</span>
                      </div>
                      <div className="flex items-center">
                        <div className="w-2 h-2 bg-purple-500 rounded-full mr-1" />
                        <span className="text-gray-600">Shares: {day.shares}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserAnalytics;