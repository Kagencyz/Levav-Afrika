import { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import NotificationBell from './NotificationBell';

const navLinks = [
  { label: 'Home', path: '/' },
  { label: 'Talent', path: '/talent' },
  { label: 'Employers', path: '/employers' },
  { label: 'Opportunities', path: '/opportunities' },
  { label: 'QuickWork', path: '/quickwork' },
  { label: 'Impact', path: '/impact' },
  { label: 'Learn', path: '/learn' },
  { label: 'About', path: '/about' },
];

const championLink = { label: 'Content Studio', path: '/content-studio' };

export default function Navbar() {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();
  const menuTriggerRef = useRef<HTMLButtonElement>(null);

  /* Lock body scroll when mobile menu is open */
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileOpen]);

  /* Close mobile menu on route change */
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  /* Return focus to trigger button when menu closes */
  useEffect(() => {
    if (!mobileOpen && menuTriggerRef.current) {
      menuTriggerRef.current.focus();
    }
  }, [mobileOpen]);

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 h-[72px] glass-nav border-b border-white/[0.08]">
        <div className="mx-auto flex h-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <span className="text-xl font-bold text-[#C6FF34] tracking-tight font-display">
              Levav&#8482;
            </span>
            <span className="hidden sm:inline text-sm font-medium text-[#A0A0A0] font-body">
              Talent Afrika
            </span>
          </Link>

          {/* Desktop Nav Links — hidden on mobile, flex on md+ */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const isActive = link.path === '/'
                ? location.pathname === '/'
                : location.pathname.startsWith(link.path);
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`relative px-3 py-2 text-sm font-medium transition-colors duration-200 rounded-md font-body ${
                    isActive
                      ? 'text-[#C6FF34]'
                      : 'text-[#A0A0A0] hover:text-white'
                  }`}
                >
                  {link.label}
                  {isActive && (
                    <motion.div
                      layoutId="navbar-indicator"
                      className="absolute bottom-0 left-3 right-3 h-[2px] bg-[#C6FF34] rounded-full"
                      transition={{
                        type: 'spring',
                        stiffness: 500,
                        damping: 35,
                      }}
                    />
                  )}
                </Link>
              );
            })}
            {user?.role === 'champion' && (
              <Link
                to={championLink.path}
                className={`relative px-3 py-2 text-sm font-medium transition-colors duration-200 rounded-md font-body ${
                  location.pathname.startsWith(championLink.path)
                    ? 'text-[#C6FF34]'
                    : 'text-[#A0A0A0] hover:text-white'
                }`}
              >
                {championLink.label}
                {location.pathname.startsWith(championLink.path) && (
                  <motion.div
                    layoutId="navbar-indicator"
                    className="absolute bottom-0 left-3 right-3 h-[2px] bg-[#C6FF34] rounded-full"
                    transition={{
                      type: 'spring',
                      stiffness: 500,
                      damping: 35,
                    }}
                  />
                )}
              </Link>
            )}
            {user?.role === 'admin' && (
              <Link
                to="/admin"
                className={`relative px-3 py-2 text-sm font-medium transition-colors duration-200 rounded-md font-body ${
                  location.pathname.startsWith('/admin')
                    ? 'text-[#C6FF34]'
                    : 'text-[#A0A0A0] hover:text-white'
                }`}
              >
                Admin
                {location.pathname.startsWith('/admin') && (
                  <motion.div
                    layoutId="navbar-indicator"
                    className="absolute bottom-0 left-3 right-3 h-[2px] bg-[#C6FF34] rounded-full"
                    transition={{
                      type: 'spring',
                      stiffness: 500,
                      damping: 35,
                    }}
                  />
                )}
              </Link>
            )}
          </div>

          {/* Right Side: Bell + Auth — hidden on mobile, flex on md+ */}
          <div className="hidden md:flex items-center gap-3">
            <NotificationBell />
            {isAuthenticated && user ? (
              <div className="flex items-center gap-3">
                <Link
                  to="/dashboard"
                  className="flex items-center gap-2 text-sm font-medium text-[#A0A0A0] hover:text-white transition-colors font-body"
                >
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#C6FF34] to-[#7E3BED] flex items-center justify-center text-xs font-bold text-black">
                    {user.firstName?.[0]}{user.lastName?.[0]}
                  </div>
                  <span>{user.firstName}</span>
                </Link>
                <button
                  onClick={logout}
                  className="text-sm font-medium text-[#A0A0A0] hover:text-white transition-colors font-body"
                >
                  Log Out
                </button>
              </div>
            ) : (
              <>
                <Link
                  to="/auth"
                  className="text-sm font-medium text-[#A0A0A0] hover:text-white transition-colors font-body"
                >
                  Log In
                </Link>
                <Link
                  to="/onboarding"
                  className="btn-lime text-sm font-body"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>

          {/* Mobile: Hamburger only — visible on mobile only */}
          <div className="flex md:hidden items-center">
            <button
              ref={menuTriggerRef}
              className="flex items-center justify-center w-11 h-11 -mr-1.5 text-white rounded-xl active:bg-white/[0.06] transition-colors touch-manipulation"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileOpen}
              aria-controls="mobile-menu"
            >
              {mobileOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            id="mobile-menu"
            role="dialog"
            aria-modal="true"
            aria-label="Navigation menu"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[60] bg-black/90 backdrop-blur-2xl [backdrop-filter:blur(32px)_saturate(180%)] overflow-y-auto md:hidden"
          >
            <div className="flex flex-col items-center min-h-full gap-6 pt-[88px] pb-28">
              {/* Notification Bell in mobile menu */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ delay: 0, duration: 0.3 }}
                className="mb-2"
              >
                <NotificationBell />
              </motion.div>

              {navLinks.map((link, i) => {
                const isActive = link.path === '/'
                  ? location.pathname === '/'
                  : location.pathname.startsWith(link.path);
                return (
                  <motion.div
                    key={link.path}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{
                      delay: i * 0.05,
                      duration: 0.3,
                      ease: [0.19, 1, 0.22, 1],
                    }}
                  >
                    <Link
                      to={link.path}
                      onClick={() => setMobileOpen(false)}
                      className={`block py-2 px-4 text-xl sm:text-2xl font-semibold transition-colors font-display break-words text-center ${
                        isActive
                          ? 'text-[#C6FF34]'
                          : 'text-white hover:text-[#C6FF34]'
                      }`}
                    >
                      {link.label}
                    </Link>
                  </motion.div>
                );
              })}

              {/* Mobile Auth */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ delay: 0.35, duration: 0.3 }}
                className="flex flex-col items-center gap-4 mt-4"
              >
                {isAuthenticated ? (
                  <>
                    {user?.role === 'admin' && (
                      <Link
                        to="/admin"
                        onClick={() => setMobileOpen(false)}
                        className="text-lg font-medium text-[#A0A0A0] hover:text-white font-body"
                      >
                        Admin
                      </Link>
                    )}
                    <Link
                      to="/dashboard"
                      onClick={() => setMobileOpen(false)}
                      className="text-lg font-medium text-[#A0A0A0] hover:text-white font-body"
                    >
                      Dashboard
                    </Link>
                    <button
                      onClick={() => {
                        setMobileOpen(false);
                        logout();
                      }}
                      className="text-lg font-medium text-[#A0A0A0] hover:text-white font-body"
                    >
                      Log Out
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      to="/auth"
                      onClick={() => setMobileOpen(false)}
                      className="text-lg font-medium text-[#A0A0A0] hover:text-white font-body"
                    >
                      Log In
                    </Link>
                    <Link
                      to="/onboarding"
                      onClick={() => setMobileOpen(false)}
                      className="btn-lime font-body"
                    >
                      Get Started
                    </Link>
                  </>
                )}
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
           