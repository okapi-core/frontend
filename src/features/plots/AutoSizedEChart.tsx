'use client';
import { EChartsCoreOption } from 'echarts';
import ReactEChartsCore from 'echarts-for-react/lib/core';
import { CSSProperties, useEffect, useRef, useState } from 'react';
import echarts from './echarts-setup';

export function AutoSizedEChart({
  option,
  height = '100%',
  onChartReady,
  onEvents,
  replaceMerge,
  notMerge,
  lazyUpdate,
}: {
  option: EChartsCoreOption;
  height?: number | string;
  onChartReady?: (inst: any) => void;
  onEvents?: Record<string, (...args: any[]) => void>;
  replaceMerge?: string[];
  notMerge?: boolean;
  lazyUpdate?: boolean;
}) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const chartInstRef = useRef<any | null>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;

    const update = () => {
      const rect = el.getBoundingClientRect();
      const next = {
        width: Math.round(rect.width),
        height: Math.round(rect.height),
      };
      setSize((prev) =>
        prev.width === next.width && prev.height === next.height ? prev : next,
      );
    };

    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const chart = chartInstRef.current;
    if (!chart || size.width <= 0 || size.height <= 0) return;

    const frame = window.requestAnimationFrame(() => {
      chart.resize?.({
        width: size.width,
        height: size.height,
      });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [size.width, size.height]);

  const rootHeight: CSSProperties['height'] =
    typeof height === 'number' ? `${height}px` : height;

  return (
    <div
      ref={rootRef}
      style={{
        width: '100%',
        height: rootHeight,
        minWidth: 0,
        minHeight: 0,
        overflow: 'hidden',
      }}
    >
      {size.width > 0 && size.height > 0 ? (
        <ReactEChartsCore
          echarts={echarts}
          option={option}
          style={{
            width: size.width,
            height: size.height,
          }}
          autoResize={false}
          onChartReady={(inst) => {
            chartInstRef.current = inst;
            onChartReady?.(inst);
            window.requestAnimationFrame(() => {
              inst.resize?.({
                width: size.width,
                height: size.height,
              });
            });
          }}
          onEvents={onEvents}
          replaceMerge={replaceMerge}
          notMerge={notMerge}
          lazyUpdate={lazyUpdate}
        />
      ) : null}
    </div>
  );
}
