import { AUTH_COOKIE_NAME, verifyToken } from './lib/jwt.js';

function parseCookies(header: string | null): Record<string, string> {
  const out: Record<string, string> = {};
  if (!header) return out;
  for (const part of header.split(';')) {
    const eq = part.indexOf('=');
    if (eq === -1) continue;
    const key = part.slice(0, eq).trim();
    const value = part.slice(eq + 1).trim();
    if (key) out[key] = decodeURIComponent(value);
  }
  return out;
}

/**
 * Mutable per-request signal, written by procedures (auth.register/login/
 * logout) and read back by server/app.ts's responseMeta to issue the
 * Set-Cookie header — tRPC procedures can't set response headers directly,
 * so this is threaded through ctx instead. Only one of setToken/clearToken
 * should ever be set in a given request.
 */
export interface SessionIntent {
  setToken?: string;
  clearToken?: boolean;
}

export async function createContext(req: Request) {
  const cookies = parseCookies(req.headers.get('cookie'));
  let token: string | null = cookies[AUTH_COOKIE_NAME] ?? null;

  // Bearer header kept only as a fallback for non-browser API clients —
  // the web app itself relies solely on the httpOnly cookie.
  if (!token) {
    const auth = req.headers.get('authorization');
    if (auth?.startsWith('Bearer ')) token = auth.slice(7);
  }

  const user = token ? await verifyToken(token) : null;
  const session: SessionIntent = {};

  return { user, session };
}

export type Context = Awaited<ReturnType<typeof createContext>>;
