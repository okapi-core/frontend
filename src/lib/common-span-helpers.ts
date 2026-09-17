import { SpanRowV2 } from './response-types';

export interface TraceAggregateView {
  startMs: number;
  endMs: number;
  durationMs: number;
  totalErrors: number;
  services: string[];
}

export function getTraceAggregateView({
  spans,
}: {
  spans: SpanRowV2[];
}): TraceAggregateView {
  let startMs = -1;
  let endMs = -1;
  let servicesSet: Set<string> = new Set();
  let totalErrors = 0;
  for (let i = 0; i < spans.length; i++) {
    const span = spans[i];
    if (span.tsStartNs) {
      if (startMs == -1) {
        startMs = span.tsStartNs / 1_000_000;
      } else {
        startMs = Math.min(span.tsStartNs / 1_000_000, startMs);
      }
    }
    if (span.tsEndNs) {
      endMs = Math.max(span.tsEndNs / 1_000_000, endMs);
    }
    if (span.serviceName) {
      servicesSet.add(span.serviceName);
    }
    if (span.spanStatus && span.spanStatus === 'ERROR') {
      totalErrors++;
    }
  }
  let durationMs = endMs - startMs;
  return {
    startMs,
    endMs,
    durationMs,
    totalErrors,
    services: [...servicesSet],
  };
}
