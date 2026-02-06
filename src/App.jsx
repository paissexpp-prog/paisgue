import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext'; // Import Provider Tema
import Navbar from './components/Navbar'; // Import Navbar baru
import Welcome from './pages/Welcome'; // Import Landing Page

import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Deposit from './pages/Deposit';
import History from './pages/History';

function PrivateRoute({ children }) {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login" />;
}

export default function App() {
  return (
    <ThemeProvider> {/* Bungkus aplikasi dengan Tema */}
      <BrowserRouter>
        <div className="min-h-screen bg-slate-900 text-slate-100 font-sans">
          <Navbar /> {/* Navbar selalu muncul */}
          <div className="pt-16"> {/* Padding agar konten tidak tertutup Navbar */}
            <Routes>
              {/* Route Halaman Awal */}
              <Route path="/" element={<Welcome />} />
              
              {/* Auth */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              
              {/* Halaman yang butuh Login */}
              <Route path="/dashboard" element={
                <PrivateRoute><Dashboard /></PrivateRoute>
              } />
              <Route path="/deposit" element={
                <PrivateRoute><Deposit /></PrivateRoute>
              } />
              <Route path="/history" element={
                <PrivateRoute><History /></PrivateRoute>
              } />
            </Routes>
          </div>
        </div>
      </BrowserRouter>
    </ThemeProvider>
  );
}

