import { TimeRange } from '@/components/custom-component-tray/time-range-picker';
import {
  AGG_TYPE,
  DbFilters,
  DistributionSummaryConfig,
  DurationFilter,
  HttpFilters,
  NumberAttributeFilter,
  NumericalAggConfig,
  RES_TYPE,
  ServiceFilter,
  SpanQueryV2Request,
  SpansQueryStatsRequest,
  StringAttributeFilter,
  TimestampFilter,
} from '@/lib/request-types';
import { SpanAttributeHintsResponse, SpanRowV2 } from '@/lib/response-types';
import { uniq } from 'lodash';
export type AttributeFilterInput = {
  key: string;
  value: string;
};

export type SpanFilters = {
  timeRange: TimeRange;
  traceId?: string;
  spanId?: string;
  spanKind?: string;
  serviceName?: string;
  servicePeer?: string;
  dbSystem?: string;
  dbCollection?: string;
  dbNamespace?: string;
  dbOperation?: string;
  httpMethod?: string;
  httpStatusCode?: string;
  httpOrigin?: string;
  httpHost?: string;
  durationMinMs?: string;
  durationMaxMs?: string;
  stringAttributes?: AttributeFilterInput[];
  numberAttributes?: AttributeFilterInput[];
};

export type SpanFiltersParseResult =
  | { ok: true; filters: SpanFilters }
  | { ok: false; error: string; filters: SpanFilters };

export type SpanStatsConfig = {
  numericalAgg?: NumericalAggConfig;
  summaryConfig?: DistributionSummaryConfig;
  attributes?: string[];
};

export type SpanStatsConfigParseResult =
  | { ok: true; config: SpanStatsConfig }
  | { ok: false; error: string; config: SpanStatsConfig };

export function getDefaultSpanStatsConfig(): SpanStatsConfig {
  return {
    numericalAgg: {
      aggregation: 'AVG',
      resType: 'SECONDLY',
    },
  };
}

export type SpanFilterSummaryCategoryId =
  | 'trace'
  | 'service'
  | 'database'
  | 'http'
  | 'duration'
  | 'attributes';

export type SpanFilterCategorySummary = {
  id: SpanFilterSummaryCategoryId;
  label: string;
  count: number;
};

export type SpanFilterSummary = {
  total: number;
  categories: SpanFilterCategorySummary[];
};

export function getDefaultTimeRange(): TimeRange {
  const now = Date.now();
  return { startMs: now - 30 * 60 * 1000, endMs: now };
}

export function parseSpanFiltersUrlParam(
  raw: string | null | undefined,
  fallbackTimeRange: TimeRange = getDefaultTimeRange(),
): SpanFiltersParseResult {
  if (!raw) {
    return {
      ok: true,
      filters: normalizeSpanFilters({ timeRange: fallbackTimeRange }),
    };
  }

  try {
    return {
      ok: true,
      filters: normalizeSpanFilters(JSON.parse(raw), fallbackTimeRange),
    };
  } catch {
    return {
      ok: false,
      error: 'Could not read span_filters from the URL.',
      filters: normalizeSpanFilters({ timeRange: fallbackTimeRange }),
    };
  }
}

export function serializeSpanFilters(filters: SpanFilters): string {
  return JSON.stringify(normalizeSpanFilters(filters));
}

export function parseSpanStatsConfigUrlParam(
  raw: string | null | undefined,
): SpanStatsConfigParseResult {
  if (!raw) {
    return { ok: true, config: normalizeSpanStatsConfig({}) };
  }

  try {
    return {
      ok: true,
      config: normalizeSpanStatsConfig(JSON.parse(raw)),
    };
  } catch {
    return {
      ok: false,
      error: 'Could not read stats_config from the URL.',
      config: normalizeSpanStatsConfig({}),
    };
  }
}

export function serializeSpanStatsConfig(config: SpanStatsConfig): string {
  return JSON.stringify(normalizeSpanStatsConfig(config));
}

export function areSpanFiltersEqual(
  left: SpanFilters,
  right: SpanFilters,
): boolean {
  return serializeSpanFilters(left) === serializeSpanFilters(right);
}

