import { SignJWT, jwtVerify } from 'jose';
import { env } from './env.js';

export const AUTH_COOKIE_NAME = 'levav_auth_token';

const SECRET = new TextEncoder().encode(env.JWT_SECRET);

export async function signToken(payload: {
  userId: string;
  email: string;
  accessLevel: string;
}) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(SECRET);
}

export async function verifyToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, SECRET, {
      clockTolerance: 60,
    });
    return payload as { userId: string; email: string; accessLevel: string };
  } catch {
    return null;
  }
}

export function buildAuthCookie(token: string | null) {
  const isSecure = env.NODE_ENV === 'production';
  const securePart = isSecure ? ' Secure;' : '';
  const maxAge = token ? 60 * 60 * 24 * 7 : 0;
  return `${AUTH_COOKIE_NAME}=${token ?? ''}; Path=/; HttpOnly; SameSite=Lax;${securePart} Max-Age=${maxAge}`;
}
