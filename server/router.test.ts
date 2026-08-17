import { describe, it, expect } from 'vitest';
import { appRouter } from './router';

/** Security regression guard: additions and removals both require an explicit allowlist change. */
const ALLOWED_PROCEDURES = [
  'auth.register',
  'auth.resendConfirmation',
  'auth.login',
  'auth.logout',
  'auth.me',
  'dashboard.summary',
  'onboarding.complete',
  'onboarding.saveCareerDraft',
  'onboarding.confirmCareer',
  'onboarding.skipCareer',
  'onboarding.confirmSituation',
  'onboarding.get',
  'organization.listMine',
  'organization.register',
  'talent.createOwnProfile',
  'talent.updateOwnProfile',
  'talent.getOwnProfile',
  'talent.list',
  'talent.getById',
  'taxonomy.listFamilies',
  'taxonomy.listRoles',
  'taxonomy.listIndustries',
  'taxonomy.resolveTitle',
  'taxonomy.createFamily',
  'taxonomy.createIndustry',
  'taxonomy.createRole',
  'taxonomy.createAlias',
  'taxonomy.supersedeRole',
].sort();

describe('appRouter surface', () => {
  it('exposes exactly the allowlisted procedures', () => {
    const procedures = Object.keys(appRouter._def.procedures).sort();
    expect(procedures).toEqual(ALLOWED_PROCEDURES);
  });
});
