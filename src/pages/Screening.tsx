import { useState, useMemo, useCallback } from "react";
import { Link } from "react-router";
import { motion, AnimatePresence } from "framer-motion";
import {
  Filter,
  Target,
  Save,
  Eye,
  CheckCircle2,
  X,
  MapPin,
  Briefcase,
  Globe,
  Code2,
  Star,
  Users,
  ToggleLeft,
  ToggleRight,
  ArrowLeft,
  Sparkles,
  Zap,
  Layers,
  Clock,
} from "lucide-react";

/* ───────────────────── Types ───────────────────── */
interface ScreeningCriteria {
  requiredSkills: string[];
  experience: string;
  location: string;
  categories: string[];
  availability: boolean;
  language: string;
}

interface Talent {
  id: string | number;
  name: string;
  bio?: string;
  category?: string;
  skills?: string[];
  location?: string;
  rate?: string;
  wri?: number;
  role?: string;
  experience?: string;
  availability?: boolean;
  languages?: string[];
  avatar?: string;
}

interface TalentMatch {
  talent: Talent;
  matchPercent: number;
}

/* ───────────────────── Constants ───────────────────── */
const SKILLS_OPTIONS = [
  "React", "TypeScript", "Node.js", "Python", "JavaScript",
  "UI/UX Design", "Figma", "Product Management", "Data Analysis",
  "AWS", "PostgreSQL", "Tailwind", "Mobile Development",
  "AI / Machine Learning", "Cybersecurity", "Cloud Computing",
  "Marketing", "Sales", "Project Management", "Graphic Design",
];

const EXPERIENCE_OPTIONS = [
  { value: "", label: "Any" },
  { value: "0-1", label: "0-1 years" },
  { value: "1-3", label: "1-3 years" },
  { value: "3-5", label: "3-5 years" },
  { value: "5-10", label: "5-10 years" },
  { value: "10+", label: "10+ years" },
];

const COUNTRIES = [
  { value: "", label: "Any" },
  { value: "Zambia", label: "Zambia" },
  { value: "Nigeria", label: "Nigeria" },
  { value: "Kenya", label: "Kenya" },
  { value: "Ghana", label: "Ghana" },
  { value: "South Africa", label: "South Africa" },
  { value: "Rwanda", label: "Rwanda" },
  { value: "Uganda", label: "Uganda" },
  { value: "Tanzania", label: "Tanzania" },
];

const CATEGORIES = [
  "Technology",
  "Design",
  "Business",
  "Healthcare",
  "Education",
  "Agriculture",
  "Marketing",
];

const LANGUAGES = [
  { value: "", label: "Any" },
  { value: "English", label: "English" },
  { value: "French", label: "French" },
  { value: "Swahili", label: "Swahili" },
  { value: "Portuguese", label: "Portuguese" },
];

const DEFAULT_CRITERIA: ScreeningCriteria = {
  requiredSkills: [],
  experience: "",
  location: "",
  categories: [],
  availability: false,
  language: "",
};

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

const slideUp = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.19, 1, 0.22, 1] },
  },
};

/* ───────────────────── Input Style Classes ───────────────────── */
const inputBaseClass =
  "w-full px-4 py-3 bg-white/[0.05] border border-white/[0.12] rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:border-[#C6FF34] focus:ring-2 focus:ring-[#C6FF34]/20 focus:bg-white/[0.08] hover:border-white/[0.2] transition-all duration-200 text-sm";

const selectBaseClass =
  "w-full px-4 py-3 bg-white/[0.05] border border-white/[0.12] rounded-xl text-white focus:outline-none focus:border-[#C6FF34] focus:ring-2 focus:ring-[#C6FF34]/20 focus:bg-white/[0.08] hover:border-white/[0.2] transition-all duration-200 text-sm appearance-none cursor-pointer";

const labelBaseClass = "block text-white/70 text-sm font-medium mb-2";

