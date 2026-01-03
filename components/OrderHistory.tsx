
import React, { useState, useMemo } from 'react';
import { Order, AppSettings, BusinessProfile } from '../types';
import { 
  History, 
  Search, 
  Printer, 
  ChevronRight, 
  Smartphone, 
  Banknote, 
  Layers, 
  Filter, 
  Calendar,
  X,
  CreditCard,
  ReceiptText,
  Clock
} from 'lucide-react';

interface OrderHistoryProps {
  orders: Order[];
  settings: AppSettings;
  profile: BusinessProfile;
}

const OrderHistory: React.FC<OrderHistoryProps> = ({ orders = [], settings, profile }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'paid' | 'billed' | 'pending'>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      const matchesSearch = 
        order.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
        order.tableName.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
  }, [orders, searchTerm, statusFilter]);

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getPaymentIcon = (method: string) => {
    switch (method) {
      case 'UPI': return <Smartphone className="w-3.5 h-3.5" />;
      case 'Cash': return <Banknote className="w-3.5 h-3.5" />;
      case 'Split': return <Layers className="w-3.5 h-3.5" />;
      case 'Card': return <CreditCard className="w-3.5 h-3.5" />;
      default: return null;
    }
  };

  const printBill = (order: Order) => {
    const dateStr = new Date(order.createdAt).toLocaleString();
    const printWindow = window.open('', '_blank', 'width=350,height=600');
    if (!printWindow) return;

    const itemsHtml = order.items.map(item => `
      <tr>
        <td style="text-align: left; padding: 4px 0;">${item.name} x ${item.qty}</td>
        <td style="text-align: right; padding: 4px 0;">₹${(item.price * item.qty).toFixed(2)}</td>
      </tr>
    `).join('');

    const logoHtml = settings.showLogoOnBill && settings.logoUrl ? `<img src="${settings.logoUrl}" style="max-height: 80px; margin-bottom: 10px;" />` : '';
    const addressHtml = settings.showAddressOnBill ? `<div style="font-size: 11px; margin-bottom: 5px;">${profile.address}</div>` : '';

    printWindow.document.write(`
      <html>
        <head>
          <style>
            @page { margin: 0; }
            body { 
              font-family: 'Courier New', Courier, monospace; 
              width: 80mm; 
              padding: 5mm; 
              margin: 0; 
              font-size: 12px; 
              color: #000;
            }
            .center { text-align: center; }
            .divider { border-top: 1px dashed #000; margin: 10px 0; }
            table { width: 100%; border-collapse: collapse; }
            .bold { font-weight: bold; }
            .footer { margin-top: 20px; font-size: 10px; }
          </style>
        </head>
        <body onload="window.print(); window.close();">
          <div class="center">
            ${logoHtml}
            <div style="font-size: 16px; font-weight: bold; margin-bottom: 5px;">${settings.invoiceHeader} (REPRINT)</div>
            ${addressHtml}
            <div style="font-size: 11px;">FSSAI: ${profile.fssai}</div>
            <div style="font-size: 11px;">Mob: ${profile.ownerNumber}</div>
          </div>
          <div class="divider"></div>
          <div style="margin-bottom: 5px;">Bill No: ${order.id}</div>
          <div style="margin-bottom: 5px;">Table : ${order.tableName}</div>
          <div style="margin-bottom: 5px;">Date  : ${dateStr}</div>
          <div class="divider"></div>
          <table>
            <thead>
              <tr style="border-bottom: 1px dashed #000;">
                <th style="text-align: left;">Item</th>
                <th style="text-align: right;">Amt</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>
          <div class="divider"></div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
            <span>Subtotal:</span>
            <span>₹${order.subtotal.toFixed(2)}</span>
          </div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
            <span>Discount:</span>
            <span>₹${order.discount.toFixed(2)}</span>
          </div>
          <div style="display: flex; justify-content: space-between; margin-top: 8px; font-size: 16px; font-weight: bold;">
            <span>TOTAL:</span>
            <span>₹${order.total.toFixed(2)}</span>
          </div>
          <div class="divider"></div>
          <div class="center footer">
            <div>Mode: ${order.paymentMethod}</div>
            <div>${settings.invoiceFooter}</div>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="flex h-[calc(100vh-160px)] -m-8 overflow-hidden bg-gray-50">
      {/* List Container */}
      <div className="flex-1 flex flex-col p-6 overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <History className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800">Order History</h2>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Archive & Audit Logs</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input 
                type="text" 
                placeholder="Bill # or Table..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full md:w-48 shadow-sm"
              />
            </div>
            <div className="flex bg-white p-1 rounded-xl border border-gray-100 shadow-sm">
              {['all', 'paid', 'billed'].map((s) => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s as any)}
                  className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase transition-all ${
                    statusFilter === s ? 'bg-blue-600 text-white shadow-md' : 'text-gray-400 hover:bg-gray-50'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex-1 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 text-[10px] font-black text-gray-400 uppercase tracking-widest sticky top-0 z-10">
                <tr>
                  <th className="px-6 py-4">ORDER ID</th>
                  <th className="px-6 py-4">TABLE</th>
                  <th className="px-6 py-4">DATE & TIME</th>
                  <th className="px-6 py-4">METHOD</th>
                  <th className="px-6 py-4">TOTAL</th>
                  <th className="px-6 py-4">STATUS</th>
                  <th className="px-6 py-4 text-right">ACTION</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-20 text-center">
                      <div className="flex flex-col items-center opacity-20">
                        <History className="w-12 h-12 mb-2" />
                        <p className="font-black text-sm uppercase tracking-widest">No matching orders found</p>
                      </div>
                    </td>
                  </tr>
                ) : filteredOrders.map(order => (
                  <tr 
                    key={order.id} 
                    onClick={() => setSelectedOrder(order)}
                    className={`hover:bg-blue-50/50 transition-all cursor-pointer group ${selectedOrder?.id === order.id ? 'bg-blue-50/80' : ''}`}
                  >
                    <td className="px-6 py-4">
                      <span className="font-black text-gray-900 text-sm">{order.id}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-bold text-gray-600">{order.tableName}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center text-xs font-semibold text-gray-500">
                        <Clock className="w-3.5 h-3.5 mr-1.5 opacity-40" />
                        {formatDate(order.createdAt)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <span className="p-1.5 bg-gray-100 rounded text-gray-500">
                          {getPaymentIcon(order.paymentMethod)}
                        </span>
                        <span className="text-xs font-bold text-gray-600">{order.paymentMethod}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-black text-blue-600">₹{order.total.toFixed(2)}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest ${
                        order.status === 'paid' ? 'bg-green-100 text-green-700' : 
                        order.status === 'billed' ? 'bg-yellow-100 text-yellow-700' : 
                        'bg-red-100 text-red-700'
                      }`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={(e) => { e.stopPropagation(); printBill(order); }}
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                      >
                        <Printer className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Side Details Panel */}
      {selectedOrder && (
        <div className="w-[400px] bg-white border-l border-gray-200 shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
          <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
            <div>
              <h3 className="text-lg font-black text-gray-800">Order Details</h3>
              <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">{selectedOrder.id}</p>
            </div>
            <button onClick={() => setSelectedOrder(null)} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-8">
            {/* Table & Status Info */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                <span className="text-[10px] font-bold text-gray-400 uppercase block mb-1">Table</span>
                <span className="text-sm font-black text-gray-800">{selectedOrder.tableName}</span>
              </div>
              <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                <span className="text-[10px] font-bold text-gray-400 uppercase block mb-1">Status</span>
                <span className={`text-[10px] font-black uppercase tracking-widest ${
                  selectedOrder.status === 'paid' ? 'text-green-600' : 'text-yellow-600'
                }`}>{selectedOrder.status}</span>
              </div>
            </div>

            {/* Items List */}
            <div className="space-y-3">
              <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Ordered Items</h4>
              <div className="space-y-2">
                {selectedOrder.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center py-2 border-b border-gray-50 last:border-0">
                    <div>
                      <p className="text-xs font-bold text-gray-800">{item.name}</p>
                      <p className="text-[10px] text-gray-400 font-bold">₹{item.price} x {item.qty}</p>
                    </div>
                    <p className="text-xs font-black text-gray-700">₹{(item.price * item.qty).toFixed(2)}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Payment Summary */}
            <div className="space-y-3 pt-4 border-t border-gray-100">
              <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Financial Summary</h4>
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-gray-400">Subtotal</span>
                  <span className="text-gray-800">₹{selectedOrder.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-gray-400">Discount</span>
                  <span className="text-red-500">- ₹{selectedOrder.discount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center pt-3 border-t border-dashed border-gray-200">
                  <span className="text-sm font-black text-gray-800 uppercase">Grand Total</span>
                  <span className="text-lg font-black text-blue-600">₹{selectedOrder.total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Split Info if applicable */}
            {selectedOrder.paymentMethod === 'Split' && (
              <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100 space-y-2">
                <h4 className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Split Breakdown</h4>
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-blue-600">Cash</span>
                  <span className="text-blue-800">₹{selectedOrder.cashAmount?.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-blue-600">UPI</span>
                  <span className="text-blue-800">₹{selectedOrder.upiAmount?.toFixed(2)}</span>
                </div>
              </div>
            )}
          </div>

          <div className="p-6 bg-white border-t border-gray-100">
            <button 
              onClick={() => printBill(selectedOrder)}
              className="w-full py-4 bg-gray-900 text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-black shadow-lg transition-all active:scale-95 flex items-center justify-center"
            >
              <Printer className="w-4 h-4 mr-2" />
              Reprint Invoice
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderHistory;
