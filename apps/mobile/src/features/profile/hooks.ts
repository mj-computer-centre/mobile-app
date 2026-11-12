import type { CompleteProfileValues } from '@mcc/shared';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { accessKeys, signOut, useUserId } from '@/features/auth';

import { deleteMyAccount, fetchMyProfile, saveMyProfile } from './api';

export const profileKeys = {
  mine: (userId: string) => ['profile', userId] as const,
};

export function useMyProfile() {
  const userId = useUserId();
  return useQuery({ queryKey: profileKeys.mine(userId), queryFn: () => fetchMyProfile(userId) });
}

export function useSaveProfile() {
  const userId = useUserId();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (values: CompleteProfileValues) => saveMyProfile(userId, values),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: profileKeys.mine(userId) }),
        // Completing the profile unlocks the app; the access gate reads this.
        queryClient.invalidateQueries({ queryKey: accessKeys.forUser(userId) }),
      ]);
    },
  });
}

export function useDeleteAccount() {
  return useMutation({
    mutationFn: async () => {
      await deleteMyAccount();
      await signOut();
    },
  });
}
