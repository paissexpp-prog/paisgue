import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import { jwtDecode } from 'jwt-decode';
import api from '../utils/api';
import BottomNav from '../components/BottomNav';
import { useTheme } from '../context/ThemeContext';
import { 
  Search, Wifi, X, ShoppingBag, Trash2, Repeat, Plus, 
  ChevronRight, ChevronDown, ChevronUp, Server, Globe, 
  Smartphone, Loader2, CheckCircle2, AlertCircle, HelpCircle, 
  Signal, Clock, Timer, Copy, MessageSquare, RefreshCw,
  Wallet, History, Headphones, Brain, Info, Bug, Eye, BookOpen, FileText
} from 'lucide-react';

export default function Order() {
  const { color } = useTheme();
  const navigate = useNavigate();

  // --- STATE DATA ---
  const [balance, setBalance] = useState(0);
  const [ping, setPing] = useState(0);
  const [activeOrders, setActiveOrders] = useState([]);

  const [services, setServices] = useState([]);
  const [filteredServices, setFilteredServices] = useState([]);
  const [countries, setCountries] = useState([]);
  const HIDDEN_ORDERS_KEY = 'ruangotp_closed_orders_v1';
  const closedIdsRef = useRef([]);

  // --- STATE OPERATOR ---
  const [currentOperators, setCurrentOperators] = useState([]);
  const [selectedOperatorId, setSelectedOperatorId] = useState('any');
  const [loadingOperators, setLoadingOperators] = useState(false);

  // --- STATE UI ---
  const [loadingServices, setLoadingServices] = useState(true);
  const [loadingCountries, setLoadingCountries] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // --- STATE TIMER GLOBAL ---
  const [currentTime, setCurrentTime] = useState(Date.now());

  // UI Controls
  const [sheetMode, setSheetMode] = useState(null);
  const [selectedService, setSelectedService] = useState(null);
  const [expandedCountry, setExpandedCountry] = useState(null);

  const [confirmModal, setConfirmModal] = useState({ show: false, title: '', message: '', onConfirm: null, loading: false, confirmText: 'Ya, Lanjutkan' });
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  // State FAQ
  const [expandedFaq, setExpandedFaq] = useState(null);

  // REF BARU UNTUK COOLDOWN REQUEST API
  const lastFetchRef = useRef(0);

  // Cache Services
  const CACHE_KEY = 'otp_services_v12';
  const CACHE_TIME = 'otp_services_time_v12';
  const CACHE_DURATION = 60 * 60 * 1000;

  // ================================================================
  // Cache Countries — per service_code, simpan 1 JAM di localStorage
  // ================================================================
  const COUNTRIES_CACHE_PREFIX      = 'otp_countries_v2_';
  const COUNTRIES_CACHE_TIME_PREFIX = 'otp_countries_time_v2_';
  const COUNTRIES_CACHE_DURATION    = 60 * 60 * 1000;

  // ================================================================
  // DATA FAQ
  // ================================================================
  const faqData = [
    {
      icon: <Brain size={18} className="text-amber-500" />,
      iconBg: 'bg-amber-500/20',
      question: 'Ayo belajar membaca!',
      answer: 'Pastikan Anda membaca seluruh panduan, informasi server, dan ketentuan layanan sebelum melakukan pemesanan untuk menghindari kesalahpahaman.'
    },
    {
      icon: <Info size={18} className="text-blue-500" />,
      iconBg: 'bg-blue-500/20',
      question: 'OTP gak masuk masuk',
      answer: 'Jika OTP tidak masuk dalam beberapa menit, kemungkinan server tujuan sedang sibuk atau nomor tersebut bermasalah. Anda dapat membatalkan pesanan (setelah 4 menit) dan saldo akan otomatis kembali.'
    },
    {
      icon: <Bug size={18} className="text-amber-500" />,
      iconBg: 'bg-amber-500/20',
      question: 'Cancel tapi saldo terpotong',
      answer: 'Jika Anda sudah menekan batal namun saldo masih terpotong, harap tunggu beberapa saat untuk sinkronisasi sistem, atau coba refresh halaman. Jika masih bermasalah, hubungi Admin kami.'
    },
    {
      icon: <CheckCircle2 size={18} className="text-emerald-500" />,
      iconBg: 'bg-emerald-500/20',
      question: 'Lupa cancel active order',
      answer: 'Order yang dibiarkan aktif (melewati batas waktu 20 menit) dan tidak menerima SMS akan otomatis dibatalkan oleh sistem dan saldo Anda akan dikembalikan.'
    },
    {
      icon: <Eye size={18} className="text-amber-500" />,
      iconBg: 'bg-amber-500/20',
      question: 'Syarat refund',
      answer: 'Saldo akan otomatis direfund sepenuhnya ke akun Anda apabila order dibatalkan (cancel) sebelum SMS OTP berhasil diterima oleh sistem.'
    }
  ];

  useEffect(() => {
    const savedHidden = localStorage.getItem(HIDDEN_ORDERS_KEY);
    if (savedHidden) {
        closedIdsRef.current = JSON.parse(savedHidden);
    }

    fetchInitialData();
    
    // INTERVAL DIUBAH DARI 15 DETIK KE 3 MENIT (180000 ms) SEBAGAI SAFETY NET
    const interval = setInterval(() => {
        if (!document.hidden) {
            fetchInitialData(true); 
        }
    }, 180000);

    const timerInterval = setInterval(() => {
        setCurrentTime(Date.now());
    }, 1000);

    const handleVisibilityChange = () => {
        if (!document.hidden) {
            // DITAMBAHKAN COOLDOWN 15 DETIK AGAR TIDAK SPAM REQUEST SAAT PINDAH TAB
            if (Date.now() - lastFetchRef.current > 15000) {
                fetchInitialData(true);
            }
        }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // ================================================================
    // KONEKSI SOCKET.IO UNTUK OTP REALTIME
    // ================================================================
    let userId = null;
    try {
        const token = localStorage.getItem('token');
        if (token) {
            const decoded = jwtDecode(token);
            userId = decoded?.userId || null;
        }
    } catch (e) {}

    const socket = io('https://api.ruangotp.site', {
        auth: { userId },
        transports: ['websocket'], // FIX: paksa WebSocket agar tidak memakan slot koneksi HTTP
        reconnectionAttempts: 5,
        reconnectionDelay: 3000,
    });

    socket.on('otp_received', () => {
        fetchInitialData(true);
    });

    return () => {
        clearInterval(interval);
        clearInterval(timerInterval);
        document.removeEventListener('visibilitychange', handleVisibilityChange);
        socket.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Search Filter
  useEffect(() => {
    if (sheetMode === 'services') {
        const results = services.filter(service =>
          service.service_name.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setFilteredServices(results);
    }
  }, [searchTerm, services, sheetMode]);

  // --- LOGIKA HITUNG MUNDUR 4 MENIT (LOCK TOMBOL BATAL) ---
  const getRemainingTime = (createdAt) => {
    const createdTime = new Date(createdAt).getTime();
    const diffSeconds = Math.floor((currentTime - createdTime) / 1000);
    const lockDuration = 4 * 60;
    const remaining = lockDuration - diffSeconds;
    return remaining > 0 ? remaining : 0;
  };

  // --- LOGIKA HITUNG MUNDUR 20 MENIT (LIFETIME ORDER / TIMER ATAS) ---
  const getLifetimeRemaining = (createdAt) => {
    const createdTime = new Date(createdAt).getTime();
    const diffSeconds = Math.floor((currentTime - createdTime) / 1000);
    const lifetimeDuration = 20 * 60;
    const remaining = lifetimeDuration - diffSeconds;
    return remaining > 0 ? remaining : 0;
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // --- FETCH DATA ---
  const fetchInitialData = async (silent = false) => {
    lastFetchRef.current = Date.now(); // MENCATAT WAKTU TERAKHIR REQUEST API
    const start = Date.now();

    try {
      const resUser = await api.get('/auth/me');
      if (resUser.data.success) {
          setBalance(resUser.data.data.balance);
      }
      
      if(!silent) setPing(Date.now() - start);

      let closedBackendIds = [];
      try {
          const resSelesai = await api.get('/cekselesai/list');
          if (resSelesai.data.success && Array.isArray(resSelesai.data.data)) {
              closedBackendIds = resSelesai.data.data.map(o => o.order_id);
          }
      } catch (err) {
          console.error("Gagal load saveorder:", err);
      }

      const resHistory = await api.get('/history/list');
      if (resHistory.data.success) {
         const allOrders = resHistory.data.data;
         const filtered = allOrders.filter(order => {
             const id = order.order_id || order.id;
             const isHiddenLocal = closedIdsRef.current.includes(id);
             const isHiddenBackend = closedBackendIds.includes(id);
             const status = (order.status || '').toUpperCase();
             return ['ACTIVE', 'PENDING', 'COMPLETED', 'RECEIVED'].includes(status) && !isHiddenLocal && !isHiddenBackend;
         });
         setActiveOrders(filtered);
      }
    } catch (e) { 
        console.error("Fetch Error:", e);
    }

    if(!silent) loadServicesFromCache();
  };

  const loadServicesFromCache = async () => {
    const cachedData = localStorage.getItem(CACHE_KEY);
    const cachedTime = localStorage.getItem(CACHE_TIME);
    const now = Date.now();

    if (cachedData && cachedTime && (now - parseInt(cachedTime, 10) < CACHE_DURATION)) {
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
          localStorage.setItem(CACHE_TIME, now.toString());
        }
      } catch (err) { }
      setLoadingServices(false);
    }
  };

  // UI Helpers
  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast(prev => ({ ...prev, show: false })), 3000);
  };

  const showConfirm = (title, message, action, confirmText = 'Ya, Lanjutkan') => {
      setConfirmModal({ show: true, title, message, onConfirm: action, loading: false, confirmText });
  };

  const closeConfirm = () => {
      setConfirmModal({ show: false, title: '', message: '', onConfirm: null, loading: false, confirmText: 'Ya, Lanjutkan' });
  };

  const handleCopy = (text) => {
      if (!text) return;
      navigator.clipboard.writeText(text);
      showToast("Berhasil disalin! 📋", "success");
  };

  // --- ACTIONS ---
  // Cache countries per service_code selama 1 JAM di localStorage
  const handleServiceClick = async (service) => {
    setSelectedService(service);
    setSheetMode('countries'); 
    setCountries([]);
    setLoadingCountries(true);
    setExpandedCountry(null);

    const cacheKey     = COUNTRIES_CACHE_PREFIX + service.service_code;
    const cacheTimeKey = COUNTRIES_CACHE_TIME_PREFIX + service.service_code;
    const now          = Date.now();

    try {
      const cachedCountries     = localStorage.getItem(cacheKey);
      const cachedCountriesTime = localStorage.getItem(cacheTimeKey);

      if (
        cachedCountries &&
        cachedCountriesTime &&
        (now - parseInt(cachedCountriesTime, 10) < COUNTRIES_CACHE_DURATION)
      ) {
        setCountries(JSON.parse(cachedCountries));
      } else {
        const res = await api.get(`/countries/list?service_id=${service.service_code}`);
        if (res.data.success) {
          setCountries(res.data.data);
          localStorage.setItem(cacheKey, JSON.stringify(res.data.data));
          localStorage.setItem(cacheTimeKey, now.toString());
        }
      }
    } catch (err) { 
      showToast("Gagal memuat negara", "error");
    } 
    finally { 
      setLoadingCountries(false); 
    }
  };

  const toggleCountry = async (country) => {
      if (expandedCountry === country.number_id) { setExpandedCountry(null); return; }
      setExpandedCountry(country.number_id);
      setSelectedOperatorId('any'); 
      setCurrentOperators([]); 
      setLoadingOperators(true);
      
      const sampleProviderId = country.pricelist?.[0]?.provider_id;
      if (sampleProviderId) {
          try {
              const res = await api.get(`/operators/list?country=${country.name}&provider_id=${sampleProviderId}`);
              if (res.data.success) setCurrentOperators(res.data.data);
          } catch (err) {}
      }
      setLoadingOperators(false);
  };

  const handleBuyClick = (country, provider) => {
      if (balance < provider.price) return showToast("Saldo tidak mencukupi untuk membeli layanan ini!", "error");
      const selectedOpObj = currentOperators.find(op => op.id == selectedOperatorId);
      const opName = selectedOpObj ? selectedOpObj.name : 'Acak (Any)';

      showConfirm(
          "Konfirmasi Pembelian",
          `Beli ${country.name} - ${selectedService.service_name}?\nOperator: ${opName}\nServer: ${provider.server_id}\nHarga: Rp ${provider.price}`,
          () => processBuy(country, provider)
      );
  };

  const processBuy = async (country, provider) => {
      setConfirmModal(prev => ({ ...prev, loading: true }));
      const opIdToSend = selectedOperatorId || 'any';
      const buyUrl = `/orders/buy?number_id=${country.number_id}&provider_id=${provider.provider_id}&operator_id=${opIdToSend}&expected_price=${provider.price}`;

      try {
          const res = await api.get(buyUrl);
          if (res.data.success) {
              closeConfirm();
              setSheetMode(null);
              showToast("✅ Order Berhasil! Menunggu SMS...", "success");
              fetchInitialData();
          } else {
              closeConfirm();
              let errorMsg = res.data.error?.message || res.data.message || "Order Gagal";
              if (errorMsg.toLowerCase().includes("rate limit") || errorMsg.toLowerCase().includes("please wait")) {
                  errorMsg = "Sistem pusat sedang sibuk. Silakan coba klik Beli lagi dalam 1-2 detik ya! ⏳";
              }
              showToast(errorMsg, "error");
          }

      } catch (err) {
          closeConfirm();
          const errorMsg = err.response?.data?.error?.message
                        || err.response?.data?.message
                        || "Gagal memproses order coba lagi .";
          let finalMsg = errorMsg;
          if (finalMsg.toLowerCase().includes("rate limit") || finalMsg.toLowerCase().includes("please wait")) {
              finalMsg = "Sistem pusat sedang sibuk. Silakan coba klik Beli lagi dalam 1-2 detik ya! ⏳";
          }
          showToast(finalMsg, "error");
          fetchInitialData(true);
      }
  };

  const handleCancelClick = (order) => {
     const remaining = getRemainingTime(order.created_at);
     if (remaining > 0) {
         showConfirm("⏳ Belum Bisa Batal", `Pembatalan baru bisa dilakukan setelah 4 menit.\nMohon tunggu ${formatTime(remaining)} lagi.`, closeConfirm, "Saya Mengerti");
         return;
     }

     showConfirm("Batalkan Pesanan?", "Yakin batalkan pesanan? Saldo akan dikembalikan otomatis.", async () => {
         setConfirmModal(prev => ({ ...prev, loading: true }));
         try {
            const targetId = order.order_id || order.id;
            await api.get(`/orders/cancel?order_id=${targetId}`);
            setActiveOrders(prev => prev.filter(o => (o.order_id || o.id) !== targetId));
            closeConfirm();
            showToast("Pesanan dibatalkan", "success");
            fetchInitialData();
         } catch(e) { 
            closeConfirm();
            const errorMsg = e.response?.data?.error?.message 
                          || e.response?.data?.message 
                          || "Gagal batal";
            showToast(errorMsg, "error");
            fetchInitialData(true);
         }
     });
  };

  const handleCloseOrder = async (orderId) => {
      const newHidden = [...closedIdsRef.current, orderId];
      closedIdsRef.current = newHidden;
      localStorage.setItem(HIDDEN_ORDERS_KEY, JSON.stringify(newHidden));
      setActiveOrders(prev => prev.filter(o => (o.order_id || o.id) !== orderId));

      let attempt = 0;
      const maxRetry = 3;
      while (attempt < maxRetry) {
          try {
              await api.post('/cekselesai/tutup', { order_id: orderId });
              break;
          } catch (err) {
              attempt++;
              if (attempt < maxRetry) {
                  await new Promise(resolve => setTimeout(resolve, 2000));
              } else {
                  console.error("Gagal sinkronisasi tutup order ke backend setelah 3x percobaan:", err);
              }
          }
      }
  };

  const getOptimizedImage = (url) => {
    if (!url) return "https://cdn-icons-png.flaticon.com/512/1176/1176425.png";
    const cleanUrl = url.replace('https://', '').replace('http://', '');
    return `https://images.weserv.nl/?url=${cleanUrl}&w=80&h=80&fit=contain&output=webp`;
  };

  const getCountryFlag = (countryName) => {
    if (!countryName) return '🌐';
    const flags = {
      'indonesia': '🇮🇩', 'russia': '🇷🇺', 'united states': '🇺🇸', 'usa': '🇺🇸',
      'united kingdom': '🇬🇧', 'uk': '🇬🇧', 'england': '🇬🇧', 'philippines': '🇵🇭',
      'vietnam': '🇻🇳', 'thailand': '🇹🇭', 'malaysia': '🇲🇾', 'india': '🇮🇳',
      'china': '🇨🇳', 'japan': '🇯🇵', 'south korea': '🇰🇷', 'korea': '🇰🇷',
      'germany': '🇩🇪', 'france': '🇫🇷', 'brazil': '🇧🇷', 'mexico': '🇲🇽',
      'canada': '🇨🇦', 'australia': '🇦🇺', 'nigeria': '🇳🇬', 'pakistan': '🇵🇰',
      'bangladesh': '🇧🇩', 'egypt': '🇪🇬', 'ukraine': '🇺🇦', 'cambodia': '🇰🇭',
      'myanmar': '🇲🇲', 'singapore': '🇸🇬', 'turkey': '🇹🇷', 'iran': '🇮🇷',
      'iraq': '🇮🇶', 'spain': '🇪🇸', 'italy': '🇮🇹', 'poland': '🇵🇱',
      'netherlands': '🇳🇱', 'sweden': '🇸🇪', 'norway': '🇳🇴', 'denmark': '🇩🇰',
      'finland': '🇫🇮', 'ghana': '🇬🇭', 'kenya': '🇰🇪', 'ethiopia': '🇪🇹',
      'colombia': '🇨🇴', 'argentina': '🇦🇷', 'peru': '🇵🇪', 'chile': '🇨🇱',
      'venezuela': '🇻🇪', 'nepal': '🇳🇵', 'sri lanka': '🇱🇰', 'laos': '🇱🇦',
      'portugal': '🇵🇹', 'belgium': '🇧🇪', 'switzerland': '🇨🇭', 'austria': '🇦🇹',
      'saudi arabia': '🇸🇦', 'uae': '🇦🇪', 'united arab emirates': '🇦🇪',
      'israel': '🇮🇱', 'morocco': '🇲🇦', 'tunisia': '🇹🇳', 'algeria': '🇩🇿',
      'global': '🌐', 'any': '🌐',
    };
    return flags[countryName.toLowerCase()] || '🌐';
  };

  const getServiceImg = (serviceName) => {
    if (!serviceName || services.length === 0) return null;
    const found = services.find(s => s.service_name?.toLowerCase() === serviceName?.toLowerCase());
    return found?.service_img || null;
  };

  const handleReorder = (order) => {
    const found = services.find(s => s.service_name?.toLowerCase() === order.service?.toLowerCase());
    if (found) {
        handleServiceClick(found);
    } else {
        setSearchTerm(order.service || '');
        setSheetMode('services');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-24 transition-colors duration-300 dark:bg-slate-900">
      
      {/* HEADER */}
      <div className="sticky top-0 z-30 bg-white/80 pb-4 pt-8 backdrop-blur-md dark:bg-slate-950/80 px-5 border-b border-slate-100 dark:border-slate-800">
           <div className="flex items-center justify-between">
              <div>
                  <h1 className="text-xl font-bold text-slate-800 dark:text-white">Order Baru</h1>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"><Wifi size={10} /> Data Center</span>
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
        
        {/* BUTTON GET NUMBER */}
        <button onClick={() => { setSheetMode('services'); setSearchTerm(''); }} className="w-full group relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 to-slate-800 p-6 text-left shadow-xl dark:from-blue-900 dark:to-slate-900 transition-transform active:scale-95">
            <div className="relative z-10 flex items-center justify-between">
                <div><h2 className="text-2xl font-bold text-white mb-1">Get Virtual Number</h2><p className="text-slate-300 text-sm">Pilih layanan dari 190+ negara</p></div>
                <div className="h-12 w-12 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-sm group-hover:bg-white/20 transition-all"><Plus size={24} className="text-white" /></div>
            </div>
            <div className="absolute -right-6 -bottom-6 opacity-10 rotate-12"><Smartphone size={120} className="text-white" /></div>
        </button>

        {/* INFO CARDS */}
        <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-white border border-slate-100 shadow-sm dark:bg-slate-950 dark:border-slate-800">
                <div className="p-2 w-fit rounded-lg bg-emerald-50 text-emerald-600 mb-2 dark:bg-emerald-900/20"><Server size={18} /></div>
                <p className="text-xs text-slate-400">Server Status</p>
                <p className="font-bold text-slate-700 dark:text-slate-200">Online 100%</p>
            </div>
            <div className="p-4 rounded-2xl bg-white border border-slate-100 shadow-sm dark:bg-slate-950 dark:border-slate-800">
                <div className="p-2 w-fit rounded-lg bg-blue-50 text-blue-600 mb-2 dark:bg-blue-900/20"><Globe size={18} /></div>
                <p className="text-xs text-slate-400">Total Negara</p>
                <p className="font-bold text-slate-700 dark:text-slate-200">193 Negara</p>
            </div>
        </div>

        {/* ================================================================
            KONDISI DAFTAR ORDER AKTIF ATAU EMPTY STATE
            ================================================================ */}
        {activeOrders.length > 0 ? (
            <div className="space-y-4">
                {/* Section Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></div>
                        <h3 className="font-bold text-slate-700 dark:text-slate-300 uppercase text-xs tracking-wider">
                            Pesanan Aktif ({activeOrders.length})
                        </h3>
                    </div>
                    <button
                        onClick={() => { 
                            // DITAMBAHKAN PROTEKSI SPAM REFRESH MANUAL 3 DETIK
                            if (Date.now() - lastFetchRef.current < 3000) {
                                showToast("Tunggu sebentar sebelum refresh lagi ⏳", "error");
                                return;
                            }
                            showToast("Merefresh data...", "success"); 
                            fetchInitialData(true); 
                        }}
                        className="flex items-center justify-center w-9 h-9 rounded-xl border-2 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    >
                        <RefreshCw size={15} />
                    </button>
                </div>

                {activeOrders.map((order) => {
                    const status = (order.status || '').toUpperCase();
                    const isSmsReceived = status === 'COMPLETED' || status === 'RECEIVED';
                    const remaining = getRemainingTime(order.created_at);
                    const lifetimeRemaining = getLifetimeRemaining(order.created_at);
                    const orderId = order.order_id || order.id;
                    const serviceImg = getServiceImg(order.service);
                    const otpDisplay = order.otp_code || (order.sms_content?.match(/\d+/)?.[0]) || '';

                    return (
                        <div
                            key={orderId}
                            className={`overflow-hidden rounded-3xl shadow-lg border animate-in slide-in-from-bottom duration-500 bg-white dark:bg-slate-950 ${
                                isSmsReceived
                                    ? 'border-emerald-400 ring-1 ring-emerald-400 dark:border-emerald-600 dark:ring-emerald-600'
                                    : 'border-slate-200 dark:border-slate-800'
                            }`}
                        >
                            <div className="p-4 space-y-3">

                                {/* ── ROW 1: Bendera + Nomor + Copy │ Timer 20 menit ── */}
                                <div className="flex items-center justify-between gap-2">
                                    <div className="flex items-center gap-2 min-w-0 flex-1">
                                        <span className="text-xl shrink-0 leading-none">
                                            {getCountryFlag(order.country)}
                                        </span>
                                        <span className="font-mono font-bold text-slate-800 dark:text-white text-sm truncate">
                                            {order.phone_number}
                                        </span>
                                        <button
                                            onClick={() => handleCopy(order.phone_number)}
                                            className="shrink-0 p-1.5 rounded-lg bg-slate-100 text-slate-500 hover:bg-blue-50 hover:text-blue-600 transition-colors dark:bg-slate-800 dark:hover:bg-slate-700"
                                        >
                                            <Copy size={13} />
                                        </button>
                                    </div>
                                    
                                    {/* Timer 20 menit */}
                                    <div className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold ${
                                        isSmsReceived
                                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                                            : lifetimeRemaining <= 120
                                                ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                                : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                                    }`}>
                                        <Clock size={12} />
                                        {isSmsReceived ? 'Selesai' : formatTime(lifetimeRemaining)}
                                    </div>
                                </div>

                                {/* ── ROW 2: Operator │ Harga ── */}
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-sm leading-none">
                                            🎲
                                        </div>
                                        <span className="text-sm text-slate-500 dark:text-slate-400 font-medium">any</span>
                                    </div>
                                    <div className={`px-3 py-1 rounded-xl text-xs font-bold text-white ${color.btn}`}>
                                        {order.total_price
                                            ? `Rp${order.total_price.toLocaleString('id-ID')}`
                                            : '—'
                                        }
                                    </div>
                                </div>

                                {/* ── INNER BOX: Info Layanan ── */}
                                <div className={`rounded-2xl p-3 border ${
                                    isSmsReceived
                                        ? 'bg-emerald-50 dark:bg-emerald-900/10 border-emerald-100 dark:border-emerald-900/30'
                                        : 'bg-slate-50 dark:bg-slate-900 border-slate-100 dark:border-slate-800'
                                }`}>
                                    {/* Baris atas: Gambar + Nama Layanan │ Status */}
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-2 min-w-0">
                                            {serviceImg ? (
                                                <img
                                                    src={getOptimizedImage(serviceImg)}
                                                    className="w-8 h-8 rounded-xl object-contain bg-white dark:bg-slate-800 p-1 border border-slate-100 dark:border-slate-700 shrink-0"
                                                    alt={order.service}
                                                />
                                            ) : (
                                                <div className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center shrink-0">
                                                    <Smartphone size={16} className="text-blue-600 dark:text-blue-400" />
                                                </div>
                                            )}
                                            <span className="font-bold text-slate-800 dark:text-white text-sm truncate">
                                                {order.service || 'Layanan'}
                                            </span>
                                        </div>
                                        {/* Label status */}
                                        {isSmsReceived ? (
                                            <div className="shrink-0 flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 text-xs font-bold">
                                                SMS Diterima <CheckCircle2 size={13} />
                                            </div>
                                        ) : (
                                            <div className="shrink-0 flex items-center gap-1.5 text-amber-600 dark:text-amber-400 text-xs font-bold">
                                                Menunggu <MessageSquare size={13} />
                                            </div>
                                        )}
                                    </div>

                                    {/* Baris bawah: OTP atau countdown batal */}
                                    {isSmsReceived ? (
                                        // ── TAMPILAN OTP (digit per kotak) ──
                                        <div
                                            onClick={() => handleCopy(otpDisplay || order.sms_content)}
                                            className="flex items-center justify-center gap-1.5 py-1.5 cursor-pointer active:scale-95 transition-transform"
                                        >
                                            {otpDisplay ? (
                                                otpDisplay.toString().split('').map((digit, i) => (
                                                    <div
                                                        key={i}
                                                        className="w-9 h-10 bg-white dark:bg-slate-800 rounded-xl flex items-center justify-center text-lg font-black text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 shadow-sm"
                                                    >
                                                        {digit}
                                                    </div>
                                                ))
                                            ) : (
                                                <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400 font-mono py-1">
                                                    {order.sms_content || 'SMS diterima ✓'}
                                                </p>
                                            )}
                                        </div>
                                    ) : (
                                        // ── COUNTDOWN SEBELUM BATAL ──
                                        <p className="text-xs text-slate-400 dark:text-slate-500">
                                            {remaining > 0 ? (
                                                <>
                                                    Tunggu{' '}
                                                    <span className="font-bold text-red-500">{formatTime(remaining)}</span>
                                                    {' '}sebelum klik batal.
                                                </>
                                            ) : (
                                                <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                                                    ✓ Siap dibatalkan jika diperlukan.
                                                </span>
                                            )}
                                        </p>
                                    )}
                                </div>

                                {/* ── TOMBOL AKSI ── */}
                                <div className="flex gap-3">
                                    {/* Tombol Beli Lagi (selalu tampil) */}
                                    <button
                                        onClick={() => handleReorder(order)}
                                        className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border-2 text-sm font-bold transition-colors ${color.border} ${color.text} hover:bg-slate-50 dark:hover:bg-slate-900 active:scale-95`}
                                    >
                                        <ShoppingBag size={15} /> Beli lagi
                                    </button>

                                    {/* Tombol Selesai (SMS diterima) atau Batal (masih pending) */}
                                    {isSmsReceived ? (
                                        <button
                                            onClick={() => handleCloseOrder(orderId)}
                                            className="flex-1 py-3 rounded-xl bg-slate-900 text-white font-bold text-sm hover:bg-black dark:bg-white dark:text-slate-900 transition-colors flex items-center justify-center gap-2 active:scale-95"
                                        >
                                            <CheckCircle2 size={15} /> Selesai
                                        </button>
                                    ) : (
                                        <button
                                            onClick={() => handleCancelClick(order)}
                                            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border-2 text-sm font-bold transition-colors active:scale-95 ${
                                                remaining > 0
                                                    ? 'border-slate-200 text-slate-400 cursor-not-allowed dark:border-slate-800 dark:text-slate-600'
                                                    : 'border-red-300 text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/10'
                                            }`}
                                        >
                                            <X size={15} /> Batal
                                        </button>
                                    )}
                                </div>

                            </div>
                        </div>
                    );
                })}

                <p className="text-[10px] text-slate-400 text-center mt-3">Otomatis refresh setiap 3 menit (Mode Penghematan Sistem).</p>
            </div>
        ) : (
            // ==========================================
            // TAMPILAN JIKA TIDAK ADA PESANAN (EMPTY STATE)
            // ==========================================
            <div className="flex flex-col items-center justify-center py-10 px-4 text-center rounded-3xl border border-dashed border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950/50 animate-in fade-in zoom-in duration-300">
                <div className="w-20 h-20 bg-slate-100 dark:bg-slate-900 rounded-full flex items-center justify-center mb-4">
                    <ShoppingBag size={32} className="text-slate-400 dark:text-slate-500" />
                </div>
                <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">Belum Ada Pesanan</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 max-w-[250px]">
                    Anda belum memiliki pesanan virtual number yang aktif saat ini.
                </p>
                <button 
                    onClick={() => { setSheetMode('services'); setSearchTerm(''); }}
                    className={`flex items-center gap-2 px-6 py-3 mb-6 rounded-xl text-white font-bold text-sm shadow-lg transition-transform active:scale-95 ${color.btn}`}
                >
                    <Plus size={16} /> Beli Nomor Sekarang
                </button>

                {/* Tambahan Tombol Navigasi Cepat (History & Deposit) */}
                <div className="flex gap-3 w-full max-w-[250px]">
                    <button 
                        onClick={() => navigate('/history')}
                        className={`flex-1 flex flex-col items-center justify-center gap-2 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 transition-colors active:scale-95 ${color.text} hover:border-blue-200`}
                    >
                        <History size={20} />
                        <span className="text-[10px] font-bold">Riwayat OTP</span>
                    </button>
                    
                    <button 
                        onClick={() => navigate('/deposit')}
                        className={`flex-1 flex flex-col items-center justify-center gap-2 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 transition-colors active:scale-95 ${color.text} hover:border-blue-200`}
                    >
                        <Wallet size={20} />
                        <span className="text-[10px] font-bold">Isi Saldo</span>
                    </button>
                </div>
            </div>
        )}

        {/* ================================================================
            FAQ SECTION (PERTANYAAN UMUM)
            ================================================================ */}
        <div className="mt-8 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950">
            <div className="mb-5 flex items-center gap-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-900/30">
                    <Headphones size={24} className="text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                    <h3 className="font-bold text-slate-800 dark:text-white">Pertanyaan Umum</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Pertanyaan yang sering di ajukan</p>
                </div>
            </div>

            <div className="space-y-3">
                {faqData.map((faq, index) => {
                    const isOpen = expandedFaq === index;
                    return (
                        <div key={index} className="overflow-hidden rounded-2xl border border-slate-100 transition-colors dark:border-slate-800 dark:bg-slate-900/50">
                            <button
                                onClick={() => setExpandedFaq(isOpen ? null : index)}
                                className="flex w-full items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                            >
                                <div className="flex items-center gap-3">
                                    <div className={`flex h-8 w-8 items-center justify-center rounded-full ${faq.iconBg}`}>
                                        {faq.icon}
                                    </div>
                                    <span className="text-sm font-bold text-slate-700 dark:text-slate-200">{faq.question}</span>
                                </div>
                                <div className="text-slate-400">
                                    {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                </div>
                            </button>
                            {isOpen && (
                                <div className="border-t border-slate-100 p-4 text-xs leading-relaxed text-slate-600 dark:border-slate-800 dark:text-slate-400">
                                    {faq.answer}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>

        {/* ================================================================
            KETENTUAN LAYANAN BOX
            ================================================================ */}
        <div className="mt-4 overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-br from-slate-100 to-white p-5 shadow-sm dark:border-slate-800 dark:from-slate-900 dark:to-slate-950 relative">
            <div className="relative z-10 flex items-center justify-between">
                <div className="pr-4">
                    <h3 className="mb-1 text-sm font-bold text-slate-800 dark:text-white">Baca Ketentuan Layanan</h3>
                    <p className="text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                        Hindari kesalahan dan pemotongan saldo. Pahami aturan main kami agar transaksi lancar!
                    </p>
                </div>
                <div className="shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900/30 mb-2">
                     <FileText size={24} className="text-blue-600 dark:text-blue-400"/>
                </div>
             </div>
            <button
                onClick={() => navigate('/ketentuan')}
                className={`mt-4 w-full rounded-xl py-3 text-sm font-bold text-white transition-transform active:scale-95 ${color.btn} flex justify-center items-center gap-2`}
            >
                <BookOpen size={16} /> Baca Sekarang
            </button>
        </div>

      </div>

      {/* CONFIRM MODAL & TOAST */}
      {confirmModal.show && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-5 animate-in fade-in duration-200">
              <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-sm p-6 shadow-2xl scale-100 border border-slate-100 dark:border-slate-800">
                  <div className="flex flex-col items-center text-center">
                      <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/20 rounded-full flex items-center justify-center mb-4 text-blue-600 dark:text-blue-400"><HelpCircle size={32} /></div>
                      <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">{confirmModal.title}</h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 whitespace-pre-line leading-relaxed">{confirmModal.message}</p>
                      <div className="flex gap-3 w-full">
                          {confirmModal.confirmText !== 'Saya Mengerti' && <button onClick={closeConfirm} disabled={confirmModal.loading} className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-600 font-bold text-sm hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300">Batal</button>}
                          <button onClick={confirmModal.onConfirm} disabled={confirmModal.loading} className="flex-1 py-3 rounded-xl bg-blue-600 text-white font-bold text-sm hover:bg-blue-700 flex items-center justify-center gap-2">
                              {confirmModal.loading && <Loader2 size={16} className="animate-spin" />}
                              {confirmModal.loading ? 'Memproses...' : confirmModal.confirmText}
                          </button>
                      </div>
                  </div>
              </div>
          </div>
      )}

      <div className={`fixed bottom-24 left-1/2 z-[100] flex -translate-x-1/2 transform items-center gap-3 rounded-full px-5 py-3 shadow-2xl transition-all duration-300 ${toast.show ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0 pointer-events-none'} ${toast.type === 'success' ? 'bg-slate-900 text-white' : 'bg-red-500 text-white'}`}>
          {toast.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}<span className="text-sm font-bold">{toast.message}</span>
      </div>
      
      {/* DRAWER SERVICES */}
      <div className={`fixed inset-0 z-50 bg-black/60 backdrop-blur-sm transition-opacity ${sheetMode === 'services' ? 'opacity-100 visible' : 'opacity-0 invisible'}`} onClick={() => setSheetMode(null)}></div>
      <div className={`fixed bottom-0 left-0 right-0 z-50 transform rounded-t-[2rem] bg-white shadow-2xl transition-transform duration-300 dark:bg-slate-950 max-h-[85vh] flex flex-col ${sheetMode === 'services' ? 'translate-y-0' : 'translate-y-full'}`}>
         <div className="pt-3 pb-2 px-6 bg-white dark:bg-slate-950 rounded-t-[2rem] z-10">
            <div className="mx-auto h-1.5 w-12 rounded-full bg-slate-200 mb-4 dark:bg-slate-700"></div>
            <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-100 dark:bg-slate-900 dark:border-slate-800">
                <Search size={18} className="text-slate-400" />
                <input type="text" placeholder="Cari layanan..." className="bg-transparent w-full outline-none text-sm font-medium text-slate-800 dark:text-white" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} autoFocus />
            </div>
         </div>
         <div className="flex-1 overflow-y-auto px-6 py-4 pb-10">
            {loadingServices ? (
                <div className="grid grid-cols-4 gap-4">{[...Array(12)].map((_,i) => <div key={i} className="h-20 bg-slate-100 rounded-2xl animate-pulse dark:bg-slate-900"></div>)}</div>
            ) : filteredServices.length > 0 ? (
                <div className="grid grid-cols-4 gap-x-2 gap-y-6 sm:grid-cols-5">
                    {filteredServices.map((item) => (
                        <button key={item.service_code} onClick={() => handleServiceClick(item)} className="group flex flex-col items-center gap-2">
                            <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-50 p-2 border border-slate-100 transition-all group-active:scale-95 hover:border-blue-200 dark:bg-slate-900 dark:border-slate-800">
                                <img src={getOptimizedImage(item.service_img)} className="h-full w-full object-contain" loading="lazy" />
                            </div>
                            <span className="truncate w-full text-center text-[10px] font-medium text-slate-600 dark:text-slate-400">{item.service_name}</span>
                        </button>
                    ))}
                </div>
            ) : <div className="text-center py-10 text-slate-400 font-medium">Layanan tidak ditemukan</div>}
         </div>
      </div>

      {/* DRAWER COUNTRIES */}
      <div className={`fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm transition-opacity ${sheetMode === 'countries' ? 'opacity-100 visible' : 'opacity-0 invisible'}`} onClick={() => setSheetMode('services')}></div>
      <div className={`fixed bottom-0 left-0 right-0 z-[60] transform rounded-t-[2rem] bg-white shadow-2xl transition-transform duration-300 dark:bg-slate-950 max-h-[85vh] flex flex-col ${sheetMode === 'countries' ? 'translate-y-0' : 'translate-y-full'}`}>
         <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-slate-950 rounded-t-[2rem]">
            <div className="flex items-center gap-3">
                <button onClick={() => setSheetMode('services')} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-900"><X size={20} className="text-slate-500" /></button>
                {selectedService && (<><img src={getOptimizedImage(selectedService.service_img)} className="w-8 h-8 object-contain" /><h3 className="font-bold text-slate-800 dark:text-white">{selectedService.service_name}</h3></>)}
            </div>
         </div>
         <div className={`flex-1 overflow-y-auto px-6 py-2 transition-all ${expandedCountry ? 'pb-24' : 'pb-10'}`}>
            {loadingCountries ? <div className="space-y-3 mt-4">{[1,2,3].map(i=><div key={i} className="h-16 bg-slate-100 rounded-xl animate-pulse dark:bg-slate-900"></div>)}</div> : countries.length > 0 ? (
                <div className="space-y-3 mt-4">
                    {countries.map((country) => {
                        const startPrice = country.pricelist?.[0]?.price || 0;
                        const isExpanded = expandedCountry === country.number_id;

                        return (
                            <div key={country.number_id} className="overflow-hidden rounded-xl border border-slate-100 bg-slate-50 dark:border-slate-800 dark:bg-slate-900/40">
                                <button onClick={() => toggleCountry(country)} className="w-full flex items-center justify-between p-4 hover:bg-slate-100 dark:hover:bg-slate-900">
                                    <div className="flex items-center gap-4">
                                        <img src={getOptimizedImage(country.img)} className="w-8 h-6 object-cover rounded shadow-sm" />
                                        <div className="text-left"><p className="font-bold text-slate-700 text-sm dark:text-slate-200">{country.name}</p><p className="text-xs text-blue-600 font-medium">Mulai Rp {startPrice}</p></div>
                                    </div>
                                    <div className="flex items-center gap-2"><span className="text-xs text-slate-400">Stok: {country.stock_total}</span>{isExpanded ? <ChevronUp size={16}/> : <ChevronDown size={16}/>}</div>
                                </button>
                                {isExpanded && (
                                    <div className="bg-white dark:bg-slate-950 border-t border-slate-100 dark:border-slate-800 p-4 space-y-2">
                                        {country.pricelist?.filter(p=>p.stock>0).map((srv,idx)=>(
                                            <div key={idx} className="flex justify-between p-3 rounded-xl border border-slate-100 dark:border-slate-800 hover:border-blue-200 transition-colors">
                                                <div><span className="text-xs font-bold text-slate-700 dark:text-slate-300">Server {srv.server_id}</span><p className="text-[10px] text-slate-400">Stok {srv.stock}</p></div>
                                                <div className="flex items-center gap-3"><span className="font-bold text-emerald-600 text-sm">Rp {srv.price}</span><button onClick={()=>handleBuyClick(country,srv)} className="px-4 py-1.5 bg-slate-900 text-white text-xs font-bold rounded-lg dark:bg-white dark:text-slate-900 active:scale-95 transition-transform">Beli</button></div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )
                    })}
                </div>
            ) : <div className="text-center py-10 text-slate-400">Negara tidak tersedia</div>}
         </div>

         {expandedCountry && (
             <div className="absolute bottom-0 left-0 right-0 z-20 bg-white/95 dark:bg-slate-950/95 backdrop-blur-md border-t border-slate-100 dark:border-slate-800 p-4 shadow-2xl">
                 <div className="flex items-center gap-2 mb-2 text-xs font-bold text-slate-500 uppercase tracking-tighter"><Signal size={12} /> Pilih Operator</div>
                 {loadingOperators ? <div className="flex gap-2">{[1,2,3].map(i=><div key={i} className="h-10 w-24 bg-slate-100 rounded-xl animate-pulse dark:bg-slate-900"></div>)}</div> : (
                     <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                         <button onClick={()=>setSelectedOperatorId('any')} className={`shrink-0 flex flex-col items-center justify-center w-20 h-14 rounded-xl border transition-all text-[10px] font-bold ${selectedOperatorId==='any'?'bg-blue-600 text-white border-blue-600':'bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-100 dark:border-slate-800'}`}>
                             <div className="mb-1 text-lg">🎲</div><span>Acak</span>
                         </button>
                         {currentOperators.filter(op=>op.name!=='any').map(op=>(
                             <button key={op.id} onClick={()=>setSelectedOperatorId(op.id)} className={`shrink-0 flex flex-col items-center justify-center min-w-[5rem] h-14 px-2 rounded-xl border transition-all text-[10px] font-bold ${selectedOperatorId===op.id?'bg-blue-600 text-white border-blue-600':'bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-100 dark:border-slate-800'}`}>
                                 {op.image ? <img src={getOptimizedImage(op.image)} className="w-5 h-5 rounded-full bg-white object-cover mb-1"/> : <span className="mb-1 text-lg">📡</span>}
                                 <span className="truncate max-w-full">{op.name}</span>
                             </button>
                         ))}
                     </div>
                 )}
             </div>
         )}
      </div>

      <BottomNav />
    </div>
  );
}
