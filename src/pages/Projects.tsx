import { useState, useMemo } from "react";
import { useNavigate } from "react-router";
import { motion } from "framer-motion";
import {
  Briefcase,
  FolderOpen,
  ArrowRight,
  ExternalLink,
  CreditCard,
  Clock,
  Plus,
  Building2,
  UserCircle,
  Layers,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

/* ───────────────────── Types ───────────────────── */
interface Project {
  id: number;
  title: string;
  talent: string;
  employer: string;
  status: "proposed" | "active" | "completed";
  milestonesCompleted: number;
  totalMilestones: number;
  budgetPaid: string;
  budgetTotal: string;
  nextDue: string;
}

/* ───────────────────── Mock Data ───────────────────── */
const mockProjects: Project[] = [
  {
    id: 1,
    title: "Fintech Mobile App",
    talent: "Mutale Mwanza",
    employer: "BongoHive",
    status: "active",
    milestonesCompleted: 2,
    totalMilestones: 4,
    budgetPaid: "ZMW 12,500",
    budgetTotal: "ZMW 25,000",
    nextDue: "Jul 15, 2025",
  },
  {
    id: 2,
    title: "Brand Identity Design",
    talent: "Grace Lungu",
    employer: "MPharma",
    status: "active",
    milestonesCompleted: 1,
    totalMilestones: 3,
    budgetPaid: "ZMW 6,000",
    budgetTotal: "ZMW 18,000",
    nextDue: "Jul 20, 2025",
  },
  {
    id: 3,
    title: "Data Pipeline Setup",
    talent: "Amara Okafor",
    employer: "Flutterwave",
    status: "proposed",
    milestonesCompleted: 0,
    totalMilestones: 5,
    budgetPaid: "ZMW 0",
    budgetTotal: "ZMW 40,000",
    nextDue: "TBD",
  },
];

/* ───────────────────── Animation Variants ───────────────────── */
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

/* ───────────────────── Helpers ───────────────────── */
function getUserRole(): "talent" | "employer" {
  try {
    const raw = localStorage.getItem("user");
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.role === "employer") return "employer";
    }
  } catch {
    // ignore
  }
  // Check explicit role key
  const role = localStorage.getItem("role");
  if (role === "employer") return "employer";
  return "talent";
}

function statusConfig(status: Project["status"]) {
  switch (status) {
    case "active":
      return {
        label: "Active",
        bg: "bg-[#C6FF34]/15",
        text: "text-[#C6FF34]",
        border: "border-[#C6FF34]/20",
      };
    case "completed":
      return {
        label: "Completed",
        bg: "bg-[#7E3BED]/15",
        text: "text-[#7E3BED]",
        border: "border-[#7E3BED]/20",
      };
    case "proposed":
      return {
        label: "Proposed",
        bg: "bg-white/[0.05]",
        text: "text-[#A0A0A0]",
        border: "border-white/[0.08]",
      };
  }
}

function talentInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

