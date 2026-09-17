import { ActionIcon, Box, CopyButton, Paper, Text, Tooltip } from '@mantine/core';
import { Check, Copy } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export function MarkdownMessage({
  content,
  role,
  timestamp,
}: {
  content: string;
  role: 'USER' | 'ASSISTANT';
  timestamp?: number;
}) {
  const isUser = role === 'USER';
  const formattedTime = timestamp
    ? new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : undefined;

  return (
    <Box style={{ display: 'flex', justifyContent: isUser ? 'flex-end' : 'flex-start' }}>
      <Box style={{ maxWidth: '75%' }}>
        <Paper
          p="sm"
          radius="md"
          withBorder={!isUser}
          style={{
            backgroundColor: isUser ? 'var(--mantine-color-blue-6)' : undefined,
            position: 'relative',
          }}
        >
          {!isUser && (
            <CopyButton value={content} timeout={2000}>
              {({ copied, copy }) => (
                <Tooltip label={copied ? 'Copied' : 'Copy'} withArrow position="top">
                  <ActionIcon
                    size="xs"
                    variant="subtle"
                    color={copied ? 'teal' : 'gray'}
                    onClick={copy}
                    aria-label={copied ? 'Copied message' : 'Copy message'}
                    data-testid="copy-message"
                    style={{ position: 'absolute', top: 6, right: 6 }}
                  >
                    {copied ? <Check size={12} /> : <Copy size={12} />}
                  </ActionIcon>
                </Tooltip>
              )}
            </CopyButton>
          )}
          {isUser ? (
            <Text size="sm" style={{ whiteSpace: 'pre-wrap', color: 'white' }}>
              {content}
            </Text>
          ) : (
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
          )}
        </Paper>
        {formattedTime && (
          <Text
            size="xs"
            c="dimmed"
            ta={isUser ? 'right' : 'left'}
            mt={2}
            data-testid="message-timestamp"
          >
            {formattedTime}
          </Text>
        )}
      </Box>
    </Box>
  );
}
