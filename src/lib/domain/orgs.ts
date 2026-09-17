import { getOrg } from '@/lib/api';
import { ApiResponse } from '@/lib/api-responses';
import {
  CreateOrgMemberRequest,
  UpdateOrgMemberRequest,
  UpdateOrgRequest,
} from '@/lib/request-types';
import { GetOrgResponse } from '@/lib/response-types';

export function getOrgById({ orgId }: { orgId: string }) {
  return getOrg({ orgId });
}

function unsupportedOrgMutation<T>(): Promise<ApiResponse<T>> {
  return Promise.resolve({
    error: 'Org mutation API is not available in the current backend',
    statusCode: 404,
  });
}

export function updateOrgById(_request: {
  orgId?: string;
  orgName?: string;
  req?: UpdateOrgRequest;
}): Promise<ApiResponse<GetOrgResponse>> {
  return unsupportedOrgMutation<GetOrgResponse>();
}

export function addOrgMember(_request: {
  orgId?: string;
  req?: CreateOrgMemberRequest;
}): Promise<ApiResponse<GetOrgResponse>> {
  return unsupportedOrgMutation<GetOrgResponse>();
}

export function updateOrgMember(_request: {
  orgId?: string;
  req?: UpdateOrgMemberRequest;
}): Promise<ApiResponse<GetOrgResponse>> {
  return unsupportedOrgMutation<GetOrgResponse>();
}
