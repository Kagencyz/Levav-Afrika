import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'framer-motion';
import { isValidEmail, sanitizeInput, safeJSONSet } from '@/lib/safeJSON';
import { awardWriPoints } from '@/lib/levavData';
import { logWithCurrentUser } from '@/lib/auditService';
import { useOwnTalentProfile } from '@/hooks/useOwnTalentProfile';
import { toast } from 'sonner';
import {
  User,
  Briefcase,
  Target,
  ChevronRight,
  ChevronLeft,
  Check,
  Flame,
  Loader2,
} from 'lucide-react';

// ─── Types ───────────────────────────────────────────────
interface FormData {
  // Step 1: Identity
  firstName: string;
  lastName: string;
  phoneCountryCode: string;
  phoneNumber: string;
  email: string;
  city: string;
  province: string;
  country: string;
  // Step 2: Career
  profession: string;
  yearsOfExperience: string;
  primarySkills: string[];
  employmentStatus: string;
  highestEducation: string;
  linkedinUrl: string;
  // Step 3: Personalization
  careerChallenge: string;
  yearlyGoal: string;
  motivation: string;
  confidenceLevel: number;
  communicationSkills: number;
  leadershipPotential: number;
  openToRelocate: boolean;
}

interface FormErrors {
  [key: string]: string;
}

// ─── Constants ───────────────────────────────────────────
const INITIAL_FORM_DATA: FormData = {
  firstName: '',
  lastName: '',
  phoneCountryCode: '+260',
  phoneNumber: '',
  email: '',
  city: '',
  province: '',
  country: '',
  profession: '',
  yearsOfExperience: '',
  primarySkills: [],
  employmentStatus: '',
  highestEducation: '',
  linkedinUrl: '',
  careerChallenge: '',
  yearlyGoal: '',
  motivation: '',
  confidenceLevel: 5,
  communicationSkills: 5,
  leadershipPotential: 5,
  openToRelocate: false,
};

const COUNTRIES = [
  'Zambia',
  'Nigeria',
  'Kenya',
  'Ghana',
  'South Africa',
  'Rwanda',
  'Uganda',
  'Tanzania',
  'Senegal',
  'Egypt',
  'Tunisia',
  'Zimbabwe',
];

const EXPERIENCE_OPTIONS = ['0-1', '1-3', '3-5', '5-10', '10+'];

const SKILLS_OPTIONS = [
  // Technology
  'Software Development', 'Web Design', 'Data Analysis', 'Cybersecurity',
  'Cloud Computing', 'AI / Machine Learning', 'Mobile Development', 'UI/UX Design',
  // Business & Management
  'Project Management', 'Product Management', 'Business Analysis', 'Marketing',
  'Sales', 'Accounting', 'Human Resources', 'Operations',
  // Creative & Media
  'Graphic Design', 'Photography', 'Videography', 'Content Writing',
  'Social Media Management', 'Music Production', 'Fashion Design',
  // Trades & Technical
  'Electrical Work', 'Plumbing', 'Carpentry', 'Mechanics',
  'Construction', 'Welding', 'HVAC', 'Automotive Repair',
  // Healthcare
  'Nursing', 'Midwifery', 'Pharmacy', 'Physical Therapy',
  'Mental Health Counseling', 'Nutrition', 'Public Health',
  // Education & Community
  'Teaching', 'Training & Development', 'Community Organizing', 'Pastoral Work',
  'Social Work', 'Translation & Interpretation', 'Research',
  // Agriculture & Environment
  'Farming', 'Agribusiness', 'Animal Husbandry', 'Fisheries',
  'Forestry', 'Environmental Science', 'Renewable Energy',
  // Other
  'Catering & Culinary', 'Event Planning', 'Beauty & Styling', 'Fitness Training',
  'Tourism & Hospitality', 'Real Estate', 'Legal Services', 'Logistics',
];

const EMPLOYMENT_STATUS_OPTIONS = [
  'Employed',
  'Self-employed',
  'Unemployed',
  'Student',
  'Freelance',
];

const EDUCATION_OPTIONS = [
  'High School',
  'Diploma',
  "Bachelor's",
  "Master's",
  'PhD',
  'Self-taught',
];

const MOTIVATION_OPTIONS = [
  'Financial growth',
  'Career advancement',
  'Learning new skills',
  'Building something impactful',
  'Flexibility/freedom',
  'Mentoring others',
];

const STEP_CONFIG = [
  { id: 1, label: 'Who You Are', icon: User },
  { id: 2, label: 'Your Career', icon: Briefcase },
  { id: 3, label: 'Levav 28™', icon: Flame },
];

// ─── Animation Variants ──────────────────────────────────
const pageVariants = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.19, 1, 0.22, 1] } },
};

const stepContainerVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

const slideInRight = {
  initial: { opacity: 0, x: 60 },
  animate: { opacity: 1, x: 0, transition: { duration: 0.35, ease: [0.19, 1, 0.22, 1] } },
  exit: { opacity: 0, x: -60, transition: { duration: 0.25, ease: [0.19, 1, 0.22, 1] } },
};

const slideInLeft = {
  initial: { opacity: 0, x: -60 },
  animate: { opacity: 1, x: 0, transition: { duration: 0.35, ease: [0.19, 1, 0.22, 1] } },
  exit: { opacity: 0, x: 60, transition: { duration: 0.25, ease: [0.19, 1, 0.22, 1] } },
};

// ─── Input Styling Classes ───────────────────────────────
const inputBaseClass =
  'w-full px-4 py-3.5 bg-white/[0.05] border border-white/[0.12] rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:border-[#C6FF34] focus:ring-2 focus:ring-[#C6FF34]/20 focus:bg-white/[0.08] hover:border-white/[0.2] transition-all duration-200 text-sm font-body';

const selectBaseClass =
  'w-full px-4 py-3.5 bg-white/[0.05] border border-white/[0.12] rounded-xl text-white focus:outline-none focus:border-[#C6FF34] focus:ring-2 focus:ring-[#C6FF34]/20 focus:bg-white/[0.08] hover:border-white/[0.2] transition-all duration-200 text-sm font-body appearance-none cursor-pointer';

const labelBaseClass = 'block text-white/70 text-sm font-medium mb-2 font-body';

