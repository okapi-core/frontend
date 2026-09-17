import { useOscarChatApi } from '@/lib/domain/chat';
import { pollUntil } from '@/lib/poll-until';
import { useMutation } from '@tanstack/react-query';
import { useEffect, useRef } from 'react';
import { fetchUpdates } from './queries';
import { useOscarChatStore } from './store';

export function usePostMessage() {
  const chatApi = useOscarChatApi();
  const setIsPolling = useOscarChatStore((s) => s.setIsPolling);
  const setErrorMessage = useOscarChatStore((s) => s.setErrorMessage);
  const setLastMessage = useOscarChatStore((s) => s.setLastMessage);
  const appendUserMessage = useOscarChatStore((s) => s.appendUserMessage);
  const isPolling = useOscarChatStore((s) => s.isPolling);
  const cleanupRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    return () => {
      cleanupRef.current?.();
    };
  }, []);

  function startPolling() {
    setIsPolling(true);
    cleanupRef.current?.();
    cleanupRef.current = pollUntil(() => {
      const { isPolling: polling, sessionId } = useOscarChatStore.getState();
      if (!polling) return false;
      fetchUpdates({ sessionId });
      return true;
    }, 1000);
  }

  const mutation = useMutation({
    mutationFn: (message: string) => {
      const sessionId = useOscarChatStore.getState().sessionId;
      setLastMessage(message);
      appendUserMessage(message);
      return chatApi.postMessage(sessionId, message);
    },
    onError: (err) => {
      setErrorMessage(err.message ?? 'Something went wrong.');
    },
    onSuccess: () => {
      startPolling();
    },
  });

  return {
    sendMessage: mutation.mutate,
    isPending: mutation.isPending || isPolling,
    startPolling,
  };
}
