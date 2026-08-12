import { useState } from 'react';
import { Link } from 'react-router';
import { StableInput, StableTextarea, StableSelect } from '@/components/StableInputs';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Building2,
  ShieldCheck,
  Users,
  BarChart3,
  ArrowRight,
  CheckCircle2,
  Clock,
  AlertCircle,
  Sparkles,
  TrendingUp,
  Zap,
  Globe,
  MapPin,
  Phone,
  Mail,
  User,
  Briefcase,
  ChevronRight,
  ChevronLeft,
  Upload,
  BadgeCheck,
  XCircle,
  LineChart,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { trpc } from '@/providers/trpc';

// ─── Industry & Size Options ───────────────────────────
const INDUSTRIES = [
  'Technology', 'Finance', 'Healthcare', 'Education', 'Manufacturing',
  'Agriculture', 'Energy', 'Retail', 'Media', 'Telecommunications',
  'Construction', 'Transportation', 'Hospitality', 'Consulting', 'Other',
];

const COMPANY_SIZES = [
  '1-10 employees', '11-50 employees', '51-200 employees',
  '201-500 employees', '501-1000 employees', '1000+ employees',
];

const COUNTRIES = [
  'Zambia', 'Nigeria', 'Kenya', 'Ghana', 'South Africa',
  'Rwanda', 'Uganda', 'Tanzania', 'Senegal', 'Egypt', 'Tunisia', 'Zimbabwe',
];

// ─── Animation Variants ────────────────────────────────
const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.1, duration: 0.7, ease: [0.19, 1, 0.22, 1] },
  }),
};

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1, delayChildren: 0.1 } },
};

// ─── Input Classes ─────────────────────────────────────
const inputClass = 'w-full px-4 py-3.5 bg-white/[0.05] border border-white/[0.12] rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:border-[#C6FF34] focus:ring-2 focus:ring-[#C6FF34]/20 focus:bg-white/[0.08] hover:border-white/[0.2] transition-all duration-200 text-sm font-body';
const selectClass = 'w-full px-4 py-3.5 bg-white/[0.05] border border-white/[0.12] rounded-xl text-white focus:outline-none focus:border-[#C6FF34] focus:ring-2 focus:ring-[#C6FF34]/20 focus:bg-white/[0.08] hover:border-white/[0.2] transition-all duration-200 text-sm font-body appearance-none cursor-pointer';
const labelClass = 'block text-white/70 text-sm font-medium mb-2 font-body';
const requiredMark = <span className="text-[#C6FF34]"> *</span>;

// ─── Types ─────────────────────────────────────────────
interface EmployerForm {
  companyName: string;
  registrationNumber: string;
  industry: string;
  companySize: string;
  website: string;
  description: string;
  businessAddress: string;
  city: string;
  country: string;
  contactName: string;
  contactTitle: string;
  contactEmail: string;
  contactPhone: string;
}

const INITIAL_FORM: EmployerForm = {
  companyName: '', registrationNumber: '', industry: '', companySize: '',
  website: '', description: '', businessAddress: '', city: '', country: '',
  contactName: '', contactTitle: '', contactEmail: '', contactPhone: '',
};

// ─── Mock Verified Employers ───────────────────────────
const VERIFIED_EMPLOYERS = [
  {
    name: 'BongoHive', industry: 'Technology & Innovation', location: 'Lusaka, Zambia',
    size: '50-200 employees', logo: 'B', verified: true,
  },
  {
    name: 'MPharma', industry: 'Healthcare', location: 'Accra, Ghana',
    size: '200-500 employees', logo: 'M', verified: true,
  },
  {
    name: 'Flutterwave', industry: 'Financial Technology', location: 'Lagos, Nigeria',
    size: '500-1000 employees', logo: 'F', verified: true,
  },
  {
    name: 'Andela', industry: 'Technology', location: 'Nairobi, Kenya',
    size: '1000+ employees', logo: 'A', verified: true,
  },
  {
    name: 'Wave', industry: 'Financial Technology', location: 'Dakar, Senegal',
    size: '200-500 employees', logo: 'W', verified: true,
  },
  {
    name: 'Paystack', industry: 'Financial Technology', location: 'Lagos, Nigeria',
    size: '200-500 employees', logo: 'P', verified: true,
  },
];

