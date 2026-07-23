import { useState, useMemo, useEffect } from "react";
import { useNavigate, Link } from "react-router";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  ArrowLeft,
  ArrowRight,
  MapPin,
  Briefcase,
  Target,
  Zap,
  Globe,
  Code2,
  Award,
  Layers,
  Filter,
  Loader2,
} from "lucide-react";
import {
  calculateMatchScore,
  useSmartMatches,
  type Job,
  type MatchResult,
  type Profile,
} from "@/components/SmartMatchWidget";

/* ───────────────────── Animation Variants ───────────────────── */
const fadeUp = {
  hidden: { opacity: 0, y: 24 },
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

/* ───────────────────── Score Helpers ───────────────────── */
function getScoreColor(score: number): string {
  if (score > 80) return "#C6FF34";
  if (score >= 60) return "#7E3BED";
  return "#666666";
}

function getScoreBg(score: number): string {
  if (score > 80) return "bg-[#C6FF34]";
  if (score >= 60) return "bg-[#7E3BED]";
  return "bg-white/[0.06]";
}

function getScoreText(score: number): string {
  if (score > 80) return "text-black";
  if (score >= 60) return "text-white";
  return "text-[#666666]";
}

function getScoreLabel(score: number): string {
  if (score > 80) return "Excellent Match";
  if (score >= 60) return "Good Match";
  return "Fair Match";
}

function getScoreRingColor(score: number): string {
  if (score > 80) return "stroke-[#C6FF34]";
  if (score >= 60) return "stroke-[#7E3BED]";
  return "stroke-[#666666]";
}

/* ───────────────────── Circular Score ───────────────────── */
function CircularScore({ score, size = 72 }: { score: number; size?: number }) {
  const strokeWidth = 5;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="relative flex-shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          className={getScoreRingColor(score)}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 1s ease" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span
          className="font-bold text-base leading-none"
          style={{ color: getScoreColor(score) }}
        >
          {score}%
        </span>
      </div>
    </div>
  );
}

/* ───────────────────── Filter Options ───────────────────── */
type FilterOption = "all" | "80plus" | "60plus";

const FILTER_OPTIONS: { label: string; value: FilterOption }[] = [
  { label: "All Matches", value: "all" },
  { label: "Excellent (80%+)", value: "80plus" },
  { label: "Good (60%+)", value: "60plus" },
];

