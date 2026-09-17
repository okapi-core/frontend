import { AttributeLabel } from '@/components/attribute-label';
import { SpanAttributeValue } from '@/components/span-attribute-value/span-attribute-value';
import { SpanRowV2 } from '@/lib/response-types';
import { getSpanAttributeLabel, SERVICE_NAME } from '@/lib/span-attributes';
import { Group } from '@mantine/core';
import { camelCase } from 'lodash';

export function ServiceAttributesView({ row }: { row: SpanRowV2 }) {
  if (!row.serviceName) return null;
  const noOp = () => {};
  return (
    <Group gap="xs" align="center">
      <AttributeLabel label={getSpanAttributeLabel(SERVICE_NAME)} />
      <SpanAttributeValue
        attr={camelCase(SERVICE_NAME)}
        value={row.serviceName}
        onClick={noOp}
      />
    </Group>
  );
}
