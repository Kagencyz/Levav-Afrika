import { motion } from "framer-motion";
import {
  Users,
  UserCheck,
  Timer,
  TrendingDown,
  Search,
  CheckCircle2,
  Clock,
  type LucideIcon,
} from "lucide-react";
import { useState } from "react";

interface SubscriptionRow {
  id: string;
  user: string;
  plan: string;
  status: "Active" | "Trial" | "Cancelled";
  startDate: string;
  nextBilling: string;
  amount: string;
}

const subscriptionsData: SubscriptionRow[] = [
  { id: "1", user: "Jane Mwamba", plan: "Champion Pro", status: "Active", startDate: "2024-01-15", nextBilling: "2024-07-15", amount: "ZMW 150/mo" },
  { id: "2", user: "Chola Mulenga", plan: "Talent Premium", status: "Active", startDate: "2024-02-10", nextBilling: "2024-07-10", amount: "ZMW 100/mo" },
  { id: "3", user: "Mumba Kabwe", plan: "Champion Pro", status: "Trial", startDate: "2024-06-10", nextBilling: "2024-07-10", amount: "Free Trial" },
  { id: "4", user: "Bwalya Chileshe", plan: "Recruiter Plus", status: "Active", startDate: "2024-03-01", nextBilling: "2024-07-01", amount: "ZMW 300/mo" },
  { id: "5", user: "Nchimunya Sosala", plan: "Talent Premium", status: "Active", startDate: "2024-04-20", nextBilling: "2024-07-20", amount: "ZMW 100/mo" },
  { id: "6", user: "Zesco Holdings", plan: "Enterprise", status: "Active", startDate: "2024-01-01", nextBilling: "2024-07-01", amount: "ZMW 1,500/mo" },
  { id: "7", user: "Fintech Zambia", plan: "Recruiter Plus", status: "Cancelled", startDate: "2023-09-15", nextBilling: "—", amount: "ZMW 300/mo" },
  { id: "8", user: "Natasha Lungu", plan: "Champion Pro", status: "Trial", startDate: "2024-06-12", nextBilling: "2024-07-12", amount: "Free Trial" },
];

const statusConfig: Record<string, { color: string; bg: string; icon: LucideIcon }> = {
  Active: { color: "text-[#C6FF34]", bg: "bg-[#C6FF34]/10", icon: CheckCircle2 },
  Trial: { color: "text-blue-400", bg: "bg-blue-400/10", icon: Clock },
  Cancelled: { color: "text-red-400", bg: "bg-red-400/10", icon: TrendingDown },
};

const kpis = [
  { label: "Total Subscribers", value: "342", icon: Users, change: "+24 this month" },
  { label: "Active", value: "298", icon: UserCheck, change: "87% of total" },
  { label: "Trials", value: "44", icon: Timer, change: "12 this week" },
  { label: "Churn Rate", value: "3.2%", icon: TrendingDown, change: "-0.5% vs last month" },
];

export default function SubscriptionsSection() {
  const [search, setSearch] = useState("");

  const filtered = subscriptionsData.filter(
    (r) =>
      r.user.toLowerCase().includes(search.toLowerCase()) ||
      r.plan.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <motion.h2 className="text-2xl font-semibold text-white" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        Subscriptions
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
          placeholder="Search by user or plan..."
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
                <th className="text-left px-6 py-4 text-[#A0A0A0] font-medium">User</th>
                <th className="text-left px-6 py-4 text-[#A0A0A0] font-medium">Plan</th>
                <th className="text-left px-6 py-4 text-[#A0A0A0] font-medium">Status</th>
                <th className="text-left px-6 py-4 text-[#A0A0A0] font-medium">Start Date</th>
                <th className="text-left px-6 py-4 text-[#A0A0A0] font-medium">Next Billing</th>
                <th className="text-left px-6 py-4 text-[#A0A0A0] font-medium">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {filtered.map((row) => {
                const cfg = statusConfig[row.status];
                const StatusIcon = cfg?.icon || Clock;
                return (
                  <tr key={row.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-4 text-white font-medium">{row.user}</td>
                    <td className="px-6 py-4 text-[#A0A0A0]">{row.plan}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${cfg?.bg} ${cfg?.color}`}>
                        <StatusIcon className="w-3.5 h-3.5" />
                        {row.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-[#A0A0A0]">{row.startDate}</td>
                    <td className="px-6 py-4 text-[#A0A0A0]">{row.nextBilling}</td>
                    <td className="px-6 py-4 text-white">{row.amount}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="px-6 py-12 text-center text-[#666666]">No subscriptions found.</div>
        )}
      </motion.div>
    </div>
  );
}
