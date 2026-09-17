export type AGG_TYPE =
  | 'AVG'
  | 'SUM'
  | 'MIN'
  | 'MAX'
  | 'COUNT'
  | 'P50'
  | 'P75'
  | 'P90'
  | 'P95'
  | 'P99';
export interface AnyMetricOrValueFilter {
  value?: string;
  pattern?: string;
}

export interface AnyValueJson {
  aString?: string;
  anInteger?: number;
  aBoolean?: boolean;
  aDouble?: number;
  bytes?: number[];
}

export interface ApplyDashboardYamlRequest {
  dashboardId?: string;
  yaml?: string;
  note?: string;
}

export interface ChLogFilter {
  key?: string;
  op: ChLogFilterOp;
  value?: UnionValue;
}

export type ChLogFilterOp =
  | 'EQ'
  | 'NEQ'
  | 'CONTAINS'
  | 'REGEX'
  | 'PREFIX'
  | 'GT'
  | 'GTE'
  | 'LT'
  | 'LTE'
  | 'EXISTS'
  | 'NOT_EXISTS';
export interface ChLogsFieldValuesRequest {
  tsStartNanos?: number;
  tsEndNanos?: number;
  key?: string;
  type: UNION_TYPE;
  valuePrefix?: string;
  filters?: ChLogFilter[];
  limit?: number;
}

export interface ChLogsFieldsRequest {
  tsStartNanos?: number;
  tsEndNanos?: number;
  queryPrefix?: string;
  limit?: number;
}

export interface ChLogsQueryRequest {
  tsStartNanos?: number;
  tsEndNanos?: number;
  limit?: number;
  filters?: ChLogFilter[];
  includeAttributes?: boolean;
  includeResourceAttributes?: boolean;
  attributeKeys?: string[];
  resourceAttributeKeys?: string[];
}

export interface ChLogsSummaryRequest {
  tsStartNanos?: number;
  tsEndNanos?: number;
  filters?: ChLogFilter[];
  bucketMillis?: number;
  limit?: number;
}

export interface CreateDashboardPanelRequest {
  panelId?: string;
  title?: string;
  note?: string;
  queryConfig: QueryConfig[];
  grammar: GRAMMAR;
}

export interface CreateDashboardRequest {
  title: string;
  description: string;
  tags?: string[];
}

export interface CreateDashboardRowRequest {
  rowId?: string;
  title?: string;
  description?: string;
}

export interface CreateDashboardVarRequest {
  dashVarType?: DASH_VAR_TYPE;
  name?: string;
  tag?: string;
}

export interface CreateFederatedSourceRequest {
  sourceName: string;
  sourceType: string;
}

export interface CreateOrgMemberRequest {
  email: string;
  admin?: boolean;
}

export interface CreateOrgRequest {
  orgName: string;
}

export interface CreateSessionBlindRequest {
  initialMsg: string;
}

export interface CreateSessionRequest {
  ownerId: string;
  initialMsg: string;
}

export interface CreateUserRequest {
  firstName?: string;
  lastName?: string;
  email: string;
  password: string;
}

export type DASH_VAR_TYPE = 'METRIC' | 'TAG_VALUE';
export interface DbFilters {
  system?: string;
  collection?: string;
  namespace?: string;
  operation?: string;
}

export interface DistributionSummaryConfig {
  approximateCount?: boolean;
}

export interface DurationFilter {
  durMinMillis: number;
  durMaxMillis: number;
}

export interface Exemplar {
  metric?: string;
  tags?: Record<string, string>;
  tsNanos?: number;
  kv?: KeyValueJson[];
  measurement?: NumberValue;
  spanId?: string;
  traceId?: string;
}

export interface ExponentialHisto {
  histoPoints?: ExponentialHistoPoint[];
}

export interface ExponentialHistoPoint {
  start?: number;
  end?: number;
  temporality?: TEMPORALITY;
  scale?: number;
  zeroThreshold?: number;
  zeroCount?: number;
  positiveOffset?: number;
  positiveCounts?: number[];
  negativeOffset?: number;
  negativeCounts?: number[];
  sum?: number;
  count?: number;
}

export interface ExportMetricsRequest {
  metricName: string;
  tags: Record<string, string>;
  type: MetricType;
  description?: string;
  unit?: string;
  gauge?: Gauge;
  histo?: Histo;
  exponentialHisto?: ExponentialHisto;
  sum?: Sum;
}

export interface FilterNode {
  kind?: string;
  regex?: string;
  traceId?: string;
  levelCode?: number;
  left?: FilterNode;
  right?: FilterNode;
}

export interface ForwardedMetricsRequest {
  shardId?: number;
  metricsRequests?: ExportMetricsRequest[];
}