/* ───────────────────── Profile Sidebar ───────────────────── */
function ProfileSidebar({ profile }: { profile: Profile }) {
  const skills = profile.skills || ["React", "TypeScript", "Tailwind"];
  const location = profile.location || "Lusaka, Zambia";
  const wri = profile.wri || 70;
  const category = profile.category || "engineering";

  const skillIcons = [
    "from-[#C6FF34]/20 to-[#7E3BED]/20",
    "from-[#7E3BED]/20 to-[#C6FF34]/20",
    "from-[#C6FF34]/15 to-[#3B82F6]/25",
    "from-[#7E3BED]/15 to-[#EC4899]/25",
    "from-[#3B82F6]/20 to-[#10B981]/20",
  ];

  return (
    <motion.aside
      className="w-full lg:w-[260px] flex-shrink-0"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6, ease: [0.19, 1, 0.22, 1] }}
    >
      <div className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.06] rounded-2xl p-6 sticky top-24">
        <div className="flex items-center gap-2 mb-5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#C6FF34] to-[#7E3BED] flex items-center justify-center">
            <Target className="w-4 h-4 text-black" />
          </div>
          <h3 className="text-white font-semibold text-sm">Your Profile</h3>
        </div>

        {/* WRI */}
        <div className="mb-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[#A0A0A0] text-xs">WRI Score</span>
            <span className="text-[#C6FF34] text-xs font-semibold">{wri}/100</span>
          </div>
          <div className="h-2 bg-white/10 rounded-full overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-[#C6FF34] to-[#7E3BED]"
              initial={{ width: 0 }}
              animate={{ width: `${wri}%` }}
              transition={{ duration: 1, delay: 0.3, ease: [0.19, 1, 0.22, 1] }}
            />
          </div>
          <p className="text-[#666666] text-[10px] mt-1">
            Higher WRI = better job matches
          </p>
        </div>

        {/* Location */}
        <div className="mb-5">
          <div className="flex items-center gap-2 mb-2">
            <Globe className="w-3.5 h-3.5 text-[#7E3BED]" />
            <span className="text-[#A0A0A0] text-xs">Location</span>
          </div>
          <p className="text-white text-sm font-medium">{location}</p>
          <p className="text-[#666666] text-[10px] mt-0.5">
            Remote jobs also included
          </p>
        </div>

        {/* Category */}
        <div className="mb-5">
          <div className="flex items-center gap-2 mb-2">
            <Layers className="w-3.5 h-3.5 text-[#C6FF34]" />
            <span className="text-[#A0A0A0] text-xs">Category</span>
          </div>
          <p className="text-white text-sm font-medium capitalize">{category}</p>
        </div>

        {/* Skills */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Code2 className="w-3.5 h-3.5 text-[#C6FF34]" />
            <span className="text-[#A0A0A0] text-xs">Your Skills</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {skills.map((skill: string, i: number) => (
              <span
                key={skill}
                className={`text-xs px-2 py-1 rounded-lg bg-gradient-to-r ${skillIcons[i % skillIcons.length]} border border-white/[0.06] text-white/80`}
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      </div>
    </motion.aside>
  );
}

/* ───────────────────── Job Match Card ───────────────────── */
function JobMatchCard({
  match,
  index,
  onApply,
}: {
  match: MatchResult;
  index: number;
  onApply: (jobId: number) => void;
}) {
  const { job, score, matchedSkills, reason } = match;

  const formatType = (type: string) => {
    return type
      .split("-")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join("-");
  };

  const companyName =
    job.company ||
    ({
      "Senior Frontend Developer": "TechVentures Africa",
      "Product Designer": "FinFlow Labs",
      "Backend Engineer": "HealthTech GH",
      "UX Researcher": "UserFirst Design",
      "Data Scientist": "DataDriven KE",
      "Mobile Developer": "AppWorks Senegal",
      "Marketing Strategist": "EduSpark Africa",
      "DevOps Engineer": "CloudBase Africa",
      "AI Researcher - NLP": "Kigali AI Institute",
      "Agricultural Engineer": "GreenHarvest Farms",
      "Public Health Program Manager": "MediCare Plus",
      "Youth Development Coordinator": "YouthBridge Zambia",
    } as Record<string, string>)[job.title] ||
    "Levav Partner";

  const skillIcons = [
    "from-[#C6FF34]/30 to-[#7E3BED]/30",
    "from-[#7E3BED]/30 to-[#C6FF34]/30",
    "from-[#C6FF34]/20 to-[#3B82F6]/30",
    "from-[#7E3BED]/20 to-[#EC4899]/30",
    "from-[#3B82F6]/30 to-[#10B981]/30",
    "from-[#F59E0B]/30 to-[#C6FF34]/30",
  ];

  const initial = job.title.charAt(0).toUpperCase();
  const gradient = skillIcons[job.title.length % skillIcons.length];

  return (
    <motion.div
      className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.06] rounded-2xl p-6 hover:border-white/[0.12] hover:bg-white/[0.05] transition-all group"
      variants={fadeUp}
      initial="hidden"
      animate="visible"
      custom={index}
      layout
    >
      <div className="flex flex-col sm:flex-row gap-5">
        {/* Score Circle */}
        <div className="flex flex-col items-center gap-1 flex-shrink-0">
          <CircularScore score={score} size={72} />
          <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-white/[0.04] text-[#A0A0A0]">
            {getScoreLabel(score)}
          </span>
        </div>

        {/* Job Details */}
        <div className="flex-1 min-w-0">
          {/* Title + Company */}
          <div className="flex items-start gap-3 mb-3">
            <div
              className={`w-10 h-10 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center flex-shrink-0 border border-white/[0.08]`}
            >
              <span className="text-white font-semibold">{initial}</span>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-white font-semibold text-base group-hover:text-[#C6FF34] transition-colors">
                {job.title}
              </h3>
              <p className="text-[#666666] text-sm">{companyName}</p>
            </div>
          </div>

          {/* Match Reason */}
          <div className="bg-white/[0.02] border border-white/[0.04] rounded-lg p-3 mb-3">
            <div className="flex items-center gap-1.5 mb-1">
              <Sparkles className="w-3 h-3 text-[#C6FF34]" />
              <span className="text-[#C6FF34] text-[10px] font-medium uppercase tracking-wider">
                Why this matches you
              </span>
            </div>
            <p className="text-[#A0A0A0] text-xs">{reason}</p>
            {matchedSkills.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {matchedSkills.map((skill) => (
                  <span
                    key={skill}
                    className="text-[10px] px-1.5 py-0.5 rounded bg-[#C6FF34]/10 text-[#C6FF34]"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Meta Row */}
          <div className="flex flex-wrap items-center gap-3 text-xs text-[#666666]">
            <span className="flex items-center gap-1">
              <MapPin size={12} className="text-white/30" />
              {job.location}
            </span>
            <span className="flex items-center gap-1 bg-white/[0.05] rounded px-2 py-0.5">
              {formatType(job.type)}
            </span>
            {job.salary && (
              <span className="text-[#C6FF34] font-medium">
                {job.salary}
              </span>
            )}
          </div>
        </div>

        {/* Apply Button */}
        <div className="flex sm:flex-col items-center sm:items-end justify-center gap-2 flex-shrink-0 self-center">
          <button
            onClick={() => onApply(job.id)}
            className="bg-[#C6FF34] text-black text-sm font-medium px-5 py-2.5 rounded-xl hover:bg-[#d4ff5c] transition-colors flex items-center gap-1.5"
          >
            Apply
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
          <Link
            to={`/jobs/${job.id}`}
            className="text-[#666666] text-xs hover:text-[#C6FF34] transition-colors"
          >
            View Details
          </Link>
        </div>
      </div>
    </motion.div>
  );
}

/* ───────────────────── Empty State ───────────────────── */
function EmptyState({ filter }: { filter: FilterOption }) {
  return (
    <motion.div
      className="text-center py-16"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <Briefcase size={48} className="mx-auto mb-4 text-white/20" />
      <p className="text-white/50 text-lg mb-1">No matches found</p>
      <p className="text-white/30 text-sm">
        {filter === "80plus"
          ? "Try lowering the filter to see more results"
          : filter === "60plus"
          ? "Try the 'All Matches' filter"
          : "No jobs available at the moment"}
      </p>
    </motion.div>
  );
}

/* ───────────────────── Main Page ───────────────────── */
export default function SmartMatch() {
  const navigate = useNavigate();
  const { matches, profile } = useSmartMatches();
  const [activeFilter, setActiveFilter] = useState<FilterOption>("all");

  const filteredMatches = useMemo(() => {
    if (activeFilter === "80plus") return matches.filter((m) => m.score > 80);
    if (activeFilter === "60plus") return matches.filter((m) => m.score >= 60);
    return matches;
  }, [matches, activeFilter]);

  const excellentCount = useMemo(
    () => matches.filter((m) => m.score > 80).length,
    [matches]
  );
  const goodCount = useMemo(
    () => matches.filter((m) => m.score >= 60).length,
    [matches]
  );

  const handleApply = (jobId: number) => {
    navigate(`/apply/${jobId}`);
  };

  return (
    <main className="bg-black min-h-screen">
      {/* ─── Hero Header ─── */}
      <section className="relative pt-28 pb-10 overflow-hidden">
        <div
          className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full opacity-[0.06]"
          style={{
            background:
              "radial-gradient(circle, #C6FF34 0%, transparent 70%)",
          }}
        />
        <div
          className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full opacity-[0.04]"
          style={{
            background:
              "radial-gradient(circle, #7E3BED 0%, transparent 70%)",
          }}
        />

        <div className="relative z-10 max-w-6xl mx-auto px-6">
          {/* Back link */}
          <motion.div
            className="mb-6"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Link
              to="/dashboard"
              className="text-[#A0A0A0] text-sm hover:text-[#C6FF34] transition-colors flex items-center gap-1.5"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </Link>
          </motion.div>

          {/* Badge */}
          <motion.div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#C6FF34]/10 border border-[#C6FF34]/20 mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.19, 1, 0.22, 1] }}
          >
            <Zap className="w-4 h-4 text-[#C6FF34]" />
            <span className="text-[#C6FF34] text-sm font-medium">
              AI-Powered Matching
            </span>
          </motion.div>

          {/* Heading */}
          <motion.h1
            className="font-display text-4xl sm:text-5xl lg:text-6xl text-white leading-[1.05] mb-4"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.8,
              delay: 0.1,
              ease: [0.19, 1, 0.22, 1],
            }}
          >
            Your Top Job Matches
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            className="text-white/50 text-lg max-w-2xl mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.7,
              delay: 0.2,
              ease: [0.19, 1, 0.22, 1],
            }}
          >
            Our AI algorithm analyzes your skills, location preferences, WRI
            score, and category alignment to surface the best opportunities for
            your career growth.
          </motion.p>

          {/* Summary stats */}
          <motion.div
            className="flex items-center gap-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <div className="flex items-center gap-2 bg-white/[0.03] border border-white/[0.06] rounded-full px-4 py-1.5">
              <Award className="w-3.5 h-3.5 text-[#C6FF34]" />
              <span className="text-white text-sm">
                {matches.length} jobs analyzed
              </span>
            </div>
            {excellentCount > 0 && (
              <div className="flex items-center gap-2 bg-[#C6FF34]/10 border border-[#C6FF34]/20 rounded-full px-4 py-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#C6FF34]" />
                <span className="text-[#C6FF34] text-sm font-medium">
                  {excellentCount} excellent matches
                </span>
              </div>
            )}
            {goodCount > 0 && (
              <div className="flex items-center gap-2 bg-[#7E3BED]/10 border border-[#7E3BED]/20 rounded-full px-4 py-1.5">
                <Target className="w-3.5 h-3.5 text-[#7E3BED]" />
                <span className="text-[#7E3BED] text-sm font-medium">
                  {goodCount} good matches
                </span>
              </div>
            )}
          </motion.div>
        </div>
      </section>

      {/* ─── Main Content ─── */}
      <section className="relative pb-24">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Sidebar */}
            <ProfileSidebar profile={profile} />

            {/* Main List */}
            <div className="flex-1 min-w-0">
              {/* Filter Bar */}
              <motion.div
                className="flex items-center gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <Filter className="w-4 h-4 text-[#666666] flex-shrink-0" />
                {FILTER_OPTIONS.map((option) => {
                  const isActive = activeFilter === option.value;
                  const count =
                    option.value === "all"
                      ? matches.length
                      : option.value === "80plus"
                      ? matches.filter((m) => m.score > 80).length
                      : matches.filter((m) => m.score >= 60).length;
                  return (
                    <motion.button
                      key={option.value}
                      onClick={() => setActiveFilter(option.value)}
                      className={
                        isActive
                          ? "bg-[#C6FF34] text-black rounded-full px-4 py-2 text-sm font-medium whitespace-nowrap flex-shrink-0 flex items-center gap-1.5"
                          : "bg-white/[0.05] border border-white/[0.1] text-white/60 rounded-full px-4 py-2 text-sm whitespace-nowrap flex-shrink-0 hover:bg-white/[0.08] hover:text-white transition-colors flex items-center gap-1.5"
                      }
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                    >
                      {option.label}
                      <span
                        className={
                          isActive
                            ? "text-black/50 text-xs font-semibold"
                            : "text-[#666666] text-xs"
                        }
                      >
                        {count}
                      </span>
                    </motion.button>
                  );
                })}
              </motion.div>

              {/* Results Count */}
              <div className="mb-4">
                <span className="text-[#666666] text-xs">
                  Showing {filteredMatches.length} of {matches.length} matches
                </span>
              </div>

              {/* Match Cards */}
              <AnimatePresence mode="popLayout">
                {filteredMatches.length === 0 ? (
                  <EmptyState filter={activeFilter} />
                ) : (
                  <motion.div
                    className="space-y-4"
                    variants={staggerContainer}
                    initial="hidden"
                    animate="visible"
                  >
                    {filteredMatches.map((match, index) => (
                      <JobMatchCard
                        key={match.job.id}
                        match={match}
                        index={index}
                        onApply={handleApply}
                      />
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
