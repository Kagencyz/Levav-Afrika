import { z } from 'zod';
import { eq, and, count, desc } from 'drizzle-orm';
import { router, publicProcedure, authedProcedure, adminProcedure } from '../router';
import { db } from '../../db/connection';
import { applications } from '../../db/schema';

export const applicationRouter = router({
  // Apply for a job
  create: authedProcedure
    .input(z.object({
      jobId: z.number(),
      coverLetter: z.string().optional(),
      resumeUrl: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const [app] = await db.insert(applications).values({
        jobId: input.jobId,
        userId: ctx.user.userId,
        talentId: ctx.user.userId,
        coverLetter: input.coverLetter || null,
        resumeUrl: input.resumeUrl || null,
        status: 'pending',
      });
      return { success: true, id: Number(app.insertId) };
    }),

  // My applications (talent view)
  myApplications: authedProcedure.query(async ({ ctx }) => {
    return db.select().from(applications).where(eq(applications.userId, ctx.user.userId)).orderBy(desc(applications.createdAt));
  }),

  // Applications for a job (employer view)
  byJob: authedProcedure
    .input(z.object({ jobId: z.number() }))
    .query(async ({ input }) => {
      return db.select().from(applications).where(eq(applications.jobId, input.jobId)).orderBy(desc(applications.createdAt));
    }),

  // Update status (employer)
  updateStatus: authedProcedure
    .input(z.object({
      id: z.number(),
      status: z.enum(['pending', 'reviewed', 'shortlisted', 'rejected', 'hired']),
    }))
    .mutation(async ({ input }) => {
      await db.update(applications).set({ status: input.status }).where(eq(applications.id, input.id));
      return { success: true };
    }),

  // Stats (admin)
  stats: adminProcedure.query(async () => {
    const all = await db.select().from(applications);
    return {
      total: all.length,
      pending: all.filter(a => a.status === 'pending').length,
      reviewed: all.filter(a => a.status === 'reviewed').length,
      shortlisted: all.filter(a => a.status === 'shortlisted').length,
      rejected: all.filter(a => a.status === 'rejected').length,
      hired: all.filter(a => a.status === 'hired').length,
    };
  }),
});
