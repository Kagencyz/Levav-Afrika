import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell,
  CheckCircle,
  Briefcase,
  MessageSquare,
  Star,
  AlertCircle,
  CheckCheck,
} from 'lucide-react';
import { trpc } from '@/providers/trpc';
import { useAuth } from '@/hooks/useAuth';
import { safeJSONParse } from '@/lib/safeJSON';

/* ─────────── icon map by notification type ─────────── */

const iconMap: Record<string, React.ReactNode> = {
  job: <Briefcase size={18} className="text-[#C6FF34]" />,
  message: <MessageSquare size={18} className="text-[#7E3BED]" />,
  review: <Star size={18} className="text-[#FFB800]" />,
  application: <CheckCircle size={18} className="text-[#00D084]" />,
  alert: <AlertCircle size={18} className="text-[#FF4D4D]" />,
  success: <CheckCircle size={18} className="text-[#00D084]" />,
};

const defaultIcon = <Bell size={18} className="text-[#A0A0A0]" />;

/* ─────────── time-ago helper ─────────── */

function timeAgo(date: Date | string | null): string {
  if (!date) return 'just now';
  const now = Date.now();
  const then = new Date(date).getTime();
  const seconds = Math.floor((now - then) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return `${Math.floor(days / 30)}mo ago`;
}

/* ─────────── mock data for demo ─────────── */

const MOCK_NOTIFICATIONS = [
  {
    id: 1,
    userId: 1,
    type: 'job',
    title: 'New job match',
    message: 'A new Frontend Developer role at TechCorp matches your profile.',
    read: false,
    link: '/opportunities',
    createdAt: new Date(Date.now() - 1000 * 60 * 5),
  },
  {
    id: 2,
    userId: 1,
    type: 'message',
    title: 'New message',
    message: 'Sarah from Talent Afrika sent you a message about your application.',
    read: false,
    link: '/messages',
    createdAt: new Date(Date.now() - 1000 * 60 * 45),
  },
  {
    id: 3,
    userId: 1,
    type: 'application',
    title: 'Application shortlisted',
    message: 'Your application for UX Designer at StartupXYZ has been shortlisted!',
    read: false,
    link: '/dashboard',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 3),
  },
  {
    id: 4,
    userId: 1,
    type: 'review',
    title: 'New review received',
    message: 'You received a 5-star review from your recent project client.',
    read: true,
    link: '/dashboard',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24),
  },
  {
    id: 5,
    userId: 1,
    type: 'alert',
    title: 'Profile reminder',
    message: 'Complete your profile to increase visibility to employers by 70%.',
    read: true,
    link: '/onboarding',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48),
  },
];

/* ─────────── component ─────────── */

export default function NotificationBell() {
  const { isAuthenticated } = useAuth();
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  /* Read notifications from localStorage — safely with try-catch */
  const localNotifications = safeJSONParse<any[]>('notifications', []);
  const localUnreadCount = localNotifications.filter((n: any) => !n.read).length;

  /* tRPC queries & mutations */
  const { data: unreadCount, refetch: refetchCount } =
    trpc.notification.unreadCount.useQuery(undefined, {
      enabled: isAuthenticated,
      refetchInterval: 30_000,
    });

  const { data: apiNotifications, refetch: refetchList } =
    trpc.notification.list.useQuery(undefined, {
      enabled: isAuthenticated,
    });

  const markRead = trpc.notification.markRead.useMutation({
    onSuccess: () => {
      refetchCount();
      refetchList();
    },
  });

  const markAllRead = trpc.notification.markAllRead.useMutation({
    onSuccess: () => {
      refetchCount();
      refetchList();
    },
  });

  /* Merge localStorage notifications with API/mock data */
  const baseNotifications =
    isAuthenticated && apiNotifications && apiNotifications.length > 0
      ? apiNotifications
      : !isAuthenticated
        ? MOCK_NOTIFICATIONS
        : apiNotifications ?? MOCK_NOTIFICATIONS;

  const notifications = [...localNotifications, ...baseNotifications];

  const count = isAuthenticated
    ? (unreadCount ?? 0) + localUnreadCount
    : 3 + localUnreadCount; // 3 unread in mock

  /* Close dropdown on outside click */
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  /* Close dropdown on Escape */
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open]);

  return (
    <div className="relative" ref={dropdownRef}>
      {/* ── Bell icon with badge ── */}
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 text-[#A0A0A0] hover:text-white transition-colors rounded-lg hover:bg-white/[0.06]"
        aria-label="Notifications"
      >
        <Bell size={20} />
        <AnimatePresence>
          {count > 0 && (
            <motion.span
              key="badge"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              transition={{ type: 'spring', stiffness: 500, damping: 25 }}
              className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center px-1 text-[10px] font-bold text-white bg-[#FF4D4D] rounded-full border-2 border-black"
            >
              {count > 99 ? '99+' : count}
            </motion.span>
          )}
        </AnimatePresence>
      </button>

      {/* ── Dropdown panel ── */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ duration: 0.15, ease: [0.19, 1, 0.22, 1] }}
            className="absolute right-0 top-full mt-3 w-[380px] max-w-[calc(100vw-2rem)] bg-[#0A0A0A] border border-white/[0.08] rounded-2xl shadow-2xl shadow-black/40 overflow-hidden z-[100]"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
              <h3 className="text-sm font-semibold text-white font-body">
                Notifications
              </h3>
              {count > 0 && isAuthenticated && (
                <button
                  onClick={() => markAllRead.mutate()}
                  className="flex items-center gap-1 text-xs font-medium text-[#A0A0A0] hover:text-[#C6FF34] transition-colors font-body"
                >
                  <CheckCheck size={14} />
                  Mark all read
                </button>
              )}
            </div>

            {/* Notification list */}
            <div className="max-h-[400px] overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 gap-3">
                  <Bell size={32} className="text-[#333]" />
                  <p className="text-sm text-[#666] font-body">
                    No notifications yet
                  </p>
                </div>
              ) : (
                notifications.map((n) => (
                  <div
                    key={n.id}
                    onClick={() => {
                      if (isAuthenticated && !n.read) {
                        markRead.mutate({ id: n.id });
                      }
                    }}
                    className={`group flex items-start gap-3 px-5 py-3.5 border-b border-white/[0.04] cursor-pointer transition-colors hover:bg-white/[0.03] ${
                      !n.read ? 'bg-white/[0.015]' : ''
                    }`}
                  >
                    {/* Icon */}
                    <div className="mt-0.5 shrink-0 w-8 h-8 rounded-lg bg-white/[0.06] flex items-center justify-center">
                      {iconMap[n.type] ?? defaultIcon}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p
                          className={`text-sm font-medium font-body leading-snug ${
                            !n.read ? 'text-white' : 'text-[#A0A0A0]'
                          }`}
                        >
                          {n.title}
                        </p>
                        {!n.read && (
                          <span className="mt-1.5 shrink-0 w-2 h-2 rounded-full bg-[#C6FF34]" />
                        )}
                      </div>
                      <p className="text-xs text-[#666] font-body leading-relaxed mt-0.5 line-clamp-2">
                        {n.message}
                      </p>
                      <p className="text-[10px] text-[#555] font-body mt-1">
                        {timeAgo(n.createdAt)}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            <div className="px-5 py-3 border-t border-white/[0.06]">
              <Link
                to="/notifications"
                onClick={() => setOpen(false)}
                className="block text-center text-xs font-medium text-[#A0A0A0] hover:text-[#C6FF34] transition-colors font-body"
              >
                View all notifications
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
