import { getUserProfile } from '@/lib/api';
import { checkIfRequestFailed } from '@/lib/api-responses';
import { useUserData } from '@/lib/context';
import { useCallback } from 'react';

export type UserBootstrapResult = 'ready' | 'unauthorized' | 'failed';

export function useUserBootstrapApi() {
  const setCurrentOrg = useUserData((state) => state.setCurrentOrg);
  const setUserProfile = useUserData((state) => state.setUserProfile);

  const loadUserData = useCallback(async (): Promise<UserBootstrapResult> => {
    const profile = await getUserProfile({});
    if (checkIfRequestFailed(profile)) {
      return profile.statusCode === 401 ? 'unauthorized' : 'failed';
    }
    if (profile.data) {
      setUserProfile(profile.data);
      setCurrentOrg({
        orgId: profile.data.orgSummary.orgId,
        orgName: profile.data.orgSummary.orgName,
      });
    }

    return 'ready';
  }, [setCurrentOrg, setUserProfile]);

  return { loadUserData };
}
