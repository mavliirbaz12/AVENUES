import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import CartDrawer from '@/components/features/CartDrawer';
import ToastContainer from '@/components/ui/ToastContainer';
import { SkipLink, LiveRegions } from '@/lib/accessibility';

export default function CustomerLayout() {
  return (
    <div className="min-h-screen flex flex-col">
      <SkipLink targetId="main-content" />
      <LiveRegions />
      <Navbar />
      <main id="main-content" className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <CartDrawer />
      <ToastContainer />
    </div>
  );
}
