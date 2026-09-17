import { http, HttpResponse, type RequestHandler } from 'msw';
import type {
  CreateUserRequest,
  SignInRequest,
} from '../../src/lib/request-types';
import type {
  GetDashboardResponse,
  GetUserProfileResponse,
  ListOrgsResponse,
  TokenResponse,
} from '../../src/lib/response-types';

const orgId = 'org-e2e';

export function signupSuccessHandler(): RequestHandler {
  return http.post<never, CreateUserRequest, TokenResponse>(
    '*/api/v1/users',
    async ({ request }) => {
      const requestBody: CreateUserRequest = await request.json();
      const responseBody: TokenResponse = {
        token: `signup-token-for-${requestBody.email}`,
      };

      return HttpResponse.json(responseBody);
    },
  );
}

export function signupHttpErrorHandler(
  message = 'An account with this email already exists.',
  status = 409,
): RequestHandler {
  return http.post<never, CreateUserRequest, string>(
    '*/api/v1/users',
    async ({ request }) => {
      const requestBody: CreateUserRequest = await request.json();
      void requestBody;

      return HttpResponse.text(message, { status });
    },
  );
}

export function signinSuccessHandler(): RequestHandler {
  return http.post<never, SignInRequest, string>(
    '*/api/v1/users/sign-in',
    async ({ request }) => {
      const requestBody: SignInRequest = await request.json();
      const responseBody: string = `signed-in:${requestBody.email}`;

      return HttpResponse.json(responseBody);
    },
  );
}

export function signinHttpErrorHandler(
  message = 'Invalid email or password.',
  status = 401,
): RequestHandler {
  return http.post<never, SignInRequest, string>(
    '*/api/v1/users/sign-in',
    async ({ request }) => {
      const requestBody: SignInRequest = await request.json();
      void requestBody;

      return HttpResponse.text(message, { status });
    },
  );
}

const profileHandler = http.get<never, never, GetUserProfileResponse>(
  '*/api/v1/users/profile',
  () => {
    const responseBody: GetUserProfileResponse = {
      id: 'user-e2e',
      firstName: 'E2E',
      lastName: 'User',
      email: 'user@example.com',
      orgSummary: {
        orgId,
        orgName: 'E2E Organization',
        totalMembers: 1,
      },
    };

    return HttpResponse.json(responseBody);
  },
);

const orgsHandler = http.get<never, never, ListOrgsResponse>(
  '*/api/v1/orgs',
  () => {
    const responseBody: ListOrgsResponse = {
      orgs: [
        {
          orgId,
          orgName: 'E2E Organization',
          roles: ['ADMIN'],
        },
      ],
    };

    return HttpResponse.json(responseBody);
  },
);

const dashboardsHandler = http.get<
  { orgId: string },
  never,
  GetDashboardResponse[]
>('*/api/v1/orgs/:orgId/dashboards', () => {
  const responseBody: GetDashboardResponse[] = [];

  return HttpResponse.json(responseBody);
});

export const defaultApiHandlers: RequestHandler[] = [
  signupSuccessHandler(),
  signinSuccessHandler(),
  profileHandler,
  orgsHandler,
  dashboardsHandler,
];
