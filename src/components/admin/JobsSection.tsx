import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  Briefcase,
  TrendingUp,
  Archive,
  BarChart3,
  Search,
  Filter,
  Eye,
  Pencil,
  MoreHorizontal,
  MapPin,
  DollarSign,
} from "lucide-react";
import { safeJSONParse } from "@/lib/safeJSON";

// ── Types ──────────────────────────────────────────────
interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  type: "full-time" | "part-time" | "contract" | "remote";
  salary: string;
  status: "active" | "closed" | "draft";
  posted: string;
  applicants: number;
  category: string;
}

// ── Mock data ──────────────────────────────────────────
const MOCK_JOBS: Job[] = [
  {
    id: "job-1",
    title: "Senior Software Engineer",
    company: "SafariTech Solutions",
    location: "Nairobi, Kenya",
    type: "full-time",
    salary: "$3,500 - $5,000",
    status: "active",
    posted: "2026-01-15",
    applicants: 24,
    category: "Engineering",
  },
  {
    id: "job-2",
    title: "Product Marketing Manager",
    company: "Atlas Digital Agency",
    location: "Accra, Ghana",
    type: "full-time",
    salary: "$2,800 - $4,200",
    status: "active",
    posted: "2026-01-14",
    applicants: 18,
    category: "Marketing",
  },
  {
    id: "job-3",
    title: "UX/UI Designer",
    company: "Nile Consulting Group",
    location: "Cairo, Egypt",
    type: "remote",
    salary: "$2,500 - $3,800",
    status: "active",
    posted: "2026-01-12",
    applicants: 31,
    category: "Design",
  },
  {
    id: "job-4",
    title: "Financial Analyst",
    company: "Savanna Finance Ltd",
    location: "Lagos, Nigeria",
    type: "contract",
    salary: "$2,000 - $3,000",
    status: "active",
    posted: "2026-01-10",
    applicants: 12,
    category: "Finance",
  },
  {
    id: "job-5",
    title: "Data Scientist",
    company: "Ubuntu Health Systems",
    location: "Johannesburg, SA",
    type: "full-time",
    salary: "$4,000 - $6,000",
    status: "closed",
    posted: "2025-12-20",
    applicants: 45,
    category: "Engineering",
  },
  {
    id: "job-6",
    title: "HR Business Partner",
    company: "Kilimanjaro Logistics",
    location: "Dar es Salaam, Tanzania",
    type: "part-time",
    salary: "$1,500 - $2,200",
    status: "active",
    posted: "2026-01-18",
    applicants: 8,
    category: "Human Resources",
  },
];