export function getSpanFilterSummary(filters: SpanFilters): SpanFilterSummary {
  const normalized = normalizeSpanFilters(filters, filters.timeRange);
  const categories = [
    {
      id: 'trace',
      label: 'Trace',
      count: countPresent([
        normalized.traceId,
        normalized.spanId,
        normalized.spanKind,
      ]),
    },
    {
      id: 'service',
      label: 'Service',
      count: countPresent([normalized.serviceName, normalized.servicePeer]),
    },
    {
      id: 'database',
      label: 'Database',
      count: countPresent([
        normalized.dbSystem,
        normalized.dbCollection,
        normalized.dbNamespace,
        normalized.dbOperation,
      ]),
    },
    {
      id: 'http',
      label: 'HTTP',
      count: countPresent([
        normalized.httpMethod,
        normalized.httpStatusCode,
        normalized.httpOrigin,
        normalized.httpHost,
      ]),
    },
    {
      id: 'duration',
      label: 'Duration',
      count: countPresent([normalized.durationMinMs, normalized.durationMaxMs]),
    },
    {
      id: 'attributes',
      label: 'Attributes',
      count:
        (normalized.stringAttributes?.length ?? 0) +
        (normalized.numberAttributes?.length ?? 0),
    },
  ].filter(
    (category): category is SpanFilterCategorySummary => category.count > 0,
  );

  return {
    total: categories.reduce((sum, category) => sum + category.count, 0),
    categories,
  };
}

export function normalizeSpanFilters(
  value: unknown,
  fallbackTimeRange: TimeRange = getDefaultTimeRange(),
): SpanFilters {
  const input = isRecord(value) ? value : {};
  return {
    timeRange: normalizeTimeRange(input.timeRange, fallbackTimeRange),
    ...stringField(input, 'traceId'),
    ...stringField(input, 'spanId'),
    ...stringField(input, 'spanKind'),
    ...stringField(input, 'serviceName'),
    ...stringField(input, 'servicePeer'),
    ...stringField(input, 'dbSystem'),
    ...stringField(input, 'dbCollection'),
    ...stringField(input, 'dbNamespace'),
    ...stringField(input, 'dbOperation'),
    ...stringField(input, 'httpMethod'),
    ...stringField(input, 'httpStatusCode'),
    ...stringField(input, 'httpOrigin'),
    ...stringField(input, 'httpHost'),
    ...stringField(input, 'durationMinMs'),
    ...stringField(input, 'durationMaxMs'),
    stringAttributes: normalizeAttributeFilters(input.stringAttributes),
    numberAttributes: normalizeAttributeFilters(input.numberAttributes),
  };
}

export function normalizeSpanStatsConfig(value: unknown): SpanStatsConfig {
  const input = isRecord(value) ? value : {};
  const numericalAgg = normalizeNumericalAggConfig(input.numericalAgg);
  const summaryConfig = normalizeSummaryConfig(input.summaryConfig);
  const attributes = Array.isArray(input.attributes)
    ? input.attributes
        .filter((attr): attr is string => typeof attr === 'string')
        .map((attr) => attr.trim())
        .filter(Boolean)
    : undefined;

  return {
    ...(numericalAgg ? { numericalAgg } : {}),
    ...(summaryConfig ? { summaryConfig } : {}),
    ...(attributes?.length ? { attributes } : {}),
  };
}

function normalizeNumericalAggConfig(
  value: unknown,
): NumericalAggConfig | undefined {
  const defaultConfig = getDefaultSpanStatsConfig().numericalAgg;
  if (!isRecord(value)) return defaultConfig;
  const aggregation = isAggType(value.aggregation)
    ? value.aggregation
    : defaultConfig?.aggregation;
  const resType = isResType(value.resType)
    ? value.resType
    : defaultConfig?.resType;
  return { aggregation, resType };
}

function normalizeSummaryConfig(
  value: unknown,
): DistributionSummaryConfig | undefined {
  if (!isRecord(value)) return undefined;
  if (typeof value.approximateCount !== 'boolean') return undefined;
  return { approximateCount: value.approximateCount };
}

function normalizeTimeRange(value: unknown, fallback: TimeRange): TimeRange {
  if (!isRecord(value)) return fallback;
  const startMs = Number(value.startMs);
  const endMs = Number(value.endMs);
  if (!Number.isFinite(startMs) || !Number.isFinite(endMs)) return fallback;
  return { startMs, endMs };
}

