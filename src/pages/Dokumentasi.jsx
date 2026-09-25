import React, { useState, useRef } from 'react';
import BottomNav from '../components/BottomNav';
import { useTheme } from '../context/ThemeContext';
import { 
  ChevronLeft, Terminal, Server, 
  Globe, Code2, Copy, ExternalLink, 
  ChevronDown, ChevronUp, CheckCircle2, AlertTriangle,
  ShoppingCart, MessageSquare, XCircle, Wallet, RefreshCw, 
  Trash2, Send, Lock, Info, Play, Loader2, Wifi, LogIn
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import api from '../utils/api';

export default function Dokumentasi() {
  const { color } = useTheme();
  const navigate = useNavigate();

  const [expandedIndex, setExpandedIndex] = useState(null);
  
  // PERBAIKAN BUG: Gunakan object state agar tiap accordion punya memori tab masing-masing (Terisolasi)
  const [activeSubTabs, setActiveSubTabs] = useState({}); 
  const [toast, setToast] = useState({ show: false, message: '' });

  // State untuk executor: { [key]: { loading, status, latency, data, error } }
  const [execStates, setExecStates] = useState({});
  // State untuk input values: { [key]: { paramName: value } }
  const [inputValues, setInputValues] = useState({});
  // Ref untuk scroll ke response box
  const responseRefs = useRef({});

  // ── Helpers ──────────────────────────────────────────────────
  const showToast = (message) => {
    setToast({ show: true, message });
    setTimeout(() => setToast({ show: false, message: '' }), 3000);
  };

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    showToast("Berhasil disalin! 📋");
  };

  const toggleAccordion = (index) => {
    // Tidak perlu lagi mereset sub-tab di sini, biarkan user ingat posisi tab terakhirnya
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  // Auto-ambil User ID dari JWT di localStorage
  const getUserId = () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return null;
      const decoded = jwtDecode(token);
      return decoded.userId || null;
    } catch {
      return null;
    }
  };

  // Key unik per endpoint+subtab agar state tidak bentrok
  const getExecKey = (index, subTab = 0) => `api_${index}_${subTab}`;

  // Handle perubahan input
  const handleInputChange = (key, paramName, value) => {
    setInputValues(prev => ({
      ...prev,
      [key]: { ...(prev[key] || {}), [paramName]: value }
    }));
  };

  // Execute request ke API
  const handleExecute = async (endpointData, execKey) => {
    setExecStates(prev => ({ ...prev, [execKey]: { loading: true } }));

    const inputs = inputValues[execKey] || {};
    const params = {};

    // Kumpulkan semua parameter bertipe query dari inputValues
    (endpointData.parameters || []).forEach(p => {
      if (p.type === 'query') {
        params[p.name] = inputs[p.name] || '';
      }
    });

    const startTime = Date.now();
    try {
      const res = await api.get(endpointData.url, { params });
      const latency = Date.now() - startTime;

      setExecStates(prev => ({
        ...prev,
        [execKey]: {
          loading: false,
          status: res.status,
          latency,
          data: JSON.stringify(res.data, null, 2),
          error: false
        }
      }));
    } catch (err) {
      const latency = Date.now() - startTime;
      const status = err.response?.status || 0;
      const data = err.response?.data
        ? JSON.stringify(err.response.data, null, 2)
        : err.message || 'Tidak ada response dari server';

      setExecStates(prev => ({
        ...prev,
        [execKey]: {
          loading: false,
          status,
          latency,
          data,
          error: true
        }
      }));
    }

    // Scroll ke response box setelah render
    setTimeout(() => {
      responseRefs.current[execKey]?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 100);
  };

  // ── Status badge ──
  const renderStatusBadge = (status) => {
    const isOk = status >= 200 && status < 300;
    const isWarn = status >= 400 && status < 500;
    const cls = isOk
      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
      : isWarn
      ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
      : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
    return (
      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${cls}`}>
        {status || 'ERR'}
      </span>
    );
  };

  // ── Executor Panel ──
  const renderExecutorPanel = (endpointData, execKey) => {
    const exec = execStates[execKey] || {};
    const userId = getUserId();
    const isLoggedIn = !!userId;
    const queryParams = (endpointData.parameters || []).filter(p => p.type === 'query');

    return (
      <div className="mt-4 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700 overflow-hidden">
        {/* Header executor */}
        <div className="flex items-center gap-2 px-4 py-3 bg-slate-50 dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800">
          <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Coba Sekarang</span>
        </div>

        <div className="p-4 space-y-3 bg-white dark:bg-slate-950">
          {/* User ID (read-only, auto-fill dari JWT) */}
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
              x-user-id 
              {isLoggedIn ? (
                <span className="text-emerald-500 normal-case font-normal ml-1">(otomatis dari akun Anda)</span>
              ) : (
                <span className="text-red-500 normal-case font-normal ml-1">(Akses terkunci)</span>
              )}
            </label>
            <div className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border ${isLoggedIn ? 'bg-slate-50 border-slate-200 dark:bg-slate-900 dark:border-slate-700' : 'bg-red-50 border-red-100 dark:bg-red-900/10 dark:border-red-900/30'}`}>
              <Lock size={12} className={isLoggedIn ? "text-slate-400 shrink-0" : "text-red-400 shrink-0"} />
              <code className={`text-[11px] font-mono truncate flex-1 ${isLoggedIn ? 'text-slate-500 dark:text-slate-400' : 'text-red-400'}`}>
                {isLoggedIn ? userId : '•••••••••••••••• (Login Diperlukan)'}
              </code>
              {isLoggedIn && (
                <button onClick={() => handleCopy(userId)} className="text-slate-300 hover:text-slate-500 shrink-0">
                  <Copy size={11} />
                </button>
              )}
            </div>
          </div>

          {/* Query parameter inputs */}
          {queryParams.length > 0 && (
            <div className="space-y-2.5">
              {queryParams.map((param) => (
                <div key={param.name}>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1 mb-1.5">
                    <code className="text-blue-500 dark:text-blue-400 normal-case">{param.name}</code>
                    {param.required && <span className="text-red-400">*</span>}
                    <span className="font-normal text-slate-400 normal-case">— {param.desc}</span>
                  </label>
                  <input
                    type="text"
                    disabled={!isLoggedIn}
                    placeholder={isLoggedIn ? `Masukkan ${param.name}...` : 'Login untuk mengisi...'}
                    value={(inputValues[execKey] || {})[param.name] || ''}
                    onChange={(e) => handleInputChange(execKey, param.name, e.target.value)}
                    className={`w-full px-3 py-2.5 rounded-xl border text-[12px] font-mono outline-none transition-colors ${
                      isLoggedIn 
                        ? 'bg-slate-50 border-slate-200 text-slate-700 focus:border-blue-400 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-300 dark:focus:border-blue-500 placeholder:text-slate-300 dark:placeholder:text-slate-600'
                        : 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed dark:bg-slate-800 dark:border-slate-700/50'
                    }`}
                  />
                </div>
              ))}
            </div>
          )}

          {/* Execute button */}
          {!isLoggedIn ? (
            <button
              onClick={() => navigate('/login')}
              className="w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all active:scale-95 bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-600/20"
            >
              <LogIn size={15} /> Login untuk Mencoba API
            </button>
          ) : (
            <button
              onClick={() => handleExecute(endpointData, execKey)}
              disabled={exec.loading}
              className={`w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all active:scale-95 ${
                exec.loading
                  ? 'bg-slate-200 text-slate-400 dark:bg-slate-800 cursor-not-allowed'
                  : 'bg-slate-900 text-white hover:bg-black dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100'
              }`}
            >
              {exec.loading
                ? <><Loader2 size={15} className="animate-spin" /> Mengirim Request...</>
                : <><Play size={15} /> Execute</>
              }
            </button>
          )}

          {/* Response Box */}
          {!exec.loading && exec.data !== undefined && (
            <div ref={el => responseRefs.current[execKey] = el} className="space-y-2">
              {/* Meta: status + latency */}
              <div className="flex items-center justify-between mt-3">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Response</span>
                  {renderStatusBadge(exec.status)}
                </div>
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1 text-[10px] text-slate-400">
                    <Wifi size={10} /> {exec.latency}ms
                  </span>
                  <button
                    onClick={() => handleCopy(exec.data)}
                    className="text-[10px] font-bold text-blue-500 hover:underline flex items-center gap-1"
                  >
                    <Copy size={10} /> Salin
                  </button>
                </div>
              </div>

              {/* JSON output */}
              <div className={`relative rounded-xl border overflow-hidden ${exec.error ? 'border-red-200 dark:border-red-900/50' : 'border-emerald-100 dark:border-emerald-900/30'}`}>
                <div className={`absolute top-0 left-0 right-0 h-0.5 ${exec.error ? 'bg-red-400' : 'bg-emerald-400'}`}></div>
                <pre className={`p-4 pt-5 text-[10px] font-mono overflow-x-auto leading-relaxed max-h-64 overflow-y-auto ${
                  exec.error
                    ? 'bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400'
                    : 'bg-emerald-50 dark:bg-emerald-900/10 text-emerald-700 dark:text-emerald-400'
                }`}>
                  {exec.data}
                </pre>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  // ================================================================
  // SINGLE API DOCS CONFIGURATION
  // ================================================================
  const API_DOCS = [
    {
      title: "Daftar Negara",
      method: "GET",
      url: "/country-v2/list",
      desc: "Mengambil daftar seluruh negara yang tersedia pada layanan OTP.",
      parameters: [
        { name: "x-user-id", type: "header", required: true, desc: "ID User Anda (otomatis jika melalui panel, dikirim di Header)" }
      ],
      codeSnippet: `axios.get('https://api.ruangotp.net/api/country-v2/list', {\n  headers: { 'x-user-id': 'YOUR_USER_ID' }\n})`,
      response: `{\n  "success": true,\n  "data": [\n    { "id": 1, "name": "Indonesia" },\n    { "id": 2, "name": "Malaysia" }\n  ]\n}`
    },
    {
      title: "Daftar Layanan (Berdasarkan Negara)",
      method: "GET",
      url: "/services-v2/list",
      desc: "Mengambil daftar layanan OTP yang tersedia berdasarkan ID negara tertentu.",
      parameters: [
        { name: "x-user-id", type: "header", required: true, desc: "ID User Anda (dikirim di Header)" },
        { name: "country", type: "query", required: true, desc: "ID Negara (Contoh: 1 untuk Indonesia)" }
      ],
      codeSnippet: `axios.get('https://api.ruangotp.net/api/services-v2/list', {\n  params: { country: 1 },\n  headers: { 'x-user-id': 'YOUR_USER_ID' }\n})`,
      response: `{\n  "success": true,\n  "data": [\n    { "service_code": "wa", "service_name": "WhatsApp" },\n    { "service_code": "tg", "service_name": "Telegram" }\n  ]\n}`
    },
    {
      title: "Cek Harga & Provider",
      method: "GET",
      url: "/cekharga-v2/info",
      desc: "Mengecek informasi provider beserta harganya untuk layanan dan negara tertentu.",
      parameters: [
        { name: "x-user-id", type: "header", required: true, desc: "ID User Anda (dikirim di Header)" },
        { name: "service", type: "query", required: true, desc: "Kode layanan (Contoh: wa)" },
        { name: "country", type: "query", required: true, desc: "ID Negara (Contoh: 1)" }
      ],
      codeSnippet: `axios.get('https://api.ruangotp.net/api/cekharga-v2/info', {\n  params: { service: 'wa', country: 1 },\n  headers: { 'x-user-id': 'YOUR_USER_ID' }\n})`,
      response: `{\n  "success": true,\n  "data": [\n    { "provider_id": 10, "provider_name": "Server A", "price": 500, "stock": 120 },\n    { "provider_id": 12, "provider_name": "Server B", "price": 650, "stock": 45 }\n  ]\n}`
    },
    {
      id: "transaksi_order",
      title: "Transaksi Nomor (Order)",
      desc: "Lakukan pemesanan nomor virtual, cek SMS, membatalkan pesanan, atau meminta ulang OTP (resend).",
      tabs: [
        {
          name: "1. Beli Nomor",
          icon: <ShoppingCart size={14}/>,
          method: "GET",
          url: "/order-v2/buy",
          desc: "Melakukan pembelian nomor virtual baru.",
          parameters: [
            { name: "x-user-id", type: "header", required: true, desc: "ID User Anda (dikirim di Header)" },
            { name: "service", type: "query", required: true, desc: "Kode layanan (Contoh: wa)" },
            { name: "country", type: "query", required: true, desc: "ID Negara (Contoh: 1)" },
            { name: "provider_id", type: "query", required: true, desc: "ID Provider dari endpoint cekharga" },
            { name: "expected_price", type: "query", required: true, desc: "Harga sesuai yang tampil di endpoint cekharga" }
          ],
          codeSnippet: `axios.get('https://api.ruangotp.net/api/order-v2/buy', {\n  params: { service: 'wa', country: 1, provider_id: 10, expected_price: 500 },\n  headers: { 'x-user-id': 'YOUR_USER_ID' }\n})`,
          response: `{\n  "success": true,\n  "data": {\n    "order_id": "ORD-987654321",\n    "number": "+6281234567890",\n    "price": 500,\n    "balance": 14500\n  }\n}`
        },
        {
          name: "2. Cek Status",
          icon: <MessageSquare size={14}/>,
          method: "GET",
          url: "/order-v2/check-status",
          desc: "Mengecek apakah OTP sudah masuk. Sebaiknya lakukan polling per 3-5 detik.",
          parameters: [
            { name: "x-user-id", type: "header", required: true, desc: "ID User Anda (dikirim di Header)" },
            { name: "order_id", type: "query", required: true, desc: "ID Order Anda (Contoh: ORD-987654321)" }
          ],
          codeSnippet: `axios.get('https://api.ruangotp.net/api/order-v2/check-status', {\n  params: { order_id: 'ORD-987654321' },\n  headers: { 'x-user-id': 'YOUR_USER_ID' }\n})`,
          response: `{\n  "success": true,\n  "data": {\n    "order_id": "ORD-987654321",\n    "status": "COMPLETED",\n    "otp": "654321"\n  }\n}`
        },
        {
          name: "3. Resend OTP",
          icon: <Send size={14}/>,
          method: "GET",
          url: "/order-v2/resend",
          desc: "Membuka kembali pesanan untuk menerima OTP baru (resend).",
          parameters: [
            { name: "x-user-id", type: "header", required: true, desc: "ID User Anda (dikirim di Header)" },
            { name: "order_id", type: "query", required: true, desc: "ID Order Anda (Contoh: ORD-987654321)" }
          ],
          codeSnippet: `axios.get('https://api.ruangotp.net/api/order-v2/resend', {\n  params: { order_id: 'ORD-987654321' },\n  headers: { 'x-user-id': 'YOUR_USER_ID' }\n})`,
          response: `{\n  "success": true,\n  "message": "Resend berhasil diaktifkan. Silakan cek status berkala."\n}`
        },
        {
          name: "4. Cancel Order",
          icon: <XCircle size={14}/>,
          method: "GET",
          url: "/order-v2/cancel",
          desc: "Membatalkan pesanan dan mengembalikan saldo. (Biasanya terdapat limit waktu sebelum dapat dicancel).",
          parameters: [
            { name: "x-user-id", type: "header", required: true, desc: "ID User Anda (dikirim di Header)" },
            { name: "order_id", type: "query", required: true, desc: "ID Order yang akan dibatalkan (Contoh: 12345)" }
          ],
          codeSnippet: `axios.get('https://api.ruangotp.net/api/order-v2/cancel', {\n  params: { order_id: '12345' },\n  headers: { 'x-user-id': 'YOUR_USER_ID' }\n})`,
          response: `{\n  "success": true,\n  "message": "Pesanan dibatalkan",\n  "data": { "refund": 500, "balance": 15000 }\n}`
        }
      ]
    },
    {
      id: "transaksi_deposit",
      title: "Transaksi Deposit",
      desc: "Kelola pembuatan invoice deposit, cek status, dan pembatalan otomatis via QRIS.",
      tabs: [
        {
          name: "1. Buat Tagihan",
          icon: <Wallet size={14}/>,
          method: "GET",
          url: "/deposit/create",
          desc: "Membuat invoice deposit. Response akan mengembalikan QRIS image/string.",
          parameters: [
            { name: "x-user-id", type: "header", required: true, desc: "ID User Anda (dikirim di Header)" },
            { name: "amount", type: "query", required: true, desc: "Nominal deposit (Contoh: 50000)" }
          ],
          codeSnippet: `axios.get('https://api.ruangotp.net/api/deposit/create', {\n  params: { amount: 50000 },\n  headers: { 'x-user-id': 'YOUR_USER_ID' }\n})`,
          response: `{\n  "success": true,\n  "data": {\n    "deposit_id": "DEP-123456",\n    "amount": 50000,\n    "fee": 500,\n    "total": 50500,\n    "qr_url": "https://..."\n  }\n}`
        },
        {
          name: "2. Cek Status",
          icon: <RefreshCw size={14}/>,
          method: "GET",
          url: "/deposit/check-status",
          desc: "Mengecek apakah deposit sudah berhasil dibayar.",
          parameters: [
            { name: "x-user-id", type: "header", required: true, desc: "ID User Anda (dikirim di Header)" },
            { name: "deposit_id", type: "query", required: true, desc: "ID Deposit Anda (Contoh: DEP-123456)" }
          ],
          codeSnippet: `axios.get('https://api.ruangotp.net/api/deposit/check-status', {\n  params: { deposit_id: 'DEP-123456' },\n  headers: { 'x-user-id': 'YOUR_USER_ID' }\n})`,
          response: `{\n  "success": true,\n  "data": {\n    "deposit_id": "DEP-123456",\n    "status": "PAID",\n    "amount_received": 50000\n  }\n}`
        },
        {
          name: "3. Batalkan",
          icon: <Trash2 size={14}/>,
          method: "GET",
          url: "/deposit/cancel",
          desc: "Membatalkan invoice deposit yang masih pending.",
          parameters: [
            { name: "x-user-id", type: "header", required: true, desc: "ID User Anda (dikirim di Header)" },
            { name: "deposit_id", type: "query", required: true, desc: "ID Deposit yang akan dibatalkan (Contoh: DEP-123456789)" }
          ],
          codeSnippet: `axios.get('https://api.ruangotp.net/api/deposit/cancel', {\n  params: { deposit_id: 'DEP-123456789' },\n  headers: { 'x-user-id': 'YOUR_USER_ID' }\n})`,
          response: `{\n  "success": true,\n  "message": "Deposit berhasil dibatalkan"\n}`
        }
      ]
    }
  ];

  const ERROR_DOCS = [
    { title: "IP Tidak Terdaftar di Whitelist", code: 403, desc: "Terjadi jika IP server Anda belum didaftarkan di menu Profile → Whitelist IP.", response: `{ "success": false, "error": { "message": "Akses ditolak. IP Anda tidak sesuai whitelist.", "detected_ip": "48.193.47.22", "whitelisted_ip": "1.1.1.1" } }` },
    { title: "Saldo Tidak Mencukupi", code: 400, desc: "Terjadi ketika saldo akun Anda kurang dari harga layanan yang diminta.", response: `{ "success": false, "error": { "message": "Saldo tidak cukup." } }` },
    { title: "User ID Tidak Valid", code: 403, desc: "Terjadi jika header x-user-id tidak dikirim, salah, atau sudah tidak aktif.", response: `{ "success": false, "error": { "message": "User tidak ditemukan." } }` },
    { title: "Rate Limit / Terlalu Banyak Request", code: 429, desc: "Terjadi jika Anda mengirim terlalu banyak request dalam waktu singkat.", response: `{ "success": false, "error": { "message": "Terlalu banyak percobaan, silakan coba lagi nanti." } }` }
  ];

  const baseUrl = 'https://api.ruangotp.net/api';

  return (
    <div className="min-h-screen bg-slate-50 pb-28 transition-colors duration-300 dark:bg-slate-900 text-slate-800 dark:text-slate-100">
      
      {/* HEADER */}
      <div className="sticky top-0 z-30 bg-white/80 px-5 pt-8 pb-4 backdrop-blur-md border-b border-slate-100 dark:bg-slate-950/80 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/profile')} className="p-2 -ml-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
            <ChevronLeft size={24} />
          </button>
          <h1 className="text-xl font-bold">API Dev Center</h1>
        </div>
      </div>

      <div className="px-5 mt-6 space-y-6">

        {/* HERO */}
        <div className="p-6 rounded-3xl bg-slate-900 text-white shadow-xl relative overflow-hidden">
          <div className="relative z-10">
            <div className="p-3 w-fit rounded-2xl bg-white/10 backdrop-blur-md mb-4 border border-white/20">
              <Terminal size={24} className="text-blue-400" />
            </div>
            <h2 className="text-2xl font-bold mb-1">Dokumentasi API</h2>
            <p className="text-slate-400 text-sm leading-relaxed">
              Integrasikan sistem Anda dengan mudah. Gunakan header <code>x-user-id</code> pada setiap request.
            </p>
          </div>
          <div className="absolute -right-6 -bottom-6 opacity-10 rotate-12">
            <Code2 size={160} />
          </div>
        </div>

        {/* BASE URL INFO */}
        <div className="p-4 rounded-2xl bg-white border border-slate-100 shadow-sm dark:bg-slate-950 dark:border-slate-800">
          <div className="flex items-center gap-2 mb-2">
            <Server size={14} className="text-blue-500" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Base URL</span>
          </div>
          <div className="flex items-center justify-between gap-2 bg-slate-50 dark:bg-slate-900 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
            <code className="text-xs font-mono text-slate-600 dark:text-slate-300 truncate">{baseUrl}</code>
            <button onClick={() => handleCopy(baseUrl)} className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-400 shrink-0"><Copy size={14}/></button>
          </div>
          <div className="flex items-center gap-2 mt-3 p-3 rounded-xl bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/30">
            <Lock size={12} className="text-amber-500 shrink-0" />
            <p className="text-[10px] text-amber-700 dark:text-amber-400 leading-relaxed">Semua endpoint membutuhkan <strong>Whitelist IP</strong>. Daftarkan IP server Anda di menu Profil terlebih dahulu.</p>
          </div>
        </div>

        {/* MAIN ENDPOINTS */}
        <div className="space-y-3">
          <h3 className="px-1 text-sm font-bold text-slate-400 uppercase tracking-widest">Endpoints</h3>
          
          {API_DOCS.map((api, index) => {
            const isExpanded = expandedIndex === index;
            const isMulti = api.tabs && api.tabs.length > 0;
            
            // MENGAMBIL STATE TAB SECARA TERISOLASI
            const currentSubTab = activeSubTabs[index] || 0;
            // SAFETY FALLBACK: Jika tab yang diminta tidak ada, otomatis fallback ke tab index 0
            const currentData = isMulti ? (api.tabs[currentSubTab] || api.tabs[0]) : api; 
            const execKey = getExecKey(index, isMulti ? currentSubTab : 0);

            return (
              <div key={index} className={`rounded-3xl border transition-all duration-300 ${isExpanded ? 'bg-white dark:bg-slate-950 shadow-lg border-blue-500/30 ring-1 ring-blue-500/20' : 'bg-white dark:bg-slate-950 border-slate-100 dark:border-slate-800 shadow-sm'}`}>
                
                <button onClick={() => toggleAccordion(index)} className="w-full p-5 flex items-center justify-between outline-none group">
                  <div className="flex items-center gap-4">
                    <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${isMulti ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/30' : 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30'}`}>
                      {isMulti ? "MULTI" : api.method}
                    </span>
                    <div className="text-left">
                      <h4 className={`font-bold text-sm transition-colors ${isExpanded ? 'text-blue-600 dark:text-blue-400' : 'text-slate-700 dark:text-slate-200'}`}>{api.title}</h4>
                      {!isMulti && <p className="text-[10px] text-slate-400 font-mono mt-0.5">{api.url}</p>}
                    </div>
                  </div>
                  {isExpanded ? <ChevronUp size={18} className="text-blue-500" /> : <ChevronDown size={18} className="text-slate-400" />}
                </button>

                <div className={`overflow-hidden transition-all duration-500 ease-in-out ${isExpanded ? 'max-h-[4000px] opacity-100' : 'max-h-0 opacity-0'}`}>
                  <div className="px-5 pb-6 space-y-5">
                    <div className="h-[1px] w-full bg-slate-100 dark:bg-slate-800"></div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{isMulti ? api.desc : currentData.desc}</p>

                    {/* Sub tabs */}
                    {isMulti && (
                      <div className={`grid gap-2 ${api.tabs.length >= 4 ? 'grid-cols-2 sm:grid-cols-4' : 'grid-cols-3'}`}>
                        {api.tabs.map((tab, idx) => (
                          <button 
                            key={idx} 
                            // Update tab HANYA untuk accordion yang spesifik
                            onClick={() => setActiveSubTabs(prev => ({ ...prev, [index]: idx }))} 
                            className={`flex flex-col items-center justify-center gap-1 py-3 rounded-xl border transition-all text-[10px] font-bold ${currentSubTab === idx ? 'bg-slate-900 text-white border-slate-900 dark:bg-white dark:text-slate-900' : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-400'}`}
                          >
                            {tab.icon}
                            <span>{tab.name.split('. ')[1]}</span>
                          </button>
                        ))}
                      </div>
                    )}

                    {/* URL badge (multi) */}
                    {isMulti && (
                      <div className="flex items-center gap-2 text-[10px] font-mono">
                        <span className="px-2 py-1 rounded-md bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400 font-bold">{currentData.method}</span>
                        <span className="text-slate-500">{currentData.url}</span>
                      </div>
                    )}

                    {/* Parameter table */}
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Parameter</p>
                      <div className="overflow-hidden rounded-xl border border-slate-100 dark:border-slate-800">
                        <table className="w-full text-left text-xs">
                          <thead className="bg-slate-50 dark:bg-slate-900 text-slate-500 dark:text-slate-400">
                            <tr>
                              <th className="px-4 py-3 font-bold">Key</th>
                              <th className="px-4 py-3 font-bold">Lokasi</th>
                              <th className="px-4 py-3 font-bold">Keterangan</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-950">
                            {currentData.parameters?.map((param, i) => (
                              <tr key={i} className="text-slate-700 dark:text-slate-300">
                                <td className="px-4 py-3 font-mono text-blue-600 dark:text-blue-400 font-bold text-[11px]">{param.name} {param.required && <span className="text-red-500">*</span>}</td>
                                <td className="px-4 py-3"><span className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-[10px] uppercase font-bold text-slate-500">{param.type}</span></td>
                                <td className="px-4 py-3 text-[10px] leading-relaxed opacity-80">{param.desc}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Code snippet */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Contoh Kode</p>
                        <button onClick={() => handleCopy(currentData.codeSnippet)} className="text-[10px] font-bold text-blue-500 hover:underline flex items-center gap-1"><Copy size={10} /> Salin Kode</button>
                      </div>
                      <div className="relative">
                        <div className="absolute top-3 left-3 flex gap-1.5 z-10">
                          <div className="w-2.5 h-2.5 rounded-full bg-red-500"></div>
                          <div className="w-2.5 h-2.5 rounded-full bg-yellow-500"></div>
                          <div className="w-2.5 h-2.5 rounded-full bg-green-500"></div>
                        </div>
                        <pre className="p-4 pt-10 bg-slate-900 rounded-xl text-[10px] font-mono text-blue-300 overflow-x-auto border border-slate-800 shadow-lg leading-relaxed">{currentData.codeSnippet}</pre>
                      </div>
                    </div>

                    {/* Example response */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Contoh Response JSON</p>
                        <button onClick={() => handleCopy(currentData.response)} className="text-[10px] font-bold text-emerald-500 hover:underline flex items-center gap-1"><Copy size={10} /> Salin JSON</button>
                      </div>
                      <pre className="p-4 bg-slate-900 rounded-xl text-[10px] font-mono text-emerald-400 overflow-x-auto border border-slate-800 shadow-inner leading-relaxed">{currentData.response}</pre>
                    </div>

                    {/* EXECUTOR PANEL */}
                    {renderExecutorPanel(currentData, execKey)}

                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* ERROR DOCS */}
        <div className="space-y-3">
          <h3 className="px-1 text-sm font-bold text-red-500 uppercase tracking-widest flex items-center gap-2"><AlertTriangle size={16} /> Error Responses</h3>
          {ERROR_DOCS.map((err, index) => {
            const itemIndex = index + 100;
            const isExpanded = expandedIndex === itemIndex;
            return (
              <div key={itemIndex} className={`rounded-3xl border transition-all duration-300 ${isExpanded ? 'bg-white dark:bg-slate-950 border-red-500/30 shadow-lg ring-1 ring-red-500/20' : 'bg-white dark:bg-slate-950 border-slate-100 dark:border-slate-800 shadow-sm'}`}>
                <button onClick={() => toggleAccordion(itemIndex)} className="w-full p-5 flex items-center justify-between outline-none group">
                  <div className="flex items-center gap-4">
                    <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-red-50 text-red-600 dark:bg-red-900/30">{err.code}</span>
                    <h4 className={`font-bold text-sm transition-colors ${isExpanded ? 'text-red-600 dark:text-red-400' : 'text-slate-700 dark:text-slate-200'}`}>{err.title}</h4>
                  </div>
                  {isExpanded ? <ChevronUp size={18} className="text-red-500" /> : <ChevronDown size={18} className="text-slate-400" />}
                </button>
                <div className={`overflow-hidden transition-all duration-500 ease-in-out ${isExpanded ? 'max-h-[400px] opacity-100' : 'max-h-0 opacity-0'}`}>
                  <div className="px-5 pb-6 space-y-4">
                    <div className="h-[1px] w-full bg-slate-100 dark:bg-slate-800"></div>
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{err.desc}</p>
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-[10px] font-bold text-slate-400 uppercase">Response JSON</p>
                        <button onClick={() => handleCopy(err.response)} className="text-[10px] font-bold text-red-400 hover:underline flex items-center gap-1"><Copy size={10}/> Salin</button>
                      </div>
                      <pre className="p-4 bg-slate-900 rounded-xl text-[10px] font-mono text-red-400 overflow-x-auto border border-slate-800 shadow-inner leading-relaxed">{err.response}</pre>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* FOOTER */}
        <div className="rounded-3xl border border-slate-100 bg-white p-6 dark:border-slate-800 dark:bg-slate-950">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-xl bg-orange-50 text-orange-500 dark:bg-orange-900/20"><Globe size={20} /></div>
            <h3 className="font-bold">Butuh Bantuan?</h3>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed mb-4">Pastikan IP Server Anda sudah terdaftar di menu <strong>Whitelist IP</strong> sebelum melakukan request API.</p>
          <button onClick={() => window.open('https://t.me/cs_putra', '_blank')} className={`w-full py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 ${color.btn}`}>
            <ExternalLink size={14} /> Hubungi Developer CS
          </button>
        </div>

      </div>

      {/* TOAST */}
      <div className={`fixed bottom-24 left-1/2 z-[100] flex -translate-x-1/2 transform items-center gap-3 rounded-full bg-slate-900 dark:bg-white px-5 py-3 text-white dark:text-slate-900 shadow-2xl transition-all duration-300 ${toast.show ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0 pointer-events-none'}`}>
        <CheckCircle2 size={18} className="text-emerald-400 dark:text-emerald-600" />
        <span className="text-sm font-bold">{toast.message}</span>
      </div>

      {/* BOTTOM NAV: Hanya tampil jika user sudah login */}
      {localStorage.getItem('token') && <BottomNav />}

    </div>
  );
}