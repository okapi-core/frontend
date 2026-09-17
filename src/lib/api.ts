import { getWithoutToken, postWithoutToken } from './api-common';
import { ApiResponse } from './api-responses';

import {
  ApplyDashboardYamlRequest,
  ChLogsFieldValuesRequest,
  ChLogsFieldsRequest,
  ChLogsQueryRequest,
  ChLogsSummaryRequest,
  CreateDashboardPanelRequest,
  CreateDashboardRequest,
  CreateDashboardRowRequest,
  CreateDashboardVarRequest,
  CreateSessionBlindRequest,
  CreateUserRequest,
  GetExemplarsRequest,
  GetHistoryRequest,
  GetMetricsRequest,
  GetTagHintsRequest,
  GetTagValueHintsRequest,
  GetVarHintsRequest,
  LintDashboardYamlRequest,
  ListChatsBlindRequest,
  ListServicesRequest,
  ListSessionsBlindRequest,
  MultiQueryRequest,
  OkapiLogQlRequest,
  OkapiTraceQlRequest,
  PostMessageRequest,
  PublishDashboardVersionRequest,
  ServiceRedRequest,
  SignInRequest,
  SpanAttributeHintsRequest,
  SpanAttributeValueHintsRequest,
  SpanQueryV2Request,
  SpansQueryStatsRequest,
  UpdateDashboardPanelRequest,
  UpdateDashboardRequest,
  UpdateDashboardRowRequest,
  UpdateUserRequest,
} from './request-types';
import {
  ApplyDashboardYamlResponse,
  BulkApplyDashboardYamlResponse,
  ChLogsFieldValuesResponse,
  ChLogsFieldsResponse,
  ChLogsQueryResponse,
  ChLogsSummaryResponse,
  ChatHistoryResponse,
  ChatMessageUpdatesResponse,
  ChatResponse,
  GetDashboardPanelResponse,
  GetDashboardResponse,
  GetDashboardRowResponse,
  GetExemplarsBatchResponse,
  GetExemplarsResponse,
  GetMetricsBatchResponse,
  GetMetricsHintsResponse,
  GetMetricsResponse,
  GetOrgResponse,
  GetUserProfileResponse,
  GetVarResponse,
  LintDashboardYamlResponse,
  ListChatsResponse,
  ListDashboardVersionsResponse,
  ListSessionsResponse,
  ListVarsResponse,
  OkapiLogQlResponse,
  OkapiTraceQlResponse,
  PublishDashboardVersionResponse,
  ServiceListResponse,
  ServiceRedResponse,
  SessionMetaResponse,
  SpanAttributeHintsResponse,
  SpanAttributeValueHintsResponse,
  SpanQueryV2Response,
  SpansFlameGraphResponse,
  SpansQueryStatsResponse,
  VarHintsResponse,
} from './response-types';

export async function queryFlameGraph({
  request,
}: {
  request: SpanQueryV2Request;
}): Promise<ApiResponse<SpansFlameGraphResponse>> {
  return await postWithoutToken<SpanQueryV2Request, SpansFlameGraphResponse>({
    url: `/api/v1/spans/flamegraph`,
    request: request,
  });
}

export async function getAttributeHints({
  request,
}: {
  request: SpanAttributeHintsRequest;
}): Promise<ApiResponse<SpanAttributeHintsResponse>> {
  return await postWithoutToken<
    SpanAttributeHintsRequest,
    SpanAttributeHintsResponse
  >({ url: `/api/v1/spans/attributes/hints`, request: request });
}

export async function getAttributeValueHints({
  request,
}: {
  request: SpanAttributeValueHintsRequest;
}): Promise<ApiResponse<SpanAttributeValueHintsResponse>> {
  return await postWithoutToken<
    SpanAttributeValueHintsRequest,
    SpanAttributeValueHintsResponse
  >({ url: `/api/v1/spans/attributes/values/hints`, request: request });
}

export async function querySpans({
  request,
}: {
  request: SpanQueryV2Request;
}): Promise<ApiResponse<SpanQueryV2Response>> {
  return await postWithoutToken<SpanQueryV2Request, SpanQueryV2Response>({
    url: `/api/v1/spans/query`,
    request: request,
  });
}

