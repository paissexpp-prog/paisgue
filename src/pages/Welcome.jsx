import { Link } from 'react-router-dom';
import { ShieldCheck, Zap, Globe, CheckCircle } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export default function Welcome() {
  const { color } = useTheme();

  return (
    // Container utama dengan transisi background halus
    <div className="flex min-h-screen flex-col bg-white text-slate-900 transition-colors duration-300 dark:bg-slate-950 dark:text-slate-100">
      
      {/* Hero Section */}
      <div className="relative isolate pt-14">
        {/* Efek Gradient Background (Light/Dark compatible) */}
        <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80">
          <div className={`relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr ${color.gradient} opacity-30 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]`} />
        </div>

        <div className="mx-auto max-w-6xl px-6 py-20 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <div className={`mb-6 inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ring-1 ring-inset ${color.bg} ${color.text} ${color.border}`}>
              🚀 Platform OTP #1 di Indonesia
            </div>
            <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
              Verifikasi Akun Digital <br/>
              <span className={`bg-gradient-to-r ${color.gradient} bg-clip-text text-transparent`}>
                Tanpa Batas
              </span>
            </h1>
            <p className="mt-6 text-lg leading-8 text-slate-600 dark:text-slate-400">
              Solusi verifikasi instan untuk WhatsApp, Telegram, Google, dan 1000+ layanan lainnya. 
              Privasi terjaga, harga termurah, dan aktif 24 jam.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Link to="/register" className={`rounded-lg px-6 py-3 text-sm font-semibold shadow-sm transition-all hover:scale-105 ${color.btn}`}>
                Mulai Sekarang
              </Link>
              <Link to="/login" className="text-sm font-semibold leading-6 text-slate-900 dark:text-white">
                Masuk Member <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section - Dibuat menyatu tanpa garis batas kasar */}
      <div className="relative py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl lg:text-center">
            <h2 className={`text-base font-semibold leading-7 ${color.text}`}>Kenapa Kami?</h2>
            <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
              Segala yang Anda butuhkan untuk verifikasi
            </p>
          </div>
          
          <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
            <div className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
              
              {/* Feature 1 */}
              <div className="flex flex-col rounded-2xl bg-slate-50 p-8 transition-colors dark:bg-slate-900/50">
                <div className={`mb-6 flex h-10 w-10 items-center justify-center rounded-lg ${color.btn}`}>
                  <Globe className="h-6 w-6" aria-hidden="true" />
                </div>
                <div className="text-base font-semibold leading-7 text-slate-900 dark:text-white">
                  Akses Global
                </div>
                <div className="mt-1 flex flex-auto flex-col text-base leading-7 text-slate-600 dark:text-slate-400">
                  <p className="flex-auto">Tersedia nomor dari 50+ negara di seluruh dunia. Indonesia, USA, UK, dan banyak lagi.</p>
                </div>
              </div>

              {/* Feature 2 */}
              <div className="flex flex-col rounded-2xl bg-slate-50 p-8 transition-colors dark:bg-slate-900/50">
                <div className={`mb-6 flex h-10 w-10 items-center justify-center rounded-lg ${color.btn}`}>
                  <Zap className="h-6 w-6" aria-hidden="true" />
                </div>
                <div className="text-base font-semibold leading-7 text-slate-900 dark:text-white">
                  Koneksi Kilat
                </div>
                <div className="mt-1 flex flex-auto flex-col text-base leading-7 text-slate-600 dark:text-slate-400">
                  <p className="flex-auto">Sistem otomatis memproses SMS OTP dalam hitungan detik. Tanpa delay, tanpa ribet.</p>
                </div>
              </div>

              {/* Feature 3 */}
              <div className="flex flex-col rounded-2xl bg-slate-50 p-8 transition-colors dark:bg-slate-900/50">
                <div className={`mb-6 flex h-10 w-10 items-center justify-center rounded-lg ${color.btn}`}>
                  <ShieldCheck className="h-6 w-6" aria-hidden="true" />
                </div>
                <div className="text-base font-semibold leading-7 text-slate-900 dark:text-white">
                  Privasi & Aman
                </div>
                <div className="mt-1 flex flex-auto flex-col text-base leading-7 text-slate-600 dark:text-slate-400">
                  <p className="flex-auto">Lindungi nomor pribadi Anda dari spam. Gunakan nomor virtual sekali pakai yang aman.</p>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>

      {/* Footer Simple yang menyatu */}
      <footer className="mt-auto border-t border-slate-200 py-12 dark:border-slate-800">
        <div className="mx-auto max-w-7xl px-6 text-center md:flex md:items-center md:justify-between lg:px-8">
          <div className="mt-8 md:order-1 md:mt-0">
            <p className="text-xs leading-5 text-slate-500">
              &copy; 2026 RuangOTP. All rights reserved.
            </p>
          </div>
          <div className="flex justify-center space-x-6 md:order-2">
             <span className="text-xs text-slate-400">Made with ❤️ for Privacy</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

