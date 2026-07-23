import { useState, useMemo } from "react";
import { useParams, Link, useNavigate } from "react-router";
import { motion, AnimatePresence } from "framer-motion";
import { isValidDateRange } from "@/lib/safeJSON";
import { StableInput, StableTextarea, StableSelect } from "@/components/StableInputs";
import {
  ArrowLeft,
  Briefcase,
  Plus,
  X,
  Calendar,
  DollarSign,
  CheckCircle,
  Send,
  FileText,
  Target,
  Clock,
  Loader2,
} from "lucide-react";

/* ───────────────────── Types ───────────────────── */
interface Milestone {
  name: string;
  description: string;
  dueDate: string;
  amount: string;
  status: "pending" | "active" | "completed" | "paid";
}

interface Booking {
  id: number;
  talentId: number;
  talentName: string;
  employerName: string;
  projectTitle: string;
  description: string;
  milestones: Milestone[];
  totalBudget: string;
  startDate: string;
  endDate: string;
  terms: string;
  status: "proposed" | "accepted" | "rejected" | "active" | "completed";
  createdAt: string;
}

interface TalentProfile {
  id: string;
  name: string;
  role: string;
  rate: string;
  location: string;
  avatar?: string | null;
}

/* ───────────────────── Animation Variants ───────────────────── */
const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.06, duration: 0.5, ease: [0.19, 1, 0.22, 1] },
  }),
};

const stepVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 40 : -40,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
    transition: { duration: 0.4, ease: [0.19, 1, 0.22, 1] },
  },
  exit: (direction: number) => ({
    x: direction < 0 ? 40 : -40,
    opacity: 0,
    transition: { duration: 0.3, ease: [0.19, 1, 0.22, 1] },
  }),
};

