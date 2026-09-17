'use client';
/**
 * ChartWithLegend
 *
 * Composition of LineChart (ECharts) + a compact, single-row LegendSelector
 * with Shift+Click solo behavior. The component is layout-aware and designed
 * to maximize chart area inside constrained containers (e.g. grid panels).
 *
 * Key behavior
 * - Computes stable colors from legend names (or pass colorSelector).
 * - Single-row, horizontal-scrolling legend below the chart; small chips.
 * - Flex layout: chart fills remaining vertical space; legend has max-height.
 * - Auto-tunes chrome: in 'auto' mode, hides dataZoom slider when height is
 *   short to reclaim space (we removed dataZoom; drag-to-select is the only
 *   gesture, matching Grafana-style UX).
 * - Emits selection via onSelect; the parent owns time range and data updates.
 *
 * Props
 * - series: LineTimeSeries[] (required)
 * - height?: number | string — forwarded to LineChart; defaults to '100%'.
 * - onSelect?(xstart, xend): brush selection callback (epoch ms).
 * - colorSelector?: (names) => string[] — override color generation.
 * - xAxisLabel?, yAxisLabel?, showPoints?
 * - legendMaxHeight?: number | string (default 48) — cap legend height.
 * - legendOverflow?: 'scroll' | 'wrap' | 'auto' (default 'scroll').
 * - chartMinHeight?: number (default 200) — chart area minimum height.
 *   (No per-chart dataZoom slider; panning/slider are removed.)
 *
 * Usage
 *   <ChartWithLegend
 *     series={[{ name: 'CPU_1', data: [...] }]}
 *     yAxisLabel="CPU %"
 *     chartMinHeight={200}
 *     legendMaxHeight={48}
 *   />
 */
import { CSSProperties, useEffect, useMemo, useRef, useState } from 'react';
import { LegendSelector, type LegendItem } from './LegendSelector';
import {
  LineChart,
  type ColorSelector,
  type LineTimeSeries,
} from './LineChart';

function defaultColorSelector(legends: string[]): string[] {
  const n = Math.max(legends.length, 1);
  return legends.map((_, i) => {
    const hue = Math.round((360 * i) / n);
    return `hsl(${hue}, 70%, 50%)`;
  });
}

export function ChartWithLegend({
  series,
  height,
  onSelect,
  colorSelector,
  xAxisLabel,
  yAxisLabel,
  showPoints,
  legendMaxHeight = 48,
  legendOverflow = 'scroll',
  legendGap = 8,
  chartGroup,
}: {
  series: LineTimeSeries[];
  height?: number | string;
  onSelect?: (xstart: number, xend: number) => void;
  colorSelector?: ColorSelector;
  xAxisLabel?: string;
  yAxisLabel?: string;
  showPoints?: boolean;
  legendMaxHeight?: number | string;
  legendOverflow?: 'scroll' | 'wrap' | 'auto';
  legendGap?: number;
  chartGroup?: string;
}) {
  const legendItems = useMemo<LegendItem[]>(
    () =>
      series.map((s) => ({
        id: s.name,
        label: s.legendLabel || s.name,
        tooltip: s.legendTooltip || s.legendLabel || s.name,
      })),
    [series],
  );
  const legendNames = useMemo(
    () => legendItems.map((item) => item.id),
    [legendItems],
  );
  const [selected, setSelected] = useState<string[]>(legendNames);
  useEffect(() => {
    // Ensure selection remains valid when series list changes
    const set = new Set(legendNames);
    const next = selected.filter((n) => set.has(n));
    if (next.length === 0) setSelected(legendNames);
    else if (next.length !== selected.length) setSelected(next);
  }, [legendNames]);

  const colors = useMemo(
    () => (colorSelector || defaultColorSelector)(legendNames),
    [legendNames, colorSelector],
  );
  const colorMap = useMemo(
    () => Object.fromEntries(legendNames.map((n, i) => [n, colors[i]])),
    [legendNames, colors],
  );

  const chartBoxRef = useRef<HTMLDivElement | null>(null);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const [measuredSize, setMeasuredSize] = useState({ width: 0, height: 0 });

  const legendOverflowStyle: Partial<CSSProperties> =
    legendOverflow === 'wrap'
      ? { overflowY: 'auto', overflowX: 'hidden' }
      : { overflowX: 'auto', overflowY: 'hidden' };
  const legendHeight =
    typeof legendMaxHeight === 'number' ? legendMaxHeight : 32;
  const hasExplicitHeight = !!height && height !== '100%';
  const containerHeight = hasExplicitHeight
    ? typeof height === 'number'
      ? height
      : measuredSize.height
    : measuredSize.height;
  const chartRowHeight =
    containerHeight > 0
      ? Math.max(0, containerHeight - legendHeight - legendGap)
      : 0;
  const chartHeight = hasExplicitHeight ? chartRowHeight : '100%';

  return (
    <div
      ref={rootRef}
      style={{
        height: height ?? '100%',
        width: '100%',
        display: 'grid',
        gridTemplateRows: hasExplicitHeight
          ? `${chartRowHeight}px ${legendGap}px ${legendHeight}px`
          : `1fr ${legendGap}px ${legendHeight}px`,
        minHeight: 0,
        minWidth: 0,
        overflow: 'hidden',
      }}
    >
      <div
        ref={chartBoxRef}
        style={{ minHeight: 0, minWidth: 0, overflow: 'hidden' }}
      >
        <LineChart
          series={series}
          height={chartHeight}
          onSelect={onSelect}
          colorMap={colorMap}
          visibleSeries={selected}
          xAxisLabel={xAxisLabel}
          yAxisLabel={yAxisLabel}
          showPoints={showPoints}
          groupId={chartGroup}
        />
      </div>
      <div aria-hidden style={{ height: legendGap }} />
      <div
        style={{
          height: legendHeight,
          maxHeight: legendHeight,
          flexShrink: 0,
          ...legendOverflowStyle,
        }}
      >
        <LegendSelector
          items={legendItems}
          colors={colors}
          value={selected}
          onChange={setSelected}
          wrap={legendOverflow === 'wrap' ? 'wrap' : 'nowrap'}
        />
      </div>
    </div>
  );
}
