import React from 'react';
import { motion } from 'framer-motion';
import { Users, BarChart3, Target, Briefcase, Search, ChevronDown, Eye, Pencil, Mail } from 'lucide-react';
import { safeJSONParse } from '@/lib/safeJSON';

const animationProps = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: [0.19, 1, 0.22, 1] as const },
};

const staggerContainer = {
  animate: { transition: { staggerChildren: 0.08 } },
};

const staggerItem = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.19, 1, 0.22, 1] as const } },
};

interface CandidateRecord {
  id: string;
  name: string;
  profession: string;
  location: string;
  wriScore: number;
  levav28Day: number;
  status: 'active' | 'onboarding' | 'completed';
  appliedJobs: number;
}

const STATUS_STYLES: Record<string, string> = {
  active: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  onboarding: 'bg-[#C6FF34]/10 text-[#C6FF34] border-[#C6FF34]/20',
  completed: 'bg-[#7E3BED]/10 text-[#7E3BED] border-[#7E3BED]/20',
};

const MOCK_CANDIDATES: CandidateRecord[] = [
  { id: '1', name: 'Amara Okafor', profession: 'Software Engineer', location: 'Lagos, Nigeria', wriScore: 78, levav28Day: 14, status: 'active', appliedJobs: 12 },
  { id: '2', name: 'Jean-Pierre Mulamba', profession: 'Data Analyst', location: 'Kinshasa, DRC', wriScore: 62, levav28Day: 8, status: 'onboarding', appliedJobs: 5 },
  { id: '3', name: 'Zara Mensah', profession: 'UX Designer', location: 'Accra, Ghana', wriScore: 85, levav28Day: 28, status: 'completed', appliedJobs: 18 },
  { id: '4', name: 'Kofi Asante', profession: 'Product Manager', location: 'Accra, Ghana', wriScore: 55, levav28Day: 21, status: 'active', appliedJobs: 9 },
  { id: '5', name: 'Amina Diallo', profession: 'Marketing Specialist', location: 'Dakar, Senegal', wriScore: 71, levav28Day: 3, status: 'onboarding', appliedJobs: 2 },
  { id: '6', name: 'Thabo Mokoena', profession: 'DevOps Engineer', location: 'Johannesburg, SA', wriScore: 68, levav28Day: 16, status: 'active', appliedJobs: 7 },
];

function getCandidates(): CandidateRecord[] {
  const talentProfiles = safeJSONParse<{
    name?: string;
    profession?: string;
    location?: string;
    wriScore?: number;
    levav28Day?: number;
    status?: string;
    appliedJobs?: number;
  }[]>(localStorage.getItem('talent_profiles'), []);

  if (talentProfiles.length === 0) return MOCK_CANDIDATES;

  return talentProfiles.map((t, i) => ({
    id: `c-${i}`,
    name: t.name || 'Unnamed Candidate',
    profession: t.profession || '-',
    location: t.location || '-',
    wriScore: t.wriScore ?? 50,
    levav28Day: t.levav28Day ?? 0,
    status: (t.status as 'active' | 'onboarding' | 'completed') || 'active',
    appliedJobs: t.appliedJobs ?? 0,
  }));
}

