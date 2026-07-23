/**
 * QuickWork™ — Project-based micro-opportunity marketplace
 * African talent picks up quick jobs, completes them, earns money, and gets reviewed.
 */
import React from 'react';
import { Link } from 'react-router';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Zap,
  Clock,
  MapPin,
  Star,
  Users,
  CheckCircle2,
  X,
  Send,
  Filter,
  Briefcase,
  Award,
  TrendingUp,
  Calendar,
  ChevronRight,
  CircleDollarSign,
  Sparkles,
  MessageSquare,
  Layers,
  AlertCircle,
  Search,
  Target,
} from 'lucide-react';
import { StableInput, StableTextarea, StableSelect } from '@/components/StableInputs';
import { StarRating } from '@/components/StarRating';
import AnimatedCounter from '@/components/AnimatedCounter';
import SectionHeader from '@/components/SectionHeader';
import {
  QUICKWORK_GIGS,
  applyToGig,
  getQuickworkApplications,
  getMyGigs,
  updateGigStatus,
  awardWriPoints,
} from '@/lib/levavData';
import type { QuickWorkGig } from '@/lib/levavData';

/* ═══════════════════════════════════════════
   TYPES
   ═══════════════════════════════════════════ */
type FilterCategory = 'All' | 'Design' | 'Development' | 'Marketing' | 'Writing' | 'Creative' | 'Data' | 'Translation' | 'Operations';
type ActiveTab = 'available' | 'applications' | 'completed';
type ToastType = 'success' | 'error' | 'info';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

/* ═══════════════════════════════════════════
   CATEGORY CONFIG
   ═══════════════════════════════════════════ */
const CATEGORIES: FilterCategory[] = [
  'All', 'Design', 'Development', 'Marketing', 'Writing', 'Creative', 'Data', 'Translation', 'Operations',
];

const CATEGORY_ICON: Record<string, React.ReactNode> = {
  Design: <Layers size={14} />,
  Development: <Zap size={14} />,
  Marketing: <TrendingUp size={14} />,
  Writing: <MessageSquare size={14} />,
  Creative: <Sparkles size={14} />,
  Data: <Target size={14} />,
  Translation: <MessageSquare size={14} />,
  Operations: <Briefcase size={14} />,
};

const CATEGORY_COLORS: Record<string, string> = {
  Design: 'bg-[#7E3BED]/20 text-[#7E3BED] border-[#7E3BED]/30',
  Development: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  Marketing: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  Writing: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  Creative: 'bg-pink-500/20 text-pink-400 border-pink-500/30',
  Data: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
  Translation: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  Operations: 'bg-[#C6FF34]/20 text-[#C6FF34] border-[#C6FF34]/30',
};

/* ═══════════════════════════════════════════
   HELPERS
   ═══════════════════════════════════════════ */
function getDaysLeft(deadline: string): number {
  const match = deadline.match(/(\d+)/);
  return match ? parseInt(match[1], 10) : 0;
}

function generateId(): string {
  return Math.random().toString(36).substring(2, 9);
}

