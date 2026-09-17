import { RedMetrics, ServiceListResponse } from '@/lib/response-types';

const EMPTY_STRS: string[] = [];

export function getSvcList(res?: ServiceListResponse) {
  return res?.services || EMPTY_STRS;
}

export function normalizeMetrics(metrics?: RedMetrics): RedMetrics {
  return {
    ts: metrics?.ts ?? [],
    counts: metrics?.counts ?? [],
    rps: metrics?.rps ?? [],
    rpm: metrics?.rpm ?? [],
    errorRates: metrics?.errorRates ?? [],
    durationsP50: metrics?.durationsP50 ?? [],
    durationsP75: metrics?.durationsP75 ?? [],
    durationsP90: metrics?.durationsP90 ?? [],
    durationsP99: metrics?.durationsP99 ?? [],
    errors: metrics?.errors ?? [],
    totalRequests: metrics?.totalRequests ?? 0,
    totalErrors: metrics?.totalErrors ?? 0,
    availability: metrics?.availability,
  };
}

export interface GoldenAggregate {
  totalRequests: number;
  totalErrors: number;
  rps?: number;
  rpm?: number;
  errorRate?: number;
  availability?: number;
  noRequests: boolean;
  bestEffort: boolean;
}

export function deriveGoldenAggregates(metrics?: RedMetrics): GoldenAggregate {
  const counts = metrics?.counts ?? [];
  const errors = metrics?.errors ?? [];
  const totalRequests =
    metrics?.totalRequests ?? counts.reduce((acc, val) => acc + (val || 0), 0);
  const totalErrors =
    metrics?.totalErrors ?? errors.reduce((acc, val) => acc + (val || 0), 0);
  const fallbackRates = deriveRatesFromCounts(counts, metrics?.ts);
  const rps = average(metrics?.rps) ?? fallbackRates.rps;
  const rpm = average(metrics?.rpm) ?? fallbackRates.rpm;
  const errorRate =
    metrics?.errorRates && metrics.errorRates.length > 0
      ? average(metrics.errorRates)
      : totalRequests > 0
        ? totalErrors / totalRequests
        : undefined;
  const bestEffort =
    metrics?.totalRequests === undefined ||
    metrics?.totalErrors === undefined ||
    !metrics?.rps?.length ||
    !metrics?.rpm?.length ||
    !metrics?.errorRates?.length;

  return {
    totalRequests,
    totalErrors,
    rps,
    rpm,
    errorRate,
    availability: metrics?.availability,
    noRequests: metrics?.availability === undefined,
    bestEffort,
  };
}

function average(values?: number[]): number | undefined {
  if (!values || values.length === 0) return undefined;
  const finiteValues = values.filter(Number.isFinite);
  if (finiteValues.length === 0) return undefined;
  return (
    finiteValues.reduce((acc, value) => acc + value, 0) / finiteValues.length
  );
}

function deriveRatesFromCounts(
  counts: number[],
  ts?: number[],
): { rps?: number; rpm?: number } {
  if (!ts || ts.length < 2) return {};
  const minTs = Math.min(...ts);
  const maxTs = Math.max(...ts);
  const durationMs = maxTs - minTs;
  if (!Number.isFinite(durationMs) || durationMs <= 0) return {};

  const totalRequests = counts.reduce((acc, val) => acc + (val || 0), 0);
  return {
    rps: totalRequests / (durationMs / 1000),
    rpm: totalRequests / (durationMs / 60000),
  };
}
