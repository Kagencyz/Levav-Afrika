import { handle } from '@hono/node-server/vercel';
import { app } from '../server/app.js';

// The ONLY public file under api/ — this is deliberate. Vercel's Node.js
// runtime treats every file directly under api/ (at any depth) as its own
// Serverless Function; the previous ~19 files here exceeded the Hobby
// plan's 12-function limit. All backend source now lives in server/ and is
// bundled into this single function via Vercel's own build step. See
// docs/DECISIONS.md for the full rationale.
//
// Uses @hono/node-server's Vercel adapter, not hono/vercel: this function
// runs on Vercel's Node.js runtime (required for `pg`'s raw TCP sockets,
// which Edge Runtime can't do), and hono/vercel's handle() assumes it's
// handed an already-correct Fetch Request — true on Edge, but Node.js
// functions actually receive a raw (IncomingMessage, ServerResponse) pair,
// which crashed every request with "this.raw.headers.get is not a
// function". @hono/node-server/vercel's handle() does the real conversion.
export default handle(app);
