import React, { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import NetworkOverlay from './components/NetworkOverlay';
import OwnerNotification from './components/OwnerNotification'; // IMPORT KOMPONEN BARU

// Lazy Loading Pages
const Welcome = lazy(() => import('./pages/Welcome'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Profile = lazy(() => import('./pages/Profile'));
const Deposit = lazy(() => import('./pages/Deposit'));
const History = lazy(() => import('./pages/History'));
const Order = lazy(() => import('./pages/Order'));
const NotFound = lazy(() => import('./pages/NotFound'));
// HALAMAN BARU: Reset Password
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));

// HALAMAN BARU: Dokumentasi API
const Dokumentasi = lazy(() => import('./pages/Dokumentasi'));
// HALAMAN BARU: Ketentuan Layanan
const Ketentuan = lazy(() => import('./pages/Ketentuan'));

// HALAMAN BARU: Maintenance Mode
const Maintenance = lazy(() => import('./pages/Maintenance'));
// HALAMAN BARU: Referral / Dapatkan Saldo Gratis
const Referral = lazy(() => import('./pages/Referral'));

const PageLoader = () => (
  <div className="flex min-h-[80vh] items-center justify-center bg-slate-50 dark:bg-slate-900">
    <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
  </div>
);

const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  const sessionStart = localStorage.getItem('session_start');

  if (token) {
    if (!sessionStart) {
      // Jika baru login dan belum ada waktu mulai, set waktu sekarang
      localStorage.setItem('session_start', Date.now().toString());
    } else {
      // Cek apakah sudah lewat 48 jam (48 jam = 172.800.000 milidetik)
      const isExpired = Date.now() - parseInt(sessionStart, 10) > 172800000;
      if (isExpired) {
        localStorage.clear();
        return <Navigate to="/login" replace />;
      }
    }
    return children;
  }
  return <Navigate to="/login" replace />;
};

const AuthRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  const sessionStart = localStorage.getItem('session_start');

  if (token) {
    // Kalau dia punya token, tapi tokennya udah expired (2 hari), biarkan dia masuk ke halaman login
    if (sessionStart) {
      const isExpired = Date.now() - parseInt(sessionStart, 10) > 172800000;
      if (isExpired) {
        localStorage.clear();
        return children;
      }
    }
    return <Navigate to="/dashboard" replace />;
  }
  return children;
};

function App() {
  return (
    <Router>
      {/* OVERLAY OFFLINE — Global */}
      <NetworkOverlay />

      {/* NOTIFIKASI OWNER — Global, pojok kiri atas */}
      <OwnerNotification />
      
      <Navbar /> 
      
      <div className="pt-16">
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<Welcome />} />

            <Route path="/login" element={
              <AuthRoute>
                <Login />
              </AuthRoute>
            } />

            {/* RUTEN BARU: FORGOT / RESET PASSWORD */}
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

            {/* RUTEN BARU: DOKUMENTASI API (SEKARANG BISA DIAKSES PUBLIK) */}
            <Route path="/api/dev" element={<Dokumentasi />} />

            {/* RUTEN REFERRAL: SEKARANG PUBLIK — login check dilakukan di dalam komponen */}
            <Route path="/referral" element={<Referral />} />

            {/* KETENTUAN LAYANAN: Bisa diakses tanpa login */}
            <Route path="/ketentuan" element={<Ketentuan />} />

            {/* MAINTENANCE MODE: Bisa diakses tanpa login */}
            <Route path="/maintenance" element={<Maintenance />} />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </div>
    </Router>
  );
}

export default App;
