import { describe, it, expect } from 'vitest';
import { appRouter } from './router';

/**
 * Regression guard: the quarantined routers (employer, job, application,
 * message, notification, review, upload, wri) have known missing
 * authorization checks (docs/SECURITY_AUDIT.md) and must stay unreachable
 * until fixed. If a procedure appears here that is not on the allowlist,
 * someone wired one in — fail loudly.
 */
const ALLOWED_PROCEDURES = [
  'auth.register',
  'auth.resendConfirmation',
  'auth.login',
  'auth.logout',
  'auth.me',
  'dashboard.summary',
  'onboarding.complete',
  'onboarding.get',
  'organization.listMine',
  'organization.register',
  'talent.createOwnProfile',
  'talent.updateOwnProfile',
  'talent.getOwnProfile',
  'talent.list',
  'talent.getById',
].sort();

describe('appRouter surface', () => {
  it('exposes exactly the allowlisted procedures', () => {
    const procedures = Object.keys(appRouter._def.procedures).sort();
    expect(procedures).toEqual(ALLOWED_PROCEDURES);
  });
});
