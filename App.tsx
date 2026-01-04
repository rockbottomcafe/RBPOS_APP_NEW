
import React, { useState, useEffect, useCallback } from 'react';
import Sidebar from './components/Sidebar.tsx';
import Dashboard from './components/Dashboard.tsx';
import DineIn from './components/DineIn.tsx';
import MenuMgmt from './components/MenuMgmt.tsx';
import Profile from './components/Profile.tsx';
import TableSetup from './components/TableSetup.tsx';
import Settings from './components/Settings.tsx';
import OrderHistory from './components/OrderHistory.tsx';
import Reports from './components/Reports.tsx';
import { db } from './services/db.ts';
import { MenuItem, Table, Order, BusinessProfile, AppSettings } from './types.ts';
import { INITIAL_SETTINGS } from './constants.tsx';
import { Clock, Calendar, Bell, User as UserIcon, CheckCircle2, AlertTriangle, PieChart as PieChartIcon } from 'lucide-react';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [tables, setTables] = useState<Table[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [profile, setProfile] = useState<BusinessProfile | null>(null);
  const [settings, setSettings] = useState<AppSettings>(INITIAL_SETTINGS);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [dbStatus, setDbStatus] = useState<'testing' | 'connected' | 'error'>('testing');

  useEffect(() => {
    db.testConnection().then(success => {
      setDbStatus(success ? 'connected' : 'error');
    });

    const unsubTables = db.subscribeToTables((data) => {
      setTables(data);
      setLoading(false);
    });
    
    const unsubMenu = db.subscribeToMenu((data) => setMenu(data));
    const unsubOrders = db.subscribeToOrders((data) => setOrders(data));
    const unsubSettings = db.subscribeToSettings((data) => setSettings(data));

    db.getProfile().then(setProfile);

    const timer = setInterval(() => setCurrentTime(new Date()), 1000);

    return () => {
      unsubTables();
      unsubMenu();
      unsubOrders();
      unsubSettings();
      clearInterval(timer);
    };
  }, []);

  const handleOrderComplete = useCallback(async (order: Order, tableId: string) => {
    try {
      await db.createOrder(order);
    } catch (err) {
      console.error("Order completion failed:", err);
      alert("Database Error: Could not save order.");
    }
  }, []);

  const handleTableUpdate = useCallback(async (tableId: string, updates: Partial<Table>) => {
    try {
      await db.updateTable(tableId, updates);
    } catch (err) {
      console.error("Table update failed:", err);
    }
  }, []);

  const handleTableSetupUpdate = useCallback(async (updatedTables: Table[]) => {
    try {
      setTables(updatedTables);
      await db.setTables(updatedTables);
    } catch (err) {
      console.error("Table setup failed:", err);
      alert("Database Error: Failed to update table configuration.");
    }
  }, []);

  const handleMenuUpdate = useCallback(async (updatedMenu: MenuItem[]) => {
    try {
      setMenu(updatedMenu);
      await db.updateMenu(updatedMenu);
    } catch (err) {
      console.error("Menu update failed:", err);
      alert("Database Error: Failed to update menu.");
    }
  }, []);

  const handleProfileSave = useCallback(async (updatedProfile: BusinessProfile) => {
    try {
      await db.updateProfile(updatedProfile);
      setProfile(updatedProfile);
    } catch (err) {
      console.error("Profile update failed:", err);
      alert("Database Error: Failed to save profile.");
    }
  }, []);

  const handleSettingsSave = useCallback(async (updatedSettings: AppSettings) => {
    try {
      await db.updateSettings(updatedSettings);
      setSettings(updatedSettings);
    } catch (err) {
      console.error("Settings update failed:", err);
      alert("Database Error: Failed to save settings.");
    }
  }, []);

  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-gray-500 font-bold animate-pulse">Connecting to Rock Bottom Cloud...</p>
        </div>
      </div>
    );
  }

  const getThemeClass = () => {
    switch (settings.theme) {
      case 'Midnight': return 'bg-slate-950 text-slate-100';
      case 'Eco-Green': return 'bg-emerald-50 text-gray-900';
      case 'Modern Minimalist': return 'bg-white text-gray-900';
      default: return 'bg-gray-50 text-gray-900';
    }
  };

  const isDark = settings.theme === 'Midnight';

  return (
    <div className={`min-h-screen flex transition-colors duration-300 ${getThemeClass()}`}>
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} settings={settings} />
      
      <main className="flex-1 ml-64 p-8 relative">
        <header className="flex justify-between items-center mb-10">
          <div className="flex items-center space-x-6">
            <div className={`flex space-x-4 p-1 rounded-2xl ${isDark ? 'bg-slate-900' : 'bg-white shadow-sm border border-gray-100'}`}>
              {[
                { label: 'Dashboard', id: 'dashboard' },
                { label: 'Dine In', id: 'dinein' },
                { label: 'Menu Items', id: 'menu' },
                { label: 'Table Setup', id: 'tablesetup' },
                { label: 'Order History', id: 'history' },
                { label: 'Reports', id: 'reports' },
                { label: 'Settings', id: 'settings' }
              ].map(t => (
                <button 
                  key={t.id}
                  onClick={() => setActiveTab(t.id)}
                  className={`px-5 py-2 text-xs font-bold uppercase tracking-wider rounded-xl transition-all ${
                    activeTab === t.id 
                      ? 'bg-blue-600 text-white shadow-md' 
                      : isDark ? 'text-slate-400 hover:text-white' : 'text-gray-400 hover:bg-gray-50 hover:text-gray-800'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
            
            <div className={`flex items-center px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
              dbStatus === 'connected' 
                ? (isDark ? 'bg-emerald-500/10 text-emerald-400' : 'bg-green-100 text-green-700') 
                : (isDark ? 'bg-red-500/10 text-red-400' : 'bg-red-100 text-red-700')
            }`}>
              {dbStatus === 'connected' ? (
                <><CheckCircle2 className="w-3 h-3 mr-2" /> Cloud Live</>
              ) : (
                <><AlertTriangle className="w-3 h-3 mr-2" /> Offline Mode</>
              )}
            </div>
          </div>

          <div className={`flex items-center space-x-6 ${isDark ? 'text-slate-100' : 'text-gray-800'}`}>
            <div className="text-right">
              <div className="text-xl font-black flex items-center justify-end tracking-tighter">
                {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                <Clock className="w-5 h-5 ml-3 text-blue-500 opacity-60" />
              </div>
              <div className={`text-[10px] font-black uppercase tracking-widest flex items-center justify-end ${isDark ? 'text-slate-500' : 'text-gray-400'}`}>
                {currentTime.toLocaleDateString([], { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
                <Calendar className="w-3 h-3 ml-2" />
              </div>
            </div>
            
            <div className={`flex items-center space-x-3 pl-6 border-l ${isDark ? 'border-slate-800' : 'border-gray-200'}`}>
              <button className={`p-2 rounded-xl border transition-all ${isDark ? 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white' : 'bg-white border-gray-100 shadow-sm text-gray-500 hover:text-blue-600'}`}>
                <Bell className="w-5 h-5" />
              </button>
              <button 
                onClick={() => setActiveTab('profile')}
                className={`p-2 rounded-xl border transition-all ${
                  activeTab === 'profile' 
                    ? 'text-blue-600 border-blue-200' 
                    : isDark ? 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white' : 'bg-white border-gray-100 shadow-sm text-gray-500 hover:text-blue-600'
                }`}
              >
                <UserIcon className="w-5 h-5" />
              </button>
            </div>
          </div>
        </header>

        <div className="max-w-[1500px] mx-auto">
          {activeTab === 'dashboard' && <Dashboard orders={orders} />}
          {activeTab === 'dinein' && profile && (
            <DineIn 
              tables={tables} 
              menu={menu} 
              orders={orders}
              profile={profile}
              settings={settings}
              onOrderComplete={handleOrderComplete} 
              onTableUpdate={handleTableUpdate} 
            />
          )}
          {activeTab === 'menu' && <MenuMgmt menu={menu} onUpdate={handleMenuUpdate} />}
          {activeTab === 'tablesetup' && <TableSetup tables={tables} onUpdate={handleTableSetupUpdate} />}
          {activeTab === 'history' && profile && (
            <OrderHistory orders={orders} settings={settings} profile={profile} />
          )}
          {activeTab === 'reports' && profile && (
            <Reports orders={orders} settings={settings} profile={profile} />
          )}
          {activeTab === 'settings' && profile && (
            <Settings 
              settings={settings} 
              profile={profile}
              onSaveSettings={handleSettingsSave}
              onSaveProfile={handleProfileSave}
            />
          )}
          {activeTab === 'profile' && profile && <Profile profile={profile} onSave={handleProfileSave} />}
          
          {['help'].includes(activeTab) && (
             <div className={`flex flex-col items-center justify-center h-80 rounded-3xl border-2 border-dashed ${isDark ? 'border-slate-800 text-slate-600' : 'border-gray-200 text-gray-300'}`}>
              <PieChartIcon className="w-16 h-16 mb-4 opacity-20" />
              <h2 className="text-xl font-bold">Module under development</h2>
              <p className="text-sm">Advanced support tools are coming soon.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default App;
