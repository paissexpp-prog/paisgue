import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Home, Wallet, Activity, User, ShoppingBag, 
  Headphones, X, Send, MessageCircle, Radio,
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
                            <a href="https://t.me/cs_putra" target="_blank" rel="noreferrer" className="flex items-center gap-3 rounded-2xl bg-slate-800 p-3 hover:bg-slate-700 transition-colors border border-slate-700/50">
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500 text-white shadow-lg shadow-blue-500/20">
                                    <Send size={18} className="-ml-0.5 mt-0.5" />
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-white">CS Telegram</p>
                                    <p className="text-[10px] text-blue-300">Fast Response 24 Jam</p>
                                </div>
                            </a>

                            {/* WA CS — Segera Hadir */}
                            <div className="flex items-center gap-3 rounded-2xl bg-slate-800/50 p-3 border border-slate-700/30 border-dashed relative overflow-hidden">
                                {/* Shimmer subtle */}
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.02] to-transparent pointer-events-none" />
                                
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-500/60 shrink-0">
                                    <MessageCircle size={18} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <p className="text-sm font-bold text-slate-400">CS WhatsApp</p>
                                        <span className="shrink-0 rounded-full bg-amber-500/15 px-2 py-0.5 text-[9px] font-black tracking-wide text-amber-400 uppercase">
                                            Soon
                                        </span>
                                    </div>
                                    <p className="text-[10px] text-slate-600">Sedang disiapkan</p>
                                </div>
                            </div>
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

                            {/* === ITEM BARU: Callback Order & Deposit === */}
                            <a href="https://t.me/priceotp" target="_blank" rel="noreferrer" className="flex items-center gap-3 rounded-2xl bg-slate-800 p-3 hover:bg-slate-700 transition-colors border border-slate-700/50">
                                {/* Icon dengan 2 layer biar keliatan "transparan/harga" */}
                                <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-violet-500 text-white shadow-lg shadow-violet-500/20">
                                    <Send size={15} className="-ml-0.5 mt-0.5" />
                                    <span className="absolute -bottom-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-amber-400 text-slate-900 text-[8px] font-black shadow">
                                        Rp
                                    </span>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-1.5 flex-wrap">
                                        <p className="text-sm font-bold text-white leading-tight">Callback & Harga</p>
                                        <span className="shrink-0 rounded-full bg-violet-500/20 px-1.5 py-0.5 text-[9px] font-black text-violet-300 uppercase tracking-wide">
                                            Transparan
                                        </span>
                                    </div>
                                    <p className="text-[10px] text-violet-300 mt-0.5">Order, Deposit & Info Harga</p>
                                </div>
                                <ExternalLink size={14} className="ml-auto shrink-0 text-slate-500"/>
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
      <div className="fixed bottom-28 right-5 z-50">
        <button 
            onClick={() => setShowSupport(!showSupport)}
            className={`flex h-14 w-14 items-center justify-center rounded-[1.2rem] shadow-xl shadow-blue-900/20 transition-transform active:scale-90 ${color.btn}`}
        >
            {showSupport ? <X size={28} /> : <Headphones size={28} />}
        </button>
      </div>

      {/* =========================================
          NAVBAR UTAMA (FLOATING PILL DENGAN TEMA BIRU)
          ========================================= */}
      <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 w-[92%] max-w-md px-1.5 py-1.5 rounded-full shadow-2xl bg-blue-500 dark:bg-blue-600 ring-1 ring-white/10">
        <div className="flex items-center justify-between sm:justify-around gap-1">
          
          {/* Menu Home */}
          <button 
            onClick={() => navigate('/dashboard')}
            className={`flex flex-col h-[56px] min-w-[64px] flex-1 items-center justify-center rounded-full transition-all duration-300 ease-out gap-0.5 ${
              isActive('/dashboard') ? 'bg-white shadow-sm' : 'bg-transparent hover:bg-white/10'
            }`}
          >
            <div className={`transition-transform duration-300 ${isActive('/dashboard') ? 'scale-105' : 'scale-100'}`}>
              <Home size={22} className={isActive('/dashboard') ? 'text-blue-600 dark:text-blue-600' : 'text-white'}/>
            </div>
            <span className={`text-[10px] tracking-tight transition-opacity duration-300 ${isActive('/dashboard') ? 'font-bold text-blue-600 dark:text-blue-600' : 'font-medium text-white/90'}`}>Home</span>
          </button>

          {/* Menu Deposit */}
          <button 
            onClick={() => navigate('/deposit')}
            className={`flex flex-col h-[56px] min-w-[64px] flex-1 items-center justify-center rounded-full transition-all duration-300 ease-out gap-0.5 ${
              isActive('/deposit') ? 'bg-white shadow-sm' : 'bg-transparent hover:bg-white/10'
            }`}
          >
            <div className={`transition-transform duration-300 ${isActive('/deposit') ? 'scale-105' : 'scale-100'}`}>
              <Wallet size={22} className={isActive('/deposit') ? 'text-blue-600 dark:text-blue-600' : 'text-white'}/>
            </div>
            <span className={`text-[10px] tracking-tight transition-opacity duration-300 ${isActive('/deposit') ? 'font-bold text-blue-600 dark:text-blue-600' : 'font-medium text-white/90'}`}>Deposit</span>
          </button>

          {/* ORDER BUTTON */}
          <button 
            onClick={() => navigate('/order')}
            className={`flex flex-col h-[56px] min-w-[64px] flex-1 items-center justify-center rounded-full transition-all duration-300 ease-out gap-0.5 ${
              isActive('/order') ? 'bg-white shadow-sm' : 'bg-transparent hover:bg-white/10'
            }`}
          >
            <div className={`transition-transform duration-300 ${isActive('/order') ? 'scale-105' : 'scale-100'}`}>
              <ShoppingBag size={22} className={isActive('/order') ? 'text-blue-600 dark:text-blue-600' : 'text-white'}/>
            </div>
            <span className={`text-[10px] tracking-tight transition-opacity duration-300 ${isActive('/order') ? 'font-bold text-blue-600 dark:text-blue-600' : 'font-medium text-white/90'}`}>Order</span>
          </button>

          {/* Menu Activity */}
          <button 
            onClick={() => navigate('/history')}
            className={`flex flex-col h-[56px] min-w-[64px] flex-1 items-center justify-center rounded-full transition-all duration-300 ease-out gap-0.5 ${
              isActive('/history') ? 'bg-white shadow-sm' : 'bg-transparent hover:bg-white/10'
            }`}
          >
            <div className={`transition-transform duration-300 ${isActive('/history') ? 'scale-105' : 'scale-100'}`}>
              <Activity size={22} className={isActive('/history') ? 'text-blue-600 dark:text-blue-600' : 'text-white'}/>
            </div>
            <span className={`text-[10px] tracking-tight transition-opacity duration-300 ${isActive('/history') ? 'font-bold text-blue-600 dark:text-blue-600' : 'font-medium text-white/90'}`}>Activity</span>
          </button>

          {/* Menu Profile */}
          <button 
            onClick={() => navigate('/profile')}
            className={`flex flex-col h-[56px] min-w-[64px] flex-1 items-center justify-center rounded-full transition-all duration-300 ease-out gap-0.5 ${
              isActive('/profile') ? 'bg-white shadow-sm' : 'bg-transparent hover:bg-white/10'
            }`}
          >
            <div className={`transition-transform duration-300 ${isActive('/profile') ? 'scale-105' : 'scale-100'}`}>
              <User size={22} className={isActive('/profile') ? 'text-blue-600 dark:text-blue-600' : 'text-white'}/>
            </div>
            <span className={`text-[10px] tracking-tight transition-opacity duration-300 ${isActive('/profile') ? 'font-bold text-blue-600 dark:text-blue-600' : 'font-medium text-white/90'}`}>Profile</span>
          </button>

        </div>
      </div>
    </>
  );
};

export default BottomNav;