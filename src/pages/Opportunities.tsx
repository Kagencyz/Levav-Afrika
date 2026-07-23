import { useState, useMemo } from "react";
import { Link } from "react-router";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  MapPin,
  Calendar,
  Clock,
  Users,
  Briefcase,
  Loader2,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { SalaryDisplay } from "@/components/CurrencyDisplay";

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
  featured: boolean;
  createdAt: Date;
}

/* ───────────────────── Mock Data ───────────────────── */
const MOCK_JOBS: Job[] = [
  {
    id: 1,
    title: "Senior Frontend Developer",
    description:
      "Join our team to build beautiful user experiences for thousands of users across Africa. You'll work with React, TypeScript, and modern tooling.",
    requirements: "5+ years React experience",
    skills: ["React", "TypeScript", "Tailwind"],
    type: "full-time",
    location: "Lusaka, Zambia",
    salary: "ZMW 15,000 - 25,000",
    status: "active",
    featured: true,
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
  },
  {
    id: 2,
    title: "Product Designer",
    description:
      "Lead design initiatives for our growing fintech platform. Shape the user experience and visual identity of products used by millions.",
    requirements: "3+ years product design",
    skills: ["Figma", "UX Design", "Prototyping"],
    type: "full-time",
    location: "Lusaka, Zambia",
    salary: "ZMW 12,000 - 18,000",
    status: "active",
    featured: false,
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
  },
  {
    id: 3,
    title: "Backend Engineer",
    description:
      "Build scalable APIs and services for our healthtech product. Work with a talented team to solve real healthcare challenges.",
    requirements: "4+ years backend development",
    skills: ["Python", "Node.js", "PostgreSQL"],
    type: "full-time",
    location: "Accra, Ghana",
    salary: "GHS 8,000 - 12,000",
    status: "active",
    featured: false,
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
  },
  {
    id: 4,
    title: "UX Researcher",
    description:
      "Conduct user research to inform product decisions. Help us understand our users deeply and build products they'll love.",
    requirements: "Experience with qualitative research",
    skills: ["User Research", "Interviewing", "Analysis"],
    type: "contract",
    location: "Lagos, Nigeria",
    salary: "\u20A6500,000 - 700,000",
    status: "active",
    featured: false,
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
  },
  {
    id: 5,
    title: "Data Scientist",
    description:
      "Analyze large datasets to drive business insights. Build models and visualizations that inform strategic decisions.",
    requirements: "Strong statistics background",
    skills: ["Python", "Machine Learning", "SQL"],
    type: "full-time",
    location: "Nairobi, Kenya",
    salary: "KES 150,000 - 200,000",
    status: "active",
    featured: false,
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
  },
  {
    id: 6,
    title: "Mobile Developer",
    description:
      "Build cross-platform mobile apps for African markets. Create performant, accessible apps that work on any device.",
    requirements: "React Native or Flutter experience",
    skills: ["React Native", "Flutter", "Firebase"],
    type: "full-time",
    location: "Dakar, Senegal",
    salary: "CFA 800,000 - 1,200,000",
    status: "active",
    featured: false,
    createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
  },
  {
    id: 7,
    title: "Marketing Strategist",
    description:
      "Lead growth initiatives for our edtech startup. Drive user acquisition and brand awareness across African markets.",
    requirements: "3+ years marketing experience in tech",
    skills: ["Marketing", "Growth Hacking", "Analytics", "Copywriting"],
    type: "full-time",
    location: "Harare, Zimbabwe",
    salary: "USD 3,500 - 5,000/month",
    status: "active",
    featured: true,
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
  },
  {
    id: 8,
    title: "DevOps Engineer",
    description:
      "Build and maintain cloud infrastructure for our rapidly growing SaaS platform serving African enterprises.",
    requirements: "AWS certification preferred",
    skills: ["AWS", "Docker", "Kubernetes", "Terraform"],
    type: "remote",
    location: "Remote (Africa)",
    salary: "USD 4,000 - 6,000/month",
    status: "active",
    featured: false,
    createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
  },
  {
    id: 9,
    title: "AI Researcher - NLP",
    description:
      "Research and develop NLP models for African languages. Publish papers and contribute to open-source projects.",
    requirements: "MS/PhD in Computer Science or related field",
    skills: ["Python", "PyTorch", "NLP", "Research"],
    type: "full-time",
    location: "Kigali, Rwanda",
    salary: "USD 5,000 - 7,000/month",
    status: "active",
    featured: true,
    createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
  },
  {
    id: 10,
    title: "Agricultural Engineer",
    description:
      "Design and implement sustainable irrigation systems for smallholder farms across East Africa.",
    requirements: "BSc in Agricultural Engineering",
    skills: ["Irrigation", "Soil Science", "Project Management"],
    type: "contract",
    location: "Dar es Salaam, Tanzania",
    salary: "TZS 2,500,000 - 3,500,000",
    status: "active",
    featured: false,
    createdAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000),
  },
  {
    id: 11,
    title: "Public Health Program Manager",
    description:
      "Oversee maternal health programs across North Africa. Coordinate with ministries of health and NGOs.",
    requirements: "MPH or related degree, 5+ years experience",
    skills: ["Public Health", "Program Management", "Research"],
    type: "full-time",
    location: "Cairo, Egypt",
    salary: "EGP 25,000 - 35,000",
    status: "active",
    featured: false,
    createdAt: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000),
  },
  {
    id: 12,
    title: "Youth Development Coordinator",
    description:
      "Design and deliver youth development programs in partnership with community organizations and churches.",
    requirements: "Background in counseling or social work",
    skills: ["Counseling", "Public Speaking", "Community Organizing"],
    type: "part-time",
    location: "Lusaka, Zambia",
    salary: "ZMW 8,000 - 12,000",
    status: "active",
    featured: false,
    createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
  },
];

