import { useState, useMemo, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  User,
  Briefcase,
  Zap,
  Heart,
  BookOpen,
  Settings,
  Bell,
  Search,
  TrendingUp,
  Lightbulb,
  CheckCircle2,
  Clock,
  Award,
  ArrowRight,
  Target,
  ChevronUp,
  Sparkles,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";
import { useAuth } from "@/hooks/useAuth";
import SmartMatchWidget from "@/components/SmartMatchWidget";
import {
  getCurrentDay,
  isDayCompleted,
  getMyGigs,
  LEVAV28_DAYS,
} from "@/lib/levavData";
import {
  getWriAnalytics,
  getWriLevel,
  getWriHistoryForChart,
  getWriRecommendations,
  getWriSkillBreakdown,
  getWriSummary,
  isWriInitialized,
} from "@/lib/wriService";

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

/* ───────────────────── Mock Data ───────────────────── */
const MOCK_APPLICATIONS = [
  { jobId: 1, status: "shortlisted", createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) },
  { jobId: 2, status: "pending", createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) },
  { jobId: 3, status: "reviewed", createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000) },
];

const MOCK_JOBS = [
  { id: 1, title: "Senior Frontend Developer", location: "Lusaka, Zambia", type: "full-time" },
  { id: 2, title: "Product Designer", location: "Remote", type: "full-time" },
  { id: 3, title: "UX Researcher", location: "Lusaka, Zambia", type: "contract" },
  { id: 4, title: "Backend Engineer", location: "Nairobi, Kenya", type: "remote" },
  { id: 5, title: "DevOps Engineer", location: "Accra, Ghana", type: "full-time" },
];

const MOCK_ACTIVITY = [
  { title: "Applied to Senior Frontend Developer", date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), status: "shortlisted", icon: Briefcase, color: "#C6FF34" },
  { title: "Applied to Product Designer", date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), status: "pending", icon: Briefcase, color: "#7E3BED" },
  { title: "WRI Score updated", date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), status: "reviewed", icon: Target, color: "#C6FF34" },
  { title: "Profile viewed by BongoHive HR", date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), status: "pending", icon: User, color: "#7E3BED" },
  { title: "Applied to UX Researcher", date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000), status: "rejected", icon: Briefcase, color: "#EF4444" },
];

/* ───────────────────── Sidebar Items ───────────────────── */
const allSidebarItems = [
  { icon: LayoutDashboard, label: "Overview", path: "/dashboard" },
  { icon: User, label: "My Profile", path: "/profile/create" },
  { icon: Briefcase, label: "Opportunities", path: "/opportunities" },
  { icon: Zap, label: "QuickWork", path: "/quickwork" },
  { icon: Heart, label: "Impact", path: "/impact" },
  { icon: BookOpen, label: "Learn", path: "/learn" },
  { icon: Target, label: "Levav 28", path: "/levav28" },
  { icon: Award, label: "Content Studio", path: "/content-studio" },
  { icon: Settings, label: "Settings", path: "/settings" },
];

/* ───────────────────── CircularProgress ───────────────────── */
function CircularProgress({
  value,
  size = 80,
  strokeWidth = 6,
  label,
}: {
  value: number;
  size?: number;
  strokeWidth?: number;
  label?: string;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (value / 100) * circumference;
  const isEmpty = value === 0;

  return (
    <div className="relative" style={{ width: size, height: size }}>
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
          stroke={isEmpty ? "rgba(255,255,255,0.08)" : "#C6FF34"}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={isEmpty ? circumference : offset}
          strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 1s ease" }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className={`font-semibold text-lg ${isEmpty ? "text-[#444444]" : "text-white"}`}>
          {isEmpty ? "—" : label ?? String(value)}
        </span>
      </div>
    </div>
  );
}

/* ───────────────────── Custom Tooltip ───────────────────── */
function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number }>; label?: string }) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#0A0A0A] border border-white/[0.1] rounded-xl px-4 py-3 shadow-xl">
        <p className="text-[#666666] text-xs mb-1">{label}</p>
        <p className="text-white text-sm font-medium">Score: {payload[0].value}</p>
      </div>
    );
  }
  return null;
}

