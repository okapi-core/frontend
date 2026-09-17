import {
  getMetricHints,
  getMetricsBatchResponse,
  getMetricsResponse,
  getTagHints,
  getTagValueHints,
  getVarHints,
} from '@/lib/api';
import {
  GetMetricsRequest,
  GetTagHintsRequest,
  GetTagValueHintsRequest,
  GetVarHintsRequest,
  METRIC_TYPE,
  MultiQueryRequest,
} from '@/lib/request-types';
import { useQuery } from '@tanstack/react-query';

export function fetchMetricHints(request: any) {
  return getMetricHints({ request });
}

export function useMetricHintsQuery({
  metricPrefix,
  metricType,
  startMs,
  endMs,
  enabled,
}: {
  metricPrefix?: string;
  metricType?: METRIC_TYPE;
  startMs: number;
  endMs: number;
  enabled: boolean;
}) {
  return useQuery({
    queryKey: ['metric-hints', metricType, startMs, endMs, metricPrefix],
    queryFn: () =>
      fetchMetricHints({
        metricPrefix: metricPrefix || undefined,
        interval: { start: startMs, end: endMs },
        metricEventFilter: metricType ? { metricType } : undefined,
      }),
    enabled,
    staleTime: 30_000,
    select: (res) => res.data?.metricHints || [],
  });
}

export function fetchTagHints(request: GetTagHintsRequest) {
  return getTagHints({ request });
}

export function useTagHintsQuery({
  metric,
  metricType,
  startMs,
  endMs,
  tagPrefix,
  otherTags,
  enabled,
}: {
  metric?: string;
  metricType?: METRIC_TYPE;
  startMs: number;
  endMs: number;
  tagPrefix?: string;
  otherTags?: Record<string, string>;
  enabled: boolean;
}) {
  return useQuery({
    queryKey: [
      'tag-hints',
      metric,
      metricType,
      startMs,
      endMs,
      tagPrefix,
      JSON.stringify(otherTags ?? {}),
    ],
    queryFn: () =>
      fetchTagHints({
        metricName: metric,
        otherTags,
        tagPrefix: tagPrefix || undefined,
        interval: { start: startMs, end: endMs },
        metricEventFilter: metricType ? { metricType } : undefined,
      }),
    enabled,
    staleTime: 30_000,
    select: (res) => res.data?.tagHints || [],
  });
}

export function fetchTagValueHints(request: GetTagValueHintsRequest) {
  return getTagValueHints({ request });
}

export function useTagValueHintsQuery({
  metric,
  metricType,
  startMs,
  endMs,
  tag,
  otherTags,
  enabled,
}: {
  metric?: string;
  metricType?: METRIC_TYPE;
  startMs: number;
  endMs: number;
  tag?: string;
  otherTags?: Record<string, string>;
  enabled: boolean;
}) {
  return useQuery({
    queryKey: [
      'tag-value-hints',
      metric,
      metricType,
      startMs,
      endMs,
      tag,
      JSON.stringify(otherTags ?? {}),
    ],
    queryFn: () =>
      fetchTagValueHints({
        metricName: metric,
        otherTags,
        tag: tag || undefined,
        interval: { start: startMs, end: endMs },
        metricEventFilter: metricType ? { metricType } : undefined,
      }),
    enabled: Boolean(enabled && tag),
    staleTime: 30_000,
    select: (res) => res.data?.tagValueHints?.candidates || [],
  });
}

export function fetchMetrics(request: GetMetricsRequest) {
  return getMetricsResponse({ request });
}

export function fetchMetricsBatch(multiQueryRequest: MultiQueryRequest) {
  return getMetricsBatchResponse({ multiQueryRequest });
}

export function fetchVarHints(request: GetVarHintsRequest) {
  return getVarHints({ request });
}

export function useMetricsBatchQuery(
  panelWDto: MultiQueryRequest,
  enabled: boolean,
) {
  return useQuery({
    queryKey: ['panel-data', panelWDto],
    queryFn: () => fetchMetricsBatch(panelWDto),
    enabled,
  });
}
