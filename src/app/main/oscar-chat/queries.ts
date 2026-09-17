import {
  loadChatHistory,
  loadChatSessionMeta,
  loadChatUpdates,
} from '@/lib/domain/chat';
import { useOscarChatStore } from './store';

export async function loadInitialHistory({
  sessionId,
  startPolling,
}: {
  sessionId: string;
  startPolling: () => void;
}): Promise<void> {
  const store = useOscarChatStore.getState();

  const historyResult = await loadChatHistory(sessionId);
  if (historyResult.data) {
    const messages = historyResult.data.responses ?? [];
    const userMsgs = messages
      .filter((m) => m.role === 'USER')
      .map((m) => ({ timestamp: m.timestamp, msg: m.contents }));
    const serverMsgs = messages.filter((m) => m.role !== 'USER');
    store.resetUserHistory(userMsgs);
    if (serverMsgs.length > 0) store.appendMessages(serverMsgs);
  }

  const metaResult = await loadChatSessionMeta(sessionId);
  if (metaResult.data?.state === 'OPEN') {
    startPolling();
  }

  store.setHistoryLoaded(true);
}

export async function fetchUpdates({
  sessionId,
}: {
  sessionId: string;
}): Promise<void> {
  const store = useOscarChatStore.getState();
  const result = await loadChatUpdates(sessionId);

  if (!result.data) {
    store.setIsPolling(false);
    store.setErrorMessage(result.error ?? 'Failed to fetch updates.');
    return;
  }

  const messages = (result.data.messages ?? []).filter((m) => m.role !== 'USER');
  if (messages.length > 0) {
    store.appendMessages(messages);
  }

  if (result.data.streamState === 'FIN') {
    store.setIsPolling(false);
  }
}
