import { z } from 'zod';
import { eq, or, and, desc, count } from 'drizzle-orm';
import { router, authedProcedure } from '../router';
import { db } from '../../db/connection';
import { messages } from '../../db/schema';

export const messageRouter = router({
  // Send a message
  send: authedProcedure
    .input(z.object({ receiverId: z.number(), content: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      const [msg] = await db.insert(messages).values({
        senderId: ctx.user.userId,
        receiverId: input.receiverId,
        content: input.content,
        read: false,
      });
      return { success: true, id: Number(msg.insertId) };
    }),

  // Get conversation between two users
  conversation: authedProcedure
    .input(z.object({ otherUserId: z.number() }))
    .query(async ({ ctx, input }) => {
      return db.select().from(messages)
        .where(or(
          and(eq(messages.senderId, ctx.user.userId), eq(messages.receiverId, input.otherUserId)),
          and(eq(messages.senderId, input.otherUserId), eq(messages.receiverId, ctx.user.userId))
        ))
        .orderBy(messages.createdAt);
    }),

  // Mark messages as read
  markRead: authedProcedure
    .input(z.object({ senderId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      await db.update(messages).set({ read: true })
        .where(and(eq(messages.senderId, input.senderId), eq(messages.receiverId, ctx.user.userId)));
      return { success: true };
    }),

  // Unread count
  unreadCount: authedProcedure.query(async ({ ctx }) => {
    const rows = await db.select({ value: count() }).from(messages)
      .where(and(eq(messages.receiverId, ctx.user.userId), eq(messages.read, false)));
    return rows[0]?.value ?? 0;
  }),
});
