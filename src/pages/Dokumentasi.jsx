import React, { useState } from 'react';
import BottomNav from '../components/BottomNav';
import { useTheme } from '../context/ThemeContext';
import { 
  ChevronLeft, Terminal, Server, ShieldCheck, 
  Key, Globe, Code2, Copy, ExternalLink, 
  ChevronDown, ChevronUp, CheckCircle2, AlertTriangle,
  ShoppingCart, MessageSquare, XCircle, Wallet, RefreshCw, Trash2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Dokumentasi() {
  const { color } = useTheme();
  const navigate = useNavigate();

  // State Accordion Utama
  const [expandedIndex, setExpandedIndex] = useState(null);
  
  // State Sub-Tab (Reusable untuk Order & Deposit)
  const [activeSubTab, setActiveSubTab] = useState(0);
  
  // State Toast
  const [toast, setToast] = useState({ show: false, message: '' });

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
        // Reset tab ke 0 setiap kali buka menu baru
        setActiveSubTab(0); 
    }
  };

  // DATA DOKUMENTASI
  const API_DOCS = [
    {
        title: "Daftar Layanan",
        method: "GET",
        url: "/services/list",
        desc: "Mengambil daftar seluruh layanan yang tersedia (WhatsApp, Telegram, dll).",
        headers: "x-user-id: [User_ID_Anda]",
        params: "-",
        response: `{
  "success": true,
  "data": [
    { "service_code": 13, "service_name": "WhatsApp", "category": "Social", "status": true },
    { "service_code": 5, "service_name": "Telegram", "category": "Social", "status": true },
    { "service_code": 59, "service_name": "DANA", "category": "E-wallet", "status": true }
  ]
}`
    },
    {
        title: "Daftar Negara",
        method: "GET",
        url: "/countries/list",
        desc: "Melihat negara, stok, dan harga per server untuk layanan tertentu.",
        headers: "x-user-id: [User_ID_Anda]",
        params: "Query: service_id (contoh: 13)",
        response: `{
  "success": true,
  "data": [
    {
      "number_id": 837,
      "name": "Indonesia",
      "prefix": "+62",
      "iso_code": "id",
      "stock_total": 3306,
      "pricelist": [
        { "provider_id": 3237, "server_id": 2, "stock": 7, "price": 750, "price_format": "Rp750", "available": true }
      ]
    }
  ]
}`
    },
    {
        title: "Cek Operator",
        method: "GET",
        url: "/operators/list",
        desc: "Melihat operator yang tersedia untuk filter pesanan.",
        headers: "x-user-id: [User_ID_Anda]",
        params: "Query: country, provider_id",
        response: `{
  "success": true,
  "data": [
    { "id": 1, "name": "any", "image": "https://ruangotp.site/file/3Q_M1nug.jpeg" },
    { "id": 2, "name": "indosat", "image": "https://www.imei.info/media/op/im3_.jpg" },
    { "id": 3, "name": "telkomsel", "image": "https://www.imei.info/media/op/telkomsel.jpg" }
  ]
}`
    },
    
    // --- TRANSAKSI NOMOR (MULTI TAB) ---
    {
        id: "transaksi_order",
        title: "Transaksi Nomor (Order)",
        desc: "Menu lengkap untuk melakukan pembelian, pengecekan SMS, dan pembatalan.",
        tabs: [
            {
                name: "1. Order Nomor",
                icon: <ShoppingCart size={14}/>,
                method: "GET",
                url: "/orders/buy",
                desc: "Melakukan pembelian nomor virtual baru.",
                headers: "x-user-id: [User_ID_Anda]",
                params: "Query: number_id, provider_id, operator_id, expected_price",
                response: `{
  "success": true,
  "message": "Pembelian berhasil",
  "data": {
    "order_id": "RUANGOTP405817",
    "phone_number": "+62 857 2105 2792",
    "price": 750,
    "price_format": "Rp750",
    "remaining_balance": 6500
  }
}`
            },
            {
                name: "2. Cek Status SMS",
                icon: <MessageSquare size={14}/>,
                method: "GET",
                url: "/orders/check-status",
                desc: "Mengecek apakah SMS OTP sudah masuk atau status pesanan.",
                headers: "x-user-id: [User_ID_Anda]",
                params: "Query: order_id",
                response: `// KONDISI 1: Menunggu SMS (ACTIVE)
{
  "success": true,
  "data": {
    "order_id": "RUANGOTP405817",
    "status": "ACTIVE"
  }
}

// KONDISI 2: SMS Diterima (COMPLETED)
{
  "success": true,
  "data": {
    "order_id": "RUANGOTP405817",
    "status": "COMPLETED",
    "otp_code": "4585"
  }
}`
            },
            {
                name: "3. Cancel Order",
                icon: <XCircle size={14}/>,
                method: "GET",
                url: "/orders/cancel",
                desc: "Membatalkan pesanan dan mengembalikan saldo (Refund).",
                headers: "x-user-id: [User_ID_Anda]",
                params: "Query: order_id",
                response: `// JIKA SUKSES
{
  "success": true,
  "message": "Order berhasil dibatalkan",
  "data": {
    "order_id": "RUANGOTP405817",
    "status": "CANCELLED"
  }
}

// JIKA GAGAL (Masih waktu tunggu)
{
  "success": false,
  "error": {
    "message": "Harap tunggu 4 menit lagi untuk membatalkan."
  }
}`
            }
        ]
    },

    // --- TRANSAKSI DEPOSIT (MULTI TAB) ---
    {
        id: "transaksi_deposit",
        title: "Transaksi Deposit",
        desc: "Kelola pembayaran deposit otomatis via QRIS.",
        tabs: [
            {
                name: "1. Buat Tagihan",
                icon: <Wallet size={14}/>,
                method: "GET",
                url: "/deposit/create",
                desc: "Membuat tagihan deposit otomatis via QRIS.",
                headers: "x-user-id: [User_ID_Anda]",
                params: "Query: amount (min 500)",
                response: `{
  "success": true,
  "message": "QRIS Berhasil dibuat",
  "data": {
    "deposit_id": "DEP-816176",
    "amount_received": 5000,
    "total_pay": 5569,
    "qr_image": "data:image/png;base64,.....",
    "expired_at": 1771138644404
  }
}`
            },
            {
                name: "2. Cek Status",
                icon: <RefreshCw size={14}/>,
                method: "GET",
                url: "/deposit/cekstatus",
                desc: "Mengecek status pembayaran deposit (Pending/Success/Canceled).",
                headers: "x-user-id: [User_ID_Anda]",
                params: "Query: deposit_id",
                response: `{
  "success": true,
  "message": "Status deposit ditemukan",
  "data": {
    "deposit_id": "DEP-815271",
    "status": "pending",
    "method": "qris",
    "amount_received": 5000,
    "total_pay": 5598,
    "created_at": 1742099999999,
    "expired_at": 1742100899999
  }
}
// Status bisa: 'pending', 'success', 'canceled', 'expired'`
            },
            {
                name: "3. Batalkan",
                icon: <Trash2 size={14}/>,
                method: "GET",
                url: "/deposit/cancel",
                desc: "Membatalkan tagihan deposit yang masih pending.",
                headers: "x-user-id: [User_ID_Anda]",
                params: "Query: deposit_id",
                response: `{
  "success": true,
  "message": "Deposit berhasil dibatalkan",
  "data": {
    "deposit_id": "DEP-815271",
    "status": "canceled"
  }
}`
            }
        ]
    }
  ];

  const ERROR_DOCS = [
      {
          title: "Error: IP Tidak Terdaftar",
          code: 403,
          desc: "Terjadi jika IP server Anda belum dimasukkan ke Whitelist di menu Profile.",
          response: `{
  "success": false,
  "error": {
    "message": "Akses ditolak. IP Anda tidak sesuai whitelist.",
    "detected_ip": "48.193.47",
    "whitelisted_ip": "1.1.1.1"
  }
}`
      }
  ];

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

      <div className="px-5 mt-6 space-y-8">
        
        {/* HERO SECTION */}
        <div className="p-6 rounded-3xl bg-slate-900 text-white shadow-xl relative overflow-hidden">
            <div className="relative z-10">
                <div className="p-3 w-fit rounded-2xl bg-white/10 backdrop-blur-md mb-4 border border-white/20">
                    <Terminal size={24} className="text-blue-400" />
                </div>
                <h2 className="text-2xl font-bold mb-2">Dokumentasi API v1</h2>
                <p className="text-slate-400 text-sm leading-relaxed text-balance">
                    Integrasi mudah menggunakan Header Auth & Whitelist IP.
                </p>
            </div>
            <div className="absolute -right-6 -bottom-6 opacity-10 rotate-12">
                <Code2 size={160} />
            </div>
        </div>

        {/* INFO CARDS */}
        <div className="grid grid-cols-1 gap-4">
            <div className="p-4 rounded-2xl bg-white border border-slate-100 shadow-sm dark:bg-slate-950 dark:border-slate-800">
                <div className="flex items-center gap-2 text-blue-500 mb-2">
                    <Server size={18} />
                    <span className="text-[10px] font-bold uppercase tracking-wider">Base URL</span>
                </div>
                <div className="flex items-center justify-between gap-2 overflow-hidden bg-slate-50 dark:bg-slate-900 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                    <code className="text-xs font-mono text-slate-600 dark:text-slate-300 truncate">https://api.ruangotp.site/api/v1</code>
                    <button onClick={() => handleCopy("https://api.ruangotp.site/api/v1")} className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-400 transition-colors shrink-0"><Copy size={14}/></button>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-white border border-slate-100 shadow-sm dark:bg-slate-950 dark:border-slate-800">
                    <div className="flex items-center gap-2 text-emerald-500 mb-2">
                        <Key size={18} />
                        <span className="text-[10px] font-bold uppercase tracking-wider">Header Auth</span>
                    </div>
                    <p className="text-[10px] font-bold text-slate-600 dark:text-slate-300 font-mono">x-user-id</p>
                </div>
                <div className="p-4 rounded-2xl bg-white border border-slate-100 shadow-sm dark:bg-slate-950 dark:border-slate-800">
                    <div className="flex items-center gap-2 text-orange-500 mb-2">
                        <ShieldCheck size={18} />
                        <span className="text-[10px] font-bold uppercase tracking-wider">Security</span>
                    </div>
                    <p className="text-[10px] font-bold text-slate-600 dark:text-slate-300">Whitelist IP</p>
                </div>
            </div>
        </div>

        {/* --- ENDPOINTS LIST --- */}
        <div className="space-y-3">
            <h3 className="px-1 text-sm font-bold text-slate-400 uppercase tracking-widest">EndPoints Utama</h3>
            
            {API_DOCS.map((api, index) => {
                const isExpanded = expandedIndex === index;
                const isMulti = api.tabs && api.tabs.length > 0;
                
                // Jika multi tab, ambil data dari tab aktif, jika tidak ambil data langsung
                const currentData = isMulti ? api.tabs[activeSubTab] : api;

                return (
                    <div key={index} className={`rounded-3xl border transition-all duration-300 ${isExpanded ? 'bg-white dark:bg-slate-950 border-blue-500/30 shadow-lg ring-1 ring-blue-500/20' : 'bg-white dark:bg-slate-950 border-slate-100 dark:border-slate-800 shadow-sm'}`}>
                        
                        {/* Judul Accordion */}
                        <button 
                            onClick={() => toggleAccordion(index)}
                            className="w-full p-5 flex items-center justify-between outline-none group"
                        >
                            <div className="flex items-center gap-4">
                                {!isMulti && (
                                    <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${api.method === 'GET' ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/30' : 'bg-orange-50 text-orange-600'}`}>
                                        {api.method}
                                    </span>
                                )}
                                {isMulti && (
                                    <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-violet-50 text-violet-600 dark:bg-violet-900/30">
                                        MULTI
                                    </span>
                                )}
                                <h4 className={`font-bold text-sm transition-colors ${isExpanded ? 'text-blue-600 dark:text-blue-400' : 'text-slate-700 dark:text-slate-200 group-hover:text-blue-600'}`}>
                                    {api.title}
                                </h4>
                            </div>
                            {isExpanded ? <ChevronUp size={18} className="text-blue-500" /> : <ChevronDown size={18} className="text-slate-400 group-hover:text-blue-500" />}
                        </button>

                        {/* Konten Accordion */}
                        <div className={`overflow-hidden transition-all duration-500 ease-in-out ${isExpanded ? 'max-h-[1500px] opacity-100' : 'max-h-0 opacity-0'}`}>
                            <div className="px-5 pb-6 space-y-5">
                                <div className="h-[1px] w-full bg-slate-100 dark:bg-slate-800"></div>
                                
                                {/* SUB-NAVIGASI BUTTONS (KHUSUS MULTI TAB) */}
                                {isMulti && (
                                    <div className="grid grid-cols-3 gap-2 mb-4">
                                        {api.tabs.map((tab, idx) => (
                                            <button
                                                key={idx}
                                                onClick={() => setActiveSubTab(idx)}
                                                className={`flex flex-col items-center justify-center gap-1 py-3 rounded-xl border transition-all text-[10px] font-bold ${activeSubTab === idx ? 'bg-slate-900 text-white border-slate-900 dark:bg-white dark:text-slate-900' : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-400'}`}
                                            >
                                                {tab.icon}
                                                <span>{tab.name.split('. ')[1]}</span>
                                            </button>
                                        ))}
                                    </div>
                                )}

                                {/* URL Endpoint */}
                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Endpoint URL</p>
                                        {isMulti && <span className="text-[10px] font-bold text-blue-500 bg-blue-50 px-2 py-0.5 rounded dark:bg-blue-900/30">{currentData.method}</span>}
                                    </div>
                                    <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 flex items-center justify-between">
                                        <code className="text-xs font-mono text-blue-600 dark:text-blue-400">{currentData.url}</code>
                                        <button onClick={() => handleCopy(currentData.url)} className="text-slate-400 hover:text-blue-500 p-1"><Copy size={14} /></button>
                                    </div>
                                </div>

                                {/* Deskripsi */}
                                <div>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Deskripsi</p>
                                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{currentData.desc}</p>
                                </div>

                                {/* Headers & Params */}
                                <div className="grid grid-cols-1 gap-3">
                                    <div className="bg-slate-50 dark:bg-slate-900 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                                        <div className="flex items-center gap-2 text-[10px] text-slate-500 mb-1">
                                            <ShieldCheck size={12} className="text-emerald-500" />
                                            <span className="font-bold uppercase">Header Wajib</span>
                                        </div>
                                        <code className="text-xs font-mono text-slate-700 dark:text-slate-300">{currentData.headers}</code>
                                    </div>
                                    <div className="bg-slate-50 dark:bg-slate-900 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                                        <div className="flex items-center gap-2 text-[10px] text-slate-500 mb-1">
                                            <Key size={12} className="text-orange-500" />
                                            <span className="font-bold uppercase">Parameter</span>
                                        </div>
                                        <code className="text-xs font-mono text-slate-700 dark:text-slate-300">{currentData.params}</code>
                                    </div>
                                </div>

                                {/* Contoh Response */}
                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Contoh Response</p>
                                        <button onClick={() => handleCopy(currentData.response)} className="text-[10px] font-bold text-blue-500 hover:underline flex items-center gap-1"><Copy size={10} /> Salin JSON</button>
                                    </div>
                                    <pre className="p-4 bg-slate-900 rounded-xl text-[10px] font-mono text-emerald-400 overflow-x-auto border border-slate-800 shadow-inner">
                                        {currentData.response}
                                    </pre>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>

        {/* ERROR RESPONSES */}
        <div className="space-y-3">
            <h3 className="px-1 text-sm font-bold text-red-500 uppercase tracking-widest flex items-center gap-2">
                <AlertTriangle size={16} /> Error Responses
            </h3>
            
            {ERROR_DOCS.map((err, index) => {
                const itemIndex = index + 100;
                const isExpanded = expandedIndex === itemIndex;
                return (
                    <div key={itemIndex} className={`rounded-3xl border transition-all duration-300 ${isExpanded ? 'bg-white dark:bg-slate-950 border-red-500/30 shadow-lg ring-1 ring-red-500/20' : 'bg-white dark:bg-slate-950 border-slate-100 dark:border-slate-800 shadow-sm'}`}>
                        <button 
                            onClick={() => toggleAccordion(itemIndex)}
                            className="w-full p-5 flex items-center justify-between outline-none group"
                        >
                            <div className="flex items-center gap-4">
                                <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-red-50 text-red-600 dark:bg-red-900/30">
                                    {err.code}
                                </span>
                                <h4 className={`font-bold text-sm transition-colors ${isExpanded ? 'text-red-600 dark:text-red-400' : 'text-slate-700 dark:text-slate-200 group-hover:text-red-600'}`}>
                                    {err.title}
                                </h4>
                            </div>
                            {isExpanded ? <ChevronUp size={18} className="text-red-500" /> : <ChevronDown size={18} className="text-slate-400 group-hover:text-red-500" />}
                        </button>

                        <div className={`overflow-hidden transition-all duration-500 ease-in-out ${isExpanded ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}>
                            <div className="px-5 pb-6 space-y-4">
                                <div className="h-[1px] w-full bg-slate-100 dark:bg-slate-800"></div>
                                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{err.desc}</p>
                                <div>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase mb-2">Response JSON</p>
                                    <pre className="p-4 bg-slate-900 rounded-xl text-[10px] font-mono text-red-400 overflow-x-auto border border-slate-800 shadow-inner">
                                        {err.response}
                                    </pre>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>

        {/* FOOTER */}
        <div className="rounded-3xl border border-slate-100 bg-white p-6 dark:border-slate-800 dark:bg-slate-950">
            <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-xl bg-orange-50 text-orange-500 dark:bg-orange-900/20">
                    <Globe size={20} />
                </div>
                <h3 className="font-bold">Butuh Bantuan?</h3>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed mb-4">Pastikan IP Server Anda sudah terdaftar di menu <strong>Whitelist IP</strong> sebelum melakukan request API.</p>
            <button className={`w-full py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 ${color.btn}`}>
                <ExternalLink size={14} /> Hubungi Developer CS
            </button>
        </div>

      </div>

      <div className={`fixed bottom-24 left-1/2 z-[100] flex -translate-x-1/2 transform items-center gap-3 rounded-full bg-slate-900 dark:bg-white px-5 py-3 text-white dark:text-slate-900 shadow-2xl transition-all duration-300 ${toast.show ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0 pointer-events-none'}`}>
          <CheckCircle2 size={18} className="text-emerald-400 dark:text-emerald-600" />
          <span className="text-sm font-bold">{toast.message}</span>
      </div>

      <BottomNav />
    </div>
  );
}

