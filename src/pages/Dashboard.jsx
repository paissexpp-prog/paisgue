import React, { useState, useEffect, useRef } from 'react';
import api from '../utils/api';
import BottomNav from '../components/BottomNav';
import { Bell, RefreshCw, Smartphone, Globe, CheckCircle2, Clock, MessageSquare, Loader2, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { jwtDecode } from 'jwt-decode';

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
          username: decoded.username || 'Member',
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

  // State untuk menyimpan data DNS (Banner Promo)
  const [banners, setBanners] = useState(() => {
    const cachedBanners = localStorage.getItem('ruangotp_dns_cache');
    return cachedBanners ? JSON.parse(cachedBanners) : [];
  });

  // State untuk Layanan Populer
  const [popularServices, setPopularServices] = useState([]);

  // =========================================================
  // STATE BARU: Pesanan Aktif
  // =========================================================
  const [activeOrders, setActiveOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  // Ref untuk cache daftar service (untuk ambil gambar)
  const servicesRef = useRef([]);

  // State dan Ref untuk fungsi Slider Dots (Titik Indikator)
  const [activeBanner, setActiveBanner] = useState(0);
  const sliderRef = useRef(null);

  const fetchUserData = async () => {
    try {
      const res = await api.get('/auth/me');
      if (res.data.success) {
        setUser(res.data.data);
        localStorage.setItem('user', JSON.stringify(res.data.data));
      }
    } catch (error) {
      // Silent error
    } finally {
      setLoading(false);
    }
  };

  // Fungsi untuk mengambil data Banner DNS
  const fetchBanners = async () => {
    try {
      const cachedTime = localStorage.getItem('ruangotp_dns_time');
      const now = Date.now();
      if (!cachedTime || (now - parseInt(cachedTime)) > 300000) {
        const res = await api.get('/dns');
        if (res.data && res.data.success) {
          setBanners(res.data.data);
          localStorage.setItem('ruangotp_dns_cache', JSON.stringify(res.data.data));
          localStorage.setItem('ruangotp_dns_time', now.toString());
        }
      }
    } catch (error) {
      // Silent error
    }
  };

  // Fungsi untuk mengambil Layanan Populer
  const loadPopularServices = async () => {
    const CACHE_KEY = 'otp_services_v12';
    const cachedData = localStorage.getItem(CACHE_KEY);
    
    if (cachedData) {
      try {
        const parsed = JSON.parse(cachedData);
        setPopularServices(parsed.slice(0, 3));
        servicesRef.current = parsed; // simpan ke ref untuk pencarian gambar
        return;
      } catch (e) {}
    }

    try {
      const res = await api.get('/services/list');
      if (res.data && res.data.success) {
        setPopularServices(res.data.data.slice(0, 3));
        servicesRef.current = res.data.data;
        localStorage.setItem(CACHE_KEY, JSON.stringify(res.data.data));
      }
    } catch (err) {}
  };

  // =========================================================
  // FUNGSI BARU: Fetch Pesanan Aktif dari /history/list
  // =========================================================
  const fetchActiveOrders = async () => {
    setOrdersLoading(true);
    try {
      const res = await api.get('/history/list');
      if (res.data.success) {
        // Filter hanya status aktif, ambil 5 terbaru saja
        const aktif = res.data.data
          .filter(order => {
            const s = (order.status || '').toUpperCase();
            return ['ACTIVE', 'PENDING', 'COMPLETED', 'RECEIVED'].includes(s);
          })
          .slice(0, 5);
        setActiveOrders(aktif);
      }
    } catch (err) {
      // Silent error
    } finally {
      setOrdersLoading(false);
    }
  };

  useEffect(() => {
    fetchUserData();
    fetchBanners();
    loadPopularServices();
    fetchActiveOrders();

    // Auto-refresh banner setiap 5 menit
    const bannerInterval = setInterval(() => {
      fetchBanners();
    }, 300000);

    // Auto-refresh pesanan aktif setiap 10 detik
    const orderInterval = setInterval(() => {
      fetchActiveOrders();
    }, 10000);

    return () => {
      clearInterval(bannerInterval);
      clearInterval(orderInterval);
    };
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 4 && hour < 11)  return { text: 'Selamat pagi', emoji: '☀️' };
    if (hour >= 11 && hour < 15) return { text: 'Selamat siang', emoji: '🌤️' };
    if (hour >= 15 && hour < 19) return { text: 'Selamat sore', emoji: '🌅' };
    return { text: 'Selamat malam', emoji: '🌙' };
  };

  const formatRupiah = (number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(number);
  };

  const handleScroll = () => {
    if (sliderRef.current) {
      const scrollLeft = sliderRef.current.scrollLeft;
      const width = sliderRef.current.clientWidth;
      const activeIndex = Math.round(scrollLeft / width);
      setActiveBanner(activeIndex);
    }
  };

  const getOptimizedImage = (url) => {
    if (!url) return "https://cdn-icons-png.flaticon.com/512/1176/1176425.png";
    const cleanUrl = url.replace('https://', '').replace('http://', '');
    return `https://images.weserv.nl/?url=${cleanUrl}&w=80&h=80&fit=contain&output=webp`;
  };

  // =========================================================
  // HELPER BARU: Cari gambar service berdasarkan nama
  // =========================================================
  const getServiceImage = (serviceName) => {
    if (!serviceName) return null;
    const found = servicesRef.current.find(
      s => s.service_name?.toLowerCase() === serviceName.toLowerCase()
    );
    return found?.service_img || null;
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-24 transition-colors duration-300 dark:bg-slate-900">
      
      {/* Header */}
      <div className="sticky top-0 z-40 border-b border-slate-100 bg-white/80 px-5 pb-4 pt-12 backdrop-blur-md dark:border-slate-800 dark:bg-slate-950/80">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`flex h-10 w-10 items-center justify-center rounded-full text-lg font-bold shadow-sm ${color.btn}`}>
              {user.username ? user.username.charAt(0).toUpperCase() : 'U'}
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-800 dark:text-white">{user.username}</h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">{getGreeting().text} {getGreeting().emoji}</p>
            </div>
          </div>
          <div className="flex gap-2">
             <button 
                className="rounded-xl bg-slate-100 p-2 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                onClick={() => {
                  fetchUserData();
                  fetchBanners();
                  loadPopularServices();
                  fetchActiveOrders();
                }}
             >
                <RefreshCw size={20} className={loading ? "animate-spin" : ""} />
             </button>
             <button className="rounded-xl bg-slate-100 p-2 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700">
                <Bell size={20} />
             </button>
          </div>
        </div>
      </div>

      {/* =========================================================
          BANNER DNS / PROMO (SLIDER DENGAN DOTS)
          ========================================================= */}
      {banners.length > 0 && (
        <div className="mt-6 px-5">
          <div 
            ref={sliderRef}
            onScroll={handleScroll}
            className="flex overflow-x-auto snap-x snap-mandatory hide-scrollbar gap-4 pb-1"
          >
            {banners.map((item, index) => (
              <a 
                key={index}
                href={item.link}
                target="_blank"
                rel="noopener noreferrer"
                className="shrink-0 w-full sm:w-80 snap-center overflow-hidden rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 block transition-transform active:scale-95"
              >
                <img 
                  src={item.gambar} 
                  alt={`Promo ${index + 1}`} 
                  className="w-full h-40 object-cover bg-slate-200 dark:bg-slate-800"
                  loading="lazy"
                />
              </a>
            ))}
          </div>

          {banners.length > 1 && (
            <div className="flex justify-center items-center gap-1.5 mt-3">
              {banners.map((_, index) => (
                <div 
                  key={index}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    activeBanner === index 
                      ? 'w-4 bg-slate-800 dark:bg-slate-200' 
                      : 'w-1.5 bg-slate-300 dark:bg-slate-700'
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      )}

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
           <button onClick={() => navigate('/order')} className={`text-sm font-medium ${color.text}`}>Lihat Semua</button>
        </div>

        <div className="grid grid-cols-3 gap-3">
           {popularServices.length > 0 ? (
             popularServices.map((item, index) => (
               <div 
                 key={index}
                 onClick={() => navigate('/order')}
                 className="flex cursor-pointer flex-col items-center gap-2 rounded-2xl border border-slate-100 bg-white p-3 shadow-sm transition-colors hover:border-slate-300 dark:border-slate-800 dark:bg-slate-950 dark:hover:border-slate-700 active:scale-95"
               >
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-50 p-2 dark:bg-slate-900">
                      <img 
                        src={getOptimizedImage(item.service_img)} 
                        alt={item.service_name} 
                        className="h-full w-full object-contain" 
                        loading="lazy" 
                      />
                  </div>
                  <span className="truncate w-full text-center text-xs font-medium text-slate-700 dark:text-slate-300">
                    {item.service_name}
                  </span>
               </div>
             ))
           ) : (
             [1, 2, 3].map((i) => (
               <div key={i} className="flex flex-col items-center gap-2 rounded-2xl border border-slate-100 bg-white p-3 shadow-sm dark:border-slate-800 dark:bg-slate-950">
                  <div className="h-12 w-12 rounded-full bg-slate-100 dark:bg-slate-900 animate-pulse"></div>
                  <div className="h-3 w-16 rounded bg-slate-100 dark:bg-slate-900 animate-pulse"></div>
               </div>
             ))
           )}
        </div>
      </div>

      {/* =========================================================
          PESANAN PENDING — SEKARANG BERFUNGSI
          ========================================================= */}
      <div className="mb-6 mt-8 px-5">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-bold text-slate-800 dark:text-white">Pesanan Pending</h3>
          <button 
            onClick={fetchActiveOrders}
            className={`p-1 ${color.text}`}
          >
            <RefreshCw size={16} className={ordersLoading ? 'animate-spin' : ''} />
          </button>
        </div>

        {/* === LOADING SKELETON === */}
        {ordersLoading ? (
          <div className="space-y-3">
            {[1, 2].map(i => (
              <div key={i} className="h-24 w-full animate-pulse rounded-2xl bg-slate-200 dark:bg-slate-800" />
            ))}
          </div>

        /* === ADA PESANAN AKTIF === */
        ) : activeOrders.length > 0 ? (
          <div className="space-y-3">
            {activeOrders.map((order) => {
              const status = (order.status || '').toUpperCase();
              const isSmsReceived = status === 'COMPLETED' || status === 'RECEIVED';
              const serviceImg = getServiceImage(order.service);

              return (
                <div
                  key={order.order_id}
                  onClick={() => navigate('/order')}
                  className={`cursor-pointer overflow-hidden rounded-2xl border bg-white shadow-sm transition-all active:scale-95 dark:bg-slate-950 ${
                    isSmsReceived
                      ? 'border-emerald-300 dark:border-emerald-700'
                      : 'border-slate-100 dark:border-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-4 p-4">

                    {/* Gambar Layanan */}
                    <div className={`relative flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl p-2 ${
                      isSmsReceived
                        ? 'bg-emerald-50 dark:bg-emerald-900/20'
                        : 'bg-slate-50 dark:bg-slate-900'
                    }`}>
                      {serviceImg ? (
                        <img
                          src={getOptimizedImage(serviceImg)}
                          alt={order.service}
                          className="h-full w-full object-contain"
                          loading="lazy"
                        />
                      ) : (
                        isSmsReceived
                          ? <MessageSquare size={24} className="text-emerald-500" />
                          : <Loader2 size={24} className={`animate-spin ${color.text}`} />
                      )}

                      {/* Dot status di pojok gambar */}
                      <span className={`absolute -right-1 -top-1 flex h-3.5 w-3.5 items-center justify-center rounded-full border-2 border-white dark:border-slate-950 ${
                        isSmsReceived ? 'bg-emerald-500' : 'bg-amber-400'
                      }`} />
                    </div>

                    {/* Info Pesanan */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="truncate font-bold text-slate-800 dark:text-white">
                          {order.service || 'Layanan'}
                        </p>
                        {order.country && (
                          <span className="shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                            {order.country}
                          </span>
                        )}
                      </div>

                      <p className="mt-0.5 font-mono text-sm text-slate-500 dark:text-slate-400 truncate">
                        {order.phone_number || '—'}
                      </p>

                      {/* Badge status */}
                      <div className="mt-1.5">
                        {isSmsReceived ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                            <CheckCircle2 size={10} /> SMS Diterima
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                            <Clock size={10} /> Menunggu SMS
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Ikon panah ke /order */}
                    <ChevronRight size={18} className="shrink-0 text-slate-300 dark:text-slate-600" />
                  </div>
                </div>
              );
            })}

            {/* Tombol lihat semua di bawah list */}
            <button
              onClick={() => navigate('/order')}
              className={`w-full rounded-2xl border py-3 text-sm font-bold transition-all active:scale-95 ${color.bg} ${color.text} ${color.border}`}
            >
              Kelola Semua Pesanan →
            </button>
          </div>

        /* === KOSONG / TIDAK ADA PESANAN === */
        ) : (
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
        )}
      </div>

      <BottomNav />
    </div>
  );
};

export default Dashboard;
