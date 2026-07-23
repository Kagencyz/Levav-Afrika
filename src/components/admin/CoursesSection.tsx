import { motion } from "framer-motion";
import { safeJSONParse } from "@/lib/safeJSON";
import {
  BookOpen,
  Globe,
  FileText,
  Users,
  Search,
  ChevronDown,
  Plus,
  Eye,
  Edit3,
} from "lucide-react";
import { useState } from "react";

const kpis = [
  { label: "Total Courses", value: "24", icon: BookOpen, accent: "#C6FF34" },
  { label: "Published", value: "18", icon: Globe, accent: "#7E3BED" },
  { label: "Draft", value: "6", icon: FileText, accent: "#C6FF34" },
  {
    label: "Total Enrollments",
    value: "8,420",
    icon: Users,
    accent: "#7E3BED",
  },
];

const statuses = ["All", "Published", "Draft"];

const coursesData = [
  {
    title: "Full-Stack JavaScript Bootcamp",
    instructor: "Dr. Amina Bello",
    category: "Development",
    lessons: 42,
    enrolled: 1240,
    completionRate: 78,
    status: "Published",
  },
  {
    title: "UI/UX Design Masterclass",
    instructor: "Chidi Obi",
    category: "Design",
    lessons: 36,
    enrolled: 890,
    completionRate: 82,
    status: "Published",
  },
  {
    title: "Data Science with Python",
    instructor: "Dr. Fatima Alade",
    category: "Data Science",
    lessons: 50,
    enrolled: 2100,
    completionRate: 65,
    status: "Published",
  },
  {
    title: "Digital Marketing Strategy",
    instructor: "Kofi Mensah",
    category: "Marketing",
    lessons: 28,
    enrolled: 675,
    completionRate: 71,
    status: "Published",
  },
  {
    title: "Mobile App Development",
    instructor: "Dr. Amina Bello",
    category: "Development",
    lessons: 38,
    enrolled: 0,
    completionRate: 0,
    status: "Draft",
  },
  {
    title: "Product Management 101",
    instructor: "Ngozi Okonkwo",
    category: "Business",
    lessons: 24,
    enrolled: 445,
    completionRate: 88,
    status: "Published",
  },
];

const statusStyles: Record<string, string> = {
  Published:
    "bg-[#C6FF34]/10 text-[#C6FF34] border border-[#C6FF34]/20",
  Draft:
    "bg-[#7E3BED]/10 text-[#7E3BED] border border-[#7E3BED]/20",
};

export default function CoursesSection() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const filtered = coursesData.filter((c) => {
    const matchesSearch =
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.instructor.toLowerCase().includes(search.toLowerCase()) ||
      c.category.toLowerCase().includes(search.toLowerCase());
    const matchesStatus =
      statusFilter === "All" || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Courses</h1>
          <p className="text-[#A0A0A0] text-sm mt-1">
            Manage your course catalog and enrollments
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#666666]" />
            <input
              type="text"
              placeholder="Search courses..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 pr-4 py-2 bg-white/[0.03] border border-white/[0.06] rounded-xl text-white placeholder-[#666666] text-sm focus:outline-none focus:border-[#C6FF34]/30 w-full sm:w-56"
            />
          </div>
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="appearance-none pl-4 pr-10 py-2 bg-white/[0.03] border border-white/[0.06] rounded-xl text-white text-sm focus:outline-none focus:border-[#C6FF34]/30 cursor-pointer"
            >
              {statuses.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#666666] pointer-events-none" />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-[#C6FF34] hover:bg-[#b8f030] text-black font-medium text-sm rounded-xl transition-colors">
            <Plus className="w-4 h-4" />
            Add Course
          </button>
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

      {/* Courses Table */}
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
                  Course Title
                </th>
                <th className="text-left text-[#666666] text-xs font-medium uppercase tracking-wider py-3 pr-4">
                  Instructor
                </th>
                <th className="text-left text-[#666666] text-xs font-medium uppercase tracking-wider py-3 pr-4">
                  Category
                </th>
                <th className="text-left text-[#666666] text-xs font-medium uppercase tracking-wider py-3 pr-4">
                  Lessons
                </th>
                <th className="text-left text-[#666666] text-xs font-medium uppercase tracking-wider py-3 pr-4">
                  Enrolled
                </th>
                <th className="text-left text-[#666666] text-xs font-medium uppercase tracking-wider py-3 pr-4">
                  Completion Rate
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
                  key={row.title}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: idx * 0.04 }}
                  className="border-b border-white/[0.04] last:border-0 hover:bg-white/[0.02] transition-colors"
                >
                  <td className="py-3 pr-4">
                    <span className="text-white text-sm font-medium">
                      {row.title}
                    </span>
                  </td>
                  <td className="py-3 pr-4">
                    <span className="text-[#A0A0A0] text-sm">
                      {row.instructor}
                    </span>
                  </td>
                  <td className="py-3 pr-4">
                    <span className="text-[#A0A0A0] text-sm">
                      {row.category}
                    </span>
                  </td>
                  <td className="py-3 pr-4">
                    <span className="text-white text-sm">
                      {row.lessons}
                    </span>
                  </td>
                  <td className="py-3 pr-4">
                    <span className="text-[#A0A0A0] text-sm">
                      {row.enrolled.toLocaleString()}
                    </span>
                  </td>
                  <td className="py-3 pr-4">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${row.completionRate}%`,
                            backgroundColor:
                              row.completionRate >= 75
                                ? "#C6FF34"
                                : "#7E3BED",
                          }}
                        />
                      </div>
                      <span className="text-[#A0A0A0] text-xs">
                        {row.completionRate}%
                      </span>
                    </div>
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
                        <Edit3 className="w-4 h-4 text-[#666666]" />
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
