import { lazy } from 'react';
import { RouteObject } from 'react-router-dom';
import { ProtectedRoute } from '../components/auth/ProtectedRoute';

// Lazy load components for code splitting
const HomePage = lazy(() => import('../pages/HomePage'));
const LoginPage = lazy(() => import('../pages/LoginPage'));
const DashboardPage = lazy(() => import('../pages/DashboardPage'));
const ProfilePage = lazy(() => import('../pages/ProfilePage'));
const TipsPage = lazy(() => import('../pages/TipsPage'));
const SettingsPage = lazy(() => import('../pages/SettingsPage'));
const AdminPage = lazy(() => import('../pages/AdminPage'));

export const routes: RouteObject[] = [
  {
    path: '/',
    element: <HomePage />,
  },
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/dashboard',
    element: (
      <ProtectedRoute>
        <DashboardPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/profile',
    element: (
      <ProtectedRoute>
        <ProfilePage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/tips',
    element: <TipsPage />,
  },
  {
    path: '/tips/:id',
    element: <TipsPage />,
  },
  {
    path: '/settings',
    element: (
      <ProtectedRoute>
        <SettingsPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/admin/*',
    element: (
      <ProtectedRoute requiredRole="admin">
        <AdminPage />
      </ProtectedRoute>
    ),
  },
];

export const publicRoutes = [
  '/',
  '/login',
  '/tips',
];

export const protectedRoutes = [
  '/dashboard',
  '/profile',
  '/settings',
];

export const adminRoutes = [
  '/admin',
  '/admin/users',
  '/admin/tips',
  '/admin/analytics',
];