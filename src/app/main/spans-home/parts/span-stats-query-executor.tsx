import { useSpansApi } from '@/lib/domain/spans';
import { Button } from '@mantine/core';
import { useCallback, useEffect, useRef } from 'react';
import { buildSpanStatsQueryRequest } from '../lib';
import { useSpansHomeStore } from '../store';
import { useSpanUrlState } from '../use-span-url-state';

export function SpansStatsQueryExecutor() {
  const spansApi = useSpansApi();
  const {
    rawSpanFilters,
    rawStatsConfig,
    committedFilters,
    committedStatsConfig,
    commitDraftStatsQuery,
  } = useSpanUrlState();
  const queryStatus = useSpansHomeStore((state) => state.statsQueryStatus);
  const setSummary = useSpansHomeStore((state) => state.setSummary);
  const setStatsError = useSpansHomeStore((state) => state.setStatsError);
  const setQueryStatus = useSpansHomeStore(
    (state) => state.setStatsQueryStatus,
  );
  const lastAutoRunKey = useRef<string | null>(null);
  const skipAutoRunKey = useRef<string | null>(null);

  const runQuery = useCallback(
    async ({
      filters,
      statsConfig,
    }: {
      filters: typeof committedFilters;
      statsConfig: typeof committedStatsConfig;
    }) => {
      setQueryStatus('pending');
      setStatsError(undefined);

      const request = buildSpanStatsQueryRequest(filters, {
        numericalAgg: statsConfig.numericalAgg,
        summaryConfig: statsConfig.summaryConfig,
        attributes: statsConfig.attributes,
      });

      const response = await spansApi.queryStats(request);
      if (response.data) {
        setSummary(response.data);
        setQueryStatus('done');
      } else {
        setStatsError(response.error);
        setQueryStatus('failed');
      }
    },
    [setQueryStatus, setStatsError, spansApi, setSummary],
  );

  useEffect(() => {
    if (!rawSpanFilters && !rawStatsConfig) return;

    const key = `${rawSpanFilters ?? ''}|${rawStatsConfig ?? ''}`;
    if (lastAutoRunKey.current === key) return;

    if (skipAutoRunKey.current === key) {
      skipAutoRunKey.current = null;
      lastAutoRunKey.current = key;
      return;
    }

    lastAutoRunKey.current = key;
    void runQuery({
      filters: committedFilters,
      statsConfig: committedStatsConfig,
    });
  }, [
    committedFilters,
    committedStatsConfig,
    rawSpanFilters,
    rawStatsConfig,
    runQuery,
  ]);

  const fetchAndSetResults = async () => {
    const {
      filters,
      serializedFilters,
      statsConfig,
      serializedStatsConfig,
    } = commitDraftStatsQuery();
    skipAutoRunKey.current = `${serializedFilters}|${serializedStatsConfig}`;

    await runQuery({ filters, statsConfig });
  };

  return (
    <Button
      w={'fit-content'}
      size="sm"
      onClick={fetchAndSetResults}
      loading={queryStatus === 'pending'}
    >
      Run query
    </Button>
  );
}
