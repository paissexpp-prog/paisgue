import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import BottomNav from '../components/BottomNav';
import { useTheme } from '../context/ThemeContext';
import { io } from 'socket.io-client';
import { jwtDecode } from 'jwt-decode';
import { 
  Wallet, QrCode, AlertCircle, History, CheckCircle2, XCircle, 
  Clock, Trash2, ChevronDown, ChevronUp, HelpCircle, Loader2, RefreshCw,
  ShieldCheck, Zap, Copy, Gift
} from 'lucide-react';

export default function Deposit() {
  const { color } = useTheme();
  const [amount, setAmount] = useState(10000); 
  const [selectedProvider] = useState('qris1'); 
  const [qrisData, setQrisData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);

  const [confirmModal, setConfirmModal] = useState({ show: false, title: '', message: '', onConfirm: null, loading: false });
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  // Pilihan nominal cepat
  const quickAmounts = [10000, 25000, 50000, 100000];

  useEffect(() => {
    fetchHistory();

    // ================================================================
    // KONEKSI SOCKET.IO UNTUK DEPOSIT REALTIME
    // ================================================================
    let userId = null;
    try {
        const token = localStorage.getItem('token');
        if (token) {
            const decoded = jwtDecode(token);
            userId = decoded?.userId || null;
        }
    } catch (e) {}

    const socket = io('https://api.ruangotp.net', {
        auth: { userId },
        transports: ['websocket'], 
        reconnectionAttempts: 5,
        reconnectionDelay: 3000,
    });

    socket.on('deposit_success', (data) => {
        setToast({ show: true, message: 'Deposit berhasil masuk!', type: 'success' });
        setTimeout(() => setToast(prev => ({ ...prev, show: false })), 4000);
        fetchHistory();
    });

    return () => {
        socket.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast(prev => ({ ...prev, show: false })), 3000);
  };

  const showConfirm = (title, message, action) => {
      setConfirmModal({ show: true, title, message, onConfirm: action, loading: false });
  };

  const closeConfirm = () => {
      setConfirmModal({ show: false, title: '', message: '', onConfirm: null, loading: false });
  };

  const fetchHistory = async () => {
    setHistoryLoading(true);
    try {
      const res = await api.get('/deposit/history');
      if (res.data.success) {
        const data = res.data.data;
        setHistory(data.slice(0, 5));

        if (data.length > 0 && data[0].status === 'pending') {
            const pendingItem = data[0];
            setQrisData({
                deposit_id: pendingItem.id,
                qr_image: pendingItem.qr_image,
                total_pay: pendingItem.total_bill,
                amount_received: pendingItem.request_amount,
                merchant: pendingItem.merchant 
            });
        } else {
            setQrisData(null);
        }
      }
    } catch (err) { } 
    finally { setHistoryLoading(false); }
  };

  const handleManualRefresh = () => {
    showToast('Mengecek status pembayaran...', 'success');
    fetchHistory();
  };

  const handleDeposit = async () => {
    if (amount < 500) return showToast('Minimal deposit Rp 500', 'error');

    setLoading(true);
    try {
      const res = await api.get(`/deposit/create?amount=${amount}`);
      if (res.data.success) {
        setQrisData({
            ...res.data.data,
            merchant: 'RumahOTP'
        });
        fetchHistory();
        showToast('Tagihan berhasil dibuat', 'success');
      }
    } catch (err) {
      showToast(err.response?.data?.error?.message || 'Sedang Dalam Maintenance', 'error');
    }
    setLoading(false);
  };

  const handleCancelClick = () => {
      if (!qrisData) return;
      
      showConfirm(
          "Batalkan Deposit?",
          "Apakah Anda yakin ingin membatalkan tagihan ini?",
          async () => {
              setConfirmModal(prev => ({ ...prev, loading: true }));
              try {
                  const res = await api.get(`/deposit/cancel?deposit_id=${qrisData.deposit_id}`);
                  if (res.data.success) {
                      closeConfirm();
                      setQrisData(null);
                      fetchHistory();
                      showToast('Deposit berhasil dibatalkan', 'success');
                  } else {
                      closeConfirm();
                      showToast(res.data.error?.message || 'Gagal membatalkan', 'error');
                  }
              } catch (err) {
                  closeConfirm();
                  showToast('Terjadi kesalahan koneksi', 'error');
              }
          }
      );
  };

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case 'success':
        return <span className="inline-flex items-center gap-1 rounded-md bg-emerald-100 px-2 py-1 text-[10px] font-bold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400"><CheckCircle2 size={12}/> Sukses</span>;
      case 'pending':
        return <span className="inline-flex items-center gap-1 rounded-md bg-amber-100 px-2 py-1 text-[10px] font-bold text-amber-700 dark:bg-amber-500/10 dark:text-amber-400"><Clock size={12}/> Pending</span>;
      default:
        return <span className="inline-flex items-center gap-1 rounded-md bg-red-100 px-2 py-1 text-[10px] font-bold text-red-700 dark:bg-red-500/10 dark:text-red-400"><XCircle size={12}/> Gagal</span>;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50 pb-28 transition-colors duration-300 dark:bg-slate-950">
      
      {/* Header */}
      <div className="sticky top-0 z-40 border-b border-slate-200/60 bg-white/80 px-6 pb-4 pt-6 backdrop-blur-xl dark:border-slate-800/60 dark:bg-slate-950/80">
        <div className="flex items-center gap-3">
            <div className={`flex h-10 w-10 items-center justify-center rounded-full ${color.bg} ${color.text}`}>
                <Wallet size={20} />
            </div>
            <div>
                <h1 className="text-xl font-bold text-slate-800 dark:text-white">Isi Saldo</h1>
                <p className="text-xs text-slate-500 dark:text-slate-400">Topup instan via QRIS 24 Jam</p>
            </div>
        </div>
      </div>

      <div className="mx-auto mt-6 max-w-md px-5">
        
        {!qrisData ? (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Form Nominal */}
            <div className="rounded-3xl border border-slate-200/60 bg-white p-6 shadow-sm dark:border-slate-800/60 dark:bg-slate-900">
              <label className="mb-3 block text-sm font-bold text-slate-700 dark:text-slate-300">
                  Nominal Deposit
              </label>
              
              {/* Input Nominal Dinamis */}
              <div className="relative">
                <span className="absolute left-5 top-1/2 -translate-y-1/2 text-xl font-bold text-slate-400">Rp</span>
                <input 
                  type="number" 
                  className={`w-full rounded-2xl border bg-slate-50 py-4 pl-14 pr-5 text-2xl font-black text-slate-800 transition-all focus:outline-none focus:ring-2 dark:bg-slate-950 dark:text-white ${color.border} ${color.ring}`}
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="10000"
                  min="500"
                />
              </div>

              {/* Indikator Kalkulator Bonus Real-time (SaaS UX) */}
              <div className="mb-5 mt-2 h-5">
                {amount >= 20000 && (
                    <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 animate-in fade-in slide-in-from-left-2 duration-300">
                        <Gift size={14} />
                        <span>Mendapat Bonus 5%: +Rp {(amount * 0.05).toLocaleString('id-ID')}</span>
                    </div>
                )}
              </div>

              {/* Quick Amounts */}
              <div className="mb-6 grid grid-cols-4 gap-2">
                  {quickAmounts.map((val) => (
                      <button 
                          key={val}
                          onClick={() => setAmount(val)}
                          className={`rounded-xl border py-2 text-xs font-bold transition-all ${
                              parseInt(amount) === val 
                              ? `${color.bg}${color.border} ${color.text} ring-1${color.ring}`
                              : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-800/80'
                          }`}
                      >
                          {val / 1000}k
                      </button>
                  ))}
              </div>

              {/* =========================================================
                  KARTU PROMO BONUS 5% (SAAS STYLE) 
                  ========================================================= */}
              <div className="mb-6 overflow-hidden rounded-2xl border border-emerald-200/60 bg-gradient-to-br from-emerald-50 to-teal-50/30 p-4 dark:border-emerald-800/30 dark:from-emerald-900/10 dark:to-teal-900/5">
                  <div className="mb-4 flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400">
                          <Gift size={20} />
                      </div>
                      <div>
                          <h4 className="text-sm font-black tracking-tight text-emerald-800 dark:text-emerald-400">Promo Extra Saldo 5%</h4>
                          <p className="text-[10px] font-medium text-emerald-600/80 dark:text-emerald-400/70">Otomatis masuk tanpa syarat</p>
                      </div>
                  </div>
                  
                  {/* Tabel Tingkatan Bonus */}
                  <div className="space-y-1.5">
                      {[
                          { dep: 20000, bon: 1000 },
                          { dep: 50000, bon: 2500 },
                          { dep: 100000, bon: 5000 },
                          { dep: 250000, bon: 12500 },
                          { dep: 500000, bon: 25000 },
                          { dep: 1000000, bon: 50000 },
                      ].map((tier, idx) => (
                          <div 
                              key={idx} 
                              onClick={() => setAmount(tier.dep)}
                              className="group flex cursor-pointer items-center justify-between rounded-xl bg-white/60 px-3.5 py-2.5 text-xs transition-colors hover:bg-white dark:bg-slate-900/40 dark:hover:bg-slate-900/60"
                          >
                              <span className="font-bold text-slate-700 dark:text-slate-300 group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">
                                  Rp {tier.dep.toLocaleString('id-ID')}
                              </span>
                              <div className="flex items-center gap-2">
                                  <span className="text-slate-400/50">→</span>
                                  <span className="font-black text-emerald-600 dark:text-emerald-400">
                                      +Rp {tier.bon.toLocaleString('id-ID')}
                                  </span>
                              </div>
                          </div>
                      ))}
                  </div>
              </div>

              {/* Server Terpilih (Statis) */}
              <div className="mb-6">
                <label className="mb-3 block text-sm font-bold text-slate-700 dark:text-slate-300">Pilih Metode</label>
                <div className={`flex w-full items-center justify-between rounded-2xl border bg-slate-50 p-4 transition-all dark:bg-slate-950 ${color.border} ring-1 ${color.ring}`}>
                  <div className="flex items-center gap-3">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${color.bg} ${color.text}`}>
                        <ShieldCheck size={20} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-800 dark:text-white">QRIS Utama</p>
                      <p className="text-[10px] font-medium text-slate-500">Bebas Biaya Admin (S&K)</p>
                    </div>
                  </div>
                  <CheckCircle2 size={20} className={color.text} />
                </div>
              </div>

              {/* Informasi Minimal */}
              <div className="mb-6 flex items-start gap-3 rounded-2xl bg-amber-50 p-4 dark:bg-amber-500/10">
                <AlertCircle size={20} className="shrink-0 text-amber-600 dark:text-amber-500" />
                <p className="text-xs font-medium leading-relaxed text-amber-800 dark:text-amber-400">
                  Minimal deposit <span className="font-bold">Rp 500</span>. Harap screenshot QRIS dan bayar sebelum batas waktu habis.
                </p>
              </div>

              <button 
                onClick={handleDeposit}
                disabled={loading || !amount || amount < 500}
                className={`flex w-full items-center justify-center gap-2 rounded-2xl py-4 text-sm font-bold shadow-lg transition-all active:scale-[0.98] ${
                  loading || !amount || amount < 500
                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed dark:bg-slate-800 dark:text-slate-500 shadow-none' 
                  : `${color.btn} hover:shadow-xl`
                }`}
              >
                {loading ? <Loader2 size={20} className="animate-spin" /> : <Zap size={20} className="fill-current" />}
                {loading ? 'Memproses Tagihan...' : 'Buat Tagihan QRIS'}
              </button>
            </div>
          </div>
        ) : (
          <div className="animate-in zoom-in-95 fade-in duration-500">
            {/* Tampilan QRIS Ala Invoice/Receipt */}
            <div className="relative overflow-hidden rounded-3xl border border-slate-200/60 bg-white shadow-xl shadow-slate-200/40 dark:border-slate-800 dark:bg-slate-900 dark:shadow-none">
                
                {/* Aksen Header */}
                <div className={`h-2 w-full ${color.bg}`}></div>

                <div className="p-6 text-center">
                    <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-slate-50 dark:bg-slate-800">
                        <QrCode size={28} className={color.text} />
                    </div>
                    <h3 className="text-xl font-black text-slate-800 dark:text-white">Menunggu Pembayaran</h3>
                    <p className="mt-1 text-xs font-medium text-slate-500 dark:text-slate-400">Scan QRIS menggunakan aplikasi E-Wallet/M-Banking</p>

                    <div className="my-6 flex justify-center">
                        <div className="relative rounded-3xl border-2 border-dashed border-slate-200 bg-white p-3 dark:border-slate-700">
                            <img src={qrisData.qr_image} alt="QRIS" className="h-60 w-60 object-contain rounded-xl" />
                        </div>
                    </div>

                    <div className="flex flex-col gap-1 mb-6">
                        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Total Tagihan</span>
                        <span className={`text-3xl font-black ${color.text}`}>
                            Rp {qrisData.total_pay.toLocaleString('id-ID')}
                        </span>
                    </div>

                    {/* Garis Pemisah ala Struk */}
                    <div className="relative mb-6 border-t-2 border-dashed border-slate-200 dark:border-slate-700">
                        <div className="absolute -left-8 -top-3 h-6 w-6 rounded-full bg-slate-50 dark:bg-slate-950"></div>
                        <div className="absolute -right-8 -top-3 h-6 w-6 rounded-full bg-slate-50 dark:bg-slate-950"></div>
                    </div>

                    <div className="space-y-4 text-left mb-6">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Saldo Diterima</span>
                            <div className="flex flex-col items-end">
                                <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">Rp {qrisData.amount_received.toLocaleString('id-ID')}</span>
                                {qrisData.amount_received >= 20000 && (
                                    <span className="text-[10px] font-bold text-emerald-500 dark:text-emerald-500/80">
                                        (Termasuk Bonus 5%)
                                    </span>
                                )}
                            </div>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Metode</span>
                            <span className="text-sm font-bold text-slate-800 dark:text-slate-200">QRIS Instant</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-slate-500 dark:text-slate-400">ID Transaksi</span>
                            <div className="flex items-center gap-2">
                                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 select-all">{qrisData.deposit_id}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex p-2 gap-2 bg-slate-50 dark:bg-slate-950/50">
                    <button 
                        onClick={handleManualRefresh}
                        className={`flex flex-1 items-center justify-center gap-2 rounded-2xl py-3.5 text-sm font-bold transition-all ${color.bg} ${color.text} hover:opacity-80`}
                    >
                        <RefreshCw size={18} className={historyLoading ? "animate-spin" : ""} />
                        Cek Pembayaran
                    </button>
                    <button 
                        onClick={handleCancelClick}
                        className="flex items-center justify-center rounded-2xl bg-red-50 px-4 py-3.5 text-red-600 transition-all hover:bg-red-100 dark:bg-red-500/10 dark:text-red-500 dark:hover:bg-red-500/20"
                    >
                        <Trash2 size={20} />
                    </button>
                </div>
            </div>
          </div>
        )}

        {/* Histori Transaksi */}
        <div className="mt-8">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
                <History size={18} className="text-slate-600 dark:text-slate-300" />
                <h3 className="font-bold text-slate-800 dark:text-white">Riwayat Terakhir</h3>
            </div>
          </div>

          <div className="space-y-3">
            {historyLoading ? (
               <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-200 py-10 dark:border-slate-800">
                   <Loader2 size={24} className={`animate-spin mb-2 ${color.text}`} />
                   <p className="text-xs font-medium text-slate-400">Memuat riwayat...</p>
               </div>
            ) : history.length > 0 ? (
              history.map((item) => (
                <div key={item.id} className="overflow-hidden rounded-2xl border border-slate-200/60 bg-white shadow-sm transition-all hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700">
                   <div onClick={() => toggleExpand(item.id)} className="flex cursor-pointer items-center justify-between p-4">
                       <div className="flex items-center gap-4">
                          <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${
                              item.status === 'success' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400' : 
                              item.status === 'pending' ? 'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400' : 
                              'bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400'
                          }`}>
                              <Wallet size={20} />
                          </div>
                          <div>
                             <p className="text-base font-black text-slate-800 dark:text-white">
                                Rp {item.request_amount.toLocaleString('id-ID')}
                             </p>
                             <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mt-0.5">
                                {new Date(item.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })}
                             </p>
                          </div>
                       </div>
                       <div className="flex flex-col items-end gap-2">
                          {getStatusBadge(item.status)}
                       </div>
                   </div>
                   
                   {/* Detail Expand */}
                   <div className={`grid transition-all duration-300 ease-in-out ${expandedId === item.id ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
                     <div className="overflow-hidden">
                        <div className="border-t border-slate-100 bg-slate-50/50 p-4 dark:border-slate-800/50 dark:bg-slate-950/30">
                            <div className="flex flex-col gap-2">
                                <div className="flex justify-between items-center text-xs">
                                    <span className="font-medium text-slate-500 dark:text-slate-400">ID Transaksi</span>
                                    <span className="font-mono font-bold text-slate-700 dark:text-slate-300 select-all">{item.id}</span>
                                </div>
                                <div className="flex justify-between items-center text-xs">
                                    <span className="font-medium text-slate-500 dark:text-slate-400">Metode</span>
                                    <span className="font-bold text-slate-700 dark:text-slate-300">QRIS Utama</span>
                                </div>
                                <div className="flex justify-between items-center text-xs">
                                    <span className="font-medium text-slate-500 dark:text-slate-400">Total Tagihan</span>
                                    <span className="font-bold text-slate-700 dark:text-slate-300">Rp {item.total_bill?.toLocaleString('id-ID')}</span>
                                </div>
                            </div>
                        </div>
                     </div>
                   </div>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-200 bg-white py-12 dark:border-slate-800 dark:bg-slate-900">
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-50 text-slate-400 dark:bg-slate-800">
                    <History size={24} />
                </div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Belum ada riwayat deposit</p>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Modal Konfirmasi Batal */}
      {confirmModal.show && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-5 animate-in fade-in duration-200">
              <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-sm p-6 shadow-2xl animate-in zoom-in-95 duration-200">
                  <div className="flex flex-col items-center text-center">
                      <div className="w-16 h-16 bg-red-50 dark:bg-red-500/10 rounded-full flex items-center justify-center mb-4 text-red-600 dark:text-red-500">
                          <HelpCircle size={32} />
                      </div>
                      <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">{confirmModal.title}</h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400 mb-8">{confirmModal.message}</p>
                      <div className="flex gap-3 w-full">
                          <button onClick={closeConfirm} disabled={confirmModal.loading} className="flex-1 py-3.5 rounded-2xl border border-slate-200 text-slate-700 font-bold text-sm transition-all hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800">
                              Kembali
                          </button>
                          <button onClick={confirmModal.onConfirm} disabled={confirmModal.loading} className="flex-1 py-3.5 rounded-2xl bg-red-600 text-white font-bold text-sm transition-all hover:bg-red-700 active:scale-95 flex items-center justify-center gap-2 shadow-lg shadow-red-500/30">
                              {confirmModal.loading && <Loader2 size={18} className="animate-spin" />}
                              {confirmModal.loading ? 'Memproses...' : 'Ya, Batalkan'}
                          </button>
                      </div>
                  </div>
              </div>
          </div>
      )}

      {/* Toast Notification */}
      <div className={`fixed bottom-24 left-1/2 z-[100] flex w-[90%] max-w-sm -translate-x-1/2 transform items-center gap-3 rounded-2xl px-5 py-4 shadow-2xl transition-all duration-400 ease-out ${toast.show ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-10 opacity-0 scale-95 pointer-events-none'} ${toast.type === 'success' ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900' : 'bg-red-600 text-white'}`}>
          {toast.type === 'success' ? <CheckCircle2 size={20} className={toast.type === 'success' ? 'text-emerald-400 dark:text-emerald-600' : ''} /> : <AlertCircle size={20} />}
          <span className="text-sm font-bold">{toast.message}</span>
      </div>

      <BottomNav />
    </div>
  );
}