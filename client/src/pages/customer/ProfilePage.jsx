import { useState, useEffect, lazy, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import {
  User, ShoppingBag, MapPin, Heart, LogOut, Plus, Trash2, Edit3,
  X, Check, Package, Clock, Truck, CheckCircle, Building2, Home, MessageCircle, Camera, Lock, Search
} from 'lucide-react';
import useAuthStore from '@/store/authStore';
import useCartStore from '@/store/cartStore';
import useUIStore from '@/store/uiStore';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import axios from 'axios'; // keep for pincode (unauthenticated external call)
import { Helmet } from 'react-helmet-async';
import { INDIAN_STATES } from '@/lib/constants';

const MapPicker = lazy(() => import('@/components/features/MapPicker'));

const TABS = [
  { name: 'Profile', path: '/profile', icon: User },
  { name: 'Orders', path: '/profile/orders', icon: ShoppingBag },
  { name: 'Addresses', path: '/profile/addresses', icon: MapPin },
];

const STATUS_ICONS = { pending: Clock, processing: Package, shipped: Truck, delivered: CheckCircle };
const STATUS_COLORS = { pending: 'text-yellow-400', processing: 'text-blue-400', shipped: 'text-accent', delivered: 'text-green-400', cancelled: 'text-red-400' };

const EMPTY_ADDRESS = {
  label: 'Home', fullName: '', phone: '', alternativePhone: '',
  buildingName: '', flatRoomNumber: '', street: '', area: '', apartment: '',
  city: '', state: '', postalCode: '', country: 'India', landmark: '',
  location: null, isDefault: false, whatsappUpdates: true,
  deliveryPreferences: {
    preferredTime: 'anytime', morningDelivery: false, eveningDelivery: false,
    weekendAvailable: true, saturdayDelivery: true, sundayDelivery: false,
    bestTimeToCall: '', deliveryInstructions: '',
  },
};

function ProfileTab({ user, onSave }) {
  const [form, setForm] = useState({ firstName: user?.firstName || '', lastName: user?.lastName || '', email: user?.email || '', phone: user?.phone || '' });
  const [loading, setLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [avatarLoading, setAvatarLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.put('/api/users/profile', form);
      onSave(data);
      toast.success('Profile updated!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update');
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    if (resendCooldown > 0) return;
    try {
      await axios.post('/api/auth/resend-verification', { email: user?.email });
      toast.success('Verification email resent!');
      setResendCooldown(60);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to resend');
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    setPasswordLoading(true);
    try {
      await api.put('/api/users/change-password', { currentPassword: passwordData.currentPassword, newPassword: passwordData.newPassword });
      toast.success('Password updated!');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setShowPasswordForm(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update password');
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarLoading(true);
    try {
      const fd = new FormData();
      fd.append('avatar', file);
      const { data } = await api.post('/api/upload/avatar', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      onSave({ ...user, avatarUrl: data.url });
      toast.success('Avatar updated!');
    } catch {
      toast.error('Failed to upload avatar');
    } finally {
      setAvatarLoading(false);
    }
  };

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  return (
    <>
      <Helmet>
        <title>My Profile | Avenues Perfume</title>
        <meta name="description" content="Manage your Avenues Perfume account, orders, and preferences." />
        <link rel="canonical" href="https://avenues.in/profile" />
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
        <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.05]">
          <div className="flex items-center gap-4 mb-5">
            <div className="relative">
              <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center border border-accent/15 overflow-hidden">
                {user?.avatarUrl ? (
                  <img src={user.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-accent font-bold text-lg">{user?.firstName?.[0] || 'U'}</span>
                )}
              </div>
              <label htmlFor="avatar-upload" className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-accent text-[#050505] flex items-center justify-center cursor-pointer border-2 border-[#050505]">
                {avatarLoading ? <span className="w-3 h-3 border border-[#050505]/30 border-t-[#050505] rounded-full animate-spin" /> : <Camera size={12} />}
              </label>
              <input id="avatar-upload" type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
            </div>
            <div>
              <h3 className="font-display text-lg font-bold text-white">{user?.firstName} {user?.lastName}</h3>
              <p className="text-white/25 text-xs">{user?.email}</p>
            </div>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { label: 'First Name', key: 'firstName', placeholder: 'Arjun' },
                { label: 'Last Name', key: 'lastName', placeholder: 'Mehta' },
                { label: 'Email', key: 'email', placeholder: 'you@example.com', readonly: true },
                { label: 'Phone', key: 'phone', placeholder: '+91 98765 43210' },
              ].map(({ label, key, placeholder, readonly }) => (
                <div key={key}>
                  <label className="block text-2xs font-semibold uppercase tracking-widest text-white/25 mb-1.5">{label}</label>
                  <input
                    value={form[key]}
                    onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                    readOnly={readonly}
                    className={`w-full h-11 rounded-xl text-sm text-white placeholder-white/15 bg-white/[0.03] border border-white/[0.06] focus:border-accent/40 focus:outline-none transition-all px-4 ${readonly ? 'cursor-not-allowed opacity-60 select-none' : ''}`}
                    placeholder={placeholder}
                  />
                  {key === 'email' && readonly && (
                    <p className="text-2xs text-white/25 mt-1">Your email is tied to your account and cannot be changed. Contact support if needed.</p>
                  )}
                  {key === 'email' && (
                    <div className="flex items-center gap-2 mt-1.5">
                      {user?.isEmailVerified ? (
                        <span className="text-2xs text-green-400 flex items-center gap-1">
                          <Check size={10} /> Verified
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={handleResendVerification}
                          disabled={resendCooldown > 0}
                          className="text-2xs text-yellow-400 hover:text-yellow-300 flex items-center gap-1 disabled:opacity-40 transition-colors"
                        >
                          ⚠ Not verified — {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend email'}
                        </button>
                      )}
                      <span className="text-2xs text-white/20 ml-2">Email is tied to your account identity and cannot be changed.</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
            <button
              type="submit"
              disabled={loading}
              className="h-10 px-6 rounded-xl font-bold text-[#050505] text-sm disabled:opacity-40"
              style={{ background: 'linear-gradient(135deg,#C8A827,#F5CC55,#C8A827)' }}
            >
              {loading ? 'Saving…' : 'Save Changes'}
            </button>
          </form>
        </div>

        <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.05]">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display text-lg font-bold text-white flex items-center gap-2">
              <Lock size={16} className="text-accent" /> Change Password
            </h3>
            {!showPasswordForm && (
              <button onClick={() => setShowPasswordForm(true)} className="text-xs text-accent hover:text-accent/80 font-semibold transition-colors">
                Change Password
              </button>
            )}
          </div>
          {showPasswordForm && (
            <form onSubmit={handleChangePassword} className="space-y-3">
              <div>
                <label className="block text-2xs uppercase tracking-widest text-white/25 mb-1">Current Password</label>
                <input type="password" value={passwordData.currentPassword} onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })} className="w-full h-10 rounded-lg text-sm text-white bg-white/[0.03] border border-white/[0.06] px-3 focus:outline-none focus:border-accent/40" required />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-2xs uppercase tracking-widest text-white/25 mb-1">New Password</label>
                  <input type="password" value={passwordData.newPassword} onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })} className="w-full h-10 rounded-lg text-sm text-white bg-white/[0.03] border border-white/[0.06] px-3 focus:outline-none focus:border-accent/40" required minLength={8} />
                </div>
                <div>
                  <label className="block text-2xs uppercase tracking-widest text-white/25 mb-1">Confirm New Password</label>
                  <input type="password" value={passwordData.confirmPassword} onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })} className="w-full h-10 rounded-lg text-sm text-white bg-white/[0.03] border border-white/[0.06] px-3 focus:outline-none focus:border-accent/40" required />
                </div>
              </div>
              <div className="flex gap-2">
                <button type="button" onClick={() => setShowPasswordForm(false)} className="h-10 px-4 rounded-lg text-sm text-white/40 border border-white/[0.06] hover:bg-white/[0.03] transition-all">Cancel</button>
                <button type="submit" disabled={passwordLoading} className="flex-1 h-10 rounded-xl font-bold text-[#050505] text-sm disabled:opacity-40" style={{ background: 'linear-gradient(135deg,#C8A827,#F5CC55,#C8A827)' }}>
                  {passwordLoading ? 'Updating…' : 'Update Password'}
                </button>
              </div>
            </form>
          )}
        </div>
</motion.div>

        <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.05]">
          <h3 className="font-display text-lg font-bold text-white flex items-center gap-2 mb-4">
            <MessageCircle size={16} className="text-accent" /> Notification Preferences
          </h3>
          <div className="space-y-3">
            {[
              { key: 'whatsappUpdates', label: 'WhatsApp delivery updates', desc: 'Get real-time updates on WhatsApp' },
              { key: 'emailNotifications', label: 'Email notifications', desc: 'Order updates and promotions' },
              { key: 'smsNotifications', label: 'SMS notifications', desc: 'Delivery alerts and offers' },
            ].map(({ key, label, desc }) => (
              <label key={key} className="flex items-center justify-between cursor-pointer">
                <div>
                  <p className="text-sm text-white">{label}</p>
                  <p className="text-2xs text-white/30">{desc}</p>
                </div>
                <div className="w-10 h-6 rounded-full bg-white/10 relative transition-colors" style={{ backgroundColor: user?.[key] !== false ? '#D4AF37' : 'rgba(255,255,255,0.1)' }}>
                  <div className="w-4 h-4 rounded-full bg-white absolute top-1 transition-transform" style={{ left: user?.[key] !== false ? '1.5rem' : '0.25rem' }} />
                </div>
              </label>
            ))}
          </div>
        </div>
      </motion.div>
    </>
  );
}

