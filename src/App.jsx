import { BrowserRouter, Routes, Route, Link, Navigate, useLocation } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Deposit from './pages/Deposit';
import History from './pages/History';

function Navbar() {
  const location = useLocation();
  const isAuthPage = ['/', '/register'].includes(location.pathname);
  
  if (isAuthPage) return null;

  return (
    <nav className="flex items-center justify-between bg-slate-800 px-6 py-4 shadow-md">
      <div className="text-xl font-bold text-blue-500">RuangOTP</div>
      <div className="flex gap-6 text-sm font-medium">
        <Link to="/dashboard" className="hover:text-blue-400">Order</Link>
        <Link to="/deposit" className="hover:text-blue-400">Deposit</Link>
        <Link to="/history" className="hover:text-blue-400">Riwayat</Link>
        <button 
          onClick={() => { localStorage.clear(); window.location.href = '/'; }} 
          className="text-red-400 hover:text-red-300"
        >
          Logout
        </button>
      </div>
    </nav>
  );
}

function PrivateRoute({ children }) {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/" />;
}

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen">
        <Navbar />
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
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
    </BrowserRouter>
  );
}
