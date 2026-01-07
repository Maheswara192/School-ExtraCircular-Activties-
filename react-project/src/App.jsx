import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import { Toaster } from 'react-hot-toast';

// Pages (Lazy Loaded)
const Home = lazy(() => import('./pages/Home'));
const Activities = lazy(() => import('./pages/Activities'));
const Leaderboard = lazy(() => import('./pages/Leaderboard'));
const Apply = lazy(() => import('./pages/Apply'));

// Admin Pages (Lazy Loaded)
const AdminLogin = lazy(() => import('./admin/pages/AdminLogin'));
const ForgotCredentials = lazy(() => import('./admin/pages/ForgotCredentials'));
const Dashboard = lazy(() => import('./admin/pages/Dashboard'));
const Events = lazy(() => import('./admin/pages/Events'));
const Applications = lazy(() => import('./admin/pages/Applications'));
const PerformanceManager = lazy(() => import('./admin/pages/PerformanceManager'));
const ParticipationAnalytics = lazy(() => import('./admin/pages/ParticipationAnalytics'));
const AdminLayout = lazy(() => import('./admin/components/AdminLayout'));
const PublicLayout = lazy(() => import('./components/PublicLayout')); // Public Layout
const NotFound = lazy(() => import('./pages/NotFound'));

const Loading = () => <div style={{ height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>Loading...</div>;

function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <Router>
          <Suspense fallback={<Loading />}>
            <Toaster position="top-right" reverseOrder={false} />
            <Routes>
              {/* Public Routes Wrapped in PublicLayout */}
              <Route element={<PublicLayout />}>
                <Route path="/" element={<Home />} />
                <Route path="/activities" element={<Activities />} />
                <Route path="/leaderboard" element={<Leaderboard />} />
                <Route path="/apply" element={<Apply />} />
              </Route>

              {/* Admin Routes */}
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route path="/admin/forgot-password" element={<ForgotCredentials />} />

              {/* Protected Admin Routes Grouped by Layout */}
              <Route element={<AdminLayout />}>
                <Route path="/admin/dashboard" element={<Dashboard />} />
                <Route path="/admin/events" element={<Events />} />
                <Route path="/admin/applications" element={<Applications />} />
                <Route path="/admin/results" element={<PerformanceManager />} />
                <Route path="/admin/analytics" element={<ParticipationAnalytics />} />
                <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
              </Route>

              {/* 404 Not Found */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </Router>
      </SocketProvider>
    </AuthProvider>
  );
}

export default App;
