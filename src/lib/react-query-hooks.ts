import { dashboardKeys } from './domain/query-keys';

export function getDashboardQueryKey(dashboardId: string) {
  return dashboardKeys.detail(dashboardId);
}

export function getPanelPropsQueryKey(
  dashboardId: string,
  rowId: string,
  panelId: string,
) {
  return dashboardKeys.panelProps(dashboardId, rowId, panelId);
}

export function getDashVarsKey(id: string) {
  return dashboardKeys.vars(id);
}
