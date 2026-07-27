import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, TrendingUp, DollarSign, ShoppingCart, Users, Download } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import axios from 'axios';
import toast from 'react-hot-toast';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

export default function AdminAnalyticsPage() {
  const [period, setPeriod] = useState('30d');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('avenues_token');
      const { data } = await axios.get(`/api/dashboard/analytics?period=${period}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setData(data);
    } catch {
      toast.error('Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [period]);

  const handleExport = () => {
    if (!data) return;
    const rows = [['Date', 'Revenue']];
    data.revenueTrend.forEach(d => rows.push([d.date, d.revenue]));
    data.productRevenue.forEach(d => rows.push([d.name, d.revenue]));
    const csv = rows.map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `analytics-${period}.csv`; a.click();
    URL.revokeObjectURL(url);
    toast.success('Exported!');
  };

  const metrics = data?.keyMetrics || {};

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-2xl font-bold text-white">Analytics</h2>
          <p className="text-sm text-white/60">Performance overview</p>
        </div>
        <div className="flex items-center gap-3">
          <select value={period} onChange={e => setPeriod(e.target.value)}
            className="h-10 rounded-lg text-sm text-white bg-[#111111] border border-white/10 px-3 focus:outline-none focus:border-accent/40">
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="365d">Last year</option>
          </select>
          <button onClick={handleExport} className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-accent border border-accent/30 hover:bg-accent/10 transition-all">
            <Download size={14} /> Export
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Revenue', value: `₹${(metrics.totalRevenue || 0).toLocaleString('en-IN')}`, icon: DollarSign },
          { label: 'Avg Order Value', value: `₹${(metrics.avgOrderValue || 0).toLocaleString('en-IN')}`, icon: TrendingUp },
          { label: 'Total Orders', value: (metrics.totalOrders || 0).toLocaleString(), icon: ShoppingCart },
          { label: 'Total Customers', value: (metrics.totalCustomers || 0).toLocaleString(), icon: Users },
        ].map((m, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            className="bg-[#111111] border border-white/5 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-white/40 uppercase tracking-wider">{m.label}</span>
              <div className="w-9 h-9 rounded-xl bg-accent/10 flex items-center justify-center"><m.icon size={16} className="text-accent" /></div>
            </div>
            <p className="text-2xl font-bold text-white">{loading ? '—' : m.value}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Revenue Trend */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="bg-[#111111] border border-white/5 rounded-2xl p-5">
          <h3 className="text-sm font-semibold text-white mb-4">Revenue Trend</h3>
          {loading ? (
            <div className="h-[250px] bg-white/[0.03] rounded-xl animate-pulse" />
          ) : !data?.revenueTrend?.length ? (
            <div className="flex items-center justify-center h-[250px] text-white/20 text-sm">No data for this period</div>
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={data.revenueTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="date" tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#111', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#fff' }} formatter={(v) => [`₹${v.toLocaleString('en-IN')}`, 'Revenue']} />
                <Line type="monotone" dataKey="revenue" stroke="#D4AF37" strokeWidth={2} dot={{ fill: '#D4AF37', r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </motion.div>

        {/* Revenue by Product */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
          className="bg-[#111111] border border-white/5 rounded-2xl p-5">
          <h3 className="text-sm font-semibold text-white mb-4">Revenue by Product</h3>
          {loading ? (
            <div className="h-[250px] bg-white/[0.03] rounded-xl animate-pulse" />
          ) : !data?.productRevenue?.length ? (
            <div className="flex items-center justify-center h-[250px] text-white/20 text-sm">No data for this period</div>
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={data.productRevenue} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis type="number" tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis dataKey="name" type="category" width={110} tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#111', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#fff' }} formatter={(v) => [`₹${v.toLocaleString('en-IN')}`, 'Revenue']} />
                <Bar dataKey="revenue" fill="#D4AF37" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </motion.div>
      </div>
    </div>
  );
}
