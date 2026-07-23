import React from 'react';
import { motion } from 'framer-motion';
import { Users, ClipboardList, Clock, Star, Search, Eye, Pencil, Trash2 } from 'lucide-react';

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

interface RecruiterRecord {
  id: string;
  name: string;
  company: string;
  email: string;
  postings: number;
  hires: number;
  rating: number;
  status: 'active' | 'inactive';
}

const STATUS_STYLES: Record<string, string> = {
  active: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  inactive: 'bg-white/5 text-[#666666] border-white/10',
};

const MOCK_RECRUITERS: RecruiterRecord[] = [
  { id: '1', name: 'Sarah Osei', company: 'TechVentures Ltd', email: 'sarah@techventures.co', postings: 24, hires: 12, rating: 4.8, status: 'active' },
  { id: '2', name: 'David Okonkwo', company: 'GreenField HR', email: 'david@greenfield.co', postings: 18, hires: 9, rating: 4.5, status: 'active' },
  { id: '3', name: 'Priya Naidoo', company: 'CloudFirst Africa', email: 'priya@cloudfirst.africa', postings: 31, hires: 15, rating: 4.9, status: 'active' },
  { id: '4', name: 'Michael Koranteng', company: 'TalentWave GH', email: 'mike@talentwave.gh', postings: 12, hires: 5, rating: 4.2, status: 'active' },
  { id: '5', name: 'Laura Mbaye', company: 'StartUp Senegal', email: 'laura@startupsn.co', postings: 8, hires: 3, rating: 4.0, status: 'inactive' },
  { id: '6', name: 'James Mwanza', company: 'Digital Africa Talent', email: 'james@digitalafrica.co', postings: 42, hires: 22, rating: 4.7, status: 'active' },
];

export default function RecruitersSection(): React.JSX.Element {
  const [searchQuery, setSearchQuery] = React.useState('');

  const totalRecruiters = 42;
  const activePostings = 156;
  const avgTimeToHire = 18;
  const satisfaction = 4.6;

  const filteredRecruiters = MOCK_RECRUITERS.filter(
    (r) =>
      r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const kpiCards = [
    { label: 'Total Recruiters', value: totalRecruiters, icon: Users, accent: '#C6FF34' },
    { label: 'Active Postings', value: activePostings, icon: ClipboardList, accent: '#7E3BED' },
    { label: 'Avg Time to Hire', value: `${avgTimeToHire}d`, icon: Clock, accent: '#C6FF34' },
    { label: 'Satisfaction', value: `${satisfaction}/5`, icon: Star, accent: '#7E3BED' },
  ];

  return (
    <motion.div {...animationProps} className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Recruiters</h2>
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
        {/* Search */}
        <div className="flex items-center gap-3 mb-6">
          <div className="relative flex-1 max-w-sm">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#666666]" />
            <input
              type="text"
              placeholder="Search recruiters..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder:text-[#666666] focus:outline-none focus:border-[#C6FF34]/40 transition-colors"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white/[0.06]">
                <th className="py-3 px-4 text-xs font-medium text-[#666666] uppercase tracking-wider">Name</th>
                <th className="py-3 px-4 text-xs font-medium text-[#666666] uppercase tracking-wider">Company</th>
                <th className="py-3 px-4 text-xs font-medium text-[#666666] uppercase tracking-wider">Email</th>
                <th className="py-3 px-4 text-xs font-medium text-[#666666] uppercase tracking-wider">Postings</th>
                <th className="py-3 px-4 text-xs font-medium text-[#666666] uppercase tracking-wider">Hires</th>
                <th className="py-3 px-4 text-xs font-medium text-[#666666] uppercase tracking-wider">Rating</th>
                <th className="py-3 px-4 text-xs font-medium text-[#666666] uppercase tracking-wider">Status</th>
                <th className="py-3 px-4 text-xs font-medium text-[#666666] uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredRecruiters.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-[#A0A0A0]">
                    No recruiters found matching your search.
                  </td>
                </tr>
              ) : (
                filteredRecruiters.map((r) => (
                  <tr key={r.id} className="border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors">
                    <td className="py-3 px-4 text-sm text-white font-medium">{r.name}</td>
                    <td className="py-3 px-4 text-sm text-[#A0A0A0]">{r.company}</td>
                    <td className="py-3 px-4 text-sm text-[#A0A0A0]">{r.email}</td>
                    <td className="py-3 px-4 text-sm text-[#A0A0A0]">{r.postings}</td>
                    <td className="py-3 px-4 text-sm text-[#A0A0A0]">{r.hires}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1">
                        <Star size={13} className="text-[#C6FF34] fill-[#C6FF34]" />
                        <span className="text-sm font-medium text-white">{r.rating}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium border ${STATUS_STYLES[r.status] || STATUS_STYLES.active}`}>
                        {r.status.charAt(0).toUpperCase() + r.status.slice(1)}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button className="p-1.5 rounded-lg hover:bg-white/[0.06] text-[#A0A0A0] hover:text-white transition-colors" title="View">
                          <Eye size={14} />
                        </button>
                        <button className="p-1.5 rounded-lg hover:bg-white/[0.06] text-[#A0A0A0] hover:text-white transition-colors" title="Edit">
                          <Pencil size={14} />
                        </button>
                        <button className="p-1.5 rounded-lg hover:bg-white/[0.06] text-[#A0A0A0] hover:text-red-400 transition-colors" title="Remove">
                          <Trash2 size={14} />
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
