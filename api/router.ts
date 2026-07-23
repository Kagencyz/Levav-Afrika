import { initTRPC } from '@trpc/server';
import superjson from 'superjson';
import type { Context } from './context';
import { authRouter } from './routes/auth';
import { talentRouter } from './routes/talent';
import { uploadRouter } from './routes/upload';
import { employerRouter } from './routes/employer';
import { jobRouter } from './routes/job';
import { applicationRouter } from './routes/application';
import { messageRouter } from './routes/message';
import { notificationRouter } from './routes/notification';
import { reviewRouter } from './routes/review';
import { wriRouter } from './routes/wri';

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

export const appRouter = router({
  auth: authRouter,
  talent: talentRouter,
  upload: uploadRouter,
  employer: employerRouter,
  job: jobRouter,
  application: applicationRouter,
  message: messageRouter,
  notification: notificationRouter,
  review: reviewRouter,
  wri: wriRouter,
});

export type AppRouter = typeof appRouter;
