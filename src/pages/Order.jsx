import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import BottomNav from '../components/BottomNav';
import { useTheme } from '../context/ThemeContext';
import { Search, Wifi, X, ShoppingBag, Trash2, Repeat, ChevronLeft, MapPin } from 'lucide-react';

export default function Order() {
  const { color } = useTheme();
  const navigate = useNavigate();
  
  // --- STATE ---
  const [services, setServices] = useState([]);
  const [filteredServices, setFilteredServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Info User
  const [balance, setBalance] = useState(0);
  const [ping, setPing] = useState(0);
  const [activeOrder, setActiveOrder] = useState(null);

  // Drawer Negara
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const [countries, setCountries] = useState([]);
  const [loadingCountries, setLoadingCountries] = useState(false);

  // Cache System
  const CACHE_KEY = 'otp_services_v4'; // Versi baru biar fresh
  const CACHE_TIME = 'otp_services_time_v4';

  useEffect(() => {
    fetchInitialData();
  }, []);

  // Filter Search Real-time
  useEffect(() => {
    const results = services.filter(service =>
      service.service_name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredServices(results);
  }, [searchTerm, services]);

  // 1. FETCH DATA (Saldo, Ping, Order, Services)
  const fetchInitialData = async () => {
    setLoading(true);
    const start = Date.now();

    // Ambil Saldo
    try {
      const resUser = await api.get('/auth/me');
      if (resUser.data.success) setBalance(resUser.data.data.balance);
    } catch (e) {}

    // Hitung Ping
    setPing(Date.now() - start);

    // Cek Active Order (Pending)
    try {
      const resHist = await api.get('/history/list'); 
      if (resHist.data.success) {
         // Cari yang statusnya ACTIVE / PENDING
         const pending = resHist.data.data.find(o => o.status === 'ACTIVE' || o.status === 'PENDING');
         setActiveOrder(pending || null);
      }
    } catch (e) {}

    // Ambil Services (Cache First)
    const cachedData = localStorage.getItem(CACHE_KEY);
    const cachedTime = localStorage.getItem(CACHE_TIME);
    const now = Date.now();

    if (cachedData && cachedTime && (now - cachedTime < 3600000)) { // 1 Jam
      const parsed = JSON.parse(cachedData);
      setServices(parsed);
      setFilteredServices(parsed);
      setLoading(false);
    } else {
      try {
        const res = await api.get('/services/list');
        if (res.data.success) {
          setServices(res.data.data);
          setFilteredServices(res.data.data);
          localStorage.setItem(CACHE_KEY, JSON.stringify(res.data.data));
          localStorage.setItem(CACHE_TIME, now);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
  };

  // 2. KLIK LAYANAN -> BUKA DRAWER NEGARA
  const handleServiceClick = async (service) => {
    setSelectedService(service);
    setIsDrawerOpen(true);
    setCountries([]); 
    setLoadingCountries(true);

    try {
      // FIX: Gunakan service_code (bukan id)
      const res = await api.get(`/countries/list?service_id=${service.service_code}`);
      if (res.data.success) {
        setCountries(res.data.data);
      }
    } catch (err) {
      console.error("Gagal ambil negara", err);
    } finally {
      setLoadingCountries(false);
    }
  };

  // 3. FIX GAMBAR (Proxy Image)
  const getOptimizedImage = (url) => {
    if (!url) return "https://cdn-icons-png.flaticon.com/512/1176/1176425.png";
    const cleanUrl = url.replace('https://', '').replace('http://', '');
    return `https://images.weserv.nl/?url=${cleanUrl}&w=80&h=80&fit=contain&output=webp`;
  };

  // 4. BATAL ORDER
  const handleCancelOrder = async () => {
    if (!activeOrder) return;
    if (confirm('Batalkan pesanan ini? Saldo akan dikembalikan.')) {
        // Panggil API Cancel (Simulasi visual dulu, backend sudah handle di worker)
        // Idealnya panggil endpoint cancel disini
        setActiveOrder(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-32 transition-colors duration-300 dark:bg-slate-900">
      
      {/* --- HEADER DATA CENTER & SALDO --- */}
      <div className="sticky top-0 z-30 bg-white/90 px-5 pt-8 pb-4 backdrop-blur-md dark:bg-slate-950/90">
        
        {/* Baris Atas: Back & Title */}
        <div className="mb-4 flex items-center gap-3">
            <button onClick={() => navigate('/dashboard')} className="rounded-full bg-slate-100 p-2 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                <ChevronLeft size={20} />
            </button>
            <h1 className="text-xl font-bold text-slate-800 dark:text-white">Pilih Layanan</h1>
        </div>

        {/* Kartu Info Data Center */}
        <div className="mb-4 flex items-center justify-between rounded-2xl bg-slate-900 p-4 text-white shadow-xl dark:bg-slate-800">
            <div>
            <p className="text-xs text-slate-400">Total Saldo</p>
            <h2 className="text-xl font-bold">Rp {balance.toLocaleString('id-ID')}</h2>
            </div>
            <div className="text-right">
                <div className="flex items-center justify-end gap-1 text-xs text-emerald-400">
                <Wifi size={14} />
                <span>Data Center</span>
                </div>
                <p className="text-[10px] text-slate-500">{ping}ms Latency</p>
            </div>
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

      {/* --- GRID LAYANAN (APLIKASI) --- */}
      <div className="px-5 mt-2">
        <div className="flex items-center justify-between mb-3">
             <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400">Semua Aplikasi</h3>
             <span className="text-[10px] bg-slate-100 px-2 py-1 rounded text-slate-500 dark:bg-slate-800">{filteredServices.length} Apps</span>
        </div>
        
        {loading ? (
          <div className="grid grid-cols-4 gap-4">
            {[...Array(12)].map((_, i) => (
              <div key={i} className="flex flex-col items-center gap-2">
                <div className="h-14 w-14 animate-pulse rounded-2xl bg-slate-200 dark:bg-slate-800"></div>
                <div className="h-3 w-10 animate-pulse rounded bg-slate-200 dark:bg-slate-800"></div>
              </div>
            ))}
          </div>
        ) : filteredServices.length > 0 ? (
          <div className="grid grid-cols-4 gap-x-2 gap-y-6 sm:grid-cols-5 md:grid-cols-6">
            {filteredServices.map((item) => (
              <button 
                key={item.service_code}
                onClick={() => handleServiceClick(item)} // BUKA DRAWER NEGARA
                className="group flex flex-col items-center gap-2 transition-transform active:scale-95"
              >
                <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-white p-2 shadow-sm border border-slate-100 transition-all group-hover:shadow-md dark:border-slate-800 dark:bg-slate-800">
                  <img 
                    src={getOptimizedImage(item.service_img)} 
                    alt={item.service_name}
                    className="h-full w-full object-contain rounded-lg"
                    loading="lazy"
                  />
                </div>
                <span className="truncate w-full text-center text-[10px] font-medium text-slate-600 group-hover:text-slate-900 dark:text-slate-400 dark:group-hover:text-white">
                  {item.service_name}
                </span>
              </button>
            ))}
          </div>
        ) : (
          <div className="mt-10 text-center text-slate-400">
            <p>Aplikasi tidak ditemukan</p>
          </div>
        )}
      </div>

      {/* --- PENDING ORDER (FLOATING BOTTOM) --- */}
      {/* Muncul sticky di bawah jika ada order aktif */}
      {activeOrder && (
        <div className="fixed bottom-20 left-5 right-5 z-40">
            <div className="overflow-hidden rounded-2xl bg-slate-900 text-white shadow-2xl ring-1 ring-white/20 dark:bg-slate-800">
                <div className="flex items-center gap-3 p-4">
                    {/* Icon Loading Animated */}
                    <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-800">
                        <div className="absolute inset-0 rounded-full border-2 border-emerald-500 opacity-25"></div>
                        <div className="absolute inset-0 animate-spin rounded-full border-2 border-transparent border-t-emerald-500"></div>
                        <ShoppingBag size={18} className="text-emerald-400" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-center">
                            <h3 className="text-sm font-bold truncate">Menunggu SMS...</h3>
                            <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded">Pending</span>
                        </div>
                        <p className="text-xs text-slate-400 truncate">
                             {activeOrder.service} • {activeOrder.phone_number}
                        </p>
                    </div>
                </div>

                {/* Tombol Action Kecil */}
                <div className="grid grid-cols-2 border-t border-white/10">
                    <button 
                        onClick={handleCancelOrder}
                        className="flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium text-red-400 hover:bg-white/5"
                    >
                        <Trash2 size={14} /> Batalkan
                    </button>
                    <button 
                         className="flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium text-blue-400 hover:bg-white/5"
                    >
                        <Repeat size={14} /> Cek SMS
                    </button>
                </div>
            </div>
        </div>
      )}

      {/* --- DRAWER / BOTTOM SHEET NEGARA --- */}
      {/* Backdrop */}
      {isDrawerOpen && (
        <div 
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm transition-opacity"
            onClick={() => setIsDrawerOpen(false)}
        ></div>
      )}

      {/* Konten Drawer */}
      <div className={`fixed bottom-0 left-0 right-0 z-50 h-[85vh] transform rounded-t-[2rem] bg-white shadow-2xl transition-transform duration-300 dark:bg-slate-900 ${isDrawerOpen ? 'translate-y-0' : 'translate-y-full'}`}>
         
         {/* Handle Bar */}
         <div className="absolute left-0 right-0 top-0 flex justify-center pt-3 pb-1" onClick={() => setIsDrawerOpen(false)}>
            <div className="h-1.5 w-12 rounded-full bg-slate-200 dark:bg-slate-700"></div>
         </div>

         {/* Header Drawer */}
         <div className="mt-6 flex items-center justify-between border-b border-slate-100 px-6 pb-4 dark:border-slate-800">
            <div className="flex items-center gap-3">
               {selectedService && (
                   <div className="h-12 w-12 rounded-xl bg-slate-50 p-2 border border-slate-100 dark:bg-slate-800 dark:border-slate-700">
                        <img 
                            src={getOptimizedImage(selectedService.service_img)} 
                            className="h-full w-full object-contain"
                            alt="Icon"
                        />
                   </div>
               )}
               <div>
                  <h3 className="text-lg font-bold text-slate-800 dark:text-white">
                      {selectedService ? selectedService.service_name : '...'}
                  </h3>
                  <p className="text-xs text-slate-400">Pilih Server Negara</p>
               </div>
            </div>
            <button onClick={() => setIsDrawerOpen(false)} className="rounded-full bg-slate-100 p-2 text-slate-500 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400">
                <X size={20} />
            </button>
         </div>

         {/* List Negara */}
         <div className="h-full overflow-y-auto px-6 pb-32 pt-4">
            {loadingCountries ? (
               <div className="space-y-3">
                  {[1,2,3,4,5].map(i => (
                     <div key={i} className="flex items-center justify-between rounded-xl border border-slate-100 p-4 dark:border-slate-800">
                        <div className="flex items-center gap-3">
                            <div className="h-8 w-8 animate-pulse rounded-full bg-slate-200 dark:bg-slate-800"></div>
                            <div className="h-4 w-24 animate-pulse rounded bg-slate-200 dark:bg-slate-800"></div>
                        </div>
                        <div className="h-6 w-12 animate-pulse rounded bg-slate-200 dark:bg-slate-800"></div>
                     </div>
                  ))}
               </div>
            ) : countries.length > 0 ? (
               <div className="grid gap-3">
                  {countries.map((country) => (
                     <button 
                        key={country.country_id}
                        onClick={() => {
                            // Disini nanti logika beli (kita bahas next step)
                            alert(`Beli ${selectedService.service_name} server ${country.country_name}?`);
                        }}
                        className="group flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 p-4 transition-all hover:border-blue-500 hover:bg-blue-50 hover:shadow-md dark:border-slate-800 dark:bg-slate-800 dark:hover:border-blue-500 dark:hover:bg-blue-900/20"
                     >
                        <div className="flex items-center gap-4">
                           {/* Icon Map Pin / Flag (Simulasi) */}
                           <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-lg shadow-sm group-hover:scale-110 transition-transform dark:bg-slate-700">
                                🌍
                           </div>
                           <div className="text-left">
                                <h4 className="font-bold text-slate-700 dark:text-slate-200">{country.country_name}</h4>
                                <p className="text-[10px] text-slate-400">ID: {country.country_id} • Server Stabil</p>
                           </div>
                        </div>
                        
                        <div className="flex flex-col items-end gap-1">
                            <div className="rounded-lg bg-emerald-100 px-2 py-1 text-xs font-bold text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                                {country.count ? `${country.count} Pcs` : 'Ready'}
                            </div>
                            <span className="text-[10px] text-slate-400 group-hover:text-blue-500">Pilih &gt;</span>
                        </div>
                     </button>
                  ))}
               </div>
            ) : (
               <div className="flex flex-col items-center justify-center py-20 text-center">
                  <div className="mb-4 rounded-full bg-slate-100 p-4 dark:bg-slate-800">
                      <MapPin size={32} className="text-slate-400" />
                  </div>
                  <h3 className="font-bold text-slate-700 dark:text-slate-300">Negara Kosong</h3>
                  <p className="text-xs text-slate-400">Stok untuk layanan ini sedang habis.</p>
               </div>
            )}
         </div>
      </div>

      <BottomNav />
    </div>
  );
}

