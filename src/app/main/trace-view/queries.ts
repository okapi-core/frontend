import { useFlameGraphQuery, useListSpansQuery } from '@/lib/domain/spans';
import { SpanQueryV2Request } from '@/lib/request-types';

export function useTraceSpans(req: SpanQueryV2Request) {
  return useListSpansQuery(req);
}

export function useTraceFlameGraph(req: SpanQueryV2Request) {
  return useFlameGraphQuery(req);
}
