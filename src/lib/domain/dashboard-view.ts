import { getDashboardVersion, listVars } from '@/lib/api';
import { useUserData } from '@/lib/context';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { dashboardKeys } from './query-keys';

function requireOrgId(orgId?: string) {
  if (!orgId) {
    throw new Error('No current organization selected');
  }
  return orgId;
}

export function useDashboardViewApi({
  dashboardId,
  versionId,
}: {
  dashboardId: string;
  versionId: string;
}) {
  const orgId = useUserData((state) => state.currentOrg?.orgId);
  const qc = useQueryClient();

  const dashboardQuery = useQuery({
    queryKey: dashboardKeys.detail(dashboardId),
    enabled: Boolean(orgId && dashboardId && versionId),
    queryFn: () =>
      getDashboardVersion({
        orgId: requireOrgId(orgId),
        dashboardId,
        versionId,
      }),
  });

  const varsQuery = useQuery({
    queryKey: dashboardKeys.vars(dashboardId),
    enabled: Boolean(orgId && dashboardId),
    queryFn: () =>
      listVars({
        orgId: requireOrgId(orgId),
        dashboardId,
      }),
  });

  return {
    dashboardQuery,
    varsQuery,
    refreshPanels: async () => {
      await qc.invalidateQueries({ queryKey: dashboardKeys.panelData });
      await qc.refetchQueries({ queryKey: dashboardKeys.panelData });
    },
  };
}
