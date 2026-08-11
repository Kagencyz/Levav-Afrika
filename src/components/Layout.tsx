import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router';
import Navbar from './Navbar';
import Footer from './Footer';
import ParticleField from './ParticleField';
import MobileBottomNav from './MobileBottomNav';
import OfflineBanner from './OfflineBanner';
import SyncQueue from './SyncQueue';
import RouteLoadingBar from './RouteLoadingBar';

export default function Layout() {
  const location = useLocation();

  /* Reset scroll position on page change */
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <div className="relative min-h-screen bg-midnight font-body">
      {/* Slim top progress bar on every route change. Route transitions here
          are plain synchronous renders (no page-transition animation
          wrapper — see git history for why that was removed), and some
          pages are heavy enough to take a couple of seconds to mount,
          longer on an underpowered phone. With no feedback during that
          gap the app looked frozen; this makes navigation always visibly
          "doing something" regardless of how long the render takes. */}
      <RouteLoadingBar />

      {/* Ambient particle background */}
      <ParticleField count={35} density="low" />

      {/* Offline indicator banner */}
      <OfflineBanner />

      {/* Fixed navbar */}
      <Navbar />

      <main className="relative z-10 pt-[72px] pb-20 md:pb-0 flex-1 min-h-0 pb-safe">
        <Outlet />
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
