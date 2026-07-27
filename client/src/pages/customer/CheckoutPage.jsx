import { useState, useEffect, lazy, Suspense, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, CreditCard, CheckCircle, ArrowRight, X, Plus, Home, Building2, Trash2, MessageCircle, Loader2, Tag, Check, Loader, Truck } from 'lucide-react';
import useCartStore from '@/store/cartStore';
import useAuthStore from '@/store/authStore';
import { formatCurrency } from '@/lib/utils';
import { PAYMENT_METHODS } from '@/lib/constants';
import toast from 'react-hot-toast';
import axios from 'axios';
import { Helmet } from 'react-helmet-async';

const MapPicker = lazy(() => import('@/components/features/MapPicker'));

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

export default function CheckoutPage() {
  const [showNewAddressForm, setShowNewAddressForm] = useState(false);
  const [newAddress, setNewAddress] = useState({ ...EMPTY_ADDRESS });
  const [savingAddress, setSavingAddress] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('razorpay');
  const [processing, setProcessing] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [saveCard, setSaveCard] = useState(false);
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [applyingCoupon, setApplyingCoupon] = useState(false);
  const [step, setStep] = useState(1);
  const [razorpayCustomerId, setRazorpayCustomerId] = useState(null);
  const navigate = useNavigate();
  const { items, getSubtotal, getTax, getShipping, clearCart } = useCartStore();
  const { user, setUser } = useAuthStore();

  const savedAddresses = user?.addresses || [];
  const defaultAddressId = savedAddresses.find((a) => a.isDefault)?._id || savedAddresses[0]?._id || null;
  const [selectedAddressId, setSelectedAddressId] = useState(defaultAddressId);
  const selectedAddr = savedAddresses.find((a) => a._id === selectedAddressId) || null;

  const calculateDeliveryDate = (addr) => {
    if (!addr?.postalCode) return '';
    const pin = String(addr.postalCode);
    let days;
    if (pin.startsWith('1')) days = 2;
    else if (pin.startsWith('6')) days = 3;
    else if (pin.startsWith('4')) days = 3;
    else if (pin.startsWith('5')) days = 4;
    else if (pin.startsWith('7')) days = 5;
    else days = 4;
    const now = new Date();
    const deliveryStart = new Date(now);
    deliveryStart.setDate(deliveryStart.getDate() + days);
    const deliveryEnd = new Date(now);
    deliveryEnd.setDate(deliveryEnd.getDate() + days + 2);
    const options = { month: 'short', day: 'numeric' };
    return `${deliveryStart.toLocaleDateString('en-IN', options)} – ${deliveryEnd.toLocaleDateString('en-IN', options)}`;
  };

  const estimatedDelivery = useMemo(() => selectedAddr ? calculateDeliveryDate(selectedAddr) : '', [selectedAddr]);

  useEffect(() => {
    const fetchRazorpayCustomer = async () => {
      try {
        const { data } = await axios.post('/api/payments/create-customer', {});
        setRazorpayCustomerId(data.customerId);
      } catch { /* handle silently */ }
    };
    if (user) fetchRazorpayCustomer();
  }, [user]);

  const handleSaveNewAddress = async () => {
    if (!newAddress.fullName || !newAddress.phone || !newAddress.street || !newAddress.city || !newAddress.state || !newAddress.postalCode) {
      toast.error('Please fill all required fields');
      return;
    }
    setSavingAddress(true);
    try {
      const { data } = await axios.post('/api/users/addresses', newAddress);
      setUser({ ...user, addresses: data });
      const saved = data[data.length - 1];
      setSelectedAddressId(saved._id);
      setShowNewAddressForm(false);
      setNewAddress({ ...EMPTY_ADDRESS });
      toast.success('Address saved!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save address');
    } finally {
      setSavingAddress(false);
    }
  };

  const handleDeleteAddress = async (id) => {
    try {
      const { data } = await axios.delete(`/api/users/addresses/${id}`);
      setUser({ ...user, addresses: data });
      if (selectedAddressId === id) setSelectedAddressId(data.length > 0 ? data[0]._id : null);
      toast.success('Address removed');
    } catch { toast.error('Failed to delete'); }
  };

  const lookupPincode = async (pin, setAddr) => {
    if (pin.length !== 6) return;
    try {
      const { data } = await axios.get(`https://api.postalpincode.in/pincode/${pin}`, { timeout: 3000 });
      if (data[0]?.Status === 'Success' && data[0]?.PostOffice?.length > 0) {
        const po = data[0].PostOffice[0];
        setAddr((prev) => ({ ...prev, city: po.District, state: po.State }));
      }
    } catch { /* pincode lookup failed */ }
  };

  const [couponError, setCouponError] = useState('');

  const handleApplyCoupon = async () => {
    setCouponError('');
    if (!couponCode.trim()) { setCouponError('Please enter a coupon code'); return; }
    setApplyingCoupon(true);
    try {
      const { data } = await axios.post('/api/coupons/validate', {
        code: couponCode.trim(),
        cartTotal: getSubtotal(),
        cartItems: items.map((item) => ({ product: item._id || item.id, quantity: item.quantity, price: item.pricing.sellingPrice })),
      });

      setAppliedCoupon(data.coupon);
      setCouponDiscount(data.discount);
      toast.success(`Coupon applied! You save ₹${data.discount}`);
    } catch (err) {
      const msg = err.response?.data?.message || 'Invalid coupon';
      setCouponError(msg);
      toast.error(msg);
      setAppliedCoupon(null);
      setCouponDiscount(0);
    } finally {
      setApplyingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponDiscount(0);
    setCouponCode('');
    toast.success('Coupon removed');
  };

  const getFinalTotal = () => {
    return Math.max(0, getSubtotal() + getTax() + getShipping() - couponDiscount);
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddr && !showNewAddressForm) {
      toast.error('Please select or add a shipping address');
      return;
    }

    const addr = selectedAddr;
    if (!addr) { toast.error('Please save the address first'); return; }

    setProcessing(true);

    try {
      const token = localStorage.getItem('avenues_token');
      const headers = { Authorization: `Bearer ${token}` };

      if (paymentMethod === 'razorpay') {
        if (!window.Razorpay) {
          toast.error('Payment gateway not loaded. Please try again or use COD.');
          setProcessing(false);
          return;
        }
        // Create Razorpay order
        const { data: rpOrder } = await axios.post('/api/payments/create-order', {
          amount: getFinalTotal(),
          receipt: `order_${Date.now()}`,
          customerId: razorpayCustomerId,
        }, { headers });

        const options = {
          key: rpOrder.keyId,
          amount: rpOrder.amount,
          currency: rpOrder.currency,
          name: 'Avenues Perfume',
          description: `Order - ${items.length} item(s)`,
          order_id: rpOrder.orderId,
          customer_id: razorpayCustomerId,
          handler: async (response) => {
            try {
              // Verify payment
              await axios.post('/api/payments/verify', {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }, { headers });

              // Create order in DB
              const orderData = {
                orderItems: items.map((item) => ({
                  product: item._id || item.id,
                  name: item.name,
                  quantity: item.quantity,
                  price: item.pricing.sellingPrice,
                  image: item.images?.[0] || '',
                })),
                shippingAddress: {
                  fullName: addr.fullName,
                  phone: addr.phone,
                  alternativePhone: addr.alternativePhone,
                  buildingName: addr.buildingName,
                  flatRoomNumber: addr.flatRoomNumber,
                  street: addr.street,
                  area: addr.area,
                  city: addr.city,
                  state: addr.state,
                  postalCode: addr.postalCode,
                  country: addr.country,
                  landmark: addr.landmark,
                  location: addr.location,
                  label: addr.label,
                },
                paymentMethod: 'razorpay',
                paymentResult: {
                  razorpayOrderId: response.razorpay_order_id,
                  razorpayPaymentId: response.razorpay_payment_id,
                  razorpaySignature: response.razorpay_signature,
                  status: 'completed',
                },
                taxPrice: getTax(),
                shippingPrice: getShipping(),
                couponCode: appliedCoupon?.code || '',
                discountType: appliedCoupon?.type || '',
                discountValue: appliedCoupon?.value || 0,
                discount: couponDiscount,
                totalPrice: getFinalTotal(),
                deliveryInstructions: addr.deliveryPreferences?.deliveryInstructions || '',
                whatsappUpdates: addr.whatsappUpdates !== false,
              };

              const { data: order } = await axios.post('/api/users/orders', orderData, { headers });
              clearCart();
              navigate(`/order-confirmation/${order.orderNumber || order._id}`);
            } catch {
              toast.error('Order creation failed after payment. Contact support.');
              setProcessing(false);
            }
          },
          prefill: {
            name: addr.fullName,
            contact: addr.phone,
          },
          theme: {
            color: '#D4AF37',
          },
          modal: {
            ondismiss: () => { setProcessing(false); },
          },
        };

        const rzp = new window.Razorpay(options);
        rzp.on('payment.failed', () => {
          toast.error('Payment failed. Please try again.');
          setProcessing(false);
        });
        rzp.open();
      } else {
        // COD — no payment
        const orderData = {
          orderItems: items.map((item) => ({
            product: item._id || item.id,
            name: item.name,
            quantity: item.quantity,
            price: item.pricing.sellingPrice,
            image: item.images?.[0] || '',
          })),
          shippingAddress: {
            fullName: addr.fullName, phone: addr.phone,
            alternativePhone: addr.alternativePhone,
            buildingName: addr.buildingName, flatRoomNumber: addr.flatRoomNumber,
            street: addr.street, area: addr.area,
            city: addr.city, state: addr.state,
            postalCode: addr.postalCode, country: addr.country,
            landmark: addr.landmark, location: addr.location, label: addr.label,
          },
          paymentMethod: 'cod',
          taxPrice: getTax(),
          shippingPrice: getShipping(),
          couponCode: appliedCoupon?.code || '',
          discountType: appliedCoupon?.type || '',
          discountValue: appliedCoupon?.value || 0,
          discount: couponDiscount,
          totalPrice: getFinalTotal(),
          deliveryInstructions: addr.deliveryPreferences?.deliveryInstructions || '',
          whatsappUpdates: addr.whatsappUpdates !== false,
        };

        const { data: order } = await axios.post('/api/users/orders', orderData, { headers });
        clearCart();
        navigate(`/order-confirmation/${order.orderNumber || order._id}`);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to place order');
      setProcessing(false);
    }
  };

  useEffect(() => {
    if (window.Razorpay) {
      setScriptLoaded(true);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;

    script.onload = () => { setScriptLoaded(true); };
    script.onerror = () => { setScriptLoaded(false); toast.error('Payment gateway failed to load. Try COD.'); };

    document.body.appendChild(script);
    return () => { if (document.body.contains(script)) document.body.removeChild(script); };
  }, []);

  if (items.length === 0) {
    navigate('/cart');
    return null;
  }

  return (
    <div className="pt-24 pb-16 min-h-screen bg-[#050505] text-white">
      <Helmet>
        <title>Checkout | Avenues Perfume</title>
        <meta name="description" content="Secure checkout at Avenues Perfume. Choose from Razorpay, COD, and more." />
        <link rel="canonical" href="https://avenues.in/checkout" />
        <meta property="og:title" content="Checkout | Avenues Perfume" />
        <meta property="og:description" content="Complete your order with secure payment options including Razorpay and Cash on Delivery." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://avenues.in/checkout" />
        <meta property="og:image" content="https://avenues.in/og-checkout.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Checkout | Avenues Perfume" />
        <meta name="twitter:description" content="Complete your order with secure payment options including Razorpay and Cash on Delivery." />
      </Helmet>
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <h1 className="font-display text-3xl font-bold mb-8 text-white">Checkout</h1>

        <div className="flex items-center gap-3 mb-8">
          {[
            { num: 1, label: 'Address' },
            { num: 2, label: 'Payment' },
            { num: 3, label: 'Review' },
          ].map((s, i) => (
            <div key={s.num} className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${step >= s.num ? 'bg-accent text-[#050505]' : 'bg-white/10 text-white/40'}`}>
                  {step > s.num ? '✓' : s.num}
                </div>
                <span className={`text-xs font-medium hidden sm:block ${step >= s.num ? 'text-white' : 'text-white/40'}`}>{s.label}</span>
              </div>
              {i < 2 && <div className={`w-8 h-px ${step > s.num ? 'bg-accent' : 'bg-white/10'}`} />}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          <div className="lg:col-span-3 space-y-6">
            {step === 1 && (
              <div className="bg-[#111111] border border-white/5 rounded-2xl p-6">
                <h3 className="font-display text-lg font-semibold mb-4 flex items-center gap-2 text-white"><MapPin size={18} className="text-accent" /> Shipping Address</h3>
                {!showNewAddressForm ? (
                  <div className="space-y-3">
                    {savedAddresses.length > 0 ? (
                      savedAddresses.map((addr) => (
                        <div key={addr._id} onClick={() => setSelectedAddressId(addr._id)} className={`p-4 rounded-xl border cursor-pointer transition-all ${selectedAddressId === addr._id ? 'border-accent bg-accent/5' : 'border-white/10 hover:border-white/20 bg-white/[0.02]'}`}>
                          <div className="flex items-start justify-between">
                            <div className="flex items-start gap-3">
                              <div className={`w-4 h-4 rounded-full border-2 mt-0.5 flex-shrink-0 flex items-center justify-center ${selectedAddressId === addr._id ? 'border-accent' : 'border-white/20'}`}>
                                {selectedAddressId === addr._id && <div className="w-2 h-2 rounded-full bg-accent" />}
                              </div>
                              <div>
                                <div className="flex items-center gap-2 mb-1">
                                  {addr.label === 'Home' ? <Home size={12} className="text-white/40" /> : <Building2 size={12} className="text-white/40" />}
                                  <span className="text-xs font-semibold text-white">{addr.label}</span>
                                  {addr.isDefault && <span className="text-[9px] bg-accent/15 text-accent px-1.5 py-0.5 rounded-full font-bold">DEFAULT</span>}
                                </div>
                                <p className="text-sm text-white/60">{addr.fullName} • {addr.phone}</p>
                                {addr.buildingName && <p className="text-xs text-white/40">🏢 {addr.buildingName}{addr.flatRoomNumber ? `, ${addr.flatRoomNumber}` : ''}</p>}
                                <p className="text-xs text-white/40">{addr.street}{addr.area ? `, ${addr.area}` : ''}</p>
                                <p className="text-xs text-white/40">{addr.city}, {addr.state} {addr.postalCode}</p>
                                {addr.whatsappUpdates !== false && <span className="text-[9px] text-green-400 flex items-center gap-0.5 mt-1"><MessageCircle size={8} /> WhatsApp updates</span>}
                              </div>
                            </div>
                            <button onClick={(e) => { e.stopPropagation(); handleDeleteAddress(addr._id); }} className="p-1.5 hover:bg-red-500/10 rounded-lg text-white/20 hover:text-red-400 transition-all"><Trash2 size={12} /></button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8">
                        <MapPin size={32} className="text-white/10 mx-auto mb-2" />
                        <p className="text-white/30 text-sm">No saved addresses yet</p>
                      </div>
                    )}
                    <button onClick={() => setShowNewAddressForm(true)} className="flex items-center gap-2 text-sm text-accent hover:text-accent/80 font-medium transition-colors pt-2"><Plus size={16} /> Add new address</button>
                  </div>
                ) : (
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-sm font-bold text-white">Add New Address</h4>
                      <button onClick={() => { setShowNewAddressForm(false); setNewAddress({ ...EMPTY_ADDRESS }); }} className="p-1 hover:bg-white/5 rounded-lg text-white/30"><X size={16} /></button>
                    </div>
                    <div className="space-y-4">
                      <div className="grid grid-cols-3 gap-3">
                        <div>
                          <label className="block text-[10px] uppercase tracking-widest text-white/25 mb-1">Label</label>
                          <select value={newAddress.label} onChange={(e) => setNewAddress({ ...newAddress, label: e.target.value })} className="w-full h-10 rounded-lg text-sm text-white bg-white/[0.03] border border-white/[0.06] px-3 focus:outline-none focus:border-accent/40">
                            <option value="Home">🏠 Home</option><option value="Work">🏢 Work</option><option value="Other">📍 Other</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-[10px] uppercase tracking-widest text-white/25 mb-1">Full Name *</label>
                          <input value={newAddress.fullName} onChange={(e) => setNewAddress({ ...newAddress, fullName: e.target.value })} className="w-full h-10 rounded-lg text-sm text-white bg-white/[0.03] border border-white/[0.06] px-3 focus:outline-none focus:border-accent/40" placeholder="Arjun Mehta" required />
                        </div>
                        <div>
                          <label className="block text-[10px] uppercase tracking-widest text-white/25 mb-1">Phone *</label>
                          <input value={newAddress.phone} onChange={(e) => setNewAddress({ ...newAddress, phone: e.target.value })} className="w-full h-10 rounded-lg text-sm text-white bg-white/[0.03] border border-white/[0.06] px-3 focus:outline-none focus:border-accent/40" placeholder="+91 98765 43210" required />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[10px] uppercase tracking-widest text-white/25 mb-1">Building / Society</label>
                          <input value={newAddress.buildingName || ''} onChange={(e) => setNewAddress({ ...newAddress, buildingName: e.target.value })} className="w-full h-10 rounded-lg text-sm text-white bg-white/[0.03] border border-white/[0.06] px-3 focus:outline-none focus:border-accent/40" placeholder="Prestige Towers" />
                        </div>
                        <div>
                          <label className="block text-[10px] uppercase tracking-widest text-white/25 mb-1">Flat / Room No.</label>
                          <input value={newAddress.flatRoomNumber || ''} onChange={(e) => setNewAddress({ ...newAddress, flatRoomNumber: e.target.value })} className="w-full h-10 rounded-lg text-sm text-white bg-white/[0.03] border border-white/[0.06] px-3 focus:outline-none focus:border-accent/40" placeholder="B-402" />
                        </div>
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase tracking-widest text-white/25 mb-1">Street Address *</label>
                        <input value={newAddress.street} onChange={(e) => setNewAddress({ ...newAddress, street: e.target.value })} className="w-full h-10 rounded-lg text-sm text-white bg-white/[0.03] border border-white/[0.06] px-3 focus:outline-none focus:border-accent/40" placeholder="123, MG Road" required />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[10px] uppercase tracking-widest text-white/25 mb-1">Area / Locality</label>
                          <input value={newAddress.area || ''} onChange={(e) => setNewAddress({ ...newAddress, area: e.target.value })} className="w-full h-10 rounded-lg text-sm text-white bg-white/[0.03] border border-white/[0.06] px-3 focus:outline-none focus:border-accent/40" placeholder="Bandra West" />
                        </div>
                        <div>
                          <label className="block text-[10px] uppercase tracking-widest text-white/25 mb-1">Landmark</label>
                          <input value={newAddress.landmark || ''} onChange={(e) => setNewAddress({ ...newAddress, landmark: e.target.value })} className="w-full h-10 rounded-lg text-sm text-white bg-white/[0.03] border border-white/[0.06] px-3 focus:outline-none focus:border-accent/40" placeholder="Near Starbucks" />
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-3">
                        <div>
                          <label className="block text-[10px] uppercase tracking-widest text-white/25 mb-1">Pincode *</label>
                          <input value={newAddress.postalCode} onChange={(e) => { const v = e.target.value.replace(/\D/g, '').slice(0, 6); setNewAddress({ ...newAddress, postalCode: v }); if (v.length === 6) lookupPincode(v, setNewAddress); }} className="w-full h-10 rounded-lg text-sm text-white bg-white/[0.03] border border-white/[0.06] px-3 focus:outline-none focus:border-accent/40" placeholder="400001" maxLength={6} required />
                        </div>
                        <div>
                          <label className="block text-[10px] uppercase tracking-widest text-white/25 mb-1">City *</label>
                          <input value={newAddress.city} onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })} className="w-full h-10 rounded-lg text-sm text-white bg-white/[0.03] border border-white/[0.06] px-3 focus:outline-none focus:border-accent/40" placeholder="Mumbai" required />
                        </div>
                        <div>
                          <label className="block text-[10px] uppercase tracking-widest text-white/25 mb-1">State *</label>
                          <select value={newAddress.state} onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })} className="w-full h-10 rounded-lg text-sm text-white bg-white/[0.03] border border-white/[0.06] px-3 focus:outline-none focus:border-accent/40" required>
                            <option value="">Select state</option>
                            <option value="Andhra Pradesh">Andhra Pradesh</option>
                            <option value="Arunachal Pradesh">Arunachal Pradesh</option>
                            <option value="Assam">Assam</option>
                            <option value="Bihar">Bihar</option>
                            <option value="Chhattisgarh">Chhattisgarh</option>
                            <option value="Goa">Goa</option>
                            <option value="Gujarat">Gujarat</option>
                            <option value="Haryana">Haryana</option>
                            <option value="Himachal Pradesh">Himachal Pradesh</option>
                            <option value="Jharkhand">Jharkhand</option>
                            <option value="Karnataka">Karnataka</option>
                            <option value="Kerala">Kerala</option>
                            <option value="Madhya Pradesh">Madhya Pradesh</option>
                            <option value="Maharashtra">Maharashtra</option>
                            <option value="Manipur">Manipur</option>
                            <option value="Meghalaya">Meghalaya</option>
                            <option value="Mizoram">Mizoram</option>
                            <option value="Nagaland">Nagaland</option>
                            <option value="Odisha">Odisha</option>
                            <option value="Punjab">Punjab</option>
                            <option value="Rajasthan">Rajasthan</option>
                            <option value="Sikkim">Sikkim</option>
                            <option value="Tamil Nadu">Tamil Nadu</option>
                            <option value="Telangana">Telangana</option>
                            <option value="Tripura">Tripura</option>
                            <option value="Uttar Pradesh">Uttar Pradesh</option>
                            <option value="Uttarakhand">Uttarakhand</option>
                            <option value="West Bengal">West Bengal</option>
                            <option value="Andaman and Nicobar Islands">Andaman and Nicobar Islands</option>
                            <option value="Chandigarh">Chandigarh</option>
                            <option value="Dadra and Nagar Haveli and Daman and Diu">Dadra and Nagar Haveli and Daman and Diu</option>
                            <option value="Delhi">Delhi</option>
                            <option value="Jammu and Kashmir">Jammu and Kashmir</option>
                            <option value="Ladakh">Ladakh</option>
                            <option value="Lakshadweep">Lakshadweep</option>
                            <option value="Puducherry">Puducherry</option>
                          </select>
                        </div>
                      </div>
                      <Suspense fallback={<div className="h-[240px] bg-white/[0.03] rounded-xl animate-pulse" />}>
                        <MapPicker location={newAddress.location} onLocationSelect={(loc) => setNewAddress({ ...newAddress, location: loc })} height="240px" />
                      </Suspense>
                      <div className="flex gap-2 pt-2">
                        <button type="button" onClick={() => { setShowNewAddressForm(false); setNewAddress({ ...EMPTY_ADDRESS }); }} className="h-10 px-5 rounded-xl text-sm text-white/40 border border-white/[0.06] hover:bg-white/[0.03] transition-all">Cancel</button>
                        <button type="button" onClick={handleSaveNewAddress} disabled={savingAddress} className="flex-1 h-10 rounded-xl font-bold text-[#050505] text-sm disabled:opacity-40 btn-cta">
                          {savingAddress ? 'Saving…' : 'Save & Select'}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
                {step === 1 && (
                  <div className="flex justify-end mt-4">
                    <button type="button" onClick={() => setStep(2)} disabled={!selectedAddr} className="h-10 px-6 rounded-xl font-bold text-[#050805] text-sm disabled:opacity-25 btn-cta">Continue to Payment <ArrowRight size={14} /></button>
                  </div>
                )}
              </div>
            )}

            {step === 2 && (
              <div className="bg-[#111111] border border-white/5 rounded-2xl p-6">
                <h3 className="font-display text-lg font-semibold mb-4 flex items-center gap-2 text-white"><CreditCard size={18} className="text-accent" /> Payment Method</h3>
                {estimatedDelivery && (
                  <div className="flex items-center gap-2 mb-4 p-3 rounded-xl bg-green-400/5 border border-green-400/20 text-green-400 text-xs">
                    <Truck size={14} /> Estimated delivery: {estimatedDelivery}
                  </div>
                )}
                <div className="space-y-3">
                  {PAYMENT_METHODS.map((pm) => {
const isRazorpayDown = pm.id === 'razorpay' && !scriptLoaded;
                    return (
                      <button key={pm.id} disabled={pm.disabled || isRazorpayDown} onClick={() => setPaymentMethod(pm.id)} className={`w-full flex items-center gap-4 p-4 rounded-xl border transition-all ${paymentMethod === pm.id ? 'border-accent bg-accent/5' : 'border-white/10 hover:border-white/20 bg-white/[0.02]'} ${pm.disabled || isRazorpayDown ? 'opacity-40 cursor-not-allowed' : ''}`}>
                        <span className="text-2xl">{pm.icon}</span>
                        <div className="text-left flex-1">
                          <p className="font-medium text-sm text-white">{pm.label}</p>
                          <p className="text-xs text-white/40">{isRazorpayDown ? 'Currently unavailable — network issue' : pm.description}</p>
                        </div>
                        <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${paymentMethod === pm.id ? 'border-accent' : 'border-white/20'}`}>
                          {paymentMethod === pm.id && <div className="w-2 h-2 rounded-full bg-accent" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
                <div className="flex justify-between mt-6">
                  <button type="button" onClick={() => setStep(1)} className="h-10 px-5 rounded-xl text-sm text-white/40 border border-white/[0.06] hover:bg-white/[0.03] transition-all">← Back</button>
                  <button type="button" onClick={() => setStep(3)} className="h-10 px-6 rounded-xl font-bold text-[#050805] text-sm btn-cta">Continue to Review <ArrowRight size={14} /></button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="bg-[#111111] border border-white/5 rounded-2xl p-6">
                <h3 className="font-display text-lg font-semibold mb-4 flex items-center gap-2 text-white"><CheckCircle size={18} className="text-accent" /> Review Your Order</h3>
                <div className="space-y-4">
                  <div>
                    <h4 className="text-xs font-bold text-white/40 uppercase tracking-widest mb-2">Shipping To</h4>
                    <p className="text-sm text-white/80">{selectedAddr?.fullName} • {selectedAddr?.phone}</p>
                    <p className="text-xs text-white/40">{selectedAddr?.buildingName}{selectedAddr?.flatRoomNumber ? `, ${selectedAddr.flatRoomNumber}` : ''}, {selectedAddr?.street}, {selectedAddr?.city}, {selectedAddr?.state} {selectedAddr?.postalCode}</p>
                  </div>
                  <div className="border-t border-white/10 pt-4">
                    <h4 className="text-xs font-bold text-white/40 uppercase tracking-widest mb-2">Items ({items.length})</h4>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {items.map((item) => (
                        <div key={item.id} className="flex items-center justify-between text-sm">
                          <span className="text-white/70 truncate flex-1">{item.name} x{item.quantity}</span>
                          <span className="text-white ml-2">{formatCurrency(item.pricing.sellingPrice * item.quantity)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="border-t border-white/10 pt-4">
                    <h4 className="text-xs font-bold text-white/40 uppercase tracking-widest mb-2">Payment Method</h4>
                    <p className="text-sm text-white/80">{paymentMethod === 'razorpay' ? '💳 Razorpay' : '💵 Cash on Delivery'}</p>
                  </div>
                </div>
                <div className="flex justify-between mt-6">
                  <button type="button" onClick={() => setStep(2)} className="h-10 px-5 rounded-xl text-sm text-white/40 border border-white/[0.06] hover:bg-white/[0.03] transition-all">← Back</button>
                </div>
              </div>
            )}
          </div>

          <div className="lg:col-span-2">
            <div className="bg-[#111111] border border-white/5 rounded-2xl p-6 sticky top-24">
              <h3 className="font-display text-lg font-semibold mb-4 text-white">Order Summary</h3>
              <div className="space-y-3 mb-4 max-h-60 overflow-y-auto pr-1">
                {items.map((item) => (
                  <div key={item.id} className="flex items-center gap-3">
                    <span className="text-2xl">🧴</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">{item.name}</p>
                      <p className="text-xs text-white/40">Qty: {item.quantity}</p>
                    </div>
                    <p className="text-sm font-semibold text-white flex-shrink-0">{formatCurrency(item.pricing.sellingPrice * item.quantity)}</p>
                  </div>
                ))}
              </div>

              <div className="border-t border-white/10 pt-4 mb-4">
                {appliedCoupon ? (
                  <div className="flex items-center justify-between p-3 rounded-xl bg-green-400/5 border border-green-400/20">
                    <div className="flex items-center gap-2">
                      <Check size={14} className="text-green-400" />
                      <div>
                        <span className="text-xs font-bold text-green-400 uppercase">{appliedCoupon.code}</span>
                        <p className="text-[10px] text-white/40">
                          {appliedCoupon.type === 'percentage' ? `${appliedCoupon.value}% off` : `₹${appliedCoupon.value} off`}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-bold text-green-400">-₹{couponDiscount}</span>
                      <button onClick={handleRemoveCoupon} className="p-1 hover:bg-white/5 rounded-lg text-white/30 hover:text-red-400 transition-all">
                        <X size={12} />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="flex gap-2">
                      <div className="flex-1 relative">
                        <Tag size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20" />
                        <input
                          value={couponCode}
                          onChange={(e) => { setCouponCode(e.target.value.toUpperCase()); setCouponError(''); }}
                          onKeyDown={(e) => e.key === 'Enter' && handleApplyCoupon()}
                          className={`w-full h-10 rounded-lg text-sm text-white bg-white/[0.03] border ${couponError ? 'border-red-500' : 'border-white/[0.06]'} pl-9 pr-3 focus:outline-none focus:border-accent/40 uppercase placeholder:text-white/15`}
                          placeholder="Coupon code"
                        />
                      </div>
                      <button
                        onClick={handleApplyCoupon}
                        disabled={applyingCoupon || !couponCode.trim()}
                        className="h-10 px-4 rounded-lg text-xs font-bold text-accent border border-accent/30 hover:bg-accent/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                      >
                        {applyingCoupon ? <Loader size={12} className="animate-spin" /> : 'Apply'}
                      </button>
                    </div>
                    {couponError && (
                      <p className="text-red-400 text-[10px] mt-1">{couponError}</p>
                    )}
                  </div>
                )}
              </div>

              <div className="border-t border-white/10 pt-4 space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-white/50">Subtotal</span><span className="text-white">{formatCurrency(getSubtotal())}</span></div>
                <div className="flex justify-between"><span className="text-white/50">Shipping</span><span className="text-white">{getShipping() === 0 ? <span className="text-accent font-semibold">FREE</span> : formatCurrency(getShipping())}</span></div>
                <div className="flex justify-between"><span className="text-white/50">Tax (18%)</span><span className="text-white">{formatCurrency(getTax())}</span></div>
                {couponDiscount > 0 && (
                  <div className="flex justify-between"><span className="text-green-400">Coupon Discount</span><span className="text-green-400">-{formatCurrency(couponDiscount)}</span></div>
                )}
                <div className="border-t border-white/10 pt-2 mt-2">
                  <div className="flex justify-between text-lg font-bold"><span className="text-white">Total</span><span className="text-accent">{formatCurrency(getFinalTotal())}</span></div>
                </div>
              </div>

              {step === 3 ? (
                <button
                  onClick={handlePlaceOrder}
                  disabled={processing || (!selectedAddr && !showNewAddressForm)}
                  className="w-full h-12 mt-6 rounded-xl font-bold text-[#050805] text-sm flex items-center justify-center gap-2 disabled:opacity-40 transition-opacity"
                  style={{ background: 'linear-gradient(135deg,#C8A827,#F5CC55,#C8A827)' }}
                >
                  {processing ? (
                    <span className="flex items-center gap-2">
                      <Loader2 size={16} className="animate-spin" />
                      Processing…
                    </span>
                  ) : (
                    <>
                      {paymentMethod === 'cod' ? 'Place Order' : `Pay ${formatCurrency(getFinalTotal())}`}
                      <ArrowRight size={16} />
                    </>
                  )}
                </button>
              ) : (
                <div className="mt-6" />
              )}

              {paymentMethod === 'razorpay' && (
                <label className="flex items-center gap-2 mt-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={saveCard}
                    onChange={(e) => setSaveCard(e.target.checked)}
                    className="w-4 h-4 rounded border-white/20 bg-white/5 text-accent focus:ring-accent/50"
                  />
                  <span className="text-xs text-white/50">Save card for future purchases</span>
                </label>
              )}
              <p className="text-[10px] text-white/20 text-center mt-3">
                {paymentMethod === 'cod' ? 'Pay when your order arrives' : 'Secure payment powered by Razorpay'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