export async function queryTraceQl({
  request,
}: {
  request: OkapiTraceQlRequest;
}): Promise<ApiResponse<OkapiTraceQlResponse>> {
  return await postWithoutToken<OkapiTraceQlRequest, OkapiTraceQlResponse>({
    url: `/api/v1/spans/query/traceql`,
    request: request,
  });
}

export async function getSpansStats({
  request,
}: {
  request: SpansQueryStatsRequest;
}): Promise<ApiResponse<SpansQueryStatsResponse>> {
  return await postWithoutToken<
    SpansQueryStatsRequest,
    SpansQueryStatsResponse
  >({ url: `/api/v1/spans/stats`, request: request });
}

export async function getReds({
  request,
}: {
  request: ServiceRedRequest;
}): Promise<ApiResponse<ServiceRedResponse>> {
  return await postWithoutToken<ServiceRedRequest, ServiceRedResponse>({
    url: `/api/v1/reds`,
    request: request,
  });
}

export async function getServices({
  request,
}: {
  request: ListServicesRequest;
}): Promise<ApiResponse<ServiceListResponse>> {
  return await postWithoutToken<ListServicesRequest, ServiceListResponse>({
    url: `/api/v1/services`,
    request: request,
  });
}

export async function healthCheck({}: {}): Promise<ApiResponse<string>> {
  return await getWithoutToken<string>({ url: `/internal/healthcheck` });
}

export async function getDashboardActiveVersion({
  orgId,
  dashboardId,
}: {
  orgId: string;
  dashboardId: string;
}): Promise<ApiResponse<GetDashboardResponse>> {
  return await getWithoutToken<GetDashboardResponse>({
    url: `/api/v1/orgs/${orgId}/dashboards/${dashboardId}/versions/active`,
  });
}

export async function createDashboard({
  orgId,
  req,
}: {
  orgId: string;
  req: CreateDashboardRequest;
}): Promise<ApiResponse<GetDashboardResponse>> {
  return await postWithoutToken<CreateDashboardRequest, GetDashboardResponse>({
    url: `/api/v1/orgs/${orgId}/dashboards`,
    request: req,
  });
}

export async function publishDashboard({
  orgId,
  dashboardId,
  request,
}: {
  orgId: string;
  dashboardId: string;
  request: PublishDashboardVersionRequest;
}): Promise<ApiResponse<PublishDashboardVersionResponse>> {
  return await postWithoutToken<
    PublishDashboardVersionRequest,
    PublishDashboardVersionResponse
  >({
    url: `/api/v1/orgs/${orgId}/dashboards/${dashboardId}/publish`,
    request: request,
  });
}

export async function getDashboardVersion({
  orgId,
  dashboardId,
  versionId,
}: {
  orgId: string;
  dashboardId: string;
  versionId: string;
}): Promise<ApiResponse<GetDashboardResponse>> {
  return await getWithoutToken<GetDashboardResponse>({
    url: `/api/v1/orgs/${orgId}/dashboards/${dashboardId}/versions/${versionId}`,
  });
}

export async function deleteDashboard({
  orgId,
  dashboardId,
}: {
  orgId: string;
  dashboardId: string;
}): Promise<ApiResponse<void>> {
  return await postWithoutToken<any, void>({
    url: `/api/v1/orgs/${orgId}/dashboards/${dashboardId}/delete`,
    request: undefined,
  });
}

export async function updateDashboard({
  orgId,
  dashboardId,
  req,
}: {
  orgId: string;
  dashboardId: string;
  req: UpdateDashboardRequest;
}): Promise<ApiResponse<GetDashboardResponse>> {
  return await postWithoutToken<UpdateDashboardRequest, GetDashboardResponse>({
    url: `/api/v1/orgs/${orgId}/dashboards/${dashboardId}/update`,
    request: req,
  });
}

export async function listDashboards({
  orgId,
}: {
  orgId: string;
}): Promise<ApiResponse<GetDashboardResponse[]>> {
  return await getWithoutToken<GetDashboardResponse[]>({
    url: `/api/v1/orgs/${orgId}/dashboards`,
  });
}

