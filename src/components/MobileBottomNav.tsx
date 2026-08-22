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
      className="fixed bottom-0 left-0 right-0 z-50 glass-nav border-t border-border md:hidden"
    >
      <div className="flex items-center justify-around pt-2 bottom-nav-safe-pad">
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
              className="relative flex flex-col items-center justify-center gap-0.5 w-14 h-12 rounded-2xl active:scale-95 transition-transform touch-manipulation"
            >
              {isActive && (
                <motion.div
                  layoutId="bottom-nav-indicator"
                  className="absolute inset-0.5 rounded-2xl bg-[#C6FF34]/[0.12] border border-[#C6FF34]/20"
                  transition={{
                    type: 'spring',
                    stiffness: 500,
                    damping: 35,
                  }}
                />
              )}
              <motion.div
                whileTap={{ scale: 0.85 }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                className="flex flex-col items-center gap-0.5 relative"
              >
                <Icon
                  size={20}
                  strokeWidth={isActive ? 2.5 : 1.5}
                  className={
                    isActive ? 'text-[#78a600] dark:text-[#C6FF34]' : 'text-muted-foreground'
                  }
                />
                <span
                  className={`text-[10px] font-medium ${
                    isActive ? 'text-[#78a600] dark:text-[#C6FF34]' : 'text-muted-foreground'
                  }`}
                >
                  {item.label}
                </span>
              </motion.div>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
