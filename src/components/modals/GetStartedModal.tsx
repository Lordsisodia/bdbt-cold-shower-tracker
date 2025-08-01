import { ArrowRight, CheckCircle, Loader, Star, Target, Trophy, Users, X } from 'lucide-react';
import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';

interface GetStartedModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type Step = 'welcome' | 'goals' | 'experience' | 'signup' | 'success';

const GetStartedModal: React.FC<GetStartedModalProps> = ({ isOpen, onClose }) => {
  const { signUp, validateEmail } = useAuth();
  const [currentStep, setCurrentStep] = useState<Step>('welcome');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    goals: [] as string[],
    experience: '',
    email: '',
    name: '',
    agreeToTerms: false
  });

  const goals = [
    { id: 'health', label: 'Improve Health & Fitness', icon: Trophy, color: 'green' },
    { id: 'wealth', label: 'Build Wealth & Success', icon: Target, color: 'blue' },
    { id: 'happiness', label: 'Increase Happiness & Fulfillment', icon: Star, color: 'purple' },
    { id: 'habits', label: 'Build Better Daily Habits', icon: CheckCircle, color: 'orange' }
  ];

  const experienceLevels = [
    { id: 'beginner', label: 'Just Getting Started', description: 'New to personal development' },
    { id: 'intermediate', label: 'Making Progress', description: 'Some experience with self-improvement' },
    { id: 'advanced', label: 'Experienced', description: 'Already have solid foundations' }
  ];

  const handleGoalToggle = (goalId: string) => {
    setFormData(prev => ({
      ...prev,
      goals: prev.goals.includes(goalId)
        ? prev.goals.filter(g => g !== goalId)
        : [...prev.goals, goalId]
    }));
  };

  const handleNext = async () => {
    switch (currentStep) {
      case 'welcome':
        setCurrentStep('goals');
        break;
      case 'goals':
        setCurrentStep('experience');
        break;
      case 'experience':
        setCurrentStep('signup');
        break;
      case 'signup':
        // Validate form data
        if (!formData.email || !validateEmail(formData.email)) {
          setError('Please enter a valid email address');
          return;
        }
        if (!formData.name.trim()) {
          setError('Please enter your name');
          return;
        }
        if (!formData.agreeToTerms) {
          setError('Please agree to the terms and conditions');
          return;
        }

        setIsSubmitting(true);
        setError('');
        
        try {
          // Generate a temporary password (user will reset it via email)
          const tempPassword = Math.random().toString(36).slice(-12) + 'A1!';
          
          const { error: signUpError } = await signUp({
            email: formData.email,
            password: tempPassword,
            fullName: formData.name,
            metadata: {
              goals: formData.goals,
              experience: formData.experience,
              onboarding_completed: true,
              signup_source: 'get_started_modal'
            }
          });

          if (signUpError) {
            if (signUpError.message.includes('User already registered')) {
              setError('An account with this email already exists. Try signing in instead.');
            } else {
              setError(signUpError.message || 'Failed to create account. Please try again.');
            }
          } else {
            setCurrentStep('success');
          }
        } catch (error: any) {
          setError('Failed to create account. Please try again.');
        } finally {
          setIsSubmitting(false);
        }
        break;
    }
  };

  const handleBack = () => {
    switch (currentStep) {
      case 'goals':
        setCurrentStep('welcome');
        break;
      case 'experience':
        setCurrentStep('goals');
        break;
      case 'signup':
        setCurrentStep('experience');
        break;
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 'welcome':
        return true;
      case 'goals':
        return formData.goals.length > 0;
      case 'experience':
        return formData.experience !== '';
      case 'signup':
        return formData.email && formData.name && formData.agreeToTerms;
      default:
        return false;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:p-0">
        {/* Background overlay */}
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
          onClick={onClose}
        />

        {/* Modal content */}
        <div className="relative w-full max-w-2xl mx-auto bg-white rounded-3xl shadow-2xl transform transition-all overflow-hidden">
          {/* Header */}
          <div className="relative bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-6 text-white">
            <button
              onClick={onClose}
              className="absolute top-6 right-6 text-white/80 hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Progress indicator */}
            <div className="flex justify-center mb-4">
              <div className="flex gap-2">
                {['welcome', 'goals', 'experience', 'signup'].map((step, index) => (
                  <div
                    key={step}
                    className={`w-3 h-3 rounded-full transition-all ${
                      currentStep === step || 
                      (['goals', 'experience', 'signup'].indexOf(step) < ['goals', 'experience', 'signup'].indexOf(currentStep))
                        ? 'bg-white' 
                        : 'bg-white/30'
                    }`}
                  />
                ))}
              </div>
            </div>

            <h2 className="text-2xl font-bold text-center">
              {currentStep === 'welcome' && 'Welcome to BDBT'}
              {currentStep === 'goals' && 'What are your goals?'}
              {currentStep === 'experience' && 'What\'s your experience level?'}
              {currentStep === 'signup' && 'Create your account'}
              {currentStep === 'success' && 'Welcome to the community!'}
            </h2>
          </div>

          {/* Content */}
          <div className="px-8 py-8 min-h-[400px]">
            {/* Error message */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
                <div className="w-5 h-5 text-red-600 flex-shrink-0">⚠️</div>
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}
            {/* Welcome Step */}
            {currentStep === 'welcome' && (
              <div className="text-center space-y-6">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto">
                  <Users className="w-10 h-10 text-white" />
                </div>
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold text-gray-900">
                    Join 50,000+ people transforming their lives
                  </h3>
                  <p className="text-gray-600 max-w-md mx-auto">
                    Get access to our proven system for building better habits, achieving your goals, 
                    and living your best life. Let's personalize your experience.
                  </p>
                </div>
                <div className="grid grid-cols-3 gap-4 max-w-sm mx-auto text-sm">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">100+</div>
                    <div className="text-gray-600">Free Resources</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">50K+</div>
                    <div className="text-gray-600">Members</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">95%</div>
                    <div className="text-gray-600">Success Rate</div>
                  </div>
                </div>
              </div>
            )}

            {/* Goals Step */}
            {currentStep === 'goals' && (
              <div className="space-y-6">
                <p className="text-center text-gray-600">
                  Select all areas where you'd like to see improvement (choose at least one):
                </p>
                <div className="grid grid-cols-2 gap-4">
                  {goals.map((goal) => (
                    <button
                      key={goal.id}
                      onClick={() => handleGoalToggle(goal.id)}
                      className={`p-6 rounded-2xl border-2 transition-all text-left ${
                        formData.goals.includes(goal.id)
                          ? `border-${goal.color}-500 bg-${goal.color}-50`
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                          formData.goals.includes(goal.id)
                            ? `bg-${goal.color}-500 text-white`
                            : 'bg-gray-100 text-gray-600'
                        }`}>
                          <goal.icon className="w-6 h-6" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900">{goal.label}</h4>
                        </div>
                        {formData.goals.includes(goal.id) && (
                          <CheckCircle className="w-5 h-5 text-green-500" />
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Experience Step */}
            {currentStep === 'experience' && (
              <div className="space-y-6">
                <p className="text-center text-gray-600">
                  This helps us customize your experience and recommend the right resources:
                </p>
                <div className="space-y-4">
                  {experienceLevels.map((level) => (
                    <button
                      key={level.id}
                      onClick={() => setFormData(prev => ({ ...prev, experience: level.id }))}
                      className={`w-full p-6 rounded-2xl border-2 transition-all text-left ${
                        formData.experience === level.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-1">{level.label}</h4>
                          <p className="text-gray-600 text-sm">{level.description}</p>
                        </div>
                        {formData.experience === level.id && (
                          <CheckCircle className="w-5 h-5 text-blue-500" />
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Signup Step */}
            {currentStep === 'signup' && (
              <div className="space-y-6">
                <p className="text-center text-gray-600">
                  Almost there! Create your account to get started:
                </p>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter your full name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter your email"
                    />
                  </div>
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      id="terms"
                      checked={formData.agreeToTerms}
                      onChange={(e) => setFormData(prev => ({ ...prev, agreeToTerms: e.target.checked }))}
                      className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="terms" className="text-sm text-gray-600">
                      I agree to the{' '}
                      <a href="/terms" className="text-blue-600 hover:underline">Terms of Service</a>
                      {' '}and{' '}
                      <a href="/privacy" className="text-blue-600 hover:underline">Privacy Policy</a>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* Success Step */}
            {currentStep === 'success' && (
              <div className="text-center space-y-6">
                <div className="w-20 h-20 bg-green-100 rounded-2xl flex items-center justify-center mx-auto">
                  <CheckCircle className="w-10 h-10 text-green-600" />
                </div>
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold text-gray-900">
                    You're all set, {formData.name}!
                  </h3>
                  <p className="text-gray-600 max-w-md mx-auto">
                    Your account has been created! Check your email to verify your account and set up your password.
                  </p>
                </div>
                <div className="bg-blue-50 rounded-2xl p-6 text-left">
                  <h4 className="font-semibold text-gray-900 mb-3">What happens next:</h4>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Check your email for the verification link
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Click the link to verify your account
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Set up your password and start using BDBT
                    </li>
                  </ul>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-8 py-6 bg-gray-50 border-t flex justify-between items-center">
            {currentStep !== 'welcome' && currentStep !== 'success' && (
              <button
                onClick={handleBack}
                className="px-6 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Back
              </button>
            )}
            
            <div className="flex-1" />

            {currentStep !== 'success' && (
              <button
                onClick={handleNext}
                disabled={!canProceed() || isSubmitting}
                className={`flex items-center gap-2 px-8 py-3 rounded-full font-medium transition-all ${
                  canProceed() && !isSubmitting
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 transform hover:scale-105'
                    : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                }`}
              >
                {isSubmitting ? (
                  <>
                    <Loader className="w-4 h-4 animate-spin" />
                    Creating Account...
                  </>
                ) : (
                  <>
                    {currentStep === 'signup' ? 'Create Account' : 'Continue'}
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            )}

            {currentStep === 'success' && (
              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  className="flex items-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-full font-medium hover:bg-gray-200 transition-all"
                >
                  Explore Website
                </button>
                <button
                  onClick={() => window.location.href = '/admin/dashboard'}
                  className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full font-medium hover:from-blue-700 hover:to-purple-700 transition-all transform hover:scale-105"
                >
                  Access Admin Panel
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GetStartedModal;