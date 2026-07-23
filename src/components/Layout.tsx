import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router';
import { AnimatePresence } from 'framer-motion';
import Navbar from './Navbar';
import Footer from './Footer';
import ParticleField from './ParticleField';
import MobileBottomNav from './MobileBottomNav';
import OfflineBanner from './OfflineBanner';
import SyncQueue from './SyncQueue';

export default function Layout() {
  const location = useLocation();

  /* Reset scroll position on page change */
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <div className="relative min-h-screen bg-midnight font-body">
      {/* Ambient particle background */}
      <ParticleField count={35} density="low" />

      {/* Offline indicator banner */}
      <OfflineBanner />

      {/* Fixed navbar */}
      <Navbar />

      {/* Main content with navbar offset + bottom padding for mobile nav */}
      <main className="relative z-10 pt-[72px] pb-20 md:pb-0 flex-1 min-h-0 pb-safe">
        <AnimatePresence mode="wait">
          <Outlet key={location.pathname} />
        </AnimatePresence>
      </main>

      {/* Footer — extra bottom padding on mobile to avoid bottom nav overlap */}
      <div className="pb-16 md:pb-0">
        <Footer />
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav />

      {/* Floating sync queue panel */}
      <SyncQueue />
    </div>
  );
}
