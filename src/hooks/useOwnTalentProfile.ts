import { trpc } from '@/providers/trpc';

export interface TalentProfileInput {
  name: string;
  bio: string;
  category: string;
  skills: string[];
  location: string;
}

/**
 * Single source of truth for "does the current user have a real talent
 * profile, and how do I create/update it" — shared by Onboarding.tsx and
 * ProfileCreate.tsx so both pages write to the same backend record instead
 * of each hand-rolling a localStorage-only profile object.
 */
export function useOwnTalentProfile() {
  const utils = trpc.useUtils();
  const query = trpc.talent.getOwnProfile.useQuery();
  const createMutation = trpc.talent.createOwnProfile.useMutation();
  const updateMutation = trpc.talent.updateOwnProfile.useMutation();

  const save = async (input: TalentProfileInput) => {
    const result = query.data
      ? await updateMutation.mutateAsync({ id: query.data.id, ...input })
      : await createMutation.mutateAsync(input);
    await utils.talent.getOwnProfile.invalidate();
    return result;
  };

  return {
    profile: query.data,
    isLoading: query.isLoading,
    save,
    isSaving: createMutation.isPending || updateMutation.isPending,
  };
}
