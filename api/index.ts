import { handle } from 'hono/vercel';
import { app } from '../server/app.js';

// The ONLY public file under api/ — this is deliberate. Vercel's Node.js
// runtime treats every file directly under api/ (at any depth) as its own
// Serverless Function; the previous ~19 files here exceeded the Hobby
// plan's 12-function limit. All backend source now lives in server/ and is
// bundled into this single function via Vercel's own build step. See
// docs/DECISIONS.md for the full rationale.
export default handle(app);
