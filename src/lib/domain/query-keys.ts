export const dashboardKeys = {
  all: ['dashboards'] as const,
  list: (orgId?: string) => [...dashboardKeys.all, 'list', orgId || ''] as const,
  detail: (dashboardId: string) => ['dashboard', dashboardId] as const,
  vars: (dashboardId: string) => ['dashboard', dashboardId, 'vars'] as const,
  panelProps: (dashboardId: string, rowId: string, panelId: string) =>
    ['dashboard', dashboardId, 'row', rowId, 'panel', panelId, 'props'] as const,
  panelData: ['panel-data'] as const,
};
