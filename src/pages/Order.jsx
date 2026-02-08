import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import BottomNav from '../components/BottomNav';
import { useTheme } from '../context/ThemeContext';
import { Search, ServerCrash, RefreshCw, Wifi, X, ShoppingBag, Trash2, Repeat } from 'lucide-react';

export default function Order() {
  const { color } = useTheme();
  const navigate = useNavigate();
  
  // --- STATE UTAMA ---
  const [services, setServices] = useState([]);
  const [filteredServices, setFilteredServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // --- STATE HEADER INFO ---
  const [balance, setBalance] = useState(0);
  const [ping, setPing] = useState(0);
  const [activeOrder, setActiveOrder] = useState(null); // Data pesanan pending

  // --- STATE BOTTOM SHEET (DRAWER) ---
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedService, setSelectedService] = useState(null); // Layanan yang sedang dipilih
  const [countries, setCountries] = useState([]); // Daftar negara untuk layanan tsb
  const [loadingCountries, setLoadingCountries] = useState(false);

  // Cache Keys
  const CACHE_KEY = 'otp_services_data_v3';
  const CACHE_TIME = 'otp_services_time_v3';
  const CACHE_DURATION = 60 * 60 * 1000; 

  useEffect(() => {
    fetchInitialData();
  }, []);

  // Filter pencarian
  useEffect(() => {
    const results = services.filter(service =>
      service.service_name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredServices(results);
  }, [searchTerm, services]);

  // 1. FETCH DATA AWAL (Services, Saldo, Ping, Active Order)
  const fetchInitialData = async (forceRefresh = false) => {
    setLoading(true);
    const start = Date.now();

    // A. Ambil Saldo & User
    try {
      const resUser = await api.get('/auth/me');
      if (resUser.data.success) {
        setBalance(resUser.data.data.balance);
      }
    } catch (e) {}

    // B. Hitung Ping (Latency)
    const end = Date.now();
    setPing(end - start);

    // C. Cek Pesanan Aktif (Simulasi ambil dari local storage atau API history)
    // Disini kita cek apakah ada order pending terakhir
    try {
      const resHistory = await api.get('/history/list'); // Pastikan endpoint ini ada/sesuai backend
      if (resHistory.data.success && resHistory.data.data.length > 0) {
         // Ambil yang statusnya ACTIVE / PENDING
         const pending = resHistory.data.data.find(o => o.status === 'ACTIVE' || o.status === 'PENDING');
         setActiveOrder(pending || null);
      }
    } catch (e) {}

    // D. Ambil Services (Cache Logic)
    const cachedData = localStorage.getItem(CACHE_KEY);
    const cachedTime = localStorage.getItem(CACHE_TIME);
    const now = Date.now();

    if (!forceRefresh && cachedData && cachedTime && (now - cachedTime < CACHE_DURATION)) {
      const parsedData = JSON.parse(cachedData);
      setServices(parsedData);
      setFilteredServices(parsedData);
      setLoading(false);
    } else {
      try {
        const res = await api.get('/services/list');
        if (res.data.success) {
          const data = res.data.data;
          setServices(data);
          setFilteredServices(data);
          localStorage.setItem(CACHE_KEY, JSON.stringify(data));
          localStorage.setItem(CACHE_TIME, now);
        }
      } catch (err) {
        console.error("Gagal load services");
      } finally {
        setLoading(false);
      }
    }
  };

  // 2. FUNGSI KLIK LAYANAN -> BUKA DRAWER & AMBIL NEGARA
  const handleServiceClick = async (service) => {
    setSelectedService(service);
    setIsDrawerOpen(true);
    setCountries([]); 
    setLoadingCountries(true);

    try {
      // Panggil API Negara berdasarkan Service ID
      // Endpoint ini harus sesuai dengan Backend Anda: /countries/list?service_id=...
      const res = await api.get(`/countries/list?service_id=${service.service_code}`);
      if (res.data.success) {
        setCountries(res.data.data);
      }
    } catch (err) {
      console.error("Gagal ambil negara");
    } finally {
      setLoadingCountries(false);
    }
  };

  // 3. FUNGSI HELPER GAMBAR
  const getOptimizedImage = (url) => {
    if (!url) return "https://cdn-icons-png.flaticon.com/512/1176/1176425.png";
    const cleanUrl = url.replace('https://', '').replace('http://', '');
    return `https://images.weserv.nl/?url=${cleanUrl}&w=100&h=100&fit=contain&output=webp`;
  };

  // 4. ACTION BUTTONS (Batal / Beli Lagi)
  const handleCancelOrder = () => {
     if(window.confirm("Batalkan pesanan aktif?")) {
        // Panggil API Cancel disini (sesuaikan endpoint)
        setActiveOrder(null); // Hapus visual sementara
     }
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-24 transition-colors duration-300 dark:bg-slate-900">
      
      {/* --- BAGIAN ATAS (INFO & STATUS) --- */}
      <div className="sticky top-0 z-30 bg-white/90 pb-4 pt-6 backdrop-blur-md dark:bg-slate-950/90">
        <div className="px-5">
           
           {/* Baris 1: Saldo & Ping */}
           <div className="mb-4 flex items-center justify-between rounded-2xl bg-slate-900 p-4 text-white shadow-lg dark:bg-slate-800">
              <div>
                <p className="text-xs text-slate-400">Total Saldo</p>
                <h2 className="text-xl font-bold">Rp {balance.toLocaleString('id-ID')}</h2>
              </div>
              <div className="text-right">
                 <div className="flex items-center justify-end gap-1 text-xs text-emerald-400">
                    <Wifi size={14} />
                    <span>Terhubung</span>
                 </div>
                 <p className="text-[10px] text-slate-500">Data Center: {ping}ms</p>
              </div>
           </div>

           {/* Baris 2: Active Order Banner (Muncul jika ada order pending) */}
           {activeOrder && (
             <div className="mb-6 overflow-hidden rounded-2xl border border-blue-100 bg-blue-50 shadow-sm dark:border-blue-900/30 dark:bg-blue-900/20">
                <div className="flex items-center gap-3 p-4">
                   <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-500 text-white">
                      <ShoppingBag size={20} />
                   </div>
                   <div className="flex-1">
                      <h3 className="text-sm font-bold text-slate-800 dark:text-white">Menunggu SMS...</h3>
                      <p className="text-xs text-slate-500">{activeOrder.service || 'Layanan'} - {activeOrder.phone_number}</p>
                   </div>
                </div>
                {/* Tombol Aksi */}
                <div className="flex border-t border-blue-100 dark:border-blue-900/30">
                   <button 
                     onClick={handleCancelOrder}
                     className="flex flex-1 items-center justify-center gap-2 py-3 text-xs font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                   >
                      <Trash2 size={14} /> Batalkan
                   </button>
                   <div className="w-[1px] bg-blue-100 dark:bg-blue-900/30"></div>
                   <button className="flex flex-1 items-center justify-center gap-2 py-3 text-xs font-bold text-blue-600 hover:bg-blue-100 dark:text-blue-400 dark:hover:bg-blue-900/20">
                      <Repeat size={14} /> Beli Lagi
                   </button>
                </div>
             </div>
           )}

           {/* Baris 3: Search Bar */}
           <div className="relative">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
             <input 
               type="text" 
               placeholder="Cari aplikasi..." 
               className={`w-full rounded-xl border bg-slate-50 py-3 pl-10 pr-4 text-sm font-medium text-slate-800 outline-none transition-all focus:bg-white focus:ring-2 dark:bg-slate-900 dark:text-white dark:focus:bg-slate-950 ${color.border} ${color.ring}`}
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
             />
           </div>
        </div>
      </div>

      {/* --- GRID LAYANAN --- */}
      <div className="px-5 mt-2">
        <h3 className="mb-3 text-sm font-bold text-slate-500 dark:text-slate-400">Pilih Aplikasi</h3>
        
        {loading ? (
          <div className="grid grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="flex flex-col items-center gap-2">
                <div className="h-14 w-14 animate-pulse rounded-2xl bg-slate-200 dark:bg-slate-800"></div>
                <div className="h-3 w-10 animate-pulse rounded bg-slate-200 dark:bg-slate-800"></div>
              </div>
            ))}
          </div>
        ) : filteredServices.length > 0 ? (
          <div className="grid grid-cols-4 gap-x-2 gap-y-6 sm:grid-cols-5">
            {filteredServices.map((item) => (
              <button 
                key={item.service_code}
                onClick={() => handleServiceClick(item)} // KLIK DISINI MEMBUKA DRAWER
                className="group flex flex-col items-center gap-2 transition-transform active:scale-95"
              >
                <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-white p-2 shadow-sm border border-slate-100 transition-all group-hover:shadow-md dark:border-slate-800 dark:bg-slate-800">
                  <img 
                    src={getOptimizedImage(item.service_img)} 
                    alt={item.service_name}
                    className="h-full w-full object-contain rounded-lg"
                    loading="lazy"
                    onError={(e) => { e.target.onerror = null; e.target.src = "https://cdn-icons-png.flaticon.com/512/1176/1176425.png"; }}
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

      {/* --- BOTTOM SHEET / DRAWER (DAFTAR NEGARA) --- */}
      {/* Backdrop Gelap */}
      {isDrawerOpen && (
        <div 
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm transition-opacity"
            onClick={() => setIsDrawerOpen(false)}
        ></div>
      )}

      {/* Konten Drawer */}
      <div className={`fixed bottom-0 left-0 right-0 z-50 transform rounded-t-[2rem] bg-white shadow-2xl transition-transform duration-300 dark:bg-slate-900 ${isDrawerOpen ? 'translate-y-0' : 'translate-y-full'}`}>
         
         {/* Handle Bar (Garis di atas) */}
         <div className="pt-3 pb-1" onClick={() => setIsDrawerOpen(false)}>
            <div className="mx-auto h-1.5 w-12 rounded-full bg-slate-200 dark:bg-slate-700"></div>
         </div>

         {/* Header Drawer */}
         <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 dark:border-slate-800">
            <div className="flex items-center gap-3">
               {selectedService && (
                   <img 
                      src={getOptimizedImage(selectedService.service_img)} 
                      className="h-10 w-10 rounded-lg object-contain"
                      alt="Icon"
                   />
               )}
               <div>
                  <h3 className="text-lg font-bold text-slate-800 dark:text-white">
                      {selectedService ? selectedService.service_name : 'Memuat...'}
                  </h3>
                  <p className="text-xs text-slate-400">Pilih negara tujuan</p>
               </div>
            </div>
            <button onClick={() => setIsDrawerOpen(false)} className="rounded-full bg-slate-100 p-2 text-slate-500 dark:bg-slate-800">
                <X size={20} />
            </button>
         </div>

         {/* List Negara (Scrollable) */}
         <div className="max-h-[60vh] overflow-y-auto px-6 py-4 pb-10">
            {loadingCountries ? (
               <div className="space-y-3">
                  {[1,2,3,4].map(i => (
                     <div key={i} className="flex items-center gap-3 rounded-xl border border-slate-100 p-3 dark:border-slate-800">
                        <div className="h-8 w-8 animate-pulse rounded-full bg-slate-200 dark:bg-slate-800"></div>
                        <div className="h-4 w-32 animate-pulse rounded bg-slate-200 dark:bg-slate-800"></div>
                     </div>
                  ))}
               </div>
            ) : countries.length > 0 ? (
               <div className="grid gap-3">
                  {countries.map((country) => (
                     <button 
                        key={country.country_id}
                        onClick={() => {
                            // LOGIKA LANJUTAN: Pilih Operator / Beli
                            // navigate ke halaman beli atau tampilkan modal operator
                            alert(`Memilih ${country.country_name} untuk ${selectedService.service_name}`);
                        }}
                        className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 p-4 transition-colors hover:border-blue-200 hover:bg-blue-50 dark:border-slate-800 dark:bg-slate-800 dark:hover:border-blue-900"
                     >
                        <div className="flex items-center gap-3">
                           <span className="text-2xl">🌍</span> {/* Bisa ganti flag api jika ada */}
                           <span className="font-bold text-slate-700 dark:text-slate-200">{country.country_name}</span>
                        </div>
                        <div className="rounded-lg bg-white px-2 py-1 text-xs font-bold text-slate-500 shadow-sm dark:bg-slate-900">
                           {country.count ? `${country.count} Pcs` : 'Ready'}
                        </div>
                     </button>
                  ))}
               </div>
            ) : (
               <div className="py-10 text-center text-slate-400">
                  <p>Tidak ada negara tersedia untuk layanan ini.</p>
               </div>
            )}
         </div>
      </div>

      <BottomNav />
    </div>
  );
}

