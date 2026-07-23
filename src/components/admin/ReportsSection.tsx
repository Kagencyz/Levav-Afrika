import { motion } from "framer-motion";
import {
  FileText,
  Calendar,
  Download,
  Share2,
  Search,
  Plus,
  FileSpreadsheet,
  FilePieChart,
  FileBarChart,
  MoreHorizontal,
  Trash2,
  type LucideIcon,
} from "lucide-react";
import { useState } from "react";

interface ReportRow {
  id: string;
  name: string;
  type: "Analytics" | "Financial" | "User" | "Performance";
  generatedBy: string;
  date: string;
  format: "PDF" | "CSV" | "Excel";
}

const reportsData: ReportRow[] = [
  { id: "1", name: "Monthly User Growth", type: "User", generatedBy: "Admin", date: "2024-06-18", format: "PDF" },
  { id: "2", name: "Q2 Revenue Report", type: "Financial", generatedBy: "Finance", date: "2024-06-17", format: "Excel" },
  { id: "3", name: "Platform Analytics", type: "Analytics", generatedBy: "Admin", date: "2024-06-16", format: "PDF" },
  { id: "4", name: "Champion Performance", type: "Performance", generatedBy: "Ops", date: "2024-06-15", format: "CSV" },
  { id: "5", name: "Subscription Metrics", type: "Financial", generatedBy: "Admin", date: "2024-06-14", format: "Excel" },
  { id: "6", name: "Job Posting Trends", type: "Analytics", generatedBy: "Marketing", date: "2024-06-13", format: "PDF" },
  { id: "7", name: "Talent Pipeline Report", type: "Performance", generatedBy: "Recruiter", date: "2024-06-12", format: "CSV" },
  { id: "8", name: "Weekly Activity Summary", type: "Analytics", generatedBy: "System", date: "2024-06-11", format: "PDF" },
];

const typeConfig: Record<string, { icon: LucideIcon; color: string }> = {
  Analytics: { icon: FilePieChart, color: "text-purple-400" },
  Financial: { icon: FileSpreadsheet, color: "text-green-400" },
  User: { icon: FileBarChart, color: "text-blue-400" },
  Performance: { icon: FileText, color: "text-[#C6FF34]" },
};

const formatConfig: Record<string, { bg: string; color: string }> = {
  PDF: { bg: "bg-red-400/10", color: "text-red-400" },
  CSV: { bg: "bg-green-400/10", color: "text-green-400" },
  Excel: { bg: "bg-emerald-400/10", color: "text-emerald-400" },
};

const kpis = [
  { label: "Generated", value: "48", icon: FileText, change: "+6 this month" },
  { label: "Scheduled", value: "8", icon: Calendar, change: "Next: Tomorrow" },
  { label: "Downloaded", value: "342", icon: Download, change: "+52 this week" },
  { label: "Shared", value: "56", icon: Share2, change: "+12 this month" },
];

export default function ReportsSection() {
  const [search, setSearch] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState<string | null>(null);

  const filtered = reportsData.filter(
    (r) =>
      r.name.toLowerCase().includes(search.toLowerCase()) ||
      r.type.toLowerCase().includes(search.toLowerCase()) ||
      r.generatedBy.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <motion.h2 className="text-2xl font-semibold text-white" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          Reports
        </motion.h2>
        <motion.button
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="inline-flex items-center gap-2 bg-[#C6FF34] text-black px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-[#b8f030] transition-colors"
        >
          <Plus className="w-4 h-4" />
          Generate Report
        </motion.button>
      </div>

      {/* KPIs */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((kpi, i) => {
          const Icon = kpi.icon;
          return (
            <motion.div
              key={kpi.label}
              className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.06] rounded-2xl p-6"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05, duration: 0.3 }}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-[#A0A0A0]">{kpi.label}</span>
                <Icon className="w-5 h-5 text-[#C6FF34]" />
              </div>
              <div className="text-2xl font-bold text-white">{kpi.value}</div>
              <div className="text-xs text-[#666666] mt-1">{kpi.change}</div>
            </motion.div>
          );
        })}
      </div>

      {/* Search */}
      <motion.div className="relative" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#666666]" />
        <input
          type="text"
          placeholder="Search by report name, type, or author..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-white/[0.03] border border-white/[0.06] rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder-[#666666] focus:outline-none focus:border-[#C6FF34]/30"
        />
      </motion.div>

      {/* Table */}
      <motion.div
        className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.06] rounded-2xl overflow-hidden"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25, duration: 0.3 }}
      >
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/[0.06]">
                <th className="text-left px-6 py-4 text-[#A0A0A0] font-medium">Report Name</th>
                <th className="text-left px-6 py-4 text-[#A0A0A0] font-medium">Type</th>
                <th className="text-left px-6 py-4 text-[#A0A0A0] font-medium">Generated By</th>
                <th className="text-left px-6 py-4 text-[#A0A0A0] font-medium">Date</th>
                <th className="text-left px-6 py-4 text-[#A0A0A0] font-medium">Format</th>
                <th className="text-left px-6 py-4 text-[#A0A0A0] font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {filtered.map((row) => {
                const typeCfg = typeConfig[row.type];
                const TypeIcon = typeCfg?.icon || FileText;
                const fmtCfg = formatConfig[row.format];
                return (
                  <tr key={row.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-4 text-white font-medium">{row.name}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 ${typeCfg?.color || "text-[#A0A0A0]"}`}>
                        <TypeIcon className="w-4 h-4" />
                        {row.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-[#A0A0A0]">{row.generatedBy}</td>
                    <td className="px-6 py-4 text-[#A0A0A0]">{row.date}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${fmtCfg?.bg} ${fmtCfg?.color}`}>
                        {row.format}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="relative">
                        <button
                          onClick={() => setDropdownOpen(dropdownOpen === row.id ? null : row.id)}
                          className="p-1.5 rounded-lg hover:bg-white/[0.06] transition-colors"
                        >
                          <MoreHorizontal className="w-4 h-4 text-[#A0A0A0]" />
                        </button>
                        {dropdownOpen === row.id && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="absolute right-0 top-full mt-1 w-40 bg-[#1A1A1A] border border-white/[0.08] rounded-xl shadow-xl z-10 overflow-hidden"
                          >
                            <button className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-[#A0A0A0] hover:bg-white/[0.04] hover:text-white transition-colors">
                              <Download className="w-4 h-4" /> Download
                            </button>
                            <button className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-[#A0A0A0] hover:bg-white/[0.04] hover:text-white transition-colors">
                              <Share2 className="w-4 h-4" /> Share
                            </button>
                            <button className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-400 hover:bg-red-400/10 transition-colors">
                              <Trash2 className="w-4 h-4" /> Delete
                            </button>
                          </motion.div>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="px-6 py-12 text-center text-[#666666]">No reports found.</div>
        )}
      </motion.div>
    </div>
  );
}
