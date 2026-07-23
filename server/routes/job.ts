import { z } from 'zod';
import { eq, like, and, count, desc } from 'drizzle-orm';
import { router, publicProcedure, authedProcedure, adminProcedure } from '../router';
import { db } from '../../db/connection';
import { jobs, employers } from '../../db/schema';

export const jobRouter = router({
  // List jobs with search/filter
  list: publicProcedure
    .input(
      z.object({
        search: z.string().optional(),
        type: z.string().optional(),
        location: z.string().optional(),
        page: z.number().min(1).default(1),
        limit: z.number().min(1).max(50).default(10),
      }).optional()
    )
    .query(async ({ input }) => {
      const page = input?.page ?? 1;
      const limit = input?.limit ?? 10;
      const offset = (page - 1) * limit;

      const conditions = [];
      if (input?.search) {
        conditions.push(like(jobs.title, `%${input.search}%`));
      }
      if (input?.type) {
        conditions.push(eq(jobs.type, input.type));
      }
      if (input?.location) {
        conditions.push(like(jobs.location, `%${input.location}%`));
      }
      // Only show active jobs publicly
      conditions.push(eq(jobs.status, 'active'));

      const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

      const [rows, totalResult] = await Promise.all([
        db.select().from(jobs).where(whereClause).limit(limit).offset(offset).orderBy(desc(jobs.createdAt)),
        db.select({ value: count() }).from(jobs).where(whereClause),
      ]);

      return {
        jobs: rows,
        total: totalResult[0]?.value ?? 0,
        pages: Math.ceil((totalResult[0]?.value ?? 0) / limit),
      };
    }),

  // Get single job
  getById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const rows = await db.select().from(jobs).where(eq(jobs.id, input.id)).limit(1);
      return rows[0] ?? null;
    }),

  // Create job (any authenticated user)
  create: authedProcedure
    .input(
      z.object({
        title: z.string().min(1),
        description: z.string().min(1),
        requirements: z.string().min(1),
        skills: z.array(z.string()).optional().default([]),
        type: z.enum(['full-time', 'part-time', 'contract', 'internship', 'remote']),
        location: z.string().min(1),
        salary: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const result = await db.insert(jobs).values({
        employerId: ctx.user.userId,
        title: input.title,
        description: input.description,
        requirements: input.requirements,
        skills: input.skills,
        type: input.type,
        location: input.location,
        salary: input.salary ?? null,
        status: 'active',
      });
      const id = Number(result[0].insertId);
      const rows = await db.select().from(jobs).where(eq(jobs.id, id)).limit(1);
      return rows[0];
    }),

  // Update job
  update: authedProcedure
    .input(
      z.object({
        id: z.number(),
        title: z.string().min(1).optional(),
        description: z.string().min(1).optional(),
        requirements: z.string().min(1).optional(),
        skills: z.array(z.string()).optional(),
        type: z.enum(['full-time', 'part-time', 'contract', 'internship', 'remote']).optional(),
        location: z.string().min(1).optional(),
        salary: z.string().optional(),
        status: z.enum(['active', 'paused', 'closed']).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...updates } = input;
      const existing = await db.select().from(jobs).where(eq(jobs.id, id)).limit(1);
      if (existing.length === 0) throw new Error('Job not found');
      if (existing[0].employerId !== ctx.user.userId && ctx.user.role !== 'admin') {
        throw new Error('FORBIDDEN');
      }
      await db.update(jobs).set(updates).where(eq(jobs.id, id));
      const rows = await db.select().from(jobs).where(eq(jobs.id, id)).limit(1);
      return rows[0];
    }),

  // Delete job
  delete: authedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const existing = await db.select().from(jobs).where(eq(jobs.id, input.id)).limit(1);
      if (existing.length === 0) throw new Error('Job not found');
      if (existing[0].employerId !== ctx.user.userId && ctx.user.role !== 'admin') {
        throw new Error('FORBIDDEN');
      }
      await db.delete(jobs).where(eq(jobs.id, input.id));
      return { success: true };
    }),

  // Toggle featured (admin only)
  toggleFeatured: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const rows = await db.select().from(jobs).where(eq(jobs.id, input.id)).limit(1);
      if (rows.length === 0) throw new Error('Job not found');
      const newFeatured = !rows[0].featured;
      await db.update(jobs).set({ featured: newFeatured }).where(eq(jobs.id, input.id));
      return { id: input.id, featured: newFeatured };
    }),

  // Stats
  stats: publicProcedure.query(async () => {
    const all = await db.select().from(jobs);
    return {
      total: all.length,
      active: all.filter(j => j.status === 'active').length,
      paused: all.filter(j => j.status === 'paused').length,
      closed: all.filter(j => j.status === 'closed').length,
    };
  }),
});
