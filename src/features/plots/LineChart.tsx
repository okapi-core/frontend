import { EChartsCoreOption } from 'echarts';
import { useEffect, useMemo, useRef } from 'react';
import { AutoSizedEChart } from './AutoSizedEChart';
import echarts from './echarts-setup';

export type ColorSelector = (legends: string[]) => string[];

export interface LineTimeSeries {
  name: string;
  data: { x: number | string | Date; y: number }[];
  legendLabel?: string;
  legendTooltip?: string;
}

export interface LineChartProps {
  series: LineTimeSeries[];
  height?: number | string;
  onSelect?: (xstart: number, xend: number) => void;
  onChartReady?: (inst: any) => void;
  colorSelector?: ColorSelector;
  colorMap?: Record<string, string>;
  visibleSeries?: string[];
  xAxisLabel?: string;
  yAxisLabel?: string;
  showPoints?: boolean;
  showXAxisLabels?: boolean;
  xAxisSplitNumber?: number;
  groupId?: string;
}

function defaultColorSelector(legends: string[]): string[] {
  const n = Math.max(legends.length, 1);
  return legends.map((_, i) => {
    const hue = Math.round((360 * i) / n);
    return `hsl(${hue}, 70%, 50%)`;
  });
}

export function LineChart({
  series,
  height = 320,
  onSelect,
  onChartReady,
  colorSelector,
  colorMap,
  visibleSeries,
  xAxisLabel,
  yAxisLabel,
  showPoints = false,
  showXAxisLabels = true,
  xAxisSplitNumber,
  groupId,
}: LineChartProps) {
  const chartInstRef = useRef<any | null>(null);
  const activateBrush = (inst: any) => {
    try {
      inst?.dispatchAction?.({
        type: 'takeGlobalCursor',
        key: 'brush',
        brushOption: { brushType: 'lineX', brushMode: 'single' },
      });
      if (groupId) {
        inst.group = groupId;
        echarts.connect(groupId);
      }
    } catch {}
  };
  const handleChartReady = (inst: any) => {
    chartInstRef.current = inst;
    activateBrush(inst);
    onChartReady?.(inst);
  };
  const legendNames = useMemo(() => series.map((s) => s.name), [series]);

  const colors = useMemo(() => {
    if (colorMap) return legendNames.map((n) => colorMap[n] || '#888');
    const selector = colorSelector || defaultColorSelector;
    return selector(legendNames);
  }, [legendNames, colorSelector, colorMap]);

  const option: EChartsCoreOption = useMemo(() => {
    const visibleSet = visibleSeries ? new Set(visibleSeries) : null;
    const filtered = visibleSet
      ? series.filter((s) => visibleSet.has(s.name))
      : series;
    const indexOf = (name: string) => legendNames.indexOf(name);
    const seriesOptions = filtered.map((s) => ({
      type: 'line',
      name: s.name,
      showSymbol: !!showPoints,
      symbolSize: 6,
      emphasis: { focus: 'series' as const },
      lineStyle: { width: 2 },
      itemStyle: { color: colorMap?.[s.name] ?? colors[indexOf(s.name)] },
      data: s.data
        .filter((p) => p != null && p.x != null && p.y != null)
        .map((p) => [
          p.x instanceof Date
            ? p.x.getTime()
            : typeof p.x === 'string'
              ? new Date(p.x).getTime()
              : p.x,
          p.y,
        ]),
    }));

    return {
      color: colors,
      grid: { left: 44, right: 12, top: 16, bottom: 28 },
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'cross' },
      },
      xAxis: {
        type: 'time',
        name: xAxisLabel,
        nameLocation: 'end',
        nameGap: 18,
        boundaryGap: false,
        splitNumber: xAxisSplitNumber,
        axisLabel: { show: showXAxisLabels, hideOverlap: true },
        axisTick: { show: showXAxisLabels },
      },
      yAxis: {
        type: 'value',
        name: yAxisLabel,
        nameGap: 12,
        axisLine: { show: true },
        splitLine: { show: true },
      },
      legend: { show: false },
      // Enable drag-to-select on the x axis using brush only (no box/lasso)
      brush: {
        toolbox: [], // no toolbox UI
        brushMode: 'single',
        xAxisIndex: 'all',
        brushType: 'lineX',
        transformable: false,
        brushStyle: {
          color: 'rgba(100, 100, 255, 0.15)',
          borderWidth: 1,
          borderColor: 'rgba(100,100,255,0.6)',
        },
        // Disable other brush types explicitly
        // Users cannot switch since we provide no toolbox and transformable=false
        throttleType: 'debounce',
        throttleDelay: 100,
      },
      // No dataZoom (panning/slider) to keep drag dedicated to brush selection
      // and match Grafana-style drag-to-zoom UX.
      series: seriesOptions,
    } as const;
  }, [
    series,
    colors,
    legendNames,
    xAxisLabel,
    yAxisLabel,
    showPoints,
    visibleSeries,
    colorMap,
    showXAxisLabels,
    xAxisSplitNumber,
  ]);

  useEffect(() => {
    if (!chartInstRef.current) return;
    // Re-activate brush cursor when options update (e.g., legend toggles).
    activateBrush(chartInstRef.current);
  }, [groupId, option]);

  return (
    <AutoSizedEChart
      option={option}
      height={height}
      onChartReady={handleChartReady}
      onEvents={{
        brushEnd: (params: any) => {
          if (!onSelect) return;
          const areas =
            params?.areas ??
            params?.batch?.[0]?.areas ??
            params?.batch?.[0]?.areas;
          const range = areas?.[0]?.coordRange;
          if (
            Array.isArray(range) &&
            typeof range[0] === 'number' &&
            typeof range[1] === 'number'
          ) {
            onSelect(range[0], range[1]);
          }
        },
      }}
      replaceMerge={['series']}
      notMerge={true}
      lazyUpdate={true}
    />
  );
}
