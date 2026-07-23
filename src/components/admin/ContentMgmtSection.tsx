import { motion } from "framer-motion";
import {
  Layers,
  Globe,
  FileEdit,
  Clock,
  Search,
  Home,
  Briefcase,
  Users,
  Shield,
  FileText,
  Settings,
  ChevronRight,
  type LucideIcon,
} from "lucide-react";
import { useState } from "react";

interface ContentRow {
  id: string;
  page: string;
  type: "Homepage" | "Jobs" | "Talent" | "Champions" | "About" | "Legal" | "Settings";
  author: string;
  status: "Published" | "Draft";
  lastModified: string;
}

const contentData: ContentRow[] = [
  { id: "1", page: "Homepage Hero", type: "Homepage", author: "Admin", status: "Published", lastModified: "2024-06-18 10:30" },
  { id: "2", page: "How It Works", type: "Homepage", author: "Jane M.", status: "Published", lastModified: "2024-06-17 14:15" },
  { id: "3", page: "Job Categories", type: "Jobs", author: "Chola K.", status: "Published", lastModified: "2024-06-16 09:00" },
  { id: "4", page: "Featured Employers", type: "Jobs", author: "Admin", status: "Published", lastModified: "2024-06-15 16:45" },
  { id: "5", page: "Talent Profiles Guide", type: "Talent", author: "Bwalya C.", status: "Draft", lastModified: "2024-06-14 11:20" },
  { id: "6", page: "Champion Program", type: "Champions", author: "Mumba K.", status: "Published", lastModified: "2024-06-13 13:00" },
  { id: "7", page: "About Us", type: "About", author: "Admin", status: "Published", lastModified: "2024-06-12 10:00" },
  { id: "8", page: "Privacy Policy v2", type: "Legal", author: "Legal Team", status: "Draft", lastModified: "2024-06-11 15:30" },
  { id: "9", page: "Terms of Service", type: "Legal", author: "Legal Team", status: "Published", lastModified: "2024-06-10 09:45" },
  { id: "10", page: "Email Templates", type: "Settings", author: "Admin", status: "Published", lastModified: "2024-06-18 08:00" },
];

const typeConfig: Record<string, { icon: LucideIcon; color: string }> = {
  Homepage: { icon: Home, color: "text-blue-400" },
  Jobs: { icon: Briefcase, color: "text-[#C6FF34]" },
  Talent: { icon: Users, color: "text-purple-400" },
  Champions: { icon: Shield, color: "text-orange-400" },
  About: { icon: FileText, color: "text-pink-400" },
  Legal: { icon: FileText, color: "text-red-400" },
  Settings: { icon: Settings, color: "text-[#A0A0A0]" },
};

const kpis = [
  { label: "Total Pages", value: "24", icon: Layers, change: "+3 this month" },
  { label: "Published", value: "18", icon: Globe, change: "75% published" },
  { label: "Draft", value: "4", icon: FileEdit, change: "Needs review" },
  { label: "Last Updated", value: "2h ago", icon: Clock, change: "Homepage Hero" },
];

export default function ContentMgmtSection() {
  const [search, setSearch] = useState("");

  const filtered = contentData.filter(
    (r) =>
      r.page.toLowerCase().includes(search.toLowerCase()) ||
      r.type.toLowerCase().includes(search.toLowerCase()) ||
      r.author.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <motion.h2 className="text-2xl font-semibold text-white" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        Content Management
      </motion.h2>

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
          placeholder="Search by page, type, or author..."
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
                <th className="text-left px-6 py-4 text-[#A0A0A0] font-medium">Page / Section</th>
                <th className="text-left px-6 py-4 text-[#A0A0A0] font-medium">Type</th>
                <th className="text-left px-6 py-4 text-[#A0A0A0] font-medium">Author</th>
                <th className="text-left px-6 py-4 text-[#A0A0A0] font-medium">Status</th>
                <th className="text-left px-6 py-4 text-[#A0A0A0] font-medium">Last Modified</th>
                <th className="text-left px-6 py-4 text-[#A0A0A0] font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {filtered.map((row) => {
                const typeCfg = typeConfig[row.type];
                const TypeIcon = typeCfg?.icon || FileText;
                return (
                  <tr key={row.id} className="hover:bg-white/[0.02] transition-colors cursor-pointer">
                    <td className="px-6 py-4 text-white font-medium">{row.page}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 ${typeCfg?.color || "text-[#A0A0A0]"}`}>
                        <TypeIcon className="w-4 h-4" />
                        {row.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-[#A0A0A0]">{row.author}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${
                          row.status === "Published"
                            ? "bg-[#C6FF34]/10 text-[#C6FF34]"
                            : "bg-yellow-400/10 text-yellow-400"
                        }`}
                      >
                        {row.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-[#A0A0A0]">{row.lastModified}</td>
                    <td className="px-6 py-4">
                      <button className="p-1.5 rounded-lg hover:bg-white/[0.06] transition-colors">
                        <ChevronRight className="w-4 h-4 text-[#A0A0A0]" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="px-6 py-12 text-center text-[#666666]">No pages found.</div>
        )}
      </motion.div>
    </div>
  );
}
