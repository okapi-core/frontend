import { ActionLink } from '@/components/action-link';
import DashboardTag from '@/components/custom-component-tray/dashboard-tag';
import TimeRangePicker from '@/components/custom-component-tray/time-range-picker';
import { PageCanvas } from '@/components/page-canvas';
import { VarValueSelector } from '@/features/dashboards/components/vars-ctx/var-selector';
import { useUserData } from '@/lib/context';
import { useDashboardViewApi } from '@/lib/domain/dashboard-view';
import { ActionIcon, Group, Stack, Text, Title } from '@mantine/core';
import { RefreshCw } from 'lucide-react';
import { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { getOrderedRows } from './lib';
import { RowView } from './parts/row-view';
import { useDashboardViewStore } from './store';

export default function DashboardViewPage() {
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
          label: 'View',
          href: `/main/dashboards/${dashboardSlug}/${dashboardVersion}`,
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

function Inner({ slug, dashVersion }: { slug: string; dashVersion: string }) {
  const dashboardSlug = slug || '';
  const dashboardVersion = dashVersion || '';
  const { timeRange, varsCtx, setTimeRange, setVarsCtx } =
    useDashboardViewStore();

  const dashboardApi = useDashboardViewApi({
    dashboardId: dashboardSlug,
    versionId: dashboardVersion,
  });

  const dashboard = dashboardApi.dashboardQuery.data?.data;
  const rows = useMemo(() => getOrderedRows(dashboard), [dashboard]);
  const chartGroup = useMemo(
    () => `dashboard-view:${dashboardSlug}:${dashboardVersion}`,
    [dashboardSlug, dashboardVersion],
  );

  return (
    <Stack gap="md" p="md">
      <VarValueSelector
        vars={dashboardApi.varsQuery.data?.data || { vars: [] }}
        ctx={varsCtx}
        timeRange={timeRange}
        onChange={(nextCtx) => setVarsCtx(nextCtx)}
      />
      <Group justify="space-between" align="center">
        <Group gap="xs" align="baseline">
          <Title order={4}>{dashboard?.title || 'Dashboard'}</Title>
          <ActionLink
            href={`/main/dashboards/${dashboardSlug}/${dashboardVersion}/edit`}
          >
            Edit
          </ActionLink>
        </Group>
        <Group gap="sm">
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
        </Group>
      </Group>

      {dashboard?.description ? (
        <Text size="sm" c="dimmed">
          {dashboard.description}
        </Text>
      ) : null}

      {dashboard?.tags?.length ? (
        <Group gap="xs">
          {dashboard.tags.map((tag) => (
            <DashboardTag key={tag} tag={tag} />
          ))}
        </Group>
      ) : null}

      {rows.map((row) => (
        <RowView
          varsCtx={varsCtx}
          key={row.rowId}
          row={row}
          startMs={timeRange.startMs}
          endMs={timeRange.endMs}
          dashboardId={dashboardSlug}
          dashVersion={dashboardVersion}
          chartGroup={chartGroup}
        />
      ))}
    </Stack>
  );
}
