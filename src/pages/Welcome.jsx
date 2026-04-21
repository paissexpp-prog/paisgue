import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck, Zap, Globe, ChevronDown,
  Smartphone, CreditCard, MessageSquare, ArrowRight,
  Clock, Check, Send, Mail, Radio,
  ExternalLink, Wallet, RefreshCw, PhoneCall, PhoneOff,
  Code2
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { Helmet } from 'react-helmet-async';

// ============================================================
// DATA: Daftar aplikasi populer (CDN flaticon — sudah ada di CSP)
// ============================================================
const SUPPORTED_APPS = [
  { name: 'WhatsApp',  img: 'https://cdn-icons-png.flaticon.com/512/124/124034.png' },
  { name: 'Telegram',  img: 'https://cdn-icons-png.flaticon.com/512/2111/2111646.png' },
  { name: 'Google',    img: 'https://cdn-icons-png.flaticon.com/512/2991/2991148.png' },
  { name: 'TikTok',    img: 'https://cdn-icons-png.flaticon.com/512/3046/3046121.png' },
  { name: 'Instagram', img: 'https://cdn-icons-png.flaticon.com/512/174/174855.png' },
  { name: 'Facebook',  img: 'https://cdn-icons-png.flaticon.com/512/124/124010.png' },
  { name: 'Twitter',   img: 'https://cdn-icons-png.flaticon.com/512/5968/5968830.png' },
  { name: 'Discord',   img: 'https://cdn-icons-png.flaticon.com/512/5968/5968756.png' },
  { name: 'Shopee',    img: 'https://cdn-icons-png.flaticon.com/512/2111/2111375.png' },
  { name: 'Tokopedia', img: 'https://cdn-icons-png.flaticon.com/512/5977/5977576.png' },
  { name: 'Gojek',     img: 'https://cdn-icons-png.flaticon.com/512/5977/5977559.png' },
  { name: 'Grab',      img: 'https://cdn-icons-png.flaticon.com/512/5977/5977538.png' },
];

// ============================================================
// DATA: Fitur unggulan
// ============================================================
const FEATURES = [
  { icon: <Globe className="h-5 w-5" />,      title: 'Akses Global',      desc: 'Tersedia nomor dari 50+ negara. Indonesia, USA, UK, dan banyak lagi.',  color: 'text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-900/20' },
  { icon: <Zap className="h-5 w-5" />,        title: 'Koneksi Kilat',     desc: 'Sistem otomatis memproses SMS OTP dalam hitungan detik. Tanpa delay.',   color: 'text-amber-600 bg-amber-50 dark:text-amber-400 dark:bg-amber-900/20' },
  { icon: <ShieldCheck className="h-5 w-5" />, title: 'Privasi & Aman',   desc: 'Lindungi nomor pribadi dari spam. Gunakan nomor virtual sekali pakai.', color: 'text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-900/20' },
  { icon: <RefreshCw className="h-5 w-5" />,  title: 'Refund Otomatis',   desc: 'OTP tidak masuk? Saldo kembali 100% otomatis tanpa perlu kontak admin.',color: 'text-violet-600 bg-violet-50 dark:text-violet-400 dark:bg-violet-900/20' },
  { icon: <Wallet className="h-5 w-5" />,     title: 'Top Up Mudah',      desc: 'Isi saldo via QRIS kapanpun. Minimal deposit sangat terjangkau.',       color: 'text-rose-600 bg-rose-50 dark:text-rose-400 dark:bg-rose-900/20' },
  { icon: <Clock className="h-5 w-5" />,      title: 'Online 24 Jam',     desc: 'Layanan aktif 24/7. CS siap membantu kapanpun Anda butuh.',              color: 'text-sky-600 bg-sky-50 dark:text-sky-400 dark:bg-sky-900/20' },
];

// ============================================================
// DATA: FAQ
// ============================================================
const FAQS = [
  { q: 'Asli gak bang OTP nya?',                             a: 'Asli! Nomor yang kami sediakan adalah nomor virtual sungguhan yang bisa menerima SMS OTP dari berbagai platform. Sudah dipakai ribuan pengguna aktif setiap harinya.' },
  { q: 'Kalo top up gimana? Takut saldo gak bisa di pake.',  a: 'Top up super mudah via QRIS (scan barcode). Saldo masuk otomatis dalam hitungan detik dan langsung bisa dipakai. Kalau lebih dari 30 menit belum masuk, hubungi CS kami ya!' },
  { q: 'Saldo gak masuk padahal udah bayar, gimana?',        a: 'Langsung ajah chat kita yaa kak, sertakan bukti pembayaran atau riwayat transfer nyaa, insyaallah bakal di add kalo beneran ada bug. Admin fast response 24 jam!' },
  { q: 'OTP gak masuk, saldo kepotong gak?',                 a: 'Kalau OTP belum masuk dalam 4 menit, kamu bisa cancel order dan saldo akan otomatis kembali 100% tanpa potongan! Tidak perlu kontak admin sama sekali.' },
  { q: 'Scam gak bang?',                                     a: 'Tentu tidak! RuangOTP sudah melayani ribuan pengguna aktif dan beroperasi 24 jam non-stop. Cek review dan testimoni di channel Telegram resmi @ruangotp.' },
  { q: 'Bisa dipakai untuk aplikasi apa saja?',              a: 'RuangOTP mendukung 1000+ aplikasi dari 50+ negara termasuk WhatsApp, Telegram, Google, TikTok, Instagram, Facebook, dan masih banyak lagi.' },
];