export type GRAMMAR = 'PROMQL' | 'OKAPI_JSON';
export interface Gauge {
  ts?: number[];
  value?: any[];
  exemplars?: Exemplar[];
}

export interface GaugeQueryConfig {
  resolution?: RES_TYPE;
  aggregation?: AGG_TYPE;
}

export interface GetExemplarsRequest {
  metric?: string;
  labels?: Record<string, string>;
  timeFilter?: TimestampFilter;
}

export interface GetHistoryRequest {
  from: number;
  to?: number;
}

export interface GetMetricsBatchRequest {}

export interface GetMetricsRequest {
  metric: string;
  tags?: Record<string, string>;
  start: number;
  end: number;
  metricType: METRIC_TYPE;
  gaugeQueryConfig?: GaugeQueryConfig;
  histoQueryConfig?: HistoQueryConfig;
  sumsQueryConfig?: GetSumsQueryConfig;
}

export interface GetSumsQueryConfig {
  temporality?: TEMPORALITY;
}

export interface GetTagHintsRequest {
  metricName?: string;
  otherTags?: Record<string, string>;
  tagPrefix?: string;
  interval?: TimeInterval;
  metricEventFilter?: MetricEventFilter;
}

export interface GetTagValueHintsRequest {
  metricName?: string;
  otherTags?: Record<string, string>;
  tag?: string;
  interval?: TimeInterval;
  metricEventFilter?: MetricEventFilter;
}

export interface GetVarHintsRequest {
  varType?: DASH_VAR_TYPE;
  tag?: string;
  constraint: TimeConstraint;
}

export interface Histo {
  histoPoints?: HistoPoint[];
  exemplars?: Exemplar[];
}

export interface HistoPoint {
  start?: number;
  end?: number;
  temporality?: TEMPORALITY;
  buckets?: number[];
  sum?: number;
  count?: number;
  bucketCounts?: number[];
}

export interface HistoQueryConfig {
  temporality?: TEMPORALITY;
}

export interface HttpFilters {
  httpMethod?: string;
  statusCode?: number;
  origin?: string;
  host?: string;
}

export interface IngesterOverviewRequest {
  window?: string;
}

export interface KeyValueJson {
  key?: string;
  value?: AnyValueJson;
}

export interface LabelValueFilter {
  label?: string;
  value?: string;
}

export interface LabelValuePatternFilter {
  label?: string;
  pattern?: string;
}

export interface LintDashboardYamlRequest {
  dashboardId?: string;
  yaml?: string;
}

export interface ListChatsBlindRequest {
  from?: number;
  to?: number;
  before?: number;
  limit?: number;
}

export interface ListChatsRequest {
  userId: string;
  from?: number;
  to?: number;
  before?: number;
  limit?: number;
}

export interface ListMetricsRequest {
  tenantId?: string;
  app?: string;
  start?: number;
  end?: number;
}

export interface ListServicesRequest {
  timestampFilter: TimestampFilter;
}

export interface ListSessionsBlindRequest {
  from?: number;
  to?: number;
}

export interface ListSessionsRequest {
  userId?: string;
  from?: number;
  to?: number;
}

export interface LogsSummaryRequest {
  tsStartNanos?: number;
  tsEndNanos?: number;
  filters?: ChLogFilter[];
  bucketMillis?: number;
  limit?: number;
}

export type METRIC_TYPE = 'GAUGE' | 'HISTO' | 'SUM';
export interface MetricEventFilter {
  metricType: METRIC_TYPE;
}

export type MetricType = 'COUNTER' | 'GAUGE' | 'HISTO';
export interface MetricsQueryRequest {
  grammar?: string;
  query?: string;
  startMs?: number;
  endMs?: number;
  metricType?: string;
  resolution?: string;
}

export interface MultiQueryRequest {
  timeConstraint?: TimeConstraint;
  varsContext?: VarsContext;
  grammar?: GRAMMAR;
  queries?: QueryConfig[];
}

export interface NumberAttributeFilter {
  key?: string;
  value?: number;
}

export interface NumberValue {
  anInteger?: number;
  aDouble?: number;
}

export interface NumericalAggConfig {
  aggregation?: AGG_TYPE;
  resType?: RES_TYPE;
}

export type ORG_ROLE = 'ADMIN' | 'MEMBER';
export interface OkapiLogQlRequest {
  tsStartNanos?: number;
  tsEndNanos?: number;
  logQl?: string;
}

export interface OkapiTraceQlRequest {
  tsStartNanos?: number;
  tsEndNanos?: number;
  traceQl?: string;
}

