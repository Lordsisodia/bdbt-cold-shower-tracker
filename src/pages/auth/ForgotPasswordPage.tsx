import { AlertCircle, ArrowLeft, CheckCircle, Mail } from 'lucide-react';
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button, Card } from '../../components/ui';
import { useAuth } from '../../contexts/AuthContext';

const ForgotPasswordPage: React.FC = () => {
  const { resetPassword, validateEmail, isLoading } = useAuth();
  
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!email) {
      setError('Email is required');
      return;
    }

    if (!validateEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }

    const { error } = await resetPassword(email);

    if (error) {
      if (error.message.includes('User not found')) {
        setError('No account found with this email address.');
      } else if (error.message.includes('Email rate limit')) {
        setError('Too many password reset requests. Please wait before trying again.');
      } else {
        setError(error.message || 'Failed to send reset email. Please try again.');
      }
    } else {
      setSuccess('Password reset email sent! Check your inbox and follow the instructions.');
      setIsSubmitted(true);
    }
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
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {isSubmitted ? 'Check Your Email' : 'Reset Password'}
            </h1>
            <p className="text-gray-600">
              {isSubmitted 
                ? "We've sent password reset instructions to your email" 
                : "Enter your email address and we'll send you a link to reset your password"
              }
            </p>
          </div>

          {/* Success message */}
          {success && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
              <p className="text-sm text-green-600">{success}</p>
            </div>
          )}

          {/* Error message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {!isSubmitted ? (
            <>
              {/* Reset form */}
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10 w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      placeholder="Enter your email"
                      required
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  fullWidth
                  isLoading={isLoading}
                  className="py-3"
                >
                  Send Reset Link
                </Button>
              </form>

              {/* Sign up link */}
              <div className="mt-6 text-center">
                <p className="text-sm text-gray-600">
                  Don't have an account?{' '}
                  <Link
                    to="/auth/signup"
                    className="text-blue-600 hover:text-blue-800 font-medium"
                  >
                    Sign up for free
                  </Link>
                </p>
              </div>
            </>
          ) : (
            <div className="space-y-6">
              {/* Instructions */}
              <div className="bg-blue-50 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-2">What to do next:</h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>1. Check your email inbox for a message from us</li>
                  <li>2. Click the "Reset Password" link in the email</li>
                  <li>3. Create a new password on the next page</li>
                  <li>4. Sign in with your new password</li>
                </ul>
              </div>

              {/* Didn't receive email */}
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-3">
                  Didn't receive the email?
                </p>
                <div className="space-y-2">
                  <button
                    onClick={() => {
                      setIsSubmitted(false);
                      setSuccess('');
                      setError('');
                    }}
                    className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                  >
                    Try a different email address
                  </button>
                  <p className="text-xs text-gray-500">
                    Check your spam folder or wait up to 10 minutes for the email to arrive
                  </p>
                </div>
              </div>

              {/* Back to login */}
              <div className="pt-4 border-t border-gray-200">
                <Link
                  to="/auth/login"
                  className="block w-full text-center text-sm text-gray-600 hover:text-gray-900 py-2"
                >
                  Back to Sign In
                </Link>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;