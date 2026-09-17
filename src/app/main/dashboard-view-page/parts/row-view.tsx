import { GridBoard } from '@/components/grid/GridBoard';
import { QueryPlotter } from '@/features/dashboards/components/panel/PanelContentSwitch';
import ExemplarsModal from '@/features/dashboards/components/panel/ExemplarsModal';
import { GenericPanelRenderer } from '@/features/dashboards/components/PanelRenderer';
import { RowLayout } from '@/features/dashboards/components/RowLayout';
import { computeRowLayout } from '@/features/dashboards/components/RowRenderer';
import { useAppServices } from '@/lib/app-services';
import {
  persistDashboardRowLayout,
  resolveDashboardRowLayout,
  toDashboardLayoutItems,
} from '@/lib/dashboard-layout';
import { roundToNearestMs } from '@/lib/date-utils';
import {
  GetDashboardPanelResponse,
  GetDashboardRowResponse,
} from '@/lib/response-types';
import { Text } from '@mantine/core';
import { useMemo, useState } from 'react';
import { useDashboardViewStore } from '../store';

export function RowView({
  row,
  startMs,
  endMs,
  varsCtx,
  dashboardId,
  dashVersion,
  chartGroup,
}: {
  row: GetDashboardRowResponse;
  startMs: number;
  endMs: number;
  varsCtx: { [key: string]: string };
  dashboardId: string;
  dashVersion: string;
  chartGroup?: string;
}) {
  const panelProps = row.panelOrder
    ?.map((pid) => row.panels?.find((p) => p.panelId === pid))
    .filter(Boolean);

  const panels = (panelProps?.length ? panelProps : row.panels) || [];
  const items: Record<string, React.ReactNode> = {};
  const setTimeRange = useDashboardViewStore((s) => s.setTimeRange);
  const { navigation } = useAppServices();
  const [exemplarsPanel, setExemplarsPanel] =
    useState<GetDashboardPanelResponse | null>(null);

  panels.forEach((panel) => {
    if (!panel) return;
    items[panel.panelId] = (
      <div
        key={panel.panelId}
        style={{
          height: '100%',
          minHeight: 0,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <GenericPanelRenderer
          title={panel.title}
          onView={() => {
            const params = new URLSearchParams({
              dashboardId,
              versionId: dashVersion,
              rowId: row.rowId,
              panelId: panel.panelId,
            });
            navigation.navigate(`/main/metrics-explorer?${params.toString()}`);
          }}
          onViewExemplars={() => setExemplarsPanel(panel)}
        >
          <QueryPlotter
            queryConfig={panel.queries}
            timeConstraint={{ startMs, endMs }}
            varsCtx={varsCtx}
            chartGroup={chartGroup}
            onSelectRange={(xstart, xend) => {
              setTimeRange({
                startMs: roundToNearestMs(xstart),
                endMs: roundToNearestMs(xend),
              });
            }}
          />
        </GenericPanelRenderer>
      </div>
    );
  });

  const [open, setOpen] = useState(true);
  const defaultLayout = useMemo(
    () => computeRowLayout(row, { cols: 12 }),
    [row],
  );
  const resolvedLayout = useMemo(
    () =>
      resolveDashboardRowLayout({
        dashboardId,
        versionId: dashVersion,
        rowId: row.rowId,
        defaultLayout,
      }),
    [dashboardId, dashVersion, row.rowId, defaultLayout],
  );

  return (
    <RowLayout
      open={open}
      onToggle={() => setOpen((v) => !v)}
      title={
        <Text fw={600} size="sm">
          {row.title || 'Row'}
        </Text>
      }
      description={
        row.description ? (
          <Text size="sm" c="dimmed">
            {row.description}
          </Text>
        ) : null
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
            versionId: dashVersion,
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
      <ExemplarsModal
        opened={Boolean(exemplarsPanel)}
        onClose={() => setExemplarsPanel(null)}
        metricPaths={exemplarsPanel?.queries?.map((query) => query.query) || []}
        timeConstraint={{ startMs, endMs }}
      />
    </RowLayout>
  );
}