export interface PostMessageRequest {
  message: string;
  userId: string;
}

export interface PublishDashboardVersionRequest {
  versionId: string;
}

export interface QueryConfig {
  query: string;
}

export interface QueryRequest {
  start?: number;
  end?: number;
  limit?: number;
  filter?: FilterNode;
}

export type RES_TYPE = 'SECONDLY' | 'MINUTELY' | 'HOURLY';
export type SUM_TEMPORALITY = 'DELTA' | 'CUMULATIVE';
export interface SearchMetricsRequest {
  tsStartMillis?: number;
  tsEndMillis?: number;
  metricNamePattern?: string;
  metricName?: string;
  valueFilters?: LabelValueFilter[];
  patternFilters?: LabelValuePatternFilter[];
  anyMetricOrValueFilter?: AnyMetricOrValueFilter;
}

export interface ServiceFilter {
  service?: string;
  peer?: string;
}

export interface ServiceRedRequest {
  timestampFilter?: TimestampFilter;
  service: string;
  resType: RES_TYPE;
}

export interface SignInRequest {
  email: string;
  password: string;
}

export interface SpanAttributeHintsRequest {
  timestampFilter?: TimestampMillisFilter;
}

export interface SpanAttributeValueHintsRequest {
  timestampFilter?: TimestampMillisFilter;
  attributeName?: string;
}

export interface SpanFilterRest {
  kind: string;
  traceId?: number[];
  spanId?: number[];
  left?: SpanFilterRest;
  right?: SpanFilterRest;
}

export interface SpanQueryRequest {
  start?: number;
  end?: number;
  limit?: number;
  pageToken?: string;
  filter?: SpanFilterRest;
}

export interface SpanQueryV2Request {
  traceId?: string;
  spanId?: string;
  kind?: string;
  dbFilters?: DbFilters;
  durationFilter?: DurationFilter;
  httpFilters?: HttpFilters;
  serviceFilter?: ServiceFilter;
  timestampFilter?: TimestampFilter;
  stringAttributesFilter?: StringAttributeFilter[];
  numberAttributesFilter?: NumberAttributeFilter[];
}

export interface SpansQueryStatsRequest {
  traceId?: string;
  kind?: string;
  dbFilters?: DbFilters;
  durationFilter?: DurationFilter;
  httpFilters?: HttpFilters;
  serviceFilter?: ServiceFilter;
  timestampFilter?: TimestampFilter;
  stringAttributesFilter?: StringAttributeFilter[];
  numberAttributesFilter?: NumberAttributeFilter[];
  numericalAgg?: NumericalAggConfig;
  summaryConfig?: DistributionSummaryConfig;
  attributes?: string[];
}

export interface StartScaleUpRequest {
  nodes?: string[];
}

export interface StringAttributeFilter {
  key?: string;
  value?: string;
}

export interface Sum {
  temporality?: SUM_TEMPORALITY;
  sumPoints?: SumPoint[];
}

export interface SumPoint {
  start?: number;
  end?: number;
  sum?: number;
}

export type TEMPORALITY = 'DELTA' | 'CUMULATIVE';
export interface TimeConstraint {
  start?: number;
  end?: number;
}

export interface TimeInterval {
  start?: number;
  end?: number;
}

export interface TimestampFilter {
  tsStartNanos?: number;
  tsEndNanos?: number;
}

export interface TimestampMillisFilter {
  tsMillisStart?: number;
  tsMillisEnd?: number;
}

export type UNION_TYPE = 'STRING' | 'BOOLEAN' | 'DOUBLE' | 'INTEGER' | 'LONG';
export interface UnionValue {
  type?: UNION_TYPE;
  stringValue?: string;
  doubleValue?: number;
  integerValue?: number;
  longValue?: number;
  booleanValue?: boolean;
}

export interface UpdateDashboardPanelRequest {
  title?: string;
  note?: string;
  grammar: GRAMMAR;
  queryConfig?: QueryConfig[];
}

export interface UpdateDashboardRequest {
  desc?: string;
  title?: string;
  tags?: string[];
  rowIds?: string[];
  isFavorite?: boolean;
}

export interface UpdateDashboardRowRequest {
  title?: string;
  description?: string;
  panelIds?: string[];
}

export interface UpdateOrgMemberRequest {
  email: string;
  roles: ORG_ROLE[];
}

export interface UpdateOrgRequest {
  orgName: string;
}

export interface UpdateReadLimitRequest {}

export interface UpdateUserRequest {
  firstName?: string;
  lastName?: string;
  password?: string;
  oldPassword?: string;
}

export interface UpdateWriteLimitRequest {}

export interface VarsContext {
  varValues?: Record<string, string>;
}
