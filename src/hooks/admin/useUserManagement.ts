import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

interface User {
  id: string;
  email: string;
  name?: string;
  subscription: string;
  status: 'active' | 'inactive' | 'suspended';
  lastActive: string;
  joinedDate: string;
  tipsViewed: number;
}

interface Filters {
  subscription: string;
  status: string;
  sortBy: string;
}

export const useUserManagement = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<Filters>({
    subscription: 'all',
    status: 'all',
    sortBy: 'recent'
  });

  useEffect(() => {
    fetchUsers();
  }, [filters]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('user_profiles')
        .select(`
          id,
          email,
          full_name,
          subscription_tier,
          status,
          last_active,
          created_at,
          user_activity (
            tips_viewed:tip_id.count()
          )
        `);

      // Apply filters
      if (filters.subscription !== 'all') {
        query = query.eq('subscription_tier', filters.subscription);
      }
      if (filters.status !== 'all') {
        query = query.eq('status', filters.status);
      }

      // Apply sorting
      switch (filters.sortBy) {
        case 'recent':
          query = query.order('created_at', { ascending: false });
          break;
        case 'oldest':
          query = query.order('created_at', { ascending: true });
          break;
        case 'mostActive':
          query = query.order('last_active', { ascending: false });
          break;
        case 'leastActive':
          query = query.order('last_active', { ascending: true });
          break;
      }

      const { data, error } = await query;

      if (error) throw error;

      // Transform data to match User interface
      const transformedUsers: User[] = (data || []).map(user => ({
        id: user.id,
        email: user.email,
        name: user.full_name,
        subscription: user.subscription_tier || 'free',
        status: user.status || 'active',
        lastActive: user.last_active || user.created_at,
        joinedDate: user.created_at,
        tipsViewed: user.user_activity?.[0]?.tips_viewed || 0
      }));

      setUsers(transformedUsers);
    } catch (error) {
      console.error('Error fetching users:', error);
      // Use mock data if database not set up
      setUsers(generateMockUsers());
    } finally {
      setLoading(false);
    }
  };

  const exportUsers = async (format: 'csv' | 'json') => {
    const dataToExport = users.map(user => ({
      Email: user.email,
      Name: user.name || 'N/A',
      Subscription: user.subscription,
      Status: user.status,
      'Joined Date': new Date(user.joinedDate).toLocaleDateString(),
      'Tips Viewed': user.tipsViewed
    }));

    if (format === 'csv') {
      const headers = Object.keys(dataToExport[0]);
      const csvContent = [
        headers.join(','),
        ...dataToExport.map(row => headers.map(header => row[header]).join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `users_export_${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
    } else {
      const blob = new Blob([JSON.stringify(dataToExport, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `users_export_${new Date().toISOString().split('T')[0]}.json`;
      a.click();
    }
  };

  return {
    users,
    loading,
    filters,
    setFilters,
    exportUsers,
    refetch: fetchUsers
  };
};

// Mock data generator for development
const generateMockUsers = (): User[] => {
  const subscriptions = ['free', 'basic', 'premium', 'enterprise'];
  const statuses: Array<'active' | 'inactive' | 'suspended'> = ['active', 'inactive', 'suspended'];
  
  return Array.from({ length: 20 }, (_, i) => ({
    id: `user-${i + 1}`,
    email: `user${i + 1}@example.com`,
    name: `User ${i + 1}`,
    subscription: subscriptions[Math.floor(Math.random() * subscriptions.length)],
    status: statuses[Math.floor(Math.random() * statuses.length)],
    lastActive: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
    joinedDate: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString(),
    tipsViewed: Math.floor(Math.random() * 100)
  }));
};