import { SegmentedControl } from '@mantine/core';
import { SpansHomeView, useSpansHomeStore } from '../store';
import { useSpanUrlState } from '../use-span-url-state';

export function ViewSwitch() {
  const { view, setView: setUrlView } = useSpanUrlState();
  const setView = useSpansHomeStore((state) => state.setView);

  return (
    <SegmentedControl
      value={view}
      onChange={(next) => {
        const nextView = next as SpansHomeView;
        setView(nextView);
        setUrlView(nextView);
      }}
      data={[
        { label: 'List', value: 'list' },
        { label: 'Stats', value: 'stats' },
        { label: 'Waterfall', value: 'waterfall' },
      ]}
    />
  );
}
