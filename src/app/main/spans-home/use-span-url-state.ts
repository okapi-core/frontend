import { useEffect, useRef } from 'react';
import { useAppServices } from '@/lib/app-services';
import { useLocation, useSearchParams } from 'react-router-dom';
import {
  SpanFilters,
  areSpanFiltersEqual,
  parseSpanFiltersUrlParam,
  parseSpanStatsConfigUrlParam,
  serializeSpanFilters,
  serializeSpanStatsConfig,
} from './lib';
import {
  SpansHomeView,
  parseSpansHomeView,
  selectSpanFilters,
  selectSpanStatsConfig,
  useSpansHomeStore,
} from './store';

export function useSyncSpanUrlStateToStore() {
  const [searchParams] = useSearchParams();
  const view = parseSpansHomeView(searchParams.get('view'));
  const rawSpanFilters = searchParams.get('span_filters');
  const rawStatsConfig = searchParams.get('stats_config');
  const initialFilters = useRef(selectSpanFilters(useSpansHomeStore.getState()));
  const initialStatsConfig = useRef(
    selectSpanStatsConfig(useSpansHomeStore.getState()),
  );
  const storedView = useSpansHomeStore((state) => state.view);
  const setView = useSpansHomeStore((state) => state.setView);
  const setFilters = useSpansHomeStore((state) => state.setFilters);
  const setStatsConfig = useSpansHomeStore((state) => state.setStatsConfig);
  const setListError = useSpansHomeStore((state) => state.setListError);
  const setStatsError = useSpansHomeStore((state) => state.setStatsError);

  useEffect(() => {
    if (storedView !== view) setView(view);
  }, [setView, storedView, view]);

  useEffect(() => {
    if (!rawSpanFilters) {
      setFilters(initialFilters.current);
      return;
    }

    const parsed = parseSpanFiltersUrlParam(rawSpanFilters);
    if (parsed.ok) {
      setFilters(parsed.filters);
      return;
    }

    setListError(parsed.error);
  }, [rawSpanFilters, setFilters, setListError]);

  useEffect(() => {
    if (!rawStatsConfig) {
      setStatsConfig(initialStatsConfig.current);
      return;
    }

    const parsed = parseSpanStatsConfigUrlParam(rawStatsConfig);
    if (parsed.ok) {
      setStatsConfig(parsed.config);
      return;
    }

    setStatsError(parsed.error);
  }, [rawStatsConfig, setStatsConfig, setStatsError]);
}

export function useSpanUrlState() {
  const location = useLocation();
  const { navigation } = useAppServices();
  const [searchParams] = useSearchParams();
  const storeState = useSpansHomeStore();
  const draftFilters = selectSpanFilters(storeState);
  const draftStatsConfig = selectSpanStatsConfig(storeState);
  const rawSpanFilters = searchParams.get('span_filters');
  const rawStatsConfig = searchParams.get('stats_config');
  const initialCommittedFilters = useRef(
    parseSpanFiltersUrlParam(rawSpanFilters, draftFilters.timeRange).filters,
  );
  const initialCommittedStatsConfig = useRef(
    parseSpanStatsConfigUrlParam(rawStatsConfig).config,
  );
  const committedFilters = rawSpanFilters
    ? parseSpanFiltersUrlParam(rawSpanFilters, draftFilters.timeRange).filters
    : initialCommittedFilters.current;
  const committedStatsConfig = rawStatsConfig
    ? parseSpanStatsConfigUrlParam(rawStatsConfig).config
    : initialCommittedStatsConfig.current;
  const view = parseSpansHomeView(searchParams.get('view'));
  const isQueryStale = !areSpanFiltersEqual(draftFilters, committedFilters);

  const navigateWithParams = (mutate: (params: URLSearchParams) => void) => {
    const nextSearchParams = new URLSearchParams(location.search);
    mutate(nextSearchParams);
    navigation.navigate({
      pathname: location.pathname,
      search: nextSearchParams.toString(),
    });
  };

  return {
    view,
    rawSpanFilters,
    rawStatsConfig,
    committedFilters,
    committedStatsConfig,
    draftFilters,
    draftStatsConfig,
    isQueryStale,
    setView(nextView: SpansHomeView) {
      navigateWithParams((params) => params.set('view', nextView));
    },
    commitDraftFilters(): { filters: SpanFilters; serialized: string } {
      const serialized = serializeSpanFilters(draftFilters);
      navigateWithParams((params) => params.set('span_filters', serialized));
      return { filters: draftFilters, serialized };
    },
    commitDraftStatsQuery(): {
      filters: SpanFilters;
      serializedFilters: string;
      statsConfig: typeof draftStatsConfig;
      serializedStatsConfig: string;
    } {
      const serializedFilters = serializeSpanFilters(draftFilters);
      const serializedStatsConfig = serializeSpanStatsConfig(draftStatsConfig);
      navigateWithParams((params) => {
        params.set('span_filters', serializedFilters);
        params.set('stats_config', serializedStatsConfig);
      });
      return {
        filters: draftFilters,
        serializedFilters,
        statsConfig: draftStatsConfig,
        serializedStatsConfig,
      };
    },
  };
}
