import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { eq } from 'drizzle-orm';
import { router, publicProcedure } from '../trpc.js';
import { db } from '../../db/connection.js';
import { users } from '../../db/schema.js';
import { signToken } from '../lib/jwt.js';
import { hashPassword, comparePassword } from '../lib/password.js';

export const authRouter = router({
  register: publicProcedure
    .input(
      z.object({
        email: z.string().email(),
        password: z.string().min(6),
        name: z.string().min(2),
      })
    )
    .mutation(async ({ input, ctx }) => {
      // Temporary timing instrumentation — this project is a single Vercel
      // Hobby-plan function with a hard 10s execution limit, and register
      // has been timing out in production with no visible cause. These
      // logs pinpoint which step is actually slow instead of guessing
      // further. Remove once the real bottleneck is confirmed and fixed.
      const t0 = Date.now();
      const mark = (label: string) => console.log(`[auth.register] ${label} +${Date.now() - t0}ms`);

      // Normalized before persistence to satisfy the users_email_normalized
      // CHECK constraint and enforce case-insensitive uniqueness.
      const email = input.email.trim().toLowerCase();

      const existing = await db.select().from(users).where(eq(users.email, email)).limit(1);
      mark('duplicate-check done');

      if (existing.length > 0) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: 'Email already registered',
        });
      }

      const passwordHash = await hashPassword(input.password);
      mark('bcrypt hash done');

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
      mark('insert done');

      const token = await signToken({
        userId: newUser.id,
        email: newUser.email,
        accessLevel: newUser.accessLevel,
      });
      mark('jwt signed');

      // The token is never returned in the response body — only set as an
      // httpOnly cookie (via server/app.ts's responseMeta) so it's not
      // readable by JS at all, closing the XSS-exposed-token gap the
      // previous Bearer-in-localStorage design had.
      ctx.session.setToken = token;

      return {
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
    .mutation(async ({ input, ctx }) => {
      // Same temporary timing instrumentation as register — see comment
      // there. Remove once the real bottleneck is confirmed and fixed.
      const t0 = Date.now();
      const mark = (label: string) => console.log(`[auth.login] ${label} +${Date.now() - t0}ms`);

      const email = input.email.trim().toLowerCase();

      const rows = await db.select().from(users).where(eq(users.email, email)).limit(1);
      mark('lookup done');

      if (rows.length === 0) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Invalid email or password',
        });
      }

      const user = rows[0];
      const valid = await comparePassword(input.password, user.passwordHash);
      mark('bcrypt compare done');

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
      mark('jwt signed');

      ctx.session.setToken = token;

      return {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          accessLevel: user.accessLevel,
        },
      };
    }),

  logout: publicProcedure.mutation(async ({ ctx }) => {
    // Works even with an already-expired/invalid token — logging out is
    // always safe to attempt. Clearing an httpOnly cookie can only be done
    // server-side (JS can't read or write it), so this is a real endpoint,
    // not just a client-side localStorage clear like the previous design.
    ctx.session.clearToken = true;
    return { success: true };
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
