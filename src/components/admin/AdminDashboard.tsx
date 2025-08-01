import React from 'react';
import { 
  Users, FileText, TrendingUp, Activity, 
  DollarSign, UserCheck, Clock, BarChart3 
} from 'lucide-react';

const StatCard = ({ 
  title, 
  value, 
  change, 
  icon: Icon, 
  color 
}: { 
  title: string; 
  value: string; 
  change: string; 
  icon: any; 
  color: string; 
}) => (
  <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-600">{title}</p>
        <p className="text-2xl font-bold text-gray-900 mt-2">{value}</p>
        <p className={`text-sm mt-2 ${change.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
          {change} from last month
        </p>
      </div>
      <div className={`p-3 rounded-lg ${color}`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
    </div>
  </div>
);

export const AdminDashboard: React.FC = () => {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600 mt-2">Monitor your platform's performance and user activity</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Users"
          value="2,847"
          change="+12%"
          icon={Users}
          color="bg-blue-500"
        />
        <StatCard
          title="Active Tips"
          value="1,234"
          change="+8%"
          icon={FileText}
          color="bg-green-500"
        />
        <StatCard
          title="Revenue"
          value="$12,847"
          change="+23%"
          icon={DollarSign}
          color="bg-purple-500"
        />
        <StatCard
          title="Engagement Rate"
          value="87%"
          change="+5%"
          icon={Activity}
          color="bg-orange-500"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-500" />
            User Growth
          </h3>
          <div className="h-64 flex items-center justify-center text-gray-400">
            Chart placeholder - Connect to recharts
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-green-500" />
            Tip Performance
          </h3>
          <div className="h-64 flex items-center justify-center text-gray-400">
            Chart placeholder - Connect to recharts
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Clock className="w-5 h-5 text-purple-500" />
          Recent Activity
        </h3>
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center justify-between py-3 border-b last:border-0">
              <div className="flex items-center gap-3">
                <UserCheck className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="font-medium">New user registered</p>
                  <p className="text-sm text-gray-600">user{i}@example.com</p>
                </div>
              </div>
              <span className="text-sm text-gray-500">{i} min ago</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};