import { motion } from "framer-motion";
import {
  DollarSign,
  CreditCard,
  Clock,
  ArrowRightLeft,
  Search,
  CheckCircle2,
  XCircle,
  AlertCircle,
  type LucideIcon,
} from "lucide-react";
import { useState } from "react";

interface PaymentRow {
  id: string;
  date: string;
  user: string;
  type: string;
  amount: string;
  status: "Completed" | "Pending" | "Failed";
  reference: string;
}

const paymentsData: PaymentRow[] = [
  { id: "1", date: "2024-06-18", user: "Jane Mwamba", type: "Subscription", amount: "ZMW 150", status: "Completed", reference: "PAY-001234" },
  { id: "2", date: "2024-06-18", user: "Chola Mulenga", type: "Payout", amount: "ZMW 2,400", status: "Pending", reference: "PAY-001235" },
  { id: "3", date: "2024-06-17", user: "Talent Africa Ltd", type: "Job Post", amount: "ZMW 500", status: "Completed", reference: "PAY-001236" },
  { id: "4", date: "2024-06-17", user: "Mumba Kabwe", type: "Subscription", amount: "ZMW 150", status: "Failed", reference: "PAY-001237" },
  { id: "5", date: "2024-06-16", user: "Bwalya Chileshe", type: "Payout", amount: "ZMW 1,800", status: "Completed", reference: "PAY-001238" },
  { id: "6", date: "2024-06-16", user: "Zesco Holdings", type: "Featured Job", amount: "ZMW 1,200", status: "Completed", reference: "PAY-001239" },
  { id: "7", date: "2024-06-15", user: "Nchimunya Sosala", type: "Subscription", amount: "ZMW 150", status: "Pending", reference: "PAY-001240" },
  { id: "8", date: "2024-06-15", user: "Fintech Zambia", type: "Job Post", amount: "ZMW 350", status: "Completed", reference: "PAY-001241" },
];

const statusConfig: Record<string, { color: string; icon: LucideIcon }> = {
  Completed: { color: "text-[#C6FF34]", icon: CheckCircle2 },
  Pending: { color: "text-yellow-400", icon: Clock },
  Failed: { color: "text-red-400", icon: XCircle },
};

const kpis = [
  { label: "Total Volume", value: "ZMW 482K", icon: DollarSign, change: "+12%" },
  { label: "Payouts", value: "ZMW 318K", icon: CreditCard, change: "+8%" },
  { label: "Pending", value: "ZMW 45K", icon: Clock, change: "-3%" },
  { label: "Transactions", value: "1,248", icon: ArrowRightLeft, change: "+18%" },
];

const fadeIn = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.3 },
};

export default function PaymentsSection() {
  const [search, setSearch] = useState("");

  const filtered = paymentsData.filter(
    (r) =>
      r.user.toLowerCase().includes(search.toLowerCase()) ||
      r.reference.toLowerCase().includes(search.toLowerCase()) ||
      r.type.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <motion.h2
        className="text-2xl font-semibold text-white"
        {...fadeIn}
      >
        Payments
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
              <div className="text-xs text-[#666666] mt-1">{kpi.change} from last month</div>
            </motion.div>
          );
        })}
      </div>

      {/* Search */}
      <motion.div
        className="relative"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#666666]" />
        <input
          type="text"
          placeholder="Search by user, reference, or type..."
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
                <th className="text-left px-6 py-4 text-[#A0A0A0] font-medium">Date</th>
                <th className="text-left px-6 py-4 text-[#A0A0A0] font-medium">User</th>
                <th className="text-left px-6 py-4 text-[#A0A0A0] font-medium">Type</th>
                <th className="text-left px-6 py-4 text-[#A0A0A0] font-medium">Amount</th>
                <th className="text-left px-6 py-4 text-[#A0A0A0] font-medium">Status</th>
                <th className="text-left px-6 py-4 text-[#A0A0A0] font-medium">Reference</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {filtered.map((row) => {
                const StatusIcon = statusConfig[row.status]?.icon || AlertCircle;
                const statusColor = statusConfig[row.status]?.color || "text-[#A0A0A0]";
                return (
                  <tr key={row.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-4 text-[#A0A0A0]">{row.date}</td>
                    <td className="px-6 py-4 text-white font-medium">{row.user}</td>
                    <td className="px-6 py-4 text-[#A0A0A0]">{row.type}</td>
                    <td className="px-6 py-4 text-white">{row.amount}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 ${statusColor}`}>
                        <StatusIcon className="w-4 h-4" />
                        {row.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-[#666666] font-mono text-xs">{row.reference}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="px-6 py-12 text-center text-[#666666]">No payments found.</div>
        )}
      </motion.div>
    </div>
  );
}
