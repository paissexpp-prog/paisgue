// ================================================================
// 📄 FILE PATH: src/pages/Order.jsx
// ================================================================
import React, { useState, useEffect, useRef, useMemo, useDeferredValue, memo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import { jwtDecode } from 'jwt-decode';
import api from '../utils/api';
import BottomNav from '../components/BottomNav';
import { useTheme } from '../context/ThemeContext';
import { 
  Search, CheckCircle2, AlertCircle, HelpCircle, 
  Copy, RefreshCw, Loader2, X, Bell, Globe, Headphones, Brain, Info, Bug, BookOpen, FileText, ChevronDown, ChevronUp, History, Wallet, ShoppingBag, ShoppingCart
} from 'lucide-react';

// ================================================================
// --- HELPER FUNCTIONS UNTUK TIMER ---
// ================================================================
const calculateRemainingTime = (createdAt, currentTime) => {
    if (!createdAt) return 0;
    const createdTime = new Date(createdAt).getTime();
    if (isNaN(createdTime)) return 0;
    const diffSeconds = Math.floor((currentTime - createdTime) / 1000);
    const lockDuration = 4 * 60; // 4 Menit
    const remaining = lockDuration - diffSeconds;
    return remaining > 0 ? remaining : 0;
};

const calculateLifetimeRemaining = (createdAt, currentTime) => {
    if (!createdAt) return 0;
    const createdTime = new Date(createdAt).getTime();
    if (isNaN(createdTime)) return 0;
    const diffSeconds = Math.floor((currentTime - createdTime) / 1000);
    const lifetimeDuration = 20 * 60; // 20 Menit
    const remaining = lifetimeDuration - diffSeconds;
    return remaining > 0 ? remaining : 0;
};

const formatTime = (seconds) => {
    if (isNaN(seconds) || seconds < 0) return '0:00';
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
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
    const nameLower = countryName.toLowerCase();
    return flags[nameLower] || '🌐';
};

// ================================================================
// --- KOMPONEN KARTU ORDER AKTIF ---
// ================================================================
const ActiveOrderCard = memo(({ order, onCopy, onCancel, onClose, onShowToast, onQuickReorder }) => {
    const [currentTime, setCurrentTime] = useState(Date.now());
    const [isReordering, setIsReordering] = useState(false);

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(Date.now()), 1000);
        return () => clearInterval(timer);
    }, []);

    const status = (order.status || '').toUpperCase();
    const isSmsReceived = status === 'COMPLETED' || status === 'RECEIVED';
    const remainingCancel = calculateRemainingTime(order.created_at, currentTime);
    const lifetimeRemaining = calculateLifetimeRemaining(order.created_at, currentTime);

    const otpDisplay = order.otp_code || (order.sms_content?.match(/\d+/)?.[0]) || 'Waiting';

    const handleReorderClick = async () => {
        setIsReordering(true);
        await onQuickReorder(order);
        setIsReordering(false);
    };

    return (
        <div className="bg-slate-50 dark:bg-[#151a27] rounded-[1.25rem] p-4 mb-3 border border-slate-200 dark:border-[#1e2536] shadow-sm">
            <div className="flex justify-between items-center mb-3">
                <span className="font-bold text-slate-800 dark:text-white text-[15px] capitalize tracking-wide">
                    {order.service || 'Layanan'}
                </span>
                {isSmsReceived ? (
                    <span className="px-3.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-700 dark:bg-[#1c3a2f] dark:text-[#34d399] tracking-wide">
                        Berhasil
                    </span>
                ) : (
                    <span className="px-3.5 py-1 rounded-full text-[11px] font-bold bg-amber-100 text-amber-700 dark:bg-[#3e2b1f] dark:text-[#f9a826] tracking-wide">
                        Menunggu
                    </span>
                )}
            </div>

            <div className="flex items-center gap-2 mb-2">
                {/* TOMBOL BELI LAGI (1 KLIK) SESUAI REFERENSI GAMBAR */}
                <button 
                    onClick={handleReorderClick}
                    disabled={isReordering}
                    className="flex items-center justify-center w-[26px] h-[26px] rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-[#38bdf8] hover:bg-blue-200 dark:hover:bg-blue-900/60 transition-colors disabled:opacity-50 flex-shrink-0 shadow-sm"
                    title="Beli Lagi"
                >
                    {isReordering ? <Loader2 size={13} className="animate-spin" /> : <ShoppingCart size={13} />}
                </button>
                
                <span className="text-slate-700 dark:text-slate-300 font-mono text-[15px]">{order.phone_number}</span>
                <button 
                    onClick={() => onCopy(order.phone_number)}
                    className="text-blue-500 flex items-center gap-1 text-xs hover:opacity-80 transition-opacity ml-1"
                >
                    <Copy size={13} /> <span className="font-medium">salin</span>
                </button>
            </div>

            <div className="flex items-center gap-2 mb-4 pl-[34px]">
                <span className={`text-[15px] font-mono ${isSmsReceived ? 'text-emerald-600 dark:text-[#34d399] font-bold' : 'text-slate-500 dark:text-slate-400'}`}>
                    OTP: {otpDisplay}
                </span>
                {isSmsReceived && (
                    <button 
                        onClick={() => onCopy(otpDisplay !== 'Waiting' ? otpDisplay : '')}
                        className="text-blue-500 flex items-center gap-1 text-xs hover:opacity-80 transition-opacity ml-1"
                    >
                        <Copy size={13} /> <span className="font-medium">salin</span>
                    </button>
                )}
            </div>

            <div className="flex justify-between items-center mt-1">
                <span className="text-slate-500 dark:text-slate-400 text-xs font-medium">
                    Sisa {formatTime(lifetimeRemaining)}
                </span>
                
                {isSmsReceived ? (
                    <button 
                        onClick={onClose}
                        className="border border-emerald-500/50 text-emerald-600 dark:text-[#34d399] bg-emerald-50 dark:bg-emerald-900/10 px-5 py-1.5 rounded-lg text-xs font-bold hover:bg-emerald-100 dark:hover:bg-emerald-900/30 transition-colors active:scale-95"
                    >
                        Selesai
                    </button>
                ) : (
                    <button 
                        onClick={() => {
                            if (remainingCancel > 0) {
                                onShowToast(`Belum bisa batal. Tunggu ${formatTime(remainingCancel)} lagi.`, "error");
                            } else {
                                onCancel();
                            }
                        }}
                        className={`border px-5 py-1.5 rounded-lg text-xs font-bold transition-colors active:scale-95 ${
                            remainingCancel > 0 
                                ? 'border-slate-300 text-slate-400 dark:border-slate-700 dark:text-slate-600 cursor-not-allowed'
                                : 'border-red-500/50 text-red-500 bg-red-50 dark:border-[#4c1d24] dark:text-[#f87171] dark:bg-red-900/10 hover:bg-red-100 dark:hover:bg-[#4c1d24]/50'
                        }`}
                    >
                        Batalkan
                    </button>
                )}
            </div>
        </div>
    );
});

