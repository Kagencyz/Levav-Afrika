import { createClient } from '@supabase/supabase-js';
import { env } from './env.js';

/**
 * Creates an isolated Auth client for one server request. A shared client can
 * leak mutable session state between concurrent serverless invocations.
 */
export function createSupabaseAuthClient() {
  return createClient(env.SUPABASE_URL, env.SUPABASE_PUBLISHABLE_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
    },
  });
}
