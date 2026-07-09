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
      'Dengan mengakses, mendaftar, atau menggunakan layanan RuangOTP ("Platform", "Kami", "Layanan"), Anda ("Pengguna", "Anda") menyetujui untuk terikat dengan Syarat dan Ketentuan ("S&K") ini, Kebijakan Privasi, dan semua peraturan yang berlaku.',
      'Jika Anda bertindak atas nama suatu entitas, Anda menjamin memiliki kewenangan untuk mengikat entitas tersebut.'
    ],
  },
  {
    icon: <Info size={20} />,
    title: '2. Definisi Layanan',
    color: 'violet',
    content: [
      'RuangOTP adalah platform penyedia layanan digital Jasa OTP dan Nomor Virtual.',
      'Layanan mencakup dashboard pengelolaan, API, dan fitur pendukung lainnya untuk kebutuhan penerimaan SMS verifikasi.'
    ],
  },
  {
    icon: <UserCheck size={20} />,
    title: '3. Kelayakan Pengguna',
    color: 'emerald',
    content: [
      '3.1. Anda berusia minimal 18 tahun atau telah mencapai usia dewasa menurut yurisdiksi Anda.',
      '3.2. Anda memiliki kapasitas hukum untuk membuat perjanjian yang mengikat.',
      '3.3. Anda bukan orang atau entitas yang dilarang menerima layanan sesuai hukum yang berlaku.'
    ],
  },
  {
    icon: <CheckCircle size={20} />,
    title: '4. Penggunaan yang Diperbolehkan',
    color: 'emerald',
    content: [
      'Nomor Virtual dari RuangOTP HANYA diperbolehkan untuk:',
      '4.1. Registrasi akun media sosial, platform komunikasi, dan forum online.',
      '4.2. Pendaftaran layanan streaming, hiburan, dan game online.',
      '4.3. Verifikasi akun e-commerce, marketplace, dan platform review.',
      '4.4. Pengujian aplikasi, pengembangan perangkat lunak, dan QA.',
      '4.5. Aktivitas pemasaran, promosi, dan penelitian pasar yang sah.',
      '4.6. Pendaftaran ke layanan "non-sensitif" yang tidak mengancam keamanan jika diretas.'
    ],
  },
  {
    icon: <Ban size={20} />,
    title: '5. Penggunaan yang DILARANG KERAS',
    color: 'red',
    content: [
      'Nomor Virtual dari RuangOTP TIDAK BOLEH digunakan untuk:',
      '5.1. Layanan Keuangan: Perbankan (mobile/internet banking), fintech, e-wallet, pembayaran digital, transfer uang.',
      '5.2. Layanan Peminjaman: Fintech lending, pinjaman online, peer-to-peer lending, kartu kredit.',
      '5.3. Layanan Pemerintah: Administrasi kependudukan, pajak, kepabeanan, layanan kesehatan negara, SIM, paspor.',
      '5.4. Platform Investasi: Trading saham, forex, cryptocurrency, aset digital, crowdfunding.',
      '5.5. Layanan Sensitif: Kesehatan (rekam medis), asuransi, notaris, pengacara, layanan kurir dokumen resmi.',
      '5.6. Aktivitas Ilegal: Penipuan, pencucian uang, terorisme, perjudian ilegal, pornografi anak, perdagangan narkotika.',
      '5.7. Pelanggaran Hak: Phishing, spamming, hacking, penyebaran malware, pelanggaran hak kekayaan intelektual.',
      '5.8. Pelanggaran Kebijakan Pihak Ketiga: Aktivitas yang melanggar ToS platform lain (Google, Facebook, WhatsApp, dll.).'
    ],
  },
  {
    icon: <Database size={20} />,
    title: '6. Pengumpulan dan Pengolahan Data',
    color: 'blue',
    content: [
      '6.1. Data yang Dikumpulkan: Data Registrasi (Email, nama, kata sandi terenkripsi), Data Transaksi (Riwayat pembelian, saldo, metode pembayaran), Data Teknis (Alamat IP, jenis browser, perangkat, log akses), Data Penggunaan (Nomor Virtual yang disewa, negara tujuan, timestamp), dan Data SMS (hanya disimpan sementara untuk tujuan penampilan kepada pengguna).',
      '6.2. Tujuan Pengolahan Data: Menyediakan dan mengoperasikan Layanan, memproses transaksi, mencegah penipuan/penyalahgunaan, meningkatkan kualitas layanan, dan mematuhi kewajiban hukum.',
      '6.3. Penyimpanan dan Keamanan Data: Data disimpan di server dengan enkripsi dan proteksi keamanan. Konten SMS dihapus secara berkala. Data pribadi tidak dijual ke pihak ketiga untuk pemasaran.',
      '6.4. Berbagi Data dengan Pihak Ketiga: Hanya dengan penyedia nomor (operator global), penyedia pembayaran, otoritas hukum (jika diwajibkan), dan mitra teknis yang terikat NDA.'
    ],
  },
  {
    icon: <User size={20} />,
    title: '7. Tanggung Jawab Pengguna',
    color: 'amber',
    content: [
      '7.1. Tanggung Jawab Penuh: Pengguna bertanggung jawab penuh atas segala aktivitas yang dilakukan menggunakan Nomor Virtual yang disewa.',
      '7.2. Kepatuhan Hukum: Pengguna wajib mematuhi semua hukum dan regulasi di yurisdiksi Pengguna dan yurisdiksi dimana Nomor Virtual digunakan.',
      '7.3. Kerahasiaan: Pengguna bertanggung jawab menjaga kerahasiaan kode OTP, akses akun, dan informasi sensitif yang diterima.',
      '7.4. Akurasi Informasi: Pengguna menjamin keakuratan informasi yang diberikan saat registrasi.',
      '7.5. Pelaporan Penyalahgunaan: Pengguna wajib melaporkan dugaan penyalahgunaan atau kerentanan keamanan kepada Kami.'
    ],
  },
  {
    icon: <AlertTriangle size={20} />,
    title: '8. Pembatasan Tanggung Jawab Perusahaan',
    color: 'amber',
    content: [
      '8.1. Layanan "SEBAGAIMANA ADANYA": Layanan disediakan "sebagaimana adanya" dan "sebagaimana tersedia" tanpa jaminan apa pun, baik tersurat maupun tersirat.',
      '8.2. Tidak Ada Jaminan: Kami tidak menjamin ketersediaan, keakuratan, ketepatan waktu, atau keandalan Layanan.',
      '8.3. Penyangkalan Tanggung Jawab: RuangOTP TIDAK BERTANGGUNG JAWAB ATAS kerugian ekonomi, kehilangan data/keuntungan, aktivitas ilegal pengguna, kebocoran data akibat kelalaian pengguna, kehilangan akses akun pihak ketiga, keterlambatan pengiriman SMS, atau keakuratan informasi via SMS.',
      '8.4. Batasan Tanggung Jawab: Tanggung jawab kumulatif Kami tidak akan melebihi jumlah yang telah dibayarkan Pengguna kepada Kami dalam 6 (enam) bulan terakhir.'
    ],
  },
  {
    icon: <Wallet size={20} />,
    title: '9. Model Layanan dan Pembayaran',
    color: 'emerald',
    content: [
      '9.1. Jenis Layanan: One-Time Use (Nomor sekali pakai untuk penerimaan satu SMS OTP/Verifikasi).',
      '9.2. Pembayaran: Menggunakan sistem prabayar. Pembayaran hanya dikenakan setelah SMS berhasil diterima. Tidak ada biaya tersembunyi, semua biaya ditampilkan sebelum transaksi.',
      '9.3. Mekanisme Verifikasi: Mendukung penerimaan kode verifikasi melalui SMS teks.',
      '9.4. Pengembalian Dana (Refund): Dana yang telah didepositkan tidak dapat ditarik kembali (non-withdrawable). Refund saldo akun hanya dipertimbangkan untuk kegagalan layanan dari sisi sistem Kami. Tidak ada refund untuk pemblokiran oleh pihak ketiga atau kesalahan pengguna.'
    ],
  },
  {
    icon: <Scale size={20} />,
    title: '10. Otoritas Hukum dan Kepatuhan',
    color: 'slate',
    content: [
      '10.1. Hukum yang Berlaku: Syarat dan Ketentuan ini diatur oleh dan ditafsirkan sesuai dengan hukum Republik Indonesia.',
      '10.2. Forum Penyelesaian Sengketa: Setiap sengketa akan diselesaikan secara musyawarah.',
      '10.3. Kepatuhan Hukum Setempat: Pengguna dari luar Indonesia bertanggung jawab untuk memastikan penggunaan Layanan sesuai dengan hukum negara mereka.',
      '10.4. Permintaan Penegak Hukum: Permintaan resmi dari penegak hukum atau otoritas pemerintah yang sah akan ditanggapi sesuai dengan kebijakan dan hukum yang berlaku. Kami akan berusaha memberi pemberitahuan kepada Pengguna yang terdampak, kecuali dilarang oleh hukum.',
      '10.5. Pelaporan Aktivitas Ilegal: Kami akan bekerja sama dengan otoritas dalam investigasi aktivitas ilegal dan berhak melaporkan dugaan pelanggaran hukum.'
    ],
  },
  {
    icon: <XOctagon size={20} />,
    title: '11. Pelanggaran dan Pemutusan Layanan',
    color: 'red',
    content: [
      '11.1. Hak Pemantauan: Kami berhak memantau penggunaan untuk mendeteksi pelanggaran, penipuan, atau penyalahgunaan.',
      '11.2. Sanksi atas Pelanggaran: Jika terjadi pelanggaran, Kami dapat memberikan peringatan, membekukan sementara akun, melakukan pemotongan saldo sebagai denda, atau memutuskan akun secara permanen.',
      '11.3. Pemutusan Sepihak oleh Kami: Kami dapat menghentikan Layanan kepada Pengguna tanpa pemberitahuan jika terdeteksi pelanggaran berat (khususnya penyalahgunaan nomor untuk layanan keuangan/ilegal), terdapat aktivitas penipuan, diperintahkan otoritas, atau pengguna berusaha merusak sistem.',
      '11.4. Akibat Pemutusan: Pemutusan tidak membebaskan Pengguna dari kewajiban pembayaran. Saldo yang tersisa pada akun yang diputus karena pelanggaran TIDAK dapat dikembalikan.'
    ],
  },
  {
    icon: <FileBadge size={20} />,
    title: '12. Kekayaan Intelektual',
    color: 'violet',
    content: [
      '12.1. Seluruh hak atas Platform, logo, konten, dan teknologi RuangOTP adalah milik Kami atau pemberi lisensi Kami.',
      '12.2. Pengguna diberikan lisensi terbatas, non-eksklusif, dan tidak dapat dialihkan untuk menggunakan Layanan sesuai Syarat dan Ketentuan ini.'
    ],
  },
  {
    icon: <Clock size={20} />,
    title: '13. Perubahan Syarat dan Ketentuan',
    color: 'slate',
    content: [
      '13.1. Kami berhak mengubah, memperbarui, atau memodifikasi Syarat dan Ketentuan ini kapan saja.',
      '13.2. Perubahan akan diberitahukan melalui email terdaftar atau pemberitahuan di dalam Platform (Dashboard/Notifikasi).',
      '13.3. Perubahan akan efektif 7 (tujuh) hari setelah pemberitahuan, kecuali dinyatakan lain.',
      '13.4. Penggunaan Layanan yang berlanjut setelah perubahan efektif berarti Anda menerima perubahan tersebut.'
    ],
  },
  {
    icon: <FileText size={20} />,
    title: '14. Ketentuan Umum',
    color: 'blue',
    content: [
      '14.1. Pemisahan Klausul: Jika suatu ketentuan dinyatakan tidak sah, ketentuan lain tetap berlaku.',
      '14.2. Force Majeure: Kami tidak bertanggung jawab atas kegagalan yang disebabkan oleh keadaan di luar kendali wajar (perang, bencana alam, embargo, gangguan jaringan besar).',
      '14.3. Hubungan Para Pihak: Hubungan ini adalah sebagai penyedia layanan dan pengguna, bukan kemitraan, joint venture, atau agensi.',
      '14.4. Keutuhan Perjanjian: Syarat dan Ketentuan ini beserta Kebijakan Privasi merupakan perjanjian lengkap antara Anda dan RuangOTP.'
    ],
  },
  {
    icon: <Phone size={20} />,
    title: '15. Kontak dan Pengaduan',
    color: 'blue',
    content: [
      'Untuk pertanyaan, klarifikasi, atau pengaduan terkait Layanan maupun Syarat dan Ketentuan ini, Anda dapat menghubungi kami melalui:',
      'Email Bantuan: support@ruangotp.net',
      'Telegram Support: @cs_ruangotp',
      'Dengan mendaftar, masuk, atau menggunakan Layanan RuangOTP dalam cara apa pun, Anda menyatakan telah membaca, memahami, dan menyetujui tanpa syarat seluruh Syarat dan Ketentuan yang terkait.'
    ],
  },
  {
    icon: <AlertTriangle size={20} />,
    title: '16. Peringatan Penting',
    color: 'red',
    content: [
      '1. Layanan ini BUKAN untuk verifikasi akun sensitif yang melibatkan uang, identitas resmi, atau data kritis.',
      '2. Penggunaan untuk keperluan terlarang dapat mengakibatkan pemutusan akun TANPA refund dan berpotensi dilaporkan ke otoritas yang berwajib.',
      '3. Anda sepenuhnya bertanggung jawab atas cara Anda menggunakan Nomor Virtual yang disewa.',
      '4. Gunakan dengan bijak dan selalu patuhi hukum serta kebijakan platform pihak ketiga tujuan Anda.'
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
              Terakhir diperbarui pada 18 Februari 2026
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
