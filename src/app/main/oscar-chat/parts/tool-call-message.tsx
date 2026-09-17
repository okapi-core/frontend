import { Badge, Box, Button, Card, Code, Group, Text } from '@mantine/core';
import { useMemo, useState } from 'react';

type ToolCallProps = {
  toolName?: string;
  summary?: string;
  payloadJson?: string;
  variant: 'request' | 'response';
};

function formatJson(payloadJson?: string): string | null {
  if (!payloadJson) return null;
  try {
    return JSON.stringify(JSON.parse(payloadJson), null, 2);
  } catch {
    return payloadJson;
  }
}

export function ToolCallMessage({
  toolName,
  summary,
  payloadJson,
  variant,
}: ToolCallProps) {
  const isRequest = variant === 'request';
  const [opened, setOpened] = useState(!summary);
  const formatted = useMemo(() => formatJson(payloadJson), [payloadJson]);
  const badgeColor = isRequest ? 'gray' : 'teal';
  const backgroundColor = isRequest
    ? 'var(--mantine-color-gray-1)'
    : 'var(--mantine-color-teal-1)';

  return (
    <Card
      withBorder
      radius="md"
      p="sm"
      style={{ maxWidth: '75%', backgroundColor }}
    >
      <Group justify="space-between" align="center" mb="xs">
        <Group gap="xs">
          <Badge color={badgeColor} variant="light" size="sm">
            {isRequest ? 'Tool input' : 'Tool output'}
          </Badge>
          <Text size="xs" fw={600}>
            {toolName || 'Tool'}
          </Text>
        </Group>
        {summary && (
          <Button
            size="xs"
            variant="subtle"
            color={badgeColor}
            onClick={() => setOpened((v) => !v)}
          >
            {opened ? 'Hide payload' : 'Show payload'}
          </Button>
        )}
      </Group>
      {summary && (
        <Text size="xs" c="dimmed" mb={opened ? 'xs' : 0}>
          {summary}
        </Text>
      )}
      {opened && formatted && (
        <Box>
          <Code block style={{ whiteSpace: 'pre-wrap', fontSize: '0.8rem' }}>
            {formatted}
          </Code>
        </Box>
      )}
      {opened && !formatted && (
        <Text size="xs" c="dimmed">
          No payload available.
        </Text>
      )}
    </Card>
  );
}
