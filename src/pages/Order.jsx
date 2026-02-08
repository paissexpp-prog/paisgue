import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import BottomNav from '../components/BottomNav';
import { useTheme } from '../context/ThemeContext';
import { Search, ServerCrash, RefreshCw } from 'lucide-react';

export default function Order() {
  const { color } = useTheme();
  const navigate = useNavigate();
  
  const [services, setServices] = useState([]);
  const [filteredServices, setFilteredServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isUsingCache, setIsUsingCache] = useState(false);

  // Kunci untuk LocalStorage
  const CACHE_KEY = 'otp_services_data';
  const CACHE_TIME = 'otp_services_time';
  const CACHE_DURATION = 60 * 60 * 1000; // 1 Jam (dalam milidetik)

  useEffect(() => {
    fetchServices();
  }, []);

  // Filter pencarian real-time
  useEffect(() => {
    const results = services.filter(service =>
      service.service_name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredServices(results);
  }, [searchTerm, services]);

  const fetchServices = async (forceRefresh = false) => {
    setLoading(true);
    
    // 1. CEK CACHE DULU
    const cachedData = localStorage.getItem(CACHE_KEY);
    const cachedTime = localStorage.getItem(CACHE_TIME);
    const now = Date.now();

    if (!forceRefresh && cachedData && cachedTime && (now - cachedTime < CACHE_DURATION)) {
      // Jika ada cache & belum expired (1 jam), pakai data lama
      const parsedData = JSON.parse(cachedData);
      setServices(parsedData);
      setFilteredServices(parsedData);
      setIsUsingCache(true);
      setLoading(false);
      console.log("Menggunakan data cache lokal (Hemat Kuota)");
      return; 
    }

    // 2. JIKA TIDAK ADA CACHE / EXPIRED / FORCE REFRESH: AMBIL DARI API
    try {
      const res = await api.get('/services/list');
      if (res.data.success) {
        const data = res.data.data;
        
        // Simpan ke State
        setServices(data);
        setFilteredServices(data);
        
        // Simpan ke Cache LocalStorage
        localStorage.setItem(CACHE_KEY, JSON.stringify(data));
        localStorage.setItem(CACHE_TIME, now);
        
        setIsUsingCache(false);
      }
    } catch (err) {
      console.error("Gagal mengambil layanan", err);
    } finally {
      setLoading(false);
    }
  };

  // Fungsi saat layanan diklik
  const handleSelectService = (service) => {
    // Navigasi ke halaman pemilihan negara (kita buat nanti)
    // Kita kirim ID Service lewat URL atau State
    // Contoh: /order/countries?service_code=13&name=WhatsApp
    alert(`Anda memilih: ${service.service_name} (ID: ${service.service_code})`);
    // navigate(`/order/countries?service_id=${service.service_code}`); 
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-24 transition-colors duration-300 dark:bg-slate-900">
      
      {/* Header Sticky */}
      <div className="sticky top-0 z-40 border-b border-slate-100 bg-white/90 px-5 pt-6 pb-4 backdrop-blur-md dark:border-slate-800 dark:bg-slate-950/90">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-slate-800 dark:text-white">Pilih Layanan</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {loading ? 'Memuat...' : `${services.length} Aplikasi Tersedia`}
            </p>
          </div>
          {/* Tombol Refresh Cache Manual */}
          <button 
            onClick={() => fetchServices(true)}
            className="rounded-full bg-slate-100 p-2 text-slate-600 transition-colors hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
          >
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Cari aplikasi (WhatsApp, Telegram...)" 
            className={`w-full rounded-xl border bg-slate-50 py-3 pl-10 pr-4 text-sm font-medium text-slate-800 outline-none transition-all focus:bg-white focus:ring-2 dark:bg-slate-900 dark:text-white dark:focus:bg-slate-950 ${color.border} ${color.ring}`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Konten Grid Layanan */}
      <div className="px-5 mt-4">
        {loading ? (
          // Skeleton Loading Animation
          <div className="grid grid-cols-4 gap-4">
            {[...Array(12)].map((_, i) => (
              <div key={i} className="flex flex-col items-center gap-2">
                <div className="h-14 w-14 animate-pulse rounded-2xl bg-slate-200 dark:bg-slate-800"></div>
                <div className="h-3 w-12 animate-pulse rounded bg-slate-200 dark:bg-slate-800"></div>
              </div>
            ))}
          </div>
        ) : filteredServices.length > 0 ? (
          <div className="grid grid-cols-4 gap-x-2 gap-y-6 sm:grid-cols-5 md:grid-cols-6">
            {filteredServices.map((item) => (
              <button 
                key={item.service_code}
                onClick={() => handleSelectService(item)}
                className="group flex flex-col items-center gap-2 transition-transform active:scale-95"
              >
                <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-white p-2 shadow-sm border border-slate-100 transition-all group-hover:shadow-md dark:border-slate-800 dark:bg-slate-800">
                  <img 
                    src={item.service_img} 
                    alt={item.service_name}
                    className="h-full w-full object-contain rounded-lg"
                    loading="lazy" // Native Lazy Loading Browser
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "https://cdn-icons-png.flaticon.com/512/1176/1176425.png"; // Fallback Icon jika gambar error
                    }}
                  />
                </div>
                <span className="truncate w-full text-center text-[10px] font-medium text-slate-600 group-hover:text-slate-900 dark:text-slate-400 dark:group-hover:text-white">
                  {item.service_name}
                </span>
              </button>
            ))}
          </div>
        ) : (
          // Tampilan jika pencarian kosong
          <div className="mt-10 text-center">
            <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
              <ServerCrash size={32} className="text-slate-400" />
            </div>
            <h3 className="font-bold text-slate-800 dark:text-white">Tidak ditemukan</h3>
            <p className="text-xs text-slate-500">Coba kata kunci lain</p>
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
