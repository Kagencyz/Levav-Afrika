import { z } from 'zod';
import { eq, and, count, desc } from 'drizzle-orm';
import { router, authedProcedure } from '../router';
import { db } from '../../db/connection';
import { notifications } from '../../db/schema';

export const notificationRouter = router({
  // Create notification (internal - could be called by other routers)
  create: authedProcedure
    .input(z.object({
      userId: z.number(),
      type: z.string(),
      title: z.string(),
      message: z.string(),
      link: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      await db.insert(notifications).values({
        userId: input.userId,
        type: input.type,
        title: input.title,
        message: input.message,
        link: input.link || null,
      });
      return { success: true };
    }),

  // List my notifications
  list: authedProcedure.query(async ({ ctx }) => {
    return db.select().from(notifications)
      .where(eq(notifications.userId, ctx.user.userId))
      .orderBy(desc(notifications.createdAt))
      .limit(20);
  }),

  // Mark as read
  markRead: authedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      await db.update(notifications).set({ read: true }).where(eq(notifications.id, input.id));
      return { success: true };
    }),

  // Mark all as read
  markAllRead: authedProcedure.mutation(async ({ ctx }) => {
    await db.update(notifications).set({ read: true })
      .where(eq(notifications.userId, ctx.user.userId));
    return { success: true };
  }),

  // Unread count
  unreadCount: authedProcedure.query(async ({ ctx }) => {
    const rows = await db.select({ value: count() }).from(notifications)
      .where(and(eq(notifications.userId, ctx.user.userId), eq(notifications.read, false)));
    return rows[0]?.value ?? 0;
  }),
});
