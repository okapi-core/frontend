import { decodePayload } from '@/lib/payload-decoder';
import { ChatMessageResponse } from '@/lib/response-types';
import { GetTraceFollowUp, GetTracesAction } from './get-traces-action';
import { MarkdownMessage } from './markdown-message';
import { PlanMessage } from './plan-message';
import { PlotCmdAction, PlotMetricAction } from './plot-metric-action';
import { ThoughtBubble } from './thought-bubble';
import { ToolCallMessage } from './tool-call-message';

export function ChatPayloadMessage({
  response,
}: {
  response: ChatMessageResponse;
}) {
  const decoded = decodePayload(response);

  switch (decoded.type) {
    case 'MARKDOWN_TEXT':
      return (
        <MarkdownMessage
          content={decoded.content}
          role="ASSISTANT"
          timestamp={response.timestamp}
        />
      );

    case 'RESPONSE':
      return (
        <MarkdownMessage
          content={decoded.response}
          role="ASSISTANT"
          timestamp={response.timestamp}
        />
      );

    case 'THOUGHT':
      return <ThoughtBubble thought={decoded.thought} />;

    case 'PLAN':
      return <PlanMessage plan={decoded.plan} />;

    case 'GET_TRACES_CMD':
      return <GetTracesAction content={decoded.content} />;

    case 'GET_TRACE_FOLLOW_UP':
      return <GetTraceFollowUp payload={decoded.payload} />;

    case 'PLOT_CMD':
      return <PlotCmdAction content={decoded.content} />;

    case 'PLOT_METRIC_FOLLOW_UP':
      return <PlotMetricAction request={decoded.request} />;

    case 'TOOL_CALL_REQUEST':
      return (
        <ToolCallMessage
          toolName={decoded.payload.toolName}
          summary={decoded.payload.summary}
          payloadJson={decoded.payload.requestJson}
          variant="request"
        />
      );

    case 'TOOL_CALL_RESPONSE':
      return (
        <ToolCallMessage
          toolName={decoded.payload.toolName}
          summary={decoded.payload.summary}
          variant="response"
        />
      );

    case 'NO_OP':
      return null;

    case 'UNKNOWN':
      return (
        <MarkdownMessage
          content={decoded.content}
          role="ASSISTANT"
          timestamp={response.timestamp}
        />
      );
  }
}
