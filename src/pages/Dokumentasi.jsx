import React from 'react';
import BottomNav from '../components/BottomNav';
import { useTheme } from '../context/ThemeContext';
import { 
  ChevronLeft, Terminal, Server, ShieldCheck, 
  Key, Globe, Code2, Copy, ExternalLink 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Dokumentasi() {
  const { color } = useTheme();
  const navigate = useNavigate();

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    alert("Berhasil disalin! 📋");
  };

  const API_DOCS = [
    {
      title: "Cek Saldo",
      method: "GET",
      url: "/auth/me",
      desc: "Mengambil data profil dan saldo user.",
      params: "Header: Authorization (Bearer token)"
    },
    {
        title: "Daftar Layanan",
        method: "GET",
        url: "/services/list",
        desc: "Melihat semua layanan OTP yang tersedia.",
        params: "No params"
    },
    {
      title: "Beli Nomor",
      method: "GET",
      url: "/orders/buy",
      desc: "Melakukan pembelian nomor virtual baru.",
      params: "Query: number_id, provider_id, operator_id"
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
        
        {/* WELCOME SECTION */}
        <div className="p-6 rounded-3xl bg-slate-900 text-white shadow-xl relative overflow-hidden">
            <div className="relative z-10">
                <div className="p-3 w-fit rounded-2xl bg-white/10 backdrop-blur-md mb-4 border border-white/20">
                    <Terminal size={24} className="text-blue-400" />
                </div>
                <h2 className="text-2xl font-bold mb-2">Dokumentasi API</h2>
                <p className="text-slate-400 text-sm leading-relaxed">Integrasikan layanan RuangOTP ke aplikasi Anda dengan mudah melalui REST API kami.</p>
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
                <div className="flex items-center justify-between gap-2">
                    <code className="text-[10px] font-mono text-slate-500 truncate">api.ruangotp.site/api</code>
                    <button onClick={() => handleCopy("https://api.ruangotp.site/api")} className="p-1.5 rounded-lg bg-slate-50 dark:bg-slate-900 text-slate-400"><Copy size={12}/></button>
                </div>
            </div>
            <div className="p-4 rounded-2xl bg-white border border-slate-100 shadow-sm dark:bg-slate-950 dark:border-slate-800">
                <div className="flex items-center gap-2 text-emerald-500 mb-2">
                    <ShieldCheck size={18} />
                    <span className="text-[10px] font-bold uppercase tracking-wider">Auth Method</span>
                </div>
                <p className="text-[10px] font-bold text-slate-600 dark:text-slate-300">Bearer Token JWT</p>
            </div>
        </div>

        {/* ENDPOINTS LIST */}
        <div className="space-y-4">
            <h3 className="px-1 text-sm font-bold text-slate-400 uppercase tracking-widest">EndPoints Utama</h3>
            
            {API_DOCS.map((api, index) => (
                <div key={index} className="p-5 rounded-3xl bg-white border border-slate-100 shadow-sm dark:bg-slate-950 dark:border-slate-800 group transition-all hover:border-blue-500/30">
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                            <span className={`px-2 py-1 rounded-lg text-[10px] font-bold ${api.method === 'GET' ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/30' : 'bg-orange-50 text-orange-600'}`}>
                                {api.method}
                            </span>
                            <h4 className="font-bold text-sm">{api.title}</h4>
                        </div>
                        <Code2 size={16} className="text-slate-300" />
                    </div>
                    
                    <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl mb-3 border border-slate-100 dark:border-slate-800">
                        <code className="text-xs font-mono text-blue-600 dark:text-blue-400">{api.url}</code>
                    </div>

                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-4">{api.desc}</p>
                    
                    <div className="flex items-center gap-2 text-[10px] text-slate-400">
                        <Key size={12} />
                        <span>{api.params}</span>
                    </div>
                </div>
            ))}
        </div>

        {/* INTEGRASI SECTION */}
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

      <BottomNav />
    </div>
  );
}
