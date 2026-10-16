import React, { useState, useEffect, useRef } from 'react';
import api from '../utils/api';
import BottomNav from '../components/BottomNav';
import { 
  Bell, RefreshCw, Smartphone, Globe, Info, ShieldAlert, 
  FileText, CheckCircle, CheckCircle2, TrendingUp, Megaphone, 
  ChevronRight, Activity, Server, AlertTriangle, Plus, ExternalLink
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { jwtDecode } from 'jwt-decode';

// Helper untuk memvalidasi apakah string adalah URL yang valid (untuk gambar cover pengumuman)
const isValidUrl = (string) => {
  if (!string) return false;
  try {
    new URL(string);
    return string.startsWith('http');
  } catch (_) {
    return false;
  }
};

// Helper untuk mendeteksi dan merender URL di dalam teks menjadi tautan yang bisa diklik dengan desain profesional
const renderMessageWithLinks = (text) => {
  if (!text) return null;
  // Regex untuk mendeteksi http, https, dan format t.me
  const urlRegex = /(https?:\/\/[^\s]+)|(t\.me\/[^\s]+)/gi;
  const parts = [];
  let lastIndex = 0;
  let match;

  while ((match = urlRegex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push({ type: 'text', value: text.slice(lastIndex, match.index) });
    }
    const raw = match[0];
    const href = raw.startsWith('http') ? raw : `https://${raw}`;
    parts.push({ type: 'link', value: raw, href });
    lastIndex = match.index + raw.length;
  }

  if (lastIndex < text.length) {
    parts.push({ type: 'text', value: text.slice(lastIndex) });
  }

  return parts.map((part, index) => {
    if (part.type === 'link') {
      return (
        <a 
          key={index} 
          href={part.href} 
          target="_blank" 
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 rounded-md bg-indigo-50 px-1.5 py-0.5 font-bold text-indigo-600 transition-colors hover:bg-indigo-100 hover:underline dark:bg-indigo-900/30 dark:text-indigo-400 dark:hover:bg-indigo-900/50 break-all"
        >
          {part.value}
          <ExternalLink size={12} className="shrink-0" />
        </a>
      );
    }
    return <span key={index}>{part.value}</span>;
  });
};

const Dashboard = () => {
  const navigate = useNavigate();
  const { color } = useTheme();

  // Inisialisasi data user dari Token / LocalStorage
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) return JSON.parse(savedUser);

    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded = jwtDecode(token);
        return { username: decoded.username || 'Member', balance: 0 };
      } catch (e) { 
        return { username: 'Member', balance: 0 }; 
      }
    }
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

  // STATE: Papan Pengumuman
  const [announcements, setAnnouncements] = useState([]);
  const [announcementsLoading, setAnnouncementsLoading] = useState(true);

  // Ref untuk cache daftar service
  const servicesRef = useRef([]);

  // State dan Ref untuk fungsi Slider Dots (Titik Indikator Banner)
  const [activeBanner, setActiveBanner] = useState(0);
  const sliderRef = useRef(null);

  // =========================================================
  // STATE: MODAL KETENTUAN (TUTORIAL & INFO)
  // =========================================================
  const [showTerms, setShowTerms] = useState(false);
  const [termsTab, setTermsTab] = useState('refund'); // 'refund', 'ketentuan', 'tutorial'
  const [agreedTerms, setAgreedTerms] = useState(false);
  const [showWarningPopup, setShowWarningPopup] = useState(false);

  useEffect(() => {
    // Cek apakah user sudah pernah menyetujui ketentuan di sesi login ini
    const hasAcceptedTerms = localStorage.getItem('ruangotp_terms_accepted');
    if (!hasAcceptedTerms) {
      setShowTerms(true);
    }
  }, []);

  // Fungsi untuk menangani klik Tutup atau Selesai
  const handleAttemptClose = () => {
    if (!agreedTerms) {
      setShowWarningPopup(true);
    } else {
      localStorage.setItem('ruangotp_terms_accepted', 'true');
      setShowTerms(false);
    }
  };
  // =========================================================

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

  const loadPopularServices = async () => {
    const CACHE_KEY = 'otp_services_v12';
    const cachedData = localStorage.getItem(CACHE_KEY);

    if (cachedData) {
      try {
        const parsed = JSON.parse(cachedData);
        setPopularServices(parsed.slice(0, 4)); // Ambil minimal 4 untuk overlapping UI
        servicesRef.current = parsed; 
        return;
      } catch (e) {}
    }

    try {
      const res = await api.get('/services/list');
      if (res.data && res.data.success) {
        setPopularServices(res.data.data.slice(0, 4));
        servicesRef.current = res.data.data;
        localStorage.setItem(CACHE_KEY, JSON.stringify(res.data.data));
      }
    } catch (err) {}
  };

  const fetchAnnouncements = async () => {
    setAnnouncementsLoading(true);
    try {
      const res = await api.get('/info/v2');
      if (res.data && res.data.success) {
        setAnnouncements(res.data.data);
      }
    } catch (err) {
      // Silent error
    } finally {
      setAnnouncementsLoading(false);
    }
  };

  useEffect(() => {
    fetchUserData();
    fetchBanners();
    loadPopularServices();
    fetchAnnouncements();

    const bannerInterval = setInterval(() => {
      if (!document.hidden) fetchBanners();
    }, 300000);

    const announcementInterval = setInterval(() => {
      if (!document.hidden) fetchAnnouncements();
    }, 60000);

    const handleVisibilityChange = () => {
      if (!document.hidden) fetchAnnouncements();
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearInterval(bannerInterval);
      clearInterval(announcementInterval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
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
                  fetchAnnouncements();
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

      {/* Banner DNS / Promo */}
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

      {/* =========================================================
          BANNER GET VIRTUAL NUMBER (Desain SaaS Overlapping Avatars)
          ========================================================= */}
      <div className="mt-6 px-5">
        <div className={`relative overflow-hidden rounded-3xl p-6 shadow-xl bg-gradient-to-r ${color.gradient}`}>
           {/* Abstract Background Elements */}
           <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/20 blur-2xl"></div>
           <div className="absolute -bottom-12 -right-4 h-40 w-40 rounded-full bg-black/10 blur-3xl"></div>

           <div className="relative z-10">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-bold text-white tracking-tight">Get Virtual Number</h3>
                  <p className="mt-1 mb-6 w-11/12 text-sm text-white/90 leading-relaxed font-medium">
                    OTP access for 1,038+ apps across 193 countries
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between">
                 {/* Overlapping Service Icons */}
                 <div className="flex items-center">
                   <div className="flex items-center -space-x-3">
                     {popularServices.length > 0 ? (
                       popularServices.map((item, index) => (
                         <div 
                           key={index} 
                           className="relative flex h-11 w-11 items-center justify-center rounded-full border-2 border-white/30 bg-white/10 backdrop-blur-sm p-2 shadow-sm transition-transform hover:-translate-y-1"
                           style={{ zIndex: 10 - index }}
                         >
                             <img 
                               src={getOptimizedImage(item.service_img)} 
                               alt={item.service_name} 
                               className="h-full w-full object-contain drop-shadow" 
                             />
                         </div>
                       ))
                     ) : (
                       [1, 2, 3, 4].map((i, index) => (
                         <div 
                           key={i} 
                           className="h-11 w-11 rounded-full border-2 border-white/30 bg-white/10 backdrop-blur-sm animate-pulse"
                           style={{ zIndex: 10 - index }}
                         ></div>
                       ))
                     )}
                     
                     {/* Action Button '+' */}
                     <button 
                       onClick={() => navigate('/order')}
                       className="relative z-20 flex h-11 w-11 items-center justify-center rounded-full border-2 border-white bg-white text-slate-800 shadow-lg transition-transform active:scale-90 hover:bg-slate-50"
                     >
                       <Plus size={20} strokeWidth={3} className={color.text} />
                     </button>
                   </div>
                 </div>

                 <div className="text-right">
                   <span className="block text-[10px] font-semibold text-white/70 uppercase tracking-wider">Tersedia</span>
                   <span className="block text-sm font-bold text-white">+99 Layanan</span>
                 </div>
              </div>
           </div>
        </div>
      </div>

      {/* =========================================================
          SYSTEM UPTIME (Desain Standar Industri / SaaS)
          ========================================================= */}
      <div className="mb-6 mt-8 px-5">
        <div className="mb-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
             <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400">
                 <Activity size={18} />
             </div>
             <h3 className="text-base font-bold tracking-tight text-slate-800 dark:text-white">System Uptime</h3>
          </div>
          <span className="flex items-center gap-1.5 rounded-full border border-emerald-200/50 bg-emerald-50 px-2.5 py-1 text-[10px] font-bold text-emerald-600 dark:border-emerald-800/50 dark:bg-emerald-900/20 dark:text-emerald-400">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
            </span>
            System Degraded
          </span>
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-200/60 bg-white shadow-sm dark:border-slate-800/80 dark:bg-slate-900/50">
           <div className="p-5">
             <div className="mb-6 flex items-start justify-between">
                <div>
                   <h4 className="text-3xl font-black tracking-tight text-slate-800 dark:text-white">99.98%</h4>
                   <p className="mt-1 text-xs font-medium text-slate-500 dark:text-slate-400">Average Uptime</p>
                </div>
                <div className="flex gap-5">
                   <div className="flex flex-col items-end">
                      <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                         <Server size={14} />
                         <span className="text-sm font-bold">4</span>
                      </div>
                      <span className="text-[10px] font-medium uppercase tracking-wider text-slate-400">Online</span>
                   </div>
                   <div className="flex flex-col items-end">
                      <div className="flex items-center gap-1.5 text-amber-500 dark:text-amber-500">
                         <AlertTriangle size={14} />
                         <span className="text-sm font-bold">1</span>
                      </div>
                      <span className="text-[10px] font-medium uppercase tracking-wider text-slate-400">Offline</span>
                   </div>
                </div>
             </div>

             {/* Uptime Bars (Grafik) */}
             <div className="flex h-10 w-full items-end justify-between gap-1 sm:gap-1.5">
                {Array.from({ length: 30 }).map((_, i) => {
                   // Simulasi 1 bar merah/kuning karena ada 1 server offline (biar visualnya realistis)
                   const isDegraded = i === 28; // Sengaja ditaruh di akhir-akhir biar kelihatan baru saja down
                   
                   return (
                     <div
                       key={i}
                       className={`group relative h-full w-full rounded-sm transition-colors hover:opacity-80 ${
                         isDegraded 
                           ? 'bg-amber-400 hover:bg-amber-300' 
                           : 'bg-emerald-500 hover:bg-emerald-400'
                       }`}
                     >
                        {/* Tooltip Hover Mikron */}
                        <div className="pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 rounded bg-slate-800 px-2 py-1 text-[9px] font-medium text-white opacity-0 transition-opacity group-hover:opacity-100 dark:bg-slate-700 shadow-md whitespace-nowrap">
                           {isDegraded ? '1 Node Offline' : '100%'}
                        </div>
                     </div>
                   );
                })}
             </div>

             <div className="mt-3 flex items-center justify-between text-[10px] font-medium text-slate-400">
                <span>30 menit lalu</span>
                <span>Saat ini</span>
             </div>
           </div>
           
           {/* Aksen Minimalis Gradasi Bawah */}
           <div className="h-1 w-full bg-gradient-to-r from-emerald-400 via-amber-400 to-emerald-600 opacity-20"></div>
        </div>
      </div>

      {/* Layanan Populer */}
      <div className="mt-8 px-5">
        <div className="mb-5 flex items-center justify-between">
           <div className="flex items-center gap-2.5">
               <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400">
                   <TrendingUp size={18} />
               </div>
               <h3 className="text-base font-bold tracking-tight text-slate-800 dark:text-white">Layanan Populer</h3>
           </div>
           <button onClick={() => navigate('/order')} className={`text-xs font-semibold ${color.text} hover:underline`}>
               Lihat Semua
           </button>
        </div>

        <div className="grid grid-cols-3 gap-3">
           {popularServices.length > 0 ? (
             popularServices.slice(0, 3).map((item, index) => (
               <div 
                 key={index}
                 onClick={() => navigate('/order')}
                 className="group flex cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border border-slate-200/50 bg-white p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:border-blue-500/30 hover:shadow-md dark:border-slate-800/50 dark:bg-slate-900/40 dark:hover:border-blue-500/30 active:scale-95"
               >
                  <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-50 p-3 shadow-inner transition-colors group-hover:bg-blue-50/50 dark:bg-slate-800/80 dark:group-hover:bg-blue-900/20">
                      <img 
                        src={getOptimizedImage(item.service_img)} 
                        alt={item.service_name} 
                        className="h-full w-full object-contain transition-transform duration-300 group-hover:scale-110 drop-shadow-sm" 
                        loading="lazy" 
                      />
                  </div>
                  <span className="w-full truncate text-center text-xs font-semibold tracking-wide text-slate-700 dark:text-slate-300">
                    {item.service_name}
                  </span>
               </div>
             ))
           ) : (
             [1, 2, 3].map((i) => (
               <div key={i} className="flex flex-col items-center gap-3 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/40">
                  <div className="h-14 w-14 rounded-2xl bg-slate-100 dark:bg-slate-800 animate-pulse"></div>
                  <div className="h-3 w-16 rounded bg-slate-100 dark:bg-slate-800 animate-pulse"></div>
               </div>
             ))
           )}
        </div>
      </div>

      {/* PAPAN PENGUMUMAN */}
      <div className="mb-6 mt-8 px-5">
        <div className="mb-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
             <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600 dark:bg-indigo-900/40 dark:text-indigo-400">
                 <Megaphone size={18} />
             </div>
             <h3 className="text-base font-bold tracking-tight text-slate-800 dark:text-white">Papan Pengumuman</h3>
          </div>
          <button 
            onClick={fetchAnnouncements}
            className="rounded-full bg-slate-100 p-1.5 text-slate-500 transition-colors hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700"
          >
            <RefreshCw size={14} className={announcementsLoading ? 'animate-spin' : ''} />
          </button>
        </div>

        {announcementsLoading ? (
          <div className="space-y-4">
            {[1, 2].map(i => (
              <div key={i} className="h-32 w-full animate-pulse rounded-2xl bg-slate-200 dark:bg-slate-800" />
            ))}
          </div>
        ) : announcements.length > 0 ? (
          <div className="space-y-4">
            {announcements.map((item) => {
              const hasValidImage = isValidUrl(item.image);

              return (
                <div
                  key={item.id}
                  className="overflow-hidden rounded-2xl border border-slate-200/60 bg-white shadow-sm transition-all hover:shadow-md dark:border-slate-800/80 dark:bg-slate-900/50"
                >
                  {hasValidImage && (
                    <div className="relative h-40 w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
                      <img
                        src={item.image}
                        alt="Pengumuman"
                        className="h-full w-full object-cover"
                        loading="lazy"
                      />
                    </div>
                  )}
                  <div className="p-4">
                    <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-700 dark:text-slate-300">
                      {renderMessageWithLinks(item.pesan)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center dark:border-slate-700 dark:bg-slate-800/50">
            <Info size={24} className="mx-auto mb-2 text-slate-400" />
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Belum ada pengumuman saat ini.</p>
          </div>
        )}
      </div>

      <BottomNav />

      {/* =========================================================
          MODAL TUTORIAL & INFORMASI (MUNCUL SETELAH LOGIN)
          ========================================================= */}
      {showTerms && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 sm:rounded-3xl rounded-t-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh] sm:max-h-[85vh] animate-in slide-in-from-bottom-10 duration-300">
            
            {/* Modal Header */}
            <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 shrink-0">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 text-slate-800 dark:text-white">
                  <Info size={22} className={color.text} />
                  <h3 className="text-lg font-bold">Tutorial dan Informasi</h3>
                </div>
                <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[10px] font-bold rounded-full flex items-center gap-1">
                  <FileText size={12} /> Penting!
                </span>
              </div>
              <p className="text-xs leading-relaxed text-slate-500 dark:text-slate-400 font-medium">
                Pahami segala informasi yang telah kami berikan serta perhatikan segala syarat dan ketentuan yang berlaku pada website termasuk segala resiko yang anda alami jika akan membeli nomor virtual.
              </p>
            </div>

            {/* Modal Tabs */}
            <div className="flex px-2 pt-2 border-b border-slate-100 dark:border-slate-800 shrink-0">
              <button 
                onClick={() => setTermsTab('refund')}
                className={`flex-1 py-3 text-sm font-bold border-b-2 transition-colors flex items-center justify-center gap-2 ${termsTab === 'refund' ? `${color.border} ${color.text}` : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
              >
                Refund
              </button>
              <button 
                onClick={() => setTermsTab('ketentuan')}
                className={`flex-1 py-3 text-sm font-bold border-b-2 transition-colors flex items-center justify-center gap-2 ${termsTab === 'ketentuan' ? `${color.border} ${color.text}` : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
              >
                Ketentuan
              </button>
              <button 
                onClick={() => setTermsTab('tutorial')}
                className={`flex-1 py-3 text-sm font-bold border-b-2 transition-colors flex items-center justify-center gap-2 ${termsTab === 'tutorial' ? `${color.border} ${color.text}` : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
              >
                Tutorial
              </button>
            </div>

            {/* Modal Content Scrollable Area */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-slate-50/50 dark:bg-slate-950/50">
              
              {termsTab === 'refund' && (
                <>
                  <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden">
                    <div className="bg-slate-50 dark:bg-slate-800/50 px-4 py-3 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2">
                      <ShieldAlert size={16} className="text-slate-600 dark:text-slate-300" />
                      <span className="font-bold text-sm text-slate-700 dark:text-slate-200">Refund Otomatis</span>
                    </div>
                    <div className="p-4 space-y-4">
                      <div className="flex gap-3 items-start">
                        <CheckCircle size={18} className="text-emerald-500 shrink-0 mt-0.5" />
                        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">Pesanan belum pernah menerima SMS ataupun kode verifikasi sebelumnya.</p>
                      </div>
                      <div className="flex gap-3 items-start">
                        <CheckCircle size={18} className="text-emerald-500 shrink-0 mt-0.5" />
                        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">Status orderan bukan resend yang telah menerima SMS ataupun code verifikasi.</p>
                      </div>
                      <div className="flex gap-3 items-start">
                        <CheckCircle size={18} className="text-emerald-500 shrink-0 mt-0.5" />
                        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">Saldo dikembalikan 100% sesuai dengan nominal pembelian nomor tanpa potongan sedikitpun.</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden">
                    <div className="bg-slate-50 dark:bg-slate-800/50 px-4 py-3 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2">
                      <Info size={16} className="text-slate-600 dark:text-slate-300" />
                      <span className="font-bold text-sm text-slate-700 dark:text-slate-200">Refund Manual / Admin</span>
                    </div>
                    <div className="p-4 space-y-4">
                      <div className="flex gap-3 items-start">
                        <CheckCircle size={18} className="text-blue-500 shrink-0 mt-0.5" />
                        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">Mengalami bug sistem error karena maintenance di luar kendali user.</p>
                      </div>
                      <div className="flex gap-3 items-start">
                        <CheckCircle size={18} className="text-blue-500 shrink-0 mt-0.5" />
                        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">Deposit yang tidak masuk otomatis bisa di-refund dengan menghubungi Admin/CS.</p>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {termsTab === 'ketentuan' && (
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-4 space-y-4">
                  <div className="flex gap-3 items-start border-b border-slate-50 dark:border-slate-800 pb-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-red-500 mt-1.5 shrink-0"></div>
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">Penggunaan untuk aktivitas ilegal, penipuan, spam, atau tindakan yang merugikan pihak lain sangat dilarang.</p>
                  </div>
                  <div className="flex gap-3 items-start border-b border-slate-50 dark:border-slate-800 pb-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-red-500 mt-1.5 shrink-0"></div>
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">Setiap akun RuangOTP bersifat personal dan tidak boleh dipindahtangankan atau digunakan bersama.</p>
                  </div>
                  <div className="flex gap-3 items-start">
                    <div className="w-1.5 h-1.5 rounded-full bg-red-500 mt-1.5 shrink-0"></div>
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">Pelanggaran terhadap larangan akan mengakibatkan pemblokiran akun permanen tanpa pengembalian saldo.</p>
                  </div>
                </div>
              )}

              {termsTab === 'tutorial' && (
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-4 space-y-4">
                  <div className="flex gap-3 items-start border-b border-slate-50 dark:border-slate-800 pb-3">
                    <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 flex items-center justify-center text-xs font-bold shrink-0">1</div>
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed"><strong className="text-slate-800 dark:text-slate-200">Isi Saldo (Deposit)</strong><br/>Masuk ke menu Deposit, buat tagihan QRIS, dan bayar. Saldo akan otomatis masuk dalam hitungan detik.</p>
                  </div>
                  <div className="flex gap-3 items-start border-b border-slate-50 dark:border-slate-800 pb-3">
                    <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 flex items-center justify-center text-xs font-bold shrink-0">2</div>
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed"><strong className="text-slate-800 dark:text-slate-200">Beli Nomor</strong><br/>Pergi ke menu Order (Logo Tas di tengah), cari layanan (contoh: WhatsApp), pilih negara, lalu klik Beli.</p>
                  </div>
                  <div className="flex gap-3 items-start">
                    <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 flex items-center justify-center text-xs font-bold shrink-0">3</div>
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed"><strong className="text-slate-800 dark:text-slate-200">Tunggu SMS OTP</strong><br/>Masukkan nomor yang didapat ke aplikasi yang dituju. Tunggu hingga kode OTP muncul di halaman Dashboard / Order ini.</p>
                  </div>
                </div>
              )}
              
            </div>

            {/* Modal Footer Actions */}
            <div className="px-6 py-5 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shrink-0">
              <label className="flex items-center gap-3 cursor-pointer mb-5 group">
                <div className="relative flex items-center justify-center">
                  <input 
                    type="checkbox" 
                    className="peer sr-only"
                    checked={agreedTerms}
                    onChange={(e) => setAgreedTerms(e.target.checked)}
                  />
                  <div className="w-5 h-5 rounded border-2 border-slate-300 dark:border-slate-600 peer-checked:bg-blue-600 peer-checked:border-blue-600 transition-all"></div>
                  <CheckCircle2 size={14} className="absolute text-white opacity-0 peer-checked:opacity-100 transition-opacity" />
                </div>
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">Saya telah membaca semuanya</span>
              </label>

              <div className="flex gap-3">
                <button 
                  onClick={handleAttemptClose}
                  className="flex-1 py-3.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-bold text-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  Tutup
                </button>
                <button 
                  onClick={handleAttemptClose}
                  className={`flex-1 py-3.5 rounded-xl text-white font-bold text-sm flex items-center justify-center gap-2 transition-all ${color.btn} shadow-lg active:scale-95`}
                >
                  Selesai {agreedTerms && <CheckCircle2 size={16} />}
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* =========================================================
          POP-UP PERINGATAN (JIKA BELUM CENTANG)
          ========================================================= */}
      {showWarningPopup && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/60 backdrop-blur-md p-5 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-xs p-6 shadow-2xl border border-slate-100 dark:border-slate-800 flex flex-col items-center text-center animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 bg-amber-100 dark:bg-amber-900/20 rounded-full flex items-center justify-center mb-4 text-amber-600 dark:text-amber-400">
              <ShieldAlert size={32} />
            </div>
            <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">Konfirmasi Diperlukan</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
              Silakan centang kotak <br/> <strong className="text-slate-700 dark:text-slate-300">"Saya telah membaca semuanya"</strong> <br/> terlebih dahulu untuk melanjutkan.
            </p>
            <button 
              onClick={() => setShowWarningPopup(false)}
              className={`w-full py-3.5 rounded-xl text-white font-bold text-sm shadow-lg active:scale-95 ${color.btn}`}
            >
              Mengerti
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

export default Dashboard;
