import { useState, useMemo } from 'react';
import { Link } from 'react-router';
import { motion, AnimatePresence } from 'framer-motion';
import { safeJSONParse } from '@/lib/safeJSON';
import {
  ShieldCheck,
  XCircle,
  Users,
  Briefcase,
  BarChart3,
  Search,
  CheckCircle2,
  Clock,
  AlertCircle,
  Building2,
  Mail,
  TrendingUp,
  Loader2,
  Filter,
  ChevronDown,
  Globe,
  DollarSign,
  Activity,
  PieChart,
  Layers,
  Trophy,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

/* ─── Admin Section Components ─── */
import UsersSection from '@/components/admin/UsersSection';
import CandidatesSection from '@/components/admin/CandidatesSection';
import RecruitersSection from '@/components/admin/RecruitersSection';
import EmployersSection from '@/components/admin/EmployersSection';
import JobsSection from '@/components/admin/JobsSection';
import ApplicationsSection from '@/components/admin/ApplicationsSection';
import Levav28Section from '@/components/admin/Levav28Section';
import QuickWorkSection from '@/components/admin/QuickWorkSection';
import CoursesSection from '@/components/admin/CoursesSection';
import UniversitySection from '@/components/admin/UniversitySection';
import PaymentsSection from '@/components/admin/PaymentsSection';
import SubscriptionsSection from '@/components/admin/SubscriptionsSection';
import NotificationsSection from '@/components/admin/NotificationsSection';
import ReportsSection from '@/components/admin/ReportsSection';
import ModerationSection from '@/components/admin/ModerationSection';
import SupportSection from '@/components/admin/SupportSection';
import ContentMgmtSection from '@/components/admin/ContentMgmtSection';
import SettingsSection from '@/components/admin/SettingsSection';
import RolesSection from '@/components/admin/RolesSection';
import AuditSection from '@/components/admin/AuditSection';
import ChampionApplicationsSection from '@/components/admin/ChampionApplicationsSection';

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
type EmployerStatus = 'pending' | 'verified' | 'rejected';

interface Employer {
  id: string | number;
  companyName: string;
  contactName: string;
  contactEmail: string;
  industry: string;
  companySize?: string;
  status: EmployerStatus;
  verificationStatus?: string;
  city?: string;
  country?: string;
  createdAt: string;
}

interface Application {
  id: string;
  applicant: string;
  job: string;
  company: string;
  status: string;
  date: string;
}

/* ───────────────────── Mock Employer Data ───────────────────── */
const MOCK_EMPLOYERS: Employer[] = [
  {
    id: 1,
    companyName: 'BongoHive',
    contactName: 'John Banda',
    contactEmail: 'hr@bongohive.co.zm',
    industry: 'Technology',
    companySize: '50-200 employees',
    status: 'verified',
    verificationStatus: 'verified',
    city: 'Lusaka',
    country: 'Zambia',
    createdAt: new Date(Date.now() - 86400000 * 30).toISOString(),
  },
  {
    id: 2,
    companyName: 'Zambeef',
    contactName: 'Mary Mulenga',
    contactEmail: 'careers@zambeef.com',
    industry: 'Agriculture',
    companySize: '1000+ employees',
    status: 'pending',
    verificationStatus: 'pending',
    city: 'Lusaka',
    country: 'Zambia',
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
  },
  {
    id: 3,
    companyName: 'MPharma',
    contactName: 'Gregory Rockson',
    contactEmail: 'jobs@mpharma.com',
    industry: 'Healthcare',
    companySize: '200-500 employees',
    status: 'pending',
    verificationStatus: 'pending',
    city: 'Accra',
    country: 'Ghana',
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
  },
  {
    id: 4,
    companyName: 'Sunbiolab',
    contactName: 'Dr. Kofi Addo',
    contactEmail: 'info@sunbiolab.com',
    industry: 'Healthcare',
    companySize: '11-50 employees',
    status: 'pending',
    verificationStatus: 'pending',
    city: 'Accra',
    country: 'Ghana',
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: 5,
    companyName: 'Andela',
    contactName: 'Christine Mugambi',
    contactEmail: 'africa@andela.com',
    industry: 'Technology',
    companySize: '1000+ employees',
    status: 'verified',
    verificationStatus: 'verified',
    city: 'Nairobi',
    country: 'Kenya',
    createdAt: new Date(Date.now() - 86400000 * 45).toISOString(),
  },
  {
    id: 6,
    companyName: 'Flutterwave',
    contactName: 'Olugbenga Agboola',
    contactEmail: 'careers@flutterwave.com',
    industry: 'Technology',
    companySize: '500-1000 employees',
    status: 'verified',
    verificationStatus: 'verified',
    city: 'Lagos',
    country: 'Nigeria',
    createdAt: new Date(Date.now() - 86400000 * 60).toISOString(),
  },
  {
    id: 7,
    companyName: 'GreenFingers Africa',
    contactName: 'Esther Mwangi',
    contactEmail: 'hello@greenfingers.africa',
    industry: 'Agriculture',
    companySize: '50-200 employees',
    status: 'pending',
    verificationStatus: 'pending',
    city: 'Nairobi',
    country: 'Kenya',
    createdAt: new Date(Date.now() - 86400000 * 1).toISOString(),
  },
  {
    id: 8,
    companyName: 'EduBridge Zambia',
    contactName: 'Rev. Thomas Phiri',
    contactEmail: 'partnerships@edubridge.zm',
    industry: 'Education',
    companySize: '11-50 employees',
    status: 'verified',
    verificationStatus: 'verified',
    city: 'Ndola',
    country: 'Zambia',
    createdAt: new Date(Date.now() - 86400000 * 20).toISOString(),
  },
];

/* ───────────────────── Mock Application Data ───────────────────── */
const MOCK_APPLICATIONS: Application[] = [
  { id: 'a1', applicant: 'Chioma Okonkwo', job: 'Frontend Developer', company: 'BongoHive', status: 'pending', date: '2 hours ago' },
  { id: 'a2', applicant: 'Emmanuel Osei', job: 'Product Designer', company: 'Zambeef', status: 'accepted', date: '1 day ago' },
  { id: 'a3', applicant: 'Amina Ibrahim', job: 'Data Analyst', company: 'MPharma', status: 'pending', date: '2 days ago' },
  { id: 'a4', applicant: 'Kwame Mensah', job: 'Backend Developer', company: 'Andela', status: 'rejected', date: '3 days ago' },
  { id: 'a5', applicant: 'Ngozi Adeleke', job: 'UX Researcher', company: 'Flutterwave', status: 'pending', date: '4 days ago' },
  { id: 'a6', applicant: 'Mutale Mwanza', job: 'Senior Frontend Developer', company: 'BongoHive', status: 'accepted', date: '5 days ago' },
  { id: 'a7', applicant: 'Grace Lungu', job: 'Product Designer', company: 'Sunbiolab', status: 'pending', date: '6 days ago' },
  { id: 'a8', applicant: 'Kofi Mensah', job: 'Mobile Developer', company: 'Andela', status: 'pending', date: '1 week ago' },
];

/* ───────────────────── Mock Analytics Data ───────────────────── */
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];

