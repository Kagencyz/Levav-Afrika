import { useCallback, useMemo } from 'react';
import { trpc } from '@/providers/trpc';
import { safeJSONParse } from '@/lib/safeJSON';
import { logWithCurrentUser } from '@/lib/auditService';

export interface User {
  id: string | number;
  name?: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: string;
  avatar?: string;
}

/** Validate that a token is a properly formatted demo token */
function isValidToken(token: string | null): boolean {
  return !!token && token.startsWith('demo_token_') && token.length > 'demo_token_'.length;
}

/** Validate that a user object has required fields and valid shape */
function isValidUser(user: unknown): user is User {
  if (!user || typeof user !== 'object') return false;
  const u = user as Record<string, unknown>;
  // Must have at least id and email
  if (!u.id || !u.email || typeof u.email !== 'string') return false;
  // Role must be a known value
  const validRoles = ['talent', 'employer', 'admin', 'champion'];
  if (!u.role || !validRoles.includes(u.role as string)) return false;
  return true;
}

export function useAuth() {
  const utils = trpc.useUtils();
  const logoutMutation = trpc.auth.logout.useMutation();
  const { data: serverUser, isLoading: serverLoading } = trpc.auth.me.useQuery(undefined, {
    retry: false,
    refetchOnWindowFocus: false,
  });

  // Fallback: check localStorage for demo/static deployment
  const localUser = useMemo(() => {
    const token = localStorage.getItem('token') || localStorage.getItem('auth_token');
    // SECURITY FIX: Validate token format, not just existence
    if (!isValidToken(token)) return null;
    const parsed = safeJSONParse('user', null);
    // SECURITY FIX: Validate user object shape before accepting
    if (isValidUser(parsed)) return parsed as User;
    return null;
  }, []);

  const user = serverUser || localUser;
  const isLoading = serverLoading;

  const logout = useCallback(() => {
    // Log the logout event before clearing auth state
    logWithCurrentUser('logout', 'Authentication', 'info');

    logoutMutation.mutate(undefined, {
      onSettled: () => {
        // SECURITY FIX: Clear ALL auth-related localStorage keys
        const keysToRemove = [
          'token',
          'auth_token',
          'user',
          'onboarding_data',
          'talent_profiles',
          'employer_profiles',
          'employer_data',
          'profile_data',
        ];
        keysToRemove.forEach((key) => localStorage.removeItem(key));
        utils.invalidate();
        window.location.reload();
      },
    });
  }, [logoutMutation, utils]);

  return {
    user: user as User | undefined,
    isLoading,
    isAuthenticated: !!user,
    logout,
  };
}
