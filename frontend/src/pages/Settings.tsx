import React from 'react';
import { useAuth } from '../context/AuthContext';
import { LogOut, User, Shield, Info } from 'lucide-react';

const Settings = () => {
  const { user, logout } = useAuth();

  return (
    <div className="p-4 bg-gray-50 min-h-full pb-24">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-4 mt-4 flex items-center gap-4">
        <div className="bg-primary/10 p-4 rounded-full text-primary">
          <User size={32} />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-800">{user?.name}</h2>
          <p className="text-sm text-gray-500">{user?.role} Account</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-6">
        <div className="p-4 flex items-center gap-3 border-b border-gray-50 cursor-pointer hover:bg-gray-50">
          <Shield className="text-gray-400" size={20} />
          <span className="text-gray-700 font-medium text-sm">Account Settings</span>
        </div>
        <div className="p-4 flex items-center gap-3 border-b border-gray-50 cursor-pointer hover:bg-gray-50">
          <Info className="text-gray-400" size={20} />
          <span className="text-gray-700 font-medium text-sm">About Dukaan360</span>
        </div>
      </div>

      <button
        onClick={logout}
        className="w-full bg-white border border-red-100 text-red-500 p-4 rounded-2xl shadow-sm hover:bg-red-50 flex items-center justify-center gap-2 font-medium transition-colors"
      >
        <LogOut size={20} /> Logout
      </button>
      
      <p className="text-center text-xs text-gray-400 mt-6">Dukaan360 App v1.0.0</p>
    </div>
  );
};

export default Settings;