// ════════════════════════════════════════════════════════
// MAIN COMPONENT
// ════════════════════════════════════════════════════════
export default function Employers() {
  const { isAuthenticated } = useAuth();
  const organizations = trpc.organization.listMine.useQuery(undefined, {
    enabled: isAuthenticated,
  });
  const organization = organizations.data?.[0];
  const registrationStatus = organization?.verificationStatus === 'in_review'
    ? 'pending'
    : organization?.verificationStatus;

  return (
    <div className="relative">
      <Hero />
      <VerifiedEmployers />
      <Features />
      <HowItWorks />
      {isAuthenticated ? (
        organizations.isLoading ? (
          <section className="py-24 bg-black text-center text-white/50">Loading your organization…</section>
        ) : organization && registrationStatus ? (
          <StatusView status={registrationStatus} organizationName={organization.name} />
        ) : (
          <RegistrationForm onSubmit={() => void organizations.refetch()} />
        )
      ) : (
        <CTALogin />
      )}
    </div>
  );
}

// ─── Hero Section ──────────────────────────────────────
function Hero() {
  return (
    <section className="relative min-h-[60vh] flex items-center justify-center overflow-hidden bg-black pt-24 pb-12">
      <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full opacity-[0.06]"
        style={{ background: "radial-gradient(circle, #7E3BED 0%, transparent 70%)" }} />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full opacity-[0.04]"
        style={{ background: "radial-gradient(circle, #C6FF34 0%, transparent 70%)" }} />

      <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
        <motion.div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#7E3BED]/10 border border-[#7E3BED]/20 mb-8"
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <ShieldCheck className="w-4 h-4 text-[#7E3BED]" />
          <span className="text-[#7E3BED] text-sm font-medium">Verified Business Partners</span>
        </motion.div>

        <motion.h1 className="font-display text-5xl sm:text-6xl lg:text-7xl text-white leading-[1.05] mb-6"
          initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}>
          Hire <span className="bg-gradient-to-r from-[#C6FF34] to-[#7E3BED] bg-clip-text text-transparent">Verified</span>{" "}
          African Talent
        </motion.h1>

        <motion.p className="text-white/60 text-lg sm:text-xl max-w-2xl mx-auto mb-10 leading-relaxed"
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.25 }}>
          Every employer on Levav&trade; is verified. Every business is validated.
          Hire with complete confidence.
        </motion.p>

        <motion.div className="flex flex-wrap items-center justify-center gap-6 text-sm text-white/50"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
          <span className="flex items-center gap-2"><CheckCircle2 size={16} className="text-[#C6FF34]" /> Business Verified</span>
          <span className="flex items-center gap-2"><CheckCircle2 size={16} className="text-[#C6FF34]" /> Contact Verified</span>
          <span className="flex items-center gap-2"><CheckCircle2 size={16} className="text-[#C6FF34]" /> Identity Confirmed</span>
        </motion.div>

        {/* Market Intelligence CTA */}
        <motion.div
          className="mt-10"
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.65, duration: 0.6 }}
        >
          <Link
            to="/market-intel"
            className="inline-flex items-center gap-3 px-6 py-3.5 bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] rounded-2xl hover:border-[#C6FF34]/30 hover:bg-white/[0.06] transition-all group"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#C6FF34]/20 to-[#7E3BED]/20 flex items-center justify-center">
              <LineChart className="w-5 h-5 text-[#C6FF34]" />
            </div>
            <div className="text-left">
              <p className="text-white text-sm font-semibold group-hover:text-[#C6FF34] transition-colors">
                Market Intelligence
              </p>
              <p className="text-white/40 text-xs">
                Salary benchmarks, demand trends &amp; cost calculator
              </p>
            </div>
            <ArrowRight size={16} className="text-white/30 group-hover:text-[#C6FF34] group-hover:translate-x-1 transition-all ml-2" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}