const PLATFORM_GROWTH = {
  talent: [120, 158, 195, 248, 312, 385],
  employers: [25, 34, 48, 62, 78, 95],
  jobs: [18, 28, 42, 55, 68, 82],
};

const REVENUE_DATA = [
  { month: 'Jan', gmv: 12500 },
  { month: 'Feb', gmv: 18700 },
  { month: 'Mar', gmv: 22400 },
  { month: 'Apr', gmv: 31800 },
  { month: 'May', gmv: 39600 },
  { month: 'Jun', gmv: 48200 },
];

const TOP_COUNTRIES = [
  { country: 'Zambia', users: 185, color: '#C6FF34' },
  { country: 'Nigeria', users: 142, color: '#7E3BED' },
  { country: 'Ghana', users: 98, color: '#3B82F6' },
  { country: 'Kenya', users: 87, color: '#F59E0B' },
  { country: 'South Africa', users: 64, color: '#10B981' },
];

const USER_RETENTION = [
  { cohort: 'Jan Week 1', weeks: [100, 78, 65, 58, 52, 48] },
  { cohort: 'Feb Week 1', weeks: [100, 82, 70, 62, 55, null] },
  { cohort: 'Mar Week 1', weeks: [100, 85, 72, 64, null, null] },
  { cohort: 'Apr Week 1', weeks: [100, 80, 68, null, null, null] },
  { cohort: 'May Week 1', weeks: [100, 88, null, null, null, null] },
  { cohort: 'Jun Week 1', weeks: [100, null, null, null, null, null] },
];

/* ───────────────────── Status Badge ───────────────────── */
function StatusBadge({ status }: { status: EmployerStatus }) {
  const config = {
    pending: { color: '#eab308', bg: 'rgba(234,179,8,0.1)', label: 'Pending' },
    verified: { color: '#C6FF34', bg: 'rgba(198,255,52,0.1)', label: 'Verified' },
    rejected: { color: '#ef4444', bg: 'rgba(239,68,68,0.1)', label: 'Rejected' },
  };
  const c = config[status];

  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium"
      style={{ backgroundColor: c.bg, color: c.color }}
    >
      {status === 'pending' && <Clock className="w-3 h-3" />}
      {status === 'verified' && <CheckCircle2 className="w-3 h-3" />}
      {status === 'rejected' && <XCircle className="w-3 h-3" />}
      {c.label}
    </span>
  );
}

/* ───────────────────── Stat Card ───────────────────── */
function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  color,
  index,
}: {
  title: string;
  value: string | number;
  subtitle: string;
  icon: React.ElementType;
  color: string;
  index: number;
}) {
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
        <div className="flex items-center gap-1 text-[#C6FF34] text-xs">
          <TrendingUp className="w-3 h-3" />
        </div>
      </div>
      <p className="text-[#666666] text-xs uppercase tracking-wider mb-1">{title}</p>
      <p className="text-white text-3xl font-semibold mb-1">{value}</p>
      <p className="text-[#666666] text-xs">{subtitle}</p>
    </motion.div>
  );
}

