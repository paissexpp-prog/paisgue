import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BottomNav from '../components/BottomNav';
import { useTheme } from '../context/ThemeContext';
import {
  ChevronLeft, FileText, ChevronDown, ChevronUp,
  ShieldCheck, Wallet, AlertTriangle, Ban,
  Scale, Clock, Phone, Info
} from 'lucide-react';

const sections = [
  {
    icon: <Info size={20} />,
    title: '1. Deskripsi Layanan',
    color: 'blue',
    content: [
      'RuangOTP adalah platform penyedia nomor virtual (Virtual Number) yang digunakan untuk menerima kode OTP (One-Time Password) dari berbagai layanan digital seperti WhatsApp, Telegram, Google, dan 1.000+ aplikasi lainnya.',
      'Layanan ini beroperasi secara otomatis selama 24 jam penuh, 7 hari seminggu, tanpa perlu kartu SIM fisik. Setiap nomor bersifat sementara dan digunakan sekali untuk keperluan verifikasi.',
      'RuangOTP tidak berafiliasi dengan platform atau aplikasi mana pun yang tercantum sebagai layanan tersedia. Nama-nama tersebut hanya berfungsi sebagai kategori tujuan penggunaan OTP.',
    ],
  },
  {
    icon: <Scale size={20} />,
    title: '2. Ketentuan Penggunaan',
    color: 'violet',
    content: [
      'Dengan menggunakan layanan RuangOTP, Anda menyatakan telah berusia minimal 17 tahun dan memiliki kapasitas hukum untuk menyetujui ketentuan ini.',
      'Nomor virtual yang Anda dapatkan hanya boleh digunakan untuk keperluan verifikasi yang sah dan pribadi. Penggunaan untuk aktivitas ilegal, penipuan, spam, atau tindakan yang merugikan pihak lain sangat dilarang.',
      'Setiap akun RuangOTP bersifat personal dan tidak boleh dipindahtangankan, dijual, atau digunakan bersama dengan pihak lain tanpa izin tertulis dari tim RuangOTP.',
    ],
  },
  {
    icon: <Wallet size={20} />,
    title: '3. Kebijakan Saldo & Refund',
    color: 'emerald',
    content: [
      'Saldo yang telah diisi (top up) ke akun RuangOTP bersifat non-tunai dan tidak dapat ditarik kembali dalam bentuk uang tunai ke rekening bank atau dompet digital.',
      'Biaya pembelian nomor virtual akan dipotong secara otomatis dari saldo Anda saat order berhasil dibuat. Jika OTP tidak diterima dalam waktu yang ditentukan, order dapat dibatalkan dan saldo akan dikembalikan sepenuhnya.',
      'Pembatalan order hanya dapat dilakukan setelah 4 menit sejak order dibuat. Pastikan Anda telah memulai proses verifikasi sebelum waktu tersebut berakhir.',
      'Dalam kondisi gangguan teknis dari pihak penyedia nomor, RuangOTP berhak untuk memberikan kompensasi saldo sesuai kebijakan internal yang berlaku.',
    ],
  },
  {
    icon: <ShieldCheck size={20} />,
    title: '4. Privasi & Keamanan Data',
    color: 'blue',
    content: [
      'RuangOTP berkomitmen menjaga kerahasiaan data pribadi pengguna. Data yang Anda berikan saat registrasi (nama, email) hanya digunakan untuk keperluan autentikasi dan komunikasi layanan.',
      'RuangOTP tidak menjual, menyewakan, atau membagikan data pengguna kepada pihak ketiga untuk keperluan komersial tanpa persetujuan pengguna.',
      'Anda bertanggung jawab atas keamanan kredensial akun Anda. Jangan bagikan token API atau User ID kepada siapa pun. RuangOTP tidak akan pernah meminta password Anda melalui media apa pun.',
    ],
  },
  {
    icon: <Ban size={20} />,
    title: '5. Larangan Penggunaan',
    color: 'red',
    content: [
      'Dilarang keras menggunakan layanan RuangOTP untuk melakukan tindakan penipuan (fraud), phishing, penyebaran konten berbahaya, atau aktivitas yang bertentangan dengan hukum yang berlaku di Indonesia.',
      'Dilarang menggunakan layanan ini untuk mendaftarkan nomor pada platform yang secara eksplisit melarang penggunaan nomor virtual atau nomor sementara dalam Syarat & Ketentuan mereka.',
      'Dilarang melakukan penyalahgunaan API seperti flood request, scraping berlebihan, atau upaya untuk memanipulasi sistem harga dan stok nomor.',
      'Pelanggaran terhadap larangan di atas akan mengakibatkan pemblokiran akun permanen tanpa pengembalian saldo.',
    ],
  },
  {
    icon: <AlertTriangle size={20} />,
    title: '6. Batasan Tanggung Jawab',
    color: 'amber',
    content: [
      'RuangOTP tidak bertanggung jawab atas kegagalan verifikasi yang disebabkan oleh kebijakan platform tujuan, perubahan sistem pihak ketiga, atau gangguan jaringan di luar kendali kami.',
      'Layanan disediakan "sebagaimana adanya" (as-is). RuangOTP tidak menjamin keberhasilan 100% setiap order karena ketersediaan nomor dipengaruhi oleh kondisi pasar dan penyedia.',
      'Dalam hal apapun, total tanggung jawab RuangOTP kepada pengguna tidak akan melebihi jumlah saldo yang tersisa di akun pengguna pada saat terjadinya sengketa.',
    ],
  },
  {
    icon: <Clock size={20} />,
    title: '7. Perubahan Ketentuan',
    color: 'slate',
    content: [
      'RuangOTP berhak mengubah, memperbarui, atau merevisi ketentuan layanan ini kapan saja tanpa pemberitahuan terlebih dahulu.',
      'Perubahan akan mulai berlaku segera setelah dipublikasikan. Dengan terus menggunakan layanan setelah perubahan diterapkan, Anda dianggap telah menyetujui ketentuan yang baru.',
      'Disarankan untuk memeriksa halaman ini secara berkala untuk mengetahui pembaruan terbaru.',
    ],
  },
  {
    icon: <Phone size={20} />,
    title: '8. Kontak & Penyelesaian Sengketa',
    color: 'blue',
    content: [
      'Jika Anda memiliki pertanyaan, keluhan, atau ingin melaporkan pelanggaran terkait layanan RuangOTP, silakan hubungi tim kami melalui CS Telegram di @cs_ruangotp atau email di ruangotp@site.',
      'Segala sengketa yang timbul dari penggunaan layanan akan diselesaikan secara musyawarah terlebih dahulu. Jika tidak tercapai kesepakatan, sengketa akan diselesaikan berdasarkan hukum yang berlaku di Republik Indonesia.',
      'Ketentuan ini berlaku sejak tanggal pengguna pertama kali menggunakan layanan RuangOTP dan terus berlaku selama akun aktif.',
    ],
  },
];

