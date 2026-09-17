import { GetMetricsRequest } from './request-types';
import {
  ChatMessageResponse,
  GetTraceFollowUpPayload,
  PlotMetricFollowUpPayload,
  PostPlanPayload,
  PostResponsePayload,
  PostThoughtPayload,
  PostToolCallRequestPayload,
  PostToolCallResponsePayload,
} from './response-types';

export type DecodedPayload =
  | { type: 'MARKDOWN_TEXT'; content: string }
  | { type: 'THOUGHT'; thought: string }
  | { type: 'PLAN'; plan: string }
  | { type: 'RESPONSE'; response: string }
  | { type: 'GET_TRACES_CMD'; content: string }
  | { type: 'PLOT_CMD'; content: string }
  | { type: 'GET_TRACE_FOLLOW_UP'; payload: GetTraceFollowUpPayload }
  | { type: 'PLOT_METRIC_FOLLOW_UP'; request: GetMetricsRequest }
  | { type: 'TOOL_CALL_REQUEST'; payload: PostToolCallRequestPayload }
  | { type: 'TOOL_CALL_RESPONSE'; payload: PostToolCallResponsePayload }
  | { type: 'NO_OP' }
  | { type: 'UNKNOWN'; content: string };

function tryParse<T>(contents: string | undefined): T | null {
  if (!contents) return null;
  try {
    return JSON.parse(contents) as T;
  } catch {
    return null;
  }
}

export function decodePayload(response: ChatMessageResponse): DecodedPayload {
  const { responseType, contents = '' } = response;

  switch (responseType) {
    case 'MARKDOWN_TEXT':
      return { type: 'MARKDOWN_TEXT', content: contents };

    case 'THOUGHT': {
      const parsed = tryParse<PostThoughtPayload>(contents);
      if (!parsed) return { type: 'NO_OP' };
      return { type: 'THOUGHT', thought: parsed.thought ?? contents };
    }

    case 'PLAN': {
      const parsed = tryParse<PostPlanPayload>(contents);
      if (!parsed) return { type: 'NO_OP' };
      return { type: 'PLAN', plan: parsed.plan ?? contents };
    }

    case 'RESPONSE': {
      const parsed = tryParse<PostResponsePayload>(contents);
      if (!parsed) return { type: 'NO_OP' };
      return { type: 'RESPONSE', response: parsed.response ?? contents };
    }

    case 'GET_TRACES_CMD':
      return { type: 'GET_TRACES_CMD', content: contents };

    case 'PLOT_CMD':
      return { type: 'PLOT_CMD', content: contents };

    case 'GET_TRACE_FOLLOW_UP': {
      const parsed = tryParse<GetTraceFollowUpPayload>(contents);
      if (!parsed) return { type: 'NO_OP' };
      return {
        type: 'GET_TRACE_FOLLOW_UP',
        payload: parsed,
      };
    }

    case 'PLOT_METRIC_FOLLOW_UP': {
      const parsed = tryParse<PlotMetricFollowUpPayload>(contents);
      if (parsed?.request) {
        return { type: 'PLOT_METRIC_FOLLOW_UP', request: parsed.request };
      }
      return { type: 'NO_OP' };
    }

    case 'TOOL_CALL_REQUEST': {
      const parsed = tryParse<PostToolCallRequestPayload>(contents);
      if (!parsed) return { type: 'NO_OP' };
      return {
        type: 'TOOL_CALL_REQUEST',
        payload: parsed,
      };
    }

    case 'TOOL_CALL_RESPONSE': {
      const parsed = tryParse<PostToolCallResponsePayload>(contents);
      if (!parsed) return { type: 'NO_OP' };
      return {
        type: 'TOOL_CALL_RESPONSE',
        payload: parsed,
      };
    }

    default:
      return { type: 'UNKNOWN', content: contents };
  }
}
