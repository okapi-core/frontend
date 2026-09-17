import { test as base } from '@playwright/test';
import type { RequestHandler } from 'msw';
import { defaultApiHandlers } from '../mocks/auth-handlers';
import { installMswRoute } from '../mocks/playwright-msw';

type ApiFixtures = {
  useApiHandlers: (...handlers: RequestHandler[]) => void;
};

export const test = base.extend<ApiFixtures>({
  useApiHandlers: async ({ page }, use) => {
    let runtimeHandlers: RequestHandler[] = [];

    await installMswRoute({
      page,
      getHandlers: () => [...runtimeHandlers, ...defaultApiHandlers],
    });

    await use((...handlers) => {
      runtimeHandlers = handlers;
    });
  },
});

export { expect } from '@playwright/test';
