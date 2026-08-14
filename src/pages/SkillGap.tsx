import { useState, useMemo, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Target,
  CheckCircle2,
  XCircle,
  ChevronDown,
  BookOpen,
  Clock,
  ExternalLink,
  Trophy,
  TrendingUp,
  Zap,
  Calendar,
  Award,
  BarChart3,
  Sparkles,
  RotateCcw,
  Brain,
  Layers,
  Code2,
  Palette,
  Database,
  Cloud,
  Check,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts";

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

/* ───────────────────── Role Skills Map ───────────────────── */
const ROLE_SKILLS: Record<string, string[]> = {
  "Senior Frontend Developer": [
    "React",
    "TypeScript",
    "Node.js",
    "System Design",
    "Testing",
    "Performance",
  ],
  "Product Designer": [
    "Figma",
    "Prototyping",
    "User Research",
    "Design Systems",
    "Motion Design",
    "Strategy",
  ],
  "Data Scientist": [
    "Python",
    "Machine Learning",
    "SQL",
    "Statistics",
    "Visualization",
    "Big Data",
  ],
  "DevOps Engineer": [
    "AWS",
    "Docker",
    "Kubernetes",
    "CI/CD",
    "Terraform",
    "Monitoring",
  ],
};

const ROLE_ICONS: Record<string, React.ElementType> = {
  "Senior Frontend Developer": Code2,
  "Product Designer": Palette,
  "Data Scientist": Database,
  "DevOps Engineer": Cloud,
};

/* ───────────────────── Skill Level Generator ───────────────────── */
function generateSkillLevels(skills: string[], masteredSkills: string[]) {
  return skills.map((skill) => {
    const isMastered = masteredSkills.some(
      (s) => s.toLowerCase() === skill.toLowerCase()
    );
    return {
      name: skill,
      yourLevel: isMastered ? 70 + Math.floor(Math.random() * 25) : 15 + Math.floor(Math.random() * 30),
      requiredLevel: 80 + Math.floor(Math.random() * 15),
      mastered: isMastered,
    };
  });
}

/* ───────────────────── 28-Day Plan Generator ───────────────────── */
interface PlanDay {
  day: number;
  topic: string;
  description: string;
  resources: { label: string; url: string }[];
  estimatedHours: number;
  completed: boolean;
}

interface PlanWeek {
  week: number;
  title: string;
  focus: string;
  days: PlanDay[];
}

function generate28DayPlan(missingSkills: string[]): PlanWeek[] {
  const primarySkill = missingSkills[0] || "Skill";
  const secondarySkill = missingSkills[1] || primarySkill;
  const tertiarySkill = missingSkills[2] || secondarySkill;

  return [
    {
      week: 1,
      title: "Foundation",
      focus: `Learn ${primarySkill} fundamentals`,
      days: [
        { day: 1, topic: `${primarySkill} Basics`, description: `Introduction to ${primarySkill} core concepts and syntax`, resources: [{ label: "Official Docs", url: "#" }, { label: "Video Tutorial", url: "#" }], estimatedHours: 4, completed: false },
        { day: 2, topic: `${primarySkill} Setup`, description: `Set up your development environment for ${primarySkill}`, resources: [{ label: "Setup Guide", url: "#" }], estimatedHours: 3, completed: false },
        { day: 3, topic: "Core Concepts", description: `Deep dive into ${primarySkill} fundamentals and patterns`, resources: [{ label: "Core Concepts Guide", url: "#" }, { label: "Practice Exercises", url: "#" }], estimatedHours: 4, completed: false },
        { day: 4, topic: "Practice Problems", description: `Solve beginner exercises for ${primarySkill}`, resources: [{ label: "Exercise Set 1", url: "#" }], estimatedHours: 4, completed: false },
        { day: 5, topic: `${primarySkill} Patterns`, description: `Learn common patterns and best practices`, resources: [{ label: "Patterns Guide", url: "#" }], estimatedHours: 3, completed: false },
        { day: 6, topic: "Weekend Project", description: `Build a small project using ${primarySkill}`, resources: [{ label: "Project Brief", url: "#" }], estimatedHours: 5, completed: false },
        { day: 7, topic: "Review & Reflect", description: `Review week 1 learnings and identify gaps`, resources: [{ label: "Self-Assessment", url: "#" }], estimatedHours: 2, completed: false },
      ],
    },
    {
      week: 2,
      title: "Practice",
      focus: `Build a ${primarySkill} project`,
      days: [
        { day: 8, topic: "Project Planning", description: `Plan your week 2 ${primarySkill} project`, resources: [{ label: "Project Template", url: "#" }], estimatedHours: 3, completed: false },
        { day: 9, topic: "Project Setup", description: `Initialize the project repository and structure`, resources: [{ label: "Repo Setup Guide", url: "#" }], estimatedHours: 4, completed: false },
        { day: 10, topic: "Core Features", description: `Implement the main features of your project`, resources: [{ label: "Feature Guide", url: "#" }, { label: "Code Examples", url: "#" }], estimatedHours: 4, completed: false },
        { day: 11, topic: "Integration", description: `Integrate ${primarySkill} with other tools and libraries`, resources: [{ label: "Integration Docs", url: "#" }], estimatedHours: 4, completed: false },
        { day: 12, topic: "Testing", description: `Write tests for your ${primarySkill} project`, resources: [{ label: "Testing Guide", url: "#" }], estimatedHours: 4, completed: false },
        { day: 13, topic: "Refinement", description: `Polish and optimize your project code`, resources: [{ label: "Refactoring Guide", url: "#" }], estimatedHours: 4, completed: false },
        { day: 14, topic: "Week 2 Review", description: `Code review and document learnings`, resources: [{ label: "Review Checklist", url: "#" }], estimatedHours: 2, completed: false },
      ],
    },
    {
      week: 3,
      title: "Integration",
      focus: `Apply ${primarySkill} in real-world context`,
      days: [
        { day: 15, topic: `${secondarySkill} Integration`, description: `Connect ${primarySkill} with ${secondarySkill}`, resources: [{ label: "Integration Docs", url: "#" }], estimatedHours: 4, completed: false },
        { day: 16, topic: "Migrate Existing Code", description: `Migrate a small app to use ${primarySkill}`, resources: [{ label: "Migration Guide", url: "#" }], estimatedHours: 4, completed: false },
        { day: 17, topic: "Advanced Patterns", description: `Learn advanced ${primarySkill} patterns`, resources: [{ label: "Advanced Patterns", url: "#" }], estimatedHours: 4, completed: false },
        { day: 18, topic: `${tertiarySkill} Connection`, description: `Integrate ${primarySkill} with ${tertiarySkill}`, resources: [{ label: "Connection Guide", url: "#" }], estimatedHours: 4, completed: false },
        { day: 19, topic: "Performance", description: `Optimize performance of your ${primarySkill} code`, resources: [{ label: "Performance Guide", url: "#" }], estimatedHours: 4, completed: false },
        { day: 20, topic: "Error Handling", description: `Implement robust error handling patterns`, resources: [{ label: "Error Handling Guide", url: "#" }], estimatedHours: 3, completed: false },
        { day: 21, topic: "Mid-Point Review", description: `Review progress and adjust learning plan`, resources: [{ label: "Progress Tracker", url: "#" }], estimatedHours: 2, completed: false },
      ],
    },
    {
      week: 4,
      title: "Mastery",
      focus: "Advanced patterns + testing expertise",
      days: [
        { day: 22, topic: "Advanced Testing", description: `Write comprehensive tests for ${primarySkill}`, resources: [{ label: "Testing Patterns", url: "#" }, { label: "Mocking Guide", url: "#" }], estimatedHours: 4, completed: false },
        { day: 23, topic: "Architecture", description: `Design scalable architecture with ${primarySkill}`, resources: [{ label: "Architecture Guide", url: "#" }], estimatedHours: 4, completed: false },
        { day: 24, topic: "Real-World Case Study", description: `Analyze a production codebase using ${primarySkill}`, resources: [{ label: "Case Study", url: "#" }], estimatedHours: 4, completed: false },
        { day: 25, topic: "Final Project", description: `Build a capstone project showcasing all skills`, resources: [{ label: "Project Requirements", url: "#" }], estimatedHours: 5, completed: false },
        { day: 26, topic: "Code Review", description: `Review and refactor your final project`, resources: [{ label: "Code Review Checklist", url: "#" }], estimatedHours: 4, completed: false },
        { day: 27, topic: "Documentation", description: `Document your project and learnings`, resources: [{ label: "Documentation Guide", url: "#" }], estimatedHours: 3, completed: false },
        { day: 28, topic: "Mastery Assessment", description: `Final assessment and celebrate your progress!`, resources: [{ label: "Assessment Quiz", url: "#" }], estimatedHours: 2, completed: false },
      ],
    },
  ];
}

/* ───────────────────── localStorage Helpers ───────────────────── */
const PLAN_STORAGE_KEY = "skillgap_28day_plan";
const ROLE_STORAGE_KEY = "skillgap_selected_role";

function loadPlanProgress(): Record<number, boolean> | null {
  try {
    const stored = localStorage.getItem(PLAN_STORAGE_KEY);
    if (stored) return JSON.parse(stored);
  } catch { /* ignore */ }
  return null;
}

function savePlanProgress(progress: Record<number, boolean>) {
  try {
    localStorage.setItem(PLAN_STORAGE_KEY, JSON.stringify(progress));
  } catch { /* ignore */ }
}

function loadSelectedRole(): string | null {
  try {
    return localStorage.getItem(ROLE_STORAGE_KEY);
  } catch { /* ignore */ }
  return null;
}

function saveSelectedRole(role: string) {
  try {
    localStorage.setItem(ROLE_STORAGE_KEY, role);
  } catch { /* ignore */ }
}

/* ───────────────────── Custom Tooltip ───────────────────── */
function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ name: string; value: number; color: string }>; label?: string }) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#0A0A0A] border border-white/[0.1] rounded-xl px-4 py-3 shadow-xl">
        <p className="text-white text-xs font-medium mb-1">{label}</p>
        {payload.map((entry, i) => (
          <p key={i} className="text-xs" style={{ color: entry.color }}>
            {entry.name}: {entry.value}%
          </p>
        ))}
      </div>
    );
  }
  return null;
}

