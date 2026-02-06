import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { Palette } from 'lucide-react';
import { useState } from 'react';

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { theme, setColorTheme, colorTheme } = useTheme();
  const [showColorMenu, setShowColorMenu] = useState(false);
  
  const token = localStorage.getItem('token');
  const isAuthPage = ['/login', '/register'].includes(location.pathname);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  return (
    <nav className="fixed top-0 z-50 w-full border-b border-slate-800 bg-slate-900/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 text-xl font-bold text-white">
          <div className={`h-8 w-8 rounded-lg ${theme.primary} flex items-center justify-center`}>
            OTP
          </div>
          RuangOTP
        </Link>

        {/* Menu Kanan */}
        <div className="flex items-center gap-6">
          {/* Tombol Ganti Tema */}
          <div className="relative">
            <button 
              onClick={() => setShowColorMenu(!showColorMenu)}
              className="flex items-center gap-2 rounded-full border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white"
            >
              <Palette size={14} /> Tema
            </button>
            
            {showColorMenu && (
              <div className="absolute right-0 top-10 mt-2 w-32 overflow-hidden rounded-lg border border-slate-700 bg-slate-800 shadow-xl">
                <button onClick={() => { setColorTheme('blue'); setShowColorMenu(false); }} className="flex w-full items-center gap-2 px-4 py-2 text-sm text-blue-400 hover:bg-slate-700">
                  <div className="h-3 w-3 rounded-full bg-blue-500"></div> Biru
                </button>
                <button onClick={() => { setColorTheme('violet'); setShowColorMenu(false); }} className="flex w-full items-center gap-2 px-4 py-2 text-sm text-violet-400 hover:bg-slate-700">
                  <div className="h-3 w-3 rounded-full bg-violet-500"></div> Ungu
                </button>
                <button onClick={() => { setColorTheme('emerald'); setShowColorMenu(false); }} className="flex w-full items-center gap-2 px-4 py-2 text-sm text-emerald-400 hover:bg-slate-700">
                  <div className="h-3 w-3 rounded-full bg-emerald-500"></div> Hijau
                </button>
              </div>
            )}
          </div>

          {/* Menu Login/Dashboard */}
          {token ? (
            <div className="flex items-center gap-4 text-sm font-medium">
              <Link to="/dashboard" className="text-slate-300 hover:text-white">Dashboard</Link>
              <button onClick={handleLogout} className="text-red-400 hover:text-red-300">Logout</button>
            </div>
          ) : (
             // Jika di halaman Landing Page, munculkan tombol Login
             !isAuthPage && (
               <Link to="/login" className={`rounded px-4 py-2 text-sm font-bold text-white ${theme.primary}`}>
                 Masuk
               </Link>
             )
          )}
        </div>
      </div>
    </nav>
  );
}
