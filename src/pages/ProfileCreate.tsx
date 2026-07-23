import { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { safeJSONParse, safeJSONSet } from '@/lib/safeJSON';
import {
  User,
  Briefcase,
  Camera,
  ChevronRight,
  ChevronLeft,
  Check,
  X,
  Plus,
  Globe,
  MapPin,
  DollarSign,
  Tag,
  FolderOpen,
  Sparkles,
  Loader2,
} from 'lucide-react';
import { StableInput, StableTextarea, StableSelect } from '@/components/StableInputs';


// ─── Types ───────────────────────────────────────────────
interface PortfolioItem {
  title: string;
  url: string;
}

interface FormData {
  name: string;
  bio: string;
  location: string;
  category: string;
  rate: string;
  skills: string[];
  portfolio: PortfolioItem[];
  avatar: string;
}

interface FormErrors {
  [key: string]: string;
}

// ─── Constants ───────────────────────────────────────────
const INITIAL_FORM_DATA: FormData = {
  name: '',
  bio: '',
  location: '',
  category: '',
  rate: '',
  skills: [],
  portfolio: [],
  avatar: '',
};

const CATEGORIES = [
  'Technology',
  'Visual Arts',
  'Music',
  'Dance',
  'Writing',
  'Skilled Trades',
  'Healthcare',
  'Agriculture',
  'Education',
  'Business',
  'Other',
];

const STEP_CONFIG = [
  { id: 1, label: 'About You', icon: User },
  { id: 2, label: 'Skills & Portfolio', icon: Briefcase },
  { id: 3, label: 'Photo & Review', icon: Camera },
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

// ─── Main Component ──────────────────────────────────────
export default function ProfileCreate() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormData>(INITIAL_FORM_DATA);
  const [errors, setErrors] = useState<FormErrors>({});
  const [direction, setDirection] = useState<'forward' | 'backward'>('forward');
  const [skillInput, setSkillInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const MAX_SKILLS = 20;
  const MAX_SKILL_LENGTH = 50;
  const MAX_BIO_LENGTH = 1000;
  const MAX_NAME_LENGTH = 100;
  const MAX_LOCATION_LENGTH = 100;
  const MAX_RATE_LENGTH = 50;
  const MAX_PORTFOLIO_TITLE_LENGTH = 200;

  const sanitizeInput = (input: string): string => {
    return input.trim().replace(/[<>]/g, '');
  };

  const isValidUrl = (url: string): boolean => {
    if (!url.trim()) return true; // empty is valid (optional fields)
    return /^https?:\/\/.+/.test(url);
  };

  // Auto-fill from onboarding data if available
  useEffect(() => {
    const parsed = safeJSONParse('onboarding_data', null);
    if (parsed) {
      const firstName = parsed.firstName || '';
      const lastName = parsed.lastName || '';
      const fullName = `${firstName} ${lastName}`.trim();
      const profession = parsed.profession || '';
      const goals = parsed.goals || '';
      const city = parsed.city || '';
      const country = parsed.country || '';
      const skills = parsed.primarySkills || [];
      setFormData((prev) => ({
        ...prev,
        name: fullName || prev.name,
        bio: profession ? `Professional in ${profession}. ${goals}` : prev.bio,
        location: `${city}${city && country ? ', ' : ''}${country}`.trim() || prev.location,
        skills: skills.length > 0 ? skills : prev.skills,
      }));
    }
  }, []);

  // ─── Form Handlers ────────────────────────────────────
  const updateField = useCallback(<K extends keyof FormData>(
    field: K,
    value: FormData[K]
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => {
      const next = { ...prev };
      delete next[field];
      return next;
    });
  }, []);

  const addSkill = useCallback(() => {
    const trimmed = skillInput.trim();
    if (!trimmed) return;
    if (trimmed.length > MAX_SKILL_LENGTH) {
      toast.error(`Skill name must be less than ${MAX_SKILL_LENGTH} characters`);
      return;
    }
    if (formData.skills.length >= MAX_SKILLS) {
      toast.error(`You can add up to ${MAX_SKILLS} skills`);
      return;
    }
    if (!formData.skills.includes(trimmed)) {
      setFormData((prev) => ({ ...prev, skills: [...prev.skills, trimmed] }));
    }
    setSkillInput('');
    setErrors((prev) => {
      const next = { ...prev };
      delete next.skills;
      return next;
    });
  }, [skillInput, formData.skills]);

  const removeSkill = useCallback((skill: string) => {
    setFormData((prev) => ({
      ...prev,
      skills: prev.skills.filter((s) => s !== skill),
    }));
  }, []);

  const addPortfolioItem = useCallback(() => {
    if (formData.portfolio.length >= 5) return;
    setFormData((prev) => ({
      ...prev,
      portfolio: [...prev.portfolio, { title: '', url: '' }],
    }));
  }, [formData.portfolio.length]);

  const updatePortfolioItem = useCallback((index: number, field: keyof PortfolioItem, value: string) => {
    setFormData((prev) => {
      const newPortfolio = [...prev.portfolio];
      newPortfolio[index] = { ...newPortfolio[index], [field]: value };
      return { ...prev, portfolio: newPortfolio };
    });
  }, []);

  const removePortfolioItem = useCallback((index: number) => {
    setFormData((prev) => ({
      ...prev,
      portfolio: prev.portfolio.filter((_, i) => i !== index),
    }));
  }, []);

  // ─── Validation ───────────────────────────────────────
  const validateStep = useCallback((step: number): boolean => {
    const newErrors: FormErrors = {};

    if (step === 1) {
      const name = formData.name.trim();
      if (!name) newErrors.name = 'Name is required';
      else if (name.length > MAX_NAME_LENGTH) newErrors.name = `Name must be less than ${MAX_NAME_LENGTH} characters`;

      const bio = formData.bio.trim();
      if (!bio) newErrors.bio = 'Bio is required';
      else if (bio.length > MAX_BIO_LENGTH) newErrors.bio = `Bio must be less than ${MAX_BIO_LENGTH} characters`;

      const location = formData.location.trim();
      if (!location) newErrors.location = 'Location is required';
      else if (location.length > MAX_LOCATION_LENGTH) newErrors.location = `Location must be less than ${MAX_LOCATION_LENGTH} characters`;

      if (!formData.category) newErrors.category = 'Please select a category';

      const rate = formData.rate.trim();
      if (!rate) newErrors.rate = 'Rate is required';
      else if (rate.length > MAX_RATE_LENGTH) newErrors.rate = `Rate must be less than ${MAX_RATE_LENGTH} characters`;
    }

    if (step === 2) {
      if (formData.skills.length === 0) newErrors.skills = 'Add at least one skill';
      if (formData.skills.length > MAX_SKILLS) newErrors.skills = `Maximum ${MAX_SKILLS} skills allowed`;

      // Validate portfolio URLs
      formData.portfolio.forEach((item, idx) => {
        if (item.url && !isValidUrl(item.url)) {
          newErrors[`portfolio_${idx}_url`] = 'Please enter a valid URL (https://...)';
        }
        if (item.title && item.title.length > MAX_PORTFOLIO_TITLE_LENGTH) {
          newErrors[`portfolio_${idx}_title`] = `Title must be less than ${MAX_PORTFOLIO_TITLE_LENGTH} characters`;
        }
      });
    }

    if (step === 3) {
      // Avatar is optional but validate URL format if provided
      if (formData.avatar && !isValidUrl(formData.avatar)) {
        newErrors.avatar = 'Please enter a valid image URL (https://...)';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  // ─── Navigation ───────────────────────────────────────
  const handleNext = useCallback(() => {
    if (validateStep(currentStep)) {
      if (currentStep < 3) {
        setDirection('forward');
        setCurrentStep((s) => s + 1);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  }, [currentStep, validateStep]);

  const handleBack = useCallback(() => {
    if (currentStep > 1) {
      setDirection('backward');
      setCurrentStep((s) => s - 1);
      setErrors({});
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [currentStep]);

  const handleSubmit = useCallback(() => {
    if (isSubmitting) return;
    if (!validateStep(3)) return;

    setIsSubmitting(true);

    // Sanitize inputs before saving
    const sanitizedName = sanitizeInput(formData.name);
    const sanitizedBio = sanitizeInput(formData.bio);
    const sanitizedLocation = sanitizeInput(formData.location);
    const sanitizedRate = sanitizeInput(formData.rate);
    const sanitizedAvatar = formData.avatar.trim();
    const sanitizedSkills = formData.skills.map(sanitizeInput).filter(s => s.length > 0);
    const sanitizedPortfolio = formData.portfolio.map(item => ({
      title: sanitizeInput(item.title),
      url: item.url.trim(),
    }));

    // Save the enhanced profile
    const profiles = safeJSONParse<any[]>('talent_profiles', []);
    const existing = profiles.find((p: any) => p.name === sanitizedName);
    if (existing) {
      Object.assign(existing, {
        bio: sanitizedBio,
        category: formData.category,
        skills: sanitizedSkills,
        location: sanitizedLocation,
        rate: sanitizedRate,
        avatar: sanitizedAvatar,
        portfolio: sanitizedPortfolio,
        updatedAt: new Date().toISOString(),
      });
    } else {
      profiles.push({
        id: Date.now(),
        name: sanitizedName,
        bio: sanitizedBio,
        category: formData.category,
        skills: sanitizedSkills,
        location: sanitizedLocation,
        rate: sanitizedRate,
        avatar: sanitizedAvatar,
        portfolio: sanitizedPortfolio,
        featured: false,
        wri: Math.round(Math.random() * 40) + 60,
        createdAt: new Date().toISOString(),
      });
    }
    safeJSONSet('talent_profiles', profiles);
    toast.success('Profile created!');
    navigate('/talent');
  }, [formData, validateStep, navigate, isSubmitting]);

  // ─── Step Progress Indicator ──────────────────────────
  function StepIndicator() {
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
                  width: currentStep >= 2 ? '100%' : '0%',
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
            const isCompleted = currentStep > step.id;
            const isActive = currentStep === step.id;
            const isInactive = currentStep < step.id;

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
                  animate={isActive ? { scale: [1, 1.1, 1] } : { scale: 1 }}
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
                    isActive || isCompleted ? 'text-white' : 'text-white/40'
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

  // ─── Error Message ────────────────────────────────────
  function ErrorMessage({ field }: { field: string }) {
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

  // ─── Step 1: About You ────────────────────────────────
  function Step1AboutYou() {
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
            <h2 className="text-lg font-semibold text-white font-display">About You</h2>
            <p className="text-xs text-white/40">Tell the world who you are</p>
          </div>
        </div>

        {/* Name */}
        <div>
          <label className={labelBaseClass}>
            Full Name <span className="text-[#C6FF34]">*</span>
          </label>
          <StableInput
            type="text"
            inputMode="text"
            enterKeyHint="next"
            autoComplete="name"
            value={formData.name}
            onChange={(e) => updateField('name', e.target.value)}
            placeholder="John Doe"
            maxLength={MAX_NAME_LENGTH}
            className={`${inputBaseClass} ${errors.name ? 'border-red-400/50 focus:border-red-400 focus:ring-red-400/20' : ''}`}
          />
          <ErrorMessage field="name" />
        </div>

        {/* Bio */}
        <div>
          <label className={labelBaseClass}>
            Bio <span className="text-[#C6FF34]">*</span>
          </label>
          <StableTextarea
            inputMode="text"
            enterKeyHint="next"
            autoComplete="off"
            value={formData.bio}
            maxLength={MAX_BIO_LENGTH}
            onChange={(e) => updateField('bio', e.target.value)}
            placeholder="Tell us about your professional journey..."
            rows={4}
            className={`${inputBaseClass} resize-none ${errors.bio ? 'border-red-400/50 focus:border-red-400 focus:ring-red-400/20' : ''}`}
          />
          <ErrorMessage field="bio" />
        </div>

        {/* Location */}
        <div>
          <label className={labelBaseClass}>
            Location <span className="text-[#C6FF34]">*</span>
          </label>
          <div className="relative">
            <MapPin size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none" />
            <StableInput
              type="text"
              inputMode="text"
              enterKeyHint="next"
              autoComplete="address-level2"
              value={formData.location}
              onChange={(e) => updateField('location', e.target.value)}
              placeholder="City, Country (e.g. Lusaka, Zambia)"
              maxLength={MAX_LOCATION_LENGTH}
              className={`${inputBaseClass} pl-10 ${errors.location ? 'border-red-400/50 focus:border-red-400 focus:ring-red-400/20' : ''}`}
            />
          </div>
          <ErrorMessage field="location" />
        </div>

        {/* Category */}
        <div>
          <label className={labelBaseClass}>
            Category <span className="text-[#C6FF34]">*</span>
          </label>
          <div className="relative">
            <StableSelect
              value={formData.category}
              onChange={(e) => updateField('category', e.target.value)}
              className={`${selectBaseClass} ${errors.category ? 'border-red-400/50' : ''}`}
            >
              <option value="" className="bg-[#0A0A0A] text-white/40">
                Select your category
              </option>
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat} className="bg-[#0A0A0A] text-white">
                  {cat}
                </option>
              ))}
            </StableSelect>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-white/40">
              <svg width="12" height="8" viewBox="0 0 12 8" fill="none">
                <path d="M1 1.5L6 6.5L11 1.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </div>
          <ErrorMessage field="category" />
        </div>

        {/* Rate */}
        <div>
          <label className={labelBaseClass}>
            Rate <span className="text-[#C6FF34]">*</span>
          </label>
          <div className="relative">
            <DollarSign size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none" />
            <StableInput
              type="text"
              inputMode="text"
              enterKeyHint="done"
              autoComplete="off"
              value={formData.rate}
              onChange={(e) => updateField('rate', e.target.value)}
              placeholder="e.g. ZMW 500/hour or Negotiable"
              maxLength={MAX_RATE_LENGTH}
              className={`${inputBaseClass} pl-10 ${errors.rate ? 'border-red-400/50 focus:border-red-400 focus:ring-red-400/20' : ''}`}
            />
          </div>
          <ErrorMessage field="rate" />
        </div>

        {/* CTA */}
        <motion.button
          type="button"
          onClick={handleNext}
          className="btn-lime w-full inline-flex items-center justify-center gap-2 mt-6 py-3.5 text-base"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          Next: Skills &amp; Portfolio
          <ChevronRight size={18} />
        </motion.button>
      </motion.div>
    );
  }

  // ─── Step 2: Skills & Portfolio ───────────────────────
  function Step2SkillsPortfolio() {
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
            <Tag size={18} className="text-[#C6FF34]" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white font-display">Skills &amp; Portfolio</h2>
            <p className="text-xs text-white/40">Showcase your expertise</p>
          </div>
        </div>

        {/* Skills Tag Input */}
        <div>
          <label className={labelBaseClass}>
            Skills <span className="text-[#C6FF34]">*</span>
          </label>

          {/* Skill Tags Display */}
          {formData.skills.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              <AnimatePresence>
                {formData.skills.map((skill) => (
                  <motion.span
                    key={skill}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#C6FF34]/10 border border-[#C6FF34]/30 text-[#C6FF34] text-sm font-medium"
                  >
                    {skill}
                    <button
                      type="button"
                      onClick={() => removeSkill(skill)}
                      className="hover:bg-[#C6FF34]/20 rounded-full p-0.5 transition-colors"
                    >
                      <X size={12} strokeWidth={2.5} />
                    </button>
                  </motion.span>
                ))}
              </AnimatePresence>
            </div>
          )}

          {/* Skill Input */}
          <div className="flex gap-2">
            <StableInput
              type="text"
              value={skillInput}
              onChange={(e) => setSkillInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addSkill();
                }
              }}
              placeholder="Type a skill and press Enter..."
              maxLength={MAX_SKILL_LENGTH}
              className="flex-1 px-4 py-3 bg-white/[0.05] border border-white/[0.1] rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:border-[#C6FF34] text-sm"
              inputMode="text"
              enterKeyHint="done"
            />
            <motion.button
              type="button"
              onClick={addSkill}
              disabled={!skillInput.trim()}
              className="px-4 py-3 bg-[#C6FF34] text-black rounded-xl text-sm font-medium disabled:opacity-30 disabled:cursor-not-allowed inline-flex items-center gap-1"
              whileTap={{ scale: 0.95 }}
            >
              <Plus size={16} />
              Add
            </motion.button>
          </div>
          <ErrorMessage field="skills" />
          <p className="text-white/30 text-xs mt-1.5">
            Press Enter or click Add to add a skill. Click the X to remove.
          </p>
        </div>

        {/* Divider */}
        <div className="border-t border-white/[0.06] pt-4">
          {/* Portfolio Items */}
          <div className="flex items-center gap-2 mb-4">
            <FolderOpen size={16} className="text-white/40" />
            <label className="text-white/70 text-sm font-medium font-body">Portfolio Projects</label>
            <span className="text-white/30 text-xs">(up to 5)</span>
          </div>

          {formData.portfolio.length === 0 && (
            <p className="text-white/30 text-sm mb-4">No projects added yet. Add your best work!</p>
          )}

          <AnimatePresence>
            {formData.portfolio.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-4 mb-3"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs text-white/40 font-medium">Project {index + 1}</span>
                  <button
                    type="button"
                    onClick={() => removePortfolioItem(index)}
                    className="text-white/30 hover:text-red-400 transition-colors p-0.5"
                  >
                    <X size={14} />
                  </button>
                </div>
                <div className="space-y-3">
                  <div>
                    <StableInput
                      type="text"
                      value={item.title}
                      onChange={(e) => updatePortfolioItem(index, 'title', e.target.value)}
                      placeholder="Project title"
                      maxLength={MAX_PORTFOLIO_TITLE_LENGTH}
                      className={`w-full px-3.5 py-2.5 bg-white/[0.05] border rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:border-[#C6FF34] text-sm ${errors[`portfolio_${index}_title`] ? 'border-red-400/50' : 'border-white/[0.1]'}`}
                    />
                    {errors[`portfolio_${index}_title`] && (
                      <p className="text-red-400 text-xs mt-1">{errors[`portfolio_${index}_title`]}</p>
                    )}
                  </div>
                  <div className="relative">
                    <Globe size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none" />
                    <StableInput
                      type="url"
                      value={item.url}
                      onChange={(e) => updatePortfolioItem(index, 'url', e.target.value)}
                      placeholder="https://..."
                      className={`w-full px-3.5 py-2.5 pl-9 bg-white/[0.05] border rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:border-[#C6FF34] text-sm ${errors[`portfolio_${index}_url`] ? 'border-red-400/50' : 'border-white/[0.1]'}`}
                    />
                  </div>
                  {errors[`portfolio_${index}_url`] && (
                    <p className="text-red-400 text-xs mt-1">{errors[`portfolio_${index}_url`]}</p>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {formData.portfolio.length < 5 && (
            <motion.button
              type="button"
              onClick={addPortfolioItem}
              className="w-full py-3 border border-dashed border-white/[0.15] rounded-xl text-white/50 hover:text-white hover:border-[#C6FF34]/40 hover:bg-[#C6FF34]/5 transition-all duration-200 inline-flex items-center justify-center gap-2 text-sm"
              whileTap={{ scale: 0.98 }}
            >
              <Plus size={16} />
              Add Project
            </motion.button>
          )}
        </div>

        {/* CTAs */}
        <div className="flex flex-col gap-3 pt-4">
          <motion.button
            type="button"
            onClick={handleNext}
            className="btn-lime w-full inline-flex items-center justify-center gap-2 py-3.5 text-base"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Next: Photo &amp; Review
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
  }

  // ─── Step 3: Photo & Review ───────────────────────────
  function Step3PhotoReview() {
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
            <Camera size={18} className="text-[#C6FF34]" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white font-display">Photo &amp; Review</h2>
            <p className="text-xs text-white/40">Add your avatar and review your profile</p>
          </div>
        </div>

        {/* Avatar URL Input */}
        <div>
          <label className={labelBaseClass}>Profile Photo URL</label>
          <div className="flex items-center gap-4 mb-3">
            {/* Avatar Preview */}
            <div className="w-16 h-16 rounded-full bg-white/[0.05] border border-white/[0.1] flex items-center justify-center flex-shrink-0 overflow-hidden">
              {formData.avatar ? (
                <img
                  src={formData.avatar}
                  alt="Avatar preview"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              ) : (
                <User size={24} className="text-white/30" />
              )}
            </div>
            <div className="flex-1">
              <div className="relative">
                <Camera size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none" />
                <StableInput
                  type="url"
                  inputMode="url"
                  enterKeyHint="done"
                  autoComplete="url"
                  value={formData.avatar}
                  onChange={(e) => updateField('avatar', e.target.value)}
                  placeholder="Paste image URL (S3 upload coming soon)"
                  className={`${inputBaseClass} pl-10 ${errors.avatar ? 'border-red-400/50 focus:border-red-400 focus:ring-red-400/20' : ''}`}
                />
              </div>
            </div>
          </div>
          {errors.avatar && (
            <p className="text-red-400 text-xs mt-1.5">{errors.avatar}</p>
          )}
          <p className="text-white/30 text-xs">Paste a direct image URL. S3 upload support coming soon.</p>
        </div>

        {/* Review Card */}
        <div className="border-t border-white/[0.06] pt-4">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles size={16} className="text-[#C6FF34]" />
            <h3 className="text-sm font-semibold text-white font-display">Profile Preview</h3>
          </div>

          <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-5 space-y-4">
            {/* Name & Category */}
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[10px] uppercase tracking-wider text-white/30 mb-0.5">Name</p>
                <p className="text-white font-medium font-display">{formData.name || 'Not set'}</p>
              </div>
              {formData.category && (
                <span className="px-2.5 py-1 rounded-lg bg-[#7E3BED]/20 border border-[#7E3BED]/30 text-[#A070F0] text-xs font-medium">
                  {formData.category}
                </span>
              )}
            </div>

            {/* Bio */}
            <div>
              <p className="text-[10px] uppercase tracking-wider text-white/30 mb-0.5">Bio</p>
              <p className="text-white/80 text-sm leading-relaxed">{formData.bio || 'Not set'}</p>
            </div>

            {/* Location & Rate */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-[10px] uppercase tracking-wider text-white/30 mb-0.5">Location</p>
                <div className="flex items-center gap-1.5 text-white text-sm">
                  <MapPin size={12} className="text-white/40" />
                  {formData.location || 'Not set'}
                </div>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider text-white/30 mb-0.5">Rate</p>
                <div className="flex items-center gap-1.5 text-white text-sm">
                  <DollarSign size={12} className="text-white/40" />
                  {formData.rate || 'Not set'}
                </div>
              </div>
            </div>

            {/* Skills */}
            <div>
              <p className="text-[10px] uppercase tracking-wider text-white/30 mb-1.5">Skills</p>
              <div className="flex flex-wrap gap-1.5">
                {formData.skills.length > 0 ? (
                  formData.skills.map((skill) => (
                    <span
                      key={skill}
                      className="px-2 py-0.5 rounded-md bg-[#C6FF34]/10 border border-[#C6FF34]/20 text-[#C6FF34] text-xs"
                    >
                      {skill}
                    </span>
                  ))
                ) : (
                  <span className="text-white/30 text-sm">No skills added</span>
                )}
              </div>
            </div>

            {/* Portfolio */}
            {formData.portfolio.length > 0 && (
              <div>
                <p className="text-[10px] uppercase tracking-wider text-white/30 mb-1.5">Portfolio</p>
                <div className="space-y-1.5">
                  {formData.portfolio.map((item, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm">
                      <FolderOpen size={12} className="text-white/30 flex-shrink-0" />
                      <span className="text-white/80 truncate">{item.title || 'Untitled'}</span>
                      {item.url && (
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#C6FF34]/60 hover:text-[#C6FF34] text-xs flex-shrink-0"
                        >
                          <Globe size={12} />
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* CTAs */}
        <div className="flex flex-col gap-3 pt-2">
          <motion.button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="btn-lime w-full inline-flex items-center justify-center gap-2 py-3.5 text-base disabled:opacity-50 disabled:cursor-not-allowed"
            whileHover={{ scale: isSubmitting ? 1 : 1.02 }}
            whileTap={{ scale: isSubmitting ? 1 : 0.98 }}
          >
            {isSubmitting ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Sparkles size={18} />
                Create My Profile
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
  }

  // ─── Render ───────────────────────────────────────────
  return (
    <motion.div
      className="min-h-[calc(100dvh-72px)] flex flex-col items-center justify-center px-4 py-12 pb-24 md:pb-12"
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
            Create Your Profile
          </h1>
          <p className="text-sm text-white/50">
            Showcase your talent to the world
          </p>
        </motion.div>

        {/* Progress Indicator */}
        <StepIndicator />

        {/* Glass Card */}
        <motion.div
          >
          <AnimatePresence mode="wait">
            {currentStep === 1 && <Step1AboutYou key="step1" />}
            {currentStep === 2 && <Step2SkillsPortfolio key="step2" />}
            {currentStep === 3 && <Step3PhotoReview key="step3" />}
          </AnimatePresence>
        </motion.div>
      </div>
    </motion.div>
  );
}
