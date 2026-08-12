import { TRPCError } from '@trpc/server';
import { and, eq, isNull } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '../../db/connection.js';
import { organizationMembers, organizations } from '../../db/schema.js';
import { authedProcedure, router } from '../trpc.js';

const registrationInput = z.object({
  companyName: z.string().trim().min(2).max(255),
  registrationNumber: z.string().trim().max(120).optional(),
  industry: z.string().trim().min(1).max(120),
  companySize: z.string().trim().min(1).max(60),
  website: z.union([z.string().url().max(500), z.literal('')]).optional(),
  description: z.string().trim().max(4000).optional(),
  businessAddress: z.string().trim().max(500).optional(),
  city: z.string().trim().max(120).optional(),
  country: z.string().trim().max(120).optional(),
  contactName: z.string().trim().min(2).max(255),
  contactTitle: z.string().trim().min(1).max(120),
  contactEmail: z.string().trim().email().max(320),
  contactPhone: z.string().trim().max(40).optional(),
});

export const organizationRouter = router({
  listMine: authedProcedure.query(async ({ ctx }) => {
    return db
      .select({
        id: organizations.id,
        name: organizations.name,
        organizationType: organizations.organizationType,
        industry: organizations.industry,
        size: organizations.size,
        verificationStatus: organizations.verificationStatus,
        role: organizationMembers.orgRole,
        joinedAt: organizationMembers.joinedAt,
        createdAt: organizations.createdAt,
      })
      .from(organizationMembers)
      .innerJoin(organizations, eq(organizations.id, organizationMembers.organizationId))
      .where(and(
        eq(organizationMembers.userId, ctx.user.userId),
        eq(organizationMembers.status, 'active'),
        isNull(organizations.archivedAt),
      ));
  }),

  register: authedProcedure
    .input(registrationInput)
    .mutation(async ({ ctx, input }) => {
      const existing = await db
        .select({ id: organizationMembers.id })
        .from(organizationMembers)
        .where(and(
          eq(organizationMembers.userId, ctx.user.userId),
          eq(organizationMembers.status, 'active'),
        ))
        .limit(1);

      if (existing.length > 0) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: 'You already belong to an active organization.',
        });
      }

      return db.transaction(async (tx) => {
        const [organization] = await tx
          .insert(organizations)
          .values({
            name: input.companyName,
            organizationType: 'company',
            industry: input.industry,
            size: input.companySize,
            registrationNumber: input.registrationNumber || null,
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
          })
          .returning();

        if (!organization) {
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR' });
        }

        await tx.insert(organizationMembers).values({
          organizationId: organization.id,
          userId: ctx.user.userId,
          orgRole: 'owner',
          status: 'active',
          joinedAt: new Date(),
        });

        return organization;
      });
    }),
});
