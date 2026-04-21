import React, { useState, useRef } from 'react';
import BottomNav from '../components/BottomNav';
import { useTheme } from '../context/ThemeContext';
import { 
  ChevronLeft, Terminal, Server, 
  Globe, Code2, Copy, ExternalLink, 
  ChevronDown, ChevronUp, CheckCircle2, AlertTriangle,
  ShoppingCart, MessageSquare, XCircle, Wallet, RefreshCw, 
  Trash2, Zap, Lock, Info, Star, Play, Loader2, Wifi, LogIn
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import api from '../utils/api';

export default function Dokumentasi() {
  const { color } = useTheme();
  const navigate = useNavigate();

  const [activeVersion, setActiveVersion] = useState('v1');
  const [expandedIndex, setExpandedIndex] = useState(null);
  const [activeSubTab, setActiveSubTab] = useState(0);
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
    if (expandedIndex === index) {
      setExpandedIndex(null);
    } else {
      setExpandedIndex(index);
      setActiveSubTab(0);
    }
  };

  const handleVersionSwitch = (v) => {
    setActiveVersion(v);
    setExpandedIndex(null);
    setActiveSubTab(0);
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
  const getExecKey = (index, subTab = 0) => `${activeVersion}_${index}_${subTab}`;

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

  // ── Status badge ─────────────────────────────────────────────
  const StatusBadge = ({ status }) => {
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

  // ── Executor Panel ───────────────────────────────────────────
  const ExecutorPanel = ({ endpointData, execKey }) => {
    const exec = execStates[execKey] || {};
    const userId = getUserId();
    const isLoggedIn = !!userId;
    const queryParams = (endpointData.parameters || []).filter(p => p.type === 'query');

    return (
      <div className="mt-4 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700 overflow-hidden">
        {/* Header executor */}
        <div className="flex items-center gap-2 px-4 py-3 bg-slate-50 dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
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
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Response</span>
                  <StatusBadge status={exec.status} />
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
  // V1 DOCS
  // ================================================================
  const API_DOCS_V1 = [
    {
      title: "Daftar Layanan",
      method: "GET",
      url: "/v1/services/list",
      desc: "Mengambil daftar seluruh layanan OTP yang tersedia (WhatsApp, Telegram, DANA, dll).",
      parameters: [
        { name: "x-user-id", type: "header", required: true, desc: "ID User Anda (otomatis)" }
      ],
      codeSnippet: `axios.get('https://api.ruangotp.site/api/v1/services/list', {\n  headers: { 'x-user-id': 'YOUR_USER_ID' }\n})`,
      response: `{\n  "success": true,\n  "data": [\n    { "service_code": 13, "service_name": "WhatsApp", "category": "Social", "status": true },\n    { "service_code": 59, "service_name": "DANA", "category": "E-wallet", "status": true }\n  ]\n}`
    },
    {
      title: "Daftar Negara",
      method: "GET",
      url: "/v1/countries/list",
      desc: "Melihat negara beserta harga dan stok yang tersedia untuk layanan tertentu.",
      parameters: [
        { name: "x-user-id", type: "header", required: true, desc: "ID User Anda (otomatis)" },
        { name: "service_id", type: "query", required: true, desc: "Kode layanan (cth: 13 untuk WA)" }
      ],
      codeSnippet: `axios.get('https://api.ruangotp.site/api/v1/countries/list?service_id=13', {\n  headers: { 'x-user-id': 'YOUR_USER_ID' }\n})`,
      response: `{\n  "success": true,\n  "data": [\n    {\n      "number_id": 837,\n      "name": "Indonesia",\n      "prefix": "+62",\n      "stock_total": 3306,\n      "pricelist": [\n        { "provider_id": 3237, "server_id": 2, "stock": 7, "price": 750, "price_format": "Rp750" }\n      ]\n    }\n  ]\n}`
    },
    {
      title: "Daftar Operator",
      method: "GET",
      url: "/v1/operators/list",
      desc: "Melihat pilihan operator kartu SIM yang tersedia untuk negara tertentu.",
      parameters: [
        { name: "x-user-id", type: "header", required: true, desc: "ID User Anda (otomatis)" },
        { name: "country", type: "query", required: true, desc: "Nama negara (cth: Indonesia)" },
        { name: "provider_id", type: "query", required: true, desc: "ID Provider dari endpoint countries" }
      ],
      codeSnippet: `axios.get('https://api.ruangotp.site/api/v1/operators/list?country=Indonesia&provider_id=3237', {\n  headers: { 'x-user-id': 'YOUR_USER_ID' }\n})`,
      response: `{\n  "success": true,\n  "data": [\n    { "id": 1, "name": "any", "image": "..." },\n    { "id": 3, "name": "telkomsel", "image": "..." }\n  ]\n}`
    },
    {
      id: "transaksi_order_v1",
      title: "Transaksi Nomor (Order)",
      desc: "Menu lengkap untuk melakukan pembelian nomor, pengecekan SMS, dan pembatalan pesanan.",
      tabs: [
        {
          name: "1. Order Nomor",
          icon: <ShoppingCart size={14}/>,
          method: "GET",
          url: "/v1/orders/buy",
          desc: "Melakukan pembelian nomor virtual baru.",
          parameters: [
            { name: "x-user-id", type: "header", required: true, desc: "ID User Anda (otomatis)" },
            { name: "number_id", type: "query", required: true, desc: "ID Negara (dari endpoint Countries)" },
            { name: "provider_id", type: "query", required: true, desc: "ID Provider (dari pricelist Countries)" },
            { name: "operator_id", type: "query", required: true, desc: "ID Operator (dari endpoint Operators, atau 'any')" },
            { name: "expected_price", type: "query", required: true, desc: "Harga sesuai pricelist" }
          ],
          codeSnippet: `axios.get('https://api.ruangotp.site/api/v1/orders/buy', {\n  params: { number_id: 837, provider_id: 3237, operator_id: 'any', expected_price: 750 },\n  headers: { 'x-user-id': 'YOUR_USER_ID' }\n})`,
          response: `{\n  "success": true,\n  "message": "Pembelian berhasil",\n  "data": {\n    "order_id": "RUANGOTP405817",\n    "phone_number": "+62 857 2105 2792",\n    "price": 750,\n    "remaining_balance": 6500\n  }\n}`
        },
        {
          name: "2. Cek Status SMS",
          icon: <MessageSquare size={14}/>,
          method: "GET",
          url: "/v1/orders/check-status",
          desc: "Mengecek apakah SMS/OTP sudah masuk. Lakukan polling setiap 3-5 detik.",
          parameters: [
            { name: "x-user-id", type: "header", required: true, desc: "ID User Anda (otomatis)" },
            { name: "order_id", type: "query", required: true, desc: "ID Order (RUANGOTP...)" }
          ],
          codeSnippet: `axios.get('https://api.ruangotp.site/api/v1/orders/check-status', {\n  params: { order_id: 'RUANGOTP405817' },\n  headers: { 'x-user-id': 'YOUR_USER_ID' }\n})`,
          response: `// ACTIVE — Menunggu SMS\n{ "success": true, "data": { "order_id": "RUANGOTP405817", "status": "ACTIVE" } }\n\n// COMPLETED — Ada OTP\n{ "success": true, "data": { "order_id": "RUANGOTP405817", "status": "COMPLETED", "otp_code": "4585" } }`
        },
        {
          name: "3. Cancel Order",
          icon: <XCircle size={14}/>,
          method: "GET",
          url: "/v1/orders/cancel",
          desc: "Membatalkan pesanan dan mengembalikan saldo. Minimal 4 menit setelah order.",
          parameters: [
            { name: "x-user-id", type: "header", required: true, desc: "ID User Anda (otomatis)" },
            { name: "order_id", type: "query", required: true, desc: "ID Order yang akan dibatalkan" }
          ],
          codeSnippet: `axios.get('https://api.ruangotp.site/api/v1/orders/cancel', {\n  params: { order_id: 'RUANGOTP405817' },\n  headers: { 'x-user-id': 'YOUR_USER_ID' }\n})`,
          response: `{\n  "success": true,\n  "message": "Pesanan berhasil dibatalkan. Saldo telah dikembalikan.",\n  "data": { "order_id": "RUANGOTP405817", "refund_amount": 750, "current_balance": 7250 }\n}`
        }
      ]
    },
    {
      id: "transaksi_deposit_v1",
      title: "Transaksi Deposit",
      desc: "Kelola deposit saldo otomatis via QRIS (Server 1).",
      tabs: [
        {
          name: "1. Buat Tagihan",
          icon: <Wallet size={14}/>,
          method: "GET",
          url: "/v1/deposit/create",
          desc: "Membuat tagihan deposit QRIS. Scan QR yang dikembalikan untuk melakukan pembayaran.",
          parameters: [
            { name: "x-user-id", type: "header", required: true, desc: "ID User Anda (otomatis)" },
            { name: "amount", type: "query", required: true, desc: "Nominal deposit (Min. Rp500)" }
          ],
          codeSnippet: `axios.get('https://api.ruangotp.site/api/v1/deposit/create', {\n  params: { amount: 10000 },\n  headers: { 'x-user-id': 'YOUR_USER_ID' }\n})`,
          response: `{\n  "success": true,\n  "message": "QRIS Berhasil dibuat",\n  "data": {\n    "deposit_id": "DEP-816176",\n    "amount_received": 10000,\n    "total_pay": 10569,\n    "qr_image": "data:image/png;base64,....",\n    "expired_at": 1773668680946\n  }\n}`
        },
        {
          name: "2. Cek Status",
          icon: <RefreshCw size={14}/>,
          method: "GET",
          url: "/v1/deposit/cekstatus",
          desc: "Mengecek status pembayaran deposit.",
          parameters: [
            { name: "x-user-id", type: "header", required: true, desc: "ID User Anda (otomatis)" },
            { name: "deposit_id", type: "query", required: true, desc: "ID Deposit (DEP-...)" }
          ],
          codeSnippet: `axios.get('https://api.ruangotp.site/api/v1/deposit/cekstatus', {\n  params: { deposit_id: 'DEP-816176' },\n  headers: { 'x-user-id': 'YOUR_USER_ID' }\n})`,
          response: `{ "success": true, "data": { "deposit_id": "DEP-816176", "status": "pending" } }\n{ "success": true, "data": { "deposit_id": "DEP-816176", "status": "success" } }`
        },
        {
          name: "3. Batalkan",
          icon: <Trash2 size={14}/>,
          method: "GET",
          url: "/v1/deposit/cancel",
          desc: "Membatalkan tagihan deposit yang masih berstatus pending.",
          parameters: [
            { name: "x-user-id", type: "header", required: true, desc: "ID User Anda (otomatis)" },
            { name: "deposit_id", type: "query", required: true, desc: "ID Deposit yang akan dibatalkan" }
          ],
          codeSnippet: `axios.get('https://api.ruangotp.site/api/v1/deposit/cancel', {\n  params: { deposit_id: 'DEP-816176' },\n  headers: { 'x-user-id': 'YOUR_USER_ID' }\n})`,
          response: `{\n  "success": true,\n  "message": "Deposit berhasil dibatalkan",\n  "data": { "deposit_id": "DEP-816176", "status": "canceled" }\n}`
        }
      ]
    }
  ];

  // ================================================================
  // V2 DOCS
  // ================================================================
  const API_DOCS_V2 = [
    {
      title: "Daftar Layanan",
      method: "GET",
      url: "/v2/services/list",
      desc: "Mengambil daftar layanan yang tersedia di Server 2 RuangOTP (Mendukung layanan Global).",
      parameters: [
        { name: "x-user-id", type: "header", required: true, desc: "ID User Anda (otomatis)" }
      ],
      codeSnippet: `axios.get('https://api.ruangotp.site/api/v2/services/list', {\n  headers: { 'x-user-id': 'YOUR_USER_ID' }\n})`,
      response: `{\n  "success": true,\n  "data": [\n    { "service_code": "whatsapp", "service_name": "WhatsApp" },\n    { "service_code": "telegram", "service_name": "Telegram" }\n  ]\n}`
    },
    {
      title: "Daftar Negara & Harga",
      method: "GET",
      url: "/v2/countries/list",
      desc: "Melihat stok dan harga per layanan. Gunakan field product_code untuk melakukan order.",
      parameters: [
        { name: "x-user-id", type: "header", required: true, desc: "ID User Anda (otomatis)" },
        { name: "service_id", type: "query", required: true, desc: "Kode layanan (cth: whatsapp, telegram)" }
      ],
      codeSnippet: `axios.get('https://api.ruangotp.site/api/v2/countries/list', {\n  params: { service_id: 'whatsapp' },\n  headers: { 'x-user-id': 'YOUR_USER_ID' }\n})`,
      response: `{\n  "success": true,\n  "data": [\n    {\n      "country_id": 6,\n      "country_name": "INDONESIA",\n      "pricelist": [\n        { "server_name": "Server 1", "product_code": "RUANGOTP_6_whatsapp", "price": 1150, "stock": 312 }\n      ]\n    }\n  ]\n}`
    },
    {
      title: "Daftar Operator",
      method: "GET",
      url: "/v2/operators/list",
      desc: "Melihat operator yang tersedia untuk negara tertentu.",
      parameters: [
        { name: "x-user-id", type: "header", required: true, desc: "ID User Anda (otomatis)" },
        { name: "country_id", type: "query", required: true, desc: "ID Negara (cth: 6 untuk Indonesia)" }
      ],
      codeSnippet: `axios.get('https://api.ruangotp.site/api/v2/operators/list', {\n  params: { country_id: 6 },\n  headers: { 'x-user-id': 'YOUR_USER_ID' }\n})`,
      response: `{\n  "success": true,\n  "data": [\n    { "operator_code": "any",       "operator_name": "AUTOMATIC" },\n    { "operator_code": "telkomsel", "operator_name": "TELKOMSEL" }\n  ]\n}`
    },
    {
      id: "transaksi_order_v2",
      title: "Transaksi Nomor (Order)",
      desc: "Beli nomor, cek OTP, dan batalkan pesanan menggunakan Server 2 RuangOTP.",
      tabs: [
        {
          name: "1. Order Nomor",
          icon: <ShoppingCart size={14}/>,
          method: "GET",
          url: "/v2/orders/buy",
          desc: "Membeli nomor virtual. Gunakan product_code dari endpoint Countries.",
          parameters: [
            { name: "x-user-id", type: "header", required: true, desc: "ID User Anda (otomatis)" },
            { name: "product_code", type: "query", required: true, desc: "Kode produk (cth: RUANGOTP_6_whatsapp)" },
            { name: "operator_id", type: "query", required: true, desc: "Kode operator (cth: any, telkomsel)" },
            { name: "expected_price", type: "query", required: true, desc: "Harga sesuai pricelist" }
          ],
          codeSnippet: `axios.get('https://api.ruangotp.site/api/v2/orders/buy', {\n  params: { product_code: 'RUANGOTP_6_whatsapp', operator_id: 'any', expected_price: 1150 },\n  headers: { 'x-user-id': 'YOUR_USER_ID' }\n})`,
          response: `{\n  "success": true,\n  "message": "Order success",\n  "data": { "invoice_id": "RUANGOTP512834", "number": "+62 895 3421 8821", "price": 1150, "balance": 8850 }\n}`
        },
        {
          name: "2. Cek Status SMS",
          icon: <MessageSquare size={14}/>,
          method: "GET",
          url: "/v2/orders/check-status",
          desc: "Mengecek status OTP. Lakukan polling setiap 3-5 detik.",
          parameters: [
            { name: "x-user-id", type: "header", required: true, desc: "ID User Anda (otomatis)" },
            { name: "invoice_id", type: "query", required: true, desc: "ID Order dari endpoint buy (RUANGOTP...)" }
          ],
          codeSnippet: `axios.get('https://api.ruangotp.site/api/v2/orders/check-status', {\n  params: { invoice_id: 'RUANGOTP512834' },\n  headers: { 'x-user-id': 'YOUR_USER_ID' }\n})`,
          response: `// ACTIVE\n{ "success": true, "data": { "invoice_id": "RUANGOTP512834", "status": "ACTIVE", "otp": "WAITING" } }\n\n// COMPLETED\n{ "success": true, "data": { "invoice_id": "RUANGOTP512834", "status": "COMPLETED", "otp": "847291" } }`
        },
        {
          name: "3. Cancel Order",
          icon: <XCircle size={14}/>,
          method: "GET",
          url: "/v2/orders/cancel",
          desc: "Membatalkan pesanan dan mengembalikan saldo. Minimal 4 menit setelah order.",
          parameters: [
            { name: "x-user-id", type: "header", required: true, desc: "ID User Anda (otomatis)" },
            { name: "invoice_id", type: "query", required: true, desc: "ID Order yang akan dibatalkan" }
          ],
          codeSnippet: `axios.get('https://api.ruangotp.site/api/v2/orders/cancel', {\n  params: { invoice_id: 'RUANGOTP512834' },\n  headers: { 'x-user-id': 'YOUR_USER_ID' }\n})`,
          response: `{\n  "success": true,\n  "message": "Cancelled & Refunded",\n  "data": { "invoice_id": "RUANGOTP512834", "refund": 1150, "balance": 10000 }\n}`
        }
      ]
    },
    {
      id: "transaksi_deposit_v2",
      title: "Transaksi Deposit",
      desc: "Kelola deposit saldo otomatis via QRIS (Server 2).",
      tabs: [
        {
          name: "1. Buat Tagihan",
          icon: <Wallet size={14}/>,
          method: "GET",
          url: "/v2/deposit/create",
          desc: "Membuat tagihan deposit QRIS. Nominal sudah termasuk biaya admin.",
          parameters: [
            { name: "x-user-id", type: "header", required: true, desc: "ID User Anda (otomatis)" },
            { name: "amount", type: "query", required: true, desc: "Nominal deposit (Min. Rp500)" }
          ],
          codeSnippet: `axios.get('https://api.ruangotp.site/api/v2/deposit/create', {\n  params: { amount: 10000 },\n  headers: { 'x-user-id': 'YOUR_USER_ID' }\n})`,
          response: `{\n  "success": true,\n  "message": "Deposit Berhasil dibuat",\n  "data": {\n    "invoice_id": "DEP-523901",\n    "status": "pending",\n    "payment_method": "qris",\n    "balance_received": 10000,\n    "payment_amount": 10569,\n    "qr_image": "https://...",\n    "qr_string": "00020101...",\n    "valid_until": "2026-03-16T12:15:00.000Z"\n  }\n}`
        },
        {
          name: "2. Cek Status",
          icon: <RefreshCw size={14}/>,
          method: "GET",
          url: "/v2/deposit/cekstatus",
          desc: "Mengecek status pembayaran.",
          parameters: [
            { name: "x-user-id", type: "header", required: true, desc: "ID User Anda (otomatis)" },
            { name: "invoice_id", type: "query", required: true, desc: "ID Deposit (DEP-...)" }
          ],
          codeSnippet: `axios.get('https://api.ruangotp.site/api/v2/deposit/cekstatus', {\n  params: { invoice_id: 'DEP-523901' },\n  headers: { 'x-user-id': 'YOUR_USER_ID' }\n})`,
          response: `{ "success": true, "data": { "invoice_id": "DEP-523901", "status": "pending" } }\n{ "success": true, "data": { "invoice_id": "DEP-523901", "status": "success" } }`
        },
        {
          name: "3. Batalkan",
          icon: <Trash2 size={14}/>,
          method: "GET",
          url: "/v2/deposit/cancel",
          desc: "Membatalkan tagihan yang masih pending.",
          parameters: [
            { name: "x-user-id", type: "header", required: true, desc: "ID User Anda (otomatis)" },
            { name: "invoice_id", type: "query", required: true, desc: "ID Deposit yang akan dibatalkan" }
          ],
          codeSnippet: `axios.get('https://api.ruangotp.site/api/v2/deposit/cancel', {\n  params: { invoice_id: 'DEP-523901' },\n  headers: { 'x-user-id': 'YOUR_USER_ID' }\n})`,
          response: `{\n  "success": true,\n  "message": "Deposit berhasil dibatalkan",\n  "data": { "invoice_id": "DEP-523901", "status": "canceled" }\n}`
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

  const currentDocs = activeVersion === 'v1' ? API_DOCS_V1 : API_DOCS_V2;
  const baseUrl = activeVersion === 'v1'
    ? 'https://api.ruangotp.site/api/v1'
    : 'https://api.ruangotp.site/api/v2';

  const v1Features = ["Server: RuangOTP S1", "190+ Negara", "Parameter: order_id", "Deposit via QRIS (S1)"];
  const v2Features = ["Server: RuangOTP S2", "190+ Negara", "Parameter: invoice_id", "Deposit via QRIS (S2)"];

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
              Integrasi mudah dengan contoh kode dan executor langsung.
            </p>
          </div>
          <div className="absolute -right-6 -bottom-6 opacity-10 rotate-12">
            <Code2 size={160} />
          </div>
        </div>

        {/* VERSION SWITCHER */}
        <div className="space-y-3">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Pilih Versi API</p>
          <div className="grid grid-cols-2 gap-3">
            <button onClick={() => handleVersionSwitch('v1')} className={`relative p-4 rounded-2xl border-2 text-left transition-all duration-200 active:scale-95 ${activeVersion === 'v1' ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-slate-200 bg-white dark:bg-slate-950 dark:border-slate-800'}`}>
              {activeVersion === 'v1' && <div className="absolute top-2 right-2"><span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-500"><CheckCircle2 size={12} className="text-white" /></span></div>}
              <div className={`p-2 w-fit rounded-xl mb-2 ${activeVersion === 'v1' ? 'bg-blue-100 dark:bg-blue-900/40' : 'bg-slate-100 dark:bg-slate-900'}`}>
                <Server size={16} className={activeVersion === 'v1' ? 'text-blue-600' : 'text-slate-400'} />
              </div>
              <p className={`font-bold text-sm mb-0.5 ${activeVersion === 'v1' ? 'text-blue-700 dark:text-blue-400' : 'text-slate-700 dark:text-slate-300'}`}>API V1</p>
              <p className="text-[10px] text-slate-400 leading-relaxed">RuangOTP S1 · 190+ Negara</p>
            </button>

            <button onClick={() => handleVersionSwitch('v2')} className={`relative p-4 rounded-2xl border-2 text-left transition-all duration-200 active:scale-95 ${activeVersion === 'v2' ? 'border-violet-500 bg-violet-50 dark:bg-violet-900/20' : 'border-slate-200 bg-white dark:bg-slate-950 dark:border-slate-800'}`}>
              {activeVersion === 'v2' && <div className="absolute top-2 right-2"><span className="flex h-5 w-5 items-center justify-center rounded-full bg-violet-500"><CheckCircle2 size={12} className="text-white" /></span></div>}
              <div className={`p-2 w-fit rounded-xl mb-2 ${activeVersion === 'v2' ? 'bg-violet-100 dark:bg-violet-900/40' : 'bg-slate-100 dark:bg-slate-900'}`}>
                <Zap size={16} className={activeVersion === 'v2' ? 'text-violet-600' : 'text-slate-400'} />
              </div>
              <p className={`font-bold text-sm mb-0.5 ${activeVersion === 'v2' ? 'text-violet-700 dark:text-violet-400' : 'text-slate-700 dark:text-slate-300'}`}>API V2</p>
              <p className="text-[10px] text-slate-400 leading-relaxed">RuangOTP S2 · Global</p>
            </button>
          </div>

          {/* Info strip */}
          <div className={`p-4 rounded-2xl border text-xs leading-relaxed ${activeVersion === 'v1' ? 'bg-blue-50 border-blue-100 dark:bg-blue-900/10 dark:border-blue-900/30' : 'bg-violet-50 border-violet-100 dark:bg-violet-900/10 dark:border-violet-900/30'}`}>
            <div className="flex items-start gap-2">
              <Info size={14} className={`mt-0.5 shrink-0 ${activeVersion === 'v1' ? 'text-blue-500' : 'text-violet-500'}`} />
              <div>
                <p className={`font-bold mb-1 ${activeVersion === 'v1' ? 'text-blue-700 dark:text-blue-400' : 'text-violet-700 dark:text-violet-400'}`}>{activeVersion === 'v1' ? 'Tentang API V1' : 'Tentang API V2'}</p>
                {activeVersion === 'v1' ? (
                  <p className="text-slate-500 dark:text-slate-400">Gunakan <strong>order_id</strong> untuk semua operasi order. Parameter utama: <code className="bg-blue-100 dark:bg-blue-900/30 px-1 rounded">number_id</code>, <code className="bg-blue-100 dark:bg-blue-900/30 px-1 rounded">provider_id</code>, <code className="bg-blue-100 dark:bg-blue-900/30 px-1 rounded">operator_id</code>.</p>
                ) : (
                  <p className="text-slate-500 dark:text-slate-400">Gunakan <strong>invoice_id</strong> untuk semua operasi order. Parameter utama: <code className="bg-violet-100 dark:bg-violet-900/30 px-1 rounded">product_code</code> (format: <code className="bg-violet-100 dark:bg-violet-900/30 px-1 rounded">RUANGOTP_6_whatsapp</code>).</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* BASE URL */}
        <div className="p-4 rounded-2xl bg-white border border-slate-100 shadow-sm dark:bg-slate-950 dark:border-slate-800">
          <div className="flex items-center gap-2 mb-2">
            <Server size={14} className={activeVersion === 'v1' ? 'text-blue-500' : 'text-violet-500'} />
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Base URL</span>
            <span className={`ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full ${activeVersion === 'v1' ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/30' : 'bg-violet-50 text-violet-600 dark:bg-violet-900/30'}`}>{activeVersion.toUpperCase()}</span>
          </div>
          <div className="flex items-center justify-between gap-2 bg-slate-50 dark:bg-slate-900 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
            <code className="text-xs font-mono text-slate-600 dark:text-slate-300 truncate">{baseUrl}</code>
            <button onClick={() => handleCopy(baseUrl)} className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-400 shrink-0"><Copy size={14}/></button>
          </div>
          <div className="flex items-center gap-2 mt-3 p-3 rounded-xl bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/30">
            <Lock size={12} className="text-amber-500 shrink-0" />
            <p className="text-[10px] text-amber-700 dark:text-amber-400 leading-relaxed">Semua endpoint V1 & V2 membutuhkan <strong>Whitelist IP</strong>. Daftarkan IP server Anda di menu Profil terlebih dahulu.</p>
          </div>
        </div>

        {/* MAIN ENDPOINTS */}
        <div className="space-y-3">
          <h3 className="px-1 text-sm font-bold text-slate-400 uppercase tracking-widest">Endpoints</h3>
          
          {currentDocs.map((api, index) => {
            const isExpanded = expandedIndex === index;
            const isMulti = api.tabs && api.tabs.length > 0;
            const currentData = isMulti ? api.tabs[activeSubTab] : api;
            const execKey = getExecKey(index, isMulti ? activeSubTab : 0);

            return (
              <div key={index} className={`rounded-3xl border transition-all duration-300 ${isExpanded ? 'bg-white dark:bg-slate-950 shadow-lg' : 'bg-white dark:bg-slate-950 border-slate-100 dark:border-slate-800 shadow-sm'} ${isExpanded ? (activeVersion === 'v1' ? 'border-blue-500/30 ring-1 ring-blue-500/20' : 'border-violet-500/30 ring-1 ring-violet-500/20') : ''}`}>
                
                <button onClick={() => toggleAccordion(index)} className="w-full p-5 flex items-center justify-between outline-none group">
                  <div className="flex items-center gap-4">
                    <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${isMulti ? (activeVersion === 'v1' ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/30' : 'bg-violet-50 text-violet-600 dark:bg-violet-900/30') : 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30'}`}>
                      {isMulti ? "MULTI" : api.method}
                    </span>
                    <div className="text-left">
                      <h4 className={`font-bold text-sm transition-colors ${isExpanded ? (activeVersion === 'v1' ? 'text-blue-600 dark:text-blue-400' : 'text-violet-600 dark:text-violet-400') : 'text-slate-700 dark:text-slate-200'}`}>{api.title}</h4>
                      {!isMulti && <p className="text-[10px] text-slate-400 font-mono mt-0.5">{api.url}</p>}
                    </div>
                  </div>
                  {isExpanded ? <ChevronUp size={18} className={activeVersion === 'v1' ? 'text-blue-500' : 'text-violet-500'} /> : <ChevronDown size={18} className="text-slate-400" />}
                </button>

                <div className={`overflow-hidden transition-all duration-500 ease-in-out ${isExpanded ? 'max-h-[4000px] opacity-100' : 'max-h-0 opacity-0'}`}>
                  <div className="px-5 pb-6 space-y-5">
                    <div className="h-[1px] w-full bg-slate-100 dark:bg-slate-800"></div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{isMulti ? api.desc : currentData.desc}</p>

                    {/* Sub tabs */}
                    {isMulti && (
                      <div className="grid grid-cols-3 gap-2">
                        {api.tabs.map((tab, idx) => (
                          <button key={idx} onClick={() => setActiveSubTab(idx)} className={`flex flex-col items-center justify-center gap-1 py-3 rounded-xl border transition-all text-[10px] font-bold ${activeSubTab === idx ? (activeVersion === 'v1' ? 'bg-slate-900 text-white border-slate-900 dark:bg-white dark:text-slate-900' : 'bg-violet-600 text-white border-violet-600') : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-400'}`}>
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
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Contoh Kode (Node.js)</p>
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
                    <ExecutorPanel endpointData={currentData} execKey={execKey} />

                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* V1 vs V2 */}
        <div className="rounded-3xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-950 overflow-hidden shadow-sm">
          <div className="p-5 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <Star size={16} className="text-amber-500" />
              <h3 className="font-bold text-sm">Perbedaan V1 vs V2</h3>
            </div>
          </div>
          <div className="p-5">
            <div className="grid grid-cols-2 gap-3 text-[11px]">
              <div className="space-y-2">
                <p className="font-bold text-blue-600 dark:text-blue-400 flex items-center gap-1"><Server size={12}/> API V1</p>
                {v1Features.map((f, i) => <div key={i} className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-blue-400 shrink-0"></div><span className="text-slate-600 dark:text-slate-400">{f}</span></div>)}
              </div>
              <div className="space-y-2">
                <p className="font-bold text-violet-600 dark:text-violet-400 flex items-center gap-1"><Zap size={12}/> API V2</p>
                {v2Features.map((f, i) => <div key={i} className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-violet-400 shrink-0"></div><span className="text-slate-600 dark:text-slate-400">{f}</span></div>)}
              </div>
            </div>
            <div className="mt-4 p-3 rounded-xl bg-slate-50 dark:bg-slate-900 text-[10px] text-slate-500 dark:text-slate-400 leading-relaxed border border-slate-100 dark:border-slate-800">
              💡 <strong>Tip:</strong> V1 dan V2 sama-sama mendukung nomor dari 190+ Negara. Perbedaannya hanya terletak pada struktur parameter inti (<code>order_id</code> vs <code>invoice_id</code>) serta jalur server backend untuk kecepatan respons.
            </div>
          </div>
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
          <button onClick={() => window.open('https://t.me/cs_ruangotp', '_blank')} className={`w-full py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 ${color.btn}`}>
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
