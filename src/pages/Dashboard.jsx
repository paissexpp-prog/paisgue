import { useState, useEffect } from 'react';
import api from '../utils/api';
import { Loader2, RefreshCw, Smartphone } from 'lucide-react';

export default function Dashboard() {
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
    // Cek local storage jika ada order aktif tersimpan (opsional untuk persistensi sederhana)
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

    // Cari provider_id dari data negara (biasanya 'any' atau spesifik)
    // Di source backend routes/operators.js butuh provider_id. 
    // Kita asumsi provider diambil dari data service/country atau default '1' (rumahotp biasanya pakai ID provider)
    // Sesuai route backend, kita butuh provider_id.
    setLoading(true);
    try {
      // Hardcode provider_id sementara atau ambil dari properti object jika ada di respon negara
      const res = await api.get(`/operators/list?country=${countryId}&provider_id=1`); 
      if (res.data.success) setOperators(res.data.data);
    } catch (err) { alert('Gagal ambil operator'); }
    setLoading(false);
  };

  const handleBuy = async () => {
    if (!selectedOperator) return;
    setLoading(true);
    try {
      // Cari data operator object untuk dapat harga
      const opData = operators.find(o => o.operator_id === selectedOperator);
      
      const res = await api.get('/orders/buy', {
        params: {
          number_id: 'any', // Default logic
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
            localStorage.removeItem('activeOrder'); // Clear jika selesai
        } else if (status === 'CANCELED') {
            setOtpCode('Dibatalkan / Expired');
            localStorage.removeItem('activeOrder');
        }
      }
    } catch (err) { console.error(err); }
  };

  return (
    <div className="p-4 md:p-8">
      <h1 className="mb-6 text-2xl font-bold">Beli Nomor Virtual</h1>

      {/* Area Order */}
      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-4 rounded-lg bg-slate-800 p-6">
            <h3 className="mb-4 text-lg font-semibold text-blue-400">1. Pilih Layanan</h3>
            
            <select className="w-full rounded bg-slate-700 p-3" onChange={handleServiceChange} value={selectedService}>
                <option value="">-- Pilih Aplikasi --</option>
                {services.map(s => <option key={s.service_id} value={s.service_id}>{s.service_name}</option>)}
            </select>

            <select className="w-full rounded bg-slate-700 p-3" onChange={handleCountryChange} value={selectedCountry} disabled={!selectedService}>
                <option value="">-- Pilih Negara --</option>
                {countries.map(c => <option key={c.country_id} value={c.country_id}>{c.country_name} (ID: {c.country_id})</option>)}
            </select>

            <select className="w-full rounded bg-slate-700 p-3" onChange={(e) => setSelectedOperator(e.target.value)} value={selectedOperator} disabled={!selectedCountry}>
                <option value="">-- Pilih Operator --</option>
                {operators.map(o => <option key={o.operator_id} value={o.operator_id}>{o.operator_name} - {o.price_format}</option>)}
            </select>

            <button 
                onClick={handleBuy} 
                disabled={loading || !selectedOperator}
                className="flex w-full items-center justify-center gap-2 rounded bg-blue-600 p-3 font-bold hover:bg-blue-500 disabled:opacity-50"
            >
                {loading ? <Loader2 className="animate-spin" /> : <Smartphone size={20} />}
                Beli Nomor
            </button>
        </div>

        {/* Area Status Order */}
        <div className="rounded-lg bg-slate-800 p-6">
            <h3 className="mb-4 text-lg font-semibold text-green-400">2. Status Pesanan</h3>
            {activeOrder ? (
                <div className="space-y-4 text-center">
                    <div className="text-4xl font-mono tracking-wider">{activeOrder.phone_number}</div>
                    <div className="my-4 rounded-lg bg-slate-900 p-6">
                        <div className="text-sm text-slate-400">Kode OTP</div>
                        <div className="text-5xl font-bold text-white tracking-[0.5em]">{otpCode}</div>
                    </div>
                    <button 
                        onClick={checkStatus} 
                        className="flex w-full items-center justify-center gap-2 rounded border border-slate-600 p-2 hover:bg-slate-700"
                    >
                        <RefreshCw size={18} /> Cek SMS Manual
                    </button>
                    <p className="text-xs text-slate-500">Otomatisasi berjalan di background, tapi Anda bisa cek manual.</p>
                </div>
            ) : (
                <div className="flex h-full items-center justify-center text-slate-500">
                    Belum ada pesanan aktif
                </div>
            )}
        </div>
      </div>
    </div>
  );
}
