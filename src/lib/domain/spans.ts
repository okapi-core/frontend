import {
  getAttributeHints,
  getAttributeValueHints,
  getSpansStats,
  queryFlameGraph,
  querySpans,
} from '@/lib/api';
import {
  SpanAttributeHintsRequest,
  SpanAttributeValueHintsRequest,
  SpanQueryV2Request,
  SpansQueryStatsRequest,
} from '@/lib/request-types';
import { useQuery } from '@tanstack/react-query';

export const spanKeys = {
  list: (req: SpanQueryV2Request) => ['spans-query-v2', req] as const,
  flamegraph: (req: SpanQueryV2Request) => ['spans-flamegraph', req] as const,
  stats: (req: SpansQueryStatsRequest) => ['spans-stats', req] as const,
  attributeHints: (req: SpanAttributeHintsRequest) => ['spans-attributes', req] as const,
  attributeValueHints: (req: SpanAttributeValueHintsRequest) =>
    ['spans-attribute-values', req] as const,
};

export function fetchSpans(request: SpanQueryV2Request) {
  return querySpans({ request });
}

export function fetchSpanStats(request: SpansQueryStatsRequest) {
  return getSpansStats({ request });
}

export function useSpansApi() {
  return {
    querySpans: fetchSpans,
    queryStats: fetchSpanStats,
  };
}

export function useFlameGraphQuery(req: SpanQueryV2Request) {
  return useQuery({
    queryKey: spanKeys.flamegraph(req),
    queryFn: () => queryFlameGraph({ request: req }),
    enabled: false,
  });
}

export function useListSpansQuery(req: SpanQueryV2Request) {
  return useQuery({
    queryKey: spanKeys.list(req),
    queryFn: () => querySpans({ request: req }),
    enabled: false,
  });
}

export function useSpanStatsQuery(req: SpansQueryStatsRequest) {
  return useQuery({
    queryKey: spanKeys.stats(req),
    queryFn: () => getSpansStats({ request: req }),
    enabled: false,
  });
}

export function useSpanAttributeHintsQuery(req: SpanAttributeHintsRequest) {
  return useQuery({
    queryKey: spanKeys.attributeHints(req),
    queryFn: () => getAttributeHints({ request: req }),
    enabled: true,
  });
}

export function useSpanAttributeValueHintsQuery(req: SpanAttributeValueHintsRequest) {
  return useQuery({
    queryKey: spanKeys.attributeValueHints(req),
    queryFn: () => getAttributeValueHints({ request: req }),
    enabled: true,
  });
}
