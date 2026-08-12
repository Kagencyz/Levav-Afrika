import { useState, useMemo, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import { motion } from "framer-motion";
import { Sparkles, ArrowRight, MapPin, Briefcase, Zap } from "lucide-react";

/* ───────────────────── Types ───────────────────── */
export interface Job {
  id: number;
  title: string;
  company?: string;
  description?: string;
  skills: string[];
  type: string;
  location: string;
  salary?: string | null;
  category?: string;
  status?: string;
  featured?: boolean;
  createdAt?: string | Date;
}

export interface Profile {
  skills?: string[];
  location?: string;
  category?: string;
  wri?: number;
  [key: string]: any;
}

export interface MatchResult {
  job: Job;
  score: number;
  matchedSkills: string[];
  reason: string;
}

/* ───────────────────── Company Names ───────────────────── */
const COMPANY_NAMES: Record<string, string> = {
  "Senior Frontend Developer": "TechVentures Africa",
  "Product Designer": "FinFlow Labs",
  "Backend Engineer": "HealthTech GH",
  "UX Researcher": "UserFirst Design",
  "Data Scientist": "DataDriven KE",
  "Mobile Developer": "AppWorks Senegal",
  "Marketing Strategist": "EduSpark Africa",
  "DevOps Engineer": "CloudBase Africa",
  "AI Researcher - NLP": "Kigali AI Institute",
  "Agricultural Engineer": "GreenHarvest Farms",
  "Public Health Program Manager": "MediCare Plus",
  "Youth Development Coordinator": "YouthBridge Zambia",
};

function getCompanyName(title: string): string {
  return COMPANY_NAMES[title] || "Levav Partner";
}

/* ───────────────────── Matching Algorithm ───────────────────── */
export function calculateMatchScore(job: Job, profile: Profile): MatchResult {
  let score = 0;
  const reasons: string[] = [];

  const jobSkills = job.skills || [];
  const mySkills = profile.skills || [];
  const matchedSkills = jobSkills.filter((s: string) =>
    mySkills.map((ms: string) => ms.toLowerCase()).includes(s.toLowerCase())
  );
  const skillScore =
    (matchedSkills.length / Math.max(jobSkills.length, 1)) * 50;
  score += skillScore;
  if (matchedSkills.length > 0) {
    reasons.push(
      `${matchedSkills.length}/${jobSkills.length} skills match`
    );
  } else {
    reasons.push("No direct skill matches");
  }

  if (
    job.location &&
    profile.location &&
    job.location
      .toLowerCase()
      .includes(profile.location.split(",")[0].trim().toLowerCase())
  ) {
    score += 20;
    reasons.push("Location match");
  } else if (
    job.type === "remote" ||
    job.type === "Remote" ||
    job.location?.toLowerCase().includes("remote")
  ) {
    score += 20;
    reasons.push("Remote — flexible location");
  }

  if (job.category && profile.category && job.category === profile.category) {
    score += 10;
    reasons.push("Category match");
  }

  const finalScore = Math.min(100, Math.round(score));

  const reasonText = reasons.slice(0, 2).join(" • ");

  return {
    job,
    score: finalScore,
    matchedSkills,
    reason: reasonText,
  };
}

/* ───────────────────── Default Jobs ───────────────────── */
const DEFAULT_JOBS: Job[] = [
  {
    id: 1,
    title: "Senior Frontend Developer",
    skills: ["React", "TypeScript", "Tailwind"],
    type: "full-time",
    location: "Lusaka, Zambia",
    salary: "ZMW 15,000 - 25,000",
    category: "engineering",
  },
  {
    id: 2,
    title: "Product Designer",
    skills: ["Figma", "UX Design", "Prototyping"],
    type: "full-time",
    location: "Lusaka, Zambia",
    salary: "ZMW 12,000 - 18,000",
    category: "design",
  },
  {
    id: 3,
    title: "Backend Engineer",
    skills: ["Python", "Node.js", "PostgreSQL"],
    type: "full-time",
    location: "Accra, Ghana",
    salary: "GHS 8,000 - 12,000",
    category: "engineering",
  },
  {
    id: 4,
    title: "UX Researcher",
    skills: ["User Research", "Interviewing", "Analysis"],
    type: "contract",
    location: "Lagos, Nigeria",
    salary: "₦500,000 - 700,000",
    category: "design",
  },
  {
    id: 5,
    title: "Data Scientist",
    skills: ["Python", "Machine Learning", "SQL"],
    type: "full-time",
    location: "Nairobi, Kenya",
    salary: "KES 150,000 - 200,000",
    category: "data",
  },
  {
    id: 6,
    title: "Mobile Developer",
    skills: ["React Native", "Flutter", "Firebase"],
    type: "full-time",
    location: "Dakar, Senegal",
    salary: "CFA 800,000 - 1,200,000",
    category: "engineering",
  },
  {
    id: 7,
    title: "Marketing Strategist",
    skills: ["Marketing", "Growth Hacking", "Analytics", "Copywriting"],
    type: "full-time",
    location: "Harare, Zimbabwe",
    salary: "USD 3,500 - 5,000/month",
    category: "marketing",
  },
  {
    id: 8,
    title: "DevOps Engineer",
    skills: ["AWS", "Docker", "Kubernetes", "Terraform"],
    type: "remote",
    location: "Remote (Africa)",
    salary: "USD 4,000 - 6,000/month",
    category: "engineering",
  },
  {
    id: 9,
    title: "AI Researcher - NLP",
    skills: ["Python", "PyTorch", "NLP", "Research"],
    type: "full-time",
    location: "Kigali, Rwanda",
    salary: "USD 5,000 - 7,000/month",
    category: "data",
  },
  {
    id: 10,
    title: "Agricultural Engineer",
    skills: ["Irrigation", "Soil Science", "Project Management"],
    type: "contract",
    location: "Dar es Salaam, Tanzania",
    salary: "TZS 2,500,000 - 3,500,000",
    category: "engineering",
  },
  {
    id: 11,
    title: "Public Health Program Manager",
    skills: ["Public Health", "Program Management", "Research"],
    type: "full-time",
    location: "Cairo, Egypt",
    salary: "EGP 25,000 - 35,000",
    category: "health",
  },
  {
    id: 12,
    title: "Youth Development Coordinator",
    skills: ["Counseling", "Public Speaking", "Community Organizing"],
    type: "part-time",
    location: "Lusaka, Zambia",
    salary: "ZMW 8,000 - 12,000",
    category: "community",
  },
];

/* ───────────────────── Get Jobs from localStorage ───────────────────── */
function getAllJobs(): Job[] {
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
  const all = localJobs.length > 0
    ? [...DEFAULT_JOBS, ...localJobs]
    : DEFAULT_JOBS;
  return all.filter(
    (j, i, arr) => arr.findIndex((t) => t.id === j.id) === i
  );
}

/* ───────────────────── Get Profile from localStorage ───────────────────── */
function getProfile(): Profile {
  try {
    const stored = localStorage.getItem("talent_profile");
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed && typeof parsed === "object") return parsed;
    }
  } catch {
    /* ignore */
  }
  try {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      const user = JSON.parse(userStr);
      return {
        skills: user.skills || ["React", "TypeScript"],
        location: user.location || "Lusaka, Zambia",
        category: user.category || "engineering",
      };
    }
  } catch {
    /* ignore */
  }
  return {
    skills: ["React", "TypeScript", "Tailwind"],
    location: "Lusaka, Zambia",
    category: "engineering",
  };
}

