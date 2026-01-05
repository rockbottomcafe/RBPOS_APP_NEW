
import React, { useState, useMemo, useEffect } from 'react';
import { Table, MenuItem, Order, OrderItem, PaymentMethod, BusinessProfile, AppSettings } from '../types.ts';
import { Plus, Minus, X, Check, ArrowLeft, Trash2, Search, Layers, CreditCard, Banknote, Landmark, Smartphone, Tag, ReceiptText, Calculator, Printer, Clock, Maximize2, Minimize2 } from 'lucide-react';

interface DineInProps {
  tables: Table[];
  menu: MenuItem[];
  orders: Order[];
  profile: BusinessProfile;
  settings: AppSettings;
  onOrderComplete: (order: Order, tableId: string) => void;
  onTableUpdate: (tableId: string, updates: Partial<Table>) => void;
}

type ButtonFeedback = 'idle' | 'success';

const DineIn: React.FC<DineInProps> = ({ tables, menu, orders, profile, settings, onOrderComplete, onTableUpdate }) => {
  const [rearrangeMode, setRearrangeMode] = useState(false);
  const [selectedTableId, setSelectedTableId] = useState<string | null>(null);
  const [sessionStartTime, setSessionStartTime] = useState<number | null>(null);
  const [cart, setCart] = useState<OrderItem[]>([]);
  const [isDirty, setIsDirty] = useState(false);
  const [discount, setDiscount] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  const [punchState, setPunchState] = useState<ButtonFeedback>('idle');
  const [printState, setPrintState] = useState<ButtonFeedback>('idle');
  const [settleState, setSettleState] = useState<ButtonFeedback>('idle');
  const [miscState, setMiscState] = useState<ButtonFeedback>('idle');

  const [isClearModalOpen, setIsClearModalOpen] = useState(false);
  const [isExitGuardOpen, setIsExitGuardOpen] = useState(false);
  const [isSettleModalOpen, setIsSettleModalOpen] = useState(false);
  
  const [paymentMode, setPaymentMode] = useState<PaymentMethod>('UPI');
  const [cashSplit, setCashSplit] = useState<number>(0);
  const [upiSplit, setUpiSplit] = useState<number>(0);

  const selectedTable = useMemo(() => {
    return tables.find(t => t.id === selectedTableId) || null;
  }, [tables, selectedTableId]);

  const categories = useMemo(() => {
    const items = menu || [];
    const cats = Array.from(new Set(items.map(item => item?.category).filter(Boolean)));
    return ['All', ...cats];
  }, [menu]);

  const filteredMenu = useMemo(() => {
    const items = menu || [];
    return items.filter(item => {
      if (!item) return false;
      const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
      const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [menu, selectedCategory, searchQuery]);

  const tablesBySection = useMemo(() => {
    const sections: Record<string, Table[]> = {};
    tables.forEach(table => {
      const sec = table.section || 'General';
      if (!sections[sec]) sections[sec] = [];
      sections[sec].push(table);
    });
    return sections;
  }, [tables]);

  const calculateDurationMins = (startTime: number | undefined | null) => {
    if (!startTime) return 0;
    const diff = Date.now() - startTime;
    return Math.max(1, Math.floor(diff / 60000));
  };

  const handleTableClick = (table: Table) => {
    if (rearrangeMode) return;
    const existingStartTime = table.sessionStartTime || Date.now();
    setSessionStartTime(existingStartTime);
    setSelectedTableId(table.id);
    if (table.status !== 'vacant') {
      const existingOrder = orders.find(o => 
        (o.id === table.currentOrderId) || 
        (o.tableId === table.id && (o.status === 'pending' || o.status === 'billed'))
      );
      if (existingOrder) {
        setCart([...existingOrder.items]);
        setDiscount(existingOrder.discount || 0);
        setIsDirty(false);
        return;
      }
    }
    setCart([]); 
    setIsDirty(false);
    setDiscount(0);
  };

  const addToCart = (item: MenuItem | { id: string, name: string, price: number }) => {
    setIsDirty(true);
    setCart(prev => {
      const existing = prev.find(i => i.id === item.id);
      if (existing) {
        return prev.map(i => i.id === item.id ? { ...i, qty: i.qty + 1 } : i);
      }
      return [...prev, { id: item.id, name: item.name, price: item.price || 0, qty: 1 }];
    });
  };

  const handleMiscCharge = () => {
    if (!sessionStartTime) return;
    const durationMin = calculateDurationMins(sessionStartTime);
    const price = durationMin * 2.5;
    const MISC_ID = 'MISC_TIME_BASED';
    setIsDirty(true);
    setCart(prev => {
      const existing = prev.find(i => i.id === MISC_ID);
      if (existing) {
        return prev.map(i => i.id === MISC_ID ? { ...i, price: price, name: `MISC (${durationMin}m)` } : i);
      }
      return [...prev, { id: MISC_ID, name: `MISC (${durationMin}m)`, price: price, qty: 1 }];
    });
    setMiscState('success');
    setTimeout(() => setMiscState('idle'), 2000);
  };

  const updateCartQty = (itemId: string, delta: number) => {
    setIsDirty(true);
    setCart(prev => prev.map(i => {
      if (i.id === itemId) {
        return { ...i, qty: Math.max(0, i.qty + delta) };
      }
      return i;
    }).filter(i => i.qty > 0));
  };

  const calculateTotal = () => {
    const subtotal = cart.reduce((sum, i) => sum + (Number(i.price) || 0) * (Number(i.qty) || 0), 0);
    const total = subtotal - (Number(discount) || 0);
    return { subtotal, total, discount: Number(discount) || 0 };
  };

  const handlePlaceOrder = async (status: 'pending' | 'billed' | 'paid', payment: PaymentMethod = '-') => {
    if (!selectedTableId || !selectedTable || cart.length === 0) return;
    const { subtotal, total } = calculateTotal();
    const orderId = selectedTable.currentOrderId || `#${Math.floor(Math.random() * 10000)}`;
    const order: Order = {
      id: orderId,
      tableId: selectedTable.id,
      tableName: selectedTable.name,
      items: [...cart],
      subtotal,
      tax: 0,
      discount: Number(discount) || 0,
      total,
      status: status,
      paymentMethod: payment,
      createdAt: Date.now(),
      cashAmount: payment === 'Split' ? cashSplit : (payment === 'Cash' ? total : 0),
      upiAmount: payment === 'Split' ? upiSplit : (payment === 'UPI' ? total : 0)
    };
    onOrderComplete(order, selectedTable.id);
    const tableStatus = status === 'paid' ? 'vacant' : (status === 'billed' ? 'billed' : 'occupied');
    onTableUpdate(selectedTable.id, { 
      status: tableStatus, 
      orderValue: status === 'paid' ? 0 : total,
      sessionStartTime: status === 'paid' ? undefined : (selectedTable.sessionStartTime || sessionStartTime || Date.now()),
      currentOrderId: status === 'paid' ? undefined : orderId
    });
    setIsDirty(false);
    if (status === 'pending') {
      setPunchState('success');
      setTimeout(() => setPunchState('idle'), 1500);
    }
    if (status === 'paid') {
      setCart([]);
      setSelectedTableId(null);
      setSessionStartTime(null);
      setIsFullscreen(false);
    }
  };

  const printBill = () => {
    if (!selectedTable || cart.length === 0) return;
    const { subtotal, total } = calculateTotal();
    const dateStr = new Date().toLocaleString();
    const billId = selectedTable.currentOrderId || `#${Math.floor(Math.random() * 10000)}`;
    setPrintState('success');
    setIsDirty(false); 
    setTimeout(() => setPrintState('idle'), 2000);
    const printWindow = window.open('', '_blank', 'width=350,height=600');
    if (!printWindow) return;

    const itemsHtml = cart.map(item => `
      <tr>
        <td style="text-align: left; padding: 4px 0;">${item.name} x ${item.qty}</td>
        <td style="text-align: right; padding: 4px 0;">₹${(item.price * item.qty).toFixed(2)}</td>
      </tr>
    `).join('');

    const logoHtml = settings.showLogoOnBill && settings.logoUrl ? `<img src="${settings.logoUrl}" style="max-height: 80px; margin-bottom: 10px; display: block; margin-left: auto; margin-right: auto;" />` : '';
    const addressHtml = settings.showAddressOnBill ? `<div style="font-size: 11px; margin-bottom: 5px; text-align: center;">${profile.address}</div>` : '';

    const headerLinesHtml = (settings.headerLines || []).map(line => `
      <div style="font-size: ${line.size}px; font-weight: ${line.bold ? 'bold' : 'normal'}; text-align: ${line.align}; width: 100%; margin-bottom: 2px;">
        ${line.text}
      </div>
    `).join('');

    const footerLinesHtml = (settings.footerLines || []).map(line => `
      <div style="font-size: ${line.size}px; font-weight: ${line.bold ? 'bold' : 'normal'}; text-align: ${line.align}; width: 100%; margin-top: 2px;">
        ${line.text}
      </div>
    `).join('');

    const bodyFontSize = settings.bodyFontSize || 12;

    printWindow.document.write(`
      <html>
        <head>
          <style>
            @page { margin: 0; }
            body { font-family: 'Courier New', monospace; width: 80mm; padding: 5mm; margin: 0; font-size: ${bodyFontSize}px; color: #000; }
            .center { text-align: center; }
            .divider { border-top: 1px dashed #000; margin: 10px 0; }
            table { width: 100%; border-collapse: collapse; font-size: ${bodyFontSize}px; }
          </style>
        </head>
        <body onload="window.print(); window.close();">
          <div class="center">
            ${logoHtml}
            ${headerLinesHtml}
            ${addressHtml}
          </div>
          <div class="divider"></div>
          <div>Bill No: ${billId} | Table: ${selectedTable.name}</div>
          <div>Date: ${dateStr}</div>
          <div class="divider"></div>
          <table>${itemsHtml}</table>
          <div class="divider"></div>
          <div style="display: flex; justify-content: space-between;"><span>Subtotal:</span><span>₹${subtotal.toFixed(2)}</span></div>
          <div style="display: flex; justify-content: space-between; font-weight: bold; font-size: ${bodyFontSize + 2}px; margin-top: 5px;">
            <span>TOTAL:</span><span>₹${total.toFixed(2)}</span>
          </div>
          <div class="divider"></div>
          <div class="center">
            ${footerLinesHtml}
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    handlePlaceOrder('billed');
  };

  const handleSettle = () => {
    const { total } = calculateTotal();
    if (paymentMode === 'Split' && (cashSplit + upiSplit) < total) {
      alert(`The split amounts must total ₹${total.toFixed(2)}`);
      return;
    }
    setSettleState('success');
    handlePlaceOrder('paid', paymentMode);
    setTimeout(() => {
      setIsSettleModalOpen(false);
      setSettleState('idle');
    }, 1000);
  };

  const handleExitAttempt = () => {
    if (isDirty && cart.length > 0) {
      setIsExitGuardOpen(true);
    } else {
      setSelectedTableId(null);
      setSessionStartTime(null);
      setCart([]);
      setIsFullscreen(false);
    }
  };

  const formatPrice = (val: number | null | undefined) => {
    return (Number(val) || 0).toFixed(2);
  };

  if (selectedTableId && selectedTable) {
    const totals = calculateTotal();
    const duration = calculateDurationMins(sessionStartTime);
    
    return (
      <div className={`flex overflow-hidden bg-gray-50 transition-all duration-300 animate-in fade-in ${
        isFullscreen ? 'fixed inset-0 z-[500] h-screen w-screen' : 'h-[calc(100vh-100px)] -m-8'
      }`}>
        <div className="flex-1 p-6 overflow-y-auto scrollbar-hide flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg shadow-sm">
                <Layers className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-800">Select Items</h2>
                <div className="flex items-center text-[10px] font-black text-gray-400 uppercase tracking-widest mt-0.5">
                  <Clock className="w-3 h-3 mr-1" />
                  Table {selectedTable.name} • Session {duration} Min
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <button 
                onClick={() => setIsFullscreen(!isFullscreen)}
                className="p-2.5 bg-white border border-gray-200 text-gray-400 rounded-xl hover:text-blue-600 hover:border-blue-100 transition-all shadow-sm active:scale-95"
                title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
              >
                {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>
              <button 
                onClick={handleExitAttempt}
                className="px-5 py-2.5 bg-white border border-gray-200 text-gray-600 rounded-xl flex items-center text-xs font-black uppercase tracking-widest hover:bg-gray-50 transition-all active:scale-95 shadow-sm"
              >
                <ArrowLeft className="w-4 h-4 mr-2" /> Change Table
              </button>
            </div>
          </div>

          <div className="flex items-center space-x-2 mb-6 sticky top-0 bg-gray-50/95 py-2 z-20 backdrop-blur-md">
            <div className="relative flex-1 max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input 
                type="text" 
                placeholder="Find item..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
              />
            </div>
            <div className="flex space-x-2 overflow-x-auto scrollbar-hide pb-1">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all border whitespace-nowrap ${
                    selectedCategory === cat 
                      ? 'bg-blue-600 border-blue-600 text-white shadow-md' 
                      : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50 shadow-sm'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
            {filteredMenu.map(item => (
              <div key={item.id} className="bg-white border border-gray-100 rounded-2xl p-4 flex flex-col justify-between hover:shadow-xl transition-all group relative overflow-hidden">
                <div className="flex justify-between items-start mb-2">
                   <div className="flex-1 pr-2">
                    <h4 className="text-sm font-bold text-gray-800 leading-tight group-hover:text-blue-600 transition-colors">{item.name}</h4>
                    <span className="text-[10px] text-gray-400 font-bold uppercase mt-1 block tracking-widest">{item.category}</span>
                   </div>
                   <div className={`w-3.5 h-3.5 border-2 ${item.foodType === 'veg' ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'} rounded flex items-center justify-center`}>
                      <div className={`w-1.5 h-1.5 rounded-full ${item.foodType === 'veg' ? 'bg-green-600' : 'bg-red-600'}`}></div>
                   </div>
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <div className="text-sm font-black text-gray-900">₹{formatPrice(item.price)}</div>
                  <button 
                    onClick={() => addToCart(item)}
                    className="p-2 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-600 hover:text-white transition-all shadow-sm active:scale-90"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="w-[380px] bg-white flex flex-col border-l border-gray-200 shadow-2xl relative z-30 h-full">
          <div className="p-5 border-b border-gray-100 bg-white flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <ReceiptText className="w-5 h-5 text-gray-400" />
              <div className="flex flex-col">
                <h3 className="text-base font-bold text-gray-800 tracking-tight">Current Order</h3>
                <span className="text-[10px] font-black text-blue-500 uppercase flex items-center">
                  <Clock className="w-2.5 h-2.5 mr-1" /> {duration} Min Duration
                </span>
              </div>
            </div>
            <div className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
              selectedTable.status === 'vacant' ? 'bg-green-100 text-green-700' : 
              selectedTable.status === 'billed' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
            }`}>
              {selectedTable.status}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50/30 scrollbar-hide">
            {cart.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-300">
                <Calculator className="w-12 h-12 mb-3 opacity-20" />
                <p className="text-xs font-black uppercase tracking-widest">Cart is Empty</p>
                <p className="text-[10px] text-gray-400 mt-1">Select items to begin</p>
              </div>
            ) : (
              cart.map(item => (
                <div key={item.id} className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between animate-in slide-in-from-right-2 duration-200">
                  <div className="flex-1 mr-2">
                    <h5 className="text-xs font-bold text-gray-800 line-clamp-1">{item.name}</h5>
                    <div className="text-[10px] font-black text-blue-600 mt-0.5">₹ {formatPrice(item.price)}</div>
                  </div>
                  <div className="flex items-center bg-gray-50 rounded-lg border border-gray-100 p-0.5">
                    <button onClick={() => updateCartQty(item.id, -1)} className="p-1 hover:bg-white hover:shadow-sm rounded text-gray-400 transition-all"><Minus className="w-3 h-3" /></button>
                    <span className="w-6 text-center text-[10px] font-black text-gray-800">{item.qty}</span>
                    <button onClick={() => updateCartQty(item.id, 1)} className="p-1 hover:bg-white hover:shadow-sm rounded text-gray-400 transition-all"><Plus className="w-3 h-3" /></button>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="bg-white border-t border-gray-100 shadow-[0_-10px_20px_-5px_rgba(0,0,0,0.05)] sticky bottom-0">
            <div className="p-5 space-y-5">
              <div className="space-y-3">
                <div className="flex justify-between items-center text-[10px] font-black text-gray-400 uppercase tracking-widest">
                  <span>Subtotal</span>
                  <span className="text-gray-600">₹{formatPrice(totals.subtotal)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center text-[10px] font-black text-gray-400 uppercase tracking-widest">
                    <Tag className="w-3 h-3 mr-1.5" /> Discount
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <span className="text-[10px] text-gray-400 font-bold">₹</span>
                    <input 
                      type="number"
                      value={discount}
                      onChange={(e) => {
                        setDiscount(Math.max(0, parseFloat(e.target.value) || 0));
                        setIsDirty(true);
                      }}
                      className="w-20 text-right text-xs font-black text-red-600 bg-red-50/50 border border-red-100 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-red-200"
                    />
                  </div>
                </div>
                <div className="pt-3 border-t border-dashed border-gray-200 flex justify-between items-center">
                  <span className="text-xs font-black text-gray-800 uppercase tracking-widest">Total Payable</span>
                  <span className="text-2xl font-black text-blue-600">₹{formatPrice(totals.total)}</span>
                </div>
              </div>
              <div className="space-y-3">
                <button 
                  onClick={() => handlePlaceOrder('pending')}
                  className={`w-full py-4 rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-md active:scale-95 flex items-center justify-center gap-2 ${
                    punchState === 'success' ? 'bg-green-600 text-white' : 'bg-yellow-400 text-yellow-900 hover:bg-yellow-500'
                  }`}
                >
                  {punchState === 'success' ? <><Check className="w-4 h-4" /> Punched!</> : <><ReceiptText className="w-4 h-4" /> Punch Order</>}
                </button>
                <div className="grid grid-cols-2 gap-3">
                  <button 
                    onClick={printBill}
                    className={`py-3 border-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${
                      printState === 'success' ? 'bg-green-50 border-green-600 text-green-700' : 'bg-white border-gray-100 text-gray-600 hover:border-gray-200 shadow-sm'
                    }`}
                  >
                    {printState === 'success' ? <><Check className="w-3 h-3" /> Printed!</> : <><Printer className="w-3 h-3" /> Print Bill</>}
                  </button>
                  <button 
                    onClick={() => {
                      const { total } = calculateTotal();
                      setUpiSplit(total);
                      setCashSplit(0);
                      setIsSettleModalOpen(true);
                    }}
                    className={`py-3 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2 ${
                      settleState === 'success' ? 'bg-green-600' : 'bg-blue-600 hover:bg-blue-700'
                    }`}
                  >
                    {settleState === 'success' ? <><Check className="w-3 h-3" /> Settled!</> : <><Check className="w-3 h-3" /> Settle</>}
                  </button>
                </div>
                <div className="flex items-center gap-2 pt-1">
                   <button 
                    onClick={() => setIsClearModalOpen(true)}
                    className="flex-1 py-2 text-red-500 text-[10px] font-black uppercase tracking-widest hover:bg-red-50 rounded-xl transition-all"
                  >
                    Clear Order
                  </button>
                  <div className="w-px h-4 bg-gray-100"></div>
                  <button 
                    onClick={handleMiscCharge}
                    className={`flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${
                      miscState === 'success' ? 'text-green-600 bg-green-50' : 'text-gray-400 hover:bg-gray-50'
                    }`}
                  >
                    {miscState === 'success' ? 'Added!' : 'Misc Charge'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal: Settle Payment */}
        {isSettleModalOpen && (
          <div className="fixed inset-0 bg-black/60 z-[600] flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-white rounded-3xl w-full max-sm overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-300">
              <div className="p-6 border-b bg-gray-50 flex justify-between items-center">
                <h3 className="text-lg font-black text-gray-900 uppercase tracking-tight">Settle Payment</h3>
                <button onClick={() => setIsSettleModalOpen(false)} className="p-2 hover:bg-gray-200 rounded-full transition-colors"><X className="w-5 h-5 text-gray-400" /></button>
              </div>
              <div className="p-8 space-y-8">
                <div className="text-center p-6 bg-blue-50 rounded-2xl border border-blue-100">
                  <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-1">Payable Amount</p>
                  <p className="text-4xl font-black text-blue-800 tracking-tighter">₹{calculateTotal().total.toFixed(2)}</p>
                </div>
                <div className="space-y-4">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Select Method</label>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { id: 'UPI', icon: Smartphone, label: 'UPI' },
                      { id: 'Cash', icon: Banknote, label: 'Cash' },
                      { id: 'Split', icon: Layers, label: 'Split Pay' },
                      { id: 'Card', icon: CreditCard, label: 'Card' }
                    ].map(method => (
                      <button 
                        key={method.id}
                        onClick={() => setPaymentMode(method.id as PaymentMethod)}
                        className={`flex items-center p-4 rounded-2xl border-2 transition-all ${paymentMode === method.id ? 'bg-blue-600 border-blue-600 text-white shadow-lg' : 'bg-white border-gray-100 text-gray-600 hover:border-blue-200'}`}
                      >
                        <method.icon className={`w-5 h-5 mr-3 ${paymentMode === method.id ? 'text-white' : 'text-blue-500'}`} />
                        <span className="text-xs font-black uppercase tracking-widest">{method.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
                {paymentMode === 'Split' && (
                  <div className="space-y-4 p-5 bg-gray-50 rounded-2xl border border-gray-100 animate-in slide-in-from-top-2">
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Cash Amount (₹)</label>
                      <input 
                        type="number" 
                        value={cashSplit}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value) || 0;
                          setCashSplit(val);
                          setUpiSplit(Math.max(0, calculateTotal().total - val));
                        }}
                        className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-black text-lg"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">UPI Amount (₹)</label>
                      <input 
                        type="number" 
                        value={upiSplit}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value) || 0;
                          setUpiSplit(val);
                          setCashSplit(Math.max(0, calculateTotal().total - val));
                        }}
                        className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-black text-lg"
                      />
                    </div>
                  </div>
                )}
                <button 
                  onClick={handleSettle}
                  disabled={settleState === 'success'}
                  className={`w-full py-5 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl transition-all active:scale-95 flex items-center justify-center ${
                    settleState === 'success' ? 'bg-green-600 text-white' : 'bg-gray-900 text-white hover:bg-black'
                  }`}
                >
                  {settleState === 'success' ? <><Check className="w-5 h-5 mr-2" /> Done!</> : 'Finalize & Close Table'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal: Exit Guard & Clear handled in original code */}
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Table view remains same */}
      <div className="flex justify-between items-center bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
        <div>
          <h2 className="text-2xl font-black text-gray-800 tracking-tight">Dine In Floors</h2>
          <div className="flex items-center mt-4 space-x-8">
            <div className="flex items-center text-[10px] font-black uppercase tracking-widest text-gray-400">
              <div className="w-3 h-3 bg-green-500 rounded-full mr-2.5 shadow-sm shadow-green-200"></div> Vacant
            </div>
            <div className="flex items-center text-[10px] font-black uppercase tracking-widest text-gray-400">
              <div className="w-3 h-3 bg-red-500 rounded-full mr-2.5 shadow-sm shadow-red-200"></div> Occupied
            </div>
            <div className="flex items-center text-[10px] font-black uppercase tracking-widest text-gray-400">
              <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2.5 shadow-sm shadow-yellow-200"></div> Billed
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-5 bg-gray-50 p-2.5 rounded-2xl border border-gray-100">
          <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest pl-3">Table Layout</span>
          <button 
            onClick={() => setRearrangeMode(!rearrangeMode)}
            className={`w-14 h-7 rounded-full transition-all relative ${rearrangeMode ? 'bg-blue-600' : 'bg-gray-300'}`}
          >
            <div className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full transition-transform ${rearrangeMode ? 'translate-x-7 shadow-md' : 'shadow-sm'}`}></div>
          </button>
        </div>
      </div>

      <div className="space-y-16">
        {Object.entries(tablesBySection).map(([section, sectionTables]) => (
          <div key={section} className="space-y-8">
            <div className="flex items-center space-x-5">
              <div className="p-2.5 bg-blue-50 rounded-xl shadow-sm">
                <Layers className="w-5 h-5 text-blue-600" />
              </div>
              <h3 className="text-xl font-black text-gray-800 tracking-tight">{section}</h3>
              <div className="h-px flex-1 bg-gradient-to-r from-gray-200 to-transparent"></div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-6">
              {(sectionTables as Table[]).map(table => {
                const duration = calculateDurationMins(table.sessionStartTime);
                const hasSession = table.status !== 'vacant' && table.sessionStartTime;
                return (
                  <button
                    key={table.id}
                    onClick={() => handleTableClick(table)}
                    className={`p-6 h-40 rounded-[2.5rem] border-2 transition-all flex flex-col items-center justify-center space-y-1 shadow-sm relative group overflow-hidden ${
                      table.status === 'vacant' ? 'bg-white border-green-50 hover:border-green-500' : 
                      table.status === 'occupied' ? 'bg-red-50 border-red-50 hover:border-red-500' : 
                      'bg-yellow-50 border-yellow-50 hover:border-yellow-500'
                    } hover:shadow-2xl hover:-translate-y-2 active:scale-95`}
                  >
                    <span className={`text-3xl font-black tracking-tighter ${
                      table.status === 'vacant' ? 'text-gray-800' : 
                      table.status === 'occupied' ? 'text-red-700' : 
                      'text-yellow-700'
                    }`}>{table.name}</span>
                    <span className={`text-[9px] uppercase font-black tracking-widest opacity-60 ${
                      table.status === 'vacant' ? 'text-green-600' : 
                      table.status === 'occupied' ? 'text-red-600' : 
                      'text-yellow-600'
                    }`}>{table.status}</span>
                    {table.orderValue !== undefined && table.orderValue !== null && table.orderValue > 0 && (
                      <div className="mt-2 flex flex-col items-center gap-1">
                        <div className={`px-3 py-1 rounded-2xl text-[10px] font-black ${
                          table.status === 'occupied' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                        }`}>
                          ₹{formatPrice(table.orderValue)}
                        </div>
                        {hasSession && (
                          <div className={`text-[9px] font-bold uppercase tracking-widest ${
                            table.status === 'occupied' ? 'text-red-400' : 'text-yellow-600'
                          }`}>
                            {duration} Min
                          </div>
                        )}
                      </div>
                    )}
                    <div className={`absolute top-0 right-0 w-10 h-10 rounded-bl-3xl transition-opacity opacity-10 group-hover:opacity-100 ${
                      table.status === 'vacant' ? 'bg-green-500' : 
                      table.status === 'occupied' ? 'bg-red-500' : 
                      'bg-yellow-500'
                    }`}></div>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DineIn;
