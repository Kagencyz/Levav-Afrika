import { env } from './env.js';

const AUTH_REQUEST_TIMEOUT_MS = 8_000;

type AuthUser = { id: string };
type AuthSession = { access_token: string };
type AuthError = { status: number; code?: string };

export type AuthResult = {
  data: { user: AuthUser | null; session: AuthSession | null };
  error: AuthError | null;
};

type AuthPayload = {
  id?: unknown;
  user?: { id?: unknown } | null;
  session?: { access_token?: unknown } | null;
  access_token?: unknown;
  error_code?: unknown;
  code?: unknown;
};

async function authRequest(path: string, body: object): Promise<AuthResult> {
  const response = await fetch(`${env.SUPABASE_URL}/auth/v1/${path}`, {
    method: 'POST',
    headers: {
      apikey: env.SUPABASE_PUBLISHABLE_KEY,
      'content-type': 'application/json',
    },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(AUTH_REQUEST_TIMEOUT_MS),
  });

  const payload = (await response.json().catch(() => ({}))) as AuthPayload;
  if (!response.ok) {
    const code = typeof payload.error_code === 'string'
      ? payload.error_code
      : typeof payload.code === 'string'
        ? payload.code
        : undefined;
    return {
      data: { user: null, session: null },
      error: { status: response.status, code },
    };
  }

  // GoTrue returns the user directly for confirmation-required signup, while
  // authenticated signup/login responses include a nested user and token.
  const userId = typeof payload.user?.id === 'string'
    ? payload.user.id
    : typeof payload.id === 'string'
      ? payload.id
      : null;
  const accessToken = typeof payload.access_token === 'string'
    ? payload.access_token
    : typeof payload.session?.access_token === 'string'
      ? payload.session.access_token
      : null;

  return {
    data: {
      user: userId ? { id: userId } : null,
      session: accessToken ? { access_token: accessToken } : null,
    },
    error: null,
  };
}

export function signUpWithPassword(email: string, password: string, name: string) {
  return authRequest('signup', { email, password, data: { name } });
}

export function signInWithPassword(email: string, password: string) {
  return authRequest('token?grant_type=password', { email, password });
}
