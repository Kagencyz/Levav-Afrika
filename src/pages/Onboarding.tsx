import { useEffect, useMemo, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';
import GlassCard from '@/components/GlassCard';
import { t } from '@/copy';
import { destinationForGoals, type IntentionSlug } from '@/lib/onboardingRouting';
import { trpc } from '@/providers/trpc';

const LOCAL_DRAFT_KEY = 'levav_onboarding_career_draft_v1';
const EMPTY_UUID = '00000000-0000-0000-0000-000000000000';

type CareerDraft = {
  familyId: string | null;
  roleId: string | null;
  selfDescribedTitle: string | null;
  targetRoleId: string | null;
  seniority: null;
  industryId: string | null;
  workMode: null;
};

const emptyDraft: CareerDraft = {
  familyId: null,
  roleId: null,
  selfDescribedTitle: null,
  targetRoleId: null,
  seniority: null,
  industryId: null,
  workMode: null,
};

function readLocalDraft(): CareerDraft {
  try {
    const parsed = JSON.parse(localStorage.getItem(LOCAL_DRAFT_KEY) ?? 'null');
    if (!parsed || typeof parsed !== 'object') return emptyDraft;
    return {
      familyId: typeof parsed.familyId === 'string' ? parsed.familyId : null,
      roleId: typeof parsed.roleId === 'string' ? parsed.roleId : null,
      selfDescribedTitle: typeof parsed.selfDescribedTitle === 'string' ? parsed.selfDescribedTitle : null,
      targetRoleId: typeof parsed.targetRoleId === 'string' ? parsed.targetRoleId : null,
      seniority: null,
      industryId: typeof parsed.industryId === 'string' ? parsed.industryId : null,
      workMode: null,
    };
  } catch {
    return emptyDraft;
  }
}

export default function Onboarding() {
  const navigate = useNavigate();
  const record = trpc.onboarding.get.useQuery();
  const families = trpc.taxonomy.listFamilies.useQuery();
  const industries = trpc.taxonomy.listIndustries.useQuery();
  const [draft, setDraft] = useState<CareerDraft>(readLocalDraft);
  const [titleForResolution, setTitleForResolution] = useState(draft.selfDescribedTitle ?? '');
  const [ownTitleMode, setOwnTitleMode] = useState(Boolean(draft.selfDescribedTitle));
  const [confirming, setConfirming] = useState(false);
  const saveDraft = trpc.onboarding.saveCareerDraft.useMutation();
  const confirmCareer = trpc.onboarding.confirmCareer.useMutation();
  const skipCareer = trpc.onboarding.skipCareer.useMutation();
  const confirmSituation = trpc.onboarding.confirmSituation.useMutation({
    onSuccess: () => { void record.refetch(); },
    onError: () => toast.error(t('global.error.generic.body')),
  });
  const roles = trpc.taxonomy.listRoles.useQuery(
    { familyId: draft.familyId ?? EMPTY_UUID },
    { enabled: Boolean(draft.familyId) },
  );
  const resolution = trpc.taxonomy.resolveTitle.useQuery(
    { title: titleForResolution },
    { enabled: ownTitleMode && Boolean(titleForResolution.trim()) },
  );

  useEffect(() => {
    const serverDraft = record.data?.careerDraft;
    if (serverDraft && typeof serverDraft === 'object') {
      setDraft({ ...emptyDraft, ...(serverDraft as Partial<CareerDraft>) });
    }
  }, [record.data?.careerDraft]);

  useEffect(() => {
    if (!record.isSuccess) return;
    localStorage.setItem(LOCAL_DRAFT_KEY, JSON.stringify(draft));
    const timer = window.setTimeout(() => saveDraft.mutate(draft), 500);
    return () => window.clearTimeout(timer);
  }, [draft, record.isSuccess]); // saveDraft is stable for the mounted tRPC hook

  useEffect(() => {
    const timer = window.setTimeout(() => setTitleForResolution(draft.selfDescribedTitle ?? ''), 500);
    return () => window.clearTimeout(timer);
  }, [draft.selfDescribedTitle]);

  const selected = useMemo(() => {
    const family = families.data?.find((item) => item.id === draft.familyId);
    const role = roles.data?.find((item) => item.id === draft.roleId)
      ?? resolution.data?.candidates.find((item) => item.id === draft.roleId);
    const target = roles.data?.find((item) => item.id === draft.targetRoleId);
    const industry = industries.data?.find((item) => item.id === draft.industryId);
    return { family, role, target, industry };
  }, [draft, families.data, industries.data, resolution.data, roles.data]);

  const destination = destinationForGoals((record.data?.intentions ?? []) as IntentionSlug[]);

  const finish = async () => {
    try {
      await confirmCareer.mutateAsync(draft);
      localStorage.removeItem(LOCAL_DRAFT_KEY);
      navigate(destination);
    } catch (error) {
      console.error('Failed to confirm career context', error);
      toast.error(t('global.error.generic.body'));
    }
  };

  const skip = async () => {
    try {
      await skipCareer.mutateAsync();
      localStorage.removeItem(LOCAL_DRAFT_KEY);
      navigate(destination);
    } catch (error) {
      console.error('Failed to skip career context', error);
      toast.error(t('global.error.generic.body'));
    }
  };

  if (record.isLoading || families.isLoading || industries.isLoading) {
    return <StateMessage title={t('global.state.loading')} />;
  }
  if (record.isError || families.isError || industries.isError) {
    return <StateMessage title={t('global.error.generic.title')} body={t('global.error.generic.body')} />;
  }

  // D-0102-1. Migration 0007 remapped the situations PDR-0014 retired. ONB-001
  // forbids silent reclassification, so the member is asked before Levav treats
  // the remap as their answer. This gates the career step because it is the first
  // authenticated surface they reach, and the value stays inert until answered.
  if (record.data?.situationInferred && record.data.employmentSituation) {
    return (
      <SituationConfirmation
        situation={record.data.employmentSituation}
        pending={confirmSituation.isPending}
        onConfirm={() => confirmSituation.mutate({})}
        onChange={(next) => confirmSituation.mutate({ employmentSituation: next })}
      />
    );
  }

  return (
    <main className="min-h-[calc(100dvh-72px)] px-4 py-8 pb-24 md:pb-12">
      <div className="mx-auto w-full max-w-2xl">
        <GlassCard className="p-4 sm:p-8" hover={false}>
          {!confirming ? (
            <section>
              <h1 className="font-display text-2xl font-bold text-white">{t('onboarding.career.title')}</h1>
              <p className="mb-6 mt-2 text-sm text-white/60">{t('onboarding.career.subtitle')}</p>

              <Field label={t('onboarding.career.family')}>
                <select value={draft.familyId ?? ''} onChange={(event) => setDraft({ ...draft, familyId: event.target.value || null, roleId: null, targetRoleId: null })}>
                  <option value="">{t('onboarding.career.family')}</option>
                  {families.data?.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
                </select>
              </Field>

              {!ownTitleMode && (
                <Field label={t('onboarding.career.role')}>
                  <select value={draft.roleId ?? ''} disabled={!draft.familyId} onChange={(event) => setDraft({ ...draft, roleId: event.target.value || null })}>
                    <option value="">{t('onboarding.career.role')}</option>
                    {roles.data?.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
                  </select>
                </Field>
              )}

              <button type="button" onClick={() => setOwnTitleMode(true)} className="mb-5 text-sm text-[#C6FF34]">
                {t('onboarding.career.owntitle.action')}
              </button>

              {ownTitleMode && (
                <Field label={t('onboarding.career.owntitle.label')} help={t('onboarding.career.owntitle.help')}>
                  <input value={draft.selfDescribedTitle ?? ''} onChange={(event) => setDraft({ ...draft, selfDescribedTitle: event.target.value })} />
                  {resolution.isFetching && <p className="mt-2 text-xs text-white/50">{t('global.state.loading')}</p>}
                  {resolution.data && (
                    <div className="mt-3 space-y-2">
                      <p className="text-sm font-medium text-white">{t('onboarding.career.candidates.title')}</p>
                      {resolution.data.candidates.map((candidate) => (
                        <button key={candidate.id} type="button" onClick={() => setDraft({ ...draft, familyId: candidate.familyId, roleId: candidate.id })}
                          className={`w-full rounded-xl border px-3 py-2 text-left text-sm ${draft.roleId === candidate.id ? 'border-[#C6FF34]/50 text-[#C6FF34]' : 'border-white/10 text-white/70'}`}>
                          {candidate.name} · {candidate.familyName}
                        </button>
                      ))}
                      {resolution.data.candidates.length === 0 && <p className="text-sm text-white/60">{t('onboarding.career.candidates.none')}</p>}
                      <button type="button" onClick={() => setDraft({ ...draft, familyId: null, roleId: null })} className="text-sm text-white/60">
                        {t('onboarding.career.candidates.reject')}
                      </button>
                    </div>
                  )}
                </Field>
              )}

              <Field label={t('onboarding.career.target')}>
                <select value={draft.targetRoleId ?? ''} disabled={!draft.familyId} onChange={(event) => setDraft({ ...draft, targetRoleId: event.target.value || null })}>
                  <option value="">{t('onboarding.career.target')}</option>
                  {roles.data?.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
                </select>
              </Field>

              <Field label={t('onboarding.career.industry')} help={t('onboarding.career.industry.help')}>
                <select value={draft.industryId ?? ''} onChange={(event) => setDraft({ ...draft, industryId: event.target.value || null })}>
                  <option value="">{t('onboarding.career.industry')}</option>
                  {industries.data?.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
                </select>
              </Field>

              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <button type="button" onClick={() => setConfirming(true)} className="btn-lime min-h-12 flex-1">{t('global.action.continue')}</button>
                <button type="button" onClick={skip} disabled={skipCareer.isPending} className="min-h-12 flex-1 rounded-xl border border-white/10 text-white/70">{t('onboarding.career.skip')}</button>
              </div>
            </section>
          ) : (
            <section>
              <h1 className="font-display text-2xl font-bold text-white">{t('onboarding.confirm.title')}</h1>
              <p className="mb-6 mt-2 text-sm text-white/60">{t('onboarding.confirm.body')}</p>
              <dl className="space-y-4 rounded-xl border border-white/10 p-4">
                <Summary label={t('onboarding.career.family')} value={selected.family?.name} />
                <Summary label={t('onboarding.career.role')} value={selected.role?.name} />
                <Summary label={t('onboarding.career.owntitle.label')} value={draft.selfDescribedTitle} />
                <Summary label={t('onboarding.career.target')} value={selected.target?.name} />
                <Summary label={t('onboarding.career.industry')} value={selected.industry?.name} />
              </dl>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <button type="button" onClick={finish} disabled={confirmCareer.isPending} className="btn-lime min-h-12 flex-1">
                  {confirmCareer.isPending ? <Loader2 className="mx-auto animate-spin" size={18} /> : t('onboarding.confirm.action')}
                </button>
                <button type="button" onClick={() => setConfirming(false)} className="min-h-12 flex-1 rounded-xl border border-white/10 text-white/70">{t('global.action.back')}</button>
              </div>
            </section>
          )}
        </GlassCard>
      </div>
    </main>
  );
}

function Field({ label, help, children }: { label: string; help?: string; children: React.ReactNode }) {
  return <label className="mb-5 block text-sm text-white"><span className="mb-2 block font-medium">{label}</span>{children}{help && <span className="mt-2 block text-xs text-white/50">{help}</span>}</label>;
}

function Summary({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null;
  return <div><dt className="text-xs text-white/45">{label}</dt><dd className="mt-1 text-sm text-white">{value}</dd></div>;
}

const SITUATION_LABELS = {
  employed: 'situation.employed',
  self_employed: 'situation.self_employed',
  running_organisation: 'situation.running_organisation',
  freelancing: 'situation.freelancing',
  studying: 'situation.studying',
  not_working: 'situation.not_working',
  career_break: 'situation.career_break',
} as const;

type SituationSlug = keyof typeof SITUATION_LABELS;

/**
 * D-0102-1. Shown only to members whose employment situation was remapped by
 * migration 0007. Confirming clears `situation_inferred`; choosing a different
 * option replaces the value. Either way the member has answered, which is what
 * ONB-001 requires before Levav treats a remap as a declaration.
 */
function SituationConfirmation({
  situation,
  pending,
  onConfirm,
  onChange,
}: {
  situation: SituationSlug;
  pending: boolean;
  onConfirm: () => void;
  onChange: (next: SituationSlug) => void;
}) {
  const [choice, setChoice] = useState<SituationSlug>(situation);
  const [changing, setChanging] = useState(false);

  return (
    <main className="min-h-[calc(100dvh-72px)] px-4 py-8 pb-24 md:pb-12">
      <div className="mx-auto w-full max-w-2xl">
        <GlassCard className="p-4 sm:p-8" hover={false}>
          <h1 className="font-display text-2xl font-bold text-white">
            {t('onboarding.situation.inferred.title')}
          </h1>
          <p className="mt-2 text-sm leading-6 text-white/60">
            {t('onboarding.situation.inferred.body', { situation: t(SITUATION_LABELS[situation]) })}
          </p>

          {changing && (
            <div className="mt-6">
              <label className="mb-2 block text-xs uppercase tracking-wider text-white/50" htmlFor="situation-choice">
                {t('onboarding.situation.title')}
              </label>
              <select
                id="situation-choice"
                value={choice}
                onChange={(event) => setChoice(event.target.value as SituationSlug)}
              >
                {(Object.keys(SITUATION_LABELS) as SituationSlug[]).map((slug) => (
                  <option key={slug} value={slug}>{t(SITUATION_LABELS[slug])}</option>
                ))}
              </select>
            </div>
          )}

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            {changing ? (
              <button type="button" disabled={pending} onClick={() => onChange(choice)}>
                {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : t('global.action.save')}
              </button>
            ) : (
              <>
                <button type="button" disabled={pending} onClick={onConfirm}>
                  {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : t('onboarding.situation.inferred.confirm')}
                </button>
                <button type="button" disabled={pending} onClick={() => setChanging(true)}>
                  {t('onboarding.situation.inferred.change')}
                </button>
              </>
            )}
          </div>
        </GlassCard>
      </div>
    </main>
  );
}

function StateMessage({ title, body }: { title: string; body?: string }) {
  return <main className="min-h-[60dvh] px-4 py-16"><GlassCard className="mx-auto max-w-lg p-6 text-center" hover={false}><h1 className="text-xl font-semibold text-white">{title}</h1>{body && <p className="mt-2 text-sm text-white/60">{body}</p>}</GlassCard></main>;
}
