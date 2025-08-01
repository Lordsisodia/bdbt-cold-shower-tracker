import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Mail, ArrowLeft, AlertCircle, CheckCircle, RefreshCw } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Button, Card } from '../../components/ui';

interface LocationState {
  email?: string;
  from?: { pathname: string };
}

const VerifyEmailPage: React.FC = () => {
  const location = useLocation();
  const { resendConfirmation, isLoading, user } = useAuth();
  
  const [isResending, setIsResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState('');
  const [resendError, setResendError] = useState('');

  const state = location.state as LocationState;
  const email = state?.email || user?.email || '';

  const handleResendEmail = async () => {
    if (!email) {
      setResendError('No email address found. Please try signing up again.');
      return;
    }

    setResendError('');
    setResendSuccess('');
    setIsResending(true);

    const { error } = await resendConfirmation(email);

    if (error) {
      if (error.message.includes('Email rate limit')) {
        setResendError('Too many requests. Please wait a few minutes before trying again.');
      } else if (error.message.includes('already confirmed')) {
        setResendError('Email is already verified. You can sign in now.');
      } else {
        setResendError(error.message || 'Failed to resend verification email.');
      }
    } else {
      setResendSuccess('Verification email sent! Check your inbox.');
    }

    setIsResending(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Back to login link */}
        <div className="mb-8">
          <Link
            to="/auth/login"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Sign In
          </Link>
        </div>

        <Card className="w-full" variant="solid" padding="lg">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Mail className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Verify Your Email</h1>
            <p className="text-gray-600">
              We've sent a verification link to{' '}
              {email && (
                <span className="font-medium text-gray-900">{email}</span>
              )}
            </p>
          </div>

          {/* Success message */}
          {resendSuccess && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
              <p className="text-sm text-green-600">{resendSuccess}</p>
            </div>
          )}

          {/* Error message */}
          {resendError && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
              <p className="text-sm text-red-600">{resendError}</p>
            </div>
          )}

          {/* Instructions */}
          <div className="bg-blue-50 rounded-lg p-4 mb-6">
            <h3 className="font-medium text-gray-900 mb-2">What to do next:</h3>
            <ol className="text-sm text-gray-600 space-y-1 list-decimal list-inside">
              <li>Check your email inbox for a message from BDBT</li>
              <li>Click the verification link in the email</li>
              <li>Once verified, you'll be able to sign in</li>
            </ol>
          </div>

          {/* Action buttons */}
          <div className="space-y-4">
            <Button
              variant="primary"
              fullWidth
              onClick={handleResendEmail}
              isLoading={isResending}
              leftIcon={<RefreshCw className="w-4 h-4" />}
              className="py-3"
            >
              Resend Verification Email
            </Button>

            <Link to="/auth/login">
              <Button variant="outline" fullWidth>
                I've Verified My Email
              </Button>
            </Link>
          </div>

          {/* Help text */}
          <div className="mt-6 text-center space-y-2">
            <p className="text-sm text-gray-600">
              Didn't receive the email?
            </p>
            <div className="text-xs text-gray-500 space-y-1">
              <p>• Check your spam or junk folder</p>
              <p>• Make sure you entered the correct email address</p>
              <p>• Wait up to 10 minutes for the email to arrive</p>
            </div>
          </div>

          {/* Sign up with different email */}
          <div className="mt-6 pt-4 border-t border-gray-200 text-center">
            <p className="text-sm text-gray-600">
              Need to use a different email?{' '}
              <Link
                to="/auth/signup"
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                Sign up again
              </Link>
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default VerifyEmailPage;