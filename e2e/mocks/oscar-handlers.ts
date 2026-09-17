import type {
  CreateSessionBlindRequest,
  GetHistoryRequest,
  PostMessageRequest,
} from '../../src/lib/request-types';
import type {
  ChatHistoryResponse,
  ChatMessageResponse,
  ChatMessageUpdatesResponse,
  ChatResponse,
  SessionMetaResponse,
} from '../../src/lib/response-types';
import { http, HttpResponse, type RequestHandler } from 'msw';

type OscarFlowState = {
  sessionId: string;
  history: ChatMessageResponse[];
  updateStreams: ChatMessageUpdatesResponse[];
  createRequests: CreateSessionBlindRequest[];
  historyRequests: GetHistoryRequest[];
  postRequests: PostMessageRequest[];
  updateRequestCount: number;
};

export function createOscarFlowHandlers(
  state: OscarFlowState,
): RequestHandler[] {
  return [
    http.post<never, CreateSessionBlindRequest, SessionMetaResponse>(
      '*/api/v1/sessions',
      async ({ request }) => {
        state.createRequests.push(await request.json());

        return HttpResponse.json({
          sessionId: state.sessionId,
          state: 'OPEN',
        });
      },
    ),
    http.post<{ sessionId: string }, GetHistoryRequest, ChatHistoryResponse>(
      '*/api/v1/chat/messages/:sessionId',
      async ({ request }) => {
        state.historyRequests.push(await request.json());

        return HttpResponse.json({
          responses: state.history,
        });
      },
    ),
    http.get<{ sessionId: string }, never, SessionMetaResponse>(
      '*/api/v1/sessions/:sessionId/meta',
      ({ params }) =>
        HttpResponse.json({
          sessionId: params.sessionId,
          state: 'OPEN',
        }),
    ),
    http.post<{ sessionId: string }, PostMessageRequest, ChatResponse>(
      '*/api/v1/chat/:sessionId',
      async ({ params, request }) => {
        state.postRequests.push(await request.json());

        return HttpResponse.json({
          sessionId: params.sessionId,
          streamId: `stream-${state.postRequests.length}`,
        });
      },
    ),
    http.get<{ sessionId: string }, never, ChatMessageUpdatesResponse>(
      '*/api/v1/chat/:sessionId/updates',
      () => {
        const response = state.updateStreams.shift() ?? { streamState: 'FIN' };
        state.updateRequestCount += 1;

        return HttpResponse.json(response);
      },
    ),
  ];
}

export function userMessage({
  id,
  timestamp,
  contents,
}: {
  id: number;
  timestamp: number;
  contents: string;
}): ChatMessageResponse {
  return {
    id,
    timestamp,
    contents,
    eventStreamId: 1,
    role: 'USER',
  };
}

export function markdownMessage({
  id,
  timestamp,
  contents,
}: {
  id: number;
  timestamp: number;
  contents: string;
}): ChatMessageResponse {
  return {
    id,
    timestamp,
    contents,
    eventStreamId: 1,
    responseType: 'MARKDOWN_TEXT',
    role: 'ASSISTANT',
  };
}

export function responseMessage({
  id,
  timestamp,
  response,
}: {
  id: number;
  timestamp: number;
  response: string;
}): ChatMessageResponse {
  return {
    id,
    timestamp,
    contents: JSON.stringify({ response }),
    eventStreamId: 1,
    responseType: 'RESPONSE',
    role: 'ASSISTANT',
  };
}

export function createOscarFlowState({
  sessionId,
  history,
  updateStreams,
}: {
  sessionId: string;
  history: ChatMessageResponse[];
  updateStreams: ChatMessageUpdatesResponse[];
}): OscarFlowState {
  return {
    sessionId,
    history,
    updateStreams,
    createRequests: [],
    historyRequests: [],
    postRequests: [],
    updateRequestCount: 0,
  };
}
