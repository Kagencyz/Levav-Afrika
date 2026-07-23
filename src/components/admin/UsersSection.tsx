import React from 'react';
import { motion } from 'framer-motion';
import { Users, UserCheck, UserPlus, Shield, Search, Eye, Pencil, Ban } from 'lucide-react';
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

interface UserRecord {
  id: string;
  name: string;
  email: string;
  role: 'talent' | 'employer' | 'admin' | 'champion';
  status: 'active' | 'inactive';
  country: string;
  joinedDate: string;
}

const ROLE_STYLES: Record<string, string> = {
  talent: 'bg-[#C6FF34]/10 text-[#C6FF34] border-[#C6FF34]/20',
  employer: 'bg-[#7E3BED]/10 text-[#7E3BED] border-[#7E3BED]/20',
  admin: 'bg-red-500/10 text-red-400 border-red-500/20',
  champion: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
};

const STATUS_STYLES: Record<string, string> = {
  active: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  inactive: 'bg-white/5 text-[#666666] border-white/10',
};

const MOCK_USERS: UserRecord[] = [
  { id: '1', name: 'Amara Okafor', email: 'amara@email.com', role: 'talent', status: 'active', country: 'Nigeria', joinedDate: '2024-01-15' },
  { id: '2', name: 'Jean-Pierre Mulamba', email: 'jp@congo.co', role: 'talent', status: 'active', country: 'DRC', joinedDate: '2024-02-03' },
  { id: '3', name: 'TechVentures Ltd', email: 'hr@techventures.co', role: 'employer', status: 'active', country: 'South Africa', joinedDate: '2024-01-28' },
  { id: '4', name: 'Zara Mensah', email: 'zara@email.com', role: 'champion', status: 'active', country: 'Ghana', joinedDate: '2024-03-10' },
  { id: '5', name: 'Admin System', email: 'admin@levav.io', role: 'admin', status: 'active', country: 'Kenya', joinedDate: '2023-11-01' },
  { id: '6', name: 'Kofi Asante', email: 'kofi@email.com', role: 'talent', status: 'inactive', country: 'Ghana', joinedDate: '2024-02-20' },
  { id: '7', name: 'GreenField HR', email: 'jobs@greenfield.co', role: 'employer', status: 'active', country: 'Nigeria', joinedDate: '2024-03-05' },
  { id: '8', name: 'Amina Diallo', email: 'amina@email.com', role: 'talent', status: 'active', country: 'Senegal', joinedDate: '2024-04-01' },
];

function getUsers(): UserRecord[] {
  const talentProfiles = safeJSONParse<{ name?: string; email?: string; country?: string; createdAt?: string }[]>(localStorage.getItem('talent_profiles'), []);
  const employerProfiles = safeJSONParse<{ companyName?: string; email?: string; country?: string; createdAt?: string }[]>(localStorage.getItem('employer_profiles'), []);

  const talents: UserRecord[] = talentProfiles.map((t, i) => ({
    id: `t-${i}`,
    name: t.name || 'Unnamed Talent',
    email: t.email || '-',
    role: 'talent',
    status: 'active',
    country: t.country || '-',
    joinedDate: t.createdAt || new Date().toISOString().split('T')[0],
  }));

  const employers: UserRecord[] = employerProfiles.map((e, i) => ({
    id: `e-${i}`,
    name: e.companyName || 'Unnamed Company',
    email: e.email || '-',
    role: 'employer',
    status: 'active',
    country: e.country || '-',
    joinedDate: e.createdAt || new Date().toISOString().split('T')[0],
  }));

  const combined = [...talents, ...employers];
  return combined.length > 0 ? combined : MOCK_USERS;
}

export default function UsersSection(): React.JSX.Element {
  const [searchQuery, setSearchQuery] = React.useState('');
  const users = getUsers();
  const totalUsers = users.length;
  const activeUsers = Math.round(totalUsers * 0.65);
  const newThisWeek = 24;
  const verifiedUsers = 312;

  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const kpiCards = [
    { label: 'Total Users', value: totalUsers, icon: Users, accent: '#C6FF34' },
    { label: 'Active Users', value: activeUsers, icon: UserCheck, accent: '#7E3BED' },
    { label: 'New This Week', value: newThisWeek, icon: UserPlus, accent: '#C6FF34' },
    { label: 'Verified Users', value: verifiedUsers, icon: Shield, accent: '#7E3BED' },
  ];

  return (
    <motion.div {...animationProps} className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Users</h2>
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
              placeholder="Search by name or email..."
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
                <th className="py-3 px-4 text-xs font-medium text-[#666666] uppercase tracking-wider">Email</th>
                <th className="py-3 px-4 text-xs font-medium text-[#666666] uppercase tracking-wider">Role</th>
                <th className="py-3 px-4 text-xs font-medium text-[#666666] uppercase tracking-wider">Status</th>
                <th className="py-3 px-4 text-xs font-medium text-[#666666] uppercase tracking-wider">Country</th>
                <th className="py-3 px-4 text-xs font-medium text-[#666666] uppercase tracking-wider">Joined</th>
                <th className="py-3 px-4 text-xs font-medium text-[#666666] uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-[#A0A0A0]">
                    No users found matching your search.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors">
                    <td className="py-3 px-4 text-sm text-white font-medium">{user.name}</td>
                    <td className="py-3 px-4 text-sm text-[#A0A0A0]">{user.email}</td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium border ${ROLE_STYLES[user.role] || ROLE_STYLES.talent}`}>
                        {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium border ${STATUS_STYLES[user.status] || STATUS_STYLES.active}`}>
                        {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm text-[#A0A0A0]">{user.country}</td>
                    <td className="py-3 px-4 text-sm text-[#666666]">{user.joinedDate}</td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button className="p-1.5 rounded-lg hover:bg-white/[0.06] text-[#A0A0A0] hover:text-white transition-colors" title="View">
                          <Eye size={14} />
                        </button>
                        <button className="p-1.5 rounded-lg hover:bg-white/[0.06] text-[#A0A0A0] hover:text-white transition-colors" title="Edit">
                          <Pencil size={14} />
                        </button>
                        <button className="p-1.5 rounded-lg hover:bg-white/[0.06] text-[#A0A0A0] hover:text-red-400 transition-colors" title="Deactivate">
                          <Ban size={14} />
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
