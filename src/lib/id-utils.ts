export function getRowId({
  orgId,
  dashboardId,
  rowId,
}: {
  orgId: string;
  dashboardId: string;
  rowId: string;
}) {
  return `${orgId}:${dashboardId}:${rowId}`;
}

export function getPanelId({
  orgId,
  dashboardId,
  rowId,
  panelId,
}: {
  orgId: string;
  dashboardId: string;
  rowId: string;
  panelId: string;
}) {
  return `${orgId}:${dashboardId}:${rowId}:${panelId}`;
}
