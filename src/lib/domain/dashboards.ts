import {
  apply,
  createDashboard,
  deleteDashboard,
  listDashboards,
  updateDashboard,
} from '@/lib/api';
import { ApiResponse, checkIfRequestFailed } from '@/lib/api-responses';
import { useUserData } from '@/lib/context';
import { CreateDashboardRequest } from '@/lib/request-types';
import {
  BulkApplyDashboardYamlResponse,
  TokenResponse,
} from '@/lib/response-types';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { dashboardKeys } from './query-keys';

const defaultDashboardRequest: CreateDashboardRequest = {
  title: 'New Dashboard',
  description: 'New shiny dashboard',
};

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

export function useDashboardsApi() {
  const orgId = useUserData((state) => state.currentOrg?.orgId);
  const qc = useQueryClient();

  const listQuery = useQuery({
    queryKey: dashboardKeys.list(orgId),
    enabled: Boolean(orgId),
    queryFn: () => listDashboards({ orgId: requireOrgId(orgId) }),
  });

  const createMutation = useMutation({
    mutationFn: async (req?: CreateDashboardRequest) => {
      const res = await createDashboard({
        orgId: requireOrgId(orgId),
        req: req || defaultDashboardRequest,
      });
      requireSuccessfulResponse(res);

      const dashboardId = res.data?.dashboardId;
      const versionId = res.data?.activeVersion;
      if (!dashboardId) {
        throw new Error('Failed to create dashboard');
      }
      if (!versionId) {
        throw new Error('No dashboard version found');
      }

      return { dashboardId, versionId, dashboard: res.data };
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: dashboardKeys.list(orgId) });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (dashboardId: string) => {
      const res = await deleteDashboard({
        orgId: requireOrgId(orgId),
        dashboardId,
      });
      requireSuccessfulResponse(res);
      return res;
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: dashboardKeys.list(orgId) });
    },
  });

  const favoriteMutation = useMutation({
    mutationFn: async ({
      dashboardId,
      favorite,
    }: {
      dashboardId: string;
      favorite: boolean;
    }) => {
      const res = await updateDashboard({
        orgId: requireOrgId(orgId),
        dashboardId,
        req: { isFavorite: favorite },
      });
      requireSuccessfulResponse(res);
      return res;
    },
    onSuccess: async (_res, variables) => {
      await qc.invalidateQueries({ queryKey: dashboardKeys.list(orgId) });
      await qc.invalidateQueries({
        queryKey: dashboardKeys.detail(variables.dashboardId),
      });
    },
  });

  const bulkApplyMutation = useMutation({
    mutationFn: async (file: File) => {
      const fileName = file.name.toLowerCase();
      const isZip = fileName.endsWith('.zip');

      if (!isZip) {
        const res = await apply({
          orgId: requireOrgId(orgId),
          req: { yaml: await file.text() },
        });
        requireSuccessfulResponse(res);
        return { kind: 'yaml' as const, response: res };
      }

      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(
        `/api/v1/orgs/${requireOrgId(orgId)}/dashboards/yaml/bulk-apply`,
        {
          method: 'POST',
          body: formData,
        },
      );

      const responseText = await response.text();
      let data: BulkApplyDashboardYamlResponse | undefined;
      try {
        data = responseText
          ? (JSON.parse(responseText) as BulkApplyDashboardYamlResponse)
          : undefined;
      } catch {
        // Preserve the response text below when the server returns non-JSON.
      }

      const res = {
        data,
        error: response.ok ? undefined : responseText,
        statusCode: response.status,
      };
      requireSuccessfulResponse(res);
      return { kind: 'zip' as const, response: res };
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: dashboardKeys.list(orgId) });
    },
  });

  const createPublicationTokenMutation = useMutation<
    ApiResponse<TokenResponse>,
    Error
  >({
    mutationFn: async () => {
      throw new Error(
        'Publication token API is not available in the current backend',
      );
    },
  });

  return {
    orgId,
    listQuery,
    createDashboard: createMutation.mutateAsync,
    createDashboardPending: createMutation.isPending,
    deleteDashboard: deleteMutation.mutateAsync,
    deleteDashboardPending: deleteMutation.isPending,
    favoriteDashboard: favoriteMutation.mutate,
    favoriteDashboardPending: favoriteMutation.isPending,
    bulkApplyDashboards: bulkApplyMutation.mutateAsync,
    bulkApplyDashboardsPending: bulkApplyMutation.isPending,
    createPublicationToken: createPublicationTokenMutation.mutateAsync,
    createPublicationTokenPending: createPublicationTokenMutation.isPending,
  };
}
