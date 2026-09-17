import { renderWithProviders } from '@/test/utils';
import { act, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ChartWithLegend } from '../ChartWithLegend';

const lineChartProps = vi.hoisted(() => [] as any[]);

vi.mock('../LineChart', () => ({
  LineChart: (props: any) => {
    lineChartProps.push(props);
    return <div data-testid="line-chart" />;
  },
}));

beforeEach(() => {
  lineChartProps.length = 0;
});

function latestProps() {
  return lineChartProps.at(-1);
}

const series = [
  {
    name: 'cpu',
    legendLabel: 'CPU',
    legendTooltip: 'CPU usage',
    data: [{ x: 1, y: 2 }],
  },
  { name: 'memory', data: [{ x: 1, y: 3 }] },
];

describe('ChartWithLegend', () => {
  it('passes labels, colors, visibility, dimensions, and chart props', () => {
    const colorSelector = vi.fn(() => ['red', 'blue']);
    const { Wrapper } = renderWithProviders(<></>);
    render(
      <ChartWithLegend
        series={series}
        height={300}
        legendMaxHeight={40}
        legendGap={10}
        colorSelector={colorSelector}
        xAxisLabel="time"
        yAxisLabel="value"
        showPoints
        chartGroup="group"
      />,
      { wrapper: Wrapper },
    );

    expect(screen.getByRole('button', { name: 'CPU' })).toBeInTheDocument();
    expect(colorSelector).toHaveBeenCalledWith(['cpu', 'memory']);
    expect(latestProps()).toMatchObject({
      series,
      height: 250,
      colorMap: { cpu: 'red', memory: 'blue' },
      visibleSeries: ['cpu', 'memory'],
      xAxisLabel: 'time',
      yAxisLabel: 'value',
      showPoints: true,
      groupId: 'group',
    });
  });

  it('updates visible series and reconciles selection after input changes', () => {
    const { Wrapper } = renderWithProviders(<></>);
    const { rerender } = render(
      <ChartWithLegend series={series} height={200} />,
      { wrapper: Wrapper },
    );

    act(() => screen.getByRole('button', { name: 'memory' }).click());
    expect(latestProps().visibleSeries).toEqual(['cpu']);

    rerender(
      <ChartWithLegend
        series={[{ name: 'network', data: [{ x: 1, y: 4 }] }]}
        height={200}
      />,
    );
    expect(latestProps().visibleSeries).toEqual(['network']);
  });

  it('updates the line chart height when explicit height changes', () => {
    const { Wrapper } = renderWithProviders(<></>);
    const { rerender } = render(
      <ChartWithLegend series={series} height={300} />,
      { wrapper: Wrapper },
    );

    expect(latestProps().height).toBe(244);
    rerender(<ChartWithLegend series={series} height={320} />);
    expect(latestProps().height).toBe(264);
  });
});
