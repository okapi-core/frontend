import { GetMetricsRequest } from '@/lib/request-types';

export type TimeBoundary = { start: number; end: number };

export function mergeTimeBoundary(
  current: GetMetricsRequest,
  boundary: TimeBoundary,
): GetMetricsRequest {
  return {
    ...current,
    start: boundary.start,
    end: boundary.end,
  };
}
