import { useState, useMemo } from 'react';
import { Link } from 'react-router';
import { motion } from 'framer-motion';
import {
  BarChart3,
  TrendingUp,
  Globe,
  DollarSign,
  Users,
  MapPin,
  ChevronDown,
  Calculator,
  Activity,
  ArrowRight,
  Sparkles,
  Info,
} from 'lucide-react';

// ═══════════════════════════════════════════════════════════
// DATA
// ═══════════════════════════════════════════════════════════

const SALARY_DATA: Record<string, Record<string, number>> = {
  'Frontend Developer': { Zambia: 1800, Nigeria: 2500, Ghana: 2200, Kenya: 2000, 'South Africa': 3500, Rwanda: 1500 },
  'Product Designer':   { Zambia: 1500, Nigeria: 2200, Ghana: 2000, Kenya: 1800, 'South Africa': 3200, Rwanda: 1200 },
  'Data Scientist':     { Zambia: 2500, Nigeria: 3500, Ghana: 3000, Kenya: 2800, 'South Africa': 4500, Rwanda: 2000 },
  'Backend Developer':  { Zambia: 2000, Nigeria: 2800, Ghana: 2500, Kenya: 2300, 'South Africa': 3800, Rwanda: 1700 },
  'DevOps Engineer':    { Zambia: 2200, Nigeria: 3000, Ghana: 2700, Kenya: 2500, 'South Africa': 4000, Rwanda: 1800 },
  'Mobile Developer':   { Zambia: 1900, Nigeria: 2600, Ghana: 2300, Kenya: 2100, 'South Africa': 3600, Rwanda: 1600 },
};

const BENEFITS_MULTIPLIER: Record<string, number> = {
  'Junior (0-2 yrs)': 0.15,
  'Mid (3-5 yrs)': 0.20,
  'Senior (6+ yrs)': 0.25,
};

const EXPERIENCE_LEVELS = Object.keys(BENEFITS_MULTIPLIER);
const ROLES = Object.keys(SALARY_DATA);
const COUNTRIES = ['Zambia', 'Nigeria', 'Ghana', 'Kenya', 'South Africa', 'Rwanda'];

// Talent pool sizes per country (mock)
const TALENT_POOL: Record<string, number> = {
  Zambia: 1240, Nigeria: 8900, Ghana: 4200, Kenya: 5600,
  'South Africa': 7200, Rwanda: 980,
};

// ─── Demand Heatmap Data ─────────────────────────────────
interface DemandCell {
  role: string;
  region: string;
  level: 'High' | 'Medium' | 'Low';
}
const DEMAND_DATA: DemandCell[] = [
  { role: 'Frontend Developer', region: 'West Africa', level: 'High' },
  { role: 'Frontend Developer', region: 'East Africa', level: 'High' },
  { role: 'Frontend Developer', region: 'Southern Africa', level: 'Medium' },
  { role: 'Backend Developer', region: 'West Africa', level: 'High' },
  { role: 'Backend Developer', region: 'East Africa', level: 'Medium' },
  { role: 'Backend Developer', region: 'Southern Africa', level: 'High' },
  { role: 'Product Designer', region: 'West Africa', level: 'Medium' },
  { role: 'Product Designer', region: 'East Africa', level: 'Low' },
  { role: 'Product Designer', region: 'Southern Africa', level: 'Medium' },
  { role: 'Data Scientist', region: 'West Africa', level: 'Medium' },
  { role: 'Data Scientist', region: 'East Africa', level: 'Medium' },
  { role: 'Data Scientist', region: 'Southern Africa', level: 'High' },
  { role: 'DevOps Engineer', region: 'West Africa', level: 'High' },
  { role: 'DevOps Engineer', region: 'East Africa', level: 'Medium' },
  { role: 'DevOps Engineer', region: 'Southern Africa', level: 'High' },
  { role: 'Mobile Developer', region: 'West Africa', level: 'High' },
  { role: 'Mobile Developer', region: 'East Africa', level: 'High' },
  { role: 'Mobile Developer', region: 'Southern Africa', level: 'Medium' },
];

// ─── Talent saved in localStorage ────────────────────────
function getLocalTalent(): Array<{ role?: string; country?: string }> {
  try {
    const data = JSON.parse(localStorage.getItem('talent_profiles') || '[]');
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

// ═══════════════════════════════════════════════════════════
// ANIMATION VARIANTS
// ═══════════════════════════════════════════════════════════

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.08, duration: 0.6, ease: [0.19, 1, 0.22, 1] },
  }),
};

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
};

// ═══════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════

