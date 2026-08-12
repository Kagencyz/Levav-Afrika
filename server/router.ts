export { router, publicProcedure, authedProcedure, adminProcedure, middleware } from './trpc.js';

import { router } from './trpc.js';
import { authRouter } from './routes/auth.js';
import { talentRouter } from './routes/talent.js';
import { onboardingRouter } from './routes/onboarding.js';
import { dashboardRouter } from './routes/dashboard.js';
// Stage A: upload, employer, job, application, message, notification, review,
// and wri are intentionally NOT imported — see docs/NEXT_MILESTONE.md §4.
// They must stay unreachable, not merely unregistered.
// onboarding was added deliberately for the upgrade brief §3 signup flow —
// see docs/UPGRADE_BRIEF.md and docs/UPGRADE_GAP_REPORT.md.

export const appRouter = router({
  auth: authRouter,
  dashboard: dashboardRouter,
  onboarding: onboardingRouter,
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
