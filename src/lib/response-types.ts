import { GetMetricsRequest } from './request-types';

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
export interface AnyValueJson {
  aString?: string;
  anInteger?: number;
  aBoolean?: boolean;
  aDouble?: number;
  bytes?: number[];
}

export interface ApplyDashboardYamlResponse {
  ok?: boolean;
  dashboardId?: string;
  versionId?: string;
  status?: string;
}

export interface AttributeDistributionSummary {
  attribute?: string;
  values?: ValueCount[];
}

export interface AttributeNumericSeries {
  attribute?: string;
  points?: NumericPoint[];
}

export interface BulkApplyDashboardYamlResponse {
  ok?: boolean;
  status?: string;
  imported?: ApplyDashboardYamlResponse[];
  errors?: BulkDashboardYamlLintIssue[];
  warnings?: BulkDashboardYamlLintIssue[];
}

export interface BulkDashboardYamlLintIssue {
  file?: string;
  code?: string;
  message?: string;
  path?: string;
}

export type CHAT_RESPONSE_TYPE =
  | 'MARKDOWN_TEXT'
  | 'PLOT_CMD'
  | 'GET_TRACES_CMD'
  | 'THOUGHT'
  | 'PLAN'
  | 'RESPONSE'
  | 'GET_TRACE_FOLLOW_UP'
  | 'PLOT_METRIC_FOLLOW_UP'
  | 'TOOL_CALL_REQUEST'
  | 'TOOL_CALL_RESPONSE';
export type CHAT_ROLE = 'USER' | 'ASSISTANT';
export interface ChLogFieldSuggestion {
  name?: string;
  type?: UNION_TYPE;
  count?: number;
  exampleValues?: UnionValue[];
}

export interface ChLogFieldValueSuggestion {
  value?: UnionValue;
  count?: number;
}

export interface ChLogRow {
  tsNanos?: number;
  logStream?: string;
  serviceName?: string;
  logLevel?: number;
  severityText?: string;
  traceId?: string;
  spanId?: string;
  body?: string;
  resourceAttributes?: Record<string, UnionValue>;
  attributes?: Record<string, UnionValue>;
}

export interface ChLogsFacetCount {
  value?: string;
  count?: number;
}

export interface ChLogsFieldValuesResponse {
  values?: ChLogFieldValueSuggestion[];
}

export interface ChLogsFieldsResponse {
  fields?: ChLogFieldSuggestion[];
}

export interface ChLogsQueryResponse {
  items?: ChLogRow[];
}

export interface ChLogsServiceSeveritySummary {
  serviceName?: string;
  total?: number;
  trace?: number;
  debug?: number;
  info?: number;
  warn?: number;
  error?: number;
  fatal?: number;
  errorRatio?: number;
}

export interface ChLogsSeverityCount {
  logLevel?: number;
  severity?: string;
  count?: number;
}

export interface ChLogsSeverityTimelinePoint {
  bucketStartMs?: number;
  logLevel?: number;
  severity?: string;
  count?: number;
}

export interface ChLogsSummaryResponse {
  count?: number;
  bucketMillis?: number;
  volume?: ChLogsTimelinePoint[];
  severityTimeline?: ChLogsSeverityTimelinePoint[];
  severityDistribution?: ChLogsSeverityCount[];
  topServices?: ChLogsFacetCount[];
  topStreams?: ChLogsFacetCount[];
  serviceSeverity?: ChLogsServiceSeveritySummary[];
}

export interface ChLogsTimelinePoint {
  bucketStartMs?: number;
  count?: number;
}

export interface ChatHistoryResponse {
  responses: ChatMessageResponse[];
}

export interface ChatMessageResponse {
  id: number;
  timestamp: number;
  contents: string;
  eventStreamId: number;
  responseType?: CHAT_RESPONSE_TYPE;
  role: CHAT_ROLE;
}

export interface ChatMessageUpdatesResponse {
  messages?: ChatMessageResponse[];
  streamState?: STREAM_STATE;
}

