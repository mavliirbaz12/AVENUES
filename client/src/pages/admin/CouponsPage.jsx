import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, Edit, Trash2, X, Tag, ToggleLeft, ToggleRight, Calendar, Loader, Percent, IndianRupee } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const EMPTY_FORM = {
  code: '',
  description: '',
  type: 'percentage',
  value: '',
  minOrderAmount: '',
  maxDiscount: '',
  usageLimit: '',
  perUserLimit: '1',
  applicableTo: 'all',
  isActive: true,
  isAutoApply: false,
  priority: '0',
  activeFrom: '',
  expiresAt: '',
};

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [saving, setSaving] = useState(false);
  const [filter, setFilter] = useState('all');

  const fetchCoupons = async () => {
    try {
      const { data } = await axios.get('/api/coupons');
      setCoupons(data);
    } catch { /* empty */ }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchCoupons(); }, []);

  const openCreate = () => {
    setForm({ ...EMPTY_FORM });
    setEditing(null);
    setShowModal(true);
  };

  const openEdit = (coupon) => {
    setForm({
      code: coupon.code,
      description: coupon.description || '',
      type: coupon.type,
      value: coupon.value,
      minOrderAmount: coupon.minOrderAmount || '',
      maxDiscount: coupon.maxDiscount || '',
      usageLimit: coupon.usageLimit || '',
      perUserLimit: coupon.perUserLimit || '1',
      applicableTo: coupon.applicableTo || 'all',
      isActive: coupon.isActive,
      isAutoApply: coupon.isAutoApply,
      priority: coupon.priority || '0',
      activeFrom: coupon.activeFrom ? new Date(coupon.activeFrom).toISOString().slice(0, 10) : '',
      expiresAt: coupon.expiresAt ? new Date(coupon.expiresAt).toISOString().slice(0, 10) : '',
    });
    setEditing(coupon._id);
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.code || !form.value) { toast.error('Code and value are required'); return; }
    setSaving(true);
    try {
      const headers = {};
      const payload = {
        ...form,
        value: Number(form.value),
        minOrderAmount: Number(form.minOrderAmount) || 0,
        maxDiscount: Number(form.maxDiscount) || 0,
        usageLimit: Number(form.usageLimit) || 0,
        perUserLimit: Number(form.perUserLimit) || 1,
        priority: Number(form.priority) || 0,
        activeFrom: form.activeFrom || undefined,
        expiresAt: form.expiresAt || undefined,
      };

      if (editing) {
        await axios.put(`/api/coupons/${editing}`, payload, { headers });
        toast.success('Coupon updated');
      } else {
        await axios.post('/api/coupons', payload, { headers });
        toast.success('Coupon created');
      }
      setShowModal(false);
      fetchCoupons();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save');
    } finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this coupon?')) return;
    try {
      await axios.delete(`/api/coupons/${id}`);
      setCoupons(coupons.filter((c) => c._id !== id));
      toast.success('Coupon deleted');
    } catch { toast.error('Failed to delete'); }
  };

  const toggleActive = async (coupon) => {
    try {
      const { data } = await axios.put(`/api/coupons/${coupon._id}`, { isActive: !coupon.isActive });
      setCoupons(coupons.map((c) => c._id === coupon._id ? data : c));
    } catch { toast.error('Failed to toggle'); }
  };

  const filtered = coupons.filter((c) => {
    if (search && !c.code.toLowerCase().includes(search.toLowerCase()) && !c.description?.toLowerCase().includes(search.toLowerCase())) return false;
    if (filter === 'active' && !c.isActive) return false;
    if (filter === 'inactive' && c.isActive) return false;
    if (filter === 'auto' && !c.isAutoApply) return false;
    return true;
  });

  return (
    <div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-display font-bold text-white">Coupons</h2>
          <p className="text-sm text-white/40 mt-1">{coupons.length} coupon(s) total</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-[#050505]" style={{ background: 'linear-gradient(135deg,#C8A827,#F5CC55,#C8A827)' }}>
          <Plus size={16} /> Create Coupon
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} className="w-full h-10 rounded-xl text-sm text-white bg-white/[0.03] border border-white/[0.06] pl-10 pr-4 focus:outline-none focus:border-accent/40" placeholder="Search coupons..." />
        </div>
        <div className="flex gap-2">
          {['all', 'active', 'inactive', 'auto'].map((f) => (
            <button key={f} onClick={() => setFilter(f)} className={`px-3 h-10 rounded-xl text-xs font-medium transition-all capitalize ${filter === f ? 'bg-accent/10 text-accent border border-accent/20' : 'text-white/40 border border-white/[0.06] hover:bg-white/[0.03]'}`}>
              {f === 'auto' ? 'Auto-Apply' : f}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="space-y-3">{[...Array(4)].map((_, i) => <div key={i} className="h-16 bg-white/[0.03] rounded-xl animate-pulse" />)}</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <Tag size={40} className="text-white/10 mx-auto mb-3" />
          <p className="text-white/30 text-sm">No coupons found</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((coupon) => (
            <motion.div key={coupon._id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.05] hover:border-white/[0.1] transition-all">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${coupon.type === 'percentage' ? 'bg-blue-400/10' : 'bg-green-400/10'}`}>
                    {coupon.type === 'percentage' ? <Percent size={18} className="text-blue-400" /> : <IndianRupee size={18} className="text-green-400" />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-white font-mono">{coupon.code}</span>
                      {coupon.isAutoApply && <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-purple-400/10 text-purple-400 font-semibold">AUTO</span>}
                      {!coupon.isActive && <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-red-400/10 text-red-400 font-semibold">INACTIVE</span>}
                    </div>
                    <p className="text-xs text-white/40 mt-0.5">
                      {coupon.type === 'percentage' ? `${coupon.value}% off` : `₹${coupon.value} off`}
                      {coupon.minOrderAmount > 0 && ` • Min ₹${coupon.minOrderAmount}`}
                      {coupon.maxDiscount > 0 && ` • Max ₹${coupon.maxDiscount}`}
                      {coupon.usageLimit > 0 && ` • ${coupon.usedCount}/${coupon.usageLimit} used`}
                    </p>
                    {coupon.description && <p className="text-[10px] text-white/25 mt-0.5">{coupon.description}</p>}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => toggleActive(coupon)} className="p-1.5 hover:bg-white/5 rounded-lg transition-all">
                    {coupon.isActive ? <ToggleRight size={20} className="text-green-400" /> : <ToggleLeft size={20} className="text-white/20" />}
                  </button>
                  <button onClick={() => openEdit(coupon)} className="p-1.5 hover:bg-white/5 rounded-lg text-white/30 hover:text-accent transition-all"><Edit size={14} /></button>
                  <button onClick={() => handleDelete(coupon._id)} className="p-1.5 hover:bg-red-500/10 rounded-lg text-white/30 hover:text-red-400 transition-all"><Trash2 size={14} /></button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setShowModal(false)}>
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} onClick={(e) => e.stopPropagation()} className="bg-[#111111] border border-white/10 rounded-2xl w-full max-w-lg max-h-[85vh] overflow-y-auto">
              <div className="flex items-center justify-between p-5 border-b border-white/5">
                <h3 className="font-display text-lg font-bold text-white">{editing ? 'Edit Coupon' : 'Create Coupon'}</h3>
                <button onClick={() => setShowModal(false)} className="p-1.5 hover:bg-white/5 rounded-lg text-white/40"><X size={18} /></button>
              </div>

              <div className="p-5 space-y-4">
                {/* Code + Type */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-white/25 mb-1">Coupon Code *</label>
                    <input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} className="w-full h-10 rounded-lg text-sm text-white bg-white/[0.03] border border-white/[0.06] px-3 focus:outline-none focus:border-accent/40 uppercase font-mono" placeholder="SUMMER20" />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-white/25 mb-1">Type *</label>
                    <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="w-full h-10 rounded-lg text-sm text-white bg-white/[0.03] border border-white/[0.06] px-3 focus:outline-none focus:border-accent/40">
                      <option value="percentage">% Percentage</option>
                      <option value="flat">₹ Flat Amount</option>
                    </select>
                  </div>
                </div>

                {/* Value + Min Order */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-white/25 mb-1">{form.type === 'percentage' ? 'Percentage Off *' : 'Amount Off *'}</label>
                    <input type="number" value={form.value} onChange={(e) => setForm({ ...form, value: e.target.value })} className="w-full h-10 rounded-lg text-sm text-white bg-white/[0.03] border border-white/[0.06] px-3 focus:outline-none focus:border-accent/40" placeholder={form.type === 'percentage' ? '20' : '500'} />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-white/25 mb-1">Min Order Amount</label>
                    <input type="number" value={form.minOrderAmount} onChange={(e) => setForm({ ...form, minOrderAmount: e.target.value })} className="w-full h-10 rounded-lg text-sm text-white bg-white/[0.03] border border-white/[0.06] px-3 focus:outline-none focus:border-accent/40" placeholder="0 = no minimum" />
                  </div>
                </div>

                {/* Max Discount + Usage Limit */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-white/25 mb-1">Max Discount (₹)</label>
                    <input type="number" value={form.maxDiscount} onChange={(e) => setForm({ ...form, maxDiscount: e.target.value })} className="w-full h-10 rounded-lg text-sm text-white bg-white/[0.03] border border-white/[0.06] px-3 focus:outline-none focus:border-accent/40" placeholder="0 = no cap" />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-white/25 mb-1">Total Usage Limit</label>
                    <input type="number" value={form.usageLimit} onChange={(e) => setForm({ ...form, usageLimit: e.target.value })} className="w-full h-10 rounded-lg text-sm text-white bg-white/[0.03] border border-white/[0.06] px-3 focus:outline-none focus:border-accent/40" placeholder="0 = unlimited" />
                  </div>
                </div>

                {/* Per User Limit + Priority */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-white/25 mb-1">Per User Limit</label>
                    <input type="number" value={form.perUserLimit} onChange={(e) => setForm({ ...form, perUserLimit: e.target.value })} className="w-full h-10 rounded-lg text-sm text-white bg-white/[0.03] border border-white/[0.06] px-3 focus:outline-none focus:border-accent/40" />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-white/25 mb-1">Priority</label>
                    <input type="number" value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })} className="w-full h-10 rounded-lg text-sm text-white bg-white/[0.03] border border-white/[0.06] px-3 focus:outline-none focus:border-accent/40" placeholder="Higher = applied first" />
                  </div>
                </div>

                {/* Applicable To */}
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-white/25 mb-1">Applicable To</label>
                  <select value={form.applicableTo} onChange={(e) => setForm({ ...form, applicableTo: e.target.value })} className="w-full h-10 rounded-lg text-sm text-white bg-white/[0.03] border border-white/[0.06] px-3 focus:outline-none focus:border-accent/40">
                    <option value="all">All Products</option>
                    <option value="specific_products">Specific Products</option>
                    <option value="specific_categories">Specific Categories</option>
                    <option value="new_users">New Users Only</option>
                    <option value="returning_users">Returning Users Only</option>
                  </select>
                </div>

                {/* Dates */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-white/25 mb-1">Active From</label>
                    <input type="date" value={form.activeFrom} onChange={(e) => setForm({ ...form, activeFrom: e.target.value })} className="w-full h-10 rounded-lg text-sm text-white bg-white/[0.03] border border-white/[0.06] px-3 focus:outline-none focus:border-accent/40" />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-white/25 mb-1">Expires At</label>
                    <input type="date" value={form.expiresAt} onChange={(e) => setForm({ ...form, expiresAt: e.target.value })} className="w-full h-10 rounded-lg text-sm text-white bg-white/[0.03] border border-white/[0.06] px-3 focus:outline-none focus:border-accent/40" />
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-white/25 mb-1">Description</label>
                  <input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full h-10 rounded-lg text-sm text-white bg-white/[0.03] border border-white/[0.06] px-3 focus:outline-none focus:border-accent/40" placeholder="e.g., Summer sale offer" />
                </div>

                {/* Toggles */}
                <div className="flex items-center gap-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} className="w-3.5 h-3.5 rounded border-white/10 bg-white/5 text-accent focus:ring-accent/30" />
                    <span className="text-xs text-white/40">Active</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={form.isAutoApply} onChange={(e) => setForm({ ...form, isAutoApply: e.target.checked })} className="w-3.5 h-3.5 rounded border-white/10 bg-white/5 text-accent focus:ring-accent/30" />
                    <span className="text-xs text-white/40">Auto-apply (best coupon applied automatically)</span>
                  </label>
                </div>

                {/* Buttons */}
                <div className="flex gap-3 pt-2">
                  <button onClick={() => setShowModal(false)} className="h-11 px-6 rounded-xl text-sm text-white/40 border border-white/[0.06] hover:bg-white/[0.03] transition-all">Cancel</button>
                  <button onClick={handleSave} disabled={saving} className="flex-1 h-11 rounded-xl font-bold text-[#050505] text-sm flex items-center justify-center gap-2 disabled:opacity-40" style={{ background: 'linear-gradient(135deg,#C8A827,#F5CC55,#C8A827)' }}>
                    {saving ? <><Loader size={14} className="animate-spin" /> Saving...</> : editing ? 'Update Coupon' : 'Create Coupon'}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
