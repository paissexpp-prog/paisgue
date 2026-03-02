import React from 'react';
import { RefreshCw, MessageCircle, Send, AlertTriangle } from 'lucide-react';

const Maintenance = () => {
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 bg-slate-50 dark:bg-slate-900">
      <div className="w-full max-w-xl text-center flex flex-col items-center">
        
        {/* Bagian Visual Angka Besar (Adaptasi dari NotFound.jsx) */}
        <div className="relative w-full max-w-sm mb-12">
          {/* Efek Blur/Glow di Belakang */}
          <div className="absolute -inset-10 bg-gradient-to-r from-blue-600 via-emerald-500 to-violet-600 rounded-full blur-3xl opacity-20 dark:opacity-30 animate-pulse"></div>
          
          {/* Angka 503 Besar dengan Gradien Text (Clips) */}
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
        <div className="relative z-10 mb-10">
          <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white mb-3">
            Sistem Dalam Pemeliharaan
          </h2>
          <p className="text-sm md:text-base text-slate-600 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
            Halaman ini muncul karena <span className="font-semibold text-blue-600 dark:text-blue-400">Backend Server kami sedang down atau dalam peningkatan rutin</span>. Tenang, saldo dan data Anda aman. Silakan pantau informasi terbaru atau coba akses kembali nanti.
          </p>
        </div>

        {/* Bagian Tombol Aksi */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center flex-wrap w-full">
          {/* Tombol Utama: Coba Lagi */}
          <button
            onClick={() => window.location.href = '/'}
            className="flex w-full sm:w-auto items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-7 py-3.5 rounded-xl font-semibold transition-all hover:scale-105 active:scale-95 shadow-lg shadow-blue-500/25"
          >
            <RefreshCw size={20} className="animate-spin-slow" />
            Coba Muat Ulang
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

