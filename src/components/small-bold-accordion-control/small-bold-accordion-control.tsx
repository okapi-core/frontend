import { Accordion, Text } from '@mantine/core';

export function SmallBoldAccordionControl({ title }: { title: string }) {
  return (
    <Accordion.Control>
      <Text size="sm" fw={600}>
        {title}
      </Text>
    </Accordion.Control>
  );
}
