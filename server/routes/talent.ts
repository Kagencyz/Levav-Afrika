import { z } from 'zod';
import { eq, like, and, count } from 'drizzle-orm';
import { router, publicProcedure, authedProcedure, adminProcedure } from '../trpc.js';
import { db } from '../../db/connection.js';
import { talents } from '../../db/schema.js';

export const talentRouter = router({
  list: publicProcedure
    .input(
      z
        .object({
          search: z.string().optional(),
          category: z.string().optional(),
          page: z.number().min(1).default(1),
          limit: z.number().min(1).max(100).default(12),
        })
        .optional()
    )
    .query(async ({ input }) => {
      const page = input?.page ?? 1;
      const limit = input?.limit ?? 12;
      const search = input?.search;
      const category = input?.category;
      const offset = (page - 1) * limit;

      const conditions = [];
      if (search) {
        conditions.push(like(talents.name, `%${search}%`));
      }
      if (category) {
        conditions.push(eq(talents.category, category));
      }

      const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

      const [rows, totalResult] = await Promise.all([
        db
          .select()
          .from(talents)
          .where(whereClause)
          .limit(limit)
          .offset(offset)
          .orderBy(talents.createdAt),
        db
          .select({ value: count() })
          .from(talents)
          .where(whereClause),
      ]);

      const total = totalResult[0]?.value ?? 0;
      const pages = Math.ceil(total / limit);

      return {
        talents: rows,
        total,
        pages,
      };
    }),

  getById: publicProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ input }) => {
      const rows = await db
        .select()
        .from(talents)
        .where(eq(talents.id, input.id))
        .limit(1);

      if (rows.length === 0) {
        return null;
      }

      return rows[0];
    }),

  getOwnProfile: authedProcedure.query(async ({ ctx }) => {
    const rows = await db
      .select()
      .from(talents)
      .where(eq(talents.userId, ctx.user.userId))
      .limit(1);

    return rows[0] ?? null;
  }),

  create: authedProcedure
    .input(
      z.object({
        name: z.string().min(1),
        bio: z.string().min(1),
        category: z.string().min(1),
        skills: z.array(z.string()),
        location: z.string().min(1),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const [newTalent] = await db
        .insert(talents)
        .values({
          userId: ctx.user.userId,
          name: input.name,
          bio: input.bio,
          category: input.category,
          skills: input.skills,
          location: input.location,
        })
        .returning();

      return newTalent;
    }),

  update: authedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        name: z.string().min(1).optional(),
        bio: z.string().min(1).optional(),
        category: z.string().min(1).optional(),
        skills: z.array(z.string()).optional(),
        location: z.string().min(1).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...updates } = input;

      const existing = await db
        .select()
        .from(talents)
        .where(eq(talents.id, id))
        .limit(1);

      if (existing.length === 0) {
        throw new Error('Talent not found');
      }

      // Only allow update if admin or owner
      if (
        existing[0].userId !== ctx.user.userId &&
        ctx.user.accessLevel !== 'admin'
      ) {
        throw new Error('FORBIDDEN');
      }

      const [updated] = await db
        .update(talents)
        .set({
          ...updates,
          skills: updates.skills ?? existing[0].skills,
          updatedAt: new Date(),
        })
        .where(eq(talents.id, id))
        .returning();

      return updated;
    }),

  delete: adminProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ input }) => {
      await db.delete(talents).where(eq(talents.id, input.id));
      return { success: true };
    }),
});
