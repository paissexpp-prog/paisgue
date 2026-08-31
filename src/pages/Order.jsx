// ================================================================
// 📄 FILE PATH: src/pages/Order.jsx
// ================================================================
import React, { useState, useEffect, useRef, useMemo, useDeferredValue, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import { jwtDecode } from 'jwt-decode';
import api from '../utils/api';
import BottomNav from '../components/BottomNav';
import { useTheme } from '../context/ThemeContext';
import { 
  Search, Wifi, X, ShoppingBag, Plus, 
  ChevronDown, ChevronUp, ChevronRight, Server, Globe, 
  Smartphone, Loader2, CheckCircle2, AlertCircle, HelpCircle, 
  Clock, Copy, MessageSquare, RefreshCw,
  Wallet, History, Headphones, Brain, Info, Bug, Eye, BookOpen, FileText
} from 'lucide-react';

// ================================================================
// --- HELPER FUNCTIONS UNTUK TIMER ---
// ================================================================
const calculateRemainingTime = (createdAt, currentTime) => {
    const createdTime = new Date(createdAt).getTime();
    const diffSeconds = Math.floor((currentTime - createdTime) / 1000);
    const lockDuration = 4 * 60; // 4 Menit
    const remaining = lockDuration - diffSeconds;
    return remaining > 0 ? remaining : 0;
};

const calculateLifetimeRemaining = (createdAt, currentTime) => {
    const createdTime = new Date(createdAt).getTime();
    const diffSeconds = Math.floor((currentTime - createdTime) / 1000);
    const lifetimeDuration = 20 * 60; // 20 Menit
    const remaining = lifetimeDuration - diffSeconds;
    return remaining > 0 ? remaining : 0;
};

const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
};

// ================================================================
// --- KOMPONEN KARTU ORDER (ISOLASI RE-RENDER 1 DETIK) ---
// ================================================================
const ActiveOrderCard = memo(({
    order, color,
    onCopy, onCancel, onClose, onReorder, onShowToast,
    getOptimizedImage,
    serviceImg, countryFlag, opImgCached,
    otpDisplay, smsText, operatorName, isOpAny
}) => {
    const [currentTime, setCurrentTime] = useState(Date.now());

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(Date.now()), 1000);
        return () => clearInterval(timer);
    }, []);

    const status = (order.status || '').toUpperCase();
    const isSmsReceived = status === 'COMPLETED' || status === 'RECEIVED';
    const remaining = calculateRemainingTime(order.created_at, currentTime);
    const lifetimeRemaining = calculateLifetimeRemaining(order.created_at, currentTime);

    return (
        <div
            className={`overflow-hidden rounded-[1.5rem] shadow-lg border animate-in slide-in-from-bottom duration-500 bg-white dark:bg-[#111827] ${
                isSmsReceived
                    ? 'border-emerald-400/50 ring-1 ring-emerald-400/30 dark:border-emerald-600/50 dark:ring-emerald-900/30'
                    : 'border-slate-200 dark:border-[#1f2937]'
            }`}
        >
            <div className="p-4 space-y-3">
                {/* ── ROW 1: Bendera + Nomor + Copy │ Tag Selesai/Timer ── */}
                <div className="flex items-center justify-between gap-2">
                     <div className="flex items-center gap-2 min-w-0 flex-1">
                        <span className="text-xl shrink-0 leading-none flex items-center justify-center">{countryFlag}</span>
                        <span className="font-bold text-slate-800 dark:text-white text-base truncate tracking-wide">
                            {order.phone_number}
                        </span>
                        <button
                            onClick={() => onCopy(order.phone_number)}
                            className="shrink-0 text-slate-400 hover:text-slate-600 transition-colors dark:text-slate-500 dark:hover:text-slate-300 ml-1"
                        >
                             <Copy size={16} />
                        </button>
                     </div>
                     
                    <div className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold ${
                        isSmsReceived
                            ? 'bg-emerald-100/50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border border-emerald-200/50 dark:border-emerald-800/30'
                            : lifetimeRemaining <= 120
                                ? 'bg-red-100/50 text-red-700 dark:bg-red-900/30 dark:text-red-400 border border-red-200/50 dark:border-red-800/30'
                                : 'bg-amber-100/50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border border-amber-200/50 dark:border-amber-800/30'
                    }`}>
                        {isSmsReceived ? <CheckCircle2 size={14} /> : <Clock size={14} />}
                        {isSmsReceived ? 'Diterima' : formatTime(lifetimeRemaining)}
                    </div>
                </div>

                {/* ── ROW 2: Operator │ Harga ── */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        {isOpAny ? (
                            <div className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-sm leading-none shrink-0 border border-slate-200 dark:border-slate-700">
                                🎲
                            </div>
                        ) : opImgCached ? (
                            <img 
                                src={getOptimizedImage(opImgCached)} 
                                className="w-6 h-6 rounded-full bg-white object-cover border border-slate-200 dark:border-slate-700 shrink-0" 
                                alt={operatorName} 
                            />
                        ) : (
                            <div className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-500 uppercase overflow-hidden shrink-0 border border-slate-200 dark:border-slate-700">
                                {operatorName.charAt(0)}
                            </div>
                        )}
                        
                        <span className="text-sm text-slate-600 dark:text-slate-300 font-medium truncate max-w-[100px] capitalize">
                            {operatorName}
                        </span>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-xs font-bold text-blue-700 bg-blue-100/50 dark:text-blue-400 dark:bg-blue-900/30 border border-blue-200/50 dark:border-blue-800/30`}>
                        {order.total_price ? `Rp ${order.total_price.toLocaleString('id-ID')}` : '—'}
                    </div>
                </div>

                {/* ── INNER BOX: Info Layanan & Full Text SMS ── */}
                <div className={`rounded-2xl p-4 border mt-2 relative overflow-hidden ${
                    isSmsReceived
                        ? 'bg-slate-100 border-slate-200/80 dark:bg-[#1f2937] dark:border-slate-700/50'
                        : 'bg-slate-50 dark:bg-slate-900 border-slate-100 dark:border-slate-800'
                }`}>
                    <div className="flex items-center justify-between mb-3 relative z-10">
                        <div className="flex items-center gap-2 min-w-0">
                            {serviceImg ? (
                                <img
                                    src={getOptimizedImage(serviceImg)}
                                    className="w-6 h-6 rounded-full object-contain bg-white dark:bg-slate-800 shrink-0"
                                    alt={order.service}
                                />
                            ) : (
                                <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center shrink-0">
                                    <Smartphone size={14} className="text-blue-600 dark:text-blue-400" />
                                </div>
                            )}
                            <span className="font-bold text-slate-800 dark:text-white text-sm truncate tracking-wide">
                                {order.service || 'Layanan'}
                            </span>
                        </div>
                        
                        {isSmsReceived ? (
                            <button
                                onClick={() => onCopy(order.sms_content || otpDisplay)}
                                className="shrink-0 flex items-center gap-1.5 text-slate-500 hover:text-slate-800 dark:hover:text-white transition-colors text-sm font-mono active:scale-95"
                            >
                                <Copy size={14} />
                                <span>{otpDisplay || 'Copy'}</span>
                            </button>
                        ) : (
                            <div className="shrink-0 flex items-center gap-1.5 text-amber-600 dark:text-amber-400 text-xs font-bold">
                                Menunggu <MessageSquare size={13} />
                            </div>
                        )}
                    </div>

                    <div className="relative z-10">
                        {isSmsReceived ? (
                            <div
                                onClick={() => onCopy(order.sms_content || otpDisplay)}
                                className="mt-2 text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-mono whitespace-pre-wrap break-words cursor-pointer hover:opacity-80 transition-opacity"
                            >
                                {smsText}
                            </div>
                        ) : (
                            <p className="text-xs text-slate-400 dark:text-slate-500 mt-2">
                                {remaining > 0 ? (
                                    <>
                                        Tunggu <span className="font-bold text-red-500">{formatTime(remaining)}</span> sebelum klik batal.
                                    </>
                                ) : (
                                    <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                                        ✓ Siap dibatalkan jika diperlukan.
                                    </span>
                                )}
                            </p>
                        )}
                    </div>
                </div>

                {/* ── TOMBOL AKSI BAWAH ── */}
                <div className="flex gap-3 mt-3">
                    {isSmsReceived ? (
                        <>
                            <button
                                onClick={() => onShowToast("Fitur Kirim Ulang segera hadir", "success")}
                                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border border-slate-300 text-slate-600 font-bold text-sm hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors active:scale-95"
                            >
                                <RefreshCw size={15} /> Kirim Ulang
                            </button>
                            <button
                                onClick={onClose}
                                className="flex-1 py-3 rounded-xl border border-emerald-600/50 bg-emerald-50 text-emerald-600 font-bold text-sm hover:bg-emerald-100 dark:bg-emerald-900/10 dark:text-emerald-500 dark:hover:bg-emerald-900/30 transition-colors flex items-center justify-center gap-2 active:scale-95"
                            >
                                <CheckCircle2 size={15} /> Selesai
                            </button>
                        </>
                    ) : (
                        <>
                            <button
                                onClick={onReorder}
                                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border-2 text-sm font-bold transition-colors ${color.border} ${color.text} hover:bg-slate-50 dark:hover:bg-slate-900 active:scale-95`}
                            >
                                <ShoppingBag size={15} /> Beli lagi
                            </button>
                            <button
                                onClick={onCancel}
                                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border-2 text-sm font-bold transition-colors active:scale-95 ${
                                    remaining > 0
                                        ? 'border-slate-200 text-slate-400 cursor-not-allowed dark:border-slate-800 dark:text-slate-600'
                                        : 'border-red-300 text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/10'
                                }`}
                            >
                                <X size={15} /> Batal
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
});

