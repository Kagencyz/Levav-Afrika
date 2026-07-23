import { useState, useMemo, useCallback } from 'react';
import { useParams } from 'react-router';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Wallet,
  CheckCircle2,
  Clock,
  Shield,
  AlertTriangle,
  ArrowUpRight,
  Lock,
  Unlock,
  Send,
  History,
  ChevronDown,
  ChevronUp,
  User,
  Building2,
  Landmark,
  CircleDollarSign,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import GlassCard from '@/components/GlassCard';
import { cn } from '@/lib/utils';

/* ───────────────────── Types ───────────────────── */

interface MilestonePayment {
  id: string;
  milestone: string;
  description: string;
  amount: string;
  amountValue: number;
  status: 'in_escrow' | 'released' | 'pending' | 'disputed';
  date: string;
  history: PaymentHistoryEntry[];
}

interface PaymentHistoryEntry {
  date: string;
  action: string;
  note: string;
}

interface PaymentTransaction {
  id: string;
  date: string;
  milestone: string;
  amount: string;
  type: 'Release' | 'Escrow' | 'Dispute';
  status: string;
}

/* ───────────────────── Mock Data ───────────────────── */

const MOCK_MILESTONES: MilestonePayment[] = [
  {
    id: 'ms-1',
    milestone: 'Project Setup',
    description: 'Initial onboarding, repository setup, and project planning',
    amount: 'ZMW 5,000',
    amountValue: 5000,
    status: 'released',
    date: '2025-06-15',
    history: [
      { date: '2025-06-10', action: 'Funds Deposited to Escrow', note: 'Employer deposited ZMW 5,000' },
      { date: '2025-06-12', action: 'Milestone Completed', note: 'Talent submitted deliverables' },
      { date: '2025-06-15', action: 'Funds Released', note: 'Employer released payment' },
    ],
  },
  {
    id: 'ms-2',
    milestone: 'UI Design Phase',
    description: 'Wireframes, mockups, and high-fidelity design deliverables',
    amount: 'ZMW 7,500',
    amountValue: 7500,
    status: 'in_escrow',
    date: '2025-06-22',
    history: [
      { date: '2025-06-18', action: 'Funds Deposited to Escrow', note: 'Employer deposited ZMW 7,500' },
      { date: '2025-06-22', action: 'Milestone Completed', note: 'Talent submitted design files' },
    ],
  },
  {
    id: 'ms-3',
    milestone: 'Frontend Development',
    description: 'React component development, API integration, and state management',
    amount: 'ZMW 10,000',
    amountValue: 10000,
    status: 'pending',
    date: '',
    history: [],
  },
  {
    id: 'ms-4',
    milestone: 'Testing & Deployment',
    description: 'QA testing, bug fixes, and production deployment',
    amount: 'ZMW 2,500',
    amountValue: 2500,
    status: 'pending',
    date: '',
    history: [],
  },
];

const MOCK_TRANSACTIONS: PaymentTransaction[] = [
  { id: 'tx-1', date: '2025-06-15', milestone: 'Project Setup', amount: 'ZMW 5,000', type: 'Release', status: 'Completed' },
  { id: 'tx-2', date: '2025-06-18', milestone: 'UI Design Phase', amount: 'ZMW 7,500', type: 'Escrow', status: 'Completed' },
  { id: 'tx-3', date: '2025-06-22', milestone: 'UI Design Phase', amount: 'ZMW 7,500', type: 'Release', status: 'Pending Approval' },
];

/* ───────────────────── Animation Variants ───────────────────── */

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.5, ease: [0.19, 1, 0.22, 1] },
  }),
};

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
};

/* ───────────────────── Status Config ───────────────────── */

const statusConfig = {
  in_escrow: {
    label: 'In Escrow',
    color: 'text-blue-400',
    bg: 'bg-blue-400/10',
    border: 'border-blue-400/20',
    icon: Lock,
    dot: 'bg-blue-400',
  },
  released: {
    label: 'Released',
    color: 'text-lime',
    bg: 'bg-[#C6FF34]/10',
    border: 'border-[#C6FF34]/20',
    icon: Unlock,
    dot: 'bg-lime',
  },
  pending: {
    label: 'Pending',
    color: 'text-gray-400',
    bg: 'bg-gray-400/10',
    border: 'border-gray-400/20',
    icon: Clock,
    dot: 'bg-gray-400',
  },
  disputed: {
    label: 'Disputed',
    color: 'text-red-400',
    bg: 'bg-red-400/10',
    border: 'border-red-400/20',
    icon: AlertTriangle,
    dot: 'bg-red-400',
  },
};