/* ───────────────────── Skill Gap Tooltip ───────────────────── */
function SkillGapTooltip({ active, payload }: { active?: boolean; payload?: Array<{ payload: { name: string; gap: number } }> }) {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const gap = data.gap;
    return (
      <div className="bg-[#0A0A0A] border border-white/[0.1] rounded-xl px-4 py-3 shadow-xl">
        <p className="text-white text-xs font-medium mb-1">{data.name}</p>
        <p className={gap > 0 ? "text-red-400 text-xs" : "text-[#C6FF34] text-xs"}>
          {gap > 0 ? `Gap: ${gap}% below required` : "Skill mastered!"}
        </p>
      </div>
    );
  }
  return null;
}

/* ───────────────────── Get User Skills from localStorage ───────────────────── */
function getUserSkills(): string[] {
  try {
    const stored = localStorage.getItem("talent_profile");
    if (stored) {
      const profile = JSON.parse(stored);
      if (profile.skills && Array.isArray(profile.skills)) {
        return profile.skills.map((s: string | { name: string }) =>
          typeof s === "string" ? s : s.name
        );
      }
    }
  } catch { /* ignore */ }
  // Return default skills for demo
  return ["React", "JavaScript", "CSS", "HTML"];
}



/* ═══════════════════════════════════════════════════════════════
   MAIN: SkillGap Page
   ═══════════════════════════════════════════════════════════════ */
