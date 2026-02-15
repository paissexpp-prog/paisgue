import React, { useState } from 'react';
import BottomNav from '../components/BottomNav';
import { useTheme } from '../context/ThemeContext';
import { 
  ChevronLeft, Terminal, Server, ShieldCheck, 
  Key, Globe, Code2, Copy, ExternalLink, 
  ChevronDown, ChevronUp, CheckCircle2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Dokumentasi() {
  const { color } = useTheme();
  const navigate = useNavigate();

  // State untuk accordion (menyimpan index mana yang sedang dibuka)
  const [expandedIndex, setExpandedIndex] = useState(null);
  
  // State untuk Custom Toast (Pengganti alert sistem)
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
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  const API_DOCS = [
    {
      title: "Cek Saldo",
      method: "GET",
      url: "/auth/me",
      desc: "Mengambil data profil dan saldo user secara realtime.",
      params: "Header: Authorization (Bearer token)",
      response: `{ "success": true, "data": { "balance": 5000 } }`
    },
    {
        title: "Daftar Layanan",
        method: "GET",
        url: "/services/list",
        desc: "Melihat semua daftar layanan OTP yang tersedia saat ini.",
        params: "No params",
        response: `{ "success": true, "data": [{ "service_name": "DANA", "service_code": "dn" }] }`
    },
    {
      title: "Beli Nomor",
      method: "GET",
      url: "/orders/buy",
      desc: "Melakukan pembelian nomor virtual baru berdasarkan provider dan operator.",
      params: "Query: number_id, provider_id, operator_id",
      response: `{ "success": true, "message": "Order Berhasil" }`
    },
    {
        title: "Cek Status SMS",
        method: "GET",
        url: "/history/list",
        desc: "Mengecek apakah SMS sudah masuk atau belum pada pesanan aktif.",
        params: "No params",
        response: `{ "success": true, "data": [{ "status": "COMPLETED", "otp_code": "1234" }] }`
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
                <h2 className="text-2xl font-bold mb-2">Dokumentasi API</h2>
                <p className="text-slate-400 text-sm leading-relaxed text-balance">Integrasikan layanan RuangOTP ke aplikasi Anda dengan cepat.</p>
            </div>
            <div className="absolute -right-6 -bottom-6 opacity-10 rotate-12">
                <Code2 size={160} />
            </div>
        </div>

        {/* INFO CARDS */}
        <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-white border border-slate-100 shadow-sm dark:bg-slate-950 dark:border-slate-800">
                <div className="flex items-center gap-2 text-blue-500 mb-2">
                    <Server size={18} />
                    <span className="text-[10px] font-bold uppercase tracking-wider">Base URL</span>
                </div>
                <div className="flex items-center justify-between gap-2 overflow-hidden">
                    <code className="text-[10px] font-mono text-slate-500 truncate">api.ruangotp.site/api</code>
                    <button onClick={() => handleCopy("https://api.ruangotp.site/api")} className="p-1.5 rounded-lg bg-slate-50 dark:bg-slate-900 text-slate-400 shrink-0"><Copy size={12}/></button>
                </div>
            </div>
            <div className="p-4 rounded-2xl bg-white border border-slate-100 shadow-sm dark:bg-slate-950 dark:border-slate-800">
                <div className="flex items-center gap-2 text-emerald-500 mb-2">
                    <ShieldCheck size={18} />
                    <span className="text-[10px] font-bold uppercase tracking-wider">Auth Method</span>
                </div>
                <p className="text-[10px] font-bold text-slate-600 dark:text-slate-300 uppercase">Bearer Token JWT</p>
            </div>
        </div>

        {/* ENDPOINTS LIST (ACCORDION STYLE) */}
        <div className="space-y-3">
            <h3 className="px-1 text-sm font-bold text-slate-400 uppercase tracking-widest">EndPoints Utama</h3>
            
            {API_DOCS.map((api, index) => {
                const isExpanded = expandedIndex === index;
                return (
                    <div key={index} className={`rounded-3xl border transition-all duration-300 ${isExpanded ? 'bg-white dark:bg-slate-950 border-blue-500/30 shadow-lg' : 'bg-white dark:bg-slate-950 border-slate-100 dark:border-slate-800 shadow-sm'}`}>
                        
                        {/* Judul / Header Accordion */}
                        <button 
                            onClick={() => toggleAccordion(index)}
                            className="w-full p-5 flex items-center justify-between outline-none"
                        >
                            <div className="flex items-center gap-4">
                                <span className={`px-2 py-1 rounded-lg text-[10px] font-bold ${api.method === 'GET' ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/30' : 'bg-orange-50 text-orange-600'}`}>
                                    {api.method}
                                </span>
                                <h4 className={`font-bold text-sm ${isExpanded ? 'text-blue-600 dark:text-blue-400' : 'text-slate-700 dark:text-slate-200'}`}>
                                    {api.title}
                                </h4>
                            </div>
                            {isExpanded ? <ChevronUp size={18} className="text-blue-500" /> : <ChevronDown size={18} className="text-slate-400" />}
                        </button>

                        {/* Konten Accordion */}
                        <div className={`overflow-hidden transition-all duration-300 ${isExpanded ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}>
                            <div className="px-5 pb-5 space-y-4">
                                <div className="h-[1px] w-full bg-slate-100 dark:bg-slate-800"></div>
                                
                                <div>
                                    <p className="text-xs font-bold text-slate-400 uppercase mb-2">Endpoint URL</p>
                                    <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 flex items-center justify-between">
                                        <code className="text-xs font-mono text-blue-600 dark:text-blue-400">{api.url}</code>
                                        <button onClick={() => handleCopy(api.url)} className="text-slate-400 p-1"><Copy size={14} /></button>
                                    </div>
                                </div>

                                <div>
                                    <p className="text-xs font-bold text-slate-400 uppercase mb-1">Deskripsi</p>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{api.desc}</p>
                                </div>

                                <div className="flex items-center gap-2 text-[10px] text-slate-500 font-medium">
                                    <Key size={12} className="text-blue-500" />
                                    <span>{api.params}</span>
                                </div>

                                <div>
                                    <p className="text-xs font-bold text-slate-400 uppercase mb-2">Contoh Response</p>
                                    <pre className="p-3 bg-slate-900 rounded-xl text-[10px] font-mono text-emerald-400 overflow-x-auto">
                                        {api.response}
                                    </pre>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>

        {/* FOOTER BANTUAN */}
        <div className="rounded-3xl border border-slate-100 bg-white p-6 dark:border-slate-800 dark:bg-slate-950">
            <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-xl bg-orange-50 text-orange-500 dark:bg-orange-900/20">
                    <Globe size={20} />
                </div>
                <h3 className="font-bold">Butuh Bantuan?</h3>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed mb-4">Integrasi API memerlukan whitelist IP agar aman. Pastikan Anda sudah mengatur IP Server di halaman Profile.</p>
            <button className={`w-full py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 ${color.btn}`}>
                <ExternalLink size={14} /> Hubungi Developer CS
            </button>
        </div>

      </div>

      {/* --- CUSTOM TOAST (PENGGANTI ALERT) --- */}
      <div className={`fixed bottom-24 left-1/2 z-[100] flex -translate-x-1/2 transform items-center gap-3 rounded-full bg-slate-900 px-5 py-3 text-white shadow-2xl transition-all duration-300 ${toast.show ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0 pointer-events-none'}`}>
          <CheckCircle2 size={18} className="text-emerald-400" />
          <span className="text-sm font-bold">{toast.message}</span>
      </div>

      <BottomNav />
    </div>
  );
}

