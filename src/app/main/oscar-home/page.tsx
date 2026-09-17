import { OscarPageShell } from '@/app/main/oscar/shared/oscar-page-shell';
import { pastNMinutes } from '@/lib/date-utils';
import { useOscarChatApi } from '@/lib/domain/chat';
import { ChatSummaryResponse } from '@/lib/response-types';
import {
  Alert,
  Badge,
  Button,
  Card,
  Center,
  Group,
  Loader,
  Stack,
  Text,
  Textarea,
  Title,
} from '@mantine/core';
import { useQuery } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useCreateSession } from './mutations';

const DEFAULT_N_MESSAGES = 100;
const CHAT_INTERVAL_OPTIONS = [
  { label: '1 day', minutes: 24 * 60 },
  { label: '5 days', minutes: 5 * 24 * 60 },
  { label: '1 week', minutes: 7 * 24 * 60 },
];

export default function OscarHome() {
  return (
    <OscarPageShell>
      <Inner />
    </OscarPageShell>
  );
}

function Inner() {
  const [message, setMessage] = useState('');
  const { startSession, isPending } = useCreateSession();

  function handleStart() {
    const trimmed = message.trim();
    if (!trimmed || isPending) return;
    startSession(trimmed);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleStart();
    }
  }

  return (
    <Center h="100%">
      <Stack w={600} gap="md">
        <Title order={3} ta="center">
          What would you like Oscar to investigate?
        </Title>

        <Textarea
          placeholder="Describe the issue or ask Oscar to investigate…"
          value={message}
          onChange={(e) => setMessage(e.currentTarget.value)}
          onKeyDown={handleKeyDown}
          autosize
          minRows={3}
          maxRows={8}
          disabled={isPending}
        />
        <Button
          onClick={handleStart}
          disabled={!message.trim() || isPending}
          loading={isPending}
          fullWidth
        >
          Start
        </Button>
        <PastSessions />
      </Stack>
    </Center>
  );
}

export function PastSessions() {
  const oscarApi = useOscarChatApi();
  const [windowMinutes, setWindowMinutes] = useState(
    CHAT_INTERVAL_OPTIONS[0].minutes,
  );
  const interval = useMemo(
    () => pastNMinutes(windowMinutes),
    [windowMinutes],
  );
  const chats = useQuery({
    queryKey: ['oscar', 'past-messages', interval.from, interval.to],
    queryFn: () =>
      oscarApi.listMessages({
        from: interval.from,
        to: interval.to,
        limit: DEFAULT_N_MESSAGES,
      }),
  });
  const pastMessages = chats.data?.data?.chats ?? [];

  if (chats.isLoading) {
    return (
      <Stack gap="xs">
        <PastSessionsIntervalSelector
          value={windowMinutes}
          onChange={setWindowMinutes}
        />
        <Group gap="xs" justify="center">
          <Loader size="xs" />
          <Text size="sm" c="dimmed">
            Loading past chats...
          </Text>
        </Group>
      </Stack>
    );
  }

  if (chats.data?.error) {
    return (
      <Stack gap="xs">
        <PastSessionsIntervalSelector
          value={windowMinutes}
          onChange={setWindowMinutes}
        />
        <Alert color="red" variant="light" title="Could not load past chats">
          {chats.data.error}
        </Alert>
      </Stack>
    );
  }

  if (pastMessages.length === 0) {
    return (
      <Stack gap="xs">
        <PastSessionsIntervalSelector
          value={windowMinutes}
          onChange={setWindowMinutes}
        />
        <Text size="sm" c="dimmed" ta="center">
          No past chats in the selected interval.
        </Text>
      </Stack>
    );
  }

  return (
    <Stack gap="xs">
      <PastSessionsIntervalSelector
        value={windowMinutes}
        onChange={setWindowMinutes}
      />
      {pastMessages.map((response) => (
        <PastMessage
          key={response.sessionId ?? `${response.title}-${response.createdAt}`}
          response={response}
        />
      ))}
    </Stack>
  );
}

function PastSessionsIntervalSelector({
  value,
  onChange,
}: {
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <Group justify="space-between" align="center" wrap="wrap">
      <Text size="sm" fw={600}>
        Recent chats
      </Text>
      <Button.Group>
        {CHAT_INTERVAL_OPTIONS.map((option) => (
          <Button
            key={option.minutes}
            size="xs"
            variant={value === option.minutes ? 'filled' : 'default'}
            onClick={() => onChange(option.minutes)}
          >
            {option.label}
          </Button>
        ))}
      </Button.Group>
    </Group>
  );
}

export function PastMessage({ response }: { response: ChatSummaryResponse }) {
  const totalMessages =
    (response.messagesByUser ?? 0) + (response.messagesByAgent ?? 0);
  const createdAt = response.createdAt
    ? new Date(response.createdAt).toLocaleString()
    : undefined;

  return (
    <Card withBorder radius="md" padding="sm">
      <Stack gap="xs">
        <Group justify="space-between" align="flex-start" wrap="nowrap">
          <Stack gap={2}>
            <Text size="sm" fw={600} lineClamp={1}>
              {response.title || 'Untitled chat'}
            </Text>
            {createdAt ? (
              <Text size="xs" c="dimmed">
                {createdAt}
              </Text>
            ) : null}
          </Stack>
          <Badge variant="light" color="violet">
            {totalMessages} messages
          </Badge>
        </Group>
        <Group gap="xs" justify="space-between">
          <Text size="xs" c="dimmed">
            {response.messagesByUser ?? 0} user /{' '}
            {response.messagesByAgent ?? 0} Oscar
          </Text>
          {response.sessionId ? (
            <Button
              component={Link}
              to={`/main/chat/${response.sessionId}`}
              size="xs"
              variant="light"
            >
              Open
            </Button>
          ) : null}
        </Group>
      </Stack>
    </Card>
  );
}
