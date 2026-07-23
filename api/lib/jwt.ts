import { SignJWT, jwtVerify } from 'jose';
import { env } from './env';

const SECRET = new TextEncoder().encode(env.JWT_SECRET);

export async function signToken(payload: {
  userId: number;
  email: string;
  role: string;
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
    return payload as { userId: number; email: string; role: string };
  } catch {
    return null;
  }
}
