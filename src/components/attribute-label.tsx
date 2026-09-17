import { Text } from '@mantine/core';

export function AttributeLabel({ label }: { label: string }) {
  return (
    <Text size="xs" c="gray.6" fw={600}>
      {label}
    </Text>
  );
}