function stringField(
  input: Record<string, unknown>,
  key: keyof Omit<
    SpanFilters,
    'timeRange' | 'stringAttributes' | 'numberAttributes'
  >,
) {
  const value = input[key];
  if (typeof value !== 'string') return {};
  const trimmed = value.trim();
  return trimmed ? { [key]: trimmed } : {};
}

function normalizeAttributeFilters(value: unknown): AttributeFilterInput[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter(isRecord)
    .map((row) => ({
      id: typeof row.id === 'string' ? row.id : '',
      key: typeof row.key === 'string' ? row.key.trim() : '',
      value: typeof row.value === 'string' ? row.value.trim() : '',
    }))
    .filter((row) => row.key && row.value);
}

function countPresent(values: Array<string | undefined>): number {
  return values.filter(Boolean).length;
}

function isAggType(value: unknown): value is AGG_TYPE {
  return (
    typeof value === 'string' &&
    [
      'AVG',
      'SUM',
      'MIN',
      'MAX',
      'COUNT',
      'P50',
      'P75',
      'P90',
      'P95',
      'P99',
    ].includes(value)
  );
}

function isResType(value: unknown): value is RES_TYPE {
  return (
    typeof value === 'string' &&
    ['SECONDLY', 'MINUTELY', 'HOURLY'].includes(value)
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

export function buildSpanQueryV2Request(
  filters: SpanFilters,
): SpanQueryV2Request {
  return omitUndefined({
    traceId: filters.traceId,
    spanId: filters.spanId,
    kind: filters.spanKind,
    dbFilters: buildDbFilters(filters),
    durationFilter: buildDurationFilter(filters),
    httpFilters: buildHttpFilters(filters),
    serviceFilter: buildServiceFilters(filters),
    timestampFilter: toTimestampFilterNs(filters.timeRange),
    stringAttributesFilter: buildStringAttributes(filters),
    numberAttributesFilter: buildNumberAttributes(filters),
  });
}

export function buildSpanStatsQueryRequest(
  filters: SpanFilters,
  config: {
    numericalAgg?: NumericalAggConfig;
    summaryConfig?: DistributionSummaryConfig;
    attributes?: string[];
  },
): SpansQueryStatsRequest {
  const attributes =
    config.attributes && config.attributes.length
      ? config.attributes
      : undefined;
  return omitUndefined({
    traceId: filters.traceId,
    kind: filters.spanKind,
    dbFilters: buildDbFilters(filters),
    durationFilter: buildDurationFilter(filters),
    httpFilters: buildHttpFilters(filters),
    serviceFilter: buildServiceFilters(filters),
    timestampFilter: toTimestampFilterNs(filters.timeRange),
    stringAttributesFilter: buildStringAttributes(filters),
    numberAttributesFilter: buildNumberAttributes(filters),
    numericalAgg: config.numericalAgg,
    summaryConfig: config.summaryConfig,
    attributes,
  });
}

export function buildFlameGraphQueryRequest(filters: {
  timeRange: TimeRange;
  traceId?: string;
  spanId?: string;
}): SpanQueryV2Request {
  return {
    traceId: filters.traceId,
    timestampFilter: toTimestampFilterNs(filters.timeRange),
  };
}

export function toTimestampFilterNs(range: TimeRange): TimestampFilter {
  return {
    tsStartNanos: range.startMs * 1_000_000,
    tsEndNanos: range.endMs * 1_000_000,
  };
}

export function formatTimestamp(tsStartNs?: number): string {
  if (!tsStartNs) return '—';
  return new Date(tsStartNs / 1_000_000).toLocaleString();
}

export function formatDuration(startNs?: number, endNs?: number): string {
  if (!startNs || !endNs) return '—';
  const ms = (endNs - startNs) / 1_000_000;
  if (ms < 1000) return `${ms.toFixed(1)} ms`;
  return `${(ms / 1000).toFixed(2)} s`;
}

export function buildDbFilters(filters: SpanFilters): DbFilters | undefined {
  return omitUndefinedOrEmpty({
    system: filters.dbSystem,
    collection: filters.dbCollection,
    namespace: filters.dbNamespace,
    operation: filters.dbOperation,
  });
}

export function buildDurationFilter(
  filters: SpanFilters,
): DurationFilter | undefined {
  const min = parseOptionalNumber(filters.durationMinMs);
  const max = parseOptionalNumber(filters.durationMaxMs);
  if (min && max) {
    return {
      durMinMillis: min,
      durMaxMillis: max,
    };
  }
}

export function buildHttpFilters(
  filters: SpanFilters,
): HttpFilters | undefined {
  return omitUndefinedOrEmpty({
    httpMethod: filters.httpMethod,
    statusCode: parseOptionalNumber(filters.httpStatusCode),
    origin: filters.httpOrigin,
    host: filters.httpHost,
  });
}

export function buildServiceFilters(
  filters: SpanFilters,
): ServiceFilter | undefined {
  return omitUndefinedOrEmpty({
    service: filters.serviceName,
    peer: filters.servicePeer,
  });
}

function omitUndefined<T extends Record<string, unknown>>(value: T): T {
  return Object.fromEntries(
    Object.entries(value).filter(([, field]) => field !== undefined),
  ) as T;
}

function omitUndefinedOrEmpty<T extends Record<string, unknown>>(
  value: T,
): T | undefined {
  const compact = omitUndefined(value);
  return Object.keys(compact).length ? compact : undefined;
}

export function buildStringAttributes(
  filters: SpanFilters,
): StringAttributeFilter[] | undefined {
  if (!filters.stringAttributes) return undefined;
  const normalized = filters.stringAttributes
    .map((row) => ({
      key: row.key.trim(),
      value: row.value.trim(),
    }))
    .filter((row) => row.key && row.value);

  if (!normalized.length) return undefined;
  return normalized;
}

export function buildNumberAttributes(
  filters: SpanFilters,
): NumberAttributeFilter[] | undefined {
  if (!filters.numberAttributes) return undefined;
  const normalized = filters.numberAttributes
    .map((row) => ({
      key: row.key.trim(),
      value: parseOptionalNumber(row.value),
    }))
    .filter((row) => row.key && row.value !== undefined);

  if (!normalized.length) return undefined;
  return normalized as NumberAttributeFilter[];
}

export function parseOptionalNumber(
  value: string | undefined,
): number | undefined {
  if (!value) return undefined;
  const parsed = Number(value);
  return Number.isNaN(parsed) ? undefined : parsed;
}

export function getHttpMethodColor(method: string): string {
  const normalized = method.trim().toUpperCase();
  if (['GET', 'HEAD'].includes(normalized)) return 'blue.7';
  if (['POST', 'PUT', 'PATCH'].includes(normalized)) return 'teal.7';
  if (normalized === 'DELETE') return 'red.7';
  if (['OPTIONS', 'TRACE'].includes(normalized)) return 'grape.7';
  return 'gray.7';
}

export function getHttpStatusColor(status: number): string {
  if (status >= 200 && status < 300) return 'green.7';
  if (status >= 400 && status < 500) return 'yellow.7';
  if (status >= 500 && status < 600) return 'red.7';
  return 'gray.7';
}

export function getDbOperationColor(value: string): string {
  const lower = value.trim().toLowerCase();
  if (lower.startsWith('select')) return 'blue.7';
  if (lower.startsWith('insert')) return 'teal.7';
  if (lower.startsWith('alter')) return 'yellow.8';
  if (lower.startsWith('drop')) return 'red.7';
  return 'gray.7';
}

export function selectAttributes({
  type,
  resp,
}: {
  type: 'string' | 'number';
  resp?: SpanAttributeHintsResponse;
}): string[] {
  if (!resp) return [];
  const custom = resp.customAttributes
    ? resp.customAttributes
        .filter((attr) => attr.type === type)
        .map((attr) => attr.name)
    : [];
  const defaultAttr = resp.defaultAttributes
    ? resp.defaultAttributes
        .filter((attr) => attr.type === type)
        .map((attr) => attr.name)
    : [];
  return uniq([...custom, ...defaultAttr]);
}

export function getAttributeList(
  resp: SpanAttributeHintsResponse | undefined,
): string[] {
  if (!resp) return [];
  return [...resp?.customAttributes.map((attr) => attr.name)];
}

export function getWaterfallLabel({ row }: { row: SpanRowV2 }) {
  return row.serviceName || row.dbNamespace || row.rpcMethod || 'unknown-step';
}
