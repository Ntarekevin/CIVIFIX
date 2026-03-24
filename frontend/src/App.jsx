import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import ReportPage from './pages/ReportPage';
import DashboardPage from './pages/DashboardPage';
import TrackPage from './pages/TrackPage';
import AboutPage from './pages/AboutPage';
import NotificationsPage from './pages/NotificationsPage';
import MentionsPage from './pages/MentionsPage';
import ExplorePage from './pages/ExplorePage';
import SettingsPage from './pages/SettingsPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import AdminDashboard from './pages/admin/AdminDashboard';
import OfflineBanner from './components/OfflineBanner';

// Helper component for private routes
const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('civifix_auth_token');
  return token ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <>
      <OfflineBanner />
      <Routes>
        {/* Full-page Auth routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />

        {/* Dashboard routes wrapped in Layout */}
        <Route 
          path="/*" 
          element={
            <Layout>
              <Routes>
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/report" element={<ReportPage />} />
                <Route path="/track" element={<TrackPage />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/notifications" element={<NotificationsPage />} />
                <Route path="/mentions" element={<MentionsPage />} />
                <Route path="/explore" element={<ExplorePage />} />
                <Route path="/settings" element={<SettingsPage />} />
                
                {/* Authority Dashboard */}
                <Route 
                  path="/admin/dashboard" 
                  element={
                    <PrivateRoute>
                      <AdminDashboard />
                    </PrivateRoute>
                  } 
                />
                
                {/* Catch all for dashboard area */}
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
              </Routes>
            </Layout>
          } 
        />
      </Routes>
    </>
  );
}

export default App;
