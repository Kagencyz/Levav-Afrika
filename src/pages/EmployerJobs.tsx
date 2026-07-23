import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router";
import { motion, AnimatePresence } from "framer-motion";
import { safeJSONParse, safeJSONSet } from "@/lib/safeJSON";
import {
  Briefcase,
  Plus,
  Edit,
  Pause,
  Play,
  X,
  Users,
  ChevronDown,
  MapPin,
  Calendar,
  Search,
  ArrowLeft,
  CheckCircle2,
  Clock,
  User,
  Filter,
} from "lucide-react";

/* ───────────────────── Types ───────────────────── */
interface Job {
  id: number;
  title: string;
  description: string;
  requirements: string;
  skills: string[];
  type: "full-time" | "part-time" | "contract" | "internship" | "remote";
  location: string;
  salary: string | null;
  status: "active" | "paused" | "closed";
  applicants: number;
  createdAt: string;
}

interface Applicant {
  id: number;
  name: string;
  email: string;
  appliedAt: string;
  status: "pending" | "reviewed" | "shortlisted" | "rejected" | "hired";
  avatar?: string;
}

type ViewState = "list" | "applicants" | "create" | "edit";

/* ───────────────────── Mock Data ───────────────────── */
const DEFAULT_JOBS: Job[] = [
  {
    id: 1,
    title: "Senior Frontend Developer",
    description:
      "Join our team to build beautiful user experiences for thousands of users across Africa. You'll work with React, TypeScript, and modern tooling.",
    requirements: "5+ years React experience, TypeScript proficiency",
    skills: ["React", "TypeScript", "Tailwind"],
    type: "full-time",
    location: "Lusaka, Zambia",
    salary: "ZMW 15,000 - 25,000",
    status: "active",
    applicants: 5,
    createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 2,
    title: "Product Designer",
    description:
      "Lead design initiatives for our growing fintech platform. Shape the user experience and visual identity of products used by millions.",
    requirements: "3+ years product design, Figma mastery",
    skills: ["Figma", "UX Design", "Prototyping"],
    type: "full-time",
    location: "Lusaka, Zambia",
    salary: "ZMW 12,000 - 18,000",
    status: "active",
    applicants: 3,
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 3,
    title: "UX Researcher",
    description:
      "Conduct user research to inform product decisions. Help us understand our users deeply and build products they'll love.",
    requirements: "Experience with qualitative research methods",
    skills: ["User Research", "Interviewing", "Analysis"],
    type: "contract",
    location: "Remote",
    salary: "Negotiable",
    status: "paused",
    applicants: 1,
    createdAt: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

const DEFAULT_APPLICANTS: Record<number, Applicant[]> = {
  1: [
    { id: 101, name: "Mutale Mwanza", email: "mutale@email.com", appliedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), status: "shortlisted" },
    { id: 102, name: "Grace Lungu", email: "grace@email.com", appliedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), status: "pending" },
    { id: 103, name: "Amara Okafor", email: "amara@email.com", appliedAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(), status: "reviewed" },
  ],
  2: [
    { id: 201, name: "Kofi Mensah", email: "kofi@email.com", appliedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), status: "pending" },
    { id: 202, name: "Zara Ibrahim", email: "zara@email.com", appliedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(), status: "hired" },
  ],
  3: [
    { id: 301, name: "Tendai Mutasa", email: "tendai@email.com", appliedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(), status: "rejected" },
  ],
};

/* ───────────────────── localStorage Helpers ───────────────────── */
function loadJobs(): Job[] {
  const parsed = safeJSONParse<Job[]>("employer_jobs", []);
  if (Array.isArray(parsed) && parsed.length > 0) return parsed;
  return DEFAULT_JOBS;
}

function loadApplicants(): Record<number, Applicant[]> {
  const parsed = safeJSONParse<Record<number, Applicant[]>>("employer_applicants", {});
  if (typeof parsed === "object" && parsed !== null) return parsed;
  return DEFAULT_APPLICANTS;
}

/* ───────────────────── Animation Variants ───────────────────── */
const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.06, duration: 0.6, ease: [0.19, 1, 0.22, 1] },
  }),
};

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.05, delayChildren: 0.1 } },
};

