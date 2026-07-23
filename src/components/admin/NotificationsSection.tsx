import { motion } from "framer-motion";
import {
  Send,
  Eye,
  AlertTriangle,
  CalendarClock,
  Search,
  Mail,
  Bell,
  Megaphone,
  Smartphone,
  type LucideIcon,
} from "lucide-react";
import { useState } from "react";

interface NotificationRow {
  id: string;
  title: string;
  type: "Email" | "Push" | "In-App";
  audience: string;
  sent: number;
  readRate: string;
  date: string;
}

const notificationsData: NotificationRow[] = [
  { id: "1", title: "New Job Alert: Software Engineer", type: "Email", audience: "All Talents", sent: 1240, readRate: "72%", date: "2024-06-18" },
  { id: "2", title: "Platform Maintenance Notice", type: "Push", audience: "All Users", sent: 3420, readRate: "65%", date: "2024-06-17" },
  { id: "3", title: "Champion Program Update", type: "In-App", audience: "Champions", sent: 156, readRate: "91%", date: "2024-06-17" },
  { id: "4", title: "Weekly Job Digest", type: "Email", audience: "Talents", sent: 890, readRate: "58%", date: "2024-06-16" },
  { id: "5", title: "Payment Receipt", type: "Email", audience: "Individual", sent: 1, readRate: "100%", date: "2024-06-16" },
  { id: "6", title: "Profile Completion Reminder", type: "Push", audience: "Incomplete Profiles", sent: 420, readRate: "45%", date: "2024-06-15" },
  { id: "7", title: "New Message Notification", type: "In-App", audience: "Individual", sent: 1, readRate: "100%", date: "2024-06-15" },
  { id: "8", title: "Monthly Newsletter", type: "Email", audience: "All Users", sent: 2890, readRate: "62%", date: "2024-06-14" },
];

const typeConfig: Record<string, { icon: LucideIcon; color: string }> = {
  Email: { icon: Mail, color: "text-purple-400" },
  Push: { icon: Smartphone, color: "text-blue-400" },
  "In-App": { icon: Bell, color: "text-[#C6FF34]" },
};

const kpis = [
  { label: "Total Sent", value: "8,420", icon: Send, change: "+1,240 this week" },
  { label: "Read Rate", value: "68%", icon: Eye, change: "+3% vs last week" },
  { label: "Failed", value: "124", icon: AlertTriangle, change: "1.5% failure rate" },
  { label: "Scheduled", value: "12", icon: CalendarClock, change: "Next: Today 3PM" },
];

export default function NotificationsSection() {
  const [search, setSearch] = useState("");

  const filtered = notificationsData.filter((r) =>
    r.title.toLowerCase().includes(search.toLowerCase()) ||
    r.audience.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <motion.h2 className="text-2xl font-semibold text-white" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        Notifications
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
          placeholder="Search by title or audience..."
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
                <th className="text-left px-6 py-4 text-[#A0A0A0] font-medium">Title</th>
                <th className="text-left px-6 py-4 text-[#A0A0A0] font-medium">Type</th>
                <th className="text-left px-6 py-4 text-[#A0A0A0] font-medium">Audience</th>
                <th className="text-left px-6 py-4 text-[#A0A0A0] font-medium">Sent</th>
                <th className="text-left px-6 py-4 text-[#A0A0A0] font-medium">Read Rate</th>
                <th className="text-left px-6 py-4 text-[#A0A0A0] font-medium">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {filtered.map((row) => {
                const cfg = typeConfig[row.type];
                const TypeIcon = cfg?.icon || Megaphone;
                return (
                  <tr key={row.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-4 text-white font-medium max-w-xs truncate">{row.title}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 ${cfg?.color || "text-[#A0A0A0]"}`}>
                        <TypeIcon className="w-4 h-4" />
                        {row.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-[#A0A0A0]">{row.audience}</td>
                    <td className="px-6 py-4 text-white">{row.sent.toLocaleString()}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
                          <div
                            className="h-full bg-[#C6FF34] rounded-full"
                            style={{ width: row.readRate }}
                          />
                        </div>
                        <span className="text-[#A0A0A0]">{row.readRate}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-[#A0A0A0]">{row.date}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="px-6 py-12 text-center text-[#666666]">No notifications found.</div>
        )}
      </motion.div>
    </div>
  );
}
