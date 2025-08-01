import { AlertCircle, CheckCircle, Loader } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button, Card } from '../../components/ui';
import { useAuth } from '../../contexts/AuthContext';

const AuthCallbackPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, isAuthenticated, isLoading } = useAuth();
  
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const handleAuthCallback = async () => {
      const error = searchParams.get('error');
      const errorDescription = searchParams.get('error_description');
      const accessToken = searchParams.get('access_token');
      const refreshToken = searchParams.get('refresh_token');
      const type = searchParams.get('type');

      // Handle errors from OAuth providers or Supabase
      if (error) {
        setStatus('error');
        if (error === 'access_denied') {
          setMessage('Authentication was cancelled. You can try signing in again.');
        } else if (error === 'server_error') {
          setMessage('Server error occurred during authentication. Please try again.');
        } else {
          setMessage(errorDescription || 'Authentication failed. Please try again.');
        }
        return;
      }

      // Handle different callback types
      if (type === 'signup') {
        setStatus('success');
        setMessage('Account created successfully! Welcome to BDBT.');
      } else if (type === 'recovery') {
        setStatus('success');
        setMessage('Password reset successful! You can now access your account.');
      } else if (type === 'invite') {
        setStatus('success');
        setMessage('Invitation accepted! Welcome to the team.');
      } else if (type === 'email_change') {
        setStatus('success');
        setMessage('Email address updated successfully!');
      } else if (accessToken && refreshToken) {
        // OAuth success
        setStatus('success');
        setMessage('Successfully signed in! Redirecting...');
      } else {
        // Generic success
        setStatus('success');
        setMessage('Authentication successful! Redirecting...');
      }

      // Redirect after showing success message
      setTimeout(() => {
        const redirectTo = sessionStorage.getItem('redirectAfterAuth') || '/admin/dashboard';
        sessionStorage.removeItem('redirectAfterAuth');
        navigate(redirectTo, { replace: true });
      }, 2000);
    };

    // Only process callback if not already authenticated
    if (!isLoading && !isAuthenticated) {
      handleAuthCallback();
    } else if (!isLoading && isAuthenticated) {
      // Already authenticated, redirect immediately
      setStatus('success');
      setMessage('Already signed in! Redirecting...');
      setTimeout(() => {
        const redirectTo = sessionStorage.getItem('redirectAfterAuth') || '/admin/dashboard';
        sessionStorage.removeItem('redirectAfterAuth');
        navigate(redirectTo, { replace: true });
      }, 1000);
    }
  }, [searchParams, navigate, isAuthenticated, isLoading]);

  const handleRetry = () => {
    navigate('/auth/login');
  };

  const handleGoHome = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="w-full" variant="solid" padding="lg">
          <div className="text-center">
            {status === 'loading' && (
              <>
                <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Loader className="w-8 h-8 text-blue-600 animate-spin" />
                </div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Processing...</h1>
                <p className="text-gray-600 mb-6">
                  Please wait while we complete your authentication.
                </p>
              </>
            )}

            {status === 'success' && (
              <>
                <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Success!</h1>
                <p className="text-gray-600 mb-6">{message}</p>
                
                {user && (
                  <div className="bg-green-50 rounded-lg p-4 mb-6">
                    <p className="text-sm text-green-600">
                      Welcome back, {user.user_metadata?.full_name || user.email}!
                    </p>
                  </div>
                )}

                <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                  <Loader className="w-4 h-4 animate-spin" />
                  Redirecting to dashboard...
                </div>
              </>
            )}

            {status === 'error' && (
              <>
                <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <AlertCircle className="w-8 h-8 text-red-600" />
                </div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Authentication Failed</h1>
                <p className="text-gray-600 mb-6">{message}</p>
                
                <div className="space-y-3">
                  <Button variant="primary" fullWidth onClick={handleRetry}>
                    Try Again
                  </Button>
                  <Button variant="outline" fullWidth onClick={handleGoHome}>
                    Go to Homepage
                  </Button>
                </div>

                <div className="mt-6 pt-4 border-t border-gray-200">
                  <p className="text-xs text-gray-500">
                    If you continue to experience issues, please contact support.
                  </p>
                </div>
              </>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default AuthCallbackPage;