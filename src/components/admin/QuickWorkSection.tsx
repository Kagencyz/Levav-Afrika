import { motion } from "framer-motion";
import { safeJSONParse } from "@/lib/safeJSON";
import {
  Briefcase,
  Clock,
  CheckCircle2,
  Star,
  Search,
  ChevronDown,
  MoreHorizontal,
  Eye,
} from "lucide-react";
import { useState } from "react";

const kpis = [
  { label: "Total Gigs", value: "342", icon: Briefcase, accent: "#C6FF34" },
  { label: "Active Gigs", value: "128", icon: Clock, accent: "#7E3BED" },
  {
    label: "Completed",
    value: "2,415",
    icon: CheckCircle2,
    accent: "#C6FF34",
  },
  { label: "Avg Rating", value: "4.7", icon: Star, accent: "#7E3BED" },
];

const categories = ["All", "Design", "Development", "Writing", "Marketing"];

const gigsData = [
  {
    title: "Brand Identity Design",
    category: "Design",
    budget: "$1,200",
    employer: "Nexus Africa",
    status: "Open",
    applicants: 14,
    rating: 4.8,
  },
  {
    title: "React Native Developer",
    category: "Development",
    budget: "$2,500",
    employer: "TechStart Ghana",
    status: "Assigned",
    applicants: 8,
    rating: 4.5,
  },
  {
    title: "Content Strategy & SEO",
    category: "Marketing",
    budget: "$800",
    employer: "GreenFields Co",
    status: "Completed",
    applicants: 22,
    rating: 4.9,
  },
  {
    title: "Technical Blog Writer",
    category: "Writing",
    budget: "$450",
    employer: "DevHub NG",
    status: "Open",
    applicants: 31,
    rating: 4.6,
  },
  {
    title: "Mobile App UI/UX",
    category: "Design",
    budget: "$1,800",
    employer: "FinTech Solutions",
    status: "Assigned",
    applicants: 11,
    rating: 4.7,
  },
  {
    title: "Backend API Development",
    category: "Development",
    budget: "$3,000",
    employer: "CloudScale Kenya",
    status: "Open",
    applicants: 6,
    rating: 4.4,
  },
];

const statusStyles: Record<string, string> = {
  Open: "bg-[#C6FF34]/10 text-[#C6FF34] border border-[#C6FF34]/20",
  Assigned:
    "bg-[#7E3BED]/10 text-[#7E3BED] border border-[#7E3BED]/20",
  Completed:
    "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
};

export default function QuickWorkSection() {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");

  const filtered = gigsData.filter((g) => {
    const matchesSearch =
      g.title.toLowerCase().includes(search.toLowerCase()) ||
      g.employer.toLowerCase().includes(search.toLowerCase());
    const matchesCategory =
      categoryFilter === "All" || g.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">QuickWork</h1>
          <p className="text-[#A0A0A0] text-sm mt-1">
            Freelance gigs and talent marketplace
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#666666]" />
            <input
              type="text"
              placeholder="Search gigs..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 pr-4 py-2 bg-white/[0.03] border border-white/[0.06] rounded-xl text-white placeholder-[#666666] text-sm focus:outline-none focus:border-[#C6FF34]/30 w-full sm:w-56"
            />
          </div>
          <div className="relative">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="appearance-none pl-4 pr-10 py-2 bg-white/[0.03] border border-white/[0.06] rounded-xl text-white text-sm focus:outline-none focus:border-[#C6FF34]/30 cursor-pointer"
            >
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#666666] pointer-events-none" />
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi, i) => (
          <motion.div
            key={kpi.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06, duration: 0.35 }}
            className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.06] rounded-2xl p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-[#A0A0A0] text-sm">{kpi.label}</span>
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: `${kpi.accent}15` }}
              >
                <kpi.icon className="w-5 h-5" style={{ color: kpi.accent }} />
              </div>
            </div>
            <div className="text-2xl font-bold text-white">{kpi.value}</div>
          </motion.div>
        ))}
      </div>

      {/* Gigs Table */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.35 }}
        className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.06] rounded-2xl p-6"
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/[0.06]">
                <th className="text-left text-[#666666] text-xs font-medium uppercase tracking-wider py-3 pr-4">
                  Gig Title
                </th>
                <th className="text-left text-[#666666] text-xs font-medium uppercase tracking-wider py-3 pr-4">
                  Category
                </th>
                <th className="text-left text-[#666666] text-xs font-medium uppercase tracking-wider py-3 pr-4">
                  Budget
                </th>
                <th className="text-left text-[#666666] text-xs font-medium uppercase tracking-wider py-3 pr-4">
                  Employer
                </th>
                <th className="text-left text-[#666666] text-xs font-medium uppercase tracking-wider py-3 pr-4">
                  Status
                </th>
                <th className="text-left text-[#666666] text-xs font-medium uppercase tracking-wider py-3 pr-4">
                  Applicants
                </th>
                <th className="text-left text-[#666666] text-xs font-medium uppercase tracking-wider py-3 pr-4">
                  Rating
                </th>
                <th className="text-left text-[#666666] text-xs font-medium uppercase tracking-wider py-3">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((row, idx) => (
                <motion.tr
                  key={row.title}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: idx * 0.04 }}
                  className="border-b border-white/[0.04] last:border-0 hover:bg-white/[0.02] transition-colors"
                >
                  <td className="py-3 pr-4">
                    <span className="text-white text-sm font-medium">
                      {row.title}
                    </span>
                  </td>
                  <td className="py-3 pr-4">
                    <span className="text-[#A0A0A0] text-sm">
                      {row.category}
                    </span>
                  </td>
                  <td className="py-3 pr-4">
                    <span className="text-[#C6FF34] text-sm font-medium">
                      {row.budget}
                    </span>
                  </td>
                  <td className="py-3 pr-4">
                    <span className="text-[#A0A0A0] text-sm">
                      {row.employer}
                    </span>
                  </td>
                  <td className="py-3 pr-4">
                    <span
                      className={`text-xs font-medium px-2.5 py-1 rounded-lg ${
                        statusStyles[row.status] || ""
                      }`}
                    >
                      {row.status}
                    </span>
                  </td>
                  <td className="py-3 pr-4">
                    <span className="text-[#A0A0A0] text-sm">
                      {row.applicants}
                    </span>
                  </td>
                  <td className="py-3 pr-4">
                    <div className="flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 text-[#C6FF34] fill-[#C6FF34]" />
                      <span className="text-[#A0A0A0] text-sm">
                        {row.rating}
                      </span>
                    </div>
                  </td>
                  <td className="py-3">
                    <button className="p-1.5 rounded-lg hover:bg-white/[0.06] transition-colors">
                      <Eye className="w-4 h-4 text-[#666666]" />
                    </button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
