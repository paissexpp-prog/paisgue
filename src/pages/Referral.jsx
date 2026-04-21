import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../utils/api';
import BottomNav from '../components/BottomNav';
import { useTheme } from '../context/ThemeContext';
import {
  Gift, Copy, CheckCircle2, AlertCircle, Loader2,
  Users, Wallet, TrendingUp, ChevronLeft, Share2,
  ArrowUpRight, UserPlus, RefreshCw,
  Sparkles, BadgePercent, History, Info, WifiOff,
  LogIn, ArrowRight, ShieldCheck, Zap, Star
} from 'lucide-react';
import { Helmet } from 'react-helmet-async';

// ================================================================
// KOMPONEN: Tampilan Publik (Belum Login)
// ================================================================
function ReferralPublicView({ color }) {
  const navigate = useNavigate();

  const steps = [
    {
      icon: <Share2 size={20} />,
      title: 'Bagikan Link',
      desc: 'Salin dan bagikan link referral unik kamu ke teman lewat WA, Telegram, atau media sosial.',
      cls: 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400',
    },
    {
      icon: <UserPlus size={20} />,
      title: 'Teman Mendaftar',
      desc: 'Teman kamu mendaftar di RuangOTP menggunakan link referral kamu.',
      cls: 'bg-violet-50 text-violet-600 dark:bg-violet-900/20 dark:text-violet-400',
    },
    {
      icon: <Wallet size={20} />,
      title: 'Teman Deposit & Kamu Dapat Bonus',
      desc: 'Teman deposit minimal Rp 5.000, kamu otomatis dapat bonus komisi langsung masuk ke saldo!',
      cls: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400',
    },
  ];

  const highlights = [
    {
      icon: <Zap size={18} />,
      label: 'Otomatis',
      desc: 'Bonus langsung masuk ke saldo',
      cls: 'bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400',
    },
    {
      icon: <ShieldCheck size={18} />,
      label: 'Terpercaya',
      desc: 'Program resmi RuangOTP',
      cls: 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400',
    },
    {
      icon: <Star size={18} />,
      label: 'Tanpa Batas',
      desc: 'Ajak sebanyak mungkin teman',
      cls: 'bg-violet-50 text-violet-600 dark:bg-violet-900/20 dark:text-violet-400',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 pb-10 transition-colors duration-300 dark:bg-slate-900">
      <Helmet>
        <title>Program Referral - RuangOTP</title>
        <meta name="description" content="Ajak teman dan dapatkan bonus saldo gratis di RuangOTP. Daftar sekarang dan mulai hasilkan komisi!" />
      </Helmet>

      <div className="mx-auto max-w-lg px-5 pt-6 space-y-5">

        {/* HERO BANNER */}
        <div className={`relative overflow-hidden rounded-3xl p-7 text-white shadow-xl bg-gradient-to-br ${color.gradient}`}>
          <div className="relative z-10">
            <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-white/20 px-3 py-1 backdrop-blur-sm">
              <Sparkles size={13} className="text-white/90" />
              <span className="text-[11px] font-bold uppercase tracking-widest text-white/90">Program Referral</span>
            </div>
            <h1 className="mt-3 text-3xl font-black leading-tight">
              Ajak Teman,<br />Dapat Saldo!
            </h1>
            <p className="mt-3 text-sm text-white/85 leading-relaxed max-w-xs">
              Dapatkan <span className="font-black text-white">komisi otomatis</span> dari setiap deposit teman yang mendaftar lewat link referral kamu. Gratis, tanpa syarat ribet.
            </p>

            {/* Komisi Badge */}
            <div className="mt-5 inline-flex items-center gap-3 rounded-2xl bg-white/20 px-4 py-3 backdrop-blur-sm border border-white/20">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20">
                <BadgePercent size={22} className="text-white" />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-white/70">Komisi Kamu</p>
                <p className="text-2xl font-black text-white leading-none">2%</p>
              </div>
              <div className="ml-1 h-8 w-px bg-white/20"></div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-white/70">Min. Deposit</p>
                <p className="text-base font-black text-white leading-none">Rp 5.000</p>
              </div>
            </div>
          </div>

          {/* Dekorasi */}
          <div className="absolute -right-10 -bottom-10 opacity-10 pointer-events-none">
            <Gift size={180} />
          </div>
          <div className="absolute right-8 top-5 opacity-20 pointer-events-none">
            <Sparkles size={50} />
          </div>
        </div>

        {/* HIGHLIGHT 3 KEUNGGULAN */}
        <div className="grid grid-cols-3 gap-3">
          {highlights.map((h, i) => (
            <div key={i} className="rounded-2xl bg-white border border-slate-100 p-3.5 shadow-sm flex flex-col items-center text-center dark:bg-slate-950 dark:border-slate-800">
              <div className={`mb-2 flex h-9 w-9 items-center justify-center rounded-xl ${h.cls}`}>
                {h.icon}
              </div>
              <p className="text-xs font-black text-slate-800 dark:text-white">{h.label}</p>
              <p className="mt-0.5 text-[9px] text-slate-400 dark:text-slate-500 leading-relaxed">{h.desc}</p>
            </div>
          ))}
        </div>

        {/* CARA KERJA */}
        <div className="rounded-3xl bg-white border border-slate-100 shadow-sm dark:bg-slate-950 dark:border-slate-800 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <TrendingUp size={16} className={color.text} />
              <h3 className="font-bold text-sm text-slate-700 dark:text-slate-200">Cara Kerja Program</h3>
            </div>
          </div>
          <div className="p-5 space-y-4">
            {steps.map((item, index) => (
              <div key={index} className="flex items-start gap-4">
                <div className={`relative flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl ${item.cls}`}>
                  {item.icon}
                  <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-slate-700 dark:bg-slate-600 text-[9px] font-black text-white">
                    {index + 1}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm text-slate-800 dark:text-white">{item.title}</p>
                  <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CATATAN PENTING */}
        <div className={`rounded-2xl border p-4 ${color.bg} ${color.border}`}>
          <p className={`text-xs font-bold mb-2 ${color.text}`}>📌 Catatan Penting</p>
          <div className="space-y-1.5">
            <div className="flex items-start gap-2">
              <div className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-400 dark:bg-slate-500"></div>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Bonus hanya diberikan jika teman mendaftar menggunakan link referral kamu.
              </p>
            </div>
            <div className="flex items-start gap-2">
              <div className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500"></div>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Komisi <span className="font-bold text-slate-700 dark:text-slate-300">2%</span> hanya dihitung jika deposit teman minimal{' '}
                <span className="font-bold text-amber-600 dark:text-amber-400">Rp 5.000</span>. Deposit di bawah nominal tersebut tidak menghasilkan bonus.
              </p>
            </div>
            <div className="flex items-start gap-2">
              <div className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-400 dark:bg-slate-500"></div>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Bonus langsung masuk ke saldo secara otomatis setelah deposit teman berhasil.
              </p>
            </div>
          </div>
        </div>

        {/* DIVIDER */}
        <div className="relative flex items-center">
          <div className="flex-1 border-t border-slate-200 dark:border-slate-800"></div>
          <span className="mx-4 text-[11px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-600">Mulai Sekarang</span>
          <div className="flex-1 border-t border-slate-200 dark:border-slate-800"></div>
        </div>

        {/* CTA CARD — LOGIN UNTUK MULAI */}
        <div className="rounded-3xl bg-white border border-slate-100 shadow-sm dark:bg-slate-950 dark:border-slate-800 overflow-hidden">
          <div className="p-6">
            {/* Icon */}
            <div className={`mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl ${color.bg}`}>
              <LogIn size={26} className={color.text} />
            </div>

            <h3 className="text-center text-base font-black text-slate-800 dark:text-white">
              Masuk untuk Lihat Link Referral Kamu
            </h3>
            <p className="mt-1.5 text-center text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Login ke akun RuangOTP kamu untuk mendapatkan link referral unik dan mulai menghasilkan bonus.
            </p>

            {/* Tombol Login */}
            <button
              onClick={() => navigate('/login')}
              className={`mt-5 w-full flex items-center justify-center gap-2 rounded-2xl py-4 font-bold text-sm shadow-lg transition-all active:scale-95 ${color.btn}`}
            >
              <LogIn size={18} />
              Masuk ke Akun
            </button>

            {/* Tombol Daftar */}
            <Link
              to="/register"
              className="mt-3 flex items-center justify-center gap-2 rounded-2xl border border-slate-200 py-3.5 text-sm font-bold text-slate-600 transition-all hover:bg-slate-50 active:scale-95 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              Belum punya akun? Daftar Gratis
              <ArrowRight size={16} />
            </Link>
          </div>

          {/* Footer info */}
          <div className="border-t border-slate-100 dark:border-slate-800 px-6 py-3 bg-slate-50 dark:bg-slate-900/50">
            <p className="text-center text-[10px] text-slate-400 dark:text-slate-600 flex items-center justify-center gap-1.5">
              <ShieldCheck size={11} />
              Gratis selamanya · Tidak ada biaya tersembunyi
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}


// ================================================================
// KOMPONEN UTAMA: Referral
// ================================================================
export default function Referral() {
  const { color } = useTheme();
  const navigate = useNavigate();

  const token = localStorage.getItem('token');

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isOffline, setIsOffline] = useState(false); // State untuk indikator cache/offline
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast(prev => ({ ...prev, show: false })), 3000);
  };

  // --- FETCH DATA DENGAN SISTEM CACHE ---
  const fetchReferral = async () => {
    // 1. Cek & Muat Data dari Cache (Local Storage) terlebih dahulu
    const cachedData = localStorage.getItem('ruangotp_referral_data');
    
    if (cachedData) {
      setData(JSON.parse(cachedData));
    }

    // Jika tidak ada cache sama sekali, baru tampilkan animasi loading
    if (!cachedData) {
      setLoading(true);
    }

    // 2. Tembak API di background untuk mengambil data terbaru
    try {
      const res = await api.get('/referral/info');
      if (res.data.success) {
        setData(res.data.data);
        // Simpan ke cache
        localStorage.setItem('ruangotp_referral_data', JSON.stringify(res.data.data));
        setIsOffline(false);
      }
    } catch (err) {
      console.error("Gagal load referral terbaru, menggunakan data cache.");
      setIsOffline(true);
      // Hanya tampilkan toast error jika benar-benar tidak ada data cache
      if (!cachedData) {
        showToast('Gagal memuat data referral', 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Jika belum login, tidak perlu fetch
    if (!token) return;

    // Fetch pertama kali saat halaman dibuka
    fetchReferral();

    // SENSOR LAYAR: Sama persis seperti Dashboard.jsx
    // Setiap user balik ke tab / buka lagi dari Chrome,
    // langsung fetch ulang otomatis tanpa perlu refresh web
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        fetchReferral();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Cleanup saat komponen dilepas
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  const handleCopy = (text, label = 'Berhasil disalin!') => {
    navigator.clipboard.writeText(text).then(() => {
      showToast(label, 'success');
    });
  };

  const handleShare = () => {
    if (!data?.url_referral) return;
    if (navigator.share) {
      navigator.share({
        title: 'RuangOTP - Dapatkan Saldo Gratis!',
        text: `Daftar RuangOTP sekarang dan dapatkan layanan OTP terbaik! Pakai link referral saya:`,
        url: data.url_referral,
      }).catch(() => {});
    } else {
      handleCopy(data.url_referral, 'Link referral disalin!');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    try {
      return new Date(dateString).toLocaleDateString('id-ID', {
        day: 'numeric', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
      });
    } catch (e) { return '-'; }
  };

  const formatRupiah = (number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency', currency: 'IDR', minimumFractionDigits: 0
    }).format(number || 0);
  };

  // ================================================================
  // JIKA BELUM LOGIN: Tampilkan halaman publik
  // ================================================================
  if (!token) {
    return <ReferralPublicView color={color} />;
  }

  // ================================================================
  // JIKA SUDAH LOGIN: Tampilkan dashboard referral seperti biasa
  // ================================================================
  return (
    <div className="min-h-screen bg-slate-50 pb-28 transition-colors duration-300 dark:bg-slate-900">
      <Helmet>
        <title>Dapatkan Saldo Gratis - RuangOTP</title>
        <meta name="description" content="Ajak teman dan dapatkan bonus saldo gratis di RuangOTP." />
      </Helmet>

      {/* HEADER */}
      <div className="sticky top-0 z-30 bg-white/80 px-5 pt-8 pb-4 backdrop-blur-md border-b border-slate-100 dark:bg-slate-950/80 dark:border-slate-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/profile')}
              className="p-2 -ml-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <ChevronLeft size={24} className="text-slate-700 dark:text-slate-300" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-slate-800 dark:text-white">Dapatkan Saldo Gratis</h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">Program Referral RuangOTP</p>
            </div>
          </div>
          <button
            onClick={fetchReferral}
            className="rounded-xl bg-slate-100 p-2 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 transition-colors"
          >
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      <div className="px-5 mt-6 space-y-5">

        {/* --- INDIKATOR OFFLINE / CACHE --- */}
        {isOffline && (
            <div className="flex items-center gap-2 rounded-lg bg-amber-50 p-2.5 text-xs font-medium text-amber-600 border border-amber-200 dark:bg-amber-900/20 dark:border-amber-800/50 dark:text-amber-400">
                <WifiOff size={14} className="shrink-0" />
                <p>Koneksi bermasalah. Menampilkan data cache terakhir.</p>
            </div>
        )}

        {/* HERO BANNER */}
        <div className={`relative overflow-hidden rounded-3xl p-6 text-white shadow-xl bg-gradient-to-br ${color.gradient}`}>
          <div className="relative z-10">
            <div className="mb-1 flex items-center gap-2">
              <Sparkles size={18} className="text-white/80" />
              <span className="text-xs font-bold uppercase tracking-widest text-white/80">Program Referral</span>
            </div>
            <h2 className="text-2xl font-black leading-tight">
              Ajak Teman,<br />Dapat Saldo!
            </h2>
            <p className="mt-2 text-sm text-white/80 leading-relaxed">
              Dapatkan bonus{' '}
              <span className="font-black text-white">
                {loading && !data ? '...' : (data?.referral_percent || '2%')}
              </span>{' '}
              dari setiap deposit teman yang mendaftar lewat link kamu.
            </p>
          </div>
          {/* Dekorasi */}
          <div className="absolute -right-8 -bottom-8 opacity-10 pointer-events-none">
            <Gift size={160} />
          </div>
          <div className="absolute right-10 top-4 opacity-20 pointer-events-none">
            <Sparkles size={40} />
          </div>
        </div>

        {/* STATISTIK */}
        <div className="grid grid-cols-3 gap-3">

          {/* Total Diajak */}
          <div className="rounded-2xl bg-white border border-slate-100 p-4 shadow-sm flex flex-col items-center justify-center text-center dark:bg-slate-950 dark:border-slate-800">
            <div className={`mb-2 p-2 rounded-full ${color.bg}`}>
              <Users size={18} className={color.text} />
            </div>
            <p className="text-[10px] text-slate-400 dark:text-slate-500">Teman</p>
            <p className="text-xl font-black text-slate-800 dark:text-white">
              {loading && !data ? <Loader2 size={16} className="animate-spin mx-auto mt-1" /> : (data?.total_invited ?? 0)}
            </p>
          </div>

          {/* Total Bonus */}
          <div className="rounded-2xl bg-white border border-slate-100 p-4 shadow-sm flex flex-col items-center justify-center text-center dark:bg-slate-950 dark:border-slate-800">
            <div className="mb-2 p-2 rounded-full bg-emerald-50 dark:bg-emerald-900/20">
              <Wallet size={18} className="text-emerald-600 dark:text-emerald-400" />
            </div>
            <p className="text-[10px] text-slate-400 dark:text-slate-500">Bonus</p>
            <p className="text-sm font-black text-slate-800 dark:text-white">
              {loading && !data ? <Loader2 size={16} className="animate-spin mx-auto mt-1" /> : formatRupiah(data?.total_bonus)}
            </p>
          </div>

          {/* Komisi % — DENGAN INFO SYARAT DEPOSIT */}
          <div className="rounded-2xl bg-white border border-slate-100 p-4 shadow-sm flex flex-col items-center justify-center text-center dark:bg-slate-950 dark:border-slate-800 relative">
            <div className="mb-2 p-2 rounded-full bg-amber-50 dark:bg-amber-900/20">
              <BadgePercent size={18} className="text-amber-600 dark:text-amber-400" />
            </div>
            <p className="text-[10px] text-slate-400 dark:text-slate-500">Komisi</p>
            <p className="text-xl font-black text-slate-800 dark:text-white">
              {loading && !data ? <Loader2 size={16} className="animate-spin mx-auto mt-1" /> : (data?.referral_percent || '2%')}
            </p>
            {/* Badge syarat min deposit */}
            <div className="mt-1.5 flex items-center justify-center gap-0.5 rounded-full bg-amber-50 dark:bg-amber-900/20 px-1.5 py-0.5">
              <Info size={8} className="text-amber-500 shrink-0" />
              <span className="text-[8px] font-bold text-amber-600 dark:text-amber-400 leading-none">min Rp5.000</span>
            </div>
          </div>

        </div>

        {/* BANNER SYARAT KOMISI */}
        <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-800/50 dark:bg-amber-900/10">
          <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/30">
            <Info size={14} className="text-amber-600 dark:text-amber-400" />
          </div>
          <div>
            <p className="text-xs font-black text-amber-700 dark:text-amber-400 mb-0.5">Syarat Dapat Komisi</p>
            <p className="text-xs text-amber-700/80 dark:text-amber-400/80 leading-relaxed">
              Bonus komisi <span className="font-bold">{loading && !data ? '...' : (data?.referral_percent || '2%')}</span> hanya diberikan jika teman kamu melakukan deposit minimal{' '}
              <span className="font-black">Rp 5.000</span>. Deposit di bawah Rp 5.000 tidak menghasilkan bonus.
            </p>
          </div>
        </div>

        {/* KODE & LINK REFERRAL */}
        <div className="rounded-3xl bg-white border border-slate-100 shadow-sm dark:bg-slate-950 dark:border-slate-800 overflow-hidden">

          {/* Header Card */}
          <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <Share2 size={16} className={color.text} />
              <h3 className="font-bold text-sm text-slate-700 dark:text-slate-200">Kode & Link Referral Kamu</h3>
            </div>
          </div>

          <div className="p-5 space-y-4">

            {/* Kode Referral */}
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Kode Referral</p>
              {loading && !data ? (
                <div className="h-12 w-full rounded-xl bg-slate-100 dark:bg-slate-900 animate-pulse"></div>
              ) : (
                <div className="flex items-center gap-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 px-4 py-3">
                  <p className={`flex-1 text-2xl font-black tracking-[0.3em] ${color.text}`}>
                    {data?.referral_code || '-'}
                  </p>
                  <button
                    onClick={() => handleCopy(data?.referral_code || '', 'Kode referral disalin!')}
                    className="p-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors"
                  >
                    <Copy size={18} />
                  </button>
                </div>
              )}
            </div>

            {/* URL Referral — SCROLL HORIZONTAL */}
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Link Referral</p>
              {loading && !data ? (
                <div className="h-12 w-full rounded-xl bg-slate-100 dark:bg-slate-900 animate-pulse"></div>
              ) : (
                <div className="flex items-center gap-0 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 overflow-hidden">
                  {/* Area teks — bisa di-scroll horizontal, bisa di-select */}
                  <div className="flex-1 overflow-x-auto hide-scrollbar px-4 py-3">
                    <p className="text-xs font-mono text-slate-500 dark:text-slate-400 whitespace-nowrap select-all cursor-text">
                      {data?.url_referral || '-'}
                    </p>
                  </div>
                  {/* Divider tipis */}
                  <div className="w-px h-8 bg-slate-200 dark:bg-slate-700 shrink-0"></div>
                  {/* Tombol Copy — sticky di kanan, tidak ikut scroll */}
                  <button
                    onClick={() => handleCopy(data?.url_referral || '', 'Link referral disalin!')}
                    className="shrink-0 flex items-center justify-center w-12 h-full py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-white transition-colors"
                  >
                    <Copy size={16} />
                  </button>
                </div>
              )}
            </div>

            {/* Tombol Bagikan */}
            <button
              onClick={handleShare}
              disabled={(loading && !data) || !data}
              className={`w-full flex items-center justify-center gap-2 rounded-2xl py-4 font-bold text-sm shadow-lg transition-all active:scale-95 disabled:opacity-50 ${color.btn}`}
            >
              <Share2 size={18} />
              Bagikan Link Sekarang
            </button>

          </div>
        </div>

        {/* CARA KERJA */}
        <div className="rounded-3xl bg-white border border-slate-100 shadow-sm dark:bg-slate-950 dark:border-slate-800 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <TrendingUp size={16} className={color.text} />
              <h3 className="font-bold text-sm text-slate-700 dark:text-slate-200">Cara Kerja</h3>
            </div>
          </div>
          <div className="p-5 space-y-4">
            {[
              {
                title: 'Bagikan Link',
                desc: 'Salin dan bagikan link referral kamu ke teman lewat WA, Telegram, atau media sosial.',
                icon: <Share2 size={16} />,
                cls: 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400'
              },
              {
                title: 'Teman Mendaftar',
                desc: 'Teman kamu mendaftar di RuangOTP menggunakan link referral kamu.',
                icon: <UserPlus size={16} />,
                cls: 'bg-violet-50 text-violet-600 dark:bg-violet-900/20 dark:text-violet-400'
              },
              {
                title: 'Teman Deposit Min. Rp 5.000',
                desc: `Teman kamu deposit minimal Rp 5.000, kamu otomatis dapat bonus ${data?.referral_percent || '2%'} langsung masuk ke saldo!`,
                icon: <Wallet size={16} />,
                cls: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400'
              }
            ].map((item, index) => (
              <div key={index} className="flex items-start gap-4">
                <div className={`relative flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl ${item.cls}`}>
                  {item.icon}
                  {/* Nomor langkah */}
                  <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-slate-700 dark:bg-slate-600 text-[9px] font-black text-white">
                    {index + 1}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm text-slate-800 dark:text-white">{item.title}</p>
                  <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* RIWAYAT REFERRAL */}
        <div className="rounded-3xl bg-white border border-slate-100 shadow-sm dark:bg-slate-950 dark:border-slate-800 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <History size={16} className={color.text} />
              <h3 className="font-bold text-sm text-slate-700 dark:text-slate-200">Riwayat Referral</h3>
            </div>
          </div>

          {loading && !data ? (
            <div className="p-5 space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-16 w-full rounded-2xl bg-slate-100 dark:bg-slate-900 animate-pulse"></div>
              ))}
            </div>
          ) : !data?.history || data.history.length === 0 ? (
            <div className="p-8 text-center">
              <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-slate-100 text-3xl dark:bg-slate-900">
                🎁
              </div>
              <h4 className="font-bold text-slate-700 dark:text-white mb-1">Belum Ada Riwayat</h4>
              <p className="text-xs text-slate-400 dark:text-slate-500 leading-relaxed">
                Bagikan link referral kamu dan mulai dapatkan bonus saldo gratis!
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {data.history.map((item, index) => {
                const isDeposit = item.type === 'DEPOSIT';
                return (
                  <div key={item.id_transaksi || index} className="flex items-center gap-4 px-5 py-4">
                    {/* Icon */}
                    <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${
                      isDeposit
                        ? 'bg-emerald-50 dark:bg-emerald-900/20'
                        : 'bg-blue-50 dark:bg-blue-900/20'
                    }`}>
                      {isDeposit
                        ? <ArrowUpRight size={20} className="text-emerald-600 dark:text-emerald-400" />
                        : <UserPlus size={20} className="text-blue-600 dark:text-blue-400" />
                      }
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-slate-700 dark:text-slate-200 truncate">
                        {item.description || '-'}
                      </p>
                      <p className="mt-0.5 text-[10px] text-slate-400 dark:text-slate-500">
                        {formatDate(item.date)}
                      </p>
                      <p className="mt-0.5 text-[10px] font-mono text-slate-300 dark:text-slate-600 truncate">
                        {item.id_transaksi}
                      </p>
                    </div>

                    {/* Bonus */}
                    <div className="shrink-0 text-right">
                      {item.bonus_earned > 0 ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-black text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                          +{formatRupiah(item.bonus_earned)}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                          Daftar
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* CATATAN PENTING */}
        <div className={`rounded-2xl border p-4 ${color.bg} ${color.border}`}>
          <p className={`text-xs font-bold mb-2 ${color.text}`}>📌 Catatan Penting</p>
          <div className="space-y-1.5">
            <div className="flex items-start gap-2">
              <div className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-400 dark:bg-slate-500"></div>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Bonus hanya diberikan jika teman mendaftar menggunakan link referral kamu.
              </p>
            </div>
            <div className="flex items-start gap-2">
              <div className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500"></div>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Komisi <span className="font-bold text-slate-700 dark:text-slate-300">{data?.referral_percent || '2%'}</span> hanya dihitung jika deposit teman minimal{' '}
                <span className="font-bold text-amber-600 dark:text-amber-400">Rp 5.000</span>. Deposit di bawah nominal tersebut tidak menghasilkan bonus.
              </p>
            </div>
            <div className="flex items-start gap-2">
              <div className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-400 dark:bg-slate-500"></div>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Bonus langsung masuk ke saldo secara otomatis setelah deposit teman berhasil.
              </p>
            </div>
          </div>
        </div>

      </div>

      <BottomNav />

      {/* TOAST */}
      <div className={`fixed bottom-10 left-1/2 z-[100] flex -translate-x-1/2 transform items-center gap-3 rounded-full px-6 py-3 shadow-2xl transition-all duration-300 ${
        toast.show ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0 pointer-events-none'
      } ${toast.type === 'success' ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900' : 'bg-red-500 text-white'}`}>
        {toast.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
        <span className="text-sm font-bold">{toast.message}</span>
      </div>
    </div>
  );
}
