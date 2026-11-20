import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';
import { AdminLayout } from '../components/layout/AdminLayout';

const LoginPage = lazy(() => import('../pages/LoginPage'));
const DashboardPage = lazy(() => import('../pages/DashboardPage'));
const GalleriesPage = lazy(() => import('../pages/GalleriesPage'));
const GalleryEditorPage = lazy(() => import('../pages/GalleryEditorPage'));
const CategoriesPage = lazy(() => import('../pages/CategoriesPage'));
const LocationsPage = lazy(() => import('../pages/LocationsPage'));
const ServicesPage = lazy(() => import('../pages/ServicesPage'));
const InquiriesPage = lazy(() => import('../pages/InquiriesPage'));
const AnalyticsPage = lazy(() => import('../pages/AnalyticsPage'));
const SettingsPage = lazy(() => import('../pages/SettingsPage'));
const NotFoundPage = lazy(() => import('../pages/NotFoundPage'));
const DevComponentsPage = import.meta.env.DEV
  ? lazy(() => import('../pages/DevComponentsPage'))
  : null;

const PageLoader: React.FC = () => (
  <div className="flex-1 min-h-[40vh] flex items-center justify-center">
    <div className="w-8 h-8 rounded-full border-2 border-brand-500/20 border-t-brand-500 animate-spin" />
  </div>
);

export const AppRoutes: React.FC = () => {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* Public Route */}
        <Route path="/login" element={<LoginPage />} />

        {/* Protected Admin Routes */}
        <Route element={<ProtectedRoute />}>
          <Route element={<AdminLayout />}>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/galleries" element={<GalleriesPage />} />
            <Route path="/galleries/:id" element={<GalleryEditorPage />} />
            <Route path="/categories" element={<CategoriesPage />} />
            <Route path="/locations" element={<LocationsPage />} />
            <Route path="/services" element={<ServicesPage />} />
            <Route path="/inquiries" element={<InquiriesPage />} />
            <Route path="/analytics" element={<AnalyticsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            {import.meta.env.DEV && DevComponentsPage && (
              <Route path="/dev/components" element={<DevComponentsPage />} />
            )}
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Route>
      </Routes>
    </Suspense>
  );
};

export default AppRoutes;
