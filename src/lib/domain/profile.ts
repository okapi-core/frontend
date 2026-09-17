import { getUserProfile, updateUserProfile } from '@/lib/api';
import { checkIfRequestFailed } from '@/lib/api-responses';
import { UpdateUserRequest } from '@/lib/request-types';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export const profileKeys = {
  current: ['user-profile'] as const,
};

export function useProfileApi() {
  const qc = useQueryClient();
  const profileQuery = useQuery({
    queryKey: profileKeys.current,
    queryFn: () => getUserProfile({}),
  });
  const updateProfileMutation = useMutation({
    mutationFn: async (updateUserRequest: UpdateUserRequest) => {
      const res = await updateUserProfile({ updateUserRequest });
      if (checkIfRequestFailed(res)) {
        throw new Error(res.error || 'Failed to update profile');
      }
      return res;
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: profileKeys.current });
    },
  });
  return {
    profileQuery,
    updateProfile: updateProfileMutation.mutateAsync,
    updateProfilePending: updateProfileMutation.isPending,
  };
}
