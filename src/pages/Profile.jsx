import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import BottomNav from '../components/BottomNav';
import { useTheme } from '../context/ThemeContext';
import { 
  User, LogOut, Wallet, ShoppingBag, Calendar, 
  ChevronRight, Send, MessageCircle, Moon, Sun, 
  CreditCard, Loader2, Copy, Palette, CheckCircle, Monitor,
  Smartphone, Eye, EyeOff, ShieldCheck, Plus, Trash2, Globe, X,
  AlertCircle, HelpCircle, Code2, RefreshCw // <--- Tambah Icon RefreshCw
} from 'lucide-react';

export default function Profile() {
  const { mode, setMode, accent, setAccent, color } = useTheme(); 
  const navigate = useNavigate();
  
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({ orders: 0, deposits: 0 });
  const [loading, setLoading] = useState(true);
  
  // Whitelist States
  const [whitelist, setWhitelist] = useState(null);
  const [whitelistLoading, setWhitelistLoading] = useState(false);
  const [showWhitelistModal, setShowWhitelistModal] = useState(false);
  const [ipInput, setIpInput] = useState('');

  // State untuk visibilitas ID
  const [showId, setShowId] = useState(false);

  // State Modal Global
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showThemeModal, setShowThemeModal] = useState(false);
  
  // --- STATE BARU UNTUK CHANGE ID ---
  const [showChangeIdModal, setShowChangeIdModal] = useState(false);
  const [changeIdLoading, setChangeIdLoading] = useState(false);

  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [confirmModal, setConfirmModal] = useState({ show: false, title: '', message: '', onConfirm: null, loading: false });

  useEffect(() => {
    fetchUserData();
    fetchWhitelist();
  }, []);

  const fetchUserData = async () => {
    setLoading(true);
    try {
      const resUser = await api.get('/auth/me');
      const resOrders = await api.get('/history/list');
      const resDeposits = await api.get('/deposit/history');

      if (resUser.data.success) {
        setUser(resUser.data.data);
      }

      setStats({
        orders: resOrders.data.success ? resOrders.data.data.length : 0,
        deposits: resDeposits.data.success ? resDeposits.data.data.length : 0
      });

    } catch (err) {
      console.error("Gagal memuat profil", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchWhitelist = async () => {
    try {
      const res = await api.get('/whitelist/list');
      if (res.data.success) {
        setWhitelist(res.data.data);
      }
    } catch (err) {
      console.error("Gagal memuat whitelist", err);
    }
  };

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast(prev => ({ ...prev, show: false })), 3000);
  };

  // --- FUNGSI CHANGE ID (APIKEY) ---
  const processChangeId = async () => {
    setChangeIdLoading(true);
    try {
      // Panggil endpoint backend yang sudah kita buat sebelumnya
      const res = await api.post('/change_id'); 
      
      if (res.data.success) {
        // 1. Update Token di LocalStorage (PENTING!)
        if (res.data.data.token) {
            localStorage.setItem('token', res.data.data.token);
        }

        // 2. Update UI dengan ID Baru
        setUser(prev => ({ ...prev, id: res.data.data.new_id }));
        
        // 3. Tutup Modal & Show Toast
        setShowChangeIdModal(false);
        showToast("Apikey (ID) Berhasil diperbarui!", "success");
      }
    } catch (err) {
      const msg = err.response?.data?.error?.message || "Gagal mengganti ID";
      showToast(msg, "error");
    } finally {
      setChangeIdLoading(false);
    }
  };

  const handleAddWhitelist = async () => {
    if (!ipInput) return;
    setWhitelistLoading(true);
    try {
      const res = await api.post('/whitelist/add', { ip: ipInput });
      if (res.data.success) {
        setWhitelist(res.data.data);
        setIpInput('');
        setShowWhitelistModal(false);
        showToast("IP Berhasil ditambahkan!", "success");
      }
    } catch (err) {
      showToast(err.response?.data?.error?.message || "Gagal menambah IP", "error");
    } finally {
      setWhitelistLoading(false);
    }
  };

  const handleRemoveWhitelistRequest = () => {
      setConfirmModal({
          show: true,
          title: "Hapus Whitelist?",
          message: "Akses API dari server Anda akan ditolak jika IP ini dihapus.",
          onConfirm: processRemoveWhitelist
      });
  };

  const processRemoveWhitelist = async () => {
    setConfirmModal(prev => ({ ...prev, loading: true }));
    try {
      const res = await api.post('/whitelist/remove');
      if (res.data.success) {
        setWhitelist(null);
        showToast("IP Berhasil dihapus", "success");
      }
    } catch (err) {
      showToast("Gagal menghapus IP", "error");
    } finally {
        setConfirmModal({ show: false, title: '', message: '', onConfirm: null, loading: false });
    }
  };

  const confirmLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const handleCopyId = () => {
    if (user?.id) {
        navigator.clipboard.writeText(user.id);
        showToast("ID Berhasil disalin!", "success");
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    try {
      return new Date(dateString).toLocaleDateString('id-ID', {
        day: 'numeric', month: 'long', year: 'numeric'
      });
    } catch (e) { return '-'; }
  };

  const getAccentText = () => {
    switch(accent) {
      case 'violet': return 'text-violet-600';
      case 'emerald': return 'text-emerald-600';
      default: return 'text-blue-600';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-28 transition-colors duration-300 dark:bg-slate-900">
      
      {/* --- HEADER --- */}
      <div className="sticky top-0 z-30 bg-white/80 px-5 pt-8 pb-4 backdrop-blur-md border-b border-slate-100 dark:bg-slate-950/80 dark:border-slate-800">
        <h1 className="text-xl font-bold text-slate-800 dark:text-white">Profil Saya</h1>
      </div>

      <div className="px-5 mt-6 space-y-6">
        
        {/* 1. KARTU USER (Dinamis Sesuai Accent) */}
        <div className={`relative overflow-hidden rounded-3xl p-6 text-white shadow-xl transition-all duration-500
            ${accent === 'violet' ? 'bg-gradient-to-r from-violet-900 to-purple-900 dark:from-violet-950 dark:to-slate-950' : 
              accent === 'emerald' ? 'bg-gradient-to-r from-emerald-900 to-teal-900 dark:from-emerald-950 dark:to-slate-950' : 
              'bg-gradient-to-r from-slate-900 to-slate-800 dark:from-blue-900 dark:to-slate-950'}
          `}>
          <div className="relative z-10 flex items-center gap-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-white/10 backdrop-blur-sm text-2xl font-bold border border-white/20">
              {loading ? <Loader2 className="animate-spin" /> : user?.username?.charAt(0).toUpperCase()}
            </div>
            
            <div className="flex-1 min-w-0">
              {loading ? (
                <div className="space-y-2">
                  <div className="h-4 w-32 bg-white/20 rounded animate-pulse"></div>
                  <div className="h-3 w-24 bg-white/20 rounded animate-pulse"></div>
                </div>
              ) : (
                <>
                  <h2 className="text-lg font-bold truncate">{user?.username}</h2>
                  <p className="text-sm text-slate-300 truncate">{user?.email}</p>
                  
                  <div className="mt-2 flex flex-wrap gap-2">
                      <div className="flex items-center gap-2 rounded-lg bg-black/30 px-2 py-1 text-[10px] text-slate-200 border border-white/10">
                        <span className="font-mono opacity-80">
                            ID: {showId ? user?.id : '••••••••'}
                        </span>
                        
                        {/* Tombol Mata */}
                        <button 
                            onClick={() => setShowId(!showId)} 
                            className="hover:text-white transition-colors"
                        >
                            {showId ? <EyeOff size={10} /> : <Eye size={10} />}
                        </button>

                        <div className="h-3 w-[1px] bg-white/20 mx-0.5"></div>

                        {/* Tombol Copy */}
                        <button 
                            onClick={handleCopyId} 
                            className="hover:text-white transition-colors"
                        >
                            <Copy size={10} />
                        </button>
                      </div>
                  </div>

                  <div className="mt-2 flex flex-col items-start gap-1">
                    <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                        <Calendar size={10} />
                        Terdaftar: {formatDate(user?.created_at)}
                    </div>
                    
                    {/* --- TOMBOL CHANGE APIKEY (BARU) --- */}
                    <button 
                        onClick={() => setShowChangeIdModal(true)}
                        className="flex items-center gap-1.5 text-[10px] font-bold text-blue-300 hover:text-white transition-colors bg-white/5 px-2 py-0.5 rounded-md border border-white/10"
                    >
                        <RefreshCw size={10} />
                        Change Apikey
                    </button>
                  </div>

                </>
              )}
            </div>
          </div>
          
          <div className="absolute -right-4 -bottom-4 text-white/5 rotate-12 pointer-events-none">
            <User size={120} />
          </div>
        </div>

        {/* 2. STATISTIK */}
        <div className="grid grid-cols-3 gap-3">
           <div className="rounded-2xl bg-white p-3 border border-slate-100 shadow-sm flex flex-col items-center justify-center text-center dark:bg-slate-950 dark:border-slate-800">
              <div className={`mb-2 p-2 rounded-full ${accent === 'emerald' ? 'bg-emerald-50 text-emerald-600' : accent === 'violet' ? 'bg-violet-50 text-violet-600' : 'bg-blue-50 text-blue-600'} dark:bg-opacity-20`}>
                <Wallet size={18} />
              </div>
              <p className="text-[10px] text-slate-400">Sisa Saldo</p>
              <p className="text-xs font-bold text-slate-800 dark:text-white truncate w-full">
                {loading ? '...' : `Rp ${user?.balance?.toLocaleString('id-ID')}`}
              </p>
           </div>

           <div className="rounded-2xl bg-white p-3 border border-slate-100 shadow-sm flex flex-col items-center justify-center text-center dark:bg-slate-950 dark:border-slate-800">
              <div className={`mb-2 p-2 rounded-full ${accent === 'emerald' ? 'bg-teal-50 text-teal-600' : accent === 'violet' ? 'bg-purple-50 text-purple-600' : 'bg-sky-50 text-sky-600'} dark:bg-opacity-20`}>
                <ShoppingBag size={18} />
              </div>
              <p className="text-[10px] text-slate-400">Total Order</p>
              <p className="text-xs font-bold text-slate-800 dark:text-white">
                {loading ? '...' : `${stats.orders}x`}
              </p>
           </div>

           <div className="rounded-2xl bg-white p-3 border border-slate-100 shadow-sm flex flex-col items-center justify-center text-center dark:bg-slate-950 dark:border-slate-800">
              <div className={`mb-2 p-2 rounded-full ${accent === 'emerald' ? 'bg-green-50 text-green-600' : accent === 'violet' ? 'bg-fuchsia-50 text-fuchsia-600' : 'bg-indigo-50 text-indigo-600'} dark:bg-opacity-20`}>
                <CreditCard size={18} />
              </div>
              <p className="text-[10px] text-slate-400">Deposit</p>
              <p className="text-xs font-bold text-slate-800 dark:text-white">
                {loading ? '...' : `${stats.deposits}x`}
              </p>
           </div>
        </div>

        {/* 3. PUSAT BANTUAN */}
        <div>
          <h3 className="mb-3 px-1 text-sm font-bold text-slate-500 dark:text-slate-400">Pusat Bantuan</h3>
          <div className="overflow-hidden rounded-2xl bg-white border border-slate-100 shadow-sm dark:bg-slate-950 dark:border-slate-800">
            
            <a href="https://t.me/ruangotp" target="_blank" rel="noreferrer" className="flex items-center justify-between p-4 transition-colors hover:bg-slate-50 dark:hover:bg-slate-900 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className={`flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300`}>
                    <Send size={18} className="-ml-0.5 mt-0.5" />
                </div>
                <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Saluran Telegram</span>
              </div>
              <ChevronRight size={18} className="text-slate-400" />
            </a>

            <a href="https://t.me/cs_ruangotp" target="_blank" rel="noreferrer" className="flex items-center justify-between p-4 transition-colors hover:bg-slate-50 dark:hover:bg-slate-900">
              <div className="flex items-center gap-3">
                <div className={`flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300`}>
                    <MessageCircle size={18} />
                </div>
                <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Hubungi CS</span>
              </div>
              <ChevronRight size={18} className="text-slate-400" />
            </a>

          </div>
        </div>

        {/* 4. KEAMANAN (WHITELIST IP & DOKUMENTASI) */}
        <div>
          <h3 className="mb-3 px-1 text-sm font-bold text-slate-500 dark:text-slate-400">Developer Tools</h3>
          <div className="overflow-hidden rounded-2xl bg-white border border-slate-100 shadow-sm dark:bg-slate-950 dark:border-slate-800">
            
            {/* Whitelist IP Row */}
            {!whitelist ? (
              <button 
                onClick={() => setShowWhitelistModal(true)} 
                className="w-full flex items-center justify-between p-4 transition-colors hover:bg-slate-50 dark:hover:bg-slate-900 border-b border-slate-100 dark:border-slate-800"
              >
                <div className="flex items-center gap-3">
                  <div className={`flex h-9 w-9 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-opacity-20`}>
                    <ShieldCheck size={18} />
                  </div>
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Whitelist IP</span>
                </div>
                <div className="flex items-center gap-2">
                   <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 dark:bg-slate-800">Belum Set</span>
                   <Plus size={18} className="text-slate-400" />
                </div>
              </button>
            ) : (
              <div className="w-full flex items-center justify-between p-4 bg-white dark:bg-slate-950 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <div className={`flex h-9 w-9 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-opacity-20`}>
                    <Globe size={18} />
                  </div>
                  <div>
                    <span className="text-xs block font-bold text-slate-400 uppercase tracking-tighter">Whitelisted IP</span>
                    <span className="text-sm font-mono font-bold text-slate-700 dark:text-slate-200">{whitelist.ip}</span>
                  </div>
                </div>
                <button 
                  onClick={handleRemoveWhitelistRequest}
                  className="p-2 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/20 transition-colors"
                >
                   <Trash2 size={18} />
                </button>
              </div>
            )}

            {/* DOKUMENTASI API ROW */}
            <button 
              onClick={() => navigate('/api/dev')} 
              className="w-full flex items-center justify-between p-4 transition-colors hover:bg-slate-50 dark:hover:bg-slate-900"
            >
              <div className="flex items-center gap-3">
                <div className={`flex h-9 w-9 items-center justify-center rounded-full bg-violet-100 text-violet-600 dark:bg-opacity-20`}>
                  <Code2 size={18} />
                </div>
                <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Dokumentasi API</span>
              </div>
              <ChevronRight size={18} className="text-slate-400" />
            </button>

          </div>
        </div>

        {/* 5. APLIKASI */}
        <div>
          <h3 className="mb-3 px-1 text-sm font-bold text-slate-500 dark:text-slate-400">Aplikasi</h3>
          <div className="overflow-hidden rounded-2xl bg-white border border-slate-100 shadow-sm dark:bg-slate-950 dark:border-slate-800">
            
            {/* BUTTON BUKA MODAL TEMA */}
            <button 
              onClick={() => setShowThemeModal(true)} 
              className="w-full flex items-center justify-between p-4 transition-colors hover:bg-slate-50 dark:hover:bg-slate-900 border-b border-slate-100 dark:border-slate-800"
            >
              <div className="flex items-center gap-3">
                <div className={`flex h-9 w-9 items-center justify-center rounded-full ${accent === 'violet' ? 'bg-violet-100 text-violet-600' : accent === 'emerald' ? 'bg-emerald-100 text-emerald-600' : 'bg-blue-100 text-blue-600'} dark:bg-opacity-20`}>
                  <Palette size={18} />
                </div>
                <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Tampilan Aplikasi</span>
              </div>
              <div className="flex items-center gap-2">
                 <span className="text-xs text-slate-400 font-medium capitalize">
                   {mode === 'system' ? 'Otomatis' : mode === 'dark' ? 'Gelap' : 'Terang'} • {accent}
                 </span>
                 <ChevronRight size={18} className="text-slate-400" />
              </div>
            </button>

            <button onClick={() => setShowLogoutModal(true)} className="w-full flex items-center justify-between p-4 transition-colors hover:bg-red-50 dark:hover:bg-red-900/10 group">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-red-100 text-red-600 dark:bg-red-900/30 group-hover:bg-red-200 dark:group-hover:bg-red-900/50 transition-colors">
                  <LogOut size={18} className="ml-0.5" />
                </div>
                <span className="text-sm font-medium text-red-600 dark:text-red-400">Keluar Akun</span>
              </div>
            </button>

          </div>
        </div>

      </div>

      {/* --- WHITELIST IP MODAL --- */}
      {showWhitelistModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-5 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl scale-100 border border-slate-100 dark:border-slate-800">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-slate-800 dark:text-white">Tambah Whitelist</h3>
                <button onClick={() => setShowWhitelistModal(false)} className="text-slate-400"><X size={20}/></button>
              </div>
              
              <div className="mb-6">
                <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Alamat IP (v4/v6)</label>
                <div className="relative">
                  <input 
                    type="text"
                    value={ipInput}
                    onChange={(e) => setIpInput(e.target.value)}
                    placeholder="Contoh: 1.1.1.1"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl py-4 px-5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white transition-all"
                  />
                </div>
                <p className="mt-3 text-[10px] text-slate-400 leading-relaxed">
                  Hanya 1 IP yang diizinkan. IP ini akan digunakan untuk mengakses API RuangOTP dari server Anda.
                </p>
              </div>

              <button 
                onClick={handleAddWhitelist}
                disabled={whitelistLoading || !ipInput}
                className={`w-full py-4 rounded-2xl font-bold text-sm shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2 ${color.btn} disabled:opacity-50 disabled:grayscale`}
              >
                {whitelistLoading ? <Loader2 size={18} className="animate-spin"/> : <CheckCircle size={18}/>}
                Simpan Alamat IP
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- CHANGE ID MODAL (BARU) --- */}
      {showChangeIdModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-5 animate-in fade-in duration-200">
              <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-sm p-6 shadow-2xl scale-100 border border-slate-100 dark:border-slate-800">
                  <div className="flex flex-col items-center text-center">
                      <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mb-4 text-blue-600 dark:text-blue-400">
                          <RefreshCw size={32} />
                      </div>
                      <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">Ganti Apikey (ID)?</h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
                          ID lama Anda akan hangus. Pastikan update config Anda dengan ID yang baru setelah ini.
                      </p>
                      
                      <div className="flex gap-3 w-full flex-col">
                          <button 
                            onClick={processChangeId}
                            disabled={changeIdLoading}
                            className={`w-full py-3.5 rounded-xl text-white font-bold text-sm shadow-lg active:scale-95 flex items-center justify-center gap-2 ${color.btn}`}
                          >
                              {changeIdLoading ? <Loader2 size={16} className="animate-spin" /> : 'Ya, Ganti ID Sekarang'}
                          </button>
                          
                          <button 
                            onClick={() => setShowChangeIdModal(false)}
                            disabled={changeIdLoading}
                            className="w-full py-3.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-sm hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                          >
                              Batal
                          </button>
                      </div>
                  </div>
              </div>
          </div>
      )}

      {/* --- CONFIRMATION MODAL --- */}
      {confirmModal.show && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-5 animate-in fade-in duration-200">
              <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-sm p-6 shadow-2xl scale-100 border border-slate-100 dark:border-slate-800">
                  <div className="flex flex-col items-center text-center">
                      <div className="w-16 h-16 bg-red-50 dark:bg-red-900/20 rounded-full flex items-center justify-center mb-4 text-red-600 dark:text-red-400">
                          <HelpCircle size={32} />
                      </div>
                      <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">{confirmModal.title}</h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
                          {confirmModal.message}
                      </p>
                      
                      <div className="flex gap-3 w-full">
                          <button 
                            onClick={() => setConfirmModal({ show: false, title: '', message: '', onConfirm: null, loading: false })}
                            disabled={confirmModal.loading}
                            className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-600 font-bold text-sm hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                          >
                              Batal
                          </button>
                          <button 
                            onClick={confirmModal.onConfirm}
                            disabled={confirmModal.loading}
                            className="flex-1 py-3 rounded-xl bg-red-600 text-white font-bold text-sm hover:bg-red-700 shadow-lg shadow-red-200 dark:shadow-none flex items-center justify-center gap-2"
                          >
                              {confirmModal.loading ? <Loader2 size={16} className="animate-spin" /> : 'Hapus IP'}
                          </button>
                      </div>
                  </div>
              </div>
          </div>
      )}

      {/* --- LOGOUT MODAL --- */}
      {showLogoutModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-5 animate-in fade-in duration-200">
              <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-sm p-6 shadow-2xl scale-100 border border-slate-100 dark:border-slate-800">
                  <div className="flex flex-col items-center text-center">
                      <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mb-4 text-red-600 dark:text-red-400">
                          <LogOut size={32} />
                      </div>
                      <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">Keluar Akun?</h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
                          Anda harus login kembali untuk mengakses akun ini.
                      </p>
                      
                      <div className="flex gap-3 w-full">
                          <button 
                            onClick={() => setShowLogoutModal(false)}
                            className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-600 font-bold text-sm hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                          >
                              Batal
                          </button>
                          <button 
                            onClick={confirmLogout}
                            className="flex-1 py-3 rounded-xl bg-red-600 text-white font-bold text-sm hover:bg-red-700 shadow-lg shadow-red-200 dark:shadow-none"
                          >
                              Ya, Keluar
                          </button>
                      </div>
                  </div>
              </div>
          </div>
      )}

      {/* --- THEME MODAL --- */}
      {showThemeModal && (
        <div 
          className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setShowThemeModal(false)}
        >
          <div 
            className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl transition-transform duration-300 transform translate-y-0"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-center mb-4">
               <div className="w-12 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full"></div>
            </div>
            
            <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-6 text-center">Tampilan Aplikasi</h3>
            
            <div className="mb-6">
               <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Mode Layar</p>
               <div className="grid grid-cols-3 gap-3">
                  <button onClick={() => setMode('light')} 
                    className={`flex flex-col items-center gap-2 p-3 rounded-2xl border-2 transition-all ${mode === 'light' ? `border-${accent === 'blue' ? 'blue' : accent === 'violet' ? 'violet' : 'emerald'}-500 bg-slate-50 dark:bg-slate-800` : 'border-slate-100 dark:border-slate-800'}`}>
                     <Sun size={24} className={mode === 'light' ? getAccentText() : 'text-slate-400'} />
                     <span className={`text-xs font-bold ${mode === 'light' ? getAccentText() : 'text-slate-500'}`}>Terang</span>
                  </button>

                  <button onClick={() => setMode('dark')} 
                    className={`flex flex-col items-center gap-2 p-3 rounded-2xl border-2 transition-all ${mode === 'dark' ? `border-${accent === 'blue' ? 'blue' : accent === 'violet' ? 'violet' : 'emerald'}-500 bg-slate-50 dark:bg-slate-800` : 'border-slate-100 dark:border-slate-800'}`}>
                     <Moon size={24} className={mode === 'dark' ? getAccentText() : 'text-slate-400'} />
                     <span className={`text-xs font-bold ${mode === 'dark' ? getAccentText() : 'text-slate-500'}`}>Gelap</span>
                  </button>

                  <button onClick={() => setMode('system')} 
                    className={`flex flex-col items-center gap-2 p-3 rounded-2xl border-2 transition-all ${mode === 'system' ? `border-${accent === 'blue' ? 'blue' : accent === 'violet' ? 'violet' : 'emerald'}-500 bg-slate-50 dark:bg-slate-800` : 'border-slate-100 dark:border-slate-800'}`}>
                     <Smartphone size={24} className={mode === 'system' ? getAccentText() : 'text-slate-400'} />
                     <span className={`text-xs font-bold ${mode === 'system' ? getAccentText() : 'text-slate-500'}`}>Otomatis</span>
                  </button>
               </div>
            </div>

            <div className="mb-8">
               <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Warna Tema</p>
               <div className="grid grid-cols-3 gap-3">
                  <button onClick={() => setAccent('blue')} className={`relative h-12 rounded-xl bg-blue-500 flex items-center justify-center transition-transform active:scale-95`}>
                     {accent === 'blue' && <CheckCircle className="text-white" size={20} />}
                  </button>

                  <button onClick={() => setAccent('violet')} className={`relative h-12 rounded-xl bg-violet-600 flex items-center justify-center transition-transform active:scale-95`}>
                     {accent === 'violet' && <CheckCircle className="text-white" size={20} />}
                  </button>

                  <button onClick={() => setAccent('emerald')} className={`relative h-12 rounded-xl bg-emerald-500 flex items-center justify-center transition-transform active:scale-95`}>
                     {accent === 'emerald' && <CheckCircle className="text-white" size={20} />}
                  </button>
               </div>
            </div>

            <button 
              onClick={() => setShowThemeModal(false)}
              className="w-full py-3.5 rounded-xl bg-slate-100 text-slate-700 font-bold text-sm hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
            >
              Tutup
            </button>
          </div>
        </div>
      )}

      {/* --- TOAST --- */}
      <div className={`fixed bottom-24 left-1/2 z-[110] flex -translate-x-1/2 transform items-center gap-3 rounded-full px-5 py-3 shadow-2xl transition-all duration-300 ${toast.show ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0 pointer-events-none'} ${toast.type === 'success' ? 'bg-slate-900 text-white' : 'bg-red-500 text-white'}`}>
          {toast.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
          <span className="text-sm font-bold">{toast.message}</span>
      </div>

      <BottomNav />
    </div>
  );
}
