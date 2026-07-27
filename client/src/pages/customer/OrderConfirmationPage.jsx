import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { CheckCircle, Package, MapPin, CreditCard, Truck, Home, RotateCcw, Download } from 'lucide-react';
import useCartStore from '@/store/cartStore';
import { formatCurrency } from '@/lib/utils';
import axios from 'axios';
import toast from 'react-hot-toast';

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
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const handleReorder = () => {
    if (!order?.orderItems) return;
    const cart = useCartStore.getState();
    order.orderItems.forEach((item) => {
      cart.addItem({
        id: item.product?._id || item.product,
        name: item.product?.name || item.name,
        pricing: item.product?.pricing || { sellingPrice: item.price },
        images: item.product?.images?.[0] || item.image || '',
      }, item.quantity);
    });
    toast.success('Items added to cart');
    navigate('/cart');
  };

  const handleDownloadInvoice = async () => {
    if (!order?._id) return;
    try {
      const { data } = await axios.get(`/api/users/orders/${order._id}/invoice`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `invoice-${order.orderNumber || order._id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch {
      toast.error('Invoice download failed');
    }
  };

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const { data } = await axios.get('/api/users/orders');
        const found = data.find((o) => o.orderNumber === orderId || o._id === orderId);
        setOrder(found || null);
      } catch { /* order not found */ }
      finally { setLoading(false); }
    };
    fetchOrder();
  }, [orderId]);

  if (loading) {
    return (
      <>
        <Helmet>
          <title>Order Confirmed | Avenues Perfume</title>
          <meta name="description" content="Your order has been confirmed at Avenues Perfume. Thank you for your purchase." />
          <link rel="canonical" href="https://avenues.in/order-confirmation" />
          <meta property="og:title" content="Order Confirmed | Avenues Perfume" />
          <meta property="og:description" content="Your order has been confirmed. Thank you for your purchase." />
          <meta property="og:type" content="website" />
          <meta property="og:url" content="https://avenues.in/order-confirmation" />
          <meta property="og:image" content="https://avenues.in/og-order.png" />
          <meta name="twitter:card" content="summary_large_image" />
        </Helmet>
        <div className="pt-24 pb-16 min-h-screen bg-[#050505] flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-accent/30 border-t-accent rounded-full animate-spin" />
        </div>
      </>
    );
  }

  if (!order) {
    return (
      <>
        <Helmet>
          <title>Order Not Found | Avenues Perfume</title>
          <meta name="robots" content="noindex, nofollow" />
          <meta property="og:title" content="Order Not Found | Avenues Perfume" />
          <meta property="og:description" content="The order you are looking for does not exist." />
          <meta property="og:type" content="website" />
          <meta property="og:url" content="https://avenues.in/order-confirmation" />
        </Helmet>
        <div className="pt-24 pb-16 min-h-screen bg-[#050505] flex flex-col items-center justify-center text-center px-4">
          <Package size={48} className="text-white/10 mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Order not found</h2>
          <p className="text-white/40 text-sm mb-6">This order doesn't exist or you don't have access.</p>
          <Link to="/shop" className="px-6 py-3 rounded-xl font-bold text-[#050505] text-sm" style={{ background: 'linear-gradient(135deg,#C8A827,#F5CC55,#C8A827)' }}>
            Continue Shopping
          </Link>
        </div>
      </>
    );
  }

  const currentIdx = STATUS_STEPS.findIndex((s) => s.key === order.status);

  return (
    <div className="pt-24 pb-16 min-h-screen bg-[#050505] text-white">
      <Helmet>
        <title>Order {order.orderNumber || order._id} | Avenues Perfume</title>
        <meta name="description" content={`Track your order ${order.orderNumber || order._id} at Avenues Perfume.`} />
        <link rel="canonical" href={`https://avenues.in/order-confirmation/${order.orderNumber || order._id}`} />
        <meta name="robots" content="noindex, nofollow" />
        <meta property="og:title" content={`Order ${order.orderNumber || order._id} | Avenues Perfume`} />
        <meta property="og:description" content={`Track your order ${order.orderNumber || order._id}.`} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={`https://avenues.in/order-confirmation/${order.orderNumber || order._id}`} />
        <meta property="og:image" content="https://avenues.in/og-order.png" />
        <meta name="twitter:card" content="summary_large_image" />
      </Helmet>
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
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

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-[#111111] border border-white/5 rounded-2xl p-6 mb-6">
          <h3 className="font-display text-sm font-semibold mb-5 text-white flex items-center gap-2">
            <Truck size={16} className="text-accent" /> Order Tracking
          </h3>
          <div className="flex items-center justify-between relative">
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
          {order.trackingHistory?.length > 0 && (
            <div className="mt-4 space-y-2">
              {order.trackingHistory.map((entry, i) => (
                <div key={i} className="flex items-start gap-2 text-xs">
                  <div className="w-1.5 h-1.5 rounded-full bg-accent/60 mt-1.5 flex-shrink-0" />
                  <div>
                    <span className="text-white/70 capitalize">{entry.status?.replace('_', ' ')}</span>
                    {entry.note && <span className="text-white/40"> — {entry.note}</span>}
                    <span className="text-white/25 ml-2">{new Date(entry.timestamp || entry.createdAt).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
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

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="flex flex-col sm:flex-row gap-3 justify-center">
          <button onClick={handleReorder} className="px-6 py-3 rounded-xl font-bold text-[#050505] text-sm flex items-center justify-center gap-2" style={{ background: 'linear-gradient(135deg,#C8A827,#F5CC55,#C8A827)' }}>
            <RotateCcw size={14} /> Reorder
          </button>
          <button onClick={handleDownloadInvoice} className="px-6 py-3 rounded-xl text-sm text-white/40 border border-white/[0.06] hover:bg-white/[0.03] text-center transition-all flex items-center justify-center gap-2">
            <Download size={14} /> Download Invoice
          </button>
          <Link to="/shop" className="px-6 py-3 rounded-xl text-sm text-white/40 border border-white/[0.06] hover:bg-white/[0.03] text-center transition-all">
            Continue Shopping
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
