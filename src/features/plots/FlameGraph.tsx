'use client';
import * as d3 from 'd3';
import { flamegraph, type StackFrame } from 'd3-flame-graph';
import 'd3-flame-graph/dist/d3-flamegraph.css';
import { useEffect, useMemo, useRef, useState } from 'react';

export type FlameGraphDatum = StackFrame;

export function FlameGraph({
  data,
  height = 420,
}: {
  data?: FlameGraphDatum;
  height?: number;
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [width, setWidth] = useState(0);
  const graph = useMemo<ReturnType<typeof flamegraph>>(
    () => flamegraph().height(height).cellHeight(18).transitionDuration(200),
    [height],
  );

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    // Track container width so the flamegraph can scale with layout changes.
    const update = () => {
      const nextWidth = el.getBoundingClientRect().width;
      setWidth(nextWidth);
    };

    update();

    // Observe resizes to keep the graph width in sync.
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    /* Clear and re-render when data or size changes. */
    el.innerHTML = '';

    if (!data) return;
    graph.width(width || 960);
    d3.select(el).datum(data).call(graph);
  }, [data, graph, width]);

  return <div ref={containerRef} style={{ width: '100%' }} />;
}
