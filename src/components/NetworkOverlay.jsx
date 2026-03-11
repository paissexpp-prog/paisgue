import React, { useState, useEffect } from 'react';
import { WifiOff, Loader2 } from 'lucide-react';

const NetworkOverlay = () => {
  // Mengecek status internet secara real-time dari browser
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    // Fungsi untuk otomatis mengubah status tanpa refresh
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    // Pasang pendeteksi ke sistem window
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Bersihkan pendeteksi jika komponen dilepas
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Jika online, komponen ini tidak menampilkan apa-apa (hilang otomatis)
  if (!isOffline) return null;

  // Tampilan Elegan RuangOTP jika Offline
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-50/80 dark:bg-slate-900/80 backdrop-blur-md transition-all duration-300">
      <div className="text-center flex flex-col items-center">
        
        <div className="relative mb-8">
          {/* Efek Glowing di belakang ikon */}
          <div className="absolute -inset-4 bg-blue-600/30 rounded-full blur-xl animate-pulse"></div>
          
          {/* Wadah Ikon Berputar */}
          <div className="relative bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-700 flex items-center justify-center">
            <Loader2 className="w-12 h-12 text-blue-600 dark:text-blue-500 animate-spin absolute" />
            <WifiOff className="w-6 h-6 text-slate-400 dark:text-slate-500 z-10" />
          </div>
        </div>
        
        <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white mb-3">
          Koneksi Anda Terputus
        </h2>
        <p className="text-sm md:text-base text-slate-600 dark:text-slate-400 max-w-sm mx-auto leading-relaxed px-4">
          Menunggu jaringan internet Anda terhubung kembali. Layar ini akan <span className="font-semibold text-blue-600 dark:text-blue-400">tertutup otomatis</span> saat sinyal stabil.
        </p>

        {/* Merek RuangOTP */}
        <div className="mt-8 text-xs font-semibold tracking-widest text-slate-400 dark:text-slate-500 uppercase">
          RuangOTP System
        </div>

      </div>
    </div>
  );
};

export default NetworkOverlay;
