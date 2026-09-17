import { SPAN_ID } from '@/lib/span-attributes';
import { useSpansHomeStore } from '../store';
import { SpanStringAttributePicker } from './span-string-attribute-picker';

export function SpanIdFilter() {
  const spanId = useSpansHomeStore((state) => state.spanId);
  const setSpanId = useSpansHomeStore((state) => state.setSpanId);

  return (
    <SpanStringAttributePicker
      label="Span ID"
      placeholder="span-id"
      value={spanId}
      attrib={SPAN_ID}
      onChange={setSpanId}
    />
  );
}
