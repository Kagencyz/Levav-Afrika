import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle2,
  Clock,
  CircleDollarSign,
  ChevronDown,
  ChevronUp,
  FileText,
  Send,
  User,
  Building2,
  Calendar,
  Circle,
  ArrowLeft,
  Download,
  Upload,
  MessageSquare,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ─── Types ───────────────────────────────────────────────
interface Deliverable {
  id: string;
  name: string;
  fileUrl?: string;
  submittedAt?: string;
}

interface Milestone {
  id: string;
  name: string;
  description: string;
  status: 'pending' | 'active' | 'completed' | 'paid';
  dueDate: string;
  paymentAmount: number;
  deliverables: Deliverable[];
  completedAt?: string;
}

interface Activity {
  id: string;
  type: 'status_change' | 'deliverable' | 'payment' | 'message' | 'milestone';
  text: string;
  timestamp: string;
  actor: string;
}

interface Booking {
  id: string;
  projectTitle: string;
  status: 'Proposed' | 'Active' | 'Completed';
  talentName: string;
  talentAvatar?: string;
  employerName: string;
  totalBudget: number;
  startDate: string;
  endDate: string;
  terms: string;
  milestones: Milestone[];
  activities: Activity[];
  userRole: 'talent' | 'employer';
}

// ─── Mock Data ───────────────────────────────────────────
const MOCK_BOOKINGS: Booking[] = [
  {
    id: 'booking-1',
    projectTitle: 'Brand Identity & Website Redesign',
    status: 'Active',
    talentName: 'Maya Cohen',
    talentAvatar: '',
    employerName: 'TechFlow Israel',
    totalBudget: 25000,
    startDate: '2025-01-15',
    endDate: '2025-04-15',
    terms:
      'Payment terms: Net 14. All deliverables become client property upon final payment. Two revision rounds included per milestone. Additional revisions billed at hourly rate.',
    userRole: 'talent',
    milestones: [
      {
        id: 'm1',
        name: 'Brand Strategy & Research',
        description: 'Competitive analysis, brand positioning, and strategic direction',
        status: 'paid',
        dueDate: '2025-02-01',
        paymentAmount: 5000,
        completedAt: '2025-02-01',
        deliverables: [
          {
            id: 'd1',
            name: 'Brand_Research_Report.pdf',
            fileUrl: '#',
            submittedAt: '2025-01-30',
          },
        ],
      },
      {
        id: 'm2',
        name: 'Visual Identity System',
        description: 'Logo design, color palette, typography, brand guidelines',
        status: 'completed',
        dueDate: '2025-02-28',
        paymentAmount: 7500,
        completedAt: '2025-02-25',
        deliverables: [
          {
            id: 'd2',
            name: 'Logo_Package.ai',
            fileUrl: '#',
            submittedAt: '2025-02-24',
          },
          {
            id: 'd3',
            name: 'Brand_Guidelines.pdf',
            fileUrl: '#',
            submittedAt: '2025-02-25',
          },
        ],
      },
      {
        id: 'm3',
        name: 'Website Design',
        description: 'Homepage + 5 interior page designs in Figma',
        status: 'active',
        dueDate: '2025-03-25',
        paymentAmount: 7500,
        deliverables: [],
      },
      {
        id: 'm4',
        name: 'Development Handoff',
        description: 'Final assets, prototype, and developer documentation',
        status: 'pending',
        dueDate: '2025-04-10',
        paymentAmount: 5000,
        deliverables: [],
      },
    ],
    activities: [
      {
        id: 'a1',
        type: 'milestone',
        text: 'Milestone "Brand Strategy & Research" was marked complete',
        timestamp: '2025-02-01T14:30:00',
        actor: 'TechFlow Israel',
      },
      {
        id: 'a2',
        type: 'payment',
        text: 'Payment of ₪5,000 released for Brand Strategy & Research',
        timestamp: '2025-02-01T16:00:00',
        actor: 'TechFlow Israel',
      },
      {
        id: 'a3',
        type: 'deliverable',
        text: 'Submitted Brand_Research_Report.pdf',
        timestamp: '2025-01-30T10:00:00',
        actor: 'Maya Cohen',
      },
      {
        id: 'a4',
        type: 'deliverable',
        text: 'Submitted Logo_Package.ai and Brand_Guidelines.pdf',
        timestamp: '2025-02-25T11:30:00',
        actor: 'Maya Cohen',
      },
      {
        id: 'a5',
        type: 'milestone',
        text: 'Milestone "Visual Identity System" was marked complete',
        timestamp: '2025-02-25T15:00:00',
        actor: 'TechFlow Israel',
      },
      {
        id: 'a6',
        type: 'status_change',
        text: 'Milestone "Website Design" started',
        timestamp: '2025-02-26T09:00:00',
        actor: 'System',
      },
    ],
  },
  {
    id: 'booking-2',
    projectTitle: 'Mobile App UI/UX Design',
    status: 'Proposed',
    talentName: 'David Levi',
    talentAvatar: '',
    employerName: 'StartUp Nation',
    totalBudget: 18000,
    startDate: '2025-03-01',
    endDate: '2025-05-30',
    terms:
      '50% upfront, 50% on completion. All IP transfers upon final payment. Weekly check-in meetings required.',
    userRole: 'employer',
    milestones: [
      {
        id: 'm1',
        name: 'User Research & Wireframes',
        description: 'User interviews, journey maps, low-fidelity wireframes',
        status: 'pending',
        dueDate: '2025-03-20',
        paymentAmount: 4000,
        deliverables: [],
      },
      {
        id: 'm2',
        name: 'High-Fidelity UI Design',
        description: 'Complete UI screens, components, design system',
        status: 'pending',
        dueDate: '2025-04-20',
        paymentAmount: 8000,
        deliverables: [],
      },
      {
        id: 'm3',
        name: 'Prototyping & Handoff',
        description: 'Interactive prototype, developer handoff documentation',
        status: 'pending',
        dueDate: '2025-05-15',
        paymentAmount: 6000,
        deliverables: [],
      },
    ],
    activities: [
      {
        id: 'a1',
        type: 'status_change',
        text: 'Contract proposal sent to David Levi',
        timestamp: '2025-02-20T09:00:00',
        actor: 'StartUp Nation',
      },
      {
        id: 'a2',
        type: 'message',
        text: 'Looking forward to working together!',
        timestamp: '2025-02-20T09:05:00',
        actor: 'StartUp Nation',
      },
    ],
  },
  {
    id: 'booking-3',
    projectTitle: 'Marketing Campaign Creative',
    status: 'Completed',
    talentName: 'Noa Ben-Ari',
    talentAvatar: '',
    employerName: 'EcoVentures',
    totalBudget: 12000,
    startDate: '2024-11-01',
    endDate: '2025-01-15',
    terms:
      'All deliverables are work-for-hire. Payment milestones tied to deliverable approval. Rush fees apply for turnaround under 48 hours.',
    userRole: 'talent',
    milestones: [
      {
        id: 'm1',
        name: 'Campaign Concept',
        description: 'Creative direction, mood boards, concept presentation',
        status: 'paid',
        dueDate: '2024-11-20',
        paymentAmount: 3000,
        completedAt: '2024-11-18',
        deliverables: [
          {
            id: 'd1',
            name: 'Campaign_Concept.pdf',
            fileUrl: '#',
            submittedAt: '2024-11-18',
          },
        ],
      },
      {
        id: 'm2',
        name: 'Social Media Assets',
        description: 'Instagram, LinkedIn, and Facebook creative assets',
        status: 'paid',
        dueDate: '2024-12-15',
        paymentAmount: 5000,
        completedAt: '2024-12-14',
        deliverables: [
          {
            id: 'd2',
            name: 'Social_Assets_Pack.zip',
            fileUrl: '#',
            submittedAt: '2024-12-14',
          },
        ],
      },
      {
        id: 'm3',
        name: 'Print & Digital Ads',
        description: 'Banner ads, print layouts, OOH creative',
        status: 'paid',
        dueDate: '2025-01-10',
        paymentAmount: 4000,
        completedAt: '2025-01-08',
        deliverables: [
          {
            id: 'd3',
            name: 'Print_Digital_Pack.zip',
            fileUrl: '#',
            submittedAt: '2025-01-08',
          },
        ],
      },
    ],
    activities: [
      {
        id: 'a1',
        type: 'payment',
        text: 'Final payment of ₪4,000 released — project fully paid',
        timestamp: '2025-01-10T14:00:00',
        actor: 'EcoVentures',
      },
      {
        id: 'a2',
        type: 'milestone',
        text: 'Project marked as completed',
        timestamp: '2025-01-10T15:00:00',
        actor: 'EcoVentures',
      },
      {
        id: 'a3',
        type: 'deliverable',
        text: 'Submitted Print_Digital_Pack.zip',
        timestamp: '2025-01-08T11:00:00',
        actor: 'Noa Ben-Ari',
      },
    ],
  },
];

