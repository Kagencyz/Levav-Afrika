import { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams, useNavigate } from 'react-router';
import { Eye, EyeOff, ArrowRight, Sparkles, Loader2, MailCheck } from 'lucide-react';
import { toast } from 'sonner';
import { sanitizeInput, isValidEmail } from '@/lib/safeJSON';
import { StableInput } from '@/components/StableInputs';
import { trpc } from '@/providers/trpc';
import GlassCard from '@/components/GlassCard';

/** Rate limit: max attempts before cooldown */
const MAX_ATTEMPTS = 5;
/** Rate limit cooldown in ms (30 seconds) */
const RATE_LIMIT_COOLDOWN_MS = 30000;

interface FormErrors {
  [key: string]: string;
}

const MAX_EMAIL_LENGTH = 254;
const MAX_PASSWORD_LENGTH = 128;
const MAX_NAME_LENGTH = 100;

export default function Auth() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const initialMode = searchParams.get('mode') === 'signup' ? 'signup' : 'login';
  const intent = searchParams.get('intent') === 'employer' ? 'employer' : 'general';
  const [mode, setMode] = useState<'login' | 'signup'>(initialMode);

  // Keep mode in sync when a nav link changes ?mode= while already mounted.
  useEffect(() => {
    const urlMode = searchParams.get('mode') === 'signup' ? 'signup' : 'login';
    setMode(urlMode);
  }, [searchParams]);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [confirmationEmail, setConfirmationEmail] = useState<string | null>(null);
  const [errors, setErrors] = useState<FormErrors>({});
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const utils = trpc.useUtils();
  const registerMutation = trpc.auth.register.useMutation();
  const loginMutation = trpc.auth.login.useMutation();
  const resendMutation = trpc.auth.resendConfirmation.useMutation();

  useEffect(() => {
    if (searchParams.get('confirmed') === '1') {
      toast.success('Email confirmed. Sign in to continue.');
    }
    if (searchParams.get('error_code') === 'otp_expired') {
      toast.error('That confirmation link has expired. Request a fresh email below.');
      setMode('signup');
    }
  }, [searchParams]);

  // SECURITY FIX: Rate limiting state
  const attemptCountRef = useRef(0);
  const rateLimitTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [isRateLimited, setIsRateLimited] = useState(false);
  const [rateLimitCountdown, setRateLimitCountdown] = useState(0);

  const clearRateLimit = useCallback(() => {
    attemptCountRef.current = 0;
    setIsRateLimited(false);
    setRateLimitCountdown(0);
    if (rateLimitTimerRef.current) {
      clearTimeout(rateLimitTimerRef.current);
      rateLimitTimerRef.current = null;
    }
  }, []);

  const startRateLimit = useCallback(() => {
    setIsRateLimited(true);
    setRateLimitCountdown(RATE_LIMIT_COOLDOWN_MS / 1000);
    const interval = setInterval(() => {
      setRateLimitCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          clearRateLimit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    rateLimitTimerRef.current = setTimeout(() => {
      clearInterval(interval);
      clearRateLimit();
    }, RATE_LIMIT_COOLDOWN_MS);
  }, [clearRateLimit]);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (mode === 'signup') {
      const firstName = formData.firstName.trim();
      const lastName = formData.lastName.trim();

      if (!firstName) {
        newErrors.firstName = 'First name is required';
      } else if (firstName.length > MAX_NAME_LENGTH) {
        newErrors.firstName = `First name must be less than ${MAX_NAME_LENGTH} characters`;
      }

      if (!lastName) {
        newErrors.lastName = 'Last name is required';
      } else if (lastName.length > MAX_NAME_LENGTH) {
        newErrors.lastName = `Last name must be less than ${MAX_NAME_LENGTH} characters`;
      }
    }

    const email = formData.email.trim();
    if (!email) {
      newErrors.email = 'Email is required';
    } else if (email.length > MAX_EMAIL_LENGTH) {
      newErrors.email = `Email must be less than ${MAX_EMAIL_LENGTH} characters`;
    } else if (!isValidEmail(email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    const password = formData.password;
    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    } else if (password.length > MAX_PASSWORD_LENGTH) {
      newErrors.password = `Password must be less than ${MAX_PASSWORD_LENGTH} characters`;
    }

    if (mode === 'signup') {
      if (!formData.confirmPassword) {
        newErrors.confirmPassword = 'Please confirm your password';
      } else if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // SECURITY FIX: Check rate limit before processing
    if (isRateLimited) {
      toast.error(`Too many attempts. Please wait ${rateLimitCountdown} seconds.`);
      return;
    }
    if (attemptCountRef.current >= MAX_ATTEMPTS) {
      startRateLimit();
      toast.error(`Too many attempts. Please wait ${RATE_LIMIT_COOLDOWN_MS / 1000} seconds.`);
      return;
    }

    if (!validateForm()) {
      return;
    }

    // Increment attempt counter for rate limiting
    attemptCountRef.current += 1;

    setIsLoading(true);

    const email = formData.email.trim().toLowerCase();

    try {
      if (mode === 'signup') {
        const name = sanitizeInput(
          `${formData.firstName} ${formData.lastName}`.trim()
        );
        const result = await registerMutation.mutateAsync({
          email,
          password: formData.password,
          name,
          intent,
        });
        if (result.requiresEmailConfirmation) {
          attemptCountRef.current = 0;
          toast.success('Confirmation email sent.');
          setConfirmationEmail(email);
          setFormData((current) => ({ ...current, password: '', confirmPassword: '' }));
          return;
        }
        // No token to store — the server set it as an httpOnly cookie.
        await utils.auth.me.fetch().catch(() => null);
        await utils.auth.me.invalidate();
        attemptCountRef.current = 0;
        toast.success('Account created!');
        // Preference selection next (upgrade brief §3); a goal carried from
        // a landing-page path card rides along to pre-select itself.
        const goal = searchParams.get('goal');
        if (intent === 'employer') {
          navigate('/employers');
        } else {
          navigate(goal ? `/welcome?goal=${encodeURIComponent(goal)}` : '/welcome');
        }
      } else {
        await loginMutation.mutateAsync({
          email,
          password: formData.password,
        });
        // No token to store — the server set it as an httpOnly cookie.
        await utils.auth.me.fetch().catch(() => null);
        await utils.auth.me.invalidate();
        attemptCountRef.current = 0;
        toast.success('Welcome back!');
        navigate(intent === 'employer' ? '/employers' : '/dashboard');
      }
    } catch (err) {
      const rawMessage = err instanceof Error ? err.message : '';
      // Only ever surface known, safe, user-facing messages from the server.
      // Anything else (network failures, browser/library internals, an
      // unexpected server error) must never be shown verbatim — it can leak
      // implementation details and is rarely meaningful to the user.
      if (/email already registered/i.test(rawMessage)) {
        setErrors({ email: 'This email is already registered — try signing in.' });
      } else if (/invalid email or password/i.test(rawMessage)) {
        setErrors({ password: 'Invalid email or password.' });
      } else if (/confirmation email limit reached/i.test(rawMessage)) {
        toast.error('Confirmation email limit reached. Please wait an hour and try again.');
      } else {
        toast.error('Something went wrong. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMode = () => {
    setMode((prev) => (prev === 'login' ? 'signup' : 'login'));
  };

  return (
    <div className="min-h-[calc(100dvh-72px)] flex items-center justify-center px-4 py-12 pb-24 md:pb-12">
      <motion.div
        className="w-full max-w-md"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.19, 1, 0.22, 1] }}
      >
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-[#C6FF34] to-[#7E3BED] mb-4">
            <Sparkles size={20} className="text-black" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">
            {mode === 'login' ? 'Welcome Back' : intent === 'employer' ? 'Create Employer Account' : 'Join Levav\u2122'}
          </h1>
          <p className="text-sm text-[#A0A0A0]">
            {mode === 'login'
              ? 'Sign in to your account to continue'
              : intent === 'employer'
                ? 'Confirm your work email, then register your organization'
                : 'Create your account and start your journey'}
          </p>
        </div>

        <GlassCard className="p-6 sm:p-8" hover={false}>
          {confirmationEmail ? (
            <div className="text-center space-y-5" aria-live="polite">
              <MailCheck className="w-12 h-12 text-[#C6FF34] mx-auto" />
              <div>
                <h2 className="text-xl font-semibold text-white">Check your email</h2>
                <p className="text-sm text-white/60 mt-2">
                  We sent a confirmation link to <strong className="text-white">{confirmationEmail}</strong>.
                  Confirm it, then return here to sign in.
                </p>
              </div>
              <button
                type="button"
                disabled={resendMutation.isPending}
                onClick={async () => {
                  try {
                    await resendMutation.mutateAsync({ email: confirmationEmail, intent });
                    toast.success('A fresh confirmation email was sent.');
                  } catch (error) {
                    const message = error instanceof Error ? error.message : '';
                    toast.error(/wait before/i.test(message)
                      ? 'Please wait before requesting another email.'
                      : 'Could not resend the email. Please try again.');
                  }
                }}
                className="btn-lime w-full disabled:opacity-50"
              >
                {resendMutation.isPending ? 'Sending…' : 'Resend confirmation email'}
              </button>
              <button
                type="button"
                onClick={() => { setConfirmationEmail(null); setMode('login'); }}
                className="text-sm text-white/60 hover:text-white"
              >
                I have confirmed my email — sign in
              </button>
            </div>
          ) : (
          <AnimatePresence mode="wait">
            <motion.form
              key={mode}
              onSubmit={handleSubmit}
              initial={{ opacity: 0, x: mode === 'signup' ? 20 : -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: mode === 'signup' ? -20 : 20 }}
              transition={{ duration: 0.2 }}
              className="space-y-5"
            >
              {mode === 'signup' && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      First Name
                    </label>
                    <StableInput
                      type="text"
                      value={formData.firstName}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                        setFormData({ ...formData, firstName: e.target.value });
                        if (errors.firstName) setErrors((prev) => { const n = { ...prev }; delete n.firstName; return n; });
                      }}
                      placeholder="John"
                      maxLength={MAX_NAME_LENGTH}
                      className={`w-full px-4 py-3 bg-white/[0.03] border rounded-xl text-white placeholder:text-[#666666] focus:outline-none focus:border-[#C6FF34]/50 transition-colors ${errors.firstName ? 'border-red-400/50 focus:border-red-400' : 'border-white/[0.06]'}`}
                    />
                    {errors.firstName && (
                      <p className="text-red-400 text-xs mt-1.5">{errors.firstName}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      Last Name
                    </label>
                    <StableInput
                      type="text"
                      value={formData.lastName}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                        setFormData({ ...formData, lastName: e.target.value });
                        if (errors.lastName) setErrors((prev) => { const n = { ...prev }; delete n.lastName; return n; });
                      }}
                      placeholder="Doe"
                      maxLength={MAX_NAME_LENGTH}
                      className={`w-full px-4 py-3 bg-white/[0.03] border rounded-xl text-white placeholder:text-[#666666] focus:outline-none focus:border-[#C6FF34]/50 transition-colors ${errors.lastName ? 'border-red-400/50 focus:border-red-400' : 'border-white/[0.06]'}`}
                    />
                    {errors.lastName && (
                      <p className="text-red-400 text-xs mt-1.5">{errors.lastName}</p>
                    )}
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Email
                </label>
                <StableInput
                  type="email"
                  value={formData.email}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    setFormData({ ...formData, email: e.target.value });
                    if (errors.email) setErrors((prev) => { const n = { ...prev }; delete n.email; return n; });
                  }}
                  placeholder="you@example.com"
                  maxLength={MAX_EMAIL_LENGTH}
                  className={`w-full px-4 py-3 bg-white/[0.03] border rounded-xl text-white placeholder:text-[#666666] focus:outline-none focus:border-[#C6FF34]/50 transition-colors ${errors.email ? 'border-red-400/50 focus:border-red-400' : 'border-white/[0.06]'}`}
                />
                {errors.email && (
                  <p className="text-red-400 text-xs mt-1.5">{errors.email}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Password
                </label>
                <div className="relative">
                  <StableInput
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                      setFormData({ ...formData, password: e.target.value });
                      if (errors.password) setErrors((prev) => { const n = { ...prev }; delete n.password; return n; });
                    }}
                    placeholder="Enter your password"
                    minLength={6}
                    maxLength={MAX_PASSWORD_LENGTH}
                    className={`w-full px-4 py-3 pr-12 bg-white/[0.03] border rounded-xl text-white placeholder:text-[#666666] focus:outline-none focus:border-[#C6FF34]/50 transition-colors ${errors.password ? 'border-red-400/50 focus:border-red-400' : 'border-white/[0.06]'}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#666666] hover:text-[#A0A0A0] transition-colors"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-red-400 text-xs mt-1.5">{errors.password}</p>
                )}
              </div>

              {mode === 'signup' && (
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <StableInput
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={formData.confirmPassword}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                        setFormData({ ...formData, confirmPassword: e.target.value });
                        if (errors.confirmPassword) setErrors((prev) => { const n = { ...prev }; delete n.confirmPassword; return n; });
                      }}
                      placeholder="Confirm your password"
                      minLength={6}
                      maxLength={MAX_PASSWORD_LENGTH}
                      className={`w-full px-4 py-3 pr-12 bg-white/[0.03] border rounded-xl text-white placeholder:text-[#666666] focus:outline-none focus:border-[#C6FF34]/50 transition-colors ${errors.confirmPassword ? 'border-red-400/50 focus:border-red-400' : 'border-white/[0.06]'}`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#666666] hover:text-[#A0A0A0] transition-colors"
                    >
                      {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-red-400 text-xs mt-1.5">{errors.confirmPassword}</p>
                  )}
                </div>
              )}

              {mode === 'signup' && (
                <p className="text-xs text-white/40 leading-relaxed">
                  One free account for everything — you&apos;ll choose what you
                  want to do (find work, hire, develop, volunteer...) right
                  after this step.
                </p>
              )}

              {/* Rate limit warning */}
              {isRateLimited && (
                <p className="text-red-400 text-xs text-center">
                  Too many attempts. Please wait {rateLimitCountdown} seconds before retrying.
                </p>
              )}

              <button
                type="submit"
                className="btn-lime w-full inline-flex items-center justify-center gap-2 disabled:opacity-50"
                disabled={isLoading || isRateLimited}
              >
                {isLoading ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : isRateLimited ? (
                  `Wait ${rateLimitCountdown}s`
                ) : mode === 'login' ? (
                  'Sign In'
                ) : (
                  'Create Account'
                )}
                <ArrowRight size={16} />
              </button>
            </motion.form>
          </AnimatePresence>
          )}

          {/* Toggle */}
          {!confirmationEmail && <div className="mt-6 pt-6 border-t border-white/[0.06] text-center">
            <p className="text-sm text-[#A0A0A0]">
              {mode === 'login' ? "Don't have an account?" : 'Already have an account?'}{' '}
              <button
                onClick={toggleMode}
                className="text-[#C6FF34] font-medium hover:underline"
              >
                {mode === 'login' ? 'Sign Up' : 'Sign In'}
              </button>
            </p>
          </div>}
        </GlassCard>
      </motion.div>
    </div>
  );
}
