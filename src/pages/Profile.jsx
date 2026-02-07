import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import BottomNav from '../components/BottomNav';
import { User, LogOut, Edit, ChevronRight, Settings, Key } from 'lucide-react';

const Profile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="bg-white p-5 pt-12 pb-6 shadow-sm">
         <h1 className="text-center font-bold text-xl text-gray-800">Profile</h1>
      </div>

      <div className="px-5 -mt-2">
         <div className="bg-white rounded-3xl p-6 text-center border border-gray-100 shadow-sm mt-6">
            <div className="w-20 h-20 bg-purple-600 rounded-full mx-auto flex items-center justify-center text-white text-3xl font-bold mb-3 relative">
               {user.username.charAt(0).toUpperCase()}
               <div className="absolute bottom-0 right-0 bg-gray-100 p-1 rounded-full border border-white">
                  <Edit size={14} className="text-gray-600" />
               </div>
            </div>
            <h2 className="font-bold text-xl text-gray-800">{user.username}</h2>
            
            <div className="flex justify-center gap-8 mt-6 border-t pt-4 border-gray-100">
               <div className="text-center">
                  <span className="block font-bold text-lg text-gray-800">0</span>
                  <span className="text-xs text-gray-400">Orders</span>
               </div>
               <div className="text-center">
                  <span className="block font-bold text-lg text-gray-800">0</span>
                  <span className="text-xs text-gray-400">Deposit</span>
               </div>
               <div className="text-center">
                  <span className="block font-bold text-lg text-gray-800">0</span>
                  <span className="text-xs text-gray-400">PPOB</span>
               </div>
            </div>
         </div>
      </div>

      <div className="px-5 mt-6 space-y-3">
         <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
            <div className="mb-4">
               <p className="text-xs text-gray-400 mb-1">ID Pengguna</p>
               <p className="font-medium text-gray-800 select-all font-mono">{user.id || 'RO-XXXX'}</p>
            </div>
            <div className="mb-4">
               <p className="text-xs text-gray-400 mb-1">Email</p>
               <p className="font-medium text-gray-800">{user.email}</p>
            </div>
            <div>
               <p className="text-xs text-gray-400 mb-1">Terdaftar Sejak</p>
               <p className="font-medium text-gray-800">{new Date(user.created_at).toLocaleDateString()}</p>
            </div>
         </div>

         <button className="w-full bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between text-gray-700 hover:bg-gray-50">
            <div className="flex items-center gap-3">
               <div className="p-2 bg-blue-50 rounded-lg text-blue-600"><Settings size={18} /></div>
               <span className="font-medium">Pengaturan Akun</span>
            </div>
            <ChevronRight size={18} className="text-gray-400" />
         </button>

         <button className="w-full bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between text-gray-700 hover:bg-gray-50">
            <div className="flex items-center gap-3">
               <div className="p-2 bg-purple-50 rounded-lg text-purple-600"><Key size={18} /></div>
               <span className="font-medium">Ubah Password</span>
            </div>
            <ChevronRight size={18} className="text-gray-400" />
         </button>
         
         <button 
            onClick={handleLogout}
            className="w-full bg-white p-4 rounded-2xl border border-red-100 shadow-sm flex items-center justify-between text-red-600 hover:bg-red-50 mt-4"
         >
            <div className="flex items-center gap-3">
               <div className="p-2 bg-red-50 rounded-lg"><LogOut size={18} /></div>
               <span className="font-medium">Keluar Aplikasi</span>
            </div>
         </button>
      </div>

      <BottomNav />
    </div>
  );
};

export default Profile;
