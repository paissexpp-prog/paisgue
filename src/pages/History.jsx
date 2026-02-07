import { useEffect, useState } from 'react';
import api from '../utils/api';
import { useTheme } from '../context/ThemeContext';
import { Clock, CheckCircle2, XCircle, FileText } from 'lucide-react';

export default function History() {
  const { color } = useTheme();
  const [history, setHistory] = useState([]);

  useEffect(() => {
    api.get('/deposit/history').then(res => {
      if(res.data.success) setHistory(res.data.data);
    }).catch(() => {});
  }, []);

  const getStatusBadge = (status) => {
    switch(status) {
      case 'success':
        return <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-medium text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400"><CheckCircle2 size={12}/> Sukses</span>;
      case 'pending':
        return <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-800 dark:bg-amber-900/30 dark:text-amber-400"><Clock size={12}/> Pending</span>;
      default:
        return <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800 dark:bg-red-900/30 dark:text-red-400"><XCircle size={12}/> Gagal</span>;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 transition-colors duration-300 dark:bg-slate-900 md:p-8">
      <div className="mx-auto max-w-6xl">
        <h1 className="mb-8 text-2xl font-bold text-slate-900 dark:text-white">Riwayat Transaksi</h1>

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">
          <div className="border-b border-slate-100 p-6 dark:border-slate-800">
             <div className="flex items-center gap-3">
                <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${color.bg} ${color.text}`}>
                  <FileText size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">Catatan Deposit</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Semua riwayat topup saldo Anda</p>
                </div>
             </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500 dark:bg-slate-900 dark:text-slate-400">
                <tr>
                  <th className="px-6 py-4 font-semibold">ID Referensi</th>
                  <th className="px-6 py-4 font-semibold">Nominal</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                  <th className="px-6 py-4 font-semibold">Tanggal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {history.length > 0 ? history.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/50">
                    <td className="px-6 py-4 font-mono text-xs text-slate-500 dark:text-slate-400">
                      {item.id}
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">
                      Rp {item.request_amount.toLocaleString('id-ID')}
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(item.status)}
                    </td>
                    <td className="px-6 py-4 text-slate-500 dark:text-slate-400">
                      {new Date(item.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="4" className="px-6 py-8 text-center text-slate-500 dark:text-slate-400">
                      Belum ada data transaksi ditemukan.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

