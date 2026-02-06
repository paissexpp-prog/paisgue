import { useEffect, useState } from 'react';
import api from '../utils/api';

export default function History() {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    api.get('/deposit/history').then(res => {
      if(res.data.success) setHistory(res.data.data);
    }).catch(() => {});
  }, []);

  return (
    <div className="p-4 md:p-8">
      <h1 className="mb-6 text-2xl font-bold">Riwayat Deposit</h1>
      <div className="overflow-x-auto rounded-lg bg-slate-800">
        <table className="w-full text-left text-sm text-slate-400">
          <thead className="bg-slate-700 text-xs uppercase text-slate-200">
            <tr>
              <th className="px-6 py-3">ID</th>
              <th className="px-6 py-3">Jumlah</th>
              <th className="px-6 py-3">Status</th>
              <th className="px-6 py-3">Tanggal</th>
            </tr>
          </thead>
          <tbody>
            {history.map((item) => (
              <tr key={item.id} className="border-b border-slate-700 bg-slate-800">
                <td className="px-6 py-4 font-mono">{item.id.substring(0, 15)}...</td>
                <td className="px-6 py-4 text-white">Rp{item.request_amount.toLocaleString('id-ID')}</td>
                <td className="px-6 py-4">
                  <span className={`rounded px-2 py-1 text-xs font-bold ${
                    item.status === 'success' ? 'bg-green-900 text-green-300' : 
                    item.status === 'pending' ? 'bg-yellow-900 text-yellow-300' : 'bg-red-900 text-red-300'
                  }`}>
                    {item.status.toUpperCase()}
                  </span>
                </td>
                <td className="px-6 py-4">{new Date(item.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
