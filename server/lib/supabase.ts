import { createClient } from '@supabase/supabase-js';
import { env } from './env.js';

const AUTH_REQUEST_TIMEOUT_MS = 8_000;

function fetchWithTimeout(input: RequestInfo | URL, init?: RequestInit) {
  const timeout = AbortSignal.timeout(AUTH_REQUEST_TIMEOUT_MS);
  const signal = init?.signal ? AbortSignal.any([init.signal, timeout]) : timeout;
  return fetch(input, { ...init, signal });
}

/**
 * Creates an isolated Auth client for one server request. A shared client can
 * leak mutable session state between concurrent serverless invocations.
 */
export function createSupabaseAuthClient() {
  return createClient(env.SUPABASE_URL, env.SUPABASE_PUBLISHABLE_KEY, {
    global: { fetch: fetchWithTimeout },
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
    },
  });
}
