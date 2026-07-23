import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Clock,
  Wallet,
  Users,
  CheckCircle2,
  TrendingUp,
  TrendingDown,
  Briefcase,
  BarChart3,
  Award,
  ArrowLeft,
  Download,
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

/* ───────────────────── Mock Data ───────────────────── */
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];

const APPLICATIONS_OVER_TIME = [32, 48, 28, 56, 42, 64];

const TOP_JOB_TYPES = [
  { label: 'Frontend Developer', value: 42, color: '#C6FF34' },
  { label: 'UI/UX Designer', value: 36, color: '#7E3BED' },
  { label: 'Data Analyst', value: 28, color: '#3B82F6' },
  { label: 'Mobile Developer', value: 22, color: '#F59E0B' },
];

const APPLICANT_QUALITY = [
  { label: 'Excellent', value: 18, color: '#C6FF34' },
  { label: 'Good', value: 35, color: '#7E3BED' },
  { label: 'Average', value: 32, color: '#3B82F6' },
  { label: 'Poor', value: 15, color: '#ef4444' },
];

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
  maxValue,
}: {
  data: number[];
  labels: string[];
  title: string;
  icon: React.ElementType;
  color?: string;
  maxValue?: number;
}) {
  const max = maxValue || Math.max(...data);

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
              {/* Tooltip on hover */}
              <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-[#1a1a1a] border border-white/10 text-white text-xs px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                {val} applications
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* X-axis labels */}
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
}: {
  data: { label: string; value: number; color: string }[];
  title: string;
  icon: React.ElementType;
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
        <Icon className="w-5 h-5 text-[#7E3BED]" />
        <h3 className="text-white text-lg font-semibold">{title}</h3>
      </div>

      <div className="space-y-4">
        {data.map((item, i) => (
          <div key={i}>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-white text-sm">{item.label}</span>
              <span className="text-[#666666] text-xs">{item.value} apps</span>
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

/* ───────────────────── Distribution Bar Chart ───────────────────── */
function DistributionChart({
  data,
  title,
  icon: Icon,
}: {
  data: { label: string; value: number; color: string }[];
  title: string;
  icon: React.ElementType;
}) {
  const total = data.reduce((sum, d) => sum + d.value, 0);

  return (
    <motion.div
      className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.06] rounded-2xl p-6 hover:border-white/[0.1] transition-all"
      variants={fadeUp}
      custom={6}
      initial="hidden"
      animate="visible"
    >
      <div className="flex items-center gap-2 mb-6">
        <Icon className="w-5 h-5 text-[#3B82F6]" />
        <h3 className="text-white text-lg font-semibold">{title}</h3>
      </div>

      <div className="flex items-end gap-2 h-40 mb-4">
        {data.map((item, i) => (
          <div
            key={i}
            className="flex-1 bg-white/[0.03] rounded-t-lg relative group h-full overflow-hidden"
          >
            <motion.div
              className="absolute bottom-0 left-0 right-0 rounded-t-lg transition-all"
              style={{ backgroundColor: item.color, opacity: 0.85 }}
              initial={{ height: 0 }}
              animate={{ height: `${(item.value / Math.max(...data.map((d) => d.value))) * 100}%` }}
              transition={{ delay: i * 0.1 + 0.3, duration: 0.6, ease: [0.19, 1, 0.22, 1] }}
            />
            <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-[#1a1a1a] border border-white/10 text-white text-xs px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
              {item.value} ({Math.round((item.value / total) * 100)}%)
            </div>
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3">
        {data.map((item, i) => (
          <div key={i} className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
            <span className="text-[#666666] text-xs">{item.label}</span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

/* ───────────────────── Employer Analytics Page ───────────────────── */
export default function EmployerAnalytics() {
  const [kpiData, setKpiData] = useState({
    timeToHire: '14 days',
    costPerHire: 'ZMW 2,500',
    applicantsPerJob: '24',
    acceptanceRate: '68%',
  });

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('employer_analytics');
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
    localStorage.setItem('employer_analytics', JSON.stringify(kpiData));
  }, [kpiData]);

  const kpiCards = [
    {
      title: 'Time to Hire',
      value: kpiData.timeToHire,
      subtitle: 'Avg from posting to acceptance',
      icon: Clock,
      color: '#C6FF34',
      trend: 'down' as const,
      trendLabel: '-2 days',
    },
    {
      title: 'Cost per Hire',
      value: kpiData.costPerHire,
      subtitle: 'Average recruitment cost',
      icon: Wallet,
      color: '#7E3BED',
      trend: 'down' as const,
      trendLabel: '-12%',
    },
    {
      title: 'Applicants per Job',
      value: kpiData.applicantsPerJob,
      subtitle: 'Average per posting',
      icon: Users,
      color: '#3B82F6',
      trend: 'up' as const,
      trendLabel: '+18%',
    },
    {
      title: 'Acceptance Rate',
      value: kpiData.acceptanceRate,
      subtitle: 'Offer acceptance ratio',
      icon: CheckCircle2,
      color: '#C6FF34',
      trend: 'up' as const,
      trendLabel: '+5%',
    },
  ];

  const handleExport = () => {
    const report = {
      generatedAt: new Date().toISOString(),
      kpis: kpiData,
      applicationsOverTime: APPLICATIONS_OVER_TIME,
      topJobTypes: TOP_JOB_TYPES,
      applicantQuality: APPLICANT_QUALITY,
    };
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'employer-analytics-report.json';
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
            <h1 className="text-white text-sm font-semibold">Hiring Analytics</h1>
            <p className="text-[#666666] text-xs">Track your recruitment performance</p>
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
          <h1 className="text-white text-2xl font-semibold mb-1">Recruitment Overview</h1>
          <p className="text-[#666666] text-sm">
            Monitor your hiring pipeline, costs, and candidate quality.
          </p>
        </motion.div>

        {/* KPI Cards */}
        <motion.div
          className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4"
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
            data={APPLICATIONS_OVER_TIME}
            labels={MONTHS}
            title="Applications Over Time"
            icon={BarChart3}
            color="#C6FF34"
          />
          <HorizontalBarChart
            data={TOP_JOB_TYPES}
            title="Top Performing Job Types"
            icon={Briefcase}
          />
        </div>

        {/* Charts Row 2 */}
        <div className="grid lg:grid-cols-2 gap-6">
          <DistributionChart
            data={APPLICANT_QUALITY}
            title="Applicant Quality Distribution"
            icon={Award}
          />
          {/* Summary Card */}
          <motion.div
            className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.06] rounded-2xl p-6 hover:border-white/[0.1] transition-all"
            variants={fadeUp}
            custom={7}
            initial="hidden"
            animate="visible"
          >
            <div className="flex items-center gap-2 mb-6">
              <TrendingUp className="w-5 h-5 text-[#C6FF34]" />
              <h3 className="text-white text-lg font-semibold">Hiring Insights</h3>
            </div>
            <div className="space-y-4">
              {[
                { label: 'Most active hiring month', value: 'June', sub: '64 applications received' },
                { label: 'Most popular role', value: 'Frontend Developer', sub: '42 applications' },
                { label: 'Best quality applicants', value: 'Good', sub: '35% of all applicants' },
                { label: 'Average interview conversion', value: '32%', sub: 'Of applicants reach interview' },
              ].map((insight, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-3 bg-white/[0.02] border border-white/[0.04] rounded-xl"
                >
                  <div>
                    <p className="text-[#666666] text-xs">{insight.label}</p>
                    <p className="text-white text-sm font-medium">{insight.value}</p>
                  </div>
                  <p className="text-[#666666] text-xs">{insight.sub}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
