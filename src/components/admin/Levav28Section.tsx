import { motion } from "framer-motion";
import { safeJSONParse } from "@/lib/safeJSON";
import {
  Users,
  Activity,
  CheckCircle2,
  TrendingUp,
  Search,
  ChevronDown,
} from "lucide-react";
import { useState } from "react";

const kpis = [
  {
    label: "Total Enrolled",
    value: "2,847",
    icon: Users,
    accent: "#C6FF34",
  },
  {
    label: "Currently Active",
    value: "1,256",
    icon: Activity,
    accent: "#7E3BED",
  },
  {
    label: "Completed",
    value: "489",
    icon: CheckCircle2,
    accent: "#C6FF34",
  },
  {
    label: "Avg Completion Rate",
    value: "72%",
    icon: TrendingUp,
    accent: "#7E3BED",
  },
];

const phases = [
  { name: "CONFRONT", week: "Week 1", pct: 88 },
  { name: "DISSECT", week: "Week 2", pct: 74 },
  { name: "OWN", week: "Week 3", pct: 61 },
  { name: "EXECUTE", week: "Week 4", pct: 53 },
];

const completionsData = [
  {
    name: "Amara Okafor",
    country: "Nigeria",
    currentDay: 18,
    phase: "OWN",
    tasksDone: 42,
    completionPct: 78,
    status: "On Track",
  },
  {
    name: "Kwame Asante",
    country: "Ghana",
    currentDay: 22,
    phase: "EXECUTE",
    tasksDone: 51,
    completionPct: 92,
    status: "Completed",
  },
  {
    name: "Zainab Mwangi",
    country: "Kenya",
    currentDay: 14,
    phase: "DISSECT",
    tasksDone: 35,
    completionPct: 65,
    status: "On Track",
  },
  {
    name: "Tendai Mutasa",
    country: "Zimbabwe",
    currentDay: 9,
    phase: "CONFRONT",
    tasksDone: 22,
    completionPct: 48,
    status: "At Risk",
  },
  {
    name: "Fatou Diallo",
    country: "Senegal",
    currentDay: 25,
    phase: "EXECUTE",
    tasksDone: 55,
    completionPct: 96,
    status: "Completed",
  },
  {
    name: "Lerato Moloi",
    country: "South Africa",
    currentDay: 11,
    phase: "DISSECT",
    tasksDone: 28,
    completionPct: 58,
    status: "On Track",
  },
];

const statusStyles: Record<string, string> = {
  "On Track": "bg-[#C6FF34]/10 text-[#C6FF34] border border-[#C6FF34]/20",
  Completed: "bg-[#7E3BED]/10 text-[#7E3BED] border border-[#7E3BED]/20",
  "At Risk": "bg-red-500/10 text-red-400 border border-red-500/20",
};

export default function Levav28Section() {
  const [search, setSearch] = useState("");

  const filtered = completionsData.filter(
    (r) =>
      r.name.toLowerCase().includes(search.toLowerCase()) ||
      r.country.toLowerCase().includes(search.toLowerCase()) ||
      r.phase.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Levav 28</h1>
          <p className="text-[#A0A0A0] text-sm mt-1">
            28-day talent transformation program overview
          </p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#666666]" />
          <input
            type="text"
            placeholder="Search participants..."
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

      {/* Phase Progress Bars */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25, duration: 0.35 }}
        className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.06] rounded-2xl p-6"
      >
        <h2 className="text-lg font-semibold text-white mb-5">
          Phase Progress
        </h2>
        <div className="space-y-5">
          {phases.map((phase) => (
            <div key={phase.name} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-white font-medium text-sm">
                    {phase.name}
                  </span>
                  <span className="text-[#666666] text-xs">{phase.week}</span>
                </div>
                <span className="text-[#A0A0A0] text-sm font-medium">
                  {phase.pct}%
                </span>
              </div>
              <div className="w-full h-2 bg-white/[0.06] rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${phase.pct}%` }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  className="h-full rounded-full"
                  style={{
                    backgroundColor:
                      phase.pct >= 75 ? "#C6FF34" : "#7E3BED",
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Recent Completions Table */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35, duration: 0.35 }}
        className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.06] rounded-2xl p-6"
      >
        <h2 className="text-lg font-semibold text-white mb-5">
          Recent Completions
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/[0.06]">
                <th className="text-left text-[#666666] text-xs font-medium uppercase tracking-wider py-3 pr-4">
                  Name
                </th>
                <th className="text-left text-[#666666] text-xs font-medium uppercase tracking-wider py-3 pr-4">
                  Country
                </th>
                <th className="text-left text-[#666666] text-xs font-medium uppercase tracking-wider py-3 pr-4">
                  Current Day
                </th>
                <th className="text-left text-[#666666] text-xs font-medium uppercase tracking-wider py-3 pr-4">
                  Phase
                </th>
                <th className="text-left text-[#666666] text-xs font-medium uppercase tracking-wider py-3 pr-4">
                  Tasks Done
                </th>
                <th className="text-left text-[#666666] text-xs font-medium uppercase tracking-wider py-3 pr-4">
                  Completion %
                </th>
                <th className="text-left text-[#666666] text-xs font-medium uppercase tracking-wider py-3">
                  Status
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
                    <span className="text-white text-sm">
                      Day {row.currentDay}
                    </span>
                  </td>
                  <td className="py-3 pr-4">
                    <span
                      className="text-xs font-semibold px-2.5 py-1 rounded-lg"
                      style={{
                        backgroundColor:
                          row.phase === "CONFRONT"
                            ? "#C6FF34/10"
                            : row.phase === "EXECUTE"
                            ? "#7E3BED/10"
                            : "rgba(255,255,255,0.06)",
                        color:
                          row.phase === "CONFRONT"
                            ? "#C6FF34"
                            : row.phase === "EXECUTE"
                            ? "#7E3BED"
                            : "#A0A0A0",
                      }}
                    >
                      {row.phase}
                    </span>
                  </td>
                  <td className="py-3 pr-4">
                    <span className="text-[#A0A0A0] text-sm">
                      {row.tasksDone}
                    </span>
                  </td>
                  <td className="py-3 pr-4">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${row.completionPct}%`,
                            backgroundColor:
                              row.completionPct >= 80
                                ? "#C6FF34"
                                : "#7E3BED",
                          }}
                        />
                      </div>
                      <span className="text-[#A0A0A0] text-xs">
                        {row.completionPct}%
                      </span>
                    </div>
                  </td>
                  <td className="py-3">
                    <span
                      className={`text-xs font-medium px-2.5 py-1 rounded-lg ${
                        statusStyles[row.status] || ""
                      }`}
                    >
                      {row.status}
                    </span>
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
