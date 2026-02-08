import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../utils/api';
import { useTheme } from '../context/ThemeContext';
import { CheckCircle2, AlertCircle, Loader2, Eye, EyeOff } from 'lucide-react';

export default function Login() {
  const { color } = useTheme();
  const navigate = useNavigate();
  
  // State Input
  const [form, setForm] = useState({ email: '', password: '' });
  
  // State UI
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false); // Fitur Mata
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  // Helper Toast
  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
        setToast(prev => ({ ...prev, show: false }));
    }, 3000);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await api.post('/auth/login', form);
      if (res.data.success) {
        // Simpan Token
        localStorage.setItem('token', res.data.data.token);
        
        showToast('✅ Login Berhasil! Masuk ke dashboard...', 'success');
        
        // Jeda sedikit biar animasi toast terlihat
        setTimeout(() => {
            navigate('/'); // Pindah ke Dashboard
        }, 1000);
      }
    } catch (err) {
      const msg = err.response?.data?.error?.message || 'Email atau password salah';
      setError(msg);
      showToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[85vh] items-center justify-center p-4 bg-slate-50 dark:bg-slate-900 transition-colors duration-300">
      
      {/* Container Card */}
      <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 shadow-2xl dark:border-slate-800 dark:bg-slate-950 animate-in fade-in zoom-in duration-300">
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-black text-slate-900 dark:text-white">Selamat Datang</h2>
          <p className="mt-2 text-slate-500 dark:text-slate-400">Silakan masuk ke akun Anda</p>
        </div>

        {/* Error Alert */}
        {error && (
            <div className="mb-6 flex items-center gap-2 rounded-xl bg-red-50 p-4 text-sm font-bold text-red-600 border border-red-100 dark:bg-red-900/20 dark:border-red-900/30 dark:text-red-400">
                <AlertCircle size={18} />
                {error}
            </div>
        )}
        
        <form onSubmit={handleLogin} className="space-y-5">
          {/* Email */}
          <div>
            <label className="mb-1.5 block text-xs font-bold text-slate-600 dark:text-slate-400">Email</label>
            <input 
              type="email" 
              className={`w-full rounded-xl border bg-slate-50 p-3.5 font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 dark:bg-slate-900 dark:text-white dark:focus:bg-slate-950 ${color.border} ${color.ring}`}
              placeholder="email@anda.com"
              value={form.email}
              onChange={(e) => setForm({...form, email: e.target.value})}
              required
            />
          </div>

          {/* Password dengan Mata */}
          <div>
            <div className="mb-1.5 flex justify-between">
                <label className="text-xs font-bold text-slate-600 dark:text-slate-400">Password</label>
                {/* Opsi Lupa Password (Opsional) */}
                <span className="text-[10px] font-bold text-blue-600 cursor-pointer hover:underline dark:text-blue-400">Lupa sandi?</span>
            </div>
            
            <div className="relative">
                <input 
                  type={showPassword ? "text" : "password"} 
                  className={`w-full rounded-xl border bg-slate-50 p-3.5 pr-12 font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 dark:bg-slate-900 dark:text-white dark:focus:bg-slate-950 ${color.border} ${color.ring}`}
                  placeholder="••••••••"
                  value={form.password}
                  onChange={(e) => setForm({...form, password: e.target.value})}
                  required
                />
                
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
            </div>
          </div>
          
          <button 
            type="submit" 
            disabled={loading}
            className={`flex w-full items-center justify-center gap-2 rounded-xl py-4 font-bold shadow-lg transition-transform active:scale-95 ${color.btn}`}
          >
            {loading ? (
                <>
                    <Loader2 size={20} className="animate-spin" />
                    Masuk...
                </>
            ) : (
                'Masuk Sekarang'
            )}
          </button>
        </form>

        <div className="mt-8 text-center text-sm text-slate-500 dark:text-slate-400">
          Belum punya akun? <Link to="/register" className={`font-bold hover:underline ${color.text}`}>Daftar disini</Link>
        </div>
      </div>

      {/* --- TOAST NOTIFICATION --- */}
      <div className={`fixed bottom-10 left-1/2 z-[100] flex -translate-x-1/2 transform items-center gap-3 rounded-full px-6 py-3 shadow-2xl transition-all duration-300 ${toast.show ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0 pointer-events-none'} ${toast.type === 'success' ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900' : 'bg-red-500 text-white'}`}>
          {toast.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
          <span className="text-sm font-bold">{toast.message}</span>
      </div>

    </div>
  );
}

