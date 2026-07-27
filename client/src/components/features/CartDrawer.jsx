import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Minus, ShoppingBag, Trash2, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import useCartStore from '@/store/cartStore';
import { formatCurrency } from '@/lib/utils';

export default function CartDrawer() {
  const { items, isOpen, closeCart, updateQuantity, removeItem, getSubtotal, getItemCount } = useCartStore();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeCart}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.3 }}
            className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-md bg-[#0D0D0D] border-l border-white/10 shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-white/10">
              <div className="flex items-center gap-2.5">
                <ShoppingBag size={20} className="text-accent" />
                <h2 className="font-display text-lg font-semibold text-white">Shopping Cart</h2>
                <span className="text-xs text-white/40">
                  ({getItemCount()} {getItemCount() === 1 ? 'item' : 'items'})
                </span>
              </div>
              <button
                onClick={closeCart}
                className="p-2 hover:bg-white/10 rounded-full transition-colors text-white/60 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto p-5">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <ShoppingBag size={48} className="text-white/15 mb-4" />
                  <p className="font-display text-lg text-white/70 mb-2">
                    Nothing here yet
                  </p>
                  <p className="text-sm text-white/40 mb-6">
                    Your cart's empty. Let's fix that.
                  </p>
                   <Link
                     to="/shop"
                     onClick={closeCart}
                     className="btn-cta inline-flex items-center gap-2 font-bold text-sm px-6 py-3 rounded-full"
                   >
                     Browse Scents
                   </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  <AnimatePresence>
                    {items.map((item) => (
                      <motion.div
                        key={item.id}
                        layout
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -100 }}
                        className="flex gap-3 p-3 bg-[#111111] border border-white/5 rounded-xl"
                      >
                        {/* Image */}
                        <div
                          className="w-20 h-20 rounded-lg shrink-0 flex items-center justify-center"
                          style={{ background: `linear-gradient(135deg, ${item.color}20, ${item.color}40)` }}
                        >
                          <span className="text-2xl">🧴</span>
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <Link
                            to={`/product/${item.slug}`}
                            onClick={closeCart}
                            className="font-medium text-sm text-white hover:text-accent transition-colors line-clamp-1"
                          >
                            {item.name}
                          </Link>
                          <p className="text-xs text-white/40 mt-0.5">
                            {item.fragrance?.size} • {item.type}
                          </p>

                          <div className="flex items-center justify-between mt-2.5">
                            {/* Quantity */}
                            <div className="flex items-center gap-1.5">
                              <button
                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                className="w-7 h-7 rounded-lg border border-white/15 flex items-center justify-center
                                         hover:border-accent hover:text-accent text-white/60 transition-colors"
                              >
                                <Minus size={12} />
                              </button>
                              <span className="text-sm font-medium w-7 text-center text-white">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                className="w-7 h-7 rounded-lg border border-white/15 flex items-center justify-center
                                         hover:border-accent hover:text-accent text-white/60 transition-colors"
                              >
                                <Plus size={12} />
                              </button>
                            </div>

                            {/* Price */}
                            <p className="font-semibold text-sm text-white">
                              {formatCurrency(item.pricing.sellingPrice * item.quantity)}
                            </p>
                          </div>
                        </div>

                        {/* Remove */}
                        <button
                          onClick={() => removeItem(item.id)}
                          className="p-1.5 hover:bg-red-500/10 rounded-full text-white/30 hover:text-red-400 transition-colors self-start"
                        >
                          <Trash2 size={14} />
                        </button>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="border-t border-white/10 p-5 space-y-3 bg-[#0A0A0A]">
                <div className="flex justify-between text-sm">
                  <span className="text-white/50">Subtotal</span>
                  <span className="font-semibold text-white">{formatCurrency(getSubtotal())}</span>
                </div>
                <p className="text-xs text-white/35">
                  Shipping & taxes calculated at checkout
                </p>
                <Link
                  to="/checkout"
                  onClick={closeCart}
                  className="btn-cta w-full flex items-center justify-center gap-2 font-bold text-sm py-3 rounded-full"
                >
                  Checkout <ArrowRight size={16} />
                </Link>
                <button
                  onClick={closeCart}
                  className="w-full text-center text-sm text-white/50 hover:text-white py-2 rounded-lg hover:bg-white/5 transition-all"
                >
                  Continue Shopping
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
