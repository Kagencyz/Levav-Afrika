import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema.js';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is required');
}

// Supabase's pooler requires TLS on external connections; pg does not
// negotiate SSL on its own unless told to, and a TLS-expecting server
// getting a plaintext handshake tends to hang rather than fail fast. Local
// dev Postgres (no NODE_ENV=production) has no TLS listener, so this stays
// off there.
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : undefined,
});

export const db = drizzle(pool, { schema });
