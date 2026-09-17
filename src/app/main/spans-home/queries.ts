import {
  useFlameGraphQuery,
  useListSpansQuery,
  useSpanAttributeHintsQuery,
  useSpanAttributeValueHintsQuery,
  useSpanStatsQuery,
} from '@/lib/domain/spans';
import {
  SpanAttributeHintsRequest,
  SpanAttributeValueHintsRequest,
  SpanQueryV2Request,
  SpansQueryStatsRequest,
} from '@/lib/request-types';
import { useSpansHomeStore } from './store';

export function useFlameGraph({
  req,
}: {
  req: SpanQueryV2Request;
}) {
  return useFlameGraphQuery(req);
}

export const useListSpans = ({
  req,
}: {
  req: SpanQueryV2Request;
}) => useListSpansQuery(req);

export const useListSpansWithAuth = ({ req }: { req: SpanQueryV2Request }) => {
  return useListSpansQuery(req);
};

export function useSpanStats({
  req,
}: {
  req: SpansQueryStatsRequest;
}) {
  return useSpanStatsQuery(req);
}

export function useSpanAttributeValueHints({
  req,
}: {
  req: SpanAttributeValueHintsRequest;
}) {
  return useSpanAttributeValueHintsQuery(req);
}

export function useSpanAttributeHints({
  req,
}: {
  req: SpanAttributeHintsRequest;
}) {
  return useSpanAttributeHintsQuery(req);
}

export function useAttribValueHints({ attrib }: { attrib: string }) {
  const ts = useSpansHomeStore((state) => state.timeRange);
  return useSpanAttributeValueHints({
    req: {
      timestampFilter: {
        tsMillisEnd: ts.endMs,
        tsMillisStart: ts.startMs,
      },
      attributeName: attrib,
    },
  });
}

export function useAttributeHints() {
  const ts = useSpansHomeStore((state) => state.timeRange);
  return useSpanAttributeHints({
    req: {
      timestampFilter: {
        tsMillisEnd: ts.endMs,
        tsMillisStart: ts.startMs,
      },
    },
  });
}
