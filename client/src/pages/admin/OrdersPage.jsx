import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Eye, X, RefreshCw, Package, Clock, Truck, CheckCircle, XCircle, MapPin, CreditCard } from 'lucide-react';
import { cn } from '@/lib/utils';
import axios from 'axios';
import api from '@/lib/api';
import toast from 'react-hot-toast';

const STATUS_OPTIONS = ['placed', 'confirmed', 'processing', 'shipped', 'out_for_delivery', 'delivered', 'cancelled'];
const FILTER_OPTIONS = ['all', ...STATUS_OPTIONS];

const STATUS_CONFIG = {
  placed:         { icon: Clock,       color: 'text-red-400',     bg: 'bg-red-400/10',     border: 'border-red-400/20',     label: 'Placed' },
  confirmed:      { icon: CheckCircle, color: 'text-purple-400',  bg: 'bg-purple-400/10',  border: 'border-purple-400/20',  label: 'Confirmed' },
  processing:     { icon: Package,     color: 'text-blue-400',    bg: 'bg-blue-400/10',    border: 'border-blue-400/20',    label: 'Processing' },
  shipped:        { icon: Truck,       color: 'text-accent',      bg: 'bg-accent/10',      border: 'border-accent/20',      label: 'Shipped' },
  out_for_delivery: { icon: Truck,     color: 'text-orange-400',  bg: 'bg-orange-400/10',  border: 'border-orange-400/20',  label: 'Out for Delivery' },
  delivered:      { icon: CheckCircle, color: 'text-green-400',   bg: 'bg-green-400/10',   border: 'border-green-400/20',   label: 'Delivered' },
  cancelled:      { icon: XCircle,     color: 'text-red-400',     bg: 'bg-red-400/10',     border: 'border-red-400/20',     label: 'Cancelled' },
};

