import { SpanQueryV2Request } from '@/lib/request-types';
import {
  ChatMessageResponse,
  GetTraceFollowUpPayload,
} from '@/lib/response-types';

export type MergedChatItem =
  | { kind: 'user'; timestamp: number; msg: string }
  | { kind: 'server'; response: ChatMessageResponse };

export function mergeMessages(
  chatMessages: ChatMessageResponse[],
  userMessages: { timestamp: number; msg: string }[],
): MergedChatItem[] {
  const serverItems: MergedChatItem[] = chatMessages
    .filter((m) => m.role !== 'USER')
    .map((r) => ({
      kind: 'server',
      response: r,
    }));
  const userItems: MergedChatItem[] = userMessages.map((m) => ({
    kind: 'user',
    timestamp: m.timestamp,
    msg: m.msg,
  }));
  return [...serverItems, ...userItems].sort((a, b) => {
    const tsA = a.kind === 'user' ? a.timestamp : a.response.timestamp;
    const tsB = b.kind === 'user' ? b.timestamp : b.response.timestamp;
    return tsA - tsB;
  });
}

export function parseSpanQueryRequest(
  content: string,
): SpanQueryV2Request | null {
  try {
    return JSON.parse(content) as SpanQueryV2Request;
  } catch {
    return null;
  }
}

export function buildSpanQueryRequestFromFollowUp(
  payload: GetTraceFollowUpPayload,
): SpanQueryV2Request {
  const request: SpanQueryV2Request = {};
  if (payload.traceId) request.traceId = payload.traceId;
  if (payload.from || payload.to) {
    request.timestampFilter = {
      tsStartNanos: payload.from,
      tsEndNanos: payload.to,
    };
  }
  return request;
}
