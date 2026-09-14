import React, { useState, useEffect, useRef } from 'react';
import api from '../utils/api';
import BottomNav from '../components/BottomNav';
import { useTheme } from '../context/ThemeContext';
import { 
  ShoppingBag, Wallet, ChevronDown, ChevronUp, Copy, 
  CheckCircle2, XCircle, Clock, Search, Filter, WifiOff, Globe, MessageSquare,
  TrendingUp // Icon tambahan untuk grafik
} from 'lucide-react';

export default function History() {
  const { color } = useTheme();

  // --- STATE ---
  const [activeTab, setActiveTab] = useState('testimoni'); // 'testimoni', 'orders' atau 'deposits'
  const [orders, setOrders] = useState([]);
  const [deposits, setDeposits] = useState([]);
  const [testimoni, setTestimoni] = useState([]); // State untuk Testimoni
  
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null); // Untuk accordion
  const [isOffline, setIsOffline] = useState(false); // State indikator pakai cache
  
  // State untuk Pagination Testimoni
  const [testimoniPage, setTestimoniPage] = useState(0);
  const [loadingMoreTestimoni, setLoadingMoreTestimoni] = useState(false);
  const [hasMoreTestimoni, setHasMoreTestimoni] = useState(true);

  // --- STATE UNTUK GRAFIK TRANSAKSI ---
  const [statsData, setStatsData] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [chartPeriod, setChartPeriod] = useState('daily'); // 'daily', 'weekly', 'monthly'

  // State untuk Custom Toast Notification
  const [toast, setToast] = useState({ show: false, message: '' });
  const toastTimeout = useRef(null);

  useEffect(() => {
    fetchData();
    fetchStats(); // Panggil data grafik saat komponen dimuat
    
    // Cleanup timeout saat komponen di-unmount
    return () => {
      if (toastTimeout.current) clearTimeout(toastTimeout.current);
    };
  }, []);

  // --- FETCH DATA STATISTIK (GRAFIK) ---
  const fetchStats = async () => {
    const cachedStats = localStorage.getItem('ruangotp_history_stats');
    if (cachedStats) {
      setStatsData(JSON.parse(cachedStats));
      setStatsLoading(false);
    } else {
      setStatsLoading(true);
    }

    try {
      // Dinamis mengambil tahun sekarang
      const currentYear = new Date().getFullYear(); 
      const res = await api.get(`/testimoni/stats/${currentYear}`);
      
      if (res.data && res.data.success) {
        setStatsData(res.data.chart);
        localStorage.setItem('ruangotp_history_stats', JSON.stringify(res.data.chart));
      }
    } catch (err) {
      console.error("Gagal load statistik transaksi", err);
    } finally {
      setStatsLoading(false);
    }
  };

  // --- FETCH DATA DENGAN SISTEM CACHE ---
  const fetchData = async () => {
    // 1. Cek & Muat Data dari Cache (Local Storage) terlebih dahulu
    const cachedOrders = localStorage.getItem('ruangotp_history_orders');
    const cachedDeposits = localStorage.getItem('ruangotp_history_deposits');
    const cachedTestimoni = localStorage.getItem('ruangotp_history_testimoni');

    if (cachedOrders) {
        setOrders(JSON.parse(cachedOrders));
    }
    if (cachedDeposits) {
        setDeposits(JSON.parse(cachedDeposits));
    }
    if (cachedTestimoni) {
        setTestimoni(JSON.parse(cachedTestimoni));
    }

    // Jika tidak ada cache sama sekali, baru tampilkan animasi loading skeleton
    if (!cachedOrders && !cachedDeposits && !cachedTestimoni) {
        setLoading(true);
    }

    // 2. Tembak API di background untuk mengambil data terbaru
    try {
      // Ambil Pesanan
      const resOrder = await api.get('/history/list');
      if (resOrder.data.success) {
        setOrders(resOrder.data.data);
        localStorage.setItem('ruangotp_history_orders', JSON.stringify(resOrder.data.data));
      }

      // Ambil Deposit
      const resDeposit = await api.get('/deposit/history');
      if (resDeposit.data.success) {
        setDeposits(resDeposit.data.data);
        localStorage.setItem('ruangotp_history_deposits', JSON.stringify(resDeposit.data.data));
      }

      // Ambil Testimoni (Page 0)
      const resTestimoni = await api.get('/testimoni');
      if (resTestimoni.data && resTestimoni.data.aktivitas_terbaru) {
        setTestimoni(resTestimoni.data.aktivitas_terbaru);
        localStorage.setItem('ruangotp_history_testimoni', JSON.stringify(resTestimoni.data.aktivitas_terbaru));
        
        // Reset pagination state tiap kali fetch awal berhasil
        setTestimoniPage(0);
        if (resTestimoni.data.aktivitas_terbaru.length === 0) {
            setHasMoreTestimoni(false);
        } else {
            setHasMoreTestimoni(true);
        }
      }
      
      // Jika berhasil, pastikan status offline false
      setIsOffline(false);
    } catch (err) {
      console.error("Gagal load history terbaru, menggunakan data cache.");
      // Jika gagal tembak API, aktifkan status offline agar user tahu ini data cache
      setIsOffline(true);
    } finally {
      setLoading(false);
    }
  };

  // --- LOAD MORE TESTIMONI ---
  const handleLoadMoreTestimoni = async () => {
    const nextPage = testimoniPage + 1;
    // Maksimal 5 halaman berdasarkan ketentuan backend
    if (nextPage > 5) {
        setHasMoreTestimoni(false);
        return;
    }

    setLoadingMoreTestimoni(true);
    try {
        const res = await api.get(`/testimoni/${nextPage}`);
        if (res.data && res.data.aktivitas_terbaru) {
            const newData = res.data.aktivitas_terbaru;
            setTestimoni(prev => [...prev, ...newData]);
            setTestimoniPage(nextPage);
            
            // Jika data yang dikembalikan kosong atau sudah mencapai page 5, matikan tombol load more
            if (newData.length === 0 || nextPage >= 5) {
                setHasMoreTestimoni(false);
            }
        } else {
            setHasMoreTestimoni(false);
        }
    } catch (error) {
        console.error("Gagal memuat halaman testimoni berikutnya", error);
    } finally {
        setLoadingMoreTestimoni(false);
    }
  };

  // --- FUNGSI HELPER ---
  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const handleCopy = (text) => {
    if(!text) return;
    navigator.clipboard.writeText(text);
    
    // Tampilkan custom toast alih-alih menggunakan alert bawaan
    setToast({ show: true, message: 'ID berhasil disalin!' });
    
    // Reset timer jika user klik berkali-kali sebelum toast hilang
    if (toastTimeout.current) {
      clearTimeout(toastTimeout.current);
    }
    
    // Sembunyikan toast setelah 2.5 detik
    toastTimeout.current = setTimeout(() => {
      setToast({ show: false, message: '' });
    }, 2500);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
    });
  };

  const getStatusConfig = (status) => {
    const s = status ? status.toLowerCase() : '';
    if (s === 'success' || s === 'completed' || s === 'done' || s === 'berhasil' || s === 'sukses') {
      return { color: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400', icon: <CheckCircle2 size={14} />, label: status || 'Sukses' };
    }
    if (s === 'pending' || s === 'active' || s === 'processing') {
      return { color: 'bg-amber-100 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400', icon: <Clock size={14} />, label: status || 'Pending' };
    }
    return { color: 'bg-red-100 text-red-600 dark:bg-red-500/20 dark:text-red-400', icon: <XCircle size={14} />, label: status || 'Gagal' };
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-28 transition-colors duration-300 dark:bg-slate-900">
      
      {/* --- HEADER --- */}
      <div className="sticky top-0 z-30 bg-white/90 px-5 pt-8 pb-4 backdrop-blur-md border-b border-slate-100 dark:bg-slate-950/90 dark:border-slate-800">
        <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-bold text-slate-800 dark:text-white">Aktivitas</h1>
        </div>

        {/* --- INDIKATOR OFFLINE / CACHE --- */}
        {isOffline && (
            <div className="mb-3 flex items-center gap-2 rounded-lg bg-amber-50 p-2.5 text-xs font-medium text-amber-600 border border-amber-200 dark:bg-amber-900/20 dark:border-amber-800/50 dark:text-amber-400">
                <WifiOff size={14} className="shrink-0" />
                <p>Koneksi bermasalah. Menampilkan data cache terakhir.</p>
            </div>
        )}
        
        {/* --- TAB SWITCHER (3 TOMBOL) --- */}
        <div className="flex p-1 rounded-xl bg-slate-100 dark:bg-slate-800 overflow-x-auto hide-scrollbar">
          <button 
            onClick={() => { setActiveTab('testimoni'); setExpandedId(null); }}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 min-w-[100px] rounded-lg text-sm font-bold transition-all ${activeTab === 'testimoni' ? 'bg-white text-slate-800 shadow-sm dark:bg-slate-700 dark:text-white' : 'text-slate-500 dark:text-slate-400'}`}
          >
            <Globe size={16} /> Live
          </button>
          
          <button 
            onClick={() => { setActiveTab('orders'); setExpandedId(null); }}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 min-w-[100px] rounded-lg text-sm font-bold transition-all ${activeTab === 'orders' ? 'bg-white text-slate-800 shadow-sm dark:bg-slate-700 dark:text-white' : 'text-slate-500 dark:text-slate-400'}`}
          >
            <ShoppingBag size={16} /> Pesanan
          </button>
          
          <button 
            onClick={() => { setActiveTab('deposits'); setExpandedId(null); }}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 min-w-[100px] rounded-lg text-sm font-bold transition-all ${activeTab === 'deposits' ? 'bg-white text-slate-800 shadow-sm dark:bg-slate-700 dark:text-white' : 'text-slate-500 dark:text-slate-400'}`}
          >
            <Wallet size={16} /> Deposit
          </button>
        </div>
      </div>

      {/* --- CONTENT LIST --- */}
      <div className="px-5 mt-4 space-y-3">
        {loading ? (
           // Skeleton Loading
           [1,2,3,4].map(i => <div key={i} className="h-20 w-full bg-slate-200 rounded-2xl animate-pulse dark:bg-slate-800"></div>)
        ) : (
          activeTab === 'testimoni' ? (
            // === LIST TESTIMONI (LIVE ACTIVITY) ===
            <>
              {/* --- BAGIAN GRAFIK TRANSAKSI (SaaS Style) --- */}
              {statsLoading ? (
                 <div className="h-56 w-full bg-slate-200 rounded-2xl animate-pulse dark:bg-slate-800 mb-4"></div>
              ) : statsData ? (
                 <div className="bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl p-4 mb-4 shadow-sm transition-colors">
                    {/* Header Grafik */}
                    <div className="flex justify-between items-center mb-5">
                       <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
                           <TrendingUp size={18} className="text-blue-500" />
                           {statsData.title || "Total Transaksi"}
                       </h3>
                       {/* Segmented Control (Pill) */}
                       <div className="flex bg-slate-100 dark:bg-slate-900 rounded-lg p-1 text-[10px] font-bold">
                           <button 
                              onClick={() => setChartPeriod('daily')} 
                              className={`px-2.5 py-1.5 rounded-md transition-all duration-200 ${chartPeriod === 'daily' ? 'bg-white dark:bg-slate-700 shadow-sm text-blue-600 dark:text-blue-400' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                           >
                              Harian
                           </button>
                           <button 
                              onClick={() => setChartPeriod('weekly')} 
                              className={`px-2.5 py-1.5 rounded-md transition-all duration-200 ${chartPeriod === 'weekly' ? 'bg-white dark:bg-slate-700 shadow-sm text-blue-600 dark:text-blue-400' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                           >
                              Mingguan
                           </button>
                           <button 
                              onClick={() => setChartPeriod('monthly')} 
                              className={`px-2.5 py-1.5 rounded-md transition-all duration-200 ${chartPeriod === 'monthly' ? 'bg-white dark:bg-slate-700 shadow-sm text-blue-600 dark:text-blue-400' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                           >
                              Bulanan
                           </button>
                       </div>
                    </div>

                    {/* Tampilan Bar Chart */}
                    <div className="h-32 flex items-end justify-between gap-1.5 mt-2">
                        {(() => {
                           const currentData = statsData[chartPeriod]?.data || [];
                           // Cari nilai tertinggi untuk mengkalkulasi persentase tinggi batang grafik. Default 1 untuk hindari bagi 0.
                           const maxVal = Math.max(...currentData.map(d => d.value), 1); 

                           return currentData.map((item, i) => (
                              <div key={i} className="relative flex flex-col items-center flex-1 group h-full justify-end">
                                 {/* Hover Tooltip - Muncul saat di hover */}
                                 <div className="absolute -top-8 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-slate-800 text-white text-[10px] font-bold py-1 px-2 rounded pointer-events-none whitespace-nowrap z-10 shadow-lg dark:bg-white dark:text-slate-900">
                                    {item.value.toLocaleString('id-ID')}
                                 </div>
                                 
                                 {/* Wrapper Batang */}
                                 <div className="w-full max-w-[28px] bg-blue-50 dark:bg-blue-900/20 rounded-t-sm flex items-end justify-center overflow-hidden h-full">
                                    {/* Batang Warna (Terisi sesuai persentase) */}
                                    <div
                                       className="w-full bg-blue-500 dark:bg-blue-600 rounded-t-sm transition-all duration-700 ease-out group-hover:bg-blue-400 dark:group-hover:bg-blue-500"
                                       style={{ height: `${(item.value / maxVal) * 100}%` }}
                                    ></div>
                                 </div>
                                 
                                 {/* Label Bawah (Hari/Bulan/Minggu) */}
                                 <span className="text-[9px] text-slate-500 dark:text-slate-400 mt-2 font-semibold truncate max-w-full">
                                    {item.label}
                                 </span>
                              </div>
                           ));
                        })()}
                    </div>
                 </div>
              ) : null}
              {/* --- END OF GRAFIK TRANSAKSI --- */}

              {testimoni.length > 0 ? testimoni.map((item, idx) => {
                const isDeposit = item.jenis && item.jenis.toLowerCase() === 'deposit';
                const statusConfig = getStatusConfig(item.status);
                
                return (
                  <div key={idx} className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm p-4 flex items-center justify-between dark:border-slate-800 dark:bg-slate-950 hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
                     <div className="flex items-center gap-3 min-w-0">
                        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${isDeposit ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400' : 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400'}`}>
                           {isDeposit ? <Wallet size={20} /> : <MessageSquare size={20} />}
                        </div>
                        <div className="flex-1 min-w-0 text-left">
                           <h4 className="truncate text-sm font-bold text-slate-800 dark:text-white flex items-center gap-1">
                             {item.nama} 
                             <span className="text-[10px] font-normal text-slate-500 dark:text-slate-400">({item.negara})</span>
                           </h4>
                           <p className="truncate text-[11px] font-medium text-slate-500 dark:text-slate-400 mt-0.5">
                             {isDeposit ? `Deposit Saldo ${item.nominal}` : `Order ${item.layanan} - ${item.nomor}`}
                           </p>
                        </div>
                     </div>
                     
                     <div className="flex flex-col items-end gap-1.5 shrink-0 ml-2">
                        <span className="text-[10px] text-slate-400 font-medium flex items-center gap-1">
                          <Clock size={10}/> {item.waktu}
                        </span>
                        <span className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${statusConfig.color}`}>
                           {statusConfig.icon} <span className="capitalize">{statusConfig.label}</span>
                        </span>
                     </div>
                  </div>
                );
              }) : <div className="text-center py-10 text-slate-400">Belum ada aktivitas terbaru</div>}

              {/* TOMBOL TAMPILKAN LEBIH BANYAK */}
              {hasMoreTestimoni && testimoni.length > 0 && (
                <div className="flex justify-center pt-2 pb-6">
                  <button
                    onClick={handleLoadMoreTestimoni}
                    disabled={loadingMoreTestimoni}
                    className="flex items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-5 py-2.5 text-xs font-bold text-slate-600 shadow-sm transition-all hover:bg-slate-50 active:scale-95 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                  >
                    {loadingMoreTestimoni ? (
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-600 border-t-transparent dark:border-blue-400" />
                    ) : (
                      <ChevronDown size={16} />
                    )}
                    {loadingMoreTestimoni ? 'Memuat Data...' : 'Tampilkan Lebih Banyak'}
                  </button>
                </div>
              )}
            </>
          ) : activeTab === 'orders' ? (
            // === LIST ORDERS ===
            orders.length > 0 ? orders.map((item) => {
              const status = getStatusConfig(item.status);
              const isExpanded = expandedId === item.order_id;
              
              return (
                <div key={item.order_id} className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm transition-all dark:border-slate-800 dark:bg-slate-950">
                   {/* Header Item */}
                   <button onClick={() => toggleExpand(item.order_id)} className="w-full flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
                      <div className="flex items-center gap-3">
                         <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400">
                             <ShoppingBag size={20} />
                         </div>
                         <div className="text-left">
                            <h4 className="text-sm font-bold text-slate-800 dark:text-white">{item.service}</h4>
                            <p className="text-[10px] text-slate-400">{formatDate(item.created_at)}</p>
                         </div>
                      </div>
                      
                      {/* FLEX CONTAINER UNTUK HARGA/STATUS + IKON PANAH */}
                      <div className="flex items-center gap-3">
                        <div className="flex flex-col items-end gap-1">
                           <span className="font-bold text-slate-800 dark:text-white">Rp {item.total_price?.toLocaleString('id-ID')}</span>
                           <span className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${status.color}`}>
                              {status.icon} {status.label}
                           </span>
                        </div>
                        {/* IKON PANAH ATAS/BAWAH */}
                        <div className={`text-slate-400 transition-transform duration-300 ${isExpanded ? 'rotate-180' : 'rotate-0'}`}>
                           <ChevronDown size={20} />
                        </div>
                      </div>
                   </button>

                   {/* Detail Accordion */}
                   {isExpanded && (
                     <div className="border-t border-slate-100 bg-slate-50 p-4 text-xs dark:border-slate-800 dark:bg-slate-900/30">
                        <div className="space-y-2">
                           <div className="flex justify-between">
                              <span className="text-slate-500">Nomor HP</span>
                              <span className="font-mono font-bold text-slate-700 dark:text-slate-300 select-all">{item.phone_number}</span>
                           </div>
                           <div className="flex justify-between items-center">
                              <span className="text-slate-500">Order ID</span>
                              <div className="flex items-center gap-2">
                                <span className="font-mono text-slate-700 dark:text-slate-300">{item.order_id}</span>
                                <button onClick={() => handleCopy(item.order_id)} className="text-blue-500 hover:text-blue-600 transition-colors">
                                  <Copy size={14}/>
                                </button>
                              </div>
                           </div>
                           {/* Jika ada SMS/OTP */}
                           {(item.otp_code || item.sms_content) && (
                             <div className="mt-2 p-2 bg-white rounded border border-slate-200 dark:bg-slate-800 dark:border-slate-700">
                                <p className="text-[10px] text-slate-400 mb-1">Pesan Masuk:</p>
                                <p className="font-mono font-bold text-emerald-600 dark:text-emerald-400">{item.otp_code || item.sms_content}</p>
                             </div>
                           )}
                        </div>
                     </div>
                   )}
                </div>
              )
            }) : <div className="text-center py-10 text-slate-400">Belum ada pesanan</div>
          ) : (
            // === LIST DEPOSITS ===
            deposits.length > 0 ? deposits.map((item) => {
              const status = getStatusConfig(item.status);
              const isExpanded = expandedId === item.id;

              return (
                <div key={item.id} className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm transition-all dark:border-slate-800 dark:bg-slate-950">
                   {/* Header Item */}
                   <button onClick={() => toggleExpand(item.id)} className="w-full flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
                      <div className="flex items-center gap-3">
                         <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400">
                            <Wallet size={20} />
                         </div>
                         <div className="text-left">
                            <h4 className="text-sm font-bold text-slate-800 dark:text-white">{item.method ? item.method.toUpperCase() : 'DEPOSIT'}</h4>
                            <p className="text-[10px] text-slate-400">{formatDate(item.created_at)}</p>
                         </div>
                      </div>
                      
                      {/* FLEX CONTAINER UNTUK HARGA/STATUS + IKON PANAH */}
                      <div className="flex items-center gap-3">
                        <div className="flex flex-col items-end gap-1">
                           <span className="font-bold text-slate-800 dark:text-white">Rp {item.request_amount?.toLocaleString('id-ID')}</span>
                           <span className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${status.color}`}>
                              {status.icon} {status.label}
                           </span>
                        </div>
                        {/* IKON PANAH ATAS/BAWAH */}
                        <div className={`text-slate-400 transition-transform duration-300 ${isExpanded ? 'rotate-180' : 'rotate-0'}`}>
                           <ChevronDown size={20} />
                        </div>
                      </div>
                   </button>

                   {/* Detail Accordion */}
                   {isExpanded && (
                     <div className="border-t border-slate-100 bg-slate-50 p-4 text-xs dark:border-slate-800 dark:bg-slate-900/30">
                        <div className="space-y-2">
                           <div className="flex justify-between items-center">
                              <span className="text-slate-500">Deposit ID</span>
                              <div className="flex items-center gap-2">
                                <span className="font-mono text-slate-700 dark:text-slate-300">{item.id}</span>
                                <button onClick={() => handleCopy(item.id)} className="text-blue-500 hover:text-blue-600 transition-colors">
                                  <Copy size={14}/>
                                </button>
                              </div>
                           </div>
                           <div className="flex justify-between">
                              <span className="text-slate-500">Total Bayar</span>
                              <span className="font-bold text-slate-800 dark:text-white">Rp {item.total_bill?.toLocaleString('id-ID')}</span>
                           </div>
                        </div>
                     </div>
                   )}
                </div>
              )
            }) : <div className="text-center py-10 text-slate-400">Belum ada deposit</div>
          )
        )}
      </div>

      {/* --- CUSTOM TOAST NOTIFICATION --- */}
      {toast.show && (
        <div className="fixed bottom-24 left-1/2 z-50 -translate-x-1/2 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="flex items-center gap-2.5 rounded-full bg-slate-900 px-4 py-2.5 text-xs font-semibold text-white shadow-xl border border-slate-700/50 dark:bg-white dark:text-slate-900 dark:border-slate-200">
            <CheckCircle2 size={16} className="text-emerald-400 dark:text-emerald-600" />
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      {/* --- PENTING: BOTTOM NAV AGAR BISA KEMBALI --- */}
      <BottomNav />
    </div>
  );
}