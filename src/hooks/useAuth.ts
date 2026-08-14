import { useCallback, useMemo } from 'react';
import { trpc } from '@/providers/trpc';

export interface User {
  id: string | number;
  name?: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: string;
  avatar?: string;
}

export function useAuth() {
  const utils = trpc.useUtils();
  const { data: serverUser, isLoading } = trpc.auth.me.useQuery(undefined, {
    retry: false,
    refetchOnWindowFocus: false,
  });

  // Server users carry only `name`; derive first/last for UI that expects them.
  const user = useMemo(() => {
    if (!serverUser) return undefined;
    const parts = (serverUser.name ?? '').trim().split(/\s+/);
    return {
      ...serverUser,
      firstName: parts[0] ?? '',
      lastName: parts.slice(1).join(' '),
      role: serverUser.accessLevel === 'admin' ? 'admin' : 'talent',
    } as User;
  }, [serverUser]);

  const logout = useCallback(() => {
    // Clears the httpOnly auth cookie server-side — it can't be read or
    // cleared from JS. Feature-local prototype state (onboarding drafts,
    // profile forms) is still browser-local cleanup, not auth state.
    utils.client.auth.logout.mutate().finally(() => {
      const keysToRemove = [
        'onboarding_data',
        'talent_profiles',
        'employer_profiles',
        'employer_data',
        'profile_data',
      ];
      keysToRemove.forEach((key) => localStorage.removeItem(key));
      utils.invalidate();
      window.location.reload();
    });
  }, [utils]);

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    logout,
  };
}
