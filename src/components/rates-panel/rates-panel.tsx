
import { LineChart } from '@/features/plots/LineChart';
import PanelFrame from '@/features/dashboards/components/panel/PanelFrame';

type RatesPanelProps = {
  rates: number[];
  ts: number[];
  height?: number | string;
  width?: number | string;
  label?: string;
  seriesName?: string;
};

export function RatesPanel({
  rates,
  ts,
  height = 240,
  width = '100%',
  label = 'Rates',
  seriesName = 'rates',
}: RatesPanelProps) {
  return (
    <div style={{ width }}>
      <PanelFrame title={label}>
        <div style={{ padding: '8px' }}>
          <LineChart
            height={height}
            showXAxisLabels={false}
            xAxisSplitNumber={4}
            series={[
              {
                name: seriesName,
                data: ts.map((t, i) => ({ x: t, y: rates[i] })),
              },
            ]}
          />
        </div>
      </PanelFrame>
    </div>
  );
}
