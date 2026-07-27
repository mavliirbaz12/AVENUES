import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import useAuthStore from '@/store/authStore';
import AuthModal from '@/components/features/AuthModal';
import SignupBar from '@/components/features/SignupBar';

// Layouts
import CustomerLayout from '@/components/layout/CustomerLayout';
import AdminLayout from '@/components/layout/AdminLayout';
import ScrollToTop from '@/components/layout/ScrollToTop';

// Accessibility
import { SkipLink, LiveRegions } from '@/lib/accessibility';

// Error Boundary
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';

// Customer Pages
import HomePage from '@/pages/customer/HomePage';
import ShopPage from '@/pages/customer/ShopPage';
import ProductDetailPage from '@/pages/customer/ProductDetailPage';
import CartPage from '@/pages/customer/CartPage';
import WishlistPage from '@/pages/customer/WishlistPage';
import CheckoutPage from '@/pages/customer/CheckoutPage';
import OrderConfirmationPage from '@/pages/customer/OrderConfirmationPage';
import ProfilePage from '@/pages/customer/ProfilePage';
import AboutPage from '@/pages/customer/AboutPage';
import NotFoundPage from '@/pages/NotFoundPage';

// Auth Pages
import LoginPage from '@/pages/auth/LoginPage';
import SignupPage from '@/pages/auth/SignupPage';
import VerifyEmailPage from '@/pages/auth/VerifyEmailPage';

// Admin Pages
import AdminDashboard from '@/pages/admin/DashboardPage';
import AdminProductsPage from '@/pages/admin/ProductsPage';
import AdminOrdersPage from '@/pages/admin/OrdersPage';
import AdminCustomersPage from '@/pages/admin/CustomersPage';
import AdminInventoryPage from '@/pages/admin/InventoryPage';
import AdminCouponsPage from '@/pages/admin/CouponsPage';
import AdminAnalyticsPage from '@/pages/admin/AnalyticsPage';
import AdminSettingsPage from '@/pages/admin/SettingsPage';

function AdminRouteGuard({ children }) {
  const { isAuthenticated, user } = useAuthStore();
  if (!isAuthenticated || user?.role !== 'admin') {
    return <Navigate to="/login" replace />;
  }
  return children;
}

export default function App() {
  const loadUser = useAuthStore((s) => s.loadUser);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    loadUser().finally(() => setInitializing(false));
  }, []);

  if (initializing) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-accent/30 border-t-accent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <BrowserRouter>
        <SkipLink targetId="main-content" />
        <LiveRegions />
        <ScrollToTop />
        <AuthModal />
        <SignupBar />
        <Routes>
          {/* Auth Pages (no layout) */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/verify-email/:token" element={<VerifyEmailPage />} />

          {/* Customer Routes */}
          <Route element={<CustomerLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/shop" element={<ShopPage />} />
            <Route path="/product/:slug" element={<ProductDetailPage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/wishlist" element={<WishlistPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/order-confirmation/:orderId" element={<OrderConfirmationPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/profile/orders" element={<ProfilePage />} />
            <Route path="/profile/addresses" element={<ProfilePage />} />
            <Route path="/profile/settings" element={<ProfilePage />} />
            <Route path="/about" element={<AboutPage />} />
          </Route>

          {/* Admin Routes */}
          <Route
            path="/admin"
            element={
              <AdminRouteGuard>
                <AdminLayout />
              </AdminRouteGuard>
            }
          >
            <Route index element={<AdminDashboard />} />
            <Route path="products" element={<AdminProductsPage />} />
            <Route path="orders" element={<AdminOrdersPage />} />
            <Route path="customers" element={<AdminCustomersPage />} />
            <Route path="inventory" element={<AdminInventoryPage />} />
            <Route path="coupons" element={<AdminCouponsPage />} />
            <Route path="analytics" element={<AdminAnalyticsPage />} />
            <Route path="settings" element={<AdminSettingsPage />} />
          </Route>

          {/* 404 */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  );
}


