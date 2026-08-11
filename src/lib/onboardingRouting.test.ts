import { describe, it, expect } from 'vitest';
import {
  SIGNUP_GOALS,
  PERSONAL_STATUSES,
  derivePrimaryGoal,
  destinationForGoals,
  isGoalSlug,
  type GoalSlug,
} from './onboardingRouting';
import { GOAL_SLUGS, STATUS_SLUGS } from '../../server/routes/onboarding';

describe('slug sync with server', () => {
  it('frontend goal slugs match the server enum exactly', () => {
    expect(SIGNUP_GOALS.map((g) => g.slug).sort()).toEqual([...GOAL_SLUGS].sort());
  });

  it('frontend status slugs match the server enum exactly', () => {
    expect(PERSONAL_STATUSES.map((s) => s.slug).sort()).toEqual([...STATUS_SLUGS].sort());
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
    for (const goal of SIGNUP_GOALS) {
      const dest = destinationForGoals([goal.slug]);
      expect(dest, `destination for ${goal.slug}`).toMatch(/^\//);
    }
  });

  it('routes by the primary (first) goal, ignoring later ones', () => {
    expect(destinationForGoals(['develop', 'hire'])).toBe('/levav28');
    expect(destinationForGoals(['hire', 'develop'])).toBe('/employers');
  });

  it('falls back to dashboard with no goals', () => {
    expect(destinationForGoals([] as GoalSlug[])).toBe('/dashboard');
  });
});

describe('isGoalSlug', () => {
  it('accepts known slugs and rejects unknowns', () => {
    expect(isGoalSlug('find-job')).toBe(true);
    expect(isGoalSlug('not-a-goal')).toBe(false);
    expect(isGoalSlug(null)).toBe(false);
  });
});
