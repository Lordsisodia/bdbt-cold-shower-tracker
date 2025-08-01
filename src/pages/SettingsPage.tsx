import {
    Bell, Check, Database, Download, Eye,
    EyeOff, Loader, Palette, RefreshCw, Save, Shield, Smartphone, Upload, User, Zap
} from 'lucide-react';
import React, { useState } from 'react';

interface SettingSection {
  id: string;
  title: string;
  description: string;
  icon: React.FC<any>;
}

const SettingsPage: React.FC = () => {
  const [activeSection, setActiveSection] = useState('profile');
  const [isLoading, setIsLoading] = useState(false);
  const [savedMessage, setSavedMessage] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);

  // Form states
  const [profileData, setProfileData] = useState({
    name: 'Admin User',
    email: 'admin@bdbt.com',
    username: 'bdbt_admin',
    bio: 'Content creator and admin at BDBT platform',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop'
  });

  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    weeklyDigest: true,
    contentAlerts: true,
    performanceReports: false,
    systemUpdates: true
  });

  const [apiSettings, setApiSettings] = useState({
    groqApiKey: '', // SECURITY: Removed hardcoded API key
    openaiApiKey: '',
    canvaApiKey: '',
    webhookUrl: ''
  });

  const sections: SettingSection[] = [
    {
      id: 'profile',
      title: 'Profile',
      description: 'Manage your personal information',
      icon: User
    },
    {
      id: 'notifications',
      title: 'Notifications',
      description: 'Configure notification preferences',
      icon: Bell
    },
    {
      id: 'security',
      title: 'Security',
      description: 'Password and authentication settings',
      icon: Shield
    },
    {
      id: 'appearance',
      title: 'Appearance',
      description: 'Customize the look and feel',
      icon: Palette
    },
    {
      id: 'integrations',
      title: 'API & Integrations',
      description: 'Manage external service connections',
      icon: Zap
    },
    {
      id: 'data',
      title: 'Data & Storage',
      description: 'Manage your data and exports',
      icon: Database
    }
  ];

  const handleSave = async () => {
    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    setSavedMessage('Settings saved successfully!');
    setIsLoading(false);
    setTimeout(() => setSavedMessage(''), 3000);
  };

  const renderProfileSection = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Personal Information</h3>
        
        <div className="space-y-6">
          {/* Avatar Upload */}
          <div className="flex items-center gap-6">
            <img 
              src={profileData.avatar}
              alt="Profile"
              className="w-24 h-24 rounded-full object-cover"
            />
            <div>
              <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                <Upload className="w-4 h-4" />
                Upload New Photo
              </button>
              <p className="text-sm text-gray-500 mt-2">JPG, PNG or GIF. Max 2MB.</p>
            </div>
          </div>

          {/* Form Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
              <input
                type="text"
                value={profileData.name}
                onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Username</label>
              <input
                type="text"
                value={profileData.username}
                onChange={(e) => setProfileData({ ...profileData, username: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
              <input
                type="email"
                value={profileData.email}
                onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
              <textarea
                rows={4}
                value={profileData.bio}
                onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderNotificationSection = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Notification Preferences</h3>
        
        <div className="space-y-4">
          {Object.entries(notificationSettings).map(([key, value]) => (
            <div key={key} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
              <div>
                <div className="font-medium text-gray-900">
                  {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                </div>
                <div className="text-sm text-gray-500">
                  {key === 'emailNotifications' && 'Receive updates via email'}
                  {key === 'pushNotifications' && 'Browser push notifications'}
                  {key === 'weeklyDigest' && 'Weekly summary of your content performance'}
                  {key === 'contentAlerts' && 'Alerts for trending content'}
                  {key === 'performanceReports' && 'Detailed analytics reports'}
                  {key === 'systemUpdates' && 'Platform updates and maintenance notices'}
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={value}
                  onChange={(e) => setNotificationSettings({ ...notificationSettings, [key]: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Email Frequency</h3>
        
        <div className="space-y-3">
          <label className="flex items-center gap-3">
            <input type="radio" name="frequency" className="text-blue-600" />
            <span className="text-gray-700">Real-time (as they happen)</span>
          </label>
          <label className="flex items-center gap-3">
            <input type="radio" name="frequency" className="text-blue-600" defaultChecked />
            <span className="text-gray-700">Daily digest</span>
          </label>
          <label className="flex items-center gap-3">
            <input type="radio" name="frequency" className="text-blue-600" />
            <span className="text-gray-700">Weekly summary</span>
          </label>
          <label className="flex items-center gap-3">
            <input type="radio" name="frequency" className="text-blue-600" />
            <span className="text-gray-700">Never</span>
          </label>
        </div>
      </div>
    </div>
  );

  const renderSecuritySection = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Change Password</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
            <input
              type="password"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
            <input
              type="password"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Confirm New Password</label>
            <input
              type="password"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Two-Factor Authentication</h3>
        
        <div className="flex items-start gap-4">
          <div className="p-3 bg-green-100 rounded-lg">
            <Shield className="w-6 h-6 text-green-600" />
          </div>
          <div className="flex-1">
            <p className="text-gray-700 mb-4">Add an extra layer of security to your account by enabling two-factor authentication.</p>
            <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
              Enable 2FA
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Active Sessions</h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-4">
              <Smartphone className="w-5 h-5 text-gray-600" />
              <div>
                <div className="font-medium text-gray-900">Chrome on MacOS</div>
                <div className="text-sm text-gray-500">Current session • San Francisco, CA</div>
              </div>
            </div>
            <span className="text-sm text-green-600">Active now</span>
          </div>
          
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-4">
              <Smartphone className="w-5 h-5 text-gray-600" />
              <div>
                <div className="font-medium text-gray-900">Safari on iPhone</div>
                <div className="text-sm text-gray-500">Last active 2 hours ago • New York, NY</div>
              </div>
            </div>
            <button className="text-sm text-red-600 hover:text-red-700">Revoke</button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderAppearanceSection = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Theme Settings</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Color Theme</label>
            <div className="grid grid-cols-3 gap-4">
              <label className="relative cursor-pointer">
                <input type="radio" name="theme" className="sr-only peer" defaultChecked />
                <div className="p-4 border-2 border-gray-200 rounded-lg peer-checked:border-blue-600 peer-checked:bg-blue-50">
                  <div className="w-full h-20 bg-gradient-to-br from-white to-gray-100 rounded mb-2"></div>
                  <span className="text-sm font-medium">Light</span>
                </div>
              </label>
              
              <label className="relative cursor-pointer">
                <input type="radio" name="theme" className="sr-only peer" />
                <div className="p-4 border-2 border-gray-200 rounded-lg peer-checked:border-blue-600 peer-checked:bg-blue-50">
                  <div className="w-full h-20 bg-gradient-to-br from-gray-800 to-gray-900 rounded mb-2"></div>
                  <span className="text-sm font-medium">Dark</span>
                </div>
              </label>
              
              <label className="relative cursor-pointer">
                <input type="radio" name="theme" className="sr-only peer" />
                <div className="p-4 border-2 border-gray-200 rounded-lg peer-checked:border-blue-600 peer-checked:bg-blue-50">
                  <div className="w-full h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded mb-2"></div>
                  <span className="text-sm font-medium">Auto</span>
                </div>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Accent Color</label>
            <div className="flex gap-3">
              {['bg-blue-600', 'bg-green-600', 'bg-purple-600', 'bg-orange-600', 'bg-pink-600', 'bg-gray-600'].map((color, index) => (
                <button
                  key={index}
                  className={`w-10 h-10 rounded-lg ${color} hover:ring-2 hover:ring-offset-2 hover:ring-gray-400`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Display Preferences</h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium text-gray-900">Compact Mode</div>
              <div className="text-sm text-gray-500">Show more content with reduced spacing</div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium text-gray-900">Show Animations</div>
              <div className="text-sm text-gray-500">Enable interface animations and transitions</div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>
      </div>
    </div>
  );

  const renderIntegrationsSection = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">API Keys</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Groq API Key</label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <input
                  type={showApiKey ? "text" : "password"}
                  value={apiSettings.groqApiKey}
                  onChange={(e) => setApiSettings({ ...apiSettings, groqApiKey: e.target.value })}
                  className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={() => setShowApiKey(!showApiKey)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                Test
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-1">Used for AI content generation</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">OpenAI API Key</label>
            <div className="flex gap-2">
              <input
                type="password"
                placeholder="sk-..."
                value={apiSettings.openaiApiKey}
                onChange={(e) => setApiSettings({ ...apiSettings, openaiApiKey: e.target.value })}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors">
                Test
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-1">Optional: For advanced AI features</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Canva API Key</label>
            <div className="flex gap-2">
              <input
                type="password"
                placeholder="Enter Canva API key"
                value={apiSettings.canvaApiKey}
                onChange={(e) => setApiSettings({ ...apiSettings, canvaApiKey: e.target.value })}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors">
                Connect
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-1">For design template integration</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Webhook Settings</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Webhook URL</label>
            <input
              type="url"
              placeholder="https://your-domain.com/webhook"
              value={apiSettings.webhookUrl}
              onChange={(e) => setApiSettings({ ...apiSettings, webhookUrl: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">Receive real-time updates for content events</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Webhook Events</label>
            <div className="space-y-2">
              <label className="flex items-center gap-3">
                <input type="checkbox" className="text-blue-600" defaultChecked />
                <span className="text-gray-700">Content Published</span>
              </label>
              <label className="flex items-center gap-3">
                <input type="checkbox" className="text-blue-600" defaultChecked />
                <span className="text-gray-700">Content Updated</span>
              </label>
              <label className="flex items-center gap-3">
                <input type="checkbox" className="text-blue-600" />
                <span className="text-gray-700">Content Deleted</span>
              </label>
              <label className="flex items-center gap-3">
                <input type="checkbox" className="text-blue-600" defaultChecked />
                <span className="text-gray-700">Performance Milestones</span>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderDataSection = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Storage Usage</h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-gray-700">Total Storage Used</span>
            <span className="font-medium text-gray-900">2.4 GB / 10 GB</span>
          </div>
          
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full" style={{ width: '24%' }}></div>
          </div>
          
          <div className="grid grid-cols-3 gap-4 mt-6">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-900">1,234</div>
              <div className="text-sm text-gray-600">Total Tips</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-900">856</div>
              <div className="text-sm text-gray-600">PDFs Generated</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-900">342</div>
              <div className="text-sm text-gray-600">Media Files</div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Data Management</h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <div className="font-medium text-gray-900">Export All Data</div>
              <div className="text-sm text-gray-500">Download all your content and settings</div>
            </div>
            <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              <Download className="w-4 h-4" />
              Export
            </button>
          </div>
          
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <div className="font-medium text-gray-900">Import Data</div>
              <div className="text-sm text-gray-500">Bulk import tips from CSV or JSON</div>
            </div>
            <button className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors">
              <Upload className="w-4 h-4" />
              Import
            </button>
          </div>
          
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <div className="font-medium text-gray-900">Clear Cache</div>
              <div className="text-sm text-gray-500">Free up space by clearing temporary files</div>
            </div>
            <button className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors">
              <RefreshCw className="w-4 h-4" />
              Clear
            </button>
          </div>
        </div>
      </div>

      <div className="bg-red-50 border border-red-200 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-red-900 mb-4">Danger Zone</h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium text-gray-900">Delete All Content</div>
              <div className="text-sm text-gray-600">Permanently remove all tips and generated content</div>
            </div>
            <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
              Delete All
            </button>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium text-gray-900">Delete Account</div>
              <div className="text-sm text-gray-600">Permanently delete your account and all data</div>
            </div>
            <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
              Delete Account
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeSection) {
      case 'profile':
        return renderProfileSection();
      case 'notifications':
        return renderNotificationSection();
      case 'security':
        return renderSecuritySection();
      case 'appearance':
        return renderAppearanceSection();
      case 'integrations':
        return renderIntegrationsSection();
      case 'data':
        return renderDataSection();
      default:
        return renderProfileSection();
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-1">Manage your account settings and preferences</p>
      </div>

      <div className="flex gap-8">
        {/* Sidebar */}
        <div className="w-64 flex-shrink-0">
          <nav className="space-y-1">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`w-full flex items-start gap-3 px-4 py-3 rounded-lg transition-all ${
                  activeSection === section.id
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <section.icon className="w-5 h-5 mt-0.5" />
                <div className="text-left">
                  <div className="font-medium">{section.title}</div>
                  <div className="text-xs opacity-75">{section.description}</div>
                </div>
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1">
          {renderContent()}
          
          {/* Save Button */}
          <div className="mt-8 flex items-center justify-between">
            <div>
              {savedMessage && (
                <div className="flex items-center gap-2 text-green-600">
                  <Check className="w-5 h-5" />
                  <span>{savedMessage}</span>
                </div>
              )}
            </div>
            
            <button
              onClick={handleSave}
              disabled={isLoading}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
                isLoading
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {isLoading ? (
                <>
                  <Loader className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;