// ─── Field Length Limits ─────────────────────────────────
const MAX_NAME_LENGTH = 100;
const MAX_EMAIL_LENGTH = 254;
const MAX_CITY_LENGTH = 100;
const MAX_PROVINCE_LENGTH = 100;
const MAX_PROFESSION_LENGTH = 100;
const MAX_LINKEDIN_URL_LENGTH = 500;
const MAX_CHALLENGE_LENGTH = 2000;
const MIN_PHONE_LENGTH = 7;
const MAX_PHONE_LENGTH = 12;

// ─── Helper: Confetti Particle ───────────────────────────
interface Particle {
  id: number;
  x: number;
  y: number;
  color: string;
  size: number;
  delay: number;
  duration: number;
}

function generateParticles(count: number): Particle[] {
  const colors = ['#C6FF34', '#7E3BED', '#FFFFFF', '#d4ff5c', '#a070f0'];
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    color: colors[Math.floor(Math.random() * colors.length)],
    size: Math.random() * 6 + 3,
    delay: Math.random() * 1.5,
    duration: Math.random() * 2 + 2,
  }));
}

// ========== STABLE INPUT COMPONENTS (prevent keyboard dismissal) ==========
// Defined at module scope (not inside Onboarding) so they keep a stable
// component identity across re-renders — nesting these inside a component
// that re-renders on every keystroke would cause React to remount the
// underlying <input>/<textarea>/<select> on each keystroke, which is what
// drops focus and dismisses the on-screen keyboard on mobile.

const StableInput = React.memo(({ value: initialValue, onChange, ...props }: any) => {
  const [localValue, setLocalValue] = useState(initialValue);
  const onChangeRef = React.useRef(onChange);
  onChangeRef.current = onChange;

  useEffect(() => {
    setLocalValue(initialValue);
  }, [initialValue]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalValue(e.target.value);
    onChangeRef.current?.(e.target.value);
  }, []);

  return <input {...props} value={localValue} onChange={handleChange} />;
});

const StableTextarea = React.memo(({ value: initialValue, onChange, ...props }: any) => {
  const [localValue, setLocalValue] = useState(initialValue);
  const onChangeRef = React.useRef(onChange);
  onChangeRef.current = onChange;

  useEffect(() => {
    setLocalValue(initialValue);
  }, [initialValue]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setLocalValue(e.target.value);
    onChangeRef.current?.(e.target.value);
  }, []);

  return <textarea {...props} value={localValue} onChange={handleChange} />;
});

const StableSelect = React.memo(({ value: initialValue, onChange, children, ...props }: any) => {
  const [localValue, setLocalValue] = useState(initialValue);
  const onChangeRef = React.useRef(onChange);
  onChangeRef.current = onChange;

  useEffect(() => {
    setLocalValue(initialValue);
  }, [initialValue]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setLocalValue(e.target.value);
    onChangeRef.current?.(e.target.value);
  }, []);

  return <select {...props} value={localValue} onChange={handleChange}>{children}</select>;
});