/* ───────────────────── Employer Data Hook ───────────────────── */
function useEmployerData() {
  return useMemo(() => {
    const parsed = safeJSONParse<Employer[]>('employer_profiles', []);
    const localEmployers = Array.isArray(parsed) ? parsed : [];

    const allEmployers = localEmployers.length > 0
      ? [...localEmployers, ...MOCK_EMPLOYERS]
      : MOCK_EMPLOYERS;

    return {
      employers: allEmployers,
      totalEmployers: allEmployers.length,
      pendingCount: allEmployers.filter((e) => e.status === 'pending' || e.verificationStatus === 'pending').length,
      verifiedCount: allEmployers.filter((e) => e.status === 'verified' || e.verificationStatus === 'verified').length,
    };
  }, []);
}

/* ───────────────────── Stats Overview ───────────────────── */
function StatsOverview() {
  const { totalEmployers, pendingCount } = useEmployerData();
  const totalApplications = MOCK_APPLICATIONS.length;

  // Count unique active job postings from mock data
  const totalJobs = 12;

  const stats = [
    {
      title: 'Total Employers',
      value: totalEmployers,
      subtitle: 'Registered companies',
      icon: Building2,
      color: '#C6FF34',
    },
    {
      title: 'Pending Verifications',
      value: pendingCount,
      subtitle: 'Awaiting approval',
      icon: Clock,
      color: '#eab308',
    },
    {
      title: 'Total Jobs',
      value: totalJobs,
      subtitle: 'Active postings',
      icon: Briefcase,
      color: '#7E3BED',
    },
    {
      title: 'Total Applications',
      value: totalApplications,
      subtitle: 'All time submissions',
      icon: BarChart3,
      color: '#C6FF34',
    },
  ];

  return (
    <motion.div
      className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4"
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
    >
      {stats.map((stat, i) => (
        <StatCard key={stat.title} {...stat} index={i} />
      ))}
    </motion.div>
  );
}

/* ───────────────────── Employer Table ───────────────────── */
function EmployerTable({
  employers,
  isLoading,
  showActions = false,
  onVerify,
  onReject,
  verifyingId,
  rejectingId,
}: {
  employers: Employer[];
  isLoading: boolean;
  showActions?: boolean;
  onVerify?: (id: string | number) => void;
  onReject?: (id: string | number) => void;
  verifyingId?: string | number | null;
  rejectingId?: string | number | null;
}) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-6 h-6 animate-spin text-[#C6FF34]" />
      </div>
    );
  }

  if (employers.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-12 h-12 rounded-xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center mb-3">
          <Users className="w-5 h-5 text-[#666666]" />
        </div>
        <p className="text-[#666666] text-sm">No employers found</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-white/[0.06]">
            <th className="text-left text-[#666666] text-xs font-medium uppercase tracking-wider px-4 py-3">
              Company Name
            </th>
            <th className="text-left text-[#666666] text-xs font-medium uppercase tracking-wider px-4 py-3">
              Contact Person
            </th>
            <th className="text-left text-[#666666] text-xs font-medium uppercase tracking-wider px-4 py-3">
              Industry
            </th>
            <th className="text-left text-[#666666] text-xs font-medium uppercase tracking-wider px-4 py-3">
              Location
            </th>
            <th className="text-left text-[#666666] text-xs font-medium uppercase tracking-wider px-4 py-3">
              Status
            </th>
            {showActions && (
              <th className="text-left text-[#666666] text-xs font-medium uppercase tracking-wider px-4 py-3">
                Actions
              </th>
            )}
          </tr>
        </thead>
        <tbody>
          <AnimatePresence>
            {employers.map((emp, i) => (
              <motion.tr
                key={emp.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04, duration: 0.3 }}
                className="border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors"
              >
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-white/[0.05] flex items-center justify-center flex-shrink-0">
                      <Building2 className="w-4 h-4 text-[#A0A0A0]" />
                    </div>
                    <div>
                      <span className="text-white text-sm font-medium block">
                        {emp.companyName}
                      </span>
                      {emp.companySize && (
                        <span className="text-[#666666] text-[10px]">{emp.companySize}</span>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-col">
                    <span className="text-white text-sm">{emp.contactName}</span>
                    <span className="text-[#666666] text-xs flex items-center gap-1">
                      <Mail className="w-3 h-3" />
                      {emp.contactEmail}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className="text-[#A0A0A0] text-sm">{emp.industry}</span>
                </td>
                <td className="px-4 py-3">
                  <span className="text-[#A0A0A0] text-xs flex items-center gap-1">
                    <Globe className="w-3 h-3 text-[#666666]" />
                    {emp.city && emp.country ? `${emp.city}, ${emp.country}` : 'N/A'}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={emp.status} />
                </td>
                {showActions && (
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onVerify?.(emp.id)}
                        disabled={emp.status === 'verified' || verifyingId === emp.id}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                          emp.status === 'verified'
                            ? 'bg-[#C6FF34]/10 text-[#C6FF34] cursor-not-allowed opacity-50'
                            : 'bg-[#C6FF34] text-black hover:bg-[#d4ff5c] active:scale-95'
                        }`}
                      >
                        {verifyingId === emp.id ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                          <ShieldCheck className="w-3 h-3" />
                        )}
                        Verify
                      </button>
                      <button
                        onClick={() => onReject?.(emp.id)}
                        disabled={emp.status === 'rejected' || rejectingId === emp.id}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${
                          emp.status === 'rejected'
                            ? 'border-[#ef4444]/20 text-[#ef4444] cursor-not-allowed opacity-50'
                            : 'border-[#ef4444]/40 text-[#ef4444] hover:bg-[#ef4444]/10 active:scale-95'
                        }`}
                      >
                        {rejectingId === emp.id ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                          <XCircle className="w-3 h-3" />
                        )}
                        Reject
                      </button>
                    </div>
                  </td>
                )}
              </motion.tr>
            ))}
          </AnimatePresence>
        </tbody>
      </table>
    </div>
  );
}

