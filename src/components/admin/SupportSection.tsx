import { motion } from "framer-motion";
import {
  Inbox,
  CheckCircle2,
  Clock,
  ThumbsUp,
  Search,
  Mail,
  AlertCircle,
  Zap,
  ChevronRight,
  type LucideIcon,
} from "lucide-react";
import { useState } from "react";

interface SupportRow {
  id: string;
  ticketId: string;
  subject: string;
  user: string;
  priority: "Low" | "Medium" | "High" | "Critical";
  status: "Open" | "In Progress" | "Resolved" | "Closed";
  created: string;
}

const supportData: SupportRow[] = [
  { id: "1", ticketId: "TKT-00189", subject: "Cannot update profile picture", user: "Jane Mwamba", priority: "Medium", status: "Open", created: "2024-06-18" },
  { id: "2", ticketId: "TKT-00188", subject: "Payment not reflected", user: "Chola Mulenga", priority: "High", status: "In Progress", created: "2024-06-18" },
  { id: "3", ticketId: "TKT-00187", subject: "Job application error", user: "Mumba Kabwe", priority: "Critical", status: "Open", created: "2024-06-17" },
  { id: "4", ticketId: "TKT-00186", subject: "Password reset not working", user: "Bwalya Chileshe", priority: "Medium", status: "Resolved", created: "2024-06-17" },
  { id: "5", ticketId: "TKT-00185", subject: "Champion dashboard access", user: "Nchimunya Sosala", priority: "Low", status: "Closed", created: "2024-06-16" },
  { id: "6", ticketId: "TKT-00184", subject: "Subscription cancellation", user: "Zesco Holdings", priority: "High", status: "In Progress", created: "2024-06-16" },
  { id: "7", ticketId: "TKT-00183", subject: "Email notifications not received", user: "Fintech Zambia", priority: "Medium", status: "Open", created: "2024-06-15" },
  { id: "8", ticketId: "TKT-00182", subject: "Account verification pending", user: "Natasha Lungu", priority: "Low", status: "Resolved", created: "2024-06-15" },
];

const priorityConfig: Record<string, { color: string; icon: LucideIcon }> = {
  Low: { color: "text-[#A0A0A0]", icon: Mail },
  Medium: { color: "text-blue-400", icon: Clock },
  High: { color: "text-orange-400", icon: Zap },
  Critical: { color: "text-red-400", icon: AlertCircle },
};

const statusConfig: Record<string, { color: string; bg: string }> = {
  Open: { color: "text-blue-400", bg: "bg-blue-400/10" },
  "In Progress": { color: "text-yellow-400", bg: "bg-yellow-400/10" },
  Resolved: { color: "text-[#C6FF34]", bg: "bg-[#C6FF34]/10" },
  Closed: { color: "text-[#666666]", bg: "bg-white/[0.04]" },
};

const kpis = [
  { label: "Open Tickets", value: "18", icon: Inbox, change: "6 high priority" },
  { label: "Resolved Today", value: "8", icon: CheckCircle2, change: "+3 vs yesterday" },
  { label: "Avg Response", value: "2.4h", icon: Clock, change: "Target: <2h" },
  { label: "Satisfaction", value: "92%", icon: ThumbsUp, change: "+2% this month" },
];

export default function SupportSection() {
  const [search, setSearch] = useState("");

  const filtered = supportData.filter(
    (r) =>
      r.subject.toLowerCase().includes(search.toLowerCase()) ||
      r.user.toLowerCase().includes(search.toLowerCase()) ||
      r.ticketId.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <motion.h2 className="text-2xl font-semibold text-white" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        Support Tickets
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
          placeholder="Search by ticket ID, subject, or user..."
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
                <th className="text-left px-6 py-4 text-[#A0A0A0] font-medium">Ticket ID</th>
                <th className="text-left px-6 py-4 text-[#A0A0A0] font-medium">Subject</th>
                <th className="text-left px-6 py-4 text-[#A0A0A0] font-medium">User</th>
                <th className="text-left px-6 py-4 text-[#A0A0A0] font-medium">Priority</th>
                <th className="text-left px-6 py-4 text-[#A0A0A0] font-medium">Status</th>
                <th className="text-left px-6 py-4 text-[#A0A0A0] font-medium">Created</th>
                <th className="text-left px-6 py-4 text-[#A0A0A0] font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {filtered.map((row) => {
                const priCfg = priorityConfig[row.priority];
                const PriIcon = priCfg?.icon || Mail;
                const stCfg = statusConfig[row.status];
                return (
                  <tr key={row.id} className="hover:bg-white/[0.02] transition-colors cursor-pointer">
                    <td className="px-6 py-4 text-[#C6FF34] font-mono text-xs font-semibold">{row.ticketId}</td>
                    <td className="px-6 py-4 text-white font-medium">{row.subject}</td>
                    <td className="px-6 py-4 text-[#A0A0A0]">{row.user}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 ${priCfg?.color || "text-[#A0A0A0]"}`}>
                        <PriIcon className="w-4 h-4" />
                        {row.priority}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${stCfg?.bg} ${stCfg?.color}`}>
                        {row.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-[#A0A0A0]">{row.created}</td>
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
          <div className="px-6 py-12 text-center text-[#666666]">No tickets found.</div>
        )}
      </motion.div>
    </div>
  );
}
