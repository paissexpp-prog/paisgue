import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../utils/api';
import { useTheme } from '../context/ThemeContext';
import { CheckCircle2, AlertCircle, Loader2, Eye, EyeOff } from 'lucide-react';

export default function Register() {
  const { color } = useTheme();
  const navigate = useNavigate();
  
  // State Data
  const [form, setForm] = useState({ username: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  // State untuk Mata Password
  const [showPassword, setShowPassword] = useState(false);
  
  // State Toast (Notifikasi)
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  // Fungsi Menampilkan Toast
  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
        setToast(prev => ({ ...prev, show: false }));
    }, 3000);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // PERBAIKAN: Sanitasi data sebelum dikirim
    // Menghapus spasi depan/belakang dan memaksa email jadi huruf kecil
    const payload = {
        username: form.username.trim(),
        email: form.email.trim().toLowerCase(),
        password: form.password
    };

    // Debugging: Cek di Console browser apa yang sebenarnya dikirim
    console.log("Mengirim data registrasi:", payload);

    try {
      const res = await api.post('/auth/register', payload);
      
      if (res.data.success) {
        showToast('✅ Registrasi Berhasil! Mengalihkan...', 'success');
        // Reset form agar bersih
        setForm({ username: '', email: '', password: '' });
        
        setTimeout(() => {
            navigate('/login');
        }, 1500);
      }
    } catch (err) {
      console.error("Error Registrasi:", err.response || err);
      const msg = err.response?.data?.error?.message || 'Registrasi gagal';
      setError(msg);
      showToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Helper untuk update state agar lebih aman terhadap autofill
  const handleChange = (e) => {
    setForm(prev => ({
        ...prev,
        [e.target.name]: e.target.value
    }));
  };

  return (
    <div className="flex min-h-[85vh] items-center justify-center p-4 bg-slate-50 dark:bg-slate-900 transition-colors duration-300">
      
      {/* Container Form */}
      <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 shadow-2xl dark:border-slate-800 dark:bg-slate-950 animate-in fade-in zoom-in duration-300">
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-black text-slate-900 dark:text-white">Buat Akun</h2>
          <p className="mt-2 text-slate-500 dark:text-slate-400">Bergabunglah dengan ribuan pengguna lain</p>
        </div>

        {error && (
            <div className="mb-6 flex items-center gap-2 rounded-xl bg-red-50 p-4 text-sm font-bold text-red-600 border border-red-100 dark:bg-red-900/20 dark:border-red-900/30 dark:text-red-400">
                <AlertCircle size={18} />
                {error}
            </div>
        )}
        
        <form onSubmit={handleRegister} className="space-y-5">
          {/* Username */}
          <div>
            <label htmlFor="username" className="mb-1.5 block text-xs font-bold text-slate-600 dark:text-slate-400">Username</label>
            <input 
              id="username"
              name="username" 
              type="text" 
              autoComplete="username"
              className={`w-full rounded-xl border bg-slate-50 p-3.5 font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 dark:bg-slate-900 dark:text-white dark:focus:bg-slate-950 ${color.border} ${color.ring}`}
              placeholder="Contoh: user123"
              value={form.username}
              onChange={handleChange}
              required
            />
          </div>

          {/* Email */}
          <div>
            <label htmlFor="email" className="mb-1.5 block text-xs font-bold text-slate-600 dark:text-slate-400">Email</label>
            <input 
              id="email"
              name="email"
              type="email" 
              autoComplete="email"
              className={`w-full rounded-xl border bg-slate-50 p-3.5 font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 dark:bg-slate-900 dark:text-white dark:focus:bg-slate-950 ${color.border} ${color.ring}`}
              placeholder="email@anda.com"
              value={form.email}
              onChange={handleChange}
              required
            />
          </div>

          {/* Password dengan Mata */}
          <div>
            <label htmlFor="password" className="mb-1.5 block text-xs font-bold text-slate-600 dark:text-slate-400">Password</label>
            <div className="relative">
                <input 
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"} 
                  autoComplete="new-password"
                  className={`w-full rounded-xl border bg-slate-50 p-3.5 pr-12 font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 dark:bg-slate-900 dark:text-white dark:focus:bg-slate-950 ${color.border} ${color.ring}`}
                  placeholder="••••••••"
                  value={form.password}
                  onChange={handleChange}
                  required
                />
                
                {/* Tombol Mata */}
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
                    Memproses...
                </>
            ) : (
                'Daftar Sekarang'
            )}
          </button>
        </form>

        <div className="mt-8 text-center text-sm text-slate-500 dark:text-slate-400">
          Sudah punya akun? <Link to="/login" className={`font-bold hover:underline ml-1 ${color.text}`}>Login disini</Link>
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

