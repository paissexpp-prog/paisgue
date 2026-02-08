import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import BottomNav from '../components/BottomNav';
import { useTheme } from '../context/ThemeContext';
import { 
  ShoppingBag, Wallet, ChevronDown, ChevronUp, Copy, 
  CheckCircle2, XCircle, Clock, Search, Filter 
} from 'lucide-react';

export default function History() {
  const { color } = useTheme();
  
  // --- STATE ---
  const [activeTab, setActiveTab] = useState('orders'); // 'orders' atau 'deposits'
  const [orders, setOrders] = useState([]);
  const [deposits, setDeposits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null); // Untuk accordion

  useEffect(() => {
    fetchData();
  }, []);

  // --- FETCH DATA (Orders & Deposits) ---
  const fetchData = async () => {
    setLoading(true);
    try {
      // Ambil Pesanan
      const resOrder = await api.get('/history/list');
      if (resOrder.data.success) {
        setOrders(resOrder.data.data);
      }

      // Ambil Deposit
      const resDeposit = await api.get('/deposit/history');
      if (resDeposit.data.success) {
        setDeposits(resDeposit.data.data);
      }
    } catch (err) {
      console.error("Gagal load history");
    } finally {
      setLoading(false);
    }
  };

  // --- FUNGSI HELPER ---
  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const handleCopy = (text) => {
    if(!text) return;
    navigator.clipboard.writeText(text);
    alert('ID berhasil disalin!'); // Bisa diganti Toast jika mau
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
    });
  };

  const getStatusConfig = (status) => {
    const s = status.toLowerCase();
    if (s === 'success' || s === 'completed' || s === 'done') {
      return { color: 'bg-emerald-100 text-emerald-600', icon: <CheckCircle2 size={14} />, label: 'Sukses' };
    }
    if (s === 'pending' || s === 'active' || s === 'processing') {
      return { color: 'bg-amber-100 text-amber-600', icon: <Clock size={14} />, label: 'Pending' };
    }
    return { color: 'bg-red-100 text-red-600', icon: <XCircle size={14} />, label: 'Gagal/Batal' };
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-28 transition-colors duration-300 dark:bg-slate-900">
      
      {/* --- HEADER --- */}
      <div className="sticky top-0 z-30 bg-white/90 px-5 pt-8 pb-4 backdrop-blur-md border-b border-slate-100 dark:bg-slate-950/90 dark:border-slate-800">
        <h1 className="text-xl font-bold text-slate-800 dark:text-white mb-4">Aktivitas</h1>
        
        {/* --- TAB SWITCHER (2 TOMBOL) --- */}
        <div className="flex p-1 rounded-xl bg-slate-100 dark:bg-slate-800">
          <button 
            onClick={() => { setActiveTab('orders'); setExpandedId(null); }}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === 'orders' ? 'bg-white text-slate-800 shadow-sm dark:bg-slate-700 dark:text-white' : 'text-slate-500 dark:text-slate-400'}`}
          >
            <ShoppingBag size={16} /> Pesanan
          </button>
          <button 
            onClick={() => { setActiveTab('deposits'); setExpandedId(null); }}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === 'deposits' ? 'bg-white text-slate-800 shadow-sm dark:bg-slate-700 dark:text-white' : 'text-slate-500 dark:text-slate-400'}`}
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
          activeTab === 'orders' ? (
            // === LIST ORDERS ===
            orders.length > 0 ? orders.map((item) => {
              const status = getStatusConfig(item.status);
              const isExpanded = expandedId === item.order_id;
              
              return (
                <div key={item.order_id} className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm transition-all dark:border-slate-800 dark:bg-slate-950">
                   {/* Header Item */}
                   <button onClick={() => toggleExpand(item.order_id)} className="w-full flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-900/50">
                      <div className="flex items-center gap-3">
                         <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400">
                            <ShoppingBag size={20} />
                         </div>
                         <div className="text-left">
                            <h4 className="text-sm font-bold text-slate-800 dark:text-white">{item.service}</h4>
                            <p className="text-[10px] text-slate-400">{formatDate(item.created_at)}</p>
                         </div>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                         <span className="font-bold text-slate-800 dark:text-white">Rp {item.total_price?.toLocaleString('id-ID')}</span>
                         <span className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${status.color}`}>
                            {status.icon} {status.label}
                         </span>
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
                                <button onClick={() => handleCopy(item.order_id)} className="text-blue-500"><Copy size={12}/></button>
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
                   <button onClick={() => toggleExpand(item.id)} className="w-full flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-900/50">
                      <div className="flex items-center gap-3">
                         <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400">
                            <Wallet size={20} />
                         </div>
                         <div className="text-left">
                            <h4 className="text-sm font-bold text-slate-800 dark:text-white">{item.method ? item.method.toUpperCase() : 'DEPOSIT'}</h4>
                            <p className="text-[10px] text-slate-400">{formatDate(item.created_at)}</p>
                         </div>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                         <span className="font-bold text-slate-800 dark:text-white">Rp {item.request_amount?.toLocaleString('id-ID')}</span>
                         <span className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${status.color}`}>
                            {status.icon} {status.label}
                         </span>
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
                                <button onClick={() => handleCopy(item.id)} className="text-blue-500"><Copy size={12}/></button>
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

      {/* --- PENTING: BOTTOM NAV AGAR BISA KEMBALI --- */}
      <BottomNav />
    </div>
  );
}

