import {
  createSession,
  getHistory,
  getSessionMeta,
  getUpdates,
  listChats,
  postMessage,
} from '@/lib/api';
import { useAppServices } from '@/lib/app-services';
import { useUserData } from '@/lib/context';
import { translateError } from '@/lib/error-translator';
import { ListChatsBlindRequest, PostMessageRequest } from '@/lib/request-types';
import { useMutation } from '@tanstack/react-query';

export function loadChatHistory(sessionId: string) {
  return getHistory({ sessionId, request: { from: 0 } });
}

export function loadChatSessionMeta(sessionId: string) {
  return getSessionMeta({ sessionId });
}

export function loadChatUpdates(sessionId: string) {
  return getUpdates({ sessionId });
}

export function sendChatMessage({
  sessionId,
  request,
}: {
  sessionId: string;
  request: PostMessageRequest;
}) {
  return postMessage({ sessionId, request });
}

export function listPastMessages(request: ListChatsBlindRequest) {
  return listChats({ request });
}

export function useOscarHomeApi() {
  const { navigation, notify } = useAppServices();
  const mutation = useMutation({
    mutationFn: async (initialMessage: string) => {
      const sessionResult = await createSession({
        request: { initialMsg: initialMessage },
      });
      const translated = translateError(sessionResult);
      if (translated.error) {
        throw new Error(translated.error);
      }
      const sessionId = sessionResult.data?.sessionId;
      if (!sessionId) throw new Error('Failed to create session');
      return sessionId;
    },
    onSuccess: (sessionId) => {
      navigation.navigate(`/main/chat/${sessionId}`);
    },
    onError: (error) => {
      notify.error(
        error instanceof Error ? error.message : 'Failed to create session',
      );
    },
  });

  return { startSession: mutation.mutate, isPending: mutation.isPending };
}

export function useOscarChatApi() {
  const userProfile = useUserData((s) => s.userProfile);
  return {
    postMessage: (sessionId: string, message: string) =>
      sendChatMessage({
        sessionId,
        request: { message, userId: userProfile?.id ?? '' },
      }),
    listMessages: (r: ListChatsBlindRequest) => listPastMessages(r),
  };
}
