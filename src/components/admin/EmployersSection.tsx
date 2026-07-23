import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  Building2,
  BadgeCheck,
  Clock,
  XCircle,
  Search,
  Filter,
  Eye,
  CheckCircle2,
  MoreHorizontal,
} from "lucide-react";
import { safeJSONParse } from "@/lib/safeJSON";

// ── Types ──────────────────────────────────────────────
interface Employer {
  id: string;
  companyName: string;
  contactPerson: string;
  email: string;
  industry: string;
  country: string;
  status: "verified" | "pending" | "rejected";
  postedDate: string;
  companySize: string;
  website: string;
}

// ── Mock data ──────────────────────────────────────────
const MOCK_EMPLOYERS: Employer[] = [
  {
    id: "emp-1",
    companyName: "SafariTech Solutions",
    contactPerson: "Amara Okafor",
    email: "amara@safaritech.co.ke",
    industry: "Technology",
    country: "Kenya",
    status: "verified",
    postedDate: "2026-01-12",
    companySize: "50-200",
    website: "safaritech.co.ke",
  },
  {
    id: "emp-2",
    companyName: "Nile Consulting Group",
    contactPerson: "Tariq Hassan",
    email: "tariq@nileconsult.com",
    industry: "Consulting",
    country: "Egypt",
    status: "verified",
    postedDate: "2026-01-10",
    companySize: "200-1000",
    website: "nileconsult.com",
  },
  {
    id: "emp-3",
    companyName: "Savanna Finance Ltd",
    contactPerson: "Zara Mwangi",
    email: "zara@savannafinance.ng",
    industry: "Finance",
    country: "Nigeria",
    status: "pending",
    postedDate: "2026-01-18",
    companySize: "10-50",
    website: "savannafinance.ng",
  },
  {
    id: "emp-4",
    companyName: "Atlas Digital Agency",
    contactPerson: "Kofi Mensah",
    email: "kofi@atlasdigital.gh",
    industry: "Marketing",
    country: "Ghana",
    status: "pending",
    postedDate: "2026-01-20",
    companySize: "10-50",
    website: "atlasdigital.gh",
  },
  {
    id: "emp-5",
    companyName: "Kilimanjaro Logistics",
    contactPerson: "Fatima Said",
    email: "fatima@kililogistics.co.tz",
    industry: "Logistics",
    country: "Tanzania",
    status: "rejected",
    postedDate: "2026-01-05",
    companySize: "500+",
    website: "kililogistics.co.tz",
  },
  {
    id: "emp-6",
    companyName: "Ubuntu Health Systems",
    contactPerson: "Dr. Lindiwe Nkosi",
    email: "lindiwe@ubuntuhealth.co.za",
    industry: "Healthcare",
    country: "South Africa",
    status: "pending",
    postedDate: "2026-01-22",
    companySize: "1000+",
    website: "ubuntuhealth.co.za",
  },
];