/* ───────────────────── Card Component ───────────────────── */
function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-white/[0.03] backdrop-blur-xl border border-white/[0.06] rounded-2xl p-6 ${className}`}>
      {children}
    </div>
  );
}

/* ───────────────────── Input Components ───────────────────── */
function Input({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  required,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label className="block text-[#A0A0A0] text-sm mb-2">
        {label}
        {required && <span className="text-[#C6FF34] ml-1">*</span>}
      </label>
      <StableInput
        type={type}
        value={value}
        onValueChange={onChange}
        placeholder={placeholder}
        className="w-full bg-white/[0.05] border border-white/[0.1] rounded-xl px-4 py-3 text-white text-sm placeholder:text-[#444444] focus:border-[#C6FF34] focus:outline-none transition-colors"
        required={required}
      />
    </div>
  );
}

/* ─── Error Message ─── */
function FormError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="text-red-400 text-xs mt-1.5">{message}</p>;
}

function Textarea({
  label,
  value,
  onChange,
  placeholder,
  rows = 4,
  required,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  rows?: number;
  required?: boolean;
}) {
  return (
    <div>
      <label className="block text-[#A0A0A0] text-sm mb-2">
        {label}
        {required && <span className="text-[#C6FF34] ml-1">*</span>}
      </label>
      <StableTextarea
        value={value}
        onValueChange={onChange}
        placeholder={placeholder}
        rows={rows}
        className="w-full bg-white/[0.05] border border-white/[0.1] rounded-xl px-4 py-3 text-white text-sm placeholder:text-[#444444] focus:border-[#C6FF34] focus:outline-none transition-colors resize-none"
        required={required}
      />
    </div>
  );
}

/* ───────────────────── Get Talent Data ───────────────────── */
function getTalentById(id: string): TalentProfile | null {
  // Try mock data first
  const mockTalents: TalentProfile[] = [
    { id: "1", name: "Mutale Mwanza", role: "Senior Frontend Developer", rate: "ZMW 800/hour", location: "Lusaka, Zambia" },
    { id: "2", name: "Grace Lungu", role: "Product Designer", rate: "ZMW 600/hour", location: "Ndola, Zambia" },
    { id: "3", name: "Amara Okafor", role: "Data Scientist", rate: "\u20A65,000/hour", location: "Lagos, Nigeria" },
    { id: "4", name: "Kofi Mensah", role: "Mobile Developer", rate: "GHS 400/hour", location: "Accra, Ghana" },
    { id: "5", name: "Zara Ibrahim", role: "UX Researcher", rate: "KES 3,000/hour", location: "Nairobi, Kenya" },
    { id: "6", name: "Tendai Mutasa", role: "Marketing Strategist", rate: "USD 50/hour", location: "Harare, Zimbabwe" },
    { id: "7", name: "Amina Diallo", role: "DevOps Engineer", rate: "CFA 50,000/hour", location: "Dakar, Senegal" },
    { id: "8", name: "Chidi Okafor", role: "Backend Engineer", rate: "\u20A66,000/hour", location: "Enugu, Nigeria" },
    { id: "9", name: "Pastor James Mwale", role: "Pastoral Counselor", rate: "Negotiable", location: "Lusaka, Zambia" },
    { id: "10", name: "Fatima Said", role: "Agricultural Engineer", rate: "TZS 100,000/hour", location: "Dar es Salaam, Tanzania" },
    { id: "11", name: "Nia Johnson", role: "AI Researcher", rate: "USD 80/hour", location: "Kigali, Rwanda" },
    { id: "12", name: "Dr. Omar Hassan", role: "Public Health Specialist", rate: "EGP 1,500/hour", location: "Cairo, Egypt" },
  ];

  // Check localStorage profiles
  const storedProfiles = safeJSONParse<any[]>("talent_profiles", []);
  const localProfiles = Array.isArray(storedProfiles) ? storedProfiles : [];

  const all = [...localProfiles, ...mockTalents];
  return all.find((t) => String(t.id) === String(id)) || null;
}

function getCurrentEmployerName(): string {
  const parsed = safeJSONParse("auth_user", null);
  if (parsed) {
    return parsed.name || parsed.email || "Employer";
  }
  return "Employer";
}

/* ───────────────────── Save Booking ───────────────────── */
function saveBooking(booking: Booking) {
  const bookings = safeJSONParse<Booking[]>("bookings_data", []);
  bookings.push(booking);
  safeJSONSet("bookings_data", bookings);
}

/* ───────────────────── Format Currency ───────────────────── */
function formatCurrency(amount: string): string {
  const num = parseFloat(amount);
  if (isNaN(num)) return amount;
  return num.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

/* ───────────────────── Step Indicator ───────────────────── */
function StepIndicator({ currentStep }: { currentStep: number }) {
  const steps = ["Proposal", "Sent"];
  return (
    <div className="flex items-center justify-center gap-3 mb-10">
      {steps.map((step, i) => {
        const isActive = i + 1 === currentStep;
        const isCompleted = i + 1 < currentStep;
        return (
          <div key={step} className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300 ${
                  isCompleted
                    ? "bg-[#C6FF34] text-black"
                    : isActive
                    ? "bg-[#7E3BED] text-white"
                    : "bg-white/[0.06] border border-white/[0.1] text-[#666666]"
                }`}
              >
                {isCompleted ? (
                  <CheckCircle className="w-4 h-4" />
                ) : (
                  i + 1
                )}
              </div>
              <span
                className={`text-sm font-medium transition-colors ${
                  isActive || isCompleted ? "text-white" : "text-[#666666]"
                }`}
              >
                {step}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div
                className={`w-12 h-px transition-colors ${
                  isCompleted ? "bg-[#C6FF34]" : "bg-white/[0.1]"
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   Booking Page
   ═══════════════════════════════════════════════════════════ */
export default function Booking() {
  const { talentId } = useParams<{ talentId: string }>();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  /* ── Form State ── */
  const [projectTitle, setProjectTitle] = useState("");
  const [description, setDescription] = useState("");
  const [milestones, setMilestones] = useState<Milestone[]>([
    { name: "", description: "", dueDate: "", amount: "", status: "pending" },
  ]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [terms, setTerms] = useState("");
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [submittedBooking, setSubmittedBooking] = useState<Booking | null>(null);

  const MAX_PROJECT_TITLE_LENGTH = 200;
  const MAX_DESCRIPTION_LENGTH = 5000;
  const MAX_MILESTONE_NAME_LENGTH = 200;
  const MAX_TERMS_LENGTH = 5000;
  const MAX_BUDGET = 999999999.99;

  const sanitizeInput = (input: string): string => {
    return input.trim().replace(/[<>]/g, '');
  };

  const validateForm = (): boolean => {
    const errors: {[key: string]: string} = {};

    const title = projectTitle.trim();
    if (!title) {
      errors.projectTitle = "Project title is required";
    } else if (title.length > MAX_PROJECT_TITLE_LENGTH) {
      errors.projectTitle = `Project title must be less than ${MAX_PROJECT_TITLE_LENGTH} characters`;
    }

    const desc = description.trim();
    if (!desc) {
      errors.description = "Project description is required";
    } else if (desc.length > MAX_DESCRIPTION_LENGTH) {
      errors.description = `Description must be less than ${MAX_DESCRIPTION_LENGTH} characters`;
    }

    if (!startDate) {
      errors.startDate = "Start date is required";
    }
    if (!endDate) {
      errors.endDate = "End date is required";
    }
    if (startDate && endDate && !isValidDateRange(startDate, endDate)) {
      errors.endDate = "End date must be after start date";
    }

    // Validate milestones
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    milestones.forEach((m, index) => {
      const mName = m.name.trim();
      if (!mName) {
        errors[`milestone_${index}_name`] = `Milestone ${index + 1} name is required`;
      } else if (mName.length > MAX_MILESTONE_NAME_LENGTH) {
        errors[`milestone_${index}_name`] = `Milestone name must be less than ${MAX_MILESTONE_NAME_LENGTH} characters`;
      }

      const amt = parseFloat(m.amount);
      if (!m.amount || isNaN(amt) || amt <= 0) {
        errors[`milestone_${index}_amount`] = 'Enter a positive amount';
      } else if (amt > MAX_BUDGET) {
        errors[`milestone_${index}_amount`] = `Milestone amount exceeds maximum allowed`;
      }

      if (!m.dueDate) {
        errors[`milestone_${index}_date`] = `Milestone ${index + 1} due date is required`;
      } else if (startDate && endDate) {
        const mDate = new Date(m.dueDate);
        const projStart = new Date(startDate);
        const projEnd = new Date(endDate);
        if (mDate < projStart || mDate > projEnd) {
          errors[`milestone_${index}_date`] = `Due date must be within project timeline`;
        }
      }
    });

    // Check total budget
    const total = parseFloat(totalBudget);
    if (total > MAX_BUDGET) {
      errors.totalBudget = `Total budget exceeds maximum allowed value`;
    }

    const termsVal = terms.trim();
    if (termsVal.length > MAX_TERMS_LENGTH) {
      errors.terms = `Terms must be less than ${MAX_TERMS_LENGTH} characters`;
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  /* ── Talent Data ── */
  const talent = useMemo(() => getTalentById(talentId || ""), [talentId]);

  /* ── Computed ── */
  const totalBudget = useMemo(() => {
    const total = milestones.reduce((sum, m) => {
      const amt = parseFloat(m.amount);
      return sum + (isNaN(amt) ? 0 : amt);
    }, 0);
    return total.toFixed(2);
  }, [milestones]);

  /* ── Milestone Handlers ── */
  const addMilestone = () => {
    if (milestones.length >= 5) return;
    setMilestones((prev) => [
      ...prev,
      { name: "", description: "", dueDate: "", amount: "", status: "pending" },
    ]);
  };

  const removeMilestone = (index: number) => {
    setMilestones((prev) => prev.filter((_, i) => i !== index));
  };

  const updateMilestone = (index: number, field: keyof Milestone, value: string) => {
    setMilestones((prev) =>
      prev.map((m, i) => (i === index ? { ...m, [field]: value } : m))
    );
  };

  /* ── Submit ── */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!talent || isSubmitting) return;

    setIsSubmitting(true);
    setFormErrors({});

    if (!validateForm()) {
      setIsSubmitting(false);
      return;
    }

    const employerName = getCurrentEmployerName();
    const sanitizedTitle = sanitizeInput(projectTitle);
    const sanitizedDescription = sanitizeInput(description);
    const sanitizedTerms = sanitizeInput(terms);

    const booking: Booking = {
      id: Date.now(),
      talentId: parseInt(talent.id) || 0,
      talentName: talent.name,
      employerName,
      projectTitle: sanitizedTitle,
      description: sanitizedDescription,
      milestones: milestones.map((m) => ({
        name: sanitizeInput(m.name),
        description: sanitizeInput(m.description),
        dueDate: m.dueDate,
        amount: m.amount,
        status: "pending" as const,
      })),
      totalBudget,
      startDate,
      endDate,
      terms: sanitizedTerms,
      status: "proposed",
      createdAt: new Date().toISOString(),
    };

    saveBooking(booking);
    setSubmittedBooking(booking);
    setDirection(1);
    setStep(2);
  };

  /* ── Not Found ── */
  if (!talent) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center px-6">
        <motion.div
          className="text-center max-w-md"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.19, 1, 0.22, 1] }}
        >
          <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-6">
            <Briefcase className="w-10 h-10 text-[#666666]" />
          </div>
          <h1 className="text-white text-3xl font-display mb-3">Talent Not Found</h1>
          <p className="text-[#666666] mb-8">
            The talent you are trying to hire could not be found.
          </p>
          <Link
            to="/talent"
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#C6FF34] text-black font-semibold rounded-xl hover:bg-[#d4ff5c] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Browse All Talent
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <main className="bg-black min-h-screen">
      {/* ── Subtle top gradient ── */}
      <div className="relative">
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full opacity-[0.04] pointer-events-none"
          style={{ background: "radial-gradient(ellipse, #7E3BED 0%, transparent 70%)" }}
        />

        {/* Back button */}
        <div className="relative z-10 max-w-3xl mx-auto px-6 pt-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Link
              to={`/talent/${talent.id}`}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white/[0.03] backdrop-blur-sm border border-white/[0.08] rounded-xl text-[#A0A0A0] text-sm hover:text-white hover:bg-white/[0.06] transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to {talent.name}
            </Link>
          </motion.div>
        </div>

        {/* ── Page Header ── */}
        <section className="relative z-10 max-w-3xl mx-auto px-6 pt-8 pb-4">
          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.19, 1, 0.22, 1] }}
          >
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#C6FF34] to-[#7E3BED] flex items-center justify-center mx-auto mb-4 shadow-lg shadow-[#C6FF34]/10">
              <Briefcase className="w-7 h-7 text-black" />
            </div>
            <h1 className="font-display text-3xl sm:text-4xl text-white mb-2">
              Hire {talent.name}
            </h1>
            <p className="text-[#666666] text-sm">
              {talent.role} &middot; {talent.rate}
            </p>
          </motion.div>
        </section>

        {/* ── Step Indicator ── */}
        <section className="relative z-10 max-w-3xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <StepIndicator currentStep={step} />
          </motion.div>
        </section>

        {/* ── Main Content ── */}
        <section className="relative z-10 max-w-3xl mx-auto px-6 pb-20">
          <AnimatePresence mode="wait" custom={direction}>
            {step === 1 ? (
              <motion.div
                key="step1"
                custom={direction}
                variants={stepVariants}
                initial="enter"
                animate="center"
                exit="exit"
              >
                <Card>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Project Title */}
                    <motion.div
                      custom={0}
                      variants={fadeUp}
                      initial="hidden"
                      animate="visible"
                    >
                      <div>
                        <Input
                          label="Project Title"
                          value={projectTitle}
                          onChange={(val: string) => {
                            setProjectTitle(val);
                            if (formErrors.projectTitle) setFormErrors(prev => { const n = { ...prev }; delete n.projectTitle; return n; });
                          }}
                          placeholder="e.g. E-Commerce Platform Redesign"
                          required
                        />
                        <FormError message={formErrors.projectTitle} />
                      </div>
                    </motion.div>

                    {/* Project Description */}
                    <motion.div
                      custom={1}
                      variants={fadeUp}
                      initial="hidden"
                      animate="visible"
                    >
                      <div>
                        <Textarea
                          label="Project Description"
                          value={description}
                          onChange={(val: string) => {
                            setDescription(val);
                            if (formErrors.description) setFormErrors(prev => { const n = { ...prev }; delete n.description; return n; });
                          }}
                          placeholder="Describe the scope of work, goals, and expected outcomes..."
                          rows={5}
                          required
                        />
                        <FormError message={formErrors.description} />
                      </div>
                    </motion.div>

                    {/* ── Milestones ── */}
                    <motion.div
                      custom={2}
                      variants={fadeUp}
                      initial="hidden"
                      animate="visible"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <label className="text-[#A0A0A0] text-sm">Milestones</label>
                        <span className="text-[#666666] text-xs">
                          {milestones.length}/5
                        </span>
                      </div>

                      <div className="space-y-4">
                        <AnimatePresence>
                          {milestones.map((milestone, index) => (
                            <motion.div
                              key={index}
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              exit={{ opacity: 0, height: 0 }}
                              transition={{ duration: 0.3 }}
                              className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-4"
                            >
                              <div className="flex items-center justify-between mb-3">
                                <span className="text-[#C6FF34] text-xs font-medium">
                                  Milestone {index + 1}
                                </span>
                                {milestones.length > 1 && (
                                  <button
                                    type="button"
                                    onClick={() => removeMilestone(index)}
                                    className="text-[#666666] hover:text-red-400 transition-colors"
                                  >
                                    <X className="w-4 h-4" />
                                  </button>
                                )}
                              </div>

                              <div className="grid sm:grid-cols-2 gap-3">
                                <div>
                                  <StableInput
                                    type="text"
                                    value={milestone.name}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                      updateMilestone(index, "name", e.target.value);
                                      if (formErrors[`milestone_${index}_name`]) setFormErrors(prev => { const n = { ...prev }; delete n[`milestone_${index}_name`]; return n; });
                                    }}
                                    placeholder="Milestone name"
                                    maxLength={MAX_MILESTONE_NAME_LENGTH}
                                    className={`w-full bg-white/[0.05] border rounded-xl px-4 py-2.5 text-white text-sm placeholder:text-[#444444] focus:border-[#C6FF34] focus:outline-none transition-colors ${formErrors[`milestone_${index}_name`] ? 'border-red-400/50' : 'border-white/[0.1]'}`}
                                    required
                                  />
                                  <FormError message={formErrors[`milestone_${index}_name`]} />
                                </div>
                                <div>
                                  <StableInput
                                    type="date"
                                    value={milestone.dueDate}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                      updateMilestone(index, "dueDate", e.target.value);
                                      if (formErrors[`milestone_${index}_date`]) setFormErrors(prev => { const n = { ...prev }; delete n[`milestone_${index}_date`]; return n; });
                                    }}
                                    className={`w-full bg-white/[0.05] border rounded-xl px-4 py-2.5 text-white text-sm focus:border-[#C6FF34] focus:outline-none transition-colors [color-scheme:dark] ${formErrors[`milestone_${index}_date`] ? 'border-red-400/50' : 'border-white/[0.1]'}`}
                                    required
                                  />
                                  <FormError message={formErrors[`milestone_${index}_date`]} />
                                </div>
                                <div>
                                  <StableInput
                                    type="number"
                                    value={milestone.amount}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                      updateMilestone(index, "amount", e.target.value);
                                      if (formErrors[`milestone_${index}_amount`]) setFormErrors(prev => { const n = { ...prev }; delete n[`milestone_${index}_amount`]; return n; });
                                    }}
                                    placeholder="Payment amount"
                                    min="0"
                                    step="0.01"
                                    className={`w-full bg-white/[0.05] border rounded-xl px-4 py-2.5 text-white text-sm placeholder:text-[#444444] focus:border-[#C6FF34] focus:outline-none transition-colors ${formErrors[`milestone_${index}_amount`] ? 'border-red-400/50' : 'border-white/[0.1]'}`}
                                    required
                                  />
                                  <FormError message={formErrors[`milestone_${index}_amount`]} />
                                </div>
                                <StableInput
                                  type="text"
                                  value={milestone.description}
                                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                    updateMilestone(index, "description", e.target.value)
                                  }
                                  placeholder="Description"
                                  className="w-full bg-white/[0.05] border border-white/[0.1] rounded-xl px-4 py-2.5 text-white text-sm placeholder:text-[#444444] focus:border-[#C6FF34] focus:outline-none transition-colors"
                                />
                              </div>
                            </motion.div>
                          ))}
                        </AnimatePresence>
                      </div>

                      {milestones.length < 5 && (
                        <button
                          type="button"
                          onClick={addMilestone}
                          className="mt-4 inline-flex items-center gap-2 px-4 py-2.5 border border-[#7E3BED]/30 text-[#7E3BED] text-sm font-medium rounded-xl hover:bg-[#7E3BED]/10 transition-colors"
                        >
                          <Plus className="w-4 h-4" />
                          Add Milestone
                        </button>
                      )}
                    </motion.div>

                    {/* Total Budget */}
                    <motion.div
                      custom={3}
                      variants={fadeUp}
                      initial="hidden"
                      animate="visible"
                      className="flex items-center justify-between bg-[#C6FF34]/5 border border-[#C6FF34]/20 rounded-xl px-5 py-4"
                    >
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-[#C6FF34]" />
                        <span className="text-[#A0A0A0] text-sm">Total Budget</span>
                      </div>
                      <span className="text-[#C6FF34] text-xl font-display font-bold">
                        {formatCurrency(totalBudget)}
                      </span>
                    </motion.div>

                    {/* Dates */}
                    <motion.div
                      custom={4}
                      variants={fadeUp}
                      initial="hidden"
                      animate="visible"
                      className="grid sm:grid-cols-2 gap-4"
                    >
                      <div>
                        <label className="block text-[#A0A0A0] text-sm mb-2">
                          Start Date
                        </label>
                        <div className="relative">
                          <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#666666] pointer-events-none" />
                          <StableInput
                            type="date"
                            value={startDate}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                              setStartDate(e.target.value);
                              if (formErrors.startDate) setFormErrors(prev => { const n = { ...prev }; delete n.startDate; return n; });
                            }}
                            className={`w-full bg-white/[0.05] border rounded-xl pl-10 pr-4 py-3 text-white text-sm focus:border-[#C6FF34] focus:outline-none transition-colors [color-scheme:dark] ${formErrors.startDate ? 'border-red-400/50' : 'border-white/[0.1]'}`}
                            required
                          />
                        </div>
                        <FormError message={formErrors.startDate} />
                      </div>
                      <div>
                        <label className="block text-[#A0A0A0] text-sm mb-2">
                          End Date
                        </label>
                        <div className="relative">
                          <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#666666] pointer-events-none" />
                          <StableInput
                            type="date"
                            value={endDate}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                              setEndDate(e.target.value);
                              if (formErrors.endDate) setFormErrors(prev => { const n = { ...prev }; delete n.endDate; return n; });
                            }}
                            className={`w-full bg-white/[0.05] border rounded-xl pl-10 pr-4 py-3 text-white text-sm focus:border-[#C6FF34] focus:outline-none transition-colors [color-scheme:dark] ${formErrors.endDate ? 'border-red-400/50' : 'border-white/[0.1]'}`}
                            required
                          />
                        </div>
                        <FormError message={formErrors.endDate} />
                      </div>
                    </motion.div>

                    {/* Terms */}
                    <motion.div
                      custom={5}
                      variants={fadeUp}
                      initial="hidden"
                      animate="visible"
                    >
                      <Textarea
                        label="Terms & Conditions"
                        value={terms}
                        onChange={setTerms}
                        placeholder="Payment terms, deliverables, revision policy, etc..."
                        rows={4}
                      />
                    </motion.div>

                    {/* Submit */}
                    <motion.div
                      custom={6}
                      variants={fadeUp}
                      initial="hidden"
                      animate="visible"
                      className="pt-2"
                    >
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full py-4 bg-[#C6FF34] text-black font-semibold rounded-xl hover:bg-[#d4ff5c] transition-colors flex items-center justify-center gap-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Sending...
                          </>
                        ) : (
                          <>
                            <Send className="w-4 h-4" />
                            Send Proposal
                          </>
                        )}
                      </button>
                    </motion.div>
                  </form>
                </Card>
              </motion.div>
            ) : (
              <motion.div
                key="step2"
                custom={direction}
                variants={stepVariants}
                initial="enter"
                animate="center"
                exit="exit"
              >
                <Card className="text-center">
                  {/* Success Icon */}
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{
                      type: "spring",
                      stiffness: 200,
                      damping: 15,
                      delay: 0.1,
                    }}
                    className="w-20 h-20 rounded-full bg-[#C6FF34]/10 border border-[#C6FF34]/30 flex items-center justify-center mx-auto mb-6"
                  >
                    <CheckCircle className="w-10 h-10 text-[#C6FF34]" />
                  </motion.div>

                  {/* Title */}
                  <motion.h2
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="font-display text-2xl sm:text-3xl text-white mb-2"
                  >
                    Proposal Sent!
                  </motion.h2>

                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="text-[#666666] text-sm mb-8"
                  >
                    Your proposal has been sent to{" "}
                    <span className="text-white font-medium">
                      {talent.name}
                    </span>
                    . You will be notified when they respond.
                  </motion.p>

                  {/* Summary Card */}
                  {submittedBooking && (
                    <motion.div
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                      className="text-left bg-white/[0.02] border border-white/[0.06] rounded-xl p-5 mb-8"
                    >
                      <div className="flex items-center gap-2 mb-4 pb-4 border-b border-white/[0.06]">
                        <FileText className="w-4 h-4 text-[#C6FF34]" />
                        <h3 className="text-white font-semibold text-sm">
                          Proposal Summary
                        </h3>
                        <span className="ml-auto text-xs bg-[#7E3BED]/10 border border-[#7E3BED]/30 text-[#7E3BED] px-2.5 py-1 rounded-full font-medium">
                          Pending Acceptance
                        </span>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-start gap-3">
                          <Target className="w-4 h-4 text-[#666666] mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="text-[#666666] text-xs">Project</p>
                            <p className="text-white text-sm">
                              {submittedBooking.projectTitle}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-start gap-3">
                          <DollarSign className="w-4 h-4 text-[#666666] mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="text-[#666666] text-xs">Total Budget</p>
                            <p className="text-[#C6FF34] text-sm font-semibold">
                              {formatCurrency(submittedBooking.totalBudget)}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-start gap-3">
                          <Clock className="w-4 h-4 text-[#666666] mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="text-[#666666] text-xs">Timeline</p>
                            <p className="text-white text-sm">
                              {submittedBooking.startDate
                                ? new Date(
                                    submittedBooking.startDate
                                  ).toLocaleDateString("en-US", {
                                    month: "short",
                                    day: "numeric",
                                    year: "numeric",
                                  })
                                : "—"}{" "}
                              –{" "}
                              {submittedBooking.endDate
                                ? new Date(
                                    submittedBooking.endDate
                                  ).toLocaleDateString("en-US", {
                                    month: "short",
                                    day: "numeric",
                                    year: "numeric",
                                  })
                                : "—"}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-start gap-3">
                          <Briefcase className="w-4 h-4 text-[#666666] mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="text-[#666666] text-xs">Milestones</p>
                            <p className="text-white text-sm">
                              {submittedBooking.milestones.length} milestone
                              {submittedBooking.milestones.length !== 1
                                ? "s"
                                : ""}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Milestone Breakdown */}
                      {submittedBooking.milestones.length > 0 && (
                        <div className="mt-4 pt-4 border-t border-white/[0.06]">
                          <p className="text-[#666666] text-xs mb-2">
                            Milestone Breakdown
                          </p>
                          <div className="space-y-2">
                            {submittedBooking.milestones.map((m, i) => (
                              <div
                                key={i}
                                className="flex items-center justify-between text-sm"
                              >
                                <span className="text-[#A0A0A0] truncate flex-1">
                                  {i + 1}. {m.name || "Untitled"}
                                </span>
                                <span className="text-white font-medium ml-3">
                                  {m.amount
                                    ? formatCurrency(m.amount)
                                    : "—"}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="mt-6 pt-6 border-t border-white/[0.06] flex flex-col sm:flex-row gap-3">
                        <Link
                          to={`/talent/${talent.id}`}
                          className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 bg-white/[0.03] border border-white/[0.08] rounded-xl text-[#A0A0A0] text-sm font-medium hover:text-white hover:bg-white/[0.06] transition-all"
                        >
                          <ArrowLeft className="w-4 h-4" />
                          Back to Profile
                        </Link>
                        <Link
                          to="/employers"
                          className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 bg-[#C6FF34] text-black font-semibold rounded-xl text-sm hover:bg-[#d4ff5c] transition-colors"
                        >
                          <Briefcase className="w-4 h-4" />
                          Employer Dashboard
                        </Link>
                      </div>
                    </motion.div>
                  )}
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </section>
      </div>
    </main>
  );
}

/* ─── safeJSON helpers ─── */
function safeJSONParse<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function safeJSONSet(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // silently fail
  }
}
