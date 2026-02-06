import { useState } from 'react';
import api from '../utils/api';

export default function Deposit() {
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
    <div className="p-4 md:p-8">
      <h1 className="mb-6 text-2xl font-bold">Isi Saldo (QRIS)</h1>
      <div className="w-full max-w-lg rounded-lg bg-slate-800 p-6">
        {!qrisData ? (
          <div className="space-y-4">
            <label className="block text-sm text-slate-400">Nominal Deposit</label>
            <input 
              type="number" 
              className="w-full rounded bg-slate-700 p-3 text-white"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              min="500"
            />
            <button 
              onClick={handleDeposit} 
              disabled={loading}
              className="w-full rounded bg-green-600 py-3 font-bold hover:bg-green-500 disabled:opacity-50"
            >
              {loading ? 'Memproses...' : 'Buat Tagihan QRIS'}
            </button>
          </div>
        ) : (
          <div className="text-center">
            <h3 className="text-lg font-bold text-yellow-400">Scan QRIS Ini</h3>
            <div className="my-4 flex justify-center bg-white p-2 rounded">
              <img src={qrisData.qr_image} alt="QRIS" className="h-64 w-64 object-contain" />
            </div>
            <p className="text-xl font-bold">Total Bayar: Rp{qrisData.total_pay.toLocaleString('id-ID')}</p>
            <p className="mt-2 text-sm text-red-400">Saldo masuk: Rp{qrisData.amount_received.toLocaleString('id-ID')}</p>
            <button 
                onClick={() => setQrisData(null)}
                className="mt-6 w-full rounded border border-slate-600 py-2 hover:bg-slate-700"
            >
                Buat Deposit Baru
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
