/**
 * Signup goals, personal statuses, and first-experience routing
 * (upgrade brief §3). The slugs must stay in sync with
 * server/routes/onboarding.ts — enforced by onboardingRouting.test.ts.
 */
import { t } from '@/copy';

export const SIGNUP_GOALS = [
  { slug: 'develop', label: t('intent.develop') },
  { slug: 'find-job', label: t('intent.find_work') },
  { slug: 'find-quickwork', label: t('intent.find_quickwork') },
  { slug: 'hire', label: t('intent.hire') },
  { slug: 'post-quickwork', label: t('intent.post_quickwork') },
  { slug: 'find-volunteer', label: t('intent.contribute') },
  { slug: 'post-volunteer', label: t('intent.post_contribution') },
  { slug: 'learn', label: t('intent.learn') },
  { slug: 'community', label: t('intent.network') },
] as const;

export type GoalSlug = (typeof SIGNUP_GOALS)[number]['slug'];

export const PERSONAL_STATUSES = [
  { slug: 'employed', label: t('situation.employed') },
  { slug: 'unemployed', label: t('situation.not_working') },
  { slug: 'self_employed', label: t('situation.self_employed') },
  { slug: 'freelancing', label: t('situation.freelancing') },
  { slug: 'studying', label: t('situation.studying') },
  { slug: 'volunteering', label: t('situation.legacy.volunteering') },
  { slug: 'changing_careers', label: t('situation.legacy.changing_careers') },
  { slug: 'returning_to_work', label: t('situation.career_break') },
  { slug: 'running_organization', label: t('situation.running_organisation') },
] as const;

export type StatusSlug = (typeof PERSONAL_STATUSES)[number]['slug'];

/**
 * First destination per primary goal (brief §3.3). Some target experiences
 * (employer setup, QuickWork client setup, organisation setup) don't exist
 * yet — those goals route to the closest existing page and will be upgraded
 * when their workspaces ship (brief §16 items 7 and 9).
 */
const GOAL_DESTINATIONS: Record<GoalSlug, string> = {
  develop: '/levav28',
  'find-job': '/onboarding',
  'find-quickwork': '/quickwork',
  hire: '/employers',
  'post-quickwork': '/quickwork',
  'find-volunteer': '/impact',
  'post-volunteer': '/impact',
  learn: '/learn',
  community: '/dashboard',
};

export function isGoalSlug(value: string | null | undefined): value is GoalSlug {
  return !!value && SIGNUP_GOALS.some((g) => g.slug === value);
}

/** The first selected goal is the primary path (brief §3.1). */
export function derivePrimaryGoal(goals: GoalSlug[]): GoalSlug | null {
  return goals.length > 0 ? goals[0] : null;
}

/** Route for the user's first experience after preference selection. */
export function destinationForGoals(goals: GoalSlug[]): string {
  const primary = derivePrimaryGoal(goals);
  if (!primary) return '/dashboard';
  return GOAL_DESTINATIONS[primary];
}
