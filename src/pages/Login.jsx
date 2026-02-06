import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../utils/api';
import { useTheme } from '../context/ThemeContext'; // Import ini

export default function Login() {
  const { theme } = useTheme(); // Pakai tema
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
    <div className="flex min-h-[80vh] items-center justify-center p-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-800/50 p-8 shadow-2xl backdrop-blur-xl">
        <div className="mb-6 text-center">
          <h2 className={`text-3xl font-bold ${theme.text}`}>Selamat Datang</h2>
          <p className="text-slate-400">Silakan masuk ke akun Anda</p>
        </div>

        {error && <div className="mb-4 rounded bg-red-500/20 p-3 text-sm text-red-300 border border-red-500/50">{error}</div>}
        
        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-300">Email</label>
            <input 
              type="email" 
              className={`mt-1 w-full rounded-lg border border-slate-700 bg-slate-900/50 p-3 text-white focus:outline-none focus:ring-2 ${theme.ring} ${theme.border}`}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300">Password</label>
            <input 
              type="password" 
              className={`mt-1 w-full rounded-lg border border-slate-700 bg-slate-900/50 p-3 text-white focus:outline-none focus:ring-2 ${theme.ring} ${theme.border}`}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className={`w-full rounded-lg py-3 font-bold text-white shadow-lg transition-all hover:scale-[1.02] ${theme.primary}`}>
            Masuk
          </button>
        </form>
        <div className="mt-6 text-center text-sm text-slate-400">
          Belum punya akun? <Link to="/register" className={`font-bold hover:underline ${theme.text}`}>Daftar Sekarang</Link>
        </div>
      </div>
    </div>
  );
}

