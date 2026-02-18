import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Home, Wallet, Activity, User, ShoppingBag, 
  Headphones, X, Send, MessageCircle, Mail, Radio,
  ExternalLink, Globe
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const BottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { color } = useTheme();
  
  // State UI
  const [showSupport, setShowSupport] = useState(false);
  const [activeTab, setActiveTab] = useState('support'); // 'support' atau 'channel'

  const isActive = (path) => location.pathname === path;

  const getIconClass = (path) => {
    return isActive(path) 
      ? `${color.text}` 
      : 'text-slate-400 dark:text-slate-500';
  };

  return (
    <>
      {/* =========================================
          MODAL MENU (POP UP)
          ========================================= */}
      {showSupport && (
        <div className="fixed inset-0 z-[60] flex items-end justify-end sm:items-center sm:justify-center">
            {/* Backdrop (Klik luar untuk tutup) */}
            <div 
                className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" 
                onClick={() => setShowSupport(false)}
            ></div>

            {/* Content Menu */}
            <div className="relative z-10 mb-24 mr-4 w-72 overflow-hidden rounded-3xl bg-slate-900 p-5 shadow-2xl animate-in slide-in-from-bottom-10 duration-300 border border-slate-700">
                
                {/* Header Title */}
                <div className="mb-4 flex items-center justify-between">
                    <h3 className="font-bold text-white">Pusat Bantuan</h3>
                    <button onClick={() => setShowSupport(false)} className="text-slate-400 hover:text-white">
                        <X size={18} />
                    </button>
                </div>

                {/* TABS SWITCHER (Support / Channel) */}
                <div className="mb-5 flex p-1 rounded-xl bg-slate-800 border border-slate-700">
                    <button 
                        onClick={() => setActiveTab('support')}
                        className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === 'support' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
                    >
                        <Headphones size={14} /> Support
                    </button>
                    <button 
                        onClick={() => setActiveTab('channel')}
                        className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === 'channel' ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
                    >
                        <Radio size={14} /> Channel
                    </button>
                </div>

                {/* ISI KONTEN BERDASARKAN TAB */}
                <div className="space-y-3 min-h-[180px]">
                    
                    {/* === KONTEN TAB: SUPPORT === */}
                    {activeTab === 'support' && (
                        <div className="animate-in fade-in slide-in-from-right-4 duration-300 space-y-3">
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Hubungi Admin</p>
                            
                            {/* CS Telegram */}
                            <a href="https://t.me/cs_ruangotp" target="_blank" rel="noreferrer" className="flex items-center gap-3 rounded-2xl bg-slate-800 p-3 hover:bg-slate-700 transition-colors border border-slate-700/50">
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500 text-white shadow-lg shadow-blue-500/20">
                                    <Send size={18} className="-ml-0.5 mt-0.5" />
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-white">CS Telegram</p>
                                    <p className="text-[10px] text-blue-300">Fast Response 24 Jam</p>
                                </div>
                            </a>

                            {/* Email Support */}
                            <a href="mailto:ruangotp@site" className="flex items-center gap-3 rounded-2xl bg-slate-800 p-3 hover:bg-slate-700 transition-colors border border-slate-700/50">
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-500 text-white shadow-lg shadow-red-500/20">
                                    <Mail size={18} />
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-white">Email Support</p>
                                    <p className="text-[10px] text-red-300">ruangotp@site</p>
                                </div>
                            </a>
                        </div>
                    )}

                    {/* === KONTEN TAB: CHANNEL === */}
                    {activeTab === 'channel' && (
                        <div className="animate-in fade-in slide-in-from-right-4 duration-300 space-y-3">
                             <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Info Update</p>

                            {/* Channel Telegram */}
                            <a href="https://t.me/ruangotp" target="_blank" rel="noreferrer" className="flex items-center gap-3 rounded-2xl bg-slate-800 p-3 hover:bg-slate-700 transition-colors border border-slate-700/50">
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-sky-500 text-white shadow-lg shadow-sky-500/20">
                                    <Radio size={18} />
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-white">Channel Telegram</p>
                                    <p className="text-[10px] text-sky-300">Berita Resmi RuangOTP</p>
                                </div>
                                <ExternalLink size={14} className="ml-auto text-slate-500"/>
                            </a>

                            {/* Channel WhatsApp */}
                            <a href="https://whatsapp.com/channel/0029VbCNWVk84OmIdF16fK2z" target="_blank" rel="noreferrer" className="flex items-center gap-3 rounded-2xl bg-slate-800 p-3 hover:bg-slate-700 transition-colors border border-slate-700/50">
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500 text-white shadow-lg shadow-emerald-500/20">
                                    <MessageCircle size={18} />
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-white">Saluran WhatsApp</p>
                                    <p className="text-[10px] text-emerald-300">Berita resmi aplikasi</p>
                                </div>
                                <ExternalLink size={14} className="ml-auto text-slate-500"/>
                            </a>
                        </div>
                    )}

                </div>

                {/* Footer Status */}
                <div className="mt-4 border-t border-slate-700 pt-3 text-center">
                    <p className="text-[10px] text-slate-500 flex items-center justify-center gap-1">
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                        </span>
                        Admin Online
                    </p>
                </div>
            </div>
        </div>
      )}

      {/* =========================================
          FLOATING BUTTON (HEADSET)
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
          NAVBAR UTAMA (JANGAN DIUBAH)
          ========================================= */}
      <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-slate-200 bg-white px-6 py-2 pb-safe dark:border-slate-800 dark:bg-slate-950">
        <div className="relative mx-auto flex max-w-md items-center justify-between">
          
          <button 
            onClick={() => navigate('/dashboard')}
            className={`flex flex-col items-center gap-1 ${getIconClass('/dashboard')}`}
          >
            <Home size={24} />
            <span className="text-[10px] font-medium">Home</span>
          </button>

          <button 
            onClick={() => navigate('/deposit')}
            className={`flex flex-col items-center gap-1 ${getIconClass('/deposit')}`}
          >
            <Wallet size={24} />
            <span className="text-[10px] font-medium">Deposit</span>
          </button>

          {/* ORDER BUTTON */}
          <div className="relative -top-6">
            <button 
              onClick={() => navigate('/order')}
              className={`rounded-full border-4 border-slate-50 p-4 shadow-lg transition-all hover:scale-105 dark:border-slate-900 ${color.btn}`}
            >
              <ShoppingBag size={24} />
            </button>
          </div>

          <button 
            onClick={() => navigate('/history')}
            className={`flex flex-col items-center gap-1 ${getIconClass('/history')}`}
          >
            <Activity size={24} />
            <span className="text-[10px] font-medium">Activity</span>
          </button>

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

