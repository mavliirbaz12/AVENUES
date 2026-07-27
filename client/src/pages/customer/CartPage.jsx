import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import useCartStore from '@/store/cartStore';
import { formatCurrency } from '@/lib/utils';

export default function CartPage() {
  const { items, updateQuantity, removeItem, getSubtotal, getTax, getShipping, getTotal } = useCartStore();

  if (items.length === 0) {
    return (
      <div className="pt-24 pb-16 min-h-screen bg-[#050505] text-white flex items-center justify-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
          <ShoppingBag size={64} className="text-white/20 mx-auto mb-4" />
          <h2 className="font-display text-2xl font-bold mb-2">Nothing here yet</h2>
          <p className="text-white/60 mb-6">Your cart's empty. Let's fix that.</p>
          <Link to="/shop" className="btn-accent text-primary-900 inline-flex items-center gap-2">Browse Scents <ArrowRight size={16} /></Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="pt-24 pb-16 min-h-screen bg-[#050505] text-white">
      <div className="container-luxury">
        <motion.h1 initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="font-display text-3xl font-bold mb-8">Shopping Cart</motion.h1>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {items.map((item, i) => (
              <motion.div key={item.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="bg-[#111111] border border-white/5 rounded-card p-4 flex gap-4 shadow-card">
                <div className="w-24 h-24 rounded-lg shrink-0 flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${item.color}20, ${item.color}40)` }}>
                  <span className="text-4xl">🧴</span>
                </div>
                <div className="flex-1 min-w-0">
                  <Link to={`/product/${item.slug}`} className="font-display font-semibold text-white hover:text-accent transition-colors">{item.name}</Link>
                  <p className="text-xs text-white/60 mt-0.5">{item.fragrance.size} • {item.type}</p>
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center border border-white/20 rounded-btn overflow-hidden bg-white/5">
                      <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="w-8 h-8 flex items-center justify-center hover:bg-white/10 text-white"><Minus size={14} /></button>
                      <span className="w-8 text-center text-sm font-medium text-white">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="w-8 h-8 flex items-center justify-center hover:bg-white/10 text-white"><Plus size={14} /></button>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="font-bold text-white">{formatCurrency(item.pricing.sellingPrice * item.quantity)}</span>
                      <button onClick={() => removeItem(item.id)} className="p-2 hover:bg-red-500/10 rounded-full text-white/40 hover:text-error transition-colors"><Trash2 size={16} /></button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="bg-[#111111] border border-white/5 rounded-card p-6 shadow-card h-fit sticky top-24">
            <h3 className="font-display text-lg font-semibold mb-4 text-white">Order Summary</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between"><span className="text-white/60">Subtotal</span><span className="font-medium text-white">{formatCurrency(getSubtotal())}</span></div>
              <div className="flex justify-between"><span className="text-white/60">Shipping</span><span className="font-medium">{getShipping() === 0 ? <span className="text-accent">FREE</span> : <span className="text-white">{formatCurrency(getShipping())}</span>}</span></div>
              <div className="flex justify-between"><span className="text-white/60">Tax (18% GST)</span><span className="font-medium text-white">{formatCurrency(getTax())}</span></div>
              <hr className="border-white/10" />
              <div className="flex justify-between text-base"><span className="font-semibold text-white">Total</span><span className="font-bold text-lg text-white">{formatCurrency(getTotal())}</span></div>
            </div>
            {getShipping() > 0 && <p className="text-xs text-white/40 mt-3">Add <span className="text-accent">{formatCurrency(500 - getSubtotal())}</span> more for free shipping</p>}
            <Link to="/checkout" className="btn-accent text-primary-900 font-bold w-full text-center mt-6 flex items-center justify-center gap-2">Proceed to Checkout <ArrowRight size={16} /></Link>
            <Link to="/shop" className="btn-secondary border-white/20 text-white hover:bg-white hover:text-primary-900 w-full text-center mt-3 text-sm">Continue Shopping</Link>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
