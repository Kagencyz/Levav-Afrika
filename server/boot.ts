import { serve } from '@hono/node-server';
import { env } from './lib/env';
import { app } from './app';

// Standalone Node server entry point — used by `npm run dev:server` /
// `start:server` (tsup-bundled to dist-server/boot.js). Not used by the
// Vercel deployment, which imports `app` directly via api/index.ts and
// invokes it per-request instead of binding a persistent port.
serve({
  fetch: app.fetch,
  port: env.PORT,
});

console.log(`Levav Talent Afrika server running on port ${env.PORT}`);
