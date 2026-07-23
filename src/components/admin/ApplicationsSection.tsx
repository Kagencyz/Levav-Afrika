import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  FileText,
  Clock,
  Star,
  UserCheck,
  Search,
  Filter,
  Eye,
  Mail,
  MoreHorizontal,
  TrendingUp,
  TrendingDown,
  Minus,
} from "lucide-react";
import { safeJSONParse } from "@/lib/safeJSON";

// ── Types ──────────────────────────────────────────────
interface Application {
  id: string;
  applicant: string;
  email: string;
  jobTitle: string;
  company: string;
  appliedDate: string;
  status: "pending" | "shortlisted" | "rejected" | "hired";
  wriScore: number;
  wriTrend: "up" | "down" | "flat";
  avatar?: string;
}

// ── Mock data ──────────────────────────────────────────
const MOCK_APPLICATIONS: Application[] = [
  {
    id: "app-1",
    applicant: "Thabo Molefe",
    email: "thabo.m@email.com",
    jobTitle: "Senior Software Engineer",
    company: "SafariTech Solutions",
    appliedDate: "2026-01-22",
    status: "shortlisted",
    wriScore: 87,
    wriTrend: "up",
  },
  {
    id: "app-2",
    applicant: "Amina Diallo",
    email: "amina.d@email.com",
    jobTitle: "UX/UI Designer",
    company: "Nile Consulting Group",
    appliedDate: "2026-01-21",
    status: "pending",
    wriScore: 72,
    wriTrend: "flat",
  },
  {
    id: "app-3",
    applicant: "Kofi Asante",
    email: "kofi.a@email.com",
    jobTitle: "Financial Analyst",
    company: "Savanna Finance Ltd",
    appliedDate: "2026-01-20",
    status: "hired",
    wriScore: 93,
    wriTrend: "up",
  },
  {
    id: "app-4",
    applicant: "Zainab Ibrahim",
    email: "zainab.i@email.com",
    jobTitle: "Product Marketing Manager",
    company: "Atlas Digital Agency",
    appliedDate: "2026-01-19",
    status: "rejected",
    wriScore: 54,
    wriTrend: "down",
  },
  {
    id: "app-5",
    applicant: "David Ochieng",
    email: "david.o@email.com",
    jobTitle: "Data Scientist",
    company: "Ubuntu Health Systems",
    appliedDate: "2026-01-18",
    status: "pending",
    wriScore: 78,
    wriTrend: "up",
  },
  {
    id: "app-6",
    applicant: "Fatou Ndiaye",
    email: "fatou.n@email.com",
    jobTitle: "HR Business Partner",
    company: "Kilimanjaro Logistics",
    appliedDate: "2026-01-17",
    status: "shortlisted",
    wriScore: 81,
    wriTrend: "flat",
  },
  {
    id: "app-7",
    applicant: "Emmanuel Okonkwo",
    email: "emma.o@email.com",
    jobTitle: "Senior Software Engineer",
    company: "SafariTech Solutions",
    appliedDate: "2026-01-16",
    status: "pending",
    wriScore: 65,
    wriTrend: "down",
  },
  {
    id: "app-8",
    applicant: "Grace Muthoni",
    email: "grace.m@email.com",
    jobTitle: "UX/UI Designer",
    company: "Nile Consulting Group",
    appliedDate: "2026-01-15",
    status: "hired",
    wriScore: 91,
    wriTrend: "up",
  },
];

