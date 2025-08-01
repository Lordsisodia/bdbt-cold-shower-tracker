import React, { lazy } from 'react';
import { Route, Routes } from 'react-router-dom';
import { ProtectedAdminRoute } from '../components/admin/ProtectedAdminRoute';
import { AdminLayout } from '../pages/admin/AdminLayout';

// Lazy load admin pages
const AdminDashboard = lazy(() => import('../components/admin/AdminDashboard'));
const UserManagement = lazy(() => import('../pages/admin/UserManagement'));
const ContentManagement = lazy(() => import('../pages/admin/ContentManagement'));
const AutomationDashboard = lazy(() => import('../pages/admin/AutomationDashboard'));
const AnalyticsPage = lazy(() => import('../pages/AnalyticsPage'));
const SettingsPage = lazy(() => import('../pages/SettingsPage'));

export const AdminRoutes: React.FC = () => {
  return (
    <ProtectedAdminRoute>
      <AdminLayout>
        <Routes>
          <Route index element={<AdminDashboard />} />
          <Route path="users" element={<UserManagement />} />
          <Route path="content" element={<ContentManagement />} />
          <Route path="automation" element={<AutomationDashboard />} />
          <Route path="analytics" element={<AnalyticsPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Routes>
      </AdminLayout>
    </ProtectedAdminRoute>
  );
};