
import React, { useState, useMemo } from 'react';
import { Order, AppSettings, BusinessProfile } from '../types.ts';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  LineChart, Line, PieChart as RePieChart, Pie, Cell 
} from 'recharts';
import { 
  PieChart, TrendingUp, Download, Calendar, ArrowRight, 
  Wallet, Banknote, Tag, Receipt, ShoppingBag, ArrowUpRight,
  Filter, Search, Clock, Smartphone
} from 'lucide-react';

interface ReportsProps {
  orders: Order[];
  settings: AppSettings;
  profile: BusinessProfile;
}

const COLORS = ['#3b82f6', '#10b981', '#ef4444', '#f59e0b'];

const Reports: React.FC<ReportsProps> = ({ orders = [], settings, profile }) => {
  const [reportType, setReportType] = useState<'weekly' | 'monthly' | 'custom'>('weekly');
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 7);
    return d.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);

  // Handle predefined range selection
  const setRange = (type: 'weekly' | 'monthly') => {
    setReportType(type);
    const end = new Date();
    const start = new Date();
    if (type === 'weekly') {
      start.setDate(end.getDate() - 7);
    } else {
      start.setMonth(end.getMonth() - 1);
    }
    setStartDate(start.toISOString().split('T')[0]);
    setEndDate(end.toISOString().split('T')[0]);
  };

  const filteredOrders = useMemo(() => {
    const start = new Date(startDate).setHours(0, 0, 0, 0);
    const end = new Date(endDate).setHours(23, 59, 59, 999);
    
    return orders.filter(o => 
      o.status === 'paid' && 
      o.createdAt >= start && 
      o.createdAt <= end
    ).sort((a, b) => b.createdAt - a.createdAt);
  }, [orders, startDate, endDate]);

  const metrics = useMemo(() => {
    const totalRevenue = filteredOrders.reduce((sum, o) => sum + o.total, 0);
    const totalOrders = filteredOrders.length;
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    const totalDiscounts = filteredOrders.reduce((sum, o) => sum + (o.discount || 0), 0);
    const upiSales = filteredOrders.filter(o => o.paymentMethod === 'UPI').reduce((sum, o) => sum + o.total, 0);
    const cashSales = filteredOrders.filter(o => o.paymentMethod === 'Cash').reduce((sum, o) => sum + o.total, 0);
    
    return { totalRevenue, totalOrders, avgOrderValue, totalDiscounts, upiSales, cashSales };
  }, [filteredOrders]);

  const chartData = useMemo(() => {
    const dayMap: Record<string, number> = {};
    filteredOrders.forEach(o => {
      const date = new Date(o.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
      dayMap[date] = (dayMap[date] || 0) + o.total;
    });
    
    return Object.entries(dayMap).map(([date, amount]) => ({ date, amount })).reverse();
  }, [filteredOrders]);

  const pieData = [
    { name: 'UPI', value: metrics.upiSales },
    { name: 'Cash', value: metrics.cashSales },
    { name: 'Others', value: metrics.totalRevenue - (metrics.upiSales + metrics.cashSales) }
  ].filter(d => d.value > 0);

  const exportCSV = () => {
    const headers = ['Order ID', 'Table', 'Date', 'Items Count', 'Payment', 'Subtotal', 'Discount', 'Total'];
    const rows = filteredOrders.map(o => [
      o.id,
      o.tableName,
      new Date(o.createdAt).toLocaleString(),
      o.items.length,
      o.paymentMethod,
      o.subtotal,
      o.discount,
      o.total
    ]);
    
    const csvContent = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `RockBottom_Report_${startDate}_to_${endDate}.csv`;
    a.click();
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header & Controls */}
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <h2 className="text-2xl font-black text-gray-800 tracking-tight flex items-center">
            <PieChart className="w-6 h-6 mr-3 text-blue-600" />
            Sales Intelligence
          </h2>
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">
            Analyzing performance from {new Date(startDate).toLocaleDateString()} to {new Date(endDate).toLocaleDateString()}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <div className="flex bg-gray-50 p-1.5 rounded-2xl border border-gray-100">
            <button 
              onClick={() => setRange('weekly')}
              className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${reportType === 'weekly' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-400'}`}
            >
              Weekly
            </button>
            <button 
              onClick={() => setRange('monthly')}
              className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${reportType === 'monthly' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-400'}`}
            >
              Monthly
            </button>
            <button 
              onClick={() => setReportType('custom')}
              className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${reportType === 'custom' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-400'}`}
            >
              Custom
            </button>
          </div>

          <div className="flex items-center space-x-3 bg-white border border-gray-100 rounded-2xl p-1.5 shadow-sm">
            <div className="flex items-center space-x-2 px-3">
              <Calendar className="w-3.5 h-3.5 text-gray-400" />
              <input 
                type="date" 
                value={startDate}
                onChange={(e) => { setStartDate(e.target.value); setReportType('custom'); }}
                className="text-[10px] font-bold text-gray-600 outline-none"
              />
            </div>
            <ArrowRight className="w-3 h-3 text-gray-300" />
            <div className="flex items-center space-x-2 px-3">
              <input 
                type="date" 
                value={endDate}
                onChange={(e) => { setEndDate(e.target.value); setReportType('custom'); }}
                className="text-[10px] font-bold text-gray-600 outline-none"
              />
            </div>
          </div>

          <button 
            onClick={exportCSV}
            className="p-3 bg-blue-600 text-white rounded-2xl hover:bg-blue-700 transition-all shadow-lg active:scale-95"
            title="Export Report"
          >
            <Download className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Gross Revenue', value: `₹${metrics.totalRevenue.toFixed(2)}`, icon: Wallet, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Total Orders', value: metrics.totalOrders, icon: ShoppingBag, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Avg Order Value', value: `₹${metrics.avgOrderValue.toFixed(2)}`, icon: TrendingUp, color: 'text-indigo-600', bg: 'bg-indigo-50' },
          { label: 'Total Discounts', value: `₹${metrics.totalDiscounts.toFixed(2)}`, icon: Tag, color: 'text-red-600', bg: 'bg-red-50' },
        ].map((m, idx) => (
          <div key={idx} className="bg-white p-6 rounded-3xl shadow-sm border border-gray-50 flex items-center space-x-5 group hover:shadow-xl transition-all duration-300">
            <div className={`p-4 ${m.bg} ${m.color} rounded-2xl transition-transform group-hover:scale-110`}>
              <m.icon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{m.label}</p>
              <p className="text-xl font-black text-gray-900 tracking-tight">{m.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Sales Chart */}
        <div className="lg:col-span-2 bg-white p-8 rounded-3xl shadow-sm border border-gray-50">
          <div className="flex justify-between items-center mb-10">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-50 rounded-lg">
                <TrendingUp className="w-4 h-4 text-blue-600" />
              </div>
              <h3 className="text-sm font-black text-gray-800 uppercase tracking-widest">Revenue Growth</h3>
            </div>
            <div className="flex items-center text-[10px] font-black text-emerald-500 bg-emerald-50 px-3 py-1 rounded-full uppercase tracking-tighter">
              <ArrowUpRight className="w-3 h-3 mr-1" /> Trending Up
            </div>
          </div>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="date" 
                  fontSize={10} 
                  fontWeight={700} 
                  tickLine={false} 
                  axisLine={false} 
                  tick={{ fill: '#94a3b8' }}
                />
                <YAxis 
                  fontSize={10} 
                  fontWeight={700} 
                  tickLine={false} 
                  axisLine={false} 
                  tick={{ fill: '#94a3b8' }}
                />
                <Tooltip 
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', padding: '12px' }}
                />
                <Bar 
                  dataKey="amount" 
                  fill="#3b82f6" 
                  radius={[8, 8, 0, 0]} 
                  barSize={32}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Payment Methods */}
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-50 flex flex-col">
          <div className="flex items-center space-x-3 mb-10">
            <div className="p-2 bg-emerald-50 rounded-lg">
              <Wallet className="w-4 h-4 text-emerald-600" />
            </div>
            <h3 className="text-sm font-black text-gray-800 uppercase tracking-widest">Payment Split</h3>
          </div>
          <div className="flex-1 flex flex-col justify-center">
            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RePieChart>
                  <Pie 
                    data={pieData} 
                    innerRadius={60} 
                    outerRadius={80} 
                    paddingAngle={8} 
                    dataKey="value"
                  >
                    {pieData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} strokeWidth={0} />
                    ))}
                  </Pie>
                  <Tooltip />
                </RePieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-4 mt-8">
              {pieData.map((entry, index) => (
                <div key={entry.name} className="flex justify-between items-center px-4 py-3 bg-gray-50 rounded-2xl border border-gray-100">
                  <div className="flex items-center">
                    <div className="w-2.5 h-2.5 rounded-full mr-3" style={{ backgroundColor: COLORS[index] }}></div>
                    <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{entry.name}</span>
                  </div>
                  <span className="text-xs font-black text-gray-900">₹{entry.value.toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Audit List */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-8 border-b border-gray-50 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gray-100 rounded-lg">
              <Receipt className="w-4 h-4 text-gray-600" />
            </div>
            <h3 className="text-sm font-black text-gray-800 uppercase tracking-widest">Report Transactions</h3>
          </div>
          <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
            {filteredOrders.length} Completed Records
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50/50 text-[9px] font-black text-gray-400 uppercase tracking-widest">
              <tr>
                <th className="px-8 py-5">BILL NO</th>
                <th className="px-8 py-5">TABLE</th>
                <th className="px-8 py-5">DATE & TIME</th>
                <th className="px-8 py-5">METHOD</th>
                <th className="px-8 py-5">TOTAL</th>
                <th className="px-8 py-5 text-right">STATUS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-8 py-20 text-center opacity-20">
                    <Receipt className="w-12 h-12 mx-auto mb-4" />
                    <p className="text-xs font-black uppercase tracking-widest">No data available for selected range</p>
                  </td>
                </tr>
              ) : filteredOrders.map(order => (
                <tr key={order.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-8 py-5 font-black text-gray-900 text-xs">{order.id}</td>
                  <td className="px-8 py-5 font-bold text-gray-600 text-xs uppercase tracking-tight">{order.tableName}</td>
                  <td className="px-8 py-5">
                    <div className="flex items-center text-[10px] font-bold text-gray-500">
                      <Clock className="w-3 h-3 mr-1.5 opacity-40" />
                      {new Date(order.createdAt).toLocaleString()}
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex items-center">
                      {order.paymentMethod === 'Cash' ? <Banknote className="w-3 h-3 mr-2 text-emerald-500" /> : <Smartphone className="w-3 h-3 mr-2 text-blue-500" />}
                      <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest">{order.paymentMethod}</span>
                    </div>
                  </td>
                  <td className="px-8 py-5 font-black text-blue-600 text-xs">₹{order.total.toFixed(2)}</td>
                  <td className="px-8 py-5 text-right">
                    <span className="px-2.5 py-1 bg-green-50 text-green-700 rounded-full text-[9px] font-black uppercase tracking-widest border border-green-100">
                      COMPLETED
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Reports;
