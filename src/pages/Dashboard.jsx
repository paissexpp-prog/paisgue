import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import BottomNav from '../components/BottomNav';
import { Bell, RefreshCw, Smartphone, Globe, Gamepad2, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { jwtDecode } from 'jwt-decode'; // Import ini untuk baca Token

const Dashboard = () => {
  const navigate = useNavigate();
  const { color } = useTheme();
  
  // --- BAGIAN INI RAHASIANYA ---
  // Kita inisialisasi data user langsung dari Token / LocalStorage
  // Jadi tidak perlu menunggu loading, nama langsung muncul!
  const [user, setUser] = useState(() => {
    // 1. Cek apakah ada data user tersimpan di HP?
    const savedUser = localStorage.getItem('user');
    if (savedUser) return JSON.parse(savedUser);

    // 2. Jika tidak ada, Cek Token dan ambil nama dari sana
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded = jwtDecode(token);
        return { 
          username: decoded.username || 'Member', // Ambil nama dari token
          balance: 0 
        };
      } catch (e) { 
        return { username: 'Member', balance: 0 }; 
      }
    }

    // 3. Default jika belum login
    return { username: 'Member', balance: 0 };
  });

  const [loading, setLoading] = useState(true);

  const fetchUserData = async () => {
    try {
      const res = await api.get('/auth/me');
      if (res.data.success) {
        setUser(res.data.data);
        // Simpan data terbaru ke HP biar besok bukanya cepet
        localStorage.setItem('user', JSON.stringify(res.data.data));
      }
    } catch (error) {
      // Silent error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  const formatRupiah = (number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(number);
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-24 transition-colors duration-300 dark:bg-slate-900">
      
      {/* Header */}
      <div className="sticky top-0 z-40 border-b border-slate-100 bg-white/80 px-5 pb-4 pt-12 backdrop-blur-md dark:border-slate-800 dark:bg-slate-950/80">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Avatar otomatis huruf depan Nama (Bukan L lagi) */}
            <div className={`flex h-10 w-10 items-center justify-center rounded-full text-lg font-bold shadow-sm ${color.btn}`}>
              {user.username ? user.username.charAt(0).toUpperCase() : 'U'}
            </div>
            <div>
              {/* Nama User langsung muncul */}
              <h1 className="text-lg font-bold text-slate-800 dark:text-white">{user.username}</h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">Selamat sore 🌤️</p>
            </div>
          </div>
          <div className="flex gap-2">
             <button 
                className="rounded-xl bg-slate-100 p-2 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                onClick={fetchUserData}
             >
                <RefreshCw size={20} className={loading ? "animate-spin" : ""} />
             </button>
             <button className="rounded-xl bg-slate-100 p-2 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700">
                <Bell size={20} />
             </button>
          </div>
        </div>
      </div>

      {/* Card Saldo */}
      <div className="mt-6 px-5">
        <div className="relative overflow-hidden rounded-3xl border border-slate-100 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950">
          <div className="relative z-10 flex justify-between items-start">
            <div>
              <p className="mb-1 text-sm font-medium text-slate-500 dark:text-slate-400">Saldo Kamu</p>
              <h2 className="text-2xl font-bold text-slate-800 dark:text-white">{formatRupiah(user.balance)}</h2>
            </div>
            <button 
              onClick={() => navigate('/deposit')}
              className={`flex items-center gap-1 rounded-xl px-4 py-2 text-sm font-bold shadow-sm transition-transform active:scale-95 ${color.bg} ${color.text}`}
            >
              Top Up
            </button>
          </div>
          
          <div className="relative z-10 mt-6 flex items-center gap-2">
             <span className="flex items-center gap-1 rounded-lg bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400">
                <div className="h-2 w-2 animate-pulse rounded-full bg-emerald-500"></div>
                Online
             </span>
             <span className="text-xs text-slate-400">198ms response server saat ini</span>
          </div>
        </div>
      </div>

      {/* Banner Get Virtual Number */}
      <div className="mt-6 px-5">
        <div className={`relative overflow-hidden rounded-3xl p-6 text-white shadow-lg bg-gradient-to-r ${color.gradient}`}>
           <div className="relative z-10">
              <h3 className="text-lg font-bold">Get Virtual Number</h3>
              <p className="mt-1 mb-4 w-3/4 text-sm text-white/90">OTP access for 1,038+ apps across 193 countries</p>
              
              <div className="mb-2 flex items-center gap-2">
                 <div className="rounded-full bg-white/20 p-1.5"><Smartphone size={16} /></div>
                 <div className="rounded-full bg-white/20 p-1.5"><Globe size={16} /></div>
                 <span className="text-xs font-medium">+99 Apps</span>
              </div>

              <button 
                onClick={() => navigate('/order')}
                className="mt-2 flex items-center gap-1 text-sm font-bold hover:underline"
              >
                Beli Nomor &gt;
              </button>
           </div>
           
           <div className="absolute -bottom-10 -right-5 h-32 w-32 rounded-full bg-white/20 blur-2xl"></div>
        </div>
      </div>

      {/* Lagi Populer */}
      <div className="mt-8 px-5">
        <div className="mb-4 flex items-center justify-between">
           <h3 className="flex items-center gap-2 text-lg font-bold text-slate-800 dark:text-white">🔥 Lagi Populer</h3>
           <button className={`text-sm font-medium ${color.text}`}>Lihat Semua</button>
        </div>

        <div className="grid grid-cols-3 gap-3">
           <div className="flex cursor-pointer flex-col items-center gap-2 rounded-2xl border border-slate-100 bg-white p-3 shadow-sm transition-colors hover:border-slate-300 dark:border-slate-800 dark:bg-slate-950 dark:hover:border-slate-700">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                 <Zap size={24} />
              </div>
              <span className="text-xs font-medium text-slate-700 dark:text-slate-300">DANA</span>
           </div>

           <div className="flex cursor-pointer flex-col items-center gap-2 rounded-2xl border border-slate-100 bg-white p-3 shadow-sm transition-colors hover:border-slate-300 dark:border-slate-800 dark:bg-slate-950 dark:hover:border-slate-700">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400">
                 <Gamepad2 size={24} />
              </div>
              <span className="text-xs font-medium text-slate-700 dark:text-slate-300">Free Fire</span>
           </div>

           <div className="flex cursor-pointer flex-col items-center gap-2 rounded-2xl border border-slate-100 bg-white p-3 shadow-sm transition-colors hover:border-slate-300 dark:border-slate-800 dark:bg-slate-950 dark:hover:border-slate-700">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400">
                  <Smartphone size={24} />
              </div>
              <span className="text-xs font-medium text-slate-700 dark:text-slate-300">WhatsApp</span>
           </div>
        </div>
      </div>

      {/* Pesanan Pending */}
      <div className="mb-6 mt-8 px-5">
         <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-800 dark:text-white">Pesanan Pending</h3>
            <button className={`p-1 ${color.text}`}><RefreshCw size={16}/></button>
         </div>
         
         <div className="rounded-3xl border border-slate-100 bg-white p-8 text-center shadow-sm dark:border-slate-800 dark:bg-slate-950">
            <div className="mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-slate-100 text-4xl dark:bg-slate-900">
               🤷‍♂️
            </div>
            <h4 className="mb-1 font-bold text-slate-800 dark:text-white">Tidak ada pesanan</h4>
            <p className="mb-6 text-sm text-slate-400">Pesanan aktif akan muncul disini</p>
            <button 
              onClick={() => navigate('/order')}
              className={`w-full rounded-xl py-3 text-sm font-medium shadow-sm transition-transform active:scale-95 ${color.btn}`}
            >
              + Buat Pesanan
            </button>
         </div>
      </div>

      <BottomNav />
    </div>
  );
};

export default Dashboard;

