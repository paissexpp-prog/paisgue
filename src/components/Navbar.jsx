import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { Sun, Moon, Monitor, Palette, LogOut, LayoutDashboard } from 'lucide-react';
import { useState } from 'react';

export default function Navbar() {
  const { mode, setMode, accent, setAccent, color } = useTheme();
  const [showMenu, setShowMenu] = useState(false);
  
  const location = useLocation();
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const isAuthPage = ['/login', '/register'].includes(location.pathname);

  // Helper agar navbar hilang di halaman login/regis jika diinginkan (opsional)
  // if (isAuthPage) return null; 

  return (
    <nav className="fixed top-0 z-50 w-full border-b border-slate-200 bg-white/80 backdrop-blur-md transition-colors dark:border-slate-800 dark:bg-slate-950/80">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        
        {/* LOGO */}
        <Link to="/" className="flex items-center gap-2 text-xl font-bold text-slate-900 dark:text-white">
          <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${color.btn}`}>
            OTP
          </div>
          <span>RuangOTP</span>
        </Link>

        {/* MENU KANAN */}
        <div className="flex items-center gap-4">
          
          {/* SETTING TEMA (Dropdown) */}
          <div className="relative">
            <button 
              onClick={() => setShowMenu(!showMenu)}
              className="flex items-center gap-2 rounded-full border border-slate-200 bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-200 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              <Palette size={14} /> 
              <span className="hidden sm:inline">Tampilan</span>
            </button>

            {/* Dropdown Menu */}
            {showMenu && (
              <div className="absolute right-0 top-12 mt-2 w-56 overflow-hidden rounded-xl border border-slate-200 bg-white p-2 shadow-xl ring-1 ring-black/5 dark:border-slate-800 dark:bg-slate-900">
                
                {/* Bagian 1: Mode Light/Dark/System */}
                <div className="mb-2 border-b border-slate-100 pb-2 dark:border-slate-800">
                  <p className="mb-2 px-2 text-xs font-semibold text-slate-500">Mode</p>
                  <div className="grid grid-cols-3 gap-1">
                    <button 
                      onClick={() => setMode('light')}
                      className={`flex flex-col items-center rounded p-2 text-[10px] ${mode === 'light' ? 'bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-white' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                    >
                      <Sun size={16} className="mb-1"/> Light
                    </button>
                    <button 
                      onClick={() => setMode('dark')}
                      className={`flex flex-col items-center rounded p-2 text-[10px] ${mode === 'dark' ? 'bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-white' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                    >
                      <Moon size={16} className="mb-1"/> Dark
                    </button>
                    <button 
                      onClick={() => setMode('system')}
                      className={`flex flex-col items-center rounded p-2 text-[10px] ${mode === 'system' ? 'bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-white' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                    >
                      <Monitor size={16} className="mb-1"/> System
                    </button>
                  </div>
                </div>

                {/* Bagian 2: Warna Aksen */}
                <div>
                  <p className="mb-2 px-2 text-xs font-semibold text-slate-500">Warna</p>
                  <div className="space-y-1">
                    <button onClick={() => setAccent('blue')} className={`flex w-full items-center gap-3 rounded px-2 py-1.5 text-sm ${accent === 'blue' ? 'bg-slate-100 dark:bg-slate-800' : 'hover:bg-slate-50 dark:hover:bg-slate-800'}`}>
                      <div className="h-4 w-4 rounded-full bg-blue-600"></div> <span className="text-slate-700 dark:text-slate-300">Ocean Blue</span>
                    </button>
                    <button onClick={() => setAccent('emerald')} className={`flex w-full items-center gap-3 rounded px-2 py-1.5 text-sm ${accent === 'emerald' ? 'bg-slate-100 dark:bg-slate-800' : 'hover:bg-slate-50 dark:hover:bg-slate-800'}`}>
                      <div className="h-4 w-4 rounded-full bg-emerald-600"></div> <span className="text-slate-700 dark:text-slate-300">Emerald Green</span>
                    </button>
                    <button onClick={() => setAccent('violet')} className={`flex w-full items-center gap-3 rounded px-2 py-1.5 text-sm ${accent === 'violet' ? 'bg-slate-100 dark:bg-slate-800' : 'hover:bg-slate-50 dark:hover:bg-slate-800'}`}>
                      <div className="h-4 w-4 rounded-full bg-violet-600"></div> <span className="text-slate-700 dark:text-slate-300">Royal Purple</span>
                    </button>
                  </div>
                </div>

              </div>
            )}
          </div>

          {/* User Controls */}
          {token ? (
            <>
              <Link to="/dashboard" className={`hidden rounded-full px-4 py-1.5 text-sm font-medium transition-all sm:block ${color.btn}`}>
                Dashboard
              </Link>
              <button onClick={() => { localStorage.clear(); navigate('/login'); }} className="text-slate-500 hover:text-red-500">
                <LogOut size={20} />
              </button>
            </>
          ) : (
            !isAuthPage && (
              <Link to="/login" className={`rounded-full px-5 py-2 text-sm font-bold transition-all ${color.btn}`}>
                Masuk
              </Link>
            )
          )}
        </div>
      </div>
    </nav>
  );
}

