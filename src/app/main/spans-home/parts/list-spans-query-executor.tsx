import { useSpansApi } from '@/lib/domain/spans';
import { Badge, Button, Group } from '@mantine/core';
import { useCallback, useEffect, useRef } from 'react';
import { buildSpanQueryV2Request, parseSpanFiltersUrlParam } from '../lib';
import { useSpansHomeStore } from '../store';
import { useSpanUrlState } from '../use-span-url-state';

export function ListSpansQueryExecutor() {
  const spansApi = useSpansApi();
  const { rawSpanFilters, draftFilters, isQueryStale, commitDraftFilters } =
    useSpanUrlState();
  const queryStatus = useSpansHomeStore((state) => state.spanSearchQueryStatus);
  const setListItems = useSpansHomeStore((state) => state.setListItems);
  const setListError = useSpansHomeStore((state) => state.setListError);
  const setSpanSearchQueryStatus = useSpansHomeStore(
    (state) => state.setSpanQueryStatus,
  );
  const lastAutoRunFilters = useRef<string | null>(null);
  const skipAutoRunFilters = useRef<string | null>(null);

  const runQuery = useCallback(
    async (filters: typeof draftFilters) => {
      setSpanSearchQueryStatus('pending');
      setListError(undefined);
      setListItems([]);

      const request = buildSpanQueryV2Request(filters);

      const response = await spansApi.querySpans(request);
      if (response.data) {
        setListItems(response.data.items || []);
        setSpanSearchQueryStatus('done');
      } else {
        setListItems([]);
        setListError(response.error);
        setSpanSearchQueryStatus('failed');
      }
    },
    [setListError, setListItems, setSpanSearchQueryStatus, spansApi],
  );

  useEffect(() => {
    if (!rawSpanFilters) return;
    if (lastAutoRunFilters.current === rawSpanFilters) return;
    if (skipAutoRunFilters.current === rawSpanFilters) {
      skipAutoRunFilters.current = null;
      lastAutoRunFilters.current = rawSpanFilters;
      return;
    }

    const parsed = parseSpanFiltersUrlParam(
      rawSpanFilters,
      draftFilters.timeRange,
    );
    if (!parsed.ok) {
      setListError(parsed.error);
      setSpanSearchQueryStatus('failed');
      return;
    }

    lastAutoRunFilters.current = rawSpanFilters;
    void runQuery(parsed.filters);
  }, [
    draftFilters.timeRange,
    rawSpanFilters,
    runQuery,
    setListError,
    setSpanSearchQueryStatus,
  ]);

  const fetchAndSetResults = async () => {
    setSpanSearchQueryStatus('pending');
    setListError(undefined);

    const { filters, serialized } = commitDraftFilters();
    skipAutoRunFilters.current = serialized;

    await runQuery(filters);
  };

  return (
    <Group gap="sm" align="center">
      <Button
        w={'fit-content'}
        size="sm"
        onClick={fetchAndSetResults}
        loading={queryStatus === 'pending'}
        color={isQueryStale ? 'yellow' : undefined}
      >
        Run query
      </Button>
      {isQueryStale ? (
        <Badge color="yellow" variant="light" size="sm">
          Filters changed
        </Badge>
      ) : null}
    </Group>
  );
}