/* ───────────────────── Filter Options ───────────────────── */
const FILTER_OPTIONS = [
  { label: "All", value: "" },
  { label: "Full-time", value: "full-time" },
  { label: "Part-time", value: "part-time" },
  { label: "Contract", value: "contract" },
  { label: "Internship", value: "internship" },
  { label: "Remote", value: "remote" },
] as const;

/* ───────────────────── Animation Variants ───────────────────── */
const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.6, ease: [0.19, 1, 0.22, 1] },
  }),
};

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
};

/* ───────────────────── Helpers ───────────────────── */
function getDaysLeft(createdAt: Date): string {
  const now = new Date();
  const diff = now.getTime() - new Date(createdAt).getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const daysLeft = Math.max(0, 30 - days);
  return `${daysLeft}d left`;
}

function getCompanyInitial(title: string): string {
  return title.charAt(0).toUpperCase();
}

function getCompanyName(title: string): string {
  const companies: Record<number, string> = {
    1: "TechVentures Africa",
    2: "FinFlow Labs",
    3: "HealthTech GH",
    4: "UserFirst Design",
    5: "DataDriven KE",
    6: "AppWorks Senegal",
    7: "EduSpark Africa",
    8: "CloudBase Africa",
    9: "Kigali AI Institute",
    10: "GreenHarvest Farms",
    11: "MediCare Plus",
    12: "YouthBridge Zambia",
  };
  const match = Object.entries(companies).find(([key]) =>
    title.includes(
      [
        "Frontend",
        "Product",
        "Backend",
        "UX",
        "Data",
        "Mobile",
        "Marketing",
        "DevOps",
        "AI",
        "Agricultural",
        "Health",
        "Youth",
      ][Number(key) - 1] || ""
    )
  );
  return match?.[1] || "Levav Partner";
}

/* ───────────────────── Company Logo Placeholder ───────────────────── */
function CompanyLogo({ title }: { title: string }) {
  const initial = getCompanyInitial(title);
  const gradients = [
    "from-[#C6FF34]/30 to-[#7E3BED]/30",
    "from-[#7E3BED]/30 to-[#C6FF34]/30",
    "from-[#C6FF34]/20 to-[#3B82F6]/30",
    "from-[#7E3BED]/20 to-[#EC4899]/30",
    "from-[#3B82F6]/30 to-[#10B981]/30",
    "from-[#F59E0B]/30 to-[#C6FF34]/30",
  ];
  const gradient = gradients[title.length % gradients.length];

  return (
    <div
      className={`w-12 h-12 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center flex-shrink-0 border border-white/[0.08]`}
    >
      <span className="text-white font-semibold text-lg">{initial}</span>
    </div>
  );
}

