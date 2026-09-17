import TimeRangePicker from '@/components/custom-component-tray/time-range-picker';
import { useSpansHomeStore } from '../store';

export function TimeFilter() {
  const timeRange = useSpansHomeStore((state) => state.timeRange);
  const setTimeRange = useSpansHomeStore((state) => state.setTimeRange);

  return <TimeRangePicker value={timeRange} onChange={setTimeRange} />;
}
