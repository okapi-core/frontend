import { useSpansHomeStore } from '../store';
import { SpanAttributesSideView } from './span-attributes-side-view';

export function SpanAttribsView() {
  const fullViewSpans = useSpansHomeStore((state) => state.fullViewRows);
  const clearFullView = useSpansHomeStore((state) => state.clearFullViewRow);
  return (
    <SpanAttributesSideView
      open={!!fullViewSpans}
      onClose={function (): void {
        clearFullView();
      }}
      row={fullViewSpans}
    />
  );
}
