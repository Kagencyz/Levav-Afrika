/**
 * Signup goals, personal statuses, and first-experience routing
 * (upgrade brief §3). The slugs must stay in sync with
 * server/routes/onboarding.ts — enforced by onboardingRouting.test.ts.
 */
import { t } from '@/copy';

export const PLATFORM_INTENTIONS = [
  { slug: 'develop', label: t('intent.develop') },
  { slug: 'find_work', label: t('intent.find_work') },
  { slug: 'find_quickwork', label: t('intent.find_quickwork') },
  { slug: 'learn', label: t('intent.learn') },
  { slug: 'contribute', label: t('intent.contribute') },
  { slug: 'network', label: t('intent.network') },
  { slug: 'hire', label: t('intent.hire') },
  { slug: 'post_quickwork', label: t('intent.post_quickwork') },
  { slug: 'represent_organisation', label: t('intent.represent_organisation') },
] as const;

export type IntentionSlug = (typeof PLATFORM_INTENTIONS)[number]['slug'];

export const PERSONAL_STATUSES = [
  { slug: 'employed', label: t('situation.employed') },
  { slug: 'self_employed', label: t('situation.self_employed') },
  { slug: 'running_organisation', label: t('situation.running_organisation') },
  { slug: 'freelancing', label: t('situation.freelancing') },
  { slug: 'studying', label: t('situation.studying') },
  { slug: 'not_working', label: t('situation.not_working') },
  { slug: 'career_break', label: t('situation.career_break') },
] as const;

export type StatusSlug = (typeof PERSONAL_STATUSES)[number]['slug'];

export const OPPORTUNITY_POSTURES = [
  { slug: 'actively_seeking', label: t('posture.actively_seeking') },
  { slug: 'open_to_opportunities', label: t('posture.open') },
  { slug: 'not_seeking', label: t('posture.not_seeking') },
] as const;

export type PostureSlug = (typeof OPPORTUNITY_POSTURES)[number]['slug'];

/**
 * First destination per primary goal (brief §3.3). Some target experiences
 * (employer setup, QuickWork client setup, organisation setup) don't exist
 * yet — those goals route to the closest existing page and will be upgraded
 * when their workspaces ship (brief §16 items 7 and 9).
 */
const GOAL_DESTINATIONS: Record<IntentionSlug, string> = {
  develop: '/levav28',
  find_work: '/opportunities',
  find_quickwork: '/quickwork',
  learn: '/learn',
  contribute: '/impact',
  network: '/dashboard',
  hire: '/employers',
  post_quickwork: '/quickwork',
  represent_organisation: '/employers',
};

export function isGoalSlug(value: string | null | undefined): value is IntentionSlug {
  return !!value && PLATFORM_INTENTIONS.some((g) => g.slug === value);
}

/** The first selected goal is the primary path (brief §3.1). */
export function derivePrimaryGoal(goals: IntentionSlug[]): IntentionSlug | null {
  return goals.length > 0 ? goals[0] : null;
}

/** Route for the user's first experience after preference selection. */
export function destinationForGoals(goals: IntentionSlug[]): string {
  const primary = derivePrimaryGoal(goals);
  if (!primary) return '/dashboard';
  return GOAL_DESTINATIONS[primary];
}
