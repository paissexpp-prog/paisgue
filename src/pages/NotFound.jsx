import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, MessageCircle } from 'lucide-react';

const NotFound = () => {
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="text-center">
        {/* Ikon/Gambar Dekoratif */}
        <div className="relative mb-8">
          <h1 className="text-9xl font-black text-slate-200 dark:text-slate-800 animate-pulse">
            404
          </h1>
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="text-2xl font-bold text-slate-900 dark:text-white bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm px-4 py-2 rounded-lg">
              Oops! Halaman Hilang
            </p>
          </div>
        </div>

        <h2 className="text-xl text-slate-600 dark:text-slate-400 mb-8 max-w-md mx-auto">
          Maaf, halaman yang Anda cari tidak dapat ditemukan atau telah dipindahkan.
        </h2>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          {/* Tombol Beranda */}
          <Link
            to="/"
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold transition-all hover:scale-105 active:scale-95 shadow-lg shadow-blue-500/25"
          >
            <ArrowLeft size={20} />
            Kembali ke Beranda
          </Link>

          {/* Tombol Support */}
          <a
            href="https://t.me/cs_ruangotp"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 bg-white dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 px-6 py-3 rounded-xl font-semibold transition-all hover:bg-slate-50 dark:hover:bg-slate-700 hover:scale-105 active:scale-95 shadow-sm"
          >
            <MessageCircle size={20} className="text-blue-500" />
            Hubungi Support
          </a>
        </div>
      </div>
    </div>
  );
};

export default NotFound;


