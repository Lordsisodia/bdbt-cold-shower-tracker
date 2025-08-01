import { AlertCircle, ArrowLeft, Check, CheckCircle, Eye, EyeOff, Lock, X } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Button, Card, LoadingSpinner } from '../../components/ui';
import { useAuth } from '../../contexts/AuthContext';

const ResetPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { updatePassword, validatePassword, isLoading } = useAuth();
  
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isValidToken, setIsValidToken] = useState<boolean | null>(null);
  const [passwordValidation, setPasswordValidation] = useState({
    isValid: false,
    errors: [] as string[],
    strength: 'weak' as 'weak' | 'medium' | 'strong'
  });

  const accessToken = searchParams.get('access_token');
  const refreshToken = searchParams.get('refresh_token');

  useEffect(() => {
    // Check if we have valid tokens from the URL
    if (!accessToken || !refreshToken) {
      setIsValidToken(false);
      setError('Invalid or expired reset link. Please request a new password reset.');
    } else {
      setIsValidToken(true);
    }
  }, [accessToken, refreshToken]);

  useEffect(() => {
    if (formData.password) {
      setPasswordValidation(validatePassword(formData.password));
    }
  }, [formData.password, validatePassword]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.password) {
      setError('Password is required');
      return;
    }

    if (!passwordValidation.isValid) {
      setError('Password does not meet security requirements');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    const { error } = await updatePassword(formData.password);

    if (error) {
      if (error.message.includes('weak password')) {
        setError('Password is too weak. Please choose a stronger password.');
      } else if (error.message.includes('same password')) {
        setError('New password must be different from your current password.');
      } else {
        setError(error.message || 'Failed to update password. Please try again.');
      }
    } else {
      setSuccess('Password updated successfully! You can now sign in with your new password.');
      
      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate('/auth/login', { 
          state: { 
            message: 'Password updated successfully! You can now sign in.' 
          } 
        });
      }, 3000);
    }
  };

  const getPasswordStrengthColor = (strength: string) => {
    switch (strength) {
      case 'weak': return 'text-red-600';
      case 'medium': return 'text-yellow-600';
      case 'strong': return 'text-green-600';
      default: return 'text-gray-400';
    }
  };

  const getPasswordStrengthBg = (strength: string) => {
    switch (strength) {
      case 'weak': return 'bg-red-200';
      case 'medium': return 'bg-yellow-200';
      case 'strong': return 'bg-green-200';
      default: return 'bg-gray-200';
    }
  };

  // Show loading while checking token validity
  if (isValidToken === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner />
      </div>
    );
  }

  // Show error if token is invalid
  if (isValidToken === false) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <Card className="w-full" variant="solid" padding="lg">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-8 h-8 text-red-600" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Invalid Reset Link</h1>
              <p className="text-gray-600 mb-6">
                This password reset link is invalid or has expired. Please request a new one.
              </p>
              <div className="space-y-3">
                <Link to="/auth/forgot-password">
                  <Button variant="primary" fullWidth>
                    Request New Reset Link
                  </Button>
                </Link>
                <Link to="/auth/login">
                  <Button variant="outline" fullWidth>
                    Back to Sign In
                  </Button>
                </Link>
              </div>
            </div>
          </Card>
        </div>
      </div>
    );
  }

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
              <Lock className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Set New Password</h1>
            <p className="text-gray-600">Create a secure password for your account</p>
          </div>

          {/* Success message */}
          {success && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
              <div>
                <p className="text-sm text-green-600">{success}</p>
                <p className="text-xs text-green-500 mt-1">Redirecting to sign in...</p>
              </div>
            </div>
          )}

          {/* Error message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Reset form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                New Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                  className="pl-10 pr-10 w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="Create a new password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              
              {/* Password strength indicator */}
              {formData.password && (
                <div className="mt-2">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex-1 bg-gray-200 h-2 rounded-full overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-300 ${getPasswordStrengthBg(passwordValidation.strength)}`}
                        style={{ 
                          width: passwordValidation.strength === 'weak' ? '33%' : 
                                 passwordValidation.strength === 'medium' ? '66%' : '100%' 
                        }}
                      />
                    </div>
                    <span className={`text-xs font-medium ${getPasswordStrengthColor(passwordValidation.strength)}`}>
                      {passwordValidation.strength.charAt(0).toUpperCase() + passwordValidation.strength.slice(1)}
                    </span>
                  </div>
                  
                  {passwordValidation.errors.length > 0 && (
                    <div className="space-y-1">
                      {passwordValidation.errors.map((error, index) => (
                        <div key={index} className="flex items-center gap-2 text-xs text-red-600">
                          <X className="w-3 h-3" />
                          {error}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                Confirm New Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                  className="pl-10 pr-10 w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="Confirm your new password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              
              {/* Password match indicator */}
              {formData.confirmPassword && (
                <div className="mt-2">
                  {formData.password === formData.confirmPassword ? (
                    <div className="flex items-center gap-2 text-xs text-green-600">
                      <Check className="w-3 h-3" />
                      Passwords match
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-xs text-red-600">
                      <X className="w-3 h-3" />
                      Passwords do not match
                    </div>
                  )}
                </div>
              )}
            </div>

            <Button
              type="submit"
              variant="primary"
              fullWidth
              isLoading={isLoading}
              disabled={!passwordValidation.isValid || formData.password !== formData.confirmPassword}
              className="py-3"
            >
              Update Password
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
        </Card>
      </div>
    </div>
  );
};

export default ResetPasswordPage;