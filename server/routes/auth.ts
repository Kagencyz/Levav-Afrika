import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { eq } from 'drizzle-orm';
import { router, publicProcedure } from '../trpc.js';
import { db } from '../../db/connection.js';
import { users } from '../../db/schema.js';
import { signToken } from '../lib/jwt.js';
import { signInWithPassword, signUpWithPassword } from '../lib/supabase.js';

async function getPublicProfile(userId: string) {
  const rows = await db
    .select({
      id: users.id,
      email: users.email,
      name: users.name,
      accessLevel: users.accessLevel,
    })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  if (!rows[0]) {
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Account profile is not available',
    });
  }

  return rows[0];
}

async function establishAppSession(
  userId: string,
  ctx: { session: { setToken?: string } }
) {
  const profile = await getPublicProfile(userId);
  ctx.session.setToken = await signToken({
    userId: profile.id,
    email: profile.email,
    accessLevel: profile.accessLevel,
  });
  return profile;
}

export const authRouter = router({
  register: publicProcedure
    .input(
      z.object({
        email: z.string().email(),
        password: z.string().min(6).max(128),
        name: z.string().trim().min(2).max(200),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const email = input.email.trim().toLowerCase();
      const startedAt = Date.now();
      console.log(JSON.stringify({ level: 'info', message: 'Supabase signup started' }));

      let signupResult;
      try {
        signupResult = await signUpWithPassword(email, input.password, input.name);
      } catch (error) {
        console.error(JSON.stringify({
          level: 'error',
          message: 'Supabase signup request failed',
          error: error instanceof Error ? error.message : String(error),
          durationMs: Date.now() - startedAt,
        }));
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Authentication service is unavailable',
        });
      }

      const { data, error } = signupResult;
      console.log(JSON.stringify({
        level: error ? 'warning' : 'info',
        message: 'Supabase signup completed',
        durationMs: Date.now() - startedAt,
        status: error?.status,
        code: error?.code,
      }));

      if (error || !data.user) {
        console.error('[auth.register] Supabase sign-up failed', {
          status: error?.status,
          code: error?.code,
        });
        throw new TRPCError({
          code: error?.status === 429 ? 'TOO_MANY_REQUESTS' : 'BAD_REQUEST',
          message: error?.status === 429
            ? 'Confirmation email limit reached. Please wait an hour and try again.'
            : 'Unable to create account',
        });
      }

      // Hosted Supabase projects normally require email confirmation. In
      // that flow signUp returns a user but no session, so do not mint an app
      // session until Supabase has actually authenticated the account.
      if (!data.session) {
        return { authenticated: false as const, requiresEmailConfirmation: true as const };
      }

      const user = await establishAppSession(data.user.id, ctx);
      return {
        authenticated: true as const,
        requiresEmailConfirmation: false as const,
        user,
      };
    }),

  login: publicProcedure
    .input(
      z.object({
        email: z.string().email(),
        password: z.string().min(1).max(128),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const startedAt = Date.now();
      console.log(JSON.stringify({ level: 'info', message: 'Supabase login started' }));

      let loginResult;
      try {
        loginResult = await signInWithPassword(
          input.email.trim().toLowerCase(),
          input.password
        );
      } catch (error) {
        console.error(JSON.stringify({
          level: 'error',
          message: 'Supabase login request failed',
          error: error instanceof Error ? error.message : String(error),
          durationMs: Date.now() - startedAt,
        }));
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Authentication service is unavailable',
        });
      }

      const { data, error } = loginResult;
      console.log(JSON.stringify({
        level: error ? 'warning' : 'info',
        message: 'Supabase login completed',
        durationMs: Date.now() - startedAt,
        status: error?.status,
        code: error?.code,
      }));

      if (error || !data.user || !data.session) {
        console.warn('[auth.login] Supabase sign-in rejected', {
          status: error?.status,
          code: error?.code,
        });
        throw new TRPCError({
          code: error?.status === 429 ? 'TOO_MANY_REQUESTS' : 'UNAUTHORIZED',
          message: 'Invalid email or password',
        });
      }

      const user = await establishAppSession(data.user.id, ctx);
      return { user };
    }),

  logout: publicProcedure.mutation(async ({ ctx }) => {
    ctx.session.clearToken = true;
    return { success: true };
  }),

  me: publicProcedure.query(async ({ ctx }) => {
    if (!ctx.user) return null;
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
    return rows[0] ?? null;
  }),
});
