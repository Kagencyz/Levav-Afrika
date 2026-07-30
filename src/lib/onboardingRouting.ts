/**
 * Signup goals, personal statuses, and first-experience routing
 * (upgrade brief §3). The slugs must stay in sync with
 * server/routes/onboarding.ts — enforced by onboardingRouting.test.ts.
 */

export const SIGNUP_GOALS = [
  { slug: 'develop', label: 'Develop myself professionally', desc: 'Grow through a Levav 28™ pathway built for you' },
  { slug: 'find-job', label: 'Find a full-time or part-time job', desc: 'Verified roles matched to your profile' },
  { slug: 'find-quickwork', label: 'Find QuickWork™ or freelance gigs', desc: 'Stay active and earning with project work' },
  { slug: 'hire', label: 'Hire talent for an organisation', desc: 'Workforce-ready people with real evidence' },
  { slug: 'post-quickwork', label: 'Post a quick job or gig', desc: 'Get matched with capable talent fast' },
  { slug: 'find-volunteer', label: 'Find volunteer opportunities', desc: 'Serve, contribute, and build experience' },
  { slug: 'post-volunteer', label: 'Post volunteer opportunities', desc: 'For verified organisations offering service roles' },
  { slug: 'learn', label: 'Learn through courses and programmes', desc: 'Close real skill gaps with guided learning' },
  { slug: 'community', label: 'Build my professional network', desc: 'Follow, share, and grow with professionals' },
] as const;

export type GoalSlug = (typeof SIGNUP_GOALS)[number]['slug'];

export const PERSONAL_STATUSES = [
  { slug: 'employed', label: 'Employed' },
  { slug: 'unemployed', label: 'Unemployed' },
  { slug: 'self_employed', label: 'Self-employed' },
  { slug: 'freelancing', label: 'Freelancing' },
  { slug: 'studying', label: 'Studying' },
  { slug: 'volunteering', label: 'Volunteering' },
  { slug: 'changing_careers', label: 'Changing careers' },
  { slug: 'returning_to_work', label: 'Returning to work' },
  { slug: 'running_organization', label: 'Running an organisation or business' },
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