/* ───────────────────── localStorage Helpers ───────────────────── */
function loadCriteria(): ScreeningCriteria {
  try {
    const stored = localStorage.getItem("screening_criteria");
    if (stored) return { ...DEFAULT_CRITERIA, ...JSON.parse(stored) };
  } catch {
    // ignore
  }
  return { ...DEFAULT_CRITERIA };
}

function loadApplyToAll(): boolean {
  try {
    const stored = localStorage.getItem("screening_apply_to_all");
    if (stored) return JSON.parse(stored);
  } catch {
    // ignore
  }
  return false;
}

function loadTalentProfiles(): Talent[] {
  try {
    const stored = localStorage.getItem("talent_profiles");
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {
    // ignore
  }
  // Return default mock talents if none found
  return [
    {
      id: "1",
      name: "Mutale Mwanza",
      bio: "Full-stack developer with 6 years experience building fintech platforms across Africa.",
      category: "Technology",
      skills: ["React", "TypeScript", "Node.js", "PostgreSQL", "AWS"],
      location: "Lusaka, Zambia",
      rate: "ZMW 800/hour",
      wri: 87,
      role: "Senior Frontend Developer",
      experience: "5-10",
      availability: true,
      languages: ["English"],
    },
    {
      id: "2",
      name: "Grace Lungu",
      bio: "Product designer specializing in user-centered design for mobile and web applications.",
      category: "Design",
      skills: ["Figma", "UI/UX Design", "Prototyping", "User Research"],
      location: "Lusaka, Zambia",
      rate: "ZMW 600/hour",
      wri: 82,
      role: "Product Designer",
      experience: "3-5",
      availability: true,
      languages: ["English"],
    },
    {
      id: "3",
      name: "Kofi Mensah",
      bio: "Backend engineer with deep expertise in distributed systems and cloud architecture.",
      category: "Technology",
      skills: ["Python", "AWS", "PostgreSQL", "Node.js", "Cybersecurity"],
      location: "Accra, Ghana",
      rate: "ZMW 900/hour",
      wri: 91,
      role: "Backend Engineer",
      experience: "5-10",
      availability: false,
      languages: ["English"],
    },
    {
      id: "4",
      name: "Amara Okafor",
      bio: "Data scientist passionate about using AI to solve African business challenges.",
      category: "Technology",
      skills: ["Python", "Data Analysis", "AI / Machine Learning", "PostgreSQL"],
      location: "Lagos, Nigeria",
      rate: "ZMW 750/hour",
      wri: 78,
      role: "Data Scientist",
      experience: "3-5",
      availability: true,
      languages: ["English"],
    },
    {
      id: "5",
      name: "Zara Ibrahim",
      bio: "Mobile developer building cross-platform apps for emerging markets.",
      category: "Technology",
      skills: ["Mobile Development", "React", "TypeScript", "JavaScript"],
      location: "Nairobi, Kenya",
      rate: "ZMW 650/hour",
      wri: 85,
      role: "Mobile Developer",
      experience: "1-3",
      availability: true,
      languages: ["English", "Swahili"],
    },
    {
      id: "6",
      name: "Tendai Mutasa",
      bio: "UX researcher with a focus on accessibility and inclusive design.",
      category: "Design",
      skills: ["User Research", "UI/UX Design", "Figma", "Prototyping"],
      location: "Harare, Zimbabwe",
      rate: "ZMW 500/hour",
      wri: 72,
      role: "UX Researcher",
      experience: "1-3",
      availability: true,
      languages: ["English"],
    },
    {
      id: "7",
      name: "Nia Johnson",
      bio: "Cloud architect helping companies migrate to scalable cloud infrastructure.",
      category: "Technology",
      skills: ["AWS", "Cloud Computing", "Cybersecurity", "Node.js"],
      location: "Kigali, Rwanda",
      rate: "ZMW 1000/hour",
      wri: 93,
      role: "Cloud Architect",
      experience: "10+",
      availability: true,
      languages: ["English", "French"],
    },
    {
      id: "8",
      name: "David Okonjo",
      bio: "Full-stack developer with a passion for clean code and agile methodologies.",
      category: "Technology",
      skills: ["React", "TypeScript", "Python", "PostgreSQL", "AWS"],
      location: "Lagos, Nigeria",
      rate: "ZMW 850/hour",
      wri: 88,
      role: "Full Stack Developer",
      experience: "5-10",
      availability: true,
      languages: ["English"],
    },
  ];
}

/* ───────────────────── Match Calculation ───────────────────── */
function calculateScreeningMatch(talent: Talent, criteria: ScreeningCriteria): number {
  let score = 0;
  let maxScore = 0;


  if (criteria.requiredSkills?.length) {
    maxScore += 40;
    const matched = criteria.requiredSkills.filter((s: string) =>
      talent.skills?.includes(s)
    ).length;
    score += (matched / criteria.requiredSkills.length) * 40;
  }

  if (criteria.experience) {
    maxScore += 15;
    // Simple match: exact or higher bracket
    const order = ["0-1", "1-3", "3-5", "5-10", "10+"];
    const talentIdx = order.indexOf(talent.experience || "");
    const criteriaIdx = order.indexOf(criteria.experience);
    if (talentIdx >= criteriaIdx) score += 15;
  }

  if (criteria.location) {
    maxScore += 15;
    if (talent.location?.includes(criteria.location)) score += 15;
  }

  return maxScore > 0 ? Math.round((score / maxScore) * 100) : 100;
}

/* ───────────────────── Score Color Helpers ───────────────────── */
function getScoreColor(score: number): string {
  if (score >= 80) return "#C6FF34";
  if (score >= 60) return "#7E3BED";
  return "#666666";
}

function getScoreRingColor(score: number): string {
  if (score >= 80) return "stroke-[#C6FF34]";
  if (score >= 60) return "stroke-[#7E3BED]";
  return "stroke-[#666666]";
}

function getScoreLabel(score: number): string {
  if (score >= 80) return "Excellent";
  if (score >= 60) return "Good";
  return "Fair";
}

/* ───────────────────── Circular Score Ring ───────────────────── */
function CircularScore({ score, size = 56 }: { score: number; size?: number }) {
  const strokeWidth = 4.5;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="relative flex-shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth={strokeWidth}
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          className={getScoreRingColor(score)}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeLinecap="round"
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1, ease: [0.19, 1, 0.22, 1] }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span
          className="font-bold text-sm leading-none"
          style={{ color: getScoreColor(score) }}
        >
          {score}%
        </span>
      </div>
    </div>
  );
}