export default function SkillGap() {
  const [selectedRole, setSelectedRole] = useState(() =>
    loadSelectedRole() || "Senior Frontend Developer"
  );
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const [activeWeek, setActiveWeek] = useState(1);
  const [planProgress, setPlanProgress] = useState<Record<number, boolean>>(() =>
    loadPlanProgress() || {}
  );
  const [chartType, setChartType] = useState<"bar" | "radar">("bar");

  const userSkills = useMemo(() => getUserSkills(), []);

  const requiredSkills = ROLE_SKILLS[selectedRole] || [];

  const skillComparison = useMemo(
    () => generateSkillLevels(requiredSkills, userSkills),
    [requiredSkills, userSkills]
  );

  const missingSkills = useMemo(
    () => skillComparison.filter((s) => !s.mastered).map((s) => s.name),
    [skillComparison]
  );

  const masteredSkills = useMemo(
    () => skillComparison.filter((s) => s.mastered).map((s) => s.name),
    [skillComparison]
  );

  const [plan, setPlan] = useState<PlanWeek[]>(() =>
    generate28DayPlan(missingSkills)
  );

  // Regenerate plan when missing skills change
  useEffect(() => {
    const newPlan = generate28DayPlan(missingSkills);
    // Restore completion state from localStorage
    const stored = loadPlanProgress();
    if (stored) {
      newPlan.forEach((week) => {
        week.days.forEach((day) => {
          day.completed = !!stored[day.day];
        });
      });
    }
    setPlan(newPlan);
  }, [missingSkills]);

  // Save selected role
  useEffect(() => {
    saveSelectedRole(selectedRole);
  }, [selectedRole]);

  const toggleDayCompletion = useCallback((weekIndex: number, dayIndex: number) => {
    setPlan((prev) => {
      const updated = prev.map((w, wi) => ({
        ...w,
        days: w.days.map((d, di) =>
          wi === weekIndex && di === dayIndex
            ? { ...d, completed: !d.completed }
            : d
        ),
      }));

      // Save to localStorage
      const progress: Record<number, boolean> = {};
      updated.forEach((w) => {
        w.days.forEach((d) => {
          if (d.completed) progress[d.day] = true;
        });
      });
      savePlanProgress(progress);
      setPlanProgress(progress);

      return updated;
    });
  }, []);

  const resetProgress = useCallback(() => {
    if (window.confirm("Are you sure you want to reset all progress?")) {
      setPlan((prev) =>
        prev.map((w) => ({
          ...w,
          days: w.days.map((d) => ({ ...d, completed: false })),
        }))
      );
      savePlanProgress({});
      setPlanProgress({});
    }
  }, []);

  const completedDays = Object.keys(planProgress).length;
  const totalDays = 28;
  const progressPercent = Math.round((completedDays / totalDays) * 100);

  const gapChartData = useMemo(
    () =>
      skillComparison.map((s) => ({
        name: s.name,
        yourLevel: s.yourLevel,
        requiredLevel: s.requiredLevel,
        gap: Math.max(0, s.requiredLevel - s.yourLevel),
      })),
    [skillComparison]
  );

  const radarData = useMemo(
    () =>
      skillComparison.map((s) => ({
        skill: s.name,
        You: s.yourLevel,
        Required: s.requiredLevel,
        fullMark: 100,
      })),
    [skillComparison]
  );

  const RoleIcon = ROLE_ICONS[selectedRole] || Zap;

  return (
    <main className="bg-black min-h-screen">
      {/* ──────────── Hero Header ──────────── */}
      <section className="relative pt-24 pb-12 overflow-hidden">
        <div
          className="absolute top-0 right-0 w-[400px] h-[400px] rounded-full opacity-[0.06]"
          style={{ background: "radial-gradient(circle, #7E3BED 0%, transparent 70%)" }}
        />
        <div className="absolute top-20 left-0 w-[300px] h-[300px] rounded-full opacity-[0.04]"
          style={{ background: "radial-gradient(circle, #C6FF34 0%, transparent 70%)" }}
        />

        <div className="relative z-10 max-w-6xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.19, 1, 0.22, 1] }}
            className="text-center mb-10"
          >
            <span className="text-[#C6FF34] text-sm font-medium tracking-wider uppercase mb-4 block">
              Personalized Learning
            </span>
            <h1 className="font-display text-4xl sm:text-5xl text-white leading-[1.05] mb-4">
              Skill Gap{" "}
              <span className="bg-gradient-to-r from-[#C6FF34] to-[#7E3BED] bg-clip-text text-transparent">
                Analysis
              </span>
            </h1>
            <p className="text-[#A0A0A0] text-lg max-w-xl mx-auto">
              Discover what skills to develop to reach your goals
            </p>
          </motion.div>

          <div className="mx-auto max-w-2xl rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6 text-left">
            <p className="text-lg font-semibold text-white">No evidence yet</p>
            <p className="mt-2 text-sm leading-6 text-[#A0A0A0]">You have not created evidence yet. Levav 28 Day 1 is the fastest way to start.</p>
          </div>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-6 pb-20 space-y-8">
        {/* ──────────── Section 1: Target Role Selector + Skills Comparison ──────────── */}
        <motion.section
          className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.06] rounded-2xl p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2, ease: [0.19, 1, 0.22, 1] }}
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#7E3BED]/15 flex items-center justify-center">
                <RoleIcon className="w-5 h-5 text-[#7E3BED]" />
              </div>
              <div>
                <h2 className="text-white font-semibold text-lg">Target Role</h2>
                <p className="text-[#666666] text-xs">Select a role to compare required skills</p>
              </div>
            </div>

            {/* Role Selector Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowRoleDropdown(!showRoleDropdown)}
                className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm hover:border-[#C6FF34]/30 transition-colors"
              >
                <RoleIcon className="w-4 h-4 text-[#C6FF34]" />
                {selectedRole}
                <ChevronDown className="w-4 h-4 text-[#666666]" />
              </button>
              {showRoleDropdown && (
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute right-0 top-full mt-2 bg-[#0A0A0A] border border-white/[0.1] rounded-xl shadow-2xl z-50 min-w-[240px] overflow-hidden"
                >
                  {Object.keys(ROLE_SKILLS).map((role) => {
                    const Icon = ROLE_ICONS[role] || Zap;
                    return (
                      <button
                        key={role}
                        onClick={() => {
                          setSelectedRole(role);
                          setShowRoleDropdown(false);
                        }}
                        className={`w-full flex items-center gap-3 px-4 py-3 text-left text-sm transition-colors ${
                          selectedRole === role
                            ? "bg-[#C6FF34]/10 text-[#C6FF34]"
                            : "text-[#A0A0A0] hover:text-white hover:bg-white/5"
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        {role}
                      </button>
                    );
                  })}
                </motion.div>
              )}
            </div>
          </div>

          {/* Skills Comparison Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Your Skills */}
            <div className="bg-white/[0.02] border border-white/[0.04] rounded-xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <CheckCircle2 className="w-5 h-5 text-[#C6FF34]" />
                <h3 className="text-white font-medium text-sm">
                  Your Skills <span className="text-[#666666] text-xs">({masteredSkills.length} matched)</span>
                </h3>
              </div>
              <div className="space-y-2">
                {skillComparison.map((skill) => (
                  <div
                    key={skill.name}
                    className={`flex items-center gap-3 p-2.5 rounded-lg transition-all ${
                      skill.mastered
                        ? "bg-[#C6FF34]/5 border border-[#C6FF34]/15"
                        : "bg-white/[0.02] border border-white/[0.04] opacity-50"
                    }`}
                  >
                    {skill.mastered ? (
                      <CheckCircle2 className="w-4 h-4 text-[#C6FF34] flex-shrink-0" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-400/60 flex-shrink-0" />
                    )}
                    <div className="flex-1">
                      <span className={`text-sm ${skill.mastered ? "text-white" : "text-[#666666]"}`}>
                        {skill.name}
                      </span>
                      {skill.mastered && (
                        <div className="mt-1 h-1 bg-white/10 rounded-full overflow-hidden">
                          <motion.div
                            className="h-full bg-[#C6FF34] rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${skill.yourLevel}%` }}
                            transition={{ duration: 0.8, delay: 0.3 }}
                          />
                        </div>
                      )}
                    </div>
                    {skill.mastered && (
                      <span className="text-[#C6FF34] text-xs font-medium">{skill.yourLevel}%</span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Missing Skills */}
            <div className="bg-white/[0.02] border border-white/[0.04] rounded-xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <XCircle className="w-5 h-5 text-red-400" />
                <h3 className="text-white font-medium text-sm">
                  Skill Gaps <span className="text-[#666666] text-xs">({missingSkills.length} to develop)</span>
                </h3>
              </div>
              <div className="space-y-2">
                {skillComparison.map((skill) => (
                  <div
                    key={`gap-${skill.name}`}
                    className={`flex items-center gap-3 p-2.5 rounded-lg transition-all ${
                      !skill.mastered
                        ? "bg-red-400/5 border border-red-400/15"
                        : "bg-white/[0.02] border border-white/[0.04] opacity-50"
                    }`}
                  >
                    {!skill.mastered ? (
                      <XCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                    ) : (
                      <CheckCircle2 className="w-4 h-4 text-[#C6FF34]/60 flex-shrink-0" />
                    )}
                    <div className="flex-1">
                      <span className={`text-sm ${!skill.mastered ? "text-white" : "text-[#666666]"}`}>
                        {skill.name}
                      </span>
                      {!skill.mastered && (
                        <div className="mt-1 flex items-center gap-2">
                          <div className="flex-1 h-1 bg-white/10 rounded-full overflow-hidden">
                            <motion.div
                              className="h-full bg-red-400 rounded-full"
                              initial={{ width: 0 }}
                              animate={{ width: `${skill.yourLevel}%` }}
                              transition={{ duration: 0.8, delay: 0.3 }}
                            />
                          </div>
                          <span className="text-[10px] text-red-400">Need {skill.requiredLevel}%</span>
                        </div>
                      )}
                    </div>
                    {!skill.mastered && (
                      <span className="text-red-400 text-xs font-medium">-{skill.requiredLevel - skill.yourLevel}%</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.section>

        {/* ──────────── Section 2: Skill Gap Visualization ──────────── */}
        <motion.section
          className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.06] rounded-2xl p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.35, ease: [0.19, 1, 0.22, 1] }}
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#C6FF34]/10 flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-[#C6FF34]" />
              </div>
              <div>
                <h2 className="text-white font-semibold text-lg">Skill Gap Visualization</h2>
                <p className="text-[#666666] text-xs">Your level vs required level</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setChartType("bar")}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  chartType === "bar"
                    ? "bg-[#C6FF34] text-black"
                    : "bg-white/5 text-[#666666] hover:text-white"
                }`}
              >
                Bar
              </button>
              <button
                onClick={() => setChartType("radar")}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  chartType === "radar"
                    ? "bg-[#C6FF34] text-black"
                    : "bg-white/5 text-[#666666] hover:text-white"
                }`}
              >
                Radar
              </button>
            </div>
          </div>

          {chartType === "bar" ? (
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={gapChartData} layout="vertical" barGap={4}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis
                  type="number"
                  domain={[0, 100]}
                  tick={{ fill: "#666666", fontSize: 12 }}
                  axisLine={{ stroke: "rgba(255,255,255,0.06)" }}
                  tickLine={false}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  tick={{ fill: "#A0A0A0", fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                  width={100}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar
                  dataKey="yourLevel"
                  name="Your Level"
                  fill="#C6FF34"
                  radius={[0, 4, 4, 0]}
                  barSize={14}
                />
                <Bar
                  dataKey="requiredLevel"
                  name="Required Level"
                  fill="#7E3BED"
                  radius={[0, 4, 4, 0]}
                  barSize={14}
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <ResponsiveContainer width="100%" height={320}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="rgba(255,255,255,0.1)" />
                <PolarAngleAxis
                  dataKey="skill"
                  tick={{ fill: "#A0A0A0", fontSize: 11 }}
                />
                <PolarRadiusAxis
                  domain={[0, 100]}
                  tick={{ fill: "#666666", fontSize: 10 }}
                />
                <Radar
                  name="You"
                  dataKey="You"
                  stroke="#C6FF34"
                  fill="#C6FF34"
                  fillOpacity={0.2}
                  strokeWidth={2}
                />
                <Radar
                  name="Required"
                  dataKey="Required"
                  stroke="#7E3BED"
                  fill="#7E3BED"
                  fillOpacity={0.15}
                  strokeWidth={2}
                />
                <Tooltip content={<CustomTooltip />} />
              </RadarChart>
            </ResponsiveContainer>
          )}

          {/* Legend */}
          <div className="flex items-center justify-center gap-6 mt-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[#C6FF34]" />
              <span className="text-[#A0A0A0] text-xs">Your Level</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[#7E3BED]" />
              <span className="text-[#A0A0A0] text-xs">Required Level</span>
            </div>
          </div>

          {/* Progress Bars Summary */}
          <div className="mt-6 space-y-3">
            {skillComparison.map((skill) => {
              const gap = Math.max(0, skill.requiredLevel - skill.yourLevel);
              const isGap = gap > 0;
              return (
                <div key={`bar-${skill.name}`} className="flex items-center gap-3">
                  <span className="text-[#A0A0A0] text-xs w-28 text-right flex-shrink-0">{skill.name}</span>
                  <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                    <motion.div
                      className={`h-full rounded-full ${isGap ? "bg-[#C6FF34]" : "bg-[#C6FF34]"}`}
                      initial={{ width: 0 }}
                      animate={{ width: `${skill.yourLevel}%` }}
                      transition={{ duration: 1, delay: 0.4 }}
                    />
                  </div>
                  <span className="text-white text-xs font-medium w-8">{skill.yourLevel}%</span>
                  <div className="w-16 h-2 bg-white/10 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-[#7E3BED] rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${skill.requiredLevel}%` }}
                      transition={{ duration: 1, delay: 0.5 }}
                    />
                  </div>
                  <span className="text-[#7E3BED] text-xs font-medium w-8">{skill.requiredLevel}%</span>
                </div>
              );
            })}
          </div>
        </motion.section>

        {/* ──────────── Section 3: 28-Day Improvement Plan ──────────── */}
        <motion.section
          className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.06] rounded-2xl p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5, ease: [0.19, 1, 0.22, 1] }}
        >
          {/* Plan Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#C6FF34]/10 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-[#C6FF34]" />
              </div>
              <div>
                <h2 className="text-white font-semibold text-lg">28-Day Improvement Plan</h2>
                <p className="text-[#666666] text-xs">Personalized based on your skill gaps</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {/* Progress Tracker */}
              <div className="flex items-center gap-3 bg-white/[0.02] border border-white/[0.04] rounded-xl px-4 py-2">
                <Trophy className="w-4 h-4 text-[#C6FF34]" />
                <span className="text-white text-sm font-medium">
                  Day {completedDays} of {totalDays}
                </span>
                <span className="text-[#666666] text-xs">—</span>
                <span className="text-[#C6FF34] text-sm font-medium">{progressPercent}% complete</span>
              </div>
              <button
                onClick={resetProgress}
                className="w-9 h-9 rounded-xl bg-white/5 border border-white/[0.06] flex items-center justify-center text-[#666666] hover:text-red-400 hover:border-red-400/20 transition-all"
                title="Reset Progress"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Overall Progress Bar */}
          <div className="mb-6">
            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-[#C6FF34] to-[#7E3BED]"
                initial={{ width: 0 }}
                animate={{ width: `${progressPercent}%` }}
                transition={{ duration: 1, ease: [0.19, 1, 0.22, 1] }}
              />
            </div>
          </div>

          {/* Week Tabs */}
          <div className="flex flex-wrap gap-2 mb-6">
            {plan.map((week) => {
              const weekCompleted = week.days.filter((d) => d.completed).length;
              return (
                <button
                  key={week.week}
                  onClick={() => setActiveWeek(week.week)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    activeWeek === week.week
                      ? "bg-[#C6FF34] text-black"
                      : "bg-white/5 border border-white/[0.06] text-[#A0A0A0] hover:bg-white/10 hover:text-white"
                  }`}
                >
                  {activeWeek === week.week ? (
                    <Sparkles className="w-3.5 h-3.5" />
                  ) : (
                    <Layers className="w-3.5 h-3.5" />
                  )}
                  Week {week.week}: {week.title}
                  {weekCompleted > 0 && (
                    <span className={`text-xs ${activeWeek === week.week ? "text-black/60" : "text-[#C6FF34]"}`}>
                      ({weekCompleted}/7)
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Active Week Info */}
          {plan[activeWeek - 1] && (
            <div className="bg-white/[0.02] border border-white/[0.04] rounded-xl p-4 mb-6">
              <div className="flex items-center gap-2 mb-1">
                <Brain className="w-4 h-4 text-[#7E3BED]" />
                <span className="text-white text-sm font-medium">
                  Week {activeWeek} Focus: {plan[activeWeek - 1].focus}
                </span>
              </div>
              <p className="text-[#666666] text-xs ml-6">
                {plan[activeWeek - 1].days.filter((d) => d.completed).length} of 7 days completed
              </p>
            </div>
          )}

          {/* Days Grid */}
          {plan[activeWeek - 1] && (
            <motion.div
              key={activeWeek}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-3"
            >
              {plan[activeWeek - 1].days.map((day, dayIndex) => (
                <div
                  key={day.day}
                  className={`bg-white/[0.02] border rounded-xl p-4 transition-all ${
                    day.completed
                      ? "border-[#C6FF34]/20 bg-[#C6FF34]/[0.02]"
                      : "border-white/[0.04] hover:border-white/[0.08]"
                  }`}
                >
                  <div className="flex items-start gap-4">
                    {/* Day Number */}
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                        day.completed
                          ? "bg-[#C6FF34]/15 text-[#C6FF34]"
                          : "bg-white/5 text-[#A0A0A0]"
                      }`}
                    >
                      {day.completed ? (
                        <Check className="w-5 h-5" />
                      ) : (
                        <span className="text-sm font-semibold">{day.day}</span>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h4 className={`text-sm font-medium ${day.completed ? "text-[#C6FF34]" : "text-white"}`}>
                            {day.topic}
                          </h4>
                          <p className="text-[#666666] text-xs mt-0.5">{day.description}</p>
                        </div>
                        <button
                          onClick={() => toggleDayCompletion(activeWeek - 1, dayIndex)}
                          className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-all ${
                            day.completed
                              ? "bg-[#C6FF34] text-black hover:bg-[#d4ff5c]"
                              : "bg-white/5 border border-white/[0.06] text-[#666666] hover:text-white hover:bg-white/10"
                          }`}
                        >
                          {day.completed ? (
                            <Check className="w-4 h-4" />
                          ) : (
                            <Check className="w-4 h-4" />
                          )}
                        </button>
                      </div>

                      {/* Resources + Time */}
                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center gap-2 flex-wrap">
                          {day.resources.map((resource, ri) => (
                            <a
                              key={ri}
                              href={resource.url}
                              className="inline-flex items-center gap-1 text-[10px] bg-white/5 border border-white/[0.04] rounded-lg px-2 py-1 text-[#A0A0A0] hover:text-[#C6FF34] hover:border-[#C6FF34]/20 transition-colors"
                            >
                              <BookOpen className="w-3 h-3" />
                              {resource.label}
                              <ExternalLink className="w-2.5 h-2.5" />
                            </a>
                          ))}
                        </div>
                        <div className="flex items-center gap-1 text-[#666666] text-xs flex-shrink-0">
                          <Clock className="w-3 h-3" />
                          {day.estimatedHours}h
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </motion.div>
          )}
        </motion.section>

        {/* ──────────── Quick Stats Footer ──────────── */}
        <motion.section
          className="grid grid-cols-2 sm:grid-cols-4 gap-4"
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
        >
          {[
            { label: "Skills Matched", value: masteredSkills.length, total: requiredSkills.length, icon: CheckCircle2, color: "#C6FF34" },
            { label: "Skills Missing", value: missingSkills.length, total: requiredSkills.length, icon: XCircle, color: "#EF4444" },
            { label: "Plan Days Done", value: completedDays, total: 28, icon: Calendar, color: "#7E3BED" },
            { label: "Est. Hours Left", value: plan.reduce((acc, w) => acc + w.days.reduce((a, d) => a + (d.completed ? 0 : d.estimatedHours), 0), 0), total: plan.reduce((acc, w) => acc + w.days.reduce((a, d) => a + d.estimatedHours, 0), 0), icon: Clock, color: "#C6FF34" },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.06] rounded-2xl p-5 hover:border-white/[0.1] transition-all"
              variants={fadeUp}
              custom={i}
            >
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${stat.color}15` }}>
                  <stat.icon className="w-4 h-4" style={{ color: stat.color }} />
                </div>
                <span className="text-[#666666] text-xs">{stat.label}</span>
              </div>
              <p className="text-white text-2xl font-semibold">
                {stat.value}
                <span className="text-[#666666] text-sm font-normal"> / {stat.total}</span>
              </p>
            </motion.div>
          ))}
        </motion.section>
      </div>
    </main>
  );
}
