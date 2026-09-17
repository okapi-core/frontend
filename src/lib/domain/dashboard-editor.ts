import {
  createPanel,
  createRow,
  createVar,
  deletePanel,
  deleteRow,
  deleteVar,
  updateDashboard,
  updateRow,
} from '@/lib/api';
import { checkIfRequestFailed } from '@/lib/api-responses';
import { useAppServices } from '@/lib/app-services';
import { useUserData } from '@/lib/context';
import { generateRandomId } from '@/lib/id-gen';
import { DASH_VAR_TYPE, UpdateDashboardRequest } from '@/lib/request-types';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { dashboardKeys } from './query-keys';

function requireOrgId(orgId?: string) {
  if (!orgId) {
    throw new Error('No current organization selected');
  }
  return orgId;
}

function requireSuccessfulResponse<T>(res: {
  data?: T;
  error?: string;
  statusCode?: number;
}) {
  if (checkIfRequestFailed(res)) {
    throw new Error(res.error || 'Request failed');
  }
  return res;
}

export function useDashboardEditorApi({
  dashboardId,
  versionId,
}: {
  dashboardId: string;
  versionId: string;
}) {
  const orgId = useUserData((state) => state.currentOrg?.orgId);
  const qc = useQueryClient();
  const { notify } = useAppServices();

  const invalidateDashboard = async () => {
    await qc.invalidateQueries({ queryKey: dashboardKeys.detail(dashboardId) });
  };

  const updateDashboardMutation = useMutation({
    mutationFn: async (req: UpdateDashboardRequest) => {
      const res = await updateDashboard({
        orgId: requireOrgId(orgId),
        dashboardId,
        req,
      });
      requireSuccessfulResponse(res);
      return res;
    },
    onSuccess: invalidateDashboard,
  });

  const createRowMutation = useMutation({
    mutationFn: async (input?: { title?: string }) => {
      const res = await createRow({
        orgId: requireOrgId(orgId),
        dashboardId,
        versionId,
        req: {
          rowId: generateRandomId(),
          title: input?.title || 'New Row',
        },
      });
      requireSuccessfulResponse(res);
      return res;
    },
    onSuccess: invalidateDashboard,
  });

  const updateRowMutation = useMutation({
    mutationFn: async (input: {
      rowId: string;
      title?: string;
      description?: string;
      panelIds?: string[];
    }) => {
      const res = await updateRow({
        orgId: requireOrgId(orgId),
        dashboardId,
        versionId,
        rowId: input.rowId,
        req: {
          title: input.title,
          description: input.description,
          panelIds: input.panelIds,
        },
      });
      requireSuccessfulResponse(res);
      return res;
    },
    onSuccess: invalidateDashboard,
  });

  const deleteRowMutation = useMutation({
    mutationFn: async (rowId: string) => {
      const res = await deleteRow({
        orgId: requireOrgId(orgId),
        dashboardId,
        versionId,
        rowId,
      });
      requireSuccessfulResponse(res);
      return res;
    },
    onSuccess: invalidateDashboard,
  });

  const createPanelMutation = useMutation({
    mutationFn: async (rowId: string) => {
      const res = await createPanel({
        orgId: requireOrgId(orgId),
        dashboardId,
        versionId,
        rowId,
        req: {
          panelId: generateRandomId(),
          title: 'New Panel',
          note: '',
          grammar: 'OKAPI_JSON',
          queryConfig: [],
        },
      });
      requireSuccessfulResponse(res);
      return res;
    },
    onSuccess: invalidateDashboard,
  });

  const deletePanelMutation = useMutation({
    mutationFn: async ({
      rowId,
      panelId,
    }: {
      rowId: string;
      panelId: string;
    }) => {
      const res = await deletePanel({
        orgId: requireOrgId(orgId),
        dashboardId,
        versionId,
        rowId,
        panelId,
      });
      requireSuccessfulResponse(res);
      return res;
    },
    onSuccess: invalidateDashboard,
  });

  const createVarMutation = useMutation({
    mutationFn: async (values: {
      name: string;
      type: DASH_VAR_TYPE;
      tag: string;
    }) => {
      const res = await createVar({
        orgId: requireOrgId(orgId),
        dashboardId,
        req: {
          dashVarType: values.type,
          name: values.name,
          tag: values.type === 'TAG_VALUE' ? values.tag : undefined,
        },
      });
      requireSuccessfulResponse(res);
      return res;
    },
    onSuccess: async () => {
      notify.success('Variable created.');
      await qc.invalidateQueries({ queryKey: dashboardKeys.vars(dashboardId) });
    },
  });

  const deleteVarMutation = useMutation({
    mutationFn: async (name: string) => {
      const res = await deleteVar({
        orgId: requireOrgId(orgId),
        dashboardId,
        name,
      });
      requireSuccessfulResponse(res);
      return res;
    },
    onSuccess: async () => {
      notify.success('Variable deleted.');
      await qc.invalidateQueries({ queryKey: dashboardKeys.vars(dashboardId) });
    },
  });

  return {
    updateTitle: (title: string) => updateDashboardMutation.mutate({ title }),
    updateDescription: (desc: string) =>
      updateDashboardMutation.mutate({ desc }),
    updateTags: (tags: string[]) => updateDashboardMutation.mutate({ tags }),
    createRow: () => createRowMutation.mutate({ title: 'New Row' }),
    updateRowTitle: (rowId: string, title: string) =>
      updateRowMutation.mutate({ rowId, title }),
    updateRowDescription: (rowId: string, description: string) =>
      updateRowMutation.mutate({ rowId, description }),
    createPanel: (rowId: string) => createPanelMutation.mutate(rowId),
    deleteRow: (rowId: string) => deleteRowMutation.mutate(rowId),
    deletePanel: (rowId: string, panelId: string) =>
      deletePanelMutation.mutateAsync({ rowId, panelId }),
    createVar: createVarMutation.mutate,
    deleteVar: deleteVarMutation.mutate,
    createRowPending: createRowMutation.isPending,
    updateDashboardPending: updateDashboardMutation.isPending,
    createVarPending: createVarMutation.isPending,
    deleteVarPending: deleteVarMutation.isPending,
    deletePanelPending: deletePanelMutation.isPending,
  };
}
