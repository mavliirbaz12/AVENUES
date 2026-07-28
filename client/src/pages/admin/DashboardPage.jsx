import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, ShoppingCart, Users, Package, DollarSign } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import axios from 'axios';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';

const STATUS_COLORS = {
  delivered: '#2D5016', shipped: '#3498DB', processing: '#D4AF37',
  confirmed: '#9B59B6', placed: '#C41E3A', cancelled: '#666666', out_for_delivery: '#E67E22',
};

export default function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [salesData, setSalesData] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [orderStatus, setOrderStatus] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [s, sp, tp, os, ro] = await Promise.all([
          axios.get('/api/dashboard/stats'),
          axios.get('/api/dashboard/sales-trend'),
          axios.get('/api/dashboard/top-products'),
          axios.get('/api/dashboard/order-status'),
          axios.get('/api/dashboard/recent-orders'),
        ]);
        setStats(s.data);
        setSalesData(sp.data);
        setTopProducts(tp.data);
        setOrderStatus(os.data);
        setRecentOrders(ro.data);
      } catch { /* empty */ }
      finally { setLoading(false); }
    };
    fetchAll();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <div key={i} className="h-28 bg-white/[0.03] rounded-2xl animate-pulse" />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="h-80 bg-white/[0.03] rounded-2xl animate-pulse" />
          <div className="h-80 bg-white/[0.03] rounded-2xl animate-pulse" />
        </div>
      </div>
    );
  }

  const STAT_CARDS = [
    { label: 'Revenue', value: stats?.revenue?.value || 0, change: stats?.revenue?.change || 0, up: stats?.revenue?.up, icon: DollarSign, prefix: '₹', format: true },
    { label: 'Orders', value: stats?.orders?.value || 0, change: stats?.orders?.change || 0, up: stats?.orders?.up, icon: ShoppingCart },
    { label: 'Customers', value: stats?.customers?.value || 0, change: stats?.customers?.change || 0, up: stats?.customers?.up, icon: Users },
    { label: 'Products', value: stats?.products?.value || 0, change: 0, up: false, icon: Package },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-display font-bold text-white">Dashboard</h2>
        <p className="text-sm text-white/40 mt-1">Here's what's happening.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {STAT_CARDS.map((s, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            className="p-5 rounded-2xl bg-white/[0.02] border border-white/[0.05] hover:border-white/[0.1] transition-all">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-white/40 uppercase tracking-wider">{s.label}</span>
              <div className="w-9 h-9 rounded-xl bg-accent/10 flex items-center justify-center"><s.icon size={16} className="text-accent" /></div>
            </div>
            <p className="text-2xl font-bold text-white">{s.prefix || ''}{s.format ? (s.value).toLocaleString('en-IN') : s.value.toLocaleString()}</p>
            {s.change !== 0 && (
              <div className={`flex items-center gap-1 mt-1.5 text-xs font-medium ${s.up ? 'text-green-400' : 'text-red-400'}`}>
                {s.up ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                {Math.abs(s.change)}% vs last month
              </div>
            )}
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Sales Trend */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="p-5 rounded-2xl bg-white/[0.02] border border-white/[0.05]">
          <h3 className="text-sm font-semibold text-white mb-4">Sales Trend</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={salesData}>
              <XAxis dataKey="name" tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ backgroundColor: '#111', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#fff' }} formatter={(v) => [`₹${v.toLocaleString('en-IN')}`, 'Revenue']} />
              <Line type="monotone" dataKey="sales" stroke="#D4AF37" strokeWidth={2} dot={{ fill: '#D4AF37', r: 4 }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Top Products */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
          className="p-5 rounded-2xl bg-white/[0.02] border border-white/[0.05]">
          <h3 className="text-sm font-semibold text-white mb-4">Top Products</h3>
          {topProducts.length === 0 ? (
            <div className="flex items-center justify-center h-[250px] text-white/20 text-sm">No sales data yet</div>
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={topProducts} layout="vertical">
                <XAxis type="number" tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis dataKey="name" type="category" width={100} tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#111', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#fff' }} />
                <Bar dataKey="sold" fill="#D4AF37" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Recent Orders */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="lg:col-span-2 p-5 rounded-2xl bg-white/[0.02] border border-white/[0.05]">
          <h3 className="text-sm font-semibold text-white mb-4">Recent Orders</h3>
          {recentOrders.length === 0 ? (
            <div className="flex items-center justify-center h-40 text-white/20 text-sm">No orders yet</div>
          ) : (
            <div className="space-y-2">
              {recentOrders.map((o, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] hover:bg-white/[0.04] transition-all">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full`} style={{ backgroundColor: STATUS_COLORS[o.status] || '#666' }} />
                    <div>
                      <p className="text-xs font-mono text-white/70">{o.id}</p>
                      <p className="text-2xs text-white/30">{o.customer}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-semibold text-white">₹{(o.total || 0).toLocaleString('en-IN')}</p>
                    <p className={`text-2xs font-semibold uppercase`}>{o.status}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Order Status */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
          className="p-5 rounded-2xl bg-white/[0.02] border border-white/[0.05]">
          <h3 className="text-sm font-semibold text-white mb-4">Order Status</h3>
          {orderStatus.every(s => s.count === 0) ? (
            <div className="flex items-center justify-center h-40 text-white/20 text-sm">No orders yet</div>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie data={orderStatus.filter(s => s.count > 0)} dataKey="count" nameKey="status" cx="50%" cy="50%" innerRadius={40} outerRadius={65} paddingAngle={3}>
                    {orderStatus.filter(s => s.count > 0).map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#111', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#fff' }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-1.5 mt-3">
                {orderStatus.filter(s => s.count > 0).map((s, i) => (
                  <div key={i} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: s.color }} />
                      <span className="text-white/50 capitalize">{s.status.replace('_', ' ')}</span>
                    </div>
                    <span className="text-white/70 font-semibold">{s.percentage}%</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </motion.div>
      </div>
    </div>
  );
}
