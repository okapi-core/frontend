import { SideDrawer } from '@/components/side-drawer/side-drawer';
import {
  CounterRenderer,
  GaugeRenderer,
  HistogramRenderer,
} from '@/features/dashboards/components/panel/PanelContentSwitch';
import { GetMetricsResponse, SpanQueryV2Response } from '@/lib/response-types';
import { ScrollArea, Stack, Table, Text, Title } from '@mantine/core';
import { useOscarChatStore } from '../store';

function SpansTable({ data }: { data: SpanQueryV2Response }) {
  const items = data.items ?? [];
  return (
    <Stack gap="xs" p="sm">
      <Title order={6}>Spans ({items.length})</Title>
      <ScrollArea>
        <Table striped highlightOnHover fz="xs">
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Service</Table.Th>
              <Table.Th>Kind</Table.Th>
              <Table.Th>Status</Table.Th>
              <Table.Th>Duration (ms)</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {items.map((span, i) => {
              const durationMs =
                span.tsStartNs != null && span.tsEndNs != null
                  ? Math.round((span.tsEndNs - span.tsStartNs) / 1_000_000)
                  : null;
              return (
                <Table.Tr key={span.spanId ?? i}>
                  <Table.Td>{span.serviceName ?? '—'}</Table.Td>
                  <Table.Td>{span.kindString ?? span.kind ?? '—'}</Table.Td>
                  <Table.Td>{span.spanStatus ?? '—'}</Table.Td>
                  <Table.Td>
                    {durationMs != null ? `${durationMs}ms` : '—'}
                  </Table.Td>
                </Table.Tr>
              );
            })}
          </Table.Tbody>
        </Table>
      </ScrollArea>
    </Stack>
  );
}

function MetricsSummary({ data }: { data: GetMetricsResponse }) {
  return (
    <Stack gap="xs" p="sm">
      <Title order={6}>Metric: {data.metric ?? '—'}</Title>
      <MetricPlot response={data} />
      {data.gaugeResponse?.series?.map((series, i) => (
        <Stack key={i} gap={2}>
          {Object.entries(series.tags ?? {}).map(([k, v]) => (
            <Text key={k} size="xs" c="dimmed">
              {k}={v}
            </Text>
          ))}
          <Text size="xs">{series.values?.length ?? 0} data points</Text>
        </Stack>
      ))}
      {data.histogramResponse?.series && (
        <Text size="xs">
          {data.histogramResponse.series.length} histogram buckets
        </Text>
      )}
    </Stack>
  );
}

function MetricPlot({ response }: { response: GetMetricsResponse }) {
  const responses = [response];
  const hasGauge = !!response.gaugeResponse?.series?.length;
  const hasHisto = !!response.histogramResponse?.series?.length;
  const hasCounter = !!response.sumsResponse?.sums?.length;

  if (hasGauge && !hasHisto && !hasCounter) {
    return (
      <div style={{ height: 400 }}>
        <GaugeRenderer res={responses} />
      </div>
    );
  }
  if (hasHisto && !hasCounter) {
    return (
      <div style={{ height: 400 }}>
        <HistogramRenderer res={responses} />
      </div>
    );
  }
  if (hasCounter && !hasHisto) {
    return (
      <div style={{ height: 400 }}>
        <CounterRenderer res={responses} />
      </div>
    );
  }
  return null;
}

export function ChatSideBar() {
  const showSideBar = useOscarChatStore((s) => s.showSideBar);
  const setShowSideBar = useOscarChatStore((s) => s.setShowSideBar);
  const sidebarData = useOscarChatStore((s) => s.sidebarData);

  const title =
    sidebarData?.type === 'spans'
      ? 'Traces'
      : sidebarData?.type === 'metrics'
        ? 'Metric'
        : undefined;

  return (
    <SideDrawer
      open={showSideBar}
      onClose={() => setShowSideBar(false)}
      size="lg"
      title={title ? <Text fw={600}>{title}</Text> : undefined}
    >
      {sidebarData?.type === 'spans' && <SpansTable data={sidebarData.query} />}
      {sidebarData?.type === 'metrics' && (
        <MetricsSummary data={sidebarData.query} />
      )}
    </SideDrawer>
  );
}