/* ═══════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════ */
export default function QuickWork() {
  /* ─── State ─── */
  const [activeFilter, setActiveFilter] = React.useState<FilterCategory>('All');
  const [activeTab, setActiveTab] = React.useState<ActiveTab>('available');
  const [selectedGig, setSelectedGig] = React.useState<QuickWorkGig | null>(null);
  const [isApplyModalOpen, setIsApplyModalOpen] = React.useState(false);
  const [toasts, setToasts] = React.useState<Toast[]>([]);
  const [refreshKey, setRefreshKey] = React.useState(0);
  const [searchQuery, setSearchQuery] = React.useState('');

  /* ─── Derived state from localStorage ─── */
  const appliedIds = React.useMemo(() => getQuickworkApplications(), [refreshKey]);
  const myGigs = React.useMemo(() => getMyGigs(), [refreshKey]);

  /* ─── Filtered gigs ─── */
  const filteredGigs = React.useMemo(() => {
    let gigs = QUICKWORK_GIGS;

    if (activeFilter !== 'All') {
      gigs = gigs.filter((g) => g.category === activeFilter);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      gigs = gigs.filter(
        (g) =>
          g.title.toLowerCase().includes(q) ||
          g.description.toLowerCase().includes(q) ||
          g.employer.toLowerCase().includes(q) ||
          g.skills.some((s) => s.toLowerCase().includes(q))
      );
    }

    return gigs;
  }, [activeFilter, searchQuery]);

  /* ─── Derived gig lists for tabs ─── */
  const availableGigs = React.useMemo(
    () => filteredGigs.filter((g) => !appliedIds.includes(g.id)),
    [filteredGigs, appliedIds]
  );

  const appliedGigs = React.useMemo(
    () => QUICKWORK_GIGS.filter((g) => appliedIds.includes(g.id)),
    [appliedIds]
  );

  const completedGigIds = React.useMemo(
    () => myGigs.filter((g) => g.status === 'completed' || g.status === 'reviewed').map((g) => g.gigId),
    [myGigs]
  );

  const inProgressGigIds = React.useMemo(
    () => myGigs.filter((g) => g.status === 'in-progress').map((g) => g.gigId),
    [myGigs]
  );

  const completedGigs = React.useMemo(
    () => QUICKWORK_GIGS.filter((g) => completedGigIds.includes(g.id)),
    [completedGigIds]
  );

  /* ─── Actions ─── */
  const showToast = React.useCallback((message: string, type: ToastType = 'success') => {
    const toast: Toast = { id: generateId(), message, type };
    setToasts((prev) => [...prev, toast]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== toast.id));
    }, 3500);
  }, []);

  const handleApply = React.useCallback(
    (gig: QuickWorkGig) => {
      setSelectedGig(gig);
      setIsApplyModalOpen(true);
    },
    []
  );

  const submitApplication = React.useCallback(() => {
    if (!selectedGig) return;
    applyToGig(selectedGig.id);
    updateGigStatus(selectedGig.id, 'applied');
    awardWriPoints('quickwork-applied');
    setIsApplyModalOpen(false);
    setSelectedGig(null);
    setRefreshKey((k) => k + 1);
    showToast(`Application submitted for "${selectedGig.title}"!`);
  }, [selectedGig, showToast]);

  const handleMarkComplete = React.useCallback(
    (gigId: string) => {
      updateGigStatus(gigId, 'completed');
      awardWriPoints('quickwork-completed');
      setRefreshKey((k) => k + 1);
      showToast('Gig marked as complete! Request a review from your client.');
    },
    [showToast]
  );

  const handleRequestReview = React.useCallback(
    (gigId: string) => {
      updateGigStatus(gigId, 'reviewed');
      setRefreshKey((k) => k + 1);
      showToast('Review requested! Your client will be notified.');
    },
    [showToast]
  );

  const handleStartGig = React.useCallback(
    (gigId: string) => {
      updateGigStatus(gigId, 'in-progress');
      setRefreshKey((k) => k + 1);
      showToast('Gig started! Good luck with your work.');
    },
    [showToast]
  );

  /* ─── Stats ─── */
  const stats = React.useMemo(
    () => [
      { icon: <Briefcase size={22} />, value: 120, suffix: '+', label: 'Active Gigs' },
      { icon: <CheckCircle2 size={22} />, value: 2400, suffix: '+', label: 'Completed' },
      { icon: <Star size={22} />, value: 4.7, suffix: '', label: 'Avg Rating' },
    ],
    []
  );

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white">
      {/* ═══════════════════════════════════
          HERO SECTION
          ═══════════════════════════════════ */}
      <section className="relative overflow-hidden pt-16 pb-20 px-4 sm:px-6 lg:px-8">
        {/* Subtle background glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-[#C6FF34]/[0.03] blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full bg-[#7E3BED]/[0.04] blur-[100px] pointer-events-none" />

        <div className="max-w-6xl mx-auto relative z-10">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.19, 1, 0.22, 1] }}
          >
            <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#C6FF34] mb-4 font-body">
              <Zap size={14} />
              QuickWork™
            </span>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-4 leading-tight font-display">
              Project-based <span className="gradient-text">opportunities.</span>
              <br />
              Immediate income.
            </h1>
            <p className="text-base sm:text-lg text-[#A0A0A0] max-w-xl mx-auto leading-relaxed font-body">
              Pick up quick gigs that match your skills. Complete them in 2–14 days, get paid, 
              and build your reputation with client reviews.
            </p>
          </motion.div>

          {/* Stats */}
          <motion.div
            className="grid grid-cols-3 gap-4 max-w-xl mx-auto"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2, ease: [0.19, 1, 0.22, 1] }}
          >
            {stats.map((stat, i) => (
              <div
                key={i}
                className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.06] rounded-2xl p-4 sm:p-5 text-center"
              >
                <div className="flex justify-center mb-2 text-[#C6FF34]">{stat.icon}</div>
                <div className="text-2xl sm:text-3xl font-bold font-display">
                  {stat.value === 4.7 ? (
                    <span className="gradient-text">{stat.value}{stat.suffix}</span>
                  ) : (
                    <AnimatedCounter target={stat.value} suffix={stat.suffix} />
                  )}
                </div>
                <div className="text-xs text-[#666666] mt-1 font-body">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════
          MAIN CONTENT
          ═══════════════════════════════════ */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
        {/* ─── Tabs ─── */}
        <motion.div
          className="flex flex-wrap gap-2 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3, ease: [0.19, 1, 0.22, 1] }}
        >
          {[
            { key: 'available' as ActiveTab, label: 'Available Gigs', icon: <Briefcase size={16} /> },
            { key: 'applications' as ActiveTab, label: 'My Applications', icon: <Send size={16} /> },
            { key: 'completed' as ActiveTab, label: 'Completed', icon: <Award size={16} /> },
          ].map((tab) => {
            const isActive = activeTab === tab.key;
            const count =
              tab.key === 'available'
                ? availableGigs.length
                : tab.key === 'applications'
                ? appliedGigs.length
                : completedGigs.length;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 font-body ${
                  isActive
                    ? 'bg-[#C6FF34] text-black'
                    : 'bg-white/[0.03] border border-white/[0.06] text-[#A0A0A0] hover:text-white hover:bg-white/[0.06]'
                }`}
              >
                {tab.icon}
                {tab.label}
                <span
                  className={`ml-1 text-xs px-2 py-0.5 rounded-full ${
                    isActive ? 'bg-black/20 text-black' : 'bg-white/10 text-[#666666]'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </motion.div>

        {/* ─── Available Gigs Tab ─── */}
        {activeTab === 'available' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
          >
            {/* Search + Filter bar */}
            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              {/* Search */}
              <div className="relative flex-1">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#666666]" />
                <StableInput
                  placeholder="Search gigs by title, skill, or employer..."
                  onValueChange={setSearchQuery}
                  className="w-full pl-10 pr-4 py-3 bg-white/[0.03] border border-white/[0.06] rounded-xl text-sm text-white placeholder-[#666666] focus:outline-none focus:border-[#C6FF34]/40 transition-colors font-body"
                />
              </div>

              {/* Category filter chips */}
              <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                <Filter size={16} className="text-[#666666] shrink-0 mt-2.5" />
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setActiveFilter(cat)}
                    className={`shrink-0 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-300 font-body ${
                      activeFilter === cat
                        ? 'bg-[#C6FF34] text-black'
                        : 'bg-white/[0.03] border border-white/[0.06] text-[#A0A0A0] hover:text-white hover:bg-white/[0.06]'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Gigs Grid */}
            {availableGigs.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <AnimatePresence mode="popLayout">
                  {availableGigs.map((gig, index) => (
                    <GigCard
                      key={gig.id}
                      gig={gig}
                      index={index}
                      onApply={handleApply}
                      isApplied={false}
                    />
                  ))}
                </AnimatePresence>
              </div>
            ) : (
              <EmptyState
                icon={<Search size={40} />}
                title="No gigs found"
                description={
                  searchQuery
                    ? `No gigs match "${searchQuery}". Try a different search term.`
                    : activeFilter !== 'All'
                    ? `No gigs available in ${activeFilter}. Try another category.`
                    : "No gigs available right now. Check back soon!"
                }
              />
            )}
          </motion.div>
        )}

        {/* ─── My Applications Tab ─── */}
        {activeTab === 'applications' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
          >
            {appliedGigs.length > 0 ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {appliedGigs.map((gig, index) => {
                    const myStatus = myGigs.find((g) => g.gigId === gig.id)?.status;
                    return (
                      <GigCard
                        key={gig.id}
                        gig={gig}
                        index={index}
                        onApply={() => {}}
                        isApplied={true}
                        myStatus={myStatus}
                        onStartGig={handleStartGig}
                      />
                    );
                  })}
                </div>

                {/* In-progress section */}
                {inProgressGigIds.length > 0 && (
                  <div className="mt-8">
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2 font-display">
                      <Clock size={18} className="text-[#C6FF34]" />
                      In Progress
                    </h3>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      {QUICKWORK_GIGS.filter((g) => inProgressGigIds.includes(g.id)).map(
                        (gig, index) => (
                          <GigCard
                            key={gig.id}
                            gig={gig}
                            index={index}
                            onApply={() => {}}
                            isApplied={true}
                            myStatus="in-progress"
                            onMarkComplete={handleMarkComplete}
                          />
                        )
                      )}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <EmptyState
                icon={<Send size={40} />}
                title="No applications yet"
                description="Browse available gigs and apply to start earning. Every application is a step toward building your freelance career."
                action={
                  <button
                    onClick={() => setActiveTab('available')}
                    className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 bg-[#C6FF34] text-black rounded-xl text-sm font-semibold hover:bg-[#d4ff5c] transition-colors font-body"
                  >
                    <Briefcase size={16} />
                    Browse Gigs
                  </button>
                }
              />
            )}
          </motion.div>
        )}

        {/* ─── Completed Tab ─── */}
        {activeTab === 'completed' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
          >
            {completedGigs.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {completedGigs.map((gig, index) => {
                  const myGigData = myGigs.find((g) => g.gigId === gig.id);
                  return (
                    <GigCard
                      key={gig.id}
                      gig={gig}
                      index={index}
                      onApply={() => {}}
                      isApplied={true}
                      myStatus={myGigData?.status}
                      onRequestReview={handleRequestReview}
                      clientRating={myGigData?.clientRating}
                    />
                  );
                })}
              </div>
            ) : (
              <EmptyState
                icon={<Award size={40} />}
                title="No completed gigs yet"
                description="Complete your first gig to see it here. Each completed gig builds your portfolio and unlocks new opportunities."
              />
            )}
          </motion.div>
        )}
      </section>

      {/* ═══════════════════════════════════
          APPLY MODAL
          ═══════════════════════════════════ */}
      <AnimatePresence>
        {isApplyModalOpen && selectedGig && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => {
              setIsApplyModalOpen(false);
              setSelectedGig(null);
            }}
          >
            <motion.div
              className="bg-[#111111] border border-white/[0.08] rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
              initial={{ opacity: 0, y: 40, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 40, scale: 0.95 }}
              transition={{ duration: 0.4, ease: [0.19, 1, 0.22, 1] }}
              onClick={(e: React.MouseEvent) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="p-6 pb-4 border-b border-white/[0.06]">
                <div className="flex items-start justify-between">
                  <div>
                    <span
                      className={`inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-lg border ${
                        CATEGORY_COLORS[selectedGig.category] || 'bg-white/10 text-[#A0A0A0]'
                      }`}
                    >
                      {CATEGORY_ICON[selectedGig.category]}
                      {selectedGig.category}
                    </span>
                    <h3 className="text-xl font-bold text-white mt-3 font-display">
                      {selectedGig.title}
                    </h3>
                  </div>
                  <button
                    onClick={() => {
                      setIsApplyModalOpen(false);
                      setSelectedGig(null);
                    }}
                    className="p-2 rounded-lg bg-white/[0.03] border border-white/[0.06] text-[#666666] hover:text-white hover:bg-white/[0.08] transition-all"
                  >
                    <X size={18} />
                  </button>
                </div>

                {/* Gig quick info */}
                <div className="flex flex-wrap gap-3 mt-4">
                  <div className="flex items-center gap-1.5 text-sm text-[#A0A0A0]">
                    <CircleDollarSign size={14} className="text-[#C6FF34]" />
                    <span className="font-semibold text-white">{selectedGig.budget}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-sm text-[#A0A0A0]">
                    <Clock size={14} className="text-[#7E3BED]" />
                    {selectedGig.duration}
                  </div>
                  <div className="flex items-center gap-1.5 text-sm text-[#A0A0A0]">
                    <MapPin size={14} className="text-[#7E3BED]" />
                    {selectedGig.location}
                  </div>
                  <div className="flex items-center gap-1.5 text-sm text-[#A0A0A0]">
                    <Users size={14} className="text-[#7E3BED]" />
                    {selectedGig.applicants} applicants
                  </div>
                </div>
              </div>

              {/* Modal Body */}
              <div className="p-6 space-y-5">
                <p className="text-sm text-[#A0A0A0] leading-relaxed font-body">
                  {selectedGig.description}
                </p>

                {/* Skills */}
                <div>
                  <label className="text-xs font-medium text-[#666666] uppercase tracking-wider mb-2 block font-body">
                    Required Skills
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {selectedGig.skills.map((skill) => (
                      <span
                        key={skill}
                        className="px-2.5 py-1 bg-white/[0.04] border border-white/[0.06] rounded-lg text-xs text-[#A0A0A0] font-body"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Application Form */}
                <div className="space-y-4 pt-2">
                  <div>
                    <label className="text-xs font-medium text-[#666666] uppercase tracking-wider mb-2 block font-body">
                      Why are you right for this gig? <span className="text-[#C6FF34]">*</span>
                    </label>
                    <StableTextarea
                      placeholder="Tell the client why you're the perfect fit. Mention relevant experience, skills, and your approach to this project..."
                      rows={4}
                      className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.06] rounded-xl text-sm text-white placeholder-[#666666] focus:outline-none focus:border-[#C6FF34]/40 resize-none transition-colors font-body"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-medium text-[#666666] uppercase tracking-wider mb-2 block font-body">
                        Proposed Rate
                      </label>
                      <StableInput
                        placeholder="e.g., ZMW 2,000"
                        className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.06] rounded-xl text-sm text-white placeholder-[#666666] focus:outline-none focus:border-[#C6FF34]/40 transition-colors font-body"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-[#666666] uppercase tracking-wider mb-2 block font-body">
                        Availability
                      </label>
                      <StableSelect
                        className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.06] rounded-xl text-sm text-white focus:outline-none focus:border-[#C6FF34]/40 transition-colors font-body appearance-none"
                      >
                        <option value="">Select...</option>
                        <option value="immediate">Immediate</option>
                        <option value="3-days">Within 3 days</option>
                        <option value="1-week">Within 1 week</option>
                        <option value="2-weeks">Within 2 weeks</option>
                      </StableSelect>
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-6 pt-4 border-t border-white/[0.06] flex gap-3">
                <button
                  onClick={() => {
                    setIsApplyModalOpen(false);
                    setSelectedGig(null);
                  }}
                  className="flex-1 px-4 py-3 bg-white/[0.03] border border-white/[0.06] rounded-xl text-sm font-medium text-[#A0A0A0] hover:text-white hover:bg-white/[0.06] transition-all font-body"
                >
                  Cancel
                </button>
                <button
                  onClick={submitApplication}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-[#C6FF34] text-black rounded-xl text-sm font-semibold hover:bg-[#d4ff5c] transition-all font-body"
                >
                  <Send size={16} />
                  Submit Application
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══════════════════════════════════
          TOAST NOTIFICATIONS
          ═══════════════════════════════════ */}
      <div className="fixed bottom-6 right-6 z-[60] space-y-3">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              className={`flex items-center gap-3 px-5 py-3.5 rounded-xl text-sm font-medium shadow-2xl border font-body ${
                toast.type === 'success'
                  ? 'bg-[#C6FF34] text-black border-[#C6FF34]'
                  : toast.type === 'error'
                  ? 'bg-red-500 text-white border-red-500'
                  : 'bg-[#7E3BED] text-white border-[#7E3BED]'
              }`}
              initial={{ opacity: 0, x: 60, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 60, scale: 0.9 }}
              transition={{ duration: 0.35, ease: [0.19, 1, 0.22, 1] }}
            >
              {toast.type === 'success' && <CheckCircle2 size={16} />}
              {toast.type === 'error' && <AlertCircle size={16} />}
              {toast.type === 'info' && <Sparkles size={16} />}
              {toast.message}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   GIG CARD COMPONENT
   ═══════════════════════════════════════════ */
interface GigCardProps {
  gig: QuickWorkGig;
  index: number;
  onApply: (gig: QuickWorkGig) => void;
  isApplied: boolean;
  myStatus?: string;
  onStartGig?: (gigId: string) => void;
  onMarkComplete?: (gigId: string) => void;
  onRequestReview?: (gigId: string) => void;
  clientRating?: number;
}

function GigCard({
  gig,
  index,
  onApply,
  isApplied,
  myStatus,
  onStartGig,
  onMarkComplete,
  onRequestReview,
  clientRating,
}: GigCardProps) {
  const daysLeft = getDaysLeft(gig.deadline);
  const isFeatured = gig.applicants < 8;
  const isUrgent = daysLeft <= 3;

  return (
    <motion.div
      className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.06] rounded-2xl p-5 sm:p-6 hover:border-white/[0.12] transition-all duration-300 group relative"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5, delay: index * 0.06, ease: [0.19, 1, 0.22, 1] }}
      layout
    >
      {/* Featured / Urgent badge */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-2">
          <span
            className={`inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-lg border ${
              CATEGORY_COLORS[gig.category] || 'bg-white/10 text-[#A0A0A0]'
            }`}
          >
            {CATEGORY_ICON[gig.category]}
            {gig.category}
          </span>
          {isFeatured && !isApplied && (
            <span className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider px-2 py-1 rounded-lg bg-[#C6FF34]/20 text-[#C6FF34] border border-[#C6FF34]/30">
              <Sparkles size={10} />
              Featured
            </span>
          )}
          {isUrgent && !isApplied && (
            <span className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider px-2 py-1 rounded-lg bg-red-500/20 text-red-400 border border-red-500/30">
              <Clock size={10} />
              Urgent
            </span>
          )}
        </div>

        {/* Status badge */}
        {isApplied && myStatus && (
          <StatusBadge status={myStatus} />
        )}
      </div>

      {/* Title */}
      <h3 className="text-lg font-bold text-white mb-2 font-display group-hover:text-[#C6FF34] transition-colors">
        {gig.title}
      </h3>

      {/* Employer + Rating */}
      <div className="flex items-center gap-3 mb-4">
        <div className="flex items-center gap-1.5">
          <div className="w-6 h-6 rounded-full bg-[#C6FF34]/20 flex items-center justify-center text-[#C6FF34] text-xs font-bold">
            {gig.employer.charAt(0)}
          </div>
          <span className="text-sm text-[#A0A0A0] font-body">{gig.employer}</span>
        </div>
        <div className="flex items-center gap-1">
          <Star size={13} className="text-[#C6FF34]" fill="#C6FF34" />
          <span className="text-sm text-white font-medium font-body">{gig.employerRating}</span>
        </div>
      </div>

      {/* Budget */}
      <div className="mb-4">
        <div className="flex items-baseline gap-1">
          <CircleDollarSign size={18} className="text-[#C6FF34]" />
          <span className="text-2xl font-bold text-white font-display">{gig.budget}</span>
        </div>
      </div>

      {/* Meta row */}
      <div className="flex flex-wrap items-center gap-3 text-xs text-[#666666] mb-4 font-body">
        <div className="flex items-center gap-1">
          <Clock size={12} />
          {gig.duration}
        </div>
        <div className="flex items-center gap-1">
          <MapPin size={12} />
          {gig.location}
        </div>
        <div className="flex items-center gap-1">
          <Calendar size={12} />
          {daysLeft} days left
        </div>
        <div className="flex items-center gap-1">
          <Users size={12} />
          {gig.applicants} applicants
        </div>
      </div>

      {/* Skills */}
      <div className="flex flex-wrap gap-1.5 mb-5">
        {gig.skills.map((skill) => (
          <span
            key={skill}
            className="px-2 py-0.5 bg-white/[0.04] border border-white/[0.06] rounded-md text-[11px] text-[#A0A0A0] font-body"
          >
            {skill}
          </span>
        ))}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2">
        {!isApplied ? (
          <>
            <button
              onClick={() => onApply(gig)}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-[#C6FF34] text-black rounded-xl text-sm font-semibold hover:bg-[#d4ff5c] transition-all font-body"
            >
              <Send size={14} />
              Apply Now
            </button>
            <button className="px-3 py-2.5 bg-white/[0.03] border border-white/[0.06] rounded-xl text-[#A0A0A0] hover:text-white hover:bg-white/[0.08] transition-all">
              <ChevronRight size={16} />
            </button>
          </>
        ) : myStatus === 'applied' ? (
          <button
            onClick={() => onStartGig?.(gig.id)}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-[#7E3BED] text-white rounded-xl text-sm font-semibold hover:bg-[#8f55f0] transition-all font-body"
          >
            <Zap size={14} />
            Start Gig
          </button>
        ) : myStatus === 'in-progress' ? (
          <button
            onClick={() => onMarkComplete?.(gig.id)}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-[#C6FF34] text-black rounded-xl text-sm font-semibold hover:bg-[#d4ff5c] transition-all font-body"
          >
            <CheckCircle2 size={14} />
            Mark as Complete
          </button>
        ) : myStatus === 'completed' ? (
          <button
            onClick={() => onRequestReview?.(gig.id)}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-[#7E3BED] text-white rounded-xl text-sm font-semibold hover:bg-[#8f55f0] transition-all font-body"
          >
            <Star size={14} />
            Request Review
          </button>
        ) : myStatus === 'reviewed' ? (
          <div className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-white/[0.03] border border-[#C6FF34]/20 rounded-xl text-sm text-[#C6FF34] font-body">
            <CheckCircle2 size={14} />
            Review Received
            {clientRating !== undefined && (
              <span className="flex items-center gap-1 ml-1">
                <Star size={12} fill="#C6FF34" className="text-[#C6FF34]" />
                {clientRating}
              </span>
            )}
          </div>
        ) : null}
      </div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════
   STATUS BADGE
   ═══════════════════════════════════════════ */
function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    applied: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    'in-progress': 'bg-[#C6FF34]/20 text-[#C6FF34] border-[#C6FF34]/30',
    completed: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    reviewed: 'bg-[#7E3BED]/20 text-[#7E3BED] border-[#7E3BED]/30',
  };

  const labels: Record<string, string> = {
    applied: 'Applied',
    'in-progress': 'In Progress',
    completed: 'Completed',
    reviewed: 'Reviewed',
  };

  return (
    <span
      className={`inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-lg border ${
        styles[status] || 'bg-white/10 text-[#A0A0A0]'
      }`}
    >
      {status === 'in-progress' && <Clock size={10} />}
      {status === 'completed' && <CheckCircle2 size={10} />}
      {status === 'reviewed' && <Star size={10} />}
      {labels[status] || status}
    </span>
  );
}

/* ═══════════════════════════════════════════
   EMPTY STATE COMPONENT
   ═══════════════════════════════════════════ */
interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
}

function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <motion.div
      className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.06] rounded-2xl p-12 text-center"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.19, 1, 0.22, 1] }}
    >
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/[0.03] border border-white/[0.06] text-[#666666] mb-4">
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-white mb-2 font-display">{title}</h3>
      <p className="text-sm text-[#666666] max-w-md mx-auto leading-relaxed font-body">
        {description}
      </p>
      {action}
    </motion.div>
  );
}
