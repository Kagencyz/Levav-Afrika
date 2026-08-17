import { useState } from 'react';
import { Check, ChevronRight, Loader2 } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router';
import { toast } from 'sonner';
import GlassCard from '@/components/GlassCard';
import { t } from '@/copy';
import {
  OPPORTUNITY_POSTURES,
  PERSONAL_STATUSES,
  PLATFORM_INTENTIONS,
  isGoalSlug,
  type IntentionSlug,
  type PostureSlug,
  type StatusSlug,
} from '@/lib/onboardingRouting';
import { trpc } from '@/providers/trpc';

export default function Welcome() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const seed = searchParams.get('goal');
  const [intentions, setIntentions] = useState<IntentionSlug[]>(isGoalSlug(seed) ? [seed] : []);
  const [situation, setSituation] = useState<StatusSlug | null>(null);
  const [posture, setPosture] = useState<PostureSlug | null>(null);
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const complete = trpc.onboarding.complete.useMutation();

  const toggleIntention = (slug: IntentionSlug) => {
    setIntentions((current) => current.includes(slug)
      ? current.filter((value) => value !== slug)
      : [...current, slug]);
  };

  const finish = async () => {
    try {
      await complete.mutateAsync({
        intentions,
        employmentSituation: situation,
        opportunityPosture: posture,
      });
      toast.success(t('welcome.done'));
      navigate('/onboarding');
    } catch (error) {
      console.error('Failed to save onboarding preferences', error);
      toast.error(t('welcome.error'));
    }
  };

  return (
    <main className="min-h-[calc(100dvh-72px)] px-4 py-8 pb-24 md:pb-12">
      <div className="mx-auto w-full max-w-2xl">
        <header className="mb-6 text-center">
          <h1 className="font-display text-2xl font-bold text-white sm:text-3xl">{t('welcome.title')}</h1>
          <p className="mt-2 text-sm text-white/50">{t('welcome.step', { current: step, total: 3 })}</p>
        </header>

        <GlassCard className="p-4 sm:p-8" hover={false}>
          {step === 1 && (
            <section>
              <h2 className="font-display text-xl font-semibold text-white">{t('onboarding.intentions.title')}</h2>
              <p className="mb-5 mt-2 text-sm text-white/60">{t('onboarding.intentions.help')}</p>
              <div className="space-y-2">
                {PLATFORM_INTENTIONS.map((item) => {
                  const selected = intentions.includes(item.slug);
                  return (
                    <button key={item.slug} type="button" onClick={() => toggleIntention(item.slug)}
                      className={`flex min-h-12 w-full items-center gap-3 rounded-xl border px-4 py-3 text-left text-sm ${selected ? 'border-[#C6FF34]/50 bg-[#C6FF34]/10 text-white' : 'border-white/10 text-white/70'}`}>
                      <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border ${selected ? 'border-[#C6FF34] bg-[#C6FF34]' : 'border-white/25'}`}>
                        {selected && <Check size={13} className="text-black" />}
                      </span>
                      {item.label}
                    </button>
                  );
                })}
              </div>
              <Continue onClick={() => setStep(2)} />
            </section>
          )}

          {step === 2 && (
            <section>
              <h2 className="font-display text-xl font-semibold text-white">{t('onboarding.situation.title')}</h2>
              <p className="mb-5 mt-2 text-sm text-white/60">{t('onboarding.situation.help')}</p>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {PERSONAL_STATUSES.map((item) => (
                  <Choice key={item.slug} selected={situation === item.slug} onClick={() => setSituation(item.slug)}>{item.label}</Choice>
                ))}
                <Choice selected={situation === null} onClick={() => setSituation(null)}>{t('situation.unspecified')}</Choice>
              </div>
              <Continue onClick={() => setStep(3)} />
            </section>
          )}

          {step === 3 && (
            <section>
              <h2 className="font-display text-xl font-semibold text-white">{t('onboarding.posture.title')}</h2>
              <RichCopy value={t('onboarding.posture.privacy')} />
              <div className="space-y-2">
                {OPPORTUNITY_POSTURES.map((item) => (
                  <Choice key={item.slug} selected={posture === item.slug} onClick={() => setPosture(item.slug)}>{item.label}</Choice>
                ))}
                <Choice selected={posture === null} onClick={() => setPosture(null)}>{t('posture.unspecified')}</Choice>
              </div>
              <button type="button" onClick={finish} disabled={complete.isPending}
                className="btn-lime mt-6 inline-flex min-h-12 w-full items-center justify-center gap-2 disabled:opacity-50">
                {complete.isPending ? <><Loader2 size={16} className="animate-spin" />{t('welcome.saving')}</> : <>{t('welcome.action.continue')}<ChevronRight size={16} /></>}
              </button>
            </section>
          )}
        </GlassCard>
      </div>
    </main>
  );
}

function Continue({ onClick }: { onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="btn-lime mt-6 inline-flex min-h-12 w-full items-center justify-center gap-2">
      {t('welcome.action.continue')}<ChevronRight size={16} />
    </button>
  );
}

function Choice({ selected, onClick, children }: { selected: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button type="button" onClick={onClick}
      className={`min-h-12 w-full rounded-xl border px-4 py-3 text-left text-sm ${selected ? 'border-[#C6FF34]/50 bg-[#C6FF34]/10 text-[#C6FF34]' : 'border-white/10 text-white/70'}`}>
      {children}
    </button>
  );
}

function RichCopy({ value }: { value: string }) {
  const [before = '', emphasis = '', after = ''] = value.split('**');
  return <p className="mb-5 mt-2 text-sm text-white/60">{before}<strong className="text-white">{emphasis}</strong>{after}</p>;
}
