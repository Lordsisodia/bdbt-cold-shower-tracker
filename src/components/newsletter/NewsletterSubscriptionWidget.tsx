import React, { useState } from 'react';
import { Mail, Check, X, Sparkles, Gift, Zap } from 'lucide-react';
import { newsletterService } from '../../services/newsletterService';

interface NewsletterSubscriptionWidgetProps {
  variant?: 'inline' | 'popup' | 'sidebar' | 'footer';
  title?: string;
  description?: string;
  incentive?: string;
  showPreferences?: boolean;
  className?: string;
  onSubscribe?: (email: string) => void;
}

const NewsletterSubscriptionWidget: React.FC<NewsletterSubscriptionWidgetProps> = ({
  variant = 'inline',
  title = 'Stay Updated with BDBT',
  description = 'Get weekly tips for health, wealth, and happiness delivered to your inbox.',
  incentive = 'Plus get our free PDF guide: "10 Morning Habits That Transform Your Day"',
  showPreferences = true,
  className = '',
  onSubscribe
}) => {
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [preferences, setPreferences] = useState({
    healthTips: true,
    wealthTips: true,
    happinessTips: true,
    weeklyDigest: true,
    productUpdates: false,
    specialOffers: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPreferencesPanel, setShowPreferencesPanel] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      await newsletterService.subscribeUser(email, preferences, {
        firstName: firstName || undefined,
        source: 'website',
        referrer: document.referrer,
        tags: ['website-signup'],
      });

      setIsSubscribed(true);
      onSubscribe?.(email);

      // Reset form after delay
      setTimeout(() => {
        setIsSubscribed(false);
        setEmail('');
        setFirstName('');
        setShowPreferencesPanel(false);
      }, 3000);

    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePreferenceChange = (key: keyof typeof preferences) => {
    setPreferences(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  // Variant-specific styling
  const getVariantStyles = () => {
    switch (variant) {
      case 'popup':
        return 'bg-white rounded-2xl shadow-2xl border border-gray-200 max-w-md w-full p-8';
      case 'sidebar':
        return 'bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-200 p-6';
      case 'footer':
        return 'bg-gray-900 text-white rounded-xl p-6';
      default:
        return 'bg-white rounded-xl shadow-sm border border-gray-200 p-6';
    }
  };

  const getTextStyles = () => {
    return variant === 'footer' ? 'text-white' : 'text-gray-900';
  };

  const getSubtextStyles = () => {
    return variant === 'footer' ? 'text-gray-300' : 'text-gray-600';
  };

  if (isSubscribed) {
    return (
      <div className={`${getVariantStyles()} ${className} text-center`}>
        <div className="flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mx-auto mb-4">
          <Check className="w-8 h-8 text-green-600" />
        </div>
        <h3 className={`text-xl font-bold ${getTextStyles()} mb-2`}>
          Welcome to BDBT!
        </h3>
        <p className={`${getSubtextStyles()} mb-4`}>
          Thanks for subscribing! Check your email for a confirmation and your free PDF guide.
        </p>
        <div className="flex items-center justify-center gap-2 text-sm text-green-600">
          <Sparkles className="w-4 h-4" />
          <span>You're all set!</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`${getVariantStyles()} ${className}`}>
      {/* Header */}
      <div className="text-center mb-6">
        <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full mx-auto mb-3">
          <Mail className="w-6 h-6 text-blue-600" />
        </div>
        <h3 className={`text-xl font-bold ${getTextStyles()} mb-2`}>
          {title}
        </h3>
        <p className={`${getSubtextStyles()} text-sm mb-3`}>
          {description}
        </p>
        {incentive && (
          <div className={`flex items-center justify-center gap-2 p-3 rounded-lg ${
            variant === 'footer' 
              ? 'bg-gray-800 border border-gray-700' 
              : 'bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200'
          }`}>
            <Gift className={`w-4 h-4 ${variant === 'footer' ? 'text-yellow-400' : 'text-yellow-600'}`} />
            <span className={`text-xs font-medium ${
              variant === 'footer' ? 'text-yellow-200' : 'text-yellow-800'
            }`}>
              {incentive}
            </span>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Name field (optional) */}
        <div>
          <input
            type="text"
            placeholder="First name (optional)"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            className={`w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
              variant === 'footer'
                ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-400'
                : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
            }`}
          />
        </div>

        {/* Email field */}
        <div>
          <input
            type="email"
            placeholder="Enter your email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className={`w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
              variant === 'footer'
                ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-400'
                : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
            }`}
          />
        </div>

        {/* Preferences toggle */}
        {showPreferences && (
          <div>
            <button
              type="button"
              onClick={() => setShowPreferencesPanel(!showPreferencesPanel)}
              className={`text-sm font-medium flex items-center gap-2 ${
                variant === 'footer' ? 'text-blue-300 hover:text-blue-200' : 'text-blue-600 hover:text-blue-700'
              }`}
            >
              <Zap className="w-4 h-4" />
              Customize your preferences
              <span className="text-xs">
                {showPreferencesPanel ? '▲' : '▼'}
              </span>
            </button>

            {showPreferencesPanel && (
              <div className="mt-3 space-y-3">
                <p className={`text-xs ${getSubtextStyles()}`}>
                  Choose what you'd like to receive:
                </p>
                <div className="grid grid-cols-1 gap-2">
                  {Object.entries({
                    healthTips: 'Health Tips',
                    wealthTips: 'Wealth Tips',
                    happinessTips: 'Happiness Tips',
                    weeklyDigest: 'Weekly Digest',
                    productUpdates: 'Product Updates',
                    specialOffers: 'Special Offers',
                  }).map(([key, label]) => (
                    <label key={key} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={preferences[key as keyof typeof preferences]}
                        onChange={() => handlePreferenceChange(key as keyof typeof preferences)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className={`text-sm ${getTextStyles()}`}>
                        {label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Error message */}
        {error && (
          <div className="flex items-center gap-2 text-red-600 text-sm">
            <X className="w-4 h-4" />
            {error}
          </div>
        )}

        {/* Submit button */}
        <button
          type="submit"
          disabled={isSubmitting || !email}
          className={`w-full py-3 px-4 rounded-lg font-medium transition-all duration-200 ${
            isSubmitting || !email
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : variant === 'footer'
              ? 'bg-blue-600 hover:bg-blue-700 text-white'
              : 'bg-blue-600 hover:bg-blue-700 text-white'
          } ${isSubmitting ? 'animate-pulse' : ''}`}
        >
          {isSubmitting ? (
            <div className="flex items-center justify-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Subscribing...
            </div>
          ) : (
            <div className="flex items-center justify-center gap-2">
              <Mail className="w-4 h-4" />
              Subscribe Now
            </div>
          )}
        </button>

        {/* Privacy note */}
        <p className={`text-xs ${getSubtextStyles()} text-center`}>
          We respect your privacy. Unsubscribe at any time.
        </p>
      </form>
    </div>
  );
};

export default NewsletterSubscriptionWidget;