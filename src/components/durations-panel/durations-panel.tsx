
import { LineChart } from '@/features/plots/LineChart';
import PanelFrame from '@/features/dashboards/components/panel/PanelFrame';

type DurationsPanelProps = {
  p50: number[];
  p75: number[];
  p90: number[];
  p99: number[];
  ts: number[];
  height?: number | string;
  width?: number | string;
  label?: string;
};

export function DurationsPanel({
  p50,
  p75,
  p90,
  p99,
  ts,
  height = 240,
  width = '100%',
  label = 'Durations',
}: DurationsPanelProps) {
  return (
    <div style={{ width }}>
      <PanelFrame title={label}>
        <div style={{ padding: '8px' }}>
          <LineChart
            height={height}
            xAxisSplitNumber={4}
            series={[
              { name: 'p50', data: ts.map((t, i) => ({ x: t, y: p50[i] })) },
              { name: 'p75', data: ts.map((t, i) => ({ x: t, y: p75[i] })) },
              { name: 'p90', data: ts.map((t, i) => ({ x: t, y: p90[i] })) },
              { name: 'p99', data: ts.map((t, i) => ({ x: t, y: p99[i] })) },
            ]}
          />
        </div>
      </PanelFrame>
    </div>
  );
}
