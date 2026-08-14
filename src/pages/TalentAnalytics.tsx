import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Eye,
  Target,
  MessageCircle,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Award,
  Zap,
  ArrowLeft,
  Download,
  Briefcase,
  XCircle,
  Clock,
} from 'lucide-react';
import { Link } from 'react-router';

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
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];

const PROFILE_VIEWS = [68, 92, 78, 120, 135, 156];

const SKILL_DEMAND = [
  { label: 'React / TypeScript', value: 85, color: '#C6FF34' },
  { label: 'UI/UX Design', value: 72, color: '#7E3BED' },
  { label: 'Node.js', value: 64, color: '#3B82F6' },
  { label: 'Python / Data', value: 58, color: '#F59E0B' },
  { label: 'Mobile (React Native)', value: 45, color: '#10B981' },
];

const APPLICATION_OUTCOMES = [
  { label: 'Hired', value: 8, color: '#C6FF34' },
  { label: 'Interview', value: 14, color: '#7E3BED' },
  { label: 'Pending', value: 10, color: '#3B82F6' },
  { label: 'Rejected', value: 6, color: '#ef4444' },
];

/* ───────────────────── Types ───────────────────── */
interface KPICardProps {
  title: string;
  value: string;
  subtitle: string;
  icon: React.ElementType;
  color: string;
  trend?: 'up' | 'down' | 'neutral';
  trendLabel?: string;
  index: number;
}

/* ───────────────────── KPI Card ───────────────────── */
function KPICard({
  title,
  value,
  subtitle,
  icon: Icon,
  color,
  trend = 'neutral',
  trendLabel,
  index,
}: KPICardProps) {
  return (
    <motion.div
      className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.06] rounded-2xl p-6 hover:border-white/[0.1] transition-all"
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
        {trend !== 'neutral' && trendLabel && (
          <div
            className={`flex items-center gap-1 text-xs font-medium ${
              trend === 'up' ? 'text-[#C6FF34]' : 'text-[#ef4444]'
            }`}
          >
            {trend === 'up' ? (
              <TrendingUp className="w-3 h-3" />
            ) : (
              <TrendingDown className="w-3 h-3" />
            )}
            {trendLabel}
          </div>
        )}
      </div>
      <p className="text-[#666666] text-xs uppercase tracking-wider mb-1">{title}</p>
      <p className="text-white text-3xl font-semibold mb-1">{value}</p>
      <p className="text-[#666666] text-xs">{subtitle}</p>
    </motion.div>
  );
}

