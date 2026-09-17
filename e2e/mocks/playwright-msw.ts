import type { Page, Route } from '@playwright/test';
import { getResponse, type RequestHandler } from 'msw';

function toFetchRequest(route: Route): Request {
  const request = route.request();
  const method = request.method();
  const body =
    method === 'GET' || method === 'HEAD'
      ? undefined
      : (request.postData() ?? undefined);

  return new Request(request.url(), {
    method,
    headers: request.headers(),
    body,
  });
}

export async function installMswRoute({
  page,
  getHandlers,
}: {
  page: Page;
  getHandlers: () => RequestHandler[];
}): Promise<void> {
  await page.route('**/api/**', async (route) => {
    const request = toFetchRequest(route);
    const response = await getResponse(getHandlers(), request);

    if (!response) {
      throw new Error(
        `Unhandled API request: ${request.method} ${request.url}`,
      );
    }

    const body = Buffer.from(await response.arrayBuffer());

    await route.fulfill({
      status: response.status,
      headers: Object.fromEntries(response.headers.entries()),
      body,
    });
  });
}