/* ───────────────────── Job Card ───────────────────── */
function JobCard({ job, index }: { job: Job; index: number }) {
  const daysLeft = getDaysLeft(job.createdAt);
  const appliedCount = 12 + ((job.id * 7) % 45);

  return (
    <Link to={`/jobs/${job.id}`} className="block">
      <motion.div
        key={job.id}
        className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.06] rounded-2xl p-6 hover:border-white/[0.12] hover:bg-white/[0.05] transition-all cursor-pointer group"
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        custom={index}
        whileHover={{ y: -4 }}
        layout
      >
        {/* Top Row: Logo + Title + Badge */}
        <div className="flex items-start gap-4">
          <CompanyLogo title={job.title} />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-white font-semibold text-lg leading-tight">
                {job.title}
              </h3>
              <span className="bg-[#C6FF34] text-black text-xs font-medium px-2.5 py-1 rounded-full whitespace-nowrap">
                {job.type}
              </span>
              {job.featured && (
                <span className="bg-[#7E3BED]/20 text-[#C6FF34] text-xs font-medium px-2.5 py-1 rounded-full whitespace-nowrap">
                  Featured
                </span>
              )}
            </div>

            {/* Meta Row */}
            <div className="flex items-center gap-3 mt-1.5 flex-wrap text-white/40 text-sm">
              <span className="text-white/50">{getCompanyName(job.title)}</span>
              <span className="text-white/20">&#8226;</span>
              <span className="flex items-center gap-1">
                <MapPin size={13} className="text-white/30" />
                {job.location}
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

        {/* Description */}
        <p className="text-white/50 text-sm mt-4 line-clamp-2 leading-relaxed">
          {job.description}
        </p>

        {/* Skill Tags */}
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

        {/* Bottom Row */}
        <div className="flex items-center justify-between mt-5 pt-4 border-t border-white/[0.06]">
          <div className="flex items-center gap-4 flex-wrap">
            {job.salary && (
              <SalaryDisplay salary={job.salary} showConverted />
            )}
            <span className="flex items-center gap-1 text-white/30 text-xs">
              <Clock size={13} />
              {daysLeft}
            </span>
            <span className="flex items-center gap-1 text-white/30 text-xs">
              <Users size={13} />
              {appliedCount} applied
            </span>
          </div>
          <span className="text-[#C6FF34] text-sm font-medium flex items-center gap-1 group-hover:gap-2 transition-all">
            View Details
            <ArrowRight size={14} />
          </span>
        </div>
      </motion.div>
    </Link>
  );
}

