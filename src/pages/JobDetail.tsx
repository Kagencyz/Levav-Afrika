import { useParams, Link, useNavigate } from "react-router";
import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import {
  ArrowLeft,
  MapPin,
  Calendar,
  Clock,
  Users,
  Briefcase,
  CheckCircle2,
  Bookmark,
  Share2,
  ArrowRight,
  Building2,
  BadgeCheck,
  DollarSign,
  Layers,
  Globe,
  Send,
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
  featured: boolean;
  createdAt: string | Date;
  company?: string;
  companyDesc?: string;
  industry?: string;
  companySize?: string;
}

interface CompanyInfo {
  name: string;
  description: string;
  industry: string;
  size: string;
}

/* ───────────────────── Animation Variants ───────────────────── */
const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.6, ease: [0.19, 1, 0.22, 1] },
  }),
};

/* ───────────────────── Company Data ───────────────────── */
const COMPANY_DATA: Record<number, CompanyInfo> = {
  1: {
    name: "BongoHive",
    description: "Zambia's leading technology and innovation hub, fostering startups and digital transformation across the region.",
    industry: "Technology",
    size: "50-200 employees",
  },
  2: {
    name: "FinFlow Labs",
    description: "Building the future of financial technology in Africa with innovative payment and banking solutions.",
    industry: "FinTech",
    size: "20-100 employees",
  },
  3: {
    name: "HealthTech GH",
    description: "Revolutionizing healthcare delivery in Ghana through technology and data-driven solutions.",
    industry: "HealthTech",
    size: "30-150 employees",
  },
  4: {
    name: "UserFirst Design",
    description: "A human-centered design studio creating exceptional digital experiences for African markets.",
    industry: "Design Services",
    size: "10-50 employees",
  },
  5: {
    name: "DataDriven KE",
    description: "Leveraging data science and analytics to solve complex business challenges across East Africa.",
    industry: "Data & Analytics",
    size: "25-100 employees",
  },
  6: {
    name: "AppWorks Senegal",
    description: "Creating cutting-edge mobile applications tailored for Francophone African markets.",
    industry: "Mobile Development",
    size: "15-75 employees",
  },
  7: {
    name: "EduSpark Africa",
    description: "An edtech startup democratizing access to quality education through innovative digital platforms.",
    industry: "EdTech",
    size: "40-200 employees",
  },
  8: {
    name: "CloudBase Africa",
    description: "Providing cloud infrastructure and DevOps solutions for enterprises across the continent.",
    industry: "Cloud Infrastructure",
    size: "50-250 employees",
  },
  9: {
    name: "Kigali AI Institute",
    description: "Leading AI research and development in Rwanda, focusing on NLP for African languages.",
    industry: "AI Research",
    size: "30-120 employees",
  },
  10: {
    name: "GreenHarvest Farms",
    description: "Sustainable agriculture technology company empowering smallholder farmers across East Africa.",
    industry: "AgriTech",
    size: "100-500 employees",
  },
  11: {
    name: "MediCare Plus",
    description: "Healthcare provider delivering innovative medical solutions and public health programs across North Africa.",
    industry: "Healthcare",
    size: "200-1000 employees",
  },
  12: {
    name: "YouthBridge Zambia",
    description: "Non-profit organization focused on youth development, counseling, and community empowerment.",
    industry: "Non-Profit",
    size: "20-80 employees",
  },
};