function OrderDetailModal({ order, onClose, onStatusChange }) {
  const cfg = STATUS_CONFIG[order.status] || STATUS_CONFIG.placed;
  const customer = order.user;
  const [status, setStatus] = useState(order.status);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (status === order.status) return;
    setSaving(true);
    try {
      await axios.put(`/api/orders/${order._id}/status`, { status });
      onStatusChange(order._id, status);
      toast.success('Order status updated!');
      onClose();
    } catch {
      toast.error('Failed to update status');
    } finally {
      setSaving(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={onClose}>
      <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95 }}
        onClick={e => e.stopPropagation()}
        className="bg-[#111111] border border-white/10 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">

        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div>
            <h3 className="font-display text-lg font-bold text-white">Order Details</h3>
            <p className="text-xs text-white/40 mt-0.5">#{order.orderNumber || order._id.slice(-8).toUpperCase()}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-lg text-white/40 hover:text-white transition-colors"><X size={18} /></button>
        </div>

        <div className="p-6 space-y-5">
          {/* Customer Info */}
          <div className="bg-[#0A0A0A] rounded-xl p-4 space-y-1.5">
            <p className="text-xs text-white/40 uppercase tracking-wider mb-2">Customer</p>
            <p className="font-semibold text-white">{customer?.firstName} {customer?.lastName}</p>
            <p className="text-sm text-white/60">{customer?.email}</p>
          </div>

          {/* Shipping Address */}
          {order.shippingAddress && (
            <div className="bg-[#0A0A0A] rounded-xl p-4">
              <p className="text-xs text-white/40 uppercase tracking-wider mb-2 flex items-center gap-1.5"><MapPin size={10} /> Shipping Address</p>
              <p className="text-sm text-white/70">{order.shippingAddress.fullName} • {order.shippingAddress.phone}</p>
              {order.shippingAddress.buildingName && <p className="text-xs text-white/40">🏢 {order.shippingAddress.buildingName}{order.shippingAddress.flatRoomNumber ? `, ${order.shippingAddress.flatRoomNumber}` : ''}</p>}
              <p className="text-xs text-white/40">{order.shippingAddress.street}{order.shippingAddress.area ? `, ${order.shippingAddress.area}` : ''}</p>
              <p className="text-xs text-white/40">{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}</p>
              {order.shippingAddress.landmark && <p className="text-2xs text-white/30 mt-0.5">📍 {order.shippingAddress.landmark}</p>}
            </div>
          )}

          {/* Items */}
          <div>
            <p className="text-xs text-white/40 uppercase tracking-wider mb-3">Items Ordered</p>
            <div className="space-y-2">
              {order.orderItems?.map((item, i) => (
                <div key={i} className="flex items-center justify-between bg-[#0A0A0A] rounded-lg px-4 py-3">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">🧴</span>
                    <div>
                      <p className="text-sm font-medium text-white">{item.name}</p>
                      <p className="text-xs text-white/40">Qty: {item.quantity}</p>
                    </div>
                  </div>
                  <p className="font-semibold text-accent">₹{(item.price * item.quantity).toLocaleString('en-IN')}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Price Summary */}
          <div className="bg-[#0A0A0A] rounded-xl p-4 space-y-1.5 text-sm">
            <div className="flex justify-between"><span className="text-white/40">Shipping</span><span className="text-white">{order.shippingPrice === 0 ? 'FREE' : `₹${order.shippingPrice}`}</span></div>
            <div className="flex justify-between"><span className="text-white/40">Tax</span><span className="text-white">₹{order.taxPrice || 0}</span></div>
            {order.discount > 0 && <div className="flex justify-between"><span className="text-white/40">Discount {order.couponCode ? `(${order.couponCode})` : ''}</span><span className="text-green-400">-₹{order.discount}</span></div>}
            <div className="flex justify-between border-t border-white/10 pt-2"><span className="text-white font-semibold">Total</span><span className="text-xl font-bold text-accent">₹{order.totalPrice?.toLocaleString('en-IN')}</span></div>
          </div>

          {/* Payment Info */}
          <div className="bg-[#0A0A0A] rounded-xl p-4">
            <p className="text-xs text-white/40 uppercase tracking-wider mb-2 flex items-center gap-1.5"><CreditCard size={10} /> Payment</p>
            <div className="flex items-center gap-3">
              <span className="text-xs text-white/60 capitalize">{order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Razorpay'}</span>
              {order.paymentResult?.razorpayPaymentId && <span className="text-2xs px-2 py-0.5 rounded-full bg-green-400/10 text-green-400">Paid ✓</span>}
            </div>
          </div>

          {/* Status Update */}
          <div>
            <p className="text-xs text-white/40 uppercase tracking-wider mb-3">Update Status</p>
            <div className="grid grid-cols-4 gap-2">
              {STATUS_OPTIONS.map(s => {
                const c = STATUS_CONFIG[s];
                return (
                  <button key={s} onClick={() => setStatus(s)}
                    className={cn('flex flex-col items-center gap-1.5 py-3 px-1 rounded-xl border text-2xs font-medium transition-all',
                      status === s ? `${c.bg} ${c.border} ${c.color}` : 'border-white/5 text-white/30 hover:border-white/20 hover:text-white/60'
                    )}>
                    <c.icon size={14} />
                    <span className="text-center leading-tight">{c.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <button disabled={saving || status === order.status} onClick={handleSave}
            className="w-full py-3 bg-accent text-[#050505] font-bold rounded-xl hover:bg-accent/90 transition-colors disabled:opacity-40">
            {saving ? 'Saving...' : 'Save Status'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState(null);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/api/orders');
      setOrders(data);
    } catch (err) {
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchOrders(); }, []);

  const filtered = orders.filter(o => {
    const name = o.user ? `${o.user.firstName} ${o.user.lastName}` : o.shippingAddress?.fullName || '';
    const orderId = o.orderNumber || o._id;
    const matchSearch = orderId.toLowerCase().includes(search.toLowerCase()) || name.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filter === 'all' || o.status === filter;
    return matchSearch && matchStatus;
  });

  const handleStatusChange = (id, newStatus) => {
    setOrders(orders.map(o => o._id === id ? { ...o, status: newStatus } : o));
  };

  const counts = STATUS_OPTIONS.reduce((acc, s) => ({
    ...acc,
    [s]: orders.filter(o => o.status === s).length,
  }), {});

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-2xl font-bold text-white">Orders</h2>
          <p className="text-sm text-white/60">{loading ? '...' : orders.length} total orders</p>
        </div>
        <button onClick={fetchOrders} className="p-2 hover:bg-white/5 rounded-lg text-white/60 hover:text-white transition-colors">
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      {/* Status Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        {STATUS_OPTIONS.map(s => {
          const cfg = STATUS_CONFIG[s];
          return (
            <button key={s} onClick={() => setFilter(filter === s ? 'all' : s)}
              className={cn('border rounded-xl p-3 text-left transition-all hover:scale-[1.02]',
                filter === s ? `${cfg.border} ${cfg.bg}` : 'border-white/5 bg-[#111111]'
              )}>
              <div className={cn('flex items-center gap-1.5 mb-1', cfg.color)}>
                <cfg.icon size={13} />
                <span className="text-2xs font-medium">{cfg.label}</span>
              </div>
              <p className={cn('text-xl font-bold', filter === s ? cfg.color : 'text-white')}>
                {loading ? '—' : counts[s] || 0}
              </p>
            </button>
          );
        })}
      </div>

      {/* Search + Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-md">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            className="w-full bg-[#111111] border border-white/10 rounded-lg pl-9 pr-4 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-accent/50"
            placeholder="Search by order ID or customer..." />
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-[#111111] border border-white/5 rounded-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-white/10 bg-[#0D0D0D]">
              <tr>
                <th className="text-left py-3.5 px-5 font-medium text-white/50">Order ID</th>
                <th className="text-left py-3.5 px-5 font-medium text-white/50">Customer</th>
                <th className="text-left py-3.5 px-5 font-medium text-white/50">Items</th>
                <th className="text-left py-3.5 px-5 font-medium text-white/50">Total</th>
                <th className="text-left py-3.5 px-5 font-medium text-white/50">Status</th>
                <th className="text-left py-3.5 px-5 font-medium text-white/50">View</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array(4).fill(0).map((_, i) => (
                  <tr key={i} className="border-b border-white/5">
                    <td colSpan={6} className="py-4 px-5">
                      <div className="h-5 bg-white/5 rounded-lg animate-pulse" />
                    </td>
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center text-white/30">
                    <Package size={40} className="mx-auto mb-3 opacity-20" />
                    <p>No orders found</p>
                  </td>
                </tr>
              ) : filtered.map(order => {
                const cfg = STATUS_CONFIG[order.status] || STATUS_CONFIG.placed;
                return (
                  <tr key={order._id} className="border-b border-white/5 hover:bg-white/[0.03] transition-colors">
                    <td className="py-3.5 px-5 font-mono text-accent text-xs">
                      #{order.orderNumber || order._id.slice(-8).toUpperCase()}
                    </td>
                    <td className="py-3.5 px-5">
                      <p className="font-medium text-white">{order.user?.firstName} {order.user?.lastName}</p>
                      <p className="text-xs text-white/40">{order.user?.email}</p>
                    </td>
                    <td className="py-3.5 px-5 text-white/60">
                      {order.orderItems?.length || 0} item{order.orderItems?.length !== 1 ? 's' : ''}
                    </td>
                    <td className="py-3.5 px-5 font-bold text-white">
                      ₹{(order.totalPrice || 0).toLocaleString('en-IN')}
                    </td>
                    <td className="py-3.5 px-5">
                      <span className={cn('flex items-center gap-1.5 w-fit px-2.5 py-1 rounded-full text-xs font-semibold border', cfg.bg, cfg.color, cfg.border)}>
                        <cfg.icon size={10} />
                        {cfg.label}
                      </span>
                    </td>
                    <td className="py-3.5 px-5">
                      <button onClick={() => setSelectedOrder(order)}
                        className="p-2 hover:bg-accent/10 rounded-lg text-white/40 hover:text-accent transition-colors">
                        <Eye size={15} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <AnimatePresence>
        {selectedOrder && (
          <OrderDetailModal
            order={selectedOrder}
            onClose={() => setSelectedOrder(null)}
            onStatusChange={handleStatusChange}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
