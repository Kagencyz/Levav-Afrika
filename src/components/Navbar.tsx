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
  const [talentMenuOpen, setTalentMenuOpen] = useState(false);
  const [employerMenuOpen, setEmployerMenuOpen] = useState(false);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
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

  // Fully controlled dropdowns (rather than Radix's own onSelect-driven
  // open/close) -- under concurrent rendering, closing the menu and firing
  // navigate() from the same Radix-internal event occasionally raced: the
  // URL updated but the route content and the menu's own closed state never
  // committed, leaving the previous page stuck on screen until a reload.
  // Closing the menu as its own explicit state update, then navigating on
  // the next tick once that's committed, removes the race entirely.
  const closeAllMenus = () => {
    setTalentMenuOpen(false);
    setEmployerMenuOpen(false);
    setAccountMenuOpen(false);
  };

  const handleNavigate = (path: string) => {
    closeAllMenus();
    setTimeout(() => navigate(path), 0);
  };

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

            <DropdownMenu open={talentMenuOpen} onOpenChange={setTalentMenuOpen}>
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
                  <DropdownMenuItem
                    key={link.path}
                    onSelect={() => handleNavigate(link.path)}
                    className={`font-body cursor-pointer ${
                      location.pathname.startsWith(link.path) ? 'text-[#C6FF34]' : 'text-white/80'
                    }`}
                  >
                    {link.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu open={employerMenuOpen} onOpenChange={setEmployerMenuOpen}>
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
                  <DropdownMenuItem
                    key={link.path}
                    onSelect={() => handleNavigate(link.path)}
                    className={`font-body cursor-pointer ${
                      location.pathname.startsWith(link.path) ? 'text-[#C6FF34]' : 'text-white/80'
                    }`}
                  >
                    {link.label}
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
              <DropdownMenu open={accountMenuOpen} onOpenChange={setAccountMenuOpen}>
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
                  <DropdownMenuItem onSelect={() => handleNavigate('/dashboard')} className="font-body cursor-pointer text-white/80">
                    <LayoutDashboard size={15} className="mr-1" />
                    Dashboard
                  </DropdownMenuItem>
                  {user.role === 'champion' && (
                    <DropdownMenuItem onSelect={() => handleNavigate('/content-studio')} className="font-body cursor-pointer text-white/80">
                      <Sparkles size={15} className="mr-1" />
                      Content Studio
                    </DropdownMenuItem>
                  )}
                  {user.role === 'admin' && (
                    <DropdownMenuItem onSelect={() => handleNavigate('/admin')} className="font-body cursor-pointer text-white/80">
                      <ShieldCheck size={15} className="mr-1" />
                      Admin
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator className="bg-white/[0.08]" />
                  <DropdownMenuItem
                    onSelect={() => {
                      closeAllMenus();
                      logout();
                      setTimeout(() => navigate('/'), 0);
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
            <div className="flex flex-col min-h-full pt-[88px] pb-8">
              {/* Notification bell — small, top-right utility icon rather than a full row */}
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ delay: 0, duration: 0.3 }}
                className="flex justify-end px-6 mb-2"
              >
                <NotificationBell />
              </motion.div>

              {/* Link list — left-aligned rows with dividers */}
              <div className="flex-1 px-6">
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ delay: 0.03, duration: 0.3, ease: [0.19, 1, 0.22, 1] }}
                >
                  <Link
                    to="/"
                    onClick={() => setMobileOpen(false)}
                    className={`block py-4 text-2xl font-semibold transition-colors font-display border-b border-white/[0.1] ${
                      isHome ? 'text-[#C6FF34]' : 'text-white active:text-[#C6FF34]'
                    }`}
                  >
                    Home
                  </Link>
                </motion.div>

                {/* For Talent group */}
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ delay: 0.08, duration: 0.3 }}
                >
                  <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/30 pt-5 pb-1.5">
                    For Talent
                  </p>
                  {talentLinks.map((link) => {
                    const active = location.pathname.startsWith(link.path);
                    return (
                      <Link
                        key={link.path}
                        to={link.path}
                        onClick={() => setMobileOpen(false)}
                        className={`block py-3 text-xl font-medium transition-colors font-display border-b border-white/[0.1] ${
                          active ? 'text-[#C6FF34]' : 'text-white active:text-[#C6FF34]'
                        }`}
                      >
                        {link.label}
                      </Link>
                    );
                  })}
                </motion.div>

                {/* For Employers group */}
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ delay: 0.13, duration: 0.3 }}
                >
                  <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/30 pt-5 pb-1.5">
                    For Employers
                  </p>
                  {employerLinks.map((link) => {
                    const active = location.pathname.startsWith(link.path);
                    return (
                      <Link
                        key={link.path}
                        to={link.path}
                        onClick={() => setMobileOpen(false)}
                        className={`block py-3 text-xl font-medium transition-colors font-display border-b border-white/[0.1] ${
                          active ? 'text-[#C6FF34]' : 'text-white active:text-[#C6FF34]'
                        }`}
                      >
                        {link.label}
                      </Link>
                    );
                  })}
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ delay: 0.18, duration: 0.3 }}
                >
                  <Link
                    to="/about"
                    onClick={() => setMobileOpen(false)}
                    className={`block py-4 mt-5 text-2xl font-semibold transition-colors font-display border-b border-white/[0.1] ${
                      isAboutActive ? 'text-[#C6FF34]' : 'text-white active:text-[#C6FF34]'
                    }`}
                  >
                    About
                  </Link>
                </motion.div>

                {isAuthenticated && (user?.role === 'admin' || user?.role === 'champion') && (
                  <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ delay: 0.21, duration: 0.3 }}
                  >
                    {user?.role === 'admin' && (
                      <Link
                        to="/admin"
                        onClick={() => setMobileOpen(false)}
                        className="block py-3 text-lg font-medium text-white/60 active:text-[#C6FF34] font-body border-b border-white/[0.1]"
                      >
                        Admin
                      </Link>
                    )}
                    {user?.role === 'champion' && (
                      <Link
                        to="/content-studio"
                        onClick={() => setMobileOpen(false)}
                        className="block py-3 text-lg font-medium text-white/60 active:text-[#C6FF34] font-body border-b border-white/[0.1]"
                      >
                        Content Studio
                      </Link>
                    )}
                  </motion.div>
                )}
              </div>

              {/* Pinned bottom action — one secondary link, one primary button */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ delay: 0.26, duration: 0.3 }}
                className="px-6 pt-4 bottom-nav-safe-pad"
              >
                {isAuthenticated ? (
                  <>
                    <button
                      onClick={() => {
                        setMobileOpen(false);
                        logout();
                        navigate('/');
                      }}
                      className="block w-full text-center text-sm font-medium text-white/50 active:text-white font-body mb-3"
                    >
                      Log Out
                    </button>
                    <Link
                      to="/dashboard"
                      onClick={() => setMobileOpen(false)}
                      className="btn-lime block w-full text-center font-body py-4 text-base"
                    >
                      Dashboard
                    </Link>
                  </>
                ) : (
                  <>
                    <Link
                      to="/auth"
                      onClick={() => setMobileOpen(false)}
                      className="block w-full text-center text-sm font-medium text-white/50 active:text-white font-body mb-3"
                    >
                      Log In
                    </Link>
                    <Link
                      to="/auth?mode=signup"
                      onClick={() => setMobileOpen(false)}
                      className="btn-lime block w-full text-center font-body py-4 text-base"
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
