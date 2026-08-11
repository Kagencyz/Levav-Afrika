import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  signUp: vi.fn(),
  signInWithPassword: vi.fn(),
  profileLimit: vi.fn(),
}));

vi.mock('../lib/supabase.js', () => ({
  createSupabaseAuthClient: () => ({
    auth: {
      signUp: mocks.signUp,
      signInWithPassword: mocks.signInWithPassword,
    },
  }),
}));

vi.mock('../../db/connection.js', () => ({
  db: {
    select: () => ({
      from: () => ({
        where: () => ({ limit: mocks.profileLimit }),
      }),
    }),
  },
}));

import { authRouter } from './auth.js';

const profile = {
  id: '2e8d7a31-afb7-4aa6-8984-7312dac14368',
  email: 'person@example.com',
  name: 'Test Person',
  accessLevel: 'standard' as const,
};

function createCaller() {
  const context = { user: null, session: {} };
  return { caller: authRouter.createCaller(context), context };
}

describe('Supabase-backed authentication', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.profileLimit.mockResolvedValue([profile]);
  });

  it('requires confirmation without issuing an app session when signup has no Supabase session', async () => {
    mocks.signUp.mockResolvedValue({
      data: { user: { id: profile.id }, session: null },
      error: null,
    });
    const { caller, context } = createCaller();

    await expect(
      caller.register({ email: profile.email, password: 'safe-password', name: profile.name })
    ).resolves.toEqual({ authenticated: false, requiresEmailConfirmation: true });
    expect(context.session).toEqual({});
    expect(mocks.profileLimit).not.toHaveBeenCalled();
  });

  it('issues an app session only after Supabase authenticates a login', async () => {
    mocks.signInWithPassword.mockResolvedValue({
      data: { user: { id: profile.id }, session: { access_token: 'supabase-token' } },
      error: null,
    });
    const { caller, context } = createCaller();

    await expect(
      caller.login({ email: profile.email, password: 'safe-password' })
    ).resolves.toEqual({ user: profile });
    expect(context.session).toHaveProperty('setToken');
    expect(typeof context.session.setToken).toBe('string');
  });

  it('returns a stable unauthorized error when Supabase rejects credentials', async () => {
    mocks.signInWithPassword.mockResolvedValue({
      data: { user: null, session: null },
      error: { status: 400, code: 'invalid_credentials' },
    });
    const { caller } = createCaller();

    await expect(
      caller.login({ email: profile.email, password: 'wrong-password' })
    ).rejects.toMatchObject({ code: 'UNAUTHORIZED', message: 'Invalid email or password' });
  });
});
