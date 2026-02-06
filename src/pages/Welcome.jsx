import { Link } from 'react-router-dom';
import { ShieldCheck, Zap, Globe, Smartphone } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export default function Welcome() {
  const { theme } = useTheme();

  return (
    <div className="flex min-h-screen flex-col">
      {/* Hero Section */}
      <div className="relative flex flex-1 flex-col justify-center overflow-hidden bg-slate-900 pt-20 text-center">
        {/* Efek Background Glow */}
        <div className={`absolute top-0 left-1/2 h-[500px] w-[500px] -translate-x-1/2 rounded-full opacity-20 blur-[100px] ${theme.primary}`}></div>

        <div className="relative z-10 px-6">
          <div className={`mb-4 inline-block rounded-full border border-slate-700 bg-slate-800/50 px-4 py-1.5 text-sm font-medium ${theme.text} backdrop-blur-md`}>
            🚀 Solusi OTP Termurah & Tercepat
          </div>
          <h1 className="mx-auto max-w-4xl text-5xl font-extrabold tracking-tight text-white md:text-7xl">
            Verifikasi Akun <span className={`bg-gradient-to-r ${theme.gradient} bg-clip-text text-transparent`}>Tanpa Batas</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-400">
            Dapatkan nomor virtual untuk verifikasi WhatsApp, Telegram, Google, dan ribuan layanan lainnya secara instan dengan harga terbaik.
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link to="/register" className={`rounded-full px-8 py-4 text-lg font-bold text-white shadow-lg transition-all hover:scale-105 ${theme.primary}`}>
              Mulai Sekarang
            </Link>
            <Link to="/" className="rounded-full border border-slate-700 bg-slate-800 px-8 py-4 text-lg font-medium text-white transition-all hover:bg-slate-700 hover:text-white">
              Masuk Akun
            </Link>
          </div>

          {/* Statistik Singkat */}
          <div className="mt-16 grid grid-cols-2 gap-8 border-t border-slate-800 pt-8 md:grid-cols-4">
            <div>
              <div className="text-3xl font-bold text-white">50+</div>
              <div className="text-sm text-slate-500">Negara</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-white">1000+</div>
              <div className="text-sm text-slate-500">Layanan</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-white">24/7</div>
              <div className="text-sm text-slate-500">Support</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-white">0.1s</div>
              <div className="text-sm text-slate-500">Kecepatan</div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="bg-slate-950 py-20">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid gap-8 md:grid-cols-3">
            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-8 transition-all hover:border-slate-700">
              <div className={`mb-4 inline-flex rounded-lg bg-slate-800 p-3 ${theme.text}`}>
                <Globe size={32} />
              </div>
              <h3 className="mb-2 text-xl font-bold text-white">Global Access</h3>
              <p className="text-slate-400">Akses nomor dari berbagai negara di seluruh dunia tanpa perlu kartu SIM fisik.</p>
            </div>
            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-8 transition-all hover:border-slate-700">
              <div className={`mb-4 inline-flex rounded-lg bg-slate-800 p-3 ${theme.text}`}>
                <Zap size={32} />
              </div>
              <h3 className="mb-2 text-xl font-bold text-white">Instant Delivery</h3>
              <p className="text-slate-400">Kode OTP diterima dalam hitungan detik secara otomatis oleh sistem kami.</p>
            </div>
            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-8 transition-all hover:border-slate-700">
              <div className={`mb-4 inline-flex rounded-lg bg-slate-800 p-3 ${theme.text}`}>
                <ShieldCheck size={32} />
              </div>
              <h3 className="mb-2 text-xl font-bold text-white">Privasi Aman</h3>
              <p className="text-slate-400">Identitas asli Anda terlindungi sepenuhnya. Gunakan nomor sekali pakai.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
