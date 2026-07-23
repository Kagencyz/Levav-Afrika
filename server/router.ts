export { router, publicProcedure, authedProcedure, adminProcedure, middleware } from './trpc';

import { router } from './trpc';
import { authRouter } from './routes/auth';
import { talentRouter } from './routes/talent';
// Stage A: upload, employer, job, application, message, notification, review,
// and wri are intentionally NOT imported — see docs/NEXT_MILESTONE.md §4.
// They must stay unreachable, not merely unregistered.

export const appRouter = router({
  auth: authRouter,
  talent: router({
    createOwnProfile: talentRouter.create,
    updateOwnProfile: talentRouter.update,
    getOwnProfile: talentRouter.getOwnProfile,
  }),
});

export type AppRouter = typeof appRouter;
