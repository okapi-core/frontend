import {
  getLogsFieldValues,
  getLogsFields,
  getLogsSummary,
  searchLogs,
} from '@/lib/api';
import { ApiResponse, checkIfRequestFailed } from '@/lib/api-responses';
import { toNanos } from '@/lib/date-conversions';
import { translateError } from '@/lib/error-translator';
import {
  ChLogFilter,
  ChLogsFieldValuesRequest,
  ChLogsFieldsRequest,
  ChLogsQueryRequest,
  ChLogsSummaryRequest,
  UNION_TYPE,
} from '@/lib/request-types';
import {
  ChLogsFieldValuesResponse,
  ChLogsFieldsResponse,
} from '@/lib/response-types';
import { formatUnionValue } from '@/lib/union-values';
import { useQuery } from '@tanstack/react-query';
import { compact } from 'lodash';
import { useAppServices } from '../app-services';

export const logsKeys = {
  list: (req: ChLogsQueryRequest) => ['logs-query', req] as const,
  summary: (req: ChLogsSummaryRequest) => ['logs-summary', req] as const,
};

// STALE: legacy query hooks retained for the old LogsBrowser during migration.

export async function fetchLogs(request: ChLogsQueryRequest) {
  const res = await searchLogs({ request });
  if (checkIfRequestFailed(res)) {
    throw new Error(res.error || 'Could not query logs');
  }
  return res;
}

export async function fetchLogsSummary(request: ChLogsSummaryRequest) {
  const res = await getLogsSummary({ request });
  if (checkIfRequestFailed(res)) {
    throw new Error(res.error || 'Could not query logs summary');
  }
  return res;
}

export async function fetchLogsFieldSuggestions(
  request: ChLogsFieldsRequest,
): Promise<ApiResponse<ChLogsFieldsResponse>> {
  return getLogsFields({ request });
}

export async function fetchLogsFieldValueSuggestions(
  request: ChLogsFieldValuesRequest,
): Promise<ApiResponse<ChLogsFieldValuesResponse>> {
  return getLogsFieldValues({ request });
}

export function useLogsQuery(req: ChLogsQueryRequest) {
  return useQuery({
    queryKey: logsKeys.list(req),
    queryFn: () => fetchLogs(req),
    enabled: false,
  });
}

export function useLogsSummaryQuery(req: ChLogsSummaryRequest) {
  return useQuery({
    queryKey: logsKeys.summary(req),
    queryFn: () => fetchLogsSummary(req),
    enabled: false,
  });
}

export function useLogsApi() {
  const { notify } = useAppServices();

  const getFieldSuggestions = async (request: ChLogsFieldsRequest) => {
    const res = await fetchLogsFieldSuggestions(request);
    if (checkIfRequestFailed(res)) {
      notify.error(translateError(res).error || 'Could not load log fields');
      return [];
    }
    if (!res.data?.fields) return [];
    else return compact(res.data.fields.map((field) => field.name));
  };

  const getFieldValueSuggestions = async (
    request: ChLogsFieldValuesRequest,
  ) => {
    const res = await fetchLogsFieldValueSuggestions(request);
    if (checkIfRequestFailed(res)) {
      notify.error(
        translateError(res).error || 'Could not load log field values',
      );
      return [];
    }
    if (!res.data?.values) return [];
    return compact(res.data.values.map((item) => formatUnionValue(item.value)));
  };

  return {
    getFieldSuggestions,
    getFieldValueSuggestions,
    queryLogs: fetchLogs,
    querySummary: fetchLogsSummary,
  };
}

export function useLogsAutocomplete({
  timeRange,
}: {
  timeRange: { startMs: number; endMs: number };
}) {
  const logsApi = useLogsApi();

  const getAttributeSuggestions = (query: string) =>
    logsApi.getFieldSuggestions({
      tsStartNanos: toNanos({ millis: timeRange.startMs }),
      tsEndNanos: toNanos({ millis: timeRange.endMs }),
      queryPrefix: query,
      limit: 50,
    });

  const getValueSuggestions = ({
    key,
    query,
    type,
    filters,
  }: {
    key: string;
    query: string;
    type: UNION_TYPE;
    filters: ChLogFilter[];
  }) =>
    logsApi.getFieldValueSuggestions({
      tsStartNanos: toNanos({ millis: timeRange.startMs }),
      tsEndNanos: toNanos({ millis: timeRange.endMs }),
      key,
      type,
      valuePrefix: query,
      filters,
      limit: 50,
    });

  return { getAttributeSuggestions, getValueSuggestions };
}
