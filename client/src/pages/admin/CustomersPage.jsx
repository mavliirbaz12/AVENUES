import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Trash2, Users, Package, X } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get('/api/users');
      setCustomers(data);
    } catch {
      toast.error('Failed to load customers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCustomers(); }, []);

  const filtered = customers.filter(c => {
    const name = `${c.firstName} ${c.lastName}`.toLowerCase();
    return name.includes(search.toLowerCase()) || c.email?.toLowerCase().includes(search.toLowerCase());
  });

  const handleDelete = async (id) => {
    if (!confirm('Delete this customer?')) return;
    try {
      await axios.delete(`/api/users/${id}`);
      setCustomers(customers.filter(c => c._id !== id));
      toast.success('Customer deleted');
    } catch {
      toast.error('Failed to delete');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-2xl font-bold text-white">Customers</h2>
          <p className="text-sm text-white/60">{loading ? '...' : customers.length} registered customers</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
        <input value={search} onChange={e => setSearch(e.target.value)}
          className="w-full bg-[#111111] border border-white/10 rounded-lg pl-9 pr-4 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-accent/50"
          placeholder="Search by name or email..." />
      </div>

      {/* Table */}
      <div className="bg-[#111111] border border-white/5 rounded-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-white/10 bg-[#0D0D0D]">
              <tr>
                <th className="text-left py-3.5 px-5 font-medium text-white/50">Customer</th>
                <th className="text-left py-3.5 px-5 font-medium text-white/50">Email</th>
                <th className="text-left py-3.5 px-5 font-medium text-white/50">Phone</th>
                <th className="text-left py-3.5 px-5 font-medium text-white/50">Joined</th>
                <th className="text-left py-3.5 px-5 font-medium text-white/50">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array(4).fill(0).map((_, i) => (
                  <tr key={i} className="border-b border-white/5">
                    <td colSpan={5} className="py-4 px-5"><div className="h-5 bg-white/5 rounded-lg animate-pulse" /></td>
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-16 text-center text-white/30">
                    <Users size={40} className="mx-auto mb-3 opacity-20" />
                    <p>No customers found</p>
                  </td>
                </tr>
              ) : filtered.map(customer => (
                <tr key={customer._id} className="border-b border-white/5 hover:bg-white/[0.03] transition-colors">
                  <td className="py-3.5 px-5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-accent/10 rounded-full flex items-center justify-center border border-accent/15">
                        <span className="text-accent font-bold text-xs">{customer.firstName?.[0] || 'U'}</span>
                      </div>
                      <span className="font-medium text-white">{customer.firstName} {customer.lastName}</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-5 text-white/60">{customer.email}</td>
                  <td className="py-3.5 px-5 text-white/60">{customer.phone || '—'}</td>
                  <td className="py-3.5 px-5 text-white/40 text-xs">{new Date(customer.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                  <td className="py-3.5 px-5">
                    <button onClick={() => handleDelete(customer._id)} className="p-2 hover:bg-red-500/10 rounded-lg text-white/30 hover:text-red-400 transition-all"><Trash2 size={14} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
