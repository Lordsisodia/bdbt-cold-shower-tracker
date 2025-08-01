import { formatDistanceToNow } from 'date-fns';
import { Clock, Download, Eye, Search } from 'lucide-react';
import React, { useEffect, useState } from 'react';

export interface ActivityItem {
  id: string;
  type: 'view' | 'download' | 'search' | 'share';
  tipId?: string;
  tipTitle?: string;
  metadata?: any;
  timestamp: string;
}

interface ActivityFeedProps {
  userId: string;
  limit?: number;
}

export const ActivityFeed: React.FC<ActivityFeedProps> = ({ userId, limit = 20 }) => {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // In real implementation, fetch from Supabase
    setIsLoading(false);
    // Mock data for now
    setActivities([
      {
        id: '1',
        type: 'view',
        tipTitle: 'Morning Productivity Routine',
        timestamp: new Date().toISOString()
      }
    ]);
  }, [userId]);

  const getActivityIcon = (type: ActivityItem['type']) => {
    switch (type) {
      case 'view': return <Eye className="w-4 h-4" />;
      case 'download': return <Download className="w-4 h-4" />;
      case 'search': return <Search className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const getActivityText = (activity: ActivityItem) => {
    switch (activity.type) {
      case 'view': return `Viewed "${activity.tipTitle}"`;
      case 'download': return `Downloaded "${activity.tipTitle}"`;
      case 'search': return `Searched for "${activity.metadata?.query}"`;
      case 'share': return `Shared "${activity.tipTitle}"`;
      default: return 'Unknown activity';
    }
  };

  if (isLoading) {
    return <div className="animate-pulse">Loading activities...</div>;
  }

  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
      {activities.length === 0 ? (
        <p className="text-gray-500 text-sm">No recent activity</p>
      ) : (
        activities.map(activity => (
          <div key={activity.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
            <div className="p-2 bg-white rounded-full">
              {getActivityIcon(activity.type)}
            </div>
            <div className="flex-1">
              <p className="text-sm">{getActivityText(activity)}</p>
              <p className="text-xs text-gray-500">
                {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
              </p>
            </div>
          </div>
        ))
      )}
    </div>
  );
};
