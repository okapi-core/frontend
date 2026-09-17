import { TRACE_ID } from '@/lib/span-attributes';
import { useSpansHomeStore } from '../store';
import { SpanStringAttributePicker } from './span-string-attribute-picker';

export function TraceIdFilter() {
  const traceId = useSpansHomeStore((state) => state.traceId);
  const setTraceId = useSpansHomeStore((state) => state.setTraceId);
  return (
    <SpanStringAttributePicker
      label="Trace ID"
      placeholder="trace-id"
      value={traceId}
      attrib={TRACE_ID}
      onChange={setTraceId}
    />
  );
}
