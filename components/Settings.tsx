
import React, { useState } from 'react';
import { AppSettings, BusinessProfile, ThemeType } from '../types.ts';
import { Settings as SettingsIcon, Image as ImageIcon, FileText, Printer, CheckCircle, Store, MapPin, Tag, X, Palette, Moon, Sun, Leaf, Monitor } from 'lucide-react';

interface SettingsProps {
  settings: AppSettings;
  profile: BusinessProfile;
  onSaveSettings: (settings: AppSettings) => void;
  onSaveProfile: (profile: BusinessProfile) => void;
}

const Settings: React.FC<SettingsProps> = ({ settings, profile, onSaveSettings, onSaveProfile }) => {
  const [localSettings, setLocalSettings] = useState<AppSettings>(settings);
  const [localProfile, setLocalProfile] = useState<BusinessProfile>(profile);
  const [isSaved, setIsSaved] = useState(false);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setLocalSettings(prev => ({ ...prev, logoUrl: reader.result as string }));
    };
    reader.readAsDataURL(file);
  };

  const handleSaveAll = () => {
    onSaveSettings(localSettings);
    onSaveProfile(localProfile);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const themes: { id: ThemeType; label: string; icon: any; color: string }[] = [
    { id: 'Rock Bottom', label: 'Rock Bottom', icon: Sun, color: 'bg-blue-600' },
    { id: 'Midnight', label: 'Midnight', icon: Moon, color: 'bg-slate-900' },
    { id: 'Eco-Green', label: 'Eco-Green', icon: Leaf, color: 'bg-emerald-600' },
    { id: 'Modern Minimalist', label: 'Modern', icon: Monitor, color: 'bg-gray-400' },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b bg-gray-50 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <SettingsIcon className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800">System Configuration</h2>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Global POS Preferences</p>
            </div>
          </div>
          <button 
            onClick={handleSaveAll}
            className={`flex items-center px-8 py-3 font-black text-xs uppercase tracking-widest rounded-xl transition-all shadow-md active:scale-95 ${
              isSaved ? 'bg-green-600 text-white' : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {isSaved ? <><CheckCircle className="w-4 h-4 mr-2" /> Changes Saved!</> : <><CheckCircle className="w-4 h-4 mr-2" /> Save Changes</>}
          </button>
        </div>

        <div className="p-8 space-y-12">
          {/* Theme Selection */}
          <div className="space-y-6">
            <div className="flex items-center space-x-2 text-blue-600">
              <Palette className="w-4 h-4" />
              <h3 className="text-sm font-black uppercase tracking-widest">Visual Experience</h3>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {themes.map((theme) => (
                <button
                  key={theme.id}
                  onClick={() => setLocalSettings(prev => ({ ...prev, theme: theme.id }))}
                  className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center justify-center space-y-3 ${
                    localSettings.theme === theme.id 
                      ? 'bg-blue-50 border-blue-600 shadow-lg' 
                      : 'bg-white border-gray-100 hover:border-blue-200'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white ${theme.color}`}>
                    <theme.icon className="w-5 h-5" />
                  </div>
                  <span className={`text-[10px] font-black uppercase tracking-widest ${localSettings.theme === theme.id ? 'text-blue-700' : 'text-gray-400'}`}>
                    {theme.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {/* Business Profile */}
            <div className="space-y-6">
              <div className="flex items-center space-x-2 text-blue-600">
                <Store className="w-4 h-4" />
                <h3 className="text-sm font-black uppercase tracking-widest">Store Identity</h3>
              </div>
              
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Owner Name</label>
                  <input 
                    value={localProfile.ownerName}
                    onChange={e => setLocalProfile({...localProfile, ownerName: e.target.value})}
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none font-bold text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">FSSAI Number</label>
                  <input 
                    value={localProfile.fssai}
                    onChange={e => setLocalProfile({...localProfile, fssai: e.target.value})}
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none font-bold text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Store Address</label>
                  <textarea 
                    rows={3}
                    value={localProfile.address}
                    onChange={e => setLocalProfile({...localProfile, address: e.target.value})}
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none font-bold text-sm resize-none"
                  />
                </div>
              </div>
            </div>

            {/* Branding & Logo */}
            <div className="space-y-6">
              <div className="flex items-center space-x-2 text-blue-600">
                <ImageIcon className="w-4 h-4" />
                <h3 className="text-sm font-black uppercase tracking-widest">Logo & Branding</h3>
              </div>
              
              <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-200 rounded-3xl bg-gray-50/50">
                {localSettings.logoUrl ? (
                  <div className="relative group">
                    <img src={localSettings.logoUrl} alt="Store Logo" className="h-28 w-28 object-contain rounded-xl shadow-md bg-white p-2" />
                    <button 
                      onClick={() => setLocalSettings(prev => ({ ...prev, logoUrl: undefined }))}
                      className="absolute -top-3 -right-3 bg-red-500 text-white p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all hover:scale-110"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <div className="text-center">
                    <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-sm mx-auto mb-3">
                      <ImageIcon className="w-8 h-8 text-gray-200" />
                    </div>
                    <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-4">No Logo Selected</p>
                  </div>
                )}
                <label className="mt-4 px-6 py-2 bg-white border border-gray-200 text-gray-600 text-[10px] font-black uppercase tracking-widest rounded-xl cursor-pointer hover:bg-gray-50 transition-all shadow-sm">
                  Choose New File
                  <input type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
                </label>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
                  <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Show Logo on Bill</span>
                  <button 
                    onClick={() => setLocalSettings(s => ({...s, showLogoOnBill: !s.showLogoOnBill}))}
                    className={`w-12 h-6 rounded-full transition-all relative ${localSettings.showLogoOnBill ? 'bg-blue-600' : 'bg-gray-300'}`}
                  >
                    <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${localSettings.showLogoOnBill ? 'translate-x-6' : ''}`}></div>
                  </button>
                </div>
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
                  <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Show Address on Bill</span>
                  <button 
                    onClick={() => setLocalSettings(s => ({...s, showAddressOnBill: !s.showAddressOnBill}))}
                    className={`w-12 h-6 rounded-full transition-all relative ${localSettings.showAddressOnBill ? 'bg-blue-600' : 'bg-gray-300'}`}
                  >
                    <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${localSettings.showAddressOnBill ? 'translate-x-6' : ''}`}></div>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Invoice Template */}
          <div className="space-y-6 pt-8 border-t border-gray-100">
            <div className="flex items-center space-x-2 text-blue-600">
              <Printer className="w-4 h-4" />
              <h3 className="text-sm font-black uppercase tracking-widest">Invoice Customization (80mm)</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Bill Header Text</label>
                <input 
                  value={localSettings.invoiceHeader}
                  onChange={e => setLocalSettings({...localSettings, invoiceHeader: e.target.value})}
                  placeholder="e.g., Bold and True... only for You...!"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none font-bold text-sm"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Bill Footer Text</label>
                <input 
                  value={localSettings.invoiceFooter}
                  onChange={e => setLocalSettings({...localSettings, invoiceFooter: e.target.value})}
                  placeholder="e.g., Thank you for visiting!"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none font-bold text-sm"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