/* ───────────────────── Status Helpers ───────────────────── */
function getStatusBadgeClasses(status: Job["status"]) {
  switch (status) {
    case "active":
      return "bg-[#C6FF34] text-black";
    case "paused":
      return "bg-yellow-500/20 text-yellow-400";
    case "closed":
      return "bg-white/10 text-white/40";
    default:
      return "bg-white/10 text-white/40";
  }
}

function getApplicantStatusClasses(status: Applicant["status"]) {
  switch (status) {
    case "pending":
      return "bg-white/10 text-white/50";
    case "reviewed":
      return "bg-blue-500/20 text-blue-400";
    case "shortlisted":
      return "bg-[#C6FF34]/20 text-[#C6FF34]";
    case "rejected":
      return "bg-red-500/20 text-red-400";
    case "hired":
      return "bg-emerald-500/20 text-emerald-400";
    default:
      return "bg-white/10 text-white/50";
  }
}

/* ───────────────────── Job Type Badge ───────────────────── */
function TypeBadge({ type }: { type: string }) {
  return (
    <span className="bg-[#C6FF34] text-black text-xs font-medium px-2.5 py-1 rounded-full whitespace-nowrap capitalize">
      {type}
    </span>
  );
}

/* ───────────────────── Skills Input ───────────────────── */
function SkillsInput({
  skills,
  onChange,
}: {
  skills: string[];
  onChange: (skills: string[]) => void;
}) {
  const [input, setInput] = useState("");

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if ((e.key === "Enter" || e.key === ",") && input.trim()) {
      e.preventDefault();
      if (!skills.includes(input.trim())) {
        onChange([...skills, input.trim()]);
      }
      setInput("");
    }
    if (e.key === "Backspace" && !input && skills.length > 0) {
      onChange(skills.slice(0, -1));
    }
  };

  const removeSkill = (index: number) => {
    onChange(skills.filter((_, i) => i !== index));
  };

  return (
    <div className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 focus-within:border-[#C6FF34] focus-within:ring-2 focus-within:ring-[#C6FF34]/20 transition-all">
      <div className="flex flex-wrap gap-2">
        {skills.map((skill, i) => (
          <span
            key={i}
            className="bg-[#C6FF34]/15 text-[#C6FF34] text-xs font-medium px-2.5 py-1 rounded-lg flex items-center gap-1"
          >
            {skill}
            <button
              type="button"
              onClick={() => removeSkill(i)}
              className="hover:text-white transition-colors"
            >
              <X size={12} />
            </button>
          </span>
        ))}
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={skills.length === 0 ? "Type skill & press Enter..." : ""}
          className="bg-transparent text-white placeholder:text-white/30 text-sm outline-none min-w-[120px] flex-1 py-1"
        />
      </div>
    </div>
  );
}

/* ───────────────────── Status Update Dropdown ───────────────────── */
function StatusDropdown({
  currentStatus,
  onChange,
}: {
  currentStatus: Applicant["status"];
  onChange: (status: Applicant["status"]) => void;
}) {
  const [open, setOpen] = useState(false);
  const statuses: Applicant["status"][] = [
    "pending",
    "reviewed",
    "shortlisted",
    "rejected",
    "hired",
  ];

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all ${getApplicantStatusClasses(
          currentStatus
        )} hover:opacity-80`}
      >
        {currentStatus}
        <ChevronDown size={12} />
      </button>
      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: -4, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -4, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 top-full mt-1 bg-[#0A0A0A] border border-white/[0.1] rounded-xl shadow-xl overflow-hidden z-20 min-w-[130px]"
            >
              {statuses.map((s) => (
                <button
                  key={s}
                  onClick={() => {
                    onChange(s);
                    setOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 text-xs font-medium capitalize hover:bg-white/5 transition-colors ${
                    s === currentStatus
                      ? "text-[#C6FF34]"
                      : "text-white/70"
                  }`}
                >
                  {s}
                </button>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ───────────────────── Job Form ───────────────────── */
