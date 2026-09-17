import { TimeRange } from '@/components/custom-component-tray/time-range-picker';
import { useAppServices } from '@/lib/app-services';
import { useLogsApi } from '@/lib/domain/logs';
import { ChLogFilter } from '@/lib/request-types';
import { ChLogsQueryResponse } from '@/lib/response-types';
import { create } from 'zustand';

const DEFAULT_RANGE_MS = 60 * 60 * 1000;

function getDefaultTimeRange(): TimeRange {
  const now = Date.now();
  return { startMs: now - DEFAULT_RANGE_MS, endMs: now };
}

type Setter<T> = (val: T) => void;

export type LogsHomeStoreState = {
  timeRange: TimeRange;
  searchStatus: 'none' | 'pending' | 'completed';
  logsSearchResult?: ChLogsQueryResponse;
  setAttribute: <K extends keyof LogsHomeStoreState>(
    key: K,
    attrib: LogsHomeStoreState[K],
  ) => void;
};

export const useLogsHomeStore = create<LogsHomeStoreState>((set) => ({
  timeRange: getDefaultTimeRange(),
  searchStatus: 'none',
  setAttribute(key, attrib) {
    set({ [key]: attrib });
  },
}));

export function useSetTimeRange() {
  const setAttrib = useLogsHomeStore((state) => state.setAttribute);
  function setTimeRange(r: TimeRange) {
    return setAttrib('timeRange', r);
  }
  return setTimeRange;
}

export function useStoreProp<K extends keyof LogsHomeStoreState>(p: K) {
  return useLogsHomeStore((state) => state[p]);
}

export function useFetchLogs() {
  const api = useLogsApi();
  const { notify } = useAppServices();
  const setAttribute = useLogsHomeStore((state) => state.setAttribute);
  async function processQuery({ filters }: { filters: ChLogFilter[] }) {
    setAttribute('searchStatus', 'pending');
    const logs = await api.queryLogs({
      filters,
    });
    setAttribute('searchStatus', 'completed');
    if (logs.error) {
      notify.error(logs.error);
    } else if (logs.data) {
      setAttribute('logsSearchResult', logs.data);
    } else {
      notify.error;
    }
  }
  return { processQuery };
}
