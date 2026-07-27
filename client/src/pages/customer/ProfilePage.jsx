import { useState, useEffect, lazy, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import {
  User, ShoppingBag, MapPin, Heart, Settings, LogOut, Plus, Trash2, Edit3,
  Navigation, Phone, X, Check, Package, Clock, Truck, CheckCircle, Building2, Home, MessageCircle
} from 'lucide-react';
import useAuthStore from '@/store/authStore';
import toast from 'react-hot-toast';
import axios from 'axios';

const MapPicker = lazy(() => import('@/components/features/MapPicker'));

const TABS = [
  { name: 'Profile', path: '/profile', icon: User },
  { name: 'Orders', path: '/profile/orders', icon: ShoppingBag },
  { name: 'Addresses', path: '/profile/addresses', icon: MapPin },
  { name: 'Wishlist', path: '/wishlist', icon: Heart },
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = localStorage.getItem('avenues_token');
      const { data } = await axios.put('/api/users/profile', form, { headers: { Authorization: `Bearer ${token}` } });
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

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.05]">
        <h3 className="font-display text-lg font-bold text-white mb-5">Personal Information</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { label: 'First Name', key: 'firstName', placeholder: 'Arjun' },
              { label: 'Last Name', key: 'lastName', placeholder: 'Mehta' },
              { label: 'Email', key: 'email', placeholder: 'you@example.com', readonly: true },
              { label: 'Phone', key: 'phone', placeholder: '+91 98765 43210' },
            ].map(({ label, key, placeholder, readonly }) => (
              <div key={key}>
                <label className="block text-[10px] font-semibold uppercase tracking-widest text-white/25 mb-1.5">{label}</label>
                <input
                  value={form[key]}
                  onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                  readOnly={readonly}
                  className="w-full h-11 rounded-xl text-sm text-white placeholder-white/15 bg-white/[0.03] border border-white/[0.06] focus:border-accent/40 focus:outline-none transition-all px-4 disabled:opacity-40"
                  placeholder={placeholder}
                />
                {key === 'email' && (
                  <div className="flex items-center gap-2 mt-1.5">
                    {user?.isEmailVerified ? (
                      <span className="text-[10px] text-green-400 flex items-center gap-1">
                        <Check size={10} /> Verified
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={handleResendVerification}
                        disabled={resendCooldown > 0}
                        className="text-[10px] text-yellow-400 hover:text-yellow-300 flex items-center gap-1 disabled:opacity-40 transition-colors"
                      >
                        ⚠ Not verified — {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend email'}
                      </button>
                    )}
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
    </motion.div>
  );
}

function OrdersTab() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const token = localStorage.getItem('avenues_token');
        const { data } = await axios.get('/api/users/orders', { headers: { Authorization: `Bearer ${token}` } });
        setOrders(data);
      } catch { /* no orders yet */ }
      finally { setLoading(false); }
    };
    fetchOrders();
  }, []);

  if (loading) return <div className="space-y-3">{[...Array(3)].map((_, i) => <div key={i} className="h-20 bg-white/[0.03] rounded-xl animate-pulse" />)}</div>;
  if (orders.length === 0) return (
    <div className="text-center py-16">
      <Package size={40} className="text-white/10 mx-auto mb-3" />
      <p className="text-white/30 text-sm">No orders yet</p>
      <Link to="/shop" className="text-accent text-sm font-semibold hover:underline mt-2 inline-block">Start shopping →</Link>
    </div>
  );

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
      {orders.map((order) => {
        const StatusIcon = STATUS_ICONS[order.status] || Clock;
        const isExpanded = expandedOrder === order._id;
        const orderDate = new Date(order.createdAt).toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
        return (
          <div key={order._id} className="rounded-xl bg-white/[0.02] border border-white/[0.05] hover:border-white/[0.1] transition-all overflow-hidden">
            {/* Header row */}
            <button onClick={() => setExpandedOrder(isExpanded ? null : order._id)} className="w-full p-4 text-left flex items-center justify-between hover:bg-white/[0.02] transition-all">
              <div className="flex items-center gap-3">
                <StatusIcon size={16} className={STATUS_COLORS[order.status]} />
                <div>
                  <p className="text-sm font-semibold text-white">{order.orderNumber || `#${order._id.slice(-6).toUpperCase()}`}</p>
                  <p className="text-[10px] text-white/25">{orderDate} • {order.orderItems?.length || 0} item(s)</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full ${order.status === 'delivered' ? 'bg-green-400/10 text-green-400' : order.status === 'cancelled' ? 'bg-red-400/10 text-red-400' : 'bg-accent/10 text-accent'}`}>
                  {order.status}
                </span>
                <span className="text-sm font-bold text-white">₹{(order.totalPrice || 0).toLocaleString('en-IN')}</span>
              </div>
            </button>

            {/* Expanded details */}
            <AnimatePresence>
              {isExpanded && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                  <div className="px-4 pb-4 pt-1 border-t border-white/[0.05] space-y-4">
                    {/* Mini tracking */}
                    <div className="flex items-center gap-1 overflow-x-auto pb-1">
                      {['placed','confirmed','processing','shipped','delivered'].map((s, i) => {
                        const done = ['placed','confirmed','processing','shipped','out_for_delivery','delivered'].indexOf(order.status) >= i;
                        const Icon = STATUS_ICONS[s] || Clock;
                        return (
                          <div key={s} className="flex items-center gap-1 flex-shrink-0">
                            <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-bold ${done ? 'bg-accent text-[#050505]' : 'bg-white/[0.03] text-white/20 border border-white/[0.06]'}`}>
                              <Icon size={10} />
                            </div>
                            <span className={`text-[9px] capitalize ${done ? 'text-accent' : 'text-white/20'}`}>{s.replace('_', ' ')}</span>
                            {i < 4 && <div className={`w-6 h-px mx-0.5 ${done ? 'bg-accent' : 'bg-white/[0.06]'}`} />}
                          </div>
                        );
                      })}
                    </div>

                    {/* Items */}
                    <div className="space-y-2">
                      {order.orderItems?.map((item, i) => (
                        <div key={i} className="flex items-center gap-3">
                          <span className="text-lg">🧴</span>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-white truncate">{item.name}</p>
                            <p className="text-[10px] text-white/25">Qty: {item.quantity} × ₹{item.price?.toLocaleString('en-IN')}</p>
                          </div>
                          <p className="text-xs font-semibold text-white flex-shrink-0">₹{(item.price * item.quantity).toLocaleString('en-IN')}</p>
                        </div>
                      ))}
                    </div>

                    {/* Price breakdown */}
                    <div className="grid grid-cols-2 gap-3 text-[10px]">
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

                    {/* Payment badge */}
                    <div className="flex items-center gap-2 pt-1">
                      <span className="text-[9px] px-2 py-0.5 rounded-full bg-white/[0.03] border border-white/[0.06] text-white/40 capitalize">{order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Razorpay'}</span>
                      {order.paymentResult?.razorpayPaymentId && <span className="text-[9px] px-2 py-0.5 rounded-full bg-white/[0.03] border border-white/[0.06] text-white/25 font-mono">Paid ✓</span>}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </motion.div>
  );
}