/* ───────────────────── Skills Tag Input ───────────────────── */
function SkillsTagInput({
  skills,
  onChange,
}: {
  skills: string[];
  onChange: (skills: string[]) => void;
}) {
  const [input, setInput] = useState("");
  const [isOpen, setIsOpen] = useState(false);

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

  const togglePresetSkill = (skill: string) => {
    if (skills.includes(skill)) {
      onChange(skills.filter((s) => s !== skill));
    } else {
      onChange([...skills, skill]);
    }
  };

  return (
    <div className="space-y-3">
      {/* Tag Input Field */}
      <div
        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 focus-within:border-[#C6FF34] focus-within:ring-2 focus-within:ring-[#C6FF34]/20 transition-all cursor-text"
        onClick={() => setIsOpen(true)}
      >
        <div className="flex flex-wrap gap-2">
          {skills.map((skill, i) => (
            <span
              key={i}
              className="bg-[#C6FF34]/15 text-[#C6FF34] text-xs font-medium px-2.5 py-1 rounded-lg flex items-center gap-1"
            >
              {skill}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  removeSkill(i);
                }}
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

      {/* Preset Skills Grid */}
      <div>
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="text-white/40 text-xs hover:text-[#C6FF34] transition-colors flex items-center gap-1 mb-2"
        >
          {isOpen ? "Hide" : "Show"} suggested skills
          <span
            className={`transition-transform ${isOpen ? "rotate-180" : ""}`}
          >
            <svg width="10" height="6" viewBox="0 0 10 6" fill="none">
              <path
                d="M1 1L5 5L9 1"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
        </button>
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="flex flex-wrap gap-1.5">
                {SKILLS_OPTIONS.map((skill) => {
                  const isSelected = skills.includes(skill);
                  return (
                    <motion.button
                      key={skill}
                      type="button"
                      onClick={() => togglePresetSkill(skill)}
                      className={`py-1.5 px-2.5 rounded-lg text-xs font-medium border transition-all duration-200 ${
                        isSelected
                          ? "border-[#C6FF34]/50 bg-[#C6FF34]/10 text-[#C6FF34]"
                          : "border-white/[0.1] text-white/50 hover:border-white/[0.2] hover:text-white/80"
                      }`}
                      whileTap={{ scale: 0.95 }}
                    >
                      {skill}
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

/* ───────────────────── Category Multi-Select ───────────────────── */
function CategoryMultiSelect({
  selected,
  onChange,
}: {
  selected: string[];
  onChange: (categories: string[]) => void;
}) {
  const toggle = (cat: string) => {
    if (selected.includes(cat)) {
      onChange(selected.filter((c) => c !== cat));
    } else {
      onChange([...selected, cat]);
    }
  };

  return (
    <div className="flex flex-wrap gap-2">
      {CATEGORIES.map((cat) => {
        const isSelected = selected.includes(cat);
        return (
          <motion.button
            key={cat}
            type="button"
            onClick={() => toggle(cat)}
            className={`py-2 px-3.5 rounded-xl text-sm font-medium border transition-all duration-200 ${
              isSelected
                ? "border-[#C6FF34]/50 bg-[#C6FF34]/10 text-[#C6FF34]"
                : "border-white/[0.1] text-white/60 hover:border-white/[0.2] hover:text-white"
            }`}
            whileTap={{ scale: 0.96 }}
          >
            {cat}
          </motion.button>
        );
      })}
    </div>
  );
}

/* ───────────────────── Talent Preview Card ───────────────────── */
function TalentPreviewCard({
  match,
  index,
}: {
  match: TalentMatch;
  index: number;
}) {
  const { talent, matchPercent } = match;
  const initials = talent.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2);

  return (
    <motion.div
      className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.06] rounded-2xl p-5 hover:border-white/[0.12] hover:bg-white/[0.05] transition-all group"
      variants={fadeUp}
      initial="hidden"
      animate="visible"
      custom={index}
      layout
    >
      <div className="flex items-start gap-4">
        {/* Avatar */}
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#C6FF34]/30 to-[#7E3BED]/30 flex items-center justify-center text-white text-sm font-bold border border-white/[0.08] flex-shrink-0">
          {initials}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="text-white font-semibold text-sm group-hover:text-[#C6FF34] transition-colors">
                {talent.name}
              </h3>
              <p className="text-white/40 text-xs">{talent.role}</p>
            </div>
            <CircularScore score={matchPercent} size={48} />
          </div>

          {/* Meta */}
          <div className="flex flex-wrap items-center gap-2 mt-2 text-xs text-white/40">
            <span className="flex items-center gap-1">
              <MapPin size={11} className="text-white/30" />
              {talent.location}
            </span>
            {talent.availability && (
              <>
                <span className="text-white/20">&#8226;</span>
                <span className="flex items-center gap-1 text-emerald-400">
                  <CheckCircle2 size={11} />
                  Available
                </span>
              </>
            )}
          </div>

          {/* Skills */}
          {talent.skills && talent.skills.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-3">
              {talent.skills.slice(0, 4).map((skill, i) => (
                <span
                  key={skill}
                  className="text-[10px] px-2 py-0.5 rounded-md bg-white/[0.05] text-white/50"
                >
                  {skill}
                </span>
              ))}
              {talent.skills.length > 4 && (
                <span className="text-[10px] px-2 py-0.5 rounded-md bg-white/[0.05] text-white/30">
                  +{talent.skills.length - 4}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

/* ───────────────────── Main Page ───────────────────── */
export default function Screening() {
  const [criteria, setCriteria] = useState<ScreeningCriteria>(loadCriteria);
  const [applyToAll, setApplyToAll] = useState(loadApplyToAll);
  const [showPreview, setShowPreview] = useState(false);
  const [savedMessage, setSavedMessage] = useState("");

  // Load talent data
  const talents = useMemo(() => loadTalentProfiles(), []);

  // Calculate matches
  const matches = useMemo<TalentMatch[]>(() => {
    if (!showPreview) return [];
    return talents
      .map((talent) => ({
        talent,
        matchPercent: calculateScreeningMatch(talent, criteria),
      }))
      .sort((a, b) => b.matchPercent - a.matchPercent);
  }, [talents, criteria, showPreview]);

  const topMatches = useMemo(() => matches.slice(0, 3), [matches]);
  const matchCount = matches.filter((m) => m.matchPercent > 0).length;

  // Update criteria field
  const updateField = useCallback(<K extends keyof ScreeningCriteria>(
    field: K,
    value: ScreeningCriteria[K]
  ) => {
    setCriteria((prev) => ({ ...prev, [field]: value }));
    setSavedMessage("");
  }, []);

  // Save criteria
  const handleSave = useCallback(() => {
    localStorage.setItem("screening_criteria", JSON.stringify(criteria));
    localStorage.setItem("screening_apply_to_all", JSON.stringify(applyToAll));
    setSavedMessage("Criteria saved successfully!");
    setTimeout(() => setSavedMessage(""), 3000);
  }, [criteria, applyToAll]);

  // Toggle apply to all
  const handleToggleApplyToAll = useCallback(() => {
    setApplyToAll((prev) => {
      const next = !prev;
      localStorage.setItem("screening_apply_to_all", JSON.stringify(next));
      return next;
    });
  }, []);

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
          {/* Back link */}
          <motion.div
            className="mb-6"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Link
              to="/employer/jobs"
              className="text-[#A0A0A0] text-sm hover:text-[#C6FF34] transition-colors flex items-center gap-1.5"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Jobs
            </Link>
          </motion.div>

          {/* Badge */}
          <motion.div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#C6FF34]/10 border border-[#C6FF34]/20 mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.19, 1, 0.22, 1] }}
          >
            <Filter className="w-4 h-4 text-[#C6FF34]" />
            <span className="text-[#C6FF34] text-sm font-medium">
              Auto-Screening
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
            Auto-Screening Setup
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            className="text-white/50 text-lg max-w-2xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.7,
              delay: 0.2,
              ease: [0.19, 1, 0.22, 1],
            }}
          >
            Set criteria to automatically filter applicants. Only matching talent
            will be able to apply to your job postings.
          </motion.p>
        </div>
      </section>

      {/* ─── Main Content ─── */}
      <section className="relative pb-24">
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid lg:grid-cols-5 gap-8">
            {/* ─── Left Column: Criteria Builder (3 cols) ─── */}
            <div className="lg:col-span-3 space-y-6">
              {/* Section 1: Criteria Builder */}
              <motion.div
                className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.06] rounded-2xl p-6"
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2, ease: [0.19, 1, 0.22, 1] }}
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-9 h-9 rounded-xl bg-[#C6FF34]/10 flex items-center justify-center">
                    <Target size={18} className="text-[#C6FF34]" />
                  </div>
                  <div>
                    <h2 className="text-white text-lg font-semibold">
                      Criteria Builder
                    </h2>
                    <p className="text-white/40 text-xs">
                      Define what makes a candidate qualified
                    </p>
                  </div>
                </div>

                <div className="space-y-5">
                  {/* Required Skills */}
                  <div>
                    <label className={labelBaseClass}>Required Skills</label>
                    <SkillsTagInput
                      skills={criteria.requiredSkills}
                      onChange={(skills) => updateField("requiredSkills", skills)}
                    />
                  </div>

                  {/* Minimum Experience */}
                  <div>
                    <label className={labelBaseClass}>Minimum Experience</label>
                    <div className="relative">
                      <select
                        value={criteria.experience}
                        onChange={(e) =>
                          updateField("experience", e.target.value)
                        }
                        className={selectBaseClass}
                      >
                        {EXPERIENCE_OPTIONS.map((opt) => (
                          <option
                            key={opt.value}
                            value={opt.value}
                            className="bg-[#0A0A0A] text-white"
                          >
                            {opt.label}
                          </option>
                        ))}
                      </select>
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-white/40">
                        <svg
                          width="12"
                          height="8"
                          viewBox="0 0 12 8"
                          fill="none"
                        >
                          <path
                            d="M1 1.5L6 6.5L11 1.5"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </div>
                    </div>
                  </div>

                  {/* Location */}
                  <div>
                    <label className={labelBaseClass}>Location</label>
                    <div className="relative">
                      <Globe
                        size={16}
                        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none"
                      />
                      <select
                        value={criteria.location}
                        onChange={(e) =>
                          updateField("location", e.target.value)
                        }
                        className={`${selectBaseClass} pl-10`}
                      >
                        {COUNTRIES.map((c) => (
                          <option
                            key={c.value}
                            value={c.value}
                            className="bg-[#0A0A0A] text-white"
                          >
                            {c.label}
                          </option>
                        ))}
                      </select>
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-white/40">
                        <svg
                          width="12"
                          height="8"
                          viewBox="0 0 12 8"
                          fill="none"
                        >
                          <path
                            d="M1 1.5L6 6.5L11 1.5"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </div>
                    </div>
                  </div>

                  {/* Category Multi-Select */}
                  <div>
                    <label className={labelBaseClass}>Category</label>
                    <CategoryMultiSelect
                      selected={criteria.categories}
                      onChange={(cats) => updateField("categories", cats)}
                    />
                  </div>

                  {/* Availability Toggle */}
                  <div className="flex items-center justify-between py-2 px-4 bg-white/[0.02] border border-white/[0.06] rounded-xl">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                          criteria.availability
                            ? "bg-emerald-500/15"
                            : "bg-white/5"
                        }`}
                      >
                        <Users
                          size={16}
                          className={
                            criteria.availability
                              ? "text-emerald-400"
                              : "text-white/30"
                          }
                        />
                      </div>
                      <div>
                        <p className="text-white text-sm font-medium">
                          Available for hire
                        </p>
                        <p className="text-white/30 text-xs">
                          Only show candidates open to work
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        updateField("availability", !criteria.availability)
                      }
                      className="transition-colors"
                    >
                      {criteria.availability ? (
                        <ToggleRight
                          size={36}
                          className="text-[#C6FF34]"
                        />
                      ) : (
                        <ToggleLeft
                          size={36}
                          className="text-white/20"
                        />
                      )}
                    </button>
                  </div>

                  {/* Language */}
                  <div>
                    <label className={labelBaseClass}>Language</label>
                    <div className="relative">
                      <select
                        value={criteria.language}
                        onChange={(e) =>
                          updateField("language", e.target.value)
                        }
                        className={selectBaseClass}
                      >
                        {LANGUAGES.map((l) => (
                          <option
                            key={l.value}
                            value={l.value}
                            className="bg-[#0A0A0A] text-white"
                          >
                            {l.label}
                          </option>
                        ))}
                      </select>
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-white/40">
                        <svg
                          width="12"
                          height="8"
                          viewBox="0 0 12 8"
                          fill="none"
                        >
                          <path
                            d="M1 1.5L6 6.5L11 1.5"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Section 3: Save & Apply */}
              <motion.div
                className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.06] rounded-2xl p-6"
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4, ease: [0.19, 1, 0.22, 1] }}
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-9 h-9 rounded-xl bg-[#7E3BED]/15 flex items-center justify-center">
                    <Save size={18} className="text-[#7E3BED]" />
                  </div>
                  <div>
                    <h2 className="text-white text-lg font-semibold">
                      Save &amp; Apply
                    </h2>
                    <p className="text-white/40 text-xs">
                      Store criteria and apply to job postings
                    </p>
                  </div>
                </div>

                {/* Apply to All Toggle */}
                <div className="flex items-center justify-between py-3 px-4 bg-white/[0.02] border border-white/[0.06] rounded-xl mb-5">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                        applyToAll ? "bg-[#C6FF34]/15" : "bg-white/5"
                      }`}
                    >
                      <Zap
                        size={16}
                        className={
                          applyToAll ? "text-[#C6FF34]" : "text-white/30"
                        }
                      />
                    </div>
                    <div>
                      <p className="text-white text-sm font-medium">
                        Apply to All Job Postings
                      </p>
                      <p className="text-white/30 text-xs">
                        Use this criteria across all your listings
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleToggleApplyToAll}
                    className="transition-colors"
                  >
                    {applyToAll ? (
                      <ToggleRight
                        size={36}
                        className="text-[#C6FF34]"
                      />
                    ) : (
                      <ToggleLeft
                        size={36}
                        className="text-white/20"
                      />
                    )}
                  </button>
                </div>

                {/* Link to existing jobs */}
                <div className="mb-5">
                  <Link
                    to="/employer/jobs"
                    className="inline-flex items-center gap-2 text-[#A0A0A0] text-sm hover:text-[#C6FF34] transition-colors"
                  >
                    <Briefcase size={14} />
                    Manage your job postings
                    <ArrowLeft size={12} className="rotate-180" />
                  </Link>
                </div>

                {/* Save Button */}
                <motion.button
                  onClick={handleSave}
                  className="btn-lime flex items-center gap-2 w-full justify-center"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Save size={16} />
                  Save Screening Criteria
                </motion.button>

                {/* Saved confirmation */}
                <AnimatePresence>
                  {savedMessage && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="mt-4 flex items-center gap-2 text-emerald-400 text-sm justify-center"
                    >
                      <CheckCircle2 size={16} />
                      {savedMessage}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            </div>

            {/* ─── Right Column: Preview Results (2 cols) ─── */}
            <div className="lg:col-span-2 space-y-6">
              {/* Section 2: Preview Results */}
              <motion.div
                className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.06] rounded-2xl p-6 sticky top-24"
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3, ease: [0.19, 1, 0.22, 1] }}
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-9 h-9 rounded-xl bg-[#C6FF34]/10 flex items-center justify-center">
                    <Eye size={18} className="text-[#C6FF34]" />
                  </div>
                  <div>
                    <h2 className="text-white text-lg font-semibold">
                      Preview Results
                    </h2>
                    <p className="text-white/40 text-xs">
                      See matching talent in real time
                    </p>
                  </div>
                </div>

                {/* Preview Button */}
                <motion.button
                  onClick={() => setShowPreview(true)}
                  className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-white/5 border border-white/[0.1] text-white text-sm font-medium hover:bg-white/10 hover:border-[#C6FF34]/30 transition-all mb-5"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Sparkles size={16} className="text-[#C6FF34]" />
                  Preview Matching Talent
                </motion.button>

                {/* Match Count */}
                <AnimatePresence>
                  {showPreview && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="flex items-center gap-2 mb-4 pb-4 border-b border-white/[0.06]">
                        <Users size={16} className="text-[#C6FF34]" />
                        <span className="text-white text-sm font-medium">
                          {matchCount} talent{matchCount !== 1 ? "s" : ""} match
                          your criteria
                        </span>
                      </div>

                      {/* Top 3 Match Cards */}
                      {topMatches.length > 0 ? (
                        <motion.div
                          className="space-y-3"
                          variants={staggerContainer}
                          initial="hidden"
                          animate="visible"
                        >
                          {topMatches.map((match, index) => (
                            <TalentPreviewCard
                              key={match.talent.id}
                              match={match}
                              index={index}
                            />
                          ))}
                        </motion.div>
                      ) : (
                        <motion.div
                          className="text-center py-8"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                        >
                          <Users
                            size={36}
                            className="mx-auto mb-3 text-white/20"
                          />
                          <p className="text-white/40 text-sm">
                            No talent matches your criteria
                          </p>
                          <p className="text-white/25 text-xs mt-1">
                            Try adjusting your filters
                          </p>
                        </motion.div>
                      )}

                      {/* Summary Stats */}
                      {matches.length > 0 && (
                        <motion.div
                          className="mt-4 pt-4 border-t border-white/[0.06] space-y-2"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.3 }}
                        >
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-white/40">Excellent (80%+)</span>
                            <span className="text-[#C6FF34] font-medium">
                              {matches.filter((m) => m.matchPercent >= 80).length}
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-white/40">Good (60-79%)</span>
                            <span className="text-[#7E3BED] font-medium">
                              {
                                matches.filter(
                                  (m) =>
                                    m.matchPercent >= 60 && m.matchPercent < 80
                                ).length
                              }
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-white/40">Below 60%</span>
                            <span className="text-white/30 font-medium">
                              {matches.filter((m) => m.matchPercent < 60).length}
                            </span>
                          </div>
                        </motion.div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Active Criteria Summary */}
                <div className="mt-5 pt-4 border-t border-white/[0.06]">
                  <p className="text-white/30 text-xs font-medium uppercase tracking-wider mb-3">
                    Active Filters
                  </p>
                  <div className="space-y-2">
                    {criteria.requiredSkills.length > 0 && (
                      <div className="flex items-center gap-2 text-xs">
                        <Code2 size={12} className="text-[#C6FF34]" />
                        <span className="text-white/50">
                          {criteria.requiredSkills.length} skill
                          {criteria.requiredSkills.length !== 1 ? "s" : ""}
                        </span>
                      </div>
                    )}
                    {criteria.experience && (
                      <div className="flex items-center gap-2 text-xs">
                        <Clock size={12} className="text-[#C6FF34]" />
                        <span className="text-white/50">
                          {criteria.experience} yrs exp
                        </span>
                      </div>
                    )}
                    {criteria.location && (
                      <div className="flex items-center gap-2 text-xs">
                        <MapPin size={12} className="text-[#C6FF34]" />
                        <span className="text-white/50">{criteria.location}</span>
                      </div>
                    )}
                    {criteria.categories.length > 0 && (
                      <div className="flex items-center gap-2 text-xs">
                        <Layers size={12} className="text-[#C6FF34]" />
                        <span className="text-white/50">
                          {criteria.categories.join(", ")}
                        </span>
                      </div>
                    )}
                    {criteria.availability && (
                      <div className="flex items-center gap-2 text-xs">
                        <Users size={12} className="text-emerald-400" />
                        <span className="text-emerald-400/70">
                          Available only
                        </span>
                      </div>
                    )}
                    {criteria.language && (
                      <div className="flex items-center gap-2 text-xs">
                        <Globe size={12} className="text-[#C6FF34]" />
                        <span className="text-white/50">
                          {criteria.language}
                        </span>
                      </div>
                    )}
                    {!criteria.requiredSkills.length &&
                      !criteria.experience &&
                      !criteria.location &&
                      !criteria.categories.length &&
                      !criteria.availability &&
                      !criteria.language && (
                        <p className="text-white/25 text-xs">
                          No filters applied yet
                        </p>
                      )}
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
