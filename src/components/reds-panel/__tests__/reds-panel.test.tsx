import { renderWithProviders, screen } from '@/test/utils';
import { render } from '@testing-library/react';
import { beforeEach, expect, it, vi } from 'vitest';
import { RedsPanel } from '../reds-panel';

vi.mock('@/features/plots/LineChart', () => ({
  LineChart: () => <div data-testid="line-chart" />,
}));

beforeEach(() => {
  vi.clearAllMocks();
});

it('renders the operation name with a single point', () => {
  const { Wrapper } = renderWithProviders(<></>);
  render(
    <RedsPanel
      operation="getUser"
      h={200}
      w={320}
      redMetrics={{
        ts: [100],
        counts: [1],
        rps: [1],
        rpm: [60],
        errorRates: [0],
        errors: [0],
        durationsP50: [10],
        durationsP75: [12],
        durationsP90: [14],
        durationsP99: [16],
        totalRequests: 1,
        totalErrors: 0,
        availability: 1,
      }}
    />,
    { wrapper: Wrapper },
  );

  expect(screen.getAllByText(/getUser/)).toHaveLength(6);
});

it('renders the operation name with five points', () => {
  const { Wrapper } = renderWithProviders(<></>);
  render(
    <RedsPanel
      operation="listOrders"
      h={200}
      w={320}
      redMetrics={{
        ts: [1, 2, 3, 4, 5],
        counts: [1, 2, 3, 4, 5],
        rps: [1, 2, 3, 4, 5],
        rpm: [60, 120, 180, 240, 300],
        errorRates: [0, 0.5, 0, 0.25, 0],
        errors: [0, 1, 0, 1, 0],
        durationsP50: [10, 11, 12, 13, 14],
        durationsP75: [20, 21, 22, 23, 24],
        durationsP90: [30, 31, 32, 33, 34],
        durationsP99: [40, 41, 42, 43, 44],
        totalRequests: 15,
        totalErrors: 2,
        availability: 0.867,
      }}
    />,
    { wrapper: Wrapper },
  );

  expect(screen.getAllByText(/listOrders/)).toHaveLength(6);
});