/* ───────────────────── Vertical Bar Chart ───────────────────── */
function VerticalBarChart({
  data,
  labels,
  title,
  icon: Icon,
  color = '#C6FF34',
}: {
  data: number[];
  labels: string[];
  title: string;
  icon: React.ElementType;
  color?: string;
}) {
  const max = Math.max(...data);

  return (
    <motion.div
      className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.06] rounded-2xl p-6 hover:border-white/[0.1] transition-all"
      variants={fadeUp}
      custom={4}
      initial="hidden"
      animate="visible"
    >
      <div className="flex items-center gap-2 mb-6">
        <Icon className="w-5 h-5" style={{ color }} />
        <h3 className="text-white text-lg font-semibold">{title}</h3>
      </div>

      <div className="flex items-end gap-3 h-48 mb-4">
        {data.map((val, i) => (
          <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
            <div className="w-full bg-white/[0.03] rounded-t-lg relative h-40 overflow-hidden">
              <motion.div
                className="absolute bottom-0 left-0 right-0 rounded-t-lg transition-all"
                style={{ backgroundColor: color }}
                initial={{ height: 0 }}
                animate={{ height: `${(val / max) * 100}%` }}
                transition={{ delay: i * 0.1 + 0.3, duration: 0.6, ease: [0.19, 1, 0.22, 1] }}
              />
              <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-[#1a1a1a] border border-white/10 text-white text-xs px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                {val} views
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex gap-3">
        {labels.map((label, i) => (
          <div key={i} className="flex-1 text-center">
            <span className="text-[#666666] text-xs">{label}</span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

/* ───────────────────── Horizontal Bar Chart ───────────────────── */
function HorizontalBarChart({
  data,
  title,
  icon: Icon,
  color = '#7E3BED',
}: {
  data: { label: string; value: number; color: string }[];
  title: string;
  icon: React.ElementType;
  color?: string;
}) {
  const max = Math.max(...data.map((d) => d.value));

  return (
    <motion.div
      className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.06] rounded-2xl p-6 hover:border-white/[0.1] transition-all"
      variants={fadeUp}
      custom={5}
      initial="hidden"
      animate="visible"
    >
      <div className="flex items-center gap-2 mb-6">
        <Icon className="w-5 h-5" style={{ color }} />
        <h3 className="text-white text-lg font-semibold">{title}</h3>
      </div>

      <div className="space-y-4">
        {data.map((item, i) => (
          <div key={i}>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-white text-sm">{item.label}</span>
              <span className="text-[#666666] text-xs">{item.value}%</span>
            </div>
            <div className="w-full bg-white/[0.04] rounded-full h-2.5 overflow-hidden">
              <motion.div
                className="h-full rounded-full"
                style={{ backgroundColor: item.color }}
                initial={{ width: 0 }}
                animate={{ width: `${(item.value / max) * 100}%` }}
                transition={{ delay: i * 0.1 + 0.3, duration: 0.6, ease: [0.19, 1, 0.22, 1] }}
              />
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

/* ───────────────────── Pie Chart Simulation ───────────────────── */
function PieChartSimulation({
  data,
  title,
  icon: Icon,
}: {
  data: { label: string; value: number; color: string }[];
  title: string;
  icon: React.ElementType;
}) {
  const total = data.reduce((sum, d) => sum + d.value, 0);
  let cumulativePercent = 0;

  const segments = data.map((item) => {
    const percent = (item.value / total) * 100;
    const startPercent = cumulativePercent;
    cumulativePercent += percent;
    return { ...item, percent, startPercent };
  });

  return (
    <motion.div
      className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.06] rounded-2xl p-6 hover:border-white/[0.1] transition-all"
      variants={fadeUp}
      custom={6}
      initial="hidden"
      animate="visible"
    >
      <div className="flex items-center gap-2 mb-6">
        <Icon className="w-5 h-5 text-[#C6FF34]" />
        <h3 className="text-white text-lg font-semibold">{title}</h3>
      </div>

      <div className="flex items-center gap-8">
        {/* SVG Pie Chart */}
        <div className="relative w-40 h-40 flex-shrink-0">
          <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
            {segments.map((segment, i) => {
              const startAngle = (segment.startPercent / 100) * 360;
              const endAngle = ((segment.startPercent + segment.percent) / 100) * 360;
              const largeArcFlag = segment.percent > 50 ? 1 : 0;

              const startRad = (startAngle * Math.PI) / 180;
              const endRad = (endAngle * Math.PI) / 180;

              const x1 = 50 + 40 * Math.cos(startRad);
              const y1 = 50 + 40 * Math.sin(startRad);
              const x2 = 50 + 40 * Math.cos(endRad);
              const y2 = 50 + 40 * Math.sin(endRad);

              const pathData = [
                `M 50 50`,
                `L ${x1} ${y1}`,
                `A 40 40 0 ${largeArcFlag} 1 ${x2} ${y2}`,
                'Z',
              ].join(' ');

              return (
                <motion.path
                  key={i}
                  d={pathData}
                  fill={segment.color}
                  stroke="rgba(0,0,0,0.5)"
                  strokeWidth="1"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.15 + 0.3, duration: 0.4 }}
                  className="hover:opacity-80 transition-opacity cursor-pointer"
                />
              );
            })}
            {/* Center circle for donut effect */}
            <circle cx="50" cy="50" r="22" fill="rgba(0,0,0,0.8)" />
          </svg>
          {/* Center text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-white text-lg font-semibold">{total}</span>
            <span className="text-[#666666] text-[10px]">Total</span>
          </div>
        </div>

        {/* Legend */}
        <div className="flex-1 space-y-3">
          {segments.map((segment, i) => (
            <div key={i} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: segment.color }} />
                <span className="text-white text-sm">{segment.label}</span>
              </div>
              <div className="text-right">
                <span className="text-white text-sm font-medium">{segment.value}</span>
                <span className="text-[#666666] text-xs ml-1.5">
                  {Math.round(segment.percent)}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

/* ───────────────────── Talent Analytics Page ───────────────────── */
export default function TalentAnalytics() {
  const [kpiData, setKpiData] = useState({
    profileViews: '156 this month',
    applicationSuccessRate: '62%',
    responseRate: '84%',
  });

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('talent_analytics');
      if (stored) {
        const parsed = JSON.parse(stored);
        setKpiData((prev) => ({ ...prev, ...parsed }));
      }
    } catch {
      // ignore
    }
  }, []);

  // Save to localStorage when data changes
  useEffect(() => {
    localStorage.setItem('talent_analytics', JSON.stringify(kpiData));
  }, [kpiData]);

  const kpiCards = [
    {
      title: 'Profile Views',
      value: kpiData.profileViews,
      subtitle: 'Talent profile impressions',
      icon: Eye,
      color: '#C6FF34',
      trend: 'up' as const,
      trendLabel: '+24%',
    },
    {
      title: 'Application Success Rate',
      value: kpiData.applicationSuccessRate,
      subtitle: 'Offers vs applications sent',
      icon: Target,
      color: '#7E3BED',
      trend: 'up' as const,
      trendLabel: '+8%',
    },
    {
      title: 'Response Rate',
      value: kpiData.responseRate,
      subtitle: 'Employers who responded',
      icon: MessageCircle,
      color: '#3B82F6',
      trend: 'up' as const,
      trendLabel: '+5%',
    },
  ];

  const handleExport = () => {
    const report = {
      generatedAt: new Date().toISOString(),
      kpis: kpiData,
      profileViews: PROFILE_VIEWS,
      skillDemand: SKILL_DEMAND,
      applicationOutcomes: APPLICATION_OUTCOMES,
    };
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'talent-analytics-report.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <header className="h-16 bg-black/50 backdrop-blur-xl border-b border-white/[0.06] flex items-center justify-between px-6 sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <Link
            to="/dashboard"
            className="w-9 h-9 rounded-xl bg-white/[0.05] border border-white/[0.1] flex items-center justify-center hover:bg-white/[0.1] transition-all"
          >
            <ArrowLeft className="w-4 h-4 text-[#A0A0A0]" />
          </Link>
          <div>
            <h1 className="text-white text-sm font-semibold">Profile Analytics</h1>
            <p className="text-[#666666] text-xs">Track your career performance</p>
          </div>
        </div>
        <button
          onClick={handleExport}
          className="flex items-center gap-2 bg-[#C6FF34] text-black px-4 py-2 rounded-xl text-sm font-medium hover:bg-[#d4ff5c] transition-all active:scale-95"
        >
          <Download className="w-4 h-4" />
          Export Report
        </button>
      </header>

      {/* Main Content */}
      <main className="p-6 space-y-6 max-w-7xl mx-auto">
        {/* Welcome */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.19, 1, 0.22, 1] }}
        >
          <h1 className="text-white text-2xl font-semibold mb-1">Performance Overview</h1>
          <p className="text-[#666666] text-sm">
            Monitor your profile engagement and application outcomes.
          </p>
        </motion.div>

        {/* KPI Cards */}
        <motion.div
          className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4"
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
        >
          {kpiCards.map((card, i) => (
            <KPICard key={card.title} {...card} index={i} />
          ))}
        </motion.div>

        {/* Charts Row 1 */}
        <div className="grid lg:grid-cols-2 gap-6">
          <VerticalBarChart
            data={PROFILE_VIEWS}
            labels={MONTHS}
            title="Profile Views Over Time"
            icon={BarChart3}
            color="#7E3BED"
          />
          <HorizontalBarChart
            data={SKILL_DEMAND}
            title="Skill Demand"
            icon={Award}
            color="#C6FF34"
          />
        </div>

        {/* Charts Row 2 */}
        <div className="grid lg:grid-cols-2 gap-6">
          <PieChartSimulation
            data={APPLICATION_OUTCOMES}
            title="Application Outcomes"
            icon={Briefcase}
          />
          {/* Activity Summary */}
          <motion.div
            className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.06] rounded-2xl p-6 hover:border-white/[0.1] transition-all"
            variants={fadeUp}
            custom={7}
            initial="hidden"
            animate="visible"
          >
            <div className="flex items-center gap-2 mb-6">
              <TrendingUp className="w-5 h-5 text-[#C6FF34]" />
              <h3 className="text-white text-lg font-semibold">Career Insights</h3>
            </div>
            <div className="space-y-4">
              {[
                {
                  label: 'Peak profile views',
                  value: 'June',
                  sub: '156 views this month',
                  icon: Eye,
                  iconColor: '#C6FF34',
                },
                {
                  label: 'Most in-demand skill',
                  value: 'React / TypeScript',
                  sub: '85% demand match',
                  icon: Award,
                  iconColor: '#7E3BED',
                },
                {
                  label: 'Application success',
                  value: '8 Hired',
                  sub: 'Out of 38 applications',
                  icon: Briefcase,
                  iconColor: '#C6FF34',
                },
                {
                  label: 'Best performing sector',
                  value: 'Technology',
                  sub: '72% of your applications',
                  icon: Zap,
                  iconColor: '#F59E0B',
                },
              ].map((insight, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 p-3 bg-white/[0.02] border border-white/[0.04] rounded-xl"
                >
                  <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: `${insight.iconColor}15` }}
                  >
                    <insight.icon className="w-4 h-4" style={{ color: insight.iconColor }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[#666666] text-xs">{insight.label}</p>
                    <p className="text-white text-sm font-medium">{insight.value}</p>
                  </div>
                  <p className="text-[#666666] text-xs flex-shrink-0">{insight.sub}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