// ============================================================
// DATA: Statistik
// ============================================================
const STATS = [
  { value: '10.000+', label: 'Pengguna Aktif' },
  { value: '1.000+',  label: 'Aplikasi Didukung' },
  { value: '50+',     label: 'Negara Tersedia' },
  { value: '99.9%',   label: 'Uptime Server' },
];

// ============================================================
// VISUAL CARDS untuk setiap step
// ============================================================
function StepVisual1() {
  return (
    <div className="relative flex items-center justify-center h-52 w-full">
      <div className="absolute inset-0 bg-blue-500/10 rounded-full blur-3xl" />
      {/* QRIS card */}
      <div className="relative z-10 w-40 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-700 p-4 flex flex-col items-center">
        <span className="text-[10px] font-black text-slate-400 tracking-widest mb-2">SCAN & PAY</span>
        <div className="grid grid-cols-5 gap-0.5 mb-2">
          {[1,1,1,1,0, 1,0,0,1,0, 1,0,1,1,1, 0,1,0,0,1, 1,1,1,0,1].map((v, i) => (
            <div key={i} className={`h-3 w-3 rounded-[2px] ${v ? 'bg-slate-800 dark:bg-slate-200' : 'bg-transparent'}`} />
          ))}
        </div>
        <span className="text-[9px] font-black tracking-[0.15em] text-slate-500">QRIS</span>
      </div>
      {/* Floating "Instan" badge */}
      <div className="absolute top-3 right-6 bg-emerald-500 text-white text-[10px] font-black px-3 py-1 rounded-full shadow-lg animate-bounce">
        ✓ Instan
      </div>
      {/* Floating Rp coin */}
      <div className="absolute bottom-6 left-6 h-11 w-11 rounded-full bg-amber-400 shadow-lg flex items-center justify-center text-white font-black text-sm">
        Rp
      </div>
    </div>
  );
}

function StepVisual2() {
  return (
    <div className="relative flex items-center justify-center h-52 w-full">
      <div className="absolute inset-0 bg-violet-500/10 rounded-full blur-3xl" />
      {/* App icons grid */}
      <div className="relative z-10 grid grid-cols-3 gap-3">
        {SUPPORTED_APPS.slice(0, 9).map((app) => (
          <div key={app.name} className="h-13 w-13 flex items-center justify-center rounded-2xl bg-white dark:bg-slate-800 shadow-lg border border-slate-100 dark:border-slate-700 p-2 hover:scale-110 transition-transform" style={{width:52,height:52}}>
            <img src={app.img} alt={app.name} className="h-full w-full object-contain" loading="lazy" />
          </div>
        ))}
      </div>
      {/* +999 badge */}
      <div className="absolute -bottom-1 right-4 bg-slate-800 dark:bg-slate-200 text-white dark:text-slate-800 text-[10px] font-black px-3 py-1 rounded-full shadow-lg">
        +999 lainnya
      </div>
    </div>
  );
}

function StepVisual3() {
  return (
    <div className="relative flex items-center justify-center h-52 w-full">
      <div className="absolute inset-0 bg-emerald-500/10 rounded-full blur-3xl" />
      {/* Phone mockup */}
      <div className="relative z-10 w-32 bg-slate-900 rounded-[1.5rem] p-2 shadow-2xl border border-slate-700">
        <div className="bg-slate-800 rounded-[1.2rem] p-3 space-y-1.5">
          <div className="flex justify-between items-center px-1 mb-1">
            <div className="h-1 w-6 bg-slate-600 rounded-full" />
            <div className="h-1 w-3 bg-slate-600 rounded-full" />
          </div>
          <div className="bg-slate-700 rounded-lg px-2 py-1.5">
            <div className="text-[9px] text-slate-300 font-mono">+62 812 ****</div>
          </div>
          <div className="grid grid-cols-3 gap-0.5">
            {['1','2','3','4','5','6','7','8','9','*','0','#'].map(k => (
              <div key={k} className="h-3.5 bg-slate-700 rounded text-[7px] text-slate-400 flex items-center justify-center font-bold">{k}</div>
            ))}
          </div>
          <div className="bg-emerald-500 rounded-lg py-1 text-center text-[9px] text-white font-black">
            Kirim OTP
          </div>
        </div>
      </div>
      {/* WA icon floating */}
      <div className="absolute top-3 right-8 w-11 h-11 rounded-2xl shadow-xl overflow-hidden border-2 border-white">
        <img src="https://cdn-icons-png.flaticon.com/512/124/124034.png" alt="WA" className="w-full h-full object-contain bg-emerald-500 p-1.5" />
      </div>
      {/* Telegram icon floating */}
      <div className="absolute bottom-4 left-4 w-9 h-9 rounded-xl shadow-xl overflow-hidden border-2 border-white">
        <img src="https://cdn-icons-png.flaticon.com/512/2111/2111646.png" alt="TG" className="w-full h-full object-contain bg-blue-500 p-1" />
      </div>
    </div>
  );
}

