import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, Package, MapPin, CreditCard, ArrowRight, Clock, Truck, Home } from 'lucide-react';
import useAuthStore from '@/store/authStore';
import { formatCurrency } from '@/lib/utils';
import axios from 'axios';

const STATUS_STEPS = [
  { key: 'placed', label: 'Placed', icon: CheckCircle },
  { key: 'confirmed', label: 'Confirmed', icon: CheckCircle },
  { key: 'processing', label: 'Processing', icon: Package },
  { key: 'shipped', label: 'Shipped', icon: Truck },
  { key: 'out_for_delivery', label: 'Out for Delivery', icon: Truck },
  { key: 'delivered', label: 'Delivered', icon: Home },
];

export default function OrderConfirmationPage() {
  const { orderId } = useParams();
  const { user } = useAuthStore();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const token = localStorage.getItem('avenues_token');
        const { data } = await axios.get('/api/users/orders', { headers: { Authorization: `Bearer ${token}` } });
        const found = data.find((o) => o.orderNumber === orderId || o._id === orderId);
        setOrder(found || null);
      } catch { /* order not found */ }
      finally { setLoading(false); }
    };
    fetchOrder();
  }, [orderId]);

  if (loading) {
    return (
      <div className="pt-24 pb-16 min-h-screen bg-[#050505] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-accent/30 border-t-accent rounded-full animate-spin" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="pt-24 pb-16 min-h-screen bg-[#050505] flex flex-col items-center justify-center text-center px-4">
        <Package size={48} className="text-white/10 mb-4" />
        <h2 className="text-xl font-bold text-white mb-2">Order not found</h2>
        <p className="text-white/40 text-sm mb-6">This order doesn't exist or you don't have access.</p>
        <Link to="/shop" className="px-6 py-3 rounded-xl font-bold text-[#050505] text-sm" style={{ background: 'linear-gradient(135deg,#C8A827,#F5CC55,#C8A827)' }}>
          Continue Shopping
        </Link>
      </div>
    );
  }

  const currentIdx = STATUS_STEPS.findIndex((s) => s.key === order.status);

  return (
    <div className="pt-24 pb-16 min-h-screen bg-[#050505] text-white">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        {/* Success Header */}
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center mb-10">
          <div className="w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#C8A827,#F5CC55,#C8A827)' }}>
            <CheckCircle size={36} className="text-[#050505]" />
          </div>
          <h1 className="font-display text-3xl font-bold mb-2">Order Confirmed!</h1>
          <p className="text-white/40 text-sm">Thank you for shopping with Avenues Perfume</p>
          <div className="mt-3 inline-block px-4 py-2 rounded-lg bg-white/[0.03] border border-white/[0.06]">
            <span className="text-[10px] uppercase tracking-widest text-white/30">Order Number</span>
            <p className="text-accent font-bold text-sm mt-0.5">{order.orderNumber}</p>
            <span className="text-[10px] uppercase tracking-widest text-white/30 block mt-1">Placed On</span>
            <p className="text-white text-xs mt-0.5">{new Date(order.createdAt).toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
          </div>
        </motion.div>

        {/* Tracking Timeline */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-[#111111] border border-white/5 rounded-2xl p-6 mb-6">
          <h3 className="font-display text-sm font-semibold mb-5 text-white flex items-center gap-2">
            <Truck size={16} className="text-accent" /> Order Tracking
          </h3>
          <div className="flex items-center justify-between relative">
            {/* Progress line */}
            <div className="absolute top-3 left-0 right-0 h-0.5 bg-white/[0.06] z-0" />
            <div className="absolute top-3 left-0 h-0.5 bg-accent z-10 transition-all" style={{ width: `${Math.max(0, (currentIdx / (STATUS_STEPS.length - 1)) * 100)}%` }} />
            {STATUS_STEPS.map((step, idx) => {
              const isCompleted = idx <= currentIdx;
              const isCurrent = idx === currentIdx;
              return (
                <div key={step.key} className="flex flex-col items-center relative z-20">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold border-2 transition-all ${isCompleted ? 'bg-accent border-accent text-[#050505]' : 'bg-[#111111] border-white/10 text-white/20'} ${isCurrent ? 'ring-2 ring-accent/30' : ''}`}>
                    {isCompleted ? <CheckCircle size={12} /> : idx + 1}
                  </div>
                  <span className={`text-[9px] mt-1.5 text-center max-w-[60px] leading-tight ${isCompleted ? 'text-accent font-semibold' : 'text-white/20'}`}>{step.label}</span>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Order Details Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
          {/* Shipping Address */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="bg-[#111111] border border-white/5 rounded-2xl p-6">
            <h3 className="font-display text-sm font-semibold mb-3 text-white flex items-center gap-2">
              <MapPin size={16} className="text-accent" /> Shipping Address
            </h3>
            {order.shippingAddress ? (
              <div className="space-y-1 text-sm">
                <p className="text-white font-medium">{order.shippingAddress.fullName}</p>
                <p className="text-white/50">{order.shippingAddress.phone}</p>
                {order.shippingAddress.buildingName && <p className="text-white/40">🏢 {order.shippingAddress.buildingName}{order.shippingAddress.flatRoomNumber ? `, ${order.shippingAddress.flatRoomNumber}` : ''}</p>}
                <p className="text-white/40">{order.shippingAddress.street}{order.shippingAddress.area ? `, ${order.shippingAddress.area}` : ''}</p>
                <p className="text-white/40">{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}</p>
                {order.shippingAddress.landmark && <p className="text-white/30 text-xs">📍 {order.shippingAddress.landmark}</p>}
              </div>
            ) : (
              <p className="text-white/30 text-sm">Address not available</p>
            )}
          </motion.div>

          {/* Payment Info */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-[#111111] border border-white/5 rounded-2xl p-6">
            <h3 className="font-display text-sm font-semibold mb-3 text-white flex items-center gap-2">
              <CreditCard size={16} className="text-accent" /> Payment Details
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-white/40">Method</span><span className="text-white capitalize">{order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Razorpay'}</span></div>
              {order.paymentResult?.razorpayPaymentId && (
                <div className="flex justify-between"><span className="text-white/40">Payment ID</span><span className="text-white text-xs font-mono">{order.paymentResult.razorpayPaymentId}</span></div>
              )}
              <div className="flex justify-between"><span className="text-white/40">Status</span><span className="text-green-400 font-semibold text-xs">Paid</span></div>
            </div>
          </motion.div>
        </div>

        {/* Price Summary */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="bg-[#111111] border border-white/5 rounded-2xl p-6 mb-8">
          <h3 className="font-display text-sm font-semibold mb-4 text-white">Order Summary</h3>
          <div className="space-y-3 mb-4">
            {order.orderItems?.map((item, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="text-xl">🧴</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white truncate">{item.name}</p>
                  <p className="text-xs text-white/30">Qty: {item.quantity}</p>
                </div>
                <p className="text-sm font-semibold text-white flex-shrink-0">{formatCurrency(item.price * item.quantity)}</p>
              </div>
            ))}
          </div>
          <div className="border-t border-white/10 pt-3 space-y-1.5 text-sm">
            <div className="flex justify-between"><span className="text-white/40">Subtotal</span><span className="text-white">{formatCurrency(order.totalPrice - (order.taxPrice || 0) - (order.shippingPrice || 0))}</span></div>
            <div className="flex justify-between"><span className="text-white/40">Shipping</span><span className="text-white">{order.shippingPrice === 0 ? <span className="text-accent">FREE</span> : formatCurrency(order.shippingPrice)}</span></div>
            <div className="flex justify-between"><span className="text-white/40">Tax</span><span className="text-white">{formatCurrency(order.taxPrice)}</span></div>
            {order.discount > 0 && <div className="flex justify-between"><span className="text-white/40">Coupon {order.couponCode ? `(${order.couponCode})` : ''}</span><span className="text-green-400">-{formatCurrency(order.discount)}</span></div>}
            <div className="border-t border-white/10 pt-2 mt-2">
              <div className="flex justify-between text-lg font-bold"><span className="text-white">Total</span><span className="text-accent">{formatCurrency(order.totalPrice)}</span></div>
            </div>
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link to="/profile/orders" className="px-6 py-3 rounded-xl font-bold text-[#050505] text-sm text-center flex items-center justify-center gap-2" style={{ background: 'linear-gradient(135deg,#C8A827,#F5CC55,#C8A827)' }}>
            View All Orders <ArrowRight size={14} />
          </Link>
          <Link to="/shop" className="px-6 py-3 rounded-xl text-sm text-white/40 border border-white/[0.06] hover:bg-white/[0.03] text-center transition-all">
            Continue Shopping
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
