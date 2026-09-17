import { useSpansApi } from '@/lib/domain/spans';
import { Button, Group, Text } from '@mantine/core';
import { SearchIcon } from 'lucide-react';
import { useState } from 'react';
import {
  buildSpanQueryRequestFromFollowUp,
  parseSpanQueryRequest,
} from '../lib';
import { useOscarChatStore } from '../store';
import { GetTraceFollowUpPayload } from '@/lib/response-types';

export function GetTracesAction({
  content,
  label,
  request,
}: {
  content?: string;
  label?: string;
  request?: ReturnType<typeof buildSpanQueryRequestFromFollowUp>;
}) {
  const [loading, setLoading] = useState(false);
  const spansApi = useSpansApi();
  const setSidebarData = useOscarChatStore((s) => s.setSidebarData);
  const setShowSideBar = useOscarChatStore((s) => s.setShowSideBar);

  async function handleClick() {
    const parsed = request ?? (content ? parseSpanQueryRequest(content) : null);
    if (!parsed) return;
    setLoading(true);
    try {
      const result = await spansApi.querySpans(parsed);
      if (result.data) {
        setSidebarData({ type: 'spans', query: result.data });
        setShowSideBar(true);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <Group gap="xs">
      <Button
        size="xs"
        variant="light"
        leftSection={<SearchIcon size={14} />}
        loading={loading}
        onClick={handleClick}
      >
        <Text size="xs">{label ?? 'View traces'}</Text>
      </Button>
    </Group>
  );
}

export function GetTraceFollowUp({
  payload,
}: {
  payload: GetTraceFollowUpPayload;
}) {
  const request = buildSpanQueryRequestFromFollowUp(payload);
  return (
    <GetTracesAction
      request={request}
      label={
        payload.traceId
          ? `Inspect trace ${payload.traceId.slice(0, 8)}…`
          : 'Inspect trace'
      }
    />
  );
}
