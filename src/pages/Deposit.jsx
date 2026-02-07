import { useState } from 'react';
import api from '../utils/api';
import { useTheme } from '../context/ThemeContext';
import { Wallet, QrCode, AlertCircle } from 'lucide-react';

export default function Deposit() {
  const { color } = useTheme();
  const [amount, setAmount] = useState(5000);
  const [qrisData, setQrisData] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleDeposit = async () => {
    if (amount < 500) return alert('Minimal deposit Rp500');
    setLoading(true);
    try {
      const res = await api.get(`/deposit/create?amount=${amount}`);
      if (res.data.success) {
        setQrisData(res.data.data);
      }
    } catch (err) {
      alert('Gagal membuat deposit');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 transition-colors duration-300 dark:bg-slate-900 md:p-8">
      <div className="mx-auto max-w-lg">
        <h1 className="mb-8 text-2xl font-bold text-slate-900 dark:text-white">Isi Saldo</h1>

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">
          <div className="border-b border-slate-100 p-6 dark:border-slate-800">
             <div className="flex items-center gap-3">
                <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${color.bg} ${color.text}`}>
                  <Wallet size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">Topup QRIS Instant</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Otomatis masuk 24 Jam</p>
                </div>
             </div>
          </div>

          <div className="p-6">
            {!qrisData ? (
              <div className="space-y-6">
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">Nominal Deposit (Rp)</label>
                  <div className="relative">
                    <span className="absolute left-4 top-3.5 font-semibold text-slate-400">Rp</span>
                    <input 
                      type="number" 
                      className={`w-full rounded-xl border bg-white py-3 pl-12 pr-4 text-lg font-bold text-slate-900 focus:outline-none focus:ring-2 dark:bg-slate-900 dark:text-white ${color.border} ${color.ring}`}
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      min="500"
                    />
                  </div>
                </div>

                <div className="rounded-xl bg-blue-50 p-4 text-sm text-blue-700 dark:bg-blue-900/20 dark:text-blue-300">
                  <div className="flex gap-2">
                    <AlertCircle size={18} className="shrink-0" />
                    <p>Minimal deposit Rp 500. Biaya admin mungkin berlaku sesuai provider QRIS.</p>
                  </div>
                </div>

                <button 
                  onClick={handleDeposit} 
                  disabled={loading}
                  className={`w-full rounded-xl py-3.5 font-bold transition-all hover:scale-[1.02] disabled:opacity-50 ${color.btn}`}
                >
                  {loading ? 'Memproses...' : 'Buat Tagihan QRIS'}
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center text-center">
                <div className="mb-4 rounded-full bg-slate-100 p-3 dark:bg-slate-800">
                  <QrCode size={32} className="text-slate-600 dark:text-slate-300" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Scan QRIS Dibawah</h3>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Gunakan GoPay, OVO, Dana, atau Mobile Banking</p>

                <div className="my-6 rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
                  <img src={qrisData.qr_image} alt="QRIS Code" className="h-64 w-64 object-contain mix-blend-multiply" />
                </div>

                <div className="w-full space-y-3 rounded-xl bg-slate-50 p-4 dark:bg-slate-900">
                   <div className="flex justify-between text-sm">
                      <span className="text-slate-500">Total Bayar</span>
                      <span className="font-bold text-slate-900 dark:text-white">Rp {qrisData.total_pay.toLocaleString('id-ID')}</span>
                   </div>
                   <div className="flex justify-between text-sm">
                      <span className="text-slate-500">Saldo Diterima</span>
                      <span className={`font-bold ${color.text}`}>Rp {qrisData.amount_received.toLocaleString('id-ID')}</span>
                   </div>
                </div>

                <button 
                    onClick={() => setQrisData(null)}
                    className="mt-6 w-full rounded-xl border border-slate-200 py-3 font-semibold text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                    Buat Deposit Baru
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

