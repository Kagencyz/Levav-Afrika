import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Trophy,
  Clock,
  CheckCircle2,
  XCircle,
  Search,
  Eye,
  ShieldCheck,
  Loader2,
  Filter,
  ChevronDown,
  Users,
  Award,
  BookOpen,
  Calendar,
  ArrowLeft,
  ThumbsUp,
  ThumbsDown,
  Mail,
  Briefcase,
  Globe,
  GraduationCap,
  Sparkles,
  FileText,
} from "lucide-react";
import { safeJSONParse } from "@/lib/safeJSON";
import { StableTextarea } from "@/components/StableInputs";

/* ═══════════════════════════════════════════════════════════════
   TYPES
   ═══════════════════════════════════════════════════════════════ */

interface ChampionApplication {
  id: string;
  applicantName: string;
  applicantEmail: string;
  profession: string;
  yearsOfExperience: string;
  expertise: string;
  bio: string;
  linkedinUrl: string;
  courseTitle: string;
  courseDescription: string;
  targetAudience: string;
  motivation: string;
  status: "pending" | "approved" | "rejected";
  submittedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  reviewNotes?: string;
}

type StatusFilter = "all" | "pending" | "approved" | "rejected";

/* ═══════════════════════════════════════════════════════════════
   STORAGE HELPERS
   ═══════════════════════════════════════════════════════════════ */

const STORAGE_KEY = "champion_applications";

function getApplications(): ChampionApplication[] {
  return safeJSONParse<ChampionApplication[]>(STORAGE_KEY, []);
}

function updateApplicationStatus(
  id: string,
  status: "approved" | "rejected",
  notes?: string
) {
  const apps = getApplications();
  const idx = apps.findIndex((a) => a.id === id);
  if (idx !== -1) {
    apps[idx] = {
      ...apps[idx],
      status,
      reviewedAt: new Date().toISOString(),
      reviewNotes: notes || apps[idx].reviewNotes,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(apps));
  }
  return apps;
}

/* ═══════════════════════════════════════════════════════════════
   ANIMATION VARIANTS
   ═══════════════════════════════════════════════════════════════ */

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.06, duration: 0.6, ease: [0.19, 1, 0.22, 1] },
  }),
};

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.05, delayChildren: 0.1 } },
};

/* ═══════════════════════════════════════════════════════════════
   GLASS CARD CLASS
   ═══════════════════════════════════════════════════════════════ */

const glassCard =
  "bg-white/[0.03] backdrop-blur-xl border border-white/[0.06] rounded-2xl";

/* ═══════════════════════════════════════════════════════════════
   STATUS BADGE
   ═══════════════════════════════════════════════════════════════ */

function StatusBadge({ status }: { status: ChampionApplication["status"] }) {
  const config = {
    pending: {
      color: "#eab308",
      bg: "rgba(234,179,8,0.1)",
      label: "Pending",
      icon: Clock,
    },
    approved: {
      color: "#C6FF34",
      bg: "rgba(198,255,52,0.1)",
      label: "Approved",
      icon: CheckCircle2,
    },
    rejected: {
      color: "#ef4444",
      bg: "rgba(239,68,68,0.1)",
      label: "Rejected",
      icon: XCircle,
    },
  };
  const c = config[status];
  const Icon = c.icon;

  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium"
      style={{ backgroundColor: c.bg, color: c.color }}
    >
      <Icon className="w-3 h-3" />
      {c.label}
    </span>
  );
}

/* ═══════════════════════════════════════════════════════════════
   KPI CARD
   ═══════════════════════════════════════════════════════════════ */