// ================================================================
// --- KOMPONEN SERVICE ROW ---
// ================================================================
const ServiceRow = memo(({ service, onCekHarga }) => {
    return (
        <button 
            onClick={() => onCekHarga(service)}
            className="w-full bg-white dark:bg-[#151a27] rounded-[1.25rem] p-4 flex justify-between items-center border border-slate-100 dark:border-[#1e2536] shadow-sm hover:border-blue-200 dark:hover:border-blue-800/50 transition-colors active:scale-95 text-left"
        >
            <span className="font-bold text-slate-800 dark:text-white text-[15px] capitalize tracking-wide">
                {service.name}
            </span>
            <span className="bg-slate-100 text-slate-600 dark:bg-[#1e293b] dark:text-slate-300 px-4 py-1.5 rounded-full text-[11px] font-bold">
                Pilih Server
            </span>
        </button>
    );
});

// ================================================================
// --- MAIN COMPONENT ORDER ---
// ================================================================
export default function Order() {
  const { color } = useTheme();
  const navigate = useNavigate();

  const [balance, setBalance] = useState(0);
  const [activeOrders, setActiveOrders] = useState([]);

  // Data State V2
  const [v2Countries, setV2Countries] = useState([]);
  const [v2Services, setV2Services] = useState([]);
  const [loadingV2Countries, setLoadingV2Countries] = useState(true);
  const [loadingV2Services, setLoadingV2Services] = useState(false);
  
  // Selection & Search State
  const [selectedV2Country, setSelectedV2Country] = useState(null);
  const [countrySearch, setCountrySearch] = useState('');
  const [serviceSearch, setServiceSearch] = useState('');
  const deferredServiceSearch = useDeferredValue(serviceSearch);
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);

  // Modal Server State
  const [serverModal, setServerModal] = useState({
      show: false,
      service: null,
      servers: [],
      loading: false,
      processingId: null
  });

  // Notifications State
  const [isNotificationEnabled, setIsNotificationEnabled] = useState(
      localStorage.getItem('ruangotp_notifications') === 'true'
  );
  const [browserPermission, setBrowserPermission] = useState(
      'Notification' in window ? Notification.permission : 'default'
  );

  // Modals & UI Controls
  const [confirmModal, setConfirmModal] = useState({ show: false, title: '', message: '', onConfirm: null, loading: false, confirmText: 'Ya, Lanjutkan' });
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [expandedFaq, setExpandedFaq] = useState(null);

  const lastFetchRef = useRef(0);
  const dropdownRef = useRef(null);

  const V2_COUNTRIES_CACHE_KEY  = 'otp_v2_countries';
  const V2_COUNTRIES_CACHE_TIME = 'otp_v2_countries_time';
  const V2_SERVICES_PREFIX      = 'otp_v2_srv_';
  const V2_SERVICES_TIME_PREFIX = 'otp_v2_srv_time_';
  const V2_CACHE_DURATION       = 60 * 60 * 1000; // 1 Jam

  // Handle Klik di luar dropdown negara untuk menutupnya
  useEffect(() => {
      const handleClickOutside = (event) => {
          if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
              setShowCountryDropdown(false);
          }
      };
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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
      icon: <Globe size={18} className="text-blue-500" />,
      iconBg: 'bg-blue-500/20',
      question: 'Syarat refund',
      answer: 'Saldo akan otomatis direfund sepenuhnya ke akun Anda apabila order dibatalkan (cancel) sebelum SMS OTP berhasil diterima oleh sistem.'
    }
  ];

  const triggerNotification = (title, options) => {
      try {
          if ('serviceWorker' in navigator && 'PushManager' in window) {
              navigator.serviceWorker.ready.then((registration) => {
                  registration.showNotification(title, options);
              }).catch(() => {
                  const n = new Notification(title, options);
                  n.onclick = () => { window.focus(); n.close(); };
              });
          } else {
              const n = new Notification(title, options);
              n.onclick = () => { window.focus(); n.close(); };
          }
      } catch (err) {
          console.error("Gagal trigger notif:", err);
      }
  };

  useEffect(() => {
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/sw.js').catch(err => console.log('SW Reg Error:', err));
    }

    fetchInitialData();
    loadV2Countries();
    
    const interval = setInterval(() => {
        if (!document.hidden) fetchInitialData(true); 
    }, 180000);

    const handleVisibilityChange = () => {
        if (!document.hidden && Date.now() - lastFetchRef.current > 15000) {
            fetchInitialData(true);
        }
    };
  
    document.addEventListener('visibilitychange', handleVisibilityChange);

    let userId = null;
    try {
        const token = localStorage.getItem('token');
        if (token) userId = jwtDecode(token)?.userId || null;
    } catch (e) {}

    const socket = io('https://api.ruangotp.net', {
        auth: { userId },
        transports: ['websocket'],
        reconnectionAttempts: 5,
        reconnectionDelay: 3000,
    });

    socket.on('otp_received', (data) => {
        if (data && data.order_id) {
            setActiveOrders(prevOrders => {
                if (!Array.isArray(prevOrders)) return [];
                return prevOrders.map(order => {
                    const orderId = order.order_id || order.id;
                    if (orderId === data.order_id) {
                        return {
                            ...order,
                            status: data.status || 'COMPLETED',
                            otp_code: data.otp_code || order.otp_code,
                            sms_content: data.sms_content || order.sms_content
                        };
                    }
                    return order;
                });
            });

            const isNotifyOn = localStorage.getItem('ruangotp_notifications') === 'true';
            if (isNotifyOn && 'Notification' in window && Notification.permission === 'granted') {
                const otpCode = data.otp_code || (data.sms_content?.match(/\d+/)?.[0]) || '';
                const serviceName = data.service || 'WhatsApp'; 
                const message = data.sms_content || `<#> Kode ${serviceName}: ${otpCode}\nJangan bagikan kode ini.`;

                triggerNotification(serviceName, {
                    body: message,
                    icon: "https://cdn.nekohime.site/file/HsGrgzQf.jpeg",
                    badge: "https://cdn.nekohime.site/file/HsGrgzQf.jpeg",
                    tag: data.order_id || 'otp-update',
                    vibrate: [200, 100, 200, 100, 200, 100, 200], 
                    requireInteraction: true 
                });
            }
        }
        fetchInitialData(true);
    });

    return () => {
        clearInterval(interval);
        document.removeEventListener('visibilitychange', handleVisibilityChange);
        socket.disconnect();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchInitialData = async (silent = false) => {
    lastFetchRef.current = Date.now();
    try {
      const resUser = await api.get('/auth/me');
      if (resUser.data.success) setBalance(resUser.data.data.balance);

      const resHistory = await api.get('/history/list/order');
      if (resHistory.data.success && Array.isArray(resHistory.data.data)) {
         const filteredOrders = resHistory.data.data;
         setActiveOrders(prevOrders => {
             if(!Array.isArray(prevOrders)) return filteredOrders;
             return filteredOrders.map(fetchedOrder => {
                 const fetchedId = fetchedOrder.order_id || fetchedOrder.id;
                 const existingOrder = prevOrders.find(o => (o.order_id || o.id) === fetchedId);
                 if (existingOrder) {
                     return { ...fetchedOrder, sms_content: fetchedOrder.sms_content || fetchedOrder.sms || existingOrder.sms_content };
                 }
                 return fetchedOrder;
             });
         });
      }
    } catch (e) {}
  };

  const loadV2Countries = async () => {
      setLoadingV2Countries(true);
      const cached = localStorage.getItem(V2_COUNTRIES_CACHE_KEY);
      const cachedTime = localStorage.getItem(V2_COUNTRIES_CACHE_TIME);
      const now = Date.now();

      let countryList = [];

      if (cached && cachedTime && (now - parseInt(cachedTime, 10) < V2_CACHE_DURATION)) {
          try {
              const parsed = JSON.parse(cached);
              if (Array.isArray(parsed) && (parsed.length === 0 || (parsed[0] && typeof parsed[0] === 'object' && 'id' in parsed[0]))) {
                  countryList = parsed;
              }
          } catch(e) {
              localStorage.removeItem(V2_COUNTRIES_CACHE_KEY);
          }
      }
      
      if (countryList.length === 0) {
          try {
              const res = await api.get('/country-v2/list');
              if (res.data.success && Array.isArray(res.data.data)) {
                  countryList = res.data.data;
                  localStorage.setItem(V2_COUNTRIES_CACHE_KEY, JSON.stringify(res.data.data));
                  localStorage.setItem(V2_COUNTRIES_CACHE_TIME, now.toString());
              }
          } catch (err) {
              showToast("Gagal memuat daftar negara", "error");
          }
      }

      setV2Countries(countryList);
      setLoadingV2Countries(false);

      if (countryList.length > 0) {
          const indo = countryList.find(c => (c.name || '').toLowerCase() === 'indonesia');
          if (indo) {
              handleSelectCountry(indo);
          } else {
              handleSelectCountry(countryList[0]);
          }
      }
  };

  const handleSelectCountry = async (country) => {
      setSelectedV2Country(country);
      setShowCountryDropdown(false);
      setCountrySearch('');
      setServiceSearch('');
      setV2Services([]);
      setLoadingV2Services(true);

      const cacheKey = V2_SERVICES_PREFIX + country.id;
      const cacheTime = V2_SERVICES_TIME_PREFIX + country.id;
      const now = Date.now();

      try {
          const cached = localStorage.getItem(cacheKey);
          const cachedTimeVal = localStorage.getItem(cacheTime);
          
          if (cached && cachedTimeVal && (now - parseInt(cachedTimeVal, 10) < V2_CACHE_DURATION)) {
              try {
                  const parsed = JSON.parse(cached);
                  if (Array.isArray(parsed) && (parsed.length === 0 || (parsed[0] && typeof parsed[0] === 'object' && 'code' in parsed[0]))) {
                      setV2Services(parsed);
                      setLoadingV2Services(false);
                      return;
                  }
              } catch(e) {
                  localStorage.removeItem(cacheKey);
              }
          } 
          
          const res = await api.get(`/services-v2/list?country=${country.id}`);
          if (res.data.success && Array.isArray(res.data.data)) {
              setV2Services(res.data.data);
              localStorage.setItem(cacheKey, JSON.stringify(res.data.data));
              localStorage.setItem(cacheTime, now.toString());
          }
      } catch (err) {
          showToast("Gagal memuat daftar layanan", "error");
      } finally {
          setLoadingV2Services(false);
      }
  };

  const handleCekHarga = async (service) => {
      if (!selectedV2Country) return showToast("Pilih negara terlebih dahulu", "error");
      
      setServerModal({ show: true, service: service, servers: [], loading: true, processingId: null });
      
      const cacheKey = `otp_v2_price_${service.code}_${selectedV2Country.id}`;
      const cacheTime = `otp_v2_price_time_${service.code}_${selectedV2Country.id}`;
      const now = Date.now();

      try {
          const cached = localStorage.getItem(cacheKey);
          const cachedTimeVal = localStorage.getItem(cacheTime);
          if (cached && cachedTimeVal && (now - parseInt(cachedTimeVal, 10) < 120000)) { 
              const parsedData = JSON.parse(cached);
              if (parsedData && parsedData.server && parsedData.server.length > 0) {
                  setServerModal(prev => ({ ...prev, servers: parsedData.server, loading: false }));
                  return;
              }
          }

          const res = await api.get(`/cekharga-v2/info?service=${service.code}&country=${selectedV2Country.id}`);
          if (res.data.success || res.data.status) {
              if (res.data.server && res.data.server.length > 0) {
                  setServerModal(prev => ({ ...prev, servers: res.data.server, loading: false }));
                  localStorage.setItem(cacheKey, JSON.stringify(res.data));
                  localStorage.setItem(cacheTime, now.toString());
              } else {
                  setServerModal(prev => ({ ...prev, show: false, loading: false }));
                  showToast("Stok kosong untuk layanan ini.", "error");
              }
          } else {
              setServerModal(prev => ({ ...prev, show: false, loading: false }));
              showToast(res.data.message || "Gagal cek harga", "error");
          }
      } catch (err) {
          setServerModal(prev => ({ ...prev, show: false, loading: false }));
          showToast("Gagal memuat harga", "error");
      }
  };

  const executeBuyV2 = async (serverData) => {
      const service = serverModal.service;
      if (!service || !selectedV2Country || !serverData) return;
      if (balance < serverData.harga) {
          return showToast("Saldo tidak mencukupi untuk membeli layanan ini!", "error");
      }

      setServerModal(prev => ({ ...prev, processingId: serverData.id }));
      showToast("Sedang memproses pesanan...", "success");

      try {
          const res = await api.get(`/order-v2/buy?service=${service.code}&country=${selectedV2Country.id}&expected_price=${serverData.harga}&provider_id=${serverData.id}`);
          
          if (res.data.success || res.data.status) {
              setServerModal(prev => ({ ...prev, show: false, processingId: null }));
              showToast("Pesanan berhasil dibuat!", "success");
              fetchInitialData();
          } else {
              setServerModal(prev => ({ ...prev, processingId: null }));
              showToast(res.data.message || "Order Gagal", "error");
          }
      } catch (err) {
          setServerModal(prev => ({ ...prev, processingId: null }));
          const errorMsg = err.response?.data?.message || err.response?.data?.error?.message || "Gagal memproses order, coba lagi.";
          showToast(errorMsg, "error");
          fetchInitialData(true);
      }
  };

  // --- QUICK REORDER LOGIC (BELI LAGI) ---
  const handleQuickReorder = async (order) => {
      let countryId = order.country;
      
      if (!countryId || isNaN(countryId)) {
          const foundCountry = v2Countries.find(c => 
              String(c.id) === String(order.country) || 
              (c.name || '').toLowerCase() === (order.countryName || order.country || '').toLowerCase()
          );
          if (foundCountry) countryId = foundCountry.id;
      }
      
      if (!countryId) {
          showToast("Gagal mengidentifikasi negara untuk pesanan ini.", "error");
          return;
      }

      let serviceCode = order.service_code;
      if (!serviceCode) {
          try {
              const resSrv = await api.get(`/services-v2/list?country=${countryId}`);
              if (resSrv.data.success && Array.isArray(resSrv.data.data)) {
                  const foundSrv = resSrv.data.data.find(s => (s.name || '').toLowerCase() === (order.service || '').toLowerCase());
                  if (foundSrv) serviceCode = foundSrv.code;
              }
          } catch (e) {}
      }
      if (!serviceCode) serviceCode = order.service;

      try {
          const resPrice = await api.get(`/cekharga-v2/info?service=${serviceCode}&country=${countryId}`);
          
          if (resPrice.data.success || resPrice.data.status) {
              if (resPrice.data.server && resPrice.data.server.length > 0) {
                  let targetServer = resPrice.data.server.find(s => String(s.id) === String(order.provider_id)) || resPrice.data.server[0];
                  
                  if (balance < targetServer.harga) {
                       showToast("Saldo tidak mencukupi untuk Beli Lagi!", "error");
                       return;
                  }
                  
                  const resBuy = await api.get(`/order-v2/buy?service=${serviceCode}&country=${countryId}&expected_price=${targetServer.harga}&provider_id=${targetServer.id}`);
                  
                  if (resBuy.data.success || resBuy.data.status) {
                      showToast("Berhasil Beli Lagi!", "success");
                      fetchInitialData();
                  } else {
                      showToast(resBuy.data.message || "Gagal Beli Lagi", "error");
                  }
              } else {
                  showToast("Stok kosong untuk layanan ini.", "error");
              }
          } else {
              showToast(resPrice.data.message || "Gagal cek harga untuk reorder", "error");
          }
      } catch (err) {
           const errorMsg = err.response?.data?.message || err.response?.data?.error?.message || "Terjadi kesalahan saat memproses Beli Lagi";
           showToast(errorMsg, "error");
           fetchInitialData(true);
      }
  };

  // --- GENERAL HANDLERS ---
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
      showToast("Berhasil disalin!", "success");
  };

  const handleCancelClick = (order) => {
     showConfirm("Batalkan Pesanan?", "Yakin batalkan pesanan? Saldo akan dikembalikan otomatis.", async () => {
         setConfirmModal(prev => ({ ...prev, loading: true }));
         try {
            const targetId = order.order_id || order.id || '';
            const cancelUrl = order.version === 'v3'
                ? `/orders-v3/cancel?order_id=${targetId}`
                : order.version === 'v2' 
                    ? `/order-v2/cancel?order_id=${targetId}` 
                    : `/orders/cancel?order_id=${targetId}`; 

            await api.get(cancelUrl);
            setActiveOrders(prev => {
                if(!Array.isArray(prev)) return [];
                return prev.filter(o => (o.order_id || o.id) !== targetId)
            });
            
            closeConfirm();
            showToast("Pesanan dibatalkan", "success");
            fetchInitialData();
         } catch(e) { 
            closeConfirm();
            const errorMsg = e.response?.data?.error?.message || e.response?.data?.message || "Gagal membatalkan pesanan";
            showToast(errorMsg, "error");
            fetchInitialData(true);
         }
     });
  };

  const handleCloseOrder = async (orderId) => {
      setActiveOrders(prev => {
          if(!Array.isArray(prev)) return [];
          return prev.filter(o => (o.order_id || o.id) !== orderId)
      });
      let attempt = 0;
      while (attempt < 3) {
          try {
              await api.post('/cekselesai/tutup', { order_id: orderId });
              break;
          } catch (err) {
              attempt++;
              if (attempt < 3) await new Promise(resolve => setTimeout(resolve, 2000));
          }
      }
  };

  const enableNotification = async () => {
    if (!('Notification' in window)) {
        return showToast("Browser Anda tidak mendukung notifikasi", "error");
    }
    
    if (Notification.permission === 'granted') {
        setIsNotificationEnabled(true);
        localStorage.setItem('ruangotp_notifications', 'true');
        setBrowserPermission('granted');
        showToast("Notifikasi diaktifkan", "success");
    } else if (Notification.permission !== 'denied') {
        const permission = await Notification.requestPermission();
        setBrowserPermission(permission);
        if (permission === 'granted') {
            setIsNotificationEnabled(true);
            localStorage.setItem('ruangotp_notifications', 'true');
            showToast("Notifikasi diaktifkan", "success");
        } else {
            showToast("Izin notifikasi ditolak oleh browser", "error");
        }
    } else {
        showToast("Silakan izinkan notifikasi di pengaturan browser Anda", "error");
    }
  };

  const disableNotification = () => {
      setIsNotificationEnabled(false);
      localStorage.setItem('ruangotp_notifications', 'false');
      showToast("Notifikasi dimatikan", "success");
  };

  const filteredCountries = useMemo(() => {
      if (!Array.isArray(v2Countries)) return [];
      return v2Countries.filter(c => (c.name || '').toLowerCase().includes(countrySearch.toLowerCase()));
  }, [v2Countries, countrySearch]);

  const filteredServices = useMemo(() => {
      if (!Array.isArray(v2Services)) return [];
      return v2Services.filter(s => (s.name || '').toLowerCase().includes(deferredServiceSearch.toLowerCase()));
  }, [v2Services, deferredServiceSearch]);


  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0b1120] pb-24 font-sans selection:bg-blue-500/30">
      
      {/* HEADER: Sesuai referensi UI */}
      <div className="sticky top-0 z-30 bg-white/90 dark:bg-[#0b1120]/90 backdrop-blur-lg px-5 py-4 flex items-center justify-between border-b border-slate-200 dark:border-slate-800/60">
          <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">Beli Nomor</h1>
          </div>
          <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 bg-blue-100/60 dark:bg-blue-900/30 text-blue-700 dark:text-[#38bdf8] px-3.5 py-1.5 rounded-full shadow-inner border border-blue-200/50 dark:border-blue-800/40">
                  <Wallet size={14} className="opacity-80" />
                  <span className="text-xs font-black tracking-wide">Rp {balance.toLocaleString('id-ID')}</span>
              </div>
          </div>
      </div>

      <div className="px-5 mt-5 space-y-6">

        {/* SECTION: PESANAN AKTIF */}
        {Array.isArray(activeOrders) && activeOrders.length > 0 && (
            <div className="animate-in fade-in slide-in-from-top-4 duration-500">
                <div className="flex items-center justify-between mb-3">
                    <h3 className="font-bold text-slate-700 dark:text-slate-300 text-sm tracking-wide">Pesanan Aktif ({activeOrders.length})</h3>
                    <button
                        onClick={() => { 
                             if (Date.now() - lastFetchRef.current < 3000) return showToast("Tunggu sebentar", "error");
                             showToast("Merefresh data...", "success");
                             fetchInitialData(true); 
                        }}
                        className="text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors p-1"
                    >
                        <RefreshCw size={15} />
                    </button>
                </div>
                
                <div className="flex flex-col">
                    {activeOrders.map(order => (
                        <ActiveOrderCard
                            key={order.order_id || order.id}
                            order={order}
                            onCopy={handleCopy}
                            onCancel={() => handleCancelClick(order)}
                            onClose={() => handleCloseOrder(order.order_id || order.id)}
                            onShowToast={showToast}
                            onQuickReorder={handleQuickReorder}
                        />
                    ))}
                </div>
            </div>
        )}

        {/* SECTION: FORM ORDER */}
        <div className="bg-white dark:bg-[#111827] rounded-[1.5rem] p-5 shadow-sm border border-slate-200 dark:border-slate-800/60">
            
            {/* Input Negara */}
            <div className="mb-4" ref={dropdownRef}>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Negara</label>
                <div className="relative">
                    <div 
                        onClick={() => setShowCountryDropdown(true)}
                        className="w-full bg-slate-50 dark:bg-[#151b2b] border border-slate-200 dark:border-[#1e2536] rounded-xl px-4 py-3.5 flex items-center gap-3 cursor-text transition-colors focus-within:border-blue-400 dark:focus-within:border-blue-600"
                    >
                        <Search size={18} className="text-slate-400 shrink-0" />
                        {!showCountryDropdown && selectedV2Country ? (
                            <div className="flex items-center gap-2 flex-1 min-w-0">
                                <span className="text-[15px]">{getCountryFlag(selectedV2Country.name)}</span>
                                <span className="text-slate-800 dark:text-white text-sm font-semibold truncate">{selectedV2Country.name}</span>
                            </div>
                        ) : (
                            <input 
                                type="text" 
                                placeholder="Cari negara..." 
                                className="bg-transparent border-none outline-none w-full text-sm font-semibold text-slate-800 dark:text-white placeholder:text-slate-400"
                                value={countrySearch}
                                onChange={(e) => setCountrySearch(e.target.value)}
                                autoFocus={showCountryDropdown}
                            />
                        )}
                        <ChevronDown size={18} className="text-slate-400 shrink-0" />
                    </div>

                    {/* Dropdown Negara list */}
                    {showCountryDropdown && (
                        <div className="absolute z-20 w-full mt-2 bg-white dark:bg-[#151b2b] border border-slate-200 dark:border-[#1e2536] rounded-xl shadow-2xl max-h-60 overflow-y-auto overflow-x-hidden hide-scrollbar animate-in fade-in zoom-in-95 duration-100">
                            {loadingV2Countries ? (
                                <div className="p-4 text-center text-slate-500 text-sm">Memuat negara...</div>
                            ) : filteredCountries.length > 0 ? (
                                filteredCountries.map(country => (
                                    <button 
                                        key={country.id}
                                        onClick={() => handleSelectCountry(country)}
                                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 dark:hover:bg-[#1e2536] transition-colors text-left border-b border-slate-100 dark:border-[#1e2536]/50 last:border-0"
                                    >
                                        <span className="text-xl">{getCountryFlag(country.name)}</span>
                                        <span className="text-slate-800 dark:text-slate-200 text-sm font-medium truncate">{country.name}</span>
                                        {selectedV2Country?.id === country.id && <CheckCircle2 size={16} className="text-blue-500 ml-auto" />}
                                    </button>
                                ))
                            ) : (
                                <div className="p-4 text-center text-slate-500 text-sm">Negara tidak ditemukan.</div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Input Pencarian Layanan */}
            <div className="mb-5">
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Layanan</label>
                <div className="relative">
                    <div className="w-full bg-slate-50 dark:bg-[#151b2b] border border-slate-200 dark:border-[#1e2536] rounded-xl px-4 py-3.5 flex items-center gap-3 transition-colors focus-within:border-blue-400 dark:focus-within:border-blue-600">
                        <Search size={18} className="text-slate-400 shrink-0" />
                        <input 
                            type="text" 
                            placeholder="Cari layanan (whatsapp, telegram, ...)" 
                            className="bg-transparent border-none outline-none w-full text-sm font-semibold text-slate-800 dark:text-white placeholder:text-slate-400"
                            value={serviceSearch}
                            onChange={(e) => setServiceSearch(e.target.value)}
                            disabled={!selectedV2Country || loadingV2Services}
                        />
                    </div>
                </div>
            </div>

            {/* List Data Layanan (Tanpa Text Stok) */}
            <div className="flex flex-col gap-3 min-h-[200px]">
                {!selectedV2Country ? (
                    <div className="text-center py-10 text-slate-400 dark:text-slate-500 text-sm border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
                        Silakan pilih negara terlebih dahulu.
                    </div>
                ) : loadingV2Services ? (
                    <div className="flex justify-center items-center py-10">
                        <Loader2 size={24} className="animate-spin text-blue-500" />
                    </div>
                ) : filteredServices.length > 0 ? (
                    filteredServices.slice(0, 50).map((service) => (
                        <ServiceRow 
                            key={service.code}
                            service={service}
                            onCekHarga={handleCekHarga}
                        />
                    ))
                ) : (
                    <div className="text-center py-10 text-slate-400 dark:text-slate-500 text-sm border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
                        Layanan tidak ditemukan.
                    </div>
                )}
                
                {filteredServices.length > 50 && (
                    <div className="text-center py-3 text-xs text-slate-400">
                        Menampilkan 50 data teratas. Gunakan pencarian untuk hasil spesifik.
                    </div>
                )}
            </div>
        </div>

        {/* Notifikasi Real-time Settings */}
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800/60 dark:bg-[#111827]">
            <div className="mb-5 flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 dark:bg-[#151b2b] border border-blue-100 dark:border-[#1e2536]">
                    <Bell size={20} className="text-blue-600 dark:text-[#38bdf8]" />
                </div>
                <div>
                    <h3 className="font-bold text-slate-800 dark:text-white text-sm">Notifikasi OTP</h3>
                    <div className="flex items-center gap-2 mt-0.5">
                        <span className={`relative flex h-2 w-2`}>
                            {isNotificationEnabled && browserPermission === 'granted' && (
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            )}
                            <span className={`relative inline-flex rounded-full h-2 w-2 ${isNotificationEnabled && browserPermission === 'granted' ? 'bg-emerald-500' : 'bg-slate-400'}`}></span>
                        </span>
                        <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                            {isNotificationEnabled && browserPermission === 'granted' ? 'Aktif' : 'Tidak Aktif'}
                        </span>
                    </div>
                </div>
            </div>

            <div className="flex gap-3 w-full">
                <button
                    onClick={enableNotification}
                    className={`flex-1 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-transform active:scale-95 border ${
                        isNotificationEnabled && browserPermission === 'granted'
                        ? 'bg-slate-50 border-slate-200 text-slate-400 dark:bg-[#151a27] dark:border-[#1e2536] dark:text-slate-500 cursor-default'
                        : 'bg-white border-blue-200 text-blue-600 hover:bg-blue-50 dark:bg-[#151a27] dark:border-blue-900/50 dark:text-[#38bdf8] dark:hover:bg-[#1e293b]'
                    }`}
                >
                    <RefreshCw size={14} /> Izinkan Browser
                </button>
                <button
                    onClick={disableNotification}
                    className={`flex-1 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-transform active:scale-95 ${
                        !isNotificationEnabled
                        ? 'bg-slate-50 border border-slate-200 text-slate-400 dark:bg-[#151a27] dark:border-[#1e2536] dark:text-slate-500 cursor-default'
                        : 'bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 dark:bg-red-900/10 dark:border-[#4c1d24] dark:text-[#f87171] dark:hover:bg-red-900/20'
                    }`}
                >
                    Matikan
                </button>
            </div>
        </div>

        {/* FAQ SECTION */}
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800/60 dark:bg-[#111827]">
            <div className="mb-4 flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 dark:bg-[#151b2b] border border-blue-100 dark:border-[#1e2536]">
                    <HelpCircle size={20} className="text-blue-600 dark:text-[#38bdf8]" />
                </div>
                <div>
                    <h3 className="font-bold text-slate-800 dark:text-white text-sm">Pertanyaan Umum</h3>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">Seputar pemesanan OTP</p>
                </div>
            </div>

            <div className="space-y-2">
                {faqData.map((faq, index) => {
                    const isOpen = expandedFaq === index;
                    return (
                        <div key={index} className="overflow-hidden rounded-xl border border-slate-100 transition-colors dark:border-slate-800/60 dark:bg-[#151a27]">
                            <button
                                onClick={() => setExpandedFaq(isOpen ? null : index)}
                                className="flex w-full items-center justify-between p-3.5 hover:bg-slate-50 dark:hover:bg-[#1e2536]/50"
                            >
                                <div className="flex items-center gap-3">
                                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">{faq.question}</span>
                                </div>
                                <div className="text-slate-400">
                                    {isOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                                </div>
                            </button>
                            {isOpen && (
                                <div className="px-3.5 pb-3.5 pt-0 text-[11px] leading-relaxed text-slate-500 dark:text-slate-400">
                                    {faq.answer}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>

        <div className="h-6"></div> {/* Spacer bottom */}
      </div>

      {/* ================================================================
          MODAL PILIHAN SERVER (Gaya Card Operator Horizontal)
          ================================================================ */}
      {serverModal.show && (
          <div 
              className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-5 animate-in fade-in duration-200" 
              onClick={() => !serverModal.processingId && setServerModal(prev => ({...prev, show: false}))}
          >
              <div 
                  className="bg-[#111827] rounded-[2rem] w-full max-w-sm p-6 shadow-2xl scale-100 border border-slate-800" 
                  onClick={e => e.stopPropagation()}
              >
                  <div className="flex items-center justify-between mb-5">
                      <h3 className="text-lg font-bold text-white tracking-wide">Pilih Server</h3>
                      <button 
                          onClick={() => !serverModal.processingId && setServerModal(prev => ({...prev, show: false}))} 
                          className="text-slate-400 hover:text-white transition-colors"
                      >
                          <X size={20} />
                      </button>
                  </div>

                  {serverModal.loading ? (
                      <div className="flex gap-4 overflow-x-auto hide-scrollbar pb-2">
                          {[1,2,3].map(i => (
                              <div key={i} className="min-w-[120px] min-h-[145px] bg-slate-800 animate-pulse rounded-2xl shrink-0"></div>
                          ))}
                      </div>
                  ) : serverModal.servers.length > 0 ? (
                      <div className="flex gap-4 overflow-x-auto hide-scrollbar pb-2 -mx-2 px-2">
                          {serverModal.servers.map((srv, idx) => {
                              const isProcessing = serverModal.processingId === srv.id;
                              const isRecommended = idx === 0; // Server Pertama mendapat Label Rekomendasi
                              
                              return (
                                  <button
                                      key={srv.id}
                                      onClick={() => executeBuyV2(srv)}
                                      disabled={serverModal.processingId !== null || srv.stok <= 0}
                                      className={`min-w-[120px] min-h-[145px] bg-white rounded-2xl p-3 flex flex-col items-center justify-between shrink-0 relative overflow-hidden transition-transform active:scale-95 border border-slate-100 ${isProcessing ? 'opacity-90 scale-95' : serverModal.processingId !== null || srv.stok <= 0 ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-md hover:border-blue-300'}`}
                                  >
                                      <div className="h-5 w-full flex justify-center">
                                          {isRecommended && (
                                              <span className="text-[9px] font-black tracking-wider uppercase bg-amber-100 text-amber-600 px-2 py-0.5 rounded-full">
                                                  Rekomendasi
                                              </span>
                                          )}
                                      </div>
                                      
                                      <div className="flex-1 flex flex-col items-center justify-center w-full my-1">
                                          <span className="font-black text-slate-800 text-base">Rp {srv.harga.toLocaleString('id-ID')}</span>
                                          <span className={`text-[10px] font-semibold mt-1 ${srv.stok > 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                                              Stok: {srv.stok}
                                          </span>
                                          
                                          {/* TINGKAT OTP RATE (Jika Tidak Null) */}
                                          {srv.tingkat_otp != null && (
                                              <span className="text-[9px] font-bold mt-1 bg-blue-50 text-blue-600 px-2 py-0.5 rounded-md flex items-center gap-1">
                                                  ⚡ {srv.tingkat_otp}% Rate
                                              </span>
                                          )}
                                      </div>
                                      
                                      <span className="font-bold text-slate-500 text-xs w-full text-center truncate mt-1">
                                          {srv.label}
                                      </span>

                                      {isProcessing && (
                                          <div className="absolute inset-0 bg-white/80 backdrop-blur-[2px] flex items-center justify-center rounded-2xl">
                                              <Loader2 size={28} className="animate-spin text-blue-600" />
                                          </div>
                                      )}
                                  </button>
                              );
                          })}
                      </div>
                  ) : (
                      <div className="text-center py-6 text-slate-400 text-sm">Tidak ada server tersedia.</div>
                  )}
              </div>
          </div>
      )}

      {/* CONFIRM MODAL GLOBAL */}
      {confirmModal.show && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-5 animate-in fade-in duration-200">
              <div className="bg-white dark:bg-[#111827] rounded-3xl w-full max-w-sm p-6 shadow-2xl border border-slate-100 dark:border-slate-800">
                  <div className="flex flex-col items-center text-center">
                      <div className="w-16 h-16 bg-blue-50 dark:bg-[#151b2b] border border-blue-100 dark:border-[#1e2536] rounded-full flex items-center justify-center mb-4 text-blue-600 dark:text-[#38bdf8]"><HelpCircle size={32} /></div>
                      <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">{confirmModal.title}</h3>
                      <p className="text-[13px] text-slate-500 dark:text-slate-400 mb-6 whitespace-pre-line leading-relaxed">{confirmModal.message}</p>
                      <div className="flex gap-3 w-full">
                          {confirmModal.confirmText !== 'Saya Mengerti' && (
                              <button onClick={closeConfirm} disabled={confirmModal.loading} className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-[#1e2536] transition-colors">Batal</button>
                          )}
                          <button onClick={confirmModal.onConfirm} disabled={confirmModal.loading} className="flex-1 py-3 rounded-xl bg-blue-600 text-white font-bold text-xs hover:bg-blue-700 dark:bg-[#0284c7] dark:hover:bg-[#0369a1] flex items-center justify-center gap-2 transition-colors">
                              {confirmModal.loading && <Loader2 size={14} className="animate-spin" />}
                              {confirmModal.loading ? 'Memproses...' : confirmModal.confirmText}
                          </button>
                      </div>
                  </div>
              </div>
          </div>
      )}

      {/* TOAST NOTIFICATION */}
      <div className={`fixed bottom-24 left-1/2 z-[150] flex w-max max-w-[90vw] -translate-x-1/2 transform items-center gap-3 rounded-full px-5 py-3 shadow-2xl transition-all duration-300 ${toast.show ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0 pointer-events-none'} ${toast.type === 'success' ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900' : 'bg-red-500 text-white'}`}>
          {toast.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
          <span className="text-xs font-bold">{toast.message}</span>
      </div>

      <BottomNav />
    </div>
  );
}