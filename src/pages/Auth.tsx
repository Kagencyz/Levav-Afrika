import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams, useNavigate } from 'react-router';
import { Eye, EyeOff, ArrowRight, Sparkles, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { sanitizeInput, isValidEmail } from '@/lib/safeJSON';
import { StableInput, StableTextarea, StableSelect } from '@/components/StableInputs';
import { logWithCurrentUser } from '@/lib/auditService';
import GlassCard from '@/components/GlassCard';
import { trpc } from '@/providers/trpc';

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
  const registerMutation = trpc.auth.register.useMutation();
  const loginMutation = trpc.auth.login.useMutation();
  const initialMode = searchParams.get('mode') === 'signup' ? 'signup' : 'login';
  const [mode, setMode] = useState<'login' | 'signup'>(initialMode);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'talent',
  });

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

  const handleSubmit = (e: React.FormEvent) => {
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

    const sanitizedEmail = formData.email.trim().toLowerCase();
    const password = formData.password;

    setIsLoading(true);

    if (mode === 'signup') {
      const fullName = sanitizeInput(`${formData.firstName} ${formData.lastName}`.trim());

      registerMutation.mutate(
        {
          email: sanitizedEmail,
          password,
          name: fullName || sanitizedEmail.split('@')[0],
        },
        {
          onSuccess: ({ token, user }) => {
            localStorage.setItem('auth_token', token);
            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(user));

            setIsLoading(false);
            attemptCountRef.current = 0;
            logWithCurrentUser('register', 'Authentication', 'success', `Registered as ${formData.role}`);
            toast.success('Account created!');

            if (formData.role === 'employer') {
              navigate('/employers');
            } else {
              navigate('/onboarding');
            }
          },
          onError: (error) => {
            setIsLoading(false);
            toast.error(error instanceof Error ? error.message : 'Registration failed');
          },
        }
      );

      return;
    }

    loginMutation.mutate(
      {
        email: sanitizedEmail,
        password,
      },
      {
        onSuccess: ({ token, user }) => {
          localStorage.setItem('auth_token', token);
          localStorage.setItem('token', token);
          localStorage.setItem('user', JSON.stringify(user));

          setIsLoading(false);
          attemptCountRef.current = 0;
          logWithCurrentUser('login', 'Authentication', 'success');
          toast.success('Welcome back!');
          navigate('/dashboard');
        },
        onError: (error) => {
          setIsLoading(false);
          toast.error(error instanceof Error ? error.message : 'Login failed');
        },
      }
    );
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
            {mode === 'login' ? 'Welcome Back' : 'Join Levav\u2122'}
          </h1>
          <p className="text-sm text-[#A0A0A0]">
            {mode === 'login'
              ? 'Sign in to your account to continue'
              : 'Create your account and start your journey'}
          </p>
        </div>

        <GlassCard className="p-6 sm:p-8" hover={false}>
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
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    I am a
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, role: 'talent' })}
                      className={`py-3 px-4 rounded-xl text-sm font-medium border transition-all ${
                        formData.role === 'talent'
                          ? 'border-[#C6FF34]/50 bg-[#C6FF34]/10 text-[#C6FF34]'
                          : 'border-white/[0.06] text-[#A0A0A0] hover:border-white/[0.12]'
                      }`}
                    >
                      Talent
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, role: 'employer' })}
                      className={`py-3 px-4 rounded-xl text-sm font-medium border transition-all ${
                        formData.role === 'employer'
                          ? 'border-[#C6FF34]/50 bg-[#C6FF34]/10 text-[#C6FF34]'
                          : 'border-white/[0.06] text-[#A0A0A0] hover:border-white/[0.12]'
                      }`}
                    >
                      Employer
                    </button>
                  </div>
                </div>
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

          {/* Toggle */}
          <div className="mt-6 pt-6 border-t border-white/[0.06] text-center">
            <p className="text-sm text-[#A0A0A0]">
              {mode === 'login' ? "Don't have an account?" : 'Already have an account?'}{' '}
              <button
                onClick={toggleMode}
                className="text-[#C6FF34] font-medium hover:underline"
              >
                {mode === 'login' ? 'Sign Up' : 'Sign In'}
              </button>
            </p>
          </div>
        </GlassCard>
      </motion.div>
    </div>
  );
}
