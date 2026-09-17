import { ChartWithLegend } from '@/features/plots/ChartWithLegend';
import {
  Histogram,
  type HistogramBucketSeries,
} from '@/features/plots/Histogram';
import { LineTimeSeries } from '@/features/plots/LineChart';
import TimeBarChart, {
  type BarTimeSeries,
} from '@/features/plots/TimeBarChart';
import { fetchMetricsBatch } from '@/lib/domain/metrics';
import { buildMetricLegends, formatMetricPath } from '@/lib/metric-legend';
import { MultiQueryRequest } from '@/lib/request-types';
import {
  GetMetricsBatchResponse,
  GetMetricsResponse,
  QueryConfig,
} from '@/lib/response-types';
import { Group, Loader, Text } from '@mantine/core';
import { useQuery } from '@tanstack/react-query';

export const EMPTY_LIST = [];

export function QueryPlotter({
  queryConfig,
  timeConstraint,
  varsCtx,
  runKey,
  onSelectRange,
  chartGroup,
}: {
  queryConfig: QueryConfig[] | undefined;
  timeConstraint: { startMs: number; endMs: number };
  varsCtx: { [key: string]: string };
  runKey?: number;
  onSelectRange?: (xstart: number, xend: number) => void;
  chartGroup?: string;
}) {
  const request: MultiQueryRequest = {
    queries: queryConfig,
    timeConstraint: {
      start: timeConstraint.startMs,
      end: timeConstraint.endMs,
    },
    varsContext: varsCtx,
  };
  const query = useQuery({
    queryKey: ['panel-data', request, timeConstraint, varsCtx, runKey],
    queryFn: () => fetchMetricsBatch(request),
  });
  if (!queryConfig) {
    return (
      <Text c="dimmed" size="sm" p={'sm'}>
        Panel not configured
      </Text>
    );
  }
  if (query.isLoading || query.isFetching) {
    return (
      <Group justify="center" py="md">
        <Loader size="sm" />
      </Group>
    );
  }
  if (!query.data?.data) {
    return <InvalidDataMessage />;
  }
  if (isEmptyResponse(query.data.data)) {
    return <NoDataMessage />;
  }
  const distribution = getDistribution(query.data.data);
  const isValidData = query.data?.data && isValid(distribution);
  if (!isValidData) {
    return <InvalidDataMessage />;
  }
  if (distribution.allGauges) {
    return (
      <GaugeRenderer
        res={query.data.data.responses || []}
        onSelectRange={onSelectRange}
        chartGroup={chartGroup}
      />
    );
  } else if (distribution.hasOneHisto) {
    return <HistogramRenderer res={query.data.data.responses || []} />;
  } else if (distribution.hasOneCounter) {
    return <CounterRenderer res={query.data.data.responses || []} />;
  } else {
    return <UnsupportedTypeMsg type="mixed" />;
  }
}

export function GaugeRenderer({
  res,
  onSelectRange,
  chartGroup,
}: {
  res: GetMetricsResponse[];
  onSelectRange?: (xstart: number, xend: number) => void;
  chartGroup?: string;
}) {
  const seriesEntries: Array<{
    key: string;
    metricName: string;
    labels: Record<string, string> | null | undefined;
    unit?: string;
    data: { x: number; y: number }[];
  }> = [];
  for (const r of res) {
    if (!r.gaugeResponse?.series) continue;
    const metricName = r.metric || 'unnamed_metric';
    for (const series of r.gaugeResponse.series) {
      const pts: { x: number; y: number }[] = [];
      if (series.times) {
        for (let i = 0; i < series.times.length; i++) {
          const t = series.times[i];
          const v = series.values?.[i];
          if (!v) continue;
          pts.push({ x: t, y: v });
        }
        if (pts.length) {
          const labels = series.tags ?? r.tags;
          const key = formatMetricPath(metricName, labels);
          seriesEntries.push({
            key,
            metricName,
            labels,
            data: pts,
          });
        }
      }
    }
  }

  const legends = buildMetricLegends(
    seriesEntries.map((entry) => ({
      metricName: entry.metricName,
      labels: entry.labels,
      fullPath: entry.key,
      unit: entry.unit,
    })),
  );
  const seriesByKey = new Map(seriesEntries.map((entry) => [entry.key, entry]));
  const lines: LineTimeSeries[] = [];
  for (const legend of legends) {
    const entry = seriesByKey.get(legend.key);
    if (!entry) continue;
    const legendLabel = `${legend.label}${formatUnitSuffix(legend.unit)}`;
    const next: LineTimeSeries = {
      name: legend.key,
      legendLabel,
      legendTooltip: legend.tooltip,
      data: entry.data,
    };
    if (next.legendLabel === undefined) continue;
    lines.push(next);
  }
  return (
    <ChartWithLegend
      series={lines}
      onSelect={onSelectRange}
      chartGroup={chartGroup}
      legendOverflow="wrap"
    />
  );
}