/* ───────────────────── Pending Verifications Section ───────────────────── */
function PendingVerifications() {
  const { employers } = useEmployerData();
  const [pendingList, setPendingList] = useState<Employer[]>(
    employers.filter((e) => e.status === 'pending' || e.verificationStatus === 'pending')
  );
  const [verifyingId, setVerifyingId] = useState<string | number | null>(null);
  const [rejectingId, setRejectingId] = useState<string | number | null>(null);

  const handleVerify = (id: string | number) => {
    setVerifyingId(id);
    setTimeout(() => {
      setPendingList((prev) => prev.filter((e) => e.id !== id));
      setVerifyingId(null);
    }, 500);
  };

  const handleReject = (id: string | number) => {
    setRejectingId(id);
    setTimeout(() => {
      setPendingList((prev) => prev.filter((e) => e.id !== id));
      setRejectingId(null);
    }, 500);
  };

  return (
    <motion.div
      className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.06] rounded-2xl p-6 hover:border-white/[0.1] transition-all"
      variants={fadeUp}
      custom={4}
      initial="hidden"
      animate="visible"
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-white text-lg font-semibold flex items-center gap-2">
            <Clock className="w-5 h-5 text-[#eab308]" />
            Pending Verifications
          </h2>
          <p className="text-[#666666] text-xs mt-0.5">
            Review and approve employer registration requests
          </p>
        </div>
        <span className="bg-[#eab308]/10 text-[#eab308] text-xs font-medium px-2.5 py-1 rounded-lg">
          {pendingList.length} pending
        </span>
      </div>

      <EmployerTable
        employers={pendingList}
        isLoading={false}
        showActions
        onVerify={handleVerify}
        onReject={handleReject}
        verifyingId={verifyingId}
        rejectingId={rejectingId}
      />
    </motion.div>
  );
}

