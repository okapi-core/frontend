import { Button, Notification } from '@mantine/core';
import { useEffect } from 'react';
import { usePostMessage } from '../mutations';
import { useOscarChatStore } from '../store';

const AUTO_CLEAR_MS = 8000;

export function OscarError() {
  const errorMessage = useOscarChatStore((s) => s.errorMessage);
  const setErrorMessage = useOscarChatStore((s) => s.setErrorMessage);
  const lastMessage = useOscarChatStore((s) => s.lastMessage);
  const { sendMessage } = usePostMessage();

  useEffect(() => {
    if (!errorMessage) return;
    const id = setTimeout(() => setErrorMessage(undefined), AUTO_CLEAR_MS);
    return () => clearTimeout(id);
  }, [errorMessage, setErrorMessage]);

  if (!errorMessage) return null;

  function handleRetry() {
    setErrorMessage(undefined);
    if (lastMessage) sendMessage(lastMessage);
  }

  return (
    <Notification
      color="red"
      title="Oscar encountered an error"
      onClose={() => setErrorMessage(undefined)}
      withCloseButton
      withBorder
      mb="sm"
    >
      {errorMessage}
      <Button
        size="xs"
        variant="subtle"
        color="red"
        mt="xs"
        onClick={handleRetry}
        disabled={!lastMessage}
      >
        Retry
      </Button>
    </Notification>
  );
}
