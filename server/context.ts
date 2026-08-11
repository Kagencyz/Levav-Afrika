import { AUTH_COOKIE_NAME, verifyToken } from './lib/jwt';

export async function createContext(req: Request) {
  const cookieHeader = req.headers.get('cookie') || '';
  const cookies = cookieHeader.split(';').map((part) => part.trim());
  const authCookie = cookies.find((entry) => entry.startsWith(`${AUTH_COOKIE_NAME}=`));

  let user = null;

  if (authCookie) {
    const token = decodeURIComponent(authCookie.slice(AUTH_COOKIE_NAME.length + 1));
    user = await verifyToken(token);
  }

  return { user };
}

export type Context = Awaited<ReturnType<typeof createContext>>;