export async function listVersions({
  orgId,
  dashboardId,
}: {
  orgId: string;
  dashboardId: string;
}): Promise<ApiResponse<ListDashboardVersionsResponse>> {
  return await getWithoutToken<ListDashboardVersionsResponse>({
    url: `/api/v1/orgs/${orgId}/dashboards/${dashboardId}/versions`,
  });
}

export async function getRow({
  orgId,
  dashboardId,
  versionId,
  rowId,
}: {
  orgId: string;
  dashboardId: string;
  versionId: string;
  rowId: string;
}): Promise<ApiResponse<GetDashboardRowResponse>> {
  return await getWithoutToken<GetDashboardRowResponse>({
    url: `/api/v1/orgs/${orgId}/dashboards/${dashboardId}/versions/${versionId}/rows/${rowId}`,
  });
}

export async function createRow({
  orgId,
  dashboardId,
  versionId,
  req,
}: {
  orgId: string;
  dashboardId: string;
  versionId: string;
  req: CreateDashboardRowRequest;
}): Promise<ApiResponse<GetDashboardRowResponse>> {
  return await postWithoutToken<
    CreateDashboardRowRequest,
    GetDashboardRowResponse
  >({
    url: `/api/v1/orgs/${orgId}/dashboards/${dashboardId}/versions/${versionId}/rows`,
    request: req,
  });
}

export async function deleteRow({
  orgId,
  dashboardId,
  versionId,
  rowId,
}: {
  orgId: string;
  dashboardId: string;
  versionId: string;
  rowId: string;
}): Promise<ApiResponse<void>> {
  return await postWithoutToken<any, void>({
    url: `/api/v1/orgs/${orgId}/dashboards/${dashboardId}/versions/${versionId}/rows/${rowId}/delete`,
    request: undefined,
  });
}

export async function updateRow({
  orgId,
  dashboardId,
  versionId,
  rowId,
  req,
}: {
  orgId: string;
  dashboardId: string;
  versionId: string;
  rowId: string;
  req: UpdateDashboardRowRequest;
}): Promise<ApiResponse<GetDashboardRowResponse>> {
  return await postWithoutToken<
    UpdateDashboardRowRequest,
    GetDashboardRowResponse
  >({
    url: `/api/v1/orgs/${orgId}/dashboards/${dashboardId}/versions/${versionId}/rows/${rowId}/update`,
    request: req,
  });
}

export async function lint({
  orgId,
  req,
}: {
  orgId: string;
  req: LintDashboardYamlRequest;
}): Promise<ApiResponse<LintDashboardYamlResponse>> {
  return await postWithoutToken<
    LintDashboardYamlRequest,
    LintDashboardYamlResponse
  >({ url: `/api/v1/orgs/${orgId}/dashboards/yaml/lint`, request: req });
}

export async function bulkApply({
  orgId,
}: {
  orgId: string;
}): Promise<ApiResponse<BulkApplyDashboardYamlResponse>> {
  return await postWithoutToken<any, BulkApplyDashboardYamlResponse>({
    url: `/api/v1/orgs/${orgId}/dashboards/yaml/bulk-apply`,
    request: undefined,
  });
}

export async function apply({
  orgId,
  req,
}: {
  orgId: string;
  req: ApplyDashboardYamlRequest;
}): Promise<ApiResponse<ApplyDashboardYamlResponse>> {
  return await postWithoutToken<
    ApplyDashboardYamlRequest,
    ApplyDashboardYamlResponse
  >({ url: `/api/v1/orgs/${orgId}/dashboards/yaml/apply`, request: req });
}

export async function getLogsFieldValues({
  request,
}: {
  request: ChLogsFieldValuesRequest;
}): Promise<ApiResponse<ChLogsFieldValuesResponse>> {
  return await postWithoutToken<
    ChLogsFieldValuesRequest,
    ChLogsFieldValuesResponse
  >({ url: `/api/v1/logs/field-values`, request: request });
}

