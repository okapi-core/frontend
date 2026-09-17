import { TimeRange } from '@/components/custom-component-tray/time-range-picker';
import {
  DistributionSummaryConfig,
  NumericalAggConfig,
} from '@/lib/request-types';
import { SpanRowV2, SpansQueryStatsResponse } from '@/lib/response-types';
import { PendingAction } from '@/lib/types/state-types';
import { create } from 'zustand';
import {
  AttributeFilterInput,
  SpanFilters,
  SpanStatsConfig,
  getDefaultSpanStatsConfig,
  getDefaultTimeRange,
} from './lib';

export type SpansHomeView = 'list' | 'stats' | 'waterfall';

const SPANS_HOME_VIEWS: SpansHomeView[] = ['list', 'stats', 'waterfall'];

export function parseSpansHomeView(
  value: string | null | undefined,
): SpansHomeView {
  return SPANS_HOME_VIEWS.includes(value as SpansHomeView)
    ? (value as SpansHomeView)
    : 'list';
}

export type SpansHomeStoreState = {
  view: SpansHomeView;
  timeRange: TimeRange;
  traceId?: string;
  spanId?: string;
  spanKind?: string;
  serviceName?: string;
  servicePeer?: string;
  dbSystem?: string;
  dbCollection?: string;
  dbNamespace?: string;
  dbOperation?: string;
  httpMethod?: string;
  httpStatusCode?: string;
  httpOrigin?: string;
  httpHost?: string;
  durationMinMs?: string;
  durationMaxMs?: string;
  stringAttributes: AttributeFilterInput[];
  numberAttributes: AttributeFilterInput[];
  listItems: SpanRowV2[];
  listError?: string;
  statsQueryError?: string;
  spanSearchQueryStatus: PendingAction;
  numericalAggConfig?: NumericalAggConfig;
  summaryConfig?: DistributionSummaryConfig;
  spanStats?: SpansQueryStatsResponse;
  statsQueryStatus?: PendingAction;
  statsNumericalAttribs?: string[];
  fullViewRows?: SpanRowV2;
  setView: (view: SpansHomeView) => void;
  setTimeRange: (range: TimeRange) => void;
  setTraceId: (value: string) => void;
  setSpanId: (value: string) => void;
  setSpanKind: (value: string) => void;
  setServiceName: (value: string) => void;
  setServicePeer: (value: string) => void;
  setDbSystem: (value: string) => void;
  setDbCollection: (value: string) => void;
  setDbNamespace: (value: string) => void;
  setDbOperation: (value: string) => void;
  setHttpMethod: (value: string) => void;
  setHttpStatusCode: (value: string) => void;
  setHttpOrigin: (value: string) => void;
  setHttpHost: (value: string) => void;
  setDurationMinMs: (value: string) => void;
  setDurationMaxMs: (value: string) => void;
  setStringAttributes: (rows: AttributeFilterInput[]) => void;
  setNumberAttributes: (rows: AttributeFilterInput[]) => void;
  setFilters: (filters: SpanFilters) => void;
  setStatsConfig: (config: SpanStatsConfig) => void;
  setListItems: (items: SpanRowV2[]) => void;
  setSummary: (resp: SpansQueryStatsResponse) => void;
  setListError: (error?: string) => void;
  setStatsError: (error?: string) => void;
  setSpanQueryStatus: (status: PendingAction) => void;
  setStatsQueryStatus: (status: PendingAction) => void;
  setStatsNumericalAttribs: (attr: string[]) => void;
  setNumericalAggConfig: (cfg?: NumericalAggConfig) => void;
  setDistributionSummaryConfig: (cfg?: DistributionSummaryConfig) => void;
  setFullViewRows: (row: SpanRowV2) => void;
  clearFullViewRow: () => void;
  setAttribute: <K extends keyof SpansHomeStoreState>(
    key: K,
    value: SpansHomeStoreState[K],
  ) => void;
};

