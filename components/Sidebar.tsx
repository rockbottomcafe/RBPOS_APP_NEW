
import React from 'react';
import { LayoutDashboard, UtensilsCrossed, BookOpen, Settings2, History, PieChart, Store, User, HelpCircle } from 'lucide-react';
import { AppSettings } from '../types';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  settings: AppSettings;
}

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'dinein', label: 'Dine In', icon: UtensilsCrossed },
  { id: 'menu', label: 'Menu Items', icon: BookOpen },
  { id: 'tablesetup', label: 'Table Setup', icon: Store },
  { id: 'history', label: 'Order History', icon: History },
  { id: 'reports', label: 'Reports', icon: PieChart },
  { id: 'settings', label: 'Settings', icon: Settings2 },
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'help', label: 'Help', icon: HelpCircle },
];

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, settings }) => {
  const isDark = settings.theme === 'Midnight';
  
  return (
    <div className={`w-64 h-screen border-r flex flex-col fixed left-0 top-0 transition-colors duration-300 ${
      isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-200'
    }`}>
      <div className="p-6 flex items-center space-x-3">
        {settings.logoUrl ? (
          <img src={settings.logoUrl} alt="Logo" className="w-10 h-10 object-contain rounded-lg shadow-sm" />
        ) : (
          <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-md">
            {settings.invoiceHeader?.charAt(0) || 'R'}
          </div>
        )}
        <div>
          <h1 className={`text-sm font-bold leading-tight ${isDark ? 'text-white' : 'text-gray-800'}`}>
            {settings.invoiceHeader || 'Cafe Rock Bottom'}
          </h1>
          <p className={`text-[10px] uppercase tracking-widest font-semibold ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
            Coffee House
          </p>
        </div>
      </div>
      
      <nav className="flex-1 mt-4 px-3 space-y-1">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
              activeTab === item.id 
                ? 'bg-blue-600 text-white shadow-lg scale-[1.02]' 
                : isDark 
                  ? 'text-slate-400 hover:bg-slate-800 hover:text-white' 
                  : 'text-gray-500 hover:bg-gray-100 hover:text-gray-800'
            }`}
          >
            <item.icon className="w-5 h-5 mr-3" />
            {item.label}
          </button>
        ))}
      </nav>

      <div className={`p-4 mt-auto border-t ${isDark ? 'border-slate-800' : 'border-gray-100'}`}>
        <div className={`p-3 rounded-xl flex items-center space-x-3 ${isDark ? 'bg-slate-800/50' : 'bg-blue-50'}`}>
          <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-bold">
            AD
          </div>
          <div>
            <p className={`text-xs font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>Admin Mode</p>
            <p className="text-[10px] text-blue-500 font-bold uppercase tracking-tighter">Terminal #01</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
