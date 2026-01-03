
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RePieChart, Pie, Cell } from 'recharts';
import { Order } from '../types';

interface DashboardProps {
  orders: Order[];
}

const COLORS = ['#ef4444', '#fecaca', '#3b82f6', '#10b981'];

const Dashboard: React.FC<DashboardProps> = ({ orders }) => {
  const paidOrders = orders.filter(o => o.status === 'paid');
  const totalSales = paidOrders.reduce((sum, o) => sum + o.total, 0);
  const totalInvoices = paidOrders.length;
  const upiSales = paidOrders.filter(o => o.paymentMethod === 'UPI').reduce((sum, o) => sum + o.total, 0);
  const cashSales = paidOrders.filter(o => o.paymentMethod === 'Cash').reduce((sum, o) => sum + o.total, 0);
  const totalDiscount = paidOrders.reduce((sum, o) => sum + o.discount, 0);

  const itemCounts: Record<string, number> = {};
  paidOrders.forEach(o => o.items.forEach(i => {
    itemCounts[i.name] = (itemCounts[i.name] || 0) + i.qty;
  }));

  const barData = Object.entries(itemCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, val]) => ({ name, val }));

  const pieData = [
    { name: 'Dine In', value: totalSales },
    { name: 'Takeaway', value: 0 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Dashboard</h2>
        <button className="px-4 py-2 bg-white border border-gray-200 rounded-md text-sm font-medium hover:bg-gray-50">Filter</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          { label: 'Total Sales', value: `₹${totalSales.toFixed(2)}` },
          { label: 'Total Invoice', value: totalInvoices },
          { label: 'Dine In Sales', value: `₹${totalSales.toFixed(2)}` },
          { label: 'UPI Payment Sales', value: `₹${upiSales.toFixed(2)}` },
          { label: 'Cash Payment Sales', value: `₹${cashSales.toFixed(2)}` },
          { label: 'Card Payment Sales', value: '₹0.00' },
          { label: 'Active Table', value: '0', highlight: true },
          { label: 'Total Given Discount', value: `₹${totalDiscount.toFixed(2)}`, highlight: true },
          { label: 'Live Total No. of Orders', value: '0', highlight: true },
        ].map((card, idx) => (
          <div key={idx} className={`p-5 rounded-lg border border-gray-100 ${card.highlight ? 'bg-blue-600 text-white' : 'bg-white shadow-sm'}`}>
            <p className={`text-xs font-semibold uppercase mb-2 ${card.highlight ? 'text-blue-100' : 'text-gray-500'}`}>{card.label}</p>
            <p className="text-xl font-bold">{card.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg border border-gray-100 shadow-sm">
          <h3 className="text-lg font-bold mb-6">Most Order Items</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip />
                <Bar dataKey="val" fill="#ef4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-100 shadow-sm">
          <h3 className="text-lg font-bold mb-6">Order Type Sale Summary</h3>
          <div className="h-64 flex items-center">
            <ResponsiveContainer width="100%" height="100%">
              <RePieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </RePieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
