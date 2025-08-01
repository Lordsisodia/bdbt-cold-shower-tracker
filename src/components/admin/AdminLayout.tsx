import {
    BarChart3, Calendar, ChevronLeft,
    ChevronRight, FileText, LayoutDashboard, LogOut, Plus, Settings,
    Users
} from 'lucide-react';
import React from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';

const AdminLayout: React.FC = () => {
  const location = useLocation();
  const [collapsed, setCollapsed] = React.useState(false);

  const sidebarItems = [
    {
      label: 'Dashboard',
      href: '/admin/dashboard',
      icon: LayoutDashboard,
      description: 'Overview & Analytics'
    },
    {
      label: 'Create Tip',
      href: '/admin/create',
      icon: Plus,
      description: 'Add New Content'
    },
    {
      label: 'Content Calendar',
      href: '/admin/calendar',
      icon: Calendar,
      description: 'Schedule & Plan'
    },
    {
      label: 'Templates',
      href: '/admin/templates',
      icon: FileText,
      description: 'PDF Templates'
    },
    {
      label: 'Analytics',
      href: '/admin/analytics',
      icon: BarChart3,
      description: 'Performance Metrics'
    },
    {
      label: 'Settings',
      href: '/admin/settings',
      icon: Settings,
      description: 'Configuration'
    }
  ];

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Vertical Sidebar */}
      <div className={`bg-white shadow-xl transition-all duration-300 ease-in-out ${
        collapsed ? 'w-16' : 'w-64'
      } flex flex-col`}>
        
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            {!collapsed && (
              <div className="flex items-center">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">BD</span>
                </div>
                <div className="ml-3">
                  <h1 className="text-lg font-bold text-gray-900">BDBT Admin</h1>
                  <p className="text-xs text-gray-500">SaaS Platform</p>
                </div>
              </div>
            )}
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
            >
              {collapsed ? (
                <ChevronRight className="w-4 h-4 text-gray-500" />
              ) : (
                <ChevronLeft className="w-4 h-4 text-gray-500" />
              )}
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {sidebarItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.href;
            
            return (
              <Link
                key={item.href}
                to={item.href}
                className={`group flex items-center p-3 rounded-xl transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-to-r from-blue-50 to-purple-50 text-blue-700 shadow-sm'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <Icon className={`w-5 h-5 ${
                  collapsed ? 'mx-auto' : 'mr-3'
                } ${isActive ? 'text-blue-600' : 'text-gray-500 group-hover:text-gray-700'}`} />
                
                {!collapsed && (
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm">{item.label}</div>
                    <div className="text-xs text-gray-500 truncate">{item.description}</div>
                  </div>
                )}
                
                {!collapsed && isActive && (
                  <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200">
          <Link
            to="/"
            className={`flex items-center p-3 rounded-xl text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-all duration-200 ${
              collapsed ? 'justify-center' : ''
            }`}
          >
            <LogOut className={`w-5 h-5 ${collapsed ? '' : 'mr-3'}`} />
            {!collapsed && (
              <div>
                <div className="font-medium text-sm">Back to Website</div>
                <div className="text-xs text-gray-500">Public Landing</div>
              </div>
            )}
          </Link>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center text-sm text-gray-500">
                <Link to="/" className="hover:text-blue-600 transition-colors">
                  BDBT
                </Link>
                <span className="mx-2">/</span>
                <span className="text-gray-900 font-medium">Admin Panel</span>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <div className="text-sm font-medium text-gray-900">Admin User</div>
                <div className="text-xs text-gray-500">Content Creator</div>
              </div>
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                <Users className="w-4 h-4 text-white" />
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto bg-gray-50">
          <div className="h-full">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;