// ─── Step Progress Indicator ─────────────────────────────
// Hoisted to module scope: previously declared inside Onboarding()'s body,
// which gave it a new component identity on every render (including every
// keystroke) and forced React to remount its subtree.
function StepIndicator({
  currentStep,
  isComplete,
}: {
  currentStep: number;
  isComplete: boolean;
}) {
  return (
    <div className="w-full max-w-md mx-auto mb-8">
      <div className="flex items-center justify-between relative">
        {/* Connector lines */}
        <div className="absolute top-5 left-0 right-0 flex gap-0 px-5" style={{ zIndex: 0 }}>
          <div className="flex-1 h-[2px] bg-white/[0.1] rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-[#C6FF34] rounded-full"
              initial={{ width: '0%' }}
              animate={{
                width:
                  currentStep >= 2 ? '100%' : currentStep === 1 ? '0%' : '0%',
              }}
              transition={{ duration: 0.4, ease: [0.19, 1, 0.22, 1] }}
            />
          </div>
          <div className="w-8" />
          <div className="flex-1 h-[2px] bg-white/[0.1] rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-[#C6FF34] rounded-full"
              initial={{ width: '0%' }}
              animate={{
                width: currentStep >= 3 ? '100%' : '0%',
              }}
              transition={{ duration: 0.4, ease: [0.19, 1, 0.22, 1] }}
            />
          </div>
        </div>

        {/* Step circles */}
        {STEP_CONFIG.map((step) => {
          const Icon = step.icon;
          const isCompleted = currentStep > step.id || isComplete;
          const isActive = currentStep === step.id && !isComplete;

          return (
            <div
              key={step.id}
              className="flex flex-col items-center gap-2 relative"
              style={{ zIndex: 1 }}
            >
              <motion.div
                className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors duration-300 ${
                  isCompleted
                    ? 'bg-[#C6FF34] border-[#C6FF34] text-black'
                    : isActive
                      ? 'bg-[#C6FF34] border-[#C6FF34] text-black'
                      : 'bg-white/[0.05] border-white/[0.1] text-white/40'
                }`}
                animate={
                  isActive
                    ? { scale: [1, 1.1, 1] }
                    : { scale: 1 }
                }
                transition={{ duration: 0.4, ease: [0.19, 1, 0.22, 1] }}
              >
                {isCompleted ? (
                  <Check size={18} strokeWidth={2.5} />
                ) : (
                  <Icon size={16} />
                )}
              </motion.div>
              <span
                className={`text-xs font-medium transition-colors duration-300 ${
                  isActive || isCompleted
                    ? 'text-white'
                    : 'text-white/40'
                }`}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Error Message ────────────────────────────────────────
function ErrorMessage({ errors, field }: { errors: FormErrors; field: string }) {
  if (!errors[field]) return null;
  return (
    <motion.p
      initial={{ opacity: 0, y: -5 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-red-400 text-xs mt-1.5"
    >
      {errors[field]}
    </motion.p>
  );
}

// ─── Step 1: Who You Are ──────────────────────────────────
interface Step1IdentityProps {
  direction: 'forward' | 'backward';
  formData: FormData;
  errors: FormErrors;
  updateField: <K extends keyof FormData>(field: K, value: FormData[K]) => void;
  handleNext: () => void;
  isSubmitting: boolean;
}

const Step1Identity = React.memo(function Step1Identity({
  direction,
  formData,
  errors,
  updateField,
  handleNext,
  isSubmitting,
}: Step1IdentityProps) {
  return (
    <motion.div
      variants={direction === 'forward' ? slideInRight : slideInLeft}
      initial="initial"
      animate="animate"
      exit="exit"
      className="space-y-5"
    >
      {/* Step Title */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-9 h-9 rounded-xl bg-[#C6FF34]/10 flex items-center justify-center">
          <User size={18} className="text-[#C6FF34]" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-white font-display">
            Who You Are
          </h2>
          <p className="text-xs text-white/40">Tell us about yourself</p>
        </div>
      </div>

      {/* First / Last Name */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={labelBaseClass}>
            First Name <span className="text-[#C6FF34]">*</span>
          </label>
          <StableInput
            type="text"
            inputMode="text"
            enterKeyHint="next"
            autoComplete="given-name"
            value={formData.firstName}
            onChange={(v: string) => updateField('firstName', v)}
            placeholder="John"
            maxLength={MAX_NAME_LENGTH}
            className={`${inputBaseClass} ${errors.firstName ? 'border-red-400/50 focus:border-red-400 focus:ring-red-400/20' : ''}`}
          />
          <ErrorMessage errors={errors} field="firstName" />
        </div>
        <div>
          <label className={labelBaseClass}>
            Last Name <span className="text-[#C6FF34]">*</span>
          </label>
          <StableInput
            type="text"
            inputMode="text"
            enterKeyHint="next"
            autoComplete="family-name"
            value={formData.lastName}
            onChange={(v: string) => updateField('lastName', v)}
            placeholder="Doe"
            maxLength={MAX_NAME_LENGTH}
            className={`${inputBaseClass} ${errors.lastName ? 'border-red-400/50 focus:border-red-400 focus:ring-red-400/20' : ''}`}
          />
          <ErrorMessage errors={errors} field="lastName" />
        </div>
      </div>

      {/* Phone Number */}
      <div>
        <label className={labelBaseClass}>Phone Number</label>
        <div className="flex flex-row gap-2 items-stretch">
          <div className="relative flex-shrink-0 w-[90px]">
            <StableSelect
              value={formData.phoneCountryCode}
              onChange={(v: string) => updateField('phoneCountryCode', v)}
              className={`${selectBaseClass} w-full pr-8`}
            >
              <option value="+260" className="bg-[#0A0A0A] text-white">+260</option>
              <option value="+234" className="bg-[#0A0A0A] text-white">+234</option>
              <option value="+254" className="bg-[#0A0A0A] text-white">+254</option>
              <option value="+233" className="bg-[#0A0A0A] text-white">+233</option>
              <option value="+27" className="bg-[#0A0A0A] text-white">+27</option>
              <option value="+250" className="bg-[#0A0A0A] text-white">+250</option>
              <option value="+256" className="bg-[#0A0A0A] text-white">+256</option>
              <option value="+255" className="bg-[#0A0A0A] text-white">+255</option>
              <option value="+221" className="bg-[#0A0A0A] text-white">+221</option>
              <option value="+20" className="bg-[#0A0A0A] text-white">+20</option>
              <option value="+216" className="bg-[#0A0A0A] text-white">+216</option>
              <option value="+263" className="bg-[#0A0A0A] text-white">+263</option>
            </StableSelect>
            <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-white/40">
              <svg width="12" height="8" viewBox="0 0 12 8" fill="none"><path d="M1 1.5L6 6.5L11 1.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </div>
          </div>
          <StableInput
            type="tel"
            inputMode="tel"
            enterKeyHint="next"
            autoComplete="tel"
            value={formData.phoneNumber}
            onChange={(v: string) => {
              const val = v.replace(/[^0-9+\s]/g, '').slice(0, 15);
              updateField('phoneNumber', val);
            }}
            placeholder="97X XXX XXX"
            className={`${inputBaseClass} flex-1 min-w-0 ${errors.phoneNumber ? 'border-red-400/50 focus:border-red-400 focus:ring-red-400/20' : ''}`}
          />
        </div>
        <ErrorMessage errors={errors} field="phoneNumber" />
      </div>

      {/* Email */}
      <div>
        <label className={labelBaseClass}>
          Email <span className="text-[#C6FF34]">*</span>
        </label>
        <StableInput
          type="email"
          inputMode="email"
          enterKeyHint="next"
          autoComplete="email"
          value={formData.email}
          onChange={(v: string) => updateField('email', v)}
          placeholder="you@example.com"
          maxLength={MAX_EMAIL_LENGTH}
          className={`${inputBaseClass} ${errors.email ? 'border-red-400/50 focus:border-red-400 focus:ring-red-400/20' : ''}`}
        />
        <ErrorMessage errors={errors} field="email" />
      </div>

      {/* City / Province */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={labelBaseClass}>City</label>
          <StableInput
            type="text"
            inputMode="text"
            enterKeyHint="next"
            autoComplete="address-level2"
            value={formData.city}
            onChange={(v: string) => updateField('city', v)}
            placeholder="Lusaka"
            maxLength={MAX_CITY_LENGTH}
            className={inputBaseClass}
          />
        </div>
        <div>
          <label className={labelBaseClass}>Province / State</label>
          <StableInput
            type="text"
            inputMode="text"
            enterKeyHint="next"
            autoComplete="address-level1"
            value={formData.province}
            onChange={(v: string) => updateField('province', v)}
            placeholder="Lusaka Province"
            maxLength={MAX_PROVINCE_LENGTH}
            className={inputBaseClass}
          />
        </div>
      </div>

      {/* Country */}
      <div>
        <label className={labelBaseClass}>Country</label>
        <StableSelect
          value={formData.country}
          onChange={(v: string) => updateField('country', v)}
          className={selectBaseClass}
        >
          <option value="" className="bg-[#0A0A0A] text-white/40">
            Select your country
          </option>
          {COUNTRIES.map((c) => (
            <option key={c} value={c} className="bg-[#0A0A0A] text-white">
              {c}
            </option>
          ))}
        </StableSelect>
      </div>

      {/* CTA */}
      <motion.button
        type="button"
        onClick={handleNext}
        disabled={isSubmitting}
        className="btn-lime w-full inline-flex items-center justify-center gap-2 mt-6 py-3.5 text-base disabled:opacity-50 disabled:cursor-not-allowed"
        whileHover={{ scale: isSubmitting ? 1 : 1.02 }}
        whileTap={{ scale: isSubmitting ? 1 : 0.98 }}
      >
        Next: Your Career
        <ChevronRight size={18} />
      </motion.button>
    </motion.div>
  );
});

// ─── Step 2: Your Career ──────────────────────────────────
interface Step2CareerProps {
  direction: 'forward' | 'backward';
  formData: FormData;
  errors: FormErrors;
  updateField: <K extends keyof FormData>(field: K, value: FormData[K]) => void;
  toggleSkill: (skill: string) => void;
  customSkill: string;
  setCustomSkill: (value: string) => void;
  addCustomSkill: () => void;
  handleNext: () => void;
  handleBack: () => void;
  isSubmitting: boolean;
}

const Step2Career = React.memo(function Step2Career({
  direction,
  formData,
  errors,
  updateField,
  toggleSkill,
  customSkill,
  setCustomSkill,
  addCustomSkill,
  handleNext,
  handleBack,
  isSubmitting,
}: Step2CareerProps) {
  return (
    <motion.div
      variants={direction === 'forward' ? slideInRight : slideInLeft}
      initial="initial"
      animate="animate"
      exit="exit"
      className="space-y-5"
    >
      {/* Step Title */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-9 h-9 rounded-xl bg-[#C6FF34]/10 flex items-center justify-center">
          <Briefcase size={18} className="text-[#C6FF34]" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-white font-display">
            Your Career
          </h2>
          <p className="text-xs text-white/40">Build your professional profile</p>
        </div>
      </div>

      {/* Profession */}
      <div>
        <label className={labelBaseClass}>
          Current Profession <span className="text-[#C6FF34]">*</span>
        </label>
        <StableInput
          type="text"
          inputMode="text"
          enterKeyHint="next"
          autoComplete="organization-title"
          value={formData.profession}
          onChange={(v: string) => updateField('profession', v)}
          placeholder="e.g. Software Engineer"
          maxLength={MAX_PROFESSION_LENGTH}
          className={`${inputBaseClass} ${errors.profession ? 'border-red-400/50' : ''}`}
        />
        <ErrorMessage errors={errors} field="profession" />
        <p className="text-white/30 text-xs mt-1.5">
          Examples: Software Engineer, Nurse, Pastor, Mechanic, Teacher, Chef, Farmer, Artist, Accountant
        </p>
      </div>

      {/* Years of Experience */}
      <div>
        <label className={labelBaseClass}>
          Years of Experience <span className="text-[#C6FF34]">*</span>
        </label>
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
          {EXPERIENCE_OPTIONS.map((opt) => (
            <motion.button
              key={opt}
              type="button"
              onClick={() => updateField('yearsOfExperience', opt)}
              className={`py-2.5 px-3 rounded-xl text-sm font-medium border transition-all duration-200 ${
                formData.yearsOfExperience === opt
                  ? 'border-[#C6FF34]/50 bg-[#C6FF34]/10 text-[#C6FF34]'
                  : 'border-white/[0.1] text-white/60 hover:border-white/[0.2] hover:text-white'
              }`}
              whileTap={{ scale: 0.96 }}
            >
              {opt}
            </motion.button>
          ))}
        </div>
        <ErrorMessage errors={errors} field="yearsOfExperience" />
      </div>

      {/* Primary Skills - Multi-select Tags */}
      <div>
        <label className={labelBaseClass}>
          Primary Skills <span className="text-[#C6FF34]">*</span>
        </label>
        <div className="flex flex-wrap gap-2">
          {SKILLS_OPTIONS.map((skill) => {
            const isSelected = formData.primarySkills.includes(skill);
            return (
              <motion.button
                key={skill}
                type="button"
                onClick={() => toggleSkill(skill)}
                className={`py-2 px-3.5 rounded-xl text-xs font-medium border transition-all duration-200 flex items-center gap-1.5 ${
                  isSelected
                    ? 'border-[#C6FF34]/50 bg-[#C6FF34]/10 text-[#C6FF34]'
                    : 'border-white/[0.1] text-white/50 hover:border-white/[0.2] hover:text-white/80'
                }`}
                whileTap={{ scale: 0.95 }}
              >
                {isSelected && <Check size={12} strokeWidth={2.5} />}
                {skill}
              </motion.button>
            );
          })}
        </div>

        {/* Custom Skill Input */}
        <div className="mt-4 pt-4 border-t border-white/[0.06]">
          <label className="block text-white/50 text-xs mb-2">
            Don&apos;t see your skill? Add your own:
          </label>
          <div className="flex gap-2">
            <StableInput
              type="text"
              value={customSkill}
              onChange={(v: string) => setCustomSkill(v)}
              onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addCustomSkill();
                }
              }}
              placeholder="e.g. Tailoring, Driving, Counseling..."
              className="flex-1 px-4 py-2.5 bg-white/[0.05] border border-white/[0.1] rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:border-[#C6FF34] text-sm"
              inputMode="text"
              enterKeyHint="done"
            />
            <motion.button
              type="button"
              onClick={addCustomSkill}
              disabled={!customSkill.trim()}
              className="px-4 py-2.5 bg-[#C6FF34] text-black rounded-xl text-sm font-medium disabled:opacity-30 disabled:cursor-not-allowed"
              whileTap={{ scale: 0.95 }}
            >
              Add
            </motion.button>
          </div>
        </div>

        <ErrorMessage errors={errors} field="primarySkills" />
      </div>

      {/* Employment Status */}
      <div>
        <label className={labelBaseClass}>
          Current Employment Status <span className="text-[#C6FF34]">*</span>
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {EMPLOYMENT_STATUS_OPTIONS.map((status) => (
            <motion.button
              key={status}
              type="button"
              onClick={() => updateField('employmentStatus', status)}
              className={`py-2.5 px-3 rounded-xl text-sm font-medium border transition-all duration-200 ${
                formData.employmentStatus === status
                  ? 'border-[#C6FF34]/50 bg-[#C6FF34]/10 text-[#C6FF34]'
                  : 'border-white/[0.1] text-white/60 hover:border-white/[0.2] hover:text-white'
              }`}
              whileTap={{ scale: 0.96 }}
            >
              {status}
            </motion.button>
          ))}
        </div>
        <ErrorMessage errors={errors} field="employmentStatus" />
      </div>

      {/* Highest Education */}
      <div>
        <label className={labelBaseClass}>
          Highest Education <span className="text-[#C6FF34]">*</span>
        </label>
        <StableSelect
          value={formData.highestEducation}
          onChange={(v: string) => updateField('highestEducation', v)}
          className={`${selectBaseClass} ${errors.highestEducation ? 'border-red-400/50' : ''}`}
        >
          <option value="" className="bg-[#0A0A0A] text-white/40">
            Select education level
          </option>
          {EDUCATION_OPTIONS.map((edu) => (
            <option key={edu} value={edu} className="bg-[#0A0A0A] text-white">
              {edu}
            </option>
          ))}
        </StableSelect>
        <ErrorMessage errors={errors} field="highestEducation" />
      </div>

      {/* LinkedIn / Portfolio */}
      <div>
        <label className={labelBaseClass}>LinkedIn / Portfolio URL</label>
        <StableInput
          type="url"
          inputMode="url"
          enterKeyHint="done"
          autoComplete="url"
          value={formData.linkedinUrl}
          onChange={(v: string) => updateField('linkedinUrl', v)}
          placeholder="https://linkedin.com/in/yourprofile"
          maxLength={MAX_LINKEDIN_URL_LENGTH}
          className={`${inputBaseClass} ${errors.linkedinUrl ? 'border-red-400/50 focus:border-red-400 focus:ring-red-400/20' : ''}`}
        />
        <ErrorMessage errors={errors} field="linkedinUrl" />
      </div>

      {/* CTAs */}
      <div className="flex flex-col gap-3 pt-2">
        <motion.button
          type="button"
          onClick={handleNext}
          disabled={isSubmitting}
          className="btn-lime w-full inline-flex items-center justify-center gap-2 py-3.5 text-base disabled:opacity-50 disabled:cursor-not-allowed"
          whileHover={{ scale: isSubmitting ? 1 : 1.02 }}
          whileTap={{ scale: isSubmitting ? 1 : 0.98 }}
        >
          Next: Levav 28&trade;
          <ChevronRight size={18} />
        </motion.button>
        <motion.button
          type="button"
          onClick={handleBack}
          className="inline-flex items-center justify-center gap-1.5 text-sm text-white/50 hover:text-white transition-colors py-2"
          whileHover={{ x: -3 }}
          whileTap={{ scale: 0.98 }}
        >
          <ChevronLeft size={16} />
          Back
        </motion.button>
      </div>
    </motion.div>
  );
});

// ─── Step 3: Levav 28™ ─────────────────────────────────────
interface Step3PersonalizationProps {
  direction: 'forward' | 'backward';
  formData: FormData;
  errors: FormErrors;
  updateField: <K extends keyof FormData>(field: K, value: FormData[K]) => void;
  handleNext: () => void;
  handleBack: () => void;
  isSubmitting: boolean;
}

const Step3Personalization = React.memo(function Step3Personalization({
  direction,
  formData,
  errors,
  updateField,
  handleNext,
  handleBack,
  isSubmitting,
}: Step3PersonalizationProps) {
  return (
    <motion.div
      variants={direction === 'forward' ? slideInRight : slideInLeft}
      initial="initial"
      animate="animate"
      exit="exit"
      className="space-y-5"
    >
      {/* Step Title */}
      <div className="flex items-center gap-3 mb-2">
        <div className="w-9 h-9 rounded-xl bg-[#C6FF34]/10 flex items-center justify-center">
          <Target size={18} className="text-[#C6FF34]" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-white font-display">
            Personalize Your Levav 28&trade; Journey
          </h2>
          <p className="text-xs text-white/40">
            This helps us tailor the 28-day transformation to your specific needs.
          </p>
        </div>
      </div>

      {/* Career Challenge */}
      <div>
        <label className={labelBaseClass}>
          What is your biggest career challenge?{' '}
          <span className="text-[#C6FF34]">*</span>
        </label>
        <StableTextarea
          inputMode="text"
          enterKeyHint="next"
          autoComplete="off"
          value={formData.careerChallenge}
          onChange={(v: string) => updateField('careerChallenge', v)}
          placeholder="Describe the biggest obstacle you're facing in your career right now..."
          rows={3}
          maxLength={MAX_CHALLENGE_LENGTH}
          className={`${inputBaseClass} resize-none ${errors.careerChallenge ? 'border-red-400/50' : ''}`}
        />
        <ErrorMessage errors={errors} field="careerChallenge" />
      </div>

      {/* Yearly Goal */}
      <div>
        <label className={labelBaseClass}>
          What do you want to achieve in the next year?{' '}
          <span className="text-[#C6FF34]">*</span>
        </label>
        <StableTextarea
          inputMode="text"
          enterKeyHint="done"
          autoComplete="off"
          value={formData.yearlyGoal}
          onChange={(v: string) => updateField('yearlyGoal', v)}
          placeholder="Share your biggest goal for the coming year..."
          rows={3}
          className={`${inputBaseClass} resize-none ${errors.yearlyGoal ? 'border-red-400/50' : ''}`}
        />
        <ErrorMessage errors={errors} field="yearlyGoal" />
      </div>

      {/* Motivation */}
      <div>
        <label className={labelBaseClass}>
          What motivates you most? <span className="text-[#C6FF34]">*</span>
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {MOTIVATION_OPTIONS.map((m) => (
            <motion.button
              key={m}
              type="button"
              onClick={() => updateField('motivation', m)}
              className={`py-2.5 px-3 rounded-xl text-sm font-medium border transition-all duration-200 text-left ${
                formData.motivation === m
                  ? 'border-[#C6FF34]/50 bg-[#C6FF34]/10 text-[#C6FF34]'
                  : 'border-white/[0.1] text-white/60 hover:border-white/[0.2] hover:text-white'
              }`}
              whileTap={{ scale: 0.96 }}
            >
              {m}
            </motion.button>
          ))}
        </div>
        <ErrorMessage errors={errors} field="motivation" />
      </div>

      {/* Sliders */}
      <div className="space-y-5 pt-2">
        {/* Confidence */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className={`${labelBaseClass} mb-0`}>
              Rate your current confidence level{' '}
              <span className="text-[#C6FF34]">*</span>
            </label>
            <span className="text-[#C6FF34] font-semibold text-sm min-w-[24px] text-right">
              {formData.confidenceLevel}
            </span>
          </div>
          <input
            type="range"
            min={1}
            max={10}
            value={formData.confidenceLevel}
            onChange={(e) =>
              updateField('confidenceLevel', parseInt(e.target.value))
            }
            className="w-full h-2 bg-white/[0.1] rounded-full appearance-none cursor-pointer accent-[#C6FF34] [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#C6FF34] [&::-webkit-slider-thumb]:shadow-[0_0_10px_rgba(198,255,52,0.4)] [&::-webkit-slider-thumb]:cursor-pointer [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-[#C6FF34] [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-white/30 mt-1">
            <span>1</span>
            <span>5</span>
            <span>10</span>
          </div>
        </div>

        {/* Communication */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className={`${labelBaseClass} mb-0`}>
              Rate your communication skills{' '}
              <span className="text-[#C6FF34]">*</span>
            </label>
            <span className="text-[#C6FF34] font-semibold text-sm min-w-[24px] text-right">
              {formData.communicationSkills}
            </span>
          </div>
          <input
            type="range"
            min={1}
            max={10}
            value={formData.communicationSkills}
            onChange={(e) =>
              updateField('communicationSkills', parseInt(e.target.value))
            }
            className="w-full h-2 bg-white/[0.1] rounded-full appearance-none cursor-pointer accent-[#C6FF34] [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#C6FF34] [&::-webkit-slider-thumb]:shadow-[0_0_10px_rgba(198,255,52,0.4)] [&::-webkit-slider-thumb]:cursor-pointer [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-[#C6FF34] [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-white/30 mt-1">
            <span>1</span>
            <span>5</span>
            <span>10</span>
          </div>
        </div>

        {/* Leadership */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className={`${labelBaseClass} mb-0`}>
              Rate your leadership potential{' '}
              <span className="text-[#C6FF34]">*</span>
            </label>
            <span className="text-[#C6FF34] font-semibold text-sm min-w-[24px] text-right">
              {formData.leadershipPotential}
            </span>
          </div>
          <input
            type="range"
            min={1}
            max={10}
            value={formData.leadershipPotential}
            onChange={(e) =>
              updateField('leadershipPotential', parseInt(e.target.value))
            }
            className="w-full h-2 bg-white/[0.1] rounded-full appearance-none cursor-pointer accent-[#C6FF34] [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#C6FF34] [&::-webkit-slider-thumb]:shadow-[0_0_10px_rgba(198,255,52,0.4)] [&::-webkit-slider-thumb]:cursor-pointer [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-[#C6FF34] [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-white/30 mt-1">
            <span>1</span>
            <span>5</span>
            <span>10</span>
          </div>
        </div>
      </div>

      {/* Relocation Toggle */}
      <div className="pt-2">
        <label className={labelBaseClass}>
          Are you open to relocating for the right opportunity?{' '}
          <span className="text-[#C6FF34]">*</span>
        </label>
        <div className="flex items-center gap-4">
          <motion.button
            type="button"
            onClick={() => updateField('openToRelocate', true)}
            className={`flex-1 py-3 px-4 rounded-xl text-sm font-medium border transition-all duration-200 ${
              formData.openToRelocate
                ? 'border-[#C6FF34]/50 bg-[#C6FF34]/10 text-[#C6FF34]'
                : 'border-white/[0.1] text-white/60 hover:border-white/[0.2] hover:text-white'
            }`}
            whileTap={{ scale: 0.97 }}
          >
            Yes
          </motion.button>
          <motion.button
            type="button"
            onClick={() => updateField('openToRelocate', false)}
            className={`flex-1 py-3 px-4 rounded-xl text-sm font-medium border transition-all duration-200 ${
              !formData.openToRelocate
                ? 'border-[#C6FF34]/50 bg-[#C6FF34]/10 text-[#C6FF34]'
                : 'border-white/[0.1] text-white/60 hover:border-white/[0.2] hover:text-white'
            }`}
            whileTap={{ scale: 0.97 }}
          >
            No
          </motion.button>
        </div>
      </div>

      {/* CTAs */}
      <div className="flex flex-col gap-3 pt-4">
        <motion.button
          type="button"
          onClick={handleNext}
          disabled={isSubmitting}
          className="btn-lime w-full inline-flex items-center justify-center gap-2 py-3.5 text-base disabled:opacity-50 disabled:cursor-not-allowed"
          whileHover={{ scale: isSubmitting ? 1 : 1.02 }}
          whileTap={{ scale: isSubmitting ? 1 : 0.98 }}
        >
          {isSubmitting ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              Completing...
            </>
          ) : (
            <>
              Complete &amp; Start Levav 28&trade;
              <ChevronRight size={18} />
            </>
          )}
        </motion.button>
        <motion.button
          type="button"
          onClick={handleBack}
          className="inline-flex items-center justify-center gap-1.5 text-sm text-white/50 hover:text-white transition-colors py-2"
          whileHover={{ x: -3 }}
          whileTap={{ scale: 0.98 }}
        >
          <ChevronLeft size={16} />
          Back
        </motion.button>
      </div>
    </motion.div>
  );
});

// ─── Success State ─────────────────────────────────────────
function SuccessState({
  particles,
  formData,
  onStartLevav28,
  onCreateProfile,
}: {
  particles: Particle[];
  formData: FormData;
  onStartLevav28: () => void;
  onCreateProfile: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, ease: [0.19, 1, 0.22, 1] }}
      className="relative overflow-hidden"
    >
      {/* Confetti Particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {particles.map((p) => (
          <motion.div
            key={p.id}
            className="absolute rounded-full"
            style={{
              left: `${p.x}%`,
              top: `${p.y}%`,
              width: p.size,
              height: p.size,
              backgroundColor: p.color,
            }}
            initial={{ opacity: 0, scale: 0, y: 0 }}
            animate={{
              opacity: [0, 1, 1, 0],
              scale: [0, 1.5, 1, 0.5],
              y: [0, -100, -200, -300],
              x: [0, (Math.random() - 0.5) * 100, (Math.random() - 0.5) * 200],
              rotate: [0, 180, 360],
            }}
            transition={{
              duration: p.duration,
              delay: p.delay,
              ease: 'easeOut',
            }}
          />
        ))}
      </div>

      <div className="flex flex-col items-center text-center py-8 relative z-10">
        {/* Animated Check Circle */}
        <motion.div
          className="w-20 h-20 rounded-full bg-[#C6FF34] flex items-center justify-center mb-6"
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ duration: 0.6, ease: [0.19, 1, 0.22, 1], delay: 0.2 }}
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.5, duration: 0.3, type: 'spring', stiffness: 200 }}
          >
            <Check size={36} className="text-black" strokeWidth={3} />
          </motion.div>
        </motion.div>

        {/* Title */}
        <motion.h2
          className="text-2xl sm:text-3xl font-bold text-white font-display mb-2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          Profile Created!
        </motion.h2>

        <motion.p
          className="text-white/60 text-sm sm:text-base max-w-sm mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.65, duration: 0.5 }}
        >
          Your talent profile has been created from your onboarding data.
          Welcome to Levav 28&trade;!
        </motion.p>

        {/* Profile Summary Card */}
        <motion.div
          className="w-full mt-2 p-5 rounded-xl bg-white/[0.03] border border-white/[0.06] text-left"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.5 }}
        >
          <div className="flex items-center gap-3 mb-4 pb-4 border-b border-white/[0.06]">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#C6FF34]/20 to-[#7E3BED]/20 flex items-center justify-center text-lg font-bold text-[#C6FF34]">
              {formData.firstName.charAt(0)}{formData.lastName.charAt(0)}
            </div>
            <div>
              <p className="text-white font-semibold font-display">{formData.firstName} {formData.lastName}</p>
              <p className="text-white/50 text-sm">{formData.profession || 'Professional'}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-[10px] uppercase tracking-wider text-white/30 mb-0.5">WRI Score</p>
              <p className="text-sm text-[#C6FF34] font-semibold">{Math.round((formData.confidenceLevel || 5) * 10)}/100</p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wider text-white/30 mb-0.5">Experience</p>
              <p className="text-sm text-white font-medium">{formData.yearsOfExperience || 'N/A'} years</p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wider text-white/30 mb-0.5">Location</p>
              <p className="text-sm text-white font-medium">{formData.city}{formData.city && formData.country ? ', ' : ''}{formData.country || 'Not set'}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wider text-white/30 mb-0.5">Skills</p>
              <p className="text-sm text-white font-medium">
                {formData.primarySkills.slice(0, 3).join(', ')}
                {formData.primarySkills.length > 3 && ` +${formData.primarySkills.length - 3} more`}
              </p>
            </div>
          </div>
        </motion.div>

        {/* CTAs — Redirect to Levav 28 after onboarding */}
        <motion.button
          className="btn-lime w-full inline-flex items-center justify-center gap-2 mt-6 py-3.5 text-base"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0, duration: 0.5 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onStartLevav28}
        >
          Start Your Levav 28™ Journey
          <ChevronRight size={18} />
        </motion.button>
        <motion.button
          className="w-full inline-flex items-center justify-center gap-2 mt-3 py-3.5 rounded-full border border-white/20 text-white hover:bg-white/5 transition-all text-sm"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1, duration: 0.5 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onCreateProfile}
        >
          Create Your Profile
        </motion.button>
      </div>
    </motion.div>
  );
}

// ─── Main Component ──────────────────────────────────────
export default function Onboarding() {
  const navigate = useNavigate();
  const { save: saveTalentProfile } = useOwnTalentProfile();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormData>(INITIAL_FORM_DATA);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isComplete, setIsComplete] = useState(false);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [direction, setDirection] = useState<'forward' | 'backward'>('forward');
  const [customSkill, setCustomSkill] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const MAX_GOAL_LENGTH = 2000;

  const isValidUrl = (url: string): boolean => {
    if (!url.trim()) return true;
    try {
      const parsed = new URL(url);
      return parsed.protocol === 'http:' || parsed.protocol === 'https:';
    } catch {
      return false;
    }
  };

  // Generate confetti on completion
  useEffect(() => {
    if (isComplete) {
      setParticles(generateParticles(50));
    }
  }, [isComplete]);

  // ─── Form Handlers ────────────────────────────────────
  const updateField = useCallback(<K extends keyof FormData>(
    field: K,
    value: FormData[K]
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user types
    setErrors((prev) => {
      const next = { ...prev };
      delete next[field];
      return next;
    });
  }, []);

  const toggleSkill = useCallback((skill: string) => {
    setFormData((prev) => {
      const hasSkill = prev.primarySkills.includes(skill);
      const newSkills = hasSkill
        ? prev.primarySkills.filter((s) => s !== skill)
        : [...prev.primarySkills, skill];
      return { ...prev, primarySkills: newSkills };
    });
    setErrors((prev) => {
      const next = { ...prev };
      delete next.primarySkills;
      return next;
    });
  }, []);

  const addCustomSkill = useCallback(() => {
    const trimmed = customSkill.trim();
    if (!trimmed) return;
    if (!formData.primarySkills.includes(trimmed)) {
      setFormData((prev) => ({ ...prev, primarySkills: [...prev.primarySkills, trimmed] }));
    }
    setCustomSkill('');
    setErrors((prev) => {
      const next = { ...prev };
      delete next.primarySkills;
      return next;
    });
  }, [customSkill, formData.primarySkills]);

  // ─── Validation ───────────────────────────────────────
  const validateStep = useCallback((step: number): boolean => {
    const newErrors: FormErrors = {};

    if (step === 1) {
      const firstName = formData.firstName.trim();
      if (!firstName) newErrors.firstName = 'First name is required';
      else if (firstName.length > MAX_NAME_LENGTH) newErrors.firstName = `First name must be less than ${MAX_NAME_LENGTH} characters`;

      const lastName = formData.lastName.trim();
      if (!lastName) newErrors.lastName = 'Last name is required';
      else if (lastName.length > MAX_NAME_LENGTH) newErrors.lastName = `Last name must be less than ${MAX_NAME_LENGTH} characters`;

      const email = formData.email.trim();
      if (!email) {
        newErrors.email = 'Email is required';
      } else if (email.length > MAX_EMAIL_LENGTH) {
        newErrors.email = `Email must be less than ${MAX_EMAIL_LENGTH} characters`;
      } else if (!isValidEmail(email)) {
        newErrors.email = 'Please enter a valid email';
      }

      // Phone validation (optional but validated if provided)
      if (formData.phoneNumber) {
        const digitsOnly = formData.phoneNumber.replace(/\s/g, '');
        if (digitsOnly.length < MIN_PHONE_LENGTH) {
          newErrors.phoneNumber = `Phone number must be at least ${MIN_PHONE_LENGTH} digits`;
        } else if (digitsOnly.length > MAX_PHONE_LENGTH) {
          newErrors.phoneNumber = `Phone number must be at most ${MAX_PHONE_LENGTH} digits`;
        }
      }

      const city = formData.city.trim();
      if (city.length > MAX_CITY_LENGTH) newErrors.city = `City must be less than ${MAX_CITY_LENGTH} characters`;

      const province = formData.province.trim();
      if (province.length > MAX_PROVINCE_LENGTH) newErrors.province = `Province must be less than ${MAX_PROVINCE_LENGTH} characters`;
    }

    if (step === 2) {
      const profession = formData.profession.trim();
      if (!profession) newErrors.profession = 'Profession is required';
      else if (profession.length > MAX_PROFESSION_LENGTH) newErrors.profession = `Profession must be less than ${MAX_PROFESSION_LENGTH} characters`;

      if (!formData.yearsOfExperience) newErrors.yearsOfExperience = 'Required';
      if (formData.primarySkills.length === 0) newErrors.primarySkills = 'Select at least one skill';
      if (!formData.employmentStatus) newErrors.employmentStatus = 'Required';
      if (!formData.highestEducation) newErrors.highestEducation = 'Required';

      if (formData.linkedinUrl && !isValidUrl(formData.linkedinUrl)) {
        newErrors.linkedinUrl = 'Please enter a valid URL (https://...)';
      }
      if (formData.linkedinUrl && formData.linkedinUrl.length > MAX_LINKEDIN_URL_LENGTH) {
        newErrors.linkedinUrl = `URL must be less than ${MAX_LINKEDIN_URL_LENGTH} characters`;
      }
    }

    if (step === 3) {
      const challenge = formData.careerChallenge.trim();
      if (!challenge) newErrors.careerChallenge = 'Please share your biggest career challenge';
      else if (challenge.length > MAX_CHALLENGE_LENGTH) newErrors.careerChallenge = `Response must be less than ${MAX_CHALLENGE_LENGTH} characters`;

      const goal = formData.yearlyGoal.trim();
      if (!goal) newErrors.yearlyGoal = 'Please share your goal';
      else if (goal.length > MAX_GOAL_LENGTH) newErrors.yearlyGoal = `Response must be less than ${MAX_GOAL_LENGTH} characters`;

      if (!formData.motivation) newErrors.motivation = 'Please select what motivates you';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  // ─── Navigation ───────────────────────────────────────
  const handleNext = useCallback(async () => {
    if (isSubmitting) return;
    if (!validateStep(currentStep)) return;

    if (currentStep < 3) {
      setDirection('forward');
      setCurrentStep((s) => s + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setIsSubmitting(true);

    // Levav 28™ personalization (challenge, motivation, confidence sliders,
    // relocation) has no backend home yet — intentionally local, matching
    // the rest of this prototype's Levav 28/WRI data.
    safeJSONSet('onboarding_data', {
      firstName: sanitizeInput(formData.firstName),
      lastName: sanitizeInput(formData.lastName),
      phone: formData.phoneNumber,
      email: formData.email.trim(),
      city: sanitizeInput(formData.city),
      country: sanitizeInput(formData.country),
      profession: sanitizeInput(formData.profession),
      experience: formData.yearsOfExperience,
      primarySkills: formData.primarySkills,
      employmentStatus: formData.employmentStatus,
      education: formData.highestEducation,
      linkedIn: formData.linkedinUrl.trim(),
      biggestChallenge: sanitizeInput(formData.careerChallenge),
      goals: sanitizeInput(formData.yearlyGoal),
      motivation: formData.motivation,
      confidenceLevel: formData.confidenceLevel,
      communicationLevel: formData.communicationSkills,
      leadershipLevel: formData.leadershipPotential,
      openToRelocate: formData.openToRelocate,
      completedAt: new Date().toISOString(),
    });

    try {
      // The fields the real talents table actually models — this is what
      // makes the profile visible on /talent, not just saved to this browser.
      await saveTalentProfile({
        name: sanitizeInput(`${formData.firstName} ${formData.lastName}`),
        bio: sanitizeInput(`Professional in ${formData.profession}. ${formData.yearlyGoal || ''}`.trim()),
        category: sanitizeInput(formData.profession) || 'Technology',
        skills: formData.primarySkills,
        location: sanitizeInput(`${formData.city}${formData.city && formData.country ? ', ' : ''}${formData.country}`),
      });

      logWithCurrentUser('profile_update', 'Onboarding Complete', 'success', 'Completed Levav onboarding');
      awardWriPoints('profile-complete');
      setIsComplete(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Something went wrong. Please try again.';
      toast.error(message);
      setIsSubmitting(false);
    }
  }, [currentStep, validateStep, formData, isSubmitting, saveTalentProfile]);

  const handleBack = useCallback(() => {
    if (currentStep > 1) {
      setDirection('backward');
      setCurrentStep((s) => s - 1);
      setErrors({});
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [currentStep]);

  // ─── Render ───────────────────────────────────────────
  return (
    <motion.div
      className="min-h-[calc(100vh-72px)] flex flex-col items-center justify-center px-4 py-12"
      variants={pageVariants}
      initial="initial"
      animate="animate"
    >
      <div className="w-full max-w-[640px]">
        {/* Header */}
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <h1 className="text-2xl sm:text-3xl font-bold text-white font-display mb-2">
            Join Levav&trade;
          </h1>
          <p className="text-sm text-white/50">
            Africa&apos;s Workforce Intelligence Ecosystem&trade;
          </p>
        </motion.div>

        {/* Progress Indicator */}
        {!isComplete && <StepIndicator currentStep={currentStep} isComplete={isComplete} />}

        {/* Glass Card */}
        <motion.div
          className="form-container bg-white/[0.03] backdrop-blur-xl border border-white/[0.06] rounded-2xl p-6 sm:p-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <AnimatePresence mode="wait">
            {isComplete ? (
              <SuccessState
                key="success"
                particles={particles}
                formData={formData}
                onStartLevav28={() => navigate('/levav28')}
                onCreateProfile={() => navigate('/profile/create')}
              />
            ) : (
              <motion.div
                key={currentStep}
                variants={stepContainerVariants}
                initial="initial"
                animate="animate"
                exit="exit"
              >
                {currentStep === 1 && (
                  <Step1Identity
                    direction={direction}
                    formData={formData}
                    errors={errors}
                    updateField={updateField}
                    handleNext={handleNext}
                    isSubmitting={isSubmitting}
                  />
                )}
                {currentStep === 2 && (
                  <Step2Career
                    direction={direction}
                    formData={formData}
                    errors={errors}
                    updateField={updateField}
                    toggleSkill={toggleSkill}
                    customSkill={customSkill}
                    setCustomSkill={setCustomSkill}
                    addCustomSkill={addCustomSkill}
                    handleNext={handleNext}
                    handleBack={handleBack}
                    isSubmitting={isSubmitting}
                  />
                )}
                {currentStep === 3 && (
                  <Step3Personalization
                    direction={direction}
                    formData={formData}
                    errors={errors}
                    updateField={updateField}
                    handleNext={handleNext}
                    handleBack={handleBack}
                    isSubmitting={isSubmitting}
                  />
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </motion.div>
  );
}
