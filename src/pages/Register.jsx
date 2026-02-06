import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../utils/api';

export default function Register() {
  const [form, setForm] = useState({ username: '', email: '', password: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/auth/register', form);
      if (res.data.success) {
        alert('Registrasi berhasil! Silakan login.');
        navigate('/');
      }
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Registrasi gagal');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md rounded-lg bg-slate-800 p-8 shadow-lg">
        <h2 className="mb-6 text-center text-2xl font-bold text-green-400">Daftar Akun</h2>
        {error && <div className="mb-4 rounded bg-red-500/20 p-3 text-red-300">{error}</div>}
        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-sm text-slate-400">Username</label>
            <input 
              type="text" 
              className="mt-1 w-full rounded bg-slate-700 p-2 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
              value={form.username}
              onChange={(e) => setForm({...form, username: e.target.value})}
              required
            />
          </div>
          <div>
            <label className="block text-sm text-slate-400">Email</label>
            <input 
              type="email" 
              className="mt-1 w-full rounded bg-slate-700 p-2 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
              value={form.email}
              onChange={(e) => setForm({...form, email: e.target.value})}
              required
            />
          </div>
          <div>
            <label className="block text-sm text-slate-400">Password</label>
            <input 
              type="password" 
              className="mt-1 w-full rounded bg-slate-700 p-2 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
              value={form.password}
              onChange={(e) => setForm({...form, password: e.target.value})}
              required
            />
          </div>
          <button type="submit" className="w-full rounded bg-green-600 py-2 font-semibold hover:bg-green-500">
            Daftar Sekarang
          </button>
        </form>
        <div className="mt-4 text-center text-sm">
          Sudah punya akun? <Link to="/" className="text-green-400 hover:underline">Login</Link>
        </div>
      </div>
    </div>
  );
}
