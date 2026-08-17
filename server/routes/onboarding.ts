import { TRPCError } from '@trpc/server';
import { and, eq } from 'drizzle-orm';
import { z } from 'zod';
import { router, authedProcedure } from '../trpc.js';
import { db } from '../../db/connection.js';
import {
  careerFamilies,
  careerRoles,
  industries,
  userOnboarding,
} from '../../db/schema.js';

export const INTENTION_SLUGS = [
  'develop',
  'find_work',
  'find_quickwork',
  'learn',
  'contribute',
  'network',
  'hire',
  'post_quickwork',
  'represent_organisation',
] as const;

export const SITUATION_SLUGS = [
  'employed',
  'self_employed',
  'running_organisation',
  'freelancing',
  'studying',
  'not_working',
  'career_break',
] as const;

export const POSTURE_SLUGS = [
  'actively_seeking',
  'open_to_opportunities',
  'not_seeking',
] as const;

const senioritySchema = z.enum(['entry', 'mid', 'senior', 'lead', 'executive']);
const workModeSchema = z.enum(['remote', 'hybrid', 'on_site']);

const careerInput = z.object({
  familyId: z.string().uuid().nullable().default(null),
  roleId: z.string().uuid().nullable().default(null),
  selfDescribedTitle: z.string().max(180).nullable().default(null),
  targetRoleId: z.string().uuid().nullable().default(null),
  seniority: senioritySchema.nullable().default(null),
  industryId: z.string().uuid().nullable().default(null),
  workMode: workModeSchema.nullable().default(null),
}).strict();

type CareerInput = z.infer<typeof careerInput>;

function emitOnboardingEvent(event: string, safePayload: Record<string, boolean | number | string> = {}) {
  console.info(JSON.stringify({ event, ...safePayload }));
}

async function loadOwnRecord(userId: string) {
  const rows = await db
    .select()
    .from(userOnboarding)
    .where(eq(userOnboarding.userId, userId))
    .limit(1);
  return rows[0] ?? null;
}

async function validateCareerSelection(tx: Pick<typeof db, 'select'>, input: CareerInput) {
  let role: typeof careerRoles.$inferSelect | null = null;
  let family: typeof careerFamilies.$inferSelect | null = null;

  if (input.roleId) {
    const rows = await tx
      .select()
      .from(careerRoles)
      .where(and(eq(careerRoles.id, input.roleId), eq(careerRoles.active, true)))
      .limit(1);
    role = rows[0] ?? null;
    if (!role) throw new TRPCError({ code: 'BAD_REQUEST', message: 'Inactive career role' });
    if (!input.familyId || role.familyId !== input.familyId) {
      throw new TRPCError({ code: 'BAD_REQUEST', message: 'Role does not belong to family' });
    }
  }

  if (input.familyId) {
    const rows = await tx
      .select()
      .from(careerFamilies)
      .where(and(eq(careerFamilies.id, input.familyId), eq(careerFamilies.active, true)))
      .limit(1);
    family = rows[0] ?? null;
    if (!family) throw new TRPCError({ code: 'BAD_REQUEST', message: 'Inactive career family' });
  }

  if (input.targetRoleId) {
    const rows = await tx
      .select()
      .from(careerRoles)
      .where(and(eq(careerRoles.id, input.targetRoleId), eq(careerRoles.active, true)))
      .limit(1);
    if (!rows[0]) throw new TRPCError({ code: 'BAD_REQUEST', message: 'Inactive target role' });
  }

  if (input.industryId) {
    const rows = await tx
      .select()
      .from(industries)
      .where(and(eq(industries.id, input.industryId), eq(industries.active, true)))
      .limit(1);
    if (!rows[0]) throw new TRPCError({ code: 'BAD_REQUEST', message: 'Inactive industry' });
  }

  return Math.max(role?.version ?? 0, family?.version ?? 0) || null;
}

export const onboardingRouter = router({
  complete: authedProcedure
    .input(z.object({
      intentions: z.array(z.enum(INTENTION_SLUGS)).max(INTENTION_SLUGS.length).default([]),
      employmentSituation: z.enum(SITUATION_SLUGS).nullable().default(null),
      opportunityPosture: z.enum(POSTURE_SLUGS).nullable().default(null),
    }).strict())
    .mutation(async ({ ctx, input }) => {
      const intentions = [...new Set(input.intentions)];
      const now = new Date();
      const values = {
        intentions,
        primaryIntention: intentions[0] ?? null,
        employmentSituation: input.employmentSituation,
        situationInferred: false,
        situationConfirmedAt: input.employmentSituation ? now : null,
        opportunityPosture: input.opportunityPosture,
        currentStep: 'career',
        updatedAt: now,
      } as const;
      const existing = await loadOwnRecord(ctx.user.userId);
      const result = existing
        ? (await db.update(userOnboarding).set(values)
            .where(eq(userOnboarding.userId, ctx.user.userId)).returning())[0]
        : (await db.insert(userOnboarding).values({ userId: ctx.user.userId, ...values }).returning())[0];

      emitOnboardingEvent('onboarding.intentions.set', {
        count: intentions.length,
        multiple: intentions.length > 1,
      });
      if (input.employmentSituation) emitOnboardingEvent('onboarding.situation.set');
      if (input.opportunityPosture) emitOnboardingEvent('onboarding.posture.set');
      emitOnboardingEvent('onboarding.step.completed', { step: 'preferences' });
      return result;
    }),

  saveCareerDraft: authedProcedure
    .input(careerInput)
    .mutation(async ({ ctx, input }) => {
      const existing = await loadOwnRecord(ctx.user.userId);
      const values = { careerDraft: input, currentStep: 'career', updatedAt: new Date() };
      if (existing) {
        const [updated] = await db.update(userOnboarding).set(values)
          .where(eq(userOnboarding.userId, ctx.user.userId)).returning();
        return updated;
      }
      const [created] = await db.insert(userOnboarding)
        .values({ userId: ctx.user.userId, ...values }).returning();
      return created;
    }),

  confirmCareer: authedProcedure
    .input(careerInput)
    .mutation(({ ctx, input }) => db.transaction(async (tx) => {
      const taxonomyVersion = await validateCareerSelection(tx, input);
      const values = {
        careerFamilyId: input.familyId,
        careerRoleId: input.roleId,
        selfDescribedTitle: input.selfDescribedTitle,
        targetRoleId: input.targetRoleId,
        seniority: input.seniority,
        industryId: input.industryId,
        workMode: input.workMode,
        taxonomyVersion,
        careerDraft: null,
        careerConfirmedAt: new Date(),
        currentStep: 'complete',
        completedAt: new Date(),
        updatedAt: new Date(),
      };
      const existingRows = await tx.select({ id: userOnboarding.id }).from(userOnboarding)
        .where(eq(userOnboarding.userId, ctx.user.userId)).limit(1);
      const result = existingRows.length
        ? (await tx.update(userOnboarding).set(values)
            .where(eq(userOnboarding.userId, ctx.user.userId)).returning())[0]
        : (await tx.insert(userOnboarding)
            .values({ userId: ctx.user.userId, ...values }).returning())[0];
      emitOnboardingEvent('onboarding.step.completed', { step: 'career' });
      emitOnboardingEvent('onboarding.completed', {
        careerProvided: Boolean(input.roleId || input.selfDescribedTitle),
        situationSpecified: Boolean(result?.employmentSituation),
        postureSpecified: Boolean(result?.opportunityPosture),
      });
      return result;
    })),

  skipCareer: authedProcedure.mutation(async ({ ctx }) => {
    const now = new Date();
    const existing = await loadOwnRecord(ctx.user.userId);
    const values = { careerDraft: null, currentStep: 'complete', completedAt: now, updatedAt: now };
    const result = existing
      ? (await db.update(userOnboarding).set(values)
          .where(eq(userOnboarding.userId, ctx.user.userId)).returning())[0]
      : (await db.insert(userOnboarding).values({ userId: ctx.user.userId, ...values }).returning())[0];
    emitOnboardingEvent('onboarding.career.skipped');
    emitOnboardingEvent('onboarding.completed', {
      careerProvided: false,
      situationSpecified: Boolean(result?.employmentSituation),
      postureSpecified: Boolean(result?.opportunityPosture),
    });
    return result;
  }),

  get: authedProcedure.input(z.void()).query(({ ctx }) => loadOwnRecord(ctx.user.userId)),
});