export interface ChatResponse {
  streamId: string;
  sessionId: string;
}

export interface ChatSummaryResponse {
  sessionId?: string;
  title?: string;
  createdAt?: number;
  messagesByUser?: number;
  messagesByAgent?: number;
}

export type DASH_VAR_TYPE = 'METRIC' | 'TAG_VALUE';
export interface DashboardViewWDto {
  id?: string;
  title?: string;
  author?: string;
  lastEditedAt?: string;
  viewedAt?: string;
  isFavorite?: boolean;
  tags?: string[];
}

export interface DiscoveryResponse {
  registered?: NodeMetadataResponse[];
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

export interface FlameGraphNode {
  spanId: string;
  parentSpanId: string;
  serviceName: string;
  kind?: string;
  startNs: number;
  endNs: number;
  durationNs: number;
  offsetNs: number;
  children?: FlameGraphNode[];
}

export type GRAMMAR = 'PROMQL' | 'OKAPI_JSON';
export interface GaugeSeries {
  unit?: string;
  tags?: Record<string, string>;
  times?: number[];
  values?: number[];
}

export interface GetDashboardPanelResponse {
  panelId: string;
  title?: string;
  description?: string;
  grammar?: GRAMMAR;
  queries?: QueryConfig[];
}

export interface GetDashboardResponse {
  dashboardId: string;
  title?: string;
  description?: string;
  tags?: string[];
  rows?: GetDashboardRowResponse[];
  rowOrder?: string[];
  created?: string;
  viewed?: string;
  activeVersion?: string;
  createdBy?: PersonalName;
  lastEditedBy?: PersonalName;
  isFavorite?: boolean;
}

export interface GetDashboardRowResponse {
  rowId: string;
  title?: string;
  description?: string;
  panels?: GetDashboardPanelResponse[];
  panelOrder?: string[];
}

export interface GetDashboardVersionResponse {
  dashboardId?: string;
  versionId?: string;
  status?: string;
  createdAt?: number;
  createdBy?: string;
  note?: string;
  specHash?: string;
}

export interface GetExemplarsBatchResponse {
  responses?: GetExemplarsResponse[];
}

export interface GetExemplarsResponse {
  metric?: string;
  labels?: Record<string, string>;
  timeFilter?: TimestampFilter;
  exemplars?: Exemplar[];
}

export interface GetFederatedSourceResponse {
  sourceName: string;
  sourceType: string;
  createdAt?: string;
  registrationToken: string;
}

export interface GetGaugeResponse {
  resolution?: RES_TYPE;
  aggregation?: AGG_TYPE;
  series?: GaugeSeries[];
}

export interface GetHistogramResponse {
  series?: HistogramSeries[];
}

export interface GetMetricsBatchResponse {
  responses?: GetMetricsResponse[];
}

export interface GetMetricsHintsResponse {
  metricHints?: string[];
  tagHints?: string[];
  tagValueHints?: TagValueCompletion;
}

export interface GetMetricsResponse {
  metric?: string;
  tags?: Record<string, string>;
  gaugeResponse?: GetGaugeResponse;
  histogramResponse?: GetHistogramResponse;
  sumsResponse?: GetSumsResponse;
  promqlResponse?: PromQlResultData;
}

export interface GetOrgResponse {
  orgId: string;
  orgName: string;
  members: OrgMemberWDto[];
}

export interface GetOrgSummaryResponse {
  orgId: string;
  orgName: string;
  totalMembers: number;
}

export interface GetOrgUserView {
  orgId: string;
  orgName: string;
  roles: ORG_ROLE[];
}

export interface GetPromQlResponse {
  status?: string;
  errorType?: string;
  error?: string;
}

export interface GetRecentDashboardResponse {
  recents?: DashboardViewWDto[];
}

export interface GetSessionResponse {
  timestamp?: number;
  title?: string;
  state?: STREAM_STATE;
}

export interface GetSumsResponse {
  sums?: Sum[];
}

export interface GetTraceFollowUpPayload {
  traceId?: string;
  from?: number;
  to?: number;
}

export interface GetUserMetadataResponse {
  firstName?: string;
  lastName?: string;
  orgs?: GetOrgUserView[];
  email?: string;
}

export interface GetUserProfileResponse {
  id: string;
  firstName?: string;
  lastName?: string;
  email: string;
  orgSummary: GetOrgSummaryResponse;
}

export interface GetVarResponse {
  type?: DASH_VAR_TYPE;
  name?: string;
  tag?: string;
}

export interface Histogram {
  start?: number;
  end?: number;
  count?: number;
  sum?: number;
  counts?: number[];
  buckets?: number[];
}

export interface HistogramSeries {
  tags?: Record<string, string>;
  unit?: string;
  histogram?: Histogram;
}

export interface IngesterOverviewResponse {
  window?: string;
  startMillis?: number;
  endMillis?: number;
  metricsEvents?: number;
  traceEvents?: number;
  logEvents?: number;
}

export interface KeyValueJson {
  key?: string;
  value?: AnyValueJson;
}

export interface LintDashboardYamlResponse {
  ok?: boolean;
  errors?: YamlLintIssue[];
  warnings?: YamlLintIssue[];
  resolved?: ResolvedYamlIds;
}

export interface ListChatsResponse {
  chats?: ChatSummaryResponse[];
  nextBefore?: number;
}

export interface ListDashboardVersionsResponse {
  versions?: GetDashboardVersionResponse[];
}

export interface ListMetricsResponse {
  results?: MetricsPathSpecifier[];
}

export interface ListOrgsResponse {
  orgs: GetOrgUserView[];
}

export interface ListSessionsResponse {
  sessions?: GetSessionResponse[];
}

export interface ListVarsResponse {
  vars: GetVarResponse[];
}

export interface LogView {
  tsMillis?: number;
  level?: number;
  body?: string;
  traceId?: string;
  docId?: string;
  service?: string;
}

export interface LogsFacetCount {
  value?: string;
  count?: number;
}

export interface LogsServiceSeveritySummary {
  serviceName?: string;
  total?: number;
  trace?: number;
  debug?: number;
  info?: number;
  warn?: number;
  error?: number;
  fatal?: number;
  errorRatio?: number;
}

export interface LogsSeverityCount {
  logLevel?: number;
  severity?: string;
  count?: number;
}

export interface LogsSeverityTimelinePoint {
  bucketStartMs?: number;
  logLevel?: number;
  severity?: string;
  count?: number;
}

export interface LogsSummaryResponse {
  count?: number;
  bucketMillis?: number;
  volume?: LogsTimelinePoint[];
  severityTimeline?: LogsSeverityTimelinePoint[];
  severityDistribution?: LogsSeverityCount[];
  topServices?: LogsFacetCount[];
  topStreams?: LogsFacetCount[];
  serviceSeverity?: LogsServiceSeveritySummary[];
}

export interface LogsTimelinePoint {
  bucketStartMs?: number;
  count?: number;
}

export type METRIC_TYPE = 'GAUGE' | 'HISTO' | 'SUM';
export interface MatrixSeries {
  metric?: Record<string, string>;
  values?: Sample[];
}

export interface MetricEventFilter {
  metricType: METRIC_TYPE;
}

export interface MetricPath {
  metric?: string;
  metricType?: METRIC_TYPE;
  temporality?: string;
  labels?: Record<string, string>;
}

export type MetricType = 'COUNTER' | 'GAUGE' | 'HISTO';
export interface MetricsPathSpecifier {
  name?: string;
  tags?: Record<string, string>;
  type?: MetricType;
}

export interface NodeMetadataResponse {
  ip?: string;
  id?: string;
  leader?: boolean;
}

export interface NumberValue {
  anInteger?: number;
  aDouble?: number;
}

export interface NumericAttributeSummary {
  avg?: number;
  p25?: number;
  p50?: number;
  p75?: number;
  p90?: number;
}

export interface NumericPoint {
  bucketStartMs?: number;
  value?: number;
}

export type ORG_ROLE = 'ADMIN' | 'MEMBER';
export interface OkapiLogQlResponse {
  kind?: OkapiLogQlResultKind;
  rows?: Record<string, any>[];
}

export type OkapiLogQlResultKind = 'LOG_ROWS' | 'TABLE' | 'COUNT_BY';
export interface OkapiTraceQlResponse {
  kind?: OkapiTraceQlResultKind;
  rows?: Record<string, UnionValue>[];
}

export type OkapiTraceQlResultKind = 'SPAN_ROWS' | 'TABLE' | 'COUNT_BY';
export interface OrgMemberWDto {
  userId: string;
  firstName?: string;
  lastName?: string;
  email: string;
  isAdmin?: boolean;
}

export interface PersonalName {
  userId: string;
  firstName?: string;
  lastName?: string;
}

export interface PlotMetricFollowUpPayload {
  request?: GetMetricsRequest;
}

export interface PostPlanPayload {
  plan?: string;
}

export interface PostResponsePayload {
  response?: string;
}

export interface PostThoughtPayload {
  thought?: string;
}

export interface PostToolCallRequestPayload {
  toolName?: string;
  requestJson?: string;
  summary?: string;
}

export interface PostToolCallResponsePayload {
  toolName?: string;
  summary?: string;
}

export interface PromQlMatrixData {
  result?: MatrixSeries[];
}

export interface PromQlMatrixResponse {
  data?: PromQlMatrixData;
}

export interface PromQlMetadataItem {
  type?: string;
  help?: string;
  unit?: string;
}

export interface PromQlMetadataResponse {
  data?: Record<string, PromQlMetadataItem[]>;
}

export interface PromQlResultData {
  resultType?: PromQlResultType;
}

export type PromQlResultType = 'VECTOR' | 'MATRIX' | 'SCALAR' | 'STRING';
export interface PromQlScalarData {
  result?: Sample;
}

export interface PromQlScalarResponse {
  data?: PromQlScalarData;
}

export interface PromQlStringData {
  result?: Sample;
}

export interface PromQlStringListResponse {
  data?: string[];
}

export interface PromQlStringResponse {
  data?: PromQlStringData;
}

export interface PromQlVectorData {
  result?: VectorSeries[];
}

export interface PromQlVectorResponse {
  data?: PromQlVectorData;
}

export interface PublishDashboardVersionResponse {
  dashboardId?: string;
  versionId?: string;
  status?: string;
}

export interface QueryConfig {
  query: string;
}

export interface QueryResponse {
  items?: LogView[];
}

export type RES_TYPE = 'SECONDLY' | 'MINUTELY' | 'HOURLY';
export interface RedMetrics {
  ts: number[];
  counts: number[];
  rps: number[];
  rpm: number[];
  errorRates: number[];
  durationsP50: number[];
  durationsP75: number[];
  durationsP90: number[];
  durationsP99: number[];
  errors: number[];
  totalRequests: number;
  totalErrors: number;
  availability?: number;
}

export interface ResolvedPanelId {
  id?: string;
}

export interface ResolvedRowId {
  id?: string;
  panels?: ResolvedPanelId[];
}

export interface ResolvedYamlIds {
  dashboardId?: string;
  rows?: ResolvedRowId[];
}

export type SESSION_STATE = 'OPEN' | 'CLOSED';
export type STREAM_STATE = 'OPEN' | 'CLOSED' | 'FIN';
export interface Sample {
  timestamp?: number;
  value?: string;
}

export interface SearchMetricsResponse {
  results?: MetricsPathSpecifier[];
  serverErrorCount?: number;
  clientErrors?: string[];
}

export interface SearchMetricsV2Response {
  matchingPaths?: MetricPath[];
}

export interface ServiceEdgeRed {
  peerService: string;
  redMetrics?: RedMetrics;
}

export interface ServiceListResponse {
  services?: string[];
}

export interface ServiceOpRed {
  op?: string;
  redMetrics?: RedMetrics;
}

export interface ServiceRedResponse {
  service?: string;
  serviceRed?: RedMetrics;
  peerReds?: ServiceEdgeRed[];
  serviceOpReds?: ServiceOpRed[];
  totalDetectedOps?: number;
}

export interface SessionMetaResponse {
  sessionId?: string;
  ongoingStreamId?: number;
  lastRecordedPing?: number;
  state?: SESSION_STATE;
}

export interface SpanAttributeHint {
  name: string;
  type: string;
}

export interface SpanAttributeHintsResponse {
  defaultAttributes: SpanAttributeHint[];
  customAttributes: SpanAttributeHint[];
}

export interface SpanAttributeValueHintsResponse {
  attributeName?: string;
  numericSummary?: NumericAttributeSummary;
  values?: string[];
}

export interface SpanDto {
  svc?: string;
  traceId?: number[];
  spanId?: number[];
  parentSpanId?: number[];
  name?: string;
  kind?: string;
  statusCode?: string;
  startTimeMillis?: number;
  endTimeMillis?: number;
  attributes?: Record<string, string>;
}

export interface SpanQueryResponse {
  items?: SpanDto[];
}

export interface SpanQueryV2Response {
  items?: SpanRowV2[];
}

export interface SpanQueryV2SummaryResponse {
  count?: number;
}

export interface SpanRowV2 {
  tsStartNs?: number;
  tsEndNs?: number;
  traceId?: string;
  spanId?: string;
  spanStatus?: SpanStatus;
  parentSpanId?: string;
  kind?: string;
  kindString?: string;
  serviceName?: string;
  servicePeerName?: string;
  httpMethod?: string;
  httpStatusCode?: number;
  httpRequestSize?: number;
  httpResponseSize?: number;
  httpOrigin?: string;
  httpHost?: string;
  serverAddress?: number;
  serverPort?: number;
  clientAddress?: string;
  clientPort?: number;
  sourceAddress?: string;
  sourcePort?: number;
  networkProtocolType?: string;
  networkProtocolVersion?: string;
  dbSystemName?: string;
  dbCollectionName?: string;
  dbNamespace?: string;
  dbOperationName?: string;
  dbResponseStatusCode?: number;
  dbQueryText?: string;
  dbQuerySummary?: string;
  dbStoredProcedureName?: string;
  dbResponseReturnedRows?: number;
  rpcMethod?: string;
  rpcMethodOriginal?: string;
  rpcResponseStatusCode?: number;
  customStringAttributes?: Record<string, string>;
  customNumberAttributes?: Record<string, number>;
}

export type SpanStatus = 'OK' | 'ERROR' | 'UNK';
export interface SpansFlameGraphResponse {
  traceId?: string;
  traceStartNs?: number;
  traceEndNs?: number;
  roots?: FlameGraphNode[];
}

export interface SpansQueryStatsResponse {
  count?: number;
  numericSeries?: AttributeNumericSeries[];
  distributionSummaries?: AttributeDistributionSummary[];
}

export interface StartScaleUpResponse {
  opId?: string;
  state?: string;
  nodeIds?: string[];
}

export interface SubmitMetricsResponse {
  message?: string;
}

export interface Sum {
  ts?: number;
  te?: number;
  unit?: string;
  count?: number;
}

export interface TagValueCompletion {
  tag?: string;
  candidates?: string[];
  metricEventFilter?: MetricEventFilter;
}

export interface TimestampFilter {
  tsStartNanos?: number;
  tsEndNanos?: number;
}

export interface TokenResponse {
  token: string;
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

export interface ValueCount {
  value?: string;
  count?: number;
}

export interface VarHintsResponse {
  suggestions?: string[];
}

export interface VectorSeries {
  metric?: Record<string, string>;
  value?: Sample;
}

export interface YamlLintIssue {
  code?: string;
  message?: string;
  path?: string;
}
