import { verifyToken } from './lib/jwt';

export async function createContext(req: Request) {
  const auth = req.headers.get('authorization');
  let user = null;
  if (auth?.startsWith('Bearer ')) {
    const token = auth.slice(7);
    user = await verifyToken(token);
  }
  return { user };
}

export type Context = Awaited<ReturnType<typeof createContext>>;
