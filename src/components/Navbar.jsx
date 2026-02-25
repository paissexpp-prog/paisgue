import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { Sun, Moon, Monitor, Palette, LogOut, Menu, X, Home, ShoppingBag, Wallet, Activity, User, Code2, FileText } from 'lucide-react';
import { useState } from 'react';

export default function Navbar() {
  const { mode, setMode, accent, setAccent, color } = useTheme();
  const [showMenu, setShowMenu] = useState(false);
  const [showSideMenu, setShowSideMenu] = useState(false);
  
  const location = useLocation();
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const isAuthPage = ['/login', '/register'].includes(location.pathname);

  // Helper agar navbar hilang di halaman login/regis jika diinginkan
  // if (isAuthPage) return null; 

  const handleSideNav = (path) => {
    navigate(path);
    setShowSideMenu(false);
  };

  return (
    <>
      <nav className="fixed top-0 z-50 w-full border-b border-slate-200 bg-white/80 backdrop-blur-md transition-colors dark:border-slate-800 dark:bg-slate-950/80">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          
          {/* LOGO UTAMA (DENGAN GAMBAR) */}
          <Link to="/" className="flex items-center gap-3 group">
            {/* Gambar Logo */}
            <img 
              src="https://cdn.nekohime.site/file/HsGrgzQf.jpeg" 
              alt="RuangOTP Logo" 
              className="h-10 w-10 rounded-full object-cover shadow-sm border border-slate-200 dark:border-slate-700 transition-transform group-hover:scale-105"
            />
            {/* Teks Logo (Warna menyesuaikan tema) */}
            <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
              RuangOTP
            </span>
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

                {/* =============================================
                    TOMBOL HAMBURGER MENU (BARU)
                    ============================================= */}
                <button 
                  onClick={() => setShowSideMenu(true)}
                  className="rounded-xl border border-slate-200 bg-slate-100 p-2 text-slate-600 transition-colors hover:bg-slate-200 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  <Menu size={20} />
                </button>

                <button onClick={() => { localStorage.clear(); navigate('/login'); }} className="text-slate-500 hover:text-red-500 transition-colors">
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

      {/* =============================================
          SIDE MENU PANEL (SLIDE DARI KIRI)
          ============================================= */}
      {showSideMenu && (
        <>
          {/* Backdrop Overlay - klik untuk tutup */}
          <div 
            className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm"
            onClick={() => setShowSideMenu(false)}
          />
          
          {/* Panel Slide - tidak full screen, maks 320px */}
          <div className="fixed left-0 top-0 z-[70] flex h-full w-4/5 max-w-xs flex-col bg-slate-900 shadow-2xl">
            
            {/* Header Panel */}
            <div className="flex items-center justify-between border-b border-slate-700/60 px-6 py-5">
              <h2 className="text-lg font-black uppercase tracking-widest text-white">Menu</h2>
              <button 
                onClick={() => setShowSideMenu(false)}
                className="rounded-full p-2 text-slate-400 transition-colors hover:bg-slate-800 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>

            {/* Isi Menu (Scrollable) */}
            <div className="flex-1 overflow-y-auto px-4 py-5 space-y-1">

              <button 
                onClick={() => handleSideNav('/dashboard')} 
                className="flex w-full items-center gap-4 rounded-xl px-4 py-3.5 text-left text-slate-300 transition-colors hover:bg-slate-800 hover:text-white"
              >
                <Home size={20} className="shrink-0" />
                <span className="font-semibold">Dashboard</span>
              </button>

              <button 
                onClick={() => handleSideNav('/order')} 
                className="flex w-full items-center gap-4 rounded-xl px-4 py-3.5 text-left text-slate-300 transition-colors hover:bg-slate-800 hover:text-white"
              >
                <ShoppingBag size={20} className="shrink-0" />
                <span className="font-semibold">Order / Layanan</span>
              </button>

              <button 
                onClick={() => handleSideNav('/deposit')} 
                className="flex w-full items-center gap-4 rounded-xl px-4 py-3.5 text-left text-slate-300 transition-colors hover:bg-slate-800 hover:text-white"
              >
                <Wallet size={20} className="shrink-0" />
                <span className="font-semibold">Deposit</span>
              </button>

              <button 
                onClick={() => handleSideNav('/history')} 
                className="flex w-full items-center gap-4 rounded-xl px-4 py-3.5 text-left text-slate-300 transition-colors hover:bg-slate-800 hover:text-white"
              >
                <Activity size={20} className="shrink-0" />
                <span className="font-semibold">Aktivitas</span>
              </button>

              <button 
                onClick={() => handleSideNav('/profile')} 
                className="flex w-full items-center gap-4 rounded-xl px-4 py-3.5 text-left text-slate-300 transition-colors hover:bg-slate-800 hover:text-white"
              >
                <User size={20} className="shrink-0" />
                <span className="font-semibold">Profil</span>
              </button>

              {/* === SECTION LAINNYA === */}
              <div className="pt-5">
                <p className="mb-3 px-4 text-[10px] font-black uppercase tracking-widest text-slate-500">
                  Lainnya
                </p>

                <button 
                  onClick={() => handleSideNav('/ketentuan')} 
                  className="flex w-full items-center gap-4 rounded-xl px-4 py-3.5 text-left text-slate-300 transition-colors hover:bg-slate-800 hover:text-white"
                >
                  <FileText size={20} className="shrink-0" />
                  <span className="font-semibold">Ketentuan</span>
                </button>

                <button 
                  onClick={() => handleSideNav('/api/dev')} 
                  className="flex w-full items-center gap-4 rounded-xl px-4 py-3.5 text-left text-slate-300 transition-colors hover:bg-slate-800 hover:text-white"
                >
                  <Code2 size={20} className="shrink-0" />
                  <span className="font-semibold">Api Dokumentasi</span>
                </button>
              </div>
            </div>

            {/* Footer: Tema Toggle */}
            <div className="border-t border-slate-700/60 px-4 py-4">
              <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-4">
                  <Moon size={20} className="shrink-0 text-slate-400" />
                  <span className="font-semibold text-slate-300">Tema</span>
                </div>
                {/* Toggle Dark/Light Mode */}
                <button
                  onClick={() => setMode(mode === 'dark' ? 'light' : 'dark')}
                  className={`relative inline-flex h-7 w-14 items-center rounded-full transition-colors duration-300 ${
                    mode === 'dark' ? 'bg-slate-600' : 'bg-slate-700'
                  }`}
                >
                  <span 
                    className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition-transform duration-300 ${
                      mode === 'dark' ? 'translate-x-8' : 'translate-x-1'
                    }`} 
                  />
                </button>
              </div>
            </div>

          </div>
        </>
      )}
    </>
  );
}
