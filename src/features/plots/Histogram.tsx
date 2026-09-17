'use client';
import { useEffect, useMemo, useState } from 'react';
import ReactEChartsCore from 'echarts-for-react/lib/core';
import { LegendSelector } from './LegendSelector';
import echarts from './echarts-setup';

export type HistogramBucketSeries = {
  name?: string;
  start: number; // epoch ms of sample window start
  end?: number; // epoch ms of sample window end
  counts: number[]; // per-bucket counts
  buckets: number[]; // bucket boundaries (same length as counts or counts+1)
};

export function Histogram({
  histograms,
  height = 260,
  title,
}: {
  histograms: HistogramBucketSeries[];
  height?: number | string;
  title?: string;
}) {
  const histogramList = histograms || [];
  // Use the first histogram's bucket labels as the shared category axis.
  const base = histogramList[0];
  const baseLabels = base
    ? base.buckets.length === base.counts.length + 1
      ? base.buckets
          .slice(0, -1)
          .map((b, i) => (b + base.buckets[i + 1]!) / 2)
      : base.buckets.slice(0, base.counts.length)
    : [];

  const legendNames = useMemo(
    () =>
      histogramList.map((h) => h.name || new Date(h.start).toLocaleTimeString()),
    [histogramList],
  );
  const legendItems = useMemo(
    () => legendNames.map((name) => ({ id: name, label: name })),
    [legendNames],
  );
  const [selected, setSelected] = useState<string[]>(legendNames);
  useEffect(() => {
    const set = new Set(legendNames);
    const next = selected.filter((n) => set.has(n));
    if (next.length === 0) setSelected(legendNames);
    else if (next.length !== selected.length) setSelected(next);
  }, [legendNames]);

  const colors = useMemo(() => {
    const n = Math.max(legendNames.length, 1);
    return legendNames.map((_, i) => {
      const hue = Math.round((360 * i) / n);
      return `hsl(${hue}, 70%, 50%)`;
    });
  }, [legendNames]);
  const colorMap = useMemo(
    () => Object.fromEntries(legendNames.map((n, i) => [n, colors[i]])),
    [legendNames, colors],
  );

  const series = histogramList.map((h) => {
    const label = h.name || new Date(h.start).toLocaleTimeString();
    const counts = baseLabels.map((_, i) => h.counts[i] ?? 0);
    return {
      type: 'bar',
      name: label,
      data: counts,
      barWidth: '80%',
      barMinHeight: 2,
      itemStyle: { color: colorMap[label] },
      emphasis: { focus: 'series' as const },
    };
  });
  const visibleSeries = series.filter((s) => selected.includes(s.name));

  const option = {
    title: title ? { text: title } : undefined,
    tooltip: { trigger: 'axis' as const },
    legend: { show: false },
    grid: { left: 40, right: 16, top: 24, bottom: 36 },
    xAxis: {
      type: 'category' as const,
      name: 'bucket',
      data: baseLabels,
      axisLabel: { formatter: (v: number) => `${v}` },
      splitLine: { show: true },
    },
    yAxis: {
      type: 'value' as const,
      name: 'count',
      splitLine: { show: true },
    },
    series: visibleSeries,
  };

  return (
    <div style={{ height, padding: 12, boxSizing: 'border-box' }}>
      <div
        style={{
          height: '100%',
          display: 'grid',
          gridTemplateRows: '1fr 8px 32px',
          minHeight: 0,
        }}
      >
        <div style={{ minHeight: 0 }}>
          <ReactEChartsCore
            echarts={echarts as any}
            option={option}
            notMerge
            lazyUpdate
            style={{ height: '100%', width: '100%' }}
          />
        </div>
        <div aria-hidden style={{ height: 8 }} />
        <div
          style={{
            height: 48,
            maxHeight: 48,
            overflowY: 'auto',
            overflowX: 'hidden',
            minWidth: 0,
          }}
        >
          <LegendSelector
            items={legendItems}
            colors={colors}
            value={selected}
            onChange={setSelected}
            wrap="wrap"
          />
        </div>
      </div>
    </div>
  );
}

export default Histogram;