export function CounterRenderer({ res }: { res: GetMetricsResponse[] }) {
  const bars: BarTimeSeries[] = [];
  for (const r of res) {
    if (!r.sumsResponse?.sums?.length) continue;
    const pts = r.sumsResponse.sums
      .map((s) => {
        const start = s.ts ?? s.te ?? 0;
        const end = s.te ?? s.ts ?? start;
        const x = start === end ? start : Math.round((start + end) / 2);
        const y = s.count ?? 0;
        return { x, y };
      })
      .filter((p) => p.x !== undefined);
    if (pts.length) {
      bars.push({
        name: canonicalLabel({ res: r, unit: getUnitFromSums(r) }),
        data: pts,
      });
    }
  }
  if (!bars.length) return <InvalidDataMessage />;
  return <TimeBarChart series={bars} yAxisLabel="count" />;
}

export function HistogramRenderer({ res }: { res: GetMetricsResponse[] }) {
  const guiSeries: HistogramBucketSeries[] = [];
  for (const r of res) {
    if (!r.histogramResponse?.series) continue;
    for (const series of r.histogramResponse.series) {
      const h = series?.histogram;
      if (!h?.buckets?.length || !h?.counts?.length) continue;
      const start = h.start ?? h.end ?? Date.now();
      guiSeries.push({
        name: formatMetricPath(r.metric, series.tags),
        start,
        end: h.end,
        counts: h.counts,
        buckets: h.buckets,
      });
    }
  }
  if (!guiSeries.length) return <InvalidDataMessage />;
  return <Histogram histograms={guiSeries} height="100%" />;
}

function canonicalLabel({
  res,
  unit,
}: {
  res: GetMetricsResponse;
  unit?: string;
}) {
  const metric = res.metric || 'unnamed_metric';
  return `${metric}${formatUnitSuffix(unit)}`;
}

function getUnitFromSums(res: GetMetricsResponse): string | undefined {
  return res.sumsResponse?.sums?.find((sum) => sum?.unit)?.unit;
}

function formatUnitSuffix(unit?: string): string {
  const trimmed = unit?.trim();
  return trimmed ? ` (${trimmed})` : '';
}

function UnsupportedTypeMsg({ type }: { type: string }) {
  return <Text>Panel with expected type "{type}" is not supported yet.</Text>;
}

function InvalidDataMessage() {
  return <Text>Panel has no valid data to display</Text>;
}

function NoDataMessage() {
  return (
    <Text size="sm" c="dimmed" ta="center">
      No data
    </Text>
  );
}

function isEmptyResponse(batch: GetMetricsBatchResponse): boolean {
  const responses = batch.responses || [];
  if (responses.length === 0) return true;
  return responses.every((r) => {
    const gaugeEmpty =
      !r.gaugeResponse?.series?.length || r.gaugeResponse?.series.length === 0;
    const sumsEmpty = !r.sumsResponse?.sums?.length;
    const histoEmpty = !r.histogramResponse?.series?.length;
    return gaugeEmpty && sumsEmpty && histoEmpty;
  });
}

function allGauges(batch: GetMetricsBatchResponse): boolean {
  return (
    batch.responses?.map((r) => r.gaugeResponse).filter(Boolean).length ===
    batch.responses?.length
  );
}

interface ResponseDistribution {
  allGauges: boolean;
  hasOneHisto: boolean;
  hasOneCounter: boolean;
}

function getDistribution(batch: GetMetricsBatchResponse): ResponseDistribution {
  const areAllGauges = allGauges(batch);
  const hasOneHisto =
    (batch.responses?.map((r) => r.histogramResponse).filter(Boolean)?.length ||
      0) >= 1;
  const hasOneCounter =
    (batch.responses?.map((r) => r.sumsResponse).filter(Boolean)?.length ||
      0) >= 1;
  return {
    allGauges: areAllGauges,
    hasOneHisto,
    hasOneCounter,
  };
}

function isValid(dis: ResponseDistribution): boolean {
  // Valid if all are gauges
  if (dis.allGauges) return true;
  // Valid if there's at least one histogram and no counters
  if (dis.hasOneHisto && !dis.hasOneCounter) return true;
  // Valid if there's at least one counter and no histograms
  if (dis.hasOneCounter && !dis.hasOneHisto) return true;
  // Invalid in all other cases
  return false;
}
