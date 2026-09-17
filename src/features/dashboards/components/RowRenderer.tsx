'use client';
import DeletionPrompt from '@/components/custom-component-tray/deletion-prompt';
import EditableText from '@/components/custom-component-tray/editable-text';
import { GridBoard, type GridItem } from '@/components/grid/GridBoard';
import {
  persistDashboardRowLayout,
  resolveDashboardRowLayout,
  toDashboardLayoutItems,
} from '@/lib/dashboard-layout';
import {
  GetDashboardPanelResponse,
  GetDashboardRowResponse,
} from '@/lib/response-types';
import { Modal, Text } from '@mantine/core';
import React from 'react';
import { DashboardPanelRenderer } from './PanelRenderer';
import RowActionsMenu from './RowActionsMenu';
import { RowLayout } from './RowLayout';

export function computeRowLayout(
  r: GetDashboardRowResponse,
  opts?: { cols?: number; defaultW?: number; defaultH?: number },
): GridItem[] {
  const cols = Math.max(1, opts?.cols ?? 12);
  const ids: string[] =
    ((r.panelOrder && r.panelOrder.length
      ? r.panelOrder
      : r.panels?.map((p) => p.panelId)) as string[] | undefined) || [];

  // Choose a reasonable default width if not provided:
  // 1 -> full width, 2 -> half, 3+ -> thirds
  const inferredW = (() => {
    if (opts?.defaultW) return opts.defaultW;
    const n = Math.max(1, ids.length);
    const perRow = n === 1 ? 1 : 2;
    return Math.max(1, Math.floor(cols / perRow));
  })();
  const h = Math.max(1, opts?.defaultH ?? 6);

  const items: GridItem[] = [];
  let x = 0;
  let y = 0;
  let rowHeightMax = 0;
  for (const id of ids) {
    const w = inferredW;
    if (x + w > cols) {
      x = 0;
      y += rowHeightMax;
      rowHeightMax = 0;
    }
    items.push({ id, x, y, w, h });
    x += w;
    rowHeightMax = Math.max(rowHeightMax, h);
  }
  return items;
}

export function RowRenderer({
  startMs,
  endMs,
  dashboardId,
  row,
  panels,
  varsCtx,
  dashVersion,
  onSelectRange,
  chartGroup,
  onRowTitleUpdate,
  onRowDescriptionUpdate,
  onAddPanel,
  onDeleteRow,
}: {
  startMs: number;
  endMs: number;
  dashboardId: string;
  row: GetDashboardRowResponse;
  panels: GetDashboardPanelResponse[];
  varsCtx: { [key: string]: string };
  dashVersion?: string;
  onSelectRange?: (xstart: number, xend: number) => void;
  chartGroup?: string;
  onRowTitleUpdate: (title: string) => void;
  onRowDescriptionUpdate: (desc: string) => void;
  onAddPanel?: () => void;
  onDeleteRow?: () => void;
}) {
  const panelProps = row.panelOrder
    ?.map((pid) => panels.find((p) => p.panelId === pid))
    .filter(Boolean) as GetDashboardPanelResponse[];

  const items: Record<string, React.ReactNode> = {};
  panelProps.forEach((p) => {
    const el = (
      <div
        key={p.panelId}
        style={{
          height: '100%',
          minHeight: 0,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <DashboardPanelRenderer
          props={p}
          startMs={startMs}
          endMs={endMs}
          dashboardId={dashboardId}
          rowId={row.rowId}
          varsCtx={varsCtx}
          dashVersion={dashVersion}
          onSelectRange={onSelectRange}
          chartGroup={chartGroup}
        />
      </div>
    );
    items[p.panelId] = el;
  });

  const [open, setOpen] = React.useState(true);
  const [deleteOpen, setDeleteOpen] = React.useState(false);
  const defaultLayout = React.useMemo(
    () => computeRowLayout(row, { cols: 12 }),
    [row],
  );
  const resolvedLayout = React.useMemo(
    () =>
      resolveDashboardRowLayout({
        dashboardId,
        versionId: dashVersion || '',
        rowId: row.rowId,
        defaultLayout,
      }),
    [dashboardId, dashVersion, row.rowId, defaultLayout],
  );

  return (
    <>
      <RowLayout
        open={open}
        onToggle={() => setOpen((v) => !v)}
        title={
          <EditableText
            value={row.title || 'Row'}
            onSave={(v) => onRowTitleUpdate(v)}
            title="Edit row title"
            placeholder="Enter row title"
            triggerClassName="text-left"
          >
            <Text fw={600} size="sm">
              {row.title || 'Row'}
            </Text>
          </EditableText>
        }
        actions={
          <RowActionsMenu
            onAddPanel={onAddPanel}
            onDelete={() => setDeleteOpen(true)}
          />
        }
        description={
          <EditableText
            value={row.description}
            onSave={(v) => onRowDescriptionUpdate(v)}
            title="Edit row note"
            placeholder="Add a short note for this row"
            multiline
            rows={2}
            triggerClassName="text-left"
          >
            <Text size="sm" c="dimmed">
              {row.description || 'Add a short note for this row'}
            </Text>
          </EditableText>
        }
      >
        <GridBoard
          items={items}
          cols={12}
          rowHeight={30}
          margin={[10, 10]}
          draggableHandle=".gb-drag"
          onLayoutChange={(layout) => {
            persistDashboardRowLayout({
              dashboardId,
              versionId: dashVersion || '',
              rowId: row.rowId,
              layout: toDashboardLayoutItems(layout),
            });
          }}
          config={{
            layout: resolvedLayout,
          }}
          renderItem={(_, node) => (
            <div
              style={{
                height: '100%',
                minHeight: 0,
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              {node}
            </div>
          )}
        />
      </RowLayout>
      <Modal
        opened={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        title="Delete row?"
        centered
      >
        <DeletionPrompt
          onDeleteConfirmed={() => {
            onDeleteRow?.();
            setDeleteOpen(false);
          }}
          onCancel={() => setDeleteOpen(false)}
        />
      </Modal>
    </>
  );
}

export default { RowRenderer };