export default function CandidatesSection(): React.JSX.Element {
  const [searchQuery, setSearchQuery] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState<string>('all');
  const [showStatusDropdown, setShowStatusDropdown] = React.useState(false);

  const candidates = getCandidates();
  const totalCandidates = candidates.length || 385;
  const levav28Active = 128;
  const readyToHire = 89;

  const filteredCandidates = candidates.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.profession.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const kpiCards = [
    { label: 'Total Candidates', value: totalCandidates, icon: Users, accent: '#C6FF34' },
    { label: 'Levav 28 Active', value: levav28Active, icon: Target, accent: '#C6FF34' },
    { label: 'Ready to Hire', value: readyToHire, icon: Briefcase, accent: '#7E3BED' },
  ];

  const statusOptions = [
    { value: 'all', label: 'All Statuses' },
    { value: 'active', label: 'Active' },
    { value: 'onboarding', label: 'Onboarding' },
    { value: 'completed', label: 'Completed' },
  ];

  return (
    <motion.div {...animationProps} className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Candidates</h2>
      </div>

      {/* KPI Cards */}
      <motion.div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
        variants={staggerContainer}
        initial="initial"
        animate="animate"
      >
        {kpiCards.map((kpi) => (
          <motion.div
            key={kpi.label}
            variants={staggerItem}
            className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.06] rounded-2xl p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-[#A0A0A0]">{kpi.label}</span>
              <div className="p-2 rounded-lg" style={{ backgroundColor: `${kpi.accent}15` }}>
                <kpi.icon size={18} style={{ color: kpi.accent }} />
              </div>
            </div>
            <div className="text-3xl font-bold text-white">{kpi.value}</div>
          </motion.div>
        ))}
      </motion.div>

      {/* Data Table */}
      <motion.div
        {...animationProps}
        className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.06] rounded-2xl p-6"
        transition={{ ...animationProps.transition, delay: 0.2 }}
      >
        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 mb-6">
          <div className="relative flex-1 max-w-sm">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#666666]" />
            <input
              type="text"
              placeholder="Search candidates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder:text-[#666666] focus:outline-none focus:border-[#C6FF34]/40 transition-colors"
            />
          </div>

          <div className="relative">
            <button
              onClick={() => setShowStatusDropdown(!showStatusDropdown)}
              className="flex items-center gap-2 bg-white/[0.03] border border-white/[0.08] rounded-xl py-2.5 px-4 text-sm text-white hover:border-white/[0.15] transition-colors"
            >
              <span className="text-[#A0A0A0]">Status:</span>
              {statusOptions.find((s) => s.value === statusFilter)?.label}
              <ChevronDown size={14} className="text-[#666666]" />
            </button>
            {showStatusDropdown && (
              <div className="absolute right-0 top-full mt-2 w-44 bg-[#1A1A1A] border border-white/[0.08] rounded-xl overflow-hidden z-10 shadow-xl">
                {statusOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => {
                      setStatusFilter(option.value);
                      setShowStatusDropdown(false);
                    }}
                    className={`w-full text-left px-4 py-2.5 text-sm transition-colors hover:bg-white/[0.05] ${
                      statusFilter === option.value ? 'text-[#C6FF34]' : 'text-[#A0A0A0]'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white/[0.06]">
                <th className="py-3 px-4 text-xs font-medium text-[#666666] uppercase tracking-wider">Name</th>
                <th className="py-3 px-4 text-xs font-medium text-[#666666] uppercase tracking-wider">Profession</th>
                <th className="py-3 px-4 text-xs font-medium text-[#666666] uppercase tracking-wider">Location</th>
                <th className="py-3 px-4 text-xs font-medium text-[#666666] uppercase tracking-wider">Levav 28</th>
                <th className="py-3 px-4 text-xs font-medium text-[#666666] uppercase tracking-wider">Status</th>
                <th className="py-3 px-4 text-xs font-medium text-[#666666] uppercase tracking-wider">Applied</th>
                <th className="py-3 px-4 text-xs font-medium text-[#666666] uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCandidates.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-[#A0A0A0]">
                    No candidates found matching your filters.
                  </td>
                </tr>
              ) : (
                filteredCandidates.map((c) => (
                  <tr key={c.id} className="border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors">
                    <td className="py-3 px-4 text-sm text-white font-medium">{c.name}</td>
                    <td className="py-3 px-4 text-sm text-[#A0A0A0]">{c.profession}</td>
                    <td className="py-3 px-4 text-sm text-[#A0A0A0]">{c.location}</td>
                    <td className="py-3 px-4 text-sm text-[#A0A0A0]">Day {c.levav28Day}</td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium border ${STATUS_STYLES[c.status] || STATUS_STYLES.active}`}>
                        {c.status.charAt(0).toUpperCase() + c.status.slice(1)}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm text-[#A0A0A0]">{c.appliedJobs}</td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button className="p-1.5 rounded-lg hover:bg-white/[0.06] text-[#A0A0A0] hover:text-white transition-colors" title="View Profile">
                          <Eye size={14} />
                        </button>
                        <button className="p-1.5 rounded-lg hover:bg-white/[0.06] text-[#A0A0A0] hover:text-white transition-colors" title="Edit">
                          <Pencil size={14} />
                        </button>
                        <button className="p-1.5 rounded-lg hover:bg-white/[0.06] text-[#A0A0A0] hover:text-[#C6FF34] transition-colors" title="Contact">
                          <Mail size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    </motion.div>
  );
}