function JobForm({
  initialData,
  onSubmit,
  onCancel,
}: {
  initialData?: Job;
  onSubmit: (data: Omit<Job, "id" | "applicants" | "createdAt">) => void;
  onCancel: () => void;
}) {
  const [title, setTitle] = useState(initialData?.title ?? "");
  const [description, setDescription] = useState(
    initialData?.description ?? ""
  );
  const [requirements, setRequirements] = useState(
    initialData?.requirements ?? ""
  );
  const [skills, setSkills] = useState<string[]>(initialData?.skills ?? []);
  const [type, setType] = useState<Job["type"]>(
    initialData?.type ?? "full-time"
  );
  const [location, setLocation] = useState(initialData?.location ?? "");
  const [salary, setSalary] = useState(initialData?.salary ?? "");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      title,
      description,
      requirements,
      skills,
      type,
      location,
      salary,
      status: initialData?.status ?? "active",
    });
  };

  const inputClasses =
    "w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder:text-white/30 text-sm focus:border-[#C6FF34] focus:ring-2 focus:ring-[#C6FF34]/20 outline-none transition-all";
  const labelClasses = "block text-white/70 text-sm font-medium mb-2";

  return (
    <motion.form
      onSubmit={handleSubmit}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.4, ease: [0.19, 1, 0.22, 1] }}
      className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.06] rounded-2xl p-6 space-y-5"
    >
      <div className="flex items-center justify-between">
        <h2 className="text-white text-xl font-semibold">
          {initialData ? "Edit Job Posting" : "Post a New Job"}
        </h2>
        <button
          type="button"
          onClick={onCancel}
          className="w-8 h-8 rounded-lg bg-white/5 border border-white/[0.1] flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 transition-all"
        >
          <X size={16} />
        </button>
      </div>

      <div className="grid md:grid-cols-2 gap-5">
        <div className="md:col-span-2">
          <label className={labelClasses}>Job Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Senior Frontend Developer"
            className={inputClasses}
            required
          />
        </div>

        <div className="md:col-span-2">
          <label className={labelClasses}>Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe the role, responsibilities, and ideal candidate..."
            rows={4}
            className={`${inputClasses} resize-none`}
            required
          />
        </div>

        <div className="md:col-span-2">
          <label className={labelClasses}>Requirements</label>
          <textarea
            value={requirements}
            onChange={(e) => setRequirements(e.target.value)}
            placeholder="List required skills, experience, and qualifications..."
            rows={3}
            className={`${inputClasses} resize-none`}
            required
          />
        </div>

        <div className="md:col-span-2">
          <label className={labelClasses}>Skills</label>
          <SkillsInput skills={skills} onChange={setSkills} />
        </div>

        <div>
          <label className={labelClasses}>Job Type</label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value as Job["type"])}
            className={inputClasses}
          >
            <option value="full-time" className="bg-[#0A0A0A]">
              Full-time
            </option>
            <option value="part-time" className="bg-[#0A0A0A]">
              Part-time
            </option>
            <option value="contract" className="bg-[#0A0A0A]">
              Contract
            </option>
            <option value="internship" className="bg-[#0A0A0A]">
              Internship
            </option>
            <option value="remote" className="bg-[#0A0A0A]">
              Remote
            </option>
          </select>
        </div>

        <div>
          <label className={labelClasses}>Location</label>
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="e.g. Lusaka, Zambia or Remote"
            className={inputClasses}
            required
          />
        </div>

        <div className="md:col-span-2">
          <label className={labelClasses}>Salary Range</label>
          <input
            type="text"
            value={salary}
            onChange={(e) => setSalary(e.target.value)}
            placeholder="e.g. ZMW 15,000 - 25,000 or Negotiable"
            className={inputClasses}
          />
        </div>
      </div>

      <div className="flex items-center gap-3 pt-2">
        <motion.button
          type="submit"
          className="btn-lime flex items-center gap-2"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <CheckCircle2 size={16} />
          {initialData ? "Save Changes" : "Publish Job"}
        </motion.button>
        <button
          type="button"
          onClick={onCancel}
          className="px-5 py-2.5 rounded-full bg-white/5 border border-white/10 text-white/60 text-sm font-medium hover:bg-white/10 hover:text-white transition-all"
        >
          Cancel
        </button>
      </div>
    </motion.form>
  );
}

