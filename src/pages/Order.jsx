import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import BottomNav from '../components/BottomNav';
import { useTheme } from '../context/ThemeContext';
import { 
  Search, Wifi, X, ShoppingBag, Trash2, Repeat, Plus, 
  ChevronRight, ChevronDown, ChevronUp, Server, Globe, 
  Smartphone, Loader2, CheckCircle2, AlertCircle, HelpCircle, 
  Signal, Clock, Timer, Copy, MessageSquare 
} from 'lucide-react';

export default function Order() {
  const { color } = useTheme();
  const navigate = useNavigate();

  // --- STATE DATA ---
  const [balance, setBalance] = useState(0);
  const [ping, setPing] = useState(0);
  
  // Perbaikan: Gunakan Array agar bisa menampung banyak pesanan sekaligus
  const [activeOrders, setActiveOrders] = useState([]); 
  
  const [services, setServices] = useState([]);
  const [filteredServices, setFilteredServices] = useState([]);
  const [countries, setCountries] = useState([]);

  // Logika Anti-Muncul Lagi: Simpan ID yang sudah di-close user ke LocalStorage (sebagai fallback & update UI instan)
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
  // Menggunakan satu state waktu untuk menghitung mundur semua pesanan secara realtime
  const [currentTime, setCurrentTime] = useState(Date.now());

  // UI Controls
  const [sheetMode, setSheetMode] = useState(null);
  const [selectedService, setSelectedService] = useState(null);
  const [expandedCountry, setExpandedCountry] = useState(null);

  const [confirmModal, setConfirmModal] = useState({ show: false, title: '', message: '', onConfirm: null, loading: false, confirmText: 'Ya, Lanjutkan' });
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  // Cache
  const CACHE_KEY = 'otp_services_v12';
  const CACHE_TIME = 'otp_services_time_v12';
  const CACHE_DURATION = 60 * 60 * 1000;

  useEffect(() => {
    // Load ID yang pernah di-close agar tidak muncul lagi (local)
    const savedHidden = localStorage.getItem(HIDDEN_ORDERS_KEY);
    if (savedHidden) {
        closedIdsRef.current = JSON.parse(savedHidden);
    }

    fetchInitialData();
    
    // Auto refresh data setiap 5 detik
    const interval = setInterval(() => {
        fetchInitialData(true); 
    }, 5000);

    // Detak jantung timer (1 detik)
    const timerInterval = setInterval(() => {
        setCurrentTime(Date.now());
    }, 1000);

    return () => {
        clearInterval(interval);
        clearInterval(timerInterval);
    };
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

  // --- LOGIKA HITUNG MUNDUR ---
  const getRemainingTime = (createdAt) => {
    const createdTime = new Date(createdAt).getTime();
    const diffSeconds = Math.floor((currentTime - createdTime) / 1000);
    const lockDuration = 4 * 60; // 4 Menit
    const remaining = lockDuration - diffSeconds;
    return remaining > 0 ? remaining : 0;
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // --- FETCH DATA ---
  const fetchInitialData = async (silent = false) => {
    const start = Date.now();
    try {
      // 1. Ambil Saldo User
      const resUser = await api.get('/auth/me');
      if (resUser.data.success) {
          setBalance(resUser.data.data.balance);
      }
      
      // 2. Latency
      if(!silent) setPing(Date.now() - start);

      // 3. Ambil data order yang SUDAH DITUTUP dari backend (saveorder.json)
      let closedBackendIds = [];
      try {
          const resSelesai = await api.get('/cekselesai/list');
          if (resSelesai.data.success && Array.isArray(resSelesai.data.data)) {
              closedBackendIds = resSelesai.data.data.map(o => o.order_id);
          }
      } catch (err) {
          console.error("Gagal load saveorder:", err);
      }

      // 4. Ambil Riwayat Pesanan Asli
      const resHistory = await api.get('/history/list');
      if (resHistory.data.success) {
         const allOrders = resHistory.data.data;
         
         // Filter: Hanya tampilkan status aktif/selesai DAN yang belum di-close user (di local mapun di backend)
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
  const handleServiceClick = async (service) => {
    setSelectedService(service);
    setSheetMode('countries'); 
    setCountries([]);
    setLoadingCountries(true);
    setExpandedCountry(null); 
    try {
      const res = await api.get(`/countries/list?service_id=${service.service_code}`);
      if (res.data.success) setCountries(res.data.data);
    } catch (err) { showToast("Gagal memuat negara", "error"); } 
    finally { setLoadingCountries(false); }
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
      if (balance < provider.price) return showToast("Saldo tidak mencukupi!", "error");
      
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
      try {
          const opIdToSend = selectedOperatorId || 'any';
          const buyUrl = `/orders/buy?number_id=${country.number_id}&provider_id=${provider.provider_id}&operator_id=${opIdToSend}&expected_price=${provider.price}`;
          
          const res = await api.get(buyUrl);
          if (res.data.success) {
              closeConfirm();
              setSheetMode(null); 
              showToast("✅ Order Berhasil! Menunggu SMS...", "success");
              fetchInitialData(); 
          } else {
              closeConfirm();
              showToast(res.data.error?.message || "Order Gagal", "error");
          }
      } catch (err) {
          closeConfirm();
          showToast(err.response?.data?.error?.message || "Terjadi kesalahan koneksi", "error");
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
            
            // Hapus dari list
            setActiveOrders(prev => prev.filter(o => (o.order_id || o.id) !== targetId));
            
            closeConfirm();
            showToast("Pesanan dibatalkan", "success");
            fetchInitialData();
         } catch(e) { 
            closeConfirm();
            showToast(e.response?.data?.error?.message || "Gagal batal", "error");
         }
     });
  };

  // Fungsi untuk menutup order yang sudah selesai (Tembak ke backend & update local)
  const handleCloseOrder = async (orderId) => {
      // 1. Optimistic Update (Sembunyikan dari UI secara instan biar cepat)
      const newHidden = [...closedIdsRef.current, orderId];
      closedIdsRef.current = newHidden;
      localStorage.setItem(HIDDEN_ORDERS_KEY, JSON.stringify(newHidden));
      
      setActiveOrders(prev => prev.filter(o => (o.order_id || o.id) !== orderId));

      // 2. Request ke Backend untuk salin ke saveorder.json
      try {
          await api.post('/cekselesai/tutup', { order_id: orderId });
      } catch (err) {
          console.error("Gagal sinkronisasi tutup order ke backend:", err);
          // Jika gagal ke backend, tidak apa-apa, UI sudah terlanjur bersih (karena LocalStorage)
      }
  };

  const handleCheckSMS = () => {
      showToast("Merefresh data...", "success");
      fetchInitialData();
  };

  const getOptimizedImage = (url) => {
    if (!url) return "https://cdn-icons-png.flaticon.com/512/1176/1176425.png";
    const cleanUrl = url.replace('https://', '').replace('http://', '');
    return `https://images.weserv.nl/?url=${cleanUrl}&w=80&h=80&fit=contain&output=webp`;
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

        {/* DAFTAR ORDER AKTIF (LOOPING) */}
        {activeOrders.length > 0 && (
            <div className="space-y-4">
                <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></div>
                    <h3 className="font-bold text-slate-700 dark:text-slate-300 uppercase text-xs tracking-wider">Pesanan Aktif ({activeOrders.length})</h3>
                </div>

                {activeOrders.map((order) => {
                    const status = (order.status || '').toUpperCase();
                    const isSmsReceived = status === 'COMPLETED' || status === 'RECEIVED';
                    const remaining = getRemainingTime(order.created_at);
                    const orderId = order.order_id || order.id;

                    return (
                        <div key={orderId} className={`overflow-hidden rounded-3xl shadow-lg border relative animate-in slide-in-from-bottom duration-500 bg-white dark:bg-slate-950 ${isSmsReceived ? 'border-emerald-500 ring-1 ring-emerald-500' : 'border-blue-100 dark:border-slate-800'}`}>
                            
                            {/* HEADER CARD */}
                            <div className={`absolute top-0 right-0 px-3 py-1 text-[10px] font-bold rounded-bl-xl flex items-center gap-1 ${isSmsReceived ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                                {isSmsReceived ? <CheckCircle2 size={12} /> : <Clock size={12} />} 
                                {isSmsReceived ? 'SMS Diterima' : 'Menunggu SMS'}
                            </div>

                            <div className="p-5">
                                {/* LAYANAN & NOMOR */}
                                <div className="flex items-center gap-4 mb-4">
                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${isSmsReceived ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 dark:bg-slate-900'}`}>
                                        {isSmsReceived ? <MessageSquare size={24} /> : <Loader2 size={24} className="text-blue-600 animate-spin" />}
                                    </div>
                                    <div className="min-w-0">
                                        <h3 className="font-bold text-slate-800 dark:text-white text-lg truncate">
                                            {order.service || 'Layanan'} 
                                            <span className="ml-2 text-[10px] font-normal text-slate-400 uppercase">({order.country || 'Global'})</span>
                                        </h3>
                                        <div className="flex items-center gap-2 mt-1">
                                            <p className="text-lg font-mono font-bold text-slate-700 dark:text-slate-200 tracking-wider">
                                                {order.phone_number}
                                            </p>
                                            <button onClick={() => handleCopy(order.phone_number)} className="p-1.5 rounded-lg bg-slate-100 text-slate-500 hover:bg-blue-50 hover:text-blue-600 transition-colors dark:bg-slate-900">
                                                <Copy size={16} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                                
                                {/* AREA KODE SMS */}
                                {isSmsReceived ? (
                                    <div className="mb-4 p-4 bg-emerald-50 rounded-2xl border border-emerald-100 text-center dark:bg-emerald-900/20 dark:border-emerald-900/30">
                                        <p className="text-xs text-emerald-600 font-bold uppercase mb-1">Kode OTP Anda</p>
                                        <div 
                                            onClick={() => handleCopy(order.otp_code || order.sms_content)}
                                            className="text-3xl font-mono font-black text-emerald-700 tracking-[0.2em] cursor-pointer active:scale-95 transition-transform dark:text-emerald-400"
                                        >
                                            {order.otp_code || (order.sms_content ? order.sms_content.match(/\d+/)?.[0] : 'CODE')}
                                        </div>
                                        <p className="text-[10px] text-emerald-500 mt-2 italic truncate px-2">{order.sms_content}</p>
                                    </div>
                                ) : (
                                    <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mb-4 dark:bg-slate-900">
                                        <div className="bg-blue-600 h-full w-2/3 animate-pulse"></div>
                                    </div>
                                )}

                                {/* TOMBOL AKSI */}
                                {!isSmsReceived ? (
                                    <div className="flex gap-3">
                                        <button onClick={() => handleCancelClick(order)} className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border text-xs font-bold transition-colors ${remaining > 0 ? 'border-slate-200 text-slate-400 cursor-not-allowed dark:border-slate-800' : 'border-red-100 text-red-600 hover:bg-red-50'}`}>
                                            {remaining > 0 ? <><Timer size={16} /> Tunggu {formatTime(remaining)}</> : <><Trash2 size={16} /> Batalkan</>}
                                        </button>
                                        <button onClick={handleCheckSMS} className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 shadow-lg active:scale-95 transition-transform">
                                            <Repeat size={16} /> Cek SMS
                                        </button>
                                    </div>
                                ) : (
                                    <button onClick={() => handleCloseOrder(orderId)} className="w-full py-3 rounded-xl bg-slate-900 text-white font-bold text-sm hover:bg-black dark:bg-white dark:text-slate-900 transition-colors">
                                        Selesai & Tutup
                                    </button>
                                )}
                            </div>
                        </div>
                    );
                })}
                <p className="text-[10px] text-slate-400 text-center mt-3">Otomatis refresh setiap 5 detik.</p>
            </div>
        )}

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

