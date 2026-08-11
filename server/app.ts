import { env } from './lib/env.js';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { fetchRequestHandler } from '@trpc/server/adapters/fetch';
import { appRouter } from './router.js';
import { createContext, AUTH_COOKIE_NAME } from './context.js';

export const app = new Hono();

// CORS — scoped to configured origins, never '*'. credentials: true is
// required for the httpOnly auth cookie to be sent/accepted cross-origin
// (e.g. a preview deployment on a different subdomain); the frontend and
// API are same-origin in production, where this is a no-op safety net.
app.use('*', cors({
  origin: env.CORS_ORIGINS,
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));

// Health check
app.get('/health', (c) => c.json({ status: 'ok', time: new Date().toISOString() }));

const SEVEN_DAYS_SECONDS = 7 * 24 * 60 * 60;

/**
 * Auth is transported as an httpOnly cookie, not a token in the response
 * body — a procedure can't set response headers directly, so auth.ts
 * signals intent via ctx.session and this reads it back once the request
 * has resolved. See docs/BACKEND_READINESS_REVIEW.md for why this replaced
 * the earlier Bearer-token-in-localStorage design.
 */
function buildAuthCookie(token: string | null): string {
  const parts = [
    `${AUTH_COOKIE_NAME}=${token ?? ''}`,
    'Path=/',
    'HttpOnly',
    'SameSite=Lax',
  ];
  if (env.NODE_ENV === 'production') parts.push('Secure');
  parts.push(token ? `Max-Age=${SEVEN_DAYS_SECONDS}` : 'Max-Age=0');
  return parts.join('; ');
}

// tRPC handler
app.all('/api/trpc/*', async (c) => {
  const req = c.req.raw;
  const response = await fetchRequestHandler({
    endpoint: '/api/trpc',
    req,
    router: appRouter,
    createContext: async () => createContext(req),
    responseMeta({ ctx }) {
      if (ctx?.session.setToken) {
        return { headers: new Headers({ 'Set-Cookie': buildAuthCookie(ctx.session.setToken) }) };
      }
      if (ctx?.session.clearToken) {
        return { headers: new Headers({ 'Set-Cookie': buildAuthCookie(null) }) };
      }
      return {};
    },
  });

  return response;
});

// SPA fallback — serve dist/index.html for non-API routes when this app is
// run as the standalone Node server (server/boot.ts). Not exercised when
// deployed on Vercel, since vercel.json only routes /api/* to this app —
// Vercel's own static hosting serves the frontend directly in that case.
app.get('*', async (c) => {
  try {
    const fs = await import('node:fs/promises');
    const path = await import('node:path');
    const url = new URL(c.req.url);
    const distPath = path.resolve('dist');

    // Try to serve the requested file from dist
    const filePath = path.join(distPath, url.pathname === '/' ? 'index.html' : url.pathname);
    const stat = await fs.stat(filePath).catch(() => null);

    if (stat?.isFile()) {
      const ext = path.extname(filePath);
      const contentTypes: Record<string, string> = {
        '.html': 'text/html',
        '.js': 'application/javascript',
        '.css': 'text/css',
        '.json': 'application/json',
        '.png': 'image/png',
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.svg': 'image/svg+xml',
        '.ico': 'image/x-icon',
      };
      const content = await fs.readFile(filePath);
      return c.newResponse(content, 200, {
        'Content-Type': contentTypes[ext] || 'application/octet-stream',
      });
    }

    // Fallback to index.html for SPA routing
    const indexHtml = await fs.readFile(path.join(distPath, 'index.html'), 'utf-8');
    return c.html(indexHtml);
  } catch {
    return c.text('Not Found', 404);
  }
});
