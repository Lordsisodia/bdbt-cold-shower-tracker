import React, { useState } from 'react';
import { X, Download, Mail, Gift, Shield, CheckCircle } from 'lucide-react';
import { newsletterService } from '../../services/newsletterService';

interface EmailCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (email: string, preferences: EmailPreferences) => Promise<void>;
  tipTitle: string;
  tipCategory: string;
}

interface EmailPreferences {
  weeklyTips: boolean;
  categoryUpdates: boolean;
  productUpdates: boolean;
}

const EmailCaptureModal: React.FC<EmailCaptureModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  tipTitle,
  tipCategory
}) => {
  const [email, setEmail] = useState('');
  const [preferences, setPreferences] = useState<EmailPreferences>({
    weeklyTips: true,
    categoryUpdates: true,
    productUpdates: false
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      
      // Subscribe to newsletter service
      await newsletterService.subscribeUser(email, {
        healthTips: tipCategory === 'health' || preferences.weeklyTips,
        wealthTips: tipCategory === 'wealth' || preferences.weeklyTips,
        happinessTips: tipCategory === 'happiness' || preferences.weeklyTips,
        weeklyDigest: preferences.weeklyTips,
        productUpdates: preferences.productUpdates,
        specialOffers: false,
      }, {
        source: 'pdf_download',
        tags: [`pdf-${tipCategory}`, 'pdf-download'],
      });
      
      await onSubmit(email, preferences);
      setIsSubmitted(true);
      
      // Auto-close after 2 seconds
      setTimeout(() => {
        onClose();
        setIsSubmitted(false);
        setEmail('');
      }, 2000);
      
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const categoryColors = {
    health: 'from-emerald-500 to-teal-600',
    wealth: 'from-amber-500 to-orange-600',
    happiness: 'from-violet-500 to-purple-600'
  };

  const gradientColor = categoryColors[tipCategory as keyof typeof categoryColors] || categoryColors.health;

  if (isSubmitted) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 text-center">
          <div className="mb-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Thank You!</h2>
            <p className="text-gray-600">
              Your download will start shortly. Check your email for the PDF and welcome message!
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className={`bg-gradient-to-r ${gradientColor} text-white p-6 rounded-t-2xl relative`}>
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="pr-12">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                <Gift className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Get Your Free PDF</h2>
                <p className="text-white/90 text-sm">Join 10,000+ readers</p>
              </div>
            </div>
            <p className="text-white/90 text-sm">
              Download "{tipTitle}" and get exclusive tips delivered to your inbox
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Benefits */}
          <div className="mb-6">
            <h3 className="font-semibold text-gray-900 mb-3">What you'll get:</h3>
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Download className="w-3 h-3 text-green-600" />
                </div>
                <span className="text-sm text-gray-700">Instant PDF download of this guide</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Mail className="w-3 h-3 text-blue-600" />
                </div>
                <span className="text-sm text-gray-700">Weekly actionable tips to your inbox</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Shield className="w-3 h-3 text-purple-600" />
                </div>
                <span className="text-sm text-gray-700">Exclusive content not available elsewhere</span>
              </div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
                disabled={isSubmitting}
              />
            </div>

            {/* Email Preferences */}
            <div className="mb-6">
              <h4 className="text-sm font-medium text-gray-700 mb-3">Email preferences (optional):</h4>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={preferences.weeklyTips}
                    onChange={(e) => setPreferences({...preferences, weeklyTips: e.target.checked})}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    disabled={isSubmitting}
                  />
                  <span className="ml-2 text-sm text-gray-700">Weekly tips & guides</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={preferences.categoryUpdates}
                    onChange={(e) => setPreferences({...preferences, categoryUpdates: e.target.checked})}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    disabled={isSubmitting}
                  />
                  <span className="ml-2 text-sm text-gray-700">Updates for {tipCategory} tips</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={preferences.productUpdates}
                    onChange={(e) => setPreferences({...preferences, productUpdates: e.target.checked})}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    disabled={isSubmitting}
                  />
                  <span className="ml-2 text-sm text-gray-700">Product updates & announcements</span>
                </label>
              </div>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full py-3 px-4 rounded-lg font-semibold text-white transition-colors ${
                isSubmitting 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : `bg-gradient-to-r ${gradientColor} hover:opacity-90`
              }`}
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Processing...
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  <Download className="w-5 h-5" />
                  Get My Free PDF
                </div>
              )}
            </button>
          </form>

          {/* Privacy Notice */}
          <div className="mt-4 text-center">
            <p className="text-xs text-gray-500">
              We respect your privacy. Unsubscribe at any time.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailCaptureModal;