import { TRPCError } from '@trpc/server';
import { and, asc, eq, sql } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '../../db/connection.js';
import {
  careerFamilies,
  careerRoles,
  industries,
  roleAliases,
  taxonomyAuditLog,
} from '../../db/schema.js';
import { adminProcedure, publicProcedure, router } from '../trpc.js';
import { clientIpForSession } from '../context.js';

const TITLE_MAX_LENGTH = 180;
const RESOLVE_LIMIT = 30;
const RESOLVE_WINDOW_MS = 60_000;

type RateBucket = { count: number; resetsAt: number };
const resolveBuckets = new Map<string, RateBucket>();

export function normalizeCareerTitle(value: string): string {
  return value
    .normalize('NFKC')
    .toLocaleLowerCase('en')
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .trim()
    .replace(/\s+/g, ' ');
}

function enforceResolveRateLimit(clientIp = 'unknown') {
  const now = Date.now();
  const bucket = resolveBuckets.get(clientIp);
  if (!bucket || bucket.resetsAt <= now) {
    resolveBuckets.set(clientIp, { count: 1, resetsAt: now + RESOLVE_WINDOW_MS });
    return;
  }
  if (bucket.count >= RESOLVE_LIMIT) {
    throw new TRPCError({ code: 'TOO_MANY_REQUESTS' });
  }
  bucket.count += 1;
}

type CandidateRow = {
  id: string;
  name: string;
  slug: string;
  seniority: 'entry' | 'mid' | 'senior' | 'lead' | 'executive';
  familyId: string;
  familyName: string;
  score: number;
};

export async function resolveTitleCandidates(title: string): Promise<CandidateRow[]> {
  const normalized = normalizeCareerTitle(title);
  if (!normalized) return [];

  const result = await db.execute<CandidateRow>(sql`
    SELECT
      role.id,
      role.name,
      role.slug,
      role.seniority,
      family.id AS "familyId",
      family.name AS "familyName",
      MAX(
        CASE
          WHEN alias.normalized_alias = ${normalized} THEN 1.0
          WHEN lower(role.name) = ${normalized} THEN 0.98
          ELSE GREATEST(
            similarity(COALESCE(alias.normalized_alias, ''), ${normalized}),
            similarity(lower(role.name), ${normalized})
          )
        END
      )::float8 AS score
    FROM career_roles role
    JOIN career_families family ON family.id = role.family_id
    LEFT JOIN role_aliases alias ON alias.role_id = role.id AND alias.active = true
    WHERE role.active = true AND family.active = true
    GROUP BY role.id, role.name, role.slug, role.seniority, family.id, family.name
    HAVING MAX(
      CASE
        WHEN alias.normalized_alias = ${normalized} THEN 1.0
        WHEN lower(role.name) = ${normalized} THEN 0.98
        ELSE GREATEST(
          similarity(COALESCE(alias.normalized_alias, ''), ${normalized}),
          similarity(lower(role.name), ${normalized})
        )
      END
    ) >= 0.35
    ORDER BY score DESC, role.name ASC
    LIMIT 5
  `);

  return result.rows;
}

export const taxonomyRouter = router({
  listFamilies: publicProcedure.query(() =>
    db
      .select()
      .from(careerFamilies)
      .where(eq(careerFamilies.active, true))
      .orderBy(asc(careerFamilies.name)),
  ),

  listRoles: publicProcedure
    .input(z.object({ familyId: z.string().uuid() }))
    .query(({ input }) =>
      db
        .select()
        .from(careerRoles)
        .where(and(eq(careerRoles.familyId, input.familyId), eq(careerRoles.active, true)))
        .orderBy(asc(careerRoles.name)),
    ),

  listIndustries: publicProcedure.query(() =>
    db
      .select()
      .from(industries)
      .where(eq(industries.active, true))
      .orderBy(asc(industries.name)),
  ),

  resolveTitle: publicProcedure
    .input(z.object({
      title: z.string()
        .min(1)
        .max(TITLE_MAX_LENGTH)
        .refine((value) => value.trim().length > 0, 'Title cannot be blank'),
    }))
    .query(async ({ ctx, input }) => {
      enforceResolveRateLimit(clientIpForSession(ctx.session));
      const normalizedTitle = normalizeCareerTitle(input.title);
      const candidates = await resolveTitleCandidates(input.title);
      if (candidates.length === 0) {
        console.info(JSON.stringify({
          event: 'taxonomy.title.unresolved',
          title: normalizedTitle,
        }));
      }
      return { ownTitle: input.title, normalizedTitle, candidates };
    }),

  createFamily: adminProcedure
    .input(z.object({
      slug: z.string().trim().min(2).max(100),
      name: z.string().trim().min(2).max(160),
    }))
    .mutation(({ ctx, input }) => db.transaction(async (tx) => {
      const [created] = await tx.insert(careerFamilies).values(input).returning();
      if (!created) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR' });
      await tx.insert(taxonomyAuditLog).values({
        actorUserId: ctx.user.userId,
        action: 'taxonomy.family.created',
        entityType: 'career_family',
        entityId: created.id,
        before: null,
        after: created,
      });
      return created;
    })),

  createIndustry: adminProcedure
    .input(z.object({
      slug: z.string().trim().min(2).max(120),
      name: z.string().trim().min(2).max(180),
    }))
    .mutation(({ ctx, input }) => db.transaction(async (tx) => {
      const [created] = await tx.insert(industries).values(input).returning();
      if (!created) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR' });
      await tx.insert(taxonomyAuditLog).values({
        actorUserId: ctx.user.userId,
        action: 'taxonomy.industry.created',
        entityType: 'industry',
        entityId: created.id,
        before: null,
        after: created,
      });
      return created;
    })),

  createRole: adminProcedure
    .input(z.object({
      familyId: z.string().uuid(),
      slug: z.string().trim().min(2).max(120),
      name: z.string().trim().min(2).max(180),
      seniority: z.enum(['entry', 'mid', 'senior', 'lead', 'executive']),
    }))
    .mutation(({ ctx, input }) => db.transaction(async (tx) => {
      const [created] = await tx.insert(careerRoles).values(input).returning();
      if (!created) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR' });
      await tx.insert(taxonomyAuditLog).values({
        actorUserId: ctx.user.userId,
        action: 'taxonomy.role.created',
        entityType: 'career_role',
        entityId: created.id,
        before: null,
        after: created,
      });
      return created;
    })),

  createAlias: adminProcedure
    .input(z.object({
      roleId: z.string().uuid(),
      alias: z.string().trim().min(1).max(TITLE_MAX_LENGTH),
      language: z.string().trim().min(2).max(20).default('en'),
      region: z.string().trim().min(2).max(80).nullable().default(null),
    }))
    .mutation(({ ctx, input }) => db.transaction(async (tx) => {
      const [created] = await tx.insert(roleAliases).values({
        ...input,
        normalizedAlias: normalizeCareerTitle(input.alias),
      }).returning();
      if (!created) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR' });
      await tx.insert(taxonomyAuditLog).values({
        actorUserId: ctx.user.userId,
        action: 'taxonomy.alias.created',
        entityType: 'role_alias',
        entityId: created.id,
        before: null,
        after: created,
      });
      return created;
    })),

  supersedeRole: adminProcedure
    .input(z.object({
      roleId: z.string().uuid(),
      slug: z.string().trim().min(2).max(120),
      name: z.string().trim().min(2).max(180),
      seniority: z.enum(['entry', 'mid', 'senior', 'lead', 'executive']),
    }))
    .mutation(({ ctx, input }) => db.transaction(async (tx) => {
      const [before] = await tx
        .select()
        .from(careerRoles)
        .where(eq(careerRoles.id, input.roleId))
        .limit(1);

      if (!before) throw new TRPCError({ code: 'NOT_FOUND' });

      await tx
        .update(careerRoles)
        .set({ active: false })
        .where(eq(careerRoles.id, before.id));

      const [after] = await tx
        .insert(careerRoles)
        .values({
          familyId: before.familyId,
          slug: input.slug,
          name: input.name,
          seniority: input.seniority,
          version: before.version + 1,
          active: true,
          supersedesId: before.id,
        })
        .returning();

      if (!after) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR' });

      await tx.insert(taxonomyAuditLog).values({
        actorUserId: ctx.user.userId,
        action: 'taxonomy.role.superseded',
        entityType: 'career_role',
        entityId: after.id,
        before,
        after,
      });

      return after;
    })),
});
