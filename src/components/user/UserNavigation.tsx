import { Bookmark, FileText, Home, LogOut, User } from 'lucide-react';
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

export const UserNavigation: React.FC = () => {
  const { user, signOut } = useAuth();

  return (
    <nav className="fixed top-0 left-0 right-0 bg-white shadow-md z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-8">
            <Link to="/user/dashboard" className="flex items-center space-x-2">
              <span className="text-2xl font-bold">BD<span className="text-blue-600">BT</span></span>
            </Link>
            
            <div className="hidden md:flex space-x-6">
              <Link to="/user/dashboard" className="flex items-center space-x-2 text-gray-700 hover:text-blue-600">
                <Home size={18} />
                <span>Dashboard</span>
              </Link>
              <Link to="/tips" className="flex items-center space-x-2 text-gray-700 hover:text-blue-600">
                <FileText size={18} />
                <span>Browse Tips</span>
              </Link>
              <Link to="/user/bookmarks" className="flex items-center space-x-2 text-gray-700 hover:text-blue-600">
                <Bookmark size={18} />
                <span>My Bookmarks</span>
              </Link>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <Link to="/user/profile" className="flex items-center space-x-2 text-gray-700 hover:text-blue-600">
              <User size={18} />
              <span className="hidden md:inline">{user?.email || 'Profile'}</span>
            </Link>
            <button
              onClick={() => signOut()}
              className="flex items-center space-x-2 text-gray-700 hover:text-red-600"
            >
              <LogOut size={18} />
              <span className="hidden md:inline">Logout</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};