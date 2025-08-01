import {
    Activity,
    BarChart3, Calendar, Download, Loader2, Mail, PieChart, TrendingUp, Users
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { emailService, EmailStats } from '../services/emailService';

const EmailStatsPage: React.FC = () => {
  const [stats, setStats] = useState<EmailStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const emailStats = await emailService.getStats();
        setStats(emailStats);
      } catch (error) {
        console.error('Error loading email stats:', error);
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900">Loading email stats...</h2>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Mail className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">No email data available</h2>
          <p className="text-gray-600">Start collecting email subscribers to see stats here.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                <Mail className="w-8 h-8 text-blue-600" />
                Email Marketing Dashboard
              </h1>
              <p className="text-gray-600 mt-1">Track your email subscriptions and engagement</p>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-500">Last updated</div>
              <div className="text-lg font-semibold text-gray-900">
                {new Date().toLocaleDateString()}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Subscribers */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Subscribers</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalSubscribers.toLocaleString()}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
              <span className="text-green-500">+12% this month</span>
            </div>
          </div>

          {/* Weekly Tips Subscribers */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Weekly Tips</p>
                <p className="text-3xl font-bold text-gray-900">{stats.weeklyTipsSubscribers.toLocaleString()}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Mail className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-gray-500">
                {Math.round((stats.weeklyTipsSubscribers / stats.totalSubscribers) * 100)}% of total
              </span>
            </div>
          </div>

          {/* PDF Downloads */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">PDF Downloads</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalSubscribers}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Download className="w-6 h-6 text-purple-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-gray-500">From email capture</span>
            </div>
          </div>

          {/* Conversion Rate */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Conversion Rate</p>
                <p className="text-3xl font-bold text-gray-900">73%</p>
              </div>
              <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
                <Activity className="w-6 h-6 text-amber-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
              <span className="text-green-500">+5% vs last month</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Category Breakdown */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <PieChart className="w-5 h-5" />
                Category Interests
              </h3>
            </div>
            
            <div className="space-y-4">
              {Object.entries(stats.categorySubscribers).map(([category, count]) => {
                const percentage = Math.round((count / stats.totalSubscribers) * 100);
                const colors = {
                  health: 'bg-emerald-500',
                  wealth: 'bg-amber-500',
                  happiness: 'bg-violet-500'
                };
                const bgColor = colors[category as keyof typeof colors] || 'bg-gray-500';
                
                return (
                  <div key={category} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${bgColor}`}></div>
                      <span className="text-sm font-medium text-gray-700 capitalize">{category}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="text-sm text-gray-600">{count} subscribers</div>
                      <div className="text-sm text-gray-500">({percentage}%)</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recent Subscriptions */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Recent Subscriptions
              </h3>
            </div>
            
            <div className="space-y-4">
              {stats.recentSubscriptions.slice(0, 5).map((subscription, index) => (
                <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {subscription.email}
                    </div>
                    <div className="text-xs text-gray-500">
                      {subscription.tipTitle || 'Newsletter signup'}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-gray-500">
                      {new Date(subscription.subscribedAt).toLocaleDateString()}
                    </div>
                    <div className="text-xs text-blue-600 capitalize">
                      {subscription.source.replace('_', ' ')}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {stats.recentSubscriptions.length === 0 && (
              <div className="text-center py-8">
                <Mail className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-500">No subscriptions yet</p>
              </div>
            )}
          </div>
        </div>

        {/* Email Preferences Breakdown */}
        <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Email Preferences
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600 mb-2">
                {stats.weeklyTipsSubscribers}
              </div>
              <div className="text-sm text-gray-600">Weekly Tips</div>
              <div className="text-xs text-gray-500 mt-1">
                {Math.round((stats.weeklyTipsSubscribers / stats.totalSubscribers) * 100)}% of subscribers
              </div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600 mb-2">
                {Object.values(stats.categorySubscribers).reduce((a, b) => a + b, 0)}
              </div>
              <div className="text-sm text-gray-600">Category Updates</div>
              <div className="text-xs text-gray-500 mt-1">
                {Math.round((Object.values(stats.categorySubscribers).reduce((a, b) => a + b, 0) / stats.totalSubscribers) * 100)}% of subscribers
              </div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600 mb-2">
                {Math.round(stats.totalSubscribers * 0.3)}
              </div>
              <div className="text-sm text-gray-600">Product Updates</div>
              <div className="text-xs text-gray-500 mt-1">
                30% of subscribers
              </div>
            </div>
          </div>
        </div>

        {/* Integration Status */}
        <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Email Service Integration</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-gray-900">Mailchimp</span>
                <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">Not Connected</span>
              </div>
              <p className="text-sm text-gray-600">Connect to sync subscribers and send campaigns</p>
            </div>
            
            <div className="p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-gray-900">ConvertKit</span>
                <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">Not Connected</span>
              </div>
              <p className="text-sm text-gray-600">Automate email sequences and funnels</p>
            </div>
            
            <div className="p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-gray-900">SendGrid</span>
                <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">Not Connected</span>
              </div>
              <p className="text-sm text-gray-600">Send transactional and marketing emails</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailStatsPage;