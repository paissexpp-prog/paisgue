import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import BottomNav from '../components/BottomNav';
import { useTheme } from '../context/ThemeContext';
import { 
  User, LogOut, Wallet, ShoppingBag, Calendar, 
  ChevronRight, Send, MessageCircle, Moon, Sun, 
  CreditCard, Loader2, Copy 
} from 'lucide-react';

export default function Profile() {
  const { isDarkMode, toggleTheme } = useTheme();
  const navigate = useNavigate();
  
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({ orders: 0, deposits: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    setLoading(true);
    try {
      // 1. Ambil Data User
      const resUser = await api.get('/auth/me');
      
      // 2. Ambil History Order
      const resOrders = await api.get('/history/list');
      
      // 3. Ambil History Deposit
      const resDeposits = await api.get('/deposit/history');

      if (resUser.data.success) {
        setUser(resUser.data.data);
      }

      // Hitung total transaksi
      setStats({
        orders: resOrders.data.success ? resOrders.data.data.length : 0,
        deposits: resDeposits.data.success ? resDeposits.data.data.length : 0
      });

    } catch (err) {
      console.error("Gagal memuat profil", err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    if (confirm('Yakin ingin keluar?')) {
      localStorage.removeItem('token');
      navigate('/login');
    }
  };

  const handleCopyId = () => {
    if (user?.id) {
        navigator.clipboard.writeText(user.id);
        alert("ID Pengguna berhasil disalin!");
    }
  };

  // Format Tanggal
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    try {
      return new Date(dateString).toLocaleDateString('id-ID', {
        day: 'numeric', month: 'long', year: 'numeric'
      });
    } catch (e) { return '-'; }
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-28 transition-colors duration-300 dark:bg-slate-900">
      
      {/* --- HEADER --- */}
      <div className="sticky top-0 z-30 bg-white/80 px-5 pt-8 pb-4 backdrop-blur-md border-b border-slate-100 dark:bg-slate-950/80 dark:border-slate-800">
        <h1 className="text-xl font-bold text-slate-800 dark:text-white">Profil Saya</h1>
      </div>

      <div className="px-5 mt-6 space-y-6">
        
        {/* 1. KARTU USER (Gradient) */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 to-slate-800 p-6 text-white shadow-xl dark:from-blue-900 dark:to-slate-950">
          <div className="relative z-10 flex items-center gap-4">
            {/* Avatar */}
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-white/10 backdrop-blur-sm text-2xl font-bold border border-white/20">
              {loading ? <Loader2 className="animate-spin" /> : user?.username?.charAt(0).toUpperCase()}
            </div>
            
            {/* Info User */}
            <div className="flex-1 min-w-0">
              {loading ? (
                <div className="space-y-2">
                  <div className="h-4 w-32 bg-white/20 rounded animate-pulse"></div>
                  <div className="h-3 w-24 bg-white/20 rounded animate-pulse"></div>
                </div>
              ) : (
                <>
                  <h2 className="text-lg font-bold truncate">{user?.username}</h2>
                  <p className="text-sm text-slate-300 truncate">{user?.email}</p>
                  
                  {/* ID & COPY BUTTON (BARU) */}
                  <div className="mt-2 flex flex-wrap gap-2">
                      <button 
                        onClick={handleCopyId}
                        className="flex items-center gap-2 rounded-lg bg-black/30 px-2 py-1 text-[10px] text-slate-200 hover:bg-black/50 transition-colors border border-white/10"
                      >
                        <span className="font-mono opacity-80">ID: {user?.id}</span>
                        <Copy size={10} />
                      </button>
                  </div>

                  <div className="mt-1 flex items-center gap-1.5 text-[10px] text-slate-400">
                    <Calendar size={10} />
                    Terdaftar: {formatDate(user?.created_at)}
                  </div>
                </>
              )}
            </div>
          </div>
          
          {/* Dekorasi Background */}
          <div className="absolute -right-4 -bottom-4 text-white/5 rotate-12 pointer-events-none">
            <User size={120} />
          </div>
        </div>

        {/* 2. STATISTIK (3 Grid) */}
        <div className="grid grid-cols-3 gap-3">
           {/* Saldo */}
           <div className="rounded-2xl bg-white p-3 border border-slate-100 shadow-sm flex flex-col items-center justify-center text-center dark:bg-slate-950 dark:border-slate-800">
              <div className="mb-2 p-2 rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20">
                <Wallet size={18} />
              </div>
              <p className="text-[10px] text-slate-400">Sisa Saldo</p>
              <p className="text-xs font-bold text-slate-800 dark:text-white truncate w-full">
                {loading ? '...' : `Rp ${user?.balance?.toLocaleString('id-ID')}`}
              </p>
           </div>

           {/* Total Order */}
           <div className="rounded-2xl bg-white p-3 border border-slate-100 shadow-sm flex flex-col items-center justify-center text-center dark:bg-slate-950 dark:border-slate-800">
              <div className="mb-2 p-2 rounded-full bg-blue-50 text-blue-600 dark:bg-blue-900/20">
                <ShoppingBag size={18} />
              </div>
              <p className="text-[10px] text-slate-400">Total Order</p>
              <p className="text-xs font-bold text-slate-800 dark:text-white">
                {loading ? '...' : `${stats.orders}x`}
              </p>
           </div>

           {/* Total Deposit */}
           <div className="rounded-2xl bg-white p-3 border border-slate-100 shadow-sm flex flex-col items-center justify-center text-center dark:bg-slate-950 dark:border-slate-800">
              <div className="mb-2 p-2 rounded-full bg-purple-50 text-purple-600 dark:bg-purple-900/20">
                <CreditCard size={18} />
              </div>
              <p className="text-[10px] text-slate-400">Deposit</p>
              <p className="text-xs font-bold text-slate-800 dark:text-white">
                {loading ? '...' : `${stats.deposits}x`}
              </p>
           </div>
        </div>

        {/* 3. KONTAK & SUPPORT */}
        <div>
          <h3 className="mb-3 px-1 text-sm font-bold text-slate-500 dark:text-slate-400">Pusat Bantuan</h3>
          <div className="overflow-hidden rounded-2xl bg-white border border-slate-100 shadow-sm dark:bg-slate-950 dark:border-slate-800">
            
            {/* Saluran Telegram */}
            <a 
              href="https://t.me/ruangotp" 
              target="_blank" 
              rel="noreferrer"
              className="flex items-center justify-between p-4 transition-colors hover:bg-slate-50 dark:hover:bg-slate-900 border-b border-slate-100 dark:border-slate-800"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/30">
                  <Send size={18} className="-ml-0.5 mt-0.5" />
                </div>
                <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Saluran Telegram</span>
              </div>
              <ChevronRight size={18} className="text-slate-400" />
            </a>

            {/* Contact CS */}
            <a 
              href="https://t.me/cs_ruangotp" 
              target="_blank" 
              rel="noreferrer"
              className="flex items-center justify-between p-4 transition-colors hover:bg-slate-50 dark:hover:bg-slate-900"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30">
                  <MessageCircle size={18} />
                </div>
                <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Hubungi CS</span>
              </div>
              <ChevronRight size={18} className="text-slate-400" />
            </a>

          </div>
        </div>

        {/* 4. PENGATURAN APLIKASI */}
        <div>
          <h3 className="mb-3 px-1 text-sm font-bold text-slate-500 dark:text-slate-400">Aplikasi</h3>
          <div className="overflow-hidden rounded-2xl bg-white border border-slate-100 shadow-sm dark:bg-slate-950 dark:border-slate-800">
            
            {/* Ganti Tema */}
            <button 
              onClick={toggleTheme} 
              className="w-full flex items-center justify-between p-4 transition-colors hover:bg-slate-50 dark:hover:bg-slate-900 border-b border-slate-100 dark:border-slate-800"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                  {isDarkMode ? <Moon size={18} /> : <Sun size={18} />}
                </div>
                <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
                  Mode Gelap
                </span>
              </div>
              <div className={`relative h-6 w-11 rounded-full transition-colors ${isDarkMode ? 'bg-blue-600' : 'bg-slate-200'}`}>
                <div className={`absolute top-1 left-1 h-4 w-4 rounded-full bg-white transition-transform ${isDarkMode ? 'translate-x-5' : 'translate-x-0'}`}></div>
              </div>
            </button>

            {/* Logout */}
            <button 
              onClick={handleLogout}
              className="w-full flex items-center justify-between p-4 transition-colors hover:bg-red-50 dark:hover:bg-red-900/10 group"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-red-100 text-red-600 dark:bg-red-900/30 group-hover:bg-red-200 dark:group-hover:bg-red-900/50 transition-colors">
                  <LogOut size={18} className="ml-0.5" />
                </div>
                <span className="text-sm font-medium text-red-600 dark:text-red-400">Keluar Akun</span>
              </div>
            </button>

          </div>
        </div>

      </div>

      <BottomNav />
    </div>
  );
}

