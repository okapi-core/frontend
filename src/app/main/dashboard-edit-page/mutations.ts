import { useDashboardEditorApi } from '@/lib/domain/dashboard-editor';

export function useUpdateDashboardMutation({
  dashboardId,
}: {
  dashboardId: string;
}) {
  const api = useDashboardEditorApi({ dashboardId, versionId: '' });
  return {
    mutate: (input: any) => {
      const req = input?.req ?? input;
      if (req?.title !== undefined) api.updateTitle(req.title);
      if (req?.desc !== undefined) api.updateDescription(req.desc);
      if (req?.tags !== undefined) api.updateTags(req.tags);
    },
    isPending: api.updateDashboardPending,
  };
}

export function useCreateRowMutation({ dashboardId }: { dashboardId: string }) {
  const api = useDashboardEditorApi({ dashboardId, versionId: '' });
  return { mutate: () => api.createRow(), isPending: api.createRowPending };
}

export function useUpdateRowMutation({ dashboardId }: { dashboardId: string }) {
  const api = useDashboardEditorApi({ dashboardId, versionId: '' });
  return {
    mutate: (input: any) => {
      const rowId = input?.rowId ?? input?.req?.rowId;
      if (!rowId) return;
      if (input?.req?.title !== undefined) api.updateRowTitle(rowId, input.req.title);
      if (input?.req?.description !== undefined) {
        api.updateRowDescription(rowId, input.req.description);
      }
    },
  };
}

export function useDeleteRowMutation({ dashboardId }: { dashboardId: string }) {
  const api = useDashboardEditorApi({ dashboardId, versionId: '' });
  return { mutate: (input: any) => api.deleteRow(input?.rowId ?? input) };
}

export function useCreatePanelMutation({
  dashboardId,
}: {
  dashboardId: string;
}) {
  const api = useDashboardEditorApi({ dashboardId, versionId: '' });
  return { mutate: (input: any) => api.createPanel(input?.req?.rowId ?? input?.rowId) };
}

export function useCreateVarMutation({ dashboardId }: { dashboardId: string }) {
  const api = useDashboardEditorApi({ dashboardId, versionId: '' });
  return {
    mutate: (input: any) =>
      api.createVar({
        name: input?.req?.name,
        type: input?.req?.dashVarType,
        tag: input?.req?.tag || '',
      }),
    isPending: api.createVarPending,
  };
}

export function useDeleteVarMutation({ dashboardId }: { dashboardId: string }) {
  const api = useDashboardEditorApi({ dashboardId, versionId: '' });
  return {
    mutate: (input: any) => api.deleteVar(input?.req?.name ?? input?.name),
    isPending: api.deleteVarPending,
  };
}
