import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { useTheme } from '../context/ThemeContext';
import { 
  CheckCircle2, AlertCircle, Loader2, Eye, EyeOff, 
  Mail, Lock, ShieldCheck, KeyRound, ArrowLeft 
} from 'lucide-react';
import { Helmet } from 'react-helmet-async';

export default function ForgotPassword() {
  const { color } = useTheme();
  const navigate = useNavigate();

  // --- STATE DATA ---
  const [step, setStep] = useState(1); // Step 1: Request Reset, Step 2: Input OTP
  const [form, setForm] = useState({ email: '', password: '', confirm_password: '', otp: '' });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast(prev => ({ ...prev, show: false })), 4000);
  };

  // --- FUNGSI 1: REQUEST RESET (KIRIM OTP KE EMAIL) ---
  const handleRequestReset = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirm_password) {
      return setError('Konfirmasi password tidak cocok');
    }
    if (form.password.length < 6) {
      return setError('Password minimal 6 karakter');
    }

    setLoading(true);
    setError('');

    try {
      const res = await api.post('/auth/request-reset-email', {
        email: form.email.trim().toLowerCase(),
        new_password: form.password,
        confirm_password: form.confirm_password
      });

      if (res.data.success) {
        setStep(2);
        showToast(res.data.message || 'Kode OTP telah berhasil dikirim ke email Anda', 'success');
      }
    } catch (err) {
      const msg = err.response?.data?.error?.message || err.response?.data?.message || 'Gagal mengirim permintaan reset';
      setError(msg);
      showToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  // --- FUNGSI 2: VERIFIKASI OTP ---
  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    if (!form.otp || form.otp.trim() === '') {
      return setError('Silakan masukkan kode OTP');
    }

    setLoading(true);
    setError('');

    try {
      const res = await api.post('/auth/verify-reset-email', {
        email: form.email.trim().toLowerCase(),
        otp: form.otp.trim()
      });

      if (res.data.success) {
        setIsSuccess(true);
        showToast(res.data.message || 'Password berhasil diubah', 'success');
        
        // Redirect ke halaman login setelah 5 detik sesuai standar dari backend
        setTimeout(() => {
          navigate('/login');
        }, 5000);
      }
    } catch (err) {
      const msg = err.response?.data?.error?.message || err.response?.data?.message || 'Kode OTP tidak valid atau kedaluwarsa';
      setError(msg);
      showToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[85vh] items-center justify-center p-4 bg-slate-50 dark:bg-slate-900 transition-colors duration-300">
      <Helmet>
        <title>Reset Password - RuangOTP</title>
      </Helmet>

      <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 shadow-2xl dark:border-slate-800 dark:bg-slate-950 animate-in fade-in zoom-in duration-300">
        
        {/* --- HEADER --- */}
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-black text-slate-900 dark:text-white">
            {isSuccess ? 'Berhasil!' : 'Reset Password'}
          </h2>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            {isSuccess 
              ? 'Password akun Anda telah diperbarui.' 
              : step === 1 
                ? 'Masukkan email dan password baru Anda' 
                : 'Masukkan kode OTP yang dikirim ke email Anda'}
          </p>
        </div>

        {error && !isSuccess && (
          <div className="mb-6 flex items-center gap-2 rounded-xl bg-red-50 p-4 text-sm font-bold text-red-600 border border-red-100 dark:bg-red-900/20 dark:border-red-900/30 dark:text-red-400 animate-in slide-in-from-top-2">
            <AlertCircle size={18} className="shrink-0" />
            <span className="leading-tight">{error}</span>
          </div>
        )}

        {/* --- LAYAR SUKSES --- */}
        {isSuccess ? (
          <div className="flex flex-col items-center justify-center space-y-4 animate-in zoom-in duration-500 py-4">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400 mb-2">
              <CheckCircle2 size={40} />
            </div>
            <p className="text-center text-sm font-medium text-slate-600 dark:text-slate-300 leading-relaxed px-4">
              Password Anda sedang diubah oleh sistem. Anda akan dialihkan ke halaman Login dalam beberapa saat...
            </p>
            <div className="flex items-center gap-2 mt-4">
              <Loader2 size={16} className={`animate-spin ${color.text}`} />
              <span className={`text-xs font-bold ${color.text}`}>Mengalihkan otomatis...</span>
            </div>
          </div>
        ) : (
          <>
            {/* --- STEP 1: REQUEST OTP (FORM EMAIL & PASSWORD) --- */}
            {step === 1 && (
              <form onSubmit={handleRequestReset} className="space-y-5 animate-in fade-in slide-in-from-left-4 duration-300">
                <div>
                  <label className="mb-1.5 block text-xs font-bold text-slate-600 dark:text-slate-400">Email Akun</label>
                  <div className="relative">
                    <input 
                      type="email" 
                      className={`w-full rounded-xl border bg-slate-50 p-3.5 pl-11 font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 dark:bg-slate-900 dark:text-white dark:focus:bg-slate-950 ${color.border} ${color.ring}`}
                      placeholder="email@anda.com"
                      value={form.email}
                      onChange={(e) => setForm({...form, email: e.target.value})}
                      required
                    />
                    <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-bold text-slate-600 dark:text-slate-400">Password Baru</label>
                  <div className="relative">
                    <input 
                      type={showPassword ? "text" : "password"} 
                      className={`w-full rounded-xl border bg-slate-50 p-3.5 pl-11 pr-12 font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 dark:bg-slate-900 dark:text-white dark:focus:bg-slate-950 ${color.border} ${color.ring}`}
                      placeholder="••••••••"
                      value={form.password}
                      onChange={(e) => setForm({...form, password: e.target.value})}
                      required
                    />
                    <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-bold text-slate-600 dark:text-slate-400">Konfirmasi Password Baru</label>
                  <div className="relative">
                    <input 
                      type={showPassword ? "text" : "password"} 
                      className={`w-full rounded-xl border bg-slate-50 p-3.5 pl-11 pr-12 font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 dark:bg-slate-900 dark:text-white dark:focus:bg-slate-950 ${color.border} ${color.ring}`}
                      placeholder="••••••••"
                      value={form.confirm_password}
                      onChange={(e) => setForm({...form, confirm_password: e.target.value})}
                      required
                    />
                    <ShieldCheck size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  </div>
                </div>

                <button 
                  type="submit" 
                  disabled={loading}
                  className={`mt-2 flex w-full items-center justify-center gap-2 rounded-xl py-4 font-bold shadow-lg transition-transform active:scale-95 ${color.btn}`}
                >
                  {loading ? <Loader2 size={20} className="animate-spin" /> : 'Kirim Kode OTP'}
                </button>
              </form>
            )}

            {/* --- STEP 2: VERIFIKASI OTP --- */}
            {step === 2 && (
              <form onSubmit={handleVerifyOTP} className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="rounded-2xl bg-slate-50 p-4 border border-slate-100 dark:bg-slate-900/50 dark:border-slate-800 text-center">
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Kode OTP telah dikirim ke:</p>
                  <p className="text-sm font-bold text-slate-800 dark:text-white">{form.email}</p>
                </div>

                <div>
                  <label className="mb-2 block text-center text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest">
                    Kode OTP
                  </label>
                  <div className="relative max-w-[240px] mx-auto">
                    <input 
                      type="text" 
                      maxLength="6"
                      className={`w-full rounded-xl border bg-slate-50 py-4 text-center text-2xl tracking-[0.5em] font-black text-slate-900 focus:bg-white focus:outline-none focus:ring-2 dark:bg-slate-900 dark:text-white dark:focus:bg-slate-950 ${color.border} ${color.ring}`}
                      placeholder="••••••"
                      value={form.otp}
                      onChange={(e) => setForm({...form, otp: e.target.value})}
                      required
                    />
                    <KeyRound size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 dark:text-slate-600 opacity-50" />
                  </div>
                </div>

                <div className="flex flex-col gap-3 pt-2">
                  <button 
                    type="submit" 
                    disabled={loading}
                    className={`flex w-full items-center justify-center gap-2 rounded-xl py-4 font-bold shadow-lg transition-transform active:scale-95 ${color.btn}`}
                  >
                    {loading ? <Loader2 size={20} className="animate-spin" /> : 'Verifikasi & Ganti Password'}
                  </button>

                  <button 
                    type="button" 
                    onClick={() => {
                      setStep(1);
                      setForm({...form, otp: ''});
                      setError('');
                    }}
                    disabled={loading}
                    className="flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-bold text-slate-500 hover:bg-slate-100 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-300 transition-colors"
                  >
                    <ArrowLeft size={16} />
                    Kembali Perbaiki Email
                  </button>
                </div>
              </form>
            )}
          </>
        )}

        {!isSuccess && (
          <div className="mt-8 text-center text-sm text-slate-500 dark:text-slate-400">
            Tiba-tiba ingat password?
            <Link to="/login" className={`font-bold hover:underline ml-1 ${color.text}`}>Login disini</Link>
          </div>
        )}
      </div>

      {/* --- TOAST NOTIFICATION --- */}
      <div className={`fixed bottom-10 left-1/2 z-[110] flex w-[90%] max-w-sm -translate-x-1/2 transform items-center gap-3 rounded-full px-5 py-3 shadow-2xl transition-all duration-300 ${toast.show ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0 pointer-events-none'} ${toast.type === 'success' ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900' : 'bg-red-500 text-white'}`}>
        {toast.type === 'success' ? <CheckCircle2 size={20} className="shrink-0" /> : <AlertCircle size={20} className="shrink-0" />}
        <span className="text-sm font-bold leading-tight">{toast.message}</span>
      </div>

    </div>
  );
}