function StepVisual4() {
  return (
    <div className="relative flex items-center justify-center h-52 w-full">
      <div className="absolute inset-0 bg-amber-500/10 rounded-full blur-3xl" />
      {/* OTP result card */}
      <div className="relative z-10 w-48 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-700 p-4">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-7 h-7 rounded-lg overflow-hidden shadow">
            <img src="https://cdn-icons-png.flaticon.com/512/2111/2111646.png" alt="Telegram" className="w-full h-full object-contain bg-blue-500 p-1" />
          </div>
          <div>
            <p className="text-[9px] font-black text-slate-600 dark:text-slate-300">SMS dari Telegram</p>
            <p className="text-[8px] text-slate-400">Kode verifikasi Anda:</p>
          </div>
        </div>
        {/* OTP digits */}
        <div className="flex gap-1.5 justify-center my-2">
          {['8','4','7','2','9','1'].map((d, i) => (
            <div key={i} className="w-6 h-8 bg-slate-50 dark:bg-slate-700 rounded-lg flex items-center justify-center text-sm font-black text-slate-800 dark:text-white border border-slate-200 dark:border-slate-600">
              {d}
            </div>
          ))}
        </div>
        <p className="text-center text-[9px] text-slate-400 mt-1">Berlaku 5 menit</p>
      </div>
      {/* Checkmark badge */}
      <div className="absolute top-2 right-4 bg-emerald-500 text-white w-9 h-9 rounded-full flex items-center justify-center shadow-xl">
        <Check size={16} strokeWidth={3} />
      </div>
      {/* Speed badge */}
      <div className="absolute bottom-4 left-4 bg-amber-400 text-white text-[10px] font-black px-2.5 py-1 rounded-full shadow-lg">
        ⚡ 3 detik
      </div>
    </div>
  );
}

const STEPS = [
  {
    num: '01', title: 'Daftar & Isi Saldo',
    desc: 'Buat akun gratis dalam 30 detik, lalu isi saldo via QRIS dengan mudah dan instan. Saldo masuk otomatis.',
    badge: 'Mulai dari Rp 500', badgeColor: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
    cardGrad: 'from-blue-600 to-blue-800', visual: <StepVisual1 />,
  },
  {
    num: '02', title: 'Pilih Layanan & Negara',
    desc: 'Pilih aplikasi tujuan dari 1000+ layanan seperti WhatsApp, Telegram, Google, TikTok, dan pilih negara yang diinginkan.',
    badge: '1000+ Aplikasi', badgeColor: 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300',
    cardGrad: 'from-violet-600 to-purple-800', visual: <StepVisual2 />,
  },
  {
    num: '03', title: 'Daftarkan Nomor Virtual',
    desc: 'Salin nomor virtual yang kami berikan, masukkan ke aplikasi tujuan, dan minta kode OTP dikirimkan ke nomor tersebut.',
    badge: '50+ Negara', badgeColor: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
    cardGrad: 'from-emerald-600 to-teal-800', visual: <StepVisual3 />,
  },
  {
    num: '04', title: 'Terima SMS OTP Instan',
    desc: 'Kode verifikasi OTP langsung muncul di dashboard dalam hitungan detik — biasanya kurang dari 5 detik!',
    badge: '< 5 Detik', badgeColor: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
    cardGrad: 'from-amber-500 to-orange-700', visual: <StepVisual4 />,
  },
];

// ============================================================
// DATA: Nomor virtual untuk showcase
// ============================================================
const VIRTUAL_NUMBERS = [
  { flag: '🇮🇩', country: 'Indonesia', number: '+62 856-4321-0987' },
  { flag: '🇺🇸', country: 'USA',       number: '+1 470-634-8800'   },
  { flag: '🇬🇧', country: 'UK',        number: '+44 739-122-5841'  },
  { flag: '🇸🇬', country: 'Singapore', number: '+65 8123-4567'     },
  { flag: '🇲🇾', country: 'Malaysia',  number: '+60 11-2345-6789'  },
  { flag: '🇦🇺', country: 'Australia', number: '+61 412-345-678'   },
];

const PICKER_NUMBERS = [
  { flag: '🇫🇷', number: '+33 1 84 80 08 00' },
  { flag: '🇺🇸', number: '+1 470 634 8800',   active: true },
  { flag: '🇪🇸', number: '+34 910 38 22 49'   },
];