/* ───────────────────── WRI Dimension Tooltip ───────────────────── */
function WriDimensionTooltip() {
  const [show, setShow] = useState(false);
  const breakdown = getWriSkillBreakdown();

  return (
    <div className="relative">
      <button
        onClick={() => setShow(!show)}
        onBlur={() => setTimeout(() => setShow(false), 200)}
        className="text-[#666666] hover:text-[#C6FF34] transition-colors"
      >
        <Award className="w-4 h-4" />
      </button>
      {show && (
        <div className="absolute right-0 top-6 z-50 w-56 bg-[#0A0A0A] border border-white/[0.1] rounded-xl p-4 shadow-xl">
          <p className="text-white text-xs font-medium mb-3">WRI Dimensions</p>
          <div className="space-y-2">
            {breakdown.map((d) => (
              <div key={d.skill} className="flex items-center justify-between">
                <span className="text-[#A0A0A0] text-xs">{d.skill}</span>
                <div className="flex items-center gap-2">
                  <div className="w-16 h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-[#C6FF34] to-[#7E3BED]"
                      style={{ width: `${d.score}%` }}
                    />
                  </div>
                  <span className="text-white text-xs font-medium w-6 text-right">
                    {d.unlocked ? d.score : "—"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ───────────────────── Sidebar ───────────────────── */
function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const isChampion = user?.role === "champion";

  // Filter sidebar items based on role
  const sidebarItems = useMemo(() => {
    if (isChampion) return allSidebarItems;
    return allSidebarItems.filter((item) => item.path !== "/content-studio");
  }, [isChampion]);

  // Derive active item from current route, fallback to localStorage, then "Overview"
  const getActiveFromRoute = () => {
    const currentPath = location.pathname;
    const matched = sidebarItems.find((item) =>
      item.path !== "/dashboard" && currentPath.startsWith(item.path)
    );
    if (matched) return matched.label;
    if (currentPath === "/dashboard") return "Overview";
    // Fallback to localStorage for remembered state
    const saved = localStorage.getItem("dashboard_active_sidebar");
    if (saved && sidebarItems.some((i) => i.label === saved)) return saved;
    return "Overview";
  };

  const [activeItem, setActiveItem] = useState(getActiveFromRoute);

  // Persist active item to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("dashboard_active_sidebar", activeItem);
  }, [activeItem]);

  const handleClick = (label: string, path: string) => {
    setActiveItem(label);
    localStorage.setItem("dashboard_active_sidebar", label);
    navigate(path);
    onNavigate?.();
  };

  return (
    <aside className="w-full md:w-[200px] md:min-h-screen bg-[#0A0A0A] border-b md:border-b-0 md:border-r border-white/[0.06] flex flex-row md:flex-col md:fixed md:left-0 md:top-[72px] md:z-40 overflow-x-auto scrollbar-hide">
      {/* Logo — desktop only */}
      <div className="hidden md:block p-5 border-b border-white/[0.06]">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#C6FF34] to-[#7E3BED] flex items-center justify-center">
            <Zap className="w-4 h-4 text-black" />
          </div>
          <span className="text-white font-semibold text-sm tracking-tight">Levav</span>
        </Link>
      </div>

      {/* Nav Items — horizontal scroll on mobile, vertical on desktop */}
      <nav className="flex md:flex-1 md:flex-col md:p-3 md:space-y-1 p-2 gap-1 min-w-0">
        {sidebarItems.map((item) => (
          <button
            key={item.label}
            onClick={() => handleClick(item.label, item.path)}
            className={`flex items-center gap-2 md:gap-3 px-3 md:px-3 py-2 md:py-2.5 rounded-xl text-xs md:text-sm font-medium transition-all whitespace-nowrap flex-shrink-0 ${
              activeItem === item.label
                ? "bg-[#C6FF34]/10 text-[#C6FF34] border border-[#C6FF34]/20"
                : "text-[#A0A0A0] hover:text-white hover:bg-white/5 border border-transparent"
            }`}
          >
            <item.icon className="w-4 h-4 md:w-4.5 md:h-4.5" />
            <span className="hidden sm:inline">{item.label}</span>
          </button>
        ))}
      </nav>

      {/* Bottom — desktop only */}
      <div className="hidden md:block p-4 border-t border-white/[0.06]">
        <SidebarWriWidget />
      </div>
    </aside>
  );
}

/* ───────────────────── Sidebar WRI Widget (local only) ───────────────────── */
function SidebarWriWidget() {
  const summary = getWriSummary();
  const recommendations = getWriRecommendations();

  return (
    <div className="bg-white/[0.03] rounded-xl p-3 border border-white/[0.06]">
      <div className="flex items-center gap-2 mb-2">
        <Target className="w-4 h-4 text-[#C6FF34]" />
        <span className="text-white text-xs font-medium">WRI Score</span>
        {summary.initialized && (
          <span
            className="text-[10px] px-1.5 py-0.5 rounded-full font-medium ml-auto"
            style={{ color: summary.level.color, backgroundColor: `${summary.level.color}15` }}
          >
            {summary.level.title}
          </span>
        )}
      </div>
      {summary.initialized ? (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-[#C6FF34] to-[#7E3BED]"
                initial={{ width: 0 }}
                animate={{ width: `${summary.overall}%` }}
                transition={{ duration: 1, delay: 0.5, ease: [0.19, 1, 0.22, 1] }}
              />
            </div>
            <span className="text-white text-xs font-semibold">{summary.overall}</span>
          </div>
          {summary.level.pointsNeeded > 0 && (
            <p className="text-[#666666] text-[10px]">
              {summary.level.pointsNeeded} pts to {summary.level.nextLevel}
            </p>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          <Link
            to="/levav28"
            className="text-[#C6FF34] text-xs hover:underline flex items-center gap-1"
          >
            Start Your Journey
            <ArrowRight className="w-3 h-3" />
          </Link>
          {recommendations.length > 0 && (
            <p className="text-[#666666] text-[10px] leading-relaxed">
              {recommendations[0]}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

/* ───────────────────── TopBar (local only) ───────────────────── */
function TopBar() {
  const { user } = useAuth();
  const displayName = user?.firstName && user?.lastName
    ? `${user.firstName} ${user.lastName}`
    : user?.name || "User";
  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <header className="h-14 md:h-16 bg-black/50 backdrop-blur-xl border-b border-white/[0.06] flex items-center justify-between px-4 md:px-6 sticky top-0 z-30">
      {/* Search */}
      <div className="relative w-full max-w-[200px] md:max-w-xs lg:w-72">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#666666]" />
        <input
          type="text"
          placeholder="Search..."
          className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-white placeholder-[#666666] focus:outline-none focus:border-[#C6FF34]/30 transition-colors text-sm"
        />
      </div>

      {/* Right */}
      <div className="flex items-center gap-2 md:gap-4">
        <button className="relative w-9 h-9 rounded-xl bg-white/5 border border-white/[0.06] flex items-center justify-center hover:bg-white/10 transition-colors">
          <Bell className="w-4 h-4 text-[#A0A0A0]" />
          <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-[#C6FF34] rounded-full border-2 border-black" />
        </button>
        <div className="flex items-center gap-2 md:gap-3 pl-2 md:pl-4 border-l border-white/[0.06]">
          <div className="text-right hidden sm:block">
            <p className="text-white text-sm font-medium">{displayName}</p>
            <p className="text-[#666666] text-xs">Talent</p>
          </div>
          <div className="w-8 h-8 md:w-9 md:h-9 rounded-xl bg-gradient-to-br from-[#C6FF34] to-[#7E3BED] flex items-center justify-center text-black text-xs font-bold">
            {initials}
          </div>
        </div>
      </div>
    </header>
  );
}

/* ───────────────────── Loading Skeleton ───────────────────── */
function SkeletonCard() {
  return (
    <div className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.06] rounded-2xl p-5">
      <div className="animate-pulse space-y-3">
        <div className="flex items-start justify-between">
          <div className="w-10 h-10 rounded-xl bg-white/[0.05]" />
          <div className="w-12 h-12 rounded-full bg-white/[0.05]" />
        </div>
        <div className="h-3 w-20 bg-white/[0.05] rounded" />
        <div className="h-7 w-12 bg-white/[0.05] rounded" />
        <div className="h-3 w-28 bg-white/[0.05] rounded" />
      </div>
    </div>
  );
}

function SkeletonChart() {
  return (
    <div className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.06] rounded-2xl p-6">
      <div className="animate-pulse space-y-4">
        <div className="h-5 w-32 bg-white/[0.05] rounded" />
        <div className="h-3 w-48 bg-white/[0.05] rounded" />
        <div className="h-60 bg-white/[0.03] rounded-xl" />
      </div>
    </div>
  );
}

/* ───────────────────── StatCards (local only) ───────────────────── */
function StatCards() {
  const analytics = getWriAnalytics();
  const wriLevel = getWriLevel(analytics.overall);
  const wriInitialized = isWriInitialized();
  const totalApplications = MOCK_APPLICATIONS.length;
  const activeJobs = 12; // Mock value

  // QuickWork stats
  const myGigs = getMyGigs();
  const completedGigs = myGigs.filter((g) => g.status === "completed").length;

  // Levav 28 progress
  const currentDay = getCurrentDay();
  const totalDays = LEVAV28_DAYS.length;
  const completedDays = LEVAV28_DAYS.filter((_, i) => isDayCompleted(i + 1)).length;
  const levav28Percent = Math.round((completedDays / totalDays) * 100);

  const stats = useMemo(() => [
    {
      title: "WRI Score",
      value: wriInitialized ? String(analytics.overall) : "Start Your Journey",
      subtitle: wriInitialized
        ? `${wriLevel.title} · ${wriLevel.pointsNeeded} pts to ${wriLevel.nextLevel}`
        : "Complete Day 1 of Levav 28 to begin",
      icon: Target,
      color: "#C6FF34",
      hasChart: true,
      chartValue: analytics.overall,
      link: wriInitialized ? undefined : "/levav28",
    },
    {
      title: "Applications",
      value: String(totalApplications),
      subtitle: totalApplications > 0 ? "Tracked" : "No applications yet",
      icon: CheckCircle2,
      color: "#7E3BED",
      hasChart: false,
    },
    {
      title: "QuickWork",
      value: String(completedGigs),
      subtitle: completedGigs > 0 ? "Gigs completed" : "No gigs yet",
      icon: Zap,
      color: "#C6FF34",
      hasChart: false,
      link: "/quickwork",
    },
    {
      title: "Levav 28",
      value: `Day ${currentDay}`,
      subtitle: `${completedDays}/${totalDays} days (${levav28Percent}%)`,
      icon: Target,
      color: "#7E3BED",
      hasChart: false,
      link: "/levav28",
    },
  ], [analytics, wriLevel, wriInitialized, totalApplications, completedGigs, currentDay, completedDays, totalDays, levav28Percent]);

  return (
    <motion.div
      className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4"
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
    >
      {stats.map((stat, i) => (
        <motion.div
          key={stat.title}
          className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.06] rounded-2xl p-5 hover:border-white/[0.1] transition-all"
          variants={fadeUp}
          custom={i}
        >
          <div className="flex items-start justify-between mb-4">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: `${stat.color}15` }}
            >
              <stat.icon className="w-5 h-5" style={{ color: stat.color }} />
            </div>
            {stat.hasChart && (
              <div className="flex items-center gap-2">
                <WriDimensionTooltip />
                <CircularProgress
                  value={stat.chartValue ?? 0}
                  size={52}
                  strokeWidth={4}
                />
              </div>
            )}
          </div>
          <p className="text-[#666666] text-xs uppercase tracking-wider mb-1">{stat.title}</p>
          {stat.link ? (
            <Link to={stat.link} className="block group">
              <p className="text-white text-2xl font-semibold mb-1 group-hover:text-[#C6FF34] transition-colors">
                {stat.value}
              </p>
            </Link>
          ) : (
            <p className="text-white text-2xl font-semibold mb-1">{stat.value}</p>
          )}
          <div className="flex items-center gap-1">
            {wriInitialized || stat.title !== "WRI Score" ? (
              <>
                <ChevronUp className="w-3 h-3 text-[#C6FF34]" />
                <span className="text-[#C6FF34] text-xs">{stat.subtitle}</span>
              </>
            ) : (
              <Link
                to="/levav28"
                className="text-[#C6FF34] text-xs hover:underline flex items-center gap-1"
              >
                {stat.subtitle}
                <ArrowRight className="w-3 h-3" />
              </Link>
            )}
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
}

/* ───────────────────── ChartsSection (local only) ───────────────────── */
function ChartsSection() {
  const analytics = getWriAnalytics();
  const wriInitialized = isWriInitialized();

  // Build skill breakdown from real WRI data via service
  const skillData = useMemo(() => getWriSkillBreakdown().map((d) => ({
    skill: d.skill,
    score: d.score,
  })), []);

  // Build WRI history chart data from service (cumulative, aggregated by day)
  const wriChartData = useMemo(() => getWriHistoryForChart(), []);

  const avgScore = useMemo(() => {
    if (!wriInitialized) return "0.0";
    const sum = skillData.reduce((acc, s) => acc + s.score, 0);
    return (sum / skillData.length).toFixed(1);
  }, [skillData, wriInitialized]);

  const growthPercent = wriInitialized
    ? analytics.weeklyGrowth > 0
      ? `+${analytics.weeklyGrowth} this week`
      : "+0 this week"
    : "Start to grow";

  return (
    <motion.div
      className="grid lg:grid-cols-2 gap-4"
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
    >
      {/* WRI Growth Line Chart */}
      <motion.div
        className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.06] rounded-2xl p-4 sm:p-6 hover:border-white/[0.1] transition-all overflow-x-auto"
        variants={fadeUp}
        custom={4}
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-white font-semibold">WRI Growth</h3>
            <p className="text-[#666666] text-xs">
              {wriInitialized ? "Score progression over time" : "Complete challenges to see your growth"}
            </p>
          </div>
          <div className="flex items-center gap-1.5 text-[#C6FF34] text-xs">
            <TrendingUp className="w-3.5 h-3.5" />
            {growthPercent}
          </div>
        </div>

        {wriInitialized && wriChartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={wriChartData}>
              <defs>
                <linearGradient id="wriGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#C6FF34" stopOpacity={0.2} />
                  <stop offset="100%" stopColor="#C6FF34" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis
                dataKey="label"
                tick={{ fill: "#666666", fontSize: 12 }}
                axisLine={{ stroke: "rgba(255,255,255,0.06)" }}
                tickLine={false}
              />
              <YAxis
                domain={[0, 100]}
                tick={{ fill: "#666666", fontSize: 12 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="score"
                stroke="#C6FF34"
                strokeWidth={2}
                fill="url(#wriGradient)"
                dot={{ fill: "#C6FF34", r: 3 }}
                activeDot={{ r: 5, fill: "#C6FF34" }}
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex flex-col items-center justify-center h-[240px] text-center">
            <Target className="w-10 h-10 text-[#333333] mb-3" />
            <p className="text-[#666666] text-sm mb-1">Complete your first challenge to see growth</p>
            <p className="text-[#444444] text-xs">Your WRI score will appear here as you progress</p>
            <Link
              to="/levav28"
              className="mt-4 text-[#C6FF34] text-xs hover:underline flex items-center gap-1"
            >
              Start Levav 28
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        )}
      </motion.div>

      {/* Skills Bar Chart */}
      <motion.div
        className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.06] rounded-2xl p-4 sm:p-6 hover:border-white/[0.1] transition-all overflow-x-auto"
        variants={fadeUp}
        custom={5}
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-white font-semibold">Skill Breakdown</h3>
            <p className="text-[#666666] text-xs">
              {wriInitialized ? "WRI dimension scores" : "Dimensions unlock as you complete tasks"}
            </p>
          </div>
          <div className="flex items-center gap-1.5 text-[#7E3BED] text-xs">
            <Award className="w-3.5 h-3.5" />
            {`Avg: ${avgScore}`}
          </div>
        </div>

        {wriInitialized ? (
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={skillData} layout="vertical">
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
                dataKey="skill"
                tick={{ fill: "#A0A0A0", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                width={100}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar
                dataKey="score"
                fill="#7E3BED"
                radius={[0, 6, 6, 0]}
                barSize={20}
              />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex flex-col items-center justify-center h-[240px] text-center">
            <Award className="w-10 h-10 text-[#333333] mb-3" />
            <p className="text-[#666666] text-sm mb-1">Complete Levav 28 days to unlock skills</p>
            <p className="text-[#444444] text-xs">Each day unlocks new WRI dimensions</p>
            <Link
              to="/levav28"
              className="mt-4 text-[#C6FF34] text-xs hover:underline flex items-center gap-1"
            >
              Begin Day 1
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}

/* ───────────────────── WRI Recommendations (local only) ───────────────────── */
function WriRecommendationsCard() {
  const analytics = getWriAnalytics();
  const recommendations = getWriRecommendations();
  const level = getWriLevel(analytics.overall);

  if (analytics.dimensionCount >= 6) return null; // All dimensions unlocked — no recommendations needed

  return (
    <motion.div
      className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.06] rounded-2xl p-6 hover:border-[#C6FF34]/20 transition-all"
      variants={fadeUp}
      custom={6}
      initial="hidden"
      animate="visible"
    >
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-lg bg-[#C6FF34]/10 flex items-center justify-center">
          <Lightbulb className="w-4 h-4 text-[#C6FF34]" />
        </div>
        <div>
          <h3 className="text-white font-semibold text-sm">Unlock Your WRI</h3>
          <p className="text-[#666666] text-xs">{analytics.dimensionCount}/6 dimensions unlocked</p>
        </div>
        <div
          className="ml-auto text-xs font-medium px-2 py-1 rounded-full"
          style={{ color: level.color, backgroundColor: `${level.color}15` }}
        >
          {level.title}
        </div>
      </div>

      <div className="space-y-2">
        {recommendations.slice(0, 3).map((rec, i) => (
          <div
            key={i}
            className="flex items-start gap-2 bg-white/[0.02] border border-white/[0.04] rounded-lg p-3"
          >
            <div
              className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
              style={{ backgroundColor: `${level.color}15` }}
            >
              <span className="text-[10px] font-medium" style={{ color: level.color }}>
                {i + 1}
              </span>
            </div>
            <p className="text-[#A0A0A0] text-xs leading-relaxed">{rec}</p>
          </div>
        ))}
      </div>

      {analytics.weakestDimension && (
        <div className="mt-4 pt-3 border-t border-white/[0.04]">
          <p className="text-[#666666] text-xs">
            Strongest: <span className="text-[#C6FF34]">{analytics.strongestDimension}</span> ·
            Weakest: <span className="text-[#F59E0B]">{analytics.weakestDimension}</span>
          </p>
        </div>
      )}
    </motion.div>
  );
}

/* ───────────────────── ActivityFeed (local only) ───────────────────── */
function ActivityFeed() {
  const activityItems = useMemo(() => MOCK_ACTIVITY, []);

  const statusLabel = (status: string) => {
    switch (status) {
      case "pending": return "Pending review";
      case "reviewed": return "Under review";
      case "shortlisted": return "Shortlisted";
      case "hired": return "Accepted";
      case "rejected": return "Not selected";
      default: return status;
    }
  };

  const timeAgo = (date: Date | string | null) => {
    if (!date) return "";
    const now = new Date();
    const then = new Date(date);
    const seconds = Math.floor((now.getTime() - then.getTime()) / 1000);
    if (seconds < 60) return "Just now";
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    const weeks = Math.floor(days / 7);
    return `${weeks}w ago`;
  };

  return (
    <motion.div
      className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.06] rounded-2xl p-6 hover:border-white/[0.1] transition-all"
      variants={fadeUp}
      custom={6}
      initial="hidden"
      animate="visible"
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-white font-semibold">Recent Activity</h3>
        <Link
          to="/opportunities"
          className="text-[#666666] text-xs hover:text-[#C6FF34] transition-colors"
        >
          View All
        </Link>
      </div>

      {activityItems.length > 0 ? (
        <div className="space-y-4">
          {activityItems.slice(0, 6).map((activity, i) => (
            <div key={i} className="flex items-start gap-3">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: `${activity.color}10` }}
              >
                <activity.icon className="w-4 h-4" style={{ color: activity.color }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm">{activity.title}</p>
                <div className="flex items-center gap-2">
                  <p className="text-[#666666] text-xs">{timeAgo(activity.date)}</p>
                  <span
                    className="text-[10px] px-1.5 py-0.5 rounded-full font-medium"
                    style={{
                      color: activity.color,
                      backgroundColor: `${activity.color}15`,
                    }}
                  >
                    {statusLabel(activity.status)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <Clock className="w-8 h-8 text-[#666666] mx-auto mb-2" />
          <p className="text-[#666666] text-sm">No activity yet</p>
          <p className="text-[#444444] text-xs mt-1">Apply to jobs to see activity here</p>
        </div>
      )}
    </motion.div>
  );
}

/* ───────────────────── RecommendedOpportunities (local only) ───────────────────── */
function RecommendedOpportunities() {
  const navigate = useNavigate();

  const formatType = (type: string) => {
    return type
      .split("-")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join("-");
  };

  return (
    <motion.div
      className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.06] rounded-2xl p-6 hover:border-white/[0.1] transition-all"
      variants={fadeUp}
      custom={7}
      initial="hidden"
      animate="visible"
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-white font-semibold">Recommended For You</h3>
        <Link
          to="/opportunities"
          className="text-[#666666] text-xs hover:text-[#C6FF34] transition-colors flex items-center gap-1"
        >
          View All
          <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      <div className="space-y-3">
        {MOCK_JOBS.map((job) => (
          <div
            key={job.id}
            className="bg-white/[0.02] border border-white/[0.04] rounded-xl p-4 hover:border-white/[0.08] transition-all group"
          >
            <div className="flex items-start justify-between mb-2">
              <div>
                <h4 className="text-white text-sm font-medium group-hover:text-[#C6FF34] transition-colors">
                  {job.title}
                </h4>
                <p className="text-[#666666] text-xs">
                  {job.location}
                </p>
              </div>
              <div className="flex items-center gap-1 bg-[#C6FF34]/10 rounded-lg px-2 py-1">
                <Sparkles className="w-3 h-3 text-[#C6FF34]" />
                <span className="text-[#C6FF34] text-xs font-medium">
                  {Math.floor(70 + Math.random() * 25)}%
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[#666666] text-xs bg-white/5 rounded-lg px-2 py-0.5">
                {formatType(job.type)}
              </span>
              <button
                onClick={() => navigate(`/opportunities`)}
                className="text-[#A0A0A0] text-xs hover:text-[#C6FF34] transition-colors flex items-center gap-1"
              >
                Apply
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

/* ───────────────────── Dashboard Page ───────────────────── */
export default function Dashboard() {
  const { user } = useAuth();
  const firstName = user?.firstName || user?.name?.split(" ")[0] || "there";

  return (
    <div className="bg-black min-h-screen flex flex-col md:block overflow-x-hidden">
      <Sidebar />

      {/* Main Content */}
      <div className="md:ml-[200px] min-h-screen flex-1">
        <TopBar />

        <main className="p-3 sm:p-4 md:p-6 space-y-4 md:space-y-6 min-w-0">
          {/* Welcome */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.19, 1, 0.22, 1] }}
          >
            <h1 className="text-white text-xl md:text-2xl font-semibold mb-1">
              Welcome back, {firstName}
            </h1>
            <p className="text-[#666666] text-sm">
              Here&apos;s your progress and opportunities for today.
            </p>
          </motion.div>

          {/* Stats */}
          <StatCards />

          {/* Charts */}
          <ChartsSection />

          {/* WRI Recommendations Banner (shown when dimensions are still locked) */}
          <WriRecommendationsCard />

          {/* Bottom Row */}
          <div className="grid lg:grid-cols-2 gap-4">
            <ActivityFeed />
            <SmartMatchWidget limit={3} showViewAll={true} />
          </div>
        </main>
      </div>
    </div>
  );
}
