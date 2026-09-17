import { create } from 'zustand';
import { GetUserProfileResponse } from './response-types';

export const useUserData = create<{
  //current org
  currentOrg:
    | {
        orgName: string;
        orgId: string;
      }
    | undefined;
  setCurrentOrg: (org: { orgName: string; orgId: string } | undefined) => void;

  // user profile
  userProfile: GetUserProfileResponse | undefined;
  setUserProfile: (profile: GetUserProfileResponse) => void;
}>((set) => ({
  currentOrg: undefined,
  setCurrentOrg: (org: { orgName: string; orgId: string } | undefined) =>
    set({ currentOrg: org }),
  userProfile: undefined,
  setUserProfile: (profile: GetUserProfileResponse) =>
    set({ userProfile: profile }),
}));

export const useOrgId = () => {
  const { currentOrg } = useUserData();
  return currentOrg?.orgId;
};