// ─── Verified Employers Showcase ───────────────────────
function VerifiedEmployers() {
  return (
    <section className="py-16 bg-[#0A0A0A] border-y border-white/[0.04]">
      <div className="max-w-6xl mx-auto px-6">
        <motion.div className="text-center mb-10"
          initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <span className="text-[#C6FF34] text-xs font-medium tracking-widest uppercase">Trusted Partners</span>
          <h2 className="font-display text-2xl text-white mt-2">Verified Employers on Levav&trade;</h2>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {VERIFIED_EMPLOYERS.map((emp, i) => (
            <motion.div key={emp.name}
              className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-5 hover:border-white/[0.12] transition-all group"
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ delay: i * 0.05 }}>
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#C6FF34]/20 to-[#7E3BED]/20 flex items-center justify-center text-lg font-bold text-[#C6FF34] shrink-0">
                  {emp.logo}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-white font-semibold text-sm truncate">{emp.name}</h3>
                    <BadgeCheck size={16} className="text-[#C6FF34] shrink-0" />
                  </div>
                  <p className="text-white/40 text-xs mt-0.5">{emp.industry}</p>
                  <div className="flex items-center gap-3 mt-2 text-white/30 text-xs">
                    <span className="flex items-center gap-1"><MapPin size={10} /> {emp.location}</span>
                    <span className="flex items-center gap-1"><Users size={10} /> {emp.size}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Features ──────────────────────────────────────────
function Features() {
  const features = [
    { icon: ShieldCheck, title: 'Verified Employers Only', desc: 'Every business undergoes rigorous verification before accessing the platform.', color: '#C6FF34' },
    { icon: BarChart3, title: 'WRI Talent Scores', desc: 'Access Workforce Readiness Index scores for data-driven hiring decisions.', color: '#7E3BED' },
    { icon: Users, title: 'Verified Talent Pool', desc: 'Browse talent that has been through Levav 28 training and verification.', color: '#C6FF34' },
    { icon: Zap, title: 'Smart Matching', desc: 'AI-powered matching connects you with the right talent based on your needs.', color: '#7E3BED' },
  ];

  return (
    <section className="py-24 bg-black">
      <div className="max-w-6xl mx-auto px-6">
        <motion.div className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <span className="text-[#7E3BED] text-sm font-medium tracking-wider uppercase mb-4 block">Why Levav for Employers</span>
          <h2 className="font-display text-4xl sm:text-5xl text-white mb-4">Built for Serious Hiring</h2>
          <p className="text-white/50 text-lg max-w-2xl mx-auto">
            Our verification process ensures only legitimate businesses access our talent pool.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 gap-5">
          {features.map((f, i) => (
            <motion.div key={f.title}
              className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.06] rounded-2xl p-8 hover:border-white/[0.12] transition-all"
              initial={{ opacity: 0, scale: 0.92 }} whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
              <div className="w-14 h-14 rounded-xl flex items-center justify-center mb-6" style={{ backgroundColor: `${f.color}15` }}>
                <f.icon className="w-7 h-7" style={{ color: f.color }} />
              </div>
              <h3 className="text-white text-xl font-semibold mb-3">{f.title}</h3>
              <p className="text-white/50 text-[15px] leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── How It Works ──────────────────────────────────────
function HowItWorks() {
  const steps = [
    { icon: Building2, title: 'Register Your Business', desc: 'Submit your company details, contact information, and business registration documents.' },
    { icon: Clock, title: 'Verification Review', desc: 'Our team reviews your application within 1-2 business days to validate your business.' },
    { icon: ShieldCheck, title: 'Get Verified', desc: 'Once approved, your business receives a verified badge and full platform access.' },
    { icon: Users, title: 'Start Hiring', desc: 'Browse verified talent, post jobs, and build your dream team with confidence.' },
  ];

  return (
    <section className="py-24 bg-[#0A0A0A]">
      <div className="max-w-5xl mx-auto px-6">
        <motion.div className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <span className="text-[#C6FF34] text-sm font-medium tracking-wider uppercase mb-4 block">The Process</span>
          <h2 className="font-display text-4xl sm:text-5xl text-white mb-4">Four Steps to Verification</h2>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, i) => (
            <motion.div key={step.title} className="text-center"
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
              <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-[#C6FF34]/20 to-[#7E3BED]/20 border border-white/[0.06] flex items-center justify-center mx-auto mb-5">
                <step.icon className="w-7 h-7 text-[#C6FF34]" />
                <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-[#C6FF34] text-black text-xs font-bold flex items-center justify-center">
                  {i + 1}
                </div>
              </div>
              <h3 className="text-white text-lg font-semibold mb-2">{step.title}</h3>
              <p className="text-white/50 text-sm leading-relaxed">{step.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── CTA for non-authenticated users ───────────────────
function CTALogin() {
  return (
    <section className="py-24 bg-black relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full opacity-[0.06]"
        style={{ background: "radial-gradient(circle, #C6FF34 0%, #7E3BED 50%, transparent 70%)" }} />
      <div className="relative z-10 max-w-xl mx-auto px-6 text-center">
        <motion.div className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] rounded-3xl p-10"
          initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <ShieldCheck className="w-12 h-12 text-[#C6FF34] mx-auto mb-4" />
          <h2 className="font-display text-3xl text-white mb-3">Become a Verified Employer</h2>
          <p className="text-white/50 mb-8">
            Join Africa&apos;s most trusted hiring platform. Register your business and gain access to verified, workforce-ready talent.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/auth?mode=signup" className="btn-lime inline-flex items-center justify-center gap-2 py-3.5">
              Create Account <ArrowRight size={16} />
            </Link>
            <Link to="/auth" className="inline-flex items-center justify-center gap-2 py-3.5 px-6 rounded-full border border-white/20 text-white hover:bg-white/5 transition-all">
              Log In
            </Link>
          </div>
          <p className="text-white/30 text-xs mt-6">
            Already registered? <Link to="/auth" className="text-[#C6FF34] hover:underline">Log in to check verification status</Link>
          </p>
        </motion.div>
      </div>
    </section>
  );
}

// ─── Registration Form ─────────────────────────────────
function RegistrationForm({ onSubmit }: { onSubmit: () => void }) {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<EmployerForm>(INITIAL_FORM);
  const [errors, setErrors] = useState<Partial<Record<keyof EmployerForm, string>>>({});
  const [submitted, setSubmitted] = useState(false);
  const register = trpc.organization.register.useMutation({
    onSuccess: () => {
      setSubmitted(true);
      onSubmit();
    },
  });

  const updateField = (field: keyof EmployerForm, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => { const n = { ...prev }; delete n[field]; return n; });
  };

  const validateStep = (s: number): boolean => {
    const newErrors: Partial<Record<keyof EmployerForm, string>> = {};
    if (s === 1) {
      if (!form.companyName.trim()) newErrors.companyName = 'Company name is required';
      if (!form.industry) newErrors.industry = 'Select an industry';
      if (!form.companySize) newErrors.companySize = 'Select company size';
      if (form.website && !/^https?:\/\/.+/.test(form.website)) newErrors.website = 'Enter a valid URL';
    }
    if (s === 2) {
      if (!form.contactName.trim()) newErrors.contactName = 'Contact name is required';
      if (!form.contactTitle.trim()) newErrors.contactTitle = 'Contact title is required';
      if (!form.contactEmail.trim()) newErrors.contactEmail = 'Email is required';
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.contactEmail)) newErrors.contactEmail = 'Valid email required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateStep(2)) {
      register.mutate(form);
    }
  };

  if (submitted) {
    return (
      <section className="py-24 bg-black">
        <div className="max-w-lg mx-auto px-6 text-center">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', delay: 0.2 }}>
            <div className="w-20 h-20 rounded-full bg-[#C6FF34]/10 flex items-center justify-center mx-auto mb-6">
              <Clock size={36} className="text-[#C6FF34]" />
            </div>
          </motion.div>
          <motion.h2 className="font-display text-3xl text-white mb-3" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
            Verification Submitted
          </motion.h2>
          <motion.p className="text-white/50 mb-2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}>
            Thank you for registering <strong className="text-white">{form.companyName}</strong>.
          </motion.p>
          <motion.p className="text-white/50 mb-8" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }}>
            Our team will review your application within <strong className="text-[#C6FF34]">1-2 business days</strong>. You will receive an email at {form.contactEmail} once verification is complete.
          </motion.p>
          <motion.div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-6 text-left"
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }}>
            <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
              <AlertCircle size={16} className="text-[#7E3BED]" /> What happens next?
            </h3>
            <ul className="space-y-3 text-sm text-white/50">
              <li className="flex items-start gap-3"><span className="text-[#C6FF34] mt-0.5">1.</span> Our team reviews your business documentation</li>
              <li className="flex items-start gap-3"><span className="text-[#C6FF34] mt-0.5">2.</span> We verify your contact person and business registration</li>
              <li className="flex items-start gap-3"><span className="text-[#C6FF34] mt-0.5">3.</span> Upon approval, you receive a Verified Employer badge</li>
              <li className="flex items-start gap-3"><span className="text-[#C6FF34] mt-0.5">4.</span> Full platform access: post jobs, browse talent, hire</li>
            </ul>
          </motion.div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-24 bg-black">
      <div className="max-w-[640px] mx-auto px-6">
        <motion.div className="text-center mb-8"
          initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <ShieldCheck className="w-10 h-10 text-[#C6FF34] mx-auto mb-4" />
          <h2 className="font-display text-3xl text-white mb-2">Employer Registration</h2>
          <p className="text-white/50 text-sm">Complete your business profile for verification</p>
        </motion.div>

        {/* Step Indicator */}
        <div className="flex items-center gap-0 mb-8 max-w-xs mx-auto">
          <div className="flex-1 flex flex-col items-center gap-2">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
              step >= 1 ? 'bg-[#C6FF34] text-black' : 'bg-white/[0.05] text-white/40 border border-white/[0.1]'}`}>
              {step > 1 ? <CheckCircle2 size={18} /> : '1'}
            </div>
            <span className={`text-xs ${step >= 1 ? 'text-white' : 'text-white/40'}`}>Business</span>
          </div>
          <div className="flex-1 h-[2px] bg-white/[0.1] mx-2 relative">
            <motion.div className="absolute inset-y-0 left-0 bg-[#C6FF34] rounded-full" animate={{ width: step >= 2 ? '100%' : '0%' }} transition={{ duration: 0.3 }} />
          </div>
          <div className="flex-1 flex flex-col items-center gap-2">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
              step >= 2 ? 'bg-[#C6FF34] text-black' : 'bg-white/[0.05] text-white/40 border border-white/[0.1]'}`}>
              {step > 2 ? <CheckCircle2 size={18} /> : '2'}
            </div>
            <span className={`text-xs ${step >= 2 ? 'text-white' : 'text-white/40'}`}>Contact</span>
          </div>
        </div>

        {/* Form Card */}
        <motion.div className="form-container bg-white/[0.03] backdrop-blur-xl border border-white/[0.06] rounded-2xl p-6 sm:p-8"
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <AnimatePresence mode="wait">
            {step === 1 ? (
              <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-5">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-9 h-9 rounded-xl bg-[#C6FF34]/10 flex items-center justify-center">
                    <Building2 size={18} className="text-[#C6FF34]" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white font-display">Business Information</h3>
                    <p className="text-xs text-white/40">Tell us about your company</p>
                  </div>
                </div>

                {/* Company Name */}
                <div>
                  <label className={labelClass}>Company Name{requiredMark}</label>
                  <StableInput type="text" inputMode="text" enterKeyHint="next" autoComplete="organization" value={form.companyName} onChange={(e) => updateField('companyName', e.target.value)}
                    placeholder="e.g. BongoHive" className={`${inputClass} ${errors.companyName ? 'border-red-400/50' : ''}`} />
                  {errors.companyName && <p className="text-red-400 text-xs mt-1.5">{errors.companyName}</p>}
                </div>

                {/* Registration Number */}
                <div>
                  <label className={labelClass}>Business Registration Number <span className="text-white/30">(optional)</span></label>
                  <StableInput type="text" inputMode="text" enterKeyHint="next" autoComplete="off" value={form.registrationNumber} onChange={(e) => updateField('registrationNumber', e.target.value)}
                    placeholder="e.g. BP123456789" className={inputClass} />
                </div>

                {/* Industry + Size */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Industry{requiredMark}</label>
                    <StableSelect value={form.industry} onChange={(e) => updateField('industry', e.target.value)}
                      className={`${selectClass} ${errors.industry ? 'border-red-400/50' : ''}`}>
                      <option value="" className="bg-[#0A0A0A]">Select industry</option>
                      {INDUSTRIES.map((ind) => <option key={ind} value={ind} className="bg-[#0A0A0A]">{ind}</option>)}
                    </StableSelect>
                    {errors.industry && <p className="text-red-400 text-xs mt-1.5">{errors.industry}</p>}
                  </div>
                  <div>
                    <label className={labelClass}>Company Size{requiredMark}</label>
                    <StableSelect value={form.companySize} onChange={(e) => updateField('companySize', e.target.value)}
                      className={`${selectClass} ${errors.companySize ? 'border-red-400/50' : ''}`}>
                      <option value="" className="bg-[#0A0A0A]">Select size</option>
                      {COMPANY_SIZES.map((s) => <option key={s} value={s} className="bg-[#0A0A0A]">{s}</option>)}
                    </StableSelect>
                    {errors.companySize && <p className="text-red-400 text-xs mt-1.5">{errors.companySize}</p>}
                  </div>
                </div>

                {/* Website */}
                <div>
                  <label className={labelClass}>Website <span className="text-white/30">(optional)</span></label>
                  <StableInput type="url" inputMode="url" enterKeyHint="next" autoComplete="url" value={form.website} onChange={(e) => updateField('website', e.target.value)}
                    placeholder="https://yourcompany.com" className={`${inputClass} ${errors.website ? 'border-red-400/50' : ''}`} />
                  {errors.website && <p className="text-red-400 text-xs mt-1.5">{errors.website}</p>}
                </div>

                {/* Description */}
                <div>
                  <label className={labelClass}>Company Description <span className="text-white/30">(optional)</span></label>
                  <StableTextarea inputMode="text" enterKeyHint="next" autoComplete="off" value={form.description} onChange={(e) => updateField('description', e.target.value)}
                    placeholder="Brief description of your company..." rows={3} className={`${inputClass} resize-none`} />
                </div>

                {/* Address */}
                <div>
                  <label className={labelClass}>Business Address <span className="text-white/30">(optional)</span></label>
                  <StableInput type="text" inputMode="text" enterKeyHint="next" autoComplete="street-address" value={form.businessAddress} onChange={(e) => updateField('businessAddress', e.target.value)}
                    placeholder="Street address" className={inputClass} />
                </div>

                {/* City + Country */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>City</label>
                    <StableInput type="text" inputMode="text" enterKeyHint="next" autoComplete="address-level2" value={form.city} onChange={(e) => updateField('city', e.target.value)}
                      placeholder="Lusaka" className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>Country</label>
                    <StableSelect value={form.country} onChange={(e) => updateField('country', e.target.value)} className={selectClass}>
                      <option value="" className="bg-[#0A0A0A]">Select country</option>
                      {COUNTRIES.map((c) => <option key={c} value={c} className="bg-[#0A0A0A]">{c}</option>)}
                    </StableSelect>
                  </div>
                </div>

                <motion.button onClick={() => { if (validateStep(1)) setStep(2); }}
                  className="btn-lime w-full inline-flex items-center justify-center gap-2 py-3.5 mt-4"
                  whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  Next: Contact Person <ChevronRight size={18} />
                </motion.button>
              </motion.div>
            ) : (
              <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-5">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-9 h-9 rounded-xl bg-[#7E3BED]/10 flex items-center justify-center">
                    <User size={18} className="text-[#7E3BED]" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white font-display">Contact Person</h3>
                    <p className="text-xs text-white/40">Who we&apos;ll verify and communicate with</p>
                  </div>
                </div>

                {/* Contact Name + Title */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Full Name{requiredMark}</label>
                    <StableInput type="text" inputMode="text" enterKeyHint="next" autoComplete="name" value={form.contactName} onChange={(e) => updateField('contactName', e.target.value)}
                      placeholder="John Doe" className={`${inputClass} ${errors.contactName ? 'border-red-400/50' : ''}`} />
                    {errors.contactName && <p className="text-red-400 text-xs mt-1.5">{errors.contactName}</p>}
                  </div>
                  <div>
                    <label className={labelClass}>Job Title{requiredMark}</label>
                    <StableInput type="text" inputMode="text" enterKeyHint="next" autoComplete="organization-title" value={form.contactTitle} onChange={(e) => updateField('contactTitle', e.target.value)}
                      placeholder="HR Director" className={`${inputClass} ${errors.contactTitle ? 'border-red-400/50' : ''}`} />
                    {errors.contactTitle && <p className="text-red-400 text-xs mt-1.5">{errors.contactTitle}</p>}
                  </div>
                </div>

                {/* Contact Email */}
                <div>
                  <label className={labelClass}>Work Email{requiredMark}</label>
                  <StableInput type="email" inputMode="email" enterKeyHint="next" autoComplete="email" value={form.contactEmail} onChange={(e) => updateField('contactEmail', e.target.value)}
                    placeholder="john@company.com" className={`${inputClass} ${errors.contactEmail ? 'border-red-400/50' : ''}`} />
                  {errors.contactEmail && <p className="text-red-400 text-xs mt-1.5">{errors.contactEmail}</p>}
                  <p className="text-white/30 text-xs mt-1.5">We&apos;ll send verification instructions to this email</p>
                </div>

                {/* Contact Phone */}
                <div>
                  <label className={labelClass}>Phone Number <span className="text-white/30">(optional)</span></label>
                  <StableInput type="tel" inputMode="tel" enterKeyHint="done" autoComplete="tel" value={form.contactPhone} onChange={(e) => updateField('contactPhone', e.target.value.replace(/[^0-9\s]/g, '').slice(0, 12))}
                    placeholder="+260 97X XXX XXX" className={inputClass} />
                </div>

                {/* Verification Notice */}
                <div className="bg-[#C6FF34]/5 border border-[#C6FF34]/20 rounded-xl p-4 flex items-start gap-3">
                  <ShieldCheck size={18} className="text-[#C6FF34] shrink-0 mt-0.5" />
                  <div>
                    <p className="text-white text-sm font-medium">Verification Required</p>
                    <p className="text-white/50 text-xs mt-1">
                      Your contact person will receive an email to verify their identity.
                      Your business registration will also be reviewed by our team before approval.
                    </p>
                  </div>
                </div>

                <div className="flex flex-col gap-3 pt-2">
                  {register.error && (
                    <p role="alert" className="text-red-400 text-sm text-center">
                      {register.error.message}
                    </p>
                  )}
                  <motion.button onClick={handleSubmit} disabled={register.isPending}
                    className="btn-lime w-full inline-flex items-center justify-center gap-2 py-3.5 disabled:opacity-50"
                    whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <ShieldCheck size={18} /> {register.isPending ? 'Submitting…' : 'Submit for Verification'}
                  </motion.button>
                  <motion.button onClick={() => setStep(1)}
                    className="inline-flex items-center justify-center gap-1.5 text-sm text-white/50 hover:text-white transition-colors py-2"
                    whileHover={{ x: -3 }} whileTap={{ scale: 0.98 }}>
                    <ChevronLeft size={16} /> Back to Business Info
                  </motion.button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  );
}

// ─── Status View (after registration) ──────────────────
function StatusView({ status, organizationName }: { status: 'pending' | 'verified' | 'rejected'; organizationName: string }) {
  const statusConfig = {
    pending: {
      icon: Clock, color: '#7E3BED', bg: '#7E3BED', title: 'Verification in Progress',
      desc: 'Your application is being reviewed by our team. This typically takes 1-2 business days.',
      badge: 'Pending Verification',
    },
    verified: {
      icon: BadgeCheck, color: '#C6FF34', bg: '#C6FF34', title: 'Verified Employer',
      desc: 'Congratulations! Your business has been verified. You now have full access to the platform.',
      badge: 'Verified',
    },
    rejected: {
      icon: XCircle, color: '#ef4444', bg: '#ef4444', title: 'Verification Rejected',
      desc: 'Unfortunately, your application could not be approved. Please review the feedback and reapply.',
      badge: 'Rejected',
    },
  };

  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <section className="py-24 bg-black">
      <div className="max-w-lg mx-auto px-6">
        <motion.div className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.06] rounded-2xl p-8 text-center"
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <motion.div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
            style={{ backgroundColor: `${config.color}15` }}
            initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', delay: 0.2 }}>
            <Icon size={36} style={{ color: config.color }} />
          </motion.div>

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full mb-4" style={{ backgroundColor: `${config.color}15`, border: `1px solid ${config.color}30` }}>
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: config.color }} />
            <span className="text-xs font-medium" style={{ color: config.color }}>{config.badge}</span>
          </div>

          <h2 className="font-display text-2xl text-white mb-3">{config.title}</h2>
          <p className="text-white font-medium mb-2">{organizationName}</p>
          <p className="text-white/50 mb-8">{config.desc}</p>

          {status === 'verified' && (
            <div className="space-y-3">
              <Link to="/talent" className="btn-lime w-full inline-flex items-center justify-center gap-2 py-3.5">
                Browse Talent <ArrowRight size={16} />
              </Link>
              <Link to="/dashboard" className="w-full inline-flex items-center justify-center gap-2 py-3.5 rounded-full border border-white/20 text-white hover:bg-white/5 transition-all">
                Go to Employer Dashboard
              </Link>
            </div>
          )}

          {status === 'pending' && (
            <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-4 text-left">
              <h3 className="text-white font-semibold text-sm mb-3 flex items-center gap-2">
                <Sparkles size={14} className="text-[#C6FF34]" /> Verification Checklist
              </h3>
              <ul className="space-y-2 text-sm text-white/50">
                <li className="flex items-center gap-2"><CheckCircle2 size={14} className="text-[#C6FF34]" /> Business information submitted</li>
                <li className="flex items-center gap-2"><Clock size={14} className="text-[#7E3BED]" /> Business registration review</li>
                <li className="flex items-center gap-2"><Clock size={14} className="text-[#7E3BED]" /> Contact person verification</li>
                <li className="flex items-center gap-2"><Clock size={14} className="text-[#7E3BED]" /> Final approval</li>
              </ul>
            </div>
          )}

          {status === 'rejected' && (
            <Link to="/contact" className="w-full inline-flex items-center justify-center gap-2 py-3.5 rounded-full border border-white/20 text-white hover:bg-white/5 transition-all">
              Contact Support
            </Link>
          )}
        </motion.div>
      </div>
    </section>
  );
}