/* ───────────────────── Job Card ───────────────────── */
function JobCard({
  job,
  index,
  onEdit,
  onToggleStatus,
  onClose,
  onViewApplicants,
}: {
  job: Job;
  index: number;
  onEdit: (job: Job) => void;
  onToggleStatus: (job: Job) => void;
  onClose: (job: Job) => void;
  onViewApplicants: (job: Job) => void;
}) {
  return (
    <motion.div
      className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.06] rounded-2xl p-6 hover:border-white/[0.12] transition-all group"
      variants={fadeUp}
      custom={index}
      initial="hidden"
      animate="visible"
      layout
    >
      {/* Top Row */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-2">
            <h3 className="text-white font-semibold text-lg leading-tight">
              {job.title}
            </h3>
            <TypeBadge type={job.type} />
            <span
              className={`text-xs font-medium px-2.5 py-1 rounded-full capitalize ${getStatusBadgeClasses(
                job.status
              )}`}
            >
              {job.status}
            </span>
          </div>
          <div className="flex items-center gap-3 flex-wrap text-white/40 text-sm">
            <span className="flex items-center gap-1">
              <MapPin size={13} className="text-white/30" />
              {job.location}
            </span>
            <span className="text-white/20">&#8226;</span>
            <span className="text-[#C6FF34] text-sm font-medium">
              {job.salary}
            </span>
            <span className="text-white/20">&#8226;</span>
            <span className="flex items-center gap-1">
              <Calendar size={13} className="text-white/30" />
              {new Date(job.createdAt).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              })}
            </span>
          </div>
        </div>
      </div>

      {/* Skills */}
      <div className="flex flex-wrap gap-2 mt-4">
        {job.skills.map((skill) => (
          <span
            key={skill}
            className="bg-white/[0.05] text-white/60 text-xs px-3 py-1 rounded-lg"
          >
            {skill}
          </span>
        ))}
      </div>

      {/* Bottom: Applicant Count + Actions */}
      <div className="flex items-center justify-between mt-5 pt-4 border-t border-white/[0.06]">
        <button
          onClick={() => onViewApplicants(job)}
          className="flex items-center gap-2 text-white/50 hover:text-[#C6FF34] transition-colors text-sm"
        >
          <Users size={16} />
          <span className="font-medium">{job.applicants}</span>
          <span>applicant{job.applicants !== 1 ? "s" : ""}</span>
        </button>

        <div className="flex items-center gap-2">
          <motion.button
            onClick={() => onViewApplicants(job)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/5 border border-white/[0.06] text-white/60 text-xs font-medium hover:bg-white/10 hover:text-white transition-all"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Users size={14} />
            View
          </motion.button>
          <motion.button
            onClick={() => onEdit(job)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/5 border border-white/[0.06] text-white/60 text-xs font-medium hover:bg-white/10 hover:text-white transition-all"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Edit size={14} />
            Edit
          </motion.button>
          <motion.button
            onClick={() => onToggleStatus(job)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-medium transition-all ${
              job.status === "active"
                ? "bg-yellow-500/10 border-yellow-500/20 text-yellow-400 hover:bg-yellow-500/20"
                : job.status === "paused"
                ? "bg-[#C6FF34]/10 border-[#C6FF34]/20 text-[#C6FF34] hover:bg-[#C6FF34]/20"
                : "bg-white/5 border-white/[0.06] text-white/40 hover:bg-white/10"
            }`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {job.status === "active" ? (
              <>
                <Pause size={14} />
                Pause
              </>
            ) : job.status === "paused" ? (
              <>
                <Play size={14} />
                Resume
              </>
            ) : (
              <>
                <Play size={14} />
                Activate
              </>
            )}
          </motion.button>
          <motion.button
            onClick={() => onClose(job)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/5 border border-white/[0.06] text-white/40 text-xs font-medium hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/20 transition-all"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <X size={14} />
            Close
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}

/* ───────────────────── Applicant Tracking View ───────────────────── */
function ApplicantTracking({
  job,
  applicants,
  onUpdateApplicant,
  onBack,
}: {
  job: Job;
  applicants: Applicant[];
  onUpdateApplicant: (applicantId: number, status: Applicant["status"]) => void;
  onBack: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ duration: 0.4, ease: [0.19, 1, 0.22, 1] }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-center gap-4">
        <motion.button
          onClick={onBack}
          className="w-10 h-10 rounded-xl bg-white/5 border border-white/[0.06] flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-all"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <ArrowLeft size={18} />
        </motion.button>
        <div>
          <h2 className="text-white text-xl font-semibold flex items-center gap-2">
            {job.title}
            <span className="bg-[#C6FF34] text-black text-xs font-medium px-2.5 py-1 rounded-full capitalize">
              {job.type}
            </span>
          </h2>
          <p className="text-white/40 text-sm mt-0.5">
            {applicants.length} applicant{applicants.length !== 1 ? "s" : ""}
            {" — "}
            {job.location}
          </p>
        </div>
      </div>

      {/* Mock data indicator */}
      <motion.div
        className="text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <span className="inline-flex items-center gap-2 text-white/30 text-sm bg-white/[0.03] border border-white/[0.06] rounded-full px-4 py-1.5">
          <Users size={14} className="text-[#C6FF34]" />
          Showing sample applicants
        </span>
      </motion.div>

      {/* Empty state */}
      {applicants.length === 0 && (
        <div className="text-center py-20 bg-white/[0.03] backdrop-blur-xl border border-white/[0.06] rounded-2xl">
          <User size={48} className="mx-auto mb-4 text-white/20" />
          <p className="text-white/50 text-lg">No applicants yet</p>
          <p className="text-white/30 text-sm mt-1">
            Applications will appear here when candidates apply
          </p>
        </div>
      )}

      {/* Applicant List */}
      {applicants.length > 0 && (
        <div className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.06] rounded-2xl overflow-hidden">
          {/* Table Header */}
          <div className="grid grid-cols-12 gap-4 px-6 py-3.5 border-b border-white/[0.06] text-white/40 text-xs font-medium uppercase tracking-wider">
            <div className="col-span-4">Applicant</div>
            <div className="col-span-3">Applied Date</div>
            <div className="col-span-3">Status</div>
            <div className="col-span-2 text-right">Actions</div>
          </div>

          {/* Table Rows */}
          <AnimatePresence>
            {applicants.map((applicant, i) => (
              <motion.div
                key={applicant.id}
                className="grid grid-cols-12 gap-4 px-6 py-4 border-b border-white/[0.04] last:border-b-0 hover:bg-white/[0.02] transition-colors items-center"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  delay: i * 0.05,
                  duration: 0.4,
                  ease: [0.19, 1, 0.22, 1],
                }}
                layout
              >
                {/* Applicant Info */}
                <div className="col-span-4 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#C6FF34]/30 to-[#7E3BED]/30 flex items-center justify-center text-white text-xs font-bold border border-white/[0.08] flex-shrink-0">
                    {applicant.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .slice(0, 2)}
                  </div>
                  <div className="min-w-0">
                    <p className="text-white text-sm font-medium truncate">
                      {applicant.name}
                    </p>
                    <p className="text-white/40 text-xs truncate">
                      {applicant.email}
                    </p>
                  </div>
                </div>

                {/* Applied Date */}
                <div className="col-span-3 flex items-center gap-1.5 text-white/50 text-sm">
                  <Clock size={13} className="text-white/30" />
                  {new Date(applicant.appliedAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </div>

                {/* Status */}
                <div className="col-span-3">
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium capitalize ${getApplicantStatusClasses(
                      applicant.status
                    )}`}
                  >
                    {applicant.status}
                  </span>
                </div>

                {/* Actions */}
                <div className="col-span-2 flex justify-end">
                  <StatusDropdown
                    currentStatus={applicant.status}
                    onChange={(newStatus) => {
                      onUpdateApplicant(applicant.id, newStatus);
                    }}
                  />
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </motion.div>
  );
}

