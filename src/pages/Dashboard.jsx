import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import BottomNav from '../components/BottomNav';
import { Bell, RefreshCw, Smartphone, Globe, Gamepad2, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState({ username: 'Loading...', balance: 0 });
  const [loading, setLoading] = useState(true);

  const fetchUserData = async () => {
    try {
      const storedUser = JSON.parse(localStorage.getItem('user'));
      if (storedUser) {
        setUser(storedUser); 
      }
      
      const res = await api.get('/auth/me'); 
      if (res.data.success) {
        setUser(res.data.data);
        localStorage.setItem('user', JSON.stringify(res.data.data));
      }
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  const formatRupiah = (number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(number);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      
      <div className="bg-white px-5 pt-12 pb-4 sticky top-0 z-40 shadow-sm">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center text-white font-bold text-lg">
              {user.username ? user.username.charAt(0).toUpperCase() : 'U'}
            </div>
            <div>
              <h1 className="font-bold text-gray-800 text-lg">{user.username}</h1>
              <p className="text-xs text-gray-500">Selamat sore 🌤️</p>
            </div>
          </div>
          <div className="flex gap-2">
             <button className="p-2 bg-gray-100 rounded-xl text-gray-600 hover:bg-gray-200">
                <RefreshCw size={20} onClick={fetchUserData} />
             </button>
             <button className="p-2 bg-gray-100 rounded-xl text-gray-600 hover:bg-gray-200">
                <Bell size={20} />
             </button>
          </div>
        </div>
      </div>

      <div className="px-5 mt-6">
        <div className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100 relative overflow-hidden">
          <div className="flex justify-between items-start relative z-10">
            <div>
              <p className="text-gray-500 text-sm font-medium mb-1">Saldo Kamu</p>
              <h2 className="text-2xl font-bold text-gray-800">{formatRupiah(user.balance)}</h2>
            </div>
            <button 
              onClick={() => navigate('/deposit')}
              className="bg-green-100 text-green-700 px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-1"
            >
              Top Up
            </button>
          </div>
          
          <div className="mt-6 flex items-center gap-2 relative z-10">
             <span className="bg-green-50 text-green-600 px-2 py-1 rounded-lg text-xs font-medium flex items-center gap-1">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                Online
             </span>
             <span className="text-xs text-gray-400">198ms response server saat ini</span>
          </div>
        </div>
      </div>

      <div className="px-5 mt-6">
        <div className="bg-gradient-to-r from-orange-400 to-emerald-400 rounded-3xl p-6 text-white relative overflow-hidden shadow-lg">
           <div className="relative z-10">
              <h3 className="font-bold text-lg">Get Virtual Number</h3>
              <p className="text-white/90 text-sm mt-1 mb-4 w-3/4">OTP access for 1,038+ apps across 193 countries</p>
              
              <div className="flex items-center gap-2 mb-2">
                 <div className="bg-white/20 p-1.5 rounded-full"><Smartphone size={16} /></div>
                 <div className="bg-white/20 p-1.5 rounded-full"><Globe size={16} /></div>
                 <span className="text-xs font-medium">+99 Apps</span>
              </div>

              <button 
                onClick={() => navigate('/order')}
                className="flex items-center gap-1 text-sm font-bold mt-2"
              >
                Beli Nomor &gt;
              </button>
           </div>
           
           <div className="absolute -right-5 -bottom-10 w-32 h-32 bg-white/20 rounded-full blur-2xl"></div>
        </div>
      </div>

      <div className="px-5 mt-8">
        <div className="flex items-center justify-between mb-4">
           <h3 className="font-bold text-gray-800 text-lg flex items-center gap-2">🔥 Lagi Populer</h3>
           <button className="text-blue-600 text-sm font-medium">Lihat Semua</button>
        </div>

        <div className="grid grid-cols-3 gap-3">
           <div className="bg-white p-3 rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center gap-2 cursor-pointer hover:border-blue-200 transition-colors">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                 <Zap size={24} />
              </div>
              <span className="text-xs font-medium text-gray-700">DANA</span>
           </div>

           <div className="bg-white p-3 rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center gap-2 cursor-pointer hover:border-blue-200 transition-colors">
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center text-orange-600">
                 <Gamepad2 size={24} />
              </div>
              <span className="text-xs font-medium text-gray-700">Free Fire</span>
           </div>

           <div className="bg-white p-3 rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center gap-2 cursor-pointer hover:border-blue-200 transition-colors">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center text-purple-600">
                 <Smartphone size={24} />
              </div>
              <span className="text-xs font-medium text-gray-700">WhatsApp</span>
           </div>
        </div>
      </div>

      <div className="px-5 mt-8 mb-6">
         <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-gray-800 text-lg">Pesanan Pending</h3>
            <button className="p-1 text-blue-600"><RefreshCw size={16}/></button>
         </div>
         
         <div className="bg-white rounded-3xl p-8 text-center border border-gray-100 shadow-sm">
            <div className="w-24 h-24 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center text-4xl">
               🤷‍♂️
            </div>
            <h4 className="font-bold text-gray-800 mb-1">Tidak ada pesanan</h4>
            <p className="text-sm text-gray-400 mb-6">Pesanan aktif akan muncul disini</p>
            <button 
              onClick={() => navigate('/order')}
              className="bg-slate-900 text-white px-6 py-3 rounded-xl text-sm font-medium w-full"
            >
              + Buat Pesanan
            </button>
         </div>
      </div>

      <BottomNav />
    </div>
  );
};

export default Dashboard;

