import { Link, useLocation } from 'react-router';
import { Home, Briefcase, Users, MessageSquare, User, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

const navItems = [
  { icon: Home, label: 'Home', to: '/' },
  { icon: Briefcase, label: 'Jobs', to: '/opportunities' },
  { icon: Zap, label: 'QuickWork', to: '/quickwork' },
  { icon: Users, label: 'Talent', to: '/talent' },
  { icon: MessageSquare, label: 'Chat', to: '/messages' },
  { icon: User, label: 'Profile', to: '/dashboard' },
];

export default function MobileBottomNav() {
  const location = useLocation();

  return (
    <nav
      aria-label="Mobile navigation"
      className="fixed bottom-0 left-0 right-0 z-50 bg-[#0A0A0A]/95 backdrop-blur-xl border-t border-white/[0.06] md:hidden"
    >
      <div className="flex items-center justify-around py-2 pb-5">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.to === '/'
              ? location.pathname === '/'
              : location.pathname === item.to || location.pathname.startsWith(item.to + '/');

          return (
            <Link
              key={item.to}
              to={item.to}
              className="flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl active:scale-95 transition-transform"
            >
              <motion.div
                whileTap={{ scale: 0.85 }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                className="flex flex-col items-center gap-0.5 relative"
              >
                <Icon
                  size={20}
                  strokeWidth={isActive ? 2.5 : 1.5}
                  className={
                    isActive ? 'text-[#C6FF34]' : 'text-white/40'
                  }
                />
                <span
                  className={`text-[10px] font-medium ${
                    isActive ? 'text-[#C6FF34]' : 'text-white/40'
                  }`}
                >
                  {item.label}
                </span>
                {isActive && (
                  <motion.div
                    layoutId="bottom-nav-indicator"
                    className="absolute -bottom-1 w-1 h-1 bg-[#C6FF34] rounded-full"
                    transition={{
                      type: 'spring',
                      stiffness: 500,
                      damping: 35,
                    }}
                  />
                )}
              </motion.div>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
