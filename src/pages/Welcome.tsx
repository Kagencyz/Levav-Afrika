import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useSearchParams } from 'react-router';
import { Check, ChevronRight, ChevronLeft, Loader2, Target, UserRound } from 'lucide-react';
import { toast } from 'sonner';
import { trpc } from '@/providers/trpc';
import { useAuth } from '@/hooks/useAuth';
import GlassCard from '@/components/GlassCard';
import {
  SIGNUP_GOALS,
  PERSONAL_STATUSES,
  destinationForGoals,
  isGoalSlug,
  type GoalSlug,
  type StatusSlug,
} from '@/lib/onboardingRouting';

/**
 * Preference selection after account creation (upgrade brief §3):
 * step 1 — what do you want to do (multi-select goals, first = primary);
 * step 2 — personal status. Saves via onboarding.complete, then routes
 * to the first experience for the primary goal.
 */
export default function Welcome() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();

  // A goal carried from a landing-page path card pre-selects itself.
  const seedGoal = searchParams.get('goal');
  const [goals, setGoals] = useState<GoalSlug[]>(isGoalSlug(seedGoal) ? [seedGoal] : []);
  const [status, setStatus] = useState<StatusSlug | null>(null);
  const [step, setStep] = useState<1 | 2>(1);

  const completeMutation = trpc.onboarding.complete.useMutation();

  const toggleGoal = (slug: GoalSlug) => {
    setGoals((prev) =>
      prev.includes(slug) ? prev.filter((g) => g !== slug) : [...prev, slug]
    );
  };

  const handleFinish = async () => {
    if (!status) return;
    try {
      await completeMutation.mutateAsync({ goals, personalStatus: status });
      toast.success('You’re all set!');
      navigate(destinationForGoals(goals));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Something went wrong';
      toast.error(message);
    }
  };

  const firstName = user?.name?.split(' ')[0] ?? user?.firstName ?? '';

  return (
    <div className="min-h-[calc(100dvh-72px)] flex items-center justify-center px-4 py-12 pb-24 md:pb-12">
      <motion.div
        className="w-full max-w-xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="text-center mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2 font-display">
            {firstName ? `Welcome, ${firstName}!` : 'Welcome to Levav™!'}
          </h1>
          <p className="text-sm text-white/50">
            {step === 1
              ? 'What do you want to do on Levav? Pick everything that applies — your first choice shapes where we take you.'
              : 'And where are you right now? This shapes your Levav 28™ pathway and recommendations.'}
          </p>
        </div>

        <GlassCard className="p-6 sm:p-8" hover={false}>
          <AnimatePresence mode="wait">
            {step === 1 ? (
              <motion.div
                key="goals"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.2 }}
              >
                <div className="flex items-center gap-2.5 mb-5">
                  <div className="w-9 h-9 rounded-xl bg-[#C6FF34]/10 border border-[#C6FF34]/20 flex items-center justify-center">
                    <Target size={17} className="text-[#C6FF34]" />
                  </div>
                  <h2 className="text-base font-semibold text-white font-display">Your goals</h2>
                  <span className="ml-auto text-xs text-white/35">Step 1 of 2</span>
                </div>

                <div className="space-y-2.5 mb-6">
                  {SIGNUP_GOALS.map((goal) => {
                    const selected = goals.includes(goal.slug);
                    const isPrimary = goals[0] === goal.slug;
                    return (
                      <button
                        key={goal.slug}
                        type="button"
                        onClick={() => toggleGoal(goal.slug)}
                        className={`w-full flex items-center gap-3 rounded-xl border px-4 py-3 text-left transition-all ${
                          selected
                            ? 'border-[#C6FF34]/50 bg-[#C6FF34]/[0.08]'
                            : 'border-white/[0.08] hover:border-white/[0.18] bg-white/[0.02]'
                        }`}
                      >
                        <span
                          className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 transition-colors ${
                            selected ? 'bg-[#C6FF34] border-[#C6FF34]' : 'border-white/[0.2]'
                          }`}
                        >
                          {selected && <Check size={13} strokeWidth={3} className="text-black" />}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block text-sm font-medium text-white">{goal.label}</span>
                          <span className="block text-xs text-white/40">{goal.desc}</span>
                        </span>
                        {isPrimary && (
                          <span className="text-[9px] font-semibold uppercase tracking-wider text-[#C6FF34] bg-[#C6FF34]/10 border border-[#C6FF34]/25 rounded-md px-1.5 py-0.5 shrink-0">
                            Primary
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>

                <button
                  type="button"
                  disabled={goals.length === 0}
                  onClick={() => setStep(2)}
                  className="btn-lime w-full inline-flex items-center justify-center gap-2 py-3 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Continue
                  <ChevronRight size={16} />
                </button>
              </motion.div>
            ) : (
              <motion.div
                key="status"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                <div className="flex items-center gap-2.5 mb-5">
                  <div className="w-9 h-9 rounded-xl bg-[#7E3BED]/10 border border-[#7E3BED]/25 flex items-center justify-center">
                    <UserRound size={17} className="text-[#7E3BED]" />
                  </div>
                  <h2 className="text-base font-semibold text-white font-display">Your current status</h2>
                  <span className="ml-auto text-xs text-white/35">Step 2 of 2</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-6">
                  {PERSONAL_STATUSES.map((s) => (
                    <button
                      key={s.slug}
                      type="button"
                      onClick={() => setStatus(s.slug)}
                      className={`rounded-xl border px-4 py-3 text-sm font-medium text-left transition-all ${
                        status === s.slug
                          ? 'border-[#C6FF34]/50 bg-[#C6FF34]/10 text-[#C6FF34]'
                          : 'border-white/[0.08] text-white/70 hover:border-white/[0.18] bg-white/[0.02]'
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>

                <div className="flex flex-col gap-3">
                  <button
                    type="button"
                    disabled={!status || completeMutation.isPending}
                    onClick={handleFinish}
                    className="btn-lime w-full inline-flex items-center justify-center gap-2 py-3 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {completeMutation.isPending ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        Setting up...
                      </>
                    ) : (
                      <>
                        Take me there
                        <ChevronRight size={16} />
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="inline-flex items-center justify-center gap-1.5 text-sm text-white/50 hover:text-white transition-colors py-1.5"
                  >
                    <ChevronLeft size={15} />
                    Back to goals
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </GlassCard>
      </motion.div>
    </div>
  );
}
