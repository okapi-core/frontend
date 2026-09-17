import { OscarPageShell } from '@/app/main/oscar/shared/oscar-page-shell';
import {
  Badge,
  Box,
  Flex,
  Group,
  Loader,
  ScrollArea,
  Stack,
  Text,
  Title,
} from '@mantine/core';
import { useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { mergeMessages } from '../oscar-chat/lib';
import { usePostMessage } from '../oscar-chat/mutations';
import { ChatPayloadMessage } from '../oscar-chat/parts/chat-payload-message';
import { ChatSideBar } from '../oscar-chat/parts/chat-side-bar';
import { MarkdownMessage } from '../oscar-chat/parts/markdown-message';
import { OscarError } from '../oscar-chat/parts/oscar-error';
import { UserInput } from '../oscar-chat/parts/user-input';
import { loadInitialHistory } from '../oscar-chat/queries';
import { useOscarChatStore } from '../oscar-chat/store';

export default function OscarSession() {
  return (
    <OscarPageShell>
      <OscarSessionInner />
    </OscarPageShell>
  );
}

function OscarSessionInner() {
  const { sessionId } = useParams<{ sessionId: string }>();

  const resetSession = useOscarChatStore((s) => s.resetSession);
  const chatMessages = useOscarChatStore((s) => s.chatMessages);
  const userMessages = useOscarChatStore((s) => s.userMessages);
  const isPolling = useOscarChatStore((s) => s.isPolling);

  const { startPolling } = usePostMessage();
  const messages = mergeMessages(chatMessages, userMessages);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!sessionId) return;
    resetSession(sessionId);
    loadInitialHistory({ sessionId, startPolling });
  }, [sessionId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length, isPolling]);

  return (
    <Flex direction="column" h="100%" style={{ overflow: 'hidden' }}>
      <Group justify="space-between" align="center" mb="md">
        <Group gap="xs" align="baseline">
          <Title order={4}>Oscar</Title>
          <Badge variant="light" size="sm" color="violet">
            AI Assistant
          </Badge>
        </Group>
      </Group>

      <OscarError />

      <Box style={{ flex: 1, overflow: 'hidden', minHeight: 0 }}>
        <ScrollArea h="100%" offsetScrollbars>
          <Stack gap="sm" p="xs" pb="md">
            {messages.length === 0 && !isPolling && (
              <Text c="dimmed" size="sm" ta="center" mt="xl">
                Let Oscar investigate.
              </Text>
            )}
            {messages.map((item, i) =>
              item.kind === 'user' ? (
                <Box
                  key={item.timestamp}
                  data-testid="transcript-message"
                  data-message-role="USER"
                  data-message-id={`user-${item.timestamp}`}
                  data-message-type="USER"
                >
                  <MarkdownMessage
                    content={item.msg}
                    role="USER"
                    timestamp={item.timestamp}
                  />
                </Box>
              ) : (
                <Box
                  key={item.response.id ?? i}
                  data-testid="transcript-message"
                  data-message-role={item.response.role}
                  data-message-id={item.response.id}
                  data-message-type={item.response.responseType ?? 'UNKNOWN'}
                >
                  <ChatPayloadMessage response={item.response} />
                </Box>
              ),
            )}
            {isPolling && (
              <Group gap="xs">
                <Loader size="xs" />
                <Text size="xs" c="dimmed">
                  Oscar is working…
                </Text>
              </Group>
            )}
            <div ref={bottomRef} />
          </Stack>
        </ScrollArea>
      </Box>

      <Box mt="sm">
        <UserInput />
      </Box>

      <ChatSideBar />
    </Flex>
  );
}
