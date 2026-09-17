import { expect, it } from 'vitest';
import {
  buildSpanQueryV2Request,
  getDbOperationColor,
  getHttpMethodColor,
  getHttpStatusColor,
  getSpanFilterSummary,
  parseSpanFiltersUrlParam,
  parseSpanStatsConfigUrlParam,
  serializeSpanFilters,
  serializeSpanStatsConfig,
} from './lib';

it('should build the correct request', () => {
  const req = buildSpanQueryV2Request({
    timeRange: {
      startMs: 0,
      endMs: 10,
    },
    traceId: 'traceId',
  });
  expect(req.traceId).toBe('traceId');
});

it('reads right db filters', () => {
  const req1 = buildSpanQueryV2Request({
    timeRange: {
      startMs: 0,
      endMs: 10,
    },
    dbCollection: 'collectA',
  });
  expect(req1.dbFilters?.collection).toBe('collectA');

  const req2 = buildSpanQueryV2Request({
    timeRange: {
      startMs: 0,
      endMs: 10,
    },
    dbCollection: 'collectA',
    dbNamespace: 'ns-A',
  });
  expect(req2.dbFilters?.collection).toBe('collectA');
  expect(req2.dbFilters?.namespace).toBe('ns-A');
});

it('reads right http filters', () => {
  const req1 = buildSpanQueryV2Request({
    timeRange: {
      startMs: 0,
      endMs: 10,
    },
    httpHost: 'localhost',
  });
  expect(req1.httpFilters?.host).toBe('localhost');

  const req2 = buildSpanQueryV2Request({
    timeRange: {
      startMs: 0,
      endMs: 10,
    },
    httpHost: 'localhost',
    httpMethod: 'GET',
  });
  expect(req2.httpFilters?.host).toBe('localhost');
  expect(req2.httpFilters?.httpMethod).toBe('GET');
});

it('reads right svc filters', () => {
  const req1 = buildSpanQueryV2Request({
    timeRange: {
      startMs: 0,
      endMs: 10,
    },
    serviceName: 'svc-a',
  });
  expect(req1.serviceFilter?.service).toBe('svc-a');
});

it('collects right string attributes', () => {
  const req1 = buildSpanQueryV2Request({
    timeRange: {
      startMs: 0,
      endMs: 10,
    },
    stringAttributes: [
      {
        key: 'key',
        value: 'val',
      },
    ],
  });
  expect(req1.stringAttributesFilter).toContainEqual({
    key: 'key',
    value: 'val',
  });

  const req2 = buildSpanQueryV2Request({
    timeRange: {
      startMs: 0,
      endMs: 10,
    },
    stringAttributes: [
      {
        key: 'key',
        value: 'val',
      },
      {
        key: 'key2',
        value: 'val2',
      },
    ],
  });
  expect(req2.stringAttributesFilter).toContainEqual({
    key: 'key',
    value: 'val',
  });
  expect(req2.stringAttributesFilter).toContainEqual({
    key: 'key2',
    value: 'val2',
  });
});

it('parses span filters from a url parameter', () => {
  const raw = JSON.stringify({
    timeRange: { startMs: 1000, endMs: 2000 },
    serviceName: ' checkout ',
    stringAttributes: [
      { key: ' http.route ', value: ' /checkout ' },
      { key: '', value: 'ignored' },
    ],
  });

  const parsed = parseSpanFiltersUrlParam(raw);

  expect(parsed.ok).toBe(true);
  expect(parsed.filters).toMatchObject({
    timeRange: { startMs: 1000, endMs: 2000 },
    serviceName: 'checkout',
    stringAttributes: [{ id: '', key: 'http.route', value: '/checkout' }],
  });
});

it('falls back when span filters are absent or malformed', () => {
  const fallbackTimeRange = { startMs: 10, endMs: 20 };

  const missing = parseSpanFiltersUrlParam(null, fallbackTimeRange);
  expect(missing.ok).toBe(true);
  expect(missing.filters.timeRange).toEqual(fallbackTimeRange);

  const malformed = parseSpanFiltersUrlParam('{bad json', fallbackTimeRange);
  expect(malformed.ok).toBe(false);
  expect(malformed.filters.timeRange).toEqual(fallbackTimeRange);
});