function KpiCard({
  title,
  value,
  subtitle,
  icon: Icon,
  color,
  index,
}: {
  title: string;
  value: string | number;
  subtitle: string;
  icon: React.ElementType;
  color: string;
  index: number;
}) {
  return (
    <motion.div
      className={`${glassCard} p-6 hover:border-white/[0.1] transition-all`}
      variants={fadeUp}
      custom={index}
    >
      <div className="flex items-start justify-between mb-4">
        <div
          className="w-11 h-11 rounded-xl flex items-center justify-center"
          style={{ backgroundColor: `${color}15` }}
        >
          <Icon className="w-5 h-5" style={{ color }} />
        </div>
      </div>
      <p className="text-[#666666] text-xs uppercase tracking-wider mb-1">
        {title}
      </p>
      <p className="text-white text-3xl font-semibold mb-1">{value}</p>
      <p className="text-[#666666] text-xs">{subtitle}</p>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   YEARS LABEL
   ═══════════════════════════════════════════════════════════════ */

function yearsLabel(value: string): string {
  const map: Record<string, string> = {
    "5-7": "5 - 7 years",
    "8-10": "8 - 10 years",
    "11-15": "11 - 15 years",
    "16-20": "16 - 20 years",
    "20+": "20+ years",
  };
  return map[value] || value;
}

/* ═══════════════════════════════════════════════════════════════
   FORMAT DATE
   ═══════════════════════════════════════════════════════════════ */

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

/* ═══════════════════════════════════════════════════════════════
   CONFIRMATION MODAL
   ═══════════════════════════════════════════════════════════════ */

function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel,
  confirmColor,
  isLoading,
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel: string;
  confirmColor: string;
  isLoading: boolean;
}) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          onClick={(e) => e.stopPropagation()}
          className={`${glassCard} p-6 max-w-md w-full mx-4`}
        >
          <h3 className="text-white text-lg font-semibold mb-2">{title}</h3>
          <p className="text-[#A0A0A0] text-sm mb-6">{message}</p>
          <div className="flex items-center justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-white/[0.12] text-white text-sm font-medium hover:bg-white/[0.05] transition-all"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={isLoading}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-medium transition-all"
              style={{
                backgroundColor: confirmColor,
                color: confirmColor === "#C6FF34" ? "#000" : "#fff",
                opacity: isLoading ? 0.6 : 1,
              }}
            >
              {isLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              {confirmLabel}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

/* ═══════════════════════════════════════════════════════════════
   DETAIL MODAL
   ═══════════════════════════════════════════════════════════════ */

function DetailModal({
  application,
  onClose,
  onApprove,
  onReject,
}: {
  application: ChampionApplication;
  onClose: () => void;
  onApprove: (id: string, notes?: string) => void;
  onReject: (id: string, notes?: string) => void;
}) {
  const [notes, setNotes] = React.useState(application.reviewNotes || "");
  const [action, setAction] = React.useState<"approve" | "reject" | null>(
    null
  );
  const [processing, setProcessing] = React.useState(false);

  const handleConfirmAction = () => {
    setProcessing(true);
    setTimeout(() => {
      if (action === "approve") {
        onApprove(application.id, notes);
      } else {
        onReject(application.id, notes);
      }
      setProcessing(false);
      onClose();
    }, 600);
  };

  const infoRows = [
    { label: "Name", value: application.applicantName, icon: Users },
    { label: "Email", value: application.applicantEmail, icon: Mail },
    { label: "Profession", value: application.profession, icon: Briefcase },
    {
      label: "Experience",
      value: yearsLabel(application.yearsOfExperience),
      icon: Award,
    },
    {
      label: "Expertise",
      value: application.expertise,
      icon: BookOpen,
    },
    {
      label: "LinkedIn",
      value: application.linkedinUrl,
      icon: Globe,
      isLink: true,
    },
    {
      label: "Course Title",
      value: application.courseTitle,
      icon: BookOpen,
    },
    {
      label: "Target Audience",
      value: application.targetAudience,
      icon: Users,
    },
    {
      label: "Submitted",
      value: formatDate(application.submittedAt),
      icon: Calendar,
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 backdrop-blur-sm overflow-y-auto py-8"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 30, scale: 0.97 }}
        transition={{ duration: 0.3, ease: [0.19, 1, 0.22, 1] }}
        onClick={(e) => e.stopPropagation()}
        className={`${glassCard} max-w-2xl w-full mx-4 my-auto overflow-hidden`}
      >
        {/* Header */}
        <div className="p-6 border-b border-white/[0.06] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-white/[0.05] text-[#666666] hover:text-white transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <h2 className="text-white text-lg font-semibold">
                Application Details
              </h2>
              <p className="text-[#666666] text-xs">
                ID: {application.id}
              </p>
            </div>
          </div>
          <StatusBadge status={application.status} />
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
          {/* Info Grid */}
          <div className="grid sm:grid-cols-2 gap-3">
            {infoRows.map((row) => {
              const Icon = row.icon;
              return (
                <div
                  key={row.label}
                  className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"
                >
                  <div className="flex items-center gap-1.5 mb-1">
                    <Icon className="w-3 h-3 text-[#666666]" />
                    <span className="text-[#666666] text-[10px] uppercase tracking-wider">
                      {row.label}
                    </span>
                  </div>
                  {row.isLink ? (
                    <a
                      href={row.value}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#7E3BED] text-sm hover:underline break-all"
                    >
                      {row.value}
                    </a>
                  ) : (
                    <p className="text-white text-sm font-medium">{row.value}</p>
                  )}
                </div>
              );
            })}
          </div>

          {/* Bio */}
          <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.04]">
            <div className="flex items-center gap-2 mb-2">
              <FileText className="w-4 h-4 text-[#7E3BED]" />
              <span className="text-white text-sm font-medium">Bio</span>
            </div>
            <p className="text-[#A0A0A0] text-sm leading-relaxed whitespace-pre-wrap">
              {application.bio}
            </p>
          </div>

          {/* Course Description */}
          <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.04]">
            <div className="flex items-center gap-2 mb-2">
              <BookOpen className="w-4 h-4 text-[#C6FF34]" />
              <span className="text-white text-sm font-medium">
                Course Proposal
              </span>
            </div>
            <p className="text-[#A0A0A0] text-sm leading-relaxed whitespace-pre-wrap mb-3">
              {application.courseDescription}
            </p>
          </div>

          {/* Motivation */}
          <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.04]">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-[#eab308]" />
              <span className="text-white text-sm font-medium">Motivation</span>
            </div>
            <p className="text-[#A0A0A0] text-sm leading-relaxed whitespace-pre-wrap">
              {application.motivation}
            </p>
          </div>

          {/* Review Notes */}
          {application.status !== "pending" && (
            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.04]">
              <div className="flex items-center gap-2 mb-2">
                <GraduationCap className="w-4 h-4 text-[#3B82F6]" />
                <span className="text-white text-sm font-medium">
                  Review History
                </span>
              </div>
              <div className="text-[#A0A0A0] text-sm space-y-1">
                <p>
                  Status: <StatusBadge status={application.status} />
                </p>
                {application.reviewedAt && (
                  <p>
                    Reviewed: {formatDate(application.reviewedAt)}
                  </p>
                )}
                {application.reviewNotes && (
                  <p className="text-[#A0A0A0]">
                    Notes: {application.reviewNotes}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Review Notes Input (for pending) */}
          {application.status === "pending" && (
            <div>
              <label className="block text-[#A0A0A0] text-sm font-medium mb-2">
                Review Notes (optional)
              </label>
              <StableTextarea
                value={notes}
                onValueChange={setNotes}
                placeholder="Add any notes about this application..."
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-[#666666] focus:outline-none focus:border-[#C6FF34]/30 transition-colors text-sm min-h-[80px] resize-y"
              />
            </div>
          )}
        </div>

        {/* Actions */}
        {application.status === "pending" && (
          <div className="p-6 border-t border-white/[0.06] flex items-center justify-end gap-3">
            {action === null ? (
              <>
                <button
                  onClick={() => setAction("reject")}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-[#ef4444]/40 text-[#ef4444] text-sm font-medium hover:bg-[#ef4444]/10 transition-all"
                >
                  <ThumbsDown className="w-4 h-4" />
                  Reject
                </button>
                <button
                  onClick={() => setAction("approve")}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#C6FF34] text-black text-sm font-semibold hover:bg-[#d4ff5c] transition-all"
                >
                  <ThumbsUp className="w-4 h-4" />
                  Approve
                </button>
              </>
            ) : (
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setAction(null)}
                  className="px-4 py-2 rounded-xl border border-white/[0.12] text-[#A0A0A0] text-sm hover:text-white transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmAction}
                  disabled={processing}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all disabled:opacity-60"
                  style={{
                    backgroundColor:
                      action === "approve" ? "#C6FF34" : "#ef4444",
                    color: action === "approve" ? "#000" : "#fff",
                  }}
                >
                  {processing ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : action === "approve" ? (
                    <ThumbsUp className="w-4 h-4" />
                  ) : (
                    <ThumbsDown className="w-4 h-4" />
                  )}
                  Confirm{" "}
                  {action === "approve" ? "Approval" : "Rejection"}
                </button>
              </div>
            )}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   MAIN SECTION
   ═══════════════════════════════════════════════════════════════ */

export default function ChampionApplicationsSection() {
  const [applications, setApplications] = React.useState<ChampionApplication[]>([]);
  const [search, setSearch] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<StatusFilter>("all");
  const [showFilters, setShowFilters] = React.useState(false);
  const [viewingApp, setViewingApp] = React.useState<ChampionApplication | null>(
    null
  );
  const [confirmAction, setConfirmAction] = React.useState<{
    id: string;
    action: "approve" | "reject";
  } | null>(null);
  const [processingId, setProcessingId] = React.useState<string | null>(null);

  // Load applications on mount
  React.useEffect(() => {
    setApplications(getApplications());
  }, []);

  // Refresh after action
  const refresh = () => setApplications(getApplications());

  // KPI counts
  const totalApps = applications.length;
  const pendingCount = applications.filter((a) => a.status === "pending").length;
  const approvedCount = applications.filter(
    (a) => a.status === "approved"
  ).length;
  const rejectedCount = applications.filter(
    (a) => a.status === "rejected"
  ).length;

  const handleApprove = (id: string, notes?: string) => {
    setProcessingId(id);
    setTimeout(() => {
      updateApplicationStatus(id, "approved", notes);
      refresh();
      setProcessingId(null);
      setConfirmAction(null);
    }, 500);
  };

  const handleReject = (id: string, notes?: string) => {
    setProcessingId(id);
    setTimeout(() => {
      updateApplicationStatus(id, "rejected", notes);
      refresh();
      setProcessingId(null);
      setConfirmAction(null);
    }, 500);
  };

  // Filter
  const filtered = applications.filter((app) => {
    const matchesSearch =
      search === "" ||
      app.applicantName.toLowerCase().includes(search.toLowerCase()) ||
      app.profession.toLowerCase().includes(search.toLowerCase()) ||
      app.courseTitle.toLowerCase().includes(search.toLowerCase()) ||
      app.expertise.toLowerCase().includes(search.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || app.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Get app for confirmation
  const confirmApp = confirmAction
    ? applications.find((a) => a.id === confirmAction.id)
    : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-white text-2xl font-semibold mb-1 flex items-center gap-2">
          <Trophy className="w-6 h-6 text-[#C6FF34]" />
          Champion Applications
        </h1>
        <p className="text-[#666666] text-sm">
          Review and manage champion program applications.
        </p>
      </div>

      {/* KPI Cards */}
      <motion.div
        className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4"
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
      >
        <KpiCard
          title="Total Applications"
          value={totalApps}
          subtitle="All time submissions"
          icon={Trophy}
          color="#C6FF34"
          index={0}
        />
        <KpiCard
          title="Pending Review"
          value={pendingCount}
          subtitle="Awaiting decision"
          icon={Clock}
          color="#eab308"
          index={1}
        />
        <KpiCard
          title="Approved"
          value={approvedCount}
          subtitle="Champions accepted"
          icon={CheckCircle2}
          color="#C6FF34"
          index={2}
        />
        <KpiCard
          title="Rejected"
          value={rejectedCount}
          subtitle="Not accepted"
          icon={XCircle}
          color="#ef4444"
          index={3}
        />
      </motion.div>

      {/* Data Table */}
      <motion.div
        className={`${glassCard} p-6 hover:border-white/[0.1] transition-all`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
      >
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-white text-lg font-semibold flex items-center gap-2">
              <Users className="w-5 h-5 text-[#7E3BED]" />
              Applications
            </h2>
            <p className="text-[#666666] text-xs mt-0.5">
              {filtered.length} of {totalApps} applications
            </p>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:flex-initial">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#666666]" />
              <input
                type="text"
                placeholder="Search applications..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full sm:w-56 bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-white placeholder-[#666666] focus:outline-none focus:border-[#C6FF34]/30 transition-colors text-sm"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium border transition-all ${
                showFilters
                  ? "border-[#C6FF34]/30 bg-[#C6FF34]/10 text-[#C6FF34]"
                  : "border-white/10 bg-white/5 text-[#A0A0A0] hover:text-white"
              }`}
            >
              <Filter className="w-3.5 h-3.5" />
              Filter
              <ChevronDown
                className={`w-3 h-3 transition-transform ${
                  showFilters ? "rotate-180" : ""
                }`}
              />
            </button>
          </div>
        </div>

        {/* Filter Chips */}
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="flex items-center gap-2 mb-4 pb-4 border-b border-white/[0.04]"
          >
            {(["all", "pending", "approved", "rejected"] as StatusFilter[]).map(
              (s) => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all ${
                    statusFilter === s
                      ? "bg-[#C6FF34] text-black"
                      : "bg-white/5 text-[#A0A0A0] hover:text-white border border-white/10"
                  }`}
                >
                  {s}
                </button>
              )
            )}
          </motion.div>
        )}

        {/* Table */}
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-12 h-12 rounded-xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center mb-3">
              <Trophy className="w-5 h-5 text-[#666666]" />
            </div>
            <p className="text-[#666666] text-sm">
              {totalApps === 0
                ? "No applications yet. Applications will appear here when talent applies."
                : "No applications match your filters."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/[0.06]">
                  <th className="text-left text-[#666666] text-xs font-medium uppercase tracking-wider px-4 py-3">
                    Applicant
                  </th>
                  <th className="text-left text-[#666666] text-xs font-medium uppercase tracking-wider px-4 py-3">
                    Profession
                  </th>
                  <th className="text-left text-[#666666] text-xs font-medium uppercase tracking-wider px-4 py-3">
                    Experience
                  </th>
                  <th className="text-left text-[#666666] text-xs font-medium uppercase tracking-wider px-4 py-3">
                    Course Title
                  </th>
                  <th className="text-left text-[#666666] text-xs font-medium uppercase tracking-wider px-4 py-3">
                    Submitted
                  </th>
                  <th className="text-left text-[#666666] text-xs font-medium uppercase tracking-wider px-4 py-3">
                    Status
                  </th>
                  <th className="text-left text-[#666666] text-xs font-medium uppercase tracking-wider px-4 py-3">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {filtered.map((app, i) => (
                    <motion.tr
                      key={app.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ delay: i * 0.04, duration: 0.3 }}
                      className="border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors"
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#C6FF34] to-[#7E3BED] flex items-center justify-center text-black text-xs font-bold flex-shrink-0">
                            {app.applicantName
                              .split(" ")
                              .map((n) => n[0])
                              .join("")
                              .slice(0, 2)}
                          </div>
                          <div>
                            <span className="text-white text-sm font-medium block">
                              {app.applicantName}
                            </span>
                            <span className="text-[#666666] text-[10px]">
                              {app.expertise}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-[#A0A0A0] text-sm">
                          {app.profession}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-[#A0A0A0] text-xs">
                          {yearsLabel(app.yearsOfExperience)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-[#A0A0A0] text-sm truncate max-w-[180px] block">
                          {app.courseTitle}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-[#666666] text-xs">
                          {formatDate(app.submittedAt)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={app.status} />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => setViewingApp(app)}
                            className="p-1.5 rounded-lg hover:bg-white/[0.05] text-[#666666] hover:text-white transition-all"
                            title="View details"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          {app.status === "pending" && (
                            <>
                              <button
                                onClick={() =>
                                  setConfirmAction({
                                    id: app.id,
                                    action: "approve",
                                  })
                                }
                                disabled={processingId === app.id}
                                className="p-1.5 rounded-lg hover:bg-[#C6FF34]/10 text-[#666666] hover:text-[#C6FF34] transition-all"
                                title="Approve"
                              >
                                {processingId === app.id ? (
                                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                ) : (
                                  <ShieldCheck className="w-3.5 h-3.5" />
                                )}
                              </button>
                              <button
                                onClick={() =>
                                  setConfirmAction({
                                    id: app.id,
                                    action: "reject",
                                  })
                                }
                                disabled={processingId === app.id}
                                className="p-1.5 rounded-lg hover:bg-red-500/10 text-[#666666] hover:text-red-400 transition-all"
                                title="Reject"
                              >
                                <XCircle className="w-3.5 h-3.5" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        )}
      </motion.div>

      {/* Detail Modal */}
      <AnimatePresence>
        {viewingApp && (
          <DetailModal
            application={viewingApp}
            onClose={() => setViewingApp(null)}
            onApprove={handleApprove}
            onReject={handleReject}
          />
        )}
      </AnimatePresence>

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={confirmAction !== null}
        onClose={() => setConfirmAction(null)}
        onConfirm={() => {
          if (confirmAction) {
            if (confirmAction.action === "approve") {
              handleApprove(confirmAction.id);
            } else {
              handleReject(confirmAction.id);
            }
          }
        }}
        title={
          confirmAction?.action === "approve"
            ? "Approve Application"
            : "Reject Application"
        }
        message={
          confirmApp
            ? `Are you sure you want to ${confirmAction?.action} the application from ${confirmApp.applicantName}? This action cannot be undone.`
            : "Are you sure?"
        }
        confirmLabel={
          confirmAction?.action === "approve" ? "Approve" : "Reject"
        }
        confirmColor={
          confirmAction?.action === "approve" ? "#C6FF34" : "#ef4444"
        }
        isLoading={processingId === confirmAction?.id}
      />
    </div>
  );
}
