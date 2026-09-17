import { Accordion, Text } from '@mantine/core';

export function ThoughtBubble({ thought }: { thought: string }) {
  return (
    <Accordion variant="filled" radius="md">
      <Accordion.Item value="thought">
        <Accordion.Control>
          <Text size="xs" c="dimmed" fs="italic">
            Oscar is thinking...
          </Text>
        </Accordion.Control>
        <Accordion.Panel>
          <Text size="xs" c="dimmed" style={{ whiteSpace: 'pre-wrap' }}>
            {thought}
          </Text>
        </Accordion.Panel>
      </Accordion.Item>
    </Accordion>
  );
}
