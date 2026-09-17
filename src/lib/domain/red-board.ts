import { getReds, getServices } from '@/lib/api';
import { toNanos } from '@/lib/date-conversions';
import { ListServicesRequest, RES_TYPE, ServiceRedRequest } from '@/lib/request-types';
import { TimeIntervalMs } from '@/lib/timestamp-types';
import { useQuery } from '@tanstack/react-query';

export function useServiceListApi(interval: TimeIntervalMs) {
  return useQuery({
    queryKey: ['svc-list', interval.startMs, interval.endMs],
    queryFn: () => {
      const request: ListServicesRequest = {
        timestampFilter: {
          tsStartNanos: toNanos({ millis: interval.startMs }),
          tsEndNanos: toNanos({ millis: interval.endMs }),
        },
      };
      return getServices({ request });
    },
  });
}

export function fetchRedMetrics({
  interval,
  res,
  svc,
}: {
  interval: TimeIntervalMs;
  res: RES_TYPE;
  svc: string;
}) {
  const request: ServiceRedRequest = {
    timestampFilter: {
      tsStartNanos: toNanos({ millis: interval.startMs }),
      tsEndNanos: toNanos({ millis: interval.endMs }),
    },
    service: svc,
    resType: res,
  };
  return getReds({ request });
}
