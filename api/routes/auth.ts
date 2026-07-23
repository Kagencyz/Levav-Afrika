import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { eq } from 'drizzle-orm';
import { router, publicProcedure } from '../trpc';
import { db } from '../../db/connection';
import { users } from '../../db/schema';
import { signToken } from '../lib/jwt';
import { hashPassword, comparePassword } from '../lib/password';

export const authRouter = router({
  register: publicProcedure
    .input(
      z.object({
        email: z.string().email(),
        password: z.string().min(6),
        name: z.string().min(2),
      })
    )
    .mutation(async ({ input }) => {
      // Normalized before persistence to satisfy the users_email_normalized
      // CHECK constraint and enforce case-insensitive uniqueness.
      const email = input.email.trim().toLowerCase();

      const existing = await db.select().from(users).where(eq(users.email, email)).limit(1);

      if (existing.length > 0) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: 'Email already registered',
        });
      }

      const passwordHash = await hashPassword(input.password);

      // accessLevel is never accepted as input — every new account starts
      // 'standard' (the column default). 'admin' is assigned out-of-band
      // only. Business identity (talent / employer team member) is not set
      // here at all — it's established later by creating a talents row or
      // an organization_members row, not by this registration step.
      const [newUser] = await db
        .insert(users)
        .values({
          email,
          passwordHash,
          name: input.name,
        })
        .returning();

      const token = await signToken({
        userId: newUser.id,
        email: newUser.email,
        accessLevel: newUser.accessLevel,
      });

      return {
        token,
        user: {
          id: newUser.id,
          email: newUser.email,
          name: newUser.name,
          accessLevel: newUser.accessLevel,
        },
      };
    }),

  login: publicProcedure
    .input(
      z.object({
        email: z.string().email(),
        password: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const email = input.email.trim().toLowerCase();

      const rows = await db.select().from(users).where(eq(users.email, email)).limit(1);

      if (rows.length === 0) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Invalid email or password',
        });
      }

      const user = rows[0];
      const valid = await comparePassword(input.password, user.passwordHash);

      if (!valid) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Invalid email or password',
        });
      }

      const token = await signToken({
        userId: user.id,
        email: user.email,
        accessLevel: user.accessLevel,
      });

      return {
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          accessLevel: user.accessLevel,
        },
      };
    }),

  me: publicProcedure.query(async ({ ctx }) => {
    if (!ctx.user) {
      return null;
    }

    const rows = await db
      .select({
        id: users.id,
        email: users.email,
        name: users.name,
        accessLevel: users.accessLevel,
      })
      .from(users)
      .where(eq(users.id, ctx.user.userId))
      .limit(1);

    if (rows.length === 0) {
      return null;
    }

    return rows[0];
  }),
});
