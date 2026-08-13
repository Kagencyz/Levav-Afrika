import { describe, it, expect } from 'vitest';
import { appRouter } from './router';

/**
 * Security regression guard: assert the complete registered procedure set.
 * Any addition or removal is an API-surface change and must fail loudly until
 * this allowlist is updated by an approved Work Packet.
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
