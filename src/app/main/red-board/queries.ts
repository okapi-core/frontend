import { fetchRedMetrics, useServiceListApi } from '@/lib/domain/red-board';
import { RES_TYPE } from '@/lib/request-types';
import { TimeIntervalMs } from '@/lib/timestamp-types';
import { useQuery } from '@tanstack/react-query';
import { useRedBoardStore } from './store';

export function useSvcList(interval: TimeIntervalMs) {
  return useServiceListApi(interval);
}

export function useRedMetrics({
  interval,
  res,
  svc,
}: {
  interval: TimeIntervalMs;
  res: RES_TYPE;
  svc?: string;
}) {
  const setQueryStatus = useRedBoardStore(
    (state) => state.setServiceRedQueryStatus,
  );
  const setResponse = useRedBoardStore((state) => state.setServiceRed);
  async function queryFn() {
    setQueryStatus('pending');
    if (svc !== undefined) {
      const response = await fetchRedMetrics({ interval, res, svc });
      if (response.data) {
        setResponse(response.data);
      }
      return response;
    }
    setQueryStatus('done');
  }
  return useQuery({
    queryKey: ['svc-red', interval.startMs, interval.endMs, res, svc],
    queryFn: queryFn,
  });
}
