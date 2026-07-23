import { z } from 'zod';
import { eq, and } from 'drizzle-orm';
import { router, publicProcedure, authedProcedure } from '../router';
import { db } from '../../db/connection';
import { reviews } from '../../db/schema';

export const reviewRouter = router({
  // Create a review
  create: authedProcedure
    .input(z.object({
      bookingId: z.number(),
      revieweeId: z.number(),
      rating: z.number().min(1).max(5),
      comment: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      await db.insert(reviews).values({
        bookingId: input.bookingId,
        reviewerId: ctx.user.userId,
        revieweeId: input.revieweeId,
        rating: input.rating,
        comment: input.comment || null,
      });
      return { success: true };
    }),

  // Get reviews for a user
  forUser: publicProcedure
    .input(z.object({ userId: z.number() }))
    .query(async ({ input }) => {
      const userReviews = await db.select().from(reviews).where(eq(reviews.revieweeId, input.userId));
      const avgRating = userReviews.length > 0
        ? userReviews.reduce((sum, r) => sum + Number(r.rating), 0) / userReviews.length
        : 0;
      return {
        reviews: userReviews,
        average: Math.round(avgRating * 10) / 10,
        count: userReviews.length,
      };
    }),

  // Check if user has already reviewed
  hasReviewed: authedProcedure
    .input(z.object({ bookingId: z.number() }))
    .query(async ({ ctx, input }) => {
      const rows = await db.select().from(reviews)
        .where(and(eq(reviews.bookingId, input.bookingId), eq(reviews.reviewerId, ctx.user.userId)))
        .limit(1);
      return rows.length > 0;
    }),
});
