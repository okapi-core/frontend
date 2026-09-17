'use client';
import ReactEChartsCore from 'echarts-for-react/lib/core';
import echarts from './echarts-setup';

export interface BarTimeSeries {
  name: string;
  data: { x: number; y: number }[];
}

export function TimeBarChart({
  series,
  height = 320,
  xAxisLabel = 'time',
  yAxisLabel = 'value',
}: {
  series: BarTimeSeries[];
  height?: number | string;
  xAxisLabel?: string;
  yAxisLabel?: string;
}) {
  const option = {
    tooltip: { trigger: 'axis' as const },
    legend: { show: series.length > 1 },
    grid: { left: 40, right: 16, top: 24, bottom: 36 },
    xAxis: {
      type: 'time' as const,
      name: xAxisLabel,
      splitLine: { show: true },
    },
    yAxis: {
      type: 'value' as const,
      name: yAxisLabel,
      splitLine: { show: true },
    },
    series: series.map((s) => ({
      name: s.name,
      type: 'bar',
      data: s.data.map((p) => [p.x, p.y]),
      barWidth: '60%',
      emphasis: { focus: 'series' as const },
    })),
  };

  return (
    <ReactEChartsCore
      echarts={echarts as any}
      option={option}
      notMerge
      lazyUpdate
      style={{ height }}
    />
  );
}

export default TimeBarChart;
