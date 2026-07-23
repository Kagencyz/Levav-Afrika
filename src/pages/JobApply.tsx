import { useState, useMemo } from "react";
import { useParams, useNavigate, Link } from "react-router";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { safeJSONParse, safeJSONSet } from "@/lib/safeJSON";
import {
  ArrowLeft,
  MapPin,
  Calendar,
  Clock,
  Users,
  Briefcase,
  Loader2,
  CheckCircle2,
  Send,
  Building2,
  DollarSign,
} from "lucide-react";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useNotifications } from "@/hooks/useNotifications";
import { useOffline } from "@/hooks/useOffline";
import { StableInput, StableTextarea } from "@/components/StableInputs";

/* ───────────────────── Animation Variants ───────────────────── */
const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.6, ease: [0.19, 1, 0.22, 1] },
  }),
};

/* ───────────────────── Mock Job Data ───────────────────── */
const MOCK_JOBS = [
  {
    id: 1,
    title: "Senior Frontend Developer",
    description: "Join our team to build beautiful user experiences for thousands of users across Africa. You'll work with React, TypeScript, and modern tooling.\n\nResponsibilities:\n- Build and maintain frontend features\n- Collaborate with designers and backend engineers\n- Optimize application performance\n- Mentor junior developers",
    requirements: "5+ years React experience\nStrong TypeScript skills\nExperience with Tailwind CSS\nFamiliarity with CI/CD pipelines",
    skills: ["React", "TypeScript", "Tailwind"],
    type: "full-time",
    location: "Lusaka, Zambia",
    salary: "ZMW 15,000 - 25,000",
    status: "active",
    featured: true,
    employerId: 1,
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 2,
    title: "Product Designer",
    description: "Lead design initiatives for our growing fintech platform. Shape the user experience and visual identity of products used by millions.",
    requirements: "3+ years product design\nFigma mastery\nPortfolio demonstrating UX process",
    skills: ["Figma", "UX Design", "Prototyping"],
    type: "full-time",
    location: "Lusaka, Zambia",
    salary: "ZMW 12,000 - 18,000",
    status: "active",
    featured: false,
    employerId: 2,
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 3,
    title: "Backend Engineer",
    description: "Build scalable APIs and services for our healthtech product. Work with a talented team to solve real healthcare challenges.",
    requirements: "4+ years backend development\nPython/Node.js proficiency\nDatabase design experience",
    skills: ["Python", "Node.js", "PostgreSQL"],
    type: "full-time",
    location: "Accra, Ghana",
    salary: "GHS 8,000 - 12,000",
    status: "active",
    featured: false,
    employerId: 3,
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 4,
    title: "UX Researcher",
    description: "Conduct user research to inform product decisions. Help us understand our users deeply and build products they'll love.",
    requirements: "Experience with qualitative research\nInterview facilitation\nData synthesis skills",
    skills: ["User Research", "Interviewing", "Analysis"],
    type: "contract",
    location: "Lagos, Nigeria",
    salary: "\u20A6500,000 - 700,000",
    status: "active",
    featured: false,
    employerId: 4,
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 5,
    title: "Data Scientist",
    description: "Analyze large datasets to drive business insights. Build models and visualizations that inform strategic decisions.",
    requirements: "Strong statistics background\nPython and SQL proficiency\nMachine learning experience",
    skills: ["Python", "Machine Learning", "SQL"],
    type: "full-time",
    location: "Nairobi, Kenya",
    salary: "KES 150,000 - 200,000",
    status: "active",
    featured: false,
    employerId: 5,
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 6,
    title: "Mobile Developer",
    description: "Build cross-platform mobile apps for African markets. Create performant, accessible apps that work on any device.",
    requirements: "React Native or Flutter experience\nPublished apps\nState management patterns",
    skills: ["React Native", "Flutter", "Firebase"],
    type: "full-time",
    location: "Dakar, Senegal",
    salary: "CFA 800,000 - 1,200,000",
    status: "active",
    featured: false,
    employerId: 6,
    createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

function getCompanyName(jobId: number): string {
  const companies: Record<number, string> = {
    1: "TechVentures Africa",
    2: "FinFlow Labs",
    3: "HealthTech GH",
    4: "UserFirst Design",
    5: "DataDriven KE",
    6: "AppWorks Senegal",
  };
  return companies[jobId] || "Levav Partner";
}

/* ───────────────────── Job Apply Page ───────────────────── */
function JobApplyInner() {
  const { jobId } = useParams<{ jobId: string }>();
  const navigate = useNavigate();
  const [coverLetter, setCoverLetter] = useState("");
  const [resumeUrl, setResumeUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { notifyApplicationSubmitted } = useNotifications();
  const { isOffline, queueAction } = useOffline();

  const MAX_COVER_LETTER_LENGTH = 2000;
  const MAX_RESUME_URL_LENGTH = 500;

  const sanitizeInput = (input: string): string => {
    return input.trim().replace(/[<>]/g, '');
  };

  const isValidUrl = (url: string): boolean => {
    if (!url.trim()) return true;
    try {
      const parsed = new URL(url);
      return parsed.protocol === 'http:' || parsed.protocol === 'https:';
    } catch {
      return false;
    }
  };

  const id = Number(jobId);

  // Look up job from mock data only — no API calls
  const job = useMemo(() => {
    return MOCK_JOBS.find((j) => j.id === id) || null;
  }, [id]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const letter = coverLetter.trim();

    if (!letter) {
      toast.error("Cover letter is required");
      return;
    }
    if (letter.length > MAX_COVER_LETTER_LENGTH) {
      toast.error(`Cover letter must be less than ${MAX_COVER_LETTER_LENGTH} characters`);
      return;
    }
    if (resumeUrl.trim() && !isValidUrl(resumeUrl)) {
      toast.error("Please enter a valid resume URL (https://...)");
      return;
    }

    const sanitizedLetter = sanitizeInput(letter);
    const sanitizedResumeUrl = resumeUrl.trim();

    setIsSubmitting(true);

    // If offline, queue the application for later sync
    if (isOffline) {
      queueAction({
        type: 'application',
        data: {
          jobId: id,
          title: job?.title || `Job #${id}`,
          coverLetter: sanitizedLetter,
          resumeUrl: sanitizedResumeUrl || undefined,
        },
      });
      toast.success("You are offline. Application saved and will be synced when you reconnect.");
      setIsSubmitting(false);
      navigate("/dashboard");
      return;
    }

    // Save application to localStorage instead of API
    setTimeout(() => {
      try {
        const applications = safeJSONParse<any[]>('levav_applications', []);
        applications.push({
          id: `app-${Date.now()}`,
          jobId: id,
          jobTitle: job?.title || `Job #${id}`,
          coverLetter: sanitizedLetter,
          resumeUrl: sanitizedResumeUrl || undefined,
          status: 'pending',
          createdAt: new Date().toISOString(),
        });
        safeJSONSet('levav_applications', applications);
        notifyApplicationSubmitted(job?.title || `Job #${id}`);
        toast.success("Application submitted successfully!");
        setIsSubmitting(false);
        navigate("/dashboard");
      } catch {
        toast.error("Failed to submit application");
        setIsSubmitting(false);
      }
    }, 600);
  };

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
          <h1 className="text-white text-xl font-semibold mb-2">
            Job Not Found
          </h1>
          <p className="text-[#666666] text-sm mb-6">
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

  const daysAgo = Math.floor(
    (Date.now() - new Date(job.createdAt).getTime()) / (1000 * 60 * 60 * 24)
  );
  const daysLeft = Math.max(0, 30 - daysAgo);
  const appliedCount = 12 + (job.id * 7) % 45;

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

      <div className="relative z-10 max-w-3xl mx-auto px-6 py-28">
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
            Back to Opportunities
          </Link>
        </motion.div>

        {/* ─── Job Details Card ─── */}
        <motion.div
          className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.06] rounded-2xl p-6 sm:p-8 mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.19, 1, 0.22, 1] }}
        >
          {/* Badge Row */}
          <div className="flex items-center gap-2 mb-4 flex-wrap">
            <span className="bg-[#C6FF34] text-black text-xs font-medium px-3 py-1 rounded-full">
              {job.type}
            </span>
            {job.featured && (
              <span className="bg-[#7E3BED]/20 text-[#C6FF34] text-xs font-medium px-3 py-1 rounded-full">
                Featured
              </span>
            )}
            <span className="flex items-center gap-1 text-white/30 text-xs">
              <Clock className="w-3 h-3" />
              {daysLeft}d left
            </span>
            <span className="flex items-center gap-1 text-white/30 text-xs">
              <Users className="w-3 h-3" />
              {appliedCount} applied
            </span>
          </div>

          {/* Title */}
          <h1 className="text-white text-2xl sm:text-3xl font-semibold mb-3">
            {job.title}
          </h1>

          {/* Meta */}
          <div className="flex flex-wrap items-center gap-3 text-white/40 text-sm mb-4">
            <span className="flex items-center gap-1.5">
              <Building2 className="w-4 h-4 text-white/30" />
              <span className="text-white/60">
                {getCompanyName(job.id)}
              </span>
            </span>
            <span className="text-white/20">&#8226;</span>
            <span className="flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-white/30" />
              {job.location}
            </span>
            <span className="text-white/20">&#8226;</span>
            <span className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-white/30" />
              {new Date(job.createdAt).toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
              })}
            </span>
          </div>

          {/* Salary */}
          {job.salary && (
            <div className="flex items-center gap-2 mb-4">
              <DollarSign className="w-4 h-4 text-[#C6FF34]" />
              <span className="text-[#C6FF34] font-medium">{job.salary}</span>
            </div>
          )}

          {/* Skills */}
          {job.skills && job.skills.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {job.skills.map((skill: string) => (
                <span
                  key={skill}
                  className="bg-white/[0.05] text-white/60 text-xs px-3 py-1 rounded-lg"
                >
                  {skill}
                </span>
              ))}
            </div>
          )}

          {/* Description */}
          <div className="border-t border-white/[0.06] pt-5">
            <h2 className="text-white font-semibold text-sm mb-2">
              About the Role
            </h2>
            <p className="text-white/50 text-sm leading-relaxed whitespace-pre-wrap">
              {job.description}
            </p>
          </div>

          {/* Requirements */}
          {job.requirements && (
            <div className="mt-4 border-t border-white/[0.06] pt-5">
              <h2 className="text-white font-semibold text-sm mb-2">
                Requirements
              </h2>
              <p className="text-white/50 text-sm leading-relaxed whitespace-pre-wrap">
                {job.requirements}
              </p>
            </div>
          )}
        </motion.div>

        {/* ─── Application Form ─── */}
        <motion.div
          className="bg-[#0A0A0A] border border-white/[0.08] rounded-2xl p-6 sm:p-8"
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          custom={1}
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-[#C6FF34]/10 flex items-center justify-center">
              <Send className="w-5 h-5 text-[#C6FF34]" />
            </div>
            <div>
              <h2 className="text-white font-semibold text-lg">
                Submit Your Application
              </h2>
              <p className="text-[#666666] text-xs">
                Tell us why you&apos;re a great fit for this role
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Cover Letter */}
            <div>
              <label className="block text-white text-sm font-medium mb-2">
                Cover Letter <span className="text-[#C6FF34]">*</span>
              </label>
              <StableTextarea
                value={coverLetter}
                onChange={(e) => setCoverLetter(e.target.value)}
                placeholder="Introduce yourself and explain why you're the right candidate for this position..."
                rows={8}
                maxLength={MAX_COVER_LETTER_LENGTH}
                className="w-full bg-white/[0.05] border border-white/[0.1] rounded-xl text-white placeholder:text-white/30 focus:border-[#C6FF34] focus:outline-none focus:ring-2 focus:ring-[#C6FF34]/20 transition-all px-4 py-3 text-sm resize-none"
              />
              <div className="flex items-center justify-between mt-1.5">
                <p className="text-[#666666] text-xs">
                  Be specific about your relevant experience and why you want this role.
                </p>
                <p className={`text-xs ${coverLetter.length > MAX_COVER_LETTER_LENGTH * 0.9 ? 'text-red-400' : 'text-[#666666]'}`}>
                  {coverLetter.length}/{MAX_COVER_LETTER_LENGTH}
                </p>
              </div>
            </div>

            {/* Resume URL */}
            <div>
              <label className="block text-white text-sm font-medium mb-2">
                Resume URL <span className="text-white/30">(optional)</span>
              </label>
              <StableInput
                type="url"
                value={resumeUrl}
                onChange={(e) => setResumeUrl(e.target.value)}
                placeholder="https://example.com/your-resume.pdf"
                maxLength={MAX_RESUME_URL_LENGTH}
                className="w-full bg-white/[0.05] border border-white/[0.1] rounded-xl text-white placeholder:text-white/30 focus:border-[#C6FF34] focus:outline-none focus:ring-2 focus:ring-[#C6FF34]/20 transition-all px-4 py-3 text-sm"
              />
              <p className="text-[#666666] text-xs mt-1.5">
                Link to your resume (Google Drive, portfolio, etc.)
              </p>
            </div>

            {/* Submit Button */}
            <motion.button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-[#C6FF34] text-black font-semibold text-sm rounded-xl py-3.5 hover:bg-[#d4ff5c] transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  Submit Application
                </>
              )}
            </motion.button>

            <p className="text-center text-[#666666] text-xs">
              Your profile will be shared with the employer when you apply.
            </p>
          </form>
        </motion.div>
      </div>
    </main>
  );
}

/* ───────────────────── Exported Page with Auth Guard ───────────────────── */
export default function JobApply() {
  return (
    <ProtectedRoute>
      <JobApplyInner />
    </ProtectedRoute>
  );
}
