import { motion } from "framer-motion";
import {
  Shield,
  ShieldCheck,
  ShieldAlert,
  Users,
  UserCog,
  Search,
  ChevronDown,
  ChevronUp,
  Edit2,
  Trash2,
  UserPlus,
  type LucideIcon,
} from "lucide-react";
import { useState } from "react";

interface Role {
  id: string;
  name: string;
  description: string;
  userCount: number;
  permissions: string[];
  allPermissions: string[];
  color: string;
  icon: LucideIcon;
}

const allPermissionsList = [
  "View Dashboard",
  "Manage Users",
  "Manage Jobs",
  "Manage Payments",
  "Manage Subscriptions",
  "Send Notifications",
  "Generate Reports",
  "Moderate Content",
  "Manage Support",
  "Edit Content",
  "View Audit Logs",
  "Manage Settings",
  "Manage Roles",
  "API Access",
  "Export Data",
];

const rolesData: Role[] = [
  {
    id: "1",
    name: "Admin",
    description: "Full platform access and control",
    userCount: 3,
    permissions: allPermissionsList,
    allPermissions: allPermissionsList,
    color: "text-red-400",
    icon: Shield,
  },
  {
    id: "2",
    name: "Champion",
    description: "Community leaders with elevated access",
    userCount: 12,
    permissions: ["View Dashboard", "Manage Jobs", "Send Notifications", "Moderate Content", "Manage Support", "Edit Content"],
    allPermissions: allPermissionsList,
    color: "text-[#C6FF34]",
    icon: ShieldCheck,
  },
  {
    id: "3",
    name: "Recruiter",
    description: "Can post jobs and manage applicants",
    userCount: 42,
    permissions: ["View Dashboard", "Manage Jobs", "Manage Support", "Export Data"],
    allPermissions: allPermissionsList,
    color: "text-blue-400",
    icon: Users,
  },
  {
    id: "4",
    name: "Talent",
    description: "Standard user with profile access",
    userCount: 284,
    permissions: ["View Dashboard"],
    allPermissions: allPermissionsList,
    color: "text-purple-400",
    icon: UserCog,
  },
  {
    id: "5",
    name: "Employer",
    description: "Can post jobs and browse talent",
    userCount: 56,
    permissions: ["View Dashboard", "Manage Jobs", "Manage Support"],
    allPermissions: allPermissionsList,
    color: "text-orange-400",
    icon: ShieldAlert,
  },
];

const kpis = [
  { label: "Total Roles", value: "5", icon: Shield, change: "System defined" },
  { label: "Admins", value: "3", icon: ShieldCheck, change: "Full access" },
  { label: "Champions", value: "12", icon: ShieldAlert, change: "Community leads" },
  { label: "Recruiters", value: "42", icon: Users, change: "Active posters" },
];

export default function RolesSection() {
  const [search, setSearch] = useState("");
  const [expandedRole, setExpandedRole] = useState<string | null>("1");

  const filtered = rolesData.filter(
    (r) =>
      r.name.toLowerCase().includes(search.toLowerCase()) ||
      r.description.toLowerCase().includes(search.toLowerCase())
  );

  const toggleExpand = (id: string) => setExpandedRole(expandedRole === id ? null : id);

  return (
    <div className="space-y-6">
      <motion.h2 className="text-2xl font-semibold text-white" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        Roles & Permissions
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
          placeholder="Search roles..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-white/[0.03] border border-white/[0.06] rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder-[#666666] focus:outline-none focus:border-[#C6FF34]/30"
        />
      </motion.div>

      {/* Roles List */}
      <div className="space-y-3">
        {filtered.map((role, i) => {
          const RoleIcon = role.icon;
          const isExpanded = expandedRole === role.id;
          return (
            <motion.div
              key={role.id}
              className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.06] rounded-2xl overflow-hidden"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 + i * 0.05, duration: 0.3 }}
            >
              {/* Role Header */}
              <button
                onClick={() => toggleExpand(role.id)}
                className="w-full flex items-center justify-between px-6 py-4 hover:bg-white/[0.02] transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-xl bg-white/[0.04] flex items-center justify-center`}>
                    <RoleIcon className={`w-5 h-5 ${role.color}`} />
                  </div>
                  <div className="text-left">
                    <div className="flex items-center gap-3">
                      <span className="text-white font-semibold">{role.name}</span>
                      <span className="text-xs text-[#666666] bg-white/[0.04] px-2 py-0.5 rounded-full">
                        {role.userCount} users
                      </span>
                    </div>
                    <p className="text-xs text-[#666666] mt-0.5">{role.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    className="p-2 rounded-lg hover:bg-white/[0.06] transition-colors"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <UserPlus className="w-4 h-4 text-[#A0A0A0]" />
                  </button>
                  <button
                    className="p-2 rounded-lg hover:bg-white/[0.06] transition-colors"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Edit2 className="w-4 h-4 text-[#A0A0A0]" />
                  </button>
                  {isExpanded ? (
                    <ChevronUp className="w-5 h-5 text-[#A0A0A0]" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-[#A0A0A0]" />
                  )}
                </div>
              </button>

              {/* Permissions Grid */}
              {isExpanded && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  transition={{ duration: 0.2 }}
                  className="border-t border-white/[0.06]"
                >
                  <div className="px-6 py-4">
                    <h4 className="text-sm font-medium text-[#A0A0A0] mb-3">Permissions</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                      {role.allPermissions.map((perm) => {
                        const hasPerm = role.permissions.includes(perm);
                        return (
                          <label
                            key={perm}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl border transition-colors cursor-pointer ${
                              hasPerm
                                ? "border-[#C6FF34]/20 bg-[#C6FF34]/5"
                                : "border-white/[0.04] bg-white/[0.02]"
                            }`}
                          >
                            <div
                              className={`w-4 h-4 rounded flex items-center justify-center transition-colors ${
                                hasPerm ? "bg-[#C6FF34]" : "border border-[#666666]"
                              }`}
                            >
                              {hasPerm && <ShieldCheck className="w-3 h-3 text-black" />}
                            </div>
                            <span
                              className={`text-sm ${hasPerm ? "text-white" : "text-[#666666]"}`}
                            >
                              {perm}
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                </motion.div>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