// ================================================================
// --- DRAWER SERVER UTAMA (V1) ---
// ================================================================

const ServicesDrawer = memo(({ isOpen, onClose, services, loading, onSelectService, getOptimizedImage }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const deferredSearchTerm = useDeferredValue(searchTerm);
    const [displayLimit, setDisplayLimit] = useState(20);

    useEffect(() => {
        if (!isOpen) {
            setSearchTerm('');
            setDisplayLimit(20); 
        }
    }, [isOpen]);

    const filteredServices = useMemo(() => {
        return services.filter(service =>
          service.service_name.toLowerCase().includes(deferredSearchTerm.toLowerCase())
        );
    }, [services, deferredSearchTerm]);

    const isSearching = deferredSearchTerm.trim() !== '';

    const popularServices = useMemo(() => {
         return services.slice(0, 6);
    }, [services]);

    const handleScroll = (e) => {
        const { scrollTop, scrollHeight, clientHeight } = e.target;
        if (scrollTop + clientHeight >= scrollHeight - 50) {
            if (displayLimit < filteredServices.length) {
                setDisplayLimit(prev => prev + 20);
            }
        }
    };

    return (
        <>
            <div className={`fixed inset-0 z-50 bg-black/60 backdrop-blur-sm transition-opacity ${isOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`} onClick={onClose}></div>
            <div className={`fixed bottom-0 left-0 right-0 z-50 transform rounded-t-[2rem] bg-[#f8fafc] shadow-2xl transition-transform duration-300 dark:bg-[#0d1017] max-h-[90vh] h-[90vh] flex flex-col ${isOpen ? 'translate-y-0' : 'translate-y-full'}`}>
                
                <div className="pt-3 pb-4 px-6 bg-white dark:bg-[#0d1017] rounded-t-[2rem] z-10 border-b border-slate-100 dark:border-[#1e2333]">
                    <div className="mx-auto h-1.5 w-12 rounded-full bg-slate-200 mb-5 dark:bg-slate-700"></div>
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h2 className="text-xl font-bold text-slate-800 dark:text-white leading-tight">Server Utama</h2>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Pilih aplikasi (Get Virtual Number)</p>
                        </div>
                        <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-[#1e2333] transition-colors"><X size={22} className="text-slate-500" /></button>
                    </div>
                    <div className="flex items-center gap-3 bg-slate-50 p-3.5 rounded-2xl border border-slate-100 dark:bg-[#1e2333] dark:border-transparent transition-colors focus-within:border-blue-400 dark:focus-within:border-blue-500">
                        <Search size={18} className="text-slate-400" />
                        <input 
                            type="text" 
                            placeholder="Cari aplikasi..." 
                            className="bg-transparent w-full outline-none text-sm font-medium text-slate-800 dark:text-white placeholder:text-slate-400" 
                            value={searchTerm} 
                            onChange={(e) => { setSearchTerm(e.target.value); setDisplayLimit(20); }} 
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto px-5 py-5 pb-10 hide-scrollbar" onScroll={handleScroll}>
                    {loading ? (
                        <div className="space-y-4">{[...Array(6)].map((_,i) => <div key={i} className="h-16 bg-slate-200 rounded-2xl animate-pulse dark:bg-[#1e2333]"></div>)}</div>
                    ) : (
                        <div className="space-y-8">
                            {!isSearching && popularServices.length > 0 && (
                                <div>
                                    <h3 className="text-[13px] font-black tracking-wide uppercase text-slate-800 dark:text-white mb-4">Aplikasi Populer</h3>
                                    <div className="grid grid-cols-2 gap-3">
                                        {popularServices.map((item, index) => (
                                            <button 
                                                key={`pop-${item.service_code}`} 
                                                onClick={() => onSelectService(item)} 
                                                className="flex flex-col items-center justify-center gap-3 p-5 rounded-3xl border border-transparent bg-white shadow-sm dark:border-[#2a2e45] dark:bg-[#151924] hover:border-blue-400 dark:hover:border-blue-500 transition-all active:scale-[0.97]" 
                                                style={{ animation: `waveFadeIn 0.5s cubic-bezier(0.4, 0, 0.2, 1) forwards`, animationDelay: `${index * 0.05}s`, opacity: 0 }}
                                            >
                                                <div className="w-14 h-14 rounded-[1.2rem] bg-slate-50 dark:bg-slate-800 p-2 flex items-center justify-center border border-slate-100 dark:border-slate-700">
                                                    <img src={getOptimizedImage(item.service_img)} className="w-full h-full object-contain" loading="lazy" alt="" />
                                                </div>
                                                <span className="font-bold text-slate-800 dark:text-white text-[13px] truncate w-full text-center">{item.service_name}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div>
                                <h3 className="text-[13px] font-black tracking-wide uppercase text-slate-800 dark:text-white mb-4">
                                    {isSearching ? 'Hasil Pencarian' : 'Semua Aplikasi'}
                                </h3>
                                {filteredServices.length > 0 ? (
                                    <div className="flex flex-col gap-2.5">
                                        {filteredServices.slice(0, displayLimit).map((item, index) => (
                                            <button 
                                                key={item.service_code} 
                                                onClick={() => onSelectService(item)} 
                                                className="flex items-center justify-between p-4 rounded-2xl border border-transparent bg-white shadow-sm dark:border-[#2a2e45] dark:bg-[#151924] hover:border-blue-400 dark:hover:border-blue-500 transition-all active:scale-[0.98]" 
                                                style={{ animation: `waveFadeIn 0.5s cubic-bezier(0.4, 0, 0.2, 1) forwards`, animationDelay: `${(index % 20) * 0.03}s`, opacity: 0 }}
                                            >
                                                <div className="flex items-center gap-4 min-w-0 flex-1">
                                                    <div className="bg-slate-50 w-10 h-10 p-1.5 flex items-center justify-center rounded-xl border border-slate-100 dark:bg-slate-800 dark:border-slate-700">
                                                       <img src={getOptimizedImage(item.service_img)} className="w-full h-full object-contain" loading="lazy" alt="" />
                                                    </div>
                                                    <span className="font-bold text-slate-700 dark:text-slate-200 text-[15px] truncate tracking-wide">{item.service_name}</span>
                                                </div>
                                                <ChevronRight size={18} className="text-slate-400 dark:text-slate-500 shrink-0" />
                                            </button>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-12 text-slate-400 font-medium bg-white dark:bg-[#151924] rounded-3xl border border-dashed border-slate-200 dark:border-slate-800">
                                        <Smartphone size={32} className="mx-auto mb-3 opacity-50" />
                                        Aplikasi tidak ditemukan
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <style>{`
                @keyframes waveFadeIn {
                    0% { opacity: 0; transform: translateY(15px) scale(0.98); }
                    100% { opacity: 1; transform: translateY(0) scale(1); }
                }
            `}</style>
        </>
    );
});

const CountriesDrawer = memo(({ isOpen, onBack, selectedService, countries, loading, expandedCountry, onToggleCountry, getOptimizedImage, onBuyClick }) => {
    return (
        <>
            <div className={`fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm transition-opacity ${isOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`} onClick={onBack}></div>
            <div className={`fixed bottom-0 left-0 right-0 z-[60] transform rounded-t-[2rem] bg-white shadow-2xl transition-transform duration-300 dark:bg-slate-950 max-h-[85vh] flex flex-col ${isOpen ? 'translate-y-0' : 'translate-y-full'}`}>
                <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-slate-950 rounded-t-[2rem]">
                    <div className="flex items-center gap-3">
                        <button onClick={onBack} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-900"><X size={20} className="text-slate-500" /></button>
                        {selectedService && (<><img src={getOptimizedImage(selectedService.service_img)} className="w-8 h-8 object-contain" alt="" /><h3 className="font-bold text-slate-800 dark:text-white">{selectedService.service_name}</h3></>)}
                    </div>
                </div>
                <div className={`flex-1 overflow-y-auto px-6 py-2 transition-all pb-10`}>
                    {loading ? (
                        <div className="space-y-3 mt-4">{[1,2,3].map(i=><div key={i} className="h-16 bg-slate-100 rounded-xl animate-pulse dark:bg-slate-900"></div>)}</div>
                    ) : countries.length > 0 ? (
                        <div className="space-y-3 mt-4">
                            {countries.map((country) => {
                                const startPrice = country.pricelist?.[0]?.price || 0;
                                const isExpanded = expandedCountry === country.number_id;

                                return (
                                    <div key={country.number_id} className="overflow-hidden rounded-xl border border-slate-100 bg-slate-50 dark:border-slate-800 dark:bg-slate-900/40">
                                        <button onClick={() => onToggleCountry(country)} className="w-full flex items-center justify-between p-4 hover:bg-slate-100 dark:hover:bg-slate-900">
                                            <div className="flex items-center gap-4">
                                                <img src={getOptimizedImage(country.img)} className="w-8 h-6 object-cover rounded shadow-sm" alt="" />
                                                <div className="text-left"><p className="font-bold text-slate-700 text-sm dark:text-slate-200">{country.name}</p><p className="text-xs text-blue-600 font-medium">Mulai Rp {startPrice}</p></div>
                                            </div>
                                            <div className="flex items-center gap-2"><span className="text-xs text-slate-400">Stok: {country.stock_total}</span>{isExpanded ? <ChevronUp size={16}/> : <ChevronDown size={16}/>}</div>
                                        </button>
                                        {isExpanded && (
                                            <div className="bg-white dark:bg-slate-950 border-t border-slate-100 dark:border-slate-800 p-4 space-y-2">
                                                {country.pricelist?.filter(p=>p.stock>0).map((srv,idx)=>(
                                                    <div key={idx} className="flex justify-between p-3 rounded-xl border border-slate-100 dark:border-slate-800 hover:border-blue-200 transition-colors">
                                                        <div><span className="text-xs font-bold text-slate-700 dark:text-slate-300">Server {srv.server_id}</span><p className="text-[10px] text-slate-400">Stok {srv.stock}</p></div>
                                                        <div className="flex items-center gap-3"><span className="font-bold text-emerald-600 text-sm">Rp {srv.price}</span><button onClick={()=>onBuyClick(country,srv)} className="px-4 py-1.5 bg-slate-900 text-white text-xs font-bold rounded-lg dark:bg-white dark:text-slate-900 active:scale-95 transition-transform">Beli</button></div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )
                            })}
                        </div>
                    ) : <div className="text-center py-10 text-slate-400">Negara tidak tersedia</div>}
                </div>
            </div>
        </>
    );
});

// ================================================================
// --- DRAWER SERVER TERMURAH (V2) ---
// ================================================================

const V2CountriesDrawer = memo(({ isOpen, onClose, countries, loading, onSelectCountry, getCountryFlag }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const deferredSearchTerm = useDeferredValue(searchTerm);
    const [displayLimit, setDisplayLimit] = useState(20);

    useEffect(() => {
        if (!isOpen) {
            setSearchTerm('');
            setDisplayLimit(20); 
        }
    }, [isOpen]);

    const filteredCountries = useMemo(() => {
        return countries.filter(c =>
          c.name.toLowerCase().includes(deferredSearchTerm.toLowerCase())
        );
    }, [countries, deferredSearchTerm]);

    const handleScroll = (e) => {
        const { scrollTop, scrollHeight, clientHeight } = e.target;
        if (scrollTop + clientHeight >= scrollHeight - 50) {
            if (displayLimit < filteredCountries.length) {
                setDisplayLimit(prev => prev + 20);
            }
        }
    };

    return (
        <>
            <div className={`fixed inset-0 z-50 bg-black/60 backdrop-blur-sm transition-opacity ${isOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`} onClick={onClose}></div>
            <div className={`fixed bottom-0 left-0 right-0 z-50 transform rounded-t-[2rem] bg-[#f8fafc] shadow-2xl transition-transform duration-300 dark:bg-[#0d1017] max-h-[90vh] h-[90vh] flex flex-col ${isOpen ? 'translate-y-0' : 'translate-y-full'}`}>
                
                <div className="pt-3 pb-4 px-6 bg-white dark:bg-[#0d1017] rounded-t-[2rem] z-10 border-b border-slate-100 dark:border-[#1e2333]">
                    <div className="mx-auto h-1.5 w-12 rounded-full bg-slate-200 mb-5 dark:bg-slate-700"></div>
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h2 className="text-xl font-bold text-emerald-700 dark:text-emerald-400 leading-tight">Server Termurah</h2>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Langkah 1: Pilih Negara</p>
                        </div>
                        <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-[#1e2333] transition-colors"><X size={22} className="text-slate-500" /></button>
                    </div>
                    <div className="flex items-center gap-3 bg-slate-50 p-3.5 rounded-2xl border border-slate-100 dark:bg-[#1e2333] dark:border-transparent transition-colors focus-within:border-emerald-400 dark:focus-within:border-emerald-500">
                        <Search size={18} className="text-slate-400" />
                        <input 
                            type="text" 
                            placeholder="Cari negara..." 
                            className="bg-transparent w-full outline-none text-sm font-medium text-slate-800 dark:text-white placeholder:text-slate-400" 
                            value={searchTerm} 
                            onChange={(e) => { setSearchTerm(e.target.value); setDisplayLimit(20); }} 
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto px-5 py-5 pb-10 hide-scrollbar" onScroll={handleScroll}>
                    {loading ? (
                        <div className="space-y-4">{[...Array(6)].map((_,i) => <div key={i} className="h-16 bg-slate-200 rounded-2xl animate-pulse dark:bg-[#1e2333]"></div>)}</div>
                    ) : (
                        <div className="space-y-4">
                            {filteredCountries.length > 0 ? (
                                <div className="flex flex-col gap-2.5">
                                    {filteredCountries.slice(0, displayLimit).map((item, index) => (
                                        <button 
                                            key={item.id} 
                                            onClick={() => onSelectCountry(item)} 
                                            className="flex items-center justify-between p-4 rounded-2xl border border-transparent bg-white shadow-sm dark:border-[#2a2e45] dark:bg-[#151924] hover:border-emerald-400 dark:hover:border-emerald-500 transition-all active:scale-[0.98]" 
                                            style={{ animation: `waveFadeIn 0.5s cubic-bezier(0.4, 0, 0.2, 1) forwards`, animationDelay: `${(index % 20) * 0.03}s`, opacity: 0 }}
                                        >
                                            <div className="flex items-center gap-4 min-w-0 flex-1">
                                                <div className="text-2xl w-10 text-center flex justify-center">{getCountryFlag(item.name)}</div>
                                                <span className="font-bold text-slate-700 dark:text-slate-200 text-[15px] truncate tracking-wide">{item.name}</span>
                                            </div>
                                            <ChevronRight size={18} className="text-slate-400 dark:text-slate-500 shrink-0" />
                                        </button>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12 text-slate-400 font-medium bg-white dark:bg-[#151924] rounded-3xl border border-dashed border-slate-200 dark:border-slate-800">
                                    <Globe size={32} className="mx-auto mb-3 opacity-50" />
                                    Negara tidak ditemukan
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
});

const V2ServicesDrawer = memo(({ isOpen, onBack, selectedCountry, services, loading, onSelectService, getOptimizedImage, getCountryFlag }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const deferredSearchTerm = useDeferredValue(searchTerm);
    const [displayLimit, setDisplayLimit] = useState(20);

    useEffect(() => {
        if (!isOpen) {
            setSearchTerm('');
            setDisplayLimit(20); 
        }
    }, [isOpen]);

    const filteredServices = useMemo(() => {
        return services.filter(service =>
          service.name.toLowerCase().includes(deferredSearchTerm.toLowerCase())
        );
    }, [services, deferredSearchTerm]);

    const handleScroll = (e) => {
        const { scrollTop, scrollHeight, clientHeight } = e.target;
        if (scrollTop + clientHeight >= scrollHeight - 50) {
            if (displayLimit < filteredServices.length) {
                setDisplayLimit(prev => prev + 20);
            }
        }
    };

    return (
        <>
            <div className={`fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm transition-opacity ${isOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`} onClick={onBack}></div>
            <div className={`fixed bottom-0 left-0 right-0 z-[60] transform rounded-t-[2rem] bg-white shadow-2xl transition-transform duration-300 dark:bg-[#0d1017] max-h-[90vh] h-[90vh] flex flex-col ${isOpen ? 'translate-y-0' : 'translate-y-full'}`}>
                
                <div className="pt-3 pb-4 px-6 bg-white dark:bg-[#0d1017] rounded-t-[2rem] z-10 border-b border-slate-100 dark:border-[#1e2333]">
                    <div className="mx-auto h-1.5 w-12 rounded-full bg-slate-200 mb-5 dark:bg-slate-700"></div>
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <button onClick={onBack} className="p-2 -ml-2 rounded-full hover:bg-slate-100 dark:hover:bg-[#1e2333] transition-colors"><ChevronRight size={22} className="text-slate-500 rotate-180" /></button>
                            <div>
                                <h2 className="text-xl font-bold text-emerald-700 dark:text-emerald-400 leading-tight flex items-center gap-2">
                                    {selectedCountry ? <>{getCountryFlag(selectedCountry.name)} {selectedCountry.name}</> : 'Server Termurah'}
                                </h2>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Langkah 2: Pilih Layanan</p>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 bg-slate-50 p-3.5 rounded-2xl border border-slate-100 dark:bg-[#1e2333] dark:border-transparent transition-colors focus-within:border-emerald-400 dark:focus-within:border-emerald-500">
                        <Search size={18} className="text-slate-400" />
                        <input 
                            type="text" 
                            placeholder="Cari aplikasi..." 
                            className="bg-transparent w-full outline-none text-sm font-medium text-slate-800 dark:text-white placeholder:text-slate-400" 
                            value={searchTerm} 
                            onChange={(e) => { setSearchTerm(e.target.value); setDisplayLimit(20); }} 
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto px-5 py-5 pb-10 hide-scrollbar" onScroll={handleScroll}>
                    {loading ? (
                        <div className="space-y-4">{[...Array(6)].map((_,i) => <div key={i} className="h-16 bg-slate-200 rounded-2xl animate-pulse dark:bg-[#1e2333]"></div>)}</div>
                    ) : (
                        <div className="space-y-4">
                            {filteredServices.length > 0 ? (
                                <div className="flex flex-col gap-2.5">
                                    {filteredServices.slice(0, displayLimit).map((item, index) => (
                                        <button 
                                            key={item.code} 
                                            onClick={() => onSelectService(item)} 
                                            className="flex items-center justify-between p-4 rounded-2xl border border-transparent bg-white shadow-sm dark:border-[#2a2e45] dark:bg-[#151924] hover:border-emerald-400 dark:hover:border-emerald-500 transition-all active:scale-[0.98]" 
                                            style={{ animation: `waveFadeIn 0.5s cubic-bezier(0.4, 0, 0.2, 1) forwards`, animationDelay: `${(index % 20) * 0.03}s`, opacity: 0 }}
                                        >
                                            <div className="flex items-center gap-4 min-w-0 flex-1">
                                                <div className="bg-slate-50 w-10 h-10 p-1.5 flex items-center justify-center rounded-xl border border-slate-100 dark:bg-slate-800 dark:border-slate-700">
                                                   {item.service_img ? 
                                                       <img src={getOptimizedImage(item.service_img)} className="w-full h-full object-contain" loading="lazy" alt="" />
                                                       : <Smartphone size={18} className="text-slate-400" />
                                                   }
                                                </div>
                                                <span className="font-bold text-slate-700 dark:text-slate-200 text-[15px] truncate tracking-wide">{item.name}</span>
                                            </div>
                                            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30 dark:text-emerald-400 px-3 py-1.5 rounded-lg">
                                                Cek Harga
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12 text-slate-400 font-medium bg-white dark:bg-[#151924] rounded-3xl border border-dashed border-slate-200 dark:border-slate-800">
                                    <Smartphone size={32} className="mx-auto mb-3 opacity-50" />
                                    Layanan tidak ditemukan
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
});


// ================================================================
// --- MAIN COMPONENT ORDER ---
// ================================================================
export default function Order() {
  const { color } = useTheme();
  const navigate = useNavigate();

  // --- STATE DATA UTAMA (V1) ---
  const [balance, setBalance] = useState(0);
  const [ping, setPing] = useState(0);
  const [activeOrders, setActiveOrders] = useState([]);

  const [services, setServices] = useState([]);
  const [countries, setCountries] = useState([]);
  const [opImagesCache, setOpImagesCache] = useState({});

  const [loadingServices, setLoadingServices] = useState(true);
  const [loadingCountries, setLoadingCountries] = useState(false);

  // --- STATE DATA TERMURAH (V2) ---
  const [v2Countries, setV2Countries] = useState([]);
  const [v2Services, setV2Services] = useState([]);
  const [loadingV2Countries, setLoadingV2Countries] = useState(false);
  const [loadingV2Services, setLoadingV2Services] = useState(false);
  
  const [selectedV2Country, setSelectedV2Country] = useState(null);
  const [selectedV2Service, setSelectedV2Service] = useState(null);

  // UI Controls
  const [sheetMode, setSheetMode] = useState(null); 
  const [selectedService, setSelectedService] = useState(null);
  const [expandedCountry, setExpandedCountry] = useState(null);

  // Modals
  const [operatorModal, setOperatorModal] = useState({
      show: false, country: null, provider: null, operators: [], loading: false, processingOpId: null
  });

  const [v2PriceModal, setV2PriceModal] = useState({
      show: false, data: null, loading: false, ordering: false
  });

  const [confirmModal, setConfirmModal] = useState({ show: false, title: '', message: '', onConfirm: null, loading: false, confirmText: 'Ya, Lanjutkan' });
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [expandedFaq, setExpandedFaq] = useState(null);

  const lastFetchRef = useRef(0);

  // Constants Cache
  const CACHE_KEY = 'otp_services_v12';
  const CACHE_TIME = 'otp_services_time_v12';
  const CACHE_DURATION = 60 * 60 * 1000;

  const COUNTRIES_CACHE_PREFIX      = 'otp_countries_v2_';
  const COUNTRIES_CACHE_TIME_PREFIX = 'otp_countries_time_v2_';
  const COUNTRIES_CACHE_DURATION    = 5 * 60 * 1000;

  // Constants Cache V2
  const V2_COUNTRIES_CACHE_KEY  = 'otp_v2_countries';
  const V2_COUNTRIES_CACHE_TIME = 'otp_v2_countries_time';
  const V2_SERVICES_PREFIX      = 'otp_v2_srv_';
  const V2_SERVICES_TIME_PREFIX = 'otp_v2_srv_time_';
  const V2_CACHE_DURATION       = 60 * 60 * 1000; // 1 Jam
  
  const V2_PRICE_PREFIX      = 'otp_v2_price_';
  const V2_PRICE_TIME_PREFIX = 'otp_v2_price_time_';
  const V2_PRICE_DURATION    = 2 * 60 * 1000; // 2 Menit Cache Harga

  const faqData = [
    {
      icon: <Brain size={18} className="text-amber-500" />,
      iconBg: 'bg-amber-500/20',
      question: 'Ayo belajar membaca!',
      answer: 'Pastikan Anda membaca seluruh panduan, informasi server, dan ketentuan layanan sebelum melakukan pemesanan untuk menghindari kesalahpahaman.'
    },
    {
      icon: <Info size={18} className="text-blue-500" />,
      iconBg: 'bg-blue-500/20',
      question: 'OTP gak masuk masuk',
      answer: 'Jika OTP tidak masuk dalam beberapa menit, kemungkinan server tujuan sedang sibuk atau nomor tersebut bermasalah. Anda dapat membatalkan pesanan (setelah 4 menit) dan saldo akan otomatis kembali.'
    },
    {
      icon: <Bug size={18} className="text-amber-500" />,
      iconBg: 'bg-amber-500/20',
      question: 'Cancel tapi saldo terpotong',
      answer: 'Jika Anda sudah menekan batal namun saldo masih terpotong, harap tunggu beberapa saat untuk sinkronisasi sistem, atau coba refresh halaman. Jika masih bermasalah, hubungi Admin kami.'
    },
    {
      icon: <CheckCircle2 size={18} className="text-emerald-500" />,
      iconBg: 'bg-emerald-500/20',
      question: 'Lupa cancel active order',
      answer: 'Order yang dibiarkan aktif (melewati batas waktu 20 menit) dan tidak menerima SMS akan otomatis dibatalkan oleh sistem dan saldo Anda akan dikembalikan.'
    },
    {
      icon: <Eye size={18} className="text-amber-500" />,
      iconBg: 'bg-amber-500/20',
      question: 'Syarat refund',
      answer: 'Saldo akan otomatis direfund sepenuhnya ke akun Anda apabila order dibatalkan (cancel) sebelum SMS OTP berhasil diterima oleh sistem.'
    }
  ];

  useEffect(() => {
    const savedOpImages = localStorage.getItem('operator_images_cache');
    if (savedOpImages) setOpImagesCache(JSON.parse(savedOpImages));

    fetchInitialData();
    
    const interval = setInterval(() => {
        if (!document.hidden) fetchInitialData(true); 
    }, 180000);

    const handleVisibilityChange = () => {
        if (!document.hidden && Date.now() - lastFetchRef.current > 15000) {
            fetchInitialData(true);
        }
    };
  
    document.addEventListener('visibilitychange', handleVisibilityChange);

    let userId = null;
    try {
        const token = localStorage.getItem('token');
        if (token) userId = jwtDecode(token)?.userId || null;
    } catch (e) {}

    const socket = io('https://api.ruangotp.net', {
        auth: { userId },
        transports: ['websocket'],
        reconnectionAttempts: 5,
        reconnectionDelay: 3000,
    });

    socket.on('otp_received', (data) => {
        if (data && data.order_id) {
            setActiveOrders(prevOrders => {
                return prevOrders.map(order => {
                    const orderId = order.order_id || order.id;
                    if (orderId === data.order_id) {
                        return {
                            ...order,
                            status: data.status || 'COMPLETED',
                            otp_code: data.otp_code || order.otp_code,
                            sms_content: data.sms_content || order.sms_content
                        };
                    }
                    return order;
                });
            });
        }
        fetchInitialData(true);
    });

    return () => {
        clearInterval(interval);
        document.removeEventListener('visibilitychange', handleVisibilityChange);
        socket.disconnect();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchInitialData = async (silent = false) => {
    lastFetchRef.current = Date.now();
    const start = Date.now();

    try {
      const resUser = await api.get('/auth/me');
      if (resUser.data.success) setBalance(resUser.data.data.balance);
      
      if(!silent) setPing(Date.now() - start);

      const resHistory = await api.get('/history/list/order');
      if (resHistory.data.success) {
         const filteredOrders = resHistory.data.data;
         setActiveOrders(prevOrders => {
             return filteredOrders.map(fetchedOrder => {
                 const fetchedId = fetchedOrder.order_id || fetchedOrder.id;
                 const existingOrder = prevOrders.find(o => (o.order_id || o.id) === fetchedId);
                 if (existingOrder) {
                     return { ...fetchedOrder, sms_content: fetchedOrder.sms_content || fetchedOrder.sms || existingOrder.sms_content };
                 }
                 return fetchedOrder;
             });
         });
      }
    } catch (e) {}

    if(!silent) loadServicesFromCache();
  };

  const loadServicesFromCache = async () => {
    const cachedData = localStorage.getItem(CACHE_KEY);
    const cachedTime = localStorage.getItem(CACHE_TIME);
    const now = Date.now();

    if (cachedData && cachedTime && (now - parseInt(cachedTime, 10) < CACHE_DURATION)) {
      setServices(JSON.parse(cachedData));
      setLoadingServices(false);
    } else {
      try {
        const res = await api.get('/services/list');
        if (res.data.success) {
          setServices(res.data.data);
          localStorage.setItem(CACHE_KEY, JSON.stringify(res.data.data));
          localStorage.setItem(CACHE_TIME, now.toString());
        }
      } catch (err) { }
      setLoadingServices(false);
    }
  };

  // ================================================================
  // --- FLOW SERVER TERMURAH (V2) LOGIC ---
  // ================================================================
  
  const handleOpenV2 = async () => {
      setSheetMode('v2_countries');
      setLoadingV2Countries(true);
      
      const cached = localStorage.getItem(V2_COUNTRIES_CACHE_KEY);
      const cachedTime = localStorage.getItem(V2_COUNTRIES_CACHE_TIME);
      const now = Date.now();

      if (cached && cachedTime && (now - parseInt(cachedTime, 10) < V2_CACHE_DURATION)) {
          setV2Countries(JSON.parse(cached));
          setLoadingV2Countries(false);
      } else {
          try {
              const res = await api.get('/country-v2/list');
              if (res.data.success) {
                  setV2Countries(res.data.data);
                  localStorage.setItem(V2_COUNTRIES_CACHE_KEY, JSON.stringify(res.data.data));
                  localStorage.setItem(V2_COUNTRIES_CACHE_TIME, now.toString());
              }
          } catch (err) {
              showToast("Gagal memuat negara server termurah", "error");
          } finally {
              setLoadingV2Countries(false);
          }
      }
  };

  const handleV2CountryClick = async (country) => {
      setSelectedV2Country(country);
      setSheetMode('v2_services');
      setV2Services([]);
      setLoadingV2Services(true);

      const cacheKey = V2_SERVICES_PREFIX + country.id;
      const cacheTime = V2_SERVICES_TIME_PREFIX + country.id;
      const now = Date.now();

      setTimeout(async () => {
          try {
              const cached = localStorage.getItem(cacheKey);
              const cachedTimeVal = localStorage.getItem(cacheTime);
              
              if (cached && cachedTimeVal && (now - parseInt(cachedTimeVal, 10) < V2_CACHE_DURATION)) {
                  setV2Services(JSON.parse(cached));
              } else {
                  const res = await api.get(`/services-v2/list?country=${country.id}`);
                  if (res.data.success) {
                      setV2Services(res.data.data);
                      localStorage.setItem(cacheKey, JSON.stringify(res.data.data));
                      localStorage.setItem(cacheTime, now.toString());
                  }
              }
          } catch (err) {
              showToast("Gagal memuat layanan server termurah", "error");
          } finally {
              setLoadingV2Services(false);
          }
      }, 300);
  };

  const handleV2ServiceClick = async (service) => {
      setSelectedV2Service(service);
      setV2PriceModal({ show: true, data: null, loading: true, ordering: false });

      const cacheKey = V2_PRICE_PREFIX + service.code + '_' + selectedV2Country.id;
      const cacheTime = V2_PRICE_TIME_PREFIX + service.code + '_' + selectedV2Country.id;
      const now = Date.now();

      try {
          const cached = localStorage.getItem(cacheKey);
          const cachedTimeVal = localStorage.getItem(cacheTime);

          if (cached && cachedTimeVal && (now - parseInt(cachedTimeVal, 10) < V2_PRICE_DURATION)) {
              setV2PriceModal({ show: true, data: JSON.parse(cached), loading: false, ordering: false });
          } else {
              const res = await api.get(`/cekharga-v2/info?service=${service.code}&country=${selectedV2Country.id}`);
              if (res.data.success) {
                  setV2PriceModal({ show: true, data: res.data.data, loading: false, ordering: false });
                  localStorage.setItem(cacheKey, JSON.stringify(res.data.data));
                  localStorage.setItem(cacheTime, now.toString());
              } else {
                  setV2PriceModal({ show: false, data: null, loading: false, ordering: false });
                  showToast(res.data.message || "Gagal cek harga", "error");
              }
          }
      } catch (err) {
          setV2PriceModal({ show: false, data: null, loading: false, ordering: false });
          showToast("Gagal cek harga layanan", "error");
      }
  };

  const processV2Buy = async (priceData) => {
      if (balance < priceData.price.sell) {
          return showToast("Saldo tidak mencukupi untuk membeli layanan ini!", "error");
      }

      setV2PriceModal(prev => ({ ...prev, ordering: true }));

      try {
          const res = await api.get(`/order-v2/buy?service=${priceData.service}&country=${priceData.country}&expected_price=${priceData.price.sell}`);
          if (res.data.success) {
              setV2PriceModal({ show: false, data: null, loading: false, ordering: false });
              setSheetMode(null); 
              showToast("Order Server Termurah Berhasil!", "success");
              fetchInitialData();
          } else {
              setV2PriceModal(prev => ({ ...prev, ordering: false }));
              showToast(res.data.message || "Order Gagal", "error");
          }
      } catch (err) {
          setV2PriceModal(prev => ({ ...prev, ordering: false }));
          const errorMsg = err.response?.data?.message || err.response?.data?.error?.message || "Gagal memproses order, coba lagi.";
          showToast(errorMsg, "error");
          fetchInitialData(true);
      }
  };

  // ================================================================
  // --- GENERAL HANDLERS ---
  // ================================================================

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast(prev => ({ ...prev, show: false })), 3000);
  };

  const showConfirm = (title, message, action, confirmText = 'Ya, Lanjutkan') => {
      setConfirmModal({ show: true, title, message, onConfirm: action, loading: false, confirmText });
  };

  const closeConfirm = () => {
      setConfirmModal({ show: false, title: '', message: '', onConfirm: null, loading: false, confirmText: 'Ya, Lanjutkan' });
  };

  const handleCopy = (text) => {
      if (!text) return;
      navigator.clipboard.writeText(text);
      showToast("Berhasil disalin!", "success");
  };

  const handleServiceClick = (service) => {
    setSelectedService(service);
    setSheetMode('countries');
    setCountries([]);
    setLoadingCountries(true);
    setExpandedCountry(null);

    const cacheKey     = COUNTRIES_CACHE_PREFIX + service.service_code;
    const cacheTimeKey = COUNTRIES_CACHE_TIME_PREFIX + service.service_code;
    const now          = Date.now();

    setTimeout(async () => {
        try {
          const cachedCountries     = localStorage.getItem(cacheKey);
          const cachedCountriesTime = localStorage.getItem(cacheTimeKey);

          if (cachedCountries && cachedCountriesTime && (now - parseInt(cachedCountriesTime, 10) < COUNTRIES_CACHE_DURATION)) {
            setCountries(JSON.parse(cachedCountries));
          } else {
            const res = await api.get(`/countries/list?service_id=${service.service_code}`);
            if (res.data.success) {
              setCountries(res.data.data);
              localStorage.setItem(cacheKey, JSON.stringify(res.data.data));
              localStorage.setItem(cacheTimeKey, now.toString());
            }
          }
        } catch (err) { 
          showToast("Gagal memuat negara", "error");
        } finally { 
          setLoadingCountries(false); 
        }
    }, 300);
  };

  const toggleCountry = (country) => {
      if (expandedCountry === country.number_id) setExpandedCountry(null); 
      else setExpandedCountry(country.number_id);
  };

  const handleBuyClick = async (country, provider) => {
      if (balance < provider.price) return showToast("Saldo tidak mencukupi!", "error");
      
      setOperatorModal({ show: true, country: country, provider: provider, operators: [], loading: true, processingOpId: null });

      try {
          const res = await api.get(`/operators/list?country=${country.name}&provider_id=${provider.provider_id}`);
          if (res.data.success) {
              const ops = res.data.data;
              setOperatorModal(prev => ({ ...prev, operators: ops, loading: false }));
              
              const currentCache = JSON.parse(localStorage.getItem('operator_images_cache') || '{}');
              let isUpdated = false;
              ops.forEach(op => {
                  if (op.name && op.image && !currentCache[op.name.toUpperCase()]) {
                      currentCache[op.name.toUpperCase()] = op.image;
                      isUpdated = true;
                  }
              });
              if (isUpdated) {
                  localStorage.setItem('operator_images_cache', JSON.stringify(currentCache));
                  setOpImagesCache(currentCache);
              }
          } else {
              setOperatorModal(prev => ({ ...prev, operators: [], loading: false }));
          }
      } catch (err) {
          setOperatorModal(prev => ({ ...prev, operators: [], loading: false }));
      }
  };

  const processBuy = async (country, provider, opId) => {
      setOperatorModal(prev => ({ ...prev, processingOpId: opId }));
      const opIdToSend = opId || 'any';
      const buyUrl = `/orders/buy?number_id=${country.number_id}&provider_id=${provider.provider_id}&operator_id=${opIdToSend}&expected_price=${provider.price}`;
      
      try {
          const res = await api.get(buyUrl);
          if (res.data.success) {
              setOperatorModal(prev => ({ ...prev, show: false, processingOpId: null }));
              showToast("Order Berhasil! Menunggu SMS...", "success");
              fetchInitialData();
          } else {
              setOperatorModal(prev => ({ ...prev, processingOpId: null }));
              let errorMsg = res.data.error?.message || res.data.message || "Order Gagal";
              if (errorMsg.toLowerCase().includes("rate limit") || errorMsg.toLowerCase().includes("please wait")) {
                  errorMsg = "Sistem pusat sedang sibuk. Silakan coba klik order lagi dalam 1-2 detik ya!";
              }
              showToast(errorMsg, "error");
          }
      } catch (err) {
          setOperatorModal(prev => ({ ...prev, processingOpId: null }));
          const errorMsg = err.response?.data?.error?.message || err.response?.data?.message || "Gagal memproses order coba lagi.";
          let finalMsg = errorMsg;
          if (finalMsg.toLowerCase().includes("rate limit") || finalMsg.toLowerCase().includes("please wait")) {
              finalMsg = "Sistem pusat sedang sibuk. Silakan coba klik order lagi";
          }
          showToast(finalMsg, "error");
          fetchInitialData(true);
      }
  };

  const handleCancelClick = (order) => {
     const remaining = calculateRemainingTime(order.created_at, Date.now());
     if (remaining > 0) {
         showConfirm("Belum Bisa Batal", `Pembatalan baru bisa dilakukan setelah 4 menit.\nMohon tunggu ${formatTime(remaining)} lagi.`, closeConfirm, "Saya Mengerti");
         return;
     }

     showConfirm("Batalkan Pesanan?", "Yakin batalkan pesanan? Saldo akan dikembalikan otomatis.", async () => {
         setConfirmModal(prev => ({ ...prev, loading: true }));
         try {
            const targetId = order.order_id || order.id || '';
            
            // LOGIKA PEMISAHAN CANCEL V1 & V2
            const cancelUrl = order.version === 'v2' 
                ? `/order-v2/cancel?order_id=${targetId}` 
                : `/orders/cancel?order_id=${targetId}`;

            await api.get(cancelUrl);
            setActiveOrders(prev => prev.filter(o => (o.order_id || o.id) !== targetId));
            
            closeConfirm();
            showToast("Pesanan dibatalkan", "success");
            fetchInitialData();
         } catch(e) { 
            closeConfirm();
            const errorMsg = e.response?.data?.error?.message || e.response?.data?.message || "Gagal batal";
            showToast(errorMsg, "error");
            fetchInitialData(true);
         }
     });
  };

  const handleCloseOrder = async (orderId) => {
      setActiveOrders(prev => prev.filter(o => (o.order_id || o.id) !== orderId));
      let attempt = 0;
      while (attempt < 3) {
          try {
              await api.post('/cekselesai/tutup', { order_id: orderId });
              break;
          } catch (err) {
              attempt++;
              if (attempt < 3) await new Promise(resolve => setTimeout(resolve, 2000));
          }
      }
  };

  const getOptimizedImage = (url) => {
    if (!url) return "https://cdn-icons-png.flaticon.com/512/1176/1176425.png";
    return url; 
  };

  // ================================================================
  // PERUBAHAN UTAMA: getCountryFlag
  // Sekarang mengembalikan komponen badge yang sangat rapi jika
  // bendera negara tidak ditemukan di dalam dictionary.
  // ================================================================
  const getCountryFlag = (countryName) => {
    if (!countryName) {
        return (
            <div className="inline-flex items-center justify-center w-[1.3em] h-[1.3em] rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-[0.65em] font-bold border border-slate-200 dark:border-slate-700 align-middle shrink-0 shadow-sm">
                ?
            </div>
        );
    }

    const flags = {
      'indonesia': '🇮🇩', 'russia': '🇷🇺', 'united states': '🇺🇸', 'usa': '🇺🇸',
      'united kingdom': '🇬🇧', 'uk': '🇬🇧', 'england': '🇬🇧', 'philippines': '🇵🇭',
      'vietnam': '🇻🇳', 'thailand': '🇹🇭', 'malaysia': '🇲🇾', 'india': '🇮🇳',
      'china': '🇨🇳', 'japan': '🇯🇵', 'south korea': '🇰🇷', 'korea': '🇰🇷',
      'germany': '🇩🇪', 'france': '🇫🇷', 'brazil': '🇧🇷', 'mexico': '🇲🇽',
      'canada': '🇨🇦', 'australia': '🇦🇺', 'nigeria': '🇳🇬', 'pakistan': '🇵🇰',
      'bangladesh': '🇧🇩', 'egypt': '🇪🇬', 'ukraine': '🇺🇦', 'cambodia': '🇰🇭',
      'myanmar': '🇲🇲', 'singapore': '🇸🇬', 'turkey': '🇹🇷', 'iran': '🇮🇷',
      'iraq': '🇮🇶', 'spain': '🇪🇸', 'italy': '🇮🇹', 'poland': '🇵🇱',
      'netherlands': '🇳🇱', 'sweden': '🇸🇪', 'norway': '🇳🇴', 'denmark': '🇩🇰',
      'finland': '🇫🇮', 'ghana': '🇬🇭', 'kenya': '🇰🇪', 'ethiopia': '🇪🇹',
      'colombia': '🇨🇴', 'argentina': '🇦🇷', 'peru': '🇵🇪', 'chile': '🇨🇱',
      'venezuela': '🇻🇪', 'nepal': '🇳🇵', 'sri lanka': '🇱🇰', 'laos': '🇱🇦',
      'portugal': '🇵🇹', 'belgium': '🇧🇪', 'switzerland': '🇨🇭', 'austria': '🇦🇹',
      'saudi arabia': '🇸🇦', 'uae': '🇦🇪', 'united arab emirates': '🇦🇪',
      'israel': '🇮🇱', 'morocco': '🇲🇦', 'tunisia': '🇹🇳', 'algeria': '🇩🇿',
      'global': '🌐', 'any': '🌐',
    };

    const nameLower = countryName.toLowerCase();
    
    // Jika ada di mapping, gunakan emoji bendera aslinya
    if (flags[nameLower]) {
      return flags[nameLower];
    }

    // Jika TIDAK ADA, buat Avatar Bulat (Badge) yang modern & profesional
    const initial = countryName.charAt(0).toUpperCase();
    return (
      <div className="inline-flex items-center justify-center w-[1.3em] h-[1.3em] rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[0.65em] font-bold border border-slate-200 dark:border-slate-700 align-middle shrink-0 shadow-sm">
        {initial}
      </div>
    );
  };

  const getServiceImg = (serviceName) => {
    if (!serviceName || services.length === 0) return null;
    const found = services.find(s => s.service_name?.toLowerCase() === serviceName?.toLowerCase());
    return found?.service_img || null;
  };

  const handleReorder = (order) => {
    if (order.version === 'v2') {
        // Reorder Server Termurah V2
        if (v2Countries.length > 0) {
            const countryV2 = v2Countries.find(c => String(c.id) === String(order.country) || c.name.toLowerCase() === order.countryName?.toLowerCase());
            if (countryV2) {
                handleV2CountryClick(countryV2);
            } else {
                handleOpenV2();
            }
        } else {
            handleOpenV2();
        }
    } else {
        // Reorder Server Utama V1
        const found = services.find(s => s.service_name?.toLowerCase() === order.service?.toLowerCase());
        if (found) {
            handleServiceClick(found);
        } else {
            setSheetMode('services');
        }
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-24 transition-colors duration-300 dark:bg-slate-900">
      
      {/* HEADER */}
      <div className="sticky top-0 z-30 bg-white/80 pb-4 pt-8 backdrop-blur-md dark:bg-slate-950/80 px-5 border-b border-slate-100 dark:border-slate-800">
           <div className="flex items-center justify-between">
              <div>
                  <h1 className="text-xl font-bold text-slate-800 dark:text-white">Order Baru</h1>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"><Wifi size={10} /> Data Center</span>
                    <span className="text-[10px] text-slate-400">{ping}ms latency</span>
                  </div>
              </div>
              <div className="text-right">
                  <p className="text-[10px] text-slate-400">Saldo Anda</p>
                  <p className="text-lg font-bold text-slate-800 dark:text-white">Rp {balance.toLocaleString('id-ID')}</p>
              </div>
           </div>
      </div>

      {/* KONTEN */}
      <div className="px-5 mt-6 space-y-6">
        
        {/* =========================================
            TOMBOL PILIHAN ORDER (UTAMA & TERMURAH)
            ========================================= */}
        <div className="grid grid-cols-1 gap-4">
            
            {/* Tombol Server Utama */}
            <button 
                onClick={() => setSheetMode('services')} 
                className="w-full group relative overflow-hidden rounded-3xl p-6 text-left shadow-xl transition-transform active:scale-95 bg-gradient-to-r from-slate-900 to-slate-800 dark:from-blue-900 dark:to-slate-900"
            >
                <div className="relative z-10 flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold text-white mb-1">Server Utama</h2>
                        <p className="text-slate-300 text-sm opacity-90">(Get Virtual Number)</p>
                    </div>
                    <div className="h-12 w-12 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-sm group-hover:bg-white/20 transition-all">
                        <Plus size={24} className="text-white" />
                    </div>
                </div>
                <div className="absolute -right-6 -bottom-6 opacity-10 rotate-12">
                    <Smartphone size={100} className="text-white" />
                </div>
            </button>

            {/* Tombol Server Termurah (V2) */}
            <button 
                onClick={handleOpenV2} 
                className="w-full group relative overflow-hidden rounded-3xl p-5 text-left shadow-lg transition-transform active:scale-95 bg-gradient-to-r from-emerald-600 to-teal-700 dark:from-emerald-800 dark:to-teal-900"
            >
                <div className="relative z-10 flex items-center justify-between">
                    <div>
                        <h2 className="text-lg font-bold text-white mb-0.5">Server Termurah</h2>
                        <p className="text-emerald-100 text-xs opacity-90">Harga ekonomis, proses instan</p>
                    </div>
                    <div className="h-10 w-10 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-sm group-hover:bg-white/20 transition-all">
                        <Plus size={20} className="text-white" />
                    </div>
                </div>
                <div className="absolute -right-2 -bottom-4 opacity-10 rotate-12">
                    <Globe size={80} className="text-white" />
                </div>
            </button>
            
        </div>

        {/* INFO CARDS */}
        <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-white border border-slate-100 shadow-sm dark:bg-slate-950 dark:border-slate-800">
                <div className="p-2 w-fit rounded-lg bg-emerald-50 text-emerald-600 mb-2 dark:bg-emerald-900/20"><Server size={18} /></div>
                <p className="text-xs text-slate-400">Server Status</p>
                <p className="font-bold text-slate-700 dark:text-slate-200">
                    Online 100%
                </p>
            </div>
            <div className="p-4 rounded-2xl bg-white border border-slate-100 shadow-sm dark:bg-slate-950 dark:border-slate-800">
                <div className="p-2 w-fit rounded-lg bg-blue-50 text-blue-600 mb-2 dark:bg-blue-900/20"><Globe size={18} /></div>
                <p className="text-xs text-slate-400">Total Negara</p>
                <p className="font-bold text-slate-700 dark:text-slate-200">
                    193+ Negara
                </p>
            </div>
        </div>

        {/* KONDISI DAFTAR ORDER AKTIF ATAU EMPTY STATE */}
        {activeOrders.length > 0 ? (
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></div>
                        <h3 className="font-bold text-slate-700 dark:text-slate-300 uppercase text-xs tracking-wider">
                            Pesanan Aktif ({activeOrders.length})
                        </h3>
                    </div>
                    <button
                        onClick={() => { 
                             if (Date.now() - lastFetchRef.current < 3000) {
                                 showToast("Tunggu sebentar sebelum refresh lagi", "error");
                                return;
                             }
                            showToast("Merefresh data...", "success");
                            fetchInitialData(true); 
                        }}
                        className="flex items-center justify-center w-9 h-9 rounded-xl border-2 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    >
                        <RefreshCw size={15} />
                    </button>
                </div>

                {activeOrders.map((order) => {
                    const orderId = order.order_id || order.id || '';
                    
                    // Fallback image handling
                    let serviceImg = null;
                    if (order.version === 'v2') {
                        // Jika V2 dan tidak ada logic fetch img history, bisa fallback ke icon smartphone
                        serviceImg = null; 
                    } else {
                        serviceImg = getServiceImg(order.service);
                    }
                    
                    const otpDisplay = order.otp_code || (order.sms_content?.match(/\d+/)?.[0]) || '';
                    const smsText = order.sms_content || order.sms || order.message || 
                        (otpDisplay ? `Kode OTP ${order.service || ''} Anda adalah: ${otpDisplay}` : 'Pesan kosong diterima dari server.');

                    // V2 tidak pakai operator, fallback ke 'any'
                    const operatorName = order.version === 'v2' ? 'any' : (order.operator || 'any');
                    const isOpAny = operatorName.toLowerCase() === 'any' || operatorName.toLowerCase() === 'random';
                    const opImgCached = opImagesCache[operatorName.toUpperCase()];

                    const finalCountryName = order.countryName || order.country;

                    return (
                        <ActiveOrderCard
                            key={orderId}
                            order={order}
                            color={color}
                            onCopy={handleCopy}
                            onCancel={() => handleCancelClick(order)}
                            onClose={() => handleCloseOrder(orderId)}
                            onReorder={() => handleReorder(order)}
                            onShowToast={showToast}
                            getOptimizedImage={getOptimizedImage}
                            serviceImg={serviceImg}
                            countryFlag={getCountryFlag(finalCountryName)}
                            opImgCached={opImgCached}
                            otpDisplay={otpDisplay}
                            smsText={smsText}
                            operatorName={operatorName}
                            isOpAny={isOpAny}
                        />
                    );
                })}

                <p className="text-[10px] text-slate-400 text-center mt-3">Otomatis refresh setiap 3 menit (Mode Penghematan Sistem).</p>
            </div>
        ) : (
            <div className="flex flex-col items-center justify-center py-10 px-4 text-center rounded-3xl border border-dashed border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950/50 animate-in fade-in zoom-in duration-300">
                <div className="w-20 h-20 bg-slate-100 dark:bg-slate-900 rounded-full flex items-center justify-center mb-4">
                    <ShoppingBag size={32} className="text-slate-400 dark:text-slate-500" />
                </div>
                <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">Belum Ada Pesanan</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 max-w-[250px]">
                    Anda belum memiliki pesanan virtual number yang aktif saat ini.
                </p>
                
                <div className="flex gap-3 w-full max-w-[250px]">
                    <button 
                        onClick={() => navigate('/history')}
                        className={`flex-1 flex flex-col items-center justify-center gap-2 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 transition-colors active:scale-95 ${color.text} hover:border-blue-200`}
                    >
                        <History size={20} />
                        <span className="text-[10px] font-bold">Riwayat OTP</span>
                     </button>
                    
                    <button 
                        onClick={() => navigate('/deposit')}
                        className={`flex-1 flex flex-col items-center justify-center gap-2 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 transition-colors active:scale-95 ${color.text} hover:border-blue-200`}
                    >
                        <Wallet size={20} />
                        <span className="text-[10px] font-bold">Isi Saldo</span>
                     </button>
                </div>
            </div>
        )}

        {/* FAQ SECTION */}
        <div className="mt-8 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950">
            <div className="mb-5 flex items-center gap-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-900/30">
                    <Headphones size={24} className="text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                    <h3 className="font-bold text-slate-800 dark:text-white">Pertanyaan Umum</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Pertanyaan yang sering di ajukan</p>
                </div>
            </div>

            <div className="space-y-3">
                {faqData.map((faq, index) => {
                    const isOpen = expandedFaq === index;
                    return (
                        <div key={index} className="overflow-hidden rounded-2xl border border-slate-100 transition-colors dark:border-slate-800 dark:bg-slate-900/50">
                            <button
                                onClick={() => setExpandedFaq(isOpen ? null : index)}
                                className="flex w-full items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                            >
                                <div className="flex items-center gap-3">
                                    <div className={`flex h-8 w-8 items-center justify-center rounded-full ${faq.iconBg}`}>
                                        {faq.icon}
                                    </div>
                                    <span className="text-sm font-bold text-slate-700 dark:text-slate-200">{faq.question}</span>
                                </div>
                                <div className="text-slate-400">
                                    {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                </div>
                            </button>
                            {isOpen && (
                                <div className="border-t border-slate-100 p-4 text-xs leading-relaxed text-slate-600 dark:border-slate-800 dark:text-slate-400">
                                    {faq.answer}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>

        {/* KETENTUAN LAYANAN BOX */}
        <div className="mt-4 overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-br from-slate-100 to-white p-5 shadow-sm dark:border-slate-800 dark:from-slate-900 dark:to-slate-950 relative">
            <div className="relative z-10 flex items-center justify-between">
                <div className="pr-4">
                    <h3 className="mb-1 text-sm font-bold text-slate-800 dark:text-white">Baca Ketentuan Layanan</h3>
                    <p className="text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                        Hindari kesalahan dan pemotongan saldo. Pahami aturan main kami agar transaksi lancar!
                    </p>
                </div>
                <div className="shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900/30 mb-2">
                     <FileText size={24} className="text-blue-600 dark:text-blue-400"/>
                </div>
             </div>
            <button
                onClick={() => navigate('/ketentuan')}
                className={`mt-4 w-full rounded-xl py-3 text-sm font-bold text-white transition-transform active:scale-95 ${color.btn} flex justify-center items-center gap-2`}
            >
                <BookOpen size={16} /> Baca Sekarang
            </button>
        </div>

      </div>

      {/* =========================================================
          MODAL UNTUK KONFIRMASI HARGA & ORDER (SERVER TERMURAH V2)
          ========================================================= */}
      {v2PriceModal.show && (
          <div 
              className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm sm:p-5 animate-in fade-in duration-200" 
              onClick={() => !v2PriceModal.ordering && setV2PriceModal({ show: false, data: null, loading: false, ordering: false })}
          >
              <div 
                  className="bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-3xl w-full max-w-sm p-6 shadow-2xl animate-in slide-in-from-bottom sm:slide-in-from-bottom-0 border border-slate-100 dark:border-slate-800" 
                  onClick={e => e.stopPropagation()}
              >
                  {v2PriceModal.loading ? (
                      <div className="flex flex-col items-center justify-center py-8">
                          <Loader2 size={36} className="text-emerald-500 animate-spin mb-4" />
                          <p className="text-slate-500 font-medium">Mengecek harga realtime...</p>
                      </div>
                  ) : v2PriceModal.data ? (
                      <div>
                          <div className="flex items-center justify-between mb-5 border-b border-slate-100 dark:border-slate-800 pb-4">
                              <h3 className="text-lg font-bold text-slate-800 dark:text-white">Detail Pesanan</h3>
                              <button 
                                  onClick={() => !v2PriceModal.ordering && setV2PriceModal({ show: false, data: null, loading: false, ordering: false })} 
                                  className="text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors"
                              >
                                  <X size={20} />
                              </button>
                          </div>

                          <div className="space-y-4 mb-6">
                              <div className="flex justify-between items-center">
                                  <span className="text-sm text-slate-500">Layanan</span>
                                  <span className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
                                      {v2PriceModal.data.name}
                                  </span>
                              </div>
                              <div className="flex justify-between items-center">
                                  <span className="text-sm text-slate-500">Negara</span>
                                  <span className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
                                      {getCountryFlag(v2PriceModal.data.countryName)} {v2PriceModal.data.countryName}
                                  </span>
                              </div>
                              <div className="flex justify-between items-center">
                                  <span className="text-sm text-slate-500">Sisa Stok</span>
                                  <span className={`font-bold text-sm px-2 py-0.5 rounded ${v2PriceModal.data.stock > 0 ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-red-100 text-red-700'}`}>
                                      {v2PriceModal.data.stock} Tersedia
                                  </span>
                              </div>
                              <div className="flex justify-between items-center pt-2 border-t border-slate-100 dark:border-slate-800">
                                  <span className="text-sm font-bold text-slate-800 dark:text-slate-200">Total Harga</span>
                                  <span className="text-xl font-black text-emerald-600 dark:text-emerald-400">
                                      Rp {v2PriceModal.data.price?.sell?.toLocaleString('id-ID') || 0}
                                  </span>
                              </div>
                          </div>

                          <button 
                              onClick={() => processV2Buy(v2PriceModal.data)}
                              disabled={v2PriceModal.ordering || v2PriceModal.data.stock <= 0}
                              className={`w-full py-3.5 rounded-xl font-bold text-white flex items-center justify-center gap-2 transition-transform active:scale-95 ${v2PriceModal.ordering || v2PriceModal.data.stock <= 0 ? 'bg-slate-400 cursor-not-allowed' : 'bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-600/30'}`}
                          >
                              {v2PriceModal.ordering ? (
                                  <><Loader2 size={18} className="animate-spin" /> Memproses...</>
                              ) : v2PriceModal.data.stock <= 0 ? (
                                  'Stok Habis'
                              ) : (
                                  <><ShoppingBag size={18} /> Beli Sekarang</>
                              )}
                          </button>
                      </div>
                  ) : (
                      <div className="text-center py-6 text-slate-500">Gagal memuat detail harga.</div>
                  )}
              </div>
          </div>
      )}

      {/* MODAL OPERATOR SELULER (SERVER UTAMA V1) */}
      {operatorModal.show && (
          <div 
              className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-5 animate-in fade-in duration-200" 
              onClick={() => !operatorModal.processingOpId && setOperatorModal(prev => ({...prev, show: false}))}
          >
              <div 
                  className="bg-[#111827] rounded-[2rem] w-full max-w-sm p-6 shadow-2xl scale-100 border border-slate-800" 
                  onClick={e => e.stopPropagation()}
              >
                  <div className="flex items-center justify-between mb-5">
                      <h3 className="text-lg font-bold text-white tracking-wide">Pilih Operator Seluler</h3>
                      <button 
                          onClick={() => !operatorModal.processingOpId && setOperatorModal(prev => ({...prev, show: false}))} 
                          className="text-slate-400 hover:text-white transition-colors"
                      >
                          <X size={20} />
                      </button>
                  </div>

                  {operatorModal.loading ? (
                      <div className="flex gap-4 overflow-x-auto hide-scrollbar pb-2">
                          {[1,2,3].map(i => (
                              <div key={i} className="min-w-[100px] h-[130px] bg-slate-800 animate-pulse rounded-2xl shrink-0"></div>
                          ))}
                      </div>
                  ) : operatorModal.operators.length > 0 ? (
                      <div className="flex gap-4 overflow-x-auto hide-scrollbar pb-2 -mx-2 px-2">
                          
                          {/* Opsi ACAK / ANY */}
                          <button
                              onClick={() => processBuy(operatorModal.country, operatorModal.provider, 'any')}
                              disabled={operatorModal.processingOpId !== null}
                              className={`min-w-[100px] h-[130px] bg-white rounded-2xl p-4 flex flex-col items-center justify-between shrink-0 relative overflow-hidden transition-transform active:scale-95 border border-slate-100 ${operatorModal.processingOpId === 'any' ? 'opacity-90 scale-95' : operatorModal.processingOpId !== null ? 'opacity-50' : 'hover:shadow-md'}`}
                          >
                              <div className="flex-1 flex items-center justify-center">
                                  <span className="text-4xl">🎲</span>
                              </div>
                              <span className="font-bold text-slate-400 text-[13px] w-full text-center truncate">Acak</span>

                              {operatorModal.processingOpId === 'any' && (
                                  <div className="absolute inset-0 bg-white/70 backdrop-blur-[2px] flex items-center justify-center">
                                      <Loader2 size={28} className="animate-spin text-blue-600" />
                                  </div>
                              )}
                          </button>

                          {/* List Operator */}
                          {operatorModal.operators.filter(op => op.name !== 'any').map((op) => {
                              const opIdentifier = op.id || op.name;
                              const isProcessing = operatorModal.processingOpId === opIdentifier;
                              return (
                                  <button
                                      key={opIdentifier}
                                      onClick={() => processBuy(operatorModal.country, operatorModal.provider, opIdentifier)}
                                      disabled={operatorModal.processingOpId !== null}
                                      className={`min-w-[100px] h-[130px] bg-white rounded-2xl p-4 flex flex-col items-center justify-between shrink-0 relative overflow-hidden transition-transform active:scale-95 border border-slate-100 ${isProcessing ? 'opacity-90 scale-95' : operatorModal.processingOpId !== null ? 'opacity-50' : 'hover:shadow-md'}`}
                                  >
                                      <div className="flex-1 flex items-center justify-center w-full">
                                          {op.image ? (
                                              <img src={getOptimizedImage(op.image)} className="w-14 h-14 object-contain" alt={op.name} />
                                          ) : (
                                              <span className="text-3xl">📡</span>
                                          )}
                                      </div>
                                      <span className="font-bold text-slate-400 text-[13px] w-full text-center truncate capitalize">{op.name}</span>

                                      {isProcessing && (
                                          <div className="absolute inset-0 bg-white/70 backdrop-blur-[2px] flex items-center justify-center">
                                              <Loader2 size={28} className="animate-spin text-blue-600" />
                                          </div>
                                      )}
                                  </button>
                              );
                          })}
                      </div>
                  ) : (
                      <div className="text-center py-6 text-slate-400">
                          <p className="mb-4 text-sm">Tidak ada operator spesifik tersedia.</p>
                          <button 
                              onClick={() => processBuy(operatorModal.country, operatorModal.provider, 'any')} 
                              disabled={operatorModal.processingOpId !== null}
                              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold w-full transition-colors flex justify-center items-center gap-2"
                          >
                              {operatorModal.processingOpId === 'any' ? <Loader2 size={16} className="animate-spin" /> : null}
                              Order Acak (Any)
                          </button>
                      </div>
                  )}
              </div>
          </div>
      )}

      {/* CONFIRM MODAL UTAMA */}
      {confirmModal.show && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-5 animate-in fade-in duration-200">
              <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-sm p-6 shadow-2xl scale-100 border border-slate-100 dark:border-slate-800">
                  <div className="flex flex-col items-center text-center">
                      <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/20 rounded-full flex items-center justify-center mb-4 text-blue-600 dark:text-blue-400"><HelpCircle size={32} /></div>
                      <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">{confirmModal.title}</h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 whitespace-pre-line leading-relaxed">{confirmModal.message}</p>
                      <div className="flex gap-3 w-full">
                          {confirmModal.confirmText !== 'Saya Mengerti' && <button onClick={closeConfirm} disabled={confirmModal.loading} className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-600 font-bold text-sm hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300">Batal</button>}
                          <button onClick={confirmModal.onConfirm} disabled={confirmModal.loading} className="flex-1 py-3 rounded-xl bg-blue-600 text-white font-bold text-sm hover:bg-blue-700 flex items-center justify-center gap-2">
                              {confirmModal.loading && <Loader2 size={16} className="animate-spin" />}
                              {confirmModal.loading ? 'Memproses...' : confirmModal.confirmText}
                          </button>
                      </div>
                  </div>
              </div>
          </div>
      )}

      <div className={`fixed bottom-24 left-1/2 z-[150] flex -translate-x-1/2 transform items-center gap-3 rounded-full px-5 py-3 shadow-2xl transition-all duration-300 ${toast.show ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0 pointer-events-none'} ${toast.type === 'success' ? 'bg-slate-900 text-white' : 'bg-red-500 text-white'}`}>
          {toast.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}<span className="text-sm font-bold">{toast.message}</span>
      </div>

      {/* IMPLEMENTASI DRAWERS V1 */}
      <ServicesDrawer
          isOpen={sheetMode === 'services'}
          onClose={() => setSheetMode(null)}
          services={services}
          loading={loadingServices}
          onSelectService={handleServiceClick}
          getOptimizedImage={getOptimizedImage}
      />

      <CountriesDrawer
          isOpen={sheetMode === 'countries'}
          onBack={() => setSheetMode('services')}
          selectedService={selectedService}
          countries={countries}
          loading={loadingCountries}
          expandedCountry={expandedCountry}
          onToggleCountry={toggleCountry}
          getOptimizedImage={getOptimizedImage}
          onBuyClick={handleBuyClick}
      />

      {/* IMPLEMENTASI DRAWERS V2 (TERMURAH) */}
      <V2CountriesDrawer
          isOpen={sheetMode === 'v2_countries'}
          onClose={() => setSheetMode(null)}
          countries={v2Countries}
          loading={loadingV2Countries}
          onSelectCountry={handleV2CountryClick}
          getCountryFlag={getCountryFlag}
      />

      <V2ServicesDrawer
          isOpen={sheetMode === 'v2_services'}
          onBack={() => setSheetMode('v2_countries')}
          selectedCountry={selectedV2Country}
          services={v2Services}
          loading={loadingV2Services}
          onSelectService={handleV2ServiceClick}
          getOptimizedImage={getOptimizedImage}
          getCountryFlag={getCountryFlag}
      />

      <BottomNav />
    </div>
  );
}