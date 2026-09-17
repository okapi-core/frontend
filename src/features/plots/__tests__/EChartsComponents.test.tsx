import { renderWithProviders } from '@/test/utils';
import { act, render } from '@testing-library/react';
import { forwardRef } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Histogram } from '../Histogram';
import { LineChart } from '../LineChart';
import { TimeBarChart } from '../TimeBarChart';

const chartProps = vi.hoisted(() => [] as any[]);
const connect = vi.hoisted(() => vi.fn());

vi.mock('echarts-for-react/lib/core', () => ({
  default: forwardRef(function MockEChart(props: any, _ref) {
    chartProps.push(props);
    return <div data-testid="echart" />;
  }),
}));

vi.mock('../AutoSizedEChart', () => ({
  AutoSizedEChart: (props: any) => {
    chartProps.push({
      ...props,
      style: {
        height: typeof props.height === 'number' ? `${props.height}px` : props.height,
        width: '100%',
      },
    });
    return <div data-testid="autosized-echart" />;
  },
}));

vi.mock('../echarts-setup', () => ({
  default: { connect },
}));

beforeEach(() => {
  chartProps.length = 0;
  connect.mockReset();
});

function latestProps() {
  return chartProps.at(-1);
}

describe('LineChart', () => {
  it('normalizes data, filters series, and applies chart options', () => {
    const date = new Date('2026-01-02T00:00:00Z');
    render(
      <LineChart
        series={[
          {
            name: 'cpu',
            data: [
              { x: 100, y: 1 },
              { x: '2026-01-01T00:00:00Z', y: 2 },
              { x: date, y: 3 },
              { x: null as unknown as number, y: 4 },
            ],
          },
          { name: 'memory', data: [{ x: 200, y: 5 }] },
        ]}
        visibleSeries={['cpu']}
        colorMap={{ cpu: '#abc' }}
        xAxisLabel="timestamp"
        yAxisLabel="percent"
        showPoints
        showXAxisLabels={false}
        xAxisSplitNumber={4}
        height={240}
      />,
    );

    const props = latestProps();
    expect(props.style).toEqual({ height: '240px', width: '100%' });
    expect(props.option.xAxis).toMatchObject({
      name: 'timestamp',
      splitNumber: 4,
      axisLabel: { show: false, hideOverlap: true },
      axisTick: { show: false },
    });
    expect(props.option.yAxis.name).toBe('percent');
    expect(props.option.series).toEqual([
      expect.objectContaining({
        name: 'cpu',
        showSymbol: true,
        itemStyle: { color: '#abc' },
        data: [
          [100, 1],
          [new Date('2026-01-01T00:00:00Z').getTime(), 2],
          [date.getTime(), 3],
        ],
      }),
    ]);
  });

  it('activates brush, connects a group, and reports valid brush ranges', () => {
    const dispatchAction = vi.fn();
    const onReady = vi.fn();
    const onSelect = vi.fn();
    render(
      <LineChart
        series={[]}
        groupId="dashboard"
        onChartReady={onReady}
        onSelect={onSelect}
      />,
    );
    const props = latestProps();
    const instance: any = { dispatchAction };

    act(() => props.onChartReady(instance));
    expect(dispatchAction).toHaveBeenCalledWith({
      type: 'takeGlobalCursor',
      key: 'brush',
      brushOption: { brushType: 'lineX', brushMode: 'single' },
    });
    expect(instance.group).toBe('dashboard');
    expect(connect).toHaveBeenCalledWith('dashboard');
    expect(onReady).toHaveBeenCalledWith(instance);

    act(() =>
      props.onEvents.brushEnd({
        batch: [{ areas: [{ coordRange: [10, 20] }] }],
      }),
    );
    expect(onSelect).toHaveBeenCalledWith(10, 20);

    act(() =>
      props.onEvents.brushEnd({ areas: [{ coordRange: ['bad', 20] }] }),
    );
    expect(onSelect).toHaveBeenCalledTimes(1);
  });
});

describe('Histogram', () => {
  it('uses bucket midpoints, fills missing counts, and filters from the legend', () => {
    const { Wrapper } = renderWithProviders(<></>);
    const { getByRole } = render(
      <Histogram
        title="Latency"
        histograms={[
          {
            name: 'first',
            start: 0,
            buckets: [0, 10, 20],
            counts: [3, 4],
          },
          {
            name: 'second',
            start: 1,
            buckets: [0, 10, 20],
            counts: [8],
          },
        ]}
      />,
      { wrapper: Wrapper },
    );

    expect(latestProps().option.title).toEqual({ text: 'Latency' });
    expect(latestProps().option.xAxis.data).toEqual([5, 15]);
    expect(latestProps().option.series[1].data).toEqual([8, 0]);

    act(() => getByRole('button', { name: 'first' }).click());
    expect(latestProps().option.series.map((item: any) => item.name)).toEqual([
      'second',
    ]);
  });

  it('handles empty histogram data', () => {
    const { Wrapper } = renderWithProviders(<></>);
    render(<Histogram histograms={[]} />, { wrapper: Wrapper });
    expect(latestProps().option.xAxis.data).toEqual([]);
    expect(latestProps().option.series).toEqual([]);
  });
});

describe('TimeBarChart', () => {
  it('maps values and only shows a legend for multiple series', () => {
    const { rerender } = render(
      <TimeBarChart
        series={[{ name: 'requests', data: [{ x: 10, y: 4 }] }]}
        xAxisLabel="when"
        yAxisLabel="count"
        height="50%"
      />,
    );
    expect(latestProps().option.legend.show).toBe(false);
    expect(latestProps().option.series[0].data).toEqual([[10, 4]]);
    expect(latestProps().option.xAxis.name).toBe('when');
    expect(latestProps().style).toEqual({ height: '50%' });

    rerender(
      <TimeBarChart
        series={[
          { name: 'one', data: [] },
          { name: 'two', data: [] },
        ]}
      />,
    );
    expect(latestProps().option.legend.show).toBe(true);
  });
});