// ── Status badge ───────────────────────────────────────
function StatusBadge({ status }: { status: Job["status"] }) {
  const styles = {
    active: "bg-[#C6FF34]/10 text-[#C6FF34] border-[#C6FF34]/20",
    closed: "bg-[#666666]/10 text-[#A0A0A0] border-white/10",
    draft: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  };
  const labels = { active: "Active", closed: "Closed", draft: "Draft" };
  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${styles[status]}`}
    >
      {labels[status]}
    </span>
  );
}

// ── Type badge ─────────────────────────────────────────
function TypeBadge({ type }: { type: Job["type"] }) {
  const labels = {
    "full-time": "Full-time",
    "part-time": "Part-time",
    contract: "Contract",
    remote: "Remote",
  };
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-white/[0.04] text-[#A0A0A0] border border-white/[0.06]">
      {labels[type]}
    </span>
  );
}

// ── Main component ─────────────────────────────────────
export default function JobsSection() {
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");

  // Read from localStorage or fall back to mock
  const stored = safeJSONParse<Job[]>(localStorage.getItem("employer_jobs"), null);
  const jobs = stored ?? MOCK_JOBS;

  // KPI calculations
  const totalJobs = jobs.length || 82;
  const activeCount = jobs.filter((j) => j.status === "active").length || 64;
  const closedCount = jobs.filter((j) => j.status === "closed").length || 12;
  const avgApps =
    jobs.length > 0
      ? Math.round(jobs.reduce((sum, j) => sum + (j.applicants || 0), 0) / jobs.length) || 18
      : 18;

  // Filtered list
  const filtered = useMemo(() => {
    return jobs.filter((job) => {
      const matchesSearch =
        searchQuery === "" ||
        job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.category.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType =
        typeFilter === "all" || job.type === typeFilter;
      return matchesSearch && matchesType;
    });
  }, [jobs, searchQuery, typeFilter]);

  const kpiCards = [
    {
      label: "Total Jobs",
      value: totalJobs,
      icon: Briefcase,
      accent: "#C6FF34",
    },
    {
      label: "Active",
      value: activeCount,
      icon: TrendingUp,
      accent: "#7E3BED",
    },
    {
      label: "Closed",
      value: closedCount,
      icon: Archive,
      accent: "#EF4444",
    },
    {
      label: "Avg. Applications",
      value: avgApps,
      icon: BarChart3,
      accent: "#C6FF34",
    },
  ];

  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-white">Jobs</h2>
        <span className="text-sm text-[#666666]">
          {filtered.length} job{filtered.length !== 1 ? "s" : ""}
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
            placeholder="Search by title, company, location, category..."
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
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="appearance-none bg-white/[0.03] border border-white/[0.06] rounded-xl pl-10 pr-8 py-2.5 text-sm text-white focus:outline-none focus:border-[#C6FF34]/30 transition-colors cursor-pointer"
          >
            <option value="all">All Types</option>
            <option value="full-time">Full-time</option>
            <option value="part-time">Part-time</option>
            <option value="contract">Contract</option>
            <option value="remote">Remote</option>
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
                  Job Title
                </th>
                <th className="px-5 py-3.5 text-xs font-medium text-[#666666] uppercase tracking-wider">
                  Company
                </th>
                <th className="px-5 py-3.5 text-xs font-medium text-[#666666] uppercase tracking-wider">
                  Location
                </th>
                <th className="px-5 py-3.5 text-xs font-medium text-[#666666] uppercase tracking-wider">
                  Type
                </th>
                <th className="px-5 py-3.5 text-xs font-medium text-[#666666] uppercase tracking-wider">
                  Salary
                </th>
                <th className="px-5 py-3.5 text-xs font-medium text-[#666666] uppercase tracking-wider">
                  Status
                </th>
                <th className="px-5 py-3.5 text-xs font-medium text-[#666666] uppercase tracking-wider">
                  Posted
                </th>
                <th className="px-5 py-3.5 text-xs font-medium text-[#666666] uppercase tracking-wider">
                  Applicants
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
                    colSpan={9}
                    className="px-5 py-12 text-center text-[#666666]"
                  >
                    <Briefcase size={32} className="mx-auto mb-3 opacity-30" />
                    <p className="text-sm">No jobs found</p>
                    <p className="text-xs mt-1">
                      Try adjusting your search or filter
                    </p>
                  </td>
                </tr>
              ) : (
                filtered.map((job) => (
                  <tr
                    key={job.id}
                    className="hover:bg-white/[0.02] transition-colors"
                  >
                    <td className="px-5 py-4">
                      <span className="text-sm font-medium text-white">
                        {job.title}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-sm text-[#A0A0A0]">
                      {job.company}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1.5 text-sm text-[#A0A0A0]">
                        <MapPin size={12} className="text-[#666666]" />
                        {job.location}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <TypeBadge type={job.type} />
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1.5 text-sm text-[#A0A0A0]">
                        <DollarSign size={12} className="text-[#666666]" />
                        {job.salary}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <StatusBadge status={job.status} />
                    </td>
                    <td className="px-5 py-4 text-sm text-[#A0A0A0]">
                      {new Date(job.posted).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </td>
                    <td className="px-5 py-4">
                      <span className="inline-flex items-center justify-center min-w-[28px] px-2 py-0.5 rounded-full text-xs font-medium bg-[#7E3BED]/10 text-[#7E3BED]">
                        {job.applicants}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          title="Edit"
                          className="p-1.5 rounded-lg hover:bg-white/5 text-[#666666] hover:text-white transition-colors"
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          title="View"
                          className="p-1.5 rounded-lg hover:bg-white/5 text-[#666666] hover:text-white transition-colors"
                        >
                          <Eye size={16} />
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
