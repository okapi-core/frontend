import { getPreference, setPreference } from './user-preferences';

const LAYOUT_VERSION = 1;

export type DashboardLayoutItem = {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
  minW?: number;
  maxW?: number;
  minH?: number;
  maxH?: number;
  static?: boolean;
  isDraggable?: boolean;
  isResizable?: boolean;
};

type DashboardLayoutState = {
  version: number;
  rows: Record<string, DashboardLayoutItem[]>;
};

export function buildDashboardLayoutKey(
  dashboardId: string,
  versionId: string,
): string {
  return `dashboard-layout:${dashboardId}:${versionId}`;
}

function toNumber(value: unknown): number | null {
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

function normalizeLayoutItem(item: any): DashboardLayoutItem | null {
  if (!item || typeof item.id !== 'string') return null;
  const x = toNumber(item.x);
  const y = toNumber(item.y);
  const w = toNumber(item.w);
  const h = toNumber(item.h);
  if (x === null || y === null || w === null || h === null) return null;
  return {
    id: item.id,
    x,
    y,
    w,
    h,
    minW: toNumber(item.minW) ?? undefined,
    maxW: toNumber(item.maxW) ?? undefined,
    minH: toNumber(item.minH) ?? undefined,
    maxH: toNumber(item.maxH) ?? undefined,
    static: typeof item.static === 'boolean' ? item.static : undefined,
    isDraggable:
      typeof item.isDraggable === 'boolean' ? item.isDraggable : undefined,
    isResizable:
      typeof item.isResizable === 'boolean' ? item.isResizable : undefined,
  };
}

function normalizeLayoutItems(items: any): DashboardLayoutItem[] {
  if (!Array.isArray(items)) return [];
  return items
    .map((item) => normalizeLayoutItem(item))
    .filter(Boolean) as DashboardLayoutItem[];
}

function readDashboardLayoutState(
  dashboardId: string,
  versionId: string,
): DashboardLayoutState | null {
  const key = buildDashboardLayoutKey(dashboardId, versionId);
  const state = getPreference<DashboardLayoutState>(key);
  if (!state || state.version !== LAYOUT_VERSION || !state.rows) return null;
  const rows: Record<string, DashboardLayoutItem[]> = {};
  for (const [rowId, layout] of Object.entries(state.rows)) {
    rows[rowId] = normalizeLayoutItems(layout);
  }
  return { version: LAYOUT_VERSION, rows };
}

function writeDashboardLayoutState(
  dashboardId: string,
  versionId: string,
  state: DashboardLayoutState,
): void {
  const key = buildDashboardLayoutKey(dashboardId, versionId);
  setPreference(key, state);
}

export function mergeRowLayout({
  defaultLayout,
  savedLayout,
}: {
  defaultLayout: DashboardLayoutItem[];
  savedLayout?: DashboardLayoutItem[];
}): DashboardLayoutItem[] {
  if (!savedLayout?.length) return defaultLayout;
  const savedById = new Map(savedLayout.map((item) => [item.id, item]));
  return defaultLayout.map((item) => {
    const saved = savedById.get(item.id);
    if (!saved) return item;
    return { ...item, ...saved, id: item.id };
  });
}

export function resolveDashboardRowLayout({
  dashboardId,
  versionId,
  rowId,
  defaultLayout,
}: {
  dashboardId: string;
  versionId: string;
  rowId: string;
  defaultLayout: DashboardLayoutItem[];
}): DashboardLayoutItem[] {
  if (!dashboardId || !versionId || !rowId) return defaultLayout;
  const state = readDashboardLayoutState(dashboardId, versionId);
  const savedLayout = state?.rows?.[rowId];
  return mergeRowLayout({
    defaultLayout,
    savedLayout: normalizeLayoutItems(savedLayout),
  });
}

export function toDashboardLayoutItems(layout: any): DashboardLayoutItem[] {
  if (!Array.isArray(layout)) return [];
  return layout
    .map((item) =>
      normalizeLayoutItem({
        ...item,
        id: typeof item.i === 'string' ? item.i : item.id,
      }),
    )
    .filter(Boolean) as DashboardLayoutItem[];
}

export function persistDashboardRowLayout({
  dashboardId,
  versionId,
  rowId,
  layout,
}: {
  dashboardId: string;
  versionId: string;
  rowId: string;
  layout: DashboardLayoutItem[];
}): void {
  if (!dashboardId || !versionId || !rowId) return;
  const normalizedLayout = normalizeLayoutItems(layout);
  const state =
    readDashboardLayoutState(dashboardId, versionId) ||
    ({ version: LAYOUT_VERSION, rows: {} } as DashboardLayoutState);
  state.rows = { ...state.rows, [rowId]: normalizedLayout };
  writeDashboardLayoutState(dashboardId, versionId, state);
}
