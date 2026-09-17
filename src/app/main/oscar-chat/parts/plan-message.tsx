import { Card, Code, Text } from '@mantine/core';

export function PlanMessage({ plan }: { plan: string }) {
  return (
    <Card withBorder radius="md" p="sm" style={{ maxWidth: '75%' }}>
      <Text size="xs" fw={600} c="dimmed" mb="xs">
        Plan
      </Text>
      <Code block style={{ whiteSpace: 'pre-wrap', fontSize: '0.8rem' }}>
        {plan}
      </Code>
    </Card>
  );
}
