import React, { useState } from 'react';
import { User, Settings, LogOut, Shield, Bell, Download, FileText, Database } from 'lucide-react';
import { Button, Card } from '../ui';
import { useAuth } from '../../hooks/useAuth';
import { useSupabaseData } from '../../hooks/useSupabaseData';
import { exportData } from '../../utils/dataExport';

interface UserProfileProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UserProfile: React.FC<UserProfileProps> = ({ isOpen, onClose }) => {
  const { user, signOut, isLoading } = useAuth();
  const { profile, updateProfile, trackedDays } = useSupabaseData(user);
  const [activeTab, setActiveTab] = useState<'profile' | 'settings' | 'privacy'>('profile');
  const [isExporting, setIsExporting] = useState(false);

  if (!isOpen || !user) return null;

  const handleSignOut = async () => {
    await signOut();
    onClose();
  };

  const handleExportData = async (format: 'csv' | 'json' | 'pdf') => {
    setIsExporting(true);
    try {
      await exportData(trackedDays, format);
    } catch (error) {
      console.error('Export failed:', error);
      alert('Export failed. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-lg max-h-[90vh] overflow-y-auto" variant="solid" padding="lg">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Profile</h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            ×
          </Button>
        </div>

        {/* User Info */}
        <div className="flex items-center gap-4 mb-6 p-4 bg-blue-50 rounded-lg">
          <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
            <User size={24} className="text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">
              {profile?.full_name || user.email?.split('@')[0]}
            </h3>
            <p className="text-sm text-gray-600">{user.email}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 mb-6">
          <button
            onClick={() => setActiveTab('profile')}
            className={`px-4 py-2 text-sm font-medium border-b-2 ${
              activeTab === 'profile'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Profile
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`px-4 py-2 text-sm font-medium border-b-2 ${
              activeTab === 'settings'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Settings
          </button>
          <button
            onClick={() => setActiveTab('privacy')}
            className={`px-4 py-2 text-sm font-medium border-b-2 ${
              activeTab === 'privacy'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Privacy
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'profile' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Name
              </label>
              <input
                type="text"
                value={profile?.full_name || ''}
                onChange={(e) => updateProfile({ full_name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter your full name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Challenge Start Date
              </label>
              <input
                type="date"
                value={profile?.challenge_start_date || ''}
                onChange={(e) => updateProfile({ challenge_start_date: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Challenge Duration (days)
              </label>
              <select
                value={profile?.challenge_duration || 30}
                onChange={(e) => updateProfile({ challenge_duration: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value={7}>7 days</option>
                <option value={14}>14 days</option>
                <option value={21}>21 days</option>
                <option value={30}>30 days</option>
                <option value={60}>60 days</option>
                <option value={90}>90 days</option>
              </select>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center gap-2">
                <Bell size={18} />
                Notifications
              </h3>
              <div className="space-y-3">
                <label className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">Daily Reminders</span>
                  <input
                    type="checkbox"
                    checked={profile?.notification_preferences?.daily_reminder || false}
                    onChange={(e) => updateProfile({
                      notification_preferences: {
                        daily_reminder: e.target.checked,
                        achievement_alerts: profile?.notification_preferences?.achievement_alerts || false,
                        streak_warnings: profile?.notification_preferences?.streak_warnings || false,
                        time: profile?.notification_preferences?.time || '08:00'
                      }
                    })}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </label>
                
                <label className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">Achievement Alerts</span>
                  <input
                    type="checkbox"
                    checked={profile?.notification_preferences?.achievement_alerts || false}
                    onChange={(e) => updateProfile({
                      notification_preferences: {
                        daily_reminder: profile?.notification_preferences?.daily_reminder || false,
                        achievement_alerts: e.target.checked,
                        streak_warnings: profile?.notification_preferences?.streak_warnings || false,
                        time: profile?.notification_preferences?.time || '08:00'
                      }
                    })}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </label>

                <label className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">Streak Warnings</span>
                  <input
                    type="checkbox"
                    checked={profile?.notification_preferences?.streak_warnings || false}
                    onChange={(e) => updateProfile({
                      notification_preferences: {
                        daily_reminder: profile?.notification_preferences?.daily_reminder || false,
                        achievement_alerts: profile?.notification_preferences?.achievement_alerts || false,
                        streak_warnings: e.target.checked,
                        time: profile?.notification_preferences?.time || '08:00'
                      }
                    })}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </label>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center gap-2">
                <Settings size={18} />
                Preferences
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Units
                  </label>
                  <select
                    value={profile?.settings?.units || 'metric'}
                    onChange={(e) => updateProfile({
                      settings: {
                        theme: profile?.settings?.theme || 'light',
                        units: e.target.value as 'metric' | 'imperial',
                        privacy_level: profile?.settings?.privacy_level || 'private'
                      }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="metric">Metric (°C, min)</option>
                    <option value="imperial">Imperial (°F, min)</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'privacy' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center gap-2">
                <Shield size={18} />
                Privacy Settings
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Profile Visibility
                  </label>
                  <select
                    value={profile?.settings?.privacy_level || 'private'}
                    onChange={(e) => updateProfile({
                      settings: {
                        theme: profile?.settings?.theme || 'light',
                        units: profile?.settings?.units || 'metric',
                        privacy_level: e.target.value as 'public' | 'friends' | 'private'
                      }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="private">Private</option>
                    <option value="friends">Friends Only</option>
                    <option value="public">Public</option>
                  </select>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center gap-2">
                <Download size={18} />
                Data Export
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Download your cold shower data for backup, analysis, or sharing.
              </p>
              <div className="space-y-2">
                <Button
                  onClick={() => handleExportData('csv')}
                  variant="secondary"
                  fullWidth
                  leftIcon={<FileText size={16} />}
                  isLoading={isExporting}
                  disabled={isExporting}
                >
                  Export as CSV
                </Button>
                <Button
                  onClick={() => handleExportData('json')}
                  variant="secondary"
                  fullWidth
                  leftIcon={<Database size={16} />}
                  isLoading={isExporting}
                  disabled={isExporting}
                >
                  Export as JSON
                </Button>
                <Button
                  onClick={() => handleExportData('pdf')}
                  variant="secondary"
                  fullWidth
                  leftIcon={<FileText size={16} />}
                  isLoading={isExporting}
                  disabled={isExporting}
                >
                  Export Report (PDF)
                </Button>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Includes all your tracked days, streaks, and statistics
              </p>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <Button
            onClick={handleSignOut}
            variant="outline"
            fullWidth
            leftIcon={<LogOut size={16} />}
            isLoading={isLoading}
            className="text-red-600 border-red-300 hover:bg-red-50"
          >
            Sign Out
          </Button>
        </div>
      </Card>
    </div>
  );
};