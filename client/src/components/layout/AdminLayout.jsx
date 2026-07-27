import { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Package, ShoppingCart, Users, BarChart3,
  Settings, ChevronLeft, ChevronRight, LogOut, Bell, Boxes, Tag, Menu
} from 'lucide-react';
import NotificationBell from '@/components/features/NotificationBell';
import { BRAND } from '@/lib/constants';
import useAuthStore from '@/store/authStore';
import { cn } from '@/lib/utils';
import { SkipLink, LiveRegions } from '@/lib/accessibility';

const ADMIN_NAV = [
  { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
  { name: 'Products', path: '/admin/products', icon: Package },
  { name: 'Orders', path: '/admin/orders', icon: ShoppingCart },
  { name: 'Customers', path: '/admin/customers', icon: Users },
  { name: 'Inventory', path: '/admin/inventory', icon: Boxes },
  { name: 'Coupons', path: '/admin/coupons', icon: Tag },
  { name: 'Analytics', path: '/admin/analytics', icon: BarChart3 },
  { name: 'Settings', path: '/admin/settings', icon: Settings },
];

export default function AdminLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const isActive = (path) => {
    if (path === '/admin') return location.pathname === '/admin';
    return location.pathname.startsWith(path);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-[#050505] flex">
      <SkipLink targetId="admin-main-content" />
      <LiveRegions />
      {/* Sidebar */}
      <aside
        className={cn(
          'fixed lg:static inset-y-0 left-0 z-40 bg-[#0A0A0A] text-white transition-all duration-300 flex flex-col border-r border-white/5',
          collapsed ? 'w-20' : 'w-64',
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        {/* Logo */}
        <div className={cn(
          'h-16 flex items-center border-b border-white/5',
          collapsed ? 'justify-center px-0' : 'px-4 justify-start'
        )}>
          <Link to="/admin" className={cn("flex items-center group", collapsed ? "" : "w-full")}>
            {collapsed ? (
              <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center shrink-0 shadow-[0_0_10px_rgba(212,175,55,0.3)]">
                <span className="text-primary-900 font-display text-sm font-bold">A</span>
              </div>
            ) : (
              <img src="/logo.png" alt="Avenues Admin" className="h-10 object-contain group-hover:brightness-110 transition-all duration-300" style={{ mixBlendMode: 'lighten' }} />
            )}
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
          {ADMIN_NAV.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setMobileOpen(false)}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
                isActive(item.path)
                  ? 'bg-accent/10 text-accent'
                  : 'text-white/60 hover:text-white hover:bg-white/5',
                collapsed && 'justify-center px-0'
              )}
            >
              <item.icon size={20} className="shrink-0" />
              {!collapsed && <span>{item.name}</span>}
            </Link>
          ))}
        </nav>

        {/* Collapse Toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="hidden lg:flex items-center justify-center h-12 border-t border-white/5 text-white/40 hover:text-white transition-colors"
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </aside>

      {/* Mobile Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Top Bar */}
        <header className="h-16 bg-[#0A0A0A] border-b border-white/5 flex items-center justify-between px-4 lg:px-6 sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(true)}
              className="lg:hidden p-2 rounded-lg hover:bg-white/5 text-white"
            >
              <Menu size={20} />
            </button>
            <h1 className="text-lg font-display font-semibold text-white">
              {ADMIN_NAV.find((n) => isActive(n.path))?.name || 'Dashboard'}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <NotificationBell />

            <div className="flex items-center gap-2 pl-3 border-l border-white/10">
              <div className="w-8 h-8 bg-accent/10 rounded-full flex items-center justify-center">
                <span className="text-accent font-bold text-xs">
                  {user?.firstName?.[0] || 'A'}
                </span>
              </div>
              <span className="text-sm font-medium text-white hidden sm:block">
                {user?.firstName || 'Admin'}
              </span>
              <button
                onClick={handleLogout}
                className="p-1.5 rounded-full hover:bg-error/20 text-white/60 hover:text-error transition-colors"
                title="Logout"
              >
                <LogOut size={16} />
              </button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main id="admin-main-content" className="flex-1 p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
