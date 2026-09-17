import { GetMetricsRequest } from '@/lib/request-types';
import {
  GetDashboardResponse,
  GetDashboardRowResponse,
} from '@/lib/response-types';

const DEFAULT_GET_METRICS_OBJ: GetMetricsRequest = {
  metric: '',
  tags: {},
  start: 0,
  end: 0,
  metricType: 'GAUGE',
};

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
