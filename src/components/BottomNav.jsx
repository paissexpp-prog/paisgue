import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Home, Wallet, Activity, User, ShoppingBag, 
  Headphones, X, Send, MessageCircle, Mail, Bot, Radio
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext'; // <--- Import Theme

const BottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { color } = useTheme(); // <--- Pakai color tema
  
  // State untuk membuka/menutup menu support
  const [showSupport, setShowSupport] = useState(false);

  const isActive = (path) => location.pathname === path;

  // Fungsi helper agar kodingan bersih
  const getIconClass = (path) => {
    return isActive(path) 
      ? `${color.text}` // Warna aktif ikut tema (Hijau/Ungu/Biru)
      : 'text-slate-400 dark:text-slate-500';
  };

  return (
    <>
      {/* =========================================
          MODAL SUPPORT (POP UP MENU)
          ========================================= */}
      {showSupport && (
        <div className="fixed inset-0 z-[60] flex items-end justify-end sm:items-center sm:justify-center">
            {/* Backdrop Gelap (Klik untuk tutup) */}
            <div 
                className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" 
                onClick={() => setShowSupport(false)}
            ></div>

            {/* Content Menu */}
            <div className="relative z-10 mb-24 mr-4 w-72 overflow-hidden rounded-3xl bg-slate-900 p-5 shadow-2xl animate-in slide-in-from-bottom-10 duration-300 border border-slate-700">
                
                {/* Header Title */}
                <div className="mb-4 flex items-center justify-between">
                    <h3 className="font-bold text-white">Contact Support</h3>
                    <button onClick={() => setShowSupport(false)} className="text-slate-400 hover:text-white">
                        <X size={18} />
                    </button>
                </div>

                {/* Tabs (Support / Channel / Chatbot) */}
                <div className="mb-5 flex gap-2 rounded-xl bg-slate-800 p-1">
                    <button className="flex-1 rounded-lg bg-white py-2 text-xs font-bold text-slate-900 shadow-sm">
                        <Headphones size={16} className="mx-auto mb-1 text-blue-600"/>
                        Support
                    </button>
                    <button className="flex-1 py-2 text-xs font-medium text-slate-400 hover:text-white">
                        <Radio size={16} className="mx-auto mb-1"/>
                        Channel
                    </button>
                    <button className="flex-1 py-2 text-xs font-medium text-slate-400 hover:text-white">
                        <Bot size={16} className="mx-auto mb-1"/>
                        Chatbot
                    </button>
                </div>

                {/* Contact Options List */}
                <div className="space-y-3">
                    <p className="text-xs font-bold text-slate-400">Contact Options</p>
                    
                    {/* Telegram */}
                    <a href="https://t.me/username_anda" target="_blank" rel="noreferrer" className="flex items-center gap-3 rounded-2xl bg-slate-800 p-3 hover:bg-slate-700 transition-colors">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500 text-white">
                            <Send size={20} className="-ml-0.5 mt-0.5" />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-white">Telegram</p>
                            <p className="text-[10px] text-slate-400">Quick chat support</p>
                        </div>
                    </a>

                    {/* WhatsApp */}
                    <a href="https://wa.me/628xxxx" target="_blank" rel="noreferrer" className="flex items-center gap-3 rounded-2xl bg-slate-800 p-3 hover:bg-slate-700 transition-colors">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500 text-white">
                            <MessageCircle size={20} />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-white">WhatsApp</p>
                            <p className="text-[10px] text-slate-400">Active ( 09:00 - 21:00 )</p>
                        </div>
                    </a>

                    {/* Email */}
                    <a href="mailto:support@ruangotp.com" className="flex items-center gap-3 rounded-2xl bg-slate-800 p-3 hover:bg-slate-700 transition-colors">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-500 text-white">
                            <Mail size={20} />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-white">Email</p>
                            <p className="text-[10px] text-slate-400">help@ruangotp.com</p>
                        </div>
                    </a>
                </div>

                {/* Jam Operasional */}
                <div className="mt-4 border-t border-slate-700 pt-3 text-center">
                    <p className="text-[10px] text-slate-500">🕒 Aktif: 09:00 - 21:00 (Setiap Hari)</p>
                </div>
            </div>
        </div>
      )}

      {/* =========================================
          FLOATING ACTION BUTTON (POJOK KANAN)
          ========================================= */}
      <div className="fixed bottom-24 right-5 z-50">
        <button 
            onClick={() => setShowSupport(!showSupport)}
            className={`flex h-14 w-14 items-center justify-center rounded-[1.2rem] shadow-xl shadow-blue-900/20 transition-transform active:scale-90 ${color.btn}`}
        >
            {showSupport ? <X size={28} /> : <Headphones size={28} />}
        </button>
      </div>

      {/* =========================================
          NAVBAR BAWAH (ORIGINAL)
          ========================================= */}
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
    </>
  );
};

export default BottomNav;

