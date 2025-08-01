import React from 'react';
import { MoreVertical, Mail, Calendar, Activity } from 'lucide-react';

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

interface UserListItemProps {
  user: User;
}

export const UserListItem: React.FC<UserListItemProps> = ({ user }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-gray-100 text-gray-800';
      case 'suspended':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getSubscriptionBadge = (subscription: string) => {
    switch (subscription) {
      case 'premium':
        return 'bg-purple-100 text-purple-800';
      case 'basic':
        return 'bg-blue-100 text-blue-800';
      case 'free':
        return 'bg-gray-100 text-gray-800';
      case 'enterprise':
        return 'bg-indigo-100 text-indigo-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-4 hover:bg-gray-50 transition-colors">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4 flex-1">
          <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold">
            {user.name ? user.name[0].toUpperCase() : user.email[0].toUpperCase()}
          </div>

          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className="font-medium text-gray-900">{user.name || 'Unnamed User'}</h3>
              <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(user.status)}`}>
                {user.status}
              </span>
              <span className={`px-2 py-1 text-xs rounded-full ${getSubscriptionBadge(user.subscription)}`}>
                {user.subscription}
              </span>
            </div>
            <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
              <span className="flex items-center gap-1">
                <Mail className="w-4 h-4" />
                {user.email}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                Joined {new Date(user.joinedDate).toLocaleDateString()}
              </span>
              <span className="flex items-center gap-1">
                <Activity className="w-4 h-4" />
                {user.tipsViewed} tips viewed
              </span>
            </div>
          </div>
        </div>

        <button className="p-2 hover:bg-gray-200 rounded-lg transition-colors">
          <MoreVertical className="w-5 h-5 text-gray-600" />
        </button>
      </div>
    </div>
  );
};