function ReorderButton({ items }) {
  const addItem = useCartStore((s) => s.addItem);
  const openCart = useCartStore((s) => s.openCart);
  const addToast = useUIStore((s) => s.addToast);

  const handleReorder = async () => {
    if (!items?.length) return;
    try {
      const productIds = items.map((i) => i.product);
      const { data: allProducts } = await axios.get('/api/products');
      let added = 0;
      items.forEach((item) => {
        const product = allProducts.find((p) => p._id === item.product || p.id === item.product);
        if (product) { addItem(product, item.quantity || 1); added++; }
      });
      if (added > 0) {
        openCart();
        addToast({ type: 'success', message: `${added} item(s) added to cart!` });
      } else {
        addToast({ type: 'info', message: 'Some items may no longer be available.' });
      }
    } catch {
      toast.error('Could not reorder. Please try again.');
    }
  };

  return (
    <button
      onClick={handleReorder}
      className="text-2xs font-bold px-3 py-1.5 rounded-full bg-accent/10 border border-accent/25 text-accent hover:bg-accent hover:text-[#050505] transition-all duration-200 flex items-center gap-1.5"
    >
      <ShoppingBag size={10} /> Reorder
    </button>
  );
}

function OrdersTab() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const { data } = await api.get('/api/users/orders');
        setOrders(data);
      } catch { /* no orders yet */ }
      finally { setLoading(false); }
    };
    fetchOrders();
  }, []);

  const filtered = orders.filter((o) => {
    const matchSearch = (o.orderNumber || '').toLowerCase().includes(search.toLowerCase()) || (o._id || '').toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || o.status === statusFilter;
    return matchSearch && matchStatus;
  });

  if (loading) return <div className="space-y-3">{[...Array(3)].map((_, i) => <div key={i} className="h-20 bg-white/[0.03] rounded-xl animate-pulse" />)}</div>;
  if (orders.length === 0) return (
    <div className="text-center py-16">
      <Package size={40} className="text-accent/30 mx-auto mb-3" />
      <p className="text-white/50 text-sm mb-1">Your scent journey begins here</p>
      <p className="text-white/25 text-xs mb-4">No orders yet — explore our fragrances and find your signature scent.</p>
      <Link to="/shop" className="text-accent text-sm font-semibold hover:underline">Start shopping →</Link>
    </div>
  );

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/20 pointer-events-none" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-10 rounded-lg text-sm text-white bg-white/[0.03] border border-white/[0.06] pl-9 pr-3 focus:outline-none focus:border-accent/40"
            placeholder="Search order # or ID"
          />
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {['all', 'pending', 'processing', 'shipped', 'delivered', 'cancelled'].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`text-2xs font-semibold capitalize px-3 py-1.5 rounded-full border transition-all ${statusFilter === s ? 'bg-accent text-[#050505] border-accent' : 'text-white/40 border-white/[0.06] hover:border-white/20 hover:text-white/60'}`}
            >
              {s === 'all' ? 'All' : s.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-10">
          <Search size={32} className="text-white/10 mx-auto mb-2" />
          <p className="text-white/30 text-sm">No orders match your search</p>
        </div>
      )}

      {filtered.map((order) => {
        const StatusIcon = STATUS_ICONS[order.status] || Clock;
        const orderDate = new Date(order.createdAt).toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
        const timeline = order.timeline || [];
        return (
          <div key={order._id} className="rounded-xl bg-white/[0.02] border border-white/[0.05] hover:border-white/[0.1] transition-all overflow-hidden">
            <div className="p-4 flex items-center justify-between hover:bg-white/[0.02] transition-all">
              <div className="flex items-center gap-3">
                <StatusIcon size={16} className={STATUS_COLORS[order.status]} />
                <div>
                  <p className="text-sm font-semibold text-white">{order.orderNumber || `#${order._id.slice(-6).toUpperCase()}`}</p>
                  <p className="text-2xs text-white/25">{orderDate} • {order.orderItems?.length || 0} item(s)</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className={`text-2xs font-semibold uppercase px-2 py-0.5 rounded-full ${order.status === 'delivered' ? 'bg-green-400/10 text-green-400' : order.status === 'cancelled' ? 'bg-red-400/10 text-red-400' : 'bg-accent/10 text-accent'}`}>
                  {order.status}
                </span>
                <span className="text-sm font-bold text-white">₹{(order.totalPrice || 0).toLocaleString('en-IN')}</span>
              </div>
            </div>

            {/* Inline tracking bar — always visible */}
            <div className="px-4 pb-3 pt-1 border-t border-white/[0.05]">
              <div className="flex items-center gap-1 overflow-x-auto pb-1">
                {['placed','confirmed','processing','shipped','out_for_delivery','delivered'].map((s, i) => {
                  const done = ['placed','confirmed','processing','shipped','out_for_delivery','delivered'].indexOf(order.status) >= i;
                  const Icon = STATUS_ICONS[s] || Clock;
                  return (
                    <div key={s} className="flex items-center gap-1 flex-shrink-0">
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-bold ${done ? 'bg-accent text-[#050505]' : 'bg-white/[0.03] text-white/20 border border-white/[0.06]'}`}>
                        <Icon size={10} />
                      </div>
                      <span className={`text-2xs capitalize ${done ? 'text-accent' : 'text-white/20'}`}>{s.replace('_', ' ')}</span>
                      {i < 5 && <div className={`w-6 h-px mx-0.5 ${done ? 'bg-accent' : 'bg-white/[0.06]'}`} />}
                    </div>
                  );
                })}
              </div>

              {/* Timeline timestamps */}
              {timeline.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {timeline.map((t, i) => (
                    <span key={i} className="text-2xs text-white/30 bg-white/[0.03] px-2 py-0.5 rounded-full">
                      {t.status.replace('_', ' ')} — {new Date(t.timestamp).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Order details — always visible inline */}
            <div className="px-4 pb-4 pt-1 border-t border-white/[0.05] space-y-4">
              <div className="space-y-2">
                {order.orderItems?.map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <span className="text-lg">🧴</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-white truncate">{item.name}</p>
                      <p className="text-2xs text-white/25">Qty: {item.quantity} × ₹{item.price?.toLocaleString('en-IN')}</p>
                    </div>
                    <p className="text-xs font-semibold text-white flex-shrink-0">₹{(item.price * item.quantity).toLocaleString('en-IN')}</p>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-3 text-2xs">
                <div className="space-y-1.5">
                  <p className="text-white/25 uppercase tracking-widest font-semibold">Shipping</p>
                  <p className="text-white text-xs">{order.shippingAddress?.street || '—'}, {order.shippingAddress?.city || ''}</p>
                  <p className="text-white/40">{order.shippingAddress?.fullName} • {order.shippingAddress?.phone}</p>
                </div>
                <div className="space-y-1.5">
                  <p className="text-white/25 uppercase tracking-widest font-semibold">Summary</p>
                  <div className="flex justify-between"><span className="text-white/40">Subtotal</span><span className="text-white text-xs">₹{((order.totalPrice || 0) - (order.taxPrice || 0) - (order.shippingPrice || 0)).toLocaleString('en-IN')}</span></div>
                  <div className="flex justify-between"><span className="text-white/40">Shipping</span><span className="text-white text-xs">{order.shippingPrice === 0 ? 'FREE' : `₹${order.shippingPrice}`}</span></div>
                  <div className="flex justify-between"><span className="text-white/40">Tax</span><span className="text-white text-xs">₹{order.taxPrice || 0}</span></div>
                  {order.discount > 0 && <div className="flex justify-between"><span className="text-white/40">Coupon {order.couponCode ? `(${order.couponCode})` : ''}</span><span className="text-green-400 text-xs">-₹{order.discount}</span></div>}
                  <div className="flex justify-between border-t border-white/[0.05] pt-1"><span className="text-white font-semibold">Total</span><span className="text-accent font-bold text-xs">₹{(order.totalPrice || 0).toLocaleString('en-IN')}</span></div>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1 flex-wrap justify-between">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-2xs px-2 py-0.5 rounded-full bg-white/[0.03] border border-white/[0.06] text-white/40 capitalize">{order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Razorpay'}</span>
                  {order.paymentResult?.razorpayPaymentId && <span className="text-2xs px-2 py-0.5 rounded-full bg-white/[0.03] border border-white/[0.06] text-white/25 font-mono">Paid ✓</span>}
                  <a href={`/api/users/orders/${order._id}/invoice`} target="_blank" rel="noopener noreferrer" className="text-2xs px-2 py-0.5 rounded-full bg-white/[0.03] border border-white/[0.06] text-white/40 hover:text-accent transition-colors">Download Invoice</a>
                </div>
                {order.status === 'delivered' && (
                  <ReorderButton items={order.orderItems} />
                )}
              </div>
            </div>
          </div>
        );
      })}
    </motion.div>
  );
}

function AddressesTab({ user, onUpdate }) {
  const [editing, setEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ ...EMPTY_ADDRESS });
  const [loading, setLoading] = useState(false);
  const addresses = user?.addresses || [];

  const lookupPincode = async (pin) => {
    if (pin.length !== 6) return;
    try {
      const { data } = await axios.get(`https://api.postalpincode.in/pincode/${pin}`, { timeout: 3000 });
      if (data[0]?.Status === 'Success' && data[0]?.PostOffice?.length > 0) {
        const po = data[0].PostOffice[0];
        setForm((prev) => ({ ...prev, city: po.District, state: po.State }));
        toast.success(`${po.District}, ${po.State}`);
      }
    } catch { /* pincode lookup unavailable */ }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.fullName || !form.phone || !form.street || !form.city || !form.state || !form.postalCode) {
      toast.error('Please fill required fields');
      return;
    }
    setLoading(true);
    try {
      let data;
      if (editing) {
        const res = await api.put(`/api/users/addresses/${editing}`, form);
        data = res.data;
      } else {
        const res = await api.post('/api/users/addresses', form);
        data = res.data;
      }
      onUpdate({ ...user, addresses: data });
      setShowForm(false);
      setEditing(null);
      setForm({ ...EMPTY_ADDRESS });
      toast.success(editing ? 'Address updated!' : 'Address added!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save');
    } finally { setLoading(false); }
  };

  const handleDelete = async (id) => {
    try {
      const { data } = await api.delete(`/api/users/addresses/${id}`);
      onUpdate({ ...user, addresses: data });
      toast.success('Address removed');
    } catch { toast.error('Failed to delete'); }
  };

  const startEdit = (addr) => {
    setForm({ ...addr, deliveryPreferences: { ...EMPTY_ADDRESS.deliveryPreferences, ...addr.deliveryPreferences } });
    setEditing(addr._id);
    setShowForm(true);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
      {!showForm && (
        <>
          {addresses.length === 0 ? (
            <div className="text-center py-12">
              <MapPin size={36} className="text-white/10 mx-auto mb-3" />
              <p className="text-white/30 text-sm">No saved addresses</p>
            </div>
          ) : (
            <div className="grid gap-3">
              {addresses.map((addr) => (
                <div key={addr._id} className={`p-4 rounded-xl border transition-all ${addr.isDefault ? 'bg-accent/5 border-accent/20' : 'bg-white/[0.02] border-white/[0.05]'}`}>
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        {addr.label === 'Home' ? <Home size={12} className="text-white/40" /> : <Building2 size={12} className="text-white/40" />}
                        <span className="text-xs font-semibold text-white">{addr.label}</span>
                        {addr.isDefault && <span className="text-2xs bg-accent/15 text-accent px-1.5 py-0.5 rounded-full font-bold">DEFAULT</span>}
                      </div>
                      <p className="text-sm text-white/50">{addr.fullName} • {addr.phone}</p>
                      {addr.buildingName && <p className="text-xs text-white/30 mt-0.5">🏢 {addr.buildingName}{addr.flatRoomNumber ? `, ${addr.flatRoomNumber}` : ''}</p>}
                      <p className="text-xs text-white/30 mt-0.5">{addr.street}{addr.area ? `, ${addr.area}` : ''}</p>
                      <p className="text-xs text-white/30">{addr.city}, {addr.state} {addr.postalCode}</p>
                      {addr.landmark && <p className="text-xs text-white/20 mt-1">📍 {addr.landmark}</p>}
                      <div className="flex items-center gap-3 mt-1.5">
                        {addr.whatsappUpdates !== false && <span className="text-2xs text-green-400 flex items-center gap-0.5"><MessageCircle size={8} /> WhatsApp</span>}
                        {addr.deliveryPreferences?.preferredTime && addr.deliveryPreferences.preferredTime !== 'anytime' && <span className="text-2xs text-white/25 flex items-center gap-0.5"><Clock size={8} /> {addr.deliveryPreferences.preferredTime}</span>}
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <button onClick={() => startEdit(addr)} className="p-2 hover:bg-white/5 rounded-lg text-white/30 hover:text-accent transition-all"><Edit3 size={14} /></button>
                      <button onClick={() => handleDelete(addr._id)} className="p-2 hover:bg-red-500/10 rounded-lg text-white/30 hover:text-red-400 transition-all"><Trash2 size={14} /></button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          <button onClick={() => { setForm({ ...EMPTY_ADDRESS }); setEditing(null); setShowForm(true); }} className="flex items-center gap-2 text-sm text-accent hover:text-accent/80 font-medium transition-colors">
            <Plus size={16} /> Add new address
          </button>
        </>
      )}

      {showForm && (
        <form onSubmit={handleSave} className="p-5 rounded-2xl bg-white/[0.02] border border-white/[0.05] space-y-4">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-bold text-white">{editing ? 'Edit Address' : 'Add Address'}</h4>
            <button type="button" onClick={() => { setShowForm(false); setEditing(null); }} className="p-1 hover:bg-white/5 rounded-lg text-white/30"><X size={16} /></button>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-2xs uppercase tracking-widest text-white/25 mb-1">Label</label>
              <select value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })} className="w-full h-10 rounded-lg text-sm text-white bg-white/[0.03] border border-white/[0.06] px-3 focus:outline-none focus:border-accent/40">
                <option value="Home">🏠 Home</option>
                <option value="Work">🏢 Work / Office</option>
                <option value="Other">📍 Other</option>
              </select>
            </div>
            <div>
              <label className="block text-2xs uppercase tracking-widest text-white/25 mb-1">Full Name *</label>
              <input value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} className="w-full h-10 rounded-lg text-sm text-white bg-white/[0.03] border border-white/[0.06] px-3 focus:outline-none focus:border-accent/40" placeholder="Arjun Mehta" required />
            </div>
            <div>
              <label className="block text-2xs uppercase tracking-widest text-white/25 mb-1">Phone *</label>
              <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="w-full h-10 rounded-lg text-sm text-white bg-white/[0.03] border border-white/[0.06] px-3 focus:outline-none focus:border-accent/40" placeholder="+91 98765 43210" required />
            </div>
          </div>

          <div>
            <label className="block text-2xs uppercase tracking-widest text-white/25 mb-1">Alternative Phone (optional)</label>
            <input value={form.alternativePhone || ''} onChange={(e) => setForm({ ...form, alternativePhone: e.target.value })} className="w-full h-10 rounded-lg text-sm text-white bg-white/[0.03] border border-white/[0.06] px-3 focus:outline-none focus:border-accent/40" placeholder="+91 98765 43210" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-2xs uppercase tracking-widest text-white/25 mb-1">Building / Society Name</label>
              <input value={form.buildingName || ''} onChange={(e) => setForm({ ...form, buildingName: e.target.value })} className="w-full h-10 rounded-lg text-sm text-white bg-white/[0.03] border border-white/[0.06] px-3 focus:outline-none focus:border-accent/40" placeholder="Prestige Towers" />
            </div>
            <div>
              <label className="block text-2xs uppercase tracking-widest text-white/25 mb-1">Flat / Room No.</label>
              <input value={form.flatRoomNumber || ''} onChange={(e) => setForm({ ...form, flatRoomNumber: e.target.value })} className="w-full h-10 rounded-lg text-sm text-white bg-white/[0.03] border border-white/[0.06] px-3 focus:outline-none focus:border-accent/40" placeholder="B-402" />
            </div>
          </div>

          <div>
            <label className="block text-2xs uppercase tracking-widest text-white/25 mb-1">Street Address *</label>
            <input value={form.street} onChange={(e) => setForm({ ...form, street: e.target.value })} className="w-full h-10 rounded-lg text-sm text-white bg-white/[0.03] border border-white/[0.06] px-3 focus:outline-none focus:border-accent/40" placeholder="123, MG Road" required />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-2xs uppercase tracking-widest text-white/25 mb-1">Area / Locality</label>
              <input value={form.area || ''} onChange={(e) => setForm({ ...form, area: e.target.value })} className="w-full h-10 rounded-lg text-sm text-white bg-white/[0.03] border border-white/[0.06] px-3 focus:outline-none focus:border-accent/40" placeholder="Bandra West" />
            </div>
            <div>
              <label className="block text-2xs uppercase tracking-widest text-white/25 mb-1">Landmark</label>
              <input value={form.landmark || ''} onChange={(e) => setForm({ ...form, landmark: e.target.value })} className="w-full h-10 rounded-lg text-sm text-white bg-white/[0.03] border border-white/[0.06] px-3 focus:outline-none focus:border-accent/40" placeholder="Near Starbucks" />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-2xs uppercase tracking-widest text-white/25 mb-1">Pincode *</label>
              <input
                value={form.postalCode}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '').slice(0, 6);
                  setForm({ ...form, postalCode: val });
                  if (val.length === 6) lookupPincode(val);
                }}
                className="w-full h-10 rounded-lg text-sm text-white bg-white/[0.03] border border-white/[0.06] px-3 focus:outline-none focus:border-accent/40"
                placeholder="400001"
                maxLength={6}
                required
              />
            </div>
            <div>
              <label className="block text-2xs uppercase tracking-widest text-white/25 mb-1">City *</label>
              <input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} className="w-full h-10 rounded-lg text-sm text-white bg-white/[0.03] border border-white/[0.06] px-3 focus:outline-none focus:border-accent/40" placeholder="Mumbai" required />
            </div>
            <div>
              <label className="block text-2xs uppercase tracking-widest text-white/25 mb-1">State *</label>
              <select value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} className="w-full h-10 rounded-lg text-sm text-white bg-[#111] border border-white/[0.06] px-3 focus:outline-none focus:border-accent/40" required>
                <option value="">Select state</option>
                {INDIAN_STATES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-2xs uppercase tracking-widest text-white/25 mb-1.5 flex items-center gap-1">
              <MapPin size={10} /> Pin your exact location on map
            </label>
            <Suspense fallback={<div className="h-[280px] bg-white/[0.03] rounded-xl animate-pulse flex items-center justify-center text-white/20 text-xs">Loading map…</div>}>
              <MapPicker
                location={form.location}
                onLocationSelect={(loc) => setForm({ ...form, location: loc })}
              />
            </Suspense>
          </div>

          <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.05] space-y-3">
            <h4 className="text-xs font-semibold text-white/50 flex items-center gap-1.5"><Clock size={12} className="text-accent" /> Delivery Preferences</h4>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-2xs uppercase tracking-widest text-white/25 mb-1">Preferred Time</label>
                <select
                  value={form.deliveryPreferences?.preferredTime || 'anytime'}
                  onChange={(e) => setForm({ ...form, deliveryPreferences: { ...form.deliveryPreferences, preferredTime: e.target.value } })}
                  className="w-full h-10 rounded-lg text-sm text-white bg-white/[0.03] border border-white/[0.06] px-3 focus:outline-none focus:border-accent/40"
                >
                  <option value="anytime">Anytime</option>
                  <option value="morning">Morning (9AM - 12PM)</option>
                  <option value="afternoon">Afternoon (12PM - 4PM)</option>
                  <option value="evening">Evening (4PM - 8PM)</option>
                </select>
              </div>
              <div>
                <label className="block text-2xs uppercase tracking-widest text-white/25 mb-1">Best Time to Call</label>
                <input
                  value={form.deliveryPreferences?.bestTimeToCall || ''}
                  onChange={(e) => setForm({ ...form, deliveryPreferences: { ...form.deliveryPreferences, bestTimeToCall: e.target.value } })}
                  className="w-full h-10 rounded-lg text-sm text-white bg-white/[0.03] border border-white/[0.06] px-3 focus:outline-none focus:border-accent/40"
                  placeholder="e.g., 10AM - 6PM"
                />
              </div>
            </div>

            {form.label === 'Work' && (
              <div className="grid grid-cols-2 gap-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={form.deliveryPreferences?.saturdayDelivery ?? true} onChange={(e) => setForm({ ...form, deliveryPreferences: { ...form.deliveryPreferences, saturdayDelivery: e.target.checked } })} className="w-3.5 h-3.5 rounded border-white/10 bg-white/5 text-accent focus:ring-accent/30" />
                  <span className="text-xs text-white/40">Saturday delivery</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={form.deliveryPreferences?.sundayDelivery ?? false} onChange={(e) => setForm({ ...form, deliveryPreferences: { ...form.deliveryPreferences, sundayDelivery: e.target.checked } })} className="w-3.5 h-3.5 rounded border-white/10 bg-white/5 text-accent focus:ring-accent/30" />
                  <span className="text-xs text-white/40">Sunday delivery</span>
                </label>
              </div>
            )}

            <div>
              <label className="block text-2xs uppercase tracking-widest text-white/25 mb-1">Delivery Instructions</label>
              <textarea
                value={form.deliveryPreferences?.deliveryInstructions || ''}
                onChange={(e) => setForm({ ...form, deliveryPreferences: { ...form.deliveryPreferences, deliveryInstructions: e.target.value } })}
                className="w-full h-16 rounded-lg text-sm text-white bg-white/[0.03] border border-white/[0.06] px-3 py-2 focus:outline-none focus:border-accent/40 resize-none"
                placeholder="Ring doorbell, leave with security, etc."
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.whatsappUpdates !== false} onChange={(e) => setForm({ ...form, whatsappUpdates: e.target.checked })} className="w-3.5 h-3.5 rounded border-white/10 bg-white/5 text-accent focus:ring-accent/30" />
              <span className="text-xs text-white/40 flex items-center gap-1"><MessageCircle size={10} className="text-green-400" /> WhatsApp delivery updates</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.isDefault} onChange={(e) => setForm({ ...form, isDefault: e.target.checked })} className="w-3.5 h-3.5 rounded border-white/10 bg-white/5 text-accent focus:ring-accent/30" />
              <span className="text-xs text-white/40">Default address</span>
            </label>
          </div>

          <div className="flex gap-2 pt-2">
            <button type="button" onClick={() => { setShowForm(false); setEditing(null); }} className="h-10 px-5 rounded-xl text-sm text-white/40 border border-white/[0.06] hover:bg-white/[0.03] transition-all">Cancel</button>
            <button type="submit" disabled={loading} className="flex-1 h-10 rounded-xl font-bold text-[#050805] text-sm disabled:opacity-40" style={{ background: 'linear-gradient(135deg,#C8A827,#F5CC55,#C8A827)' }}>
              {loading ? 'Saving…' : editing ? 'Update Address' : 'Save Address'}
            </button>
          </div>
        </form>
      )}
    </motion.div>
  );
}

