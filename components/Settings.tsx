
import React, { useState, useEffect } from 'react';
import { AppSettings, BusinessProfile, ThemeType, InvoiceLine } from '../types.ts';
import { 
  Settings as SettingsIcon, 
  Image as ImageIcon, 
  FileText, 
  Printer, 
  CheckCircle, 
  Store, 
  Tag, 
  X, 
  Moon, 
  Sun, 
  Leaf, 
  Monitor, 
  Plus, 
  Minus,
  Trash2, 
  AlignLeft, 
  AlignCenter, 
  AlignRight, 
  Type 
} from 'lucide-react';

interface SettingsProps {
  settings: AppSettings;
  profile: BusinessProfile;
  onSaveSettings: (settings: AppSettings) => void;
  onSaveProfile: (profile: BusinessProfile) => void;
}

interface LineEditorProps {
  line: InvoiceLine;
  type: 'header' | 'footer';
  onUpdate: (type: 'header' | 'footer', id: string, updates: Partial<InvoiceLine>) => void;
  onRemove: (type: 'header' | 'footer', id: string) => void;
}

/**
 * LineEditor: Independent component for managing a single line of the invoice.
 * Wired to unique IDs to prevent cross-line interference.
 */
const LineEditor: React.FC<LineEditorProps> = ({ line, type, onUpdate, onRemove }) => (
  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100 group animate-in slide-in-from-top-2 duration-200">
    <input 
      value={line.text}
      onChange={(e) => onUpdate(type, line.id, { text: e.target.value })}
      placeholder="Enter text..."
      className="flex-1 bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-xs font-bold focus:ring-2 focus:ring-blue-500 outline-none"
    />
    
    {/* Font Size Controls */}
    <div className="flex items-center bg-white border border-gray-200 rounded-lg p-1 space-x-1">
      <button 
        type="button"
        onClick={() => onUpdate(type, line.id, { size: Math.max(8, line.size - 1) })} 
        className="p-1 hover:bg-gray-100 rounded text-gray-500 transition-colors"
      >
        <Minus className="w-3.5 h-3.5" />
      </button>
      <span className="text-[10px] font-black w-7 text-center tabular-nums">{line.size}</span>
      <button 
        type="button"
        onClick={() => onUpdate(type, line.id, { size: Math.min(32, line.size + 1) })} 
        className="p-1 hover:bg-gray-100 rounded text-gray-500 transition-colors"
      >
        <Plus className="w-3.5 h-3.5" />
      </button>
    </div>

    {/* Alignment Controls */}
    <div className="flex items-center bg-white border border-gray-200 rounded-lg p-1 space-x-1">
      <button 
        type="button"
        onClick={() => onUpdate(type, line.id, { align: 'left' })}
        className={`p-1 rounded transition-all ${line.align === 'left' ? 'bg-blue-100 text-blue-600 shadow-sm' : 'text-gray-400 hover:bg-gray-100'}`}
      ><AlignLeft className="w-3.5 h-3.5" /></button>
      <button 
        type="button"
        onClick={() => onUpdate(type, line.id, { align: 'center' })}
        className={`p-1 rounded transition-all ${line.align === 'center' ? 'bg-blue-100 text-blue-600 shadow-sm' : 'text-gray-400 hover:bg-gray-100'}`}
      ><AlignCenter className="w-3.5 h-3.5" /></button>
      <button 
        type="button"
        onClick={() => onUpdate(type, line.id, { align: 'right' })}
        className={`p-1 rounded transition-all ${line.align === 'right' ? 'bg-blue-100 text-blue-600 shadow-sm' : 'text-gray-400 hover:bg-gray-100'}`}
      ><AlignRight className="w-3.5 h-3.5" /></button>
    </div>

    {/* Bold Toggle */}
    <button 
      type="button"
      onClick={() => onUpdate(type, line.id, { bold: !line.bold })}
      className={`p-2 rounded-lg border transition-all flex items-center justify-center w-8 h-8 ${line.bold ? 'bg-blue-600 border-blue-600 text-white shadow-md' : 'bg-white border-gray-200 text-gray-400 hover:bg-gray-100'}`}
    >
      <span className="text-[10px] font-black">B</span>
    </button>

    {/* Delete Button */}
    <button 
      type="button"
      onClick={() => onRemove(type, line.id)}
      className="p-2 text-red-400 hover:bg-red-50 hover:text-red-600 rounded-lg transition-all opacity-0 group-hover:opacity-100"
      title="Delete Line"
    >
      <Trash2 className="w-4 h-4" />
    </button>
  </div>
);

