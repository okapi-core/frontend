import { FlameGraphNode, SpanRowV2 } from '@/lib/response-types';

export function getSpanDurationMs(span: SpanRowV2) {
  if (span.tsStartNs === undefined || span.tsEndNs === undefined) return 0;
  return Math.max(0, (span.tsEndNs - span.tsStartNs) / 1_000_000);
}

export function getServiceBreakdown(spans: SpanRowV2[]) {
  const totals = new Map<string, number>();
  const starts = spans
    .map((span) => span.tsStartNs)
    .filter((value): value is number => value !== undefined);
  const traceStartMs = starts.length ? Math.min(...starts) / 1_000_000 : 0;
  spans.forEach((span) => {
    const service = span.serviceName || 'Unknown service';
    totals.set(service, (totals.get(service) || 0) + getSpanDurationMs(span));
  });
  return [...totals.entries()]
    .map(([service, durationMs]) => ({
      service,
      durationMs,
      spans: spans
        .filter((span) => (span.serviceName || 'Unknown service') === service)
        .flatMap((span) => {
          if (span.tsStartNs === undefined) return [];
          return [{
            startMs: span.tsStartNs / 1_000_000,
            durationMs: getSpanDurationMs(span),
          }];
        }),
    }))
    .map((service) => ({ ...service, traceStartMs }))
    .sort((a, b) => b.durationMs - a.durationMs);
}

export function toFlameGraphDatum(nodes: FlameGraphNode[]): any {
  return {
    name: 'Trace',
    value: nodes.reduce((total, node) => total + node.durationNs, 0),
    children: nodes.map((node) => ({
      name: `${node.serviceName || 'Unknown service'} · ${node.spanId.slice(0, 8)}`,
      value: node.durationNs,
      children: node.children ? toFlameChildren(node.children) : undefined,
    })),
  };
}

function toFlameChildren(nodes: FlameGraphNode[]): any[] {
  return nodes.map((node) => ({
    name: `${node.serviceName || 'Unknown service'} · ${node.spanId.slice(0, 8)}`,
    value: node.durationNs,
    children: node.children ? toFlameChildren(node.children) : undefined,
  }));
}

export function formatTraceDuration(durationMs: number) {
  if (durationMs < 1) return `${(durationMs * 1000).toFixed(0)} μs`;
  if (durationMs < 1000) return `${durationMs.toFixed(1)} ms`;
  return `${(durationMs / 1000).toFixed(2)} s`;
}
