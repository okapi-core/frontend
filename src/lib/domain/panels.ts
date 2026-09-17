import { getPanel, updatePanel } from '@/lib/api';
import { checkIfRequestFailed } from '@/lib/api-responses';
import { useUserData } from '@/lib/context';
import { UpdateDashboardPanelRequest } from '@/lib/request-types';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { dashboardKeys } from './query-keys';

function requireOrgId(orgId?: string) {
  if (!orgId) throw new Error('No current organization selected');
  return orgId;
}

export function usePanelEditorApi({
  dashboardId,
  versionId,
  rowId,
  panelId,
}: {
  dashboardId: string;
  versionId: string;
  rowId: string;
  panelId: string;
}) {
  const orgId = useUserData((s) => s.currentOrg?.orgId);
  const qc = useQueryClient();
  const panelQuery = useQuery({
    queryKey: dashboardKeys.panelProps(dashboardId, rowId, panelId),
    enabled: Boolean(orgId && dashboardId && versionId && rowId && panelId),
    queryFn: () =>
      getPanel({
        orgId: requireOrgId(orgId),
        dashboardId,
        versionId,
        rowId,
        panelId,
      }),
  });
  const updatePanelMutation = useMutation({
    mutationFn: async (req: UpdateDashboardPanelRequest) => {
      const res = await updatePanel({
        orgId: requireOrgId(orgId),
        dashboardId,
        versionId,
        rowId,
        panelId,
        req,
      });
      if (checkIfRequestFailed(res)) {
        throw new Error(res.error || 'Failed to save panel');
      }
      return res;
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: dashboardKeys.detail(dashboardId) });
      await qc.invalidateQueries({
        queryKey: dashboardKeys.panelProps(dashboardId, rowId, panelId),
      });
    },
  });
  return {
    panelQuery,
    savePanel: updatePanelMutation.mutateAsync,
    savePanelPending: updatePanelMutation.isPending,
  };
}
