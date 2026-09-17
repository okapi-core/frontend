import TimeRangePicker from '@/components/custom-component-tray/time-range-picker';
import { PageCanvas } from '@/components/page-canvas';
import DashboardTitleAndDesc from '@/features/dashboards/components/DashboardTitleAndDesc';
import { RowRenderer } from '@/features/dashboards/components/RowRenderer';
import { VarValueSelector } from '@/features/dashboards/components/vars-ctx/var-selector';
import { useAppServices } from '@/lib/app-services';
import { useUserData } from '@/lib/context';
import { roundToNearestMs } from '@/lib/date-utils';
import { useDashboardEditorApi } from '@/lib/domain/dashboard-editor';
import { useDashboardViewApi } from '@/lib/domain/dashboard-view';
import { ActionIcon, Button, Group, Stack } from '@mantine/core';
import { RefreshCw } from 'lucide-react';
import { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { getOrderedRows } from './lib';
import { ManageVarsModal } from './parts/manage-vars-modal';
import { useDashboardEditStore } from './store';

export default function DashboardEditPage() {
  const { slug, dashVersion } = useParams<{
    slug: string;
    dashVersion: string;
  }>();
  const dashboardSlug = slug || '';
  const dashboardVersion = dashVersion || '';
  const { currentOrg } = useUserData();

  return (
    <PageCanvas
      path={[
        { label: 'Dashboards', href: '/main/dashboards' },
        {
          label: 'Designer',
          href: `/main/dashboards/${dashboardSlug}/${dashboardVersion}/edit`,
        },
      ]}
      inner={<Inner slug={dashboardSlug} dashVersion={dashboardVersion} />}
      sidebarProps={{
        org: currentOrg,
        activeItem: 'playground',
      }}
    />
  );
}

export function Inner({
  slug,
  dashVersion,
}: {
  slug: string;
  dashVersion: string;
}) {
  const dashboardSlug = slug || '';
  const dashboardVersion = dashVersion || '';
  const {
    timeRange,
    varsCtx,
    manageVarsOpen,
    setTimeRange,
    setVarsCtx,
    setManageVarsOpen,
  } = useDashboardEditStore();

  const dashboardApi = useDashboardViewApi({
    dashboardId: dashboardSlug,
    versionId: dashboardVersion,
  });
  const editorApi = useDashboardEditorApi({
    dashboardId: dashboardSlug,
    versionId: dashboardVersion,
  });

  const rows = useMemo(
    () => getOrderedRows(dashboardApi.dashboardQuery.data?.data),
    [dashboardApi.dashboardQuery.data?.data],
  );
  const chartGroup = useMemo(
    () => `dashboard-edit:${dashboardSlug}:${dashboardVersion}`,
    [dashboardSlug, dashboardVersion],
  );

  const { navigation } = useAppServices();

  return (
    <Stack gap="md" p="md">
      <VarValueSelector
        vars={dashboardApi.varsQuery.data?.data || { vars: [] }}
        ctx={varsCtx}
        onChange={(nextCtx) => setVarsCtx(nextCtx)}
      />
      <Group justify="space-between" align="center">
        <Group gap="sm">
          <Button
            onClick={(e) => {
              e.preventDefault();
              navigation.navigate(
                `/main/dashboards/${dashboardSlug}/${dashboardVersion}`,
              );
            }}
          >
            View board
          </Button>
          <ActionIcon
            variant="subtle"
            aria-label="Refresh all"
            title="Refresh all panels"
            onClick={async () => {
              await dashboardApi.refreshPanels();
            }}
          >
            <RefreshCw size={16} />
          </ActionIcon>
          <TimeRangePicker value={timeRange} onChange={setTimeRange} />
          <Button
            variant="default"
            size="xs"
            onClick={() => {
              editorApi.createRow();
            }}
          >
            Add Row
          </Button>
          <Button
            variant="default"
            size="xs"
            onClick={() => setManageVarsOpen(true)}
          >
            Manage vars
          </Button>
          <ManageVarsModal
            dashboardId={dashboardSlug}
            opened={manageVarsOpen}
            onClose={() => setManageVarsOpen(false)}
            onCreate={editorApi.createVar}
            onDelete={editorApi.deleteVar}
            loadingVars={dashboardApi.varsQuery.isLoading}
            vars={dashboardApi.varsQuery.data?.data?.vars || []}
            createPending={editorApi.createVarPending}
            deletePending={editorApi.deleteVarPending}
          />
          <Button size="xs">Save</Button>
        </Group>
      </Group>
      <DashboardTitleAndDesc
        title={dashboardApi.dashboardQuery.data?.data?.title}
        description={dashboardApi.dashboardQuery.data?.data?.description}
        onSaveDescription={editorApi.updateDescription}
        onSaveTitle={editorApi.updateTitle}
        onUpdateTags={editorApi.updateTags}
      />

      {rows.map((row) => (
        <RowRenderer
          key={row.rowId}
          dashboardId={dashboardSlug}
          row={row}
          startMs={timeRange.startMs}
          endMs={timeRange.endMs}
          panels={row.panels || []}
          varsCtx={varsCtx}
          dashVersion={dashboardVersion}
          chartGroup={chartGroup}
          onSelectRange={(xstart, xend) => {
            setTimeRange({
              startMs: roundToNearestMs(xstart),
              endMs: roundToNearestMs(xend),
            });
          }}
          onRowTitleUpdate={(title) => {
            editorApi.updateRowTitle(row.rowId, title);
          }}
          onRowDescriptionUpdate={(desc) => {
            editorApi.updateRowDescription(row.rowId, desc);
          }}
          onAddPanel={() => {
            editorApi.createPanel(row.rowId);
          }}
          onDeleteRow={() => {
            editorApi.deleteRow(row.rowId);
          }}
        />
      ))}
    </Stack>
  );
}