export const useSpansHomeStore = create<SpansHomeStoreState>((set) => ({
  view: 'list',
  timeRange: getDefaultTimeRange(),
  numericalAggConfig: getDefaultSpanStatsConfig().numericalAgg,
  stringAttributes: [],
  numberAttributes: [],
  listItems: [],
  listError: undefined,
  spanSearchQueryStatus: 'initial',
  setView: (view) => set({ view }),
  setTimeRange: (timeRange) => set({ timeRange }),
  setTraceId: (traceId) => set({ traceId }),
  setSpanId: (spanId) => set({ spanId }),
  setSpanKind: (spanKind) => set({ spanKind }),
  setServiceName: (serviceName) => set({ serviceName }),
  setServicePeer: (servicePeer) => set({ servicePeer }),
  setDbSystem: (dbSystem) => set({ dbSystem }),
  setDbCollection: (dbCollection) => set({ dbCollection }),
  setDbNamespace: (dbNamespace) => set({ dbNamespace }),
  setDbOperation: (dbOperation) => set({ dbOperation }),
  setHttpMethod: (httpMethod) => set({ httpMethod }),
  setHttpStatusCode: (httpStatusCode) => set({ httpStatusCode }),
  setHttpOrigin: (httpOrigin) => set({ httpOrigin }),
  setHttpHost: (httpHost) => set({ httpHost }),
  setDurationMinMs: (durationMinMs) => set({ durationMinMs }),
  setDurationMaxMs: (durationMaxMs) => set({ durationMaxMs }),
  setStringAttributes: (stringAttributes) => set({ stringAttributes }),
  setNumberAttributes: (numberAttributes) => set({ numberAttributes }),
  setFilters: (filters) =>
    set({
      timeRange: filters.timeRange,
      traceId: filters.traceId,
      spanId: filters.spanId,
      spanKind: filters.spanKind,
      serviceName: filters.serviceName,
      servicePeer: filters.servicePeer,
      dbSystem: filters.dbSystem,
      dbCollection: filters.dbCollection,
      dbNamespace: filters.dbNamespace,
      dbOperation: filters.dbOperation,
      httpMethod: filters.httpMethod,
      httpStatusCode: filters.httpStatusCode,
      httpOrigin: filters.httpOrigin,
      httpHost: filters.httpHost,
      durationMinMs: filters.durationMinMs,
      durationMaxMs: filters.durationMaxMs,
      stringAttributes: filters.stringAttributes ?? [],
      numberAttributes: filters.numberAttributes ?? [],
    }),
  setStatsConfig: (config) =>
    set({
      numericalAggConfig: config.numericalAgg,
      summaryConfig: config.summaryConfig,
      statsNumericalAttribs: config.attributes ?? [],
    }),
  setListItems: (listItems) => set({ listItems }),
  setListError: (listError) => set({ listError }),
  setSpanQueryStatus: (status) => set({ spanSearchQueryStatus: status }),
  setNumericalAggConfig: (cfg?: NumericalAggConfig) =>
    set({ numericalAggConfig: cfg }),
  setDistributionSummaryConfig: (cfg?: DistributionSummaryConfig) =>
    set({ summaryConfig: cfg }),
  setSummary: (resp: SpansQueryStatsResponse) => set({ spanStats: resp }),
  setStatsQueryStatus: (status: PendingAction) =>
    set({ statsQueryStatus: status }),
  setStatsNumericalAttribs: (attr: string[]) =>
    set({ statsNumericalAttribs: attr }),
  setStatsError(error) {
    set({ statsQueryError: error });
  },
  setFullViewRows(row) {
    set({ fullViewRows: row });
  },
  clearFullViewRow() {
    set({ fullViewRows: undefined });
  },
  setAttribute(key, value) {
    set({ [key]: value });
  },
}));

export function selectSpanFilters(state: SpansHomeStoreState): SpanFilters {
  return {
    timeRange: state.timeRange,
    traceId: state.traceId,
    spanId: state.spanId,
    spanKind: state.spanKind,
    serviceName: state.serviceName,
    servicePeer: state.servicePeer,
    dbSystem: state.dbSystem,
    dbCollection: state.dbCollection,
    dbNamespace: state.dbNamespace,
    dbOperation: state.dbOperation,
    httpMethod: state.httpMethod,
    httpStatusCode: state.httpStatusCode,
    httpOrigin: state.httpOrigin,
    httpHost: state.httpHost,
    durationMinMs: state.durationMinMs,
    durationMaxMs: state.durationMaxMs,
    stringAttributes: state.stringAttributes,
    numberAttributes: state.numberAttributes,
  };
}

export function selectSpanStatsConfig(
  state: SpansHomeStoreState,
): SpanStatsConfig {
  return {
    numericalAgg: state.numericalAggConfig,
    summaryConfig: state.summaryConfig,
    attributes: state.statsNumericalAttribs,
  };
}

export function resetSpansHomeStore(
  overrides: Partial<SpansHomeStoreState> = {},
) {
  useSpansHomeStore.setState(
    {
      ...useSpansHomeStore.getInitialState(),
      ...overrides,
    },
    true,
  );
}