export default function MarketIntel() {
  return (
    <div className="relative min-h-screen bg-black">
      <Header />
      <SalaryComparisonSection />
      <DemandHeatmapSection />
      <CostComparisonSection />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// HEADER
// ═══════════════════════════════════════════════════════════

function Header() {
  const talent = getLocalTalent();
  const lastCountry = talent.length > 0
    ? talent[talent.length - 1]?.country || 'Ghana'
    : 'Ghana';
  const lastRole = talent.length > 0
    ? talent[talent.length - 1]?.role || 'Frontend Developer'
    : 'Frontend Developer';

  const ghanaCost = SALARY_DATA[lastRole]?.['Ghana'] || 2200;
  const nigeriaCost = SALARY_DATA[lastRole]?.['Nigeria'] || 2500;

  return (
    <section className="relative pt-32 pb-16 overflow-hidden">
      {/* Ambient glow */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full opacity-[0.06]"
        style={{ background: "radial-gradient(circle, #7E3BED 0%, transparent 70%)" }} />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full opacity-[0.04]"
        style={{ background: "radial-gradient(circle, #C6FF34 0%, transparent 70%)" }} />

      <div className="relative z-10 max-w-6xl mx-auto px-6">
        <motion.div
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#7E3BED]/10 border border-[#7E3BED]/20 mb-8"
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
        >
          <BarChart3 className="w-4 h-4 text-[#7E3BED]" />
          <span className="text-[#7E3BED] text-sm font-medium">Employer Insights</span>
        </motion.div>

        <motion.h1
          className="font-display text-5xl sm:text-6xl lg:text-7xl text-white leading-[1.05] mb-6"
          initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
        >
          Market{" "}
          <span className="bg-gradient-to-r from-[#C6FF34] to-[#7E3BED] bg-clip-text text-transparent">
            Intelligence
          </span>
        </motion.h1>

        <motion.p
          className="text-white/60 text-lg sm:text-xl max-w-2xl mb-4 leading-relaxed"
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.25 }}
        >
          Data-driven hiring insights across Africa. Make informed decisions with real-time
          salary benchmarks, demand trends, and talent availability.
        </motion.p>

        <motion.div
          className="flex items-center gap-3 px-5 py-3 bg-white/[0.03] border border-white/[0.08] rounded-xl max-w-fit"
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <Sparkles className="w-5 h-5 text-[#C6FF34] shrink-0" />
          <p className="text-white/70 text-sm">
            Talent like this costs{" "}
            <span className="text-[#C6FF34] font-semibold">${ghanaCost.toLocaleString()}</span> in {lastCountry === 'Ghana' ? 'Ghana' : lastCountry},{" "}
            <span className="text-[#C6FF34] font-semibold">${nigeriaCost.toLocaleString()}</span> in Nigeria
          </p>
        </motion.div>
      </div>
    </section>
  );
}

// ═══════════════════════════════════════════════════════════
// SECTION 1: SALARY COMPARISON BY COUNTRY
// ═══════════════════════════════════════════════════════════

function SalaryComparisonSection() {
  const [selectedRole, setSelectedRole] = useState('Frontend Developer');

  const data = SALARY_DATA[selectedRole];
  const maxSalary = Math.max(...Object.values(data));

  const barColors: Record<string, string> = {
    Zambia: '#C6FF34',
    Nigeria: '#7E3BED',
    Ghana: '#C6FF34',
    Kenya: '#7E3BED',
    'South Africa': '#C6FF34',
    Rwanda: '#7E3BED',
  };

  return (
    <section className="py-20 bg-[#0A0A0A] border-y border-white/[0.04]">
      <div className="max-w-6xl mx-auto px-6">
        <motion.div
          className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-12"
          initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
        >
          <div>
            <span className="text-[#C6FF34] text-xs font-medium tracking-widest uppercase">Benchmarks</span>
            <h2 className="font-display text-3xl sm:text-4xl text-white mt-2">
              Salary Comparison by Country
            </h2>
            <p className="text-white/50 text-sm mt-2 max-w-lg">
              Average monthly salaries in USD equivalent. Select a role to compare across African markets.
            </p>
          </div>

          {/* Role Selector */}
          <div className="relative">
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="appearance-none bg-white/[0.05] border border-white/[0.12] rounded-xl px-4 py-3 pr-10 text-white text-sm focus:outline-none focus:border-[#C6FF34] focus:ring-2 focus:ring-[#C6FF34]/20 cursor-pointer min-w-[200px]"
            >
              {ROLES.map((role) => (
                <option key={role} value={role} className="bg-[#0A0A0A]">{role}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 pointer-events-none" />
          </div>
        </motion.div>

        {/* Bar Chart */}
        <motion.div
          className="glass rounded-2xl p-6 sm:p-8"
          initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          transition={{ delay: 0.1 }}
        >
          <div className="space-y-5">
            {COUNTRIES.map((country, i) => {
              const salary = data[country] || 0;
              const width = maxSalary > 0 ? (salary / maxSalary) * 100 : 0;
              const talentCount = TALENT_POOL[country] || 0;

              return (
                <motion.div
                  key={country}
                  className="group"
                  custom={i}
                  variants={fadeUp}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                >
                  <div className="flex items-center gap-4">
                    {/* Country label */}
                    <div className="w-28 sm:w-36 shrink-0 flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-white/30 shrink-0" />
                      <span className="text-white/80 text-sm font-medium truncate">{country}</span>
                    </div>

                    {/* Bar */}
                    <div className="flex-1 h-10 bg-white/[0.03] rounded-lg overflow-hidden relative">
                      <motion.div
                        className="h-full rounded-lg flex items-center px-3 relative"
                        style={{ backgroundColor: barColors[country] }}
                        initial={{ width: 0 }}
                        whileInView={{ width: `${width}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8, delay: i * 0.06, ease: [0.19, 1, 0.22, 1] }}
                      >
                        <span className="text-black text-sm font-bold whitespace-nowrap">
                          ${salary.toLocaleString()}/mo
                        </span>
                      </motion.div>
                    </div>

                    {/* Talent pool */}
                    <div className="w-20 sm:w-24 shrink-0 text-right">
                      <span className="text-white/40 text-xs">{talentCount.toLocaleString()} talents</span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Legend */}
          <div className="flex flex-wrap items-center gap-6 mt-8 pt-6 border-t border-white/[0.06]">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-sm bg-[#C6FF34]" />
              <span className="text-white/40 text-xs">Above average market</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-sm bg-[#7E3BED]" />
              <span className="text-white/40 text-xs">Competitive market</span>
            </div>
            <div className="flex items-center gap-2 ml-auto">
              <Users className="w-3.5 h-3.5 text-white/30" />
              <span className="text-white/40 text-xs">Talent pool size shown</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// ═══════════════════════════════════════════════════════════
// SECTION 2: TALENT DEMAND HEATMAP
// ═══════════════════════════════════════════════════════════

function DemandHeatmapSection() {
  const roles = [...new Set(DEMAND_DATA.map((d) => d.role))];
  const regions = [...new Set(DEMAND_DATA.map((d) => d.region))];

  const getLevel = (role: string, region: string): 'High' | 'Medium' | 'Low' => {
    const cell = DEMAND_DATA.find((d) => d.role === role && d.region === region);
    return cell?.level || 'Low';
  };

  const levelStyle = (level: 'High' | 'Medium' | 'Low') => {
    switch (level) {
      case 'High':
        return 'bg-[#C6FF34]/20 text-[#C6FF34] border-[#C6FF34]/30';
      case 'Medium':
        return 'bg-yellow-500/15 text-yellow-400 border-yellow-500/25';
      case 'Low':
        return 'bg-white/[0.04] text-white/40 border-white/[0.08]';
    }
  };

  const levelIcon = (level: 'High' | 'Medium' | 'Low') => {
    switch (level) {
      case 'High':
        return <TrendingUp className="w-3.5 h-3.5" />;
      case 'Medium':
        return <Activity className="w-3.5 h-3.5" />;
      case 'Low':
        return <Info className="w-3.5 h-3.5" />;
    }
  };

  return (
    <section className="py-20 bg-black">
      <div className="max-w-6xl mx-auto px-6">
        <motion.div
          className="mb-12"
          initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
        >
          <span className="text-[#7E3BED] text-xs font-medium tracking-widest uppercase">Trends</span>
          <h2 className="font-display text-3xl sm:text-4xl text-white mt-2">
            Talent Demand Heatmap
          </h2>
          <p className="text-white/50 text-sm mt-2 max-w-lg">
            Demand intensity for each role across Africa&apos;s major regions. Updated monthly based on job postings.
          </p>
        </motion.div>

        <motion.div
          className="glass rounded-2xl p-6 sm:p-8 overflow-x-auto"
          initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          transition={{ delay: 0.1 }}
        >
          <table className="w-full min-w-[500px]">
            <thead>
              <tr>
                <th className="text-left text-white/40 text-xs font-medium pb-4 pr-4 w-40">Role</th>
                {regions.map((region) => (
                  <th key={region} className="text-center text-white/40 text-xs font-medium pb-4 px-3">
                    <div className="flex items-center justify-center gap-1.5">
                      <Globe className="w-3 h-3" />
                      {region}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {roles.map((role, i) => (
                <motion.tr
                  key={role}
                  custom={i}
                  variants={fadeUp}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  className="border-t border-white/[0.04]"
                >
                  <td className="py-3.5 pr-4">
                    <span className="text-white/80 text-sm font-medium">{role}</span>
                  </td>
                  {regions.map((region) => {
                    const level = getLevel(role, region);
                    return (
                      <td key={region} className="py-3.5 px-3">
                        <div
                          className={`inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold ${levelStyle(level)}`}
                        >
                          {levelIcon(level)}
                          {level}
                        </div>
                      </td>
                    );
                  })}
                </motion.tr>
              ))}
            </tbody>
          </table>

          {/* Legend */}
          <div className="flex flex-wrap items-center gap-5 mt-6 pt-5 border-t border-white/[0.06]">
            <span className="text-white/30 text-xs">Demand level:</span>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-sm bg-[#C6FF34]/40" />
              <span className="text-white/50 text-xs">High</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-sm bg-yellow-500/30" />
              <span className="text-white/50 text-xs">Medium</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-sm bg-white/[0.06]" />
              <span className="text-white/50 text-xs">Low</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// ═══════════════════════════════════════════════════════════
// SECTION 3: COST COMPARISON TOOL
// ═══════════════════════════════════════════════════════════

function CostComparisonSection() {
  const [role, setRole] = useState('Frontend Developer');
  const [experience, setExperience] = useState('Mid (3-5 yrs)');
  const [country, setCountry] = useState('Ghana');

  const result = useMemo(() => {
    const baseSalary = SALARY_DATA[role]?.[country] || 0;
    const multiplier = BENEFITS_MULTIPLIER[experience] || 0.2;
    const benefitsCost = Math.round(baseSalary * multiplier);
    const totalCost = baseSalary + benefitsCost;

    // Comparison with other countries
    const comparisons = COUNTRIES.filter((c) => c !== country)
      .map((c) => {
        const otherBase = SALARY_DATA[role]?.[c] || 0;
        const otherBenefits = Math.round(otherBase * multiplier);
        const otherTotal = otherBase + otherBenefits;
        const diff = totalCost - otherTotal;
        const percent = otherTotal > 0 ? Math.round((diff / otherTotal) * 100) : 0;
        return { country: c, total: otherTotal, diff, percent };
      })
      .sort((a, b) => a.total - b.total);

    return { baseSalary, benefitsCost, totalCost, comparisons };
  }, [role, experience, country]);

  return (
    <section className="py-20 bg-[#0A0A0A] border-y border-white/[0.04]">
      <div className="max-w-6xl mx-auto px-6">
        <motion.div
          className="mb-12"
          initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
        >
          <span className="text-[#C6FF34] text-xs font-medium tracking-widest uppercase">Calculator</span>
          <h2 className="font-display text-3xl sm:text-4xl text-white mt-2">
            Cost Comparison Tool
          </h2>
          <p className="text-white/50 text-sm mt-2 max-w-lg">
            Estimate total hiring costs including benefits. Compare across countries and experience levels.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-5 gap-6">
          {/* Inputs */}
          <motion.div
            className="lg:col-span-2 glass rounded-2xl p-6 space-y-5"
            initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-[#C6FF34]/10 flex items-center justify-center">
                <Calculator className="w-5 h-5 text-[#C6FF34]" />
              </div>
              <h3 className="text-white font-semibold text-sm">Configure Hire</h3>
            </div>

            {/* Role */}
            <div>
              <label className="block text-white/50 text-xs font-medium mb-2">Role</label>
              <div className="relative">
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full appearance-none bg-white/[0.05] border border-white/[0.12] rounded-xl px-4 py-3 pr-10 text-white text-sm focus:outline-none focus:border-[#C6FF34] cursor-pointer"
                >
                  {ROLES.map((r) => (
                    <option key={r} value={r} className="bg-[#0A0A0A]">{r}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 pointer-events-none" />
              </div>
            </div>

            {/* Experience */}
            <div>
              <label className="block text-white/50 text-xs font-medium mb-2">Experience Level</label>
              <div className="relative">
                <select
                  value={experience}
                  onChange={(e) => setExperience(e.target.value)}
                  className="w-full appearance-none bg-white/[0.05] border border-white/[0.12] rounded-xl px-4 py-3 pr-10 text-white text-sm focus:outline-none focus:border-[#C6FF34] cursor-pointer"
                >
                  {EXPERIENCE_LEVELS.map((e) => (
                    <option key={e} value={e} className="bg-[#0A0A0A]">{e}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 pointer-events-none" />
              </div>
            </div>

            {/* Country */}
            <div>
              <label className="block text-white/50 text-xs font-medium mb-2">Country</label>
              <div className="relative">
                <select
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="w-full appearance-none bg-white/[0.05] border border-white/[0.12] rounded-xl px-4 py-3 pr-10 text-white text-sm focus:outline-none focus:border-[#C6FF34] cursor-pointer"
                >
                  {COUNTRIES.map((c) => (
                    <option key={c} value={c} className="bg-[#0A0A0A]">{c}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 pointer-events-none" />
              </div>
            </div>

            {/* CTA */}
            <Link
              to="/talent"
              className="btn-lime w-full inline-flex items-center justify-center gap-2 py-3.5 mt-2"
            >
              Hire in {country} <ArrowRight size={16} />
            </Link>
          </motion.div>

          {/* Results */}
          <motion.div
            className="lg:col-span-3 space-y-5"
            initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
          >
            {/* Summary Cards */}
            <div className="grid grid-cols-3 gap-4">
              <div className="glass rounded-xl p-4 text-center">
                <DollarSign className="w-5 h-5 text-[#C6FF34] mx-auto mb-2" />
                <p className="text-white/40 text-xs mb-1">Base Salary</p>
                <p className="text-white text-lg font-bold">${result.baseSalary.toLocaleString()}</p>
                <p className="text-white/30 text-[10px]">/month</p>
              </div>
              <div className="glass rounded-xl p-4 text-center">
                <Users className="w-5 h-5 text-[#7E3BED] mx-auto mb-2" />
                <p className="text-white/40 text-xs mb-1">Benefits</p>
                <p className="text-white text-lg font-bold">${result.benefitsCost.toLocaleString()}</p>
                <p className="text-white/30 text-[10px]">({Math.round((BENEFITS_MULTIPLIER[experience] || 0.2) * 100)}%)</p>
              </div>
              <div className="glass rounded-xl p-4 text-center border-[#C6FF34]/30">
                <DollarSign className="w-5 h-5 text-[#C6FF34] mx-auto mb-2" />
                <p className="text-white/40 text-xs mb-1">Total Cost</p>
                <p className="text-[#C6FF34] text-lg font-bold">${result.totalCost.toLocaleString()}</p>
                <p className="text-white/30 text-[10px]">/month</p>
              </div>
            </div>

            {/* Comparison Table */}
            <div className="glass rounded-2xl p-6">
              <h3 className="text-white font-semibold text-sm mb-4 flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-[#7E3BED]" />
                Compared to Other Countries
              </h3>
              <div className="space-y-3">
                {result.comparisons.map((comp, i) => {
                  const isCheaper = comp.diff < 0;
                  const widthPercent = result.totalCost > 0
                    ? (comp.total / (result.totalCost * 1.3)) * 100
                    : 0;

                  return (
                    <motion.div
                      key={comp.country}
                      custom={i}
                      variants={fadeUp}
                      initial="hidden"
                      whileInView="visible"
                      viewport={{ once: true }}
                      className="flex items-center gap-3"
                    >
                      <span className="text-white/60 text-xs w-28 sm:w-32 shrink-0 truncate">{comp.country}</span>
                      <div className="flex-1 h-7 bg-white/[0.03] rounded-md overflow-hidden">
                        <motion.div
                          className={`h-full rounded-md flex items-center px-2 ${isCheaper ? 'bg-[#7E3BED]/30' : 'bg-[#C6FF34]/20'}`}
                          initial={{ width: 0 }}
                          whileInView={{ width: `${Math.max(widthPercent, 15)}%` }}
                          viewport={{ once: true }}
                          transition={{ duration: 0.6, delay: i * 0.05, ease: [0.19, 1, 0.22, 1] }}
                        >
                          <span className="text-white text-xs font-semibold whitespace-nowrap">
                            ${comp.total.toLocaleString()}
                          </span>
                        </motion.div>
                      </div>
                      <span
                        className={`text-xs font-medium w-16 text-right shrink-0 ${isCheaper ? 'text-[#7E3BED]' : 'text-[#C6FF34]'}`}
                      >
                        {isCheaper ? `${comp.percent}% cheaper` : `${comp.percent}% more`}
                      </span>
                    </motion.div>
                  );
                })}
              </div>

              {/* Annual estimate */}
              <div className="mt-5 pt-4 border-t border-white/[0.06] flex items-center justify-between">
                <span className="text-white/40 text-xs">Annual estimate</span>
                <span className="text-white text-sm font-bold">${(result.totalCost * 12).toLocaleString()}/year</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