/* ───────────────────── Main Page ───────────────────── */
export default function EmployerJobs() {
  const navigate = useNavigate();
  const [view, setView] = useState<ViewState>("list");
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [search, setSearch] = useState("");
  const [jobs, setJobs] = useState<Job[]>(loadJobs);
  const [applicantsByJob, setApplicantsByJob] = useState<Record<number, Applicant[]>>(loadApplicants);

  // Persist to localStorage whenever jobs or applicants change
  useEffect(() => {
    safeJSONSet("employer_jobs", jobs);
  }, [jobs]);

  useEffect(() => {
    safeJSONSet("employer_applicants", applicantsByJob);
  }, [applicantsByJob]);

  // Filter jobs by search
  const filteredJobs = useMemo(() => {
    if (!search) return jobs;
    const term = search.toLowerCase();
    return jobs.filter(
      (job) =>
        job.title.toLowerCase().includes(term) ||
        job.location.toLowerCase().includes(term) ||
        job.type.toLowerCase().includes(term)
    );
  }, [jobs, search]);

  // Stats
  const activeCount = useMemo(() => jobs.filter((j) => j.status === "active").length, [jobs]);
  const totalApplicants = useMemo(() => jobs.reduce((sum, j) => sum + j.applicants, 0), [jobs]);

  // Handlers
  const handleEdit = (job: Job) => {
    setSelectedJob(job);
    setView("edit");
  };

  const handleViewApplicants = (job: Job) => {
    setSelectedJob(job);
    setView("applicants");
  };

  const handleToggleStatus = (job: Job) => {
    const newStatus =
      job.status === "active"
        ? "paused"
        : job.status === "paused"
        ? "active"
        : "active";
    setJobs((prev) =>
      prev.map((j) => (j.id === job.id ? { ...j, status: newStatus } : j))
    );
  };

  const handleCloseJob = (job: Job) => {
    setJobs((prev) =>
      prev.map((j) => (j.id === job.id ? { ...j, status: "closed" } : j))
    );
  };

  const handleCreate = (
    formData: Omit<Job, "id" | "applicants" | "createdAt">
  ) => {
    const newJob: Job = {
      ...formData,
      id: Date.now(),
      applicants: 0,
      createdAt: new Date().toISOString(),
    };
    setJobs((prev) => [...prev, newJob]);
    setView("list");
  };

  const handleUpdate = (
    formData: Omit<Job, "id" | "applicants" | "createdAt">
  ) => {
    if (selectedJob) {
      setJobs((prev) =>
        prev.map((j) =>
          j.id === selectedJob.id ? { ...j, ...formData } : j
        )
      );
    }
    setView("list");
    setSelectedJob(null);
  };

  const handleUpdateApplicant = (applicantId: number, status: Applicant["status"]) => {
    if (!selectedJob) return;
    setApplicantsByJob((prev) => ({
      ...prev,
      [selectedJob.id]: (prev[selectedJob.id] || []).map((a) =>
        a.id === applicantId ? { ...a, status } : a
      ),
    }));
  };

  const currentApplicants = selectedJob ? (applicantsByJob[selectedJob.id] || []) : [];

  return (
    <main className="bg-black min-h-screen">
      {/* ─── Hero Header ─── */}
      <section className="relative pt-28 pb-12 overflow-hidden">
        <div
          className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full opacity-[0.06]"
          style={{
            background:
              "radial-gradient(circle, #C6FF34 0%, transparent 70%)",
          }}
        />
        <div
          className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full opacity-[0.04]"
          style={{
            background:
              "radial-gradient(circle, #7E3BED 0%, transparent 70%)",
          }}
        />

        <div className="relative z-10 max-w-5xl mx-auto px-6">
          {/* Badge */}
          <motion.div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#C6FF34]/10 border border-[#C6FF34]/20 mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.19, 1, 0.22, 1] }}
          >
            <Briefcase className="w-4 h-4 text-[#C6FF34]" />
            <span className="text-[#C6FF34] text-sm font-medium">
              Employer Dashboard
            </span>
          </motion.div>

          {/* Heading */}
          <motion.h1
            className="font-display text-4xl sm:text-5xl text-white leading-[1.05] mb-4"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.8,
              delay: 0.1,
              ease: [0.19, 1, 0.22, 1],
            }}
          >
            My Job Postings
          </motion.h1>

          {/* Stats + New Job */}
          <motion.div
            className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.7,
              delay: 0.2,
              ease: [0.19, 1, 0.22, 1],
            }}
          >
            <p className="text-white/50 text-lg">
              Manage your job listings and track applicants
            </p>
            <div className="flex items-center gap-3 flex-shrink-0">
              <motion.button
                onClick={() => navigate("/screening")}
                className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/5 border border-white/10 text-white/60 text-sm font-medium hover:bg-white/10 hover:text-[#C6FF34] hover:border-[#C6FF34]/30 transition-all"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Filter size={16} />
                Setup Auto-Screening
              </motion.button>
              <motion.button
                onClick={() => {
                  setSelectedJob(null);
                  setView("create");
                }}
                className="btn-lime flex items-center gap-2"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Plus size={18} />
                Post New Job
              </motion.button>
            </div>
          </motion.div>

          {/* Summary Cards */}
          {view === "list" && (
            <motion.div
              className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8"
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
            >
              {[
                {
                  label: "Total Jobs",
                  value: jobs.length,
                  icon: Briefcase,
                  color: "#C6FF34",
                },
                {
                  label: "Active",
                  value: activeCount,
                  icon: CheckCircle2,
                  color: "#7E3BED",
                },
                {
                  label: "Applicants",
                  value: totalApplicants,
                  icon: Users,
                  color: "#C6FF34",
                },
                {
                  label: "Paused",
                  value: jobs.filter((j) => j.status === "paused").length,
                  icon: Pause,
                  color: "#EAB308",
                },
              ].map((stat, i) => (
                <motion.div
                  key={stat.label}
                  className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.06] rounded-2xl p-4 hover:border-white/[0.1] transition-all"
                  variants={fadeUp}
                  custom={i}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: `${stat.color}15` }}
                    >
                      <stat.icon
                        size={16}
                        style={{ color: stat.color }}
                      />
                    </div>
                    <span className="text-white/50 text-xs">
                      {stat.label}
                    </span>
                  </div>
                  <p className="text-white text-2xl font-semibold">
                    {stat.value}
                  </p>
                </motion.div>
              ))}
            </motion.div>
          )}

          {/* Search (list view only) */}
          {view === "list" && (
            <motion.div
              className="relative"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.7,
                delay: 0.3,
                ease: [0.19, 1, 0.22, 1],
              }}
            >
              <Search
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none"
              />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search your job postings..."
                className="w-full bg-white/[0.05] border border-white/[0.1] rounded-xl pl-12 pr-4 py-3 text-white placeholder:text-white/30 text-sm focus:border-[#C6FF34] focus:ring-2 focus:ring-[#C6FF34]/20 outline-none transition-all"
              />
            </motion.div>
          )}
        </div>
      </section>

      {/* ─── Content Area ─── */}
      <section className="relative pb-24">
        <div className="max-w-5xl mx-auto px-6">
          <AnimatePresence mode="wait">
            {/* LIST VIEW */}
            {view === "list" && (
              <motion.div
                key="list"
                className="space-y-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                {filteredJobs.length === 0 ? (
                  <div className="text-center py-20">
                    <Briefcase
                      size={48}
                      className="mx-auto mb-4 text-white/20"
                    />
                    <p className="text-white/50 text-lg">
                      No jobs found
                    </p>
                    <p className="text-white/30 text-sm mt-1">
                      {search
                        ? "Try adjusting your search"
                        : "Create your first job posting to get started"}
                    </p>
                    {!search && (
                      <motion.button
                        onClick={() => setView("create")}
                        className="btn-lime mt-4 inline-flex items-center gap-2"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Plus size={16} />
                        Post New Job
                      </motion.button>
                    )}
                  </div>
                ) : (
                  filteredJobs.map((job, index) => (
                    <JobCard
                      key={job.id}
                      job={job}
                      index={index}
                      onEdit={handleEdit}
                      onToggleStatus={handleToggleStatus}
                      onClose={handleCloseJob}
                      onViewApplicants={handleViewApplicants}
                    />
                  ))
                )}
              </motion.div>
            )}

            {/* CREATE FORM */}
            {view === "create" && (
              <motion.div
                key="create"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <JobForm
                  onSubmit={handleCreate}
                  onCancel={() => setView("list")}
                />
              </motion.div>
            )}

            {/* EDIT FORM */}
            {view === "edit" && selectedJob && (
              <motion.div
                key="edit"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <JobForm
                  initialData={selectedJob}
                  onSubmit={handleUpdate}
                  onCancel={() => {
                    setView("list");
                    setSelectedJob(null);
                  }}
                />
              </motion.div>
            )}

            {/* APPLICANT TRACKING */}
            {view === "applicants" && selectedJob && (
              <motion.div
                key="applicants"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <ApplicantTracking
                  job={selectedJob}
                  applicants={currentApplicants}
                  onUpdateApplicant={handleUpdateApplicant}
                  onBack={() => {
                    setView("list");
                    setSelectedJob(null);
                  }}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>
    </main>
  );
}
