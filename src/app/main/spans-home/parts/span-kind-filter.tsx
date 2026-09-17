import { SPAN_KIND } from '@/lib/span-attributes';
import { useSpansHomeStore } from '../store';
import { SpanStringAttributePicker } from './span-string-attribute-picker';

export function SpanKindFilter() {
  const spanKind = useSpansHomeStore((state) => state.spanKind);
  const setSpanKind = useSpansHomeStore((state) => state.setSpanKind);

  return (
    <SpanStringAttributePicker
      label="Span kind"
      placeholder="SERVER"
      value={spanKind}
      attrib={SPAN_KIND}
      onChange={setSpanKind}
    />
  );
}
