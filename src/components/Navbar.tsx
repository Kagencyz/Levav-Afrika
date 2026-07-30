import { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, ChevronDown, LayoutDashboard, Sparkles, ShieldCheck, LogOut } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import NotificationBell from './NotificationBell';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

/**
 * Nav is grouped by audience rather than a flat feature list — 8 top-level
 * links collapsed to 4 (Home, For Talent, For Employers, About). Role-only
 * items (Content Studio, Admin) moved out of the shared public nav into the
 * signed-in user's account menu, since they're irrelevant to everyone else.
 * Nothing was removed — every destination below is still one click away,
 * just grouped by who it's for.
 */
const talentLinks = [
  { label: 'Opportunities', path: '/opportunities' },
  { label: 'QuickWork™', path: '/quickwork' },
  { label: 'Learn', path: '/learn' },
  { label: 'Levav Impact™', path: '/impact' },
];

const employerLinks = [
  { label: 'For Employers', path: '/employers' },
  { label: 'Browse Talent', path: '/talent' },
];

function isGroupActive(pathname: string, links: { path: string }[]) {
  return links.some((l) => pathname.startsWith(l.path));
}

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();
  const menuTriggerRef = useRef<HTMLButtonElement>(null);

  const isHome = location.pathname === '/';
  const isTalentGroupActive = isGroupActive(location.pathname, talentLinks);
  const isEmployerGroupActive = isGroupActive(location.pathname, employerLinks);
  const isAboutActive = location.pathname.startsWith('/about');

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

  const navLinkClass = (active: boolean) =>
    `relative px-3 py-2 text-sm font-medium transition-colors duration-200 rounded-md font-body ${
      active ? 'text-[#C6FF34]' : 'text-[#A0A0A0] hover:text-white'
    }`;

  const NavIndicator = () => (
    <motion.div
      layoutId="navbar-indicator"
      className="absolute bottom-0 left-3 right-3 h-[2px] bg-[#C6FF34] rounded-full"
      transition={{ type: 'spring', stiffness: 500, damping: 35 }}
    />
  );

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
            <Link to="/" className={navLinkClass(isHome)}>
              Home
              {isHome && <NavIndicator />}
            </Link>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className={`${navLinkClass(isTalentGroupActive)} inline-flex items-center gap-1 data-[state=open]:text-white`}
                >
                  For Talent
                  <ChevronDown size={14} className="transition-transform data-[state=open]:rotate-180" />
                  {isTalentGroupActive && <NavIndicator />}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="start"
                className="glass-strong border-white/[0.1] min-w-[190px] p-1.5"
              >
                {talentLinks.map((link) => (
                  <DropdownMenuItem key={link.path} asChild>
                    <Link
                      to={link.path}
                      className={`font-body cursor-pointer ${
                        location.pathname.startsWith(link.path) ? 'text-[#C6FF34]' : 'text-white/80'
                      }`}
                    >
                      {link.label}
                    </Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className={`${navLinkClass(isEmployerGroupActive)} inline-flex items-center gap-1 data-[state=open]:text-white`}
                >
                  For Employers
                  <ChevronDown size={14} className="transition-transform data-[state=open]:rotate-180" />
                  {isEmployerGroupActive && <NavIndicator />}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="start"
                className="glass-strong border-white/[0.1] min-w-[190px] p-1.5"
              >
                {employerLinks.map((link) => (
                  <DropdownMenuItem key={link.path} asChild>
                    <Link
                      to={link.path}
                      className={`font-body cursor-pointer ${
                        location.pathname.startsWith(link.path) ? 'text-[#C6FF34]' : 'text-white/80'
                      }`}
                    >
                      {link.label}
                    </Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <Link to="/about" className={navLinkClass(isAboutActive)}>
              About
              {isAboutActive && <NavIndicator />}
            </Link>
          </div>

          {/* Right Side: Bell + Auth — hidden on mobile, flex on md+ */}
          <div className="hidden md:flex items-center gap-3">
            <NotificationBell />
            {isAuthenticated && user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-2 text-sm font-medium text-[#A0A0A0] hover:text-white transition-colors font-body rounded-full">
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#C6FF34] to-[#7E3BED] flex items-center justify-center text-xs font-bold text-black">
                      {user.firstName?.[0]}{user.lastName?.[0]}
                    </div>
                    <span>{user.firstName}</span>
                    <ChevronDown size={14} />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="glass-strong border-white/[0.1] min-w-[200px] p-1.5">
                  <DropdownMenuItem asChild>
                    <Link to="/dashboard" className="font-body cursor-pointer text-white/80">
                      <LayoutDashboard size={15} className="mr-1" />
                      Dashboard
                    </Link>
                  </DropdownMenuItem>
                  {user.role === 'champion' && (
                    <DropdownMenuItem asChild>
                      <Link to="/content-studio" className="font-body cursor-pointer text-white/80">
                        <Sparkles size={15} className="mr-1" />
                        Content Studio
                      </Link>
                    </DropdownMenuItem>
                  )}
                  {user.role === 'admin' && (
                    <DropdownMenuItem asChild>
                      <Link to="/admin" className="font-body cursor-pointer text-white/80">
                        <ShieldCheck size={15} className="mr-1" />
                        Admin
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator className="bg-white/[0.08]" />
                  <DropdownMenuItem
                    onClick={() => {
                      logout();
                      navigate('/');
                    }}
                    className="font-body cursor-pointer text-white/80"
                  >
                    <LogOut size={15} className="mr-1" />
                    Log Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Link
                  to="/auth"
                  className="text-sm font-medium text-[#A0A0A0] hover:text-white transition-colors font-body"
                >
                  Log In
                </Link>
                <Link
                  to="/auth?mode=signup"
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
            <div className="flex flex-col items-center min-h-full gap-2 pt-[88px] pb-28 px-6">
              {/* Notification Bell in mobile menu */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ delay: 0, duration: 0.3 }}
                className="mb-4"
              >
                <NotificationBell />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ delay: 0.03, duration: 0.3, ease: [0.19, 1, 0.22, 1] }}
              >
                <Link
                  to="/"
                  onClick={() => setMobileOpen(false)}
                  className={`block py-2 px-4 text-xl sm:text-2xl font-semibold transition-colors font-display break-words text-center ${
                    isHome ? 'text-[#C6FF34]' : 'text-white hover:text-[#C6FF34]'
                  }`}
                >
                  Home
                </Link>
              </motion.div>

              {/* For Talent group */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ delay: 0.08, duration: 0.3 }}
                className="w-full max-w-xs mt-4"
              >
                <p className="text-center text-[11px] font-semibold uppercase tracking-[0.2em] text-white/30 mb-2">
                  For Talent
                </p>
                <div className="flex flex-col items-center gap-1">
                  {talentLinks.map((link) => {
                    const active = location.pathname.startsWith(link.path);
                    return (
                      <Link
                        key={link.path}
                        to={link.path}
                        onClick={() => setMobileOpen(false)}
                        className={`block py-1.5 px-4 text-lg font-semibold transition-colors font-display text-center ${
                          active ? 'text-[#C6FF34]' : 'text-white hover:text-[#C6FF34]'
                        }`}
                      >
                        {link.label}
                      </Link>
                    );
                  })}
                </div>
              </motion.div>

              {/* For Employers group */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ delay: 0.13, duration: 0.3 }}
                className="w-full max-w-xs mt-4"
              >
                <p className="text-center text-[11px] font-semibold uppercase tracking-[0.2em] text-white/30 mb-2">
                  For Employers
                </p>
                <div className="flex flex-col items-center gap-1">
                  {employerLinks.map((link) => {
                    const active = location.pathname.startsWith(link.path);
                    return (
                      <Link
                        key={link.path}
                        to={link.path}
                        onClick={() => setMobileOpen(false)}
                        className={`block py-1.5 px-4 text-lg font-semibold transition-colors font-display text-center ${
                          active ? 'text-[#C6FF34]' : 'text-white hover:text-[#C6FF34]'
                        }`}
                      >
                        {link.label}
                      </Link>
                    );
                  })}
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ delay: 0.18, duration: 0.3 }}
                className="mt-4"
              >
                <Link
                  to="/about"
                  onClick={() => setMobileOpen(false)}
                  className={`block py-2 px-4 text-xl font-semibold transition-colors font-display text-center ${
                    isAboutActive ? 'text-[#C6FF34]' : 'text-white hover:text-[#C6FF34]'
                  }`}
                >
                  About
                </Link>
              </motion.div>

              {/* Mobile Auth */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ delay: 0.24, duration: 0.3 }}
                className="flex flex-col items-center gap-4 mt-6 pt-6 border-t border-white/[0.08] w-full max-w-xs"
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
                    {user?.role === 'champion' && (
                      <Link
                        to="/content-studio"
                        onClick={() => setMobileOpen(false)}
                        className="text-lg font-medium text-[#A0A0A0] hover:text-white font-body"
                      >
                        Content Studio
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
                        navigate('/');
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
                      to="/auth?mode=signup"
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
