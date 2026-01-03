
import React, { useState, useRef, useMemo } from 'react';
import { MenuItem, FoodType } from '../types';
import { 
  Edit2, 
  Trash2, 
  Plus, 
  Upload, 
  X, 
  Loader2, 
  CheckCircle,
  Info,
  BookOpen,
  AlertCircle
} from 'lucide-react';

interface MenuMgmtProps {
  menu: MenuItem[];
  onUpdate: (menu: MenuItem[]) => void;
}

/**
 * A robust CSV parser that handles quoted fields, escaped quotes (""), and commas within quotes.
 */
const parseCSV = (text: string): string[][] => {
  const result: string[][] = [];
  let row: string[] = [];
  let curr = '';
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const next = text[i + 1];

    if (inQuotes) {
      if (char === '"' && next === '"') {
        curr += '"';
        i++; // skip next quote
      } else if (char === '"') {
        inQuotes = false;
      } else {
        curr += char;
      }
    } else {
      if (char === '"') {
        inQuotes = true;
      } else if (char === ',') {
        row.push(curr.trim());
        curr = '';
      } else if (char === '\n' || char === '\r') {
        row.push(curr.trim());
        if (row.length > 0 && (row.length > 1 || row[0] !== '')) {
          result.push(row);
        }
        row = [];
        curr = '';
        if (char === '\r' && next === '\n') i++; // skip \n of \r\n
      } else {
        curr += char;
      }
    }
  }
  
  // Last row handling
  if (curr || row.length > 0) {
    row.push(curr.trim());
    result.push(row);
  }
  
  return result;
};

