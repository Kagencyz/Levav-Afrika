export { router, publicProcedure, authedProcedure, adminProcedure, middleware } from './trpc.js';

import { router } from './trpc.js';
import { authRouter } from './routes/auth.js';
import { talentRouter } from './routes/talent.js';
import { onboardingRouter } from './routes/onboarding.js';
import { dashboardRouter } from './routes/dashboard.js';
import { organizationRouter } from './routes/organization.js';
// The registered router surface is intentionally explicit and guarded by
// server/router.test.ts. Additions and removals require an approved Work Packet.


export const appRouter = router({
  auth: authRouter,
  dashboard: dashboardRouter,
  onboarding: onboardingRouter,
  organization: organizationRouter,
  talent: router({
    createOwnProfile: talentRouter.create,
    updateOwnProfile: talentRouter.update,
    getOwnProfile: talentRouter.getOwnProfile,
    // list/getById are plain public reads (no auth, no known issues) —
    // needed so TalentDirectory/TalentProfile can show real profiles to
    // every visitor, not just the browser that created them. `delete`
    // stays unregistered; nothing calls it yet.
    list: talentRouter.list,
    getById: talentRouter.getById,
  }),
});

export type AppRouter = typeof appRouter;