/* ───────────────────── Utility ───────────────────── */

function parseAmount(amount: string): number {
  return parseInt(amount.replace(/[^0-9]/g, ''), 10);
}

/* ───────────────────── Status Badge ───────────────────── */

function StatusBadge({ status }: { status: keyof typeof statusConfig }) {
  const config = statusConfig[status];
  const Icon = config.icon;
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium',
        config.bg,
        config.color,
        config.border
      )}
    >
      <Icon className="h-3 w-3" />
      {config.label}
    </span>
  );
}

/* ───────────────────── Main Component ───────────────────── */

export default function MilestonePayments() {
  const { bookingId } = useParams<{ bookingId: string }>();

  /* ── Role Toggle (for demo: can switch employer/talent views) ── */
  const [userRole, setUserRole] = useState<'employer' | 'talent'>('employer');

  /* ── Load milestone data from localStorage or fallback ── */
  const [milestones, setMilestones] = useState<MilestonePayment[]>(() => {
    try {
      const stored = localStorage.getItem(`payments_${bookingId}`);
      if (stored) return JSON.parse(stored);
    } catch { /* ignore */ }
    return MOCK_MILESTONES;
  });

  /* ── Load transactions from localStorage or fallback ── */
  const [transactions, setTransactions] = useState<PaymentTransaction[]>(() => {
    try {
      const stored = localStorage.getItem(`transactions_${bookingId}`);
      if (stored) return JSON.parse(stored);
    } catch { /* ignore */ }
    return MOCK_TRANSACTIONS;
  });

  /* ── Persist changes ── */
  const persistMilestones = useCallback((data: MilestonePayment[]) => {
    setMilestones(data);
    localStorage.setItem(`payments_${bookingId}`, JSON.stringify(data));
  }, [bookingId]);

  const persistTransactions = useCallback((data: PaymentTransaction[]) => {
    setTransactions(data);
    localStorage.setItem(`transactions_${bookingId}`, JSON.stringify(data));
  }, [bookingId]);

  /* ── Computed Stats ── */
  const stats = useMemo(() => {
    const totalBudget = milestones.reduce((sum, m) => sum + m.amountValue, 0);
    const totalPaid = milestones
      .filter((m) => m.status === 'released')
      .reduce((sum, m) => sum + m.amountValue, 0);
    const totalEscrow = milestones
      .filter((m) => m.status === 'in_escrow')
      .reduce((sum, m) => sum + m.amountValue, 0);
    const totalPending = milestones
      .filter((m) => m.status === 'pending')
      .reduce((sum, m) => sum + m.amountValue, 0);
    const progressPercent = totalBudget > 0 ? Math.round((totalPaid / totalBudget) * 100) : 0;

    return { totalBudget, totalPaid, totalEscrow, totalPending, progressPercent };
  }, [milestones]);

  /* ── Actions ── */
  const handleReleaseFunds = useCallback((milestoneId: string) => {
    setMilestones((prev) => {
      const updated = prev.map((m) => {
        if (m.id === milestoneId && m.status === 'in_escrow') {
          const newEntry: PaymentHistoryEntry = {
            date: new Date().toISOString().split('T')[0],
            action: 'Funds Released',
            note: 'Employer released payment to talent',
          };
          return {
            ...m,
            status: 'released' as const,
            date: new Date().toISOString().split('T')[0],
            history: [...m.history, newEntry],
          };
        }
        return m;
      });
      localStorage.setItem(`payments_${bookingId}`, JSON.stringify(updated));
      return updated;
    });

    // Add transaction record
    const milestone = milestones.find((m) => m.id === milestoneId);
    if (milestone) {
      const newTx: PaymentTransaction = {
        id: `tx-${Date.now()}`,
        date: new Date().toISOString().split('T')[0],
        milestone: milestone.milestone,
        amount: milestone.amount,
        type: 'Release',
        status: 'Completed',
      };
      const updatedTx = [...transactions, newTx];
      persistTransactions(updatedTx);
    }
  }, [bookingId, milestones, transactions, persistTransactions]);

  const handleDispute = useCallback((milestoneId: string) => {
    setMilestones((prev) => {
      const updated = prev.map((m) => {
        if (m.id === milestoneId) {
          const newEntry: PaymentHistoryEntry = {
            date: new Date().toISOString().split('T')[0],
            action: 'Dispute Filed',
            note: 'Employer filed a dispute for review',
          };
          return {
            ...m,
            status: 'disputed' as const,
            history: [...m.history, newEntry],
          };
        }
        return m;
      });
      localStorage.setItem(`payments_${bookingId}`, JSON.stringify(updated));
      return updated;
    });
  }, [bookingId]);

  const handleRequestRelease = useCallback((milestoneId: string) => {
    setMilestones((prev) => {
      const updated = prev.map((m) => {
        if (m.id === milestoneId) {
          const newEntry: PaymentHistoryEntry = {
            date: new Date().toISOString().split('T')[0],
            action: 'Release Requested',
            note: 'Talent requested fund release',
          };
          return {
            ...m,
            history: [...m.history, newEntry],
          };
        }
        return m;
      });
      localStorage.setItem(`payments_${bookingId}`, JSON.stringify(updated));
      return updated;
    });
  }, [bookingId]);

  /* ── UI Helpers ── */
  const formatDate = (dateStr: string) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="min-h-screen bg-black pt-8 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        {/* ── Header ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.19, 1, 0.22, 1] }}
          className="mb-8"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-sm text-light-gray mb-1">
                <Landmark className="h-4 w-4" />
                <span>Booking #{bookingId || 'N/A'}</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-display font-semibold tracking-tight text-white">
                Milestone <span className="text-lime">Payments</span>
              </h1>
              <p className="mt-2 text-light-gray max-w-lg">
                Track escrow deposits, releases, and payment status for each project milestone.
              </p>
            </div>

            {/* Role Toggle */}
            <div className="glass rounded-full p-1 flex items-center gap-1">
              <button
                onClick={() => setUserRole('employer')}
                className={cn(
                  'flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-all',
                  userRole === 'employer'
                    ? 'bg-lime text-black'
                    : 'text-light-gray hover:text-white'
                )}
              >
                <Building2 className="h-4 w-4" />
                Employer
              </button>
              <button
                onClick={() => setUserRole('talent')}
                className={cn(
                  'flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-all',
                  userRole === 'talent'
                    ? 'bg-lime text-black'
                    : 'text-light-gray hover:text-white'
                )}
              >
                <User className="h-4 w-4" />
                Talent
              </button>
            </div>
          </div>
        </motion.div>

        {/* ── Payment Overview Card ── */}
        <motion.div
          custom={0}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
        >
          <GlassCard className="p-6 sm:p-8 mb-8" hover={false}>
            <div className="flex items-center gap-2 mb-6">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-[#C6FF34]/10">
                <Wallet className="h-5 w-5 text-lime" />
              </div>
              <h2 className="text-xl font-display font-semibold text-white">Payment Overview</h2>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <div className="glass rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <CircleDollarSign className="h-4 w-4 text-light-gray" />
                  <span className="text-xs text-light-gray font-medium uppercase tracking-wider">Total Budget</span>
                </div>
                <p className="text-2xl font-display font-semibold text-white">
                  ZMW {stats.totalBudget.toLocaleString()}
                </p>
              </div>

              <div className="glass rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle2 className="h-4 w-4 text-lime" />
                  <span className="text-xs text-light-gray font-medium uppercase tracking-wider">Paid</span>
                </div>
                <p className="text-2xl font-display font-semibold text-lime">
                  ZMW {stats.totalPaid.toLocaleString()}
                </p>
              </div>

              <div className="glass rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="h-4 w-4 text-gray-400" />
                  <span className="text-xs text-light-gray font-medium uppercase tracking-wider">Pending</span>
                </div>
                <p className="text-2xl font-display font-semibold text-white">
                  ZMW {stats.totalPending.toLocaleString()}
                </p>
              </div>

              <div className="glass rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="h-4 w-4 text-blue-400" />
                  <span className="text-xs text-light-gray font-medium uppercase tracking-wider">In Escrow</span>
                </div>
                <p className="text-2xl font-display font-semibold text-blue-400">
                  ZMW {stats.totalEscrow.toLocaleString()}
                </p>
              </div>
            </div>

            {/* Progress Bar */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-light-gray">Payment Progress</span>
                <span className="text-sm font-semibold text-lime">{stats.progressPercent}%</span>
              </div>
              <div className="h-3 w-full rounded-full bg-white/5 overflow-hidden">
                <motion.div
                  className="h-full rounded-full bg-lime"
                  initial={{ width: 0 }}
                  animate={{ width: `${stats.progressPercent}%` }}
                  transition={{ duration: 1, ease: [0.19, 1, 0.22, 1], delay: 0.3 }}
                />
              </div>
              <div className="flex items-center justify-between mt-2 text-xs text-medium-gray">
                <span>{milestones.filter((m) => m.status === 'released').length} of {milestones.length} milestones paid</span>
                <span>ZMW {stats.totalPaid.toLocaleString()} / ZMW {stats.totalBudget.toLocaleString()}</span>
              </div>
            </div>
          </GlassCard>
        </motion.div>

        {/* ── Milestone Payment Cards ── */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="mb-8"
        >
          <div className="flex items-center gap-2 mb-6">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-[#C6FF34]/10">
              <Landmark className="h-5 w-5 text-lime" />
            </div>
            <h2 className="text-xl font-display font-semibold text-white">Milestone Breakdown</h2>
          </div>

          <div className="space-y-4">
            {milestones.map((milestone, index) => (
              <MilestoneCard
                key={milestone.id}
                milestone={milestone}
                index={index}
                userRole={userRole}
                onReleaseFunds={handleReleaseFunds}
                onDispute={handleDispute}
                onRequestRelease={handleRequestRelease}
                formatDate={formatDate}
              />
            ))}
          </div>
        </motion.div>

        {/* ── Payment History Section ── */}
        <motion.div
          custom={milestones.length + 1}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
        >
          <div className="flex items-center gap-2 mb-6">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-[#C6FF34]/10">
              <History className="h-5 w-5 text-lime" />
            </div>
            <h2 className="text-xl font-display font-semibold text-white">Payment History</h2>
          </div>

          <GlassCard className="overflow-hidden" hover={false}>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-white/5 hover:bg-transparent">
                    <TableHead className="text-light-gray font-medium">Date</TableHead>
                    <TableHead className="text-light-gray font-medium">Milestone</TableHead>
                    <TableHead className="text-light-gray font-medium">Amount</TableHead>
                    <TableHead className="text-light-gray font-medium">Type</TableHead>
                    <TableHead className="text-light-gray font-medium">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.length === 0 ? (
                    <TableRow className="border-white/5">
                      <TableCell colSpan={5} className="text-center py-12 text-medium-gray">
                        <History className="h-8 w-8 mx-auto mb-2 opacity-40" />
                        <p>No payment transactions yet</p>
                      </TableCell>
                    </TableRow>
                  ) : (
                    transactions.map((tx) => (
                      <TableRow key={tx.id} className="border-white/5">
                        <TableCell className="text-white">
                          <div className="flex items-center gap-2">
                            <Clock className="h-3.5 w-3.5 text-medium-gray" />
                            {formatDate(tx.date)}
                          </div>
                        </TableCell>
                        <TableCell className="text-white font-medium">{tx.milestone}</TableCell>
                        <TableCell className="text-lime font-semibold">{tx.amount}</TableCell>
                        <TableCell>
                          <span className={cn(
                            'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium',
                            tx.type === 'Release' && 'bg-[#C6FF34]/10 text-lime',
                            tx.type === 'Escrow' && 'bg-blue-400/10 text-blue-400',
                            tx.type === 'Dispute' && 'bg-red-400/10 text-red-400',
                          )}>
                            {tx.type === 'Release' && <Unlock className="h-3 w-3" />}
                            {tx.type === 'Escrow' && <Lock className="h-3 w-3" />}
                            {tx.type === 'Dispute' && <AlertTriangle className="h-3 w-3" />}
                            {tx.type}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className={cn(
                            'text-xs font-medium',
                            tx.status === 'Completed' ? 'text-lime' : 'text-amber-400',
                          )}>
                            {tx.status}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </GlassCard>
        </motion.div>
      </div>
    </div>
  );
}

/* ───────────────────── Milestone Card ───────────────────── */

interface MilestoneCardProps {
  milestone: MilestonePayment;
  index: number;
  userRole: 'employer' | 'talent';
  onReleaseFunds: (id: string) => void;
  onDispute: (id: string) => void;
  onRequestRelease: (id: string) => void;
  formatDate: (date: string) => string;
}

function MilestoneCard({
  milestone,
  index,
  userRole,
  onReleaseFunds,
  onDispute,
  onRequestRelease,
  formatDate,
}: MilestoneCardProps) {
  const [showHistory, setShowHistory] = useState(false);
  const config = statusConfig[milestone.status];

  return (
    <motion.div
      custom={index + 1}
      variants={fadeUp}
      initial="hidden"
      animate="visible"
    >
      <GlassCard className="overflow-hidden" hover={milestone.status === 'in_escrow'}>
        <div className="p-5 sm:p-6">
          {/* Top Row */}
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            {/* Left: Milestone Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-1 flex-wrap">
                <StatusBadge status={milestone.status} />
                {milestone.date && milestone.status === 'released' && (
                  <span className="text-xs text-medium-gray">
                    Released on {formatDate(milestone.date)}
                  </span>
                )}
                {milestone.date && milestone.status === 'in_escrow' && (
                  <span className="text-xs text-medium-gray">
                    Completed on {formatDate(milestone.date)}
                  </span>
                )}
              </div>
              <h3 className="text-lg font-display font-semibold text-white mt-2">
                {milestone.milestone}
              </h3>
              <p className="text-sm text-light-gray mt-1">{milestone.description}</p>
            </div>

            {/* Right: Amount */}
            <div className="text-right flex-shrink-0">
              <p className="text-2xl sm:text-3xl font-display font-bold text-lime tracking-tight">
                {milestone.amount}
              </p>
              <p className="text-xs text-medium-gray mt-1">
                {milestone.status === 'released' && 'Paid to talent'}
                {milestone.status === 'in_escrow' && 'Held securely in escrow'}
                {milestone.status === 'pending' && 'Awaiting milestone completion'}
                {milestone.status === 'disputed' && 'Under dispute review'}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 mt-5 pt-4 border-t border-white/5">
            {userRole === 'employer' ? (
              <>
                <Button
                  onClick={() => onReleaseFunds(milestone.id)}
                  disabled={milestone.status !== 'in_escrow'}
                  className={cn(
                    'rounded-full font-semibold text-sm transition-all',
                    milestone.status === 'in_escrow'
                      ? 'bg-lime text-black hover:bg-[#d4ff5c] hover:shadow-[0_4px_24px_rgba(198,255,52,0.3)]'
                      : 'bg-white/5 text-medium-gray cursor-not-allowed opacity-50'
                  )}
                >
                  <Unlock className="h-4 w-4 mr-1.5" />
                  Release Funds
                </Button>
                <Button
                  onClick={() => onDispute(milestone.id)}
                  disabled={milestone.status === 'released' || milestone.status === 'disputed'}
                  variant="outline"
                  className={cn(
                    'rounded-full font-semibold text-sm border-red-400/30 text-red-400 hover:bg-red-400/10 hover:text-red-300 transition-all',
                    (milestone.status === 'released' || milestone.status === 'disputed') &&
                      'opacity-30 cursor-not-allowed'
                  )}
                >
                  <AlertTriangle className="h-4 w-4 mr-1.5" />
                  Dispute
                </Button>
              </>
            ) : (
              <Button
                onClick={() => onRequestRelease(milestone.id)}
                disabled={milestone.status !== 'in_escrow'}
                className={cn(
                  'rounded-full font-semibold text-sm transition-all',
                  milestone.status === 'in_escrow'
                    ? 'bg-lime text-black hover:bg-[#d4ff5c] hover:shadow-[0_4px_24px_rgba(198,255,52,0.3)]'
                    : 'bg-white/5 text-medium-gray cursor-not-allowed opacity-50'
                )}
              >
                <Send className="h-4 w-4 mr-1.5" />
                Request Release
              </Button>
            )}

            {/* History Toggle */}
            {milestone.history.length > 0 && (
              <button
                onClick={() => setShowHistory(!showHistory)}
                className="flex items-center gap-1 text-sm text-medium-gray hover:text-white transition-colors ml-auto"
              >
                <History className="h-4 w-4" />
                History
                {showHistory ? (
                  <ChevronUp className="h-3.5 w-3.5" />
                ) : (
                  <ChevronDown className="h-3.5 w-3.5" />
                )}
              </button>
            )}
          </div>
        </div>

        {/* Expandable History */}
        <AnimatePresence>
          {showHistory && milestone.history.length > 0 && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: [0.19, 1, 0.22, 1] }}
              className="overflow-hidden"
            >
              <div className="px-5 sm:px-6 pb-5 pt-0">
                <div className="border-t border-white/5 pt-4">
                  <h4 className="text-xs font-semibold text-light-gray uppercase tracking-wider mb-3">
                    Payment Activity
                  </h4>
                  <div className="space-y-3">
                    {milestone.history.map((entry, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.08 }}
                        className="flex items-start gap-3"
                      >
                        <div className="flex-shrink-0 mt-0.5">
                          <div className={cn('w-2 h-2 rounded-full', config.dot)} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-white font-medium">{entry.action}</p>
                          <p className="text-xs text-medium-gray">{entry.note}</p>
                        </div>
                        <span className="text-xs text-medium-gray flex-shrink-0">
                          {formatDate(entry.date)}
                        </span>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </GlassCard>
    </motion.div>
  );
}