// ─── Helpers ─────────────────────────────────────────────
function getStatusColor(status: string) {
  switch (status) {
    case 'completed':
    case 'paid':
    case 'Completed':
      return 'bg-[#C6FF34] text-black';
    case 'active':
    case 'Active':
      return 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30';
    case 'Proposed':
    case 'pending':
    default:
      return 'bg-white/10 text-white/60 border border-white/10';
  }
}

function getMilestoneBorderColor(status: string) {
  switch (status) {
    case 'paid':
      return 'border-l-[#C6FF34]';
    case 'completed':
      return 'border-l-[#C6FF34]/70';
    case 'active':
      return 'border-l-yellow-400';
    default:
      return 'border-l-white/20';
  }
}

function getActivityIcon(type: Activity['type']) {
  switch (type) {
    case 'status_change':
      return <AlertCircle className="h-3.5 w-3.5 text-yellow-400" />;
    case 'deliverable':
      return <FileText className="h-3.5 w-3.5 text-[#C6FF34]" />;
    case 'payment':
      return <CircleDollarSign className="h-3.5 w-3.5 text-[#C6FF34]" />;
    case 'message':
      return <MessageSquare className="h-3.5 w-3.5 text-[#7E3BED]" />;
    case 'milestone':
      return <CheckCircle2 className="h-3.5 w-3.5 text-[#C6FF34]" />;
  }
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function formatRelativeTime(timestamp: string) {
  const now = new Date();
  const then = new Date(timestamp);
  const diffMs = now.getTime() - then.getTime();
  const diffHrs = Math.round(diffMs / (1000 * 60 * 60));
  const diffDays = Math.round(diffHrs / 24);

  if (diffHrs < 1) return 'Just now';
  if (diffHrs < 24) return `${diffHrs}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return formatDate(timestamp);
}

function calculateProgress(milestones: Milestone[]) {
  const completed = milestones.filter((m) => m.status === 'completed' || m.status === 'paid').length;
  return Math.round((completed / milestones.length) * 100);
}

// ─── Component ───────────────────────────────────────────
export default function ContractWorkspace() {
  const { bookingId } = useParams<{ bookingId: string }>();
  const navigate = useNavigate();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [termsOpen, setTermsOpen] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('bookings_data');
    let bookings: Booking[] = [];

    if (stored) {
      try {
        bookings = JSON.parse(stored);
      } catch {
        bookings = MOCK_BOOKINGS;
        localStorage.setItem('bookings_data', JSON.stringify(MOCK_BOOKINGS));
      }
    } else {
      bookings = MOCK_BOOKINGS;
      localStorage.setItem('bookings_data', JSON.stringify(MOCK_BOOKINGS));
    }

    const found = bookings.find((b) => b.id === bookingId);
    if (found) {
      setBooking(found);
    } else {
      // Fallback to first mock if ID not found
      setBooking(bookings[0]);
    }
    setLoading(false);
  }, [bookingId]);

  const updateMilestoneStatus = useCallback(
    (milestoneId: string, newStatus: Milestone['status']) => {
      if (!booking) return;
      const updatedMilestones = booking.milestones.map((m) =>
        m.id === milestoneId ? { ...m, status: newStatus, completedAt: newStatus === 'completed' ? new Date().toISOString() : m.completedAt } : m
      );

      const activity: Activity = {
        id: `a-${Date.now()}`,
        type: newStatus === 'paid' ? 'payment' : 'status_change',
        text:
          newStatus === 'completed'
            ? `Milestone "${booking.milestones.find((m) => m.id === milestoneId)?.name}" was marked complete`
            : newStatus === 'paid'
              ? `Payment of ₪${booking.milestones.find((m) => m.id === milestoneId)?.paymentAmount} released`
              : `Milestone status updated to ${newStatus}`,
        timestamp: new Date().toISOString(),
        actor: booking.userRole === 'employer' ? booking.employerName : booking.talentName,
      };

      const updatedActivities = [activity, ...booking.activities];

      const updatedBooking = {
        ...booking,
        milestones: updatedMilestones,
        activities: updatedActivities,
      };

      setBooking(updatedBooking);

      // Persist to localStorage
      const stored = localStorage.getItem('bookings_data');
      if (stored) {
        const bookings: Booking[] = JSON.parse(stored);
        const idx = bookings.findIndex((b) => b.id === booking.id);
        if (idx >= 0) {
          bookings[idx] = updatedBooking;
          localStorage.setItem('bookings_data', JSON.stringify(bookings));
        }
      }
    },
    [booking]
  );

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#C6FF34]" />
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
        <AlertCircle className="h-12 w-12 text-white/30" />
        <p className="text-lg text-white/60">Booking not found</p>
        <button onClick={() => navigate('/dashboard')} className="btn-lime text-sm">
          Back to Dashboard
        </button>
      </div>
    );
  }

  const progress = calculateProgress(booking.milestones);
  const completedCount = booking.milestones.filter(
    (m) => m.status === 'completed' || m.status === 'paid'
  ).length;

  return (
    <div className="min-h-screen bg-black pb-20">
      {/* Header Bar */}
      <div className="border-b border-white/[0.06] bg-white/[0.02]">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 text-white/60 transition-colors hover:border-[#C6FF34]/30 hover:text-[#C6FF34]"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <div className="flex-1">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-xl font-semibold text-white sm:text-2xl font-display">
                  {booking.projectTitle}
                </h1>
                <span
                  className={cn(
                    'inline-flex items-center rounded-full px-3 py-0.5 text-xs font-medium',
                    getStatusColor(booking.status)
                  )}
                >
                  {booking.status}
                </span>
              </div>
              <p className="mt-1 text-sm text-white/50">
                {booking.userRole === 'talent' ? 'You are the talent' : 'You are the employer'} on this project
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Progress Bar */}
        <div className="mb-6 rounded-2xl bg-white/[0.03] border border-white/[0.06] p-4 backdrop-blur-xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-white/80">Project Progress</span>
            <span className="text-sm text-[#C6FF34] font-medium">
              {completedCount}/{booking.milestones.length} milestones completed
            </span>
          </div>
          <div className="h-2.5 w-full rounded-full bg-white/[0.08]">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-[#C6FF34] to-[#7E3BED]"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.8, ease: [0.19, 1, 0.22, 1] }}
            />
          </div>
          <p className="mt-2 text-right text-xs text-white/40">{progress}% complete</p>
        </div>

        {/* 3-Column Grid */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* ─── LEFT COLUMN: Project Info ─── */}
          <div className="lg:col-span-3">
            <div className="sticky top-6 space-y-4">
              {/* People Card */}
              <div className="rounded-2xl bg-white/[0.03] backdrop-blur-xl border border-white/[0.06] p-5">
                <h3 className="text-sm font-medium text-white/40 uppercase tracking-wider mb-4">
                  Team
                </h3>
                <div className="space-y-4">
                  {/* Talent */}
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-[#C6FF34] to-[#7E3BED]">
                      {booking.talentAvatar ? (
                        <img
                          src={booking.talentAvatar}
                          alt={booking.talentName}
                          className="h-10 w-10 rounded-full object-cover"
                        />
                      ) : (
                        <User className="h-5 w-5 text-white" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">{booking.talentName}</p>
                      <p className="text-xs text-white/40 flex items-center gap-1">
                        <User className="h-3 w-3" /> Talent
                      </p>
                    </div>
                  </div>
                  {/* Employer */}
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10">
                      <Building2 className="h-5 w-5 text-white/60" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">{booking.employerName}</p>
                      <p className="text-xs text-white/40 flex items-center gap-1">
                        <Building2 className="h-3 w-3" /> Employer
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Budget Card */}
              <div className="rounded-2xl bg-white/[0.03] backdrop-blur-xl border border-white/[0.06] p-5">
                <h3 className="text-sm font-medium text-white/40 uppercase tracking-wider mb-4">
                  Budget
                </h3>
                <p className="text-3xl font-bold text-[#C6FF34] font-display">
                  ₪{booking.totalBudget.toLocaleString()}
                </p>
                <p className="mt-1 text-xs text-white/40">Total project budget</p>
              </div>

              {/* Timeline Card */}
              <div className="rounded-2xl bg-white/[0.03] backdrop-blur-xl border border-white/[0.06] p-5">
                <h3 className="text-sm font-medium text-white/40 uppercase tracking-wider mb-4">
                  Timeline
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Calendar className="h-4 w-4 text-[#C6FF34]" />
                    <div>
                      <p className="text-xs text-white/40">Start Date</p>
                      <p className="text-sm text-white">{formatDate(booking.startDate)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Calendar className="h-4 w-4 text-[#7E3BED]" />
                    <div>
                      <p className="text-xs text-white/40">End Date</p>
                      <p className="text-sm text-white">{formatDate(booking.endDate)}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Terms — Collapsible */}
              <div className="rounded-2xl bg-white/[0.03] backdrop-blur-xl border border-white/[0.06] p-5">
                <button
                  onClick={() => setTermsOpen(!termsOpen)}
                  className="flex w-full items-center justify-between text-left"
                >
                  <h3 className="text-sm font-medium text-white/40 uppercase tracking-wider">
                    Terms
                  </h3>
                  {termsOpen ? (
                    <ChevronUp className="h-4 w-4 text-white/40" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-white/40" />
                  )}
                </button>
                <AnimatePresence>
                  {termsOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <p className="mt-3 text-xs leading-relaxed text-white/50">
                        {booking.terms}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>

          {/* ─── CENTER COLUMN: Milestones ─── */}
          <div className="lg:col-span-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white font-display">Milestones</h2>
              <span className="text-xs text-white/40">{booking.milestones.length} total</span>
            </div>

            <div className="space-y-4">
              <AnimatePresence>
                {booking.milestones.map((milestone, index) => (
                  <motion.div
                    key={milestone.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      delay: index * 0.1,
                      duration: 0.4,
                      ease: [0.19, 1, 0.22, 1],
                    }}
                    className={cn(
                      'rounded-2xl bg-white/[0.03] backdrop-blur-xl border border-white/[0.06] border-l-4 p-5 transition-all hover:bg-white/[0.05]',
                      getMilestoneBorderColor(milestone.status)
                    )}
                  >
                    {/* Milestone Header */}
                    <div className="flex items-start justify-between gap-3 flex-wrap">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-medium text-white">{milestone.name}</h3>
                          <span
                            className={cn(
                              'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize',
                              milestone.status === 'paid'
                                ? 'bg-[#C6FF34] text-black'
                                : milestone.status === 'completed'
                                  ? 'bg-[#C6FF34]/20 text-[#C6FF34]'
                                  : milestone.status === 'active'
                                    ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                                    : 'bg-white/10 text-white/50'
                            )}
                          >
                            {milestone.status}
                          </span>
                        </div>
                        <p className="mt-1 text-sm text-white/50">{milestone.description}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-lg font-semibold text-[#C6FF34] font-display">
                          ₪{milestone.paymentAmount.toLocaleString()}
                        </p>
                      </div>
                    </div>

                    {/* Due Date & Deliverables */}
                    <div className="mt-3 flex items-center gap-4 flex-wrap text-xs text-white/40">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        Due {formatDate(milestone.dueDate)}
                      </span>
                      {milestone.completedAt && (
                        <span className="flex items-center gap-1 text-[#C6FF34]">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          Completed {formatDate(milestone.completedAt)}
                        </span>
                      )}
                    </div>

                    {/* Deliverables */}
                    {milestone.deliverables.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {milestone.deliverables.map((del) => (
                          <a
                            key={del.id}
                            href={del.fileUrl}
                            className="inline-flex items-center gap-1.5 rounded-lg bg-white/[0.05] border border-white/[0.08] px-3 py-1.5 text-xs text-white/70 transition-colors hover:border-[#C6FF34]/30 hover:text-white"
                          >
                            <FileText className="h-3.5 w-3.5 text-[#C6FF34]" />
                            {del.name}
                            <Download className="h-3 w-3 text-white/30" />
                          </a>
                        ))}
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="mt-4 flex flex-wrap gap-2">
                      {booking.userRole === 'employer' ? (
                        <>
                          {milestone.status === 'active' && (
                            <button
                              onClick={() => updateMilestoneStatus(milestone.id, 'completed')}
                              className="inline-flex items-center gap-1.5 rounded-full bg-[#C6FF34] px-4 py-2 text-xs font-semibold text-black transition-all hover:bg-[#d4ff5c] hover:shadow-[0_4px_24px_rgba(198,255,52,0.3)]"
                            >
                              <CheckCircle2 className="h-3.5 w-3.5" />
                              Mark Complete
                            </button>
                          )}
                          {milestone.status === 'completed' && (
                            <button
                              onClick={() => updateMilestoneStatus(milestone.id, 'paid')}
                              className="inline-flex items-center gap-1.5 rounded-full bg-[#7E3BED] px-4 py-2 text-xs font-semibold text-white transition-all hover:bg-[#6a2fd4] hover:shadow-[0_4px_24px_rgba(126,59,237,0.3)]"
                            >
                              <CircleDollarSign className="h-3.5 w-3.5" />
                              Release Payment
                            </button>
                          )}
                        </>
                      ) : (
                        <>
                          {milestone.status === 'active' && (
                            <>
                              <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-full bg-white/10 border border-white/10 px-4 py-2 text-xs font-semibold text-white transition-all hover:border-[#C6FF34]/30 hover:bg-white/[0.08]">
                                <Upload className="h-3.5 w-3.5" />
                                Submit Deliverable
                                <input
                                  type="file"
                                  className="hidden"
                                  onChange={(e) => {
                                    if (e.target.files?.[0]) {
                                      const file = e.target.files[0];
                                      const newDel: Deliverable = {
                                        id: `d-${Date.now()}`,
                                        name: file.name,
                                        submittedAt: new Date().toISOString(),
                                      };
                                      const updatedMilestones = booking.milestones.map((m) =>
                                        m.id === milestone.id
                                          ? { ...m, deliverables: [...m.deliverables, newDel] }
                                          : m
                                      );
                                      const activity: Activity = {
                                        id: `a-${Date.now()}`,
                                        type: 'deliverable',
                                        text: `Submitted ${file.name}`,
                                        timestamp: new Date().toISOString(),
                                        actor: booking.talentName,
                                      };
                                      const updatedBooking = {
                                        ...booking,
                                        milestones: updatedMilestones,
                                        activities: [activity, ...booking.activities],
                                      };
                                      setBooking(updatedBooking);
                                      // Safely persist to localStorage with corruption recovery
                                      try {
                                        const stored = localStorage.getItem('bookings_data') || '[]';
                                        const bookings = JSON.parse(stored) as Booking[];
                                        const idx = bookings.findIndex((b) => b.id === booking.id);
                                        if (idx >= 0) {
                                          bookings[idx] = updatedBooking;
                                          localStorage.setItem('bookings_data', JSON.stringify(bookings));
                                        }
                                      } catch {
                                        // If localStorage is corrupted, seed with current booking
                                        localStorage.setItem('bookings_data', JSON.stringify([updatedBooking]));
                                      }
                                    }
                                  }}
                                />
                              </label>
                              <button
                                onClick={() => {
                                  const activity: Activity = {
                                    id: `a-${Date.now()}`,
                                    type: 'message',
                                    text: `Requested review for "${milestone.name}"`,
                                    timestamp: new Date().toISOString(),
                                    actor: booking.talentName,
                                  };
                                  const updatedBooking = {
                                    ...booking,
                                    activities: [activity, ...booking.activities],
                                  };
                                  setBooking(updatedBooking);
                                }}
                                className="inline-flex items-center gap-1.5 rounded-full bg-[#C6FF34] px-4 py-2 text-xs font-semibold text-black transition-all hover:bg-[#d4ff5c] hover:shadow-[0_4px_24px_rgba(198,255,52,0.3)]"
                              >
                                <Send className="h-3.5 w-3.5" />
                                Request Review
                              </button>
                            </>
                          )}
                          {milestone.status === 'pending' && (
                            <span className="inline-flex items-center gap-1.5 text-xs text-white/30">
                              <Circle className="h-3.5 w-3.5" />
                              Awaiting start
                            </span>
                          )}
                        </>
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>

          {/* ─── RIGHT COLUMN: Activity Feed ─── */}
          <div className="lg:col-span-3">
            <div className="sticky top-6">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-white font-display">Activity</h2>
                <span className="text-xs text-white/40">{booking.activities.length} entries</span>
              </div>

              <div className="rounded-2xl bg-white/[0.03] backdrop-blur-xl border border-white/[0.06] p-4">
                <div className="relative">
                  {/* Timeline line */}
                  <div className="absolute left-[18px] top-2 bottom-2 w-px bg-white/[0.08]" />

                  <div className="space-y-0">
                    <AnimatePresence>
                      {booking.activities.map((activity, index) => (
                        <motion.div
                          key={activity.id}
                          initial={{ opacity: 0, x: 10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{
                            delay: index * 0.05,
                            duration: 0.3,
                            ease: [0.19, 1, 0.22, 1],
                          }}
                          className="relative flex gap-3 pb-5 last:pb-0"
                        >
                          {/* Timeline dot */}
                          <div className="relative z-10 mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/[0.06] border border-white/[0.08]">
                            {getActivityIcon(activity.type)}
                          </div>

                          {/* Content */}
                          <div className="min-w-0 flex-1 pt-0.5">
                            <p className="text-sm text-white/70 leading-snug">
                              {activity.text}
                            </p>
                            <div className="mt-1 flex items-center gap-2 text-xs text-white/30">
                              <span>{activity.actor}</span>
                              <span>&middot;</span>
                              <span>{formatRelativeTime(activity.timestamp)}</span>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
