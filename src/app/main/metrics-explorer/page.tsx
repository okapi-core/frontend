import {
  BackToEdit,
  DEFAULT_GET_METRICS,
  QueryEditor,
} from '@/app/main/dashboards-home/panel-editor';
import TimeRangePicker from '@/components/custom-component-tray/time-range-picker';
import { PageCanvas } from '@/components/page-canvas';
import { QueryPlotter } from '@/features/dashboards/components/panel/PanelContentSwitch';
import { VarValueSelector } from '@/features/dashboards/components/vars-ctx/var-selector';
import { useRunQuerySnapshot } from '@/features/dashboards/hooks/useRunQuerySnapshot';
import { useAppServices } from '@/lib/app-services';
import { useUserData } from '@/lib/context';
import { roundToNearestMs } from '@/lib/date-utils';
import { useDashboardViewApi } from '@/lib/domain/dashboard-view';
import { usePanelEditorApi } from '@/lib/domain/panels';
import { QueryConfig } from '@/lib/request-types';
import { Button, Group, Paper, Stack, Text, Title } from '@mantine/core';
import { Plus } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

const DEFAULT_QUERY: QueryConfig = {
  query: DEFAULT_GET_METRICS,
};

export default function MetricsExplorerPage() {
  const { currentOrg } = useUserData();
  return (
    <PageCanvas
      path={[{ label: 'Metrics explorer', href: '/main/metrics-explorer' }]}
      inner={<Inner />}
      sidebarProps={{
        org: currentOrg,
        activeItem: 'playground',
      }}
    />
  );
}

function Inner() {
  const [searchParams] = useSearchParams();
  const dashboardId = searchParams.get('dashboardId') || '';
  const versionId = searchParams.get('versionId') || '';
  const rowId = searchParams.get('rowId') || '';
  const panelId = searchParams.get('panelId') || '';
  const isPanelBacked = Boolean(dashboardId && versionId && rowId && panelId);

  const panelApi = usePanelEditorApi({
    dashboardId,
    versionId,
    rowId,
    panelId,
  });
  const dashboardApi = useDashboardViewApi({
    dashboardId,
    versionId,
  });

  const [title, setTitle] = useState('Metrics explorer');
  const [description, setDescription] = useState('');
  const [queries, setQueries] = useState<QueryConfig[]>([DEFAULT_QUERY]);
  const [startMs, setStartMs] = useState(Date.now() - 60 * 60 * 1000);
  const [endMs, setEndMs] = useState(Date.now());
  const [vars, setVars] = useState<{ [key: string]: string }>({});
  const loadedPanelKey = useRef<string | null>(null);
  const { notify } = useAppServices();

  useEffect(() => {
    const panel = panelApi.panelQuery.data?.data;
    const panelKey = `${dashboardId}:${versionId}:${rowId}:${panelId}`;
    if (!isPanelBacked || !panel || loadedPanelKey.current === panelKey) return;

    loadedPanelKey.current = panelKey;
    setTitle(panel.title || 'Panel');
    setDescription(panel.description || '');
    setQueries(panel.queries?.length ? panel.queries : [DEFAULT_QUERY]);
  }, [
    dashboardId,
    isPanelBacked,
    panelApi.panelQuery.data?.data,
    panelId,
    rowId,
    versionId,
  ]);

  const previewState = useRunQuerySnapshot({
    queries,
    vars,
    startMs,
    endMs,
  });

  const listVarsQuery = dashboardApi.varsQuery;
  const varSuggestions = useMemo(() => {
    const varsList = listVarsQuery.data?.data?.vars ?? [];
    return varsList
      .map((v) => (v.name ? `$__{${v.name}}` : ''))
      .filter(Boolean);
  }, [listVarsQuery.data?.data?.vars]);

  const saveQueryToPanel = async () => {
    if (!isPanelBacked) return;
    try {
      await panelApi.savePanel({
        title,
        note: description,
        grammar: 'OKAPI_JSON',
        queryConfig: queries,
      });
      notify.success('Panel query updated');
    } catch (error) {
      notify.error(
        error instanceof Error ? error.message : 'Failed to update panel query',
      );
    }
  };

  return (
    <Stack gap="md" p="md">
      <Group justify="space-between" align="flex-start">
        <Stack gap={2}>
          <Title order={4}>Metrics explorer</Title>
          {isPanelBacked ? (
            <Text size="sm" c="dimmed">
              Editing query for {title}
            </Text>
          ) : (
            <Text size="sm" c="dimmed">
              Build and run ad hoc metric queries.
            </Text>
          )}
        </Stack>
        <Group gap="sm">
          {isPanelBacked ? (
            <BackToEdit
              dashboardSlug={dashboardId}
              version={versionId}
              target="view"
            />
          ) : null}
          <Button size="xs" onClick={() => previewState.run()}>
            Run query
          </Button>
          {isPanelBacked ? (
            <Button
              size="xs"
              variant="light"
              onClick={saveQueryToPanel}
              loading={panelApi.savePanelPending}
            >
              Use this query
            </Button>
          ) : null}
        </Group>
      </Group>

      <Group gap="sm" align="center">
        <TimeRangePicker
          value={{ startMs, endMs }}
          onChange={(next) => {
            setStartMs(next.startMs);
            setEndMs(next.endMs);
          }}
        />
        {isPanelBacked ? (
          <VarValueSelector
            vars={listVarsQuery.data?.data || { vars: [] }}
            ctx={vars}
            onChange={setVars}
          />
        ) : null}
      </Group>

      <Paper
        withBorder
        radius="md"
        p="md"
        h={520}
        style={{ display: 'flex', flexDirection: 'column', minHeight: 0 }}
      >
        {previewState.snapshot ? (
          <div style={{ flex: 1, minHeight: 0 }}>
            <QueryPlotter
              queryConfig={previewState.snapshot.queries}
              timeConstraint={{
                startMs: previewState.snapshot.startMs,
                endMs: previewState.snapshot.endMs,
              }}
              varsCtx={previewState.snapshot.vars}
              runKey={previewState.runKey}
              onSelectRange={(xstart, xend) => {
                const nextStartMs = roundToNearestMs(xstart);
                const nextEndMs = roundToNearestMs(xend);
                setStartMs(nextStartMs);
                setEndMs(nextEndMs);
                previewState.run({
                  queries,
                  vars,
                  startMs: nextStartMs,
                  endMs: nextEndMs,
                });
              }}
            />
          </div>
        ) : (
          <Text size="sm" c="dimmed">
            Run query to view metrics.
          </Text>
        )}
      </Paper>

      <Group justify="space-between" align="center">
        <Text fw={600}>Queries</Text>
        <Group gap="sm">
          <Button size="xs" onClick={() => previewState.run()}>
            Run query
          </Button>
          <Button
            size="xs"
            variant="default"
            leftSection={<Plus size={14} />}
            onClick={() => setQueries((prev) => [...prev, DEFAULT_QUERY])}
          >
            Add query
          </Button>
        </Group>
      </Group>

      <Stack gap="sm">
        {queries.map((query, index) => (
          <QueryEditor
            key={`query-${index}`}
            idx={index}
            query={query}
            startMs={startMs}
            endMs={endMs}
            varSuggestions={varSuggestions}
            onDelete={() =>
              setQueries((prev) => prev.filter((_, i) => i !== index))
            }
            onChange={(next) =>
              setQueries((prev) =>
                prev.map((current, i) => (i === index ? next : current)),
              )
            }
          />
        ))}
      </Stack>
    </Stack>
  );
}
