import React from 'react';
import { RefreshCw, MessageCircle, ServerCrash, Send } from 'lucide-react';

const Maintenance = () => {
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="text-center">
        {/* Ikon/Gambar Dekoratif */}
        <div className="relative mb-8 flex justify-center">
          <div className="relative">
            <ServerCrash size={120} className="text-slate-200 dark:text-slate-800 animate-pulse" strokeWidth={1} />
            <div className="absolute inset-0 flex items-center justify-center">
              <p className="text-xl font-bold text-slate-900 dark:text-white bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm px-4 py-2 rounded-lg shadow-sm">
                Server Sedang Tidur 😴
              </p>
            </div>
          </div>
        </div>

        <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-2">
          Sistem Sedang Maintenance
        </h2>
        
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-8 max-w-md mx-auto leading-relaxed">
          Tenang, saldo dan data pesanan kamu aman kok! Kami sedang melakukan peningkatan sistem atau perbaikan server. Silakan pantau info terbaru di channel atau coba beberapa saat lagi ya.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center flex-wrap">
          {/* Tombol Coba Lagi */}
          <button
            onClick={() => window.location.href = '/'}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold transition-all hover:scale-105 active:scale-95 shadow-lg shadow-blue-500/25"
          >
            <RefreshCw size={20} />
            Coba Lagi
          </button>

          {/* Tombol Channel Resmi (BARU) */}
          <a
            href="https://t.me/ruangotp"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 bg-white dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 px-6 py-3 rounded-xl font-semibold transition-all hover:bg-slate-50 dark:hover:bg-slate-700 hover:scale-105 active:scale-95 shadow-sm"
          >
            <Send size={20} className="text-sky-500" />
            Channel Resmi
          </a>

          {/* Tombol Support */}
          <a
            href="https://t.me/cs_ruangotp"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 bg-white dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 px-6 py-3 rounded-xl font-semibold transition-all hover:bg-slate-50 dark:hover:bg-slate-700 hover:scale-105 active:scale-95 shadow-sm"
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
