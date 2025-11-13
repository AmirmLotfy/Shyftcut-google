

import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { useAuth } from './hooks/useAuth';

import LandingPage from './pages/LandingPage';
import PricingPage from './pages/PricingPage';
import AuthPage from './pages/AuthPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import DashboardHomePage from './pages/DashboardHomePage';
import RoadmapDashboardPage from './pages/RoadmapDashboardPage';
import SettingsPage from './pages/SettingsPage';
import NotFoundPage from './pages/NotFoundPage';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';
import TermsOfServicePage from './pages/TermsOfServicePage';
import AssetUploaderPage from './pages/AssetUploaderPage';
import PublicRoadmapPage from './pages/PublicRoadmapPage';
import MasteringSelfLearningPage from './pages/blog/MasteringSelfLearningPage';
import TechCareerChangePage from './pages/blog/TechCareerChangePage';
import AIInYourCareerPage from './pages/blog/AIInYourCareerPage';

import ProtectedRoute from './components/ProtectedRoute';
import DashboardLayout from './layouts/DashboardLayout';
import Wizard from './components/Wizard/Wizard';
import ErrorBoundary from './components/ErrorBoundary';
import ScrollToTop from './components/ScrollToTop';

const AppRoutes: React.FC = () => {
    const { user, loading } = useAuth();
    
    const PublicOnlyRoute: React.FC<{element: React.ReactElement}> = ({ element }) => {
        if (loading) return null;
        return !user ? element : <Navigate to="/dashboard" replace />;
    };

    return (
        <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/pricing" element={<PricingPage />} />
            <Route path="/auth" element={<PublicOnlyRoute element={<AuthPage />} />} />
            <Route path="/forgot-password" element={<PublicOnlyRoute element={<ForgotPasswordPage />} />} />
            <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
            <Route path="/terms-of-service" element={<TermsOfServicePage />} />
            <Route path="/utils/asset-uploader" element={<AssetUploaderPage />} />
            <Route path="/public/roadmap/:roadmapId" element={<PublicRoadmapPage />} />

            {/* Blog Routes */}
            <Route path="/blog/mastering-self-learning" element={<MasteringSelfLearningPage />} />
            <Route path="/blog/tech-career-change" element={<TechCareerChangePage />} />
            <Route path="/blog/ai-in-your-career" element={<AIInYourCareerPage />} />

            {/* Protected Routes */}
            <Route element={<ProtectedRoute />}>
                <Route path="/app/wizard" element={<Wizard />} />
                <Route path="/app/roadmap/:roadmapId" element={<RoadmapDashboardPage />} />
                <Route element={<DashboardLayout />}>
                    <Route path="/dashboard" element={<DashboardHomePage />} />
                    <Route path="/settings" element={<SettingsPage />} />
                </Route>
            </Route>

            {/* Not Found Route */}
            <Route path="*" element={<NotFoundPage />} />
        </Routes>
    );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <HashRouter>
        <ScrollToTop />
        <ErrorBoundary>
          <AppRoutes />
        </ErrorBoundary>
      </HashRouter>
    </AuthProvider>
  );
};

export default App;