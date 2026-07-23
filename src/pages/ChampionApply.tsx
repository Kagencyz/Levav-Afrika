import React from "react";
import { Link, useNavigate } from "react-router";
import { motion, AnimatePresence } from "framer-motion";
import {
  Trophy,
  BookOpen,
  Users,
  TrendingUp,
  DollarSign,
  Network,
  Rocket,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  GraduationCap,
  Globe,
  Award,
  Briefcase,
  Clock,
  Send,
  ShieldCheck,
  XCircle,
  Loader2,
  ArrowRight,
} from "lucide-react";
import {
  StableInput,
  StableTextarea,
  StableSelect,
} from "@/components/StableInputs";
import { safeJSONParse } from "@/lib/safeJSON";

/* ═══════════════════════════════════════════════════════════════
   TYPES
   ═══════════════════════════════════════════════════════════════ */

interface ChampionApplication {
  id: string;
  applicantName: string;
  applicantEmail: string;
  profession: string;
  yearsOfExperience: string;
  expertise: string;
  bio: string;
  linkedinUrl: string;
  courseTitle: string;
  courseDescription: string;
  targetAudience: string;
  motivation: string;
  status: "pending" | "approved" | "rejected";
  submittedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  reviewNotes?: string;
}

type FormStep = 1 | 2 | 3 | 4;

/* ═══════════════════════════════════════════════════════════════
   BENEFITS DATA
   ═══════════════════════════════════════════════════════════════ */

const BENEFITS = [
  {
    icon: BookOpen,
    title: "Create courses and educational content",
    description:
      "Build world-class courses that help thousands of African professionals grow their skills and advance their careers.",
    color: "#C6FF34",
  },
  {
    icon: Users,
    title: "Mentor aspiring African talent",
    description:
      "Guide the next generation of African leaders through structured mentorship programs and live Q&A sessions.",
    color: "#7E3BED",
  },
  {
    icon: TrendingUp,
    title: "Build your personal brand",
    description:
      "Get featured across the Levav platform and establish yourself as a thought leader in your industry.",
    color: "#C6FF34",
  },
  {
    icon: DollarSign,
    title: "Earn revenue from course sales",
    description:
      "Generate income through course enrollments, premium content subscriptions, and mentorship sessions.",
    color: "#7E3BED",
  },
  {
    icon: Network,
    title: "Join an exclusive network of leaders",
    description:
      "Connect with fellow industry experts, share knowledge, and collaborate on transformative initiatives.",
    color: "#C6FF34",
  },
  {
    icon: Rocket,
    title: "Shape the future of African workforce",
    description:
      "Play a pivotal role in developing Africa's talent ecosystem and driving economic transformation.",
    color: "#7E3BED",
  },
];

/* ═══════════════════════════════════════════════════════════════
   REQUIREMENTS DATA
   ═══════════════════════════════════════════════════════════════ */

const REQUIREMENTS = [
  {
    text: "5+ years professional experience in your field",
    icon: Briefcase,
  },
  {
    text: "Proven track record of excellence and achievements",
    icon: Award,
  },
  {
    text: "Passion for developing African talent",
    icon: Users,
  },
  {
    text: "Commitment to create at least 1 course per quarter",
    icon: Clock,
  },
];

/* ═══════════════════════════════════════════════════════════════
   EXPERTISE OPTIONS
   ═══════════════════════════════════════════════════════════════ */

const EXPERTISE_OPTIONS = [
  { value: "Technology", label: "Technology & Engineering" },
  { value: "Leadership", label: "Leadership & Management" },
  { value: "Design", label: "Design & Creative" },
  { value: "Data Science", label: "Data Science & Analytics" },
  { value: "Marketing", label: "Marketing & Communications" },
  { value: "Finance", label: "Finance & Business" },
  { value: "Healthcare", label: "Healthcare & Life Sciences" },
  { value: "Education", label: "Education & Training" },
  { value: "Entrepreneurship", label: "Entrepreneurship" },
  { value: "Other", label: "Other" },
];

/* ═══════════════════════════════════════════════════════════════
   TARGET AUDIENCE OPTIONS
   ═══════════════════════════════════════════════════════════════ */

