import { renderWithProviders, screen } from '@/test/utils';
import { render } from '@testing-library/react';
import { beforeEach, expect, it, vi } from 'vitest';
import { ErrorsPanel } from '../errors-panel';

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
  render(<ErrorsPanel label="Error rate" ts={[1, 2]} rates={[3, 4]} />, {
    wrapper: Wrapper,
  });

  expect(screen.getByText('Error rate')).toBeInTheDocument();
  const call = LineChartMock.mock.calls.at(-1)?.[0] as any;
  expect(call.series.map((s: { name: string }) => s.name)).toEqual(['errors']);
});

it('renders with mismatched data lengths', () => {
  const { Wrapper } = renderWithProviders(<></>);
  render(<ErrorsPanel label="Errors" ts={[1, 2, 3]} rates={[1]} />, {
    wrapper: Wrapper,
  });

  expect(screen.getByText('Errors')).toBeInTheDocument();
  expect(LineChartMock).toHaveBeenCalled();
});
