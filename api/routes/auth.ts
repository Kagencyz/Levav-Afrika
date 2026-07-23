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
        role: z.enum(['talent', 'client']).default('client'),
      })
    )
    .mutation(async ({ input }) => {
      const existing = await db
        .select()
        .from(users)
        .where(eq(users.email, input.email))
        .limit(1);

      if (existing.length > 0) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: 'Email already registered',
        });
      }

      const passwordHash = await hashPassword(input.password);

      const result = await db.insert(users).values({
        email: input.email,
        passwordHash,
        name: input.name,
        role: input.role,
      });

      const userId = Number(result[0].insertId);

      const token = await signToken({
        userId,
        email: input.email,
        role: input.role,
      });

      return {
        token,
        user: {
          id: userId,
          email: input.email,
          name: input.name,
          role: input.role,
          avatar: null,
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
      const rows = await db
        .select()
        .from(users)
        .where(eq(users.email, input.email))
        .limit(1);

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
        role: user.role,
      });

      return {
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          avatar: user.avatar,
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
        role: users.role,
        avatar: users.avatar,
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
