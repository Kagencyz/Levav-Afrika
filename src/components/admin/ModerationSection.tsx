import { motion } from "framer-motion";
import {
  Flag,
  Eye,
  CheckCircle2,
  AlertTriangle,
  Search,
  MessageSquare,
  FileText,
  UserCircle,
  Image,
  ShieldCheck,
  ShieldX,
  ArrowUpCircle,
  type LucideIcon,
} from "lucide-react";
import { useState } from "react";

interface ModerationRow {
  id: string;
  content: string;
  type: "Post" | "Comment" | "Profile" | "Message";
  reportedBy: string;
  reason: string;
  status: "Under Review" | "Resolved" | "Escalated";
}

const moderationData: ModerationRow[] = [
  { id: "1", content: "Job posting with misleading salary", type: "Post", reportedBy: "Jane M.", reason: "Misleading info", status: "Under Review" },
  { id: "2", content: "Inappropriate profile picture", type: "Profile", reportedBy: "Admin", reason: "NSFW content", status: "Escalated" },
  { id: "3", content: "Spam comment on multiple jobs", type: "Comment", reportedBy: "Chola K.", reason: "Spam", status: "Under Review" },
  { id: "4", content: "Fake company listing", type: "Post", reportedBy: "Bwalya C.", reason: "Fraudulent", status: "Resolved" },
  { id: "5", content: "Harassment in direct messages", type: "Message", reportedBy: "Mumba K.", reason: "Harassment", status: "Escalated" },
  { id: "6", content: "Duplicate job postings", type: "Post", reportedBy: "System", reason: "Duplicate", status: "Resolved" },
  { id: "7", content: "Offensive language in bio", type: "Profile", reportedBy: "Natasha L.", reason: "Offensive", status: "Under Review" },
  { id: "8", content: "Promotional content in forum", type: "Comment", reportedBy: "Admin", reason: "Spam", status: "Resolved" },
];

const typeConfig: Record<string, { icon: LucideIcon; color: string }> = {
  Post: { icon: FileText, color: "text-blue-400" },
  Comment: { icon: MessageSquare, color: "text-purple-400" },
  Profile: { icon: UserCircle, color: "text-[#C6FF34]" },
  Message: { icon: MessageSquare, color: "text-orange-400" },
};

const statusConfig: Record<string, { color: string; bg: string }> = {
  "Under Review": { color: "text-yellow-400", bg: "bg-yellow-400/10" },
  Resolved: { color: "text-[#C6FF34]", bg: "bg-[#C6FF34]/10" },
  Escalated: { color: "text-red-400", bg: "bg-red-400/10" },
};

const kpis = [
  { label: "Flagged Content", value: "24", icon: Flag, change: "+6 this week" },
  { label: "Under Review", value: "8", icon: Eye, change: "Oldest: 2 days" },
  { label: "Resolved", value: "156", icon: CheckCircle2, change: "+23 this month" },
  { label: "Escalated", value: "3", icon: AlertTriangle, change: "Needs attention" },
];

export default function ModerationSection() {
  const [search, setSearch] = useState("");

  const filtered = moderationData.filter(
    (r) =>
      r.content.toLowerCase().includes(search.toLowerCase()) ||
      r.reportedBy.toLowerCase().includes(search.toLowerCase()) ||
      r.reason.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <motion.h2 className="text-2xl font-semibold text-white" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        Moderation
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
          placeholder="Search by content, reporter, or reason..."
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
                <th className="text-left px-6 py-4 text-[#A0A0A0] font-medium">Content</th>
                <th className="text-left px-6 py-4 text-[#A0A0A0] font-medium">Type</th>
                <th className="text-left px-6 py-4 text-[#A0A0A0] font-medium">Reported By</th>
                <th className="text-left px-6 py-4 text-[#A0A0A0] font-medium">Reason</th>
                <th className="text-left px-6 py-4 text-[#A0A0A0] font-medium">Status</th>
                <th className="text-left px-6 py-4 text-[#A0A0A0] font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {filtered.map((row) => {
                const typeCfg = typeConfig[row.type];
                const TypeIcon = typeCfg?.icon || FileText;
                const stCfg = statusConfig[row.status];
                return (
                  <tr key={row.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-4 text-white max-w-xs truncate">{row.content}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 ${typeCfg?.color || "text-[#A0A0A0]"}`}>
                        <TypeIcon className="w-4 h-4" />
                        {row.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-[#A0A0A0]">{row.reportedBy}</td>
                    <td className="px-6 py-4 text-[#A0A0A0]">{row.reason}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${stCfg?.bg} ${stCfg?.color}`}>
                        {row.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1">
                        <button
                          title="Approve"
                          className="p-1.5 rounded-lg hover:bg-[#C6FF34]/10 transition-colors"
                        >
                          <ShieldCheck className="w-4 h-4 text-[#C6FF34]" />
                        </button>
                        <button
                          title="Remove"
                          className="p-1.5 rounded-lg hover:bg-red-400/10 transition-colors"
                        >
                          <ShieldX className="w-4 h-4 text-red-400" />
                        </button>
                        <button
                          title="Escalate"
                          className="p-1.5 rounded-lg hover:bg-orange-400/10 transition-colors"
                        >
                          <ArrowUpCircle className="w-4 h-4 text-orange-400" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="px-6 py-12 text-center text-[#666666]">No flagged content found.</div>
        )}
      </motion.div>
    </div>
  );
}
