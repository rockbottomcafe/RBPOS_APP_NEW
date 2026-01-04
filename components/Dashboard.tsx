
import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RePieChart, Pie, Cell } from 'recharts';
import { Order } from '../types.ts';
import { Sparkles } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";

interface DashboardProps {
  orders: Order[];
}

const COLORS = ['#ef4444', '#fecaca', '#3b82f6', '#10b981'];

const Dashboard: React.FC<DashboardProps> = ({ orders = [] }) => {
  const [aiInsight, setAiInsight] = useState<string | null>(null);
  const [insightLoading, setInsightLoading] = useState(false);

  // Defensive check to ensure orders is an array and filter out any potential nulls
  const safeOrders = Array.isArray(orders) ? orders.filter(o => !!o) : [];
  
  const paidOrders = safeOrders.filter(o => o.status === 'paid');
  
  // Ensure totals are always numbers and never null/undefined
  const totalSales = paidOrders.reduce((sum, o) => sum + (Number(o.total) || 0), 0);
  const totalInvoices = paidOrders.length;
  const upiSales = paidOrders.filter(o => o.paymentMethod === 'UPI').reduce((sum, o) => sum + (Number(o.total) || 0), 0);
  const cashSales = paidOrders.filter(o => o.paymentMethod === 'Cash').reduce((sum, o) => sum + (Number(o.total) || 0), 0);
  const totalDiscount = paidOrders.reduce((sum, o) => sum + (Number(o.discount) || 0), 0);

  const itemCounts: Record<string, number> = {};
  paidOrders.forEach(o => {
    if (o.items && Array.isArray(o.items)) {
      o.items.forEach(i => {
        if (i && i.name) {
          itemCounts[i.name] = (itemCounts[i.name] || 0) + (Number(i.qty) || 0);
        }
      });
    }
  });

  const barData = Object.entries(itemCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, val]) => ({ name, val }));

  const pieData = [
    { name: 'Dine In', value: totalSales || 0 },
    { name: 'Takeaway', value: 0 },
  ];

  // Helper to safely format currency
  const formatCurrency = (val: number | null | undefined) => {
    return (val ?? 0).toFixed(2);
  };

  const generateInsights = async () => {
    setInsightLoading(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `You are a restaurant business analyst. Analyze these recent orders for Cafe Rock Bottom: ${JSON.stringify(paidOrders.slice(0, 15))}. Provide 3 short, high-impact business tips based on what people are ordering and how they are paying. Keep it professional and encouraging.`,
      });
      setAiInsight(response.text || "No insights available at the moment.");
    } catch (err) {
      console.error("AI Insight Error:", err);
      setAiInsight("Failed to generate insights. Please try again later.");
    } finally {
      setInsightLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Dashboard</h2>
        <button className="px-4 py-2 bg-white border border-gray-200 rounded-md text-sm font-medium hover:bg-gray-50">Filter</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          { label: 'Total Sales', value: `₹${formatCurrency(totalSales)}` },
          { label: 'Total Invoice', value: totalInvoices },
          { label: 'Dine In Sales', value: `₹${formatCurrency(totalSales)}` },
          { label: 'UPI Payment Sales', value: `₹${formatCurrency(upiSales)}` },
          { label: 'Cash Payment Sales', value: `₹${formatCurrency(cashSales)}` },
          { label: 'Card Payment Sales', value: '₹0.00' },
          { label: 'Active Table', value: '0', highlight: true },
          { label: 'Total Given Discount', value: `₹${formatCurrency(totalDiscount)}`, highlight: true },
          { label: 'Live Total No. of Orders', value: '0', highlight: true },
        ].map((card, idx) => (
          <div key={idx} className={`p-5 rounded-lg border border-gray-100 ${card.highlight ? 'bg-blue-600 text-white' : 'bg-white shadow-sm'}`}>
            <p className={`text-xs font-semibold uppercase mb-2 ${card.highlight ? 'text-blue-100' : 'text-gray-500'}`}>{card.label}</p>
            <p className="text-xl font-bold">{card.value}</p>
          </div>
        ))}

        {/* AI Business Insights Card */}
        <div className="bg-gradient-to-br from-indigo-600 to-blue-700 p-6 rounded-lg shadow-lg text-white col-span-1 md:col-span-2 lg:col-span-5 border border-indigo-400/30">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <h3 className="text-lg font-bold mb-2 flex items-center">
                <Sparkles className="w-5 h-5 mr-2 text-yellow-300" /> Cafe AI Intelligence
              </h3>
              {insightLoading ? (
                <p className="text-sm animate-pulse text-indigo-100">Consulting Gemini for sales insights...</p>
              ) : aiInsight ? (
                <div className="text-sm space-y-2 whitespace-pre-line leading-relaxed text-indigo-50 font-medium">
                  {aiInsight}
                </div>
              ) : (
                <p className="text-sm text-indigo-100">Harness the power of Gemini to analyze your sales data and get actionable tips.</p>
              )}
            </div>
            <button 
              onClick={generateInsights}
              disabled={insightLoading}
              className="ml-4 px-5 py-2.5 bg-white text-indigo-700 hover:bg-indigo-50 rounded-xl text-xs font-bold transition-all shadow-md disabled:opacity-50 active:scale-95 whitespace-nowrap"
            >
              {aiInsight ? 'Update Strategy' : 'Get AI Insights'}
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg border border-gray-100 shadow-sm">
          <h3 className="text-lg font-bold mb-6">Most Order Items</h3>
          <div className="h-64 w-full" style={{ minHeight: '256px' }}>
            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
              <BarChart data={barData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="name" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="val" fill="#ef4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-100 shadow-sm">
          <h3 className="text-lg font-bold mb-6">Order Type Sale Summary</h3>
          <div className="h-64 w-full flex items-center justify-center" style={{ minHeight: '256px' }}>
            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
              <RePieChart>
                <Pie 
                  data={pieData} 
                  cx="50%" 
                  cy="50%" 
                  innerRadius={60} 
                  outerRadius={80} 
                  paddingAngle={5} 
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
              </RePieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