const AUDIENCE_OPTIONS = [
  { value: "Entry-level professionals", label: "Entry-level professionals" },
  {
    value: "Mid-level professionals",
    label: "Mid-level professionals",
  },
  {
    value: "Senior professionals",
    label: "Senior professionals & Executives",
  },
  {
    value: "Recent graduates",
    label: "Recent graduates",
  },
  {
    value: "Career switchers",
    label: "Career switchers",
  },
  {
    value: "Entrepreneurs",
    label: "Entrepreneurs & Founders",
  },
  { value: "All levels", label: "All levels" },
];

/* ═══════════════════════════════════════════════════════════════
   YEARS OF EXPERIENCE OPTIONS
   ═══════════════════════════════════════════════════════════════ */

const EXPERIENCE_OPTIONS = [
  { value: "5-7", label: "5 - 7 years" },
  { value: "8-10", label: "8 - 10 years" },
  { value: "11-15", label: "11 - 15 years" },
  { value: "16-20", label: "16 - 20 years" },
  { value: "20+", label: "20+ years" },
];

/* ═══════════════════════════════════════════════════════════════
   LOCAL STORAGE
   ═══════════════════════════════════════════════════════════════ */

const STORAGE_KEY = "champion_applications";

function getApplications(): ChampionApplication[] {
  return safeJSONParse<ChampionApplication[]>(STORAGE_KEY, []);
}

function saveApplication(app: ChampionApplication) {
  const existing = getApplications();
  existing.push(app);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
}

/* ═══════════════════════════════════════════════════════════════
   ANIMATION VARIANTS
   ╕══════════════════════════════════════════════════════════════ */

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.06, duration: 0.6, ease: [0.19, 1, 0.22, 1] },
  }),
};

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06, delayChildren: 0.1 } },
};

const stepVariants = {
  hidden: { opacity: 0, x: 40 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.4, ease: [0.19, 1, 0.22, 1] } },
  exit: { opacity: 0, x: -40, transition: { duration: 0.3 } },
};

/* ═══════════════════════════════════════════════════════════════
   GLASS CARD CLASS
   ═══════════════════════════════════════════════════════════════ */

const glassCard =
  "bg-white/[0.03] backdrop-blur-xl border border-white/[0.06] rounded-2xl";

/* ═══════════════════════════════════════════════════════════════
   STEP INDICATOR
   ═══════════════════════════════════════════════════════════════ */

