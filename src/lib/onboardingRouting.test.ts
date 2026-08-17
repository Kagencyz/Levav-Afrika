import { describe, it, expect } from 'vitest';
import {
  PLATFORM_INTENTIONS,
  PERSONAL_STATUSES,
  OPPORTUNITY_POSTURES,
  derivePrimaryGoal,
  destinationForGoals,
  isGoalSlug,
  type IntentionSlug,
} from './onboardingRouting';
import { INTENTION_SLUGS, POSTURE_SLUGS, SITUATION_SLUGS } from '../../server/routes/onboarding';

describe('slug sync with server', () => {
  it('frontend goal slugs match the server enum exactly', () => {
    expect(PLATFORM_INTENTIONS.map((g) => g.slug).sort()).toEqual([...INTENTION_SLUGS].sort());
  });

  it('frontend status slugs match the server enum exactly', () => {
    expect(PERSONAL_STATUSES.map((s) => s.slug).sort()).toEqual([...SITUATION_SLUGS].sort());
  });

  it('frontend posture slugs match the server enum exactly', () => {
    expect(OPPORTUNITY_POSTURES.map((s) => s.slug).sort()).toEqual([...POSTURE_SLUGS].sort());
  });
});

describe('primary goal derivation', () => {
  it('first selected goal is primary', () => {
    expect(derivePrimaryGoal(['hire', 'develop'])).toBe('hire');
  });

  it('empty selection has no primary', () => {
    expect(derivePrimaryGoal([])).toBeNull();
  });
});

describe('destination routing', () => {
  it('routes every goal somewhere real', () => {
    for (const goal of PLATFORM_INTENTIONS) {
      const dest = destinationForGoals([goal.slug]);
      expect(dest, `destination for ${goal.slug}`).toMatch(/^\//);
    }
  });

  it('routes by the primary (first) goal, ignoring later ones', () => {
    expect(destinationForGoals(['develop', 'hire'])).toBe('/levav28');
    expect(destinationForGoals(['hire', 'develop'])).toBe('/employers');
  });

  it('falls back to dashboard with no goals', () => {
    expect(destinationForGoals([] as IntentionSlug[])).toBe('/dashboard');
  });
});

describe('isGoalSlug', () => {
  it('accepts known slugs and rejects unknowns', () => {
    expect(isGoalSlug('find_work')).toBe(true);
    expect(isGoalSlug('not-a-goal')).toBe(false);
    expect(isGoalSlug(null)).toBe(false);
  });
});
