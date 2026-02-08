import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Wallet, Activity, User, ShoppingBag } from 'lucide-react';
import { useTheme } from '../context/ThemeContext'; // <--- Import Theme

const BottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { color } = useTheme(); // <--- Pakai color tema

  const isActive = (path) => location.pathname === path;

  // Fungsi helper agar kodingan bersih
  const getIconClass = (path) => {
    return isActive(path) 
      ? `${color.text}` // Warna aktif ikut tema (Hijau/Ungu/Biru)
      : 'text-slate-400 dark:text-slate-500';
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-slate-200 bg-white px-6 py-2 pb-safe dark:border-slate-800 dark:bg-slate-950">
      <div className="relative mx-auto flex max-w-md items-center justify-between">
        
        {/* HOME */}
        <button 
          onClick={() => navigate('/dashboard')}
          className={`flex flex-col items-center gap-1 ${getIconClass('/dashboard')}`}
        >
          <Home size={24} />
          <span className="text-[10px] font-medium">Home</span>
        </button>

        {/* DEPOSIT */}
        <button 
          onClick={() => navigate('/deposit')}
          className={`flex flex-col items-center gap-1 ${getIconClass('/deposit')}`}
        >
          <Wallet size={24} />
          <span className="text-[10px] font-medium">Deposit</span>
        </button>

        {/* ORDER (Tombol Tengah Besar) */}
        <div className="relative -top-6">
          <button 
            onClick={() => navigate('/order')}
            className={`rounded-full border-4 border-slate-50 p-4 shadow-lg transition-all hover:scale-105 dark:border-slate-900 ${color.btn}`}
          >
            <ShoppingBag size={24} />
          </button>
        </div>

        {/* HISTORY */}
        <button 
          onClick={() => navigate('/history')}
          className={`flex flex-col items-center gap-1 ${getIconClass('/history')}`}
        >
          <Activity size={24} />
          <span className="text-[10px] font-medium">Activity</span>
        </button>

        {/* PROFILE */}
        <button 
          onClick={() => navigate('/profile')}
          className={`flex flex-col items-center gap-1 ${getIconClass('/profile')}`}
        >
          <User size={24} />
          <span className="text-[10px] font-medium">Profile</span>
        </button>

      </div>
    </div>
  );
};

export default BottomNav;

