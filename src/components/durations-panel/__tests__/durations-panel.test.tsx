import { renderWithProviders, screen } from '@/test/utils';
import { render } from '@testing-library/react';
import { beforeEach, expect, it, vi } from 'vitest';
import { DurationsPanel } from '../durations-panel';

const LineChartMock = vi.fn();

vi.mock('@/features/plots/LineChart', () => ({
  LineChart: (props: unknown) => {
    LineChartMock(props);
    return <div data-testid="line-chart" />;
  },
}));

beforeEach(() => {
  vi.clearAllMocks();
});

it('renders the label and series legends', () => {
  const { Wrapper } = renderWithProviders(<></>);
  render(
    <DurationsPanel
      label="Latency"
      ts={[1, 2]}
      p50={[10, 11]}
      p75={[20, 21]}
      p90={[30, 31]}
      p99={[40, 41]}
    />,
    { wrapper: Wrapper },
  );

  expect(screen.getByText('Latency')).toBeInTheDocument();
  const call = LineChartMock.mock.calls.at(-1)?.[0] as any;
  expect(call.series.map((s: { name: string }) => s.name)).toEqual([
    'p50',
    'p75',
    'p90',
    'p99',
  ]);
});

it('renders with empty data arrays', () => {
  const { Wrapper } = renderWithProviders(<></>);
  render(
    <DurationsPanel
      label="Durations"
      ts={[]}
      p50={[]}
      p75={[]}
      p90={[]}
      p99={[]}
    />,
    { wrapper: Wrapper },
  );

  expect(screen.getByText('Durations')).toBeInTheDocument();
  expect(LineChartMock).toHaveBeenCalled();
});
