import {
  GetDashboardResponse,
  GetDashboardRowResponse,
} from '@/lib/response-types';

export function getDefaultTimeRange() {
  const now = Date.now();
  return { startMs: now - 15 * 60 * 1000, endMs: now };
}

export function getOrderedRows(
  dashboard?: GetDashboardResponse,
): GetDashboardRowResponse[] {
  if (!dashboard?.rows?.length) return [];
  if (dashboard.rowOrder?.length) {
    return dashboard.rowOrder
      .map((id) => dashboard.rows?.find((r) => r.rowId === id))
      .filter(Boolean) as GetDashboardRowResponse[];
  }
  return dashboard.rows || [];
}
