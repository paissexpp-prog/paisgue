import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import BottomNav from '../components/BottomNav';
import { useTheme } from '../context/ThemeContext';
import { 
  Wallet, QrCode, AlertCircle, History, CheckCircle2, XCircle, 
  Clock, Trash2, ChevronDown, ChevronUp, HelpCircle, Loader2 
} from 'lucide-react';

export default function Deposit() {
  const { color } = useTheme();
  const [amount, setAmount] = useState(5000);
  const [qrisData, setQrisData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);

  // --- STATE MODAL & TOAST ---
  const [confirmModal, setConfirmModal] = useState({ show: false, title: '', message: '', onConfirm: null, loading: false });
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  useEffect(() => {
    fetchHistory();
  }, []);

  // --- FUNGSI HELPER UI ---
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

        // Auto-Restore Pending QRIS
        if (data.length > 0 && data[0].status === 'pending') {
            const pendingItem = data[0];
            setQrisData({
                deposit_id: pendingItem.id,
                qr_image: pendingItem.qr_image,
                total_pay: pendingItem.total_bill,
                amount_received: pendingItem.request_amount
            });
        } else {
            setQrisData(null);
        }
      }
    } catch (err) { } 
    finally { setHistoryLoading(false); }
  };

  const handleDeposit = async () => {
    if (amount < 500) return showToast('Minimal deposit Rp500', 'error');
    setLoading(true);
    try {
      const res = await api.get(`/deposit/create?amount=${amount}`);
      if (res.data.success) {
        setQrisData(res.data.data);
        fetchHistory();
        showToast('Tagihan berhasil dibuat', 'success');
      }
    } catch (err) {
      showToast('Gagal membuat deposit', 'error');
    }
    setLoading(false);
  };

  // --- LOGIKA CANCEL (DENGAN MODAL KEREN) ---
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
        return <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">Sukses</span>;
      case 'pending':
        return <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">Pending</span>;
      default:
        return <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-bold text-red-700 dark:bg-red-900/30 dark:text-red-400">Gagal</span>;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-28 transition-colors duration-300 dark:bg-slate-900">
      
      {/* Header */}
      <div className="sticky top-0 z-40 border-b border-slate-100 bg-white/90 px-5 pb-4 pt-8 backdrop-blur-md dark:border-slate-800 dark:bg-slate-950/90">
        <h1 className="text-xl font-bold text-slate-800 dark:text-white">Isi Saldo</h1>
      </div>

      <div className="mx-auto mt-6 max-w-md px-5">
        
        {/* FORM / QRIS SECTION */}
        {!qrisData ? (
          <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950">
            <div className="mb-6 flex items-center gap-4 border-b border-slate-50 pb-4 dark:border-slate-800">
              <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${color.bg} ${color.text}`}>
                <Wallet size={24} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-800 dark:text-white">Topup QRIS Instant</h3>
                <p className="text-xs text-slate-400">Otomatis masuk 24 Jam</p>
              </div>
            </div>

            <div className="mb-5">
              <label className="mb-2 block text-xs font-bold text-slate-500 dark:text-slate-400">Nominal Deposit (Rp)</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-slate-400">Rp</span>
                <input 
                  type="number" 
                  className={`w-full rounded-xl border bg-slate-50 py-3.5 pl-10 pr-4 text-lg font-bold text-slate-800 transition-all focus:outline-none focus:ring-1 dark:bg-slate-900 dark:text-white ${color.border} ${color.ring}`}
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="5000"
                  min="500"
                />
              </div>
            </div>

            <div className={`mb-6 flex gap-3 rounded-xl p-4 ${color.bg}`}>
              <AlertCircle size={20} className={`shrink-0 mt-0.5 ${color.text}`} />
              <p className={`text-xs leading-relaxed ${color.text}`}>
                Minimal deposit <span className="font-bold">Rp 500</span>. Biaya admin mungkin berlaku sesuai provider QRIS.
              </p>
            </div>

            <button 
              onClick={handleDeposit}
              disabled={loading}
              className={`w-full rounded-xl py-4 font-bold shadow-lg transition-transform active:scale-95 flex justify-center items-center gap-2 ${color.btn}`}
            >
              {loading && <Loader2 size={18} className="animate-spin" />}
              {loading ? 'Memproses...' : 'Buat Tagihan QRIS'}
            </button>
          </div>
        ) : (
          /* TAMPILAN QRIS */
          <div className="rounded-3xl border border-slate-100 bg-white p-6 text-center shadow-sm dark:border-slate-800 dark:bg-slate-950 animate-in fade-in zoom-in duration-300">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400">
                <QrCode size={24} />
            </div>
            <h3 className="text-xl font-bold text-slate-800 dark:text-white">Scan Pembayaran</h3>
            <p className="mt-1 text-xs text-slate-400">Scan QRIS di bawah ini sebelum expired</p>

            <div className="my-6 inline-block rounded-2xl border-2 border-dashed border-slate-200 p-2 dark:border-slate-700">
               <img src={qrisData.qr_image} alt="QRIS" className="h-56 w-56 object-contain" />
            </div>

            <div className="mb-6 space-y-2 rounded-xl bg-slate-50 p-4 dark:bg-slate-900">
               <div className="flex justify-between text-sm">
                  <span className="text-slate-500 dark:text-slate-400">Total Bayar</span>
                  <span className="font-bold text-slate-800 dark:text-white">Rp {qrisData.total_pay.toLocaleString('id-ID')}</span>
               </div>
               <div className="flex justify-between text-sm">
                  <span className="text-slate-500 dark:text-slate-400">Saldo Masuk</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">Rp {qrisData.amount_received.toLocaleString('id-ID')}</span>
               </div>
               <div className="flex justify-between text-sm pt-2 border-t border-slate-200 dark:border-slate-800">
                  <span className="text-slate-500 dark:text-slate-400">ID Referensi</span>
                  <span className="font-mono text-xs text-slate-600 dark:text-slate-300">{qrisData.deposit_id}</span>
               </div>
            </div>

            <button 
              onClick={handleCancelClick}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-100 bg-red-50 py-3 font-bold text-red-600 transition-colors hover:bg-red-100 dark:border-red-900/30 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/40"
            >
              <Trash2 size={18} /> Batalkan Deposit
            </button>
          </div>
        )}

        {/* --- RIWAYAT TRANSAKSI --- */}
        <div className="mt-8">
          <div className="mb-4 flex items-center gap-2">
            <History size={18} className="text-slate-400" />
            <h3 className="font-bold text-slate-700 dark:text-slate-200">Riwayat Terakhir</h3>
          </div>

          <div className="space-y-3">
            {historyLoading ? (
               <div className="py-6 text-center text-sm text-slate-400">Memuat riwayat...</div>
            ) : history.length > 0 ? (
              history.map((item) => (
                <div key={item.id} className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm transition-all dark:border-slate-800 dark:bg-slate-950">
                   <div onClick={() => toggleExpand(item.id)} className="flex cursor-pointer items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-900/50">
                       <div className="flex items-center gap-3">
                          <div className={`flex h-10 w-10 items-center justify-center rounded-full ${item.status === 'success' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400' : item.status === 'pending' ? 'bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400' : 'bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400'}`}>
                              {item.status === 'success' ? <CheckCircle2 size={18} /> : item.status === 'pending' ? <Clock size={18} /> : <XCircle size={18} />}
                          </div>
                          <div>
                             <p className="text-sm font-bold text-slate-800 dark:text-white">Rp {item.request_amount.toLocaleString('id-ID')}</p>
                             <p className="text-[10px] text-slate-400">{new Date(item.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</p>
                          </div>
                       </div>
                       <div className="flex items-center gap-3">
                          {getStatusBadge(item.status)}
                          {expandedId === item.id ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
                       </div>
                   </div>
                   {expandedId === item.id && (
                     <div className="border-t border-slate-100 bg-slate-50 p-4 text-xs dark:border-slate-800 dark:bg-slate-900/30">
                        <div className="flex justify-between items-center">
                           <span className="text-slate-500 dark:text-slate-400 font-medium">ID Transaksi</span>
                           <span className="font-mono font-bold text-slate-700 dark:text-slate-300 select-all">{item.id}</span>
                        </div>
                     </div>
                   )}
                </div>
              ))
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-white py-8 text-center dark:border-slate-800 dark:bg-slate-950">
                <p className="text-sm text-slate-400">Belum ada riwayat deposit</p>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* --- CONFIRM MODAL (POPUP KEREN) --- */}
      {confirmModal.show && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-5 animate-in fade-in duration-200">
              <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-sm p-6 shadow-2xl scale-100">
                  <div className="flex flex-col items-center text-center">
                      <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mb-4 text-red-600 dark:text-red-400">
                          <HelpCircle size={32} />
                      </div>
                      <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">{confirmModal.title}</h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">{confirmModal.message}</p>
                      <div className="flex gap-3 w-full">
                          <button onClick={closeConfirm} disabled={confirmModal.loading} className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-600 font-bold text-sm hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800">
                              Batal
                          </button>
                          <button onClick={confirmModal.onConfirm} disabled={confirmModal.loading} className="flex-1 py-3 rounded-xl bg-red-600 text-white font-bold text-sm hover:bg-red-700 flex items-center justify-center gap-2">
                              {confirmModal.loading && <Loader2 size={16} className="animate-spin" />}
                              {confirmModal.loading ? 'Memproses...' : 'Ya, Batalkan'}
                          </button>
                      </div>
                  </div>
              </div>
          </div>
      )}

      {/* --- TOAST NOTIFICATION --- */}
      <div className={`fixed bottom-24 left-1/2 z-[100] flex -translate-x-1/2 transform items-center gap-3 rounded-full px-5 py-3 shadow-2xl transition-all duration-300 ${toast.show ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0 pointer-events-none'} ${toast.type === 'success' ? 'bg-slate-900 text-white' : 'bg-red-500 text-white'}`}>
          {toast.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          <span className="text-sm font-bold">{toast.message}</span>
      </div>

      <BottomNav />
    </div>
  );
}

