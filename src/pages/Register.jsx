import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../utils/api';
import { useTheme } from '../context/ThemeContext';

export default function Register() {
  const { color } = useTheme();
  const [form, setForm] = useState({ username: '', email: '', password: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/auth/register', form);
      if (res.data.success) {
        alert('Registrasi berhasil! Silakan login.');
        navigate('/login');
      }
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Registrasi gagal');
    }
  };

  return (
    <div className="flex min-h-[85vh] items-center justify-center p-4 bg-slate-50 dark:bg-slate-900 transition-colors duration-300">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-xl dark:border-slate-800 dark:bg-slate-950">
        <div className="mb-6 text-center">
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Buat Akun Baru</h2>
          <p className="text-slate-500 dark:text-slate-400">Bergabunglah dengan ribuan pengguna lain</p>
        </div>

        {error && <div className="mb-4 rounded bg-red-500/10 p-3 text-sm text-red-600 border border-red-500/20 dark:text-red-400">{error}</div>}
        
        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Username</label>
            <input 
              type="text" 
              className={`mt-1 w-full rounded-lg border bg-white p-3 text-slate-900 focus:outline-none focus:ring-2 dark:bg-slate-900 dark:text-white ${color.border} ${color.ring}`}
              value={form.username}
              onChange={(e) => setForm({...form, username: e.target.value})}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Email</label>
            <input 
              type="email" 
              className={`mt-1 w-full rounded-lg border bg-white p-3 text-slate-900 focus:outline-none focus:ring-2 dark:bg-slate-900 dark:text-white ${color.border} ${color.ring}`}
              value={form.email}
              onChange={(e) => setForm({...form, email: e.target.value})}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Password</label>
            <input 
              type="password" 
              className={`mt-1 w-full rounded-lg border bg-white p-3 text-slate-900 focus:outline-none focus:ring-2 dark:bg-slate-900 dark:text-white ${color.border} ${color.ring}`}
              value={form.password}
              onChange={(e) => setForm({...form, password: e.target.value})}
              required
            />
          </div>
          <button type="submit" className={`w-full rounded-lg py-3 font-bold transition-all hover:scale-[1.02] ${color.btn}`}>
            Daftar Sekarang
          </button>
        </form>
        <div className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
          Sudah punya akun? <Link to="/login" className={`font-bold hover:underline ${color.text}`}>Login disini</Link>
        </div>
      </div>
    </div>
  );
}

