import React, { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import NetworkOverlay from './components/NetworkOverlay';
import OwnerNotification from './components/OwnerNotification';

const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Profile = lazy(() => import('./pages/Profile'));
const Deposit = lazy(() => import('./pages/Deposit'));
const History = lazy(() => import('./pages/History'));
const Order = lazy(() => import('./pages/Order'));
const NotFound = lazy(() => import('./pages/NotFound'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const Dokumentasi = lazy(() => import('./pages/Dokumentasi'));
const Ketentuan = lazy(() => import('./pages/Ketentuan'));
const Maintenance = lazy(() => import('./pages/Maintenance'));
const Referral = lazy(() => import('./pages/Referral'));

const PageLoader = () => (
  <div className="flex min-h-[80vh] items-center justify-center bg-slate-50 dark:bg-slate-900">
    <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
  </div>
);

const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login" />;
};

const AuthRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  return token ? <Navigate to="/dashboard" replace /> : children;
};

function App() {
  return (
    <Router>
      <NetworkOverlay />
      <OwnerNotification />
      <Navbar />
      <div className="pt-16">
        <Suspense fallback={<PageLoader />}>
          <Routes>
            {/* Route "/" dihapus — sudah dihandle oleh public/welcome.html via vercel.json */}

            <Route path="/login" element={
              <AuthRoute>
                <Login />
              </AuthRoute>
            } />

            <Route path="/forgot-password" element={
              <AuthRoute>
                <ForgotPassword />
              </AuthRoute>
            } />

            <Route path="/register" element={
              <AuthRoute>
                <Register />
              </AuthRoute>
            } />

            <Route path="/dashboard" element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            } />

            <Route path="/profile" element={
              <PrivateRoute>
                <Profile />
              </PrivateRoute>
            } />

            <Route path="/deposit" element={
              <PrivateRoute>
                <Deposit />
              </PrivateRoute>
            } />

            <Route path="/order" element={
              <PrivateRoute>
                <Order />
              </PrivateRoute>
            } />

            <Route path="/history" element={
              <PrivateRoute>
                <History />
              </PrivateRoute>
            } />

            <Route path="/api/dev" element={<Dokumentasi />} />
            <Route path="/referral" element={<Referral />} />
            <Route path="/ketentuan" element={<Ketentuan />} />
            <Route path="/maintenance" element={<Maintenance />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </div>
    </Router>
  );
}

export default App;