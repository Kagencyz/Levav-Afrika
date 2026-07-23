import { motion } from "framer-motion";
import { safeJSONParse } from "@/lib/safeJSON";
import {
  GraduationCap,
  BookOpen,
  Users,
  FlaskConical,
  Search,
  Eye,
  Mail,
} from "lucide-react";
import { useState } from "react";

const kpis = [
  {
    label: "Partner Universities",
    value: "12",
    icon: GraduationCap,
    accent: "#C6FF34",
  },
  {
    label: "Active Programs",
    value: "8",
    icon: BookOpen,
    accent: "#7E3BED",
  },
  {
    label: "Student Placements",
    value: "340",
    icon: Users,
    accent: "#C6FF34",
  },
  {
    label: "Research Projects",
    value: "6",
    icon: FlaskConical,
    accent: "#7E3BED",
  },
];

const universitiesData = [
  {
    name: "University of Lagos",
    country: "Nigeria",
    contact: "partnerships@unilag.edu.ng",
    programs: 3,
    students: 85,
    status: "Active",
  },
  {
    name: "University of Cape Town",
    country: "South Africa",
    contact: "intl@uct.ac.za",
    programs: 4,
    students: 72,
    status: "Active",
  },
  {
    name: "University of Ghana",
    country: "Ghana",
    contact: "collab@ug.edu.gh",
    programs: 2,
    students: 48,
    status: "Active",
  },
  {
    name: "Makerere University",
    country: "Uganda",
    contact: "partnerships@mak.ac.ug",
    programs: 2,
    students: 36,
    status: "Active",
  },
  {
    name: "University of Nairobi",
    country: "Kenya",
    contact: "international@uonbi.ac.ke",
    programs: 3,
    students: 54,
    status: "Active",
  },
  {
    name: "Addis Ababa University",
    country: "Ethiopia",
    contact: "global@aau.edu.et",
    programs: 1,
    students: 28,
    status: "Pending",
  },
];

const statusStyles: Record<string, string> = {
  Active: "bg-[#C6FF34]/10 text-[#C6FF34] border border-[#C6FF34]/20",
  Pending: "bg-[#7E3BED]/10 text-[#7E3BED] border border-[#7E3BED]/20",
};

export default function UniversitySection() {
  const [search, setSearch] = useState("");

  const filtered = universitiesData.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.country.toLowerCase().includes(search.toLowerCase()) ||
      u.contact.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Universities</h1>
          <p className="text-[#A0A0A0] text-sm mt-1">
            Partner universities and academic collaborations
          </p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#666666]" />
          <input
            type="text"
            placeholder="Search universities..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 pr-4 py-2 bg-white/[0.03] border border-white/[0.06] rounded-xl text-white placeholder-[#666666] text-sm focus:outline-none focus:border-[#C6FF34]/30 w-full sm:w-64"
          />
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

      {/* Universities Table */}
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
                  University
                </th>
                <th className="text-left text-[#666666] text-xs font-medium uppercase tracking-wider py-3 pr-4">
                  Country
                </th>
                <th className="text-left text-[#666666] text-xs font-medium uppercase tracking-wider py-3 pr-4">
                  Contact
                </th>
                <th className="text-left text-[#666666] text-xs font-medium uppercase tracking-wider py-3 pr-4">
                  Programs
                </th>
                <th className="text-left text-[#666666] text-xs font-medium uppercase tracking-wider py-3 pr-4">
                  Students
                </th>
                <th className="text-left text-[#666666] text-xs font-medium uppercase tracking-wider py-3 pr-4">
                  Status
                </th>
                <th className="text-left text-[#666666] text-xs font-medium uppercase tracking-wider py-3">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((row, idx) => (
                <motion.tr
                  key={row.name}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: idx * 0.04 }}
                  className="border-b border-white/[0.04] last:border-0 hover:bg-white/[0.02] transition-colors"
                >
                  <td className="py-3 pr-4">
                    <span className="text-white text-sm font-medium">
                      {row.name}
                    </span>
                  </td>
                  <td className="py-3 pr-4">
                    <span className="text-[#A0A0A0] text-sm">
                      {row.country}
                    </span>
                  </td>
                  <td className="py-3 pr-4">
                    <div className="flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-[#666666]" />
                      <span className="text-[#A0A0A0] text-sm">
                        {row.contact}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 pr-4">
                    <span className="text-white text-sm">
                      {row.programs}
                    </span>
                  </td>
                  <td className="py-3 pr-4">
                    <span className="text-[#A0A0A0] text-sm">
                      {row.students}
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
                  <td className="py-3">
                    <div className="flex items-center gap-1">
                      <button className="p-1.5 rounded-lg hover:bg-white/[0.06] transition-colors">
                        <Eye className="w-4 h-4 text-[#666666]" />
                      </button>
                      <button className="p-1.5 rounded-lg hover:bg-white/[0.06] transition-colors">
                        <Mail className="w-4 h-4 text-[#666666]" />
                      </button>
                    </div>
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
