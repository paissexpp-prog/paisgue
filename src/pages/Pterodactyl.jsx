import React, { useState, useEffect, useCallback } from 'react';
import { useTheme } from '../context/ThemeContext';
import api from '../utils/api';
import BottomNav from '../components/BottomNav';
import { 
  Server, Cpu, HardDrive, CircuitBoard, Copy, Loader2, AlertCircle, CheckCircle2, 
  Wallet, Play, Square, RotateCcw, PowerOff, RefreshCw, X, Link as LinkIcon, Key, Info, User 
} from 'lucide-react';

export default function Pterodactyl() {
  const { color } = useTheme();

  // State
  const [activeTab, setActiveTab] = useState('buy'); // 'buy' | 'my-panels'
  const [balance, setBalance] = useState(0);
  const [packages, setPackages] = useState([]);
  const [myPanels, setMyPanels] = useState([]);
  const [loading, setLoading] = useState({ packages: true, panels: true, action: false });
  
  // Form Create State
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [formData, setFormData] = useState({ nama_panel: '', password: '' });
  
  // Modal & Notifications
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [confirmModal, setConfirmModal] = useState({ show: false, title: '', message: '', onConfirm: null, loading: false, confirmText: 'Ya, Lanjutkan' });

  // 1. Ambil Saldo
  const fetchBalance = useCallback(async () => {
    try {
      const resUser = await api.get('/auth/me');
      if (resUser.data.success) setBalance(resUser.data.data.balance);
    } catch (e) {
      console.error(e);
    }
  }, []);

  // 2. Ambil Daftar Paket
  const fetchPackages = useCallback(async () => {
    setLoading(prev => ({ ...prev, packages: true }));
    try {
      const res = await api.get('/ptero/packages');
      if (res.data.success && Array.isArray(res.data.data)) {
        setPackages(res.data.data);
      }
    } catch (e) {
      showToast("Gagal memuat paket", "error");
    } finally {
      setLoading(prev => ({ ...prev, packages: false }));
    }
  }, []);

  // 3. Ambil Daftar Panel Saya
  const fetchMyPanels = useCallback(async () => {
    setLoading(prev => ({ ...prev, panels: true }));
    try {
      const res = await api.get('/ptero/my-panels');
      if (res.data.success && Array.isArray(res.data.data)) {
        setMyPanels(res.data.data);
      }
    } catch (e) {
      showToast("Gagal memuat daftar server", "error");
    } finally {
      setLoading(prev => ({ ...prev, panels: false }));
    }
  }, []);

  useEffect(() => {
    fetchBalance();
    fetchPackages();
    fetchMyPanels();
  }, [fetchBalance, fetchPackages, fetchMyPanels]);

  // Handle Tab Switch
  useEffect(() => {
    if (activeTab === 'my-panels') {
      fetchMyPanels();
    }
  }, [activeTab, fetchMyPanels]);

  // Helpers
  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast(prev => ({ ...prev, show: false })), 3000);
  };

  const handleCopy = (text, label) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    showToast(`${label} disalin!`, "success");
  };

  const closeConfirm = () => {
    setConfirmModal({ show: false, title: '', message: '', onConfirm: null, loading: false, confirmText: 'Ya, Lanjutkan' });
  };

  const showConfirm = (title, message, action, confirmText = 'Ya, Lanjutkan') => {
    setConfirmModal({ show: true, title, message, onConfirm: action, loading: false, confirmText });
  };

  // Format Helper
  const formatDate = (timestamp) => {
    if (!timestamp) return '-';
    return new Date(timestamp).toLocaleDateString('id-ID', {
      day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  };

  // Validasi Password Helper
  const isPasswordStarted = formData.password.length > 0;
  const isPasswordValid = formData.password.length >= 8;

  // Create Panel
  const handleCreatePanel = async (e) => {
    e.preventDefault();
    if (!selectedPackage) return showToast("Pilih paket terlebih dahulu", "error");
    if (!formData.nama_panel.trim() || !formData.password.trim()) return showToast("Lengkapi form", "error");
    if (!isPasswordValid) return showToast("Password minimal 8 karakter", "error");
    if (balance < selectedPackage.price) return showToast("Saldo tidak mencukupi", "error");

    setLoading(prev => ({ ...prev, action: true }));
    try {
      const res = await api.post('/ptero/create', {
        package_id: selectedPackage.id,
        nama_panel: formData.nama_panel,
        password: formData.password
      });

      if (res.data.success) {
        showToast(res.data.message || "Server berhasil dibuat!", "success");
        setFormData({ nama_panel: '', password: '' });
        setSelectedPackage(null);
        fetchBalance();
        setActiveTab('my-panels');
      } else {
        showToast(res.data.message || "Gagal membuat server", "error");
      }
    } catch (e) {
      const errorMsg = e.response?.data?.message || e.response?.data?.error?.message || "Gagal membuat server";
      showToast(errorMsg, "error");
    } finally {
      setLoading(prev => ({ ...prev, action: false }));
    }
  };

  // Execute Action (Start, Stop, Restart, Kill, Reinstall)
  const executeServerAction = async (orderId, actionCommand) => {
    setConfirmModal(prev => ({ ...prev, loading: true }));
    setLoading(prev => ({ ...prev, action: true }));
    try {
      const res = await api.post('/ptero/action', {
        order_id: orderId,
        action: actionCommand
      });
      if (res.data.success) {
        showToast(`Perintah '${actionCommand}' terkirim!`, "success");
      } else {
        showToast(res.data.message || `Gagal menjalankan '${actionCommand}'`, "error");
      }
    } catch (e) {
      const errorMsg = e.response?.data?.message || e.response?.data?.error?.message || `Error eksekusi '${actionCommand}'`;
      showToast(errorMsg, "error");
    } finally {
      setLoading(prev => ({ ...prev, action: false }));
      closeConfirm();
    }
  };

  const handleActionClick = (orderId, actionCommand) => {
    if (actionCommand === 'kill') {
      showConfirm(
        "Matikan Paksa Server?",
        "Aksi ini akan mematikan proses server secara paksa. Gunakan hanya jika server macet/hang.",
        () => executeServerAction(orderId, actionCommand),
        "Ya, Kill Server"
      );
    } else if (actionCommand === 'reinstall') {
      showConfirm(
        "Reinstall Server?",
        "PERINGATAN: Reinstall akan menghapus semua file di server Anda dan mengembalikannya ke kondisi awal. Lanjutkan?",
        () => executeServerAction(orderId, actionCommand),
        "Ya, Reinstall"
      );
    } else {
      // Start, Stop, Restart jalankan langsung
      executeServerAction(orderId, actionCommand);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0b1120] pb-24 font-sans selection:bg-blue-500/30">
      
      {/* HEADER */}
      <div className="sticky top-0 z-30 bg-white/90 dark:bg-[#0b1120]/90 backdrop-blur-lg px-5 py-4 flex items-center justify-between border-b border-slate-200 dark:border-slate-800/60">
          <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">Panel Server</h1>
          </div>
          <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 bg-blue-100/60 dark:bg-blue-900/30 text-blue-700 dark:text-[#38bdf8] px-3.5 py-1.5 rounded-full shadow-inner border border-blue-200/50 dark:border-blue-800/40">
                  <Wallet size={14} className="opacity-80" />
                  <span className="text-xs font-black tracking-wide">Rp {balance.toLocaleString('id-ID')}</span>
              </div>
          </div>
      </div>

      <div className="px-5 mt-5">
        
        {/* TABS SWITCHER */}
        <div className="flex bg-white dark:bg-[#111827] p-1 rounded-2xl border border-slate-200 dark:border-slate-800/60 mb-6 shadow-sm">
          <button 
            onClick={() => setActiveTab('buy')}
            className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all ${
              activeTab === 'buy' ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-[#38bdf8] shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            Beli Panel
          </button>
          <button 
            onClick={() => setActiveTab('my-panels')}
            className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all ${
              activeTab === 'my-panels' ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-[#38bdf8] shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            Panel Aktif
          </button>
        </div>

        {/* ========================================================
            TAB 1: BELI PANEL
            ======================================================== */}
        {activeTab === 'buy' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
            
            {/* FORM CREATE (Berada di atas, dengan Validasi Password) */}
            <div className="bg-white dark:bg-[#111827] rounded-[1.5rem] p-5 shadow-sm border border-slate-200 dark:border-slate-800/60 animate-in fade-in zoom-in-95 mb-6">
              <div className="flex items-center gap-3 mb-5 border-b border-slate-100 dark:border-slate-800/60 pb-4">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg text-blue-600 dark:text-[#38bdf8]">
                  <Server size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 dark:text-white text-sm">Konfigurasi Server</h3>
                  <p className="text-[11px] text-slate-500">
                    Paket: {selectedPackage ? <span className="font-bold uppercase text-slate-700 dark:text-slate-300">{selectedPackage.id}</span> : <span className="italic">Belum dipilih</span>}
                  </p>
                </div>
              </div>

              <form onSubmit={handleCreatePanel} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Nama Server</label>
                  <input 
                    type="text" 
                    required
                    placeholder="e.g. Bot WhatsApp-ku"
                    className="w-full bg-slate-50 dark:bg-[#151b2b] border border-slate-200 dark:border-[#1e2536] rounded-xl px-4 py-3 text-sm font-medium text-slate-800 dark:text-white outline-none focus:border-blue-400 dark:focus:border-blue-600 transition-colors placeholder:text-slate-400"
                    value={formData.nama_panel}
                    onChange={e => setFormData({...formData, nama_panel: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Password Panel</label>
                  <input 
                    type="text" 
                    required
                    placeholder="Gunakan password yang kuat"
                    className={`w-full bg-slate-50 dark:bg-[#151b2b] border rounded-xl px-4 py-3 text-sm font-medium text-slate-800 dark:text-white outline-none transition-colors placeholder:text-slate-400 ${
                      !isPasswordStarted 
                        ? 'border-slate-200 dark:border-[#1e2536] focus:border-blue-400 dark:focus:border-blue-600' 
                        : isPasswordValid 
                          ? 'border-emerald-500 focus:border-emerald-500' 
                          : 'border-red-500 focus:border-red-500'
                    }`}
                    value={formData.password}
                    onChange={e => setFormData({...formData, password: e.target.value})}
                  />
                  {/* Teks Bantuan Validasi */}
                  <div className="mt-1.5 flex items-center gap-1.5 text-[10px] font-medium">
                    {!isPasswordStarted ? (
                      <span className="text-slate-500 dark:text-slate-400">Minimal 8 karakter kombinasi huruf & angka</span>
                    ) : isPasswordValid ? (
                      <span className="text-emerald-500 flex items-center gap-1">
                        <CheckCircle2 size={12}/> Password memenuhi syarat
                      </span>
                    ) : (
                      <span className="text-red-500 flex items-center gap-1">
                        <AlertCircle size={12}/> Kurang dari 8 karakter
                      </span>
                    )}
                  </div>
                </div>
                <button 
                  type="submit"
                  disabled={loading.action || !selectedPackage || !isPasswordValid}
                  className={`w-full py-3.5 rounded-xl text-sm font-bold flex justify-center items-center gap-2 transition-all active:scale-95 ${
                    loading.action || !selectedPackage || !isPasswordValid
                      ? 'bg-slate-300 dark:bg-slate-800 text-slate-500 cursor-not-allowed' 
                      : color.btn
                  }`}
                >
                  {loading.action ? <Loader2 size={18} className="animate-spin"/> : <Server size={18}/>}
                  {loading.action 
                    ? 'Memproses...' 
                    : !selectedPackage 
                      ? 'Pilih Paket Terlebih Dahulu' 
                      : !isPasswordValid
                        ? 'Password Terlalu Pendek'
                        : `Beli Server - Rp ${selectedPackage.price.toLocaleString('id-ID')}`
                  }
                </button>
              </form>
            </div>

            <h3 className="font-bold text-slate-800 dark:text-white text-lg mb-4">Pilih Spesifikasi Paket</h3>
            
            {loading.packages ? (
              <div className="grid grid-cols-2 gap-3 mb-6">
                {[1,2,3,4].map(i => (
                  <div key={i} className="h-32 bg-slate-200 dark:bg-[#151b2b] animate-pulse rounded-2xl"></div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3 mb-6">
                {packages.map((pkg) => {
                  const isSelected = selectedPackage?.id === pkg.id;
                  const isUnli = pkg.id === 'unli' || (pkg.memory === 0 && pkg.cpu === 0);
                  
                  return (
                    <button
                      key={pkg.id}
                      onClick={() => setSelectedPackage(pkg)}
                      className={`relative p-4 rounded-[1.25rem] border text-left transition-all active:scale-95 ${
                        isSelected 
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-md ring-1 ring-blue-500/50' 
                          : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] hover:border-blue-300 dark:hover:border-blue-800/50'
                      }`}
                    >
                      {isSelected && (
                        <div className="absolute top-3 right-3 text-blue-600 dark:text-[#38bdf8]">
                          <CheckCircle2 size={18} />
                        </div>
                      )}
                      <h4 className="font-black text-slate-800 dark:text-white text-base uppercase tracking-wide mb-3">
                        {pkg.id}
                      </h4>
                      <div className="space-y-1.5 mb-4">
                        <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
                          <CircuitBoard size={12} className="opacity-70"/> {isUnli ? 'Unlimited' : `${pkg.memory} MB RAM`}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
                          <Cpu size={12} className="opacity-70"/> {isUnli ? 'Unlimited' : `${pkg.cpu}% CPU`}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
                          <HardDrive size={12} className="opacity-70"/> {isUnli ? 'Unlimited' : `${pkg.disk} MB Disk`}
                        </div>
                      </div>
                      <div className="text-sm font-black text-blue-600 dark:text-[#38bdf8]">
                        Rp {pkg.price.toLocaleString('id-ID')}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ========================================================
            TAB 2: PANEL AKTIF
            ======================================================== */}
        {activeTab === 'my-panels' && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-800 dark:text-white text-lg">Server Anda</h3>
              <button onClick={fetchMyPanels} className="text-slate-400 hover:text-blue-500 transition-colors">
                <RefreshCw size={16} className={loading.panels ? 'animate-spin' : ''} />
              </button>
            </div>

            {loading.panels ? (
              <div className="flex justify-center py-10">
                <Loader2 size={30} className="animate-spin text-blue-500" />
              </div>
            ) : myPanels.length > 0 ? (
              <div className="space-y-4">
                {myPanels.map((panel) => (
                  <div key={panel.order_id} className="bg-white dark:bg-[#111827] rounded-3xl p-5 shadow-sm border border-slate-200 dark:border-slate-800/60">
                    
                    {/* Header Card */}
                    <div className="flex justify-between items-start mb-4 border-b border-slate-100 dark:border-slate-800/60 pb-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]"></div>
                          <h4 className="font-bold text-slate-800 dark:text-white text-base leading-tight">
                            {panel.server_name || `Server ${panel.identifier}`}
                          </h4>
                        </div>
                        <p className="text-[10px] text-slate-500 font-medium">Expired: {formatDate(panel.expired_at)}</p>
                      </div>
                      <span className="bg-slate-100 text-slate-600 dark:bg-[#1e293b] dark:text-slate-300 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider">
                        {panel.package_id}
                      </span>
                    </div>

                    {/* Kredensial */}
                    <div className="space-y-2 mb-5 bg-slate-50 dark:bg-[#151b2b] p-3 rounded-xl border border-slate-100 dark:border-[#1e2536]">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                          <LinkIcon size={14} />
                          <span className="text-xs font-medium">URL</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <a href={panel.panel_url} target="_blank" rel="noreferrer" className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline max-w-[120px] truncate">
                            {panel.panel_url.replace(/^https?:\/\//, '')}
                          </a>
                          <button onClick={() => handleCopy(panel.panel_url, 'URL')} className="text-slate-400 hover:text-slate-600 dark:hover:text-white"><Copy size={12}/></button>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                          <User size={14} />
                          <span className="text-xs font-medium">Username</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono font-bold text-slate-800 dark:text-slate-200">{panel.pterodactyl_username}</span>
                          <button onClick={() => handleCopy(panel.pterodactyl_username, 'Username')} className="text-slate-400 hover:text-slate-600 dark:hover:text-white"><Copy size={12}/></button>
                        </div>
                      </div>
                      {panel.pterodactyl_password && (
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                            <Key size={14} />
                            <span className="text-xs font-medium">Password</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-mono font-bold text-slate-800 dark:text-slate-200">{panel.pterodactyl_password}</span>
                            <button onClick={() => handleCopy(panel.pterodactyl_password, 'Password')} className="text-slate-400 hover:text-slate-600 dark:hover:text-white"><Copy size={12}/></button>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Action Bar */}
                    <div className="flex items-center gap-2 w-full">
                      <button 
                        onClick={() => handleActionClick(panel.order_id, 'start')}
                        disabled={loading.action}
                        className="flex-1 flex flex-col items-center gap-1.5 bg-emerald-50 text-emerald-600 border border-emerald-200 hover:bg-emerald-100 dark:bg-emerald-900/10 dark:text-[#34d399] dark:border-emerald-800/40 dark:hover:bg-emerald-900/30 py-2.5 rounded-xl transition-colors disabled:opacity-50"
                      >
                        <Play size={16} className="ml-0.5"/> <span className="text-[10px] font-bold">Start</span>
                      </button>
                      <button 
                        onClick={() => handleActionClick(panel.order_id, 'restart')}
                        disabled={loading.action}
                        className="flex-1 flex flex-col items-center gap-1.5 bg-blue-50 text-blue-600 border border-blue-200 hover:bg-blue-100 dark:bg-blue-900/10 dark:text-[#38bdf8] dark:border-blue-800/40 dark:hover:bg-blue-900/30 py-2.5 rounded-xl transition-colors disabled:opacity-50"
                      >
                        <RotateCcw size={16} /> <span className="text-[10px] font-bold">Restart</span>
                      </button>
                      <button 
                        onClick={() => handleActionClick(panel.order_id, 'stop')}
                        disabled={loading.action}
                        className="flex-1 flex flex-col items-center gap-1.5 bg-amber-50 text-amber-600 border border-amber-200 hover:bg-amber-100 dark:bg-amber-900/10 dark:text-[#fbbf24] dark:border-amber-800/40 dark:hover:bg-amber-900/30 py-2.5 rounded-xl transition-colors disabled:opacity-50"
                      >
                        <Square size={16} /> <span className="text-[10px] font-bold">Stop</span>
                      </button>
                      
                      {/* Divider */}
                      <div className="w-px h-8 bg-slate-200 dark:bg-slate-700 mx-1"></div>

                      <button 
                        onClick={() => handleActionClick(panel.order_id, 'kill')}
                        disabled={loading.action}
                        className="w-12 flex flex-col items-center gap-1.5 bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 dark:bg-red-900/10 dark:text-[#f87171] dark:border-red-800/40 dark:hover:bg-red-900/30 py-2.5 rounded-xl transition-colors disabled:opacity-50 shrink-0"
                      >
                        <PowerOff size={16} /> <span className="text-[9px] font-bold">Kill</span>
                      </button>
                      <button 
                        onClick={() => handleActionClick(panel.order_id, 'reinstall')}
                        disabled={loading.action}
                        className="w-14 flex flex-col items-center gap-1.5 bg-slate-100 text-slate-600 border border-slate-200 hover:bg-slate-200 dark:bg-[#1e293b] dark:text-slate-300 dark:border-slate-700 dark:hover:bg-slate-700 py-2.5 rounded-xl transition-colors disabled:opacity-50 shrink-0"
                      >
                        <HardDrive size={16} /> <span className="text-[9px] font-bold">Reinstall</span>
                      </button>
                    </div>

                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 px-4 border border-dashed border-slate-300 dark:border-slate-700 rounded-3xl">
                <Server size={40} className="mx-auto text-slate-300 dark:text-slate-600 mb-3" />
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">Belum ada server</p>
                <p className="text-xs text-slate-500 mt-1">Beli paket panel di tab "Beli Panel" untuk memulai.</p>
              </div>
            )}
          </div>
        )}
        
        <div className="h-6"></div>
      </div>

      {/* CONFIRM MODAL GLOBAL */}
      {confirmModal.show && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-5 animate-in fade-in duration-200">
              <div className="bg-white dark:bg-[#111827] rounded-3xl w-full max-w-sm p-6 shadow-2xl border border-slate-100 dark:border-slate-800">
                  <div className="flex flex-col items-center text-center">
                      <div className="w-16 h-16 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800/40 rounded-full flex items-center justify-center mb-4 text-red-600 dark:text-[#f87171]">
                        <AlertCircle size={32} />
                      </div>
                      <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">{confirmModal.title}</h3>
                      <p className="text-[13px] text-slate-500 dark:text-slate-400 mb-6 whitespace-pre-line leading-relaxed">{confirmModal.message}</p>
                      <div className="flex gap-3 w-full">
                          <button onClick={closeConfirm} disabled={confirmModal.loading} className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-[#1e2536] transition-colors">Batal</button>
                          <button onClick={confirmModal.onConfirm} disabled={confirmModal.loading} className="flex-1 py-3 rounded-xl bg-red-600 text-white font-bold text-xs hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-700 flex items-center justify-center gap-2 transition-colors">
                              {confirmModal.loading && <Loader2 size={14} className="animate-spin" />}
                              {confirmModal.loading ? 'Memproses...' : confirmModal.confirmText}
                          </button>
                      </div>
                  </div>
              </div>
          </div>
      )}

      {/* TOAST NOTIFICATION */}
      <div className={`fixed bottom-24 left-1/2 z-[150] flex w-max max-w-[90vw] -translate-x-1/2 transform items-center gap-3 rounded-full px-5 py-3 shadow-2xl transition-all duration-300 ${toast.show ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0 pointer-events-none'} ${toast.type === 'success' ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900' : 'bg-red-500 text-white'}`}>
          {toast.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
          <span className="text-xs font-bold">{toast.message}</span>
      </div>

      <BottomNav />
    </div>
  );
}