export default function ProfilePage() {
  const location = useLocation();
  const { user, logout, setUser } = useAuthStore();
  const activeTab = location.pathname.includes('orders') ? 'orders' : location.pathname.includes('addresses') ? 'addresses' : 'profile';

  const handleSave = (updatedUser) => {
    setUser(updatedUser);
  };

  return (
    <div className="pt-24 pb-16 min-h-screen bg-[#050505]">
      <Helmet>
        <title>My Account | Avenues Perfume</title>
        <meta name="description" content="Manage your Avenues Perfume account, orders, and preferences." />
        <link rel="canonical" href="https://avenues.in/profile" />
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <motion.h1 initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="font-display text-3xl font-bold text-white mb-8">My Account</motion.h1>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.05] h-fit">
            <div className="flex items-center gap-3 p-3 mb-4">
              <div className="w-11 h-11 rounded-full bg-accent/10 flex items-center justify-center border border-accent/15 overflow-hidden">
                {user?.avatarUrl ? (
                  <img src={user.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-accent font-bold text-sm">{user?.firstName?.[0] || 'U'}</span>
                )}
              </div>
              <div>
                <p className="text-sm font-semibold text-white">{user?.firstName || 'User'} {user?.lastName || ''}</p>
                <p className="text-2xs text-white/25">{user?.email || ''}</p>
              </div>
            </div>
            <nav className="space-y-0.5">
              {TABS.map((item) => (
                <Link key={item.name} to={item.path} className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${activeTab === item.name.toLowerCase() ? 'bg-accent/10 text-accent' : 'text-white/40 hover:text-white/60 hover:bg-white/[0.03]'}`}>
                  <item.icon size={16} />
                  {item.name}
                </Link>
              ))}
              <Link to="/wishlist" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-white/40 hover:text-white/60 hover:bg-white/[0.03] transition-all">
                <Heart size={16} /> Wishlist
              </Link>
              <button onClick={() => { logout(); window.location.href = '/'; }} className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-white/30 hover:text-red-400 hover:bg-red-500/5 transition-all mt-2 border-t border-white/5 pt-3">
                <LogOut size={16} /> Sign Out
              </button>
            </nav>
          </motion.div>

          <div className="lg:col-span-3">
            <AnimatePresence mode="wait">
              {activeTab === 'profile' && <ProfileTab key="profile" user={user} onSave={handleSave} />}
              {activeTab === 'orders' && <OrdersTab key="orders" />}
              {activeTab === 'addresses' && <AddressesTab key="addresses" user={user} onUpdate={handleSave} />}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
