import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './db/schema.ts',
  out: './db/migrations',
  dialect: 'postgresql',
  // Defensive: restricts introspection/generation scope to `public`. Not
  // required for the auth.users FK to work (drizzle-orm/supabase's authUsers
  // reference table was already handled correctly without this — see the
  // migration review), but guards future `push`/`pull`/introspection
  // workflows from ever attempting to manage the `auth` schema.
  schemaFilter: ['public'],
  dbCredentials: {
    url: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/levav',
  },
});
