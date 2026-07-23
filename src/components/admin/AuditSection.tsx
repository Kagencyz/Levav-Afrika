import { motion } from "framer-motion";
import {
  ScrollText,
  CalendarDays,
  AlertTriangle,
  AlertCircle,
  Search,
  User,
  LogIn,
  LogOut,
  Edit,
  Trash2,
  Shield,
  Database,
  CheckCircle2,
  XCircle,
  type LucideIcon,
} from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { getAuditLog, getAuditStats, type AuditEntry, type AuditStatus } from "@/lib/auditService";

// Map AuditEntry action to display config
const actionConfig: Record<string, { icon: LucideIcon; color: string }> = {
  login: { icon: LogIn, color: "text-blue-400" },
  logout: { icon: LogOut, color: "text-[#A0A0A0]" },
  register: { icon: Database, color: "text-[#C6FF34]" },
  profile_update: { icon: Edit, color: "text-yellow-400" },
  settings_change: { icon: Shield, color: "text-purple-400" },
  role_change: { icon: Shield, color: "text-purple-400" },
  permission_change: { icon: Shield, color: "text-purple-400" },
  job_create: { icon: Database, color: "text-[#C6FF34]" },
  job_apply: { icon: Edit, color: "text-yellow-400" },
  job_status_change: { icon: Edit, color: "text-yellow-400" },
  user_suspend: { icon: Trash2, color: "text-red-400" },
  user_activate: { icon: CheckCircle2, color: "text-[#C6FF34]" },
  payment_process: { icon: Shield, color: "text-blue-400" },
  subscription_change: { icon: Edit, color: "text-yellow-400" },
  employer_register: { icon: Database, color: "text-[#C6FF34]" },
  employer_verify: { icon: CheckCircle2, color: "text-[#C6FF34]" },
  employer_reject: { icon: XCircle, color: "text-red-400" },
  course_enroll: { icon: Database, color: "text-[#C6FF34]" },
  course_complete: { icon: CheckCircle2, color: "text-[#C6FF34]" },
  gig_apply: { icon: Edit, color: "text-yellow-400" },
  gig_complete: { icon: CheckCircle2, color: "text-[#C6FF34]" },
  impact_volunteer: { icon: LogIn, color: "text-blue-400" },
  impact_complete: { icon: CheckCircle2, color: "text-[#C6FF34]" },
};

const statusConfig: Record<string, { color: string; bg: string; icon: LucideIcon }> = {
  success: { color: "text-[#C6FF34]", bg: "bg-[#C6FF34]/10", icon: CheckCircle2 },
  info: { color: "text-blue-400", bg: "bg-blue-400/10", icon: CheckCircle2 },
  warning: { color: "text-yellow-400", bg: "bg-yellow-400/10", icon: AlertTriangle },
  critical: { color: "text-red-400", bg: "bg-red-400/10", icon: XCircle },
};

export default function AuditSection() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<string>("All");
  const [auditEntries, setAuditEntries] = useState<AuditEntry[]>([]);
  const [stats, setStats] = useState({ total: 0, today: 0, critical: 0, warnings: 0, uniqueUsers: 0 });

  // Load real audit data on mount
  useEffect(() => {
    const entries = getAuditLog();
    setAuditEntries(entries);
    setStats(getAuditStats());
  }, []);

  // Recompute stats when entries change
  useEffect(() => {
    setStats(getAuditStats());
  }, [auditEntries.length]);

  const filtered = useMemo(() => {
    return auditEntries.filter((r) => {
      const matchSearch =
        r.userEmail.toLowerCase().includes(search.toLowerCase()) ||
        r.action.toLowerCase().includes(search.toLowerCase()) ||
        r.resource.toLowerCase().includes(search.toLowerCase()) ||
        r.ipAddress.includes(search) ||
        (r.details?.toLowerCase().includes(search.toLowerCase()) ?? false);
      const matchFilter = filter === "All" || r.status === filter;
      return matchSearch && matchFilter;
    });
  }, [auditEntries, search, filter]);

  // Build KPIs from real stats
  const kpis = [
    { label: "Total Logs", value: String(stats.total.toLocaleString()), icon: ScrollText, change: "Last 30 days" },
    { label: "Today", value: String(stats.today), icon: CalendarDays, change: "+0 vs yesterday" },
    { label: "Critical", value: String(stats.critical), icon: AlertTriangle, change: stats.critical > 0 ? "Requires review" : "All clear" },
    { label: "Warnings", value: String(stats.warnings), icon: AlertCircle, change: "+0 vs yesterday" },
  ];

  return (
    <div className="space-y-6">
      <motion.h2 className="text-2xl font-semibold text-white" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        Audit Logs
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

      {/* Search + Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <motion.div className="relative flex-1" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#666666]" />
          <input
            type="text"
            placeholder="Search by user, action, resource, or IP..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white/[0.03] border border-white/[0.06] rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder-[#666666] focus:outline-none focus:border-[#C6FF34]/30"
          />
        </motion.div>
        <div className="flex gap-2">
          {(["All", "success", "warning", "critical"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-xl text-xs font-medium transition-colors ${
                filter === f
                  ? "bg-[#C6FF34] text-black"
                  : "bg-white/[0.03] border border-white/[0.06] text-[#A0A0A0] hover:bg-white/[0.06]"
              }`}
            >
              {f === "All" ? "All" : f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

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
                <th className="text-left px-6 py-4 text-[#A0A0A0] font-medium">Timestamp</th>
                <th className="text-left px-6 py-4 text-[#A0A0A0] font-medium">User</th>
                <th className="text-left px-6 py-4 text-[#A0A0A0] font-medium">Action</th>
                <th className="text-left px-6 py-4 text-[#A0A0A0] font-medium">Resource</th>
                <th className="text-left px-6 py-4 text-[#A0A0A0] font-medium">IP Address</th>
                <th className="text-left px-6 py-4 text-[#A0A0A0] font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {filtered.map((row) => {
                const actCfg = actionConfig[row.action] || { icon: User, color: "text-[#A0A0A0]" };
                const ActionIcon = actCfg.icon;
                const stCfg = statusConfig[row.status] || { color: "text-[#A0A0A0]", bg: "bg-white/[0.06]", icon: AlertCircle };
                const StatusIcon = stCfg.icon;
                return (
                  <tr key={row.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-4 text-[#A0A0A0] font-mono text-xs">
                      {new Date(row.timestamp).toLocaleString("en-US", {
                        year: "numeric",
                        month: "2-digit",
                        day: "2-digit",
                        hour: "2-digit",
                        minute: "2-digit",
                        second: "2-digit",
                        hour12: false,
                      }).replace(/\//g, "-")}
                    </td>
                    <td className="px-6 py-4 text-white font-medium max-w-[160px] truncate">{row.userEmail}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 ${actCfg.color}`}>
                        <ActionIcon className="w-4 h-4" />
                        {row.action.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-[#A0A0A0]">{row.resource}</td>
                    <td className="px-6 py-4 text-[#666666] font-mono text-xs">{row.ipAddress}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${stCfg.bg} ${stCfg.color}`}>
                        <StatusIcon className="w-3.5 h-3.5" />
                        {row.status.charAt(0).toUpperCase() + row.status.slice(1)}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="px-6 py-12 text-center text-[#666666]">No audit logs found.</div>
        )}
      </motion.div>
    </div>
  );
}