// ============================================================
// MAIN COMPONENT
// ============================================================
export default function Welcome() {
  const { color } = useTheme();
  const [openFaq, setOpenFaq] = useState(null);

  return (
    <div className="flex min-h-screen flex-col bg-white text-slate-900 transition-colors duration-300 dark:bg-slate-950 dark:text-slate-100">
      <Helmet>
        <title>RuangOTP - Layanan OTP Tercepat & Termurah di Indonesia</title>
        <meta name="description" content="RuangOTP adalah layanan penyedia kode OTP nomor 1 di Indonesia. Verifikasi akun WA, Telegram, Google dengan cepat, otomatis 24 jam, dan harga termurah. Daftar gratis sekarang!" />
        <meta name="keywords" content="RuangOTP, ruangotp, ruang otp, ruang-otp, jasa otp, beli otp, otp murah, layanan otp indonesia, verifikasi otp, nomor virtual indonesia, beli nomor otp, otp whatsapp murah, verifikasi telegram, otp google, nomor virtual sekali pakai, sms verification indonesia, otp bypass, sms otp service, virtual number indonesia" />
        <link rel="canonical" href="https://ruangotp.site/" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://ruangotp.site/" />
        <meta property="og:site_name" content="RuangOTP" />
        <meta property="og:title" content="RuangOTP - Layanan OTP Tercepat & Termurah di Indonesia" />
        <meta property="og:description" content="RuangOTP adalah layanan penyedia kode OTP nomor 1 di Indonesia. Verifikasi akun WA, Telegram, Google dengan cepat, otomatis 24 jam, dan harga termurah." />
        <meta property="og:image" content="https://cdn.nekohime.site/file/HsGrgzQf.jpeg" />
        <meta property="og:locale" content="id_ID" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@ruangotp" />
        <meta name="twitter:title" content="RuangOTP - Layanan OTP Tercepat & Termurah" />
        <meta name="twitter:description" content="RuangOTP - Layanan OTP otomatis, termurah, dan tercepat di Indonesia. Online 24 jam." />
        <meta name="twitter:image" content="https://cdn.nekohime.site/file/HsGrgzQf.jpeg" />
        <meta name="robots" content="index, follow" />
        <meta name="language" content="Indonesian" />
        <meta name="author" content="RuangOTP" />
        <meta name="copyright" content="RuangOTP" />
        <html lang="id" />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@graph": [
              { "@type": "WebSite", "@id": "https://ruangotp.site/#website", "url": "https://ruangotp.site/", "name": "RuangOTP", "description": "Layanan OTP Tercepat & Termurah di Indonesia", "inLanguage": "id-ID", "potentialAction": { "@type": "SearchAction", "target": "https://ruangotp.site/?s={search_term_string}", "query-input": "required name=search_term_string" } },
              { "@type": "Organization", "@id": "https://ruangotp.site/#organization", "name": "RuangOTP", "alternateName": ["Ruang OTP", "ruangotp", "RuangOTP.site"], "url": "https://ruangotp.site/", "logo": { "@type": "ImageObject", "url": "https://cdn.nekohime.site/file/HsGrgzQf.jpeg" }, "contactPoint": { "@type": "ContactPoint", "contactType": "customer service", "url": "https://t.me/cs_ruangotp", "availableLanguage": "Indonesian" }, "sameAs": ["https://t.me/ruangotp", "https://t.me/cs_ruangotp"] },
              { "@type": "WebPage", "@id": "https://ruangotp.site/#webpage", "url": "https://ruangotp.site/", "name": "RuangOTP - Layanan OTP Tercepat & Termurah di Indonesia", "isPartOf": { "@id": "https://ruangotp.site/#website" }, "about": { "@id": "https://ruangotp.site/#organization" }, "description": "RuangOTP adalah layanan penyedia kode OTP nomor 1 di Indonesia.", "inLanguage": "id-ID" }
            ]
          })}
        </script>
      </Helmet>

      {/* ============================================================
          HERO
          ============================================================ */}
      <div className="relative isolate overflow-hidden pt-14">
        <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80" aria-hidden="true">
          <div className={`relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr ${color.gradient} opacity-20 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]`} />
        </div>

        <div className="mx-auto max-w-6xl px-6 py-20 lg:px-8 lg:py-28">
          <div className="mx-auto max-w-3xl text-center">
            {/* Live badge */}
            <div className={`mb-6 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-semibold ring-1 ring-inset ${color.bg} ${color.text} ${color.border}`}>
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-current opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-current" />
              </span>
              🚀 Platform OTP #1 di Indonesia
            </div>

            <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-6xl leading-tight">
              Verifikasi Akun Digital{' '}
              <span className={`bg-gradient-to-r ${color.gradient} bg-clip-text text-transparent`}>
                Tanpa Batas
              </span>
            </h1>

            <p className="mt-6 text-lg leading-8 text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              Nomor virtual murah dan berkualitas untuk ribuan aplikasi dari seluruh negara. OTP instan untuk WhatsApp, Telegram, Google, TikTok, dan 1000+ layanan lainnya. Privasi terjaga, harga termurah, aktif 24 jam.
            </p>

            {/* CTA */}
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/register" className={`inline-flex items-center gap-2 rounded-xl px-8 py-4 text-base font-bold shadow-lg transition-all hover:scale-105 active:scale-95 ${color.btn}`}>
                Mulai Sekarang — Gratis <ArrowRight size={18} />
              </Link>
              {/* ── DIUBAH: Masuk Member → API DOCS → /api/dev ── */}
              <Link to="/api/dev" className="inline-flex items-center gap-2 rounded-xl bg-violet-600 hover:bg-violet-700 px-8 py-4 text-base font-semibold text-white shadow-sm transition-all hover:scale-105 active:scale-95">
                <Code2 size={18} /> API DOCS
              </Link>
            </div>

            {/* Trust signals */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-slate-500 dark:text-slate-400">
              {['Gratis daftar', 'Refund otomatis', 'Online 24 jam', 'CS fast response'].map(t => (
                <span key={t} className="flex items-center gap-1.5">
                  <Check size={15} className="text-emerald-500" /> {t}
                </span>
              ))}
            </div>
          </div>

          {/* ============================================================
              VIRTUAL NUMBERS SHOWCASE (pengganti APP LOGOS STRIP)
              ============================================================ */}
          <div className="mt-16">
            <p className="text-center text-xs font-semibold uppercase tracking-widest text-slate-400 mb-10">
              Nomor Virtual dari 50+ Negara Seluruh Dunia
            </p>

            {/* Container relatif untuk posisikan elemen floating */}
            <div className="relative mx-auto flex items-center justify-center" style={{ minHeight: 380 }}>

              {/* ── FLOATING CARD KIRI: Pilihan Nomor ── */}
              <div className="absolute left-0 top-8 z-20 hidden md:block w-48 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-800 p-3 animate-in fade-in slide-in-from-left-4 duration-500">
                <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-2 px-1">Pilih Negara</p>
                <div className="space-y-1.5">
                  {PICKER_NUMBERS.map((item, i) => (
                    <div
                      key={i}
                      className={`flex items-center gap-2 rounded-xl px-2.5 py-2 transition-colors ${
                        item.active
                          ? `${color.bg} border ${color.border}`
                          : 'hover:bg-slate-50 dark:hover:bg-slate-800'
                      }`}
                    >
                      {/* Radio dot */}
                      <div className={`w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                        item.active ? `border-current ${color.text}` : 'border-slate-300 dark:border-slate-600'
                      }`}>
                        {item.active && <div className={`w-1.5 h-1.5 rounded-full ${color.btn.split(' ')[0].replace('bg-', 'bg-')}`} />}
                      </div>
                      <span className="text-base leading-none">{item.flag}</span>
                      <span className={`text-[10px] font-mono font-bold truncate ${item.active ? color.text : 'text-slate-600 dark:text-slate-300'}`}>
                        {item.number}
                      </span>
                    </div>
                  ))}
                </div>
                <button className={`mt-3 w-full rounded-xl py-2 text-[10px] font-black text-white shadow-md transition-all active:scale-95 ${color.btn}`}>
                  + Tambah Nomor
                </button>
              </div>

              {/* ── PHONE MOCKUP UTAMA ── */}
              <div className="relative z-10 mx-auto">
                {/* Frame luar HP */}
                <div className="relative w-52 bg-slate-900 rounded-[2.8rem] p-[5px] shadow-2xl border-[3px] border-slate-700">
                  {/* Notch */}
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-20 h-6 bg-slate-900 rounded-b-2xl z-20 flex items-end justify-center pb-1">
                    <div className="w-8 h-1 bg-slate-700 rounded-full" />
                  </div>

                  {/* Layar */}
                  <div className="bg-slate-950 rounded-[2.4rem] overflow-hidden">
                    {/* Status bar */}
                    <div className="flex justify-between items-center px-5 pt-7 pb-1">
                      <span className="text-[8px] font-bold text-slate-400">9:41</span>
                      <span className="text-[8px] text-slate-500">▲ ● ■</span>
                    </div>

                    {/* Header screen */}
                    <div className="px-4 pt-1 pb-2 border-b border-slate-800">
                      <p className="text-center text-[11px] font-black text-white tracking-wide">Nomor Virtual</p>
                    </div>

                    {/* Daftar nomor */}
                    <div className="px-3 py-2 space-y-2">
                      {VIRTUAL_NUMBERS.map((item, i) => (
                        <div
                          key={i}
                          className={`flex items-center gap-2.5 rounded-xl px-3 py-2.5 transition-all ${
                            i === 0
                              ? `${color.bg} border ${color.border}`
                              : 'bg-slate-800/60'
                          }`}
                        >
                          <span className="text-base leading-none shrink-0">{item.flag}</span>
                          <div className="min-w-0 flex-1">
                            <p className={`text-[8px] font-bold leading-none mb-0.5 ${i === 0 ? color.text : 'text-slate-400'}`}>
                              {item.country}
                            </p>
                            <p className={`text-[9px] font-mono font-bold truncate ${i === 0 ? 'text-white' : 'text-slate-300'}`}>
                              {item.number}
                            </p>
                          </div>
                          {i === 0 && (
                            <div className={`w-2 h-2 rounded-full shrink-0 animate-pulse ${color.btn.split(' ')[0]}`} />
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Bottom pill */}
                    <div className="px-4 py-3 flex justify-center">
                      <div className={`flex items-center gap-1.5 rounded-full px-4 py-1.5 text-[9px] font-black text-white ${color.btn.split(' ')[0]}`}>
                        + Tambah Nomor
                      </div>
                    </div>

                    {/* Home indicator */}
                    <div className="flex justify-center pb-3">
                      <div className="w-16 h-1 bg-slate-700 rounded-full" />
                    </div>
                  </div>
                </div>

                {/* Glowing shadow bawah */}
                <div className={`absolute -bottom-4 left-1/2 -translate-x-1/2 w-32 h-6 blur-xl opacity-40 rounded-full ${color.btn.split(' ')[0]}`} />
              </div>

              {/* ── FLOATING CARD KANAN: Incoming Call ── */}
              <div className="absolute right-0 top-6 z-20 hidden md:flex items-center gap-3 bg-slate-900 dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-700 px-4 py-3 animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="text-center">
                  <p className="text-[8px] font-bold text-slate-400 mb-0.5">Panggilan Masuk</p>
                  <p className="text-[11px] font-black font-mono text-white">+1 234-567-890</p>
                </div>
                <div className="flex gap-2">
                  <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/30">
                    <PhoneCall size={14} className="text-white" />
                  </div>
                  <div className="w-8 h-8 rounded-full bg-red-500 flex items-center justify-center shadow-lg shadow-red-500/30">
                    <PhoneOff size={14} className="text-white" />
                  </div>
                </div>
              </div>

              {/* ── FLOATING BADGE BAWAH KIRI: Country count ── */}
              <div className={`absolute bottom-4 left-4 hidden md:flex items-center gap-2 rounded-2xl px-3 py-2 shadow-xl border ${color.bg} ${color.border} animate-in fade-in slide-in-from-bottom-4 duration-500`}>
                <Globe size={14} className={color.text} />
                <span className={`text-[10px] font-black ${color.text}`}>50+ Negara</span>
              </div>

              {/* ── FLOATING BADGE BAWAH KANAN: OTP speed ── */}
              <div className="absolute bottom-4 right-4 hidden md:flex items-center gap-2 rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 px-3 py-2 shadow-xl animate-in fade-in slide-in-from-bottom-4 duration-500">
                <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400">⚡ OTP &lt; 5 detik</span>
              </div>

            </div>
          </div>
          {/* ── END VIRTUAL NUMBERS SHOWCASE ── */}

        </div>

        <div className="absolute inset-x-0 top-[calc(100%-13rem)] -z-10 transform-gpu overflow-hidden blur-3xl sm:top-[calc(100%-30rem)]" aria-hidden="true">
          <div className={`relative left-[calc(50%+3rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 bg-gradient-to-tr ${color.gradient} opacity-20 sm:left-[calc(50%+36rem)] sm:w-[72.1875rem]`} />
        </div>
      </div>

      {/* ============================================================
          STATS BAR
          ============================================================ */}
      <div className="border-y border-slate-100 bg-slate-50 dark:border-slate-800 dark:bg-slate-900/50">
        <div className="mx-auto max-w-6xl px-6 py-12 lg:px-8">
          <div className="grid grid-cols-2 gap-8 lg:grid-cols-4">
            {STATS.map((stat, i) => (
              <div key={i} className="text-center">
                <p className={`text-3xl font-extrabold tracking-tight ${color.text}`}>{stat.value}</p>
                <p className="mt-1 text-sm font-medium text-slate-500 dark:text-slate-400">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ============================================================
          CARA KERJA — Alternating layout dengan visual card
          ============================================================ */}
      <div className="mx-auto w-full max-w-6xl px-6 py-24 lg:px-8">
        <div className="mx-auto max-w-2xl text-center mb-16">
          <div className={`mb-3 inline-block rounded-full px-3 py-1 text-xs font-bold uppercase tracking-widest ${color.bg} ${color.text}`}>
            Cara Kerja
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
            4 Langkah Mudah Dapat OTP
          </h2>
          <p className="mt-4 text-base text-slate-500 dark:text-slate-400">
            Proses verifikasi semudah 1-2-3, tidak butuh keahlian teknis apapun.
          </p>
        </div>

        <div className="space-y-16">
          {STEPS.map((step, index) => {
            const isEven = index % 2 === 1;
            return (
              <div
                key={index}
                className={`flex flex-col gap-8 lg:gap-16 lg:items-center ${isEven ? 'lg:flex-row-reverse' : 'lg:flex-row'}`}
              >
                {/* Visual Card */}
                <div className={`relative flex-1 overflow-hidden rounded-3xl bg-gradient-to-br ${step.cardGrad} p-8 shadow-xl min-h-[240px] flex items-center justify-center`}>
                  {/* Big decorative number */}
                  <span className="absolute -right-3 -top-3 text-[9rem] font-black text-white/10 leading-none select-none pointer-events-none">
                    {step.num}
                  </span>
                  <div className="relative z-10 w-full">
                    {step.visual}
                  </div>
                </div>

                {/* Text */}
                <div className="flex-1 flex flex-col justify-center">
                  <div className="flex items-center gap-3 mb-4">
                    <span className={`inline-flex h-8 w-8 items-center justify-center rounded-full text-sm font-black text-white shadow ${color.btn.split(' ')[0]}`}>
                      {index + 1}
                    </span>
                    <span className={`text-xs font-bold px-3 py-1 rounded-full ${step.badgeColor}`}>
                      {step.badge}
                    </span>
                  </div>
                  <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white mb-3">
                    {step.title}
                  </h3>
                  <p className="text-base leading-relaxed text-slate-500 dark:text-slate-400">
                    {step.desc}
                  </p>
                  {index < STEPS.length - 1 && (
                    <div className="mt-6 flex items-center gap-2 text-sm font-semibold text-slate-400">
                      <span>Langkah selanjutnya</span>
                      <ArrowRight size={16} />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ============================================================
          FITUR UNGGULAN
          ============================================================ */}
      <div className="bg-slate-50 dark:bg-slate-900/50">
        <div className="mx-auto max-w-6xl px-6 py-24 lg:px-8">
          <div className="mx-auto max-w-2xl text-center mb-16">
            <div className={`mb-3 inline-block rounded-full px-3 py-1 text-xs font-bold uppercase tracking-widest ${color.bg} ${color.text}`}>
              Kenapa Kami?
            </div>
            <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
              Segala yang Anda butuhkan untuk verifikasi
            </h2>
          </div>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((feat, i) => (
              <div key={i} className="flex items-start gap-4 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all dark:border-slate-800 dark:bg-slate-950">
                <div className={`shrink-0 flex h-10 w-10 items-center justify-center rounded-xl ${feat.color}`}>
                  {feat.icon}
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 dark:text-white mb-1">{feat.title}</h3>
                  <p className="text-sm leading-relaxed text-slate-500 dark:text-slate-400">{feat.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ============================================================
          FAQ
          ============================================================ */}
      <div className="mx-auto max-w-6xl px-6 py-24 lg:px-8">
        <div className="mx-auto max-w-2xl text-center mb-12">
          <div className={`mb-3 inline-block rounded-full px-3 py-1 text-xs font-bold uppercase tracking-widest ${color.bg} ${color.text}`}>
            FAQ
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
            Pertanyaan yang{' '}
            <span className={`bg-gradient-to-r ${color.gradient} bg-clip-text text-transparent`}>
              Sering Ditanyakan
            </span>
          </h2>
          <p className="mt-4 text-base text-slate-500 dark:text-slate-400">
            Beberapa pertanyaan yang sering ditanyakan oleh pengguna baru.
          </p>
        </div>
        <div className="mx-auto max-w-3xl space-y-3">
          {FAQS.map((faq, i) => (
            <div key={i} className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="flex w-full items-center justify-between px-6 py-4 text-left transition-colors hover:bg-slate-50 dark:hover:bg-slate-900"
              >
                <span className="font-semibold text-slate-800 dark:text-white pr-4">{faq.q}</span>
                <span className={`shrink-0 transition-transform duration-300 ${openFaq === i ? 'rotate-180' : ''} ${color.text}`}>
                  <ChevronDown size={20} />
                </span>
              </button>
              {openFaq === i && (
                <div className="border-t border-slate-100 bg-slate-50/50 px-6 py-4 dark:border-slate-800 dark:bg-slate-900/50">
                  <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400">{faq.a}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ============================================================
          CTA BANNER
          ============================================================ */}
      <div className="mx-6 mb-16 overflow-hidden rounded-3xl lg:mx-8">
        <div className={`relative bg-gradient-to-br ${color.gradient} px-8 py-16 text-center text-white lg:px-16`}>
          <div className="absolute -left-10 -top-10 h-48 w-48 rounded-full bg-white/10 blur-2xl" />
          <div className="absolute -bottom-10 -right-10 h-48 w-48 rounded-full bg-white/10 blur-2xl" />
          <div className="relative z-10">
            <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">Siap dapat layanan?</h2>
            <p className="mx-auto mt-4 max-w-xl text-base text-white/90">
              Terima OTP nomor virtual murah Anda sekarang juga. Daftar gratis dan mulai verifikasi dalam hitungan menit!
            </p>
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/register" className="inline-flex items-center gap-2 rounded-xl bg-white px-8 py-4 text-base font-bold shadow-lg transition-all hover:scale-105 active:scale-95 text-slate-900">
                Get Started — Gratis <ArrowRight size={18} />
              </Link>
              <a href="https://t.me/cs_ruangotp" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-xl border-2 border-white/30 px-8 py-4 text-base font-bold text-white transition-all hover:bg-white/10 hover:scale-105 active:scale-95">
                <Send size={18} /> Hubungi CS
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================
          CONTACT SECTION
          ============================================================ */}
      <div className="bg-slate-50 dark:bg-slate-900/50">
        <div className="mx-auto max-w-6xl px-6 py-16 lg:px-8">
          <div className="mx-auto max-w-2xl text-center mb-10">
            <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">
              Let&apos;s work{' '}
              <span className={`bg-gradient-to-r ${color.gradient} bg-clip-text text-transparent`}>together</span>
            </h2>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Punya pertanyaan atau aduan? Hubungi kami kapanpun.</p>
          </div>
          <div className="mx-auto max-w-xl grid grid-cols-1 gap-4 sm:grid-cols-2">
            {[
              { href: 'https://t.me/cs_ruangotp', icon: <Send size={20}/>, label: 'CS Telegram', sub: '@cs_ruangotp', color: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' },
              { href: 'mailto:ruangotp@site', icon: <Mail size={20}/>, label: 'Email Support', sub: 'ruangotp@site', color: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' },
              { href: 'https://t.me/ruangotp', icon: <Radio size={20}/>, label: 'Channel Telegram', sub: '@ruangotp', color: 'bg-sky-100 text-sky-600 dark:bg-sky-900/30 dark:text-sky-400' },
              { href: 'https://whatsapp.com/channel/0029VbCNWVk84OmIdF16fK2z', icon: <MessageSquare size={20}/>, label: 'Saluran WhatsApp', sub: 'Berita Resmi', color: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400' },
            ].map((c) => (
              <a key={c.label} href={c.href} target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5 dark:border-slate-800 dark:bg-slate-950">
                <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${c.color}`}>{c.icon}</div>
                <div>
                  <p className="font-bold text-slate-800 dark:text-white text-sm">{c.label}</p>
                  <p className="text-xs text-slate-400">{c.sub}</p>
                </div>
                <ExternalLink size={14} className="ml-auto text-slate-300 dark:text-slate-600" />
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* ============================================================
          FOOTER
          ============================================================ */}
      <footer className="border-t border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
        <div className="mx-auto max-w-6xl px-6 py-12 lg:px-8">
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-4">
            <div className="lg:col-span-1">
              <div className="flex items-center gap-3 mb-4">
                <img src="https://cdn.nekohime.site/file/HsGrgzQf.jpeg" alt="RuangOTP Logo" className="h-9 w-9 rounded-full object-cover border border-slate-200 dark:border-slate-700" />
                <span className="text-lg font-bold text-slate-900 dark:text-white">RuangOTP</span>
              </div>
              <p className="text-sm leading-relaxed text-slate-500 dark:text-slate-400">
                Nomor virtual murah dan berkualitas untuk ribuan aplikasi dari seluruh negara. Mulai dari Rp 500.
              </p>
              <div className="mt-5 flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                </span>
                <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">Sistem Online 24/7</span>
              </div>
            </div>
            <div>
              <h4 className="mb-4 text-xs font-black uppercase tracking-widest text-slate-400">Company</h4>
              <ul className="space-y-3">
                <li><Link to="/ketentuan" className="text-sm text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors">Ketentuan Layanan</Link></li>
                <li><a href="https://t.me/cs_ruangotp" target="_blank" rel="noreferrer" className="text-sm text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors">Tentang Kami</a></li>
                <li><a href="https://t.me/cs_ruangotp" target="_blank" rel="noreferrer" className="text-sm text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors">Privacy Policy</a></li>
              </ul>
            </div>
            <div>
              <h4 className="mb-4 text-xs font-black uppercase tracking-widest text-slate-400">Docs</h4>
              <ul className="space-y-3">
                <li><Link to="/register" className="text-sm text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors">Get Started</Link></li>
                <li><Link to="/api/dev" className="text-sm text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors">Dokumentasi API</Link></li>
                <li><Link to="/order" className="text-sm text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors">Pricelist</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="mb-4 text-xs font-black uppercase tracking-widest text-slate-400">Contacts Us</h4>
              <ul className="space-y-3">
                <li><a href="https://t.me/cs_ruangotp" target="_blank" rel="noreferrer" className="text-sm text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors">Telegram CS</a></li>
                <li><a href="mailto:ruangotp@site" className="text-sm text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors">Email</a></li>
              </ul>
              <h4 className="mt-6 mb-4 text-xs font-black uppercase tracking-widest text-slate-400">Channel</h4>
              <ul className="space-y-3">
                <li><a href="https://t.me/ruangotp" target="_blank" rel="noreferrer" className="text-sm text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors">Telegram</a></li>
                <li><a href="https://whatsapp.com/channel/0029VbCNWVk84OmIdF16fK2z" target="_blank" rel="noreferrer" className="text-sm text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors">WhatsApp</a></li>
              </ul>
            </div>
          </div>
          <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-slate-100 pt-8 sm:flex-row dark:border-slate-800">
            <p className="text-xs text-slate-400">&copy; 2026 RuangOTP. All rights reserved.</p>
            <p className="text-xs text-slate-400">Made with ❤️ for Privacy</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
