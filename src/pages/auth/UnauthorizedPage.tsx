import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Shield, ArrowLeft, Home, User } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Button, Card } from '../../components/ui';

interface LocationState {
  requiredRole?: string;
  from?: { pathname: string };
}

const UnauthorizedPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  const state = location.state as LocationState;
  const requiredRole = state?.requiredRole;
  const from = state?.from?.pathname;

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth/login');
  };

  const handleGoBack = () => {
    if (from) {
      navigate(-1);
    } else {
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="w-full" variant="solid" padding="lg">
          <div className="text-center">
            {/* Icon */}
            <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-red-600" />
            </div>

            {/* Title and message */}
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
            <p className="text-gray-600 mb-6">
              {requiredRole 
                ? `You need ${requiredRole} privileges to access this page.`
                : "You don't have permission to access this page."
              }
            </p>

            {/* User info */}
            {user && (
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-gray-600" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-medium text-gray-900">
                      {user.user_metadata?.full_name || 'User'}
                    </p>
                    <p className="text-xs text-gray-500">{user.email}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Action buttons */}
            <div className="space-y-3">
              <Button
                variant="primary"
                fullWidth
                onClick={handleGoBack}
                leftIcon={<ArrowLeft className="w-4 h-4" />}
              >
                Go Back
              </Button>

              <Link to="/">
                <Button
                  variant="outline"
                  fullWidth
                  leftIcon={<Home className="w-4 h-4" />}
                >
                  Go to Homepage
                </Button>
              </Link>

              {user && (
                <Button
                  variant="ghost"
                  fullWidth
                  onClick={handleSignOut}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  Sign Out
                </Button>
              )}
            </div>

            {/* Help text */}
            <div className="mt-6 pt-4 border-t border-gray-200">
              <p className="text-xs text-gray-500">
                If you believe this is an error, please contact your administrator or support team.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default UnauthorizedPage;