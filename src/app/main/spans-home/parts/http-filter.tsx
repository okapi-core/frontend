import {
  HTTP_HOST,
  HTTP_METHOD,
  HTTP_ORIGIN,
  HTTP_STATUS_CODE,
} from '@/lib/span-attributes';
import { Group } from '@mantine/core';
import { useSpansHomeStore } from '../store';
import { SpanStringAttributePicker } from './span-string-attribute-picker';

export function HttpFilter() {
  const httpMethod = useSpansHomeStore((state) => state.httpMethod);
  const httpStatusCode = useSpansHomeStore((state) => state.httpStatusCode);
  const httpOrigin = useSpansHomeStore((state) => state.httpOrigin);
  const httpHost = useSpansHomeStore((state) => state.httpHost);
  const setHttpMethod = useSpansHomeStore((state) => state.setHttpMethod);
  const setHttpStatusCode = useSpansHomeStore(
    (state) => state.setHttpStatusCode,
  );
  const setHttpOrigin = useSpansHomeStore((state) => state.setHttpOrigin);
  const setHttpHost = useSpansHomeStore((state) => state.setHttpHost);

  return (
    <Group align="flex-end" wrap="wrap">
      <SpanStringAttributePicker
        label="HTTP method"
        placeholder="GET"
        value={httpMethod}
        attrib={HTTP_METHOD}
        onChange={setHttpMethod}
      />
      <SpanStringAttributePicker
        label="HTTP status"
        placeholder="200"
        value={httpStatusCode}
        attrib={HTTP_STATUS_CODE}
        onChange={setHttpStatusCode}
      />
      <SpanStringAttributePicker
        label="HTTP origin"
        placeholder="https://example.com"
        value={httpOrigin}
        attrib={HTTP_ORIGIN}
        onChange={setHttpOrigin}
      />
      <SpanStringAttributePicker
        label="HTTP host"
        placeholder="api.example.com"
        value={httpHost}
        attrib={HTTP_HOST}
        onChange={setHttpHost}
      />
    </Group>
  );
}
