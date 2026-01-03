
import React from 'react';
import { LayoutDashboard, UtensilsCrossed, BookOpen, Settings2, History, PieChart, Store, User, HelpCircle } from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
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

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  return (
    <div className="w-64 bg-white h-screen border-r border-gray-200 flex flex-col fixed left-0 top-0">
      <div className="p-6 flex items-center space-x-3">
        <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center text-white font-bold text-xl">R</div>
        <div>
          <h1 className="text-sm font-bold text-gray-800 leading-tight">Cafe Rock Bottom</h1>
          <p className="text-[10px] text-gray-500 uppercase tracking-widest font-semibold">Coffee House</p>
        </div>
      </div>
      
      <nav className="flex-1 mt-4 px-3 space-y-1">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
              activeTab === item.id 
                ? 'bg-blue-600 text-white shadow-sm' 
                : 'text-gray-500 hover:bg-gray-100 hover:text-gray-800'
            }`}
          >
            <item.icon className="w-5 h-5 mr-3" />
            {item.label}
          </button>
        ))}
      </nav>
    </div>
  );
};

export default Sidebar;