const Settings: React.FC<SettingsProps> = ({ settings, profile, onSaveSettings, onSaveProfile }) => {
  const [localSettings, setLocalSettings] = useState<AppSettings>(settings);
  const [localProfile, setLocalProfile] = useState<BusinessProfile>(profile);
  const [isSaved, setIsSaved] = useState(false);

  // Sync with incoming props if they change externally (like Firestore updates)
  useEffect(() => {
    setLocalSettings(settings);
    setLocalProfile(profile);
  }, [settings, profile]);

  const generateUniqueId = () => {
    // Enhanced entropy to prevent ID collisions
    return `line_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
  };

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

  const addLine = (type: 'header' | 'footer') => {
    const newLine: InvoiceLine = {
      id: generateUniqueId(),
      text: type === 'header' ? 'New Header Line' : 'New Footer Line',
      size: 12,
      bold: false,
      align: 'center'
    };
    
    setLocalSettings(prev => {
      const field = type === 'header' ? 'headerLines' : 'footerLines';
      const existing = prev[field] || [];
      return { 
        ...prev, 
        [field]: [...existing, newLine] 
      };
    });
  };

  const removeLine = (type: 'header' | 'footer', id: string) => {
    setLocalSettings(prev => {
      const field = type === 'header' ? 'headerLines' : 'footerLines';
      const existing = prev[field] || [];
      return { 
        ...prev, 
        [field]: existing.filter(l => l.id !== id) 
      };
    });
  };

  const updateLine = (type: 'header' | 'footer', id: string, updates: Partial<InvoiceLine>) => {
    setLocalSettings(prev => {
      const field = type === 'header' ? 'headerLines' : 'footerLines';
      const existing = prev[field] || [];
      return {
        ...prev,
        [field]: existing.map(l => l.id === id ? { ...l, ...updates } : l)
      };
    });
  };

  const themes: { id: ThemeType; label: string; icon: any; color: string }[] = [
    { id: 'Rock Bottom', label: 'Rock Bottom', icon: Sun, color: 'bg-blue-600' },
    { id: 'Midnight', label: 'Midnight', icon: Moon, color: 'bg-slate-900' },
    { id: 'Eco-Green', label: 'Eco-Green', icon: Leaf, color: 'bg-emerald-600' },
    { id: 'Modern Minimalist', label: 'Modern', icon: Monitor, color: 'bg-gray-400' },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
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
          {/* Business Profile Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="space-y-6">
              <div className="flex items-center space-x-2 text-blue-600">
                <Store className="w-4 h-4" />
                <h3 className="text-sm font-black uppercase tracking-widest">Store Identity</h3>
              </div>
              <div className="space-y-4">
                <input 
                  value={localProfile.ownerName}
                  onChange={e => setLocalProfile({...localProfile, ownerName: e.target.value})}
                  placeholder="Owner Name"
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-bold text-sm"
                />
                <textarea 
                  rows={2}
                  value={localProfile.address}
                  onChange={e => setLocalProfile({...localProfile, address: e.target.value})}
                  placeholder="Store Address"
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-bold text-sm resize-none"
                />
              </div>
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
                <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">UI Theme</span>
                <div className="flex space-x-2">
                   {themes.map(t => (
                     <button 
                       key={t.id}
                       onClick={() => setLocalSettings(prev => ({ ...prev, theme: t.id }))}
                       className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${localSettings.theme === t.id ? 'bg-blue-600 text-white shadow-md' : 'bg-white border border-gray-200 text-gray-400'}`}
                       title={t.label}
                     >
                       <t.icon className="w-4 h-4" />
                     </button>
                   ))}
                </div>
              </div>
            </div>

            <div className="space-y-6">
               <div className="flex items-center space-x-2 text-blue-600">
                <ImageIcon className="w-4 h-4" />
                <h3 className="text-sm font-black uppercase tracking-widest">Logo & Bill Branding</h3>
              </div>
              <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                <div className="w-16 h-16 bg-white rounded-xl border border-gray-200 overflow-hidden flex items-center justify-center p-2">
                  {localSettings.logoUrl ? <img src={localSettings.logoUrl} className="max-h-full max-w-full object-contain" /> : <ImageIcon className="w-6 h-6 text-gray-200" />}
                </div>
                <div className="flex-1">
                   <label className="inline-block px-4 py-1.5 bg-white border border-gray-200 text-[9px] font-black uppercase tracking-widest rounded-lg cursor-pointer hover:bg-gray-100 transition-all shadow-sm">
                    Upload Logo
                    <input type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
                  </label>
                  <div className="flex items-center mt-2 space-x-4">
                    <button 
                      onClick={() => setLocalSettings(s => ({...s, showLogoOnBill: !s.showLogoOnBill}))}
                      className={`text-[9px] font-black uppercase tracking-tight transition-colors ${localSettings.showLogoOnBill ? 'text-blue-600 font-black' : 'text-gray-400 font-bold'}`}
                    >
                      {localSettings.showLogoOnBill ? 'Logo Visible' : 'Logo Hidden'}
                    </button>
                    <button 
                      onClick={() => setLocalSettings(s => ({...s, showAddressOnBill: !s.showAddressOnBill}))}
                      className={`text-[9px] font-black uppercase tracking-tight transition-colors ${localSettings.showAddressOnBill ? 'text-blue-600 font-black' : 'text-gray-400 font-bold'}`}
                    >
                      {localSettings.showAddressOnBill ? 'Addr Visible' : 'Addr Hidden'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Invoice Designer Section */}
          <div className="space-y-8 pt-12 border-t border-gray-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Printer className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-800">Invoice Designer</h2>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">80mm Thermal Printer Template</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              <div className="space-y-10">
                {/* Header Section Editor */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center">
                      <FileText className="w-3.5 h-3.5 mr-2" /> Header Sections
                    </h3>
                    <button 
                      onClick={() => addLine('header')}
                      className="p-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-600 hover:text-white transition-all shadow-sm active:scale-95"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="space-y-2">
                    {(localSettings.headerLines || []).map(line => (
                      <LineEditor 
                        key={line.id} 
                        line={line} 
                        type="header" 
                        onUpdate={updateLine}
                        onRemove={removeLine}
                      />
                    ))}
                  </div>
                </div>

                {/* Global Font Size Control */}
                <div className="space-y-4">
                  <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center">
                    <Type className="w-3.5 h-3.5 mr-2" /> Global Typography
                  </h3>
                  <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 flex items-center justify-between">
                    <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Bill Body Font Size</span>
                    <div className="flex items-center bg-white border border-gray-200 rounded-xl p-1.5 space-x-3">
                      <button 
                        onClick={() => setLocalSettings(s => ({...s, bodyFontSize: Math.max(8, s.bodyFontSize - 1)}))} 
                        className="p-1.5 hover:bg-gray-100 rounded text-gray-500 transition-colors"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="text-sm font-black w-8 text-center tabular-nums">{localSettings.bodyFontSize}px</span>
                      <button 
                        onClick={() => setLocalSettings(s => ({...s, bodyFontSize: Math.min(20, s.bodyFontSize + 1)}))} 
                        className="p-1.5 hover:bg-gray-100 rounded text-gray-500 transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Footer Section Editor */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center">
                      <Tag className="w-3.5 h-3.5 mr-2" /> Footer Sections
                    </h3>
                    <button 
                      onClick={() => addLine('footer')}
                      className="p-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-600 hover:text-white transition-all shadow-sm active:scale-95"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="space-y-2">
                    {(localSettings.footerLines || []).map(line => (
                      <LineEditor 
                        key={line.id} 
                        line={line} 
                        type="footer" 
                        onUpdate={updateLine}
                        onRemove={removeLine}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Thermal Printer Live Preview */}
              <div className="flex flex-col items-center">
                <div className="sticky top-24">
                  <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 text-center">80mm Live Preview</h3>
                  <div className="w-[300px] bg-white shadow-2xl rounded-sm border-t-8 border-gray-800 p-6 font-mono relative overflow-hidden flex flex-col items-center min-h-[400px]">
                    <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-transparent via-gray-50/5 to-transparent opacity-50"></div>
                    
                    {localSettings.showLogoOnBill && localSettings.logoUrl && (
                      <img src={localSettings.logoUrl} className="max-h-16 max-w-full object-contain mb-4 grayscale opacity-80" />
                    )}

                    {/* Rendered Header Lines */}
                    {(localSettings.headerLines || []).map(line => (
                      <div 
                        key={line.id} 
                        style={{ 
                          fontSize: `${line.size}px`, 
                          fontWeight: line.bold ? 'bold' : 'normal',
                          textAlign: line.align,
                          width: '100%'
                        }}
                        className="mb-1 leading-tight break-words"
                      >
                        {line.text}
                      </div>
                    ))}

                    {localSettings.showAddressOnBill && (
                      <div className="text-[10px] text-center mt-2 border-b border-dashed border-gray-300 pb-2 w-full">
                        {localProfile.address}
                      </div>
                    )}

                    {/* Dummy Body Content */}
                    <div className="w-full mt-4 space-y-1.5" style={{ fontSize: `${localSettings.bodyFontSize}px` }}>
                      <div className="flex justify-between border-b border-dashed border-gray-200 pb-1 font-bold">
                        <span>Items</span>
                        <span>Amt</span>
                      </div>
                      <div className="flex justify-between opacity-70">
                        <span>Veggie Wrap x 2</span>
                        <span>₹298.00</span>
                      </div>
                      <div className="flex justify-between opacity-70">
                        <span>Cheese Corn Maggi x 1</span>
                        <span>₹119.00</span>
                      </div>
                      <div className="border-t border-dashed border-gray-400 mt-2 pt-2 flex justify-between">
                        <span>Subtotal:</span>
                        <span>₹417.00</span>
                      </div>
                      <div className="flex justify-between font-bold text-lg border-b-2 border-double border-gray-800 pb-1 mt-1">
                        <span>TOTAL:</span>
                        <span>₹417.00</span>
                      </div>
                    </div>

                    {/* Rendered Footer Lines */}
                    <div className="mt-6 w-full space-y-1">
                      {(localSettings.footerLines || []).map(line => (
                        <div 
                          key={line.id} 
                          style={{ 
                            fontSize: `${line.size}px`, 
                            fontWeight: line.bold ? 'bold' : 'normal',
                            textAlign: line.align,
                            width: '100%'
                          }}
                          className="leading-tight"
                        >
                          {line.text}
                        </div>
                      ))}
                    </div>

                    {/* Aesthetic Receipt Tear-off Edge */}
                    <div className="absolute -bottom-1 left-0 right-0 flex justify-between">
                       {[...Array(15)].map((_, i) => (
                         <div key={i} className="w-4 h-4 bg-gray-50 rotate-45 transform translate-y-2"></div>
                       ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
