import { AttributeLabel } from '@/components/attribute-label';
import { SpanAttributeValue } from '@/components/span-attribute-value/span-attribute-value';
import { SpanRowV2 } from '@/lib/response-types';
import { Group, Stack } from '@mantine/core';

export function CustomAttributesView({ row }: { row: SpanRowV2 }) {
  const stringAttrs = row.customStringAttributes || {};
  const numberAttrs = row.customNumberAttributes || {};
  const entries = [
    ...Object.entries(stringAttrs),
    ...Object.entries(numberAttrs),
  ];

  if (entries.length === 0) return null;

  const noOp = () => {};

  return (
    <Stack gap="xs">
      {entries.map(([attr, value]) => (
        <Group key={attr} gap="xs" align="center">
          <AttributeLabel label={attr} />
          <SpanAttributeValue attr={attr} value={value} onClick={noOp} />
        </Group>
      ))}
    </Stack>
  );
}
