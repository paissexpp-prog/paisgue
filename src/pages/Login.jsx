import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../utils/api';

export default function Login() {
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
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md rounded-lg bg-slate-800 p-8 shadow-lg">
        <h2 className="mb-6 text-center text-2xl font-bold text-blue-400">RuangOTP Login</h2>
        {error && <div className="mb-4 rounded bg-red-500/20 p-3 text-red-300">{error}</div>}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm text-slate-400">Email</label>
            <input 
              type="email" 
              className="mt-1 w-full rounded bg-slate-700 p-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm text-slate-400">Password</label>
            <input 
              type="password" 
              className="mt-1 w-full rounded bg-slate-700 p-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="w-full rounded bg-blue-600 py-2 font-semibold hover:bg-blue-500">
            Masuk
          </button>
        </form>
        <div className="mt-4 text-center text-sm">
          Belum punya akun? <Link to="/register" className="text-blue-400 hover:underline">Daftar</Link>
        </div>
      </div>
    </div>
  );
}
