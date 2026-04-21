import React, { useEffect, useState, useRef } from 'react';
import { RefreshCw, MessageCircle, Send, AlertTriangle, CheckCircle } from 'lucide-react';

const RETRY_INTERVAL_MS = 5000; // cek setiap 5 detik

const Maintenance = () => {
  const [retryCount, setRetryCount] = useState(0);
  const [isChecking, setIsChecking] = useState(false);
  const [backOnline, setBackOnline] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const intervalRef = useRef(null);
  const countdownRef = useRef(null);

  // Ambil URL asal yang disimpan api.js sebelum redirect ke /maintenance
  const originPath = localStorage.getItem('maintenance_origin') || '/';

  const pingBackend = async () => {
    setIsChecking(true);
    try {
      // Gunakan raw fetch agar tidak kena interceptor axios yang akan loop ke /maintenance
      const res = await fetch('https://api.ruangotp.site/api/auth/me', {
        method: 'GET',
        signal: AbortSignal.timeout(4000), // timeout 4 detik
      });

      if (res.ok || res.status < 500) {
        // Backend sudah hidup kembali!
        setBackOnline(true);
        clearInterval(intervalRef.current);
        clearInterval(countdownRef.current);

        // Hapus flag maintenance, lalu redirect kembali ke halaman asal
        localStorage.removeItem('maintenance_origin');
        setTimeout(() => {
          window.location.href = originPath;
        }, 1500);
      } else {
        setRetryCount(prev => prev + 1);
        setCountdown(5);
      }
    } catch (err) {
      // Backend masih mati
      setRetryCount(prev => prev + 1);
      setCountdown(5);
    } finally {
      setIsChecking(false);
    }
  };

  useEffect(() => {
    // Langsung ping pertama kali saat halaman dibuka
    pingBackend();

    // Auto ping setiap 5 detik
    intervalRef.current = setInterval(() => {
      pingBackend();
    }, RETRY_INTERVAL_MS);

    // Countdown display (1 detik sekali)
    countdownRef.current = setInterval(() => {
      setCountdown(prev => (prev <= 1 ? 5 : prev - 1));
    }, 1000);

    return () => {
      clearInterval(intervalRef.current);
      clearInterval(countdownRef.current);
    };
  }, []);

  const handleManualRetry = () => {
    setCountdown(5);
    pingBackend();
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 bg-slate-50 dark:bg-slate-900">
      <div className="w-full max-w-xl text-center flex flex-col items-center">
        
        {/* Bagian Visual Angka Besar */}
        <div className="relative w-full max-w-sm mb-12">
          {/* Efek Blur/Glow di Belakang */}
          <div className="absolute -inset-10 bg-gradient-to-r from-blue-600 via-emerald-500 to-violet-600 rounded-full blur-3xl opacity-20 dark:opacity-30 animate-pulse"></div>
          
          {/* Angka 503 Besar dengan Gradien Text */}
          <div className="relative text-[10rem] md:text-[14rem] font-extrabold leading-none tracking-tighter select-none">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-blue-500 to-emerald-500 dark:from-blue-400 dark:via-blue-500 dark:to-emerald-400">
              50
            </span>
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-500 via-violet-500 to-violet-600 dark:from-emerald-400 dark:via-violet-500 dark:to-violet-500">
              3
            </span>
          </div>

          {/* Ikon Peringatan Melayang */}
          <div className="absolute -bottom-2 -right-2 md:bottom-2 md:right-8 bg-white dark:bg-slate-800 p-3 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-700">
            <AlertTriangle className="w-10 h-10 text-yellow-500" strokeWidth={1.5} />
          </div>
        </div>

        {/* Teks Informasi */}
        <div className="relative z-10 mb-6">
          <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white mb-3">
            Sistem Dalam Pemeliharaan
          </h2>
          <p className="text-sm md:text-base text-slate-600 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
            Halaman ini muncul karena <span className="font-semibold text-blue-600 dark:text-blue-400">Backend Server kami sedang down atau dalam peningkatan rutin</span>. Tenang, saldo dan data Anda aman. Kami sedang memantau dan akan otomatis mengarahkan kembali.
          </p>
        </div>

        {/* Status Auto-Retry */}
        {backOnline ? (
          /* Backend sudah hidup — tampilkan sukses */
          <div className="mb-6 flex items-center gap-3 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-2xl px-5 py-3 text-emerald-700 dark:text-emerald-400 animate-in fade-in duration-300">
            <CheckCircle size={20} className="shrink-0" />
            <span className="text-sm font-bold">Server kembali online! Mengalihkan...</span>
          </div>
        ) : (
          /* Sedang menunggu — tampilkan status cek otomatis */
          <div className="mb-6 flex items-center gap-3 bg-slate-100 dark:bg-slate-800 rounded-2xl px-5 py-3">
            <RefreshCw 
              size={16} 
              className={`shrink-0 text-slate-500 dark:text-slate-400 ${isChecking ? 'animate-spin' : ''}`} 
            />
            <span className="text-xs text-slate-500 dark:text-slate-400">
              {isChecking 
                ? 'Sedang mengecek server...' 
                : `Pengecekan ulang otomatis dalam ${countdown} detik (percobaan ke-${retryCount + 1})`
              }
            </span>
          </div>
        )}

        {/* Bagian Tombol Aksi */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center flex-wrap w-full">
          {/* Tombol Utama: Coba Sekarang (manual retry) */}
          <button
            onClick={handleManualRetry}
            disabled={isChecking || backOnline}
            className="flex w-full sm:w-auto items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white px-7 py-3.5 rounded-xl font-semibold transition-all hover:scale-105 active:scale-95 shadow-lg shadow-blue-500/25"
          >
            <RefreshCw size={20} className={isChecking ? 'animate-spin' : ''} />
            {isChecking ? 'Mengecek...' : 'Cek Sekarang'}
          </button>

          {/* Tombol Sekunder: Channel */}
          <a
            href="https://t.me/ruangotp"
            target="_blank"
            rel="noopener noreferrer"
            className="flex w-full sm:w-auto items-center justify-center gap-2 bg-white dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 px-7 py-3.5 rounded-xl font-semibold transition-all hover:bg-slate-50 dark:hover:bg-slate-700 hover:scale-105 active:scale-95 shadow-sm"
          >
            <Send size={20} className="text-sky-500" />
            Channel Resmi
          </a>

          {/* Tombol Sekunder: CS */}
          <a
            href="https://t.me/cs_ruangotp"
            target="_blank"
            rel="noopener noreferrer"
            className="flex w-full sm:w-auto items-center justify-center gap-2 bg-white dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 px-7 py-3.5 rounded-xl font-semibold transition-all hover:bg-slate-50 dark:hover:bg-slate-700 hover:scale-105 active:scale-95 shadow-sm"
          >
            <MessageCircle size={20} className="text-emerald-500" />
            Hubungi CS
          </a>
        </div>
      </div>
    </div>
  );
};

export default Maintenance;
