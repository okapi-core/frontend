import { AnyValueJson, NumberValue } from '@/lib/response-types';
import { Group, Text } from '@mantine/core';
import { Binary, CircleDot, Hash, ToggleLeft, Type } from 'lucide-react';

type MeasurementValue = NumberValue | AnyValueJson;

export function MeasurementValue({ value }: { value?: MeasurementValue }) {
  if (!value) return <Text size="xs" c="gray.6">—</Text>;

  if (value.aDouble !== undefined) {
    return <TypedValue icon={<CircleDot size={14} />} label="float" value={value.aDouble} />;
  }
  if (value.anInteger !== undefined) {
    return <TypedValue icon={<Hash size={14} />} label="integer" value={value.anInteger} />;
  }
  if ('aString' in value && value.aString !== undefined) {
    return <TypedValue icon={<Type size={14} />} label="string" value={value.aString} />;
  }
  if ('aBoolean' in value && value.aBoolean !== undefined) {
    return <TypedValue icon={<ToggleLeft size={14} />} label="boolean" value={String(value.aBoolean)} />;
  }
  if ('bytes' in value && value.bytes !== undefined) {
    return <TypedValue icon={<Binary size={14} />} label="bytes" value={value.bytes.join(', ')} />;
  }

  return <Text size="xs" c="gray.6">—</Text>;
}

function TypedValue({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <Group gap={4} wrap="nowrap" title={label} aria-label={label}>
      {icon}
      <Text size="xs" ff="monospace">
        {value}
      </Text>
    </Group>
  );
}
