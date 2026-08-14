import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Heart,
  Users,
  Globe,
  Award,
  ArrowRight,
  Sparkles,
  TrendingUp,
  HandHeart,
  TreePine,
  School,
  Stethoscope,
  Search,
  MapPin,
  Clock,
  Send,
  X,
  CheckCircle2,
  AlertCircle,
  PlusCircle,
  Briefcase,
  ClipboardList,
  LayoutDashboard,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { StableInput, StableTextarea, StableSelect } from "@/components/StableInputs";
import {
  IMPACT_OPPORTUNITIES,
  getPostedOpportunities,
  postOpportunity,
  toggleOpportunityStatus,
  getImpactApplicants,
  applyToOpportunity,
  updateApplicantStatus,
} from "@/lib/levavData";
import type { ImpactOpportunity, ImpactApplicant } from "@/lib/levavData";
import { useAuth } from "@/hooks/useAuth";

/* ───────────────────── Animation Variants ───────────────────── */
const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.7, ease: [0.19, 1, 0.22, 1] },
  }),
};

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12, delayChildren: 0.1 } },
};

const scaleUp = {
  hidden: { opacity: 0, scale: 0.92 },
  visible: (i: number) => ({
    opacity: 1,
    scale: 1,
    transition: { delay: i * 0.1, duration: 0.6, ease: [0.19, 1, 0.22, 1] },
  }),
};

/* ───────────────────── Pillars ───────────────────── */
const pillars = [
  {
    icon: Heart,
    title: "Service",
    color: "#C6FF34",
    desc: "We believe that true leadership begins with service. Every Levav talent is encouraged to contribute their skills to community projects, non-profits, and causes that matter. Through service, we build empathy, understanding, and lasting change.",
    impact: "12,000+ service hours contributed",
  },
  {
    icon: Users,
    title: "Leadership",
    color: "#7E3BED",
    desc: "Africa needs a new generation of leaders — not just in government, but in business, technology, arts, and community organizing. Our leadership development programs identify and nurture emerging leaders across all disciplines.",
    impact: "500+ leadership fellows trained",
  },
  {
    icon: Globe,
    title: "Community",
    color: "#C6FF34",
    desc: "We are stronger together. Levav Impact builds communities of practice where talent connects, collaborates, and lifts each other up. From local meetups to pan-African networks, community is the foundation of everything we do.",
    impact: "85 active community chapters",
  },
  {
    icon: Award,
    title: "Legacy",
    color: "#7E3BED",
    desc: "The work we do today shapes the Africa of tomorrow. We are committed to building lasting impact — programs, institutions, and movements that will continue to serve the continent long after our direct involvement ends.",
    impact: "30+ sustainable programs launched",
  },
];

/* ───────────────────── Partner Types ───────────────────── */
const partnerTypes = [
  { icon: HandHeart, label: "Non-Governmental Organizations (NGOs)" },
  { icon: TrendingUp, label: "Social Enterprises" },
  { icon: School, label: "Educational Institutions" },
  { icon: Stethoscope, label: "Healthcare Organizations" },
  { icon: TreePine, label: "Environmental Initiatives" },
  { icon: Users, label: "Community-Based Organizations" },
];

const OPPORTUNITY_TYPES = ["Education", "Environment", "Technology", "Healthcare", "Leadership", "Infrastructure", "Community", "Other"];
const COMMITMENT_OPTIONS = ["One-time", "Weekly", "Ongoing"];

type HubTab = "browse" | "my-impact" | "post" | "manage";
type ToastType = "success" | "error";
interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

function generateId(): string {
  return Math.random().toString(36).substring(2, 9);
}