function StepIndicator({ currentStep }: { currentStep: FormStep }) {
  const steps: { num: FormStep; label: string }[] = [
    { num: 1, label: "Personal Info" },
    { num: 2, label: "Expertise" },
    { num: 3, label: "Proposal" },
    { num: 4, label: "Review" },
  ];

  return (
    <div className="flex items-center justify-center gap-2 sm:gap-4 mb-10">
      {steps.map((s, i) => {
        const isActive = s.num === currentStep;
        const isCompleted = s.num < currentStep;
        return (
          <React.Fragment key={s.num}>
            {i > 0 && (
              <div className="w-8 sm:w-12 h-[2px] rounded-full relative overflow-hidden flex-shrink-0">
                <div
                  className="absolute inset-0 transition-all duration-500"
                  style={{
                    backgroundColor: isCompleted ? "#C6FF34" : "rgba(255,255,255,0.06)",
                  }}
                />
              </div>
            )}
            <div className="flex flex-col items-center gap-1.5">
              <motion.div
                className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300 ${
                  isActive
                    ? "bg-[#C6FF34] text-black"
                    : isCompleted
                    ? "bg-[#C6FF34]/20 text-[#C6FF34] border border-[#C6FF34]/30"
                    : "bg-white/[0.04] text-[#666666] border border-white/[0.08]"
                }`}
                animate={isActive ? { scale: [1, 1.05, 1] } : {}}
                transition={{ duration: 0.3 }}
              >
                {isCompleted ? (
                  <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5" />
                ) : (
                  s.num
                )}
              </motion.div>
              <span
                className={`text-[10px] sm:text-xs font-medium transition-colors ${
                  isActive ? "text-[#C6FF34]" : "text-[#666666]"
                }`}
              >
                {s.label}
              </span>
            </div>
          </React.Fragment>
        );
      })}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   BENEFIT CARD
   ═══════════════════════════════════════════════════════════════ */

function BenefitCard({
  benefit,
  index,
}: {
  benefit: (typeof BENEFITS)[number];
  index: number;
}) {
  const Icon = benefit.icon;
  return (
    <motion.div
      className={`${glassCard} p-6 hover:border-white/[0.12] transition-all group`}
      variants={fadeUp}
      custom={index}
    >
      <div
        className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110"
        style={{ backgroundColor: `${benefit.color}15` }}
      >
        <Icon className="w-6 h-6" style={{ color: benefit.color }} />
      </div>
      <h3 className="text-white text-base font-semibold mb-2">
        {benefit.title}
      </h3>
      <p className="text-[#A0A0A0] text-sm leading-relaxed">
        {benefit.description}
      </p>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   HERO SECTION
   ═══════════════════════════════════════════════════════════════ */

function HeroSection() {
  return (
    <section className="relative min-h-[60vh] flex items-center justify-center overflow-hidden bg-black pt-20 pb-12">
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[700px] rounded-full opacity-[0.04]"
        style={{
          background:
            "radial-gradient(circle, #C6FF34 0%, transparent 60%)",
        }}
      />
      <div className="absolute top-20 right-0 w-[400px] h-[400px] rounded-full opacity-[0.03]"
        style={{
          background:
            "radial-gradient(circle, #7E3BED 0%, transparent 60%)",
        }}
      />

      <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
        <motion.div
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#C6FF34]/10 border border-[#C6FF34]/20 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Trophy className="w-4 h-4 text-[#C6FF34]" />
          <span className="text-[#C6FF34] text-sm font-medium">
            Champions Program
          </span>
        </motion.div>

        <motion.h1
          className="font-display text-5xl sm:text-6xl lg:text-7xl text-white leading-[1.05] mb-6"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.8,
            delay: 0.1,
            ease: [0.19, 1, 0.22, 1],
          }}
        >
          Become a{" "}
          <span className="bg-gradient-to-r from-[#C6FF34] to-[#7E3BED] bg-clip-text text-transparent">
            Levav Champion
          </span>
        </motion.h1>

        <motion.p
          className="text-[#A0A0A0] text-lg sm:text-xl max-w-2xl mx-auto leading-relaxed mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.7,
            delay: 0.25,
            ease: [0.19, 1, 0.22, 1],
          }}
        >
          Join Africa&apos;s most exclusive community of industry leaders.
          Create courses, mentor talent, and shape the future of the
          African workforce.
        </motion.p>

        <motion.div
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <a
            href="#apply"
            className="inline-flex items-center gap-2 px-8 py-4 bg-[#C6FF34] text-black font-semibold rounded-2xl hover:bg-[#d4ff5c] transition-all hover:scale-[1.02] hover:shadow-[0_0_40px_rgba(198,255,52,0.2)]"
          >
            Apply Now
            <ArrowRight className="w-5 h-5" />
          </a>
          <a
            href="#benefits"
            className="inline-flex items-center gap-2 px-8 py-4 border border-white/[0.12] text-white font-medium rounded-2xl hover:bg-white/[0.05] transition-all"
          >
            Learn More
          </a>
        </motion.div>

        {/* Social proof */}
        <motion.div
          className="mt-12 flex items-center justify-center gap-8 text-[#666666]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-[#C6FF34]" />
            <span className="text-sm">12 Countries</span>
          </div>
          <div className="flex items-center gap-2">
            <GraduationCap className="w-4 h-4 text-[#7E3BED]" />
            <span className="text-sm">500+ Champions</span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-[#C6FF34]" />
            <span className="text-sm">50K+ Students</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════
   BENEFITS SECTION
   ═══════════════════════════════════════════════════════════════ */

function BenefitsSection() {
  return (
    <section id="benefits" className="bg-[#0A0A0A] py-16 lg:py-24">
      <div className="max-w-6xl mx-auto px-6">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <span className="text-[#C6FF34] text-sm font-medium tracking-wider uppercase mb-3 block">
            Why Join
          </span>
          <h2 className="font-display text-3xl sm:text-4xl text-white mb-3">
            Champion{" "}
            <span className="bg-gradient-to-r from-[#C6FF34] to-[#7E3BED] bg-clip-text text-transparent">
              Benefits
            </span>
          </h2>
          <p className="text-[#A0A0A0] max-w-xl mx-auto">
            Unlock a world of opportunities as a Levav Champion. Here&apos;s
            what awaits you.
          </p>
        </motion.div>

        <motion.div
          className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5"
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {BENEFITS.map((benefit, i) => (
            <BenefitCard key={benefit.title} benefit={benefit} index={i} />
          ))}
        </motion.div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════
   REQUIREMENTS SECTION
   ═══════════════════════════════════════════════════════════════ */

function RequirementsSection() {
  return (
    <section className="bg-black py-16 lg:py-24">
      <div className="max-w-4xl mx-auto px-6">
        <motion.div
          className={`${glassCard} p-8 lg:p-12`}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="text-center mb-10">
            <ShieldCheck className="w-8 h-8 text-[#C6FF34] mx-auto mb-4" />
            <h2 className="font-display text-2xl sm:text-3xl text-white mb-3">
              Requirements
            </h2>
            <p className="text-[#A0A0A0] text-sm max-w-md mx-auto">
              We&apos;re looking for exceptional leaders who meet the following
              criteria.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-5">
            {REQUIREMENTS.map((req, i) => {
              const Icon = req.icon;
              return (
                <motion.div
                  key={req.text}
                  className="flex items-start gap-4 p-4 rounded-xl bg-white/[0.02] border border-white/[0.04]"
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{
                    delay: i * 0.1,
                    duration: 0.5,
                    ease: [0.19, 1, 0.22, 1],
                  }}
                >
                  <div className="w-10 h-10 rounded-lg bg-[#C6FF34]/10 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-5 h-5 text-[#C6FF34]" />
                  </div>
                  <span className="text-[#A0A0A0] text-sm leading-relaxed pt-2">
                    {req.text}
                  </span>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════
   FORM STEP 1: PERSONAL INFO
   ═══════════════════════════════════════════════════════════════ */

function Step1PersonalInfo({
  data,
  updateData,
}: {
  data: Partial<ChampionApplication>;
  updateData: (fields: Partial<ChampionApplication>) => void;
}) {
  return (
    <motion.div variants={stepVariants} initial="hidden" animate="visible" exit="exit">
      <div className={`${glassCard} p-6 lg:p-8`}>
        <h3 className="text-xl font-semibold text-white mb-1 flex items-center gap-2">
          <Users className="w-5 h-5 text-[#7E3BED]" />
          Personal Information
        </h3>
        <p className="text-[#666666] text-sm mb-8">
          Tell us about yourself so we can get to know you better.
        </p>

        <div className="grid sm:grid-cols-2 gap-5">
          <div>
            <label className="block text-[#A0A0A0] text-sm font-medium mb-2">
              Full Name *
            </label>
            <StableInput
              value={data.applicantName || ""}
              onValueChange={(v) => updateData({ applicantName: v })}
              placeholder="e.g., Chioma Okonkwo"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-[#666666] focus:outline-none focus:border-[#C6FF34]/30 transition-colors text-sm"
            />
          </div>

          <div>
            <label className="block text-[#A0A0A0] text-sm font-medium mb-2">
              Email Address *
            </label>
            <StableInput
              type="email"
              value={data.applicantEmail || ""}
              onValueChange={(v) => updateData({ applicantEmail: v })}
              placeholder="e.g., chioma@example.com"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-[#666666] focus:outline-none focus:border-[#C6FF34]/30 transition-colors text-sm"
            />
          </div>

          <div>
            <label className="block text-[#A0A0A0] text-sm font-medium mb-2">
              Profession / Job Title *
            </label>
            <StableInput
              value={data.profession || ""}
              onValueChange={(v) => updateData({ profession: v })}
              placeholder="e.g., Senior Software Engineer"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-[#666666] focus:outline-none focus:border-[#C6FF34]/30 transition-colors text-sm"
            />
          </div>

          <div>
            <label className="block text-[#A0A0A0] text-sm font-medium mb-2">
              Years of Experience *
            </label>
            <StableSelect
              value={data.yearsOfExperience || ""}
              onValueChange={(v) => updateData({ yearsOfExperience: v })}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#C6FF34]/30 transition-colors text-sm appearance-none"
            >
              <option value="" className="bg-[#1a1a1a] text-[#666666]">
                Select experience range
              </option>
              {EXPERIENCE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value} className="bg-[#1a1a1a] text-white">
                  {opt.label}
                </option>
              ))}
            </StableSelect>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   FORM STEP 2: EXPERTISE
   ═══════════════════════════════════════════════════════════════ */

function Step2Expertise({
  data,
  updateData,
}: {
  data: Partial<ChampionApplication>;
  updateData: (fields: Partial<ChampionApplication>) => void;
}) {
  return (
    <motion.div variants={stepVariants} initial="hidden" animate="visible" exit="exit">
      <div className={`${glassCard} p-6 lg:p-8`}>
        <h3 className="text-xl font-semibold text-white mb-1 flex items-center gap-2">
          <Award className="w-5 h-5 text-[#7E3BED]" />
          Your Expertise
        </h3>
        <p className="text-[#666666] text-sm mb-8">
          Share your area of expertise and professional background.
        </p>

        <div className="space-y-5">
          <div>
            <label className="block text-[#A0A0A0] text-sm font-medium mb-2">
              Area of Expertise *
            </label>
            <StableSelect
              value={data.expertise || ""}
              onValueChange={(v) => updateData({ expertise: v })}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#C6FF34]/30 transition-colors text-sm appearance-none"
            >
              <option value="" className="bg-[#1a1a1a] text-[#666666]">
                Select your expertise area
              </option>
              {EXPERTISE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value} className="bg-[#1a1a1a] text-white">
                  {opt.label}
                </option>
              ))}
            </StableSelect>
          </div>

          <div>
            <label className="block text-[#A0A0A0] text-sm font-medium mb-2">
              Bio / About You *
            </label>
            <StableTextarea
              value={data.bio || ""}
              onValueChange={(v) => updateData({ bio: v })}
              placeholder="Tell us about your professional journey, key achievements, and what drives you..."
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-[#666666] focus:outline-none focus:border-[#C6FF34]/30 transition-colors text-sm min-h-[140px] resize-y"
            />
            <p className="text-[#666666] text-xs mt-1.5">
              {data.bio?.length || 0} characters
            </p>
          </div>

          <div>
            <label className="block text-[#A0A0A0] text-sm font-medium mb-2">
              LinkedIn Profile URL *
            </label>
            <StableInput
              type="url"
              value={data.linkedinUrl || ""}
              onValueChange={(v) => updateData({ linkedinUrl: v })}
              placeholder="https://linkedin.com/in/your-profile"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-[#666666] focus:outline-none focus:border-[#C6FF34]/30 transition-colors text-sm"
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   FORM STEP 3: CONTENT PROPOSAL
   ═══════════════════════════════════════════════════════════════ */

function Step3Proposal({
  data,
  updateData,
}: {
  data: Partial<ChampionApplication>;
  updateData: (fields: Partial<ChampionApplication>) => void;
}) {
  return (
    <motion.div variants={stepVariants} initial="hidden" animate="visible" exit="exit">
      <div className={`${glassCard} p-6 lg:p-8`}>
        <h3 className="text-xl font-semibold text-white mb-1 flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-[#7E3BED]" />
          Content Proposal
        </h3>
        <p className="text-[#666666] text-sm mb-8">
          Propose your first course idea. This helps us understand your
          teaching vision.
        </p>

        <div className="space-y-5">
          <div>
            <label className="block text-[#A0A0A0] text-sm font-medium mb-2">
              Proposed Course Title *
            </label>
            <StableInput
              value={data.courseTitle || ""}
              onValueChange={(v) => updateData({ courseTitle: v })}
              placeholder="e.g., African Leadership in the Digital Age"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-[#666666] focus:outline-none focus:border-[#C6FF34]/30 transition-colors text-sm"
            />
          </div>

          <div>
            <label className="block text-[#A0A0A0] text-sm font-medium mb-2">
              Course Description *
            </label>
            <StableTextarea
              value={data.courseDescription || ""}
              onValueChange={(v) => updateData({ courseDescription: v })}
              placeholder="Describe what your course covers, learning outcomes, and why it's valuable..."
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-[#666666] focus:outline-none focus:border-[#C6FF34]/30 transition-colors text-sm min-h-[120px] resize-y"
            />
            <p className="text-[#666666] text-xs mt-1.5">
              {data.courseDescription?.length || 0} characters
            </p>
          </div>

          <div>
            <label className="block text-[#A0A0A0] text-sm font-medium mb-2">
              Target Audience *
            </label>
            <StableSelect
              value={data.targetAudience || ""}
              onValueChange={(v) => updateData({ targetAudience: v })}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#C6FF34]/30 transition-colors text-sm appearance-none"
            >
              <option value="" className="bg-[#1a1a1a] text-[#666666]">
                Select target audience
              </option>
              {AUDIENCE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value} className="bg-[#1a1a1a] text-white">
                  {opt.label}
                </option>
              ))}
            </StableSelect>
          </div>

          <div>
            <label className="block text-[#A0A0A0] text-sm font-medium mb-2">
              Why do you want to be a Levav Champion? *
            </label>
            <StableTextarea
              value={data.motivation || ""}
              onValueChange={(v) => updateData({ motivation: v })}
              placeholder="Share your motivation, vision for African talent development, and what you hope to achieve..."
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-[#666666] focus:outline-none focus:border-[#C6FF34]/30 transition-colors text-sm min-h-[140px] resize-y"
            />
            <p className="text-[#666666] text-xs mt-1.5">
              {data.motivation?.length || 0} characters
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   FORM STEP 4: REVIEW & SUBMIT
   ═══════════════════════════════════════════════════════════════ */

function Step4Review({
  data,
  agreed,
  setAgreed,
}: {
  data: Partial<ChampionApplication>;
  agreed: boolean;
  setAgreed: (v: boolean) => void;
}) {
  const fields = [
    { label: "Full Name", value: data.applicantName, icon: Users },
    { label: "Email", value: data.applicantEmail, icon: Award },
    { label: "Profession", value: data.profession, icon: Briefcase },
    {
      label: "Experience",
      value: EXPERIENCE_OPTIONS.find((o) => o.value === data.yearsOfExperience)
        ?.label,
      icon: Clock,
    },
    {
      label: "Expertise",
      value: EXPERTISE_OPTIONS.find((o) => o.value === data.expertise)?.label,
      icon: BookOpen,
    },
    { label: "LinkedIn", value: data.linkedinUrl, icon: Globe },
    { label: "Course Title", value: data.courseTitle, icon: BookOpen },
    {
      label: "Target Audience",
      value: AUDIENCE_OPTIONS.find((o) => o.value === data.targetAudience)
        ?.label,
      icon: Users,
    },
  ];

  return (
    <motion.div variants={stepVariants} initial="hidden" animate="visible" exit="exit">
      <div className="space-y-6">
        {/* Summary Card */}
        <div className={`${glassCard} p-6 lg:p-8`}>
          <h3 className="text-xl font-semibold text-white mb-1 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-[#C6FF34]" />
            Review Your Application
          </h3>
          <p className="text-[#666666] text-sm mb-8">
            Please review all information before submitting.
          </p>

          <div className="grid sm:grid-cols-2 gap-4">
            {fields.map((field) => {
              const Icon = field.icon;
              return (
                <div
                  key={field.label}
                  className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.04]"
                >
                  <div className="flex items-center gap-2 mb-1.5">
                    <Icon className="w-3.5 h-3.5 text-[#666666]" />
                    <span className="text-[#666666] text-xs uppercase tracking-wider">
                      {field.label}
                    </span>
                  </div>
                  <p className="text-white text-sm font-medium">
                    {field.value || "N/A"}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Bio */}
          <div className="mt-4 p-4 rounded-xl bg-white/[0.02] border border-white/[0.04]">
            <div className="flex items-center gap-2 mb-2">
              <Award className="w-3.5 h-3.5 text-[#666666]" />
              <span className="text-[#666666] text-xs uppercase tracking-wider">
                Bio
              </span>
            </div>
            <p className="text-white text-sm leading-relaxed whitespace-pre-wrap">
              {data.bio || "N/A"}
            </p>
          </div>

          {/* Course Description */}
          <div className="mt-4 p-4 rounded-xl bg-white/[0.02] border border-white/[0.04]">
            <div className="flex items-center gap-2 mb-2">
              <BookOpen className="w-3.5 h-3.5 text-[#666666]" />
              <span className="text-[#666666] text-xs uppercase tracking-wider">
                Course Description
              </span>
            </div>
            <p className="text-white text-sm leading-relaxed whitespace-pre-wrap">
              {data.courseDescription || "N/A"}
            </p>
          </div>

          {/* Motivation */}
          <div className="mt-4 p-4 rounded-xl bg-white/[0.02] border border-white/[0.04]">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-3.5 h-3.5 text-[#666666]" />
              <span className="text-[#666666] text-xs uppercase tracking-wider">
                Motivation
              </span>
            </div>
            <p className="text-white text-sm leading-relaxed whitespace-pre-wrap">
              {data.motivation || "N/A"}
            </p>
          </div>
        </div>

        {/* Terms Checkbox */}
        <div className={`${glassCard} p-6`}>
          <label className="flex items-start gap-3 cursor-pointer group">
            <div className="relative flex-shrink-0 mt-0.5">
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="sr-only"
              />
              <div
                className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${
                  agreed
                    ? "bg-[#C6FF34] border-[#C6FF34]"
                    : "border-white/[0.2] group-hover:border-white/[0.3]"
                }`}
              >
                {agreed && <CheckCircle2 className="w-3.5 h-3.5 text-black" />}
              </div>
            </div>
            <span className="text-[#A0A0A0] text-sm leading-relaxed">
              I confirm that all information provided is accurate. I agree to
              the Levav Champion terms and commit to creating quality content
              for the platform. I understand that my application will be
              reviewed and I will be notified of the decision within{" "}
              <span className="text-[#C6FF34] font-medium">
                5 business days
              </span>
              .
            </span>
          </label>
        </div>
      </div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   SUCCESS SCREEN
   ═══════════════════════════════════════════════════════════════ */

function SuccessScreen() {
  const navigate = useNavigate();

  return (
    <motion.div
      className="min-h-[50vh] flex items-center justify-center"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className={`${glassCard} p-8 lg:p-12 max-w-lg w-full text-center`}>
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.1 }}
          className="w-20 h-20 rounded-full bg-[#C6FF34]/10 border border-[#C6FF34]/20 flex items-center justify-center mx-auto mb-6"
        >
          <CheckCircle2 className="w-10 h-10 text-[#C6FF34]" />
        </motion.div>

        <h2 className="text-2xl font-semibold text-white mb-3">
          Application Submitted!
        </h2>
        <p className="text-[#A0A0A0] text-sm leading-relaxed mb-8">
          Thank you for applying to become a Levav Champion. Our team will
          review your application and get back to you within{" "}
          <span className="text-[#C6FF34] font-medium">5 business days</span>.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            to="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#C6FF34] text-black font-semibold rounded-xl hover:bg-[#d4ff5c] transition-all"
          >
            Go Home
          </Link>
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 border border-white/[0.12] text-white font-medium rounded-xl hover:bg-white/[0.05] transition-all"
          >
            View Application
          </button>
        </div>
      </div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   MAIN APPLICATION FORM
   ═══════════════════════════════════════════════════════════════ */

export default function ChampionApply() {
  const [step, setStep] = React.useState<FormStep>(1);
  const [formData, setFormData] = React.useState<Partial<ChampionApplication>>({});
  const [agreed, setAgreed] = React.useState(false);
  const [submitted, setSubmitted] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [error, setError] = React.useState("");

  const updateData = React.useCallback(
    (fields: Partial<ChampionApplication>) => {
      setFormData((prev) => ({ ...prev, ...fields }));
      setError("");
    },
    []
  );

  const validateStep = (s: FormStep): boolean => {
    switch (s) {
      case 1:
        if (!formData.applicantName?.trim()) {
          setError("Please enter your full name.");
          return false;
        }
        if (!formData.applicantEmail?.trim()) {
          setError("Please enter your email address.");
          return false;
        }
        if (!formData.profession?.trim()) {
          setError("Please enter your profession.");
          return false;
        }
        if (!formData.yearsOfExperience) {
          setError("Please select your years of experience.");
          return false;
        }
        return true;
      case 2:
        if (!formData.expertise) {
          setError("Please select your area of expertise.");
          return false;
        }
        if (!formData.bio?.trim()) {
          setError("Please enter your bio.");
          return false;
        }
        if (!formData.linkedinUrl?.trim()) {
          setError("Please enter your LinkedIn profile URL.");
          return false;
        }
        return true;
      case 3:
        if (!formData.courseTitle?.trim()) {
          setError("Please enter a course title.");
          return false;
        }
        if (!formData.courseDescription?.trim()) {
          setError("Please enter a course description.");
          return false;
        }
        if (!formData.targetAudience) {
          setError("Please select a target audience.");
          return false;
        }
        if (!formData.motivation?.trim()) {
          setError("Please tell us why you want to be a Champion.");
          return false;
        }
        return true;
      case 4:
        if (!agreed) {
          setError("Please agree to the terms to submit your application.");
          return false;
        }
        return true;
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (!validateStep(step)) return;
    if (step < 4) setStep((step + 1) as FormStep);
  };

  const handleBack = () => {
    if (step > 1) setStep((step - 1) as FormStep);
    setError("");
  };

  const handleSubmit = () => {
    if (!validateStep(step)) return;
    setIsSubmitting(true);

    // Simulate network delay
    setTimeout(() => {
      const application: ChampionApplication = {
        id: `app_${Date.now()}`,
        applicantName: formData.applicantName || "",
        applicantEmail: formData.applicantEmail || "",
        profession: formData.profession || "",
        yearsOfExperience: formData.yearsOfExperience || "",
        expertise: formData.expertise || "",
        bio: formData.bio || "",
        linkedinUrl: formData.linkedinUrl || "",
        courseTitle: formData.courseTitle || "",
        courseDescription: formData.courseDescription || "",
        targetAudience: formData.targetAudience || "",
        motivation: formData.motivation || "",
        status: "pending",
        submittedAt: new Date().toISOString(),
      };

      saveApplication(application);
      setIsSubmitting(false);
      setSubmitted(true);
    }, 1500);
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-black pt-20">
        <div className="max-w-4xl mx-auto px-6">
          <SuccessScreen />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Hero */}
      <HeroSection />

      {/* Benefits */}
      <BenefitsSection />

      {/* Requirements */}
      <RequirementsSection />

      {/* Application Form */}
      <section id="apply" className="bg-[#0A0A0A] py-16 lg:py-24">
        <div className="max-w-3xl mx-auto px-6">
          <motion.div
            className="text-center mb-10"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <span className="text-[#7E3BED] text-sm font-medium tracking-wider uppercase mb-3 block">
              Get Started
            </span>
            <h2 className="font-display text-3xl sm:text-4xl text-white mb-3">
              Submit Your{" "}
              <span className="bg-gradient-to-r from-[#C6FF34] to-[#7E3BED] bg-clip-text text-transparent">
                Application
              </span>
            </h2>
            <p className="text-[#A0A0A0] text-sm max-w-lg mx-auto">
              Complete all four steps to apply. Your application will be
              reviewed by our team.
            </p>
          </motion.div>

          {/* Step Indicator */}
          <StepIndicator currentStep={step} />

          {/* Error Banner */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mb-6 flex items-center gap-2 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm"
              >
                <XCircle className="w-4 h-4 flex-shrink-0" />
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Form Steps */}
          <AnimatePresence mode="wait">
            {step === 1 && (
              <Step1PersonalInfo key="step1" data={formData} updateData={updateData} />
            )}
            {step === 2 && (
              <Step2Expertise key="step2" data={formData} updateData={updateData} />
            )}
            {step === 3 && (
              <Step3Proposal key="step3" data={formData} updateData={updateData} />
            )}
            {step === 4 && (
              <Step4Review
                key="step4"
                data={formData}
                agreed={agreed}
                setAgreed={setAgreed}
              />
            )}
          </AnimatePresence>

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between mt-8">
            <button
              onClick={handleBack}
              disabled={step === 1}
              className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-medium transition-all ${
                step === 1
                  ? "opacity-0 pointer-events-none"
                  : "border border-white/[0.12] text-white hover:bg-white/[0.05] active:scale-95"
              }`}
            >
              <ChevronLeft className="w-4 h-4" />
              Back
            </button>

            {step < 4 ? (
              <button
                onClick={handleNext}
                className="inline-flex items-center gap-2 px-8 py-3 bg-[#C6FF34] text-black font-semibold rounded-xl hover:bg-[#d4ff5c] transition-all hover:scale-[1.02] hover:shadow-[0_0_40px_rgba(198,255,52,0.2)] active:scale-95"
              >
                Continue
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="inline-flex items-center gap-2 px-8 py-3 bg-[#C6FF34] text-black font-semibold rounded-xl hover:bg-[#d4ff5c] transition-all hover:scale-[1.02] hover:shadow-[0_0_40px_rgba(198,255,52,0.2)] active:scale-95 disabled:opacity-60"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Submit Application
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