/* ───────────────────── Mock Jobs ───────────────────── */
const MOCK_JOBS: Job[] = [
  {
    id: 1,
    title: "Senior Frontend Developer",
    description: "Join our team to build beautiful, performant user interfaces for our fintech platform serving 50,000+ users across Africa. You will work with React, TypeScript, and modern tooling to deliver exceptional user experiences.\n\nYou will collaborate with designers, backend engineers, and product managers to ship features that make a real difference in people's financial lives. This is a senior role with mentorship responsibilities.",
    requirements: "5+ years React experience\nStrong TypeScript skills\nExperience with Tailwind CSS\nUnderstanding of performance optimization\nGit workflow experience\nExperience mentoring junior developers",
    skills: ["React", "TypeScript", "Tailwind", "Vite"],
    type: "full-time",
    location: "Lusaka, Zambia",
    salary: "ZMW 15,000 - 25,000",
    status: "active",
    featured: true,
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    company: "BongoHive",
    companyDesc: "Zambia's leading technology and innovation hub.",
    industry: "Technology",
    companySize: "50-200 employees",
  },
  {
    id: 2,
    title: "Product Designer",
    description: "Lead design initiatives for our growing fintech platform. Shape the user experience and visual identity of products used by millions across the continent.\n\nYou'll own the design process from research to prototyping to final UI, working closely with engineering to ensure pixel-perfect implementation.",
    requirements: "3+ years product design experience\nFigma mastery\nPortfolio demonstrating UX process\nExperience with design systems\nUser research skills",
    skills: ["Figma", "UX Design", "Prototyping", "Design Systems"],
    type: "full-time",
    location: "Lusaka, Zambia",
    salary: "ZMW 12,000 - 18,000",
    status: "active",
    featured: false,
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 3,
    title: "Backend Engineer",
    description: "Build scalable APIs and services for our healthtech product. Work with a talented team to solve real healthcare challenges affecting millions of Africans.\n\nYou'll design database schemas, build RESTful and GraphQL APIs, and ensure our systems can handle rapid growth.",
    requirements: "4+ years backend development\nPython/Node.js proficiency\nDatabase design experience\nCloud platform experience (AWS/GCP)\nUnderstanding of microservices architecture",
    skills: ["Python", "Node.js", "PostgreSQL", "AWS"],
    type: "full-time",
    location: "Accra, Ghana",
    salary: "GHS 8,000 - 12,000",
    status: "active",
    featured: false,
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 4,
    title: "UX Researcher",
    description: "Conduct user research to inform product decisions. Help us understand our users deeply and build products they'll love.\n\nYou'll plan and execute qualitative and quantitative research studies, synthesize findings, and present actionable insights to stakeholders.",
    requirements: "Experience with qualitative research methods\nInterview facilitation skills\nData synthesis and analysis\nStrong presentation abilities\n3+ years UX research experience",
    skills: ["User Research", "Interviewing", "Analysis", "Usability Testing"],
    type: "contract",
    location: "Lagos, Nigeria",
    salary: "\u20A6500,000 - 700,000",
    status: "active",
    featured: false,
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 5,
    title: "Data Scientist",
    description: "Analyze large datasets to drive business insights. Build models and visualizations that inform strategic decisions across our organization.\n\nYou'll work with stakeholders to identify opportunities, clean and explore data, build predictive models, and communicate findings clearly.",
    requirements: "Strong statistics background\nPython and SQL proficiency\nMachine learning experience\nData visualization skills\nBSc/MSc in relevant field",
    skills: ["Python", "Machine Learning", "SQL", "TensorFlow"],
    type: "full-time",
    location: "Nairobi, Kenya",
    salary: "KES 150,000 - 200,000",
    status: "active",
    featured: false,
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 6,
    title: "Mobile Developer",
    description: "Build cross-platform mobile apps for African markets. Create performant, accessible apps that work on any device, even with limited connectivity.\n\nYou'll be responsible for end-to-end mobile development, from architecture to deployment on app stores.",
    requirements: "React Native or Flutter experience\nPublished apps on App/Play Store\nState management patterns\nOffline-first architecture knowledge\n2+ years mobile development",
    skills: ["React Native", "Flutter", "Firebase", "Dart"],
    type: "full-time",
    location: "Dakar, Senegal",
    salary: "CFA 800,000 - 1,200,000",
    status: "active",
    featured: false,
    createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 7,
    title: "Marketing Strategist",
    description: "Lead growth initiatives for our edtech startup. Drive user acquisition and brand awareness across African markets through innovative campaigns.\n\nYou'll develop and execute marketing strategies, manage budgets, analyze campaign performance, and build partnerships.",
    requirements: "3+ years marketing experience in tech\nGrowth hacking mindset\nStrong analytical skills\nContent creation experience\nSocial media expertise",
    skills: ["Marketing", "Growth Hacking", "Analytics", "Copywriting"],
    type: "full-time",
    location: "Harare, Zimbabwe",
    salary: "USD 3,500 - 5,000/month",
    status: "active",
    featured: true,
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 8,
    title: "DevOps Engineer",
    description: "Build and maintain cloud infrastructure for our rapidly growing SaaS platform serving African enterprises.\n\nYou'll automate deployments, monitor system health, optimize costs, and ensure 99.9% uptime for critical services.",
    requirements: "AWS certification preferred\nDocker and Kubernetes expertise\nCI/CD pipeline experience\nInfrastructure as Code (Terraform)\nMonitoring and logging tools",
    skills: ["AWS", "Docker", "Kubernetes", "Terraform"],
    type: "remote",
    location: "Remote (Africa)",
    salary: "USD 4,000 - 6,000/month",
    status: "active",
    featured: false,
    createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 9,
    title: "AI Researcher - NLP",
    description: "Research and develop NLP models for African languages. Publish papers and contribute to open-source projects that benefit the global AI community.\n\nYou'll work with academic partners, collect and annotate datasets, train models, and publish findings at top conferences.",
    requirements: "MS/PhD in Computer Science or related field\nStrong Python and PyTorch skills\nPublished research papers\nExperience with transformer models\nPassion for African languages",
    skills: ["Python", "PyTorch", "NLP", "Research"],
    type: "full-time",
    location: "Kigali, Rwanda",
    salary: "USD 5,000 - 7,000/month",
    status: "active",
    featured: true,
    createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 10,
    title: "Agricultural Engineer",
    description: "Design and implement sustainable irrigation systems for smallholder farms across East Africa. Make a direct impact on food security.\n\nYou'll conduct field assessments, design solutions, oversee installations, and train farmers on system maintenance.",
    requirements: "BSc in Agricultural Engineering\nIrrigation system design experience\nProject management skills\nFieldwork experience\nKnowledge of sustainable practices",
    skills: ["Irrigation", "Soil Science", "Project Management"],
    type: "contract",
    location: "Dar es Salaam, Tanzania",
    salary: "TZS 2,500,000 - 3,500,000",
    status: "active",
    featured: false,
    createdAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 11,
    title: "Public Health Program Manager",
    description: "Oversee maternal health programs across North Africa. Coordinate with ministries of health and NGOs to deliver impactful programs.\n\nYou'll manage budgets, build partnerships, monitor program outcomes, and ensure compliance with international health standards.",
    requirements: "MPH or related degree\n5+ years program management experience\nStakeholder management skills\nMonitoring and evaluation expertise\nFrench or Arabic language skills",
    skills: ["Public Health", "Program Management", "Research"],
    type: "full-time",
    location: "Cairo, Egypt",
    salary: "EGP 25,000 - 35,000",
    status: "active",
    featured: false,
    createdAt: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 12,
    title: "Youth Development Coordinator",
    description: "Design and deliver youth development programs in partnership with community organizations and churches across Zambia.\n\nYou'll recruit participants, develop curriculum, train facilitators, and measure program impact on youth outcomes.",
    requirements: "Background in counseling or social work\nCommunity organizing experience\nPublic speaking skills\nPassion for youth empowerment\nBachelor's degree in related field",
    skills: ["Counseling", "Public Speaking", "Community Organizing"],
    type: "part-time",
    location: "Lusaka, Zambia",
    salary: "ZMW 8,000 - 12,000",
    status: "active",
    featured: false,
    createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

/* ───────────────────── Helpers ───────────────────── */
function getCompanyInfo(job: Job): CompanyInfo {
  if (job.company) {
    return {
      name: job.company,
      description: job.companyDesc || COMPANY_DATA[job.id]?.description || "Leading employer in the African tech ecosystem.",
      industry: job.industry || COMPANY_DATA[job.id]?.industry || "Technology",
      size: job.companySize || COMPANY_DATA[job.id]?.size || "10-200 employees",
    };
  }
  return (
    COMPANY_DATA[job.id] || {
      name: "Levav Partner",
      description: "Leading employer in the African tech ecosystem.",
      industry: "Technology",
      size: "10-200 employees",
    }
  );
}

function getCompanyInitial(name: string): string {
  return name.charAt(0).toUpperCase();
}

function getGradient(name: string): string {
  const gradients = [
    "from-[#C6FF34]/30 to-[#7E3BED]/30",
    "from-[#7E3BED]/30 to-[#C6FF34]/30",
    "from-[#C6FF34]/20 to-[#3B82F6]/30",
    "from-[#7E3BED]/20 to-[#EC4899]/30",
    "from-[#3B82F6]/30 to-[#10B981]/30",
    "from-[#F59E0B]/30 to-[#C6FF34]/30",
  ];
  return gradients[name.length % gradients.length];
}

function getDaysAgo(createdAt: string | Date): string {
  const now = new Date();
  const created = new Date(createdAt);
  const diffMs = now.getTime() - created.getTime();
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (days === 0) return "Today";
  if (days === 1) return "1 day ago";
  return `${days} days ago`;
}

function getDaysLeft(createdAt: string | Date): string {
  const now = new Date();
  const created = new Date(createdAt);
  const diffMs = now.getTime() - created.getTime();
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const daysLeft = Math.max(0, 30 - days);
  return `${daysLeft}d left`;
}

function parseRequirements(reqs: string): string[] {
  return reqs
    .split("\n")
    .map((r) => r.trim())
    .filter((r) => r.length > 0);
}

/* ───────────────────── Similar Job Card ───────────────────── */
function SimilarJobCard({ job, index }: { job: Job; index: number }) {
  const company = getCompanyInfo(job);
  const daysAgo = getDaysAgo(job.createdAt);

  return (
    <motion.div
      className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.06] rounded-2xl p-6 hover:border-white/[0.12] hover:bg-white/[0.05] transition-all cursor-pointer group min-w-[300px] flex-shrink-0 sm:min-w-0 sm:flex-1"
      variants={fadeUp}
      initial="hidden"
      animate="visible"
      custom={index}
      whileHover={{ y: -4 }}
    >
      <Link to={`/jobs/${job.id}`} className="block">
        {/* Type badge */}
        <span className="inline-block bg-[#C6FF34] text-black text-xs font-medium px-2.5 py-1 rounded-full mb-3">
          {job.type}
        </span>

        {/* Title */}
        <h3 className="text-white font-semibold text-lg mb-1 leading-tight">
          {job.title}
        </h3>

        {/* Company + Location */}
        <div className="flex items-center gap-2 text-white/40 text-sm mb-3 flex-wrap">
          <span className="text-white/50">{company.name}</span>
          <span className="text-white/20">&#8226;</span>
          <span className="flex items-center gap-1">
            <MapPin size={12} className="text-white/30" />
            {job.location}
          </span>
        </div>

        {/* Skills */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {job.skills.slice(0, 3).map((skill) => (
            <span
              key={skill}
              className="bg-white/[0.05] text-white/50 text-xs px-2 py-0.5 rounded-md"
            >
              {skill}
            </span>
          ))}
        </div>

        {/* Bottom row */}
        <div className="flex items-center justify-between pt-3 border-t border-white/[0.06]">
          {job.salary && (
            <span className="text-[#C6FF34] text-sm font-medium">
              {job.salary}
            </span>
          )}
          <span className="text-white/30 text-xs ml-auto">{daysAgo}</span>
        </div>
      </Link>
    </motion.div>
  );
}

/* ───────────────────── Company Logo Placeholder ───────────────────── */
function CompanyLogo({ name }: { name: string }) {
  const initial = getCompanyInitial(name);
  const gradient = getGradient(name);

  return (
    <div
      className={`w-14 h-14 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center flex-shrink-0 border border-white/[0.08]`}
    >
      <span className="text-white font-semibold text-xl">{initial}</span>
    </div>
  );
}

/* ───────────────────── Main Page ───────────────────── */
export default function JobDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [saved, setSaved] = useState(false);
  const jobId = Number(id);

  // Merge mock data with localStorage jobs (support both keys)
  const allJobs: Job[] = useMemo(() => {
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
    // Also try 'jobs_data' key as mentioned in spec
    try {
      const stored2 = localStorage.getItem("jobs_data");
      if (stored2) {
        const parsed2 = JSON.parse(stored2);
        const jobs2 = Array.isArray(parsed2) ? parsed2 : [];
        localJobs = [...localJobs, ...jobs2];
      }
    } catch {
      // ignore
    }
    return [...MOCK_JOBS, ...localJobs];
  }, []);

  // Find the specific job
  const job = useMemo(() => {
    return allJobs.find((j) => j.id === jobId) || null;
  }, [allJobs, jobId]);

  // Similar jobs (same type or location, exclude current)
  const similarJobs = useMemo(() => {
    if (!job) return [];
    return allJobs
      .filter((j) => j.id !== job.id)
      .filter(
        (j) => j.type === job.type || j.location === job.location
      )
      .slice(0, 3);
  }, [allJobs, job]);

  // Handle save job
  const handleSave = () => {
    try {
      const existing = localStorage.getItem("levav_saved_jobs");
      const savedJobs: number[] = existing ? JSON.parse(existing) : [];
      if (savedJobs.includes(jobId)) {
        const filtered = savedJobs.filter((jid) => jid !== jobId);
        localStorage.setItem("levav_saved_jobs", JSON.stringify(filtered));
        setSaved(false);
        toast.success("Job removed from saved");
      } else {
        savedJobs.push(jobId);
        localStorage.setItem("levav_saved_jobs", JSON.stringify(savedJobs));
        setSaved(true);
        toast.success("Job saved successfully");
      }
    } catch {
      toast.error("Failed to save job");
    }
  };

  // Handle share
  const handleShare = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({
          title: job?.title || "Job on Levav",
          text: `Check out this ${job?.title} position!`,
          url,
        });
      } else {
        await navigator.clipboard.writeText(url);
        toast.success("Link copied to clipboard");
      }
    } catch {
      // User cancelled share
    }
  };

  // Check if already saved
  useMemo(() => {
    try {
      const existing = localStorage.getItem("levav_saved_jobs");
      const savedJobs: number[] = existing ? JSON.parse(existing) : [];
      setSaved(savedJobs.includes(jobId));
    } catch {
      // ignore
    }
  }, [jobId]);

  /* ─── Not Found State ─── */
  if (!job) {
    return (
      <main className="bg-black min-h-screen flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <Briefcase className="w-12 h-12 text-white/20 mx-auto mb-4" />
          <h1 className="font-display text-white text-2xl font-semibold mb-2">
            Job Not Found
          </h1>
          <p className="text-white/40 text-sm mb-6">
            This opportunity may have been removed or is no longer available.
          </p>
          <Link
            to="/opportunities"
            className="inline-flex items-center gap-2 text-[#C6FF34] text-sm hover:underline"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Opportunities
          </Link>
        </motion.div>
      </main>
    );
  }

  const company = getCompanyInfo(job);
  const daysAgo = getDaysAgo(job.createdAt);
  const daysLeft = getDaysLeft(job.createdAt);
  const appliedCount = 12 + ((job.id * 7) % 45);
  const requirements = parseRequirements(job.requirements);

  return (
    <main className="bg-black min-h-screen">
      {/* ─── Background Gradients ─── */}
      <div
        className="fixed top-0 right-0 w-[600px] h-[600px] rounded-full opacity-[0.05] pointer-events-none"
        style={{
          background: "radial-gradient(circle, #C6FF34 0%, transparent 70%)",
        }}
      />
      <div
        className="fixed bottom-0 left-0 w-[500px] h-[500px] rounded-full opacity-[0.04] pointer-events-none"
        style={{
          background: "radial-gradient(circle, #7E3BED 0%, transparent 70%)",
        }}
      />

      <div className="relative z-10 max-w-5xl mx-auto px-6 py-28">
        {/* ─── Back Link ─── */}
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Link
            to="/opportunities"
            className="inline-flex items-center gap-2 text-[#A0A0A0] text-sm hover:text-[#C6FF34] transition-colors mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Jobs
          </Link>
        </motion.div>

        {/* ─── Header Section ─── */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.19, 1, 0.22, 1] }}
        >
          {/* Title */}
          <h1 className="font-display text-3xl sm:text-4xl text-white font-semibold mb-4">
            {job.title}
          </h1>

          {/* Type Badge */}
          <div className="flex items-center gap-3 flex-wrap mb-4">
            <span className="bg-[#C6FF34] text-black text-sm font-medium px-3 py-1 rounded-full">
              {job.type}
            </span>
            {job.featured && (
              <span className="bg-[#7E3BED]/20 text-[#C6FF34] text-sm font-medium px-3 py-1 rounded-full">
                Featured
              </span>
            )}
            <span className="flex items-center gap-1 text-white/30 text-sm">
              <Clock size={14} />
              {daysLeft}
            </span>
            <span className="flex items-center gap-1 text-white/30 text-sm">
              <Users size={14} />
              {appliedCount} applied
            </span>
          </div>

          {/* Company + Location Row */}
          <div className="flex flex-wrap items-center gap-3 text-white/50 text-sm">
            <span className="flex items-center gap-1.5">
              <Building2 size={15} className="text-white/30" />
              <span className="text-white/70 font-medium">{company.name}</span>
              <BadgeCheck size={14} className="text-[#C6FF34]" />
            </span>
            <span className="text-white/20">&#8226;</span>
            <span className="flex items-center gap-1.5">
              <MapPin size={15} className="text-white/30" />
              {job.location}
            </span>
            <span className="text-white/20">&#8226;</span>
            <span className="flex items-center gap-1.5">
              <Calendar size={15} className="text-white/30" />
              Posted {daysAgo}
            </span>
          </div>
        </motion.div>

        {/* ─── Two Column Layout ─── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* ─── Left Column: Main Content ─── */}
          <div className="lg:col-span-2 space-y-6">
            {/* Glass Content Card */}
            <motion.div
              className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.06] rounded-2xl p-6 sm:p-8 space-y-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.6,
                delay: 0.1,
                ease: [0.19, 1, 0.22, 1],
              }}
            >
              {/* Overview */}
              <div>
                <h2 className="font-display text-white font-semibold text-lg mb-3 flex items-center gap-2">
                  <Layers size={18} className="text-[#C6FF34]" />
                  Overview
                </h2>
                <p className="text-white/50 text-sm leading-relaxed whitespace-pre-line font-body">
                  {job.description}
                </p>
              </div>

              {/* Divider */}
              <div className="border-t border-white/[0.06]" />

              {/* Requirements */}
              <div>
                <h2 className="font-display text-white font-semibold text-lg mb-3 flex items-center gap-2">
                  <CheckCircle2 size={18} className="text-[#C6FF34]" />
                  Requirements
                </h2>
                <ul className="space-y-2.5">
                  {requirements.map((req, idx) => (
                    <li
                      key={idx}
                      className="flex items-start gap-2.5 text-white/50 text-sm font-body"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-[#C6FF34] mt-1.5 flex-shrink-0" />
                      {req}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Divider */}
              <div className="border-t border-white/[0.06]" />

              {/* Skills */}
              <div>
                <h2 className="font-display text-white font-semibold text-lg mb-3 flex items-center gap-2">
                  <Briefcase size={18} className="text-[#C6FF34]" />
                  Skills
                </h2>
                <div className="flex flex-wrap gap-2">
                  {job.skills.map((skill) => (
                    <span
                      key={skill}
                      className="bg-white/[0.06] text-white/70 text-sm px-3.5 py-1.5 rounded-lg border border-white/[0.08]"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Divider */}
              <div className="border-t border-white/[0.06]" />

              {/* Salary & Location Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <DollarSign size={16} className="text-[#C6FF34]" />
                    <span className="text-white/40 text-xs uppercase tracking-wider font-medium">
                      Salary
                    </span>
                  </div>
                  <span className="text-[#C6FF34] text-xl font-semibold font-display">
                    {job.salary || "Not disclosed"}
                  </span>
                </div>

                <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <MapPin size={16} className="text-[#C6FF34]" />
                    <span className="text-white/40 text-xs uppercase tracking-wider font-medium">
                      Location
                    </span>
                  </div>
                  <span className="text-white font-medium font-display">
                    {job.location}
                  </span>
                </div>

                <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Globe size={16} className="text-[#C6FF34]" />
                    <span className="text-white/40 text-xs uppercase tracking-wider font-medium">
                      Job Type
                    </span>
                  </div>
                  <span className="text-white font-medium font-display capitalize">
                    {job.type}
                  </span>
                </div>

                <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock size={16} className="text-[#C6FF34]" />
                    <span className="text-white/40 text-xs uppercase tracking-wider font-medium">
                      Posted
                    </span>
                  </div>
                  <span className="text-white font-medium font-display">
                    {daysAgo}
                  </span>
                </div>
              </div>
            </motion.div>

            {/* CTA Section */}
            <motion.div
              className="flex flex-col sm:flex-row items-stretch gap-3"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.6,
                delay: 0.2,
                ease: [0.19, 1, 0.22, 1],
              }}
            >
              <motion.button
                onClick={() => navigate(`/apply/${job.id}`)}
                className="flex-1 bg-[#C6FF34] text-black font-semibold text-base rounded-xl py-4 hover:bg-[#d4ff5c] transition-colors flex items-center justify-center gap-2"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Send className="w-5 h-5" />
                Apply Now
              </motion.button>

              <motion.button
                onClick={handleSave}
                className={`flex-1 sm:flex-initial sm:px-8 border font-semibold text-base rounded-xl py-4 flex items-center justify-center gap-2 transition-colors ${
                  saved
                    ? "border-[#C6FF34] text-[#C6FF34]"
                    : "border-white/[0.15] text-white hover:border-white/[0.3] hover:text-white"
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Bookmark
                  className="w-5 h-5"
                  fill={saved ? "#C6FF34" : "none"}
                />
                {saved ? "Saved" : "Save Job"}
              </motion.button>

              <motion.button
                onClick={handleShare}
                className="flex-1 sm:flex-initial sm:px-8 border border-white/[0.15] text-white font-semibold text-base rounded-xl py-4 flex items-center justify-center gap-2 hover:border-white/[0.3] hover:text-white transition-colors"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Share2 className="w-5 h-5" />
                Share
              </motion.button>
            </motion.div>
          </div>

          {/* ─── Right Column: Company Card ─── */}
          <div className="lg:col-span-1">
            <motion.div
              className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.06] rounded-2xl p-6 sm:p-8 sticky top-28"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.6,
                delay: 0.15,
                ease: [0.19, 1, 0.22, 1],
              }}
            >
              {/* Company Header */}
              <div className="flex items-center gap-4 mb-6">
                <CompanyLogo name={company.name} />
                <div>
                  <h3 className="text-white font-semibold text-lg leading-tight flex items-center gap-1.5">
                    {company.name}
                    <BadgeCheck size={14} className="text-[#C6FF34]" />
                  </h3>
                  <p className="text-white/40 text-sm">{company.industry}</p>
                </div>
              </div>

              {/* Company Details */}
              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-2.5 text-white/50 text-sm">
                  <Users size={14} className="text-white/30" />
                  <span>{company.size}</span>
                </div>
                <div className="flex items-center gap-2.5 text-white/50 text-sm">
                  <MapPin size={14} className="text-white/30" />
                  <span>{job.location}</span>
                </div>
                <div className="flex items-center gap-2.5 text-white/50 text-sm">
                  <Globe size={14} className="text-white/30" />
                  <span>{company.industry}</span>
                </div>
              </div>

              {/* Company Description */}
              <p className="text-white/40 text-sm leading-relaxed mb-6 font-body">
                {company.description}
              </p>

              {/* View Company Link */}
              <Link
                to="/employers"
                className="inline-flex items-center gap-1.5 text-[#C6FF34] text-sm font-medium hover:underline"
              >
                View Company
                <ArrowRight size={14} />
              </Link>
            </motion.div>
          </div>
        </div>

        {/* ─── Similar Jobs Section ─── */}
        {similarJobs.length > 0 && (
          <motion.section
            className="mt-16"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.6,
              delay: 0.3,
              ease: [0.19, 1, 0.22, 1],
            }}
          >
            <h2 className="font-display text-white text-2xl font-semibold mb-6">
              Similar Jobs
            </h2>

            {/* Horizontal scroll on mobile, grid on desktop */}
            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide sm:grid sm:grid-cols-3 sm:overflow-visible">
              {similarJobs.map((simJob, idx) => (
                <SimilarJobCard key={simJob.id} job={simJob} index={idx} />
              ))}
            </div>
          </motion.section>
        )}
      </div>
    </main>
  );
}
