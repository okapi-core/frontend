import { FlameGraph } from '@/features/plots/FlameGraph';
import { useUserData } from '@/lib/context';
import { getTraceAggregateView } from '@/lib/common-span-helpers';
import { SpanRowV2 } from '@/lib/response-types';
import { PageCanvas } from '@/components/page-canvas';
import { Alert, Anchor, Badge, Card, Group, Loader, Paper, SimpleGrid, Stack, Text, Title, Tooltip } from '@mantine/core';
import TimeRangePicker, { TimeRange } from '@/components/custom-component-tray/time-range-picker';
import { ArrowLeft, Clock3, Layers3, Server } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { SpanAttributesSideView } from '../spans-home/parts/span-attributes-side-view';
import {
  buildFlameGraphQueryRequest,
  getDefaultTimeRange,
  parseSpanFiltersUrlParam,
} from '../spans-home/lib';
import { ListResultsTable } from '../spans-home/parts/list-results-table';
import { useTraceFlameGraph, useTraceSpans } from './queries';
import { formatTraceDuration, getServiceBreakdown, getSpanDurationMs, toFlameGraphDatum } from './lib';

export default function TraceViewPage() {
  const { currentOrg } = useUserData();
  const [params] = useSearchParams();
  const traceId = params.get('traceId')?.trim() || undefined;
  return (
    <PageCanvas
      path={[{ label: 'Browse spans', href: '/main/spans' }, { label: 'Trace view', href: traceId ? `/main/trace-view?traceId=${encodeURIComponent(traceId)}` : '/main/trace-view' }]}
      sidebarProps={{ org: currentOrg, activeItem: 'spans' }}
      inner={<Inner traceId={traceId} />}
    />
  );
}

function Inner({ traceId }: { traceId?: string }) {
  const [searchParams] = useSearchParams();
  const rawSpanFilters = searchParams.get('span_filters');
  const originatingFilters = parseSpanFiltersUrlParam(rawSpanFilters);
  const [timeRange, setTimeRange] = useState<TimeRange>(originatingFilters.filters.timeRange);
  const [selectedSpan, setSelectedSpan] = useState<SpanRowV2>();
  useEffect(() => {
    setTimeRange(originatingFilters.filters.timeRange);
  }, [rawSpanFilters]);
  const request = useMemo(() => traceId
    ? buildFlameGraphQueryRequest({ traceId, timeRange })
    : { traceId: undefined, timestampFilter: { tsStartNanos: getDefaultTimeRange().startMs * 1_000_000, tsEndNanos: getDefaultTimeRange().endMs * 1_000_000 } }, [timeRange, traceId]);
  const spansQuery = useTraceSpans(request);
  const flameQuery = useTraceFlameGraph(request);
  useEffect(() => {
    if (!traceId) return;
    void spansQuery.refetch();
    void flameQuery.refetch();
  }, [flameQuery.refetch, request, spansQuery.refetch, traceId]);
  const spans = spansQuery.data?.data?.items || [];
  const aggregate = getTraceAggregateView({ spans });
  const services = getServiceBreakdown(spans);
  const flame = flameQuery.data?.data?.roots;

  if (!traceId) return <EmptyTrace />;
  return (
    <Stack gap="md">
      <Group justify="space-between" align="flex-start">
        <Stack gap={4}>
          <Group gap="xs"><Anchor component={Link} to="/main/spans" size="sm"><Group gap={4}><ArrowLeft size={14} /> Back to spans</Group></Anchor></Group>
          <Group gap="xs" align="center"><Title order={3}>Trace</Title><Badge variant="light">{spans.length} spans</Badge></Group>
          <Text ff="monospace" size="sm" c="dimmed" style={{ wordBreak: 'break-all' }}>{traceId}</Text>
        </Stack>
      </Group>
      <Paper withBorder p="sm" radius="md">
        <Stack gap="xs">
          <Group justify="space-between" align="center">
            <Text fw={600} size="sm">Time filter</Text>
            <Badge variant="light" color="blue">Applied to trace query</Badge>
          </Group>
          <TimeRangePicker value={timeRange} onChange={setTimeRange} />
          <Alert color="blue" variant="light" p="xs">
            Showing spans from {new Date(timeRange.startMs).toLocaleString()} to {new Date(timeRange.endMs).toLocaleString()}.
          </Alert>
        </Stack>
      </Paper>
      {spansQuery.isLoading ? <LoadingState /> : spansQuery.data?.error || spansQuery.error ? <Text c="red">Could not load this trace.</Text> : (
        <>
          <SimpleGrid cols={{ base: 1, sm: 3 }}>
            <SummaryCard icon={<Clock3 size={16} />} label="Trace duration" value={formatTraceDuration(Math.max(0, aggregate.durationMs))} />
            <SummaryCard icon={<Layers3 size={16} />} label="Services" value={String(aggregate.services.length)} />
            <SummaryCard icon={<Server size={16} />} label="Errors" value={String(aggregate.totalErrors)} tone={aggregate.totalErrors ? 'red' : undefined} />
          </SimpleGrid>
          <SimpleGrid cols={{ base: 1, xl: 3 }} spacing="md" verticalSpacing="md">
            <Card withBorder radius="md" p="md" style={{ gridColumn: 'span 2' }}>
              <SectionTitle title="Spans" caption="Select a span to inspect its attributes." />
              <ListResultsTable items={spans} onSpanSelect={setSelectedSpan} />
            </Card>
            <Card withBorder radius="md" p="md">
              <SectionTitle title="Time by service" caption="Aggregated span duration." />
              <ServiceBreakdown services={services} total={Math.max(aggregate.durationMs, 1)} />
            </Card>
            <Card withBorder radius="md" p="md" style={{ gridColumn: '1 / -1', overflow: 'hidden' }}>
              <SectionTitle title="Flamegraph" caption="Nested spans across the trace timeline." />
              {flameQuery.isFetching ? <LoadingState /> : flame?.length ? <FlameGraph data={toFlameGraphDatum(flame)} height={360} /> : <Text c="dimmed" size="sm">No flamegraph data available.</Text>}
            </Card>
          </SimpleGrid>
        </>
      )}
      <SpanAttributesSideView row={selectedSpan} open={!!selectedSpan} onClose={() => setSelectedSpan(undefined)} />
    </Stack>
  );
}