/* ───────────────────── Score Badge Color ───────────────────── */
function getScoreColor(score: number): string {
  if (score > 80) return "bg-[#C6FF34] text-black";
  if (score >= 60) return "bg-[#7E3BED] text-white";
  return "bg-white/[0.06] text-[#666666]";
}

function getScoreLabel(score: number): string {
  if (score > 80) return "Excellent";
  if (score >= 60) return "Good";
  return "Developing";
}

/* ───────────────────── Animation Variants ───────────────────── */
const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.5, ease: [0.19, 1, 0.22, 1] },
  }),
};

/* ───────────────────── Widget ───────────────────── */
interface SmartMatchWidgetProps {
  limit?: number;
  showViewAll?: boolean;
}

export default function SmartMatchWidget({
  limit = 3,
  showViewAll = true,
}: SmartMatchWidgetProps) {
  const navigate = useNavigate();
  const [matches, setMatches] = useState<MatchResult[]>([]);

  useEffect(() => {
    const jobs = getAllJobs();
    const profile = getProfile();
    const scored = jobs.map((job) => calculateMatchScore(job, profile));
    scored.sort((a, b) => b.score - a.score);
    setMatches(scored);
  }, []);

  const topMatches = useMemo(() => matches.slice(0, limit), [matches, limit]);

  const handleApply = (jobId: number) => {
    navigate(`/apply/${jobId}`);
  };

  if (matches.length === 0) {
    return (
      <div className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.06] rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-5 h-5 text-[#C6FF34]" />
          <h3 className="text-white font-semibold">Smart Matches</h3>
        </div>
        <div className="text-center py-6">
          <Briefcase className="w-8 h-8 text-[#666666] mx-auto mb-2" />
          <p className="text-[#666666] text-sm">No jobs available yet</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.06] rounded-2xl p-6 hover:border-white/[0.1] transition-all"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.19, 1, 0.22, 1] }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#C6FF34]/10 flex items-center justify-center">
            <Zap className="w-4 h-4 text-[#C6FF34]" />
          </div>
          <div>
            <h3 className="text-white font-semibold text-sm">Smart Matches</h3>
            <p className="text-[#666666] text-xs">AI-powered job recommendations</p>
          </div>
        </div>
        {showViewAll && (
          <Link
            to="/smart-match"
            className="text-[#A0A0A0] text-xs hover:text-[#C6FF34] transition-colors flex items-center gap-1"
          >
            See All
            <ArrowRight className="w-3 h-3" />
          </Link>
        )}
      </div>

      {/* Match Cards */}
      <div className="space-y-3">
        {topMatches.map((match, i) => (
          <motion.div
            key={match.job.id}
            className="bg-white/[0.02] border border-white/[0.04] rounded-xl p-4 hover:border-white/[0.08] transition-all group"
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={i}
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1 min-w-0">
                <h4 className="text-white text-sm font-medium group-hover:text-[#C6FF34] transition-colors truncate">
                  {match.job.title}
                </h4>
                <p className="text-[#666666] text-xs">
                  {match.job.company || getCompanyName(match.job.title)}
                </p>
              </div>
              <span
                className={`text-xs font-bold px-2.5 py-1 rounded-full flex-shrink-0 ml-2 ${getScoreColor(
                  match.score
                )}`}
              >
                {match.score}%
              </span>
            </div>

            <div className="flex items-center gap-2 text-[#666666] text-xs mb-2">
              <MapPin className="w-3 h-3" />
              <span>{match.job.location}</span>
              <span className="text-white/20">&#8226;</span>
              <span className="bg-white/[0.05] rounded px-1.5 py-0.5">
                {match.job.type}
              </span>
            </div>

            <p className="text-[#888888] text-xs mb-3">{match.reason}</p>

            <div className="flex items-center justify-between">
              {match.job.salary && (
                <span className="text-[#C6FF34] text-xs font-medium">
                  {match.job.salary}
                </span>
              )}
              <button
                onClick={() => handleApply(match.job.id)}
                className="ml-auto text-[#A0A0A0] text-xs hover:text-[#C6FF34] transition-colors flex items-center gap-1"
              >
                Apply
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

/* ───────────────────── Hook for consuming matches ───────────────────── */
export function useSmartMatches() {
  const [matches, setMatches] = useState<MatchResult[]>([]);
  const [profile, setProfile] = useState<Profile>({});

  useEffect(() => {
    const jobs = getAllJobs();
    const prof = getProfile();
    setProfile(prof);
    const scored = jobs.map((job) => calculateMatchScore(job, prof));
    scored.sort((a, b) => b.score - a.score);
    setMatches(scored);
  }, []);

  return { matches, profile };
}
