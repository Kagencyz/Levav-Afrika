import { z } from 'zod';
import { router, publicProcedure, authedProcedure, adminProcedure } from '../router';
import { db } from '@db/connection';
import { employers, users } from '@db/schema';
import { eq } from 'drizzle-orm';

// ─── Employer Registration ──────────────────────────────
export const employerRouter = router({
  // Register a new employer (requires auth)
  register: authedProcedure
    .input(
      z.object({
        companyName: z.string().min(2, 'Company name is required'),
        registrationNumber: z.string().optional(),
        industry: z.string().min(1, 'Industry is required'),
        companySize: z.string().min(1, 'Company size is required'),
        website: z.string().url().optional().or(z.literal('')),
        description: z.string().optional(),
        businessAddress: z.string().optional(),
        city: z.string().optional(),
        country: z.string().optional(),
        contactName: z.string().min(2, 'Contact name is required'),
        contactTitle: z.string().min(1, 'Contact title is required'),
        contactEmail: z.string().email('Valid contact email is required'),
        contactPhone: z.string().optional(),
        businessDocuments: z.array(z.string()).optional().default([]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.user.id;

      // Check if employer already registered
      const existing = await db
        .select()
        .from(employers)
        .where(eq(employers.userId, userId))
        .limit(1);

      if (existing.length > 0) {
        throw new Error('Employer profile already exists');
      }

      // Create employer profile
      const [employer] = await db.insert(employers).values({
        userId,
        companyName: input.companyName,
        registrationNumber: input.registrationNumber || null,
        industry: input.industry,
        companySize: input.companySize,
        website: input.website || null,
        description: input.description || null,
        businessAddress: input.businessAddress || null,
        city: input.city || null,
        country: input.country || null,
        contactName: input.contactName,
        contactTitle: input.contactTitle,
        contactEmail: input.contactEmail,
        contactPhone: input.contactPhone || null,
        verificationStatus: 'pending',
        businessDocuments: input.businessDocuments,
      });

      return {
        success: true,
        employer,
        message: 'Registration submitted for verification. Our team will review your application within 1-2 business days.',
      };
    }),

  // Get my employer profile status
  myProfile: authedProcedure.query(async ({ ctx }) => {
    const [profile] = await db
      .select()
      .from(employers)
      .where(eq(employers.userId, ctx.user.id))
      .limit(1);

    return profile || null;
  }),

  // Get employer by ID (public, but only verified employers)
  getById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const [profile] = await db
        .select()
        .from(employers)
        .where(eq(employers.id, input.id))
        .limit(1);

      if (!profile || profile.verificationStatus !== 'verified') {
        return null;
      }

      // Don't expose sensitive fields publicly
      const { contactEmail, contactPhone, businessDocuments, ...publicProfile } = profile;
      return publicProfile;
    }),

  // List all verified employers (public)
  listVerified: publicProcedure.query(async () => {
    const results = await db
      .select()
      .from(employers)
      .where(eq(employers.verificationStatus, 'verified'));

    // Return public-safe data
    return results.map(({ contactEmail, contactPhone, businessDocuments, ...publicProfile }) => ({
      ...publicProfile,
      isVerified: true,
    }));
  }),

  // ─── Admin Endpoints ──────────────────────────────

  // List all employers (admin only)
  listAll: adminProcedure.query(async () => {
    return db.select().from(employers);
  }),

  // List pending verification (admin only)
  listPending: adminProcedure.query(async () => {
    return db
      .select()
      .from(employers)
      .where(eq(employers.verificationStatus, 'pending'));
  }),

  // Verify an employer (admin only)
  verify: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      await db
        .update(employers)
        .set({
          verificationStatus: 'verified',
          verifiedAt: new Date(),
          verifiedBy: ctx.user.id,
          rejectionReason: null,
        })
        .where(eq(employers.id, input.id));

      return { success: true, message: 'Employer verified successfully' };
    }),

  // Reject an employer (admin only)
  reject: adminProcedure
    .input(
      z.object({
        id: z.number(),
        reason: z.string().min(1, 'Rejection reason is required'),
      })
    )
    .mutation(async ({ input }) => {
      await db
        .update(employers)
        .set({
          verificationStatus: 'rejected',
          rejectionReason: input.reason,
        })
        .where(eq(employers.id, input.id));

      return { success: true, message: 'Employer registration rejected' };
    }),

  // Set employer to in_review (admin only)
  setInReview: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      await db
        .update(employers)
        .set({ verificationStatus: 'in_review' })
        .where(eq(employers.id, input.id));

      return { success: true, message: 'Employer set to in review' };
    }),

  // Get verification stats (admin only)
  stats: adminProcedure.query(async () => {
    const all = await db.select().from(employers);
    return {
      total: all.length,
      pending: all.filter((e) => e.verificationStatus === 'pending').length,
      inReview: all.filter((e) => e.verificationStatus === 'in_review').length,
      verified: all.filter((e) => e.verificationStatus === 'verified').length,
      rejected: all.filter((e) => e.verificationStatus === 'rejected').length,
    };
  }),
});