it('serializes span filters in normalized form', () => {
  const serialized = serializeSpanFilters({
    timeRange: { startMs: 1, endMs: 2 },
    serviceName: ' checkout ',
    traceId: '',
    stringAttributes: [
      { key: ' attr ', value: ' value ' },
      { key: 'empty', value: '' },
    ],
    numberAttributes: [],
  });

  expect(JSON.parse(serialized)).toEqual({
    timeRange: { startMs: 1, endMs: 2 },
    serviceName: 'checkout',
    stringAttributes: [{ id: '', key: 'attr', value: 'value' }],
    numberAttributes: [],
  });
});

it('parses and serializes stats config from a url parameter', () => {
  const raw = JSON.stringify({
    attributes: [' duration_ms ', '', 'retries'],
    numericalAgg: {
      aggregation: 'P95',
      resType: 'MINUTELY',
    },
    summaryConfig: {
      approximateCount: true,
    },
  });

  const parsed = parseSpanStatsConfigUrlParam(raw);

  expect(parsed.ok).toBe(true);
  expect(parsed.config).toEqual({
    attributes: ['duration_ms', 'retries'],
    numericalAgg: {
      aggregation: 'P95',
      resType: 'MINUTELY',
    },
    summaryConfig: {
      approximateCount: true,
    },
  });
  expect(JSON.parse(serializeSpanStatsConfig(parsed.config))).toEqual(
    parsed.config,
  );
});

it('falls back when stats config is absent or malformed', () => {
  const defaultConfig = {
    numericalAgg: {
      aggregation: 'AVG',
      resType: 'SECONDLY',
    },
  };
  const missing = parseSpanStatsConfigUrlParam(null);
  expect(missing.ok).toBe(true);
  expect(missing.config).toEqual(defaultConfig);

  const malformed = parseSpanStatsConfigUrlParam('{bad json');
  expect(malformed.ok).toBe(false);
  expect(malformed.config).toEqual(defaultConfig);
});

it('summarizes active span filters by category without counting time', () => {
  const summary = getSpanFilterSummary({
    timeRange: { startMs: 1, endMs: 2 },
    traceId: 'trace-1',
    spanId: 'span-1',
    serviceName: 'checkout',
    dbSystem: 'postgresql',
    dbNamespace: 'public',
    httpMethod: 'GET',
    durationMinMs: '10',
    durationMaxMs: '100',
    stringAttributes: [{ key: 'http.route', value: '/checkout' }],
    numberAttributes: [{ key: 'retries', value: '2' }],
  });

  expect(summary.total).toBe(10);
  expect(summary.categories).toEqual([
    { id: 'trace', label: 'Trace', count: 2 },
    { id: 'service', label: 'Service', count: 1 },
    { id: 'database', label: 'Database', count: 2 },
    { id: 'http', label: 'HTTP', count: 1 },
    { id: 'duration', label: 'Duration', count: 2 },
    { id: 'attributes', label: 'Attributes', count: 2 },
  ]);
});

it('ignores blank span filters in the summary', () => {
  const summary = getSpanFilterSummary({
    timeRange: { startMs: 1, endMs: 2 },
    traceId: ' ',
    serviceName: '',
    httpHost: 'api.example.com',
    stringAttributes: [{ key: '', value: 'ignored' }],
    numberAttributes: [{ key: 'retries', value: '' }],
  });

  expect(summary.total).toBe(1);
  expect(summary.categories).toEqual([{ id: 'http', label: 'HTTP', count: 1 }]);
});

it('returns the right http method colors', () => {
  expect(getHttpMethodColor('GET')).toBe('blue.7');
  expect(getHttpMethodColor('post')).toBe('teal.7');
  expect(getHttpMethodColor('DELETE')).toBe('red.7');
  expect(getHttpMethodColor('TRACE')).toBe('grape.7');
  expect(getHttpMethodColor('PATCH')).toBe('teal.7');
});

it('returns the right http status colors', () => {
  expect(getHttpStatusColor(200)).toBe('green.7');
  expect(getHttpStatusColor(404)).toBe('yellow.7');
  expect(getHttpStatusColor(503)).toBe('red.7');
  expect(getHttpStatusColor(102)).toBe('gray.7');
});

it('returns the right db operation colors', () => {
  expect(getDbOperationColor('select * from users')).toBe('blue.7');
  expect(getDbOperationColor('insert into users')).toBe('teal.7');
  expect(getDbOperationColor('alter table users')).toBe('yellow.8');
  expect(getDbOperationColor('drop table users')).toBe('red.7');
  expect(getDbOperationColor('update users')).toBe('gray.7');
});
