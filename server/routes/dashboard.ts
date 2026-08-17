import { and, eq } from 'drizzle-orm';
import { router, authedProcedure } from '../trpc.js';
import { db } from '../../db/connection.js';
import {
  organizationMembers,
  organizations,
  talents,
  userOnboarding,
  users,
} from '../../db/schema.js';

function calculateProfileCompletion(profile: {
  name: string;
  bio: string | null;
  category: string | null;
  skills: string[];
  location: string | null;
} | null) {
  if (!profile) return 0;
  const completed = [
    profile.name.trim().length > 0,
    Boolean(profile.bio?.trim()),
    Boolean(profile.category?.trim()),
    profile.skills.length > 0,
    Boolean(profile.location?.trim()),
  ].filter(Boolean).length;
  return completed * 20;
}

export const dashboardRouter = router({
  summary: authedProcedure.query(async ({ ctx }) => {
    const userId = ctx.user.userId;
    const [accountRows, onboardingRows, talentRows, membershipRows] = await Promise.all([
      db
        .select({ name: users.name, email: users.email, createdAt: users.createdAt })
        .from(users)
        .where(eq(users.id, userId))
        .limit(1),
      db
        .select({
          goals: userOnboarding.intentions,
          primaryGoal: userOnboarding.primaryIntention,
          personalStatus: userOnboarding.employmentSituation,
          completedAt: userOnboarding.completedAt,
        })
        .from(userOnboarding)
        .where(eq(userOnboarding.userId, userId))
        .limit(1),
      db
        .select({
          id: talents.id,
          name: talents.name,
          bio: talents.bio,
          category: talents.category,
          skills: talents.skills,
          location: talents.location,
          createdAt: talents.createdAt,
          updatedAt: talents.updatedAt,
        })
        .from(talents)
        .where(eq(talents.userId, userId))
        .limit(1),
      db
        .select({
          id: organizationMembers.id,
          organizationId: organizations.id,
          organizationName: organizations.name,
          role: organizationMembers.orgRole,
          joinedAt: organizationMembers.joinedAt,
        })
        .from(organizationMembers)
        .innerJoin(organizations, eq(organizations.id, organizationMembers.organizationId))
        .where(
          and(
            eq(organizationMembers.userId, userId),
            eq(organizationMembers.status, 'active')
          )
        ),
    ]);

    const account = accountRows[0];
    const onboarding = onboardingRows[0] ?? null;
    const talentProfile = talentRows[0] ?? null;

    return {
      account,
      onboarding,
      talentProfile,
      profileCompletion: calculateProfileCompletion(talentProfile),
      organizations: membershipRows,
      // Jobs/applications are deliberately zero until those protected domain
      // tables and procedures ship. The dashboard must never invent activity.
      applications: { total: 0, available: false as const },
    };
  }),
});
