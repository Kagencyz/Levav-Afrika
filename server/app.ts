import { env } from './lib/env';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { fetchRequestHandler } from '@trpc/server/adapters/fetch';
import { appRouter } from './router';
import { createContext } from './context';

export const app = new Hono();

// CORS — scoped to configured origins, never '*'
app.use('*', cors({
  origin: env.CORS_ORIGINS,
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
}));

// Health check
app.get('/health', (c) => c.json({ status: 'ok', time: new Date().toISOString() }));

// tRPC handler
app.all('/api/trpc/*', async (c) => {
  const req = c.req.raw;
  return fetchRequestHandler({
    endpoint: '/api/trpc',
    req,
    router: appRouter,
    createContext: async () => createContext(req),
  });
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
