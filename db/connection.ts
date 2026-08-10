import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema.js';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is required');
}

// Supabase's pooler requires TLS on external connections; pg does not
// negotiate SSL on its own unless told to, and a TLS-expecting server
// getting a plaintext handshake tends to hang rather than fail fast.
// Gating this on NODE_ENV === 'production' is unreliable — Vercel sets
// that during the build step but doesn't consistently propagate it into a
// serverless function's runtime process.env — so key it on the actual
// connection target instead: local/loopback Postgres has no TLS listener,
// anything else (Supabase's pooler) does.
const dbHost = new URL(process.env.DATABASE_URL).hostname;
const isLocalDb = dbHost === 'localhost' || dbHost === '127.0.0.1' || dbHost === '::1';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: isLocalDb ? undefined : { rejectUnauthorized: false },
  // Fail fast instead of hanging until Vercel force-kills the function on
  // its execution-time limit, which is what turned a bad connection into
  // an infinite spinner for the user instead of a clear error.
  connectionTimeoutMillis: 8000,
});

export const db = drizzle(pool, { schema });
