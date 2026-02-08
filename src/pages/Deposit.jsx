import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import BottomNav from '../components/BottomNav';
import { useTheme } from '../context/ThemeContext';
import { Wallet, QrCode, AlertCircle, History, CheckCircle2, XCircle, Clock, ChevronRight } from 'lucide-react';

export default function Deposit() {
  const { color } = useTheme();
  const [amount, setAmount] = useState(5000);
  const [qrisData, setQrisData] = useState(null);
  const [loading, setLoading] = useState(false);
  
  // State untuk Riwayat
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(true);

  // Ambil data riwayat saat halaman dimuat
  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const res = await api.get('/deposit/history');
      if (res.data.success) {
        // Ambil 5 transaksi terakhir saja agar tidak terlalu panjang
        setHistory(res.data.data.slice(0, 5));
      }
    } catch (err) {
      // Silent error
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleDeposit = async () => {
    if (amount < 500) return alert('Minimal deposit Rp500');
    setLoading(true);
    try {
      const res = await api.get(`/deposit/create?amount=${amount}`);
      if (res.data.success) {
        setQrisData(res.data.data);
        // Refresh history setelah membuat deposit baru (optional, akan muncul sebagai pending)
        fetchHistory();
      }
    } catch (err) {
      alert('Gagal membuat deposit');
    }
    setLoading(false);
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case 'success':
        return <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700">Sukses</span>;
      case 'pending':
        return <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-700">Pending</span>;
      default:
        return <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-bold text-red-700">Gagal</span>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-28">
      {/* Header */}
      <div className="bg-white px-5 pt-8 pb-4 sticky top-0 z-40 border-b border-gray-100">
        <h1 className="text-xl font-bold text-gray-800">Isi Saldo</h1>
      </div>

      <div className="px-5 mt-6 max-w-md mx-auto">
        
        {/* Card Form Deposit (Style seperti Foto 1) */}
        {!qrisData ? (
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
            {/* Header Metode */}
            <div className="flex items-center gap-4 mb-6 border-b border-gray-50 pb-4">
              <div className="w-12 h-12 rounded-2xl bg-purple-50 flex items-center justify-center text-purple-600">
                <Wallet size={24} />
              </div>
              <div>
                <h3 className="font-bold text-gray-800 text-lg">Topup QRIS Instant</h3>
                <p className="text-xs text-gray-400">Otomatis masuk 24 Jam</p>
              </div>
            </div>

            {/* Input Nominal */}
            <div className="mb-5">
              <label className="block text-xs font-bold text-gray-500 mb-2">Nominal Deposit (Rp)</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-gray-400">Rp</span>
                <input 
                  type="number" 
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3.5 pl-10 pr-4 text-lg font-bold text-gray-800 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="5000"
                  min="500"
                />
              </div>
            </div>

            {/* Info Box */}
            <div className="bg-blue-50 rounded-xl p-4 flex gap-3 mb-6">
              <AlertCircle size={20} className="text-blue-600 shrink-0 mt-0.5" />
              <p className="text-xs text-blue-700 leading-relaxed">
                Minimal deposit <span className="font-bold">Rp 500</span>. Biaya admin mungkin berlaku sesuai provider QRIS.
              </p>
            </div>

            {/* Tombol Aksi */}
            <button 
              onClick={handleDeposit}
              disabled={loading}
              className={`w-full py-4 rounded-xl font-bold text-white shadow-lg shadow-purple-200 transition-transform active:scale-95 ${color.btn}`}
            >
              {loading ? 'Memproses...' : 'Buat Tagihan QRIS'}
            </button>
          </div>
        ) : (
          /* Tampilan QRIS Result */
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 text-center">
            <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center text-green-600 mx-auto mb-4">
               <QrCode size={24} />
            </div>
            <h3 className="font-bold text-gray-800 text-xl">Scan Pembayaran</h3>
            <p className="text-xs text-gray-400 mt-1">Scan QRIS di bawah ini sebelum expired</p>

            <div className="my-6 p-2 border-2 border-dashed border-gray-200 rounded-2xl inline-block">
               <img src={qrisData.qr_image} alt="QRIS" className="w-56 h-56 object-contain" />
            </div>

            <div className="bg-gray-50 rounded-xl p-4 space-y-2 mb-6">
               <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Total Bayar</span>
                  <span className="font-bold text-gray-800">Rp {qrisData.total_pay.toLocaleString('id-ID')}</span>
               </div>
               <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Saldo Masuk</span>
                  <span className="font-bold text-green-600">Rp {qrisData.amount_received.toLocaleString('id-ID')}</span>
               </div>
            </div>

            <button 
              onClick={() => setQrisData(null)}
              className="w-full py-3 rounded-xl font-bold text-gray-600 border border-gray-200 hover:bg-gray-50"
            >
              Kembali / Buat Baru
            </button>
          </div>
        )}

        {/* Bagian Riwayat Deposit (Menyatu di halaman ini) */}
        <div className="mt-8">
          <div className="flex items-center gap-2 mb-4">
            <History size={18} className="text-gray-400" />
            <h3 className="font-bold text-gray-700">Riwayat Terakhir</h3>
          </div>

          <div className="space-y-3">
            {historyLoading ? (
               <div className="text-center py-6 text-gray-400 text-sm">Memuat riwayat...</div>
            ) : history.length > 0 ? (
              history.map((item) => (
                <div key={item.id} className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex justify-between items-center">
                   <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        item.status === 'success' ? 'bg-green-50 text-green-600' :
                        item.status === 'pending' ? 'bg-amber-50 text-amber-600' : 'bg-red-50 text-red-600'
                      }`}>
                         {item.status === 'success' ? <CheckCircle2 size={18} /> : 
                          item.status === 'pending' ? <Clock size={18} /> : <XCircle size={18} />}
                      </div>
                      <div>
                         <p className="font-bold text-gray-800 text-sm">Rp {item.request_amount.toLocaleString('id-ID')}</p>
                         <p className="text-[10px] text-gray-400">
                            {new Date(item.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                         </p>
                      </div>
                   </div>
                   <div className="text-right">
                      {getStatusBadge(item.status)}
                   </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 bg-white rounded-2xl border border-dashed border-gray-200">
                <p className="text-sm text-gray-400">Belum ada riwayat deposit</p>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Navigasi Bawah */}
      <BottomNav />
    </div>
  );
}