export async function searchLogs({
  request,
}: {
  request: ChLogsQueryRequest;
}): Promise<ApiResponse<ChLogsQueryResponse>> {
  return await postWithoutToken<ChLogsQueryRequest, ChLogsQueryResponse>({
    url: `/api/v1/logs/query`,
    request: request,
  });
}

export async function getLogsFields({
  request,
}: {
  request: ChLogsFieldsRequest;
}): Promise<ApiResponse<ChLogsFieldsResponse>> {
  return await postWithoutToken<ChLogsFieldsRequest, ChLogsFieldsResponse>({
    url: `/api/v1/logs/fields`,
    request: request,
  });
}

export async function queryLogsQl({
  request,
}: {
  request: OkapiLogQlRequest;
}): Promise<ApiResponse<OkapiLogQlResponse>> {
  return await postWithoutToken<OkapiLogQlRequest, OkapiLogQlResponse>({
    url: `/api/v1/logs/query/logql`,
    request: request,
  });
}

export async function getLogsSummary({
  request,
}: {
  request: ChLogsSummaryRequest;
}): Promise<ApiResponse<ChLogsSummaryResponse>> {
  return await postWithoutToken<ChLogsSummaryRequest, ChLogsSummaryResponse>({
    url: `/api/v1/logs/summary`,
    request: request,
  });
}

export async function getMetricsBatchResponse({
  multiQueryRequest,
}: {
  multiQueryRequest: MultiQueryRequest;
}): Promise<ApiResponse<GetMetricsBatchResponse>> {
  return await postWithoutToken<MultiQueryRequest, GetMetricsBatchResponse>({
    url: `/api/v1/metrics/query/batch`,
    request: multiQueryRequest,
  });
}

export async function getTagValueHints({
  request,
}: {
  request: GetTagValueHintsRequest;
}): Promise<ApiResponse<GetMetricsHintsResponse>> {
  return await postWithoutToken<
    GetTagValueHintsRequest,
    GetMetricsHintsResponse
  >({ url: `/api/v1/metrics/tag-value/hints`, request: request });
}

export async function getMetricsResponse({
  request,
}: {
  request: GetMetricsRequest;
}): Promise<ApiResponse<GetMetricsResponse>> {
  return await postWithoutToken<GetMetricsRequest, GetMetricsResponse>({
    url: `/api/v1/metrics/query`,
    request: request,
  });
}

export async function getMetricExemplars({
  request,
}: {
  request: GetExemplarsRequest;
}): Promise<ApiResponse<GetExemplarsResponse>> {
  return await postWithoutToken<GetExemplarsRequest, GetExemplarsResponse>({
    url: `/api/v1/metrics/metrics/exemplars`,
    request: request,
  });
}

export async function queryMetricExemplars({
  multiQueryRequest,
}: {
  multiQueryRequest: MultiQueryRequest;
}): Promise<ApiResponse<GetExemplarsBatchResponse>> {
  return await postWithoutToken<MultiQueryRequest, GetExemplarsBatchResponse>({
    url: `/api/v1/metrics/exemplars/query`,
    request: multiQueryRequest,
  });
}

export async function getMetricHints({
  request,
}: {
  request: any;
}): Promise<ApiResponse<GetMetricsHintsResponse>> {
  return await postWithoutToken<any, GetMetricsHintsResponse>({
    url: `/api/v1/metrics/name/hints`,
    request: request,
  });
}

export async function getTagHints({
  request,
}: {
  request: GetTagHintsRequest;
}): Promise<ApiResponse<GetMetricsHintsResponse>> {
  return await postWithoutToken<GetTagHintsRequest, GetMetricsHintsResponse>({
    url: `/api/v1/metrics/tag/hints`,
    request: request,
  });
}

export async function createSession({
  request,
}: {
  request: CreateSessionBlindRequest;
}): Promise<ApiResponse<SessionMetaResponse>> {
  return await postWithoutToken<CreateSessionBlindRequest, SessionMetaResponse>(
    { url: `/api/v1/sessions`, request: request },
  );
}

export async function listSessions({
  request,
}: {
  request: ListSessionsBlindRequest;
}): Promise<ApiResponse<ListSessionsResponse>> {
  return await postWithoutToken<ListSessionsBlindRequest, ListSessionsResponse>(
    { url: `/api/v1/sessions/list`, request: request },
  );
}