/* ───────────────────── All Employers Section ───────────────────── */
function AllEmployers() {
  const { employers } = useEmployerData();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);

  const filtered = employers.filter((emp) => {
    const matchesSearch =
      search === '' ||
      emp.companyName.toLowerCase().includes(search.toLowerCase()) ||
      emp.contactName.toLowerCase().includes(search.toLowerCase()) ||
      emp.industry.toLowerCase().includes(search.toLowerCase()) ||
      (emp.city && emp.city.toLowerCase().includes(search.toLowerCase())) ||
      (emp.country && emp.country.toLowerCase().includes(search.toLowerCase()));
    const matchesStatus =
      statusFilter === 'all' || emp.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <motion.div
      className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.06] rounded-2xl p-6 hover:border-white/[0.1] transition-all"
      variants={fadeUp}
      custom={5}
      initial="hidden"
      animate="visible"
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-white text-lg font-semibold flex items-center gap-2">
            <Users className="w-5 h-5 text-[#C6FF34]" />
            All Employers
          </h2>
          <p className="text-[#666666] text-xs mt-0.5">
            Complete list of registered employers
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-initial">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#666666]" />
            <input
              type="text"
              placeholder="Search employers..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full sm:w-64 bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-white placeholder-[#666666] focus:outline-none focus:border-[#C6FF34]/30 transition-colors text-sm"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium border transition-all ${
              showFilters
                ? 'border-[#C6FF34]/30 bg-[#C6FF34]/10 text-[#C6FF34]'
                : 'border-white/10 bg-white/5 text-[#A0A0A0] hover:text-white'
            }`}
          >
            <Filter className="w-3.5 h-3.5" />
            Filter
            <ChevronDown className={`w-3 h-3 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
          </button>
        </div>
      </div>

      {showFilters && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="flex items-center gap-2 mb-4 pb-4 border-b border-white/[0.04]"
        >
          {['all', 'pending', 'verified', 'rejected'].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all ${
                statusFilter === s
                  ? 'bg-[#C6FF34] text-black'
                  : 'bg-white/5 text-[#A0A0A0] hover:text-white border border-white/10'
              }`}
            >
              {s}
            </button>
          ))}
        </motion.div>
      )}

      <EmployerTable employers={filtered} isLoading={false} />

      {filtered.length > 0 && (
        <div className="mt-4 pt-4 border-t border-white/[0.04] flex items-center justify-between">
          <p className="text-[#666666] text-xs">
            Showing {filtered.length} of {employers.length} employers
          </p>
        </div>
      )}
    </motion.div>
  );
}

/* ───────────────────── Recent Applications Section ───────────────────── */
function RecentApplications() {
  const applications = MOCK_APPLICATIONS;

  const appStatusConfig: Record<string, { color: string; bg: string; label: string }> = {
    pending: { color: '#eab308', bg: 'rgba(234,179,8,0.1)', label: 'Pending' },
    accepted: { color: '#C6FF34', bg: 'rgba(198,255,52,0.1)', label: 'Accepted' },
    rejected: { color: '#ef4444', bg: 'rgba(239,68,68,0.1)', label: 'Rejected' },
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
        <div>
          <h2 className="text-white text-lg font-semibold flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-[#7E3BED]" />
            Recent Applications
          </h2>
          <p className="text-[#666666] text-xs mt-0.5">
            Latest job application submissions
          </p>
        </div>
        <span className="bg-[#7E3BED]/10 text-[#7E3BED] text-xs font-medium px-2.5 py-1 rounded-lg">
          {applications.length} total
        </span>
      </div>

      <div className="space-y-3">
        {applications.map((app, i) => {
          const cfg = appStatusConfig[app.status] || appStatusConfig.pending;
          return (
            <motion.div
              key={app.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05, duration: 0.3 }}
              className="flex items-center gap-4 bg-white/[0.02] border border-white/[0.04] rounded-xl p-4 hover:border-white/[0.08] transition-all"
            >
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#C6FF34] to-[#7E3BED] flex items-center justify-center text-black text-xs font-bold flex-shrink-0">
                {app.applicant.split(' ').map((n) => n[0]).join('')}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-medium truncate">
                  {app.applicant}
                </p>
                <p className="text-[#666666] text-xs truncate">
                  {app.job} — {app.company}
                </p>
              </div>
              <div className="flex items-center gap-3 flex-shrink-0">
                <span
                  className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium"
                  style={{ backgroundColor: cfg.bg, color: cfg.color }}
                >
                  {cfg.label}
                </span>
                <span className="text-[#666666] text-xs hidden sm:inline">
                  {app.date}
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}

/* ───────────────────── Platform Growth Chart ───────────────────── */
function PlatformGrowthChart() {
  const maxTalent = Math.max(...PLATFORM_GROWTH.talent);

  return (
    <motion.div
      className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.06] rounded-2xl p-6 hover:border-white/[0.1] transition-all"
      variants={fadeUp}
      custom={0}
      initial="hidden"
      animate="visible"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-[#C6FF34]" />
          <h3 className="text-white text-lg font-semibold">Platform Growth</h3>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-[#C6FF34]" />
            <span className="text-[#666666] text-xs">Talent</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-[#7E3BED]" />
            <span className="text-[#666666] text-xs">Employers</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-[#3B82F6]" />
            <span className="text-[#666666] text-xs">Jobs</span>
          </div>
        </div>
      </div>

      {/* Stacked bar chart showing growth */}
      <div className="flex items-end gap-3 h-48 mb-4">
        {MONTHS.map((month, i) => {
          const talentH = (PLATFORM_GROWTH.talent[i] / maxTalent) * 100;
          const employerH = (PLATFORM_GROWTH.employers[i] / maxTalent) * 100;
          const jobH = (PLATFORM_GROWTH.jobs[i] / maxTalent) * 100;
          return (
            <div key={month} className="flex-1 flex flex-col items-center gap-1 group">
              <div className="w-full flex items-end gap-[2px] h-40 relative">
                <div className="flex-1 bg-[#C6FF34]/20 rounded-t-sm relative overflow-hidden">
                  <motion.div
                    className="absolute bottom-0 left-0 right-0 bg-[#C6FF34] rounded-t-sm"
                    initial={{ height: 0 }}
                    animate={{ height: `${talentH}%` }}
                    transition={{ delay: i * 0.08 + 0.2, duration: 0.5, ease: [0.19, 1, 0.22, 1] }}
                  />
                </div>
                <div className="flex-1 bg-[#7E3BED]/20 rounded-t-sm relative overflow-hidden">
                  <motion.div
                    className="absolute bottom-0 left-0 right-0 bg-[#7E3BED] rounded-t-sm"
                    initial={{ height: 0 }}
                    animate={{ height: `${employerH}%` }}
                    transition={{ delay: i * 0.08 + 0.35, duration: 0.5, ease: [0.19, 1, 0.22, 1] }}
                  />
                </div>
                <div className="flex-1 bg-[#3B82F6]/20 rounded-t-sm relative overflow-hidden">
                  <motion.div
                    className="absolute bottom-0 left-0 right-0 bg-[#3B82F6] rounded-t-sm"
                    initial={{ height: 0 }}
                    animate={{ height: `${jobH}%` }}
                    transition={{ delay: i * 0.08 + 0.5, duration: 0.5, ease: [0.19, 1, 0.22, 1] }}
                  />
                </div>
                {/* Tooltip */}
                <div className="absolute -top-14 left-1/2 -translate-x-1/2 bg-[#1a1a1a] border border-white/10 text-white text-[10px] px-2 py-1.5 rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                  <div>T: {PLATFORM_GROWTH.talent[i]}</div>
                  <div>E: {PLATFORM_GROWTH.employers[i]}</div>
                  <div>J: {PLATFORM_GROWTH.jobs[i]}</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex gap-3">
        {MONTHS.map((m) => (
          <div key={m} className="flex-1 text-center">
            <span className="text-[#666666] text-xs">{m}</span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

/* ───────────────────── Revenue Tracking ───────────────────── */
function RevenueTracking() {
  const totalGMV = REVENUE_DATA.reduce((sum, d) => sum + d.gmv, 0);
  const maxGMV = Math.max(...REVENUE_DATA.map((d) => d.gmv));

  return (
    <motion.div
      className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.06] rounded-2xl p-6 hover:border-white/[0.1] transition-all"
      variants={fadeUp}
      custom={1}
      initial="hidden"
      animate="visible"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <DollarSign className="w-5 h-5 text-[#C6FF34]" />
          <h3 className="text-white text-lg font-semibold">Revenue Tracking</h3>
        </div>
        <div className="text-right">
          <p className="text-[#666666] text-xs">Total GMV (6 months)</p>
          <p className="text-[#C6FF34] text-xl font-semibold">
            ZMW {totalGMV.toLocaleString()}
          </p>
        </div>
      </div>

      <div className="flex items-end gap-3 h-40 mb-4">
        {REVENUE_DATA.map((d, i) => (
          <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
            <div className="w-full bg-white/[0.03] rounded-t-lg relative h-32 overflow-hidden">
              <motion.div
                className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-[#C6FF34] to-[#C6FF34]/60 rounded-t-lg"
                initial={{ height: 0 }}
                animate={{ height: `${(d.gmv / maxGMV) * 100}%` }}
                transition={{ delay: i * 0.1 + 0.3, duration: 0.6, ease: [0.19, 1, 0.22, 1] }}
              />
              <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-[#1a1a1a] border border-white/10 text-white text-xs px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                ZMW {d.gmv.toLocaleString()}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex gap-3">
        {REVENUE_DATA.map((d) => (
          <div key={d.month} className="flex-1 text-center">
            <span className="text-[#666666] text-xs">{d.month}</span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

/* ───────────────────── Top Countries ───────────────────── */
function TopCountriesChart() {
  const maxUsers = Math.max(...TOP_COUNTRIES.map((c) => c.users));

  return (
    <motion.div
      className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.06] rounded-2xl p-6 hover:border-white/[0.1] transition-all"
      variants={fadeUp}
      custom={2}
      initial="hidden"
      animate="visible"
    >
      <div className="flex items-center gap-2 mb-6">
        <Globe className="w-5 h-5 text-[#7E3BED]" />
        <h3 className="text-white text-lg font-semibold">Top Countries</h3>
      </div>

      <div className="space-y-4">
        {TOP_COUNTRIES.map((c, i) => (
          <div key={i}>
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-2">
                <span className="text-white text-sm">{c.country}</span>
              </div>
              <span className="text-[#666666] text-xs">{c.users} users</span>
            </div>
            <div className="w-full bg-white/[0.04] rounded-full h-2.5 overflow-hidden">
              <motion.div
                className="h-full rounded-full"
                style={{ backgroundColor: c.color }}
                initial={{ width: 0 }}
                animate={{ width: `${(c.users / maxUsers) * 100}%` }}
                transition={{ delay: i * 0.1 + 0.3, duration: 0.6, ease: [0.19, 1, 0.22, 1] }}
              />
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

/* ───────────────────── User Retention Cohort ───────────────────── */
function UserRetentionCohort() {
  const weekLabels = ['W1', 'W2', 'W3', 'W4', 'W5', 'W6'];

  const getColor = (value: number | null) => {
    if (value === null) return 'bg-transparent';
    if (value >= 85) return 'bg-[#C6FF34]/80';
    if (value >= 70) return 'bg-[#C6FF34]/50';
    if (value >= 55) return 'bg-[#C6FF34]/30';
    if (value >= 40) return 'bg-[#C6FF34]/15';
    return 'bg-white/[0.04]';
  };

  const getTextColor = (value: number | null) => {
    if (value === null) return 'text-transparent';
    if (value >= 55) return 'text-black';
    return 'text-white';
  };

  return (
    <motion.div
      className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.06] rounded-2xl p-6 hover:border-white/[0.1] transition-all"
      variants={fadeUp}
      custom={3}
      initial="hidden"
      animate="visible"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Layers className="w-5 h-5 text-[#3B82F6]" />
          <h3 className="text-white text-lg font-semibold">User Retention</h3>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[#666666] text-xs">Cohort analysis</span>
        </div>
      </div>

      {/* Week header */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        <div className="text-[#666666] text-[10px] uppercase">Cohort</div>
        {weekLabels.map((w) => (
          <div key={w} className="text-center text-[#666666] text-[10px] uppercase">
            {w}
          </div>
        ))}
      </div>

      {/* Cohort rows */}
      <div className="space-y-1">
        {USER_RETENTION.map((cohort, i) => (
          <motion.div
            key={cohort.cohort}
            className="grid grid-cols-7 gap-1"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 + 0.2, duration: 0.3 }}
          >
            <div className="flex items-center">
              <span className="text-[#A0A0A0] text-[10px]">{cohort.cohort}</span>
            </div>
            {cohort.weeks.map((val, j) => (
              <div
                key={j}
                className={`h-8 rounded-md flex items-center justify-center text-[10px] font-medium transition-all hover:scale-110 cursor-default ${getColor(val)} ${getTextColor(val)}`}
                title={val !== null ? `${val}% retained` : 'No data'}
              >
                {val !== null ? `${val}%` : ''}
              </div>
            ))}
      </motion.div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-3 mt-4 pt-3 border-t border-white/[0.04]">
        <span className="text-[#666666] text-[10px]">Retention:</span>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-sm bg-white/[0.04]" />
          <span className="text-[#666666] text-[10px]">&lt;40%</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-sm bg-[#C6FF34]/15" />
          <span className="text-[#666666] text-[10px]">40-55%</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-sm bg-[#C6FF34]/30" />
          <span className="text-[#666666] text-[10px]">55-70%</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-sm bg-[#C6FF34]/50" />
          <span className="text-[#666666] text-[10px]">70-85%</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-sm bg-[#C6FF34]/80" />
          <span className="text-[#666666] text-[10px]">85%+</span>
        </div>
      </div>
    </motion.div>
  );
}

/* ───────────────────── Admin Analytics Section ───────────────────── */
function AdminAnalyticsSection() {
  return (
    <div className="space-y-6">
      {/* KPI Cards for Analytics */}
      <motion.div
        className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4"
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
      >
        {[
          {
            title: 'Total Users',
            value: '480',
            subtitle: 'Talent + Employers',
            icon: Users,
            color: '#C6FF34',
          },
          {
            title: 'Total GMV',
            value: 'ZMW 173,200',
            subtitle: '6-month revenue',
            icon: DollarSign,
            color: '#7E3BED',
          },
          {
            title: 'Active Jobs',
            value: '82',
            subtitle: 'Currently posted',
            icon: Briefcase,
            color: '#3B82F6',
          },
          {
            title: 'Avg Retention',
            value: '68%',
            subtitle: 'Week 4 retention',
            icon: Activity,
            color: '#C6FF34',
          },
        ].map((stat, i) => (
          <StatCard key={stat.title} {...stat} index={i} />
        ))}
      </motion.div>

      {/* Charts Row 1 */}
      <div className="grid lg:grid-cols-2 gap-6">
        <PlatformGrowthChart />
        <RevenueTracking />
      </div>

      {/* Charts Row 2 */}
      <div className="grid lg:grid-cols-2 gap-6">
        <TopCountriesChart />
        <UserRetentionCohort />
      </div>
    </div>
  );
}

/* ───────────────────── Access Denied ───────────────────── */
function AccessDenied() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.06] rounded-2xl p-8 max-w-md w-full mx-4 text-center"
      >
        <div className="w-16 h-16 rounded-2xl bg-[#ef4444]/10 flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="w-8 h-8 text-[#ef4444]" />
        </div>
        <h1 className="text-white text-xl font-semibold mb-2">Access Denied</h1>
        <p className="text-[#666666] text-sm mb-6">
          You do not have permission to access the admin panel. Please contact your administrator if you believe this is an error.
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 bg-[#C6FF34] text-black px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-[#d4ff5c] transition-colors"
        >
          Go Home
        </Link>
      </motion.div>
    </div>
  );
}

/* ───────────────────── Admin Page ───────────────────── */
type AdminTab =
  | 'overview'
  | 'analytics'
  | 'users'
  | 'recruiters'
  | 'employers'
  | 'candidates'
  | 'jobs'
  | 'applications'
  | 'champion-apps'
  | 'levav28'
  | 'quickwork'
  | 'courses'
  | 'universities'
  | 'payments'
  | 'subscriptions'
  | 'notifications'
  | 'reports'
  | 'moderation'
  | 'support'
  | 'content'
  | 'settings'
  | 'roles'
  | 'audit';

export default function Admin() {
  const { user, isLoading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');

  // Show loading state
  if (authLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center gap-4"
        >
          <Loader2 className="h-8 w-8 animate-spin text-[#C6FF34]" />
          <p className="text-sm text-[#A0A0A0]">Loading...</p>
        </motion.div>
      </div>
    );
  }

  // Check admin role — if no user or not admin, show access denied
  const isAdmin = user?.role === 'admin';
  if (!isAdmin) {
    return <AccessDenied />;
  }

  const tabs: { key: AdminTab; label: string; icon: React.ElementType }[] = [
    { key: 'overview', label: 'Overview', icon: BarChart3 },
    { key: 'analytics', label: 'Analytics', icon: Activity },
    { key: 'users', label: 'Users', icon: Users },
    { key: 'recruiters', label: 'Recruiters', icon: Briefcase },
    { key: 'employers', label: 'Employers', icon: Building2 },
    { key: 'candidates', label: 'Candidates', icon: Users },
    { key: 'jobs', label: 'Jobs', icon: Briefcase },
    { key: 'applications', label: 'Applications', icon: Mail },
    { key: 'champion-apps', label: 'Champion Apps', icon: Trophy },
    { key: 'levav28', label: 'Levav 28', icon: Layers },
    { key: 'quickwork', label: 'QuickWork', icon: Briefcase },
    { key: 'courses', label: 'Courses', icon: Layers },
    { key: 'universities', label: 'Universities', icon: Globe },
    { key: 'payments', label: 'Payments', icon: DollarSign },
    { key: 'subscriptions', label: 'Subscriptions', icon: Activity },
    { key: 'notifications', label: 'Notifications', icon: Mail },
    { key: 'reports', label: 'Reports', icon: BarChart3 },
    { key: 'moderation', label: 'Moderation', icon: ShieldCheck },
    { key: 'support', label: 'Support', icon: Mail },
    { key: 'content', label: 'Content', icon: Layers },
    { key: 'settings', label: 'Settings', icon: Layers },
    { key: 'roles', label: 'Roles', icon: ShieldCheck },
    { key: 'audit', label: 'Audit Logs', icon: Activity },
  ];

  return (
    <div className="min-h-screen bg-black">
      {/* Admin Header */}
      <header className="h-16 bg-black/50 backdrop-blur-xl border-b border-white/[0.06] flex items-center justify-between px-6 sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#C6FF34]/10 border border-[#C6FF34]/20 flex items-center justify-center">
            <ShieldCheck className="w-4.5 h-4.5 text-[#C6FF34]" />
          </div>
          <div>
            <h1 className="text-white text-sm font-semibold">Admin Panel</h1>
            <p className="text-[#666666] text-xs">Platform management</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {/* Tab Switcher — horizontally scrollable */}
          <div className="flex items-center bg-white/[0.04] border border-white/[0.08] rounded-xl p-0.5 mr-3 overflow-x-auto scrollbar-hide max-w-[50vw]">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap flex-shrink-0 ${
                    activeTab === tab.key
                      ? 'bg-[#C6FF34] text-black'
                      : 'text-[#A0A0A0] hover:text-white'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5 flex-shrink-0" />
                  <span className="hidden md:inline">{tab.label}</span>
                </button>
              );
            })}
          </div>
          <span className="text-[#666666] text-xs hidden sm:inline">
            Signed in as {user?.name ?? user?.email ?? 'Admin'}
          </span>
          <span className="bg-[#C6FF34]/10 text-[#C6FF34] text-xs font-medium px-2.5 py-1 rounded-lg capitalize">
            {user?.role}
          </span>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-6 space-y-6 max-w-7xl mx-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3, ease: [0.19, 1, 0.22, 1] }}
          >
            {activeTab === 'overview' && (
              <>
                <div className="mb-6">
                  <h1 className="text-white text-2xl font-semibold mb-1">Platform Overview</h1>
                  <p className="text-[#666666] text-sm">Monitor employer verifications, job postings, and applications.</p>
                </div>
                <StatsOverview />
                <div className="mt-6"><PendingVerifications /></div>
                <div className="mt-6"><AllEmployers /></div>
                <div className="mt-6"><RecentApplications /></div>
              </>
            )}
            {activeTab === 'analytics' && (
              <>
                <div className="mb-6">
                  <h1 className="text-white text-2xl font-semibold mb-1">Platform Analytics</h1>
                  <p className="text-[#666666] text-sm">Deep insights into platform growth, revenue, and user engagement.</p>
                </div>
                <AdminAnalyticsSection />
              </>
            )}
            {activeTab === 'users' && <UsersSection />}
            {activeTab === 'recruiters' && <RecruitersSection />}
            {activeTab === 'employers' && <EmployersSection />}
            {activeTab === 'candidates' && <CandidatesSection />}
            {activeTab === 'jobs' && <JobsSection />}
            {activeTab === 'applications' && <ApplicationsSection />}
            {activeTab === 'champion-apps' && <ChampionApplicationsSection />}
            {activeTab === 'levav28' && <Levav28Section />}
            {activeTab === 'quickwork' && <QuickWorkSection />}
            {activeTab === 'courses' && <CoursesSection />}
            {activeTab === 'universities' && <UniversitySection />}
            {activeTab === 'payments' && <PaymentsSection />}
            {activeTab === 'subscriptions' && <SubscriptionsSection />}
            {activeTab === 'notifications' && <NotificationsSection />}
            {activeTab === 'reports' && <ReportsSection />}
            {activeTab === 'moderation' && <ModerationSection />}
            {activeTab === 'support' && <SupportSection />}
            {activeTab === 'content' && <ContentMgmtSection />}
            {activeTab === 'settings' && <SettingsSection />}
            {activeTab === 'roles' && <RolesSection />}
            {activeTab === 'audit' && <AuditSection />}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