/* ───────────────────── Page ───────────────────── */
export default function Opportunities() {
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("");
  const [page, setPage] = useState(1);

  // Merge mock data with localStorage jobs
  const jobs: Job[] = useMemo(() => {
    let localJobs: Job[] = [];
    try {
      const stored = localStorage.getItem("employer_jobs");
      if (stored) {
        const parsed = JSON.parse(stored);
        localJobs = Array.isArray(parsed) ? parsed : [];
      }
    } catch {
      localJobs = [];
    }

    const allJobs = localJobs.length > 0 ? [...MOCK_JOBS, ...localJobs] : MOCK_JOBS;

    let result = [...allJobs];

    // Filter by type
    if (activeFilter) {
      result = result.filter((j) => j.type === activeFilter);
    }

    // Filter by search
    if (search) {
      const term = search.toLowerCase();
      result = result.filter(
        (j) =>
          j.title.toLowerCase().includes(term) ||
          j.description.toLowerCase().includes(term) ||
          j.skills.some((s) => s.toLowerCase().includes(term)) ||
          j.location.toLowerCase().includes(term)
      );
    }

    // Pagination (client-side)
    const pageSize = 12;
    const start = (page - 1) * pageSize;
    return result.slice(start, start + pageSize);
  }, [search, activeFilter, page]);

  const totalJobs = useMemo(() => {
    let localJobs: Job[] = [];
    try {
      const stored = localStorage.getItem("employer_jobs");
      if (stored) {
        const parsed = JSON.parse(stored);
        localJobs = Array.isArray(parsed) ? parsed : [];
      }
    } catch {
      localJobs = [];
    }

    const allJobs = localJobs.length > 0 ? [...MOCK_JOBS, ...localJobs] : MOCK_JOBS;

    let count = allJobs.length;

    if (activeFilter) {
      count = allJobs.filter((j) => j.type === activeFilter).length;
    }

    if (search) {
      const term = search.toLowerCase();
      count = allJobs.filter(
        (j) =>
          j.title.toLowerCase().includes(term) ||
          j.description.toLowerCase().includes(term) ||
          j.skills.some((s) => s.toLowerCase().includes(term)) ||
          j.location.toLowerCase().includes(term)
      ).length;
    }

    return count;
  }, [search, activeFilter]);

  const totalPages = Math.ceil(totalJobs / 12);
  const isUsingMockData = true;
  const isLoading = false;

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
            <Sparkles className="w-4 h-4 text-[#C6FF34]" />
            <span className="text-[#C6FF34] text-sm font-medium">
              Job Board
            </span>
            <span className="bg-[#C6FF34]/20 text-[#C6FF34] text-xs font-semibold px-2 py-0.5 rounded-full">
              {totalJobs}
            </span>
          </motion.div>

          {/* Heading */}
          <motion.h1
            className="font-display text-3xl sm:text-5xl lg:text-6xl text-white leading-[1.08] sm:leading-[1.05] mb-4 break-words"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.8,
              delay: 0.1,
              ease: [0.19, 1, 0.22, 1],
            }}
          >
            Discover Opportunities
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            className="text-white/50 text-lg max-w-xl mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.7,
              delay: 0.2,
              ease: [0.19, 1, 0.22, 1],
            }}
          >
            Find your next role across Africa&apos;s top employers
          </motion.p>

          {/* Search Bar */}
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
              size={20}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none"
            />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search by title, company, or keywords..."
              className="w-full bg-white/[0.05] border border-white/[0.1] rounded-xl pl-12 pr-4 py-4 text-white placeholder:text-white/30 text-base focus:border-[#C6FF34] focus:ring-2 focus:ring-[#C6FF34]/20 outline-none transition-all"
            />
          </motion.div>

          {/* Filter Chips */}
          <motion.div
            className="flex items-center gap-2 mt-5 overflow-x-auto pb-2 scrollbar-hide"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.7,
              delay: 0.4,
              ease: [0.19, 1, 0.22, 1],
            }}
          >
            {FILTER_OPTIONS.map((option) => {
              const isActive = activeFilter === option.value;
              return (
                <motion.button
                  key={option.value}
                  onClick={() => {
                    setActiveFilter(option.value);
                    setPage(1);
                  }}
                  className={
                    isActive
                      ? "bg-[#C6FF34] text-black rounded-full px-4 py-2 text-sm font-medium whitespace-nowrap flex-shrink-0"
                      : "bg-white/[0.05] border border-white/[0.1] text-white/60 rounded-full px-4 py-2 text-sm whitespace-nowrap flex-shrink-0 hover:bg-white/[0.08] hover:text-white transition-colors"
                  }
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {option.label}
                </motion.button>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* ─── Job Listings ─── */}
      <section className="relative pb-24">
        <div className="max-w-5xl mx-auto px-6">
          {/* Mock data indicator */}
          {isUsingMockData && (
            <motion.div
              className="mb-6 text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <span className="inline-flex items-center gap-2 text-white/30 text-sm bg-white/[0.03] border border-white/[0.06] rounded-full px-4 py-1.5">
                <Sparkles size={14} className="text-[#C6FF34]" />
                Showing {totalJobs} opportunities across Africa
              </span>
            </motion.div>
          )}

          {/* Loading State */}
          {isLoading && (
            <div className="flex items-center justify-center py-20">
              <Loader2
                size={32}
                className="animate-spin text-[#C6FF34]"
              />
            </div>
          )}

          {/* Empty State */}
          {!isLoading && jobs.length === 0 && (
            <div className="text-center py-20">
              <Briefcase
                size={48}
                className="mx-auto mb-4 text-white/20"
              />
              <p className="text-white/50 text-lg">No jobs found</p>
              <p className="text-white/30 text-sm mt-1">
                Try adjusting your search or filters
              </p>
            </div>
          )}

          {/* Job Cards Grid */}
          {!isLoading && jobs.length > 0 && (
            <motion.div
              className="grid gap-4"
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
            >
              <AnimatePresence mode="popLayout">
                {jobs.map((job, index) => (
                  <JobCard key={job.id} job={job} index={index} />
                ))}
              </AnimatePresence>
            </motion.div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-10">
              <motion.button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 rounded-xl bg-white/[0.05] border border-white/[0.1] text-white/60 text-sm disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/[0.08] hover:text-white transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Previous
              </motion.button>
              <span className="text-white/40 text-sm px-4">
                Page {page} of {totalPages}
              </span>
              <motion.button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-4 py-2 rounded-xl bg-white/[0.05] border border-white/[0.1] text-white/60 text-sm disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/[0.08] hover:text-white transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Next
              </motion.button>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
