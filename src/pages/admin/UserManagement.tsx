import { Download, Eye, Search, UserCheck, UserX } from 'lucide-react';
import React, { useEffect, useMemo, useState } from 'react';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Modal } from '../../components/ui/Modal';
import { showToast } from '../../components/ui/Toast';

interface User {
  id: string;
  email: string;
  full_name?: string;
  created_at: string;
  last_login?: string;
  subscription_tier: 'free' | 'basic' | 'premium' | 'enterprise';
  subscription_status: 'active' | 'inactive' | 'trial' | 'suspended';
  usage_stats: {
    tips_viewed: number;
    collections_created: number;
    last_active: string;
    total_sessions: number;
  };
  payment_info?: {
    next_billing_date?: string;
    amount?: number;
    payment_method?: string;
  };
}

interface UserFilters {
  subscription: string;
  status: string;
  sortBy: string;
  dateRange: string;
}

interface UserDetailModalProps {
  user: User | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (userId: string, updates: any) => void;
}

const UserDetailModal: React.FC<UserDetailModalProps> = ({ user, isOpen, onClose, onUpdate }) => {
  if (!user) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="User Details" className="max-w-2xl">
      <div className="space-y-6">
        {/* User Info */}
        <div>
          <h3 className="font-semibold mb-3">Basic Information</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-500">Name</p>
              <p className="font-medium">{user.full_name || 'Not provided'}</p>
            </div>
            <div>
              <p className="text-gray-500">Email</p>
              <p className="font-medium">{user.email}</p>
            </div>
            <div>
              <p className="text-gray-500">Joined</p>
              <p className="font-medium">{new Date(user.created_at).toLocaleDateString()}</p>
            </div>
            <div>
              <p className="text-gray-500">Last Login</p>
              <p className="font-medium">{user.last_login ? new Date(user.last_login).toLocaleDateString() : 'Never'}</p>
            </div>
          </div>
        </div>

        {/* Usage Statistics */}
        <div>
          <h3 className="font-semibold mb-3">Usage Statistics</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="p-3 text-center">
              <p className="text-2xl font-bold">{user.usage_stats.tips_viewed}</p>
              <p className="text-xs text-gray-500">Tips Viewed</p>
            </Card>
            <Card className="p-3 text-center">
              <p className="text-2xl font-bold">{user.usage_stats.collections_created}</p>
              <p className="text-xs text-gray-500">Collections</p>
            </Card>
            <Card className="p-3 text-center">
              <p className="text-2xl font-bold">{user.usage_stats.total_sessions}</p>
              <p className="text-xs text-gray-500">Sessions</p>
            </Card>
            <Card className="p-3 text-center">
              <p className="text-2xl font-bold">{Math.floor((Date.now() - new Date(user.created_at).getTime()) / (1000 * 60 * 60 * 24))}</p>
              <p className="text-xs text-gray-500">Days Active</p>
            </Card>
          </div>
        </div>

        {/* Subscription Info */}
        <div>
          <h3 className="font-semibold mb-3">Subscription Details</h3>
          <div className="bg-gray-50 rounded-lg p-4 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Current Plan</span>
              <span className="font-medium capitalize">{user.subscription_tier}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Status</span>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                user.subscription_status === 'active' ? 'bg-green-100 text-green-800' :
                user.subscription_status === 'trial' ? 'bg-yellow-100 text-yellow-800' :
                user.subscription_status === 'suspended' ? 'bg-red-100 text-red-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {user.subscription_status}
              </span>
            </div>
            {user.payment_info?.next_billing_date && (
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Next Billing</span>
                <span className="font-medium">{new Date(user.payment_info.next_billing_date).toLocaleDateString()}</span>
              </div>
            )}
            {user.payment_info?.amount && (
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Amount</span>
                <span className="font-medium">${user.payment_info.amount}/month</span>
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-4 border-t">
          <Button onClick={() => onUpdate(user.id, { subscription_tier: 'premium' })} variant="outline">
            Upgrade Plan
          </Button>
          <Button onClick={() => onUpdate(user.id, { subscription_status: 'suspended' })} variant="outline" className="text-red-600 hover:bg-red-50">
            Suspend Account
          </Button>
          <Button onClick={onClose} className="ml-auto">
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showUserDetail, setShowUserDetail] = useState(false);
  
  const [filters, setFilters] = useState<UserFilters>({
    subscription: 'all',
    status: 'all',
    sortBy: 'recent',
    dateRange: '30days'
  });

  // Mock data - replace with actual API calls
  useEffect(() => {
    loadUsers();
  }, [filters]);

  const loadUsers = async () => {
    setLoading(true);
    try {
      // Mock data - replace with actual API call
      const mockUsers: User[] = Array.from({ length: 20 }, (_, i) => ({
        id: `user-${i}`,
        email: `user${i}@example.com`,
        full_name: `User ${i}`,
        created_at: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString(),
        last_login: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
        subscription_tier: ['free', 'basic', 'premium', 'enterprise'][Math.floor(Math.random() * 4)] as any,
        subscription_status: ['active', 'inactive', 'trial', 'suspended'][Math.floor(Math.random() * 4)] as any,
        usage_stats: {
          tips_viewed: Math.floor(Math.random() * 500),
          collections_created: Math.floor(Math.random() * 20),
          last_active: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000).toISOString(),
          total_sessions: Math.floor(Math.random() * 100)
        },
        payment_info: Math.random() > 0.5 ? {
          next_billing_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          amount: [0, 9.99, 19.99, 49.99][Math.floor(Math.random() * 4)],
          payment_method: 'card'
        } : undefined
      }));
      
      setUsers(mockUsers);
    } catch (error) {
      showToast('Failed to load users', 'error');
    } finally {
      setLoading(false);
    }
  };

  const filteredAndSortedUsers = useMemo(() => {
    let filtered = users;

    // Apply filters
    if (filters.subscription !== 'all') {
      filtered = filtered.filter(u => u.subscription_tier === filters.subscription);
    }
    if (filters.status !== 'all') {
      filtered = filtered.filter(u => u.subscription_status === filters.status);
    }

    // Apply search
    if (searchTerm) {
      filtered = filtered.filter(u => 
        u.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply sorting
    return filtered.sort((a, b) => {
      switch (filters.sortBy) {
        case 'recent':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case 'oldest':
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        case 'mostActive':
          return b.usage_stats.total_sessions - a.usage_stats.total_sessions;
        case 'leastActive':
          return a.usage_stats.total_sessions - b.usage_stats.total_sessions;
        default:
          return 0;
      }
    });
  }, [users, filters, searchTerm]);

  const stats = useMemo(() => {
    return {
      active: users.filter(u => u.subscription_status === 'active').length,
      premium: users.filter(u => ['premium', 'enterprise'].includes(u.subscription_tier)).length,
      trial: users.filter(u => u.subscription_status === 'trial').length,
      inactive: users.filter(u => u.subscription_status === 'inactive').length
    };
  }, [users]);

  const handleExportUsers = async (format: 'csv' | 'json') => {
    try {
      const data = filteredAndSortedUsers.map(u => ({
        email: u.email,
        name: u.full_name,
        subscription: u.subscription_tier,
        status: u.subscription_status,
        joined: new Date(u.created_at).toLocaleDateString(),
        tips_viewed: u.usage_stats.tips_viewed,
        collections: u.usage_stats.collections_created
      }));

      if (format === 'csv') {
        const csv = [
          Object.keys(data[0]).join(','),
          ...data.map(row => Object.values(row).join(','))
        ].join('\n');
        
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `users-export-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
      } else {
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `users-export-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
      }
      
      showToast('Users exported successfully', 'success');
    } catch (error) {
      showToast('Failed to export users', 'error');
    }
  };

  const handleUpdateUser = async (userId: string, updates: any) => {
    try {
      // API call would go here
      showToast('User updated successfully', 'success');
      await loadUsers();
      setShowUserDetail(false);
    } catch (error) {
      showToast('Failed to update user', 'error');
    }
  };

  return (
    <div>
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-600 mt-2">Manage users, subscriptions, and permissions</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => handleExportUsers('csv')} variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
          <Button onClick={() => handleExportUsers('json')} variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export JSON
          </Button>
        </div>
      </div>

      {/* Filters Section */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[300px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search users by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <select
            value={filters.subscription}
            onChange={(e) => setFilters({ ...filters, subscription: e.target.value })}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Subscriptions</option>
            <option value="free">Free</option>
            <option value="basic">Basic</option>
            <option value="premium">Premium</option>
            <option value="enterprise">Enterprise</option>
          </select>

          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="trial">Trial</option>
            <option value="suspended">Suspended</option>
          </select>

          <select
            value={filters.sortBy}
            onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="recent">Most Recent</option>
            <option value="oldest">Oldest First</option>
            <option value="mostActive">Most Active</option>
            <option value="leastActive">Least Active</option>
          </select>

          <select
            value={filters.dateRange}
            onChange={(e) => setFilters({ ...filters, dateRange: e.target.value })}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="7days">Last 7 days</option>
            <option value="30days">Last 30 days</option>
            <option value="90days">Last 90 days</option>
            <option value="all">All time</option>
          </select>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active Users</p>
              <p className="text-2xl font-bold">{stats.active}</p>
            </div>
            <UserCheck className="w-8 h-8 text-green-500" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Premium Users</p>
              <p className="text-2xl font-bold">{stats.premium}</p>
            </div>
            <UserCheck className="w-8 h-8 text-blue-500" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-yellow-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Trial Users</p>
              <p className="text-2xl font-bold">{stats.trial}</p>
            </div>
            <UserCheck className="w-8 h-8 text-yellow-500" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-red-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Inactive</p>
              <p className="text-2xl font-bold">{stats.inactive}</p>
            </div>
            <UserX className="w-8 h-8 text-red-500" />
          </div>
        </div>
      </div>

      {/* Users List */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading users...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Subscription
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Usage
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Active
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredAndSortedUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-gray-900">{user.full_name || 'Unknown'}</p>
                        <p className="text-sm text-gray-500">{user.email}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm font-medium capitalize">{user.subscription_tier}</p>
                        <span className={`inline-flex px-2 py-1 text-xs rounded-full ${
                          user.subscription_status === 'active' ? 'bg-green-100 text-green-800' :
                          user.subscription_status === 'trial' ? 'bg-yellow-100 text-yellow-800' :
                          user.subscription_status === 'suspended' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {user.subscription_status}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <div className="flex items-center gap-4">
                        <div>
                          <p className="font-medium">{user.usage_stats.tips_viewed}</p>
                          <p className="text-xs text-gray-500">Tips</p>
                        </div>
                        <div>
                          <p className="font-medium">{user.usage_stats.collections_created}</p>
                          <p className="text-xs text-gray-500">Collections</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(user.usage_stats.last_active).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => {
                          setSelectedUser(user);
                          setShowUserDetail(true);
                        }}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* User Detail Modal */}
      <UserDetailModal
        user={selectedUser}
        isOpen={showUserDetail}
        onClose={() => setShowUserDetail(false)}
        onUpdate={handleUpdateUser}
      />

    </div>
  );
};