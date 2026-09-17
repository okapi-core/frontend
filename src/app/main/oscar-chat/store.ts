import {
  ChatMessageResponse,
  GetMetricsResponse,
  SpanQueryV2Response,
} from '@/lib/response-types';
import { create } from 'zustand';

export type SideBarData =
  | { type: 'spans'; query: SpanQueryV2Response }
  | { type: 'metrics'; query: GetMetricsResponse };

type OscarChatStore = {
  sessionId: string;
  chatMessages: ChatMessageResponse[];
  userMessages: { timestamp: number; msg: string }[];
  isPolling: boolean;
  historyLoaded: boolean;
  errorMessage?: string;
  lastMessage?: string;
  sidebarData?: SideBarData;
  showSideBar: boolean;
  setSessionId: (id: string) => void;
  resetSession: (id: string) => void;
  appendMessages: (messages: ChatMessageResponse[]) => void;
  appendUserMessage: (msg: string) => void;
  appendUserMessages: (msgs: { timestamp: number; msg: string }[]) => void;
  resetUserHistory: (msgs: { timestamp: number; msg: string }[]) => void;
  setIsPolling: (flag: boolean) => void;
  setHistoryLoaded: (flag: boolean) => void;
  setErrorMessage: (msg: string | undefined) => void;
  setLastMessage: (msg: string) => void;
  setSidebarData: (data: SideBarData) => void;
  setShowSideBar: (flag: boolean) => void;
};

export const useOscarChatStore = create<OscarChatStore>((set, get) => ({
  sessionId: '',
  chatMessages: [],
  userMessages: [],
  isPolling: false,
  historyLoaded: false,
  showSideBar: false,
  setSessionId(id) {
    set({ sessionId: id });
  },
  resetSession(id) {
    set({
      sessionId: id,
      chatMessages: [],
      userMessages: [],
      isPolling: false,
      historyLoaded: false,
      errorMessage: undefined,
      lastMessage: undefined,
      sidebarData: undefined,
      showSideBar: false,
    });
  },
  appendMessages(messages) {
    const existing = get().chatMessages;
    const existingIds = new Set(existing.map((m) => m.id));
    const newOnes = messages.filter((m) => !existingIds.has(m.id));
    if (newOnes.length > 0) {
      set({ chatMessages: [...existing, ...newOnes] });
    }
  },
  appendUserMessage(msg) {
    set({
      userMessages: [...get().userMessages, { timestamp: Date.now(), msg }],
    });
  },
  appendUserMessages(msgs) {
    set({ userMessages: [...get().userMessages, ...msgs] });
  },
  resetUserHistory(msgs) {
    set({ userMessages: msgs });
  },
  setIsPolling(flag) {
    set({ isPolling: flag });
  },
  setHistoryLoaded(flag) {
    set({ historyLoaded: flag });
  },
  setErrorMessage(msg) {
    set({ errorMessage: msg });
  },
  setLastMessage(msg) {
    set({ lastMessage: msg });
  },
  setSidebarData(data) {
    set({ sidebarData: data });
  },
  setShowSideBar(flag) {
    set({ showSideBar: flag });
  },
}));
