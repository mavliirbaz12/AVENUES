import { useState, useEffect } from 'react';
import { AlertTriangle, Package, TrendingDown, RefreshCw, Check, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import axios from 'axios';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

export default function AdminInventoryPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = true;
  const [search, setSearch] = useState('');
  const [stockInputs, setStockInputs] = useState({});
  const [saving, setSaving] = useState(null);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get('/api/products');
      setProducts(data);
      const inputs = {};
      data.forEach(p => { inputs[p._id] = p.stock?.quantity ?? 0; });
      setStockInputs(inputs);
    } catch {
      toast.error('Failed to load products from database');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProducts(); }, []);

  const filtered = products.filter(p => {
    return p.name?.toLowerCase().includes(search.toLowerCase());
  });

  const totalStock = products.reduce((sum, p) => sum + (p.stock?.quantity ?? 0), 0);
  const lowStock = products.filter(p => {
    const q = p.stock?.quantity ?? 0;
    return q > 0 && q <= (p.stock?.lowStockThreshold ?? 10);
  }).length;
  const outOfStock = products.filter(p => (p.stock?.quantity ?? 0) === 0).length;

  const handleSave = async (id) => {
    const newQty = Number(stockInputs[id]);
    if (isNaN(newQty) || newQty < 0) {
      toast.error('Please enter a valid stock quantity');
      return;
    }
    setSaving(id);
    try {
      await axios.put(`/api/products/${id}`, { stock: newQty });
      setProducts(products.map(p =>
        p._id === id ? { ...p, stock: { ...p.stock, quantity: newQty } } : p
      ));
      toast.success(`Stock set to ${newQty}`);
    } catch {
      toast.error('Failed to update stock');
    } finally {
      setSaving(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-2xl font-bold text-white">Inventory</h2>
          <p className="text-sm text-white/60">Manage stock levels — live from MongoDB Atlas</p>
        </div>
        <button
          onClick={fetchProducts}
          className="flex items-center gap-2 px-4 py-2 bg-accent/10 hover:bg-accent/20 text-accent border border-accent/30 rounded-lg text-sm transition-colors"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {/* Stats + Search */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="grid grid-cols-3 gap-4">
          {[
            { title: 'Total Stock', value: totalStock, icon: Package, color: 'text-accent', bg: 'bg-accent/10' },
            { title: 'Low Stock', value: lowStock, icon: TrendingDown, color: 'text-yellow-400', bg: 'bg-yellow-400/10' },
            { title: 'Out of Stock', value: outOfStock, icon: AlertTriangle, color: 'text-red-400', bg: 'bg-red-400/10' },
          ].map((stat) => (
            <div key={stat.title} className="bg-[#111111] border border-white/5 rounded-card p-4">
              <div className="flex items-center gap-3">
                <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center', stat.bg)}>
                  <stat.icon size={18} className={stat.color} />
                </div>
                <div>
                  <p className="text-2xs text-white/40 uppercase tracking-wider">{stat.title}</p>
                  <p className="text-xl font-bold text-white">{loading ? '—' : stat.value}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            className="w-64 bg-[#111111] border border-white/10 rounded-lg pl-9 pr-4 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-accent/50"
            placeholder="Search products..." />
        </div>
      </div>

      {/* Inventory Table */}
      <div className="bg-[#111111] border border-white/5 rounded-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-white/10 bg-[#0D0D0D]">
              <tr>
                <th className="text-left py-3.5 px-5 font-medium text-white/50">Product</th>
                <th className="text-left py-3.5 px-5 font-medium text-white/50">Current Stock</th>
                <th className="text-left py-3.5 px-5 font-medium text-white/50">Alert At</th>
                <th className="text-left py-3.5 px-5 font-medium text-white/50">Status</th>
                <th className="text-left py-3.5 px-5 font-medium text-white/50">Set New Stock</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array(5).fill(0).map((_, i) => (
                  <tr key={i} className="border-b border-white/5">
                    <td colSpan={5} className="py-4 px-5">
                      <div className="h-5 bg-white/5 rounded-lg animate-pulse" />
                    </td>
                  </tr>
                ))
              ) : filtered.map((p) => {
                const qty = p.stock?.quantity ?? 0;
                const threshold = p.stock?.lowStockThreshold ?? 10;
                const isLow = qty <= threshold && qty > 0;
                const isOut = qty === 0;
                const inputVal = stockInputs[p._id] ?? qty;
                const isDirty = Number(inputVal) !== qty;
                const isSaving = saving === p._id;

                return (
                  <motion.tr
                    key={p._id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="border-b border-white/5 hover:bg-white/[0.03] transition-colors"
                  >
                    {/* Product Name */}
                    <td className="py-4 px-5">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 text-lg"
                          style={{ background: `linear-gradient(135deg, ${p.color || '#D4AF37'}20, ${p.color || '#D4AF37'}40)` }}
                        >
                          {p.images?.[0]
                            ? <img src={p.images[0]} className="w-full h-full object-cover rounded-lg" onError={e => e.target.style.display='none'} alt="" />
                            : '🧴'
                          }
                        </div>
                        <span className="font-medium text-white">{p.name}</span>
                      </div>
                    </td>

                    {/* Current Stock */}
                    <td className="py-4 px-5">
                      <span className={cn(
                        'text-2xl font-bold',
                        isOut ? 'text-red-400' : isLow ? 'text-yellow-400' : 'text-accent'
                      )}>
                        {qty}
                      </span>
                    </td>

                    {/* Threshold */}
                    <td className="py-4 px-5 text-white/50">{threshold}</td>

                    {/* Status Badge */}
                    <td className="py-4 px-5">
                      <span className={cn(
                        'px-3 py-1 rounded-full text-xs font-semibold',
                        isOut
                          ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                          : isLow
                          ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
                          : 'bg-green-500/10 text-green-400 border border-green-500/20'
                      )}>
                        {isOut ? '⚠ Out of Stock' : isLow ? '↓ Low Stock' : '✓ In Stock'}
                      </span>
                    </td>

                    {/* Manual Stock Input */}
                    <td className="py-4 px-5">
                      <div className="flex items-center gap-2">
                        <div className="flex items-center bg-[#0A0A0A] border border-white/10 rounded-lg overflow-hidden">
                          <button
                            type="button"
                            onClick={() => setStockInputs(prev => ({ ...prev, [p._id]: Math.max(0, Number(prev[p._id] ?? qty) - 1) }))}
                            className="px-3 py-2 text-white/60 hover:text-white hover:bg-white/5 transition-colors text-lg leading-none"
                          >
                            −
                          </button>
                          <input
                            type="number"
                            min="0"
                            value={inputVal}
                            onChange={e => setStockInputs(prev => ({ ...prev, [p._id]: e.target.value }))}
                            className="w-16 text-center bg-transparent text-white text-sm py-2 focus:outline-none"
                          />
                          <button
                            type="button"
                            onClick={() => setStockInputs(prev => ({ ...prev, [p._id]: Number(prev[p._id] ?? qty) + 1 }))}
                            className="px-3 py-2 text-white/60 hover:text-white hover:bg-white/5 transition-colors text-lg leading-none"
                          >
                            +
                          </button>
                        </div>
                        <button
                          disabled={!isDirty || isSaving}
                          onClick={() => handleSave(p._id)}
                          className={cn(
                            'flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold transition-all',
                            isDirty
                              ? 'bg-accent text-[#050505] hover:bg-accent/90 shadow-lg shadow-accent/20'
                              : 'bg-white/5 text-white/30 cursor-not-allowed'
                          )}
                        >
                          {isSaving
                            ? <span className="animate-pulse">Saving...</span>
                            : <><Check size={12} /> Save</>
                          }
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