export async function getSessionMeta({
  sessionId,
}: {
  sessionId: string;
}): Promise<ApiResponse<SessionMetaResponse>> {
  return await getWithoutToken<SessionMetaResponse>({
    url: `/api/v1/sessions/${sessionId}/meta`,
  });
}

export async function pingSession({
  sessionId,
}: {
  sessionId: string;
}): Promise<ApiResponse<SessionMetaResponse>> {
  return await postWithoutToken<any, SessionMetaResponse>({
    url: `/api/v1/sessions/${sessionId}/ping`,
    request: undefined,
  });
}

export async function postMessage({
  sessionId,
  request,
}: {
  sessionId: string;
  request: PostMessageRequest;
}): Promise<ApiResponse<ChatResponse>> {
  return await postWithoutToken<PostMessageRequest, ChatResponse>({
    url: `/api/v1/chat/${sessionId}`,
    request: request,
  });
}

export async function getHistory({
  sessionId,
  request,
}: {
  sessionId: string;
  request: GetHistoryRequest;
}): Promise<ApiResponse<ChatHistoryResponse>> {
  return await postWithoutToken<GetHistoryRequest, ChatHistoryResponse>({
    url: `/api/v1/chat/messages/${sessionId}`,
    request: request,
  });
}

export async function getUpdates({
  sessionId,
}: {
  sessionId: string;
}): Promise<ApiResponse<ChatMessageUpdatesResponse>> {
  return await getWithoutToken<ChatMessageUpdatesResponse>({
    url: `/api/v1/chat/${sessionId}/updates`,
  });
}

export async function listChats({
  request,
}: {
  request: ListChatsBlindRequest;
}): Promise<ApiResponse<ListChatsResponse>> {
  return await postWithoutToken<ListChatsBlindRequest, ListChatsResponse>({
    url: `/api/v1/chat/list`,
    request: request,
  });
}

export async function getOrg({
  orgId,
}: {
  orgId: string;
}): Promise<ApiResponse<GetOrgResponse>> {
  return await getWithoutToken<GetOrgResponse>({
    url: `/api/v1/orgs/${orgId}`,
  });
}

export async function createVar({
  orgId,
  dashboardId,
  req,
}: {
  orgId: string;
  dashboardId: string;
  req: CreateDashboardVarRequest;
}): Promise<ApiResponse<GetVarResponse>> {
  return await postWithoutToken<CreateDashboardVarRequest, GetVarResponse>({
    url: `/api/v1/orgs/${orgId}/dashboards/${dashboardId}/vars`,
    request: req,
  });
}

export async function listVars({
  orgId,
  dashboardId,
}: {
  orgId: string;
  dashboardId: string;
}): Promise<ApiResponse<ListVarsResponse>> {
  return await getWithoutToken<ListVarsResponse>({
    url: `/api/v1/orgs/${orgId}/dashboards/${dashboardId}/vars`,
  });
}

export async function deleteVar({
  orgId,
  dashboardId,
  name,
}: {
  orgId: string;
  dashboardId: string;
  name: string;
}): Promise<ApiResponse<void>> {
  return await postWithoutToken<any, void>({
    url: `/api/v1/orgs/${orgId}/dashboards/${dashboardId}/vars/${name}/delete`,
    request: undefined,
  });
}

export async function updateUserProfile({
  updateUserRequest,
}: {
  updateUserRequest: UpdateUserRequest;
}): Promise<ApiResponse<GetUserProfileResponse>> {
  return await postWithoutToken<UpdateUserRequest, GetUserProfileResponse>({
    url: `/api/v1/users/profile/update`,
    request: updateUserRequest,
  });
}

export async function createUser({
  request,
}: {
  request: CreateUserRequest;
}): Promise<ApiResponse<void>> {
  return await postWithoutToken<CreateUserRequest, void>({
    url: `/api/v1/users`,
    request: request,
  });
}

export async function signInWithPass({
  request,
}: {
  request: SignInRequest;
}): Promise<ApiResponse<void>> {
  return await postWithoutToken<SignInRequest, void>({
    url: `/api/v1/users/sign-in`,
    request: request,
  });
}

