
import React, { useState, useEffect, useCallback } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import DineIn from './components/DineIn';
import MenuMgmt from './components/MenuMgmt';
import Profile from './components/Profile';
import { db } from './services/mockDb';
import { MenuItem, Table, Order, BusinessProfile, AppSettings } from './types';
import { Clock, Calendar, Bell, User as UserIcon } from 'lucide-react';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [tables, setTables] = useState<Table[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [profile, setProfile] = useState<BusinessProfile | null>(null);
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    setMenu(db.getMenuItems());
    setTables(db.getTables());
    setOrders(db.getOrders());
    setProfile(db.getProfile());
    setSettings(db.getSettings());

    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleOrderComplete = useCallback((order: Order, tableId: string) => {
    db.createOrder(order);
    setOrders(db.getOrders());
  }, []);

  const handleTableUpdate = useCallback((tableId: string, updates: Partial<Table>) => {
    const currentTables = db.getTables();
    const newTables = currentTables.map(t => t.id === tableId ? { ...t, ...updates } : t);
    db.setTables(newTables);
    setTables(newTables);
  }, []);

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard orders={orders} />;
      case 'dinein':
        return <DineIn tables={tables} menu={menu} onOrderComplete={handleOrderComplete} onTableUpdate={handleTableUpdate} />;
      case 'menu':
        return <MenuMgmt menu={menu} onUpdate={(m) => { db.setMenuItems(m); setMenu(m); }} />;
      case 'profile':
        return profile ? <Profile profile={profile} onSave={(p) => { db.updateProfile(p); setProfile(p); }} /> : null;
      default:
        return (
          <div className="flex flex-col items-center justify-center h-full text-gray-400">
            <h2 className="text-xl font-bold">Module under development</h2>
            <p>This feature will be available in the next version.</p>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <main className="flex-1 ml-64 p-8">
        <header className="flex justify-between items-center mb-10">
          <div className="flex space-x-4">
            {['Dashboard', 'Dine In', 'Menu Items', 'Table Setup', 'Order History', 'Reports'].map(t => (
              <button 
                key={t}
                onClick={() => setActiveTab(t.toLowerCase().replace(/\s/g, ''))}
                className={`px-4 py-1.5 text-xs font-semibold rounded-full transition-colors ${
                  activeTab === t.toLowerCase().replace(/\s/g, '') ? 'bg-blue-100 text-blue-700' : 'text-gray-500 hover:bg-gray-200'
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          <div className="flex items-center space-x-6 text-gray-800">
            <div className="text-right">
              <div className="text-lg font-bold flex items-center justify-end">
                {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                <Clock className="w-4 h-4 ml-2 text-gray-400" />
              </div>
              <div className="text-xs font-semibold text-gray-500 flex items-center justify-end">
                {currentTime.toLocaleDateString([], { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
                <Calendar className="w-3 h-3 ml-2" />
              </div>
            </div>
            
            <div className="flex items-center space-x-3 pl-6 border-l border-gray-200">
              <button className="p-2 bg-white rounded-full border border-gray-100 shadow-sm text-gray-500 hover:text-blue-600">
                <Bell className="w-5 h-5" />
              </button>
              <button className="p-2 bg-white rounded-full border border-gray-100 shadow-sm text-gray-500 hover:text-blue-600">
                <UserIcon className="w-5 h-5" />
              </button>
            </div>
          </div>
        </header>

        <div className="max-w-[1400px] mx-auto">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default App;