function AddressesTab({ user, onUpdate }) {
  const [addresses, setAddresses] = useState(user?.addresses || []);
  const [editing, setEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ ...EMPTY_ADDRESS });
  const [loading, setLoading] = useState(false);
  const [locating, setLocating] = useState(false);

  useEffect(() => { setAddresses(user?.addresses || []); }, [user]);

  const detectLocation = () => {
    if (!navigator.geolocation) { toast.error('Geolocation not supported'); return; }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setForm({ ...form, location: { lat: pos.coords.latitude, lng: pos.coords.longitude } });
        toast.success('Location detected!');
        setLocating(false);
      },
      () => { toast.error('Location access denied'); setLocating(false); },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const lookupPincode = async (pin) => {
    if (pin.length !== 6) return;
    try {
      const { data } = await axios.get(`https://api.postalpincode.in/pincode/${pin}`);
      if (data[0]?.Status === 'Success' && data[0]?.PostOffice?.length > 0) {
        const po = data[0].PostOffice[0];
        setForm((prev) => ({ ...prev, city: po.District, state: po.State }));
        toast.success(`${po.District}, ${po.State}`);
      }
    } catch {
      // silent
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.fullName || !form.phone || !form.street || !form.city || !form.state || !form.postalCode) {
      toast.error('Please fill required fields');
      return;
    }
    setLoading(true);
    try {
      const token = localStorage.getItem('avenues_token');
      let data;
      if (editing) {
        const res = await axios.put(`/api/users/addresses/${editing}`, form, { headers: { Authorization: `Bearer ${token}` } });
        data = res.data;
      } else {
        const res = await axios.post('/api/users/addresses', form, { headers: { Authorization: `Bearer ${token}` } });
        data = res.data;
      }
      setAddresses(data);
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
      const token = localStorage.getItem('avenues_token');
      const { data } = await axios.delete(`/api/users/addresses/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      setAddresses(data);
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
                        {addr.isDefault && <span className="text-[9px] bg-accent/15 text-accent px-1.5 py-0.5 rounded-full font-bold">DEFAULT</span>}
                      </div>
                      <p className="text-sm text-white/50">{addr.fullName} • {addr.phone}</p>
                      {addr.buildingName && <p className="text-xs text-white/30 mt-0.5">🏢 {addr.buildingName}{addr.flatRoomNumber ? `, ${addr.flatRoomNumber}` : ''}</p>}
                      <p className="text-xs text-white/30 mt-0.5">{addr.street}{addr.area ? `, ${addr.area}` : ''}</p>
                      <p className="text-xs text-white/30">{addr.city}, {addr.state} {addr.postalCode}</p>
                      {addr.landmark && <p className="text-xs text-white/20 mt-1">📍 {addr.landmark}</p>}
                      <div className="flex items-center gap-3 mt-1.5">
                        {addr.whatsappUpdates !== false && <span className="text-[9px] text-green-400 flex items-center gap-0.5"><MessageCircle size={8} /> WhatsApp</span>}
                        {addr.deliveryPreferences?.preferredTime && addr.deliveryPreferences.preferredTime !== 'anytime' && <span className="text-[9px] text-white/25 flex items-center gap-0.5"><Clock size={8} /> {addr.deliveryPreferences.preferredTime}</span>}
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

          {/* Label + Name + Phone */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-[10px] uppercase tracking-widest text-white/25 mb-1">Label</label>
              <select value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })} className="w-full h-10 rounded-lg text-sm text-white bg-white/[0.03] border border-white/[0.06] px-3 focus:outline-none focus:border-accent/40">
                <option value="Home">🏠 Home</option>
                <option value="Work">🏢 Work / Office</option>
                <option value="Other">📍 Other</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] uppercase tracking-widest text-white/25 mb-1">Full Name *</label>
              <input value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} className="w-full h-10 rounded-lg text-sm text-white bg-white/[0.03] border border-white/[0.06] px-3 focus:outline-none focus:border-accent/40" placeholder="Arjun Mehta" required />
            </div>
            <div>
              <label className="block text-[10px] uppercase tracking-widest text-white/25 mb-1">Phone *</label>
              <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="w-full h-10 rounded-lg text-sm text-white bg-white/[0.03] border border-white/[0.06] px-3 focus:outline-none focus:border-accent/40" placeholder="+91 98765 43210" required />
            </div>
          </div>

          {/* Alternative phone */}
          <div>
            <label className="block text-[10px] uppercase tracking-widest text-white/25 mb-1">Alternative Phone (optional)</label>
            <input value={form.alternativePhone || ''} onChange={(e) => setForm({ ...form, alternativePhone: e.target.value })} className="w-full h-10 rounded-lg text-sm text-white bg-white/[0.03] border border-white/[0.06] px-3 focus:outline-none focus:border-accent/40" placeholder="+91 98765 43210" />
          </div>

          {/* Building + Flat */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] uppercase tracking-widest text-white/25 mb-1">Building / Society Name</label>
              <input value={form.buildingName || ''} onChange={(e) => setForm({ ...form, buildingName: e.target.value })} className="w-full h-10 rounded-lg text-sm text-white bg-white/[0.03] border border-white/[0.06] px-3 focus:outline-none focus:border-accent/40" placeholder="Prestige Towers" />
            </div>
            <div>
              <label className="block text-[10px] uppercase tracking-widest text-white/25 mb-1">Flat / Room No.</label>
              <input value={form.flatRoomNumber || ''} onChange={(e) => setForm({ ...form, flatRoomNumber: e.target.value })} className="w-full h-10 rounded-lg text-sm text-white bg-white/[0.03] border border-white/[0.06] px-3 focus:outline-none focus:border-accent/40" placeholder="B-402" />
            </div>
          </div>

          {/* Street + Area */}
          <div>
            <label className="block text-[10px] uppercase tracking-widest text-white/25 mb-1">Street Address *</label>
            <input value={form.street} onChange={(e) => setForm({ ...form, street: e.target.value })} className="w-full h-10 rounded-lg text-sm text-white bg-white/[0.03] border border-white/[0.06] px-3 focus:outline-none focus:border-accent/40" placeholder="123, MG Road" required />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] uppercase tracking-widest text-white/25 mb-1">Area / Locality</label>
              <input value={form.area || ''} onChange={(e) => setForm({ ...form, area: e.target.value })} className="w-full h-10 rounded-lg text-sm text-white bg-white/[0.03] border border-white/[0.06] px-3 focus:outline-none focus:border-accent/40" placeholder="Bandra West" />
            </div>
            <div>
              <label className="block text-[10px] uppercase tracking-widest text-white/25 mb-1">Landmark</label>
              <input value={form.landmark || ''} onChange={(e) => setForm({ ...form, landmark: e.target.value })} className="w-full h-10 rounded-lg text-sm text-white bg-white/[0.03] border border-white/[0.06] px-3 focus:outline-none focus:border-accent/40" placeholder="Near Starbucks" />
            </div>
          </div>

          {/* City + State + Pincode */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-[10px] uppercase tracking-widest text-white/25 mb-1">Pincode *</label>
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
              <label className="block text-[10px] uppercase tracking-widest text-white/25 mb-1">City *</label>
              <input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} className="w-full h-10 rounded-lg text-sm text-white bg-white/[0.03] border border-white/[0.06] px-3 focus:outline-none focus:border-accent/40" placeholder="Mumbai" required />
            </div>
            <div>
              <label className="block text-[10px] uppercase tracking-widest text-white/25 mb-1">State *</label>
              <input value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} className="w-full h-10 rounded-lg text-sm text-white bg-white/[0.03] border border-white/[0.06] px-3 focus:outline-none focus:border-accent/40" placeholder="Maharashtra" required />
            </div>
          </div>

          {/* Map */}
          <div>
            <label className="block text-[10px] uppercase tracking-widest text-white/25 mb-1.5 flex items-center gap-1">
              <MapPin size={10} /> Pin your exact location on map
            </label>
            <Suspense fallback={<div className="h-[280px] bg-white/[0.03] rounded-xl animate-pulse flex items-center justify-center text-white/20 text-xs">Loading map…</div>}>
              <MapPicker
                location={form.location}
                onLocationSelect={(loc) => setForm({ ...form, location: loc })}
              />
            </Suspense>
          </div>

          {/* Delivery Preferences */}
          <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.05] space-y-3">
            <h4 className="text-xs font-semibold text-white/50 flex items-center gap-1.5"><Clock size={12} className="text-accent" /> Delivery Preferences</h4>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] uppercase tracking-widest text-white/25 mb-1">Preferred Time</label>
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
                <label className="block text-[10px] uppercase tracking-widest text-white/25 mb-1">Best Time to Call</label>
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
              <label className="block text-[10px] uppercase tracking-widest text-white/25 mb-1">Delivery Instructions</label>
              <textarea
                value={form.deliveryPreferences?.deliveryInstructions || ''}
                onChange={(e) => setForm({ ...form, deliveryPreferences: { ...form.deliveryPreferences, deliveryInstructions: e.target.value } })}
                className="w-full h-16 rounded-lg text-sm text-white bg-white/[0.03] border border-white/[0.06] px-3 py-2 focus:outline-none focus:border-accent/40 resize-none"
                placeholder="Ring doorbell, leave with security, etc."
              />
            </div>
          </div>

          {/* WhatsApp + Default */}
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
            <button type="submit" disabled={loading} className="flex-1 h-10 rounded-xl font-bold text-[#050505] text-sm disabled:opacity-40" style={{ background: 'linear-gradient(135deg,#C8A827,#F5CC55,#C8A827)' }}>
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
  const [activeTab, setActiveTab] = useState('profile');

  useEffect(() => {
    if (location.pathname.includes('orders')) setActiveTab('orders');
    else if (location.pathname.includes('addresses')) setActiveTab('addresses');
    else setActiveTab('profile');
  }, [location.pathname]);

  const handleSave = (updatedUser) => {
    setUser(updatedUser);
  };

  return (
    <div className="pt-24 pb-16 min-h-screen bg-[#050505]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <motion.h1 initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="font-display text-3xl font-bold text-white mb-8">My Account</motion.h1>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.05] h-fit">
            <div className="flex items-center gap-3 p-3 mb-4">
              <div className="w-11 h-11 rounded-full bg-accent/10 flex items-center justify-center border border-accent/15">
                <span className="text-accent font-bold text-sm">{user?.firstName?.[0] || 'U'}</span>
              </div>
              <div>
                <p className="text-sm font-semibold text-white">{user?.firstName || 'User'} {user?.lastName || ''}</p>
                <p className="text-[10px] text-white/25">{user?.email || ''}</p>
              </div>
            </div>
            <nav className="space-y-0.5">
              {TABS.map((item) => (
                <button key={item.name} onClick={() => setActiveTab(item.name.toLowerCase())} className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${activeTab === item.name.toLowerCase() ? 'bg-accent/10 text-accent' : 'text-white/40 hover:text-white/60 hover:bg-white/[0.03]'}`}>
                  <item.icon size={16} />
                  {item.name}
                </button>
              ))}
              <button onClick={() => { logout(); window.location.href = '/'; }} className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-white/30 hover:text-red-400 hover:bg-red-500/5 transition-all mt-2 border-t border-white/5 pt-3">
                <LogOut size={16} /> Sign Out
              </button>
            </nav>
          </motion.div>

          {/* Content */}
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