function EmptyTrace() { return <Stack align="center" py="xl"><Title order={4}>Choose a trace to inspect</Title><Text c="dimmed">Open this page with a traceId query parameter.</Text><Anchor component={Link} to="/main/spans">Browse spans</Anchor></Stack>; }
function LoadingState() { return <Group justify="center" py="xl"><Loader size="sm" /><Text size="sm" c="dimmed">Loading trace…</Text></Group>; }
function SectionTitle({ title, caption }: { title: string; caption: string }) { return <Stack gap={2} mb="md"><Text fw={600}>{title}</Text><Text size="xs" c="dimmed">{caption}</Text></Stack>; }
function SummaryCard({ icon, label, value, tone }: { icon: React.ReactNode; label: string; value: string; tone?: string }) { return <Paper withBorder p="md" radius="md"><Group gap="sm"><Badge p={7} variant="light" color={tone || 'blue'}>{icon}</Badge><Stack gap={0}><Text size="xs" c="dimmed">{label}</Text><Text fw={700} c={tone}>{value}</Text></Stack></Group></Paper>; }
function ServiceBreakdown({ services, total }: { services: ReturnType<typeof getServiceBreakdown>; total: number }) {
  const colors = ['blue', 'violet', 'teal', 'orange', 'grape', 'cyan', 'pink'];
  return <Stack gap="sm">
    {services.length ? services.map(({ service, durationMs, spans, traceStartMs }, index) => {
      const color = colors[index % colors.length];
      return <Stack key={service} gap={4}>
        <Group justify="space-between"><Anchor component={Link} to={`/main/svc-health?service=${encodeURIComponent(service)}`} size="sm" truncate>{service}</Anchor><Text size="xs" c="dimmed">{formatTraceDuration(durationMs)}</Text></Group>
        <div style={{ position: 'relative', height: 14, borderRadius: 6, background: 'var(--mantine-color-gray-2)' }} title="Span activity across the trace">
          {spans.map((span, spanIndex) => <Tooltip
            key={`${service}-${span.startMs}-${spanIndex}`}
            label={<Stack gap={2}>
              <Text size="xs">Start: {new Date(span.startMs).toLocaleString()}</Text>
              <Text size="xs">End: {new Date(span.startMs + span.durationMs).toLocaleString()}</Text>
              <Text size="xs">Duration: {formatTraceDuration(span.durationMs)}</Text>
            </Stack>}
            withArrow
            multiline
            w={260}
          >
            <div
              style={{
                position: 'absolute',
                left: `${Math.max(0, Math.min(100, ((span.startMs - traceStartMs) / total) * 100))}%`,
                width: `max(3px, ${Math.min(100, (span.durationMs / total) * 100)}%)`,
                height: '100%',
                borderRadius: 6,
                background: `var(--mantine-color-${color}-6)`,
              }}
            />
          </Tooltip>)}
        </div>
      </Stack>;
    }) : <Text size="sm" c="dimmed">No service data.</Text>}
  </Stack>;
}