const MenuMgmt: React.FC<MenuMgmtProps> = ({ menu = [], onUpdate }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [itemToDelete, setItemToDelete] = useState<MenuItem | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filtered = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();
    return (menu || []).filter(item => 
      item.name.toLowerCase().includes(term) || item.category.toLowerCase().includes(term)
    );
  }, [menu, searchTerm]);

  const confirmDelete = () => {
    if (!itemToDelete) return;
    const updatedMenu = menu.filter(i => String(i.id) !== String(itemToDelete.id));
    onUpdate(updatedMenu);
    setIsDeleteModalOpen(false);
    setItemToDelete(null);
  };

  const handleDeleteClick = (item: MenuItem) => {
    setItemToDelete(item);
    setIsDeleteModalOpen(true);
  };

  const handleBulkUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!window.confirm("BULK IMPORT WILL OVERWRITE ALL MENU ITEMS. Proceed?")) {
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    setIsSyncing(true);
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const text = e.target?.result as string;
        const rows = parseCSV(text);
        
        const newItems: MenuItem[] = [];
        const errors: string[] = [];
        const timestamp = Date.now();

        // Skip header if first row looks like one
        const startIdx = (rows[0] && rows[0][0]?.toLowerCase().includes('name')) ? 1 : 0;

        for (let i = startIdx; i < rows.length; i++) {
          const row = rows[i];
          if (row.length < 2) continue; // Skip empty/malformed rows

          const [name, cat, priceStr, type] = row;
          const price = parseFloat(priceStr);

          if (!name || isNaN(price)) {
            errors.push(`Row ${i + 1}: Missing name or invalid price ("${priceStr}")`);
            continue;
          }

          newItems.push({
            id: `item_${timestamp}_${i}_${Math.random().toString(36).substr(2, 5)}`,
            name: name,
            category: (cat || 'GENERAL').toUpperCase(),
            price: price,
            foodType: type?.toLowerCase().includes('non') ? 'non-veg' : 'veg'
          });
        }

        if (newItems.length > 0) {
          onUpdate(newItems);
          let msg = `Successfully imported ${newItems.length} items.`;
          if (errors.length > 0) {
            msg += `\n\nErrors encountered (${errors.length}):\n` + errors.slice(0, 5).join('\n') + (errors.length > 5 ? '\n...' : '');
          }
          alert(msg);
        } else if (errors.length > 0) {
          alert(`Import failed. Errors found:\n` + errors.join('\n'));
        } else {
          alert("No valid menu items found in the file.");
        }
      } catch (err) {
        console.error("CSV Import Error:", err);
        alert("Error parsing CSV. Please check the file format.");
      } finally {
        setIsSyncing(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    };
    reader.readAsText(file);
  };

  const handleSave = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const name = (formData.get('name') as string || '').trim();
    const category = (formData.get('category') as string || '').trim().toUpperCase();
    const price = parseFloat(formData.get('price') as string) || 0;
    const foodType = formData.get('foodType') as FoodType;

    if (!name) return;

    const item: MenuItem = {
      id: editingItem?.id || `item_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      name,
      category,
      price,
      foodType,
    };

    let updatedMenu: MenuItem[];
    if (editingItem) {
      updatedMenu = menu.map(i => String(i.id) === String(item.id) ? item : i);
    } else {
      updatedMenu = [...menu, item];
    }

    onUpdate(updatedMenu);
    setIsModalOpen(false);
    setEditingItem(null);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden relative">
      <input type="file" ref={fileInputRef} onChange={handleBulkUpload} accept=".csv" className="hidden" />

      {isSyncing && (
        <div className="absolute inset-0 bg-white/60 z-50 flex flex-col items-center justify-center backdrop-blur-sm">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin mb-2" />
          <p className="text-xs font-bold text-blue-800 uppercase tracking-widest">Processing Catalog...</p>
        </div>
      )}

      <div className="p-6 border-b flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Menu Catalog</h2>
          <p className="text-xs text-gray-500 mt-1">Manage items and prices in your restaurant menu.</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <input 
            type="text" 
            placeholder="Search catalog..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full md:w-64 font-medium"
          />
          <button onClick={() => fileInputRef.current?.click()} className="flex items-center px-4 py-2 text-sm font-semibold text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all shadow-sm active:scale-95">
            <Upload className="w-4 h-4 mr-2 text-blue-500" /> Bulk Import
          </button>
          <button onClick={() => { setEditingItem(null); setIsModalOpen(true); }} className="flex items-center px-6 py-2 text-sm font-bold text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-all shadow-md active:scale-95">
            <Plus className="w-5 h-5 mr-1" /> Add Item
          </button>
        </div>
      </div>

      <div className="bg-blue-50/50 px-6 py-3 border-b border-blue-100 flex items-center text-[10px] font-bold text-blue-600 uppercase tracking-wider">
        <Info className="w-4 h-4 mr-2" />
        Note: Changes are saved automatically to your database and synced across the app.
      </div>

      <div className="overflow-x-auto min-h-[400px]">
        <table className="w-full text-left">
          <thead className="bg-gray-50 text-gray-400 text-[10px] uppercase font-bold tracking-widest border-b border-gray-100">
            <tr>
              <th className="px-6 py-4">ITEM DETAILS</th>
              <th className="px-6 py-4">CATEGORY</th>
              <th className="px-6 py-4">PRICE</th>
              <th className="px-6 py-4">TYPE</th>
              <th className="px-6 py-4 text-right">ACTIONS</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-16 text-center text-gray-400 font-medium">
                  <div className="flex flex-col items-center">
                    <BookOpen className="w-8 h-8 mb-2 opacity-20" />
                    No items found.
                  </div>
                </td>
              </tr>
            ) : filtered.map(item => (
              <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                <td className="px-6 py-4">
                  <div className="font-bold text-gray-900 text-sm">{item.name}</div>
                  <div className="text-[9px] text-gray-400 font-bold uppercase">ID: {item.id}</div>
                </td>
                <td className="px-6 py-4">
                  <span className="text-[10px] font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded uppercase">{item.category}</span>
                </td>
                <td className="px-6 py-4 font-bold text-gray-900 text-sm">₹{item.price.toFixed(2)}</td>
                <td className="px-6 py-4">
                  <div className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold border ${
                    item.foodType === 'veg' ? 'bg-green-50 text-green-700 border-green-100' : 'bg-red-50 text-red-700 border-red-100'
                  }`}>
                    <div className={`w-1.5 h-1.5 rounded-full mr-2 ${item.foodType === 'veg' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    {item.foodType === 'veg' ? 'VEG' : 'NON-VEG'}
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-2">
                    <button onClick={() => { setEditingItem(item); setIsModalOpen(true); }} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all" title="Edit Item">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDeleteClick(item)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all" title="Delete Item">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b flex justify-between items-center bg-gray-50">
              <h3 className="text-lg font-bold text-gray-800">{editingItem ? 'Edit Item' : 'Add New Item'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <form key={editingItem?.id || 'new'} onSubmit={handleSave} className="p-6 space-y-5">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">ITEM NAME</label>
                <input 
                  name="name" 
                  defaultValue={editingItem?.name} 
                  required 
                  autoFocus
                  placeholder="e.g., Paneer Tikka" 
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none font-bold" 
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">CATEGORY</label>
                <input 
                  name="category" 
                  defaultValue={editingItem?.category} 
                  required 
                  placeholder="e.g., STARTERS" 
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none font-bold uppercase" 
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">PRICE (₹)</label>
                  <input 
                    name="price" 
                    type="number" 
                    step="0.01" 
                    defaultValue={editingItem?.price} 
                    required 
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none font-black" 
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">TYPE</label>
                  <select 
                    name="foodType" 
                    defaultValue={editingItem?.foodType || 'veg'} 
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none font-bold"
                  >
                    <option value="veg">Vegetarian</option>
                    <option value="non-veg">Non-Vegetarian</option>
                  </select>
                </div>
              </div>
              <div className="pt-4">
                <button type="submit" className="w-full py-4 bg-blue-600 text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-blue-700 shadow-lg transition-all active:scale-95 flex items-center justify-center">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  {editingItem ? 'Update Menu Item' : 'Add to Catalog'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-[110] flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl p-8 animate-in fade-in zoom-in duration-200">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-red-50 text-red-600 rounded-full flex items-center justify-center mb-4">
                <AlertCircle className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Confirm Deletion</h3>
              <p className="text-sm text-gray-500 mb-8 leading-relaxed">
                Are you sure you want to remove <span className="font-bold text-gray-800">"{itemToDelete?.name}"</span> from the menu? This action cannot be undone.
              </p>
              <div className="flex w-full gap-3">
                <button 
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="flex-1 py-3 border border-gray-200 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={confirmDelete}
                  className="flex-1 py-3 bg-red-600 text-white rounded-xl text-sm font-bold hover:bg-red-700 transition-colors shadow-md active:scale-95"
                >
                  Delete Item
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MenuMgmt;
