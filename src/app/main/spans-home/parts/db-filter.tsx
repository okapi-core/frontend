import {
  DB_COLLECTION_NAME,
  DB_NAMESPACE,
  DB_OPERATION_NAME,
  DB_SYSTEM_NAME,
} from '@/lib/span-attributes';
import { Group } from '@mantine/core';
import { useSpansHomeStore } from '../store';
import { SpanStringAttributePicker } from './span-string-attribute-picker';

export function DbFilter() {
  const dbSystem = useSpansHomeStore((state) => state.dbSystem);
  const dbCollection = useSpansHomeStore((state) => state.dbCollection);
  const dbNamespace = useSpansHomeStore((state) => state.dbNamespace);
  const dbOperation = useSpansHomeStore((state) => state.dbOperation);
  const setDbSystem = useSpansHomeStore((state) => state.setDbSystem);
  const setDbCollection = useSpansHomeStore((state) => state.setDbCollection);
  const setDbNamespace = useSpansHomeStore((state) => state.setDbNamespace);
  const setDbOperation = useSpansHomeStore((state) => state.setDbOperation);

  return (
    <Group align="flex-end" wrap="wrap">
      <SpanStringAttributePicker
        label={'DB system'}
        placeholder={'postgresql'}
        value={dbSystem}
        attrib={DB_SYSTEM_NAME}
        onChange={setDbSystem}
      />
      <SpanStringAttributePicker
        label="DB collection"
        placeholder="orders"
        value={dbCollection}
        attrib={DB_COLLECTION_NAME}
        onChange={setDbCollection}
      />
      <SpanStringAttributePicker
        label="DB namespace"
        placeholder="public"
        value={dbNamespace}
        attrib={DB_NAMESPACE}
        onChange={setDbNamespace}
      />
      <SpanStringAttributePicker
        label="DB operation"
        placeholder="SELECT"
        value={dbOperation}
        onChange={setDbOperation}
        attrib={DB_OPERATION_NAME}
      />
    </Group>
  );
}
