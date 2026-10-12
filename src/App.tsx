import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { BrandGuardProvider, useBrandGuard } from './context/BrandGuardContext';
import { AppLayout } from './components/layout/AppLayout';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { BrandProfilePage } from './pages/BrandProfilePage';
import { DetectionsListPage } from './pages/DetectionsListPage';
import { DetectionDetailPage } from './pages/DetectionDetailPage';
import { SettingsPage } from './pages/SettingsPage';

// Protected Route wrapper
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useBrandGuard();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

export function AppContent() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Landing & Login Pages */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />

        {/* Protected Console App Routes */}
        <Route
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/brand" element={<BrandProfilePage />} />
          <Route path="/detections" element={<DetectionsListPage />} />
          <Route path="/detections/:id" element={<DetectionDetailPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default function App() {
  return (
    <BrandGuardProvider>
      <AppContent />
    </BrandGuardProvider>
  );
}
