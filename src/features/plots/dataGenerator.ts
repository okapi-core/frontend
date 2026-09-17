import { type LineTimeSeries } from './LineChart';

function normalSample(mean: number, variance: number): number {
  let u = 0,
    v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  const stdNorm = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
  const stdDev = Math.sqrt(variance);
  return mean + stdNorm * stdDev;
}

export function generateTimeSeries({
  from,
  to,
  samplesPerSecond,
  seriesCount,
  chartIndex = 0,
}: {
  from: number | Date;
  to: number | Date;
  samplesPerSecond: number; // e.g., 10 => 1 sample per 100ms
  seriesCount: number;
  chartIndex?: number;
}): LineTimeSeries[] {
  const start = typeof from === 'number' ? from : from.getTime();
  const end = typeof to === 'number' ? to : to.getTime();
  const span = Math.max(1, end - start);
  const rate = Math.max(0.1, samplesPerSecond); // guard
  const count = Math.max(2, Math.floor((span / 1000) * rate) + 1);
  const step = span / (count - 1);

  return Array.from({ length: seriesCount }).map((_, sIdx) => {
    const name = `CPU_${sIdx + 1}`;
    const offset = (sIdx - (seriesCount - 1) / 2) * 0.3 + chartIndex * 0.05;
    const data = Array.from({ length: count }, (_, i) => {
      const x = start + i * step;
      const noise = normalSample(1, 5);
      const yRaw = 80 + noise + offset;
      const y = Math.max(0, Math.min(100, yRaw));
      return { x, y };
    });
    return { name, data };
  });
}
