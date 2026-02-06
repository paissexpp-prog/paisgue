import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../utils/api';
import { useTheme } from '../context/ThemeContext';

export default function Login() {
  const { color } = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/auth/login', { email, password });
      if (res.data.success) {
        localStorage.setItem('token', res.data.data.token);
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Login gagal');
    }
  };

  return (
    <div className="flex min-h-[85vh] items-center justify-center p-4 bg-slate-50 dark:bg-slate-900 transition-colors duration-300">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-xl dark:border-slate-800 dark:bg-slate-950">
        <div className="mb-6 text-center">
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Selamat Datang</h2>
          <p className="text-slate-500 dark:text-slate-400">Silakan masuk ke akun Anda</p>
        </div>

        {error && <div className="mb-4 rounded bg-red-500/10 p-3 text-sm text-red-600 border border-red-500/20 dark:text-red-400">{error}</div>}
        
        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Email</label>
            <input 
              type="email" 
              className={`mt-1 w-full rounded-lg border bg-white p-3 text-slate-900 focus:outline-none focus:ring-2 dark:bg-slate-900 dark:text-white ${color.border} ${color.ring}`}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Password</label>
            <input 
              type="password" 
              className={`mt-1 w-full rounded-lg border bg-white p-3 text-slate-900 focus:outline-none focus:ring-2 dark:bg-slate-900 dark:text-white ${color.border} ${color.ring}`}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className={`w-full rounded-lg py-3 font-bold transition-all hover:scale-[1.02] ${color.btn}`}>
            Masuk
          </button>
        </form>
        <div className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
          Belum punya akun? <Link to="/register" className={`font-bold hover:underline ${color.text}`}>Daftar Sekarang</Link>
        </div>
      </div>
    </div>
  );
}

