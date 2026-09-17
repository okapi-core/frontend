import { expect, it } from 'vitest';
import { deriveGoldenAggregates, normalizeMetrics } from './lib';

it('preserves all red metric fields while normalizing', () => {
  const metrics = normalizeMetrics({
    ts: [1],
    counts: [10],
    rps: [1],
    rpm: [60],
    errorRates: [0.1],
    errors: [1],
    durationsP50: [10],
    durationsP75: [20],
    durationsP90: [30],
    durationsP99: [40],
    totalRequests: 10,
    totalErrors: 1,
    availability: 0.9,
  });

  expect(metrics.rps).toEqual([1]);
  expect(metrics.rpm).toEqual([60]);
  expect(metrics.errorRates).toEqual([0.1]);
  expect(metrics.totalRequests).toBe(10);
  expect(metrics.totalErrors).toBe(1);
  expect(metrics.availability).toBe(0.9);
});

it('uses backend aggregates and explicit series averages when available', () => {
  const aggregates = deriveGoldenAggregates({
    ts: [0, 1000],
    counts: [10, 20],
    rps: [10, 20],
    rpm: [600, 1200],
    errorRates: [0.1, 0.2],
    errors: [1, 4],
    durationsP50: [],
    durationsP75: [],
    durationsP90: [],
    durationsP99: [],
    totalRequests: 100,
    totalErrors: 5,
    availability: 0.95,
  });

  expect(aggregates).toMatchObject({
    totalRequests: 100,
    totalErrors: 5,
    rps: 15,
    rpm: 900,
    availability: 0.95,
    noRequests: false,
    bestEffort: false,
  });
  expect(aggregates.errorRate).toBeCloseTo(0.15);
});

it('marks fallback aggregates as best effort', () => {
  const aggregates = deriveGoldenAggregates({
    ts: [0, 1000],
    counts: [10, 20],
    rps: [],
    rpm: [],
    errorRates: [],
    errors: [1, 2],
    durationsP50: [],
    durationsP75: [],
    durationsP90: [],
    durationsP99: [],
    totalRequests: undefined as unknown as number,
    totalErrors: undefined as unknown as number,
  });

  expect(aggregates.totalRequests).toBe(30);
  expect(aggregates.totalErrors).toBe(3);
  expect(aggregates.rps).toBe(30);
  expect(aggregates.rpm).toBe(1800);
  expect(aggregates.errorRate).toBe(0.1);
  expect(aggregates.noRequests).toBe(true);
  expect(aggregates.bestEffort).toBe(true);
});
