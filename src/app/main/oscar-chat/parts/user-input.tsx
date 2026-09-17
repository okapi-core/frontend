import { ActionIcon, Group, Loader, Paper, Textarea } from '@mantine/core';
import { SendIcon } from 'lucide-react';
import { KeyboardEvent, useState } from 'react';
import { usePostMessage } from '../mutations';
import { useOscarChatStore } from '../store';

export function UserInput() {
  const [text, setText] = useState('');
  const { sendMessage, isPending } = usePostMessage();
  const historyLoaded = useOscarChatStore((s) => s.historyLoaded);

  function submit() {
    const trimmed = text.trim();
    if (!trimmed || isPending) return;
    sendMessage(trimmed);
    setText('');
  }

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  }

  return (
    <Paper p="sm" withBorder radius="md">
      <Group gap="sm" align="flex-end">
        <Textarea
          style={{ flex: 1 }}
          placeholder="Ask Oscar anything about your traces or metrics…"
          value={text}
          onChange={(e) => setText(e.currentTarget.value)}
          onKeyDown={handleKeyDown}
          disabled={isPending || !historyLoaded}
          autosize
          minRows={1}
          maxRows={6}
        />
        <ActionIcon
          size="lg"
          variant="filled"
          aria-label="Send message"
          disabled={!text.trim() || isPending || !historyLoaded}
          onClick={submit}
          mb={2}
        >
          {isPending ? <Loader size="xs" color="white" /> : <SendIcon size={16} />}
        </ActionIcon>
      </Group>
    </Paper>
  );
}
