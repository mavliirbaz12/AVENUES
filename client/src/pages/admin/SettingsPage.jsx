import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Save, Loader } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

export default function AdminSettingsPage() {
  const [form, setForm] = useState({
    storeName: '', storeEmail: '', storePhone: '', storeAddress: '',
    freeShippingThreshold: '', standardShipping: '', expressShipping: '',
    taxRate: '', currency: 'INR',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const token = localStorage.getItem('avenues_token');
        const { data } = await axios.get('/api/settings', { headers: { Authorization: `Bearer ${token}` } });
        setForm({
          storeName: data.storeName || '',
          storeEmail: data.storeEmail || '',
          storePhone: data.storePhone || '',
          storeAddress: data.storeAddress || '',
          freeShippingThreshold: data.freeShippingThreshold ?? '',
          standardShipping: data.standardShipping ?? '',
          expressShipping: data.expressShipping ?? '',
          taxRate: data.taxRate ?? '',
          currency: data.currency || 'INR',
        });
      } catch { /* use defaults */ }
      finally { setLoading(false); }
    };
    fetchSettings();
  }, []);

  const update = (key, val) => setForm({ ...form, [key]: val });

  const handleSave = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem('avenues_token');
      await axios.put('/api/settings', {
        storeName: form.storeName,
        storeEmail: form.storeEmail,
        storePhone: form.storePhone,
        storeAddress: form.storeAddress,
        freeShippingThreshold: Number(form.freeShippingThreshold) || 0,
        standardShipping: Number(form.standardShipping) || 0,
        expressShipping: Number(form.expressShipping) || 0,
        taxRate: Number(form.taxRate) || 0,
        currency: form.currency,
      }, { headers: { Authorization: `Bearer ${token}` } });
      toast.success('Settings saved!');
    } catch {
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => <div key={i} className="h-40 bg-white/[0.03] rounded-2xl animate-pulse" />)}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="font-display text-2xl font-bold text-white">Settings</h2>

      {/* General */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
        className="bg-[#111111] border border-white/5 rounded-2xl p-6">
        <h3 className="text-sm font-semibold text-white/60 uppercase tracking-wider mb-4">General</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            { label: 'Store Name', key: 'storeName', placeholder: 'AVENUES PERFUME' },
            { label: 'Contact Email', key: 'storeEmail', placeholder: 'hello@avenues.com', type: 'email' },
            { label: 'Phone', key: 'storePhone', placeholder: '+91 98765 43210' },
            { label: 'Address', key: 'storeAddress', placeholder: 'Mumbai, Maharashtra, India' },
          ].map(({ label, key, placeholder, type }) => (
            <div key={key}>
              <label className="block text-[10px] uppercase tracking-widest text-white/25 mb-1.5">{label}</label>
              <input type={type || 'text'} value={form[key]} onChange={e => update(key, e.target.value)}
                className="w-full h-11 rounded-xl text-sm text-white bg-white/[0.03] border border-white/[0.06] px-4 focus:outline-none focus:border-accent/40 transition-all"
                placeholder={placeholder} />
            </div>
          ))}
        </div>
      </motion.div>

      {/* Shipping */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
        className="bg-[#111111] border border-white/5 rounded-2xl p-6">
        <h3 className="text-sm font-semibold text-white/60 uppercase tracking-wider mb-4">Shipping</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: 'Free Shipping Threshold (₹)', key: 'freeShippingThreshold', placeholder: '500' },
            { label: 'Standard Shipping (₹)', key: 'standardShipping', placeholder: '49' },
            { label: 'Express Shipping (₹)', key: 'expressShipping', placeholder: '99' },
          ].map(({ label, key, placeholder }) => (
            <div key={key}>
              <label className="block text-[10px] uppercase tracking-widest text-white/25 mb-1.5">{label}</label>
              <input type="number" value={form[key]} onChange={e => update(key, e.target.value)}
                className="w-full h-11 rounded-xl text-sm text-white bg-white/[0.03] border border-white/[0.06] px-4 focus:outline-none focus:border-accent/40 transition-all"
                placeholder={placeholder} />
            </div>
          ))}
        </div>
      </motion.div>

      {/* Payment */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="bg-[#111111] border border-white/5 rounded-2xl p-6">
        <h3 className="text-sm font-semibold text-white/60 uppercase tracking-wider mb-4">Payment</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-[10px] uppercase tracking-widest text-white/25 mb-1.5">Tax Rate (%)</label>
            <input type="number" value={form.taxRate} onChange={e => update('taxRate', e.target.value)}
              className="w-full h-11 rounded-xl text-sm text-white bg-white/[0.03] border border-white/[0.06] px-4 focus:outline-none focus:border-accent/40 transition-all"
              placeholder="18" />
          </div>
          <div>
            <label className="block text-[10px] uppercase tracking-widest text-white/25 mb-1.5">Currency</label>
            <input value={form.currency} readOnly
              className="w-full h-11 rounded-xl text-sm text-white/50 bg-white/[0.02] border border-white/[0.04] px-4 cursor-not-allowed" />
          </div>
        </div>
      </motion.div>

      <button onClick={handleSave} disabled={saving}
        className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-[#050505] text-sm disabled:opacity-40 transition-opacity"
        style={{ background: 'linear-gradient(135deg,#C8A827,#F5CC55,#C8A827)' }}>
        {saving ? <><Loader size={14} className="animate-spin" /> Saving...</> : <><Save size={14} /> Save Settings</>}
      </button>
    </div>
  );
}
