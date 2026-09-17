import { MantineProvider } from '@mantine/core';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import '@testing-library/jest-dom';
import { PropsWithChildren } from 'react';
import {
  AppServicesOverrideProvider,
  createTestAppServices,
  type AppServices,
} from '@/lib/app-services';

const sharedQueryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
});

export function renderWithProviders(
  ui: React.ReactElement,
  options: { appServices?: AppServices } = {},
) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  const appServices = options.appServices || createTestAppServices();
  const Wrapper = ({ children }: PropsWithChildren) => (
    <MantineProvider defaultColorScheme="light">
      <QueryClientProvider client={queryClient}>
        <AppServicesOverrideProvider services={appServices}>
          {children}
        </AppServicesOverrideProvider>
      </QueryClientProvider>
    </MantineProvider>
  );

  return { queryClient, Wrapper };
}

import { render, RenderOptions } from '@testing-library/react';
import React, { ReactElement } from 'react';

const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  const appServices = createTestAppServices();
  return (
    <MantineProvider>
      <QueryClientProvider client={sharedQueryClient}>
        <AppServicesOverrideProvider services={appServices}>
          {children}
        </AppServicesOverrideProvider>
      </QueryClientProvider>
    </MantineProvider>
  );
};

export const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>,
) => render(ui, { wrapper: AllTheProviders, ...options });

export * from '@testing-library/react';