/* ───────────────────── StatusBadge ───────────────────── */
function StatusBadge({ status }: { status: Project["status"] }) {
  const cfg = statusConfig(status);
  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${cfg.bg} ${cfg.text} ${cfg.border}`}
    >
      {cfg.label}
    </span>
  );
}

/* ───────────────────── ProgressBar ───────────────────── */
function MilestoneProgress({
  completed,
  total,
}: {
  completed: number;
  total: number;
}) {
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs">
        <span className="text-[#666666]">Milestone Progress</span>
        <span className="text-white font-medium">
          {completed}/{total}
        </span>
      </div>
      <div className="h-2 w-full bg-white/[0.06] rounded-full overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ backgroundColor: "#C6FF34" }}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: [0.19, 1, 0.22, 1] }}
        />
      </div>
      <p className="text-[#666666] text-xs">{pct}% complete</p>
    </div>
  );
}

/* ───────────────────── ProjectCard ───────────────────── */
function ProjectCard({
  project,
  index,
  role,
}: {
  project: Project;
  index: number;
  role: "talent" | "employer";
}) {
  const navigate = useNavigate();

  return (
    <motion.div
      className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.06] rounded-2xl p-5 hover:border-white/[0.1] transition-all flex flex-col gap-4"
      variants={fadeUp}
      custom={index}
      initial="hidden"
      animate="visible"
    >
      {/* Top: Title + Status */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-[#C6FF34]/10 flex items-center justify-center flex-shrink-0">
            <FolderOpen className="w-5 h-5 text-[#C6FF34]" />
          </div>
          <div className="min-w-0">
            <h3 className="text-white font-semibold text-sm truncate">
              {project.title}
            </h3>
            <div className="flex items-center gap-1.5 mt-0.5">
              <Building2 className="w-3 h-3 text-[#666666]" />
              <span className="text-[#666666] text-xs">
                {project.employer}
              </span>
            </div>
          </div>
        </div>
        <StatusBadge status={project.status} />
      </div>

      {/* Talent Row */}
      <div className="flex items-center gap-2.5">
        <Avatar className="w-7 h-7">
          <AvatarFallback className="bg-gradient-to-br from-[#C6FF34] to-[#7E3BED] text-black text-[10px] font-bold">
            {talentInitials(project.talent)}
          </AvatarFallback>
        </Avatar>
        <div className="flex items-center gap-1">
          <UserCircle className="w-3 h-3 text-[#A0A0A0]" />
          <span className="text-[#A0A0A0] text-xs">
            {role === "talent" ? "You" : project.talent}
          </span>
        </div>
      </div>

      {/* Progress */}
      <MilestoneProgress
        completed={project.milestonesCompleted}
        total={project.totalMilestones}
      />

      {/* Budget & Due Date */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white/[0.02] border border-white/[0.04] rounded-xl p-3">
          <p className="text-[#666666] text-[10px] uppercase tracking-wider mb-1">
            Budget
          </p>
          <p className="text-white text-xs font-medium">
            {project.budgetPaid}{" "}
            <span className="text-[#666666]">of {project.budgetTotal}</span>
          </p>
        </div>
        <div className="bg-white/[0.02] border border-white/[0.04] rounded-xl p-3">
          <p className="text-[#666666] text-[10px] uppercase tracking-wider mb-1">
            Next Due
          </p>
          <div className="flex items-center gap-1.5">
            <Clock className="w-3 h-3 text-[#C6FF34]" />
            <span className="text-white text-xs font-medium">
              {project.nextDue}
            </span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2 pt-1">
        <button
          onClick={() => navigate(`/contract/${project.id}`)}
          className="flex-1 flex items-center justify-center gap-1.5 bg-[#C6FF34]/10 border border-[#C6FF34]/20 text-[#C6FF34] text-xs font-medium py-2.5 rounded-xl hover:bg-[#C6FF34]/15 transition-all"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          View Workspace
        </button>
        <button
          onClick={() => navigate(`/payments/${project.id}`)}
          className="flex-1 flex items-center justify-center gap-1.5 bg-white/5 border border-white/[0.08] text-white text-xs font-medium py-2.5 rounded-xl hover:bg-white/10 hover:border-white/[0.12] transition-all"
        >
          <CreditCard className="w-3.5 h-3.5" />
          View Payments
        </button>
      </div>
    </motion.div>
  );
}

/* ───────────────────── EmptyState ───────────────────── */
function EmptyState({ role }: { role: "talent" | "employer" }) {
  const navigate = useNavigate();

  return (
    <motion.div
      className="flex flex-col items-center justify-center py-20 px-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.19, 1, 0.22, 1] }}
    >
      <div className="w-16 h-16 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center mb-5">
        <Briefcase className="w-8 h-8 text-[#666666]" />
      </div>
      <h3 className="text-white text-lg font-semibold mb-1">No projects yet</h3>
      <p className="text-[#666666] text-sm text-center max-w-sm mb-6">
        {role === "employer"
          ? "Start by browsing talent and hiring for your next project."
          : "Browse available jobs and apply to start your next project."}
      </p>
      <button
        onClick={() =>
          navigate(role === "employer" ? "/talent" : "/opportunities")
        }
        className="btn-lime flex items-center gap-2 text-sm"
      >
        {role === "employer" ? "Browse Talent" : "Browse Jobs"}
        <ArrowRight className="w-4 h-4" />
      </button>
    </motion.div>
  );
}

/* ───────────────────── Projects Page ───────────────────── */
export default function Projects() {
  const role = getUserRole();
  const navigate = useNavigate();

  // Tab config based on role
  const talentTabs = ["Active", "Completed", "Proposed"] as const;
  const employerTabs = ["My Hires", "My Contracts"] as const;
  const tabs = role === "employer" ? employerTabs : talentTabs;

  const [activeTab, setActiveTab] = useState<string>(tabs[0]);

  // Filter projects based on active tab
  const filteredProjects = useMemo(() => {
    if (role === "employer") {
      if (activeTab === "My Hires") {
        return mockProjects.filter(
          (p) => p.status === "active" || p.status === "completed"
        );
      }
      return mockProjects.filter((p) => p.status === "proposed");
    }
    // Talent view
    const statusMap: Record<string, Project["status"]> = {
      Active: "active",
      Completed: "completed",
      Proposed: "proposed",
    };
    return mockProjects.filter((p) => p.status === statusMap[activeTab]);
  }, [activeTab, role]);

  // Check if any projects exist at all (for empty state)
  const hasAnyProjects = mockProjects.length > 0;

  return (
    <div className="bg-black min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.19, 1, 0.22, 1] }}
        >
          <div>
            <h1 className="text-white text-2xl font-semibold">My Projects</h1>
            <p className="text-[#666666] text-sm mt-0.5">
              {role === "employer"
                ? "Manage your hires and contracts"
                : "Track your active and upcoming projects"}
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Tabs */}
            <div className="flex items-center bg-white/[0.03] border border-white/[0.06] rounded-xl p-1">
              {tabs.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    activeTab === tab
                      ? "bg-[#C6FF34]/10 text-[#C6FF34] border border-[#C6FF34]/20"
                      : "text-[#A0A0A0] hover:text-white border border-transparent"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* New Project button (employer only) */}
            {role === "employer" && (
              <button
                onClick={() => navigate("/employer/jobs")}
                className="btn-lime flex items-center gap-1.5 text-xs"
              >
                <Plus className="w-4 h-4" />
                New Project
              </button>
            )}
          </div>
        </motion.div>

        {/* Content */}
        {!hasAnyProjects ? (
          <EmptyState role={role} />
        ) : filteredProjects.length === 0 ? (
          <motion.div
            className="flex flex-col items-center justify-center py-16 px-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
          >
            <div className="w-14 h-14 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center mb-4">
              <Layers className="w-7 h-7 text-[#666666]" />
            </div>
            <p className="text-[#666666] text-sm">
              No {activeTab.toLowerCase()} projects found
            </p>
          </motion.div>
        ) : (
          <motion.div
            className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5"
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
          >
            {filteredProjects.map((project, i) => (
              <ProjectCard
                key={project.id}
                project={project}
                index={i}
                role={role}
              />
            ))}
          </motion.div>
        )}

        {/* Summary Footer */}
        {hasAnyProjects && (
          <motion.div
            className="mt-10 grid grid-cols-2 sm:grid-cols-4 gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.6,
              delay: 0.4,
              ease: [0.19, 1, 0.22, 1],
            }}
          >
            <div className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.06] rounded-2xl p-4 text-center">
              <p className="text-[#666666] text-[10px] uppercase tracking-wider mb-1">
                Total Projects
              </p>
              <p className="text-white text-xl font-semibold">
                {mockProjects.length}
              </p>
            </div>
            <div className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.06] rounded-2xl p-4 text-center">
              <p className="text-[#666666] text-[10px] uppercase tracking-wider mb-1">
                Active
              </p>
              <p className="text-[#C6FF34] text-xl font-semibold">
                {mockProjects.filter((p) => p.status === "active").length}
              </p>
            </div>
            <div className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.06] rounded-2xl p-4 text-center">
              <p className="text-[#666666] text-[10px] uppercase tracking-wider mb-1">
                Completed
              </p>
              <p className="text-[#7E3BED] text-xl font-semibold">
                {mockProjects.filter((p) => p.status === "completed").length}
              </p>
            </div>
            <div className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.06] rounded-2xl p-4 text-center">
              <p className="text-[#666666] text-[10px] uppercase tracking-wider mb-1">
                Total Budget
              </p>
              <p className="text-white text-xl font-semibold">
                ZMW 83,000
              </p>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