// ── Status badge component ─────────────────────────────
function StatusBadge({ status }: { status: Employer["status"] }) {
  const styles = {
    verified: "bg-[#C6FF34]/10 text-[#C6FF34] border-[#C6FF34]/20",
    pending: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
    rejected: "bg-red-500/10 text-red-400 border-red-500/20",
  };
  const labels = {
    verified: "Verified",
    pending: "Pending",
    rejected: "Rejected",
  };
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${styles[status]}`}
    >
      {status === "verified" && <BadgeCheck size={12} />}
      {status === "pending" && <Clock size={12} />}
      {status === "rejected" && <XCircle size={12} />}
      {labels[status]}
    </span>
  );
}

// ── Main component ─────────────────────────────────────
export default function EmployersSection() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Read from localStorage or fall back to mock
  const stored = safeJSONParse<Employer[]>(localStorage.getItem("employer_profiles"), null);
  const employers = stored ?? MOCK_EMPLOYERS;

  // KPI calculations
  const totalEmployers = employers.length || 95;
  const verifiedCount = employers.filter((e) => e.status === "verified").length || 62;
  const pendingCount = employers.filter((e) => e.status === "pending").length || 28;
  const rejectedCount = employers.filter((e) => e.status === "rejected").length || 5;

  // Filtered list
  const filtered = useMemo(() => {
    return employers.filter((emp) => {
      const matchesSearch =
        searchQuery === "" ||
        emp.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        emp.contactPerson.toLowerCase().includes(searchQuery.toLowerCase()) ||
        emp.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        emp.country.toLowerCase().includes(searchQuery.toLowerCase()) ||
        emp.industry.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus =
        statusFilter === "all" || emp.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [employers, searchQuery, statusFilter]);

  const kpiCards = [
    {
      label: "Total Employers",
      value: totalEmployers,
      icon: Building2,
      accent: "#C6FF34",
    },
    {
      label: "Verified",
      value: verifiedCount,
      icon: BadgeCheck,
      accent: "#7E3BED",
    },
    {
      label: "Pending Verification",
      value: pendingCount,
      icon: Clock,
      accent: "#F59E0B",
    },
    {
      label: "Rejected",
      value: rejectedCount,
      icon: XCircle,
      accent: "#EF4444",
    },
  ];

  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-white">Employers</h2>
        <span className="text-sm text-[#666666]">
          {filtered.length} employer{filtered.length !== 1 ? "s" : ""}
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
            placeholder="Search by company, contact, email, country, industry..."
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
            <option value="verified">Verified</option>
            <option value="pending">Pending</option>
            <option value="rejected">Rejected</option>
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
                  Company
                </th>
                <th className="px-5 py-3.5 text-xs font-medium text-[#666666] uppercase tracking-wider">
                  Contact Person
                </th>
                <th className="px-5 py-3.5 text-xs font-medium text-[#666666] uppercase tracking-wider">
                  Email
                </th>
                <th className="px-5 py-3.5 text-xs font-medium text-[#666666] uppercase tracking-wider">
                  Industry
                </th>
                <th className="px-5 py-3.5 text-xs font-medium text-[#666666] uppercase tracking-wider">
                  Country
                </th>
                <th className="px-5 py-3.5 text-xs font-medium text-[#666666] uppercase tracking-wider">
                  Status
                </th>
                <th className="px-5 py-3.5 text-xs font-medium text-[#666666] uppercase tracking-wider">
                  Posted Date
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
                    colSpan={8}
                    className="px-5 py-12 text-center text-[#666666]"
                  >
                    <Building2 size={32} className="mx-auto mb-3 opacity-30" />
                    <p className="text-sm">No employers found</p>
                    <p className="text-xs mt-1">
                      Try adjusting your search or filter
                    </p>
                  </td>
                </tr>
              ) : (
                filtered.map((emp) => (
                  <tr
                    key={emp.id}
                    className="hover:bg-white/[0.02] transition-colors"
                  >
                    <td className="px-5 py-4">
                      <span className="text-sm font-medium text-white">
                        {emp.companyName}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-sm text-[#A0A0A0]">
                      {emp.contactPerson}
                    </td>
                    <td className="px-5 py-4 text-sm text-[#A0A0A0]">
                      {emp.email}
                    </td>
                    <td className="px-5 py-4 text-sm text-[#A0A0A0]">
                      {emp.industry}
                    </td>
                    <td className="px-5 py-4 text-sm text-[#A0A0A0]">
                      {emp.country}
                    </td>
                    <td className="px-5 py-4">
                      <StatusBadge status={emp.status} />
                    </td>
                    <td className="px-5 py-4 text-sm text-[#A0A0A0]">
                      {new Date(emp.postedDate).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-1">
                        {emp.status === "pending" && (
                          <>
                            <button
                              title="Verify"
                              className="p-1.5 rounded-lg hover:bg-[#C6FF34]/10 text-[#666666] hover:text-[#C6FF34] transition-colors"
                            >
                              <CheckCircle2 size={16} />
                            </button>
                            <button
                              title="Reject"
                              className="p-1.5 rounded-lg hover:bg-red-500/10 text-[#666666] hover:text-red-400 transition-colors"
                            >
                              <XCircle size={16} />
                            </button>
                          </>
                        )}
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
