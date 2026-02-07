import { useState, useEffect } from 'react';
import api from '../utils/api';
import { useTheme } from '../context/ThemeContext';
import { Loader2, RefreshCw, Smartphone, Globe, Server, ShoppingCart } from 'lucide-react';

export default function Dashboard() {
  const { color } = useTheme();
  const [services, setServices] = useState([]);
  const [countries, setCountries] = useState([]);
  const [operators, setOperators] = useState([]);
  
  const [selectedService, setSelectedService] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('');
  const [selectedOperator, setSelectedOperator] = useState('');
  
  const [activeOrder, setActiveOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [otpCode, setOtpCode] = useState('Menunggu SMS...');

  useEffect(() => {
    fetchServices();
    const savedOrder = localStorage.getItem('activeOrder');
    if (savedOrder) setActiveOrder(JSON.parse(savedOrder));
  }, []);

  const fetchServices = async () => {
    try {
      const res = await api.get('/services/list');
      if (res.data.success) setServices(res.data.data);
    } catch (err) { console.error(err); }
  };

  const handleServiceChange = async (e) => {
    const serviceId = e.target.value;
    setSelectedService(serviceId);
    setCountries([]);
    setOperators([]);
    if (!serviceId) return;

    setLoading(true);
    try {
      const res = await api.get(`/countries/list?service_id=${serviceId}`);
      if (res.data.success) setCountries(res.data.data);
    } catch (err) { alert('Gagal ambil negara'); }
    setLoading(false);
  };

  const handleCountryChange = async (e) => {
    const countryId = e.target.value;
    setSelectedCountry(countryId);
    setOperators([]);
    if (!countryId) return;

    setLoading(true);
    try {
      const res = await api.get(`/operators/list?country=${countryId}&provider_id=1`); 
      if (res.data.success) setOperators(res.data.data);
    } catch (err) { alert('Gagal ambil operator'); }
    setLoading(false);
  };

  const handleBuy = async () => {
    if (!selectedOperator) return;
    setLoading(true);
    try {
      const opData = operators.find(o => o.operator_id === selectedOperator);
      
      const res = await api.get('/orders/buy', {
        params: {
          number_id: 'any',
          provider_id: '1',
          operator_id: selectedOperator,
          expected_price: opData ? opData.price : 0
        }
      });

      if (res.data.success) {
        const newOrder = res.data.data;
        setActiveOrder(newOrder);
        localStorage.setItem('activeOrder', JSON.stringify(newOrder));
        setOtpCode('Menunggu SMS...');
      }
    } catch (err) {
      alert(err.response?.data?.error?.message || 'Gagal membeli nomor');
    }
    setLoading(false);
  };

  const checkStatus = async () => {
    if (!activeOrder) return;
    try {
      const res = await api.get(`/orders/check-status?order_id=${activeOrder.order_id}`);
      if (res.data.success) {
        const status = res.data.data.status;
        if (status === 'COMPLETED') {
            setOtpCode(res.data.data.otp_code);
            localStorage.removeItem('activeOrder');
        } else if (status === 'CANCELED') {
            setOtpCode('Dibatalkan / Expired');
            localStorage.removeItem('activeOrder');
        }
      }
    } catch (err) { console.error(err); }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 transition-colors duration-300 dark:bg-slate-900 md:p-8">
      <div className="mx-auto max-w-5xl">
        <h1 className="mb-8 text-2xl font-bold text-slate-900 dark:text-white">Dashboard Order</h1>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Card Pemesanan */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950">
            <div className="mb-6 flex items-center gap-3 border-b border-slate-100 pb-4 dark:border-slate-800">
              <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${color.bg} ${color.text}`}>
                <ShoppingCart size={20} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Pemesanan Baru</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">Pilih layanan dan negara</p>
              </div>
            </div>
            
            <div className="space-y-5">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                  1. Layanan Aplikasi
                </label>
                <div className="relative">
                  <Smartphone className="absolute left-3 top-3.5 h-5 w-5 text-slate-400" />
                  <select 
                    className={`w-full appearance-none rounded-xl border bg-white px-10 py-3 text-slate-900 focus:outline-none focus:ring-2 dark:bg-slate-900 dark:text-white ${color.border} ${color.ring}`}
                    onChange={handleServiceChange} 
                    value={selectedService}
                  >
                    <option value="">-- Pilih Aplikasi --</option>
                    {services.map(s => <option key={s.service_id} value={s.service_id}>{s.service_name}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                  2. Negara
                </label>
                <div className="relative">
                  <Globe className="absolute left-3 top-3.5 h-5 w-5 text-slate-400" />
                  <select 
                    className={`w-full appearance-none rounded-xl border bg-white px-10 py-3 text-slate-900 focus:outline-none focus:ring-2 dark:bg-slate-900 dark:text-white ${color.border} ${color.ring}`}
                    onChange={handleCountryChange} 
                    value={selectedCountry} 
                    disabled={!selectedService}
                  >
                    <option value="">-- Pilih Negara --</option>
                    {countries.map(c => <option key={c.country_id} value={c.country_id}>{c.country_name} (ID: {c.country_id})</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                  3. Operator & Harga
                </label>
                <div className="relative">
                  <Server className="absolute left-3 top-3.5 h-5 w-5 text-slate-400" />
                  <select 
                    className={`w-full appearance-none rounded-xl border bg-white px-10 py-3 text-slate-900 focus:outline-none focus:ring-2 dark:bg-slate-900 dark:text-white ${color.border} ${color.ring}`}
                    onChange={(e) => setSelectedOperator(e.target.value)} 
                    value={selectedOperator} 
                    disabled={!selectedCountry}
                  >
                    <option value="">-- Pilih Operator --</option>
                    {operators.map(o => <option key={o.operator_id} value={o.operator_id}>{o.operator_name} - {o.price_format}</option>)}
                  </select>
                </div>
              </div>

              <button 
                onClick={handleBuy} 
                disabled={loading || !selectedOperator}
                className={`mt-4 flex w-full items-center justify-center gap-2 rounded-xl py-3.5 font-bold transition-all hover:scale-[1.02] disabled:opacity-50 ${color.btn}`}
              >
                {loading ? <Loader2 className="animate-spin" /> : 'Beli Nomor Sekarang'}
              </button>
            </div>
          </div>

          {/* Card Status */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950">
            <div className="mb-6 flex items-center gap-3 border-b border-slate-100 pb-4 dark:border-slate-800">
              <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${color.bg} ${color.text}`}>
                <RefreshCw size={20} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Status Pesanan</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">Pantau SMS masuk disini</p>
              </div>
            </div>

            {activeOrder ? (
                <div className="flex flex-col items-center justify-center space-y-6 py-4">
                    <div className="text-center">
                      <p className="text-sm text-slate-500 dark:text-slate-400">Nomor Virtual</p>
                      <div className="mt-1 text-3xl font-mono font-bold tracking-wider text-slate-900 dark:text-white">
                        {activeOrder.phone_number}
                      </div>
                    </div>
                    
                    <div className="w-full rounded-xl bg-slate-50 p-6 text-center dark:bg-slate-900">
                        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">Kode OTP Masuk</p>
                        <div className={`text-4xl font-bold tracking-[0.5em] ${color.text}`}>
                          {otpCode}
                        </div>
                    </div>
                    
                    <button 
                        onClick={checkStatus} 
                        className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                    >
                        <RefreshCw size={16} /> Refresh Manual
                    </button>
                    <p className="text-xs text-slate-400 text-center">
                      Sistem akan merefresh otomatis. Jika SMS belum masuk dalam 20 menit, saldo akan otomatis dikembalikan (Refund).
                    </p>
                </div>
            ) : (
                <div className="flex h-64 flex-col items-center justify-center text-center text-slate-400">
                    <Smartphone size={48} className="mb-4 opacity-20" />
                    <p>Belum ada pesanan aktif saat ini.</p>
                </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

