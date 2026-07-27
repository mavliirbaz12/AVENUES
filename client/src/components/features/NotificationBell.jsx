import { useState, useEffect, useRef } from 'react';
import { Bell } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function NotificationBell() {
  const [orders, setOrders] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const ref = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRecent = async () => {
      try {
        const { data } = await axios.get('/api/dashboard/recent-orders');
        setOrders(data);
      } catch { /* silent */ }
    };
    fetchRecent();
    const interval = setInterval(fetchRecent, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const pendingCount = orders.filter((o) => ['placed', 'confirmed', 'processing'].includes(o.status)).length;

  const statusColor = (s) => {
    const colors = {
      placed: 'text-red-400', confirmed: 'text-blue-400', processing: 'text-yellow-400',
      shipped: 'text-accent', delivered: 'text-green-400', cancelled: 'text-white/30',
    };
    return colors[s] || 'text-white/40';
  };

  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setOpen(!open)} className="p-2 rounded-full hover:bg-white/5 text-white/80 relative">
        <Bell size={20} />
        {pendingCount > 0 && (
          <span className="absolute top-0.5 right-0.5 w-4 h-4 bg-red-500 rounded-full text-[9px] font-bold text-white flex items-center justify-center">
            {pendingCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-[#111111] border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden">
          <div className="p-3 border-b border-white/5 flex items-center justify-between">
            <span className="text-xs font-bold text-white/60 uppercase tracking-wider">Recent Orders</span>
            <button onClick={() => { setOpen(false); navigate('/admin/orders'); }} className="text-[10px] text-accent hover:text-accent/80">View All</button>
          </div>
          <div className="max-h-72 overflow-y-auto">
            {orders.length === 0 ? (
              <p className="p-4 text-xs text-white/30 text-center">No orders yet</p>
            ) : (
              orders.map((o, i) => (
                <div key={i} className="px-3 py-2.5 border-b border-white/[0.03] hover:bg-white/[0.02] transition-all cursor-pointer" onClick={() => { setOpen(false); navigate('/admin/orders'); }}>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono text-white/70">{o.id}</span>
                    <span className={`text-[9px] font-semibold uppercase ${statusColor(o.status)}`}>{o.status}</span>
                  </div>
                  <div className="flex items-center justify-between mt-0.5">
                    <span className="text-[10px] text-white/40">{o.customer}</span>
                    <span className="text-[10px] font-semibold text-white/60">₹{(o.total || 0).toLocaleString('en-IN')}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
