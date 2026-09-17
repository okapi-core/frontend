import { renderWithProviders, screen } from '@/test/utils';
import { render } from '@testing-library/react';
import { beforeEach, expect, it, vi } from 'vitest';
import { RatesPanel } from '../rates-panel';

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
  render(<RatesPanel label="Request rate" ts={[1, 2]} rates={[5, 6]} />, {
    wrapper: Wrapper,
  });

  expect(screen.getByText('Request rate')).toBeInTheDocument();
  const call = LineChartMock.mock.calls.at(-1)?.[0] as any;
  expect(call.series.map((s: { name: string }) => s.name)).toEqual(['rates']);
});

it('renders with empty data arrays', () => {
  const { Wrapper } = renderWithProviders(<></>);
  render(<RatesPanel label="Rates" ts={[]} rates={[]} />, {
    wrapper: Wrapper,
  });

  expect(screen.getByText('Rates')).toBeInTheDocument();
  expect(LineChartMock).toHaveBeenCalled();
});
