import { useDashboardViewApi } from '@/lib/domain/dashboard-view';

export function useDashboardVersionQuery({
  dashboardId,
  versionId,
}: {
  dashboardId: string;
  versionId: string;
}) {
  return useDashboardViewApi({ dashboardId, versionId }).dashboardQuery;
}

export function useDashboardVarsQuery({
  dashboardId,
}: {
  dashboardId: string;
}) {
  return useDashboardViewApi({ dashboardId, versionId: '' }).varsQuery;
}