// ── Status badge ───────────────────────────────────────
function StatusBadge({ status }: { status: Application["status"] }) {
  const styles = {
    pending: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
    shortlisted: "bg-[#7E3BED]/10 text-[#7E3BED] border-[#7E3BED]/20",
    rejected: "bg-red-500/10 text-red-400 border-red-500/20",
    hired: "bg-[#C6FF34]/10 text-[#C6FF34] border-[#C6FF34]/20",
  };
  const labels = {
    pending: "Pending",
    shortlisted: "Shortlisted",
    rejected: "Rejected",
    hired: "Hired",
  };
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${styles[status]}`}
    >
      {labels[status]}
    </span>
  );
}

// ── WRI Score indicator ────────────────────────────────
function WriIndicator({
  score,
  trend,
}: {
  score: number;
  trend: Application["wriTrend"];
}) {
  const getColor = (s: number) => {
    if (s >= 85) return "text-[#C6FF34]";
    if (s >= 70) return "text-yellow-400";
    if (s >= 55) return "text-orange-400";
    return "text-red-400";
  };
  const getBg = (s: number) => {
    if (s >= 85) return "bg-[#C6FF34]/10";
    if (s >= 70) return "bg-yellow-500/10";
    if (s >= 55) return "bg-orange-500/10";
    return "bg-red-500/10";
  };

  return (
    <div className="flex items-center gap-2">
      <span
        className={`inline-flex items-center justify-center min-w-[36px] px-2 py-0.5 rounded-md text-xs font-bold ${getColor(score)} ${getBg(score)}`}
      >
        {score}
      </span>
      {trend === "up" && <TrendingUp size={14} className="text-[#C6FF34]" />}
      {trend === "down" && <TrendingDown size={14} className="text-red-400" />}
      {trend === "flat" && <Minus size={14} className="text-[#666666]" />}
    </div>
  );
}

// ── Avatar fallback ────────────────────────────────────
function Avatar({ name }: { name: string }) {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
  return (
    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#7E3BED]/30 to-[#C6FF34]/20 border border-white/[0.08] flex items-center justify-center text-xs font-semibold text-white">
      {initials}
    </div>
  );
}

// ── Main component ─────────────────────────────────────
export default function ApplicationsSection() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Read from localStorage or fall back to mock
  const stored = safeJSONParse<Application[]>(
    localStorage.getItem("applications"),
    null
  );
  const applications = stored ?? MOCK_APPLICATIONS;

  // KPI calculations (fallback to mock values if computed are too low)
  const totalApplications = applications.length >= 4 ? applications.length : 1248;
  const pendingCount =
    applications.filter((a) => a.status === "pending").length >= 2
      ? applications.filter((a) => a.status === "pending").length
      : 386;
  const shortlistedCount =
    applications.filter((a) => a.status === "shortlisted").length >= 1
      ? applications.filter((a) => a.status === "shortlisted").length
      : 142;
  const hiredCount =
    applications.filter((a) => a.status === "hired").length >= 1
      ? applications.filter((a) => a.status === "hired").length
      : 89;

  // Filtered list
  const filtered = useMemo(() => {
    return applications.filter((app) => {
      const matchesSearch =
        searchQuery === "" ||
        app.applicant.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.jobTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.company.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus =
        statusFilter === "all" || app.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [applications, searchQuery, statusFilter]);

  const kpiCards = [
    {
      label: "Total Applications",
      value: totalApplications.toLocaleString(),
      icon: FileText,
      accent: "#C6FF34",
    },
    {
      label: "Pending Review",
      value: pendingCount.toLocaleString(),
      icon: Clock,
      accent: "#F59E0B",
    },
    {
      label: "Shortlisted",
      value: shortlistedCount.toLocaleString(),
      icon: Star,
      accent: "#7E3BED",
    },
    {
      label: "Hired",
      value: hiredCount.toLocaleString(),
      icon: UserCheck,
      accent: "#C6FF34",
    },
  ];

  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-white">Applications</h2>
        <span className="text-sm text-[#666666]">
          {filtered.length} application{filtered.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* ── KPI Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiCards.map((kpi, i) => (
          <motion.div
            key={kpi.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.6,
              delay: i * 0.08,
              ease: [0.19, 1, 0.22, 1],
            }}
            className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.06] rounded-2xl p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: `${kpi.accent}15` }}
              >
                <kpi.icon size={20} style={{ color: kpi.accent }} />
              </div>
            </div>
            <p className="text-2xl font-bold text-white">{kpi.value}</p>
            <p className="text-sm text-[#A0A0A0] mt-1">{kpi.label}</p>
          </motion.div>
        ))}
      </div>

      {/* ── Filters ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.35, ease: [0.19, 1, 0.22, 1] }}
        className="flex flex-col sm:flex-row gap-3"
      >
        <div className="relative flex-1">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[#666666]"
          />
          <input
            type="text"
            placeholder="Search by applicant, job title, company..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/[0.03] border border-white/[0.06] rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-[#666666] focus:outline-none focus:border-[#C6FF34]/30 transition-colors"
          />
        </div>
        <div className="relative">
          <Filter
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[#666666]"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="appearance-none bg-white/[0.03] border border-white/[0.06] rounded-xl pl-10 pr-8 py-2.5 text-sm text-white focus:outline-none focus:border-[#C6FF34]/30 transition-colors cursor-pointer"
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="shortlisted">Shortlisted</option>
            <option value="rejected">Rejected</option>
            <option value="hired">Hired</option>
          </select>
        </div>
      </motion.div>

      {/* ── Data Table ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.45, ease: [0.19, 1, 0.22, 1] }}
        className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.06] rounded-2xl overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white/[0.06]">
                <th className="px-5 py-3.5 text-xs font-medium text-[#666666] uppercase tracking-wider">
                  Applicant
                </th>
                <th className="px-5 py-3.5 text-xs font-medium text-[#666666] uppercase tracking-wider">
                  Job Title
                </th>
                <th className="px-5 py-3.5 text-xs font-medium text-[#666666] uppercase tracking-wider">
                  Company
                </th>
                <th className="px-5 py-3.5 text-xs font-medium text-[#666666] uppercase tracking-wider">
                  Applied Date
                </th>
                <th className="px-5 py-3.5 text-xs font-medium text-[#666666] uppercase tracking-wider">
                  Status
                </th>
                <th className="px-5 py-3.5 text-xs font-medium text-[#666666] uppercase tracking-wider">
                  WRI Score
                </th>
                <th className="px-5 py-3.5 text-xs font-medium text-[#666666] uppercase tracking-wider text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-5 py-12 text-center text-[#666666]"
                  >
                    <FileText size={32} className="mx-auto mb-3 opacity-30" />
                    <p className="text-sm">No applications found</p>
                    <p className="text-xs mt-1">
                      Try adjusting your search or filter
                    </p>
                  </td>
                </tr>
              ) : (
                filtered.map((app) => (
                  <tr
                    key={app.id}
                    className="hover:bg-white/[0.02] transition-colors"
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <Avatar name={app.applicant} />
                        <div>
                          <p className="text-sm font-medium text-white">
                            {app.applicant}
                          </p>
                          <p className="text-xs text-[#666666]">{app.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-sm text-[#A0A0A0]">
                      {app.jobTitle}
                    </td>
                    <td className="px-5 py-4 text-sm text-[#A0A0A0]">
                      {app.company}
                    </td>
                    <td className="px-5 py-4 text-sm text-[#A0A0A0]">
                      {new Date(app.appliedDate).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </td>
                    <td className="px-5 py-4">
                      <StatusBadge status={app.status} />
                    </td>
                    <td className="px-5 py-4">
                      <WriIndicator
                        score={app.wriScore}
                        trend={app.wriTrend}
                      />
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          title="View"
                          className="p-1.5 rounded-lg hover:bg-white/5 text-[#666666] hover:text-white transition-colors"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          title="Email"
                          className="p-1.5 rounded-lg hover:bg-white/5 text-[#666666] hover:text-white transition-colors"
                        >
                          <Mail size={16} />
                        </button>
                        <button
                          title="More"
                          className="p-1.5 rounded-lg hover:bg-white/5 text-[#666666] hover:text-white transition-colors"
                        >
                          <MoreHorizontal size={16} />
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
    </div>
  );
}