const colorMap = {
  blue:    { icon: 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400', dot: 'bg-blue-500' },
  violet:  { icon: 'bg-violet-50 text-violet-600 dark:bg-violet-900/20 dark:text-violet-400', dot: 'bg-violet-500' },
  emerald: { icon: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400', dot: 'bg-emerald-500' },
  red:     { icon: 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400', dot: 'bg-red-500' },
  amber:   { icon: 'bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400', dot: 'bg-amber-500' },
  slate:   { icon: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300', dot: 'bg-slate-400' },
};

export default function Ketentuan() {
  const { color } = useTheme();
  const navigate = useNavigate();
  const [expandedIndex, setExpandedIndex] = useState(null);

  const toggle = (index) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-28 transition-colors duration-300 dark:bg-slate-900">

      {/* STICKY HEADER */}
      <div className="sticky top-0 z-40 border-b border-slate-100 bg-white/90 px-5 pb-4 pt-8 backdrop-blur-md dark:border-slate-800 dark:bg-slate-950/90">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2 -ml-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <ChevronLeft size={24} className="text-slate-700 dark:text-white" />
          </button>
          <h1 className="text-xl font-bold text-slate-800 dark:text-white">Ketentuan Layanan</h1>
        </div>
      </div>

      <div className="mx-auto max-w-lg px-5 mt-6 space-y-6">

        {/* HERO BANNER */}
        <div className={`relative overflow-hidden rounded-3xl p-7 text-white shadow-xl bg-gradient-to-br ${color.gradient}`}>
          <div className="relative z-10">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm border border-white/20">
              <FileText size={24} />
            </div>
            <h2 className="text-2xl font-black leading-tight">Ketentuan<br />Layanan RuangOTP</h2>
            <p className="mt-2 text-sm text-white/80 leading-relaxed">
              Harap baca dan pahami ketentuan berikut sebelum menggunakan layanan <span className="font-bold text-white">Virtual Number & OTP</span> kami.
            </p>
            <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-white/20 px-3 py-1 text-xs font-bold backdrop-blur-sm">
              <span className="h-2 w-2 rounded-full bg-white animate-pulse"></span>
              Berlaku sejak 1 Januari 2026
            </div>
          </div>
          {/* Dekorasi */}
          <div className="absolute -bottom-8 -right-8 h-32 w-32 rounded-full bg-white/10 blur-2xl"></div>
          <div className="absolute -top-6 -right-6 h-24 w-24 rounded-full bg-white/10"></div>
        </div>

        {/* INFO SINGKAT */}
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-800/40 dark:bg-amber-900/10">
          <div className="flex items-start gap-3">
            <AlertTriangle size={18} className="mt-0.5 shrink-0 text-amber-500" />
            <p className="text-xs leading-relaxed text-amber-700 dark:text-amber-400">
              Dengan mendaftar dan menggunakan layanan RuangOTP, Anda dianggap telah membaca, memahami, dan menyetujui seluruh ketentuan yang tercantum di halaman ini.
            </p>
          </div>
        </div>

        {/* ACCORDION SECTIONS */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 px-1">
            <FileText size={14} className="text-slate-400" />
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Detail Ketentuan</p>
          </div>

          {sections.map((section, index) => {
            const isOpen = expandedIndex === index;
            const c = colorMap[section.color];

            return (
              <div
                key={index}
                className={`overflow-hidden rounded-2xl border transition-all duration-300 bg-white dark:bg-slate-950 ${
                  isOpen
                    ? 'border-slate-300 shadow-md dark:border-slate-700'
                    : 'border-slate-100 shadow-sm dark:border-slate-800'
                }`}
              >
                {/* Accordion Header */}
                <button
                  onClick={() => toggle(index)}
                  className="flex w-full items-center gap-4 p-4 text-left"
                >
                  <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${c.icon}`}>
                    {section.icon}
                  </div>
                  <span className={`flex-1 font-bold text-sm ${isOpen ? 'text-slate-900 dark:text-white' : 'text-slate-700 dark:text-slate-200'}`}>
                    {section.title}
                  </span>
                  {isOpen
                    ? <ChevronUp size={18} className="shrink-0 text-slate-400" />
                    : <ChevronDown size={18} className="shrink-0 text-slate-400" />
                  }
                </button>

                {/* Accordion Body */}
                <div className={`transition-all duration-300 ease-in-out overflow-hidden ${isOpen ? 'max-h-[800px] opacity-100' : 'max-h-0 opacity-0'}`}>
                  <div className="space-y-0 border-t border-slate-100 dark:border-slate-800">
                    {section.content.map((paragraph, i) => (
                      <div
                        key={i}
                        className={`flex gap-3 px-5 py-4 text-sm leading-relaxed text-slate-600 dark:text-slate-400 ${
                          i < section.content.length - 1 ? 'border-b border-slate-50 dark:border-slate-900' : ''
                        }`}
                      >
                        <span className={`mt-2 h-1.5 w-1.5 shrink-0 rounded-full ${c.dot}`}></span>
                        <p>{paragraph}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* FOOTER CARD */}
        <div className="rounded-2xl border border-slate-100 bg-white p-5 text-center dark:border-slate-800 dark:bg-slate-950">
          <p className="text-xs text-slate-400 leading-relaxed">
            Pertanyaan seputar ketentuan ini? Hubungi kami di{' '}
            <a href="https://t.me/cs_ruangotp" target="_blank" rel="noreferrer" className={`font-bold hover:underline ${color.text}`}>
              @cs_ruangotp
            </a>
          </p>
          <p className="mt-2 text-[10px] text-slate-300 dark:text-slate-600">
            © 2026 RuangOTP. All rights reserved.
          </p>
        </div>

      </div>

      <BottomNav />
    </div>
  );
}