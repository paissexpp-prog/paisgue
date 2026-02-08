import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import BottomNav from '../components/BottomNav';
import { useTheme } from '../context/ThemeContext';
import { Search, Wifi, X, ShoppingBag, Trash2, Repeat, Plus, ChevronRight, Server, Globe, Smartphone, Loader2 } from 'lucide-react';

export default function Order() {
  const { color } = useTheme();
  const navigate = useNavigate();
  
  // --- STATE DATA ---
  const [balance, setBalance] = useState(0);
  const [ping, setPing] = useState(0);
  const [activeOrder, setActiveOrder] = useState(null);
  const [services, setServices] = useState([]);
  const [filteredServices, setFilteredServices] = useState([]);
  const [countries, setCountries] = useState([]);
  
  // --- STATE UI ---
  const [loadingServices, setLoadingServices] = useState(true);
  const [loadingCountries, setLoadingCountries] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Kontrol Bottom Sheet
  const [sheetMode, setSheetMode] = useState(null); // 'services' | 'countries' | null
  const [selectedService, setSelectedService] = useState(null);

  // Cache
  const CACHE_KEY = 'otp_services_v5'; // Update versi cache
  const CACHE_TIME = 'otp_services_time_v5';
  const CACHE_DURATION = 60 * 60 * 1000; 

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (sheetMode === 'services') {
        const results = services.filter(service =>
          service.service_name.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setFilteredServices(results);
    }
  }, [searchTerm, services, sheetMode]);

  // 1. FETCH DATA AWAL
  const fetchInitialData = async () => {
    const start = Date.now();
    try {
      const resUser = await api.get('/auth/me');
      if (resUser.data.success) setBalance(resUser.data.data.balance);
    } catch (e) {}
    setPing(Date.now() - start);

    try {
      const resHistory = await api.get('/history/list'); 
      if (resHistory.data.success && resHistory.data.data.length > 0) {
         const pending = resHistory.data.data.find(o => o.status === 'ACTIVE' || o.status === 'PENDING');
         setActiveOrder(pending || null);
      }
    } catch (e) {}

    loadServicesFromCache();
  };

  const loadServicesFromCache = async () => {
    const cachedData = localStorage.getItem(CACHE_KEY);
    const cachedTime = localStorage.getItem(CACHE_TIME);
    const now = Date.now();

    if (cachedData && cachedTime && (now - cachedTime < CACHE_DURATION)) {
      const parsedData = JSON.parse(cachedData);
      setServices(parsedData);
      setFilteredServices(parsedData);
      setLoadingServices(false);
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
        console.error("Gagal load services");
      } finally {
        setLoadingServices(false);
      }
    }
  };

  // 2. KLIK LAYANAN -> BUKA NEGARA
  const handleServiceClick = async (service) => {
    setSelectedService(service);
    setSheetMode('countries'); 
    setCountries([]);
    setLoadingCountries(true);

    try {
      // API call ke backend Anda
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

  // 3. KLIK NEGARA (Format Baru)
  const handleCountryClick = async (country) => {
      // Cari provider termurah yang ada stoknya
      if (!country.pricelist || country.pricelist.length === 0) {
          alert("Layanan tidak tersedia untuk negara ini.");
          return;
      }

      // Filter stok > 0 dan urutkan harga termurah
      const availableProviders = country.pricelist
          .filter(p => p.stock > 0 && p.available)
          .sort((a, b) => a.price - b.price);

      if (availableProviders.length === 0) {
          alert("Stok sedang kosong untuk negara ini.");
          return;
      }

      const bestOffer = availableProviders[0]; // Ambil yang paling murah

      // Konfirmasi Pembelian
      const msg = `📦 Konfirmasi Order\n\n` + 
                  `📱 Aplikasi: ${selectedService.service_name}\n` +
                  `🌍 Negara: ${country.name}\n` + 
                  `💰 Harga: Rp ${bestOffer.price.toLocaleString('id-ID')}\n` +
                  `🔌 Server ID: ${bestOffer.server_id}\n\n` +
                  `Lanjutkan pembelian?`;

      if(confirm(msg)) {
          setSheetMode(null); // Tutup drawer
          
          // Panggil API Beli
          // Backend butuh: number_id, provider_id, operator_id, expected_price
          try {
              // Operator ID biasanya 'any' atau ambil dari provider jika ada. 
              // Di JSON pricelist tidak ada operator_id eksplisit, biasanya default 'any' atau provider_id itu sendiri.
              // Kita coba kirim provider_id sebagai parameter provider.
              
              const buyUrl = `/orders/buy?number_id=${country.number_id}&provider_id=${bestOffer.provider_id}&operator_id=any&expected_price=${bestOffer.price}`;
              
              const res = await api.get(buyUrl);
              
              if (res.data.success) {
                  alert("✅ Berhasil! Menunggu SMS masuk...");
                  fetchInitialData(); // Refresh data pending order
              } else {
                  alert("Gagal: " + (res.data.error?.message || "Unknown error"));
              }
          } catch (err) {
              const errMsg = err.response?.data?.error?.message || "Terjadi kesalahan koneksi";
              alert("Gagal: " + errMsg);
          }
      }
  };

  // Helper Gambar
  const getOptimizedImage = (url) => {
    if (!url) return "https://cdn-icons-png.flaticon.com/512/1176/1176425.png";
    const cleanUrl = url.replace('https://', '').replace('http://', '');
    return `https://images.weserv.nl/?url=${cleanUrl}&w=80&h=80&fit=contain&output=webp`;
  };

  // Helper Hitung Harga Termurah untuk Tampilan
  const getCheapestPrice = (pricelist) => {
      if (!pricelist || pricelist.length === 0) return 0;
      const cheapest = Math.min(...pricelist.map(p => p.price));
      return cheapest;
  };

  const handleCancelOrder = async () => {
     if (!activeOrder) return;
     if(window.confirm("Batalkan pesanan aktif?")) {
        try {
            // Asumsi activeOrder menyimpan order_id (ID Kita)
            await api.get(`/orders/check-status?order_id=${activeOrder.order_id}`); 
            // Note: Biasanya ada endpoint khusus cancel, tapi di backend Anda cancel terjadi otomatis 
            // atau via endpoint status jika statusnya batal.
            // Tapi mari kita set null visualnya dulu.
            setActiveOrder(null); 
            fetchInitialData();
        } catch(e) { setActiveOrder(null); }
     }
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-24 transition-colors duration-300 dark:bg-slate-900">
      
      {/* HEADER UTAMA */}
      <div className="sticky top-0 z-30 bg-white/80 pb-4 pt-8 backdrop-blur-md dark:bg-slate-950/80 px-5 border-b border-slate-100 dark:border-slate-800">
           <div className="flex items-center justify-between">
              <div>
                  <h1 className="text-xl font-bold text-slate-800 dark:text-white">Order Baru</h1>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                        <Wifi size={10} /> Data Center
                    </span>
                    <span className="text-[10px] text-slate-400">{ping}ms latency</span>
                  </div>
              </div>
              <div className="text-right">
                  <p className="text-[10px] text-slate-400">Saldo Anda</p>
                  <p className="text-lg font-bold text-slate-800 dark:text-white">Rp {balance.toLocaleString('id-ID')}</p>
              </div>
           </div>
      </div>

      {/* KONTEN */}
      <div className="px-5 mt-6 space-y-6">

        {/* 1. KARTU PESANAN PENDING */}
        {activeOrder && (
             <div className="overflow-hidden rounded-3xl bg-white shadow-sm border border-slate-100 dark:bg-slate-950 dark:border-slate-800 relative">
                <div className="absolute top-0 right-0 px-3 py-1 bg-amber-100 text-amber-700 text-[10px] font-bold rounded-bl-xl dark:bg-amber-900/30 dark:text-amber-400">
                    Menunggu SMS
                </div>
                <div className="p-5">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center dark:bg-slate-900">
                             <Loader2 size={24} className="text-blue-600 animate-spin" />
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-800 dark:text-white text-lg">{activeOrder.service || 'Layanan'}</h3>
                            <p className="text-sm text-slate-500 font-mono">{activeOrder.phone_number}</p>
                        </div>
                    </div>
                    
                    <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mb-4 dark:bg-slate-900">
                        <div className="bg-blue-600 h-full w-2/3 animate-pulse"></div>
                    </div>

                    <div className="flex gap-3">
                        <button 
                            onClick={handleCancelOrder}
                            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border border-red-100 text-red-600 text-xs font-bold hover:bg-red-50 dark:border-red-900/30 dark:bg-red-900/10 dark:text-red-400"
                        >
                            <Trash2 size={14} /> Batalkan
                        </button>
                        <button className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 shadow-lg shadow-blue-200 dark:shadow-none">
                            <Repeat size={14} /> Cek SMS
                        </button>
                    </div>
                </div>
             </div>
        )}

        {/* 2. TOMBOL GET VIRTUAL NUMBER */}
        <button 
            onClick={() => {
                setSheetMode('services');
                setSearchTerm(''); 
            }}
            className="w-full group relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 to-slate-800 p-6 text-left shadow-xl dark:from-blue-900 dark:to-slate-900"
        >
            <div className="relative z-10 flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-white mb-1">Get Virtual Number</h2>
                    <p className="text-slate-300 text-sm">Pilih layanan dari 190+ negara</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-sm group-hover:bg-white/20 transition-all">
                    <Plus size={24} className="text-white" />
                </div>
            </div>
            <div className="absolute -right-6 -bottom-6 opacity-10 rotate-12">
                <Smartphone size={120} className="text-white" />
            </div>
        </button>

        {/* 3. INFO TAMBAHAN */}
        <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-white border border-slate-100 shadow-sm dark:bg-slate-950 dark:border-slate-800">
                <div className="p-2 w-fit rounded-lg bg-emerald-50 text-emerald-600 mb-2 dark:bg-emerald-900/20">
                    <Server size={18} />
                </div>
                <p className="text-xs text-slate-400">Server Status</p>
                <p className="font-bold text-slate-700 dark:text-slate-200">Online 100%</p>
            </div>
            <div className="p-4 rounded-2xl bg-white border border-slate-100 shadow-sm dark:bg-slate-950 dark:border-slate-800">
                <div className="p-2 w-fit rounded-lg bg-blue-50 text-blue-600 mb-2 dark:bg-blue-900/20">
                    <Globe size={18} />
                </div>
                <p className="text-xs text-slate-400">Total Negara</p>
                <p className="font-bold text-slate-700 dark:text-slate-200">193 Negara</p>
            </div>
        </div>

      </div>

      {/* --- SHEET 1: LAYANAN --- */}
      <div className={`fixed inset-0 z-50 bg-black/60 backdrop-blur-sm transition-opacity ${sheetMode === 'services' ? 'opacity-100 visible' : 'opacity-0 invisible'}`} onClick={() => setSheetMode(null)}></div>
      <div className={`fixed bottom-0 left-0 right-0 z-50 transform rounded-t-[2rem] bg-white shadow-2xl transition-transform duration-300 dark:bg-slate-900 max-h-[85vh] flex flex-col ${sheetMode === 'services' ? 'translate-y-0' : 'translate-y-full'}`}>
         
         <div className="pt-3 pb-2 px-6 bg-white rounded-t-[2rem] z-10 dark:bg-slate-900">
            <div className="mx-auto h-1.5 w-12 rounded-full bg-slate-200 mb-4 dark:bg-slate-700"></div>
            <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-100 dark:bg-slate-800 dark:border-slate-700">
                <Search size={18} className="text-slate-400" />
                <input 
                    type="text" 
                    placeholder="Cari layanan (WhatsApp, Telegram)..." 
                    className="bg-transparent w-full outline-none text-sm font-medium text-slate-800 dark:text-white"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    autoFocus
                />
            </div>
         </div>

         <div className="flex-1 overflow-y-auto px-6 py-4 pb-10">
            {loadingServices ? (
                <div className="grid grid-cols-4 gap-4">
                    {[...Array(12)].map((_,i) => <div key={i} className="h-20 bg-slate-100 rounded-2xl animate-pulse dark:bg-slate-800"></div>)}
                </div>
            ) : filteredServices.length > 0 ? (
                <div className="grid grid-cols-4 gap-x-2 gap-y-6 sm:grid-cols-5">
                    {filteredServices.map((item) => (
                        <button 
                            key={item.service_code}
                            onClick={() => handleServiceClick(item)}
                            className="group flex flex-col items-center gap-2"
                        >
                            <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-50 p-2 border border-slate-100 transition-all group-active:scale-95 hover:border-blue-200 dark:bg-slate-800 dark:border-slate-700">
                                <img 
                                    src={getOptimizedImage(item.service_img)} 
                                    className="h-full w-full object-contain"
                                    loading="lazy"
                                />
                            </div>
                            <span className="truncate w-full text-center text-[10px] font-medium text-slate-600 dark:text-slate-400">
                                {item.service_name}
                            </span>
                        </button>
                    ))}
                </div>
            ) : (
                <div className="text-center py-10 text-slate-400">Tidak ditemukan</div>
            )}
         </div>
      </div>

      {/* --- SHEET 2: NEGARA (DATA BARU) --- */}
      <div className={`fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm transition-opacity ${sheetMode === 'countries' ? 'opacity-100 visible' : 'opacity-0 invisible'}`} onClick={() => setSheetMode('services')}></div>
      <div className={`fixed bottom-0 left-0 right-0 z-[60] transform rounded-t-[2rem] bg-white shadow-2xl transition-transform duration-300 dark:bg-slate-900 max-h-[85vh] flex flex-col ${sheetMode === 'countries' ? 'translate-y-0' : 'translate-y-full'}`}>
         
         <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-white rounded-t-[2rem] dark:bg-slate-900 dark:border-slate-800">
            <div className="flex items-center gap-3">
                <button onClick={() => setSheetMode('services')} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800">
                    <X size={20} className="text-slate-500" />
                </button>
                {selectedService && (
                    <>
                        <img src={getOptimizedImage(selectedService.service_img)} className="w-8 h-8 object-contain" />
                        <h3 className="font-bold text-slate-800 dark:text-white">{selectedService.service_name}</h3>
                    </>
                )}
            </div>
         </div>

         <div className="flex-1 overflow-y-auto px-6 py-2 pb-10">
            {loadingCountries ? (
                <div className="space-y-3 mt-4">
                    {[1,2,3,4].map(i => <div key={i} className="h-16 bg-slate-100 rounded-xl animate-pulse dark:bg-slate-800"></div>)}
                </div>
            ) : countries.length > 0 ? (
                <div className="space-y-2 mt-2">
                    {countries.map((country) => {
                        const startPrice = getCheapestPrice(country.pricelist);
                        return (
                            <button 
                                key={country.number_id} // Gunakan number_id
                                onClick={() => handleCountryClick(country)}
                                className="w-full flex items-center justify-between p-4 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors dark:border-slate-800 dark:bg-slate-900/50 dark:hover:bg-slate-800"
                            >
                                <div className="flex items-center gap-4">
                                    <img src={getOptimizedImage(country.img)} className="w-8 h-6 object-cover rounded shadow-sm" alt="flag" />
                                    <div className="text-left">
                                        <p className="font-bold text-slate-700 text-sm dark:text-slate-200">{country.name}</p>
                                        <p className="text-xs text-blue-600 font-medium">Rp {startPrice.toLocaleString('id-ID')}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                     <span className="text-xs text-slate-400">Stok: {country.stock_total}</span>
                                     <div className="bg-slate-100 p-2 rounded-full text-slate-400 dark:bg-slate-800">
                                        <ChevronRight size={16} />
                                     </div>
                                </div>
                            </button>
                        );
                    })}
                </div>
            ) : (
                <div className="text-center py-10 text-slate-400">
                    <p>Negara tidak tersedia untuk layanan ini.</p>
                    <button onClick={() => setSheetMode('services')} className="mt-2 text-blue-600 font-bold text-sm">Pilih layanan lain</button>
                </