/* ───────────────────── Hero ───────────────────── */
function Hero() {
  return (
    <section className="relative min-h-[55vh] flex items-center justify-center overflow-hidden bg-black pt-20">
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[500px] rounded-full opacity-[0.05]"
        style={{ background: "radial-gradient(circle, #C6FF34 0%, transparent 70%)" }}
      />
      <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
        <motion.div
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#C6FF34]/10 border border-[#C6FF34]/20 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.19, 1, 0.22, 1] }}
        >
          <Heart className="w-4 h-4 text-[#C6FF34]" />
          <span className="text-[#C6FF34] text-sm font-medium">Levav Impact</span>
        </motion.div>

        <motion.h1
          className="font-display text-5xl sm:text-6xl lg:text-7xl text-white leading-[1.05] mb-6"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1, ease: [0.19, 1, 0.22, 1] }}
        >
          <span className="bg-gradient-to-r from-[#C6FF34] to-[#7E3BED] bg-clip-text text-transparent">
            Contribution
          </span>{" "}
          Matters
        </motion.h1>

        <motion.p
          className="text-[#A0A0A0] text-lg sm:text-xl max-w-2xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.25, ease: [0.19, 1, 0.22, 1] }}
        >
          At Levav, we believe that capability must be matched with contribution.
          Browse real volunteer opportunities below, or post one if your organization needs hands.
        </motion.p>
      </div>
    </section>
  );
}

