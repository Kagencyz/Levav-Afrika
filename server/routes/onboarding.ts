import { z } from 'zod';
import { eq } from 'drizzle-orm';
import { router, authedProcedure } from '../trpc.js';
import { db } from '../../db/connection.js';
import { userOnboarding } from '../../db/schema.js';

// Canonical goal slugs (upgrade brief §3.1). Must stay in sync with
// SIGNUP_GOALS in src/lib/onboardingRouting.ts — enforced by
// src/lib/onboardingRouting.test.ts.
export const GOAL_SLUGS = [
  'develop',
  'find-job',
  'find-quickwork',
  'hire',
  'post-quickwork',
  'find-volunteer',
  'post-volunteer',
  'learn',
  'community',
] as const;

// Personal statuses (upgrade brief §3.2) — mirrors personalStatusEnum in
// db/schema.ts.
export const STATUS_SLUGS = [
  'employed',
  'unemployed',
  'self_employed',
  'freelancing',
  'studying',
  'volunteering',
  'changing_careers',
  'returning_to_work',
  'running_organization',
] as const;

export const onboardingRouter = router({
  // Save (or re-save) the user's signup goals and personal status.
  complete: authedProcedure
    .input(
      z.object({
        goals: z.array(z.enum(GOAL_SLUGS)).min(1).max(GOAL_SLUGS.length),
        personalStatus: z.enum(STATUS_SLUGS),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // De-dupe while preserving selection order; first goal is primary.
      const goals = [...new Set(input.goals)];
      const primaryGoal = goals[0];

      const existing = await db
        .select({ id: userOnboarding.id })
        .from(userOnboarding)
        .where(eq(userOnboarding.userId, ctx.user.userId))
        .limit(1);

      if (existing.length > 0) {
        const [updated] = await db
          .update(userOnboarding)
          .set({
            goals,
            primaryGoal,
            personalStatus: input.personalStatus,
            updatedAt: new Date(),
          })
          .where(eq(userOnboarding.userId, ctx.user.userId))
          .returning();
        return updated;
      }

      const [created] = await db
        .insert(userOnboarding)
        .values({
          userId: ctx.user.userId,
          goals,
          primaryGoal,
          personalStatus: input.personalStatus,
        })
        .returning();
      return created;
    }),

  // The caller's own onboarding record, or null if not yet completed.
  get: authedProcedure.query(async ({ ctx }) => {
    const rows = await db
      .select()
      .from(userOnboarding)
      .where(eq(userOnboarding.userId, ctx.user.userId))
      .limit(1);
    return rows[0] ?? null;
  }),
});
