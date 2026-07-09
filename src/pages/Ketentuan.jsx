import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import BottomNav from '../components/BottomNav';
import { useTheme } from '../context/ThemeContext';
import {
  ChevronLeft, FileText, ChevronDown, ChevronUp,
  ShieldCheck, Wallet, AlertTriangle, Ban,
  Scale, Clock, Phone, Info, UserCheck, 
  CheckCircle, Database, User, XOctagon, FileBadge
} from 'lucide-react';

const sections = [
  {
    icon: <ShieldCheck size={20} />,
    title: '1. Penerimaan Ketentuan',
    color: 'blue',
    content: [
      'Dengan mengakses dan menggunakan sistem RuangOTP, Anda selaku Pengguna sepakat untuk mematuhi seluruh Syarat dan Ketentuan ini tanpa paksaan.',
      'Aturan ini berlaku mengikat sebagai perjanjian penggunaan layanan digital antara Anda dan Pihak Pengelola RuangOTP.'
    ],
  },
  {
    icon: <Info size={20} />,
    title: '2. Lingkup Layanan',
    color: 'violet',
    content: [
      'RuangOTP beroperasi sebagai platform penyedia infrastruktur digital yang memfasilitasi penyewaan nomor virtual sementara untuk kebutuhan penerimaan kode OTP (One-Time Password).',
      'Kami menyediakan antarmuka web dan integrasi API (Application Programming Interface) untuk mempermudah operasional Anda.'
    ],
  },
  {
    icon: <UserCheck size={20} />,
    title: '3. Kelayakan Pengguna',
    color: 'emerald',
    content: [
      'Anda menyatakan bahwa Anda telah berusia minimal 18 tahun dan memiliki kecakapan secara hukum untuk menggunakan layanan digital.',
      'Akun yang Anda buat bersifat personal dan sepenuhnya menjadi tanggung jawab Anda sendiri.'
    ],
  },
  {
    icon: <CheckCircle size={20} />,
    title: '4. Batasan Penggunaan Wajar',
    color: 'emerald',
    content: [
      'Layanan kami didesain HANYA untuk kebutuhan pendaftaran yang tidak bersifat sensitif, antara lain:',
      '• Pembuatan akun media sosial, aplikasi komunikasi, dan forum publik.',
      '• Pendaftaran layanan hiburan, game online, dan streaming.',
      '• Verifikasi aplikasi e-commerce tingkat dasar.',
      '• Kebutuhan pengujian (QA) bagi pengembang perangkat lunak atau aktivitas promosi yang sah secara hukum.'
    ],
  },
  {
    icon: <Ban size={20} />,
    title: '5. Larangan Keras (Abuse Policy)',
    color: 'red',
    content: [
      'Pengelola SANGAT MELARANG penggunaan nomor virtual RuangOTP untuk aktivitas berikut:',
      '• Transaksi Finansial: Pembuatan akun perbankan, dompet digital (e-wallet), pinjaman online (pinjol), atau platform cryptocurrency.',
      '• Layanan Sensitif: Administrasi negara/pemerintah, rekam medis, atau pendaftaran asuransi.',
      '• Tindak Kejahatan: Penipuan, pencucian uang, penyebaran malware, phising, perjudian ilegal, dan pelanggaran Hak Cipta.',
      'Segala bentuk penyalahgunaan akan berakibat pada pemblokiran akun permanen secara instan.'
    ],
  },
  {
    icon: <Database size={20} />,
    title: '6. Kebijakan Privasi & Manajemen Data',
    color: 'blue',
    content: [
      '6.1. Pengumpulan Informasi: RuangOTP hanya mencatat data operasional esensial seperti alamat email, kata sandi (disimpan dalam format acak/terenkripsi), riwayat deposit saldo, dan log akses teknis (seperti IP address) untuk menjaga kelancaran server.',
      '6.2. Penanganan SMS: Isi pesan teks (SMS) yang masuk ke sistem kami hanya ditampung sementara agar dapat dibaca di layar Anda. Pesan tersebut akan dihapus secara otomatis dan berkala oleh sistem demi menjaga privasi.',
      '6.3. Perlindungan Privasi: Pengelola menjamin bahwa informasi data diri Anda tidak akan diperjualbelikan, disewakan, atau dibagikan kepada pihak pengiklan luar.',
      '6.4. Akses Pihak Luar: Berbagi data hanya dilakukan sebatas keperluan teknis dengan mitra operasional (seperti penyedia gerbang pembayaran atau operator telekomunikasi global), serta otoritas penegak hukum yang sah di Indonesia apabila terdapat surat perintah resmi.'
    ],
  },
  {
    icon: <User size={20} />,
    title: '7. Tanggung Jawab Pribadi',
    color: 'amber',
    content: [
      'Anda selaku Pengguna adalah pemegang tanggung jawab tunggal atas semua tindakan yang dilakukan menggunakan nomor virtual tersebut.',
      'Pengelola tidak ikut campur dan terlepas dari segala risiko jika nomor tersebut Anda gunakan untuk hal yang menyalahi aturan platform tujuan Anda.'
    ],
  },
  {
    icon: <AlertTriangle size={20} />,
    title: '8. Pembatasan Tanggung Jawab Pengelola',
    color: 'amber',
    content: [
      '8.1. Layanan RuangOTP disediakan dengan prinsip "Sebagaimana Adanya" (As-Is). Kami tidak memberikan jaminan garansi ketersediaan nomor setiap saat atau rasio keberhasilan SMS 100%.',
      '8.2. Pihak Pengelola RuangOTP dibebaskan dari segala tuntutan hukum, ganti rugi perdata, kehilangan data, atau blokir akun pihak ketiga akibat kelalaian Anda sendiri.',
      '8.3. Tanggung jawab finansial maksimal dari pihak Pengelola hanya terbatas pada jumlah saldo terakhir yang ada di dalam akun Anda saat kendala terjadi.'
    ],
  },
  {
    icon: <Wallet size={20} />,
    title: '9. Sistem Transaksi & Saldo',
    color: 'emerald',
    content: [
      'Sistem kami menggunakan metode prabayar. Saldo Anda hanya akan terpotong apabila kode SMS berhasil diterima di dashboard.',
      'Seluruh dana yang telah Anda depositkan bersifat mutlak dan tidak dapat ditarik kembali ke rekening bank (Non-Withdrawable) dengan alasan apa pun, kecuali terjadi kesalahan fatal dari sisi sistem operasional kami.'
    ],
  },
  {
    icon: <Scale size={20} />,
    title: '10. Yurisdiksi dan Kepatuhan',
    color: 'slate',
    content: [
      'Aturan ini merujuk pada ketentuan hukum yang berlaku di wilayah Republik Indonesia.',
      'Jika terjadi perselisihan atau keluhan operasional, penyelesaian secara kekeluargaan dan musyawarah akan menjadi jalan utama yang ditempuh.'
    ],
  },
  {
    icon: <XOctagon size={20} />,
    title: '11. Hak Pemblokiran Akun',
    color: 'red',
    content: [
      'Pengelola memiliki hak prerogatif penuh untuk memantau, menangguhkan, atau menghapus akun Anda secara sepihak jika terindikasi kuat melakukan pelanggaran berat, manipulasi celah sistem (bug exploitation), atau menggunakan program ilegal (scraping/flooding API).',
      'Jika akun diputus paksa karena pelanggaran, sisa saldo di dalamnya akan dihanguskan sebagai bentuk penalti.'
    ],
  },
  {
    icon: <FileBadge size={20} />,
    title: '12. Hak Kepemilikan (HAKI)',
    color: 'violet',
    content: [
      'Nama merek RuangOTP, desain logo, susunan kode sistem, dan antarmuka adalah murni hak milik Pengelola.',
      'Anda hanya diberikan hak guna terbatas untuk memanfaatkan layanan ini secara wajar tanpa izin untuk menyalin, mereplikasi, atau menjual ulang sistem kami.'
    ],
  },
  {
    icon: <Clock size={20} />,
    title: '13. Pembaruan Syarat',
    color: 'slate',
    content: [
      'Pengelola berhak memperbarui, menambah, atau merombak ketentuan ini sewaktu-waktu.',
      'Penggunaan layanan secara berkelanjutan pasca adanya pembaruan dianggap sebagai persetujuan Anda terhadap aturan baru tersebut.'
    ],
  },
  {
    icon: <FileText size={20} />,
    title: '14. Hal-Hal Umum',
    color: 'blue',
    content: [
      'Hubungan yang terjalin antara Anda dan Pengelola murni bersifat independen sebagai Penyedia dan Pengguna, bukan merupakan bentuk kemitraan usaha.',
      'Kami tidak bertanggung jawab atas gangguan berskala besar (Force Majeure) seperti matinya kabel jaringan bawah laut, kebijakan blokir massal dari provider, atau bencana alam.'
    ],
  },
  {
    icon: <Phone size={20} />,
    title: '15. Layanan Bantuan',
    color: 'blue',
    content: [
      'Jika Anda menemui kendala teknis, pertanyaan seputar aturan ini, atau indikasi error pada saldo, tim pengelola siap membantu Anda melalui:',
      '• Email Resmi: support@ruangotp.net',
      '• Telegram Admin: @cs_ruangotp'
    ],
  },
  {
    icon: <AlertTriangle size={20} />,
    title: '16. PERINGATAN PENTING',
    color: 'red',
    content: [
      '1. DILARANG KERAS menggunakan nomor ini untuk akun utama (Primary Account) yang menyimpan aset atau data berharga Anda.',
      '2. Nomor yang disediakan bersifat publik (recycle). Pihak operator dari luar negeri bisa saja menjual kembali nomor yang sudah usang tanpa sepengetahuan kami.',
      '3. Segala bentuk kerugian akibat kehilangan akses pada platform tujuan adalah risiko penuh di tangan Pengguna.',
      '4. Tetap bijak, amankan akun Anda, dan baca aturan layanan platform tujuan Anda sebelum menggunakan nomor virtual.'
    ],
  }
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
      
      {/* =========================================
          SEO METADATA UNTUK GOOGLE INDEXING
          ========================================= */}
      <Helmet>
        <title>Ketentuan Layanan - RuangOTP</title>
        <meta name="description" content="Syarat dan ketentuan penggunaan layanan RuangOTP. Harap baca dan pahami kebijakan layanan Virtual Number & OTP kami sebelum mendaftar." />
        <meta name="keywords" content="ketentuan layanan ruangotp, syarat ruangotp, kebijakan privasi ruangotp, aturan otp" />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://ruangotp.net/ketentuan" />
        
        {/* Open Graph / Media Sosial */}
        <meta property="og:title" content="Ketentuan Layanan - RuangOTP" />
        <meta property="og:description" content="Syarat dan ketentuan penggunaan layanan RuangOTP. Harap baca dan pahami kebijakan layanan Virtual Number & OTP kami sebelum mendaftar." />
        <meta property="og:url" content="https://ruangotp.net/ketentuan" />
        <meta property="og:type" content="website" />
      </Helmet>

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
              Pembaruan Terkini: 2026
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
                <div className={`transition-all duration-300 ease-in-out overflow-hidden ${isOpen ? 'max-h-[1500px] opacity-100' : 'max-h-0 opacity-0'}`}>
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

      {/* BOTTOM NAV: Hanya tampil jika user sudah login */}
      {localStorage.getItem('token') && <BottomNav />}

    </div>
  );
}
