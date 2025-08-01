import { lazy, Suspense, useEffect } from 'react';
import { HelmetProvider } from 'react-helmet-async';
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
import ProtectedRoute, { GuestRoute } from './components/auth/ProtectedRoute';
import { CustomToaster, LoadingSpinner } from './components/ui';
import { AuthProvider } from './contexts/AuthContext';
import { trackPageView } from './services/analyticsService';

// Critical pages that should load immediately
import LandingPage from './pages/LandingPage';

// Lazy load all other pages
const AboutPage = lazy(() => import('./pages/AboutPage'));
const TipsPage = lazy(() => import('./pages/TipsPage'));
const TipDetailPage = lazy(() => import('./pages/TipDetailPage'));
const TipSlugPage = lazy(() => import('./pages/TipSlugPage'));
const BlueprintPage = lazy(() => import('./pages/BlueprintPage'));
const PodcastPage = lazy(() => import('./pages/PodcastPage'));
const DailyWinsPage = lazy(() => import('./pages/DailyWinsPage'));
const PartnershipPage = lazy(() => import('./pages/PartnershipPage'));
const TipsTemplatePreview = lazy(() => import('./pages/TipsTemplatePreview'));
const SimpleTipGenerator = lazy(() => import('./components/tips/SimpleTipGenerator'));

// Admin routes
const AdminRoutes = lazy(() => import('./routes/AdminRoutes'));

// Legal pages
const TermsOfServicePage = lazy(() => import('./pages/TermsOfServicePage'));
const PrivacyPolicyPage = lazy(() => import('./pages/PrivacyPolicyPage'));
const CareersPage = lazy(() => import('./pages/CareersPage'));

// Auth pages
const LoginPage = lazy(() => import('./pages/auth/LoginPage'));
const SignupPage = lazy(() => import('./pages/auth/SignupPage'));
const ForgotPasswordPage = lazy(() => import('./pages/auth/ForgotPasswordPage'));
const ResetPasswordPage = lazy(() => import('./pages/auth/ResetPasswordPage'));
const AuthCallbackPage = lazy(() => import('./pages/auth/AuthCallbackPage'));
const VerifyEmailPage = lazy(() => import('./pages/auth/VerifyEmailPage'));
const UnauthorizedPage = lazy(() => import('./pages/auth/UnauthorizedPage'));

// Admin pages
const Dashboard = lazy(() => import('./pages/Dashboard'));
const ContentCalendar = lazy(() => import('./pages/ContentCalendar'));
const AnalyticsPage = lazy(() => import('./pages/AnalyticsPage'));
const SettingsPage = lazy(() => import('./pages/SettingsPage'));
const EmailStatsPage = lazy(() => import('./pages/EmailStatsPage'));
const EnhancedTipCreator = lazy(() => import('./components/tips/EnhancedTipCreator'));
const AdminLayout = lazy(() => import('./components/admin/AdminLayout'));

// Analytics tracking component
function Analytics() {
  const location = useLocation();

  useEffect(() => {
    // Track page views on route changes
    trackPageView(location.pathname, {
      search: location.search,
      referrer: document.referrer,
      timestamp: new Date().toISOString()
    });
  }, [location]);

  return null;
}

function App() {
  return (
    <HelmetProvider>
      <AuthProvider>
        <Router>
          <Analytics />
          <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><LoadingSpinner /></div>}>
            <Routes>
              {/* Public Landing Pages */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/tips" element={<TipsPage />} />
              <Route path="/tip/:tipId" element={<TipDetailPage />} />
              <Route path="/tips/:slug" element={<TipSlugPage />} />
              <Route path="/blueprint" element={<BlueprintPage />} />
              <Route path="/podcast" element={<PodcastPage />} />
              <Route path="/daily-wins" element={<DailyWinsPage />} />
              <Route path="/partnership" element={<PartnershipPage />} />
              <Route path="/template-preview" element={<TipsTemplatePreview />} />
              <Route path="/generate" element={<SimpleTipGenerator />} />
              
              {/* Legal Pages */}
              <Route path="/terms-of-service" element={<TermsOfServicePage />} />
              <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
              <Route path="/careers" element={<CareersPage />} />
              
              {/* Auth Routes - Only accessible when not authenticated */}
              <Route path="/auth/login" element={
                <GuestRoute>
                  <LoginPage />
                </GuestRoute>
              } />
              <Route path="/auth/signup" element={
                <GuestRoute>
                  <SignupPage />
                </GuestRoute>
              } />
              <Route path="/auth/forgot-password" element={
                <GuestRoute>
                  <ForgotPasswordPage />
                </GuestRoute>
              } />
              <Route path="/auth/reset-password" element={<ResetPasswordPage />} />
              <Route path="/auth/callback" element={<AuthCallbackPage />} />
              <Route path="/auth/verify-email" element={<VerifyEmailPage />} />
              <Route path="/unauthorized" element={<UnauthorizedPage />} />
              
              {/* Protected Admin SaaS Application */}
              <Route path="/admin/*" element={
                <ProtectedRoute requireAuth={true} requiredRole="admin">
                  <Suspense fallback={<LoadingSpinner />}>
                    <AdminRoutes />
                  </Suspense>
                </ProtectedRoute>
              } />
            </Routes>
          </Suspense>
        </Router>
        <CustomToaster />
      </AuthProvider>
    </HelmetProvider>
  );
}

export default App