
import React, { useState, useMemo } from 'react';
import { Table, MenuItem, Order, OrderItem, PaymentMethod } from '../types';
import { Plus, Minus, X, Check, ArrowLeft, Trash2, Search } from 'lucide-react';

interface DineInProps {
  tables: Table[];
  menu: MenuItem[];
  onOrderComplete: (order: Order, tableId: string) => void;
  onTableUpdate: (tableId: string, updates: Partial<Table>) => void;
}

const DineIn: React.FC<DineInProps> = ({ tables, menu, onOrderComplete, onTableUpdate }) => {
  const [rearrangeMode, setRearrangeMode] = useState(false);
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [cart, setCart] = useState<OrderItem[]>([]);
  const [discount, setDiscount] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isClearModalOpen, setIsClearModalOpen] = useState(false);

  const categories = useMemo(() => {
    const cats = Array.from(new Set(menu.map(item => item.category)));
    return ['All', ...cats];
  }, [menu]);

  const filteredMenu = useMemo(() => {
    return menu.filter(item => {
      const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
      const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [menu, selectedCategory, searchQuery]);

  const handleTableClick = (table: Table) => {
    if (rearrangeMode) return;
    setSelectedTable(table);
    // In a real app, we would load the existing order for the table from the database
    setCart([]); 
  };

  const addToCart = (item: MenuItem) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === item.id);
      if (existing) {
        return prev.map(i => i.id === item.id ? { ...i, qty: i.qty + 1 } : i);
      }
      return [...prev, { id: item.id, name: item.name, price: item.price, qty: 1 }];
    });
  };

  const updateCartQty = (itemId: string, delta: number) => {
    setCart(prev => prev.map(i => {
      if (i.id === itemId) {
        return { ...i, qty: Math.max(0, i.qty + delta) };
      }
      return i;
    }).filter(i => i.qty > 0));
  };

  const removeItem = (itemId: string) => {
    setCart(prev => prev.filter(i => i.id !== itemId));
  };

  const clearOrder = () => {
    setCart([]);
    setIsClearModalOpen(false);
  };

  const calculateTotal = () => {
    const subtotal = cart.reduce((sum, i) => sum + i.price * i.qty, 0);
    const tax = 0; // Tax seems not explicitly broken out in screenshot total line, but subtotal is shown
    const total = subtotal - discount;
    return { subtotal, tax, total };
  };

  const handlePlaceOrder = (status: 'pending' | 'billed' | 'paid', payment: PaymentMethod = '-') => {
    if (!selectedTable || cart.length === 0) return;
    const { subtotal, tax, total } = calculateTotal();
    const order: Order = {
      id: `#${Math.floor(Math.random() * 1000)}`,
      tableId: selectedTable.id,
      tableName: selectedTable.name,
      items: cart,
      subtotal,
      tax,
      discount,
      total,
      status: status as any,
      paymentMethod: payment,
      createdAt: Date.now()
    };

    onOrderComplete(order, selectedTable.id);
    
    const tableStatus = status === 'paid' ? 'vacant' : (status === 'billed' ? 'billed' : 'occupied');
    onTableUpdate(selectedTable.id, { 
      status: tableStatus, 
      orderValue: status === 'paid' ? undefined : total 
    });
    
    setSelectedTable(null);
  };

  if (selectedTable) {
    const totals = calculateTotal();
    return (
      <div className="flex h-[calc(100vh-140px)] -m-8">
        {/* Left Side: Menu Grid */}
        <div className="flex-1 bg-white p-6 overflow-y-auto border-r border-gray-200">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Table: {selectedTable.name}</h2>
            <button 
              onClick={() => setSelectedTable(null)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg flex items-center text-sm font-semibold hover:bg-blue-700 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" /> Back to Floor Plan
            </button>
          </div>

          <div className="flex items-center space-x-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
            <div className="relative w-64 mr-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input 
                type="text" 
                placeholder="Search menu..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors whitespace-nowrap border ${
                  selectedCategory === cat 
                    ? 'bg-blue-600 border-blue-600 text-white' 
                    : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {filteredMenu.map(item => (
              <div key={item.id} className="bg-white border border-gray-100 rounded-xl p-4 flex flex-col justify-between hover:shadow-md transition-shadow group relative">
                <div className="flex justify-between items-start mb-2">
                   <div>
                    <h4 className="text-sm font-bold text-gray-800 leading-tight">{item.name}</h4>
                    <span className="text-[10px] text-gray-400 font-bold uppercase mt-1 block">{item.category}</span>
                   </div>
                   <div className={`w-3 h-3 border border-gray-200 rounded-sm flex items-center justify-center p-0.5`}>
                      <div className={`w-full h-full rounded-full ${item.foodType === 'veg' ? 'bg-green-600' : 'bg-red-600'}`}></div>
                   </div>
                </div>
                <div className="mt-4">
                  <div className="text-sm font-bold text-gray-800">₹{item.price.toFixed(2)}</div>
                  <button 
                    onClick={() => addToCart(item)}
                    className="mt-3 w-full py-2 bg-green-100 text-green-700 text-xs font-bold rounded-lg hover:bg-green-600 hover:text-white transition-colors border border-green-200"
                  >
                    Add
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Side: Current Order Sidebar */}
        <div className="w-[400px] bg-white flex flex-col border-l border-gray-200 shadow-xl z-10">
          <div className="p-6 border-b border-gray-100">
            <h3 className="text-lg font-bold text-gray-800">Current Order</h3>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {cart.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-40 text-gray-400">
                <p className="text-sm font-medium">Your cart is empty</p>
              </div>
            ) : (
              cart.map(item => (
                <div key={item.id} className="flex justify-between items-center group">
                  <div className="flex-1">
                    <h5 className="text-sm font-bold text-gray-800">{item.name}</h5>
                    <div className="text-xs text-gray-400">₹ {item.price.toFixed(2)}</div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden bg-white">
                      <button onClick={() => updateCartQty(item.id, -1)} className="p-1 px-2 hover:bg-gray-50 text-gray-400"><Minus className="w-3 h-3" /></button>
                      <span className="px-3 text-xs font-bold text-gray-800">{item.qty}</span>
                      <button onClick={() => updateCartQty(item.id, 1)} className="p-1 px-2 hover:bg-gray-50 text-gray-400"><Plus className="w-3 h-3" /></button>
                    </div>
                    <button onClick={() => removeItem(item.id)} className="p-1.5 text-red-100 hover:text-red-500 bg-red-50 rounded-lg transition-colors">
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="p-6 bg-gray-50 border-t border-gray-100 space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-gray-600">
                <span className="font-medium">Subtotal</span>
                <span className="font-bold">₹{totals.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span className="font-medium">Discount</span>
                <span className="font-bold">0</span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                <span className="text-base font-bold text-gray-800">Total</span>
                <span className="text-xl font-bold text-gray-900">₹{totals.total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-[10px] text-gray-400 font-bold uppercase">
                <span>Duration</span>
                <span>0 min</span>
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <button className="w-full py-3 bg-[#eab308] text-white rounded-lg text-xs font-bold hover:bg-[#ca8a04] transition-colors">
                Add MISC Charges
              </button>
              <button 
                onClick={() => handlePlaceOrder('pending')}
                className="w-full py-3 bg-[#facc15] text-white rounded-lg text-xs font-bold hover:bg-[#eab308] transition-colors"
              >
                Place / Update Order
              </button>
              <div className="grid grid-cols-2 gap-2">
                <button 
                  onClick={() => handlePlaceOrder('billed')}
                  className="py-3 bg-[#93c5fd] text-blue-800 rounded-lg text-xs font-bold hover:bg-[#60a5fa] transition-colors"
                >
                  Print Bill
                </button>
                <button 
                  onClick={() => handlePlaceOrder('paid', 'UPI')}
                  className="py-3 bg-[#1e3a8a] text-white rounded-lg text-xs font-bold hover:bg-[#1e40af] transition-colors"
                >
                  Settle Payment
                </button>
              </div>
              <button 
                onClick={() => setIsClearModalOpen(true)}
                className="w-full py-3 bg-[#ef4444] text-white rounded-lg text-xs font-bold hover:bg-[#dc2626] transition-colors"
              >
                Clear Order
              </button>
            </div>
          </div>
        </div>

        {/* Clear Order Confirmation Modal */}
        {isClearModalOpen && (
          <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl p-8">
              <h3 className="text-lg font-bold text-gray-900 mb-2">Are you sure?</h3>
              <p className="text-sm text-gray-500 mb-8 leading-relaxed">
                This action cannot be undone. This will clear all items from the current order.
              </p>
              <div className="flex justify-end space-x-3">
                <button 
                  onClick={() => setIsClearModalOpen(false)}
                  className="px-6 py-2 border border-gray-200 rounded-lg text-sm font-bold text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  No
                </button>
                <button 
                  onClick={clearOrder}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 transition-colors"
                >
                  Yes, Clear
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-4 rounded-lg shadow-sm border border-gray-100">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Floor Plan</h2>
          <div className="flex items-center mt-2 space-x-4">
            <div className="flex items-center text-[10px] font-bold uppercase tracking-wider text-gray-500">
              <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div> Vacant
            </div>
            <div className="flex items-center text-[10px] font-bold uppercase tracking-wider text-gray-500">
              <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div> Occupied
            </div>
            <div className="flex items-center text-[10px] font-bold uppercase tracking-wider text-gray-500">
              <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div> Billed
            </div>
          </div>
        </div>
        <div className="flex items-center">
          <span className="mr-3 text-sm font-bold text-gray-600">Rearrange Mode</span>
          <button 
            onClick={() => setRearrangeMode(!rearrangeMode)}
            className={`w-12 h-6 rounded-full transition-colors relative ${rearrangeMode ? 'bg-blue-600' : 'bg-gray-300'}`}
          >
            <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${rearrangeMode ? 'translate-x-6' : ''}`}></div>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
        {tables.map(table => (
          <button
            key={table.id}
            onClick={() => handleTableClick(table)}
            className={`p-6 h-32 rounded-2xl border-2 transition-all flex flex-col items-center justify-center space-y-1 shadow-sm ${
              table.status === 'vacant' ? 'bg-green-500 border-green-600' : 
              table.status === 'occupied' ? 'bg-red-500 border-red-600' : 
              'bg-yellow-500 border-yellow-600'
            } text-white hover:scale-105 active:scale-95`}
          >
            <span className="text-2xl font-black">{table.name}</span>
            <span className="text-[10px] uppercase font-black tracking-widest opacity-80">{table.status}</span>
            {table.orderValue && (
              <span className="text-xs font-bold pt-1">₹{table.orderValue.toFixed(2)}</span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

export default DineIn;
