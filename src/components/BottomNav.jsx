import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Wallet, Activity, User, ShoppingBag } from 'lucide-react';

const BottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-6 py-2 z-50 pb-safe">
      <div className="flex justify-between items-center max-w-md mx-auto relative">
        
        <button 
          onClick={() => navigate('/dashboard')}
          className={`flex flex-col items-center gap-1 ${isActive('/dashboard') ? 'text-blue-600' : 'text-gray-400'}`}
        >
          <Home size={24} />
          <span className="text-[10px] font-medium">Home</span>
        </button>

        <button 
          onClick={() => navigate('/deposit')}
          className={`flex flex-col items-center gap-1 ${isActive('/deposit') ? 'text-blue-600' : 'text-gray-400'}`}
        >
          <Wallet size={24} />
          <span className="text-[10px] font-medium">Deposit</span>
        </button>

        <div className="relative -top-6">
          <button 
            onClick={() => navigate('/order')}
            className="bg-blue-600 text-white p-4 rounded-full shadow-lg border-4 border-gray-50 hover:bg-blue-700 transition-all transform hover:scale-105"
          >
            <ShoppingBag size={24} />
          </button>
        </div>

        <button 
          onClick={() => navigate('/history')}
          className={`flex flex-col items-center gap-1 ${isActive('/history') ? 'text-blue-600' : 'text-gray-400'}`}
        >
          <Activity size={24} />
          <span className="text-[10px] font-medium">Activity</span>
        </button>

        <button 
          onClick={() => navigate('/profile')}
          className={`flex flex-col items-center gap-1 ${isActive('/profile') ? 'text-blue-600' : 'text-gray-400'}`}
        >
          <User size={24} />
          <span className="text-[10px] font-medium">Profile</span>
        </button>

      </div>
    </div>
  );
};

export default BottomNav;
