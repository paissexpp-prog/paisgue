import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { useTheme } from '../context/ThemeContext';
import { 
  CheckCircle2, AlertCircle, Loader2, Eye, EyeOff, 
  Mail, Lock, ShieldCheck, ArrowRight, MessageCircle, RefreshCw 
} from 'lucide-react';
import { Helmet } from 'react-helmet-async';

export default function ForgotPassword() {
  const { color } = useTheme();
  const navigate = useNavigate();

  // --- STATE DATA ---
  const [form, setForm] = useState({ email: '', password: '', confirm_password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // State untuk alur setelah request (Bagian 2)
  const [resetData, setResetData] = useState(null); // Menyimpan wa_link & token
  const [statusReset, setStatusReset] = useState(''); // 'proses' atau 'completed'
  const [checkLoading, setCheckLoading] = useState(false);

  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  // REF UNTUK POLLING REALTIME
  const pollingIntervalRef = useRef(null);

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast(prev => ({ ...prev, show: false })), 3000);
  };

  // --- EFEK POLLING REALTIME ---
  useEffect(() => {
    // Hanya jalankan polling otomatis jika sudah ada data reset dan status masih proses
    if (resetData && statusReset === 'proses') {
      pollingIntervalRef.current = setInterval(async () => {
        try {
          const res = await api.post('/auth/check-reset-status', { email: form.email });
          if (res.data.success) {
            const newStatus = res.data.data.status;
            
            // Update state jika status berubah dari backend
            if (newStatus !== statusReset) {
              setStatusReset(newStatus);
            }
            
            // Jika status sudah selesai, hentikan interval dan arahkan ke login
            if (newStatus === 'completed') {
              clearInterval(pollingIntervalRef.current);
              showToast('Password Berhasil Reset! Silakan Login', 'success');
              setTimeout(() => navigate('/login'), 2000);
            }
          }
        } catch (err) {
          // Silent error saat polling otomatis agar tidak mengganggu UI dengan toast
        }
      }, 5000); // Cek setiap 5 detik
    }

    // Cleanup interval saat komponen dilepas atau saat status berubah
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, [resetData, statusReset, form.email, navigate]);

  // --- FUNGSI 1: REQUEST RESET ---
  const handleRequestReset = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirm_password) {
      return setError('Konfirmasi password tidak cocok');
    }

    setLoading(true);
    setError('');

    try {
      const res = await api.post('/auth/request-reset', {
        email: form.email.trim().toLowerCase(),
        new_password: form.password,
        confirm_password: form.confirm_password
      });

      if (res.data.success) {
        setResetData(res.data.data);
        setStatusReset('proses');
        showToast('Permintaan berhasil! Silakan konfirmasi via WA', 'success');
      }
    } catch (err) {
      const msg = err.response?.data?.error?.message || 'Gagal membuat permintaan reset';
      setError(msg);
      showToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  // --- FUNGSI 2: CEK STATUS MANUAL (Tombol) ---
  const handleCheckStatus = async () => {
    setCheckLoading(true);
    try {
      const res = await api.post('/auth/check-reset-status', { email: form.email });
      if (res.data.success) {
        const newStatus = res.data.data.status;
        setStatusReset(newStatus);
        
        if (newStatus === 'completed') {
          clearInterval(pollingIntervalRef.current); // Hentikan polling otomatis jika selesai manual
          showToast('Password Berhasil Reset! Silakan Login', 'success');
          setTimeout(() => navigate('/login'), 2000);
        } else {
          showToast('Status masih dalam proses konfirmasi', 'success');
        }
      }
    } catch (err) {
      showToast('Gagal mengambil status terbaru', 'error');
    } finally {
      setCheckLoading(false);
    }
  };

  return (
    <div className="flex min-h-[85vh] items-center justify-center p-4 bg-slate-50 dark:bg-slate-900 transition-colors duration-300">
      <Helmet>
        <title>Reset Password - RuangOTP</title>
      </Helmet>

      <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 shadow-2xl dark:border-slate-800 dark:bg-slate-950 animate-in fade-in zoom-in duration-300">
        
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-black text-slate-900 dark:text-white">Reset Password</h2>
          
          <p className="mt-2 text-slate-500 dark:text-slate-400">
            {resetData ? 'Langkah Terakhir Konfirmasi' : 'Masukkan detail akun baru Anda'}
          </p>
        </div>

        {error && (
          <div className="mb-6 flex items-center gap-2 rounded-xl bg-red-50 p-4 text-sm font-bold text-red-600 border border-red-100 dark:bg-red-900/20 dark:border-red-900/30 dark:text-red-400">
            <AlertCircle size={18} />
            {error}
          </div>
        )}

        {/* --- BAGIAN 1: FORM INPUT (Muncul jika belum ada resetData) --- */}
        {!resetData ? (
          <form onSubmit={handleRequestReset} className="space-y-5">
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
              className={`flex w-full items-center justify-center gap-2 rounded-xl py-4 font-bold shadow-lg transition-transform active:scale-95 ${color.btn}`}
            >
              {loading ? <Loader2 size={20} className="animate-spin" /> : 'Konfirmasi Password'}
            </button>
          </form>
        ) : (
          /* --- BAGIAN 2: INFO & TOMBOL WA (Muncul setelah request berhasil) --- */
          <div className="space-y-6 animate-in fade-in slide-in-from-right-10 duration-500">
            <div className="rounded-2xl bg-slate-50 p-5 border border-slate-100 dark:bg-slate-900/50 dark:border-slate-800">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">Info Request Reset</p>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Email:</span>
                  <span className="font-bold text-slate-800 dark:text-white">{form.email}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Token:</span>
                  <span className="font-mono font-bold text-blue-600 dark:text-blue-400">{resetData.token.substring(0, 10)}...</span>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Status:</span>
                  <span className={`flex items-center gap-1 font-bold ${statusReset === 'completed' ? 'text-emerald-500' : 'text-amber-500'}`}>
                    {statusReset === 'proses' ? <RefreshCw size={12} className="animate-spin" /> : <CheckCircle2 size={12} />}
                    {statusReset === 'proses' ? 'Menunggu Konfirmasi' : 'Selesai'}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <button 
                onClick={() => window.open(resetData.wa_link, '_blank')}
                className="flex w-full items-center justify-center gap-3 rounded-xl bg-emerald-600 py-4 font-bold text-white shadow-lg shadow-emerald-500/20 transition-transform hover:bg-emerald-700 active:scale-95"
              >
                <MessageCircle size={20} />
                Kirim Konfirmasi ke WhatsApp
              </button>

              <button 
                onClick={handleCheckStatus}
                disabled={checkLoading || statusReset === 'completed'}
                className={`flex w-full items-center justify-center gap-2 rounded-xl py-4 font-bold shadow-lg transition-transform active:scale-95 ${color.btn}`}
              >
                {checkLoading ? <Loader2 size={20} className="animate-spin" /> : 'Reset Password Sekarang'}
              </button>
            </div>

            <p className="text-[10px] text-center text-slate-400 leading-relaxed italic">
              Klik tombol hijau untuk mengirim token via WhatsApp, lalu klik "Reset Password Sekarang" untuk menyelesaikan. Sistem juga otomatis mengecek status konfirmasi Anda.
            </p>
          </div>
        )}

        <div className="mt-8 text-center text-sm text-slate-500 dark:text-slate-400">
          Tiba-tiba ingat password?
          <Link to="/login" className={`font-bold hover:underline ml-1 ${color.text}`}>Login disini</Link>
        </div>
      </div>

      {/* --- TOAST --- */}
      <div className={`fixed bottom-10 left-1/2 z-[110] flex -translate-x-1/2 transform items-center gap-3 rounded-full px-6 py-3 shadow-2xl transition-all duration-300 ${toast.show ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0 pointer-events-none'} ${toast.type === 'success' ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900' : 'bg-red-500 text-white'}`}>
        {toast.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
        <span className="text-sm font-bold">{toast.message}</span>
      </div>

    </div>
  );
}
