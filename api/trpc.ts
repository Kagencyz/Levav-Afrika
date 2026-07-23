import { initTRPC } from '@trpc/server';
import superjson from 'superjson';
import type { Context } from './context';

const t = initTRPC.context<Context>().create({
  transformer: superjson,
});

export const router = t.router;
export const publicProcedure = t.procedure;
export const middleware = t.middleware;

const authedMiddleware = t.middleware(({ ctx, next }) => {
  if (!ctx.user) {
    throw new Error('UNAUTHORIZED');
  }
  return next({ ctx: { ...ctx, user: ctx.user } });
});

const adminMiddleware = t.middleware(({ ctx, next }) => {
  if (!ctx.user) {
    throw new Error('UNAUTHORIZED');
  }
  if (ctx.user.role !== 'admin') {
    throw new Error('FORBIDDEN');
  }
  return next({ ctx: { ...ctx, user: ctx.user } });
});

export const authedProcedure = t.procedure.use(authedMiddleware);
export const adminProcedure = t.procedure.use(adminMiddleware);