/* ───────────────────── Opportunity Card ───────────────────── */
function OpportunityCard({
  opportunity,
  hasApplied,
  onApply,
}: {
  opportunity: ImpactOpportunity;
  hasApplied: boolean;
  onApply: (o: ImpactOpportunity) => void;
}) {
  return (
    <motion.div
      className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.06] rounded-2xl p-5 sm:p-6 hover:border-white/[0.12] transition-all duration-300"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.4 }}
      layout
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-white/[0.05] flex items-center justify-center text-xl shrink-0">
            {opportunity.logo}
          </div>
          <div>
            <h3 className="text-white font-semibold font-display leading-tight">{opportunity.organization}</h3>
            <span className="text-xs text-[#7E3BED] font-medium">{opportunity.type}</span>
          </div>
        </div>
        {opportunity.isOrgPosted && (
          <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-1 rounded-lg bg-[#C6FF34]/10 text-[#C6FF34] border border-[#C6FF34]/20 shrink-0">
            New
          </span>
        )}
      </div>

      <p className="text-sm text-[#A0A0A0] leading-relaxed mb-4 font-body">{opportunity.description}</p>

      <div className="flex flex-wrap items-center gap-3 text-xs text-[#666666] mb-4 font-body">
        <div className="flex items-center gap-1">
          <MapPin size={12} />
          {opportunity.location}
        </div>
        <div className="flex items-center gap-1">
          <Clock size={12} />
          {opportunity.hoursRequired}h{opportunity.commitment ? ` · ${opportunity.commitment}` : ""}
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5 mb-5">
        {opportunity.skills.map((skill) => (
          <span
            key={skill}
            className="px-2 py-0.5 bg-white/[0.04] border border-white/[0.06] rounded-md text-[11px] text-[#A0A0A0] font-body"
          >
            {skill}
          </span>
        ))}
      </div>

      {hasApplied ? (
        <div className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white/[0.03] border border-[#C6FF34]/20 rounded-xl text-sm text-[#C6FF34] font-body">
          <CheckCircle2 size={14} />
          Applied
        </div>
      ) : (
        <button
          onClick={() => onApply(opportunity)}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-[#C6FF34] text-black rounded-xl text-sm font-semibold hover:bg-[#d4ff5c] transition-all font-body"
        >
          <Send size={14} />
          Volunteer
        </button>
      )}
    </motion.div>
  );
}

/* ───────────────────── Empty State ───────────────────── */
function EmptyState({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="text-center py-16 px-6">
      <div className="w-16 h-16 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center text-[#666666] mx-auto mb-4">
        {icon}
      </div>
      <h3 className="text-white font-semibold text-lg mb-2 font-display">{title}</h3>
      <p className="text-[#666666] text-sm max-w-sm mx-auto font-body">{description}</p>
    </div>
  );
}

/* ───────────────────── Opportunity Hub (functional) ───────────────────── */
function OpportunityHub({
  hubRef,
  activeTab,
  setActiveTab,
}: {
  hubRef: React.RefObject<HTMLDivElement | null>;
  activeTab: HubTab;
  setActiveTab: (tab: HubTab) => void;
}) {
  const { user } = useAuth();

  const [searchQuery, setSearchQuery] = React.useState("");
  const [refreshKey, setRefreshKey] = React.useState(0);
  const [selectedOpportunity, setSelectedOpportunity] = React.useState<ImpactOpportunity | null>(null);
  const [isApplyModalOpen, setIsApplyModalOpen] = React.useState(false);
  const [applyMessage, setApplyMessage] = React.useState("");
  const [applyHours, setApplyHours] = React.useState("");
  const [expandedOpportunityId, setExpandedOpportunityId] = React.useState<string | null>(null);
  const [toasts, setToasts] = React.useState<Toast[]>([]);

  const postedOpportunities = React.useMemo(() => getPostedOpportunities(), [refreshKey]);
  const allOpportunities = React.useMemo(
    () => [...postedOpportunities, ...IMPACT_OPPORTUNITIES],
    [postedOpportunities]
  );
  const applicants = React.useMemo(() => getImpactApplicants(), [refreshKey]);

  /* Matches the fallback id used when submitting an application below — a
     signed-out visitor's own applications must still show up for them. */
  const myUserId = user ? String(user.id) : "guest";
  const myApplicantIds = React.useMemo(
    () => applicants.filter((a) => a.applicantUserId === myUserId),
    [applicants, myUserId]
  );

  const browseOpportunities = React.useMemo(() => {
    let list = allOpportunities.filter((o) => o.status !== "closed");
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (o) =>
          o.organization.toLowerCase().includes(q) ||
          o.type.toLowerCase().includes(q) ||
          o.description.toLowerCase().includes(q) ||
          o.skills.some((s) => s.toLowerCase().includes(q))
      );
    }
    return list;
  }, [allOpportunities, searchQuery]);

  const showToast = React.useCallback((message: string, type: ToastType = "success") => {
    const toast: Toast = { id: generateId(), message, type };
    setToasts((prev) => [...prev, toast]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== toast.id)), 3500);
  }, []);

  const handleApplyClick = React.useCallback((opportunity: ImpactOpportunity) => {
    setSelectedOpportunity(opportunity);
    setApplyMessage("");
    setApplyHours(String(opportunity.hoursRequired || ""));
    setIsApplyModalOpen(true);
  }, []);

  const submitApplication = React.useCallback(() => {
    if (!selectedOpportunity) return;
    if (!applyMessage.trim()) {
      showToast("Tell them a little about why you want to help.", "error");
      return;
    }
    applyToOpportunity({
      opportunityId: selectedOpportunity.id,
      applicantUserId: user ? String(user.id) : "guest",
      applicantName: user?.name || user?.firstName || "A Levav volunteer",
      message: applyMessage.trim(),
      hoursCommitted: Number(applyHours) || selectedOpportunity.hoursRequired,
    });
    setIsApplyModalOpen(false);
    setSelectedOpportunity(null);
    setRefreshKey((k) => k + 1);
    showToast(`Application sent to ${selectedOpportunity.organization}.`);
  }, [selectedOpportunity, applyMessage, applyHours, user, showToast]);

  const handleMarkHoursComplete = React.useCallback(
    (applicantId: string) => {
      updateApplicantStatus(applicantId, "completed");
      setRefreshKey((k) => k + 1);
      showToast("Contribution marked complete.");
    },
    [showToast]
  );

  /* ─── Post an Opportunity ─── */
  const [postForm, setPostForm] = React.useState({
    organization: "",
    type: "Education",
    location: "",
    description: "",
    hoursRequired: "",
    commitment: "One-time",
    skills: "",
  });

  const handlePostOpportunity = React.useCallback(() => {
    if (!postForm.organization.trim() || !postForm.description.trim() || !postForm.location.trim() || !postForm.hoursRequired.trim()) {
      showToast("Fill in the organization, description, location, and hours needed.", "error");
      return;
    }
    postOpportunity({
      organization: postForm.organization.trim(),
      type: postForm.type,
      location: postForm.location.trim(),
      description: postForm.description.trim(),
      hoursRequired: Number(postForm.hoursRequired) || 1,
      skills: postForm.skills.split(",").map((s) => s.trim()).filter(Boolean),
      commitment: postForm.commitment,
    });
    setPostForm({ organization: "", type: "Education", location: "", description: "", hoursRequired: "", commitment: "One-time", skills: "" });
    setRefreshKey((k) => k + 1);
    showToast("Opportunity posted! It's live for Levav talent to see.");
    setActiveTab("manage");
  }, [postForm, showToast]);

  const handleToggleStatus = React.useCallback(
    (opportunityId: string) => {
      toggleOpportunityStatus(opportunityId);
      setRefreshKey((k) => k + 1);
    },
    []
  );

  const handleApplicantDecision = React.useCallback(
    (applicantId: string, status: ImpactApplicant["status"]) => {
      updateApplicantStatus(applicantId, status);
      setRefreshKey((k) => k + 1);
      showToast(status === "accepted" ? "Applicant accepted." : "Applicant declined.");
    },
    [showToast]
  );

  const tabs: { key: HubTab; label: string; icon: React.ReactNode; count: number }[] = [
    { key: "browse", label: "Browse", icon: <Search size={15} />, count: browseOpportunities.length },
    { key: "my-impact", label: "My Impact", icon: <ClipboardList size={15} />, count: myApplicantIds.length },
    { key: "post", label: "Post an Opportunity", icon: <PlusCircle size={15} />, count: 0 },
    { key: "manage", label: "Manage", icon: <LayoutDashboard size={15} />, count: postedOpportunities.length },
  ];

  return (
    <section ref={hubRef} className="relative py-20 lg:py-24 bg-black scroll-mt-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Tab bar */}
        <div className="flex flex-wrap items-center gap-2 mb-8">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 font-body ${
                  isActive
                    ? "bg-[#C6FF34] text-black"
                    : "bg-white/[0.03] border border-white/[0.06] text-[#A0A0A0] hover:text-white hover:bg-white/[0.06]"
                }`}
              >
                {tab.icon}
                {tab.label}
                {tab.count > 0 && (
                  <span
                    className={`ml-1 text-xs px-2 py-0.5 rounded-full ${
                      isActive ? "bg-black/20 text-black" : "bg-white/10 text-[#666666]"
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* ─── Browse Tab ─── */}
        {activeTab === "browse" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
            <div className="relative mb-6 max-w-md">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#666666]" />
              <StableInput
                placeholder="Search by cause, skill, or organization..."
                onValueChange={setSearchQuery}
                className="w-full pl-10 pr-4 py-3 bg-white/[0.03] border border-white/[0.06] rounded-xl text-sm text-white placeholder-[#666666] focus:outline-none focus:border-[#C6FF34]/40 transition-colors font-body"
              />
            </div>

            {browseOpportunities.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <AnimatePresence mode="popLayout">
                  {browseOpportunities.map((o) => (
                    <OpportunityCard
                      key={o.id}
                      opportunity={o}
                      hasApplied={myApplicantIds.some((a) => a.opportunityId === o.id)}
                      onApply={handleApplyClick}
                    />
                  ))}
                </AnimatePresence>
              </div>
            ) : (
              <EmptyState
                icon={<Search size={28} />}
                title="No opportunities found"
                description={searchQuery ? `Nothing matches "${searchQuery}". Try another search.` : "Check back soon for new opportunities."}
              />
            )}
          </motion.div>
        )}

        {/* ─── My Impact Tab ─── */}
        {activeTab === "my-impact" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
            {myApplicantIds.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {myApplicantIds.map((applicant) => {
                  const opportunity = allOpportunities.find((o) => o.id === applicant.opportunityId);
                  if (!opportunity) return null;
                  return (
                    <div
                      key={applicant.id}
                      className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.06] rounded-2xl p-5"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="text-white font-semibold font-display">{opportunity.organization}</h3>
                        <span
                          className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-1 rounded-lg border capitalize ${
                            applicant.status === "completed"
                              ? "bg-[#C6FF34]/10 text-[#C6FF34] border-[#C6FF34]/20"
                              : applicant.status === "accepted"
                              ? "bg-[#7E3BED]/10 text-[#A070F0] border-[#7E3BED]/20"
                              : applicant.status === "declined"
                              ? "bg-red-500/10 text-red-400 border-red-500/20"
                              : "bg-white/[0.05] text-[#A0A0A0] border-white/[0.08]"
                          }`}
                        >
                          {applicant.status}
                        </span>
                      </div>
                      <p className="text-xs text-[#666666] mb-4 font-body">
                        {applicant.hoursCommitted}h committed · {opportunity.type}
                      </p>
                      {applicant.status === "accepted" && (
                        <button
                          onClick={() => handleMarkHoursComplete(applicant.id)}
                          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-[#C6FF34] text-black rounded-xl text-sm font-semibold hover:bg-[#d4ff5c] transition-all font-body"
                        >
                          <CheckCircle2 size={14} />
                          Log Hours Complete
                        </button>
                      )}
                      {applicant.status === "completed" && (
                        <div className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white/[0.03] border border-[#C6FF34]/20 rounded-xl text-sm text-[#C6FF34] font-body">
                          <CheckCircle2 size={14} />
                          Contribution Logged
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <EmptyState
                icon={<Heart size={28} />}
                title="No volunteering yet"
                description="Contributing does not raise your WRI on its own. Only verified observations of your work can, in the same way as any other work."
              />
            )}
          </motion.div>
        )}

        {/* ─── Post an Opportunity Tab ─── */}
        {activeTab === "post" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }} className="max-w-2xl">
            <div className="mb-6 p-4 bg-[#C6FF34]/[0.08] border border-[#C6FF34]/20 rounded-xl flex items-start gap-3">
              <HandHeart size={18} className="text-[#C6FF34] shrink-0 mt-0.5" />
              <p className="text-sm text-[#D6F5A8] leading-relaxed font-body">
                Running an NGO, non-profit, or community initiative? List the opportunity here and Levav talent
                looking to contribute can find and apply directly.
              </p>
            </div>

            <div className="space-y-5">
              <div>
                <label className="text-xs font-medium text-[#666666] uppercase tracking-wider mb-2 block font-body">
                  Organization Name <span className="text-[#C6FF34]">*</span>
                </label>
                <StableInput
                  value={postForm.organization}
                  onValueChange={(v) => setPostForm((f) => ({ ...f, organization: v }))}
                  placeholder="e.g., Teach For Zambia"
                  className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.06] rounded-xl text-sm text-white placeholder-[#666666] focus:outline-none focus:border-[#C6FF34]/40 transition-colors font-body"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-[#666666] uppercase tracking-wider mb-2 block font-body">
                  Description <span className="text-[#C6FF34]">*</span>
                </label>
                <StableTextarea
                  value={postForm.description}
                  onValueChange={(v) => setPostForm((f) => ({ ...f, description: v }))}
                  placeholder="What will volunteers actually do? Be specific about the work and the impact."
                  rows={4}
                  className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.06] rounded-xl text-sm text-white placeholder-[#666666] focus:outline-none focus:border-[#C6FF34]/40 resize-none transition-colors font-body"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-[#666666] uppercase tracking-wider mb-2 block font-body">
                    Category
                  </label>
                  <StableSelect
                    value={postForm.type}
                    onValueChange={(v) => setPostForm((f) => ({ ...f, type: v }))}
                    className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.06] rounded-xl text-sm text-white focus:outline-none focus:border-[#C6FF34]/40 transition-colors font-body appearance-none"
                  >
                    {OPPORTUNITY_TYPES.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </StableSelect>
                </div>
                <div>
                  <label className="text-xs font-medium text-[#666666] uppercase tracking-wider mb-2 block font-body">
                    Location <span className="text-[#C6FF34]">*</span>
                  </label>
                  <StableInput
                    value={postForm.location}
                    onValueChange={(v) => setPostForm((f) => ({ ...f, location: v }))}
                    placeholder="Lusaka, Zambia"
                    className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.06] rounded-xl text-sm text-white placeholder-[#666666] focus:outline-none focus:border-[#C6FF34]/40 transition-colors font-body"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-[#666666] uppercase tracking-wider mb-2 block font-body">
                    Hours Needed <span className="text-[#C6FF34]">*</span>
                  </label>
                  <StableInput
                    value={postForm.hoursRequired}
                    onValueChange={(v) => setPostForm((f) => ({ ...f, hoursRequired: v }))}
                    placeholder="e.g., 4"
                    type="number"
                    min={1}
                    className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.06] rounded-xl text-sm text-white placeholder-[#666666] focus:outline-none focus:border-[#C6FF34]/40 transition-colors font-body"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-[#666666] uppercase tracking-wider mb-2 block font-body">
                    Commitment
                  </label>
                  <StableSelect
                    value={postForm.commitment}
                    onValueChange={(v) => setPostForm((f) => ({ ...f, commitment: v }))}
                    className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.06] rounded-xl text-sm text-white focus:outline-none focus:border-[#C6FF34]/40 transition-colors font-body appearance-none"
                  >
                    {COMMITMENT_OPTIONS.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </StableSelect>
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-[#666666] uppercase tracking-wider mb-2 block font-body">
                  Skills Needed
                </label>
                <StableInput
                  value={postForm.skills}
                  onValueChange={(v) => setPostForm((f) => ({ ...f, skills: v }))}
                  placeholder="Comma-separated, e.g., Teaching, Mentoring"
                  className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.06] rounded-xl text-sm text-white placeholder-[#666666] focus:outline-none focus:border-[#C6FF34]/40 transition-colors font-body"
                />
              </div>

              <button
                onClick={handlePostOpportunity}
                className="w-full flex items-center justify-center gap-2 px-4 py-3.5 bg-[#C6FF34] text-black rounded-xl text-sm font-semibold hover:bg-[#d4ff5c] transition-all font-body"
              >
                <PlusCircle size={16} />
                Post Opportunity
              </button>
            </div>
          </motion.div>
        )}

        {/* ─── Manage Tab (org dashboard) ─── */}
        {activeTab === "manage" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
            {postedOpportunities.length > 0 ? (
              <div className="space-y-4">
                {postedOpportunities.map((o) => {
                  const oppApplicants = applicants.filter((a) => a.opportunityId === o.id);
                  const isExpanded = expandedOpportunityId === o.id;
                  return (
                    <div key={o.id} className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.06] rounded-2xl overflow-hidden">
                      <div className="p-5 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-10 h-10 rounded-xl bg-white/[0.05] flex items-center justify-center text-lg shrink-0">
                            {o.logo}
                          </div>
                          <div className="min-w-0">
                            <h3 className="text-white font-semibold font-display truncate">{o.organization}</h3>
                            <span className="text-xs text-[#666666] font-body">
                              {oppApplicants.length} applicant{oppApplicants.length === 1 ? "" : "s"} ·{" "}
                              <span className={o.status === "closed" ? "text-red-400" : "text-[#C6FF34]"}>
                                {o.status === "closed" ? "Closed" : "Open"}
                              </span>
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            onClick={() => handleToggleStatus(o.id)}
                            className="px-3 py-2 bg-white/[0.03] border border-white/[0.06] rounded-lg text-xs font-medium text-[#A0A0A0] hover:text-white hover:bg-white/[0.06] transition-all font-body"
                          >
                            {o.status === "closed" ? "Reopen" : "Close"}
                          </button>
                          <button
                            onClick={() => setExpandedOpportunityId(isExpanded ? null : o.id)}
                            className="p-2 bg-white/[0.03] border border-white/[0.06] rounded-lg text-[#A0A0A0] hover:text-white transition-all"
                          >
                            {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                          </button>
                        </div>
                      </div>

                      {isExpanded && (
                        <div className="border-t border-white/[0.06] p-5 space-y-3">
                          {oppApplicants.length > 0 ? (
                            oppApplicants.map((applicant) => (
                              <div
                                key={applicant.id}
                                className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-white/[0.02] rounded-xl"
                              >
                                <div className="min-w-0">
                                  <p className="text-sm text-white font-medium font-body">{applicant.applicantName}</p>
                                  <p className="text-xs text-[#666666] font-body line-clamp-2">{applicant.message}</p>
                                </div>
                                <div className="flex items-center gap-2 shrink-0">
                                  {applicant.status === "pending" ? (
                                    <>
                                      <button
                                        onClick={() => handleApplicantDecision(applicant.id, "accepted")}
                                        className="px-3 py-1.5 bg-[#C6FF34] text-black rounded-lg text-xs font-semibold hover:bg-[#d4ff5c] transition-all font-body"
                                      >
                                        Accept
                                      </button>
                                      <button
                                        onClick={() => handleApplicantDecision(applicant.id, "declined")}
                                        className="px-3 py-1.5 bg-white/[0.05] border border-white/[0.08] text-[#A0A0A0] rounded-lg text-xs font-semibold hover:text-white transition-all font-body"
                                      >
                                        Decline
                                      </button>
                                    </>
                                  ) : (
                                    <span
                                      className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-1 rounded-lg border capitalize ${
                                        applicant.status === "completed"
                                          ? "bg-[#C6FF34]/10 text-[#C6FF34] border-[#C6FF34]/20"
                                          : applicant.status === "accepted"
                                          ? "bg-[#7E3BED]/10 text-[#A070F0] border-[#7E3BED]/20"
                                          : "bg-red-500/10 text-red-400 border-red-500/20"
                                      }`}
                                    >
                                      {applicant.status}
                                    </span>
                                  )}
                                </div>
                              </div>
                            ))
                          ) : (
                            <p className="text-sm text-[#666666] text-center py-4 font-body">No applicants yet.</p>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <EmptyState
                icon={<Briefcase size={28} />}
                title="No opportunities posted yet"
                description="Post your first opportunity and manage applicants right here."
              />
            )}
          </motion.div>
        )}
      </div>

      {/* ═══════════════════════════════════
          APPLY MODAL
          ═══════════════════════════════════ */}
      <AnimatePresence>
        {isApplyModalOpen && selectedOpportunity && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => {
              setIsApplyModalOpen(false);
              setSelectedOpportunity(null);
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
              <div className="p-6 pb-4 border-b border-white/[0.06]">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-xs text-[#7E3BED] font-medium">{selectedOpportunity.type}</span>
                    <h3 className="text-xl font-bold text-white mt-1 font-display">{selectedOpportunity.organization}</h3>
                  </div>
                  <button
                    onClick={() => {
                      setIsApplyModalOpen(false);
                      setSelectedOpportunity(null);
                    }}
                    className="p-2 rounded-lg bg-white/[0.03] border border-white/[0.06] text-[#666666] hover:text-white hover:bg-white/[0.08] transition-all"
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-5">
                <p className="text-sm text-[#A0A0A0] leading-relaxed font-body">{selectedOpportunity.description}</p>

                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-medium text-[#666666] uppercase tracking-wider mb-2 block font-body">
                      Why do you want to help? <span className="text-[#C6FF34]">*</span>
                    </label>
                    <StableTextarea
                      value={applyMessage}
                      onValueChange={setApplyMessage}
                      placeholder="Tell them about relevant experience and why this cause matters to you."
                      rows={4}
                      className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.06] rounded-xl text-sm text-white placeholder-[#666666] focus:outline-none focus:border-[#C6FF34]/40 resize-none transition-colors font-body"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-[#666666] uppercase tracking-wider mb-2 block font-body">
                      Hours You Can Commit
                    </label>
                    <StableInput
                      value={applyHours}
                      onValueChange={setApplyHours}
                      type="number"
                      min={1}
                      className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.06] rounded-xl text-sm text-white placeholder-[#666666] focus:outline-none focus:border-[#C6FF34]/40 transition-colors font-body"
                    />
                  </div>
                </div>
              </div>

              <div className="p-6 pt-4 border-t border-white/[0.06] flex gap-3">
                <button
                  onClick={() => {
                    setIsApplyModalOpen(false);
                    setSelectedOpportunity(null);
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
                  Submit
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
                toast.type === "success"
                  ? "bg-[#C6FF34] text-black border-[#C6FF34]"
                  : "bg-red-500 text-white border-red-500"
              }`}
              initial={{ opacity: 0, x: 60, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 60, scale: 0.9 }}
              transition={{ duration: 0.35, ease: [0.19, 1, 0.22, 1] }}
            >
              {toast.type === "success" ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
              {toast.message}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </section>
  );
}

/* ───────────────────── Pillars ───────────────────── */
function Pillars() {
  return (
    <section className="relative py-24 lg:py-32 bg-[#0A0A0A]">
      <div className="max-w-6xl mx-auto px-6">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: [0.19, 1, 0.22, 1] }}
        >
          <span className="text-[#7E3BED] text-sm font-medium tracking-wider uppercase mb-4 block">
            Four Pillars
          </span>
          <h2 className="font-display text-4xl sm:text-5xl text-white mb-4">
            The Foundation of Impact
          </h2>
          <p className="text-[#A0A0A0] text-lg max-w-2xl mx-auto">
            Our impact work is organized around four core pillars that guide every initiative we undertake.
          </p>
        </motion.div>

        <motion.div
          className="grid sm:grid-cols-2 gap-5"
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {pillars.map((pillar, i) => (
            <motion.div
              key={pillar.title}
              className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.06] rounded-2xl p-8 hover:border-white/[0.12] transition-all group"
              variants={scaleUp}
              custom={i}
            >
              <div
                className="w-14 h-14 rounded-xl flex items-center justify-center mb-6"
                style={{ backgroundColor: `${pillar.color}15` }}
              >
                <pillar.icon className="w-7 h-7" style={{ color: pillar.color }} />
              </div>
              <h3 className="text-white text-2xl font-semibold mb-3">{pillar.title}</h3>
              <p className="text-[#A0A0A0] text-[15px] leading-relaxed mb-5">{pillar.desc}</p>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-[#C6FF34]" />
                <span className="text-[#C6FF34] text-sm font-medium">{pillar.impact}</span>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

/* ───────────────────── ImpactPartner ───────────────────── */
function ImpactPartner({ onPartnerClick }: { onPartnerClick: () => void }) {
  return (
    <section className="relative py-24 bg-black overflow-hidden">
      <div
        className="absolute top-1/2 right-0 w-[400px] h-[400px] rounded-full opacity-[0.05]"
        style={{ background: "radial-gradient(circle, #7E3BED 0%, transparent 70%)" }}
      />

      <div className="relative z-10 max-w-6xl mx-auto px-6">
        <div className="flex flex-col lg:flex-row gap-12 items-center">
          {/* Left */}
          <motion.div
            className="flex-1"
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.19, 1, 0.22, 1] }}
          >
            <span className="text-[#C6FF34] text-sm font-medium tracking-wider uppercase mb-4 block">
              Partner With Us
            </span>
            <h2 className="font-display text-4xl sm:text-5xl text-white mb-6">
              Become an{" "}
              <span className="bg-gradient-to-r from-[#C6FF34] to-[#7E3BED] bg-clip-text text-transparent">
                Impact Partner
              </span>
            </h2>
            <p className="text-[#A0A0A0] text-lg leading-relaxed mb-8">
              We collaborate with organizations that share our commitment to African development.
              Post your opportunity above and Levav talent ready to contribute will find it directly.
            </p>
            <button
              onClick={onPartnerClick}
              className="inline-flex items-center gap-2 px-8 py-4 bg-[#C6FF34] text-black font-semibold rounded-xl hover:bg-[#d4ff5c] transition-colors"
            >
              Post an Opportunity
              <ArrowRight className="w-4 h-4" />
            </button>
          </motion.div>

          {/* Right - Partner Types */}
          <motion.div
            className="flex-1 w-full"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <div className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] rounded-2xl p-8">
              <h3 className="text-white text-lg font-semibold mb-6">
                We Partner With
              </h3>
              <div className="space-y-4">
                {partnerTypes.map((pt, i) => (
                  <motion.div
                    key={pt.label}
                    className="flex items-center gap-4"
                    variants={fadeUp}
                    custom={i}
                  >
                    <div className="w-10 h-10 rounded-lg bg-[#C6FF34]/10 flex items-center justify-center flex-shrink-0">
                      <pt.icon className="w-5 h-5 text-[#C6FF34]" />
                    </div>
                    <span className="text-[#A0A0A0] text-[15px]">{pt.label}</span>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

/* ───────────────────── Stats ───────────────────── */
function Stats() {
  const stats = [
    { value: "12,000+", label: "Impact Hours" },
    { value: "500+", label: "Leadership Fellows" },
    { value: "85", label: "Community Chapters" },
    { value: "30+", label: "Sustainable Programs" },
  ];

  return (
    <section className="relative py-16 border-y border-white/[0.06] bg-[#0A0A0A]">
      <div className="max-w-6xl mx-auto px-6">
        <motion.div
          className="grid grid-cols-2 lg:grid-cols-4 gap-8"
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              className="text-center"
              variants={fadeUp}
              custom={i}
            >
              <div className="text-3xl sm:text-4xl font-display text-white mb-2">
                {stat.value}
              </div>
              <p className="text-[#666666] text-sm">{stat.label}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

/* ───────────────────── Page ───────────────────── */
export default function Impact() {
  const hubRef = React.useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = React.useState<HubTab>("browse");

  const goToPostTab = React.useCallback(() => {
    setActiveTab("post");
    hubRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  return (
    <main className="bg-black min-h-screen">
      <Hero />
      <OpportunityHub hubRef={hubRef} activeTab={activeTab} setActiveTab={setActiveTab} />
      <Stats />
      <Pillars />
      <ImpactPartner onPartnerClick={goToPostTab} />
    </main>
  );
}