export async function getUserProfile({}: {}): Promise<
  ApiResponse<GetUserProfileResponse>
> {
  return await getWithoutToken<GetUserProfileResponse>({
    url: `/api/v1/users/profile`,
  });
}

export async function getVarHints({
  request,
}: {
  request: GetVarHintsRequest;
}): Promise<ApiResponse<VarHintsResponse>> {
  return await postWithoutToken<GetVarHintsRequest, VarHintsResponse>({
    url: `/api/v1/variable-hints`,
    request: request,
  });
}

export async function listLabelValues({
  label,
}: {
  label: string;
}): Promise<ApiResponse<string>> {
  return await getWithoutToken<string>({
    url: `/api/v1/label/${label}/values`,
  });
}

export async function queryGet({}: {}): Promise<ApiResponse<string>> {
  return await getWithoutToken<string>({ url: `/api/v1/query` });
}

export async function queryPost({}: {}): Promise<ApiResponse<string>> {
  return await postWithoutToken<any, string>({
    url: `/api/v1/query`,
    request: undefined,
  });
}

export async function queryRange({}: {}): Promise<ApiResponse<string>> {
  return await getWithoutToken<string>({ url: `/api/v1/query_range` });
}

export async function queryRangePost({}: {}): Promise<ApiResponse<string>> {
  return await postWithoutToken<any, string>({
    url: `/api/v1/query_range`,
    request: undefined,
  });
}

export async function listLabels({}: {}): Promise<ApiResponse<string>> {
  return await getWithoutToken<string>({ url: `/api/v1/labels` });
}

export async function metadata({}: {}): Promise<ApiResponse<string>> {
  return await getWithoutToken<string>({ url: `/api/v1/metadata` });
}

export async function createPanel({
  orgId,
  dashboardId,
  versionId,
  rowId,
  req,
}: {
  orgId: string;
  dashboardId: string;
  versionId: string;
  rowId: string;
  req: CreateDashboardPanelRequest;
}): Promise<ApiResponse<GetDashboardPanelResponse>> {
  return await postWithoutToken<
    CreateDashboardPanelRequest,
    GetDashboardPanelResponse
  >({
    url: `/api/v1/orgs/${orgId}/dashboards/${dashboardId}/versions/${versionId}/rows/${rowId}/panels`,
    request: req,
  });
}

export async function getPanel({
  orgId,
  dashboardId,
  versionId,
  rowId,
  panelId,
}: {
  orgId: string;
  dashboardId: string;
  versionId: string;
  rowId: string;
  panelId: string;
}): Promise<ApiResponse<GetDashboardPanelResponse>> {
  return await getWithoutToken<GetDashboardPanelResponse>({
    url: `/api/v1/orgs/${orgId}/dashboards/${dashboardId}/versions/${versionId}/rows/${rowId}/panels/${panelId}`,
  });
}

export async function deletePanel({
  orgId,
  dashboardId,
  versionId,
  rowId,
  panelId,
}: {
  orgId: string;
  dashboardId: string;
  versionId: string;
  rowId: string;
  panelId: string;
}): Promise<ApiResponse<void>> {
  return await postWithoutToken<any, void>({
    url: `/api/v1/orgs/${orgId}/dashboards/${dashboardId}/versions/${versionId}/rows/${rowId}/panels/${panelId}/delete`,
    request: undefined,
  });
}

export async function updatePanel({
  orgId,
  dashboardId,
  versionId,
  rowId,
  panelId,
  req,
}: {
  orgId: string;
  dashboardId: string;
  versionId: string;
  rowId: string;
  panelId: string;
  req: UpdateDashboardPanelRequest;
}): Promise<ApiResponse<GetDashboardPanelResponse>> {
  return await postWithoutToken<
    UpdateDashboardPanelRequest,
    GetDashboardPanelResponse
  >({
    url: `/api/v1/orgs/${orgId}/dashboards/${dashboardId}/versions/${versionId}/rows/${rowId}/panels/${panelId}/update`,
    request: req,
  });